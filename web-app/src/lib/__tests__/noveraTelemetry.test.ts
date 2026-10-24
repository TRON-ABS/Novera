import { afterEach, describe, expect, it, vi } from 'vitest'
import { telemetryDestination, sendStartupStatistic } from '../noveraTelemetry'

afterEach(() => vi.unstubAllGlobals())
describe('Novera statistics destination', () => {
  it('stays disabled without an explicit HTTPS destination and project', () => {
    for (const [host, key] of [
      ['', ''], ['https://stats.example.com', ''], ['http://stats.example.com', 'key'],
      ['https://user:password@stats.example.com', 'key'], ['https://apps.jan.ai', 'key'],
      ['https://stats.example.com?token=x', 'key'], ['not a URL', 'key'],
    ]) expect(telemetryDestination(host, key)).toBeUndefined()
    expect(telemetryDestination('https://stats.example.com', 'public-project-key')).toBe('https://stats.example.com/i/v0/e/')
  })
  it('sends nothing in the unconfigured build', async () => {
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch)
    await sendStartupStatistic(new AbortController().signal)
    expect(fetch).not.toHaveBeenCalled()
  })
  it('sends only the allowlisted startup properties, without cookies or stable identity', async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true }); vi.stubGlobal('fetch', fetch)
    const config = { host: 'https://stats.example.com', key: 'public-key', version: '1.0.1', os: 'windows' }
    await sendStartupStatistic(new AbortController().signal, config)
    await sendStartupStatistic(new AbortController().signal, config)
    const [url, options] = fetch.mock.calls[0]
    expect(url).toBe('https://stats.example.com/i/v0/e/')
    expect(options).toMatchObject({ credentials: 'omit', referrerPolicy: 'no-referrer', redirect: 'error' })
    const first = JSON.parse(options.body)
    expect(Object.keys(first.properties).sort()).toEqual(['$geoip_disable', '$process_person_profile', 'app_version', 'os'])
    expect(first.properties.app_version).toBe('1.0.1')
    expect(first.distinct_id).not.toBe(JSON.parse(fetch.mock.calls[1][1].body).distinct_id)
    const controller = new AbortController(); controller.abort()
    await sendStartupStatistic(controller.signal, config)
    expect(fetch).toHaveBeenCalledTimes(2)
  })
})
