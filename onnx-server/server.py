"""Offline ONNX graphs: typed tensors or prepared text-only GenAI exports."""
import argparse
import json
import math
import os
from pathlib import Path
import queue
import sys
import threading
from http.server import ThreadingHTTPServer

from transport import make_handler, watch_process


def local_file(root, name):
    if not isinstance(name, str) or not name or Path(name).is_absolute():
        raise ValueError("Export paths must be relative")
    target = (root / name).resolve(strict=True)
    if not target.is_relative_to(root) or not target.is_file():
        raise ValueError(f"Missing or external export file: {name}")
    return target


def validate_graph(root, graph):
    import onnx
    model = onnx.load(str(graph), load_external_data=False)
    # Includes nested subgraphs and sparse tensors, not just initializers.
    from onnx.external_data_helper import _get_all_tensors
    for tensor in _get_all_tensors(model):
        if tensor.data_location == onnx.TensorProto.EXTERNAL:
            metadata = {item.key: item.value for item in tensor.external_data}
            if "location" not in metadata or Path(metadata["location"]).is_absolute():
                raise ValueError("External tensor has no location")
            target = local_file(root, str((graph.parent / metadata["location"]).relative_to(root)))
            offset = int(metadata.get("offset", "0"))
            length = int(metadata.get("length", str(target.stat().st_size - offset)))
            if offset < 0 or length <= 0 or offset + length > target.stat().st_size:
                raise ValueError("Truncated external tensor data")
    return model


def validate_directory(path):
    root = Path(path).resolve(strict=True)
    if not root.is_dir():
        raise ValueError("Select the complete ONNX export folder")
    for entry in root.rglob("*"):
        if entry.is_symlink() or not entry.resolve().is_relative_to(root):
            raise ValueError("Export contains a symlink or external path")
    graphs = list(root.rglob("*.onnx"))
    if not graphs:
        raise ValueError("No ONNX graphs in export")
    for graph in graphs:
        validate_graph(root, graph)
    if (root / "genai_config.json").is_file():
        config = json.loads((root / "genai_config.json").read_text(encoding="utf-8"))
        # Restrict GenAI to one decoder; external pipelines and adapters need their own integration.
        model = config.get("model", {})
        if any(key in model for key in ("vision", "speech", "encoder", "embedding")):
            raise ValueError("Only text-only decoder GenAI exports are supported")
        decoder = model["decoder"]
        if "pipeline" in decoder or "adapters" in decoder:
            raise ValueError("GenAI pipelines and adapters are not supported")
        local_file(root, decoder["filename"])
        local_file(root, "tokenizer.json")
        tokenizer = json.loads(local_file(root, "tokenizer_config.json").read_text(encoding="utf-8"))
        if not isinstance(tokenizer.get("chat_template"), str):
            raise ValueError("GenAI chat requires a string chat_template in tokenizer_config.json")
        return root, "chat", None
    manifest = root / "novera_onnx.json"
    if manifest.is_file():
        graph = local_file(root, json.loads(manifest.read_text(encoding="utf-8"))["model"])
        if graph not in graphs:
            raise ValueError("Manifest must select an ONNX graph")
    elif len(graphs) == 1:
        graph = graphs[0]
    else:
        raise ValueError('Multiple graphs: add novera_onnx.json with {"model":"path/model.onnx"}')
    return root, "tensor", graph


DTYPES = {
    "tensor(float)": "float32", "tensor(double)": "float64", "tensor(float16)": "float16",
    "tensor(int64)": "int64", "tensor(int32)": "int32", "tensor(int16)": "int16",
    "tensor(int8)": "int8", "tensor(uint8)": "uint8", "tensor(uint16)": "uint16",
    "tensor(uint32)": "uint32", "tensor(uint64)": "uint64", "tensor(bool)": "bool",
}


def tensor_inputs(session, body):
    import numpy as np
    supplied = body.get("inputs")
    metadata = {item.name: item for item in session.get_inputs()}
    if not isinstance(supplied, dict) or set(supplied) != set(metadata):
        raise ValueError(f"Expected inputs: {', '.join(metadata)}")
    feeds = {}
    symbols = {}
    for name, item in metadata.items():
        spec = supplied[name]
        if not isinstance(spec, dict) or item.type not in DTYPES:
            raise ValueError(f"Unsupported input tensor: {name} ({item.type})")
        if spec.get("dtype") != DTYPES[item.type]:
            raise ValueError(f"{name}: dtype must be {DTYPES[item.type]}")
        shape, data = spec.get("shape"), spec.get("data")
        if not isinstance(shape, list) or any(type(n) is not int or n < 0 for n in shape):
            raise ValueError(f"{name}: invalid shape")
        if not isinstance(data, list) or math.prod(shape) != len(data) or len(data) > 1000000:
            raise ValueError(f"{name}: flat data must match shape (maximum 1M elements)")
        if len(shape) != len(item.shape):
            raise ValueError(f"{name}: rank mismatch")
        for expected, actual in zip(item.shape, shape):
            if isinstance(expected, int) and expected != actual:
                raise ValueError(f"{name}: dimension mismatch")
            if isinstance(expected, str):
                if symbols.setdefault(expected, actual) != actual:
                    raise ValueError(f"{name}: inconsistent dynamic dimension {expected}")
        dtype = np.dtype(DTYPES[item.type])
        if dtype.kind in "iu":
            bounds = np.iinfo(dtype)
            # Decimal strings preserve int64/uint64 values across JavaScript JSON.
            data = [int(value) if isinstance(value, str) else value for value in data]
            if any(type(value) is not int or not bounds.min <= value <= bounds.max for value in data):
                raise ValueError(f"{name}: integer value out of range")
        elif dtype.kind == "b":
            if any(type(value) is not bool for value in data):
                raise ValueError(f"{name}: expected booleans")
        elif any(type(value) not in (int, float) or not math.isfinite(value) for value in data):
            raise ValueError(f"{name}: expected finite numbers")
        array = np.asarray(data, dtype=dtype).reshape(shape)
        if dtype.kind == "f" and not np.isfinite(array).all():
            raise ValueError(f"{name}: floating point overflow")
        feeds[name] = array
    return feeds


