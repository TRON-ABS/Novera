import { test } from 'node:test'
import assert from 'node:assert/strict'
import { reviewPublicFeeds } from '../verify-public-release.mjs'

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
