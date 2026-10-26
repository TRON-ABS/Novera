"""Real CPU generation and HTTP contract tests; no network or downloaded models."""
import importlib.metadata
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import threading
import unittest
import urllib.error
import urllib.request

from create_tiny_model import create
from server import Inference, select_device, validate_directory
from types import SimpleNamespace
from http.server import ThreadingHTTPServer


class InferenceTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory(prefix="novera-tiny-")
        cls.root = Path(cls.temp.name)
        cls.metadata = create(cls.root / "tiny")
        cls.child = subprocess.Popen([sys.executable, "-u", str(Path(__file__).with_name("server.py")),
            "--model", str(cls.root / "tiny"), "--model-id", "tiny-test", "--ctx-size", "128",
            "--parent-pid", str(os.getpid()), "--device", os.environ.get("NOVERA_SAFETENSORS_DEVICE", "cpu")], env=dict(os.environ, NOVERA_TRANSFORMERS_KEY="test-key"),
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        line = cls.child.stdout.readline()
        if not line:
            raise RuntimeError(cls.child.stderr.read())
        cls.base = f"http://127.0.0.1:{json.loads(line)['port']}"

    @classmethod
    def tearDownClass(cls):
        cls.child.terminate()
        cls.child.wait(timeout=10)
        cls.child.stdout.close()
        cls.child.stderr.close()
        cls.temp.cleanup()

    def request(self, path, body=None, key="test-key", request_id="test-request"):
        request = urllib.request.Request(self.base + path,
            data=json.dumps(body).encode() if body is not None else None,
            headers={"Authorization": "Bearer " + key, "Content-Type": "application/json", "X-Novera-Request-Id": request_id})
        return urllib.request.urlopen(request, timeout=20)

    def payload(self, **extra):
        return dict(model="tiny-test", messages=[{"role": "user", "content": "Bonjour Novera"}],
                    max_tokens=8, temperature=0, **extra)

    def test_generation(self):
        with self.request("/v1/chat/completions", self.payload()) as response:
            data = json.load(response)
        self.assertGreater(data["usage"]["completion_tokens"], 0)
        self.assertEqual(data["usage"]["total_tokens"], data["usage"]["prompt_tokens"] + data["usage"]["completion_tokens"])
        self.assertEqual(data["choices"][0]["message"]["role"], "assistant")

    def test_streaming_and_usage(self):
        with self.request("/v1/chat/completions", self.payload(stream=True, stream_options={"include_usage": True})) as response:
            stream = response.read().decode()
        self.assertTrue(stream.endswith("data: [DONE]\n\n"))
        events = [json.loads(line[6:]) for line in stream.splitlines() if line.startswith("data: {")]
        self.assertGreater(events[-1]["usage"]["completion_tokens"], 0)
        self.assertEqual(events[0]["choices"][0]["delta"]["role"], "assistant")

    def test_health_models_and_auth(self):
        with self.request("/health") as response:
            runtime = json.load(response)
            self.assertEqual(runtime["context_size"], 128)
            self.assertEqual(runtime["device"], os.environ.get("NOVERA_SAFETENSORS_DEVICE", "cpu"))
            self.assertEqual(runtime["python"], "3.15.1")
            if runtime["device"] == "cuda":
                self.assertTrue(runtime["parameter_device"].startswith("cuda"))
                self.assertGreater(runtime["gpu_allocated_bytes"], 0)
        with self.request("/v1/models") as response:
            self.assertEqual(json.load(response)["data"][0]["id"], "tiny-test")
        with self.assertRaises(urllib.error.HTTPError) as error:
            self.request("/v1/models", key="wrong")
        self.assertEqual(error.exception.code, 401)

    def test_invalid_requests(self):
        for change in ({"model": "wrong"}, {"max_tokens": -1}, {"temperature": -1},
                       {"messages": [{"role": "user", "content": [{"type": "image_url"}]}]},
                       {"tools": [{"type": "function"}]}, {"messages": [{"role": "user", "content": "test " * 160}]}):
            with self.subTest(change=change):
                payload = self.payload()
                payload.update(change)
                with self.assertRaises(urllib.error.HTTPError) as error:
                    self.request("/v1/chat/completions", payload)
                self.assertEqual(error.exception.code, 400)

    def test_cancel_endpoint(self):
        with self.request("/v1/cancel", {"request_id": "unrelated"}) as response:
            self.assertFalse(json.load(response)["cancelled"])

    def test_cancels_only_the_active_request(self):
        payload = self.payload(stream=True, stream_options={"include_usage": True})
        payload["max_tokens"] = 120
        with self.request("/v1/chat/completions", payload, request_id="cancel-test") as response:
            first = response.readline().decode()
            self.assertIn('"role": "assistant"', first)
            with self.request("/v1/cancel", {"request_id": "another-chat"}) as cancel:
                self.assertFalse(json.load(cancel)["cancelled"])
            with self.request("/v1/cancel", {"request_id": "cancel-test"}) as cancel:
                self.assertTrue(json.load(cancel)["cancelled"])
            stream = response.read().decode()
        self.assertTrue(stream.endswith("data: [DONE]\n\n"))
        events = [json.loads(line[6:]) for line in stream.splitlines() if line.startswith("data: {")]
        self.assertLess(events[-1]["usage"]["completion_tokens"], 120)

    def test_sharded_loading(self):
        root = self.root / "sharded"
        create(root, sharded=True)
        self.assertTrue((root / "model.safetensors.index.json").is_file())
        engine = Inference(root, "sharded", 128)
        self.assertEqual(engine.model.config.vocab_size, 32)
        shard = next(root.glob("*.safetensors"))
        shard.unlink()
        with self.assertRaises(ValueError):
            validate_directory(root)

    def test_rejects_external_shard_and_pickle_only(self):
        root = self.root / "invalid"
        root.mkdir(exist_ok=True)
        (root / "config.json").write_text("{}")
        (root / "tokenizer.json").write_text("{}")
        (root / "pytorch_model.bin").write_bytes(b"untrusted")
        with self.assertRaises(ValueError):
            validate_directory(root)
        (root / "model.safetensors.index.json").write_text(json.dumps({"weight_map": {"w": "../tiny/model.safetensors"}}))
        with self.assertRaises(ValueError):
            validate_directory(root)

    def test_device_selection(self):
        cpu = SimpleNamespace(cuda=SimpleNamespace(is_available=lambda: False))
        gpu = SimpleNamespace(cuda=SimpleNamespace(is_available=lambda: True))
        self.assertEqual(select_device(cpu, "auto"), "cpu")
        self.assertEqual(select_device(gpu, "auto"), "cuda")
        self.assertEqual(select_device(gpu, "cpu"), "cpu")
        with self.assertRaisesRegex(ValueError, "unavailable"):
            select_device(cpu, "cuda")
        with self.assertRaises(ValueError):
            select_device(gpu, "unknown")

    def test_worker_process(self):
        env = dict(os.environ, NOVERA_TRANSFORMERS_KEY="test-key")
        with subprocess.Popen([sys.executable, "-u", str(Path(__file__).with_name("server.py")),
                               "--model", str(self.root / "tiny"), "--model-id", "child", "--parent-pid", str(os.getpid())],
                              env=env, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True) as child:
            try:
                line = child.stdout.readline()
                self.assertTrue(line, "Worker failed before becoming ready")
                info = json.loads(line)
                req = urllib.request.Request(f"http://127.0.0.1:{info['port']}/health", headers={"Authorization": "Bearer test-key"})
                with urllib.request.urlopen(req, timeout=5) as response:
                    self.assertEqual(json.load(response)["model_id"], "child")
            finally:
                child.terminate()
                child.wait(timeout=10)


if __name__ == "__main__":
    print(json.dumps({"python": sys.version.split()[0], **{p: importlib.metadata.version(p) for p in ("torch", "transformers", "safetensors")}}))
    unittest.main(verbosity=2)
