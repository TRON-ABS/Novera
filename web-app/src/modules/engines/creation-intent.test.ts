import { describe, expect, it } from 'vitest'
import inventory from '../../../../docs/language-support.json'
import vocabulary from './creation-intents.json'
import examples from './creation-intent.examples.json'
import { resolveOutputMode } from './creation'
import { musicDurationFromPrompt } from './music'

describe('multilingual automatic creation', () => {
  it('covers every selectable locale without depending on the current interface language', () => {
    expect(Object.keys(vocabulary).sort()).toEqual(inventory.map((entry) => entry.locale).sort())
    expect(Object.keys(examples).sort()).toEqual(Object.keys(vocabulary).sort())
  })
  it.each(Object.entries(examples))('routes the %s music request', (_locale, prompt) => {
    expect(resolveOutputMode('auto', prompt)).toBe('music')
    expect(resolveOutputMode('text', prompt)).toBe('text')
    expect(resolveOutputMode('video', prompt)).toBe('video')
  })
  it.each(Object.entries(vocabulary))('supports explicit translated output commands for %s', (_locale, entry) => {
    for (const [output, words] of Object.entries(entry.terms)) expect(resolveOutputMode('auto', `/${words[0]} ...`)).toBe(output)
  })
  it.each([
    ['Crea una imagen para una canción', 'image'],
    ['Crea un vídeo con música', 'video'],
    ['Erstelle ein Bild für Musik', 'image'],
    ['Erstelle ein Video mit Musik', 'video'],
    ['أنشئ فيديو مع موسيقى', 'video'],
    ['Создай изображение для музыки', 'image'],
    ['Создай видео с музыкой', 'video'],
    ['映画の画像を作って', 'image'],
    ['音乐的图像，请生成', 'image'],
    ['生成带音乐的视频', 'video'],
    ['解释如何创作音乐', 'text'],
    ['音楽の作り方を説明して', 'text'],
    ['음악 만드는 방법을 설명해', 'text'],
    ['¿Qué música tiene esta película?', 'text'],
    ['Was ist Musik?', 'text'],
    ['ما هي الموسيقى؟', 'text'],
    ['Crea un prompt para una imagen', 'text'],
    ['Erstelle ein Drehbuch für ein Video', 'text'],
    ['Создай сценарий для видео', 'text'],
    ['生成视频的提示词', 'text'],
  ] as const)('keeps output and context distinct in %s', (prompt, output) => {
    expect(resolveOutputMode('auto', prompt)).toBe(output)
  })
  it('extracts a supported duration without interpreting the movie year as seconds', () => {
    expect(musicDurationFromPrompt('Crée une bande originale de 3 minutes pour le film de 2001')).toBe(180)
    expect(musicDurationFromPrompt('Compose music lasting 1.5 minutes')).toBe(90)
    expect(musicDurationFromPrompt('Compose music for a 2001 film')).toBeUndefined()
    expect(musicDurationFromPrompt('Compose music lasting 60 minutes')).toBe(3600)
    expect(musicDurationFromPrompt('أنشئ موسيقى لمدة ٣ دقائق')).toBe(180)
    expect(musicDurationFromPrompt('३ मिनेटको संगीत बनाउनुहोस्')).toBe(180)
    expect(musicDurationFromPrompt('3分の音楽を作って')).toBe(180)
    expect(musicDurationFromPrompt('3分钟音乐')).toBe(180)
  })
})
