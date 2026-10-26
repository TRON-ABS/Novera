"""Local, text-only Safetensors inference. No model downloads or repository code."""
import argparse
import hmac
import json
import math
import os
from pathlib import Path
import queue
import threading
import time
import uuid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


def validate_directory(path):
    root = Path(path).resolve(strict=True)
    if not root.is_dir():
        raise ValueError("Select the complete model folder, not a weights file")
    config = json.loads((root / "config.json").read_text(encoding="utf-8"))
    if config.get("quantization_config") is not None:
        raise ValueError("Quantized AWQ/GPTQ/MLX weights are not supported by this engine")
    index = root / "model.safetensors.index.json"
    if index.exists():
        names = set(json.loads(index.read_text(encoding="utf-8"))["weight_map"].values())
    else:
        names = {"model.safetensors"}
    if not names:
        raise ValueError("The Safetensors index contains no weights")
    for name in names:
        target = (root / name).resolve()
        if not target.is_relative_to(root) or target.suffix != ".safetensors" or not target.is_file():
            raise ValueError(f"Missing or invalid Safetensors shard: {name}")
    if not any((root / name).is_file() for name in ("tokenizer.json", "tokenizer.model", "vocab.json", "vocab.txt")):
        raise ValueError("The model folder is missing its tokenizer")
    return root


