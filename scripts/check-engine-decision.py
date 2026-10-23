"""Native decision-model text/vision regression, with synthetic local images."""
import argparse
import base64
import hashlib
import importlib.util
import json
import math
from pathlib import Path
import urllib.error

spec=importlib.util.spec_from_file_location('decision_worker_helpers',Path(__file__).with_name('benchmark-engine-load-lock.py'))
h=importlib.util.module_from_spec(spec);spec.loader.exec_module(h)


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--worker',type=Path,required=True)
    parser.add_argument('--model',type=Path,required=True)
    parser.add_argument('--projector',type=Path,required=True)
    parser.add_argument('--fixtures',type=Path,required=True)
    parser.add_argument('--output',type=Path,required=True)
    args=parser.parse_args()
    binary=args.worker.resolve(strict=True);model=args.model.resolve(strict=True);projector=args.projector.resolve(strict=True)
    out=args.output.resolve();out.mkdir(parents=True,exist_ok=False)
    ini=out/'test.ini';ini.write_text('[*]\nfit = off\nctx-size = 4096\nparallel = 1\n'
        'n-gpu-layers = 99\nflash-attn = on\nbatch-size = 512\nubatch-size = 512\n'
        f'\n[decision]\nmodel = {model.as_posix()}\nmmproj = {projector.as_posix()}\n',encoding='utf-8')
    r={'worker_sha256':hashlib.sha256(binary.read_bytes()).hexdigest(),'model':str(model),
       'projector':str(projector),'checks':[]}
    worker=h.Worker(binary,ini,out)
    text={'model':'decision','state':'Please refund the duplicate charge.',
          'questions':{'refund':{'type':'noul','instructions':'Is a refund requested?'},
             'category':{'type':'choice','instructions':'What is the request about?',
                         'criteria':{'refund':'Request for a refund','other':'Other request'}},
             'urgency':{'type':'score','instructions':'How urgent is this request?',
                        'criteria':['No urgency','Some urgency','Very urgent']}}}
    def persist():(out/'results.json').write_text(json.dumps(r,indent=2),encoding='utf-8')
    def check_usage(answer):
        assert answer['usage']['input_tokens']>0 and answer['usage']['output_tokens']==0
    try:
        answer=worker.call('/v1/systemone',text);check_usage(answer)
        assert answer['answers']['refund']['noul']>0.5
        assert answer['answers']['category']['choice']=='refund'
        score=answer['answers']['urgency']['score'];assert math.isfinite(score) and 0<=score<=2
        r['checks'].append({'name':'text-three-decision-types','passed':True,'response':answer});persist()
        questions={'color':{'type':'choice','instructions':'Which color covers most of the image?',
                            'criteria':{'red':'Red','blue':'Blue','green':'Green'}}}
        for color in ['red','blue','red']:
            image=(args.fixtures/f'{color}.png').read_bytes()
            body={'model':'decision','state':None,'images':['data:image/png;base64,'+base64.b64encode(image).decode()],
                  'questions':questions}
            answer=worker.call('/v1/systemone',body);check_usage(answer)
            assert answer['answers']['color']['choice']==color
            r['checks'].append({'name':f'{color}-image','passed':True,'fixture_sha256':hashlib.sha256(image).hexdigest(),'response':answer});persist()
        try:
            worker.call('/v1/systemone',{'model':'decision','state':None,'images':['data:image/png;base64,not-valid-base64!!!'],'questions':questions})
            raise AssertionError('invalid image unexpectedly accepted')
        except urllib.error.HTTPError as exc:
            error=json.loads(exc.read());assert 400<=exc.code<600
            r['checks'].append({'name':'invalid-image-structured-error','status':exc.code,'passed':True,'response':error})
        answer=worker.call('/v1/systemone',text);check_usage(answer)
        assert answer['answers']['refund']['noul']>0.5
        r['checks'].append({'name':'healthy-after-invalid-image','passed':True,'response':answer})
        r['status']='complete'
    except Exception as exc:r['status']='failed';r['error']=repr(exc);raise
    finally:
        worker.close();r['exit_code']=worker.proc.returncode;persist()
        print(json.dumps({'status':r.get('status'),'checks':len(r['checks']),'error':r.get('error'),'exit_code':r['exit_code']}),flush=True)


if __name__=='__main__':main()