class Inference:
    def __init__(self, path, model_id, context, device):
        import onnxruntime as ort
        self.root, self.mode, graph = validate_directory(path)
        self.model_id, self.context_size = model_id, context
        self.lock = threading.Lock()
        self.cancel = threading.Event()
        self.jobs = queue.Queue()
        self.active_request = None
        # CPU is the portable baseline. CUDA must be selected explicitly and verified.
        provider = "CUDAExecutionProvider" if device == "cuda" else "CPUExecutionProvider"
        if provider not in ort.get_available_providers():
            raise ValueError(f"Unavailable ONNX provider: {provider}")
        if self.mode == "tensor":
            self.session = ort.InferenceSession(str(graph), providers=[provider])
            if self.session.get_providers()[0] != provider:
                raise ValueError(f"ONNX could not initialize {provider}")
            self.session.disable_fallback()
            self.runtime = {"ready": True, "device": self.session.get_providers()[0], "mode": self.mode,
                            "onnxruntime": ort.__version__}
        else:
            import onnxruntime_genai as og
            self.og = og
            model_context = json.loads((self.root / "genai_config.json").read_text(encoding="utf-8"))["model"]["context_length"]
            if type(model_context) is not int or model_context < 16:
                raise ValueError("Invalid GenAI context length")
            self.context_size = min(context, model_context)
            config = og.Config(str(self.root))
            config.clear_providers()
            if device == "cuda":
                config.append_provider("cuda")
            self.model = og.Model(config)
            self.tokenizer = og.Tokenizer(self.model)
            self.template = json.loads((self.root / "tokenizer_config.json").read_text(encoding="utf-8"))["chat_template"]
            self.runtime = {"ready": True, "device": str(self.model.device_type), "mode": self.mode,
                            "onnxruntime": ort.__version__, "genai": og.__version__}

    def schema(self):
        if self.mode != "tensor":
            return {"mode": "chat"}
        def items(values):
            return [{"name": item.name, "type": item.type, "shape": item.shape} for item in values]
        return {"mode": "tensor", "inputs": items(self.session.get_inputs()), "outputs": items(self.session.get_outputs())}

    def predict(self, body):
        import numpy as np
        feeds = tensor_inputs(self.session, body)
        import onnxruntime as ort
        options = ort.RunOptions()
        finished = threading.Event()
        def cancel_run():
            while not finished.wait(0.02):
                if self.cancel.is_set():
                    options.terminate = True
                    return
        monitor = threading.Thread(target=cancel_run, daemon=True)
        monitor.start()
        try:
            outputs = self.session.run(None, feeds, options)
        finally:
            finished.set()
            monitor.join()
        result = {}
        for item, value in zip(self.session.get_outputs(), outputs):
            if not isinstance(value, np.ndarray) or value.size > 1000000:
                raise ValueError("Only tensor outputs up to 1M elements are supported")
            if value.dtype.kind == "f" and not np.isfinite(value).all():
                raise ValueError("Non-finite output cannot be serialized as JSON")
            data = value.flatten().tolist()
            if value.dtype.kind in "iu" and value.dtype.itemsize == 8:
                data = [str(number) for number in data]
            result[item.name] = {"dtype": str(value.dtype), "shape": list(value.shape), "data": data}
        return {"outputs": result}

    def generate(self, body, output):
        if body.get("model", self.model_id) != self.model_id:
            raise ValueError("Model ID does not match loaded export")
        messages = body.get("messages")
        if not isinstance(messages, list) or not messages or any(
            not isinstance(m, dict) or m.get("role") not in ("system", "user", "assistant") or not isinstance(m.get("content"), str)
            for m in messages
        ):
            raise ValueError("Only text system/user/assistant messages are supported")
        if body.get("tools"):
            raise ValueError("Tool calling is not supported")
        if self.mode == "tensor":
            if messages[-1]["role"] != "user":
                raise ValueError("Send a JSON tensor request as the last user message")
            request = json.loads(messages[-1]["content"])
            if not isinstance(request, dict):
                raise ValueError("Expected a JSON tensor request")
            result = self.predict(request)
            output.put(("ready", None))
            output.put(("text", json.dumps(result)))
            output.put(("done", (0, 0, "stop")))
            return
        prompt = self.tokenizer.apply_chat_template(template_str=self.template, messages=json.dumps(messages), add_generation_prompt=True)
        tokens = self.tokenizer.encode(prompt)
        maximum = body.get("max_tokens", body.get("max_completion_tokens", 256))
        if type(maximum) is not int or maximum <= 0 or len(tokens) >= self.context_size:
            raise ValueError("Invalid output limit or prompt exceeds context")
        count = min(maximum, self.context_size - len(tokens))
        temperature, top_p = body.get("temperature", 0.7), body.get("top_p", 0.95)
        if type(temperature) not in (int, float) or not math.isfinite(temperature) or temperature < 0:
            raise ValueError("Invalid temperature")
        if type(top_p) not in (int, float) or not 0 < top_p <= 1:
            raise ValueError("Invalid top_p")
        params = self.og.GeneratorParams(self.model)
        params.set_search_options(max_length=len(tokens) + count, do_sample=temperature > 0,
                                  temperature=max(temperature, 0.01), top_p=top_p)
        generator = self.og.Generator(self.model, params)
        generator.append_tokens(tokens)
        stream = self.tokenizer.create_stream()
        output.put(("ready", None))
        generated = 0
        try:
            while not generator.is_done() and not self.cancel.is_set():
                generator.generate_next_token()
                generated += 1
                output.put(("text", stream.decode(generator.get_next_tokens()[0])))
            output.put(("done", (generated, len(tokens), "length" if generated >= count else "stop")))
        finally:
            del generator

    def run(self):
        while True:
            body, output = self.jobs.get()
            try:
                self.generate(body, output)
            except Exception as error:
                output.put(("error", str(error)))
            finally:
                self.active_request = None
                self.lock.release()


