import { describe, expect, it } from 'vitest'
import { browserMediaTrialTimeout, compareBrowserProfiles, confirmedBrowserGain } from './auto-tune'

describe('browser calibration', () => {
  const sample = (rate: number, output = 'same token sequence') => ({ rate, output })

  it('allows the measured ten-minute Wan reference and slower candidates to finish', () => {
    expect(browserMediaTrialTimeout('video', true)).toBeGreaterThan(2 * 620_000)
    expect(browserMediaTrialTimeout('video', false)).toBeGreaterThan(240_000)
    expect(browserMediaTrialTimeout('image', true)).toBe(240_000)
  })

  it('validates both workloads even when hardware only supports the reference', async () => {
    const phases: string[] = []
    const result = await compareBrowserProfiles([], async phase => {
      phases.push(phase)
      return sample(100)
    }, new AbortController().signal)
    expect(phases).toEqual(['screening', 'confirmation'])
    expect(result).toBeUndefined()
  })

  it('takes the lower gain from independent pairs with identical output', () => {
    expect(confirmedBrowserGain([[sample(100), sample(115)], [sample(100), sample(104)]])).toBeCloseTo(0.04)
  })

  it('screens every video setting but only confirms the two best identical-output improvements', async () => {
    const order: string[] = []
    const rates: Record<string, number> = { slow: 98, changed: 200, third: 105, best: 120, second: 110 }
    const result = await compareBrowserProfiles(Object.keys(rates), async (phase, profile) => {
      order.push(phase + ':' + (profile ?? 'reference'))
      return sample(profile ? rates[profile] : 100, profile === 'changed' ? 'wrong' : phase)
    }, new AbortController().signal, undefined, 'best-two')
    expect(result?.profile).toBe('best')
    expect(order).toEqual(['screening:reference', 'screening:slow', 'screening:changed', 'screening:third', 'screening:best', 'screening:second',
      'confirmation:second', 'confirmation:best', 'confirmation:reference'])
  })

  it('does not start long video confirmations when no setting beats the reference', async () => {
    const phases: string[] = []
    expect(await compareBrowserProfiles(['slow', 'same'], async (phase, profile) => {
      phases.push(phase)
      return sample(profile === 'slow' ? 90 : 100)
    }, new AbortController().signal, undefined, 'best-two')).toBeUndefined()
    expect(phases).toEqual(['screening', 'screening', 'screening'])
  })

  it('rejects changed tokens or a speedup that did not repeat', () => {
    expect(confirmedBrowserGain([[sample(100), sample(150)], [sample(100), sample(150, 'different')]])).toBeUndefined()
    expect(confirmedBrowserGain([[sample(100), sample(150)], [sample(100), sample(101)]])).toBeUndefined()
  })
  it('completes both workloads for all profiles in reverse order and selects only a repeatable identical gain', async () => {
    const order: string[] = []
    const result = await compareBrowserProfiles(['unstable', 'winner', 'changed', 'slower'], async (phase, candidate) => {
      order.push(phase + ':' + (candidate ?? 'reference'))
      if (!candidate) return sample(100, phase)
      if (candidate === 'changed') return sample(200, 'different output')
      if (candidate === 'slower') return sample(98, phase)
      return sample(candidate === 'winner' ? 110 : phase === 'screening' ? 120 : 103, phase)
    }, new AbortController().signal)
    expect(result?.profile).toBe('winner')
    expect(result?.gain).toBeCloseTo(0.1)
    expect(order).toEqual([
      'screening:reference', 'screening:unstable', 'screening:winner', 'screening:changed', 'screening:slower',
      'confirmation:slower', 'confirmation:changed', 'confirmation:winner', 'confirmation:unstable', 'confirmation:reference',
    ])
  })

  it('continues after an unsupported candidate and enforces the exact 3.3 percent floor', async () => {
    const result = await compareBrowserProfiles(['unsupported', 'threshold'], async (_, candidate) => {
      if (candidate === 'unsupported') throw new Error('Unavailable variant')
      return sample(candidate ? 103.3 : 100)
    }, new AbortController().signal)
    expect(result?.profile).toBe('threshold')
    expect(result?.gain).toBeCloseTo(0.033)
  })

})
