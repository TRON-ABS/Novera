import { describe, expect, it } from 'vitest'
import { applyCalibratedPreset, calibrationBasis, calibratedPresetLines } from './calibration'

describe('calibration receipts', () => {
  const source = '[*]\nctx-size = 8192\n[a]\nmodel = /models/a.gguf\n[b]\nmodel = /models/b.gguf\n'
  const basis = calibrationBasis(source, 'a')!

  it('applies a completed result only to the measured settings', () => {
    const receipt = { basis, state: 'complete', profile: { threads: 2, load_mode: 'none' } } as const
    expect(calibratedPresetLines(receipt, basis)).toEqual(['threads = 2', 'load-mode = none'])
    expect(calibratedPresetLines(receipt, calibrationBasis(source.replace('8192', '4096'), 'a'))).toBeUndefined()
    expect(calibratedPresetLines(receipt, calibrationBasis(source, 'b'))).toBeUndefined()
    expect(calibratedPresetLines({ ...receipt, state: 'pending' }, basis)).toBeUndefined()
  })

  it('replaces local tuning only with a confirmed profile, including engine defaults', () => {
    const section = ['[a]', 'model = /models/a.gguf', 'threads = 2', 'load-mode = none']
    const reference = calibrationBasis(section.join('\n'), 'a')!
    const receipt = { basis: reference, state: 'complete', profile: { threads: null, load_mode: null } } as const
    expect(applyCalibratedPreset(section, calibratedPresetLines(receipt, reference))).toEqual(section.slice(0, 2))
    expect(applyCalibratedPreset(section, calibratedPresetLines({ ...receipt, state: 'pending' }, reference))).toEqual(section)
  })
})
