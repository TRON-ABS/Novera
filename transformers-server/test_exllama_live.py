"""Opt-in GPU HTTP/lifecycle checks using explicitly supplied EXL checkpoints."""
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
import urllib.error
import urllib.request


@unittest.skipUnless(os.environ.get("NOVERA_EXL3_TEST_MODEL") and os.environ.get("NOVERA_EXL2_TEST_MODEL"),
                     "Set both NOVERA_EXL3_TEST_MODEL and NOVERA_EXL2_TEST_MODEL for real GPU tests")
class LiveExLlamaTest(unittest.TestCase):
    def test_real_auth_stream_cancel_busy_recovery_and_process_tree_shutdown(self):
        import psutil
        results = {}
        for method in ("exl3", "exl2"):
            with self.subTest(method), tempfile.TemporaryDirectory() as temporary:
                log = (Path(temporary) / "worker.log").open("w", encoding="utf-8")
                child = subprocess.Popen([sys.executable, "-u", str(Path(__file__).with_name("server.py")),
                    "--model", os.environ[f"NOVERA_{method.upper()}_TEST_MODEL"], "--model-id", "live-test",
                    "--ctx-size", "2048", "--device", "cuda", "--parent-pid", str(os.getpid())],
                    env=dict(os.environ, NOVERA_TRANSFORMERS_KEY="live-test-key"),
                    stdout=subprocess.PIPE, stderr=log, creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
                descendants = []
                try:
                    line = child.stdout.readline()
                    self.assertTrue(line, "Worker failed: " + (Path(temporary) / "worker.log").read_text())
                    base = f"http://127.0.0.1:{json.loads(line)['port']}"

                    def request(path, body=None, key="live-test-key", request_id="active-test"):
                        return urllib.request.urlopen(urllib.request.Request(base + path,
                            data=json.dumps(body).encode() if body is not None else None,
                            headers={"Authorization": "Bearer " + key, "Content-Type": "application/json",
                                     "X-Novera-Request-Id": request_id}), timeout=120)

                    with request("/health") as response:
                        runtime = json.load(response)
                    self.assertEqual(runtime["device"], "cuda")
                    self.assertEqual(runtime["quantization"], method)
                    self.assertGreater(runtime["gpu_allocated_bytes"], 0)
                    with self.assertRaises(urllib.error.HTTPError) as error:
                        request("/v1/models", key="wrong")
                    self.assertEqual(error.exception.code, 401)
                    body = dict(model="live-test", messages=[{"role": "user", "content": "Write a very long story about mountains."}],
                                max_tokens=1024, temperature=0, stream=True, stream_options={"include_usage": True})
                    with request("/v1/chat/completions", body) as response:
                        prefix = response.readline().decode()
                        self.assertIn("data:", prefix)
                        with self.assertRaises(urllib.error.HTTPError) as error:
                            request("/v1/chat/completions", body)
                        self.assertEqual(error.exception.code, 409)
                        with request("/v1/cancel", {"request_id": "another-chat"}) as cancel:
                            self.assertFalse(json.load(cancel)["cancelled"])
                        with request("/v1/cancel", {"request_id": "active-test"}) as cancel:
                            self.assertTrue(json.load(cancel)["cancelled"])
                        stream = prefix + response.read().decode()
                    self.assertIn("data: [DONE]", stream)
                    events = [json.loads(line[6:]) for line in stream.splitlines() if line.startswith("data: {")]
                    usage = next(event["usage"] for event in events if event.get("usage"))
                    self.assertLess(usage["completion_tokens"], 1024)
                    body.update(stream=False, max_tokens=16)
                    with request("/v1/chat/completions", body) as response:
                        completion = json.load(response)
                    self.assertGreater(completion["usage"]["completion_tokens"], 0)
                    results[method] = {"runtime": runtime, "cancelled_tokens": usage["completion_tokens"],
                        "recovered_tokens": completion["usage"]["completion_tokens"], "auth_401": True, "busy_409": True}
                finally:
                    try:
                        descendants = psutil.Process(child.pid).children(recursive=True)
                    except psutil.Error:
                        pass
                    child.terminate()
                    child.wait(timeout=20)
                    _gone, alive = psutil.wait_procs(descendants, timeout=10)
                    for process in alive:
                        process.kill()
                    child.stdout.close()
                    log.close()
                    self.assertFalse(alive, "A Python interpreter survived its launcher after unload")
                    if method in results:
                        results[method]["process_tree_stopped"] = True
        if os.environ.get("NOVERA_EXLLAMA_TEST_OUTPUT"):
            Path(os.environ["NOVERA_EXLLAMA_TEST_OUTPUT"]).write_text(json.dumps(results, indent=2), encoding="utf-8")


if __name__ == "__main__":
    unittest.main()
