import { test } from 'node:test'
import assert from 'node:assert/strict'
import { requireWindowsUiHost, expectedWindowsUiMessage } from '../validate-windows-update-ui.mjs'
test('Windows UI validation refuses local, x64 and self-hosted runs before app access', () => {
  for (const [platform, arch, env] of [['win32','arm64',{}],['win32','x64',{GITHUB_ACTIONS:'true',RUNNER_ENVIRONMENT:'github-hosted'}],['win32','arm64',{GITHUB_ACTIONS:'true',RUNNER_ENVIRONMENT:'self-hosted'}]]) assert.throws(() => requireWindowsUiHost(platform, arch, env), /Disposable Windows ARM64/)
  assert.doesNotThrow(() => requireWindowsUiHost('win32','arm64',{GITHUB_ACTIONS:'true',RUNNER_ENVIRONMENT:'github-hosted'}))
})
test('an absent ARM64 entry must show an error, while the signed published target is current', () => {
  assert.deepEqual(expectedWindowsUiMessage({version:'1.0.0',platforms:{}}), {supported:false,text:'Failed to check for updates'})
  const entry={url:'https://github.com/TRON-ABS/Novera/releases/download/v1.0.0-windows-arm64/Novera_1.0.0_arm64-setup.exe',signature:'signed'}
  assert.equal(expectedWindowsUiMessage({version:'1.0.0',platforms:{'windows-aarch64':entry}}).supported,true)
  for(const bad of [{...entry,url:entry.url.replace('TRON-ABS','other')},{...entry,signature:''}]) assert.throws(()=>expectedWindowsUiMessage({version:'1.0.0',platforms:{'windows-aarch64':bad}}),/official signed/)
  assert.throws(()=>expectedWindowsUiMessage({version:'1.0.1',platforms:{}}),/current application version/)
})
