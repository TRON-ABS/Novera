import { describe, expect, it } from 'vitest'
import { formatCompactDuration } from '../duration'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

// Mirrors the compact unit strings in locales/en/common.json.
const t = (key: string, options?: Record<string, unknown>) => {
  const unit = { seconds: 's', minutes: 'm', hours: 'h' }[
    key.split('.')[1] as 'seconds' | 'minutes' | 'hours'
  ]
  return `${options?.count}${unit}`
}

const format = (seconds: number) => formatCompactDuration(seconds, t)

describe('formatCompactDuration', () => {
  it('renders sub-minute durations in seconds', () => {
    expect(format(0)).toBe('0s')
    expect(format(1)).toBe('1s')
    expect(format(59)).toBe('59s')
  })

  it('switches to minutes at 60 seconds', () => {
    expect(format(60)).toBe('1m')
    expect(format(90)).toBe('1m 30s')
    expect(format(3599)).toBe('59m 59s')
  })

  it('omits a zero remainder', () => {
    expect(format(120)).toBe('2m')
    expect(format(7200)).toBe('2h')
  })

  it('switches to hours at 3600 seconds', () => {
    expect(format(3600)).toBe('1h')
    expect(format(4800)).toBe('1h 20m')
  })

  it('drops seconds at hour scale to keep the label short', () => {
    expect(format(3661)).toBe('1h 1m')
  })

  it('floors fractional input and clamps negatives', () => {
    expect(format(1.9)).toBe('1s')
    expect(format(-5)).toBe('0s')
  })
})

describe('duration units in the 80 real catalogs', () => {
  const root = join(__dirname, '../../locales')
  const locales = readdirSync(root).filter(locale => !locale.startsWith('__'))
  const load = (locale: string) => JSON.parse(
    readFileSync(join(root, locale, 'common.json'), 'utf8')
  ).duration as Record<string, string>
  const translate = (locale: string) => (key: string, options?: Record<string, unknown>) =>
    load(locale)[key.split('.')[1]].replace('{{count}}', String(options?.count))

  it('covers all supported languages', () => {
    expect(locales).toHaveLength(80)
  })

  it.each(locales)('%s includes a distinct unit for seconds, minutes and hours', (locale) => {
    const units = ['seconds', 'minutes', 'hours'].map(key => {
      const template = load(locale)[key]
      expect(template).toContain('{{count}}')
      const unit = template.replace('{{count}}', '').trim()
      expect(unit.length).toBeGreaterThan(0)
      return unit
    })
    expect(new Set(units).size).toBe(3)
    for (const seconds of [21, 60, 90, 3600, 4800]) {
      expect(formatCompactDuration(seconds, translate(locale))).not.toMatch(/^[\d\s]+$/)
    }
  })

  it('renders explicit French units in the compact response duration', () => {
    expect(formatCompactDuration(21, translate('fr'))).toBe('21 s')
    expect(formatCompactDuration(90, translate('fr'))).toBe('1 min 30 s')
    expect(formatCompactDuration(4800, translate('fr'))).toBe('1 h 20 min')
  })
})