class Inference:
    def __init__(self, path, model_id, context_size=2048, device="auto"):
        # Set offline mode before importing Hugging Face libraries.
        os.environ["HF_HUB_OFFLINE"] = "1"
        os.environ["TRANSFORMERS_OFFLINE"] = "1"
        os.environ["HF_HUB_DISABLE_TELEMETRY"] = "1"
        # Sequential loading avoids native threaded shard-read crashes on Python 3.15/Windows.
        os.environ["HF_DEACTIVATE_ASYNC_LOAD"] = "1"
        import torch
        from transformers import AutoModelForCausalLM, AutoTokenizer

        self.device = select_device(torch, device)
        self.runtime = {
            "python": __import__("sys").version.split()[0], "torch": torch.__version__,
            "device": self.device, "cuda": torch.version.cuda,
            "gpu": torch.cuda.get_device_name(0) if self.device == "cuda" else None,
        }
        root = validate_directory(path)
        self.tokenizer = AutoTokenizer.from_pretrained(root, local_files_only=True, trust_remote_code=False)
        self.model = AutoModelForCausalLM.from_pretrained(
            root, local_files_only=True, trust_remote_code=False, use_safetensors=True,
            dtype="auto" if self.device == "cuda" else torch.float32,
        ).to(self.device).eval()
        self.runtime["parameter_device"] = str(next(self.model.parameters()).device)
        self.runtime["gpu_allocated_bytes"] = torch.cuda.memory_allocated() if self.device == "cuda" else 0
        self.model_id = model_id
        limit = getattr(self.model.config, "max_position_embeddings", None) or getattr(self.model.config, "n_positions", 2048)
        self.context_size = min(context_size, limit)
        self.lock = threading.Lock()
        self.cancel = threading.Event()
        self.jobs = queue.Queue()
        self.active_request = None
        torch.set_num_threads(max(1, min(4, os.cpu_count() or 1)))

    def prepare(self, body):
        if body.get("model") != self.model_id:
            raise ValueError("The requested model is not loaded")
        if body.get("tools") or body.get("response_format"):
            raise ValueError("This engine currently supports text chat only, without tools or structured output")
        messages = body.get("messages")
        if not isinstance(messages, list) or not messages:
            raise ValueError("messages must be a non-empty list")
        clean = []
        for message in messages:
            role, content = message.get("role"), message.get("content")
            if role not in ("system", "user", "assistant") or message.get("tool_calls"):
                raise ValueError("Only system, user and assistant text messages are supported")
            if isinstance(content, list):
                if any(part.get("type") != "text" for part in content):
                    raise ValueError("Images and audio are not supported by this engine")
                content = "\n".join(part.get("text", "") for part in content)
            if not isinstance(content, str):
                raise ValueError("Message content must be text")
            clean.append({"role": role, "content": content})
        if self.tokenizer.chat_template:
            prompt = self.tokenizer.apply_chat_template(clean, tokenize=False, add_generation_prompt=True)
            inputs = self.tokenizer(prompt, return_tensors="pt", add_special_tokens=False)
        else:
            prompt = "\n".join(f"{m['role']}: {m['content']}" for m in clean) + "\nassistant:"
            inputs = self.tokenizer(prompt, return_tensors="pt")
        count = inputs.input_ids.shape[-1]
        if count >= self.context_size:
            raise ValueError(f"Prompt exceeds context limit ({count}/{self.context_size} tokens)")
        maximum = body.get("max_tokens", body.get("max_completion_tokens", 256))
        if isinstance(maximum, bool) or not isinstance(maximum, int) or maximum < 1:
            raise ValueError("max_tokens must be a positive integer")
        temperature = body.get("temperature", 0.7)
        top_p = body.get("top_p", 1.0)
        if not isinstance(temperature, (int, float)) or not math.isfinite(temperature) or temperature < 0:
            raise ValueError("temperature must be a finite non-negative number")
        if not isinstance(top_p, (int, float)) or not math.isfinite(top_p) or not 0 < top_p <= 1:
            raise ValueError("top_p must be between 0 (exclusive) and 1")
        if body.get("stop"):
            raise ValueError("Custom stop sequences are not supported yet")
        options = dict(
            max_new_tokens=min(maximum, self.context_size - count),
            do_sample=temperature > 0,
            pad_token_id=self.tokenizer.pad_token_id or self.tokenizer.eos_token_id,
        )
        if temperature > 0:
            options.update(temperature=temperature, top_p=top_p)
        return inputs.to(self.device), options, count

    def run(self):
        """All torch calls stay on the process's main thread (Python 3.15)."""
        import torch
        from transformers import StoppingCriteria, StoppingCriteriaList, TextStreamer
        while True:
            body, output = self.jobs.get()
            try:
                inputs, options, prompt_tokens = self.prepare(body)
                output.put(("ready", None))
                engine = self

                class Cancelled(StoppingCriteria):
                    def __call__(self, *_args, **_kwargs):
                        return engine.cancel.is_set()

                class Streamer(TextStreamer):
                    def on_finalized_text(self, text, stream_end=False):
                        if text:
                            output.put(("text", text))

                streamer = Streamer(self.tokenizer, skip_prompt=True, skip_special_tokens=True)
                with torch.inference_mode():
                    generated = self.model.generate(**inputs, **options, streamer=streamer,
                        stopping_criteria=StoppingCriteriaList([Cancelled()]))
                tokens = generated.shape[-1] - prompt_tokens
                output.put(("done", (tokens, prompt_tokens, "length" if tokens == options["max_new_tokens"] else "stop")))
            except Exception as error:
                output.put(("error", str(error)))
            finally:
                self.active_request = None
                self.lock.release()


def select_device(torch, requested):
    if requested not in ("auto", "cpu", "cuda"):
        raise ValueError("Device must be auto, cpu or cuda")
    available = torch.cuda.is_available()
    if requested == "cuda" and not available:
        raise ValueError("CUDA GPU requested but unavailable. Install a CUDA-enabled PyTorch build and a compatible GPU driver, or select CPU.")
    return "cuda" if requested == "cuda" or (requested == "auto" and available) else "cpu"


