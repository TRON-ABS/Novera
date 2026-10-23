"""Check growing conversations, concurrent slot reservations and cache deletion."""
import argparse
import hashlib
import importlib.util
import json
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import time

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--worker',type=Path,required=True)
parser.add_argument('--model',type=Path,required=True)
parser.add_argument('--output',type=Path,required=True)
args=parser.parse_args()
binary=args.worker.resolve(strict=True)
model=args.model.resolve(strict=True)
repo=Path(__file__).resolve().parent.parent
spec=importlib.util.spec_from_file_location('h',repo/'scripts/benchmark-engine-tuning.py')
h=importlib.util.module_from_spec(spec)
spec.loader.exec_module(h)
out=args.output.resolve()
out.mkdir(parents=True,exist_ok=False)
cache=out/'cache'
cache.mkdir()
ini=out/'test.ini'
ini.write_text(f'[*]\nctx-size = 8192\nparallel = 2\nkv-unified = false\nfit = off\nn-gpu-layers = 99\nflash-attn = on\nslot-save-path = {cache.as_posix()}/\n\n[a]\nmodel = {model.as_posix()}\n',encoding='utf-8')
worker=h.Worker(binary,ini,out,('--slot-cache-mib','4096'))
r={'worker_sha256':hashlib.sha256(binary.read_bytes()).hexdigest(),'samples':[]}
try:
    worker.call('/models/load',{'model':'a'})
    previous={}
    for i in range(4):
        for thread in ('A','B'):
            prompt=thread+': '+('stone river forest. '*80)+(' Continue this analysis.'*i)
            data=worker.call('/completion',{'model':'a','thread_id':thread,'id_slot':0,
                'cache_thread_slots':2,'prompt':prompt,'cache_prompt':True,'n_predict':16,'temperature':0})
            stats=data['timings']
            if i:
                assert stats['cache_n'] >= previous[thread]-8,stats
            previous[thread]=stats['cache_n']+stats['prompt_n']
            r['samples'].append({'thread':thread,'turn':i,'timings':stats})
    r['growing_threads_reuse_prefix']=True
    with worker.open('/completion',{'model':'a','thread_id':'A','id_slot':0,'cache_thread_slots':2,
        'prompt':'A: '+('stone river forest. '*80),'cache_prompt':True,
        'stream':True,'n_predict':256,'ignore_eos':True,'temperature':0}) as response:
        for line in response:
            if line.startswith(b'data: ') and line[6:].strip()!=b'[DONE]' and json.loads(line[6:]).get('content'): break
        with ThreadPoolExecutor(max_workers=1) as pool:
            future=pool.submit(worker.call,'/completion',{'model':'a','thread_id':'A','id_slot':0,
                'cache_thread_slots':2,'prompt':'A: '+('stone river forest. '*80),
                'cache_prompt':True,'n_predict':8,'temperature':0})
            b=worker.call('/completion',{'model':'a','thread_id':'B','id_slot':0,
                'cache_thread_slots':2,'prompt':'B: '+('stone river forest. '*80),
                'cache_prompt':True,'n_predict':8,'temperature':0})
            assert b['tokens_predicted']>0
            time.sleep(.1)
            assert not future.done()
            response.close()
            assert future.result(timeout=15)['tokens_predicted']>0
    r['same_thread_serialized_while_other_thread_progresses']=True
    worker.call('/slots/state/erase',{'thread':'A'})
    worker.call('/completion',{'model':'a','thread_id':'C','id_slot':0,'cache_thread_slots':2,
                              'prompt':'C: hello','n_predict':8,'temperature':0})
    states=[json.loads(p.read_text()) for p in cache.glob('*.json')]
    assert not any(s['thread']=='A' for s in states)
    r['deleted_cache_not_recreated']=True
    r['status']='complete'
finally:
    worker.close()
    r['exit_code']=worker.proc.returncode
    (out/'results.json').write_text(json.dumps(r,indent=2),encoding='utf-8')
    print(json.dumps(r,indent=2))
