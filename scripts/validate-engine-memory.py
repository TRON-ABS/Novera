"""Windows worker memory stress with two GPU contexts and a bounded KV disk cache.

Applies a Windows Job Object process-memory limit to the test worker only.
Reports sampled GPU device peaks, not native allocator high-water marks.
"""
import argparse
import ctypes
from ctypes import wintypes
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess
import threading
import time

spec=importlib.util.spec_from_file_location('memory_helpers',Path(__file__).with_name('benchmark-thread-affinity.py'))
h=importlib.util.module_from_spec(spec);spec.loader.exec_module(h)


class JobLimit:
    def __init__(self,pid,mib):
        class Basic(ctypes.Structure):
            _fields_=[('process_time',ctypes.c_int64),('job_time',ctypes.c_int64),('flags',wintypes.DWORD),
                      ('min_working',ctypes.c_size_t),('max_working',ctypes.c_size_t),('active',wintypes.DWORD),
                      ('affinity',ctypes.c_size_t),('priority',wintypes.DWORD),('scheduling',wintypes.DWORD)]
        class IO(ctypes.Structure):
            _fields_=[(x,ctypes.c_uint64) for x in ['read_ops','write_ops','other_ops','read_bytes','write_bytes','other_bytes']]
        class Extended(ctypes.Structure):
            _fields_=[('basic',Basic),('io',IO),('process_limit',ctypes.c_size_t),('job_limit',ctypes.c_size_t),
                      ('process_peak',ctypes.c_size_t),('job_peak',ctypes.c_size_t)]
        self.kernel=ctypes.WinDLL('kernel32',use_last_error=True)
        self.kernel.CreateJobObjectW.restype=wintypes.HANDLE
        self.kernel.CreateJobObjectW.argtypes=[ctypes.c_void_p,wintypes.LPCWSTR]
        self.kernel.OpenProcess.restype=wintypes.HANDLE
        self.kernel.OpenProcess.argtypes=[wintypes.DWORD,wintypes.BOOL,wintypes.DWORD]
        self.kernel.SetInformationJobObject.argtypes=[wintypes.HANDLE,ctypes.c_int,ctypes.c_void_p,wintypes.DWORD]
        self.kernel.AssignProcessToJobObject.argtypes=[wintypes.HANDLE,wintypes.HANDLE]
        self.kernel.CloseHandle.argtypes=[wintypes.HANDLE]
        self.job=self.kernel.CreateJobObjectW(None,None)
        limits=Extended();limits.basic.flags=0x100|0x2000;limits.process_limit=mib*1048576
        if not self.kernel.SetInformationJobObject(self.job,9,ctypes.byref(limits),ctypes.sizeof(limits)):
            raise ctypes.WinError(ctypes.get_last_error())
        process=self.kernel.OpenProcess(0x101,False,pid)
        try:
            if not self.kernel.AssignProcessToJobObject(self.job,process):raise ctypes.WinError(ctypes.get_last_error())
        finally:self.kernel.CloseHandle(process)
    def close(self):self.kernel.CloseHandle(self.job)


class GpuProcessCounters:
    """WDDM dedicated/shared GPU memory for this PID across adapters."""
    def __init__(self,pid):
        self.pid=pid;self.query=wintypes.HANDLE();self.counters={}
        self.pdh=ctypes.WinDLL('pdh')
        self.pdh.PdhOpenQueryW.argtypes=[wintypes.LPCWSTR,ctypes.c_size_t,ctypes.POINTER(wintypes.HANDLE)]
        self.pdh.PdhAddEnglishCounterW.argtypes=[wintypes.HANDLE,wintypes.LPCWSTR,ctypes.c_size_t,ctypes.POINTER(wintypes.HANDLE)]
        self.pdh.PdhCollectQueryData.argtypes=[wintypes.HANDLE]
        self.pdh.PdhGetFormattedCounterArrayW.argtypes=[wintypes.HANDLE,wintypes.DWORD,ctypes.POINTER(wintypes.DWORD),ctypes.POINTER(wintypes.DWORD),ctypes.c_void_p]
        self.pdh.PdhCloseQuery.argtypes=[wintypes.HANDLE]
        if self.pdh.PdhOpenQueryW(None,0,ctypes.byref(self.query))!=0:raise OSError('PDH query unavailable')
        for label,name in [('dedicated','Dedicated Usage'),('shared','Shared Usage')]:
            counter=wintypes.HANDLE()
            if self.pdh.PdhAddEnglishCounterW(self.query,'\\GPU Process Memory(*)\\'+name,0,ctypes.byref(counter))!=0:
                raise OSError('GPU Process Memory counter unavailable')
            self.counters[label]=counter
    def sample(self):
        class Value(ctypes.Structure):
            _fields_=[('status',wintypes.DWORD),('value',ctypes.c_int64)]
        class Item(ctypes.Structure):
            _fields_=[('name',wintypes.LPWSTR),('value',Value)]
        result={}
        if self.pdh.PdhCollectQueryData(self.query)!=0:return result
        for label,counter in self.counters.items():
            size=wintypes.DWORD();count=wintypes.DWORD()
            self.pdh.PdhGetFormattedCounterArrayW(counter,0x400,ctypes.byref(size),ctypes.byref(count),None)
            if not size.value:continue
            buffer=ctypes.create_string_buffer(size.value)
            if self.pdh.PdhGetFormattedCounterArrayW(counter,0x400,ctypes.byref(size),ctypes.byref(count),buffer)!=0:continue
            items=ctypes.cast(buffer,ctypes.POINTER(Item))
            values=[items[i].value.value for i in range(count.value)
                if items[i].name.startswith(f'pid_{self.pid}_') and items[i].value.status in (0,1)]
            if values:result[f'gpu_process_{label}_mib']=sum(values)/1048576
        return result
    def close(self):self.pdh.PdhCloseQuery(self.query)


