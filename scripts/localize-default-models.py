"""Draft only public model-card copy; no user content or credentials are sent.
Machine translations and regional drafts need native editorial review.
"""
import concurrent.futures, hashlib, importlib.util, json, re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('components_localize',ROOT/'scripts/components/localize.py')
translator=importlib.util.module_from_spec(spec);spec.loader.exec_module(translator)
SOURCE={
 'setupOmniNote':'Default on desktop and mobile. A compact model for text, images and audio, using the required {{projector}} file. Download: about {{size}} for both files. Choose it for a lighter multimodal setup. Voice features depend on the platform and engine. A longer context uses more memory.',
 'setupTextNote':'Text-only alternative for conversation, writing, tools and structured answers. Download: about {{size}}. It requires more memory than {{defaultModel}} and does not process images or audio itself. Spoken replies use the system voice. Choose it for text tasks when you have enough memory. Check factual answers with sources.',
}
CACHE=ROOT/'.build/default-model-localization'/hashlib.sha256(json.dumps(SOURCE).encode()).hexdigest()[:12]

def save(path,value):
 path.parent.mkdir(parents=True,exist_ok=True);path.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
def load(path):return json.loads(path.read_text(encoding='utf8'))

def main():
 regional=load(ROOT/'scripts/default-model-regional.json')
 entries=load(ROOT/'docs/language-support.json')
 failures=[]
 def one(entry):
  code=entry['locale'];path=CACHE/(code+'.json')
  if path.exists():return
  if code in regional:save(path,regional[code]);return
  if code=='en':save(path,SOURCE);return
  if code=='fr':
   save(path,{
    'setupOmniNote':'Modèle par défaut sur ordinateur et mobile. Ce modèle compact traite le texte, les images et l’audio avec le fichier {{projector}} requis. Téléchargement : environ {{size}} pour les deux fichiers. Choisissez-le pour une configuration multimodale plus légère. Les fonctions vocales dépendent de la plateforme et du moteur. Un contexte plus long utilise davantage de mémoire.',
    'setupTextNote':'Alternative texte pour discuter, rédiger, utiliser des outils et produire des réponses structurées. Téléchargement : environ {{size}}. Ce modèle demande plus de mémoire que {{defaultModel}} et ne traite pas lui-même les images ou l’audio. La lecture des réponses utilise la voix système. Choisissez-le pour les tâches textuelles si vous disposez de suffisamment de mémoire. Vérifiez les informations factuelles avec des sources.'});return
  target={'pbt':'ps','fuv':'ff'}.get(code,code)
  try:
   values=translator.translate(list(SOURCE.values()),target)
   draft={key:values[value] for key,value in SOURCE.items()}
  except Exception:
   # Split around interpolation tokens if the translation service mutates them.
   # The tokens themselves are never translated or dropped.
   draft={}
   for key,source in SOURCE.items():
    pieces=re.split(r'(\{\{\w+\}\})',source)
    result=[]
    for piece in pieces:
     if not piece or piece.startswith('{{'):result.append(piece);continue
     translated=translator.translate([piece.strip()],target)[piece.strip()]
     result.append((' ' if piece.startswith(' ') else '')+translated+(' ' if piece.endswith(' ') else ''))
    draft[key]=''.join(result)
  save(path,draft)
 with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
  jobs={pool.submit(one,e):e['locale'] for e in entries}
  for job in concurrent.futures.as_completed(jobs):
   try:job.result()
   except Exception as error:failures.append(jobs[job]);print('FAILED',jobs[job],str(error),flush=True)
 if failures:raise SystemExit('Missing translations: '+','.join(failures))
 for entry in entries:
  code=entry['locale'];draft=load(CACHE/(code+'.json'))
  assert draft.keys()==SOURCE.keys(),code
  for key,value in draft.items():assert sorted(re.findall(r'\{\{\w+\}\}',value))==sorted(re.findall(r'\{\{\w+\}\}',SOURCE[key])),(code,key)
  path=ROOT/f'web-app/src/locales/{code}/chat.json';data=load(path)
  data['creation'].update(draft)
  data['creation']['setupAllNote']=data['creation']['setupAllNote'].replace('Nemotron','LFM3-Omni + mmproj')
  save(path,data)
 def count(x):return 1 if isinstance(x,str) else sum(count(v) for v in x.values())
 total=sum(count(load(p)) for p in (ROOT/'web-app/src/locales/en').glob('*.json'))
 for entry in entries:entry['keys']=total;entry['total']=total
 save(ROOT/'docs/language-support.json',entries)
 print('Applied',len(entries),'catalogs;',total,'keys each',flush=True)
if __name__=='__main__':main()
