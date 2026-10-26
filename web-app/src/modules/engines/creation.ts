export type OutputMode = 'auto' | 'text' | 'image' | 'video'
export type CreationTask = 'image' | 'video'
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
  if (mode !== 'auto') return mode
  // Explicit commands are language-independent; ambiguous questions stay text.
  if (/^\/image(?:\s|$)/i.test(prompt)) return 'image'
  if (/^\/video(?:\s|$)/i.test(prompt)) return 'video'
  if (
    /^animate\b/i.test(prompt) ||
    /^(?:anime|animer)\s+(?:cette|cet|une|mon|ma|l['’])/i.test(prompt)
  )
    return 'video'
  if (
    /^(?:modifie|modifier|retouche|retoucher|edit|modify)\b.{0,80}\b(?:image|photo|picture)\b/iu.test(
      prompt
    )
  )
    return 'image'
  if (
    /^(?:crée|créer|génère|générer|dessine|create|generate|draw)\b.{0,80}\b(?:vidéo|video|clip)\b/iu.test(
      prompt
    )
  )
    return 'video'
  if (
    /^(?:crée|créer|génère|générer|dessine|create|generate|draw)\b.{0,80}\b(?:image|photo|illustration|picture)\b/iu.test(
      prompt
    )
  )
    return 'image'
  return 'text'
}
export function referencesPreviousImage(prompt: string) {
  return /^(?:animate|anime|animer|modifie|modifier|retouche|retoucher|edit|modify)\b/iu.test(
    prompt
  )
}
export const CREATION_PREFIX = 'novera-creation:'
export function creationReference(task: CreationTask, name: string) {
  return `${CREATION_PREFIX}${task}/${encodeURIComponent(name)}`
}
export function parseCreationReference(
  url: string
): { task: CreationTask; name: string } | null {
  const match = /^novera-creation:(image|video)\/([^/]+)$/.exec(url)
  if (!match) return null
  try {
    const name = decodeURIComponent(match[2])
    if (!/^Novera-[a-f0-9-]+\.(png|jpg|jpeg|webp|mp4)$/.test(name)) return null
    if (
      match[1] === 'image'
        ? !/\.(png|jpg|jpeg|webp)$/.test(name)
        : !name.endsWith('.mp4')
    )
      return null
    return { task: match[1] as CreationTask, name }
  } catch {
    return null
  }
}
