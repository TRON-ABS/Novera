import { describe, expect, it } from 'vitest'
import { parseMusicPrompt } from './music-prompt'
import { resolveOutputMode } from './creation'

export const songSheet = `**Titre : « L’élégance de la nuit »**
À coller dans **Paroles** :
\`\`\`text
[Intro]
Hey ! Hey ! Hey !
Ce soir, la nuit sera mémorable !
[Verse 1]
Un parfum d’été traverse la terrasse,
Tu souris, tous mes beaux discours s’effacent.
[Chorus]
On a la classe, classe,
Quand la basse nous embrasse !
\`\`\``

describe('pasted structured music requests', () => {
  it('routes the title and lyrics sheet to music while preserving the supplied words', () => {
    expect(resolveOutputMode('auto', songSheet)).toBe('music')
    const song = parseMusicPrompt(songSheet)!
    expect(song.caption).toBe('« L’élégance de la nuit »')
    expect(song.lyrics).toMatch(/^\[Intro\]\nHey ! Hey ! Hey !/)
    expect(song.lyrics).toContain('Tu souris, tous mes beaux discours s’effacent.')
    expect(song.lyrics).not.toMatch(/```|Titre|coller/)
  })
  it('separates the style and accompaniment from lyrics instead of singing the instructions', () => {
    const prompt = `Style & ambiance\nTropical house et EDM, 128 BPM. Chant en français.\n${songSheet.split('\n').slice(1).join('\n')}\nDescription de l’accompagnement souhaité\nBasse funky et synthés lumineux.`
    const song = parseMusicPrompt(prompt)!
    expect(song.bpm).toBe(128)
    expect(song.caption).toContain('Tropical house et EDM, 128 BPM.')
    expect(song.caption).toContain('Basse funky et synthés lumineux.')
    expect(song.lyrics).not.toContain('accompagnement')
    expect(song.lyrics).not.toContain('synthés')
  })
  it.each(['Écris des paroles à partir de ce texte :', 'Analyse ces paroles :', 'Traduis ces paroles :', 'Explique ces paroles :'])(
    'keeps a writing/analysis request as text: %s', (prefix) => {
      expect(resolveOutputMode('auto', `${prefix}\n${songSheet}`)).toBe('text')
    }
  )
  it('requires actual song sections and lyrics, and preserves explicit text mode', () => {
    expect(resolveOutputMode('auto', '**Titre : « L’élégance de la nuit »**')).toBe('text')
    expect(resolveOutputMode('auto', 'À coller dans Paroles :')).toBe('text')
    expect(resolveOutputMode('text', songSheet)).toBe('text')
    expect(resolveOutputMode('auto', `/texte ${songSheet}`)).toBe('text')
  })
  it('recognizes lyrics beginning directly with Intro without requiring a title or creation verb', () => {
    const lyrics = parseMusicPrompt(songSheet)!.lyrics
    expect(resolveOutputMode('auto', lyrics)).toBe('music')
    expect(parseMusicPrompt(lyrics)).toMatchObject({ caption: '', lyrics })
  })
})
