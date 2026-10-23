"""Controlled local llama.cpp tuning matrix; no installed settings are changed.

Requires benchmark-engine-load-lock.py alongside this script for worker lifecycle.
GPU memory measurements are whole-device snapshots, not per-process peaks.
"""
import argparse
import hashlib
import importlib.util
import json
from pathlib import Path
import random
import statistics
import subprocess
import time

spec = importlib.util.spec_from_file_location(
    'jan_benchmark_worker', Path(__file__).with_name('benchmark-engine-load-lock.py'))
worker_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(worker_module)
Worker = worker_module.Worker

PROFILES = {
    'baseline': {'flash': 'on', 'batch': 512, 'ubatch': 512, 'kv': 'f16'},
    'flash-off': {'flash': 'off', 'batch': 512, 'ubatch': 512, 'kv': 'f16'},
    'ubatch-128': {'flash': 'on', 'batch': 512, 'ubatch': 128, 'kv': 'f16'},
    'batch-2048': {'flash': 'on', 'batch': 2048, 'ubatch': 512, 'kv': 'f16'},
    'ubatch-2048': {'flash': 'on', 'batch': 2048, 'ubatch': 2048, 'kv': 'f16'},
    'kv-q8': {'flash': 'on', 'batch': 2048, 'ubatch': 512, 'kv': 'q8_0'},
    'kv-q4': {'flash': 'on', 'batch': 2048, 'ubatch': 512, 'kv': 'q4_0'},
}


