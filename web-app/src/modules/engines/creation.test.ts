import { describe, expect, it } from 'vitest'
import {
  resolveOutputMode,
  creationReference,
  parseCreationReference,
  creationTiming,
  formatCreationDuration,
  referencesPreviousImage,
  previewOutputMode,
} from './creation'
describe('conversation output routing', () => {
  it('routes the requested Fellowship soundtrack to music before considering film references', () => {
    const request = "Crée une bande originale épique et immersive de 3 minutes pour le film La Communauté de l'Anneau (The Fellowship of the Ring, 2001), réalisé par Peter Jackson. La musique doit capturer l'essence d'une quête héroïque dans un monde fantastique : commencez par une atmosphère sombre et mystérieuse inspirée des paysages de la Terre du Milieu — des cordes de violon tendues, des percussions lentes et des chœurs lointains évoquant les légendes anciennes. Passez à un développement martial et narratif où les thèmes de la communauté, de l'amitié et du sacrifice se manifestent par des motifs répétitifs mais puissants, symbolisant la solidarité entre les membres de la Communauté. Incluez des passages dramatiques représentant le voyage vers le Mont Doom — des accents agressifs, des harmonies sombres et des crescendos qui reflètent l'urgence de détruire l'Anneau unique. Intégrez également des moments plus intimes : les dialogues entre Sam, Frodo et Gandalf, où la musique devient plus douce mais toujours chargée d'émotion. Le style doit être orchestral symphonique avec des influences celtiques — cordes (violon, violoncelle), chœurs massifs, percussions traditionnelles. Évitez les éléments trop modernes ou électroniques ; privilégiez une orchestration classique et épique qui rappelle les bandes originales de Peter Jackson. L'ensemble doit transmettre l'émerveillement face à l'inconnu, la gravité du destin et l'espoir d'un avenir meilleur."
    expect(resolveOutputMode('auto', request)).toBe('music')
  })
  it.each([
    ['Crée une bande-son pour cette vidéo', 'music'],
    ['Compose une bande sonore pour un film', 'music'],
    ['Crée la bande originale de ce film', 'music'],
    ['Generate an epic orchestral score for a fantasy film', 'music'],
    ['Une musique pour une vidéo de voyage', 'music'],
    ['Crée une vidéo avec une musique épique', 'video'],
    ['Crée une image pour la bande originale du film', 'image'],
    ['Crée un texte sur la musique du film', 'text'],
    ['Explique la bande originale de ce film', 'text'],
  ] as const)('prioritizes the requested output in %s', (prompt, expected) => {
    expect(resolveOutputMode('auto', prompt)).toBe(expected)
  })
  it('previews drafts, preserves the submitted output during a job and leaves manual choices explicit', () => {
    expect(previewOutputMode('auto', '')).toBe('text')
    expect(previewOutputMode('auto', 'Compose une chanson', 'video')).toBe('music')
    expect(previewOutputMode('auto', 'Crée une image', 'music', true)).toBe('music')
    expect(previewOutputMode('auto', '', 'music')).toBe('music')
    expect(previewOutputMode('video', 'Compose une chanson', 'music')).toBe('video')
    expect(previewOutputMode('auto', 'Explique un film', 'music')).toBe('text')
  })
  it('routes explicit music requests while preserving ordinary text requests',()=>{
    for(const prompt of ['/music ambient piano','/musique piano','Compose une chanson','Crée de la musique','Generate some music'])expect(resolveOutputMode('auto',prompt)).toBe('music')
    expect(resolveOutputMode('text','Compose une chanson')).toBe('text')
    expect(resolveOutputMode('auto','Crée un morceau de code')).toBe('text')
    expect(resolveOutputMode('auto','Explique comment créer une chanson')).toBe('text')
    expect(parseCreationReference(creationReference('music','Novera-aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.wav'))).toMatchObject({task:'music'})
    expect(parseCreationReference('novera-creation:music/Novera-aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.mp4')).toBeNull()
  })
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
  it.each([
    "la avec y a quoi comme model d'image mieux que FLUX.2 Klein 4B ?",
    "Quel modèle d'image est mieux que FLUX.2 Klein 4B ?",
    "Tu peux me conseiller un modèle pour générer une image ?",
    "What image model is better than FLUX.2 Klein 4B?",
    "Explique comment générer une image",
    "C'est quoi le meilleur modèle pour créer une image ?",
    "Compare FLUX.2 Klein 4B et Klein 9B",
    "Quelle est la différence entre ces modèles ?",
    "How do I generate an image?",
    "Can you recommend a better image model?",
  ])('answers model and generation questions in text: %s', (prompt) => {
    for (const mode of ['auto', 'image', 'video', 'music'] as const) {
      expect(resolveOutputMode(mode, prompt)).toBe('text')
    }
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
import { isLegacyCreationCaption } from './creation'
it('recognizes old standalone engine footers without hiding ordinary answers', () => {
  expect(isLegacyCreationCaption('Modèle: stable-diffusion.cpp · flux.gguf')).toBe(true)
  expect(isLegacyCreationCaption('Model: Diffusers · wan')).toBe(true)
  expect(isLegacyCreationCaption('Model: NVFP4 CUDA · flux')).toBe(true)
  expect(isLegacyCreationCaption('Model: Diffusers · wan\nHere is your video.')).toBe(false)
  expect(isLegacyCreationCaption('A landscape with mountains.')).toBe(false)
})
