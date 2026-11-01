import { createHash } from 'node:crypto'

const unknown = Buffer.from('__TAURI_BUNDLE_TYPE_VAR_UNK')
const nsis = Buffer.from('__TAURI_BUNDLE_TYPE_VAR_NSS')

// Tauri patches an installer-specific executable and restores its raw output.
// Our desktop/portable NSIS update channel must retain the installer marker.
// Change only that reserved slot in the copied candidate, never Cargo output.
export function prepareNsisRuntime(source) {
  if (source.subarray(0, 2).toString() !== 'MZ' || source.length < 64) throw new Error('Expected a Windows executable')
  const pe = source.readUInt32LE(60)
  if (pe + 6 > source.length || !source.subarray(pe, pe + 4).equals(Buffer.from('PE\0\0'))) throw new Error('Invalid PE header')
  const offset = source.indexOf(unknown)
  if (offset < 0 || source.indexOf(unknown, offset + 1) !== -1) throw new Error('Expected one reserved unknown Tauri bundle-type slot')
  const binary = Buffer.from(source)
  nsis.copy(binary, offset)
  return { binary, proof: { bundleType: 'nsis', markerOffset: offset, sourceSha256: createHash('sha256').update(source).digest('hex'), sha256: createHash('sha256').update(binary).digest('hex') } }
}

export function verifyNsisRuntime(binary, proof) {
  if (!proof || proof.bundleType !== 'nsis' || !Number.isSafeInteger(proof.markerOffset) || proof.markerOffset < 0 || proof.markerOffset + nsis.length > binary.length || !binary.subarray(proof.markerOffset, proof.markerOffset + nsis.length).equals(nsis) || createHash('sha256').update(binary).digest('hex') !== proof.sha256) throw new Error('Windows runtime update marker or checksum differs from its preparation proof')
  return true
}