def gpu():
    raw = subprocess.check_output([
        'nvidia-smi', '--query-gpu=memory.used,temperature.gpu,clocks.current.sm,power.draw',
        '--format=csv,noheader,nounits'], text=True).strip()
    values = raw.splitlines()[0].split(',')
    return dict(zip(('memory_mib', 'temperature_c', 'sm_clock_mhz', 'power_w'),
                    (float(v.strip()) for v in values)))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--worker', type=Path, required=True)
    parser.add_argument('--model', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--profiles', nargs='+', choices=list(PROFILES), default=list(PROFILES))
    parser.add_argument('--sizes', type=int, nargs='+', default=[512, 2048, 8192])
    parser.add_argument('--rounds', type=int, default=3)
    parser.add_argument('--repeats', type=int, default=1)
    parser.add_argument('--seed', type=int, default=31415)
    args = parser.parse_args()
    if min(args.rounds, args.repeats, *args.sizes) < 1:
        parser.error('rounds, repeats and sizes must be positive')
    binary = args.worker.resolve(strict=True)
    model = args.model.resolve(strict=True)
    output = args.output.resolve()
    output.mkdir(parents=True, exist_ok=False)
    flags = getattr(subprocess, 'CREATE_NO_WINDOW', 0)
    report = {'worker': str(binary), 'model': str(model),
        'worker_sha256': hashlib.sha256(binary.read_bytes()).hexdigest(),
        'model_bytes': model.stat().st_size, 'ctx_size': max(args.sizes) + 512,
        'profiles': {name: PROFILES[name] for name in args.profiles},
        'rounds': args.rounds, 'repeats': args.repeats, 'seed': args.seed,
        'runs': [], 'samples': [], 'sizes': args.sizes,
        'worker_version': json.loads(subprocess.check_output(
            [str(binary), '--version-json'], text=True, creationflags=flags)),
        'gpu_identity': subprocess.check_output(['nvidia-smi',
            '--query-gpu=name,memory.total,driver_version', '--format=csv,noheader'], text=True).strip(),
        'limitations': [
            'Whole-device VRAM snapshots, not sampled peaks or per-process allocations.',
            'Single GPU/model/context/slot; synthetic prompts; no quality assessment.',
            'No speculative decoding, no cache reuse, no UI rendering.',
            'Precompiled worker; OS file cache not flushed.',
            'Quantized KV may change output quality; throughput is not a quality test.',
        ]}

    def persist():
        (output / 'results.json').write_text(json.dumps(report, indent=2), encoding='utf-8')

    prompts = {}
    rng = random.Random(args.seed)
    try:
        for round_index in range(args.rounds):
            names = list(args.profiles)
            rng.shuffle(names)
            for name in names:
                profile = PROFILES[name]
                folder = output / f'{round_index:02}-{name}'
                folder.mkdir()
                preset = folder / 'benchmark.ini'
                preset.write_text(
                    f'[*]\nfit = off\nctx-size = {report["ctx_size"]}\nparallel = 1\n'
                    f'n-gpu-layers = 99\nflash-attn = {profile["flash"]}\n'
                    f'batch-size = {profile["batch"]}\nubatch-size = {profile["ubatch"]}\n'
                    f'cache-type-k = {profile["kv"]}\ncache-type-v = {profile["kv"]}\n'
                    f'cache-ram = 0\n\n[benchmark]\nmodel = {model.as_posix()}\n'
                    'load-on-startup = false\n', encoding='utf-8')
                run = {'round': round_index, 'profile': name, 'gpu_before': gpu()}
                report['runs'].append(run)
                worker = None
                try:
                    worker = Worker(binary, preset, folder)
                    start = time.perf_counter()
                    worker.call('/models/load', {'model': 'benchmark'})
                    run['load_ms'] = (time.perf_counter() - start) * 1000
                    run['gpu_loaded'] = gpu()
                    run['props'] = worker.call('/props', {'model': 'benchmark'})
                    if not prompts:
                        for size in args.sizes:
                            generator = random.Random(f'jan-tuning-{size}')
                            text = 'Archive: ' + ' '.join(generator.choice([
                                'forest', 'river', 'stone', 'planet', 'window', 'garden',
                                'cloud', 'silver', 'orange', 'bridge']) for _ in range(size + 64))
                            lo, hi = 1, len(text)
                            while lo < hi:
                                mid = (lo + hi) // 2
                                tokens = worker.call('/tokenize', {'model': 'benchmark',
                                                                   'content': text[:mid]})['tokens']
                                if len(tokens) < size:
                                    lo = mid + 1
                                else:
                                    hi = mid
                            prompts[size] = text[:lo]
                        (output / 'prompts.json').write_text(json.dumps(prompts), encoding='utf-8')

                    def complete(size, count, measured, iteration):
                        prompt = prompts[size]
                        t0 = time.perf_counter()
                        first = None
                        final = None
                        output_digest = hashlib.sha256()
                        with worker.open('/completion', {
                            'model': 'benchmark', 'prompt': prompt, 'id_slot': 0,
                            'cache_prompt': False, 'n_predict': count, 'ignore_eos': True,
                            'temperature': 0, 'seed': 1, 'stream': True,
                        }) as response:
                            for line in response:
                                if not line.startswith(b'data: ') or line[6:].strip() == b'[DONE]':
                                    continue
                                event = json.loads(line[6:])
                                if event.get('error'):
                                    raise RuntimeError(event)
                                if event.get('content') and first is None:
                                    first = time.perf_counter()
                                if event.get('content'):
                                    output_digest.update(event['content'].encode())
                                if event.get('stop'):
                                    final = event
                        end = time.perf_counter()
                        if first is None or final is None:
                            raise RuntimeError('stream missing generated text or terminal event')
                        timings = final['timings']
                        if timings['cache_n'] != 0 or timings['prompt_n'] != size:
                            raise RuntimeError(f'expected full uncached prefill: {timings}')
                        if final['tokens_predicted'] != count:
                            raise RuntimeError('unexpected generated token count')
                        if measured:
                            sample = {'round': round_index, 'profile': name,
                                'prompt_tokens': size, 'iteration': iteration,
                                'prompt_sha256': hashlib.sha256(prompt.encode()).hexdigest(),
                                'output_sha256': output_digest.hexdigest(),
                                'ttft_ms': (first - t0) * 1000, 'total_ms': (end - t0) * 1000,
                                'timings': timings, 'tokens_predicted': final['tokens_predicted'],
                                'gpu_after': gpu()}
                            report['samples'].append(sample)
                            persist()
                            print(json.dumps({k: sample[k] for k in (
                                'round', 'profile', 'prompt_tokens', 'ttft_ms', 'total_ms')}
                                | {'prefill_tps': timings['prompt_per_second'],
                                   'decode_tps': timings['predicted_per_second']}), flush=True)

                    sizes = list(args.sizes)
                    rng.shuffle(sizes)
                    for size in sizes:
                        complete(size, 16, False, -1)  # Warm kernels for this shape.
                        for iteration in range(args.repeats):
                            complete(size, 128, True, iteration)
                    run['status'] = 'complete'
                except Exception as exc:
                    run['status'] = 'failed'
                    run['error'] = repr(exc)
                    print(json.dumps({'profile': name, 'round': round_index,
                                      'error': repr(exc)}), flush=True)
                finally:
                    if worker is not None:
                        worker.close()
                        run['exit_code'] = worker.proc.returncode
                    run['gpu_after_close'] = gpu()
                    persist()
        report['summary'] = []
        for name in args.profiles:
            for size in args.sizes:
                samples = [s for s in report['samples'] if s['profile'] == name
                           and s['prompt_tokens'] == size]
                if not samples:
                    continue
                row = {'profile': name, 'prompt_tokens': size, 'n': len(samples)}
                for metric, values in {
                    'ttft_ms': [s['ttft_ms'] for s in samples],
                    'prefill_tps': [s['timings']['prompt_per_second'] for s in samples],
                    'decode_tps': [s['timings']['predicted_per_second'] for s in samples],
                    'vram_snapshot_mib': [s['gpu_after']['memory_mib'] for s in samples],
                }.items():
                    row[metric] = {'median': statistics.median(values),
                                   'min': min(values), 'max': max(values)}
                report['summary'].append(row)
        report['status'] = 'complete' if all(run['status'] == 'complete'
            for run in report['runs']) else 'partial'
    except Exception as exc:
        report['status'] = 'failed'
        report['error'] = repr(exc)
        raise
    finally:
        persist()


if __name__ == '__main__':
    main()
