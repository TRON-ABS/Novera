"""Serial, warmed EXL3 / EXL2 / GGUF comparison on the same NVIDIA GPU.

Requires explicitly supplied local checkpoints. Never downloads weights. Run
with the ExLlama Python environment; uses Novera's actual Python/llama workers.
"""
import argparse
import json
import os
from pathlib import Path
import queue
import statistics
import subprocess
import sys
import threading
import time
import urllib.request


def request(base, path, key, body=None, request_id=None):
    headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
    if request_id:
        headers["X-Novera-Request-Id"] = request_id
    return urllib.request.urlopen(urllib.request.Request(base + path,
        data=json.dumps(body).encode() if body is not None else None, headers=headers), timeout=300)


def measure(base, key, model, prompt, tokens):
    body = dict(model=model, messages=[{"role": "system", "content": "You are a helpful assistant."}, {"role": "user", "content": prompt}],
                temperature=0, top_p=1, max_tokens=tokens, stream=True,
                stream_options={"include_usage": True}, cache_prompt=False)
    started = time.perf_counter()
    first = last = None
    usage = None
    text = ""
    with request(base, "/v1/chat/completions", key, body) as response:
        for line in response:
            if not line.startswith(b"data: "):
                continue
            if line.strip() == b"data: [DONE]":
                break
            event = json.loads(line[6:])
            if event.get("error"):
                raise RuntimeError(event["error"])
            if event.get("usage"):
                usage = event["usage"]
            for choice in event.get("choices", []):
                content = choice.get("delta", {}).get("content")
                if content:
                    now = time.perf_counter()
                    first = first or now
                    last = now
                    text += content
    elapsed = time.perf_counter() - started
    if not usage or not first or usage["completion_tokens"] < 1:
        raise RuntimeError("Missing streamed completion or token usage")
    return dict(prompt_tokens=usage["prompt_tokens"], completion_tokens=usage["completion_tokens"],
        ttft_ms=(first - started) * 1000, elapsed_s=elapsed,
        total_tokens_per_second=usage["completion_tokens"] / elapsed,
        decode_tokens_per_second=(usage["completion_tokens"] - 1) / (last - first) if last > first else None,
        text=text)


def handshake(child, timeout=300):
    output = queue.Queue()
    threading.Thread(target=lambda: output.put(child.stdout.readline()), daemon=True).start()
    line = output.get(timeout=timeout)
    if not line:
        raise RuntimeError("Worker exited before readiness; inspect its log")
    return json.loads(line)


class Monitor:
    def __init__(self, pid):
        self.pid = pid
        self.stop = threading.Event()
        self.gpu_mib = []
        self.rss_bytes = []

    def sample(self):
        import psutil
        while not self.stop.is_set():
            try:
                processes = [psutil.Process(self.pid)]
                processes += processes[0].children(recursive=True)
                self.rss_bytes.append(sum(process.memory_info().rss for process in processes))
                value = subprocess.check_output(["nvidia-smi", "--query-gpu=memory.used", "--format=csv,noheader,nounits", "-i", "0"],
                    creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0), text=True, timeout=5)
                self.gpu_mib.append(int(value.strip()))
            except (OSError, ValueError, subprocess.SubprocessError, psutil.Error):
                pass
            self.stop.wait(0.25)


