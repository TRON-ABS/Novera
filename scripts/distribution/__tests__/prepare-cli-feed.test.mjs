import { test } from 'node:test'
import assert from 'node:assert/strict'
import { reviewCliProof, prepareCliFeed } from '../prepare-cli-feed.mjs'

function proof() {
  return { kind:'cli',platform:'linux',architecture:'x64',binaryArchitectureVerified:true,
    cryptographicUpdateSignatureVerified:true,pinnedPublicKeyEmbedded:true,commit:'a'.repeat(40),signedArchiveSha256:'b'.repeat(64),
    archiveIdentityVerified:{formatVersion:2,product:'Novera CLI',version:'1.0.0',platform:'linux-x86_64',commit:'a'.repeat(40)},
    nativeInstalledReplacementReceipt:{platform:'linux-x86_64',version:'1.0.0',archiveSha256:'b'.repeat(64),signatureVerified:true,tamperedArchiveRejected:true,replacementPerformed:true,replacedExecutableRuns:true,profileWitnessPreserved:true} }
}

test('CLI feed prerequisites bind actual replacement to the selected version, platform and bytes', () => {
  assert.equal(reviewCliProof(proof(),'1.0.0').file,'Novera_CLI_1.0.0_linux-x86_64.zip')
  for (const change of [{cryptographicUpdateSignatureVerified:false},{pinnedPublicKeyEmbedded:false},{architecture:'arm64'},{signedArchiveSha256:'c'.repeat(64)}]) {
    assert.throws(()=>reviewCliProof({...proof(),...change},'1.0.0'))
  }
  for(const field of ['signatureVerified','tamperedArchiveRejected','replacementPerformed','replacedExecutableRuns','profileWitnessPreserved']) {
    const p=proof();p.nativeInstalledReplacementReceipt[field]=false;assert.throws(()=>reviewCliProof(p,'1.0.0'),/replacement evidence/)
  }
})

test('a real proof for an old or different target cannot enter another release manifest', () => {
  for(const version of ['1.0.1','1.0.0-beta','01.0.0'])assert.throws(()=>reviewCliProof(proof(),version))
  const p=proof();p.archiveIdentityVerified.platform='windows-x86_64'
  assert.throws(()=>reviewCliProof(p,'1.0.0'),/identity differs/)
  const legacy=proof();legacy.archiveIdentityVerified.formatVersion=1
  assert.throws(()=>reviewCliProof(legacy,'1.0.0'),/identity differs/)
})

test('CLI feed preparation refuses an incomplete platform set before creating output', async () => {
  await assert.rejects(prepareCliFeed('1.0.0',[],'latest-novera-cli.json'),/Both published/)
  await assert.rejects(prepareCliFeed('1.0.0',['a','b'],'latest.json'),/latest-novera-cli.json/)
})
