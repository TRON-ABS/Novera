"""Compare batches on two architectures with sampled GPU/process memory peaks."""
import argparse
import hashlib
import importlib.util
import json
from pathlib import Path
import statistics
import time

spec=importlib.util.spec_from_file_location('profile_memory_helpers',Path(__file__).with_name('validate-engine-memory.py'))
h=importlib.util.module_from_spec(spec);spec.loader.exec_module(h)


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--worker',type=Path,required=True)
    parser.add_argument('--models',type=Path,nargs='+',required=True)
    parser.add_argument('--output',type=Path,required=True)
    parser.add_argument('--device',default='CUDA0')
    parser.add_argument('--sizes',type=int,nargs='+',default=[2048,8192])
    args=parser.parse_args();binary=args.worker.resolve(strict=True)
    out=args.output.resolve();out.mkdir(parents=True,exist_ok=False)
    r={'worker_sha256':hashlib.sha256(binary.read_bytes()).hexdigest(),'sampling_ms':100,'device':args.device,'runs':[],
       'limits':['Results apply only to the selected local device and these prompts.',
                 'GPU high-water is a 100 ms sampled whole-device peak; spikes between samples may be missed.',
                 'gpu_device_mib always measures NVIDIA; use WDDM process dedicated/shared counters for Intel.',
                 'Synthetic prompt performance does not establish task quality.']}
    def persist():(out/'results.json').write_text(json.dumps(r,indent=2),encoding='utf-8')
    try:
        for model in args.models:
            model=model.resolve(strict=True)
            prompts={}
            for context in args.sizes:
                for batch in ([512,2048] if context==2048 else [2048,512]):
                    folder=out/f'{model.stem}-{context}-{batch}';folder.mkdir()
                    ini=folder/'test.ini';ini.write_text(f'[*]\nfit = off\nctx-size = {context+512}\nparallel = 1\n'
                        f'n-gpu-layers = 99\ndevice = {args.device}\nflash-attn = on\nbatch-size = {batch}\nubatch-size = {batch}\n'
                        f'cache-ram = 0\n\n[test]\nmodel = {model.as_posix()}\n',encoding='utf-8')
                    worker=h.h.helpers.Worker(binary,ini,folder);monitor=h.Monitor(worker.proc.pid)
                    run={'model':str(model),'context':context,'batch':batch,'samples':[]};r['runs'].append(run)
                    try:
                        worker.call('/models/load',{'model':'test'})
                        run['slots']=worker.call('/slots',{'model':'test'})
                        if context not in prompts:
                            text='Archive: '+('river stone forest planet window garden cloud bridge '*context)
                            lo,hi=1,len(text)
                            while lo<hi:
                                mid=(lo+hi)//2
                                n=len(worker.call('/tokenize',{'model':'test','content':text[:mid]})['tokens'])
                                if n<context:lo=mid+1
                                else:hi=mid
                            prompts[context]=text[:lo]
                        # Warm up the model before recording throughput.
                        worker.call('/completion',{'model':'test','prompt':'Say hello.','n_predict':8,'temperature':0})
                        for iteration in range(3):
                            started=time.perf_counter();first=None;final=None;chunks=[]
                            with worker.open('/completion',{'model':'test','prompt':prompts[context],'cache_prompt':False,
                                'n_predict':32,'temperature':0,'seed':1,'ignore_eos':True,'stream':True}) as response:
                                for line in response:
                                    if not line.startswith(b'data: ') or line[6:].strip()==b'[DONE]':continue
                                    event=json.loads(line[6:])
                                    if event.get('content'):
                                        if first is None:first=time.perf_counter()
                                        chunks.append(event['content'])
                                    if event.get('stop'):final=event
                            assert final and first and final['tokens_predicted']==32
                            assert final['timings']['cache_n']==0
                            run['samples'].append({'iteration':iteration,'ttft_ms':(first-started)*1000,
                                'timings':final['timings'],'output_sha256':hashlib.sha256(''.join(chunks).encode()).hexdigest()})
                            persist()
                        run['status']='complete'
                    finally:
                        monitor.close();run['sampled_peaks']=monitor.summary();run['memory_samples']=monitor.rows
                        worker.close();run['exit_code']=worker.proc.returncode;persist()
                    run['median_ttft_ms']=statistics.median(s['ttft_ms'] for s in run['samples'])
                    run['median_decode_tps']=statistics.median(s['timings']['predicted_per_second'] for s in run['samples'])
                    print(json.dumps({k:v for k,v in run.items() if k not in ['memory_samples','samples','slots']}),flush=True)
        r['status']='complete'
    except Exception as exc:r['status']='failed';r['error']=repr(exc);raise
    finally:persist()


if __name__=='__main__':main()
