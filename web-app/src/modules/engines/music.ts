import type { ImageSeedMode } from './image-seed'
import durationUnits from './music-duration-units.json'
import { normalizeGenerationCount } from './generation-count'

const normalizeDuration = (value: string) => value.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase()
const units = Object.entries(durationUnits).flatMap(([kind, names]) => names.map((name) => ({ name: normalizeDuration(name), factor: kind === 'minute' ? 60 : 1 }))).sort((a, b) => b.name.length - a.name.length)

export interface MusicSettings {
  directory: string
  engineDirectory: string
  generator: string
  planner: string
  encoder: string
  vae: string
  device: 'auto' | 'cpu' | 'cuda'
  durationSeconds: number
  durationAuto?: boolean
  generationCount?: number
  steps: number
  bpm: number
  instrumental: boolean
  lyrics: string
  language: string
  quality: 'mp3-128' | 'mp3-320' | 'wav16' | 'wav24' | 'wav32'
  seed: number
  seedMode: ImageSeedMode
  lastSeed?: number
}
export const musicDefaults: MusicSettings = {
  generationCount: 1,
  directory: '',
  engineDirectory: '',
  generator: '',
  planner: '',
  encoder: '',
  vae: '',
  device: 'auto',
  durationSeconds: 30,
  durationAuto: true,
  steps: 8,
  bpm: 0,
  instrumental: true,
  lyrics: '',
  language: '',
  quality: 'mp3-320',
  seed: 42,
  seedMode: 'random',
}
export function normalizeMusicSettings(settings: MusicSettings): MusicSettings {
  // Validate at submission instead of silently shortening a manual request.
  return { ...settings, generationCount: normalizeGenerationCount(settings.generationCount), durationSeconds: Number.isFinite(settings.durationSeconds) ? settings.durationSeconds : 30 }
}
export function musicDurationLimits(provider?: string) {
  // Provider contracts checked against their official schemas on 2026-10-27.
  switch (provider) {
    case 'elevenlabs': return { min: 3, max: 600 }
    case 'stability': return { min: 1, max: 380 }
    case 'fal': return { min: 5, max: 240 }
    case 'replicate': return { min: 1, max: 190 }
    default: return { min: 10, max: 600 }
  }
}
export const musicFormats = {
  'mp3-128': 'MP3 · 128 kb/s',
  'mp3-320': 'MP3 · 320 kb/s',
  'wav16': 'WAV · 16 bit · 48 kHz',
  'wav24': 'WAV · 24 bit · 48 kHz',
  'wav32': 'WAV · 32 bit · 48 kHz',
} as const
export type MusicModels = Record<
  'generator' | 'planner' | 'encoder' | 'vae',
  string[]
>

/** An explicit numeric duration near the requested work overrides its preset. */
export function musicDurationFromPrompt(prompt: string): number | undefined {
  const zeroes = [0x660,0x6f0,0x966,0x9e6,0xa66,0xae6,0xb66,0xbe6,0xc66,0xce6,0xd66,0xde6,0xe50,0xed0,0x1040,0x1090,0x17e0]
  const head = normalizeDuration(prompt.slice(0, 300)).replace(/\p{Nd}/gu, (digit) => {
    const code = digit.codePointAt(0)!
    const zero = zeroes.find((start) => code >= start && code < start + 10)
    return zero === undefined ? digit : String(code - zero)
  })
  for (const match of head.matchAll(/\d+(?:[.,]\d+)?\s*/g)) {
    const after = head.slice(match.index! + match[0].length)
    const unit = units.find(({name}) => after.startsWith(name) && (!after[name.length] || !/[\p{L}\p{N}]/u.test(after[name.length]) || !/[a-z\p{Script=Cyrillic}]/u.test(name)))
    if (!unit) continue
    const seconds = Number(match[0].trim().replace(',', '.')) * unit.factor
    if (Number.isSafeInteger(seconds)) return seconds
  }
}
