"""Measure draftless n-gram speculation against ordinary decoding.

Uses the neighboring tuning benchmark's worker and GPU telemetry helpers.
Does not download a draft model or change the installed application profile.
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
    'jan_tuning_helpers', Path(__file__).with_name('benchmark-engine-tuning.py'))
helpers = importlib.util.module_from_spec(spec)
spec.loader.exec_module(helpers)
PROFILES = {'baseline': 0, 'ngram-4': 4, 'ngram-8': 8, 'ngram-16': 16}
WORKLOADS = {
    'prose': 'Write at least 500 words describing a geologist exploring an unfamiliar volcanic island. '
             'Include specific observations, competing hypotheses and a plan for the next day. Begin directly.',
    'code': 'Write a complete Python implementation of an LRU cache with a TTL, using only the standard '
            'library. Include type annotations, docstrings, expiration, eviction, and usage examples. '
            'Return only the Python code, with at least 12 methods or example functions.',
    'copy': 'Repeat the following block exactly 30 times, without numbering or commentary:\n'
            + ('The silver river crosses the forest, passes the stone bridge, and reaches the quiet garden.\n' * 4),
}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--worker', type=Path, required=True)
    parser.add_argument('--model', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--profiles', nargs='+', choices=list(PROFILES), default=list(PROFILES))
    parser.add_argument('--rounds', type=int, default=3)
    parser.add_argument('--repeats', type=int, default=1)
    parser.add_argument('--seed', type=int, default=4242)
    parser.add_argument('--disable-thinking', action='store_true')
    args = parser.parse_args()
    if min(args.rounds, args.repeats) < 1:
        parser.error('rounds and repeats must be positive')
    binary = args.worker.resolve(strict=True)
    model = args.model.resolve(strict=True)
    output = args.output.resolve()
    output.mkdir(parents=True, exist_ok=False)
    r = {'worker': str(binary), 'model': str(model),
         'worker_sha256': hashlib.sha256(binary.read_bytes()).hexdigest(),
         'worker_version': json.loads(subprocess.check_output([str(binary), '--version-json'], text=True)),
         'profiles': {name: PROFILES[name] for name in args.profiles},
         'rounds': args.rounds, 'repeats': args.repeats, 'seed': args.seed,
         'thinking_requested': not args.disable_thinking,
         'direct_prompt_policy': 'close terminal think tag' if args.disable_thinking else None,
         'workloads': WORKLOADS, 'runs': [], 'samples': [],
         'limitations': ['N-gram only, no MTP or external draft model.',
                         'Synthetic fixed 256-token output budget, ignore_eos=true.',
                         'Greedy decoding; text equality checked separately, no task-quality grading.',
                         'VRAM is a whole-device snapshot, not peak process allocation.',
                         'Dynamic GPU frequencies; one model/GPU; precompiled worker.']}
    rng = random.Random(args.seed)
    prompts = {}

    def persist():
        (output / 'results.json').write_text(json.dumps(r, indent=2), encoding='utf-8')

    try:
        for round_index in range(args.rounds):
            names = list(args.profiles)
            rng.shuffle(names)
            for name in names:
                nmax = PROFILES[name]
                folder = output / f'{round_index:02}-{name}'
                folder.mkdir()
                preset = folder / 'benchmark.ini'
                settings = '' if not nmax else (
                    f'spec-type = ngram-map-k\nspec-draft-n-max = {nmax}\n'
                    f'spec-ngram-map-k-size-n = 3\nspec-ngram-map-k-size-m = {nmax}\n')
                preset.write_text(
                    '[*]\nfit = off\nctx-size = 4096\nparallel = 1\nn-gpu-layers = 99\n'
                    'flash-attn = on\nbatch-size = 2048\nubatch-size = 2048\n'
                    'cache-type-k = f16\ncache-type-v = f16\ncache-ram = 0\n'
                    + settings + f'\n[benchmark]\nmodel = {model.as_posix()}\n'
                    'load-on-startup = false\n', encoding='utf-8')
                run = {'round': round_index, 'profile': name, 'gpu_before': helpers.gpu()}
                r['runs'].append(run)
                worker = None
                try:
                    worker = helpers.Worker(binary, preset, folder)
                    worker.call('/models/load', {'model': 'benchmark'})
                    props = worker.call('/props', {'model': 'benchmark'})
                    run['props'] = props
                    # /props reports default request parameters, not the native
                    # slot's actual speculation capability. Check /slots instead.
                    slots = worker.call('/slots', {'model': 'benchmark'})
                    run['slots'] = slots
                    if bool(slots[0]['speculative']) != bool(nmax):
                        raise RuntimeError(f'unexpected native slot speculative flag: {slots}')
                    if not prompts:
                        for workload, text in WORKLOADS.items():
                            formatted = worker.call('/apply-template', {'model': 'benchmark',
                                'messages': [{'role': 'user', 'content': text}],
                                'chat_template_kwargs': {'enable_thinking': not args.disable_thinking},
                                'add_generation_prompt': True})
                            prompt = formatted['prompt']
                            # Some GGUF templates unconditionally append <think>
                            # and ignore enable_thinking. Explicitly prefill an
                            # empty reasoning block for the direct-output test.
                            forced_empty_reasoning = args.disable_thinking and prompt.endswith('<think>')
                            if forced_empty_reasoning:
                                prompt += '</think>\n\n'
                            count = len(worker.call('/tokenize', {'model': 'benchmark',
                                                                   'content': prompt})['tokens'])
                            prompts[workload] = {'text': prompt, 'token_count': count,
                                                'forced_empty_reasoning': forced_empty_reasoning}
                        (output / 'prompts.json').write_text(json.dumps(prompts), encoding='utf-8')

                    def complete(workload, count, measured, iteration):
                        prompt = prompts[workload]['text']
                        t0 = time.perf_counter()
                        first = None
                        final = None
                        text = []
                        with worker.open('/completion', {'model': 'benchmark', 'prompt': prompt,
                            'id_slot': 0, 'cache_prompt': False, 'n_predict': count,
                            'ignore_eos': True, 'temperature': 0, 'seed': 1, 'stream': True}) as response:
                            for line in response:
                                if not line.startswith(b'data: ') or line[6:].strip() == b'[DONE]':
                                    continue
                                event = json.loads(line[6:])
                                if event.get('error'):
                                    raise RuntimeError(event)
                                if event.get('content'):
                                    if first is None:
                                        first = time.perf_counter()
                                    text.append(event['content'])
                                if event.get('stop'):
                                    final = event
                        end = time.perf_counter()
                        if first is None or final is None:
                            raise RuntimeError('incomplete stream')
                        timings = final['timings']
                        if timings['cache_n'] != 0 or final['tokens_predicted'] != count:
                            raise RuntimeError(f'unexpected reuse or generated token count: {final}')
                        if measured:
                            content = ''.join(text)
                            sample = {'round': round_index, 'profile': name, 'workload': workload,
                                'iteration': iteration, 'ttft_ms': (first-t0)*1000,
                                'total_ms': (end-t0)*1000, 'timings': timings,
                                'prompt_sha256': hashlib.sha256(prompt.encode()).hexdigest(),
                                'output_sha256': hashlib.sha256(content.encode()).hexdigest(),
                                'tokens_predicted': final['tokens_predicted'],
                                'gpu_after': helpers.gpu()}
                            path = folder / f'{workload}-{iteration}-output.txt'
                            path.write_text(content, encoding='utf-8')
                            r['samples'].append(sample)
                            persist()
                            print(json.dumps({'round': round_index, 'profile': name,
                                'workload': workload, 'ttft_ms': sample['ttft_ms'],
                                'decode_tps': timings['predicted_per_second'],
                                'draft_n': timings.get('draft_n', 0),
                                'accepted': timings.get('draft_n_accepted', 0)}), flush=True)

                    workloads = list(WORKLOADS)
                    rng.shuffle(workloads)
                    for workload in workloads:
                        complete(workload, 16, False, -1)
                        for iteration in range(args.repeats):
                            complete(workload, 256, True, iteration)
                    run['status'] = 'complete'
                except Exception as exc:
                    run['status'] = 'failed'
                    run['error'] = repr(exc)
                    print(json.dumps({'profile': name, 'error': repr(exc)}), flush=True)
                finally:
                    if worker is not None:
                        worker.close()
                        run['exit_code'] = worker.proc.returncode
                    persist()
        r['summary'] = []
        for name in args.profiles:
            for workload in WORKLOADS:
                samples = [s for s in r['samples'] if s['profile'] == name and s['workload'] == workload]
                if not samples:
                    continue
                drafted = sum(s['timings'].get('draft_n', 0) for s in samples)
                accepted = sum(s['timings'].get('draft_n_accepted', 0) for s in samples)
                r['summary'].append({'profile': name, 'workload': workload, 'n': len(samples),
                    'decode_tps': statistics.median(s['timings']['predicted_per_second'] for s in samples),
                    'decode_min_tps': min(s['timings']['predicted_per_second'] for s in samples),
                    'decode_max_tps': max(s['timings']['predicted_per_second'] for s in samples),
                    'ttft_ms': statistics.median(s['ttft_ms'] for s in samples),
                    'total_ms': statistics.median(s['total_ms'] for s in samples),
                    'vram_snapshot_mib': statistics.median(s['gpu_after']['memory_mib'] for s in samples),
                    'drafted': drafted, 'accepted': accepted,
                    'acceptance': accepted / drafted if drafted else None})
        r['status'] = 'complete' if all(run['status'] == 'complete' for run in r['runs']) else 'partial'
    finally:
        persist()


if __name__ == '__main__':
    main()
