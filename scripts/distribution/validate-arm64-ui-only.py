"""Fast native ARM64 UI lane using the exact reviewed installer; no update mocks."""
import importlib.util,json,os,subprocess,sys,tempfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('native_validation',Path(__file__).with_name('validate-installed-update.py'))
native=importlib.util.module_from_spec(spec);spec.loader.exec_module(native)

def main():
    base=native.require_ci()
    if sys.platform!='win32' or os.environ.get('RUNNER_ARCH')!='ARM64':raise RuntimeError('Native Windows ARM64 runner required')
    selected=json.loads((ROOT/'scripts/distribution/validation-assets.json').read_text())['platforms']['windows-aarch64']
    scratch=Path(tempfile.mkdtemp(prefix='novera-arm64-ui-install-',dir=base))
    bundle=scratch/selected['bundle']['name'];signature=scratch/selected['signature']['name']
    native.download(selected['bundle'],bundle);native.download(selected['signature'],signature)
    code='''import fs from "node:fs";import {verifyUpdateBundle} from "./scripts/distribution/ci-check-updater.mjs"; const key=JSON.parse(fs.readFileSync("src-tauri/tauri.updater.conf.json")).plugins.updater.pubkey;console.log(JSON.stringify(await verifyUpdateBundle(process.argv[1],fs.readFileSync(process.argv[2],"utf8"),key)));'''
    checked=json.loads(subprocess.check_output(['node','--input-type=module','-e',code,str(bundle),str(signature)],cwd=ROOT,text=True))
    if checked['sha256']!=selected['bundle']['sha256']:raise RuntimeError('Signed installer mismatch')
    env={k:v for k,v in os.environ.items() if not any(s in k.upper() for s in ['TOKEN','PASSWORD','SECRET','PRIVATE_KEY'])}
    target=scratch/'installed'
    subprocess.run([str(bundle),'/S','/CURRENTUSER','/D='+str(target)],env=env,check=True,timeout=600)
    exe=target/'Novera-Desktop.exe'
    if native.digest(exe)!='dc95403cbd8ba4193f330d504f9dacccc04b524694affb189aa9eb291e8cbce0':raise RuntimeError('Installed ARM64 executable differs from the reviewed runtime')
    out=ROOT/'.build/validation';out.mkdir(parents=True,exist_ok=True)
    (out/'UI-INSTALLATION.json').write_text(json.dumps({'platform':'windows-aarch64','installerSha256':checked['sha256'],'executableSha256':native.digest(exe),'signatureVerified':True,'sourceCommit':os.environ['GITHUB_SHA']},indent=2)+'\n')
    subprocess.run(['node',str(ROOT/'scripts/distribution/validate-windows-update-ui.mjs'),str(exe)],cwd=ROOT,env=env,check=True,timeout=180)

if __name__=='__main__':main()
