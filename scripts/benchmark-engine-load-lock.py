"""Probe a ready model while another context loads, with a process-isolated control.

Uses two aliases of one GGUF: A on GPU, B on CPU. Tests the shared registry
without a second GPU context competing for VRAM. No installed profile is used.
"""
import argparse
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
import os
from pathlib import Path
import queue
import statistics
import subprocess
import threading
import time
import urllib.error
import urllib.request
import uuid


class Worker:
    def __init__(self, binary, preset, folder, extra_args=()):
        self.key = uuid.uuid4().hex
        self.loading = threading.Event()
        self.log = (folder / 'worker.log').open('w', encoding='utf-8')
        self.proc = subprocess.Popen(
            [str(binary), '--preset', str(preset), '--port', '0', '--models-max', '2', *extra_args],
            cwd=binary.parent, env=dict(os.environ, JAN_LLAMA_API_KEY=self.key),
            stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
            text=True, creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0))
        self.lines = queue.Queue()
        self.stderr_thread = threading.Thread(target=self.read_stderr, daemon=True)
        self.stderr_thread.start()
        threading.Thread(target=self.read_stdout, daemon=True).start()
        deadline = time.monotonic() + 60
        while time.monotonic() < deadline:
            if self.proc.poll() is not None:
                raise RuntimeError(f'worker exited {self.proc.returncode}; see {folder}')
            try:
                ready = json.loads(self.lines.get(timeout=0.2))
                if 'port' in ready:
                    self.handshake = ready
                    self.base = f'http://127.0.0.1:{ready["port"]}'
                    return
            except (queue.Empty, ValueError):
                pass
        self.close()
        raise TimeoutError('worker handshake timeout')

    def read_stdout(self):
        for line in self.proc.stdout:
            self.lines.put(line)

    def read_stderr(self):
        for line in self.proc.stderr:
            self.log.write(line)
            self.log.flush()
            if 'load_model: loading model' in line:
                self.loading.set()

    def request(self, path, body=None):
        return urllib.request.Request(self.base + path,
            data=None if body is None else json.dumps(body).encode(),
            headers={'Authorization': 'Bearer ' + self.key, 'Content-Type': 'application/json'})

    def open(self, path, body=None):
        # One opener per request; concurrent probes share no HTTP connection.
        opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
        return opener.open(self.request(path, body), timeout=120)

    def call(self, path, body=None):
        with self.open(path, body) as response:
            return json.load(response)

    def close(self):
        if self.proc.poll() is None:
            self.proc.stdin.close()
            try:
                self.proc.wait(timeout=30)
            except subprocess.TimeoutExpired:
                self.proc.kill()
                self.proc.wait()
        self.stderr_thread.join(timeout=5)
        self.log.close()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--worker', type=Path, required=True)
    parser.add_argument('--model', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--repeats', type=int, default=7)
    parser.add_argument('--loading-model', type=Path)
    parser.add_argument('--loading-gpu', action='store_true')
    args = parser.parse_args()
    if args.repeats < 1:
        parser.error('--repeats must be positive')
    binary = args.worker.resolve(strict=True)
    model = args.model.resolve(strict=True)
    loading_model = args.loading_model.resolve(strict=True) if args.loading_model else model
    output = args.output.resolve()
    output.mkdir(parents=True, exist_ok=False)
    report = {'worker': str(binary), 'model': str(model),
              'loading_model': str(loading_model), 'loading_gpu': args.loading_gpu,
              'worker_sha256': hashlib.sha256(binary.read_bytes()).hexdigest(),
              'model_bytes': model.stat().st_size, 'repeats': args.repeats,
              'trials': [], 'workers': [],
              'limitations': [
                  'Two independent contexts using aliases of the same GGUF, not two model architectures.',
                  'B loads on CPU to avoid GPU contention; results do not predict GPU/GPU loading.',
                  'OS file cache is not flushed; no direct internal mutex timer.',
                  'Precompiled worker; no engine modifications or new engine build.',
                  'Tiny synthetic completion; UI and existing-stream behavior not measured.',
              ]}

    def persist():
        (output / 'results.json').write_text(json.dumps(report, indent=2), encoding='utf-8')

    workers = []
    try:
        report['gpu'] = subprocess.check_output(
            ['nvidia-smi', '--query-gpu=name,memory.total,memory.used,driver_version',
             '--format=csv,noheader'], text=True).strip()
        for label in ('service', 'independent-loader'):
            folder = output / label
            folder.mkdir()
            preset = folder / 'benchmark.ini'
            preset.write_text(
                '[*]\nfit = off\nctx-size = 2048\nparallel = 1\n'
                'cache-ram = 0\nbatch-size = 512\nubatch-size = 512\n'
                f'\n[model-A]\nmodel = {model.as_posix()}\nn-gpu-layers = 99\n'
                'flash-attn = on\nload-on-startup = false\n'
                f'\n[model-B]\nmodel = {loading_model.as_posix()}\nn-gpu-layers = {99 if args.loading_gpu else 0}\n'
                'threads = 4\nthreads-batch = 4\nload-on-startup = false\n', encoding='utf-8')
            worker = Worker(binary, preset, folder)
            workers.append(worker)
            report['workers'].append({'label': label, 'handshake': worker.handshake})
        service, independent = workers
        service.call('/models/load', {'model': 'model-A'})

        def probe(kind, origin):
            start = time.perf_counter()
            first = None
            evidence = None
            if kind == 'completion':
                with service.open('/completion', {
                    'model': 'model-A', 'prompt': 'Count from one to sixteen:',
                    'id_slot': 0, 'cache_prompt': True, 'n_predict': 16,
                    'temperature': 0, 'seed': 1, 'ignore_eos': True, 'stream': True,
                }) as response:
                    for line in response:
                        if line.startswith(b'data: ') and line[6:].strip() != b'[DONE]':
                            event = json.loads(line[6:])
                            if event.get('error'):
                                raise RuntimeError(event)
                            if event.get('content') and first is None:
                                first = time.perf_counter()
                            if event.get('stop'):
                                evidence = {'timings': event.get('timings'),
                                            'tokens_predicted': event.get('tokens_predicted')}
                if first is None or evidence is None or evidence['tokens_predicted'] != 16:
                    raise RuntimeError('incomplete completion')
            elif kind == 'tokenize':
                evidence = service.call('/tokenize', {'model': 'model-A', 'content': 'Hello world.'})
                assert evidence.get('tokens')
            elif kind == 'models':
                evidence = service.call('/models')
                a = next(m for m in evidence['data'] if m['id'] == 'model-A')
                assert a['status']['value'] == 'loaded', a
            elif kind == 'http-control':
                try:
                    service.call('/benchmark-not-a-route')
                    raise AssertionError('expected 404')
                except urllib.error.HTTPError as exc:
                    assert exc.code == 404
                    exc.close()
            end = time.perf_counter()
            return {'kind': kind, 'start_ms': (start - origin) * 1000,
                    'end_ms': (end - origin) * 1000,
                    'latency_ms': (end - start) * 1000,
                    'ttft_ms': None if first is None else (first - start) * 1000,
                    'evidence': evidence}

        def probes(pool, origin):
            futures = [pool.submit(probe, kind, origin)
                       for kind in ('completion', 'tokenize', 'models', 'http-control')]
            return [future.result(timeout=120) for future in futures]

        with ThreadPoolExecutor(max_workers=6) as pool:
            probes(pool, time.perf_counter())  # Unmeasured warmup.
            for i in range(args.repeats):
                # Alternate the order to reduce systematic time/thermal bias.
                modes = ('shared-registry', 'separate-process') if i % 2 == 0 else (
                    'separate-process', 'shared-registry')
                for mode in modes:
                    target = service if mode == 'shared-registry' else independent
                    trial = {'iteration': i, 'mode': mode}
                    report['trials'].append(trial)
                    origin = time.perf_counter()
                    trial['baseline'] = probes(pool, origin)
                    target.loading.clear()

                    def load_b():
                        begin = time.perf_counter()
                        response = target.call('/models/load', {'model': 'model-B'})
                        end = time.perf_counter()
                        return {'start_ms': (begin - origin) * 1000,
                                'end_ms': (end - origin) * 1000,
                                'duration_ms': (end - begin) * 1000, 'response': response}

                    future = pool.submit(load_b)
                    if not target.loading.wait(timeout=30):
                        raise TimeoutError('B native load-start message not observed')
                    trial['native_load_seen_ms'] = (time.perf_counter() - origin) * 1000
                    trial['during_load'] = probes(pool, origin)
                    trial['load'] = future.result(timeout=120)
                    assert all(p['start_ms'] < trial['load']['end_ms']
                               for p in trial['during_load']), 'probes missed load window'
                    target.call('/models/unload', {'model': 'model-B'})
                    trial['after_unload'] = probes(pool, origin)
                    persist()
                    print(json.dumps({'iteration': i, 'mode': mode,
                        'load_ms': trial['load']['duration_ms'],
                        'probes': [{k: p[k] for k in ('kind', 'latency_ms', 'ttft_ms')}
                                   for p in trial['during_load']]}), flush=True)
        report['summary'] = []
        for mode in ('shared-registry', 'separate-process'):
            for kind in ('completion', 'tokenize', 'models', 'http-control'):
                for phase in ('baseline', 'during_load', 'after_unload'):
                    samples = [p for t in report['trials'] if t['mode'] == mode
                               for p in t[phase] if p['kind'] == kind]
                    key = 'ttft_ms' if kind == 'completion' else 'latency_ms'
                    values = [p[key] for p in samples]
                    report['summary'].append({'mode': mode, 'kind': kind, 'phase': phase,
                        'metric': key, 'n': len(values), 'median_ms': statistics.median(values),
                        'min_ms': min(values), 'max_ms': max(values)})
        report['status'] = 'complete'
    except Exception as exc:
        report['status'] = 'failed'
        report['error'] = repr(exc)
        raise
    finally:
        for i, worker in enumerate(workers):
            worker.close()
            report['workers'][i]['exit_code'] = worker.proc.returncode
        persist()


if __name__ == '__main__':
    main()
