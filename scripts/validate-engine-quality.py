"""Grade real repository editing/export tasks with baseline and speculative decoding.

Outputs are parsed/compared as data; generated code is never executed.
"""
import argparse
import ast
import hashlib
import importlib.util
import json
from pathlib import Path
import statistics
import time

spec = importlib.util.spec_from_file_location('quality_helpers', Path(__file__).with_name('benchmark-engine-tuning.py'))
helpers = importlib.util.module_from_spec(spec)
spec.loader.exec_module(helpers)


def tasks(repo):
    predefined = (repo/'web-app/src/lib/predefined.ts').read_text(encoding='utf-8')
    settings = predefined[predefined.index('  ngram_speculation:'):predefined.index('  performance_mode:')]
    profile = (repo/'extensions/llamacpp-extension/src/performance-profile.ts').read_text(encoding='utf-8')
    condition = profile[profile.index('  if ('):profile.index('  const requiredFree')]
    py = (repo/'scripts/benchmark-thread-affinity.py').read_text(encoding='utf-8')
    function = py[py.index('def process_memory('):py.index('\ndef main(')].strip()
    rows = json.loads((repo/'deliverables/engine-improvements-2026-10-22/thread-affinity.json').read_text())['summary']
    export = [{'slots':x['slots'],'tokens':x['size'],'ttft_ms':round(x['median_ttft_ms'],1)} for x in rows]
    table = '| Tokens | TTFT, un slot | TTFT, deux slots |\n| ---: | ---: | ---: |\n' + '\n'.join(
        f"| {x['tokens']} | {x['ttft_ms']} ms | {export[i+3]['ttft_ms']} ms |" for i,x in enumerate(export[:3]))
    return [
        {'id':'setting-label-edit','source':'web-app/src/lib/predefined.ts',
         'instruction':'Replace only the title string Repetitive text acceleration with Repetitive text acceleration (experimental). Preserve every other character. Return only the edited source.',
         'input':settings,'expected':settings.replace("title: 'Repetitive text acceleration'", "title: 'Repetitive text acceleration (experimental)'"),'grade':'exact'},
        {'id':'engine-pin-edit','source':'extensions/llamacpp-extension/src/performance-profile.ts',
         'instruction':'Replace only the engine version literal b11721 with b11722. Preserve the other source lines. Return only the edited source.',
         'input':condition,'expected':condition.replace('b11721','b11722'),'grade':'exact'},
        {'id':'python-parameter-rename','source':'scripts/benchmark-thread-affinity.py',
         'instruction':'Rename the function parameter pid to process_id and update its reference inside this function. Make no other semantic changes. Return only the edited Python source.',
         'input':function,'expected':function.replace('process_memory(pid)', 'process_memory(process_id)').replace('False, pid)', 'False, process_id)'),'grade':'python-ast'},
        {'id':'benchmark-json-export','source':'deliverables/engine-improvements-2026-10-22/thread-affinity.json',
         'instruction':'Export these six benchmark rows as a JSON array in the same order. For each row output only slots, tokens (renamed from size), and ttft_ms (median_ttft_ms rounded to one decimal). No commentary.',
         'input':json.dumps(rows),'expected':export,'grade':'json'},
        {'id':'benchmark-table-export','source':'deliverables/engine-improvements-2026-10-22/thread-affinity.json',
         'instruction':'Change only every unit ms to milliseconds in this Markdown table. Preserve all numbers, rows and columns. Return only the edited table.',
         'input':table,'expected':table.replace(' ms',' milliseconds'),'grade':'table'},
        {'id':'preset-batch-edit','source':'local engine preset',
         'instruction':'In this INI preset change only batch-size and ubatch-size from 512 to 2048. Preserve all sections and other values, including ctx-size, parallel and model. Return only the edited INI.',
         'input':'[*]\nfit = off\nctx-size = 8192\nparallel = 1\nflash-attn = on\nbatch-size = 512\nubatch-size = 512\ncache-type-k = f16\ncache-type-v = f16\n\n[Tron]\nmodel = C:/models/Tron-v1-Q6_K.gguf\n',
         'expected':'[*]\nfit = off\nctx-size = 8192\nparallel = 1\nflash-attn = on\nbatch-size = 2048\nubatch-size = 2048\ncache-type-k = f16\ncache-type-v = f16\n\n[Tron]\nmodel = C:/models/Tron-v1-Q6_K.gguf\n','grade':'exact'},
    ]


def clean(text):
    text=text.strip()
    if text.startswith('```') and text.endswith('```'):
        text=text.split('\n',1)[1].rsplit('```',1)[0].strip()
    return text


