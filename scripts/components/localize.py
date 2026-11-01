"""Draft public UI strings only; never sends user content or credentials.

Machine translations require editorial review. Regional drafts live alongside
this script and follow the existing catalogs' scripts and dialect conventions.
"""
import concurrent.futures
import json
from pathlib import Path
import re
import sys
import time
import urllib.parse
import urllib.request

ROOT=Path(__file__).resolve().parents[2]
CACHE=ROOT/'.build/components/translations'
SOURCE={
 'title':'Local components',
 'note':'Install only the components you need. Novera keeps Python environments separate. Cloud services need no local installation.',
 'estimates':'Estimated download: {{download}} · Required disk space: {{space}} · Available disk space: {{free}}',
 'confirm':'Install this private environment? Only the selected components will be downloaded. Their publishers’ licences apply.',
 'removeConfirm':'Remove this managed environment? Your models, creations and conversations will be kept.',
 'verify':'Verify', 'repair':'Repair', 'uninstall':'Uninstall', 'missing':'Not installed',
 'managed':'Managed by Novera',
 'external':'An optional external Python path overrides the managed profile. Clear it to use Novera’s environment.',
 'failed':'The component operation failed. Check the network, disk space and access rights, then retry or repair.',
 'required':'Prepare and verify the required local components in Novera · Configurations.',
 'updateAvailable':'Update available', 'update':'Update', 'rollback':'Restore previous environment',
 'busy':'Unload local models and wait for generations to finish before changing components.',
}
REGIONAL={'aec','apc','apd','arq','ary','arz','pcm','skr','cjy','hak','hsn','nan','wuu'}

def load(path):return json.loads(path.read_text(encoding='utf-8'))
def save(path,value):path.parent.mkdir(parents=True,exist_ok=True);path.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

ALIASES={'vn':'vi','de-DE':'de','fa-IR':'fa','pt-BR':'pt','pt-PT':'pt-PT','kmr':'ku','uzn':'uz','pbu':'ps','gaz':'om','prs':'fa-AF','pnb':'pa-Arab'}
def translate(sources,code):
    result={}
    for source in sources:
        literals=[]
        def protect(match):
            literals.append(match[0]);return '{{NOVERA_'+str(len(literals)-1).zfill(4)+'}}'
        prepared=re.sub(r'\{\{\w+\}\}|\b(?:Novera|Python|PyTorch|GGUF)\b',protect,source)
        url='https://translate.googleapis.com/translate_a/single?'+urllib.parse.urlencode({'client':'gtx','sl':'en','tl':ALIASES.get(code,code),'dt':'t','q':prepared})
        for attempt in range(4):
            try:
                with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Novera-UI-localization/1.0'}),timeout=35) as response:
                    raw=json.load(response)
                value=''.join(part[0] or '' for part in raw[0])
                for i,literal in enumerate(literals):
                    marker='{{NOVERA_'+str(i).zfill(4)+'}}'
                    pattern=r'\s*'.join(re.escape(c) for c in marker)
                    value,n=re.subn(pattern,lambda _:literal,value,flags=re.I)
                    if n!=1:raise ValueError('Translation changed a protected token')
                if sorted(re.findall(r'\{\{\w+\}\}',source))!=sorted(re.findall(r'\{\{\w+\}\}',value)):raise ValueError('Translation changed variables')
                result[source]=value;break
            except Exception:
                if attempt==3:raise
                time.sleep(2**attempt)
    return result

def fetch():
    def one(entry):
        code=entry['locale'];path=CACHE/f'{code}.json'
        if code in REGIONAL:return
        if code=='en':save(path,SOURCE);return
        if path.exists() and '--refresh-estimates' not in sys.argv:
            data=load(path);missing=[key for key in SOURCE if key not in data]
            if not missing:return
            translated=translate([SOURCE[key] for key in missing],code)
            data.update({key:translated[SOURCE[key]] for key in missing});save(path,data);return
        if path.exists() and '--refresh-estimates' in sys.argv:
            data=load(path);data['estimates']=translate([SOURCE['estimates']],code)[SOURCE['estimates']];save(path,data);return
        values=translate(list(SOURCE.values()),code)
        save(path,{key:values[value] for key,value in SOURCE.items()})
        print(code,'drafted',flush=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
        jobs={pool.submit(one,entry):entry['locale'] for entry in load(ROOT/'docs/language-support.json')}
        for job in concurrent.futures.as_completed(jobs):
            try:job.result()
            except Exception as exc:print(jobs[job],str(exc),flush=True)

def apply():
    regional=load(ROOT/'scripts/components/regional.json')
    inventory=load(ROOT/'docs/language-support.json')
    drafts={entry['locale']:regional.get(entry['locale']) or load(CACHE/f"{entry['locale']}.json") for entry in inventory}
    drafts['fr'].update(repair='Réparer',update='Mettre à jour',external="Un chemin Python externe facultatif remplace le profil géré. Effacez-le pour utiliser l’environnement de Novera.",removeConfirm='Désinstaller cet environnement géré ? Vos modèles, créations et conversations seront conservés.')
    for code,draft in drafts.items():
        assert draft.keys()==SOURCE.keys(),code
        for key,value in draft.items():
            assert sorted(re.findall(r'\{\{\w+\}\}',value))==sorted(re.findall(r'\{\{\w+\}\}',SOURCE[key])),(code,key)
        path=ROOT/f'web-app/src/locales/{code}/common.json';data=load(path);data['components']=draft;save(path,data)
        # Version-specific wording is now advanced-only; both Python ABIs are supported.
        path=ROOT/f'web-app/src/locales/{code}/chat.json';data=load(path)
        for key in ['localNote','ggufNote','nativeNote']:
            data['creation'][key]=re.sub(r'\s*3\.15\.1','',data['creation'][key])
        data['creation']['upscaleMissing']=draft['required']
        save(path,data)
        path=ROOT/f'web-app/src/locales/{code}/hub.json';data=load(path)
        data['catalog']['pythonNote']=draft['required'];data['catalog']['tipRuntime']=draft['required'];save(path,data)
    def count(x):return 1 if isinstance(x,str) else sum(map(count,x.values()))
    total=sum(count(load(p)) for p in (ROOT/'web-app/src/locales/en').glob('*.json'))
    for entry in inventory:entry['keys']=total;entry['total']=total
    save(ROOT/'docs/language-support.json',inventory)
    print('Applied',len(drafts),'locales;',total,'keys each')

if __name__=='__main__':
    if '--probe' in sys.argv:print(translate([SOURCE['title'],SOURCE['estimates']],'fr'))
    if '--fetch' in sys.argv:fetch()
    if '--apply' in sys.argv:apply()
