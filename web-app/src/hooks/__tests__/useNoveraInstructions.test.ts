import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import i18n from '@/i18n'
import { getDefaultNoveraInstructions, getNoveraInstructions, useNoveraInstructions, withNoveraInstructions } from '../useNoveraInstructions'

vi.mock('@/lib/backendStorage', () => ({ backendStorage: {
  getItem: async () => null, setItem: async () => {}, removeItem: async () => {},
} }))
const locales = JSON.parse(readFileSync(join(__dirname, '../../../../docs/language-support.json'), 'utf8')) as { locale: string }[]
beforeEach(() => useNoveraInstructions.setState({ instructions: {} }))
afterEach(() => i18n.changeLanguage('en'))

describe('localized Novera instruction defaults', () => {
  it.each(locales.map(({ locale }) => locale))('uses all three %s defaults without falling back to another language', (locale) => {
    const catalog = JSON.parse(readFileSync(join(__dirname, `../../locales/${locale}/chat.json`), 'utf8'))
    i18n.changeLanguage(locale)
    const defaults = getDefaultNoveraInstructions()
    for (const category of ['text', 'image', 'video'] as const) {
      expect(defaults[category]).toBe(catalog.instructions[`${category}Default`])
      expect(defaults[category].length).toBeGreaterThan(30)
      expect(withNoveraInstructions(category, 'USER PROMPT')).toBe(`${defaults[category]}\n\nUSER PROMPT`)
    }
  })
  it('follows interface language until customized, preserves custom/empty values and restores dynamic defaults', () => {
    i18n.changeLanguage('fr')
    const fr = getNoveraInstructions()
    useNoveraInstructions.getState().setInstructions({ ...fr, image: 'Custom image', video: '' })
    expect(useNoveraInstructions.getState().instructions.text).toBeUndefined()
    i18n.changeLanguage('ja')
    expect(getNoveraInstructions().text).toBe(getDefaultNoveraInstructions().text)
    expect(getNoveraInstructions().text).not.toBe(fr.text)
    expect(getNoveraInstructions().image).toBe('Custom image')
    expect(withNoveraInstructions('video', 'USER PROMPT')).toBe('USER PROMPT')
    useNoveraInstructions.getState().setInstructions(getDefaultNoveraInstructions())
    expect(useNoveraInstructions.getState().instructions).toEqual({})
    i18n.changeLanguage('fr')
    expect(getNoveraInstructions()).toEqual(fr)
  })
})
