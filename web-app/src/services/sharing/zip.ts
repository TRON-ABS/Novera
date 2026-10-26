/** Portable ZIP STORE writer. UTF-8 entry names, CRC32 and no external runtime. */
const table = Uint32Array.from({ length: 256 }, (_, i) => {
  let c = i
  for (let bit = 0; bit < 8; bit++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
export function zipFiles(
  entries: { name: string; bytes: Uint8Array }[]
): Uint8Array {
  const chunks: Uint8Array[] = [],
    directory: Uint8Array[] = []
  let offset = 0,
    directorySize = 0
  const encoder = new TextEncoder(),
    seen = new Set<string>()
  for (const entry of entries) {
    if (
      entry.name.startsWith('/') ||
      entry.name.includes('\\') ||
      entry.name.split('/').some((p) => !p || p === '..' || p === '.') ||
      seen.has(entry.name)
    )
      throw new Error('Invalid archive entry')
    seen.add(entry.name)
    const name = encoder.encode(entry.name),
      size = entry.bytes.length
    if (name.length > 65535 || size > 0xffffffff || offset > 0xffffffff)
      throw new Error('Archive too large')
    let crc = 0xffffffff
    for (const byte of entry.bytes)
      crc = table[(crc ^ byte) & 255] ^ (crc >>> 8)
    crc = (crc ^ 0xffffffff) >>> 0
    const local = new Uint8Array(30 + name.length),
      view = new DataView(local.buffer)
    view.setUint32(0, 0x04034b50, true)
    view.setUint16(4, 20, true)
    view.setUint16(6, 0x800, true)
    view.setUint32(14, crc, true)
    view.setUint32(18, size, true)
    view.setUint32(22, size, true)
    view.setUint16(26, name.length, true)
    local.set(name, 30)
    const central = new Uint8Array(46 + name.length),
      cv = new DataView(central.buffer)
    cv.setUint32(0, 0x02014b50, true)
    cv.setUint16(4, 20, true)
    cv.setUint16(6, 20, true)
    cv.setUint16(8, 0x800, true)
    cv.setUint32(16, crc, true)
    cv.setUint32(20, size, true)
    cv.setUint32(24, size, true)
    cv.setUint16(28, name.length, true)
    cv.setUint32(42, offset, true)
    central.set(name, 46)
    chunks.push(local, entry.bytes)
    directory.push(central)
    offset += local.length + size
    directorySize += central.length
  }
  if (entries.length > 65535 || offset + directorySize > 0xffffffff)
    throw new Error('Archive too large')
  const end = new Uint8Array(22),
    ev = new DataView(end.buffer)
  ev.setUint32(0, 0x06054b50, true)
  ev.setUint16(8, entries.length, true)
  ev.setUint16(10, entries.length, true)
  ev.setUint32(12, directorySize, true)
  ev.setUint32(16, offset, true)
  const result = new Uint8Array(offset + directorySize + end.length)
  let pos = 0
  for (const chunk of [...chunks, ...directory, end]) {
    result.set(chunk, pos)
    pos += chunk.length
  }
  return result
}
