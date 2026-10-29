import { multilingualCreationIntent } from './creation-intent'
import { parseMusicPrompt } from './music-prompt'

export type OutputMode = 'auto' | 'text' | 'image' | 'music' | 'video'
export type CreationTask = 'image' | 'music' | 'video'
export type CreationTiming = { totalMs: number; generationMs?: number }
export function creationTiming(value: unknown): CreationTiming | undefined {
  if (!value || typeof value !== 'object') return
  const { totalMs, generationMs } = value as Record<string, unknown>
  const valid = (v: unknown): v is number =>
    typeof v === 'number' &&
    Number.isFinite(v) &&
    v >= 0 &&
    v <= 7 * 24 * 3600 * 1000
  if (!valid(totalMs)) return
  return {
    totalMs,
    ...(valid(generationMs) && generationMs <= totalMs ? { generationMs } : {}),
  }
}
export function formatCreationDuration(ms: number, locale: string): string {
  const seconds = ms / 1000
  const unit = (
    value: number,
    name: 'second' | 'minute' | 'hour',
    fraction = 0
  ) =>
    new Intl.NumberFormat(locale, {
      style: 'unit',
      unit: name,
      unitDisplay: 'short',
      maximumFractionDigits: fraction,
    }).format(value)
  if (seconds < 60) return unit(seconds, 'second', 1)
  const whole = Math.floor(seconds)
  return [
    whole >= 3600 ? unit(Math.floor(whole / 3600), 'hour') : '',
    unit(Math.floor(whole / 60) % 60, 'minute'),
    unit(whole % 60, 'second'),
  ]
    .filter(Boolean)
    .join(' ')
}
export function resolveOutputMode(
  mode: OutputMode,
  prompt: string
): Exclude<OutputMode, 'auto'> {
  if (mode === 'text') return 'text'
  const request = creationRequestText(prompt)
  // A selected media model must not turn a comparison or explanation into a
  // generation job. Keep this anchored to the request: a trailing question mark
  // or a question quoted inside an actual creation prompt is not enough.
  const informationRequest = /^(?:quels?|quelles?|comment|pourquoi|combien|quand|ou|qu'est[- ]ce|est[- ]ce|c'est quoi|what|which|why|when|where|how|explique|explain|compare|comparaison|recommend|recommande|conseille|conseiller|conseilles|recommander)(?!\p{L})/u.test(request) ||
    /^(?:(?:la|avec|et|donc|sinon|du coup|alors)\s+)*(?:il\s+)?y\s+a\s+quoi\b/.test(request)
  if (informationRequest) return 'text'
  if (mode !== 'auto') return mode
  // Explicit slash commands work independently of interface language.
  if (/^\/image(?:\s|$)/.test(request)) return 'image'
  if (/^\/(?:music|musique)(?:\s|$)/.test(request)) return 'music'
  if (/^\/video(?:\s|$)/.test(request)) return 'video'
  if (/^\/(?:text|texte)(?:\s|$)/.test(request)) return 'text'
  if (parseMusicPrompt(prompt)) return 'music'
  const action = /^(?:cree|creer|genere|generer|dessine|dessiner|fais|faire|realise|realiser|produis|produire|compose|composer|create|generate|draw|paint|make|produce|render|design|anime|animer|animate|modifie|modifier|retouche|retoucher|edit|modify)(?:[- ](?:moi|nous|me|us))?(?!\p{L})\s*/u.exec(request)
  const body = (action ? request.slice(action[0].length) : request).replace(/^(?:pour|for)\s+(?:moi|nous|me|us)\s+/, '')
  // A request to write a prompt, explanation, script or code stays text even
  // when it names media later in the sentence. Never inspect global instructions.
  if (/^(?:(?:un|une|le|la|les|des|a|an|the|this|cette|ce|mon|ma)\s+)?(?:(?:petit|petite|beau|belle|bon|bonne|court|courte|long|longue|simple|complet|complete|good|short|long|detailed|beautiful|small|brief)\s+){0,3}(?:prompt|texte|text|description|explication|explanation|script|scenario|storyboard|code|html|guide|tutoriel|tutorial|reponse|answer|instruction|instructions|site|website|application|app|tableau|dashboard|interface|table|message|lettre|letter|article|histoire|story|poeme|poem|email|e-mail)\b/.test(body)) return 'text'
  if (/^(?:(?:un|une|a|an|the)\s+)?(?:video|image|photo)\s+(?:prompt|script|description|tutorial|guide)\b/.test(body)) return 'text'
  if (/^(?:anime|animer|animate)\b/.test(request)) return 'video'
  const multilingual = multilingualCreationIntent(request)
  if (multilingual) return multilingual
  // Identify the requested work before its subject: a soundtrack for a film
  // remains music, just as a video about music remains video.
  const musicRequest = /^(?:(?:un|une|du|de la|a|an|the|some|la|le)\s+)?(?:(?:nouveau|nouvelle|original|originale|epique|immersif|immersive|epic|immersive|original|cinematic|orchestral|orchestrale|beautiful|short|court|courte)\s+){0,4}(?:musique|music|chanson|song|soundtrack|score|melodie|melody|bande[- ](?:son(?:ore)?|originale)|morceau\s+(?:de\s+musique|musical))\b/.test(body)
  if ((action || /^(?:une?|a|an|the|la|le)\s+/.test(body)) && musicRequest) return 'music'
  const subject = /\b(image|photo|photographie|illustration|picture|painting|portrait|logo|dessin|visuel|video|clip|animation|film)\b/.exec(body)
  const nounRequest = /^(?:(?:un|une|a|an|the|la|le)\s+)?(?:(?:beau|belle|magnifique|beautiful|realistic|realiste|joli|jolie|court|courte|short)\s+){0,3}(?:image|photo|illustration|portrait|logo|video|clip|animation)\s+(?:de\b|d'|of\b|avec\b|showing\b|montrant\b)/.test(body)
  if (subject && (action || nounRequest)) {
    return /^(?:video|clip|animation|film)$/.test(subject[1]) ? 'video' : 'image'
  }
  if (/^(?:dessine|dessiner|draw|paint)\b/.test(request)) return 'image'
  return 'text'
}

/** Automatic preview follows the draft, then the last submitted work. */
export function previewOutputMode(mode: OutputMode, prompt: string, submitted?: Exclude<OutputMode, 'auto'>, busy = false): Exclude<OutputMode, 'auto'> {
  if (busy && submitted) return submitted
  if (mode !== 'auto' || prompt.trim()) return resolveOutputMode(mode, prompt)
  return submitted ?? 'text'
}

function creationRequestText(prompt: string) {
  let request = prompt.trim().normalize('NFKD').replace(/\p{M}/gu, '').replace(/[’‘]/g, "'").toLowerCase()
  // Bound the stripping pass, keeping ordinary questions and nouns conservative.
  const prefix = /^(?:(?:bonjour|salut|hello|hi)[,!:\s]+|(?:s'il (?:te|vous) plait|stp|svp|please|peux[- ]tu|pouvez[- ]vous|pourrais[- ]tu|pourriez[- ]vous|tu peux|vous pouvez|can you|could you|would you|i want you to|je veux|je voudrais|je souhaite|j'aimerais)[,!:\s]+|(?:me|nous|que tu)\s+)/
  for (let i = 0; i < 6; i++) {
    const next = request.replace(prefix, '')
    if (next === request) break
    request = next.trimStart()
  }
  return request
}
export function referencesPreviousImage(prompt: string) {
  return /^(?:animate|anime|animer|modifie|modifier|retouche|retoucher|edit|modify)\b/.test(creationRequestText(prompt))
}
export const CREATION_PREFIX = 'novera-creation:'
export function creationReference(task: CreationTask, name: string) {
  return `${CREATION_PREFIX}${task}/${encodeURIComponent(name)}`
}
export function parseCreationReference(
  url: string
): { task: CreationTask; name: string } | null {
  const match = /^novera-creation:(image|music|video)\/([^/]+)$/.exec(url)
  if (!match) return null
  try {
    const name = decodeURIComponent(match[2])
    if (!/^Novera-[a-f0-9-]+\.(png|jpg|jpeg|webp|mp4|webm|wav|mp3)$/.test(name)) return null
    if (
      match[1] === 'image'
        ? !/\.(png|jpg|jpeg|webp)$/.test(name)
        : match[1] === 'music' ? !/\.(wav|mp3)$/.test(name) : !/\.(mp4|webm)$/.test(name)
    )
      return null
    return { task: match[1] as CreationTask, name }
  } catch {
    return null
  }
}

/** Hide only the standalone native-engine footer emitted by older app builds. */
export function isLegacyCreationCaption(text: string): boolean {
  return /^[^:\r\n]{1,60}:\s*(?:stable-diffusion\.cpp|NVFP4 CUDA|Diffusers)\s*·\s*[^\r\n]+$/i.test(text.trim())
}
