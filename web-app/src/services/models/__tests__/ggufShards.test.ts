import { describe, expect, it } from 'vitest'
import { groupGgufFiles, hfFileUrl } from '../ggufShards'

const file = (rfilename: string) => ({ rfilename })
const series = (prefix = 'model', count = 2) => Array.from({ length: count }, (_, i) => file(`${prefix}-${String(i + 1).padStart(5, '0')}-of-${String(count).padStart(5, '0')}.gguf`))

describe('GGUF shard grouping', () => {
  it('groups by folder, basename and count while keeping standalone variants', () => {
    const groups = groupGgufFiles([file('model.gguf'), ...series().reverse(), ...series('nested/model'), ...series('model', 3)])
    expect(groups.map((group) => group.length)).toEqual([1, 2, 2, 3])
    expect(groups[1][0].rfilename).toBe('model-00001-of-00002.gguf')
  })
  it.each(['missing', 'duplicate', 'zero', 'out-of-range', 'mixed-count'])('omits %s series', (defect) => {
    const parts = series()
    if (defect === 'missing') parts.pop()
    if (defect === 'duplicate') parts[1] = parts[0]
    if (defect === 'zero') parts[0] = file('model-00000-of-00002.gguf')
    if (defect === 'out-of-range') parts[1] = file('model-00003-of-00002.gguf')
    if (defect === 'mixed-count') parts[1] = file('model-00002-of-00003.gguf')
    expect(groupGgufFiles(parts)).toEqual([])
  })
  it('recognizes uppercase extensions', () => {
    expect(groupGgufFiles(series().map((part) => file(part.rfilename.toUpperCase())))).toHaveLength(1)
  })
  it('encodes revision and nested filename segments', () => {
    expect(hfFileUrl('a/b', 'refs/pr/1', 'Q4/model #1.gguf')).toBe('https://huggingface.co/a/b/resolve/refs%2Fpr%2F1/Q4/model%20%231.gguf')
  })
})
