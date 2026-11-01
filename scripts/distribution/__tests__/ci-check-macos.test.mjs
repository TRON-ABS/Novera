import test from 'node:test'
import assert from 'node:assert/strict'
import { packedVersion, inspectMacHeader } from '../ci-check-macos.mjs'

function binary({ arch = 'arm64', minimum = '14.0', platform = 1, command = 0x32 } = {}) {
  const b = Buffer.alloc(56)
  b.writeUInt32LE(0xfeedfacf, 0)
  b.writeUInt32LE(arch === 'arm64' ? 0x100000c : 0x1000007, 4)
  b.writeUInt32LE(1, 16); b.writeUInt32LE(24, 20)
  b.writeUInt32LE(command, 32); b.writeUInt32LE(24, 36)
  if (command === 0x32) { b.writeUInt32LE(platform, 40); b.writeUInt32LE(packedVersion(minimum), 44) }
  else b.writeUInt32LE(packedVersion(minimum), 40)
  return b
}
test('rejects the observed macOS 15 GGUF library under a macOS 14 app declaration', () => {
  assert.throws(() => inspectMacHeader(binary({ minimum: '15.0' }), 'arm64', '14.0'), /newer macOS/)
  assert.equal(inspectMacHeader(binary(), 'arm64', '14.0'), '14.0.0')
})
test('accepts older Intel version commands and compares patch versions numerically', () => {
  assert.equal(inspectMacHeader(binary({ arch: 'x64', minimum: '13.0', command: 0x24 }), 'x64', '13.0'), '13.0.0')
  assert.throws(() => inspectMacHeader(binary({ minimum: '14.0.1' }), 'arm64', '14.0'), /newer macOS/)
})
test('rejects an iOS simulator or the wrong CPU in a macOS package', () => {
  assert.throws(() => inspectMacHeader(binary({ platform: 7 }), 'arm64', '14.0'), /macOS platform/)
  assert.throws(() => inspectMacHeader(binary({ arch: 'x64' }), 'arm64', '14.0'), /architecture/)
})
test('rejects corrupt or missing load commands without certifying a binary', () => {
  const b = binary(); b.writeUInt32LE(0, 36)
  assert.throws(() => inspectMacHeader(b, 'arm64', '14.0'), /command size/)
  assert.throws(() => inspectMacHeader(binary().subarray(0, 40), 'arm64', '14.0'), /Truncated/)
  const missing = binary(); missing.writeUInt32LE(0, 16)
  assert.throws(() => inspectMacHeader(missing, 'arm64', '14.0'), /Missing macOS minimum/)
})