class Monitor:
    def __init__(self,pid):
        self.pid=pid;self.rows=[];self.stop=threading.Event()
        try:self.gpu_process=GpuProcessCounters(pid)
        except OSError:self.gpu_process=None
        self.proc=subprocess.Popen(['nvidia-smi','--query-gpu=memory.used,temperature.gpu','--format=csv,noheader,nounits','--loop-ms=100'],
            stdout=subprocess.PIPE,stderr=subprocess.DEVNULL,text=True,creationflags=subprocess.CREATE_NO_WINDOW)
        self.thread=threading.Thread(target=self.read,daemon=True);self.thread.start()
    def read(self):
        for line in self.proc.stdout:
            try:
                memory,temperature=[float(x.strip()) for x in line.split(',')]
                self.rows.append({'time':time.time(),'gpu_device_mib':memory,'gpu_celsius':temperature,
                                  **(self.gpu_process.sample() if self.gpu_process else {}),
                                  **h.process_memory(self.pid)})
            except (ValueError,OSError):pass
    def close(self):
        self.proc.terminate();self.proc.wait(timeout=5);self.thread.join(timeout=5)
        if self.gpu_process:self.gpu_process.close()
    def summary(self):
        keys=['gpu_device_mib','private_mib','working_set_mib','gpu_process_dedicated_mib','gpu_process_shared_mib']
        return {key:max(x[key] for x in self.rows if key in x) for key in keys if any(key in x for x in self.rows)}


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--worker',type=Path,required=True);parser.add_argument('--model',type=Path,required=True)
    parser.add_argument('--output',type=Path,required=True);parser.add_argument('--process-limit-mib',type=int,default=8192)
    args=parser.parse_args();binary=args.worker.resolve(strict=True);model=args.model.resolve(strict=True)
    out=args.output.resolve();out.mkdir(parents=True,exist_ok=False)
    report={'worker_sha256':hashlib.sha256(binary.read_bytes()).hexdigest(),'process_limit_mib':args.process_limit_mib,
            'sampling_ms':100,'runs':[],'limits':['One physical GPU; whole-device sampled VRAM peak.',
                'Job cap controls worker process commit, not GPU allocations or whole-system RAM.',
                'Two contexts of the same GGUF stress memory, not a second model architecture.']}
    def persist():(out/'results.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
    try:
        for budget in [16,192]:
            folder=out/f'cache-{budget}';cache=folder/'cache';cache.mkdir(parents=True)
            ini=folder/'test.ini';ini.write_text('[*]\nfit = off\nctx-size = 12288\nparallel = 2\nkv-unified = false\n'
                'n-gpu-layers = 99\nflash-attn = on\nbatch-size = 2048\nubatch-size = 2048\ncache-ram = 0\n'
                f'slot-save-path = {cache.as_posix()}/\n\n[a]\nmodel = {model.as_posix()}\n\n[b]\nmodel = {model.as_posix()}\n',encoding='utf-8')
            worker=h.helpers.Worker(binary,ini,folder,('--slot-cache-mib',str(budget)))
            job=None;monitor=None;run={'cache_budget_mib':budget,'samples':[]};report['runs'].append(run)
            try:
                job=JobLimit(worker.proc.pid,args.process_limit_mib);monitor=Monitor(worker.proc.pid)
                worker.call('/models/load',{'model':'a'});worker.call('/models/load',{'model':'b'})
                run['two_gpu_models_loaded']=True
                # Different leading tokens avoid accidental shared-prefix hits across threads.
                prompts={str(i):f'Conversation {i}: '+('river stone forest bridge. '*700) for i in range(8)}
                for cycle in range(3):
                    for thread,prompt in prompts.items():
                        start=time.perf_counter()
                        with worker.open('/completion',{'model':'a','thread_id':thread,'cache_thread_slots':2,
                            'id_slot':0,'prompt':prompt,'cache_prompt':True,'n_predict':8,'temperature':0}) as response:
                            answer=json.load(response);headers=dict(response.headers)
                        assert answer['tokens_predicted']>0
                        state_bytes=sum(p.stat().st_size for p in cache.glob('*.bin'))
                        assert state_bytes<=budget*1048576,(state_bytes,budget)
                        run['samples'].append({'cycle':cycle,'thread':thread,'timings':answer['timings'],
                            'elapsed_ms':(time.perf_counter()-start)*1000,'cache_bytes':state_bytes,
                            'handover':{k:v for k,v in headers.items() if k.lower().startswith('x-jan-')}})
                        persist()
                run['bounded_disk_cache']=True
                run['max_cache_bytes']=max(x['cache_bytes'] for x in run['samples'])
                # Both contexts remain usable after repeated cache pruning.
                answer=worker.call('/completion',{'model':'b','prompt':'Say ready.','n_predict':8,'temperature':0})
                assert answer['tokens_predicted']>0;run['second_model_still_usable']=True
                worker.call('/slots/state/erase',{'model':'a'})
                run['cache_erased']=not list(cache.glob('*.bin'));assert run['cache_erased']
                run['status']='complete'
            finally:
                if monitor:
                    monitor.close();run['sampled_peaks']=monitor.summary();run['memory_samples']=monitor.rows
                worker.close();run['exit_code']=worker.proc.returncode
                if job:job.close()
                persist()
            print(json.dumps({k:v for k,v in run.items() if k not in ['samples','memory_samples']}),flush=True)
        report['status']='complete'
    except Exception as exc:
        report['status']='failed';report['error']=repr(exc);raise
    finally:persist()


if __name__=='__main__':main()
