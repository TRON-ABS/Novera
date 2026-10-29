import { afterEach, describe, expect, it } from 'vitest'
import i18n from '../setup'

const previousLanguage = i18n.language
const key = '__regionalPluralProbe'
afterEach(() => {
  for (const locale of ['en', 'ar', 'fr', 'ru']) delete i18n.resources[locale][key]
  i18n.changeLanguage(previousLanguage)
})

describe('locale-aware plural resolution', () => {
  it('selects Arabic zero, two and few forms before a fallback language', () => {
    i18n.resources.ar[key] = { count_zero: 'zero', count_one: 'one', count_two: 'two', count_few: 'few', count_many: 'many', count_other: 'other' }
    i18n.changeLanguage('ar')
    expect([0, 1, 2, 3, 11, 100].map(count => i18n.t(`${key}:count`, { count })))
      .toEqual(['zero', 'one', 'two', 'few', 'many', 'other'])
  })

  it('keeps Russian plural messages in Russian when only the other form exists', () => {
    i18n.resources.ru[key] = { count_other: 'ru {{count}}' }
    i18n.resources.en[key] = { count_one: 'en one', count_other: 'en other' }
    i18n.changeLanguage('ru')
    expect(i18n.t(`${key}:count`, { count: 2 })).toBe('ru 2')
  })

  it('resolves the base key in the selected locale before an English plural suffix', () => {
    i18n.resources.fr[key] = { count: 'fr {{count}}' }
    i18n.resources.en[key] = { count_other: 'en other' }
    i18n.changeLanguage('fr')
    expect(i18n.t(`${key}:count`, { count: 2 })).toBe('fr 2')
  })
})
