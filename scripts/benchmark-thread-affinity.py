"""Compare one/two preallocated slots at equal per-slot context; check KV handover.

Uses the neighboring benchmark-engine-tuning.py worker/telemetry helpers.
No installed Jan settings or conversations are used.
"""
import argparse
import ctypes
from ctypes import wintypes
import hashlib
import importlib.util
import json
from pathlib import Path
import random
import statistics
import time

spec = importlib.util.spec_from_file_location('jan_affinity_helpers',
    Path(__file__).with_name('benchmark-engine-tuning.py'))
helpers = importlib.util.module_from_spec(spec)
spec.loader.exec_module(helpers)


def process_memory(pid):
    class Counters(ctypes.Structure):
        _fields_ = [('cb', wintypes.DWORD), ('faults', wintypes.DWORD)] + [
            (name, ctypes.c_size_t) for name in ('peak_working', 'working', 'peak_paged',
                'paged', 'peak_nonpaged', 'nonpaged', 'pagefile', 'peak_pagefile', 'private')]
    kernel = ctypes.WinDLL('kernel32', use_last_error=True)
    psapi = ctypes.WinDLL('psapi', use_last_error=True)
    kernel.OpenProcess.argtypes = [wintypes.DWORD, wintypes.BOOL, wintypes.DWORD]
    kernel.OpenProcess.restype = wintypes.HANDLE
    kernel.CloseHandle.argtypes = [wintypes.HANDLE]
    psapi.GetProcessMemoryInfo.argtypes = [wintypes.HANDLE, ctypes.POINTER(Counters), wintypes.DWORD]
    handle = kernel.OpenProcess(0x410, False, pid)
    if not handle:
        raise ctypes.WinError(ctypes.get_last_error())
    try:
        c = Counters()
        c.cb = ctypes.sizeof(c)
        if not psapi.GetProcessMemoryInfo(handle, ctypes.byref(c), c.cb):
            raise ctypes.WinError(ctypes.get_last_error())
        return {'working_set_mib': c.working / 1048576, 'private_mib': c.private / 1048576}
    finally:
        kernel.CloseHandle(handle)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--worker', type=Path, required=True)
    parser.add_argument('--model', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--repeats', type=int, default=7)
    parser.add_argument('--sizes', type=int, nargs='+', default=[512, 2048, 8192])
    args = parser.parse_args()
    binary = args.worker.resolve(strict=True)
    model = args.model.resolve(strict=True)
    output = args.output.resolve()
    output.mkdir(parents=True, exist_ok=False)
    report = {'worker':str(binary), 'worker_sha256':hashlib.sha256(binary.read_bytes()).hexdigest(),
              'model':str(model), 'repeats':args.repeats, 'sizes':args.sizes,
              'runs':[], 'samples':[], 'checks':[]}
    prompts = {}

    def persist():
        (output/'results.json').write_text(json.dumps(report, indent=2), encoding='utf-8')

    try:
        for slots in (1, 2):
            folder = output / f'slots-{slots}'
            cache = folder/'cache'
            cache.mkdir(parents=True)
            preset = folder/'benchmark.ini'
            preset.write_text(f'[*]\nfit = off\nctx-size = {(max(args.sizes)+1024)*slots}\n'
                f'parallel = {slots}\nkv-unified = false\nflash-attn = on\nn-gpu-layers = 99\n'
                f'batch-size = 2048\nubatch-size = 2048\ncache-ram = 0\nslot-save-path = {cache.as_posix()}/\n'
                f'\n[benchmark]\nmodel = {model.as_posix()}\nload-on-startup = false\n', encoding='utf-8')
            worker = helpers.Worker(binary, preset, folder, extra_args=('--slot-cache-mib','4096'))
            run = {'slots':slots}
            report['runs'].append(run)
            try:
                worker.call('/models/load', {'model':'benchmark'})
                run['props'] = worker.call('/props', {'model':'benchmark'})
                run['memory_loaded'] = process_memory(worker.proc.pid)
                run['gpu_loaded'] = helpers.gpu()
                if not prompts:
                    for size in args.sizes:
                        for identity in ('A','B','C'):
                            rng = random.Random(f'affinity-{identity}-{size}')
                            text = identity + ': ' + ' '.join(rng.choice(
                                ['forest','river','stone','planet','window','garden','cloud','silver'])
                                for _ in range(size+64))
                            lo,hi = 1,len(text)
                            while lo < hi:
                                mid=(lo+hi)//2
                                n=len(worker.call('/tokenize', {'model':'benchmark','content':text[:mid]})['tokens'])
                                if n<size: lo=mid+1
                                else: hi=mid
                            prompts[(size,identity)]=text[:lo]

                def complete(size, identity, scenario, iteration, record=True):
                    started=time.perf_counter()
                    first=None
                    final=None
                    with worker.open('/completion', {'model':'benchmark','prompt':prompts[(size,identity)],
                        'thread_id':f'{size}-{identity}','id_slot':0,'cache_thread_slots':2,
                        'cache_prompt':True,'n_predict':16,'ignore_eos':True,'temperature':0,'seed':1,
                        'stream':True}) as response:
                        timing = {key: response.headers.get(key) for key in (
                            'x-jan-slot','x-jan-slot-selection-ms','x-jan-kv-save-ms','x-jan-kv-restore-ms')}
                        assert all(v is not None for v in timing.values()), 'worker has no timing headers'
                        for line in response:
                            if not line.startswith(b'data: ') or line[6:].strip()==b'[DONE]': continue
                            event=json.loads(line[6:])
                            if event.get('content') and first is None: first=time.perf_counter()
                            if event.get('stop'): final=event
                    assert first is not None and final['tokens_predicted']==16
                    sample={'slots':slots,'size':size,'thread':identity,'scenario':scenario,'iteration':iteration,
                        'ttft_ms':(first-started)*1000,'timings':final['timings'],
                        'handover':{k:float(v) for k,v in timing.items()}}
                    if record:
                        report['samples'].append(sample)
                        persist()
                        print(json.dumps(sample), flush=True)
                    return sample

                for size in args.sizes:
                    complete(size,'A','prime',-1,False)
                    complete(size,'B','prime',-1,False)
                    complete(size,'A','prime',-1,False)
                    for i in range(args.repeats):
                        complete(size,'B','switch-B',i,False)
                        sample=complete(size,'A','thread-switch',i)
                        assert sample['timings']['cache_n'] >= size-8
                        if slots==2:
                            assert sample['handover']['x-jan-kv-save-ms']==0
                            assert sample['handover']['x-jan-kv-restore-ms']==0
                    run.setdefault('memory_after_sizes',[]).append({'size':size,
                        'process':process_memory(worker.proc.pid),'gpu':helpers.gpu()})

                if slots==2:
                    size=max(args.sizes)
                    complete(size,'C','third-thread',0,False)
                    a=complete(size,'A','retained-A',0,False)
                    b=complete(size,'B','restored-B',0,False)
                    assert a['timings']['cache_n']>=size-8 and a['handover']['x-jan-kv-restore-ms']==0
                    assert b['timings']['cache_n']>=size-8 and b['handover']['x-jan-kv-restore-ms']>0
                    report['checks'].append({'third_thread_keeps_A_and_restores_B':True,'A':a,'B':b})
                    # A raw API caller sharing the explicit slot must not cause
                    # its KV state to be persisted under a named conversation.
                    with worker.open('/completion', {'model':'benchmark','prompt':'Raw API client.',
                        'id_slot':0,'n_predict':16,'temperature':0,'stream':False}) as response:
                        raw=json.load(response)
                    assert raw['tokens_predicted']>0
                    states=[json.loads(p.read_text()) for p in cache.glob('*.json')]
                    assert not any(s['thread'].startswith('untracked-') for s in states)
                    report['checks'].append({'raw_client_never_persisted_as_named_thread':True})
                    worker.call('/slots/state/erase', {'thread':f'{size}-A'})
                    complete(size,'C','after-delete',0,False)
                    states=[json.loads(p.read_text()) for p in cache.glob('*.json')]
                    assert not any(s['thread']==f'{size}-A' for s in states)
                    report['checks'].append({'deleted_thread_cache_not_recreated':True})
                run['status']='complete'
            finally:
                worker.close()
                run['exit_code']=worker.proc.returncode
                persist()
        report['summary']=[{'slots':slots,'size':size,
            'median_ttft_ms':statistics.median(s['ttft_ms'] for s in report['samples']
                if s['slots']==slots and s['size']==size),
            'median_save_ms':statistics.median(s['handover']['x-jan-kv-save-ms'] for s in report['samples']
                if s['slots']==slots and s['size']==size),
            'median_restore_ms':statistics.median(s['handover']['x-jan-kv-restore-ms'] for s in report['samples']
                if s['slots']==slots and s['size']==size)} for slots in (1,2) for size in args.sizes]
        report['status']='complete'
    except Exception as exc:
        report['status']='failed'
        report['error']=repr(exc)
        raise
    finally:
        persist()


if __name__=='__main__': main()