def grade(task,text):
    try:
        actual=clean(text)
        expected=task['expected']
        if task['grade']=='json': return json.loads(actual)==expected
        if task['grade']=='python-ast': return ast.dump(ast.parse(actual))==ast.dump(ast.parse(expected))
        if task['grade']=='table':
            normalize=lambda s:[x.strip() for x in s.splitlines() if x.strip()]
            return normalize(actual)==normalize(expected)
        # Indentation differences are not edits to code values; preserve line order/content.
        normalize=lambda s:[x.strip() for x in s.strip().splitlines()]
        return normalize(actual)==normalize(expected)
    except (ValueError,SyntaxError): return False


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--worker',type=Path,required=True)
    parser.add_argument('--model',type=Path,required=True)
    parser.add_argument('--output',type=Path,required=True)
    parser.add_argument('--method',choices=['ngram','mtp'],default='ngram')
    parser.add_argument('--repeats',type=int,default=3)
    args=parser.parse_args()
    repo=Path(__file__).resolve().parent.parent
    binary=args.worker.resolve(strict=True);model=args.model.resolve(strict=True)
    out=args.output.resolve();out.mkdir(parents=True,exist_ok=False)
    work=tasks(repo)
    (out/'tasks.json').write_text(json.dumps(work,indent=2),encoding='utf-8')
    report={'worker_sha256':hashlib.sha256(binary.read_bytes()).hexdigest(),
            'model':str(model),'model_sha256':hashlib.sha256(model.read_bytes()).hexdigest(),
            'method':args.method,'samples':[],'runs':[], 'output_token_limit':1536,
            'grading':'Task-specific expected output; AST parsing without execution; code line indentation normalized.',
            'limits':['Six repository tasks; no general-purpose language/quality certification.',
                      'Greedy decoding; numerical divergence may change selected tokens.',
                      'Reasoning is explicitly prefilled empty for this direct-editing workload.']}
    prompts={}
    def persist(): (out/'results.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
    try:
        # Alternate mode order to reduce drift; fresh worker each round avoids cache carryover.
        for repeat in range(args.repeats):
            for enabled in ([False,True] if repeat%2==0 else [True,False]):
                name=args.method if enabled else 'baseline'
                folder=out/f'{repeat:02}-{name}';folder.mkdir()
                settings=''
                if enabled:
                    settings=('spec-type = draft-mtp\nspec-draft-n-max = 3\n' if args.method=='mtp' else
                        'spec-type = ngram-map-k\nspec-draft-n-max = 8\nspec-ngram-map-k-size-n = 3\nspec-ngram-map-k-size-m = 8\n')
                ini=folder/'test.ini'
                ini.write_text('[*]\nfit = off\nctx-size = 8192\nparallel = 1\nn-gpu-layers = 99\nflash-attn = on\n'
                    'batch-size = 2048\nubatch-size = 2048\ncache-ram = 0\n'+settings+f'\n[test]\nmodel = {model.as_posix()}\n',encoding='utf-8')
                worker=helpers.Worker(binary,ini,folder)
                run={'repeat':repeat,'profile':name};report['runs'].append(run)
                try:
                    worker.call('/models/load',{'model':'test'})
                    run['slots']=worker.call('/slots',{'model':'test'})
                    assert bool(run['slots'][0]['speculative'])==enabled
                    for task in work:
                        if task['id'] not in prompts:
                            formatted=worker.call('/apply-template',{'model':'test','messages':[
                                {'role':'user','content':task['instruction']+'\n\n'+task['input']}],
                                'chat_template_kwargs':{'enable_thinking':False},'add_generation_prompt':True})['prompt']
                            if formatted.rstrip().endswith('<think>'): formatted+='</think>\n\n'
                            prompts[task['id']]=formatted
                        start=time.perf_counter();first=None;chunks=[];final=None
                        with worker.open('/completion',{'model':'test','prompt':prompts[task['id']],
                            'n_predict':1536,'temperature':0,'seed':repeat+1,'cache_prompt':False,'stream':True}) as response:
                            for line in response:
                                if not line.startswith(b'data: ') or line[6:].strip()==b'[DONE]':continue
                                event=json.loads(line[6:])
                                if event.get('error'):raise RuntimeError(event)
                                if event.get('content'):
                                    if first is None:first=time.perf_counter()
                                    chunks.append(event['content'])
                                if event.get('stop'):final=event
                        assert final is not None and first is not None
                        content=''.join(chunks)
                        (folder/f"{task['id']}.txt").write_text(content,encoding='utf-8')
                        sample={'repeat':repeat,'profile':name,'task':task['id'],'passed':grade(task,content),
                                'output_sha256':hashlib.sha256(content.encode()).hexdigest(),
                                'prompt_sha256':hashlib.sha256(prompts[task['id']].encode()).hexdigest(),
                                'ttft_ms':(first-start)*1000,'total_ms':(time.perf_counter()-start)*1000,
                                'timings':final['timings'],'tokens_predicted':final['tokens_predicted'],
                                'stop_type':final.get('stop_type'),'truncated':final.get('truncated')}
                        report['samples'].append(sample);persist()
                        print(json.dumps({k:sample[k] for k in ['repeat','profile','task','passed','tokens_predicted']}),flush=True)
                    run['status']='complete'
                finally:
                    worker.close();run['exit_code']=worker.proc.returncode;persist()
        report['summary']=[]
        for name in ['baseline',args.method]:
            rows=[x for x in report['samples'] if x['profile']==name]
            drafted=sum(x['timings'].get('draft_n',0) for x in rows)
            accepted=sum(x['timings'].get('draft_n_accepted',0) for x in rows)
            report['summary'].append({'profile':name,'n':len(rows),'passed':sum(x['passed'] for x in rows),
                'median_decode_tps':statistics.median(x['timings']['predicted_per_second'] for x in rows),
                'median_total_ms':statistics.median(x['total_ms'] for x in rows),'drafted':drafted,'accepted':accepted,
                'acceptance':accepted/drafted if drafted else None})
        report['comparisons']=[]
        for task in work:
            a=[x for x in report['samples'] if x['task']==task['id'] and x['profile']=='baseline']
            b=[x for x in report['samples'] if x['task']==task['id'] and x['profile']==args.method]
            report['comparisons'].append({'task':task['id'], 'baseline_passed':sum(x['passed'] for x in a),
                'speculative_passed':sum(x['passed'] for x in b),'baseline_unique_outputs':len({x['output_sha256'] for x in a}),
                'speculative_unique_outputs':len({x['output_sha256'] for x in b}),
                'identical_pairs':sum(x['output_sha256']==y['output_sha256'] for x,y in zip(a,b))})
        report['status']='complete'
    except Exception as exc:
        report['status']='failed';report['error']=repr(exc);raise
    finally:persist()


if __name__=='__main__':main()
