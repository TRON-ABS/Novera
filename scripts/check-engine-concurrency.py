"""Native regression checks for load reservations, streaming and profile fallback."""
import argparse
from concurrent.futures import ThreadPoolExecutor
import importlib.util
import json
from pathlib import Path
import time
import urllib.error
import tempfile

spec = importlib.util.spec_from_file_location('jan_checks_helpers',
    Path(__file__).with_name('benchmark-engine-tuning.py'))
helpers = importlib.util.module_from_spec(spec)
spec.loader.exec_module(helpers)


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--worker',type=Path,required=True)
    parser.add_argument('--model',type=Path,required=True)
    parser.add_argument('--output',type=Path,required=True)
    args=parser.parse_args()
    binary=args.worker.resolve(strict=True)
    model=args.model.resolve(strict=True)
    out=args.output.resolve()
    out.mkdir(parents=True,exist_ok=False)
    preset=out/'checks.ini'
    initial=(f'[*]\nfit = off\nctx-size = 2048\nparallel = 1\ncache-ram = 0\n'
        f'\n[a]\nmodel = {model.as_posix()}\nn-gpu-layers = 99\n'
        f'\n[b]\nmodel = {model.as_posix()}\nn-gpu-layers = 0\nthreads = 4\n')
    preset.write_text(initial,encoding='utf-8')
    worker=helpers.Worker(binary,preset,out)
    report={'checks':[]}
    try:
        worker.call('/models/load',{'model':'a'})
        def load_b():
            try: return worker.call('/models/load',{'model':'b'})
            except urllib.error.HTTPError as exc:
                return {'http_status':exc.code,'body':exc.read().decode()}
        def status():
            return {m['id']:m['status']['value'] for m in worker.call('/models')['data']}
        with ThreadPoolExecutor(max_workers=2) as pool:
            for action in ('unload','reload'):
                worker.loading.clear()
                job=pool.submit(load_b)
                assert worker.loading.wait(20)
                assert status()['b']=='loading'
                if action=='unload': worker.call('/models/unload',{'model':'b'})
                else:
                    preset.write_text(initial.replace('threads = 4','threads = 3'),encoding='utf-8')
                    worker.call('/models/reload',{'preset_path':str(preset)})
                result=job.result(timeout=90)
                assert result.get('http_status')==400,result
                assert status()=={'a':'loaded','b':'unloaded'}
                report['checks'].append({'action':action,'late_result_rejected':True})
            before=(out/'worker.log').read_text().count('load_model: loading model')
            jobs=[pool.submit(load_b) for _ in range(2)]
            assert all(job.result(timeout=90)['status'] in ('loaded','already loaded') for job in jobs)
            after=(out/'worker.log').read_text().count('load_model: loading model')
            assert after-before==1,(before,after)
            report['checks'].append({'concurrent_duplicate_loads':2,'native_loads':1})

        with worker.open('/completion',{'model':'a','prompt':'Count from one to one thousand.',
            'n_predict':256,'ignore_eos':True,'temperature':0,'stream':True}) as response:
            for line in response:
                if line.startswith(b'data: ') and line[6:].strip()!=b'[DONE]' and json.loads(line[6:]).get('content'):
                    break
            a=next(m for m in worker.call('/models')['data'] if m['id']=='a')
            assert a['busy'] is True
            try:
                worker.call('/models/unload',{'model':'a'})
                raise AssertionError('unload accepted an active stream')
            except urllib.error.HTTPError as exc:
                assert exc.code==409
                exc.close()
        deadline=time.monotonic()+10
        while time.monotonic()<deadline:
            a=next(m for m in worker.call('/models')['data'] if m['id']=='a')
            if not a['busy']: break
            time.sleep(.05)
        assert not a['busy']
        report['checks'].append({'stream_busy_until_cancelled':True,'unload_busy_http':409})

        worker.call('/models/unload',{'model':'b'})
        # A deterministic native parameter failure exercises the same recovery
        # branch as a failed memory allocation, without intentionally exhausting VRAM.
        fallback=(f'[*]\nfit = off\nctx-size = 2048\nparallel = 1\nn-gpu-layers = 99\n'
            f'\n[a]\nmodel = {model.as_posix()}\n'
            '# jan-measured-performance: 512,512\n'
            'batch-size = 2048\nubatch-size = invalid-calibration\n')
        worker.call('/models/unload',{'model':'a'})
        preset.write_text(fallback,encoding='utf-8')
        worker.call('/models/reload',{'preset_path':str(preset)})
        worker.call('/models/load',{'model':'a'})
        assert status()=={'a':'loaded'}
        assert 'invalid-calibration' in preset.read_text()
        assert not list(Path(tempfile.gettempdir()).glob(f'jan-performance-{worker.proc.pid}-*.ini'))
        answer=worker.call('/completion',{'model':'a','prompt':'Say hello.','n_predict':8,'temperature':0})
        assert answer['tokens_predicted']>0
        report['checks'].append({'manual_fallback_after_native_failure':True,'preset_unchanged':True,
                                 'temporary_preset_cleaned':True})
        report['status']='complete'
    except Exception as exc:
        report['status']='failed'
        report['error']=repr(exc)
        raise
    finally:
        worker.close()
        report['exit_code']=worker.proc.returncode
        (out/'results.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
        print(json.dumps(report,indent=2),flush=True)


if __name__=='__main__': main()