def handler(engine, key):
    class Handler(make_handler(engine, key)):
        def do_GET(self):
            if self.path != "/v1/onnx/schema":
                return super().do_GET()
            if self.authorized():
                self.reply(200, engine.schema())

        def do_POST(self):
            if self.path != "/v1/onnx/run":
                return super().do_POST()
            if not self.authorized():
                return
            if engine.mode != "tensor":
                self.reply(400, {"error": {"message": "Loaded export uses GenAI chat"}})
                return
            if not engine.lock.acquire(blocking=False):
                self.reply(409, {"error": {"message": "The local model is busy"}})
                return
            engine.cancel.clear()
            engine.active_request = self.headers.get("X-Novera-Request-Id")
            try:
                length = int(self.headers.get("Content-Length", "0"))
                if not 0 < length <= 4 * 1024 * 1024:
                    raise ValueError("Request must be between 1 byte and 4 MiB")
                self.connection.settimeout(30)
                body = json.loads(self.rfile.read(length))
                if not isinstance(body, dict):
                    raise ValueError("Expected a JSON object")
                self.reply(200, engine.predict(body))
            except Exception as error:
                self.reply(400, {"error": {"message": str(error)}})
            finally:
                engine.active_request = None
                engine.lock.release()
    return Handler


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--probe", action="store_true")
    parser.add_argument("--inspect", action="store_true")
    parser.add_argument("--model")
    parser.add_argument("--model-id")
    parser.add_argument("--port", type=int, default=0)
    parser.add_argument("--ctx-size", type=int, default=2048)
    parser.add_argument("--device", choices=("auto", "cpu", "cuda"), default="auto")
    parser.add_argument("--parent-pid", type=int)
    args = parser.parse_args()
    if args.inspect:
        root, mode, _ = validate_directory(args.model)
        if mode == "chat":
            import onnxruntime_genai
        print(json.dumps({"mode": mode, "sizeBytes": sum(p.stat().st_size for p in root.rglob("*") if p.is_file())}))
        return
    if args.probe:
        import onnxruntime as ort
        import onnx
        import numpy
        try:
            import onnxruntime_genai as og
            genai = og.__version__
        except (ImportError, OSError):
            genai = None
        print(json.dumps({"ready": True, "python": sys.version.split()[0], "onnxruntime": ort.__version__,
                          "genai": genai, "providers": ort.get_available_providers(), "cudaAvailable": False}))
        return
    key = os.environ.get("NOVERA_ONNX_KEY")
    if not key or not args.model or not args.model_id:
        parser.error("Model, ID and NOVERA_ONNX_KEY are required")
    for pid in {os.getppid(), args.parent_pid} - {None, 0, os.getpid()}:
        threading.Thread(target=watch_process, args=(pid,), daemon=True).start()
    engine = Inference(args.model, args.model_id, args.ctx_size, args.device)
    server = ThreadingHTTPServer(("127.0.0.1", args.port), handler(engine, key))
    server.daemon_threads = True
    threading.Thread(target=server.serve_forever, daemon=True).start()
    engine.run()


if __name__ == "__main__":
    main()
