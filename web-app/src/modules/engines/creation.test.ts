import { describe, expect, it } from 'vitest'
import {
  resolveOutputMode,
  creationReference,
  parseCreationReference,
  creationTiming,
  formatCreationDuration,
  referencesPreviousImage,
} from './creation'
describe('conversation output routing', () => {
  it('keeps manual choices and ordinary questions in text', () => {
    expect(resolveOutputMode('text', 'crée une vidéo')).toBe('text')
    expect(resolveOutputMode('image', 'a landscape')).toBe('image')
    expect(resolveOutputMode('auto', 'Explique comment créer une image')).toBe(
      'text'
    )
  })
  it('recognizes explicit commands and French/English creation requests', () => {
    expect(resolveOutputMode('auto', '/image a landscape')).toBe('image')
    expect(resolveOutputMode('auto', '/video a landscape')).toBe('video')
    expect(resolveOutputMode('auto', 'Crée une image de forêt')).toBe('image')
    expect(resolveOutputMode('auto', 'Generate a video of a forest')).toBe(
      'video'
    )
    expect(resolveOutputMode('auto', 'Anime cette image')).toBe('video')
    expect(resolveOutputMode('auto', 'Modifie cette image')).toBe('image')
  })
  it.each([
    ['Peux-tu me créer une image de forêt ?', 'image'],
    ['Bonjour, pourrais-tu générer une vidéo de forêt ?', 'video'],
    ['S’il te plaît, fais-moi une image de château', 'image'],
    ['Fais-moi une vidéo de château', 'video'],
    ['  /image une forêt', 'image'],
    ['Could you please generate an image of a video camera?', 'image'],
    ['Une belle image de château', 'image'],
    ['Peux-tu modifier cette photo ?', 'image'],
    ['Peux-tu animer cette image ?', 'video'],
    ['Peux-tu me rédiger un prompt pour créer une vidéo ?', 'text'],
    ['Crée un prompt pour une image', 'text'],
    ['Generate a script for a video', 'text'],
    ['Peux-tu expliquer comment créer une image ?', 'text'],
    ['Compare image and video generation', 'text'],
    ['une voiture du futur', 'text'],
    ['What is an image?', 'text'],
    ['Dessine un chat', 'image'],
    ['Please draw a castle', 'image'],
    ['Crée un site avec une image', 'text'],
    ['Create a beautiful poem about a photo', 'text'],
    ['Crée pour moi un prompt pour une vidéo', 'text'],
    ['Create a video script', 'text'],
    ['Make an image prompt', 'text'],
  ] as const)('routes %s to %s', (prompt, expected) => {
    expect(resolveOutputMode('auto', prompt)).toBe(expected)
  })
  it('preserves previous-image references after polite prefixes', () => {
    expect(referencesPreviousImage('Peux-tu modifier cette image ?')).toBe(true)
    expect(referencesPreviousImage('Please animate this image')).toBe(true)
    expect(referencesPreviousImage('Crée une autre image')).toBe(false)
  })
  it('keeps references portable and rejects traversal or arbitrary files', () => {
    const name = 'Novera-aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.png'
    expect(parseCreationReference(creationReference('image', name))).toEqual({
      task: 'image',
      name,
    })
    expect(
      parseCreationReference('novera-creation:image/..%2Fsecret.png')
    ).toBeNull()
    expect(parseCreationReference('file:///home/user/secret.png')).toBeNull()
  })
  it('validates persisted durations and formats seconds, minutes and hours', () => {
    expect(creationTiming({ totalMs: 65000, generationMs: 2500 })).toEqual({
      totalMs: 65000,
      generationMs: 2500,
    })
    expect(creationTiming({ totalMs: -1 })).toBeUndefined()
    expect(creationTiming({ totalMs: 2000, generationMs: 5000 })).toEqual({
      totalMs: 2000,
    })
    expect(formatCreationDuration(2500, 'en-US')).toBe('2.5 sec')
    expect(formatCreationDuration(3665000, 'en-US')).toBe('1 hr 1 min 5 sec')
    expect(formatCreationDuration(2500, 'fr-FR')).toMatch(/2,5/)
  })
})
