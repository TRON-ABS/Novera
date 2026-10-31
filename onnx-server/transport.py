import hmac
import json
import os
import queue
import time
import uuid
from http.server import BaseHTTPRequestHandler

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


def watch_process(pid):
    # Windows os.kill(pid, 0) can terminate the target; use OpenProcess instead.
    if os.name == "nt":
        import ctypes
        from ctypes import wintypes
        kernel = ctypes.WinDLL("kernel32", use_last_error=True)
        kernel.OpenProcess.argtypes = [wintypes.DWORD, wintypes.BOOL, wintypes.DWORD]
        kernel.OpenProcess.restype = wintypes.HANDLE
        kernel.WaitForSingleObject.argtypes = [wintypes.HANDLE, wintypes.DWORD]
        kernel.CloseHandle.argtypes = [wintypes.HANDLE]
        handle = kernel.OpenProcess(0x00100000, False, pid)
        if handle:
            kernel.WaitForSingleObject(handle, 0xFFFFFFFF)
            kernel.CloseHandle(handle)
        os._exit(0)
    while True:
        try:
            os.kill(pid, 0)
        except ProcessLookupError:
            os._exit(0)
        time.sleep(1)
