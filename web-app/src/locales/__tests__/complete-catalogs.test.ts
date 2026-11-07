import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import i18n from '@/i18n/setup'

const root = join(__dirname, '..')
const namespaces = readdirSync(join(root, 'en')).filter((name) => name.endsWith('.json'))
const inventory = JSON.parse(readFileSync(join(root, '../../../docs/language-support.json'), 'utf8')) as {
  locale: string; keys: number; total: number; partial: boolean
}[]

it('provides the short model-settings tooltip in all 104 languages without the model name', () => {
  expect(inventory).toHaveLength(104)
  for (const { locale } of inventory) {
    const common = JSON.parse(readFileSync(join(root, locale, 'common.json'), 'utf8'))
    expect(common.modelSettings.label.trim().length, locale).toBeGreaterThan(0)
    expect(common.modelSettings.label, locale).not.toMatch(/\{\{|\}\}/)
  }
  const french = JSON.parse(readFileSync(join(root, 'fr/common.json'), 'utf8'))
  expect(french.modelSettings.label).toBe('Paramètres du modèle')
})

function leaves(value: unknown, prefix = ''): Record<string, string> {
  if (typeof value === 'string') return { [prefix]: value }
  return Object.fromEntries(Object.entries(value as Record<string, unknown>)
    .flatMap(([key, child]) => Object.entries(leaves(child, prefix ? `${prefix}.${key}` : key))))
}

