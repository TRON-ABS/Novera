"""Measure Jan's real thread-cache handover through an isolated worker.

Python standard library only. No application profile or user chats are touched.
TTFT includes HTTP, handover, prefill and first decode; it is not a direct
measurement of save/restore separately. Disk reads may hit the OS page cache.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import queue
import random
import statistics
import subprocess
import threading
import time
import urllib.request
import uuid


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--worker', type=Path, required=True)
    parser.add_argument('--model', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--sizes', type=int, nargs='+', default=[512, 2048, 8192])
    parser.add_argument('--repeats', type=int, default=3)
    parser.add_argument('--disabled-first', action='store_true',
                        help='Reverse worker order to check for order effects')
    args = parser.parse_args()
    if args.repeats < 1 or any(size < 256 for size in args.sizes):
        parser.error('repeats must be positive and sizes must be at least 256 tokens')
    args.worker = args.worker.resolve(strict=True)
    args.model = args.model.resolve(strict=True)
    args.output = args.output.resolve()
    args.output.mkdir(parents=True, exist_ok=False)
    report = {
        'worker': str(args.worker), 'model': str(args.model),
        'worker_sha256': hashlib.sha256(args.worker.read_bytes()).hexdigest(),
        'model_bytes': args.model.stat().st_size,
        'model_mtime_ns': args.model.stat().st_mtime_ns,
        'repeats': args.repeats, 'samples': [], 'runs': [],
        'mode_order': ['disabled', 'enabled'] if args.disabled_first else ['enabled', 'disabled'],
        'limitations': [
            'TTFT is end-to-end, not isolated save and restore durations.',
            'Disk restores can benefit from the OS file cache; no cache flush.',
            'Native /completion endpoint with synthetic text, not UI rendering.',
            'Single slot; same model stays resident; no model reloads in samples.',
            'Resident replays reuse an identical prefix, not a growing chat.',
        ],
    }
    try:
        report['gpu'] = subprocess.check_output(
            ['nvidia-smi', '--query-gpu=name,memory.total,memory.used,driver_version',
             '--format=csv,noheader'], text=True).strip()
    except (OSError, subprocess.CalledProcessError):
        report['gpu'] = None
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))

    def persist():
        (args.output / 'results.json').write_text(
            json.dumps(report, indent=2), encoding='utf-8')

    def run_mode(enabled):
        label = 'disk-enabled' if enabled else 'disk-disabled'
        folder = args.output / label
        folder.mkdir()
        cache = folder / 'cache'
        cache.mkdir()
        preset = folder / 'benchmark.ini'
        preset.write_text(
            f'[*]\nfit = off\nctx-size = {max(args.sizes) + 1024}\n'
            'n-gpu-layers = 99\nparallel = 1\nflash-attn = on\n'
            'cache-ram = 0\nbatch-size = 512\nubatch-size = 512\n'
            f'slot-save-path = {cache.as_posix()}/\n\n'
            f'[kv-benchmark]\nmodel = {args.model.as_posix()}\n'
            'load-on-startup = false\n', encoding='utf-8')
        key = uuid.uuid4().hex
        env = dict(os.environ, JAN_LLAMA_API_KEY=key)
        flags = getattr(subprocess, 'CREATE_NO_WINDOW', 0)
        with (folder / 'worker.log').open('w', encoding='utf-8') as log:
            proc = subprocess.Popen(
                [str(args.worker), '--preset', str(preset), '--port', '0',
                 '--models-max', '1', '--slot-cache-mib', '4096' if enabled else '0'],
                cwd=args.worker.parent, env=env, stdin=subprocess.PIPE,
                stdout=subprocess.PIPE, stderr=log, text=True, creationflags=flags)
            lines = queue.Queue()

            def reader():
                for line in proc.stdout:
                    lines.put(line)
            threading.Thread(target=reader, daemon=True).start()
            run = {'mode': label}
            report['runs'].append(run)
            try:
                deadline = time.monotonic() + 60
                ready = None
                while time.monotonic() < deadline:
                    if proc.poll() is not None:
                        raise RuntimeError(f'worker exited {proc.returncode}; see {folder}/worker.log')
                    try:
                        item = json.loads(lines.get(timeout=0.2))
                        if 'port' in item:
                            ready = item
                            break
                    except (queue.Empty, ValueError):
                        pass
                if ready is None:
                    raise TimeoutError('worker handshake timed out')
                run['handshake'] = ready
                base = f'http://127.0.0.1:{ready["port"]}'

                def request(path, body):
                    return urllib.request.Request(base + path,
                        data=json.dumps(body).encode(), headers={
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + key})

                def call(path, body):
                    with opener.open(request(path, body), timeout=300) as response:
                        return json.load(response)

                started = time.perf_counter()
                call('/models/load', {'model': 'kv-benchmark'})
                run['load_ms'] = (time.perf_counter() - started) * 1000

                def completion(prompt, thread, scenario, size, iteration, record=True):
                    body = {'model': 'kv-benchmark', 'prompt': prompt,
                            'thread_id': thread, 'id_slot': 0, 'cache_prompt': True,
                            'n_predict': 16, 'ignore_eos': True, 'temperature': 0,
                            'seed': 1, 'stream': True}
                    t0 = time.perf_counter()
                    first = None
                    final = None
                    chunks = 0
                    with opener.open(request('/completion', body), timeout=300) as response:
                        for line in response:
                            if not line.startswith(b'data: '):
                                continue
                            raw = line[6:].strip()
                            if raw == b'[DONE]':
                                continue
                            event = json.loads(raw)
                            if event.get('error'):
                                raise RuntimeError(event)
                            if event.get('content'):
                                chunks += 1
                                if first is None:
                                    first = time.perf_counter()
                            if event.get('stop'):
                                final = event
                    ended = time.perf_counter()
                    if first is None or final is None:
                        raise RuntimeError('stream missing generated content or terminal event')
                    sample = {'mode': label, 'scenario': scenario,
                              'target_tokens': size, 'iteration': iteration,
                              'prompt_sha256': hashlib.sha256(prompt.encode()).hexdigest(),
                              'ttft_ms': (first - t0) * 1000,
                              'total_ms': (ended - t0) * 1000,
                              'content_chunks': chunks, 'timings': final.get('timings'),
                              'tokens_cached': final.get('tokens_cached'),
                              'tokens_evaluated': final.get('tokens_evaluated'),
                              'tokens_predicted': final.get('tokens_predicted')}
                    if record:
                        report['samples'].append(sample)
                        persist()
                        print(json.dumps(sample), flush=True)
                    return sample

                completion('Warm up. Count from one to sixteen.', 'warmup', 'warmup', 0, 0, False)
                for size in args.sizes:
                    prompts = []
                    for identity in ('A', 'B'):
                        rng = random.Random(f'kv-benchmark-{identity}-{size}')
                        words = [rng.choice(['forest', 'river', 'stone', 'planet', 'window',
                                             'garden', 'cloud', 'silver', 'orange', 'bridge'])
                                 for _ in range(size + 64)]
                        text = f'{identity}: ' + ' '.join(words)
                        # These words tokenize close to one token each; trim using
                        # the actual loaded model's tokenizer rather than guessing.
                        lo, hi = 1, len(text)
                        while lo < hi:
                            mid = (lo + hi) // 2
                            n = len(call('/tokenize', {'model': 'kv-benchmark',
                                                      'content': text[:mid]})['tokens'])
                            if n < size:
                                lo = mid + 1
                            else:
                                hi = mid
                        prompts.append(text[:lo])
                    a, b = prompts
                    thread_a, thread_b = f'{size}-A', f'{size}-B'
                    completion(a, thread_a, 'prime', size, 0, False)
                    if enabled:
                        for i in range(args.repeats):
                            completion(a, thread_a, 'resident', size, i)
                    for i in range(args.repeats):
                        completion(b, thread_b, 'switch-B', size, i, False)
                        completion(a, thread_a, 'disk-restore' if enabled else 'recompute', size, i)
                    run.setdefault('cache_snapshots', []).append({
                        'target_tokens': size,
                        'states': [dict(json.loads(p.read_text(encoding='utf-8')),
                                        state_bytes=p.with_suffix('.bin').stat().st_size)
                                   for p in cache.glob('*.json')]})
                    persist()
            finally:
                if proc.poll() is None:
                    proc.stdin.close()
                    try:
                        proc.wait(timeout=30)
                    except subprocess.TimeoutExpired:
                        proc.kill()
                        proc.wait()
                run['exit_code'] = proc.returncode
                persist()

    try:
        for enabled in ([False, True] if args.disabled_first else [True, False]):
            run_mode(enabled)
        report['summary'] = []
        for size in args.sizes:
            for scenario in ('resident', 'disk-restore', 'recompute'):
                samples = [s for s in report['samples']
                           if s['target_tokens'] == size and s['scenario'] == scenario]
                values = [s['ttft_ms'] for s in samples]
                report['summary'].append({'target_tokens': size, 'scenario': scenario,
                    'n': len(values), 'median_ttft_ms': statistics.median(values),
                    'min_ttft_ms': min(values), 'max_ttft_ms': max(values)})
        report['status'] = 'complete'
        print(json.dumps(report['summary'], indent=2), flush=True)
    except Exception as exc:
        report['status'] = 'failed'
        report['error'] = repr(exc)
        raise
    finally:
        persist()


if __name__ == '__main__':
    main()
