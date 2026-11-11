import { describe, expect, it } from 'vitest'
import { autoTuneCampaignKey, browserMusicProfiles, browserTextProfiles } from './auto-tune-plan'

describe('Auto Tune campaign coverage', () => {
  it('compares CPU and GPU sampling at every supported batch size', () => {
    for (const sampling of ['cpu', 'gpu']) {
      expect(browserTextProfiles.filter(profile => profile.sampling === sampling)
        .map(profile => profile.commandBatchSize).sort((a, b) => a - b)).toEqual([8, 16, 32, 64, 128, 256])
    }
    expect(new Set(browserTextProfiles.map(profile => JSON.stringify(profile))).size).toBe(12)
  })

  it('includes joint music changes and a return to the production defaults', () => {
    expect(browserMusicProfiles).toHaveLength(8)
    expect(new Set(browserMusicProfiles.map(profile => JSON.stringify(profile.settings))).size).toBe(8)
    expect(browserMusicProfiles.some(({ settings }) => Object.values(settings).every(Boolean))).toBe(true)
    expect(browserMusicProfiles.some(({ settings }) => Object.values(settings).every(value => !value))).toBe(true)
    expect(browserMusicProfiles.every(({ settings }) => Object.keys(settings).length === 3)).toBe(true)
  })

  it('does not reuse another release or platform completion list', () => {
    const keys = [autoTuneCampaignKey(true, '1.0.1'), autoTuneCampaignKey(true, '1.0.2'), autoTuneCampaignKey(false, '1.0.2')]
    expect(new Set(keys).size).toBe(3)
    expect(keys.every(key => key.endsWith(':v6'))).toBe(true)
  })
})