def run(args):
    root = Path(__file__).resolve().parents[1]
    out = Path(args.output).resolve()
    out.mkdir(parents=True, exist_ok=True)
    work = out / ".runtime"
    work.mkdir(exist_ok=True)
    env = dict(os.environ, NOVERA_TRANSFORMERS_KEY="benchmark", JAN_LLAMA_API_KEY="benchmark",
               HF_HUB_OFFLINE="1", TRANSFORMERS_OFFLINE="1", HF_HUB_DISABLE_TELEMETRY="1")
    env.setdefault("TRITON_CACHE_DIR", str(work / "triton"))
    env.setdefault("TMP", str(work))
    env.setdefault("TEMP", str(work))
    result = dict(context=args.context, max_tokens=args.tokens, runs=args.runs,
        gpu=subprocess.check_output(["nvidia-smi", "--query-gpu=name,driver_version,memory.total", "--format=csv,noheader"], text=True).strip(),
        methodology="Serial engines; one warmup per prompt length; greedy; FP16 KV; no speculative decoding; unique prompt prefixes; GGUF cache_prompt=false. GPU memory is sampled total device usage, including desktop/background allocations.", engines={})
    for name in ("exl3", "exl2", "gguf"):
        checkpoint = Path(getattr(args, name)).resolve()
        if name == "gguf":
            preset = work / "gguf.ini"
            preset.write_text(f"[benchmark]\nmodel = {checkpoint.as_posix()}\nctx-size = {args.context}\nn-gpu-layers = 99\nparallel = 1\nflash-attn = on\ncache-type-k = f16\ncache-type-v = f16\nload-on-startup = false\n", encoding="utf-8")
            command = [args.llama_worker, "--preset", str(preset)]
        else:
            command = [sys.executable, "-u", str(root / "transformers-server/server.py"), "--model", str(checkpoint),
                       "--model-id", "benchmark", "--parent-pid", str(os.getpid()), "--ctx-size", str(args.context), "--device", "cuda"]
        with (out / f"{name}.log").open("w", encoding="utf-8") as log:
            started = time.perf_counter()
            child = subprocess.Popen(command, env=env, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=log,
                                     creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
            monitor = Monitor(child.pid)
            thread = threading.Thread(target=monitor.sample, daemon=True)
            thread.start()
            try:
                ready = handshake(child)
                base = f"http://127.0.0.1:{ready['port']}"
                if name == "gguf":
                    with request(base, "/models/load", "benchmark", {"model": "benchmark"}) as response:
                        loaded = json.load(response)
                    runtime = {"loaded": loaded, "version": json.loads(subprocess.check_output([args.llama_worker, "--version-json"]))}
                else:
                    with request(base, "/health", "benchmark") as response:
                        runtime = json.load(response)
                data = dict(checkpoint=str(checkpoint), runtime=runtime, load_s=time.perf_counter()-started, workloads={})
                for workload, repeats in (("short", 0), ("long", 32)):
                    samples = []
                    for index in range(-1, args.runs):
                        # Same string for a given run across all engines. The prefix changes
                        # before the first complete cache page to prevent shared prompt reuse.
                        prompt = f"Trial {index + 2}. "
                        prompt += "The river flows through the valley. " * repeats
                        prompt += "Write a detailed 1000-word story about a journey through the mountains. Continue the story without summarizing it."
                        sample = measure(base, "benchmark", "benchmark", prompt, args.tokens)
                        if index >= 0:
                            samples.append(sample)
                    data["workloads"][workload] = dict(samples=samples,
                        median={field: statistics.median(sample[field] for sample in samples)
                            for field in ("ttft_ms", "elapsed_s", "total_tokens_per_second", "decode_tokens_per_second")})
                data["quality_smoke"] = [measure(base, "benchmark", "benchmark", prompt, 32) for prompt in (
                    "Reply only with the result: 17 + 25 = ?", "Translate to French: The cat is sleeping.")]
                if name == "gguf":
                    with request(base, "/models/unload", "benchmark", {"model": "benchmark"}) as response:
                        data["unloaded"] = json.load(response)
                result["engines"][name] = data
            except Exception as error:
                result["engines"][name] = {"error": str(error), "checkpoint": str(checkpoint)}
            finally:
                import psutil
                try:
                    descendants = psutil.Process(child.pid).children(recursive=True)
                except psutil.Error:
                    descendants = []
                monitor.stop.set()
                thread.join(timeout=6)
                if name == "gguf":
                    child.stdin.close()
                    try:
                        child.wait(timeout=10)
                    except subprocess.TimeoutExpired:
                        child.terminate()
                else:
                    child.terminate()
                try:
                    child.wait(timeout=20)
                except subprocess.TimeoutExpired:
                    child.kill()
                    child.wait()
                _gone, alive = psutil.wait_procs(descendants, timeout=10)
                for process in alive:
                    process.kill()
                result["engines"][name]["forced_descendant_cleanup"] = bool(alive)
                child.stdout.close()
                if not child.stdin.closed:
                    child.stdin.close()
                result["engines"][name].update(process_stopped=child.poll() is not None,
                    peak_total_gpu_mib=max(monitor.gpu_mib, default=None), peak_process_rss_bytes=max(monitor.rss_bytes, default=None))
                (out / "results.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
        print(name, {key: value.get("median") for key, value in result["engines"][name].get("workloads", {}).items()} or result["engines"][name], flush=True)
    return int(any("error" in value for value in result["engines"].values()))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ("exl3", "exl2", "gguf", "llama-worker", "output"):
        parser.add_argument("--" + name, required=True)
    parser.add_argument("--context", type=int, default=2048)
    parser.add_argument("--tokens", type=int, default=128)
    parser.add_argument("--runs", type=int, default=5)
    options = parser.parse_args()
    if options.runs < 1 or options.tokens < 2 or options.context < 1024:
        parser.error("Need runs >= 1, tokens >= 2 and context >= 1024")
    sys.exit(run(options))
