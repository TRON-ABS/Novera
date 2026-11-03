import { test } from 'node:test'
import assert from 'node:assert/strict'
import { reviewPublicFeeds, reviewedAssetUrl } from '../verify-public-release.mjs'

function feeds() {
  const base='https://github.com/TRON-ABS/Novera/releases/download/v1.0.0/'
  return [
    {version:'1.0.0',pub_date:'2026-11-02T00:00:00Z',platforms:{'windows-x86_64':{url:base+'Novera_1.0.0_x64-setup.exe',signature:'signed'},'linux-x86_64':{url:base+'Novera_1.0.0_amd64.AppImage',signature:'signed'}}},
    {version:'1.0.0',platforms:Object.fromEntries(['windows-x86_64','linux-x86_64'].map(p=>[p,{url:base+`Novera_CLI_1.0.0_${p}.zip`,signature:'signed',sha256:'a'.repeat(64)}]))},
  ]
}
test('public feeds advertise only the four selected version-matched official bundles',()=>{
  assert.equal(reviewPublicFeeds(...feeds(),'1.0.0').size,4)
})

test('the canonical CLI can add its reviewed macOS ARM64 bundle without changing Desktop URLs',()=>{
  const f=feeds()
  const cli=Object.fromEntries(['windows-x86_64','linux-x86_64','darwin-aarch64'].map(platform=>[platform,`https://github.com/TRON-ABS/Novera/releases/download/v1.0.0-cli-novera/Novera_CLI_1.0.0_${platform}.zip`]))
  f[1].platforms=Object.fromEntries(Object.entries(cli).map(([platform,url])=>[platform,{url,signature:'signed',sha256:'a'.repeat(64)}]))
  const plan={desktop:Object.fromEntries(Object.entries(f[0].platforms).map(([platform,entry])=>[platform,entry.url])),cli}
  assert.equal(reviewPublicFeeds(...f,'1.0.0',plan).size,5)
  assert.throws(()=>reviewPublicFeeds(...f,'1.0.0'),/scope/)
})

test('portable updates use a separate reviewed payload while preserving the installed-app channels',()=>{
  const f=feeds()
  const url='https://github.com/TRON-ABS/Novera/releases/download/v1.0.0-windows-portable/Novera_1.0.0_x64-portable-update.exe'
  const plan={desktop:Object.fromEntries(Object.entries(f[0].platforms).map(([p,e])=>[p,e.url])),cli:Object.fromEntries(Object.entries(f[1].platforms).map(([p,e])=>[p,e.url])),portable:{'windows-x86_64':url}}
  const portable={version:'1.0.0',pub_date:'2026-11-02T00:00:00Z',platforms:{'windows-x86_64':{url,signature:'signed'}}}
  assert.equal(reviewPublicFeeds(...f,'1.0.0',plan,portable).size,5)
  assert.throws(()=>reviewPublicFeeds(...f,'1.0.0',plan),/portable feed scope/)
  assert.throws(()=>reviewPublicFeeds(...f,'1.0.0',plan,{...portable,platforms:{'windows-x86_64':f[0].platforms['windows-x86_64']}}),/Program-only/)
  delete f[0].platforms['linux-x86_64'];assert.throws(()=>reviewPublicFeeds(...f,'1.0.0',plan,portable),/scope/)
})
test('an old manifest, missing platform or unreviewed extra platform cannot validate this release',()=>{
  for(const change of [f=>f[0].version='0.9.9',f=>delete f[1].platforms['linux-x86_64'],f=>f[0].platforms['darwin-aarch64']={}]){
    const f=feeds();change(f);assert.throws(()=>reviewPublicFeeds(...f,'1.0.0'),/version or platform/)
  }
})
test('a redirected repository, wrong bundle format or absent signature cannot pass the public contract',()=>{
  for(const change of [e=>e.url=e.url.replace('TRON-ABS','other'),e=>e.url=e.url.replace('.AppImage','.deb'),e=>delete e.signature]){
    const f=feeds();change(f[0].platforms['linux-x86_64']);assert.throws(()=>reviewPublicFeeds(...f,'1.0.0'),/URL or missing signature/)
  }
})
test('public CLI checksums and the desktop publication date are mandatory',()=>{
  let f=feeds();f[1].platforms['windows-x86_64'].sha256='';assert.throws(()=>reviewPublicFeeds(...f,'1.0.0'),/checksum/)
  f=feeds();f[0].pub_date='invalid';assert.throws(()=>reviewPublicFeeds(...f,'1.0.0'),/date/)
})

test('an additive ARM64 publication preserves the original desktop and CLI URLs at application version 1.0.0',()=>{
  const f=feeds()
  const arm='https://github.com/TRON-ABS/Novera/releases/download/v1.0.0-windows-arm64/Novera_1.0.0_arm64-setup.exe'
  f[0].platforms['windows-aarch64']={url:arm,signature:'signed'}
  const plan={desktop:Object.fromEntries(Object.entries(f[0].platforms).map(([p,e])=>[p,e.url])),cli:Object.fromEntries(Object.entries(f[1].platforms).map(([p,e])=>[p,e.url]))}
  assert.equal(reviewPublicFeeds(...f,'1.0.0',plan).size,5)
  assert.throws(()=>reviewPublicFeeds(...f,'1.0.0'),/scope/)
  delete f[0].platforms['windows-x86_64'];assert.throws(()=>reviewPublicFeeds(...f,'1.0.0',plan),/scope/)
})

test('reviewed cross-release URLs cannot change repository, application version, filename or add query credentials',()=>{
  const good='https://github.com/TRON-ABS/Novera/releases/download/v1.0.0-windows-arm64/Novera_1.0.0_arm64-setup.exe'
  assert.equal(reviewedAssetUrl(good,'1.0.0','Novera_1.0.0_arm64-setup.exe'),good)
  for(const url of [good.replace('TRON-ABS','other'),good.replace('v1.0.0','v1.0.1'),good+'?token=x',good.replace('arm64-setup.exe','x64-setup.exe')])assert.throws(()=>reviewedAssetUrl(url,'1.0.0','Novera_1.0.0_arm64-setup.exe'),/official release asset/)
})
