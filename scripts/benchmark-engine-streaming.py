"""Measure real SSE framing, pacing and completion cost. Never renders the UI.

Use --worker for an isolated direct engine, or --app-secret for a prepared Jan
test profile. The latter file is private and its key is never saved in results.
Direct/app comparisons use separate processes, not simultaneous requests.
"""
import argparse
import hashlib
import importlib.util
import json
from pathlib import Path
import statistics
import time
import urllib.request
import urllib.error


def percentile(values, q):
    values=sorted(values)
    return values[min(len(values)-1, int((len(values)-1)*q))] if values else None


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--worker',type=Path)
    p.add_argument('--model',type=Path)
    p.add_argument('--app-secret',type=Path)
    p.add_argument('--output',type=Path,required=True)
    p.add_argument('--repeats',type=int,default=3)
    args=p.parse_args()
    if bool(args.worker)==bool(args.app_secret):p.error('choose worker or app-secret')
    if args.worker and not args.model:p.error('--model is required with --worker')
    if args.repeats<1:p.error('--repeats must be positive')
    out=args.output.resolve();out.mkdir(parents=True,exist_ok=False)
    r={'samples':[],'checks':[],'status':'running','mode':'app' if args.app_secret else 'direct',
       'limitations':['Loopback Windows, one GPU/model; no UI render timings.',
       'Direct and app are separate runs; differences include scheduling and frequency drift.',
       'Client event timestamps are not TCP packet timestamps.',
       'Wall time minus native timers is a residual, not an isolated transport timer.']}
    worker=None
    def save():(out/'results.json').write_text(json.dumps(r,indent=2),encoding='utf-8')
    try:
        if args.worker:
            spec=importlib.util.spec_from_file_location('workers',Path(__file__).with_name('benchmark-engine-load-lock.py'))
            mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
            model=args.model.resolve(strict=True);binary=args.worker.resolve(strict=True)
            ini=out/'preset.ini'
            ini.write_text('[*]\nfit = off\nctx-size = 8192\nparallel = 1\nkv-unified = true\n'
                'batch-size = 2048\nubatch-size = 2048\ncache-type-k = f16\ncache-type-v = f16\n'
                'n-gpu-layers = 99\nflash-attn = on\ncache-ram = 0\n\n[Tron-update]\n'
                f'model = {model.as_posix()}\nload-on-startup = false\n',encoding='utf-8')
            worker=mod.Worker(binary,ini,out)
            base=worker.base;key=worker.key
            r['worker_sha256']=hashlib.sha256(binary.read_bytes()).hexdigest()
            worker.call('/models/load',{'model':'Tron-update'})
        else:
            secret=json.loads(args.app_secret.read_text())
            base=f"http://127.0.0.1:{secret['port']}";key=secret['key']
            deadline=time.monotonic()+90
            while True:
                try:
                    req=urllib.request.Request(base+'/v1/models',headers={'Authorization':'Bearer '+key})
                    with urllib.request.build_opener(urllib.request.ProxyHandler({})).open(req,timeout=5) as f:
                        models=json.load(f)
                    if any(x['id']=='Tron-update' for x in models['data']):break
                except Exception:
                    if time.monotonic()>deadline:raise
                if time.monotonic()>deadline:raise TimeoutError('app model registration')
                time.sleep(.5)

        def request(prompt, tokens, stream, delay=0, cancel_after=None, read_size=None):
            body={'model':'Tron-update','prompt':prompt,'max_tokens':tokens,'temperature':0,
                  'seed':42,'ignore_eos':True,'cache_prompt':False,'stream':stream,
                  'stream_options':{'include_usage':True}}
            raw=json.dumps(body,ensure_ascii=False).encode()
            req=urllib.request.Request(base+'/v1/completions',data=raw,
                headers={'Authorization':'Bearer '+key,'Content-Type':'application/json'})
            start=time.perf_counter();times=[];texts=[];events=[];wire=0;done=0;timings=None;usage=None
            with urllib.request.build_opener(urllib.request.ProxyHandler({})).open(req,timeout=120) as f:
                header=time.perf_counter()
                if not stream:
                    data=f.read();wire=len(data);event=json.loads(data)
                    texts=[event['choices'][0]['text']];usage=event.get('usage');timings=event.get('timings')
                else:
                    pending=b''
                    # read1 observes available fragments; optional tiny reads exercise
                    # event/UTF-8 boundaries without decoding partial byte buffers.
                    while True:
                        chunk=f.read1(read_size or 65536)
                        if not chunk:break
                        wire+=len(chunk);pending+=chunk
                        while b'\n\n' in pending:
                            frame,pending=pending.split(b'\n\n',1)
                            lines=[line[6:] for line in frame.splitlines() if line.startswith(b'data: ')]
                            if not lines:continue
                            payload=b'\n'.join(lines)
                            if payload.strip()==b'[DONE]':done+=1;continue
                            event=json.loads(payload)
                            if 'error' in event:raise RuntimeError(event)
                            events.append(event)
                            if event.get('timings'):timings=event['timings']
                            if event.get('usage'):usage=event['usage']
                            text=''.join(c.get('text','') for c in event.get('choices',[]))
                            if text:
                                times.append(time.perf_counter());texts.append(text)
                                if delay:time.sleep(delay)
                            if cancel_after and len(texts)>=cancel_after:break
                        if cancel_after and len(texts)>=cancel_after:break
                    if not cancel_after:
                        assert not pending.strip(),repr(pending[:100])
                        assert done==1,done
                        assert usage and usage['completion_tokens']==tokens,usage
                        assert events and times
            end=time.perf_counter();content=''.join(texts)
            assert '\ufffd' not in content,'UTF-8 replacement in model output'
            gaps=[(b-a)*1000 for a,b in zip(times,times[1:])]
            native_ms=(timings or {}).get('prompt_ms',0)+(timings or {}).get('predicted_ms',0)
            return {'stream':stream,'tokens':tokens,'prompt_bytes':len(prompt.encode()),'request_bytes':len(raw),
                'header_ms':(header-start)*1000,'ttft_ms':(times[0]-start)*1000 if times else None,
                'total_ms':(end-start)*1000,'wire_bytes':wire,'content_bytes':len(content.encode()),
                'content_events':len(times),'done_events':done,'timings':timings,'usage':usage,
                'gap_p50_ms':percentile(gaps,.5),'gap_p95_ms':percentile(gaps,.95),
                'gap_max_ms':max(gaps,default=0),'gaps_below_1ms':sum(x<1 for x in gaps),
                'native_ms':native_ms,'residual_ms':(end-start)*1000-native_ms,
                'output_sha256':hashlib.sha256(content.encode()).hexdigest(),
                'event_bytes':[len(json.dumps(e,ensure_ascii=False).encode()) for e in events]}

        prompts={'short':'Continue this numbered list, using French words with accents and Chinese characters:\n1. été 中文\n2.',
                 'long':('A local assistant checks café, résumé, 中文 and 🙂.\n'*96)+'\nContinue the numbered list:\n1. été 中文\n2.'}
        request(prompts['short'],32,True) # warmup, excluded
        for repeat in range(args.repeats):
            for name,prompt in prompts.items():
                for tokens in [64,256]:
                    pair=[]
                    for stream in ([False,True] if repeat%2==0 else [True,False]):
                        sample=request(prompt,tokens,stream)
                        sample.update(repeat=repeat,prompt=name)
                        r['samples'].append(sample);pair.append(sample);save()
                        print(json.dumps({k:sample[k] for k in ['repeat','prompt','tokens','stream','ttft_ms','total_ms']}),flush=True)
                    assert pair[0]['output_sha256']==pair[1]['output_sha256'],'stream/nonstream output mismatch'
        slow=request(prompts['short'],64,True,delay=.02,read_size=7)
        normal=next(s for s in r['samples'] if s['prompt']=='short' and s['tokens']==64 and s['stream'])
        assert slow['output_sha256']==normal['output_sha256']
        r['checks'].append({'slow_fragmented_consumer':slow,'matches_normal_output':True})
        cancelled=request(prompts['short'],2048,True,cancel_after=8,read_size=1024)
        start=time.perf_counter();busy_retries=0
        while True:
            try:
                recovery=request(prompts['short'],16,True)
                break
            except urllib.error.HTTPError as exc:
                code=exc.code;exc.close()
                if code!=409 or time.perf_counter()-start>10:raise
                busy_retries+=1;time.sleep(.02)
        r['checks'].append({'cancel_after_content_events':cancelled['content_events'],
                            'recovery_total_ms':(time.perf_counter()-start)*1000,'busy_retries':busy_retries,
                            'healthy_after_cancel':bool(recovery['usage'])})
        r['summary']=[]
        for name in prompts:
            for tokens in [64,256]:
                for stream in [False,True]:
                    rows=[s for s in r['samples'] if s['prompt']==name and s['tokens']==tokens and s['stream']==stream]
                    row={'prompt':name,'tokens':tokens,'stream':stream,'n':len(rows)}
                    for field in ['ttft_ms','total_ms','native_ms','residual_ms','gap_p50_ms','gap_p95_ms','wire_bytes','content_events']:
                        values=[s[field] for s in rows if s[field] is not None]
                        row[field]=statistics.median(values) if values else None
                    r['summary'].append(row)
        r['status']='complete'
    except Exception as exc:
        r['status']='failed';r['error']=repr(exc);raise
    finally:
        if worker:worker.close();r['worker_exit_code']=worker.proc.returncode
        save()

if __name__=='__main__':main()
