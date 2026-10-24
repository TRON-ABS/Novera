import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { intlLocale } from '@/utils/intlLocale'

const root = resolve(import.meta.dirname, '../../../..')
const locales = JSON.parse(readFileSync(resolve(root, 'docs/language-support.json'), 'utf8')) as {locale: string}[]
const chatKeys = [
  'actions.regenerate', 'actions.askAgain', 'actions.continue', 'actions.remember',
  'actions.rememberSaved', 'actions.rememberExists', 'actions.rememberFailed',
  'messageActions.previousVersion', 'messageActions.nextVersion', 'messageActions.generationFailed',
  'messageStats.details', 'messageStats.generation', 'messageStats.reading', 'messageStats.tokens', 'messageStats.perSecond',
]
const get = (value: Record<string, unknown>, key: string): unknown =>
  key.split('.').reduce<unknown>((current, part) => (current as Record<string, unknown>)?.[part], value)

describe('message footer localization', () => {
  it.each(locales)('has native catalog entries for every footer action in $locale', ({locale}) => {
    const folder = resolve(root, 'web-app/src/locales', locale)
    const chat = JSON.parse(readFileSync(resolve(folder, 'chat.json'), 'utf8'))
    const common = JSON.parse(readFileSync(resolve(folder, 'common.json'), 'utf8'))
    for (const key of chatKeys) expect(get(chat, key), `${locale}:${key}`).toBeTypeOf('string')
    for (const key of ['copy','copied','edit','deleteMessage','dialogs.deleteMessage.description'])
      expect(get(common, key), `${locale}:${key}`).toBeTypeOf('string')
    for (const key of ['actions.rememberSaved','actions.rememberExists'])
      expect(get(chat, key)).toContain('{{name}}')
    expect(() => new Intl.DateTimeFormat(intlLocale(locale)).format(new Date())).not.toThrow()
    expect(() => new Intl.NumberFormat(intlLocale(locale)).format(194.5)).not.toThrow()
  })
})
