import { afterEach, describe, expect, it } from 'vitest'
import i18n from '../setup'
import { translateSettingText } from '../setting-text'
import { modelSettings } from '@/lib/predefined'
import { paramsSettings, paramGroups, paramCategories } from '@/lib/predefinedParams'
import keys from '../setting-text-keys.json'

const original = i18n.language
afterEach(() => i18n.changeLanguage(original))
const values = new Set(Object.keys(keys))
describe('shipped settings metadata localization', () => {
  it('registers every model and sampling title, description and effect hint', () => {
    for (const entry of [...Object.values(modelSettings), ...Object.values(paramsSettings), ...paramGroups, ...paramCategories]) {
      for (const property of ['title', 'description', 'effectHint'] as const) {
        const value = (entry as unknown as Record<string, unknown>)[property]
        if (typeof value === 'string' && value.trim()) expect(values.has(value.replace(/\s+/g, ' ').trim()), value).toBe(true)
      }
    }
  })

  it.each(Object.keys(i18n.resources))('renders the saved English metadata in %s without using English fallback', (locale) => {
    i18n.changeLanguage(locale)
    const key = (keys as Record<string, string>)['Context Size']
    const [namespace, name] = key.split(':')
    expect(i18n.resources[locale][namespace]?.[name], `${locale}:${key}`).toBeTruthy()
    expect(translateSettingText('Context Size', i18n.t)).toBe(i18n.resources[locale][namespace][name])
    expect(translateSettingText('A custom user extension label', i18n.t)).toBe('A custom user extension label')
  })

  it('preserves null, undefined and protocol labels not in the shipped dictionary', () => {
    expect(translateSettingText(undefined, i18n.t)).toBeUndefined()
    expect(translateSettingText(null, i18n.t)).toBeNull()
    expect(translateSettingText('q4_0', i18n.t)).toBe('q4_0')
  })
})
