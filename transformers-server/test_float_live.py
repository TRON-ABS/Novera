"""Opt-in subprocess/SSE contract tests for real packed CUDA LLM fixtures."""
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
import urllib.error
import urllib.request


@unittest.skipUnless(os.environ.get("NOVERA_FLOAT_CUDA_TEST") == "1", "Opt-in real CUDA worker test")
class FloatWorkerTests(unittest.TestCase):
    def test_auth_json_stream_error_recovery_cancel_and_shutdown(self):
        from create_float_fixture import create
        import psutil
        for method in ("modelopt-fp8", "modelopt-nvfp4"):
            with self.subTest(method=method), tempfile.TemporaryDirectory() as temp:
                root = create(Path(temp) / "fixture", "llama", method, sharded=method.endswith("nvfp4"))
                log_path = Path(temp) / "worker.log"
                with log_path.open("w", encoding="utf-8") as log:
                    child = subprocess.Popen([sys.executable, "-u", str(Path(__file__).with_name("server.py")),
                        "--model", str(root), "--model-id", "float-test", "--device", "cuda", "--ctx-size", "128",
                        "--parent-pid", str(os.getpid())], env=dict(os.environ, NOVERA_TRANSFORMERS_KEY="float-test-key"),
                        stdout=subprocess.PIPE, stderr=log, creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
                    descendants = []
                    try:
                        line = child.stdout.readline()
                        self.assertTrue(line, log_path.read_text(encoding="utf-8"))
                        descendants = psutil.Process(child.pid).children(recursive=True)
                        port = json.loads(line)["port"]
                        opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
                        def request(path, body=None, key="float-test-key"):
                            req = urllib.request.Request(f"http://127.0.0.1:{port}{path}",
                                data=json.dumps(body).encode() if body is not None else None,
                                headers={"Authorization": "Bearer " + key, "Content-Type": "application/json"})
                            return opener.open(req, timeout=30)
                        with self.assertRaises(urllib.error.HTTPError) as error:
                            request("/health", key="wrong")
                        self.assertEqual(error.exception.code, 401)
                        error.exception.close()
                        with request("/health") as response:
                            runtime = json.load(response)
                        self.assertEqual(runtime["quantization"], method)
                        self.assertTrue(runtime["kernel_validated"])
                        body = {"model": "float-test", "messages": [{"role": "user", "content": "Bonjour Novera"}], "max_tokens": 4, "temperature": 0}
                        with request("/v1/chat/completions", body) as response:
                            result = json.load(response)
                        self.assertGreater(result["usage"]["completion_tokens"], 0)
                        with request("/v1/chat/completions", {**body, "stream": True}) as response:
                            stream = response.read().decode()
                        self.assertIn("data: [DONE]", stream)
                        self.assertIn('"role": "assistant"', stream)
                        with self.assertRaises(urllib.error.HTTPError) as error:
                            request("/v1/chat/completions", {**body, "tools": [{"type": "function"}]})
                        self.assertEqual(error.exception.code, 400)
                        error.exception.close()
                        with request("/v1/chat/completions", body) as response:
                            self.assertGreater(json.load(response)["usage"]["completion_tokens"], 0)
                        with request("/v1/cancel", {"request_id": "unrelated"}) as response:
                            self.assertFalse(json.load(response)["cancelled"])
                    finally:
                        child.terminate()
                        child.wait(timeout=15)
                        child.stdout.close()
                        _, alive = psutil.wait_procs(descendants, timeout=10)
                        for process in alive:
                            process.kill()
                        psutil.wait_procs(alive, timeout=5)
                        self.assertFalse(alive, "The CUDA worker must exit when its launcher stops")
                self.assertTrue((root / "config.json").is_file())


if __name__ == "__main__":
    unittest.main()
