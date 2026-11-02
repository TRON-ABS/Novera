"""Operational transfer of unchanged, reviewed assets between Novera releases."""
import hashlib,http.client,json,os,urllib.request,urllib.parse
from pathlib import Path

repo='repos/TRON-ABS/Novera'
source=431053174
destination=431069327
token=os.environ['GH_TOKEN']

def api(path):
    request=urllib.request.Request('https://api.github.com/'+repo+path,headers={'Authorization':'Bearer '+token,'Accept':'application/vnd.github+json','User-Agent':'Novera-release-staging'})
    with urllib.request.urlopen(request,timeout=60) as response:return json.load(response)

def digest(path):
    h=hashlib.sha256()
    with path.open('rb') as stream:
        for block in iter(lambda:stream.read(1024*1024),b''):h.update(block)
    return h.hexdigest()

assert os.environ.get('GITHUB_ACTIONS')=='true' and os.environ.get('RUNNER_ENVIRONMENT')=='github-hosted'
expected=json.loads(Path('scripts/distribution/public-release-1.0.0.json').read_text())
src=api('/releases/'+str(source));dst=api('/releases/'+str(destination))
assert not src['draft'] and dst['draft'] and dst['tag_name']=='v1.0.0'
assert {a['name'] for a in src['assets']}=={a['name'] for a in expected}
out=Path('.build/release-stage');out.mkdir(parents=True,exist_ok=True)
for e in expected:
    a=next(a for a in src['assets'] if a['name']==e['name'])
    assert a['size']==e['bytes'] and a['digest']=='sha256:'+e['sha256']
    url=a['browser_download_url']
    assert url.startswith('https://github.com/TRON-ABS/Novera/releases/download/untagged-b80b18dc44b13a795be2/')
    path=out/e['name']
    request=urllib.request.Request(url,headers={'User-Agent':'Novera-release-staging'})
    with urllib.request.urlopen(request,timeout=180) as response,path.open('xb') as stream:
        while block:=response.read(1024*1024):stream.write(block)
    assert path.stat().st_size==e['bytes'] and digest(path)==e['sha256']
    print('Downloaded exact reviewed bytes: '+e['name'],flush=True)

# The public expected checksums bind these payloads to the independently verified
# updater signatures; transfer them byte-for-byte without signing or repackaging.
completed=[]
for e in expected:
    current=api('/releases/'+str(destination))
    assert current['draft'] and current['tag_name']=='v1.0.0'
    found=[a for a in current['assets'] if a['name']==e['name']]
    if found:result=found[0]
    else:
        url=urllib.parse.urlsplit(current['upload_url'].split('{')[0])
        assert url.netloc=='uploads.github.com' and url.scheme=='https'
        conn=http.client.HTTPSConnection(url.netloc,timeout=180)
        conn.putrequest('POST',url.path+'?name='+urllib.parse.quote(e['name']))
        for k,v in {'Authorization':'Bearer '+token,'User-Agent':'Novera-release-staging','Accept':'application/vnd.github+json','Content-Type':'application/octet-stream','Content-Length':str(e['bytes'])}.items():conn.putheader(k,v)
        conn.endheaders()
        with (out/e['name']).open('rb') as stream:
            while block:=stream.read(1024*1024):conn.send(block)
        response=conn.getresponse();data=response.read();assert response.status==201
        result=json.loads(data);conn.close()
    assert result['state']=='uploaded' and result['size']==e['bytes'] and result['digest']=='sha256:'+e['sha256']
    completed.append({'id':result['id'],**e})
    print('Verified destination asset: '+e['name'],flush=True)
(out/'STAGING-VERIFIED.json').write_text(json.dumps({'sourceRelease':source,'destinationRelease':destination,'assets':completed},indent=2)+'\n')