const load = (locale: string, namespace: string) => leaves(
  JSON.parse(readFileSync(join(root, locale, namespace), 'utf8')),
)
const english = Object.fromEntries(namespaces.map((namespace) => [namespace, load('en', namespace)]))
const total = Object.values(english).reduce((sum, bundle) => sum + Object.keys(bundle).length, 0)
const placeholders = (value: string) => [...value.matchAll(/\{\{(\w+)\}\}/g)].map((match) => match[1]).sort()
const code = (value: string) => value.match(/`[^`]*`/g) ?? []
const completedLocales = ['es', 'fr', 'it', 'hi', 'id', 'pl', 'vn', 'zh-CN', 'zh-TW',
  'de-DE', 'cs', 'pt-BR', 'ko', 'ja', 'ru', 'ca', 'gu', 'kn', 'apc', 'apd',
  'yo', 'bho', 'cjy', 'nan', 'my', 'arq', 'hak', 'ln', 'ary', 'or',
  'uk', 'hsn', 'ml', 'sd', 'pa', 'su', 'ig', 'prs', 'ne', 'ms',
  'uzn', 'zu', 'aec', 'pbu', 'gaz', 'skr', 'nl', 'so', 'ro', 'as', 'ceb', 'kk', 'si', 'xh', 'km', 'af', 'mai', 'wo', 'kmr', 'rw', 'gan', 'pbt', 'mag', 'ars', 'acm', 'fuv', 'hne', 'tts', 'ny', 'bm', 'sn', 'azb', 'tn', 'nso', 'bar', 'ht', 'ug', 'st', 'el', 'ctg', 'rn', 'dyu', 'tr', 'sv']

describe('complete interface catalogs', () => {
  const additions = ['gan', 'pbt', 'mag', 'ars', 'acm', 'fuv', 'hne', 'tts', 'ny', 'bm', 'sn', 'azb', 'tn', 'nso', 'bar', 'ht', 'ug', 'st', 'el', 'ctg', 'rn', 'dyu', 'tr', 'sv']
  const scripts: Record<string, string> = { gan: 'Han', pbt: 'Arabic', ars: 'Arabic', acm: 'Arabic', azb: 'Arabic', ug: 'Arabic', mag: 'Devanagari', hne: 'Devanagari', ctg: 'Bengali', tts: 'Thai', el: 'Greek' }
  it.each(additions)('%s keeps individual labels separate and preserves their writing system and numeric signs', (locale) => {
    const allowedLetter = new RegExp(`[\\p{Script=Latin}\\p{Script=Common}\\p{Script=Inherited}\\p{Script=${scripts[locale] ?? 'Latin'}}]`, 'u')
    const signed = (value: string) => value.replaceAll('−', '-').replace(/([-+])\s+(?=\d)/g, '$1').match(/(?<![A-Za-z0-9])[-+]\d+(?:[.,]\d+)*/g) ?? []
    const interpolation = (value: string) => (value.match(/\{\{[^{}]*\}\}/g) ?? []).sort()
    for (const namespace of namespaces) {
      const translated = load(locale, namespace)
      for (const [key, original] of Object.entries(english[namespace])) {
        const value = translated[key]
        const label = `${locale}/${namespace}:${key}`
        // A batched translation once appended the following button's text.
        expect((value.match(/\n/g) ?? []).length, label).toBe((original.match(/\n/g) ?? []).length)
        expect(interpolation(value), label).toEqual(interpolation(original))
        for (const number of signed(original)) {
          expect(signed(value).filter((item) => item === number).length, label)
            .toBeGreaterThanOrEqual(signed(original).filter((item) => item === number).length)
        }
        for (const character of value) {
          if (/\p{L}/u.test(character) && !original.includes(character)) {
            expect(allowedLetter.test(character), `${label}: ${character}`).toBe(true)
          }
        }
        if (!/(?<![\p{L}\p{N}_])_\p{L}/u.test(original)) expect(value, label).not.toMatch(/(?<![\p{L}\p{N}_])_\p{L}/u)
      }
    }
  })

  it('documents all 104 shipped locales as complete', () => {
    const directories = readdirSync(root, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith('__'))
      .map((entry) => entry.name).sort()
    expect(inventory.map((entry) => entry.locale).sort()).toEqual(directories)
    expect(inventory).toHaveLength(104)
    for (const entry of inventory) {
      expect(entry, entry.locale).toMatchObject({ keys: total, total, partial: false })
    }
  })

  it.each(inventory.filter((entry) => entry.locale !== 'en').map((entry) => entry.locale))(
    '%s translates every English key and preserves variables and code', (locale) => {
      for (const namespace of namespaces) {
        const translated = load(locale, namespace)
        // Keep historical extra keys in inherited catalogs; every English key
        // must nevertheless have its own explicit, non-empty translation.
        for (const [key, original] of Object.entries(english[namespace])) {
          const label = `${locale}/${namespace}:${key}`
          expect(Object.hasOwn(translated, key), label).toBe(true)
          const value = translated[key]
          if (original.trim()) expect(value.trim().length, label).toBeGreaterThan(0)
          // count is supplied by plural selection even when English spells
          // "1" literally; other locales may put 0 in the same category.
          const implicitCount = /_(zero|one|two|few|many|other)$/.test(key) && !placeholders(original).includes('count')
          expect(placeholders(value).filter(name => !(implicitCount && name === 'count')), label).toEqual(placeholders(original))
          expect(code(value), label).toEqual(code(original))
          expect(value, label).not.toMatch(/ZXQ|QXZ|JANPH|JANSEG|\uFFFD|[⟦⟧⟪⟫]|^के बा।\n|^Ezali ndenge moko na \.\n/)
        }
      }
    },
  )

  it.each(completedLocales)('%s loads nested preview messages and interpolates setup steps without English fallback', (locale) => {
    try {
      i18n.changeLanguage(locale)
      const preview = load(locale, 'common.json')['preview.loading']
      expect(preview).not.toBe(english['common.json']['preview.loading'])
      expect(i18n.t('common:preview.loading')).toBe(preview)
      const step = load(locale, 'setup.json').stepCounter
      expect(step).not.toBe(english['setup.json'].stepCounter)
      expect(i18n.t('setup:stepCounter', { current: 2, total: 4 })).toBe(
        step.replace('{{current}}', '2').replace('{{total}}', '4'),
      )
    } finally {
      i18n.changeLanguage('en')
    }
  })
})