def make_handler(engine, api_key):
    class Handler(BaseHTTPRequestHandler):
        # Closing each request avoids lingering HTTP threads on worker shutdown.
        def log_message(self, *_args):
            pass

        def authorized(self):
            if not hmac.compare_digest(self.headers.get("Authorization", ""), f"Bearer {api_key}"):
                self.reply(401, {"error": {"message": "Invalid local engine key", "type": "authentication_error"}})
                return False
            return True

        def reply(self, status, data):
            encoded = json.dumps(data, ensure_ascii=False).encode("utf-8")
            self.send_response(status)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(encoded)))
            self.end_headers()
            self.wfile.write(encoded)

        def do_GET(self):
            if not self.authorized():
                return
            if self.path == "/health":
                self.reply(200, {"model_id": engine.model_id, "context_size": engine.context_size, **engine.runtime})
            elif self.path == "/v1/models":
                self.reply(200, {"object": "list", "data": [{"id": engine.model_id, "object": "model", "owned_by": "local"}]})
            else:
                self.reply(404, {"error": {"message": "Unknown endpoint"}})

        def do_POST(self):
            if not self.authorized():
                return
            if self.path == "/v1/cancel":
                try:
                    length = int(self.headers.get("Content-Length", "0"))
                    if not 0 < length <= 1024:
                        raise ValueError("Expected a cancellation request ID")
                    self.connection.settimeout(5)
                    request_id = json.loads(self.rfile.read(length)).get("request_id")
                    cancelled = bool(request_id and request_id == engine.active_request)
                    if cancelled:
                        engine.cancel.set()
                    self.reply(200, {"cancelled": cancelled})
                except (ValueError, TypeError, AttributeError) as error:
                    self.reply(400, {"error": {"message": str(error)}})
                return
            if self.path != "/v1/chat/completions":
                self.reply(404, {"error": {"message": "Unknown endpoint"}})
                return
            acquired = False
            queued = False
            try:
                length = int(self.headers.get("Content-Length", "0"))
                if not 0 < length <= 4 * 1024 * 1024:
                    raise ValueError("Request must be between 1 byte and 4 MiB")
                self.connection.settimeout(30)
                body = json.loads(self.rfile.read(length))
                if not isinstance(body, dict):
                    raise ValueError("Expected a JSON object")
                acquired = engine.lock.acquire(blocking=False)
                if not acquired:
                    self.reply(409, {"error": {"message": "The local model is busy"}})
                    return
                engine.cancel.clear()
                engine.active_request = self.headers.get("X-Novera-Request-Id") or uuid.uuid4().hex
                output = queue.Queue()
                engine.jobs.put((body, output))
                queued = True
                kind, detail = output.get(timeout=120)
                if kind == "error":
                    # The inference loop releases the lock for queued jobs.
                    acquired = False
                    raise ValueError(detail)
            except (ValueError, TypeError, KeyError, AttributeError) as error:
                if acquired and not queued:
                    engine.lock.release()
                self.reply(400, {"error": {"message": str(error), "type": "invalid_request_error"}})
                return
            except Exception as error:
                if acquired and not queued:
                    engine.lock.release()
                self.reply(500, {"error": {"message": str(error), "type": "server_error"}})
                return

            completion_id = "chatcmpl-" + uuid.uuid4().hex
            created = int(time.time())
            streaming = body.get("stream", False)

            def send_event(data):
                payload = data if isinstance(data, str) else json.dumps(data, ensure_ascii=False)
                self.wfile.write(f"data: {payload}\n\n".encode("utf-8"))
                self.wfile.flush()

            def chunk(delta, finish=None):
                return dict(id=completion_id, object="chat.completion.chunk", created=created, model=engine.model_id,
                            choices=[dict(index=0, delta=delta, finish_reason=finish)])

            try:
                if streaming:
                    self.send_response(200)
                    self.send_header("Content-Type", "text/event-stream; charset=utf-8")
                    self.send_header("Cache-Control", "no-cache")
                    self.end_headers()
                    send_event(chunk({"role": "assistant", "content": ""}))
                text = ""
                while True:
                    try:
                        kind, detail = output.get(timeout=1)
                    except queue.Empty:
                        if streaming:
                            self.wfile.write(b": keep-alive\n\n")
                            self.wfile.flush()
                        continue
                    if kind == "error":
                        raise RuntimeError(detail)
                    if kind == "done":
                        tokens, prompt_tokens, finish = detail
                        break
                    fragment = detail
                    text += fragment
                    if streaming and fragment:
                        send_event(chunk({"content": fragment}))
                usage = dict(prompt_tokens=prompt_tokens, completion_tokens=tokens, total_tokens=prompt_tokens + tokens)
                if streaming:
                    send_event(chunk({}, finish))
                    if body.get("stream_options", {}).get("include_usage"):
                        send_event(dict(id=completion_id, object="chat.completion.chunk", created=created,
                                        model=engine.model_id, choices=[], usage=usage))
                    send_event("[DONE]")
                else:
                    self.reply(200, dict(id=completion_id, object="chat.completion", created=created, model=engine.model_id,
                                        choices=[dict(index=0, message={"role": "assistant", "content": text}, finish_reason=finish)], usage=usage))
            except (BrokenPipeError, ConnectionResetError, TimeoutError):
                engine.cancel.set()
            except Exception as error:
                engine.cancel.set()
                if streaming:
                    send_event({"error": {"message": str(error), "type": "server_error"}})
                else:
                    self.reply(500, {"error": {"message": str(error), "type": "server_error"}})
    return Handler


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--probe", action="store_true")
    parser.add_argument("--model")
    parser.add_argument("--model-id")
    parser.add_argument("--port", type=int, default=0)
    parser.add_argument("--ctx-size", type=int, default=2048)
    parser.add_argument("--parent-pid", type=int)
    parser.add_argument("--device", choices=("auto", "cpu", "cuda"), default="auto")
    args = parser.parse_args()
    if args.probe:
        import sys
        import torch
        import transformers
        import safetensors
        available = torch.cuda.is_available() and bool(torch.version.cuda)
        gpu = None
        if available:
            free, total = torch.cuda.mem_get_info(0)
            gpu = {"name": torch.cuda.get_device_name(0), "totalBytes": total, "freeBytes": free}
        print(json.dumps({"ready": True, "python": sys.version.split()[0], "torch": torch.__version__,
            "transformers": transformers.__version__, "safetensors": safetensors.__version__,
            "cudaAvailable": available, "gpu": gpu}), flush=True)
        return
    if not args.model or not args.model_id:
        parser.error("--model and --model-id are required for inference")
    api_key = os.environ.get("NOVERA_TRANSFORMERS_KEY")
    if not api_key:
        parser.error("NOVERA_TRANSFORMERS_KEY must be set")
    if args.ctx_size < 16:
        parser.error("--ctx-size must be at least 16")
    engine = Inference(args.model, args.model_id, args.ctx_size, args.device)
    server = ThreadingHTTPServer(("127.0.0.1", args.port), make_handler(engine, api_key))
    server.daemon_threads = True
    print(json.dumps({"port": server.server_port, "model_id": args.model_id}), flush=True)
    if args.parent_pid:
        def watch_parent():
            # Windows os.kill(pid, 0) can terminate the target; use OpenProcess instead.
            if os.name == "nt":
                import ctypes
                from ctypes import wintypes
                kernel = ctypes.WinDLL("kernel32", use_last_error=True)
                kernel.OpenProcess.argtypes = [wintypes.DWORD, wintypes.BOOL, wintypes.DWORD]
                kernel.OpenProcess.restype = wintypes.HANDLE
                kernel.WaitForSingleObject.argtypes = [wintypes.HANDLE, wintypes.DWORD]
                kernel.CloseHandle.argtypes = [wintypes.HANDLE]
                handle = kernel.OpenProcess(0x00100000, False, args.parent_pid)
                if handle:
                    kernel.WaitForSingleObject(handle, 0xFFFFFFFF)
                    kernel.CloseHandle(handle)
                os._exit(0)
            while True:
                try:
                    os.kill(args.parent_pid, 0)
                except ProcessLookupError:
                    os._exit(0)
                time.sleep(1)
        threading.Thread(target=watch_parent, daemon=True).start()
    threading.Thread(target=server.serve_forever, daemon=True).start()
    engine.run()


if __name__ == "__main__":
    main()
