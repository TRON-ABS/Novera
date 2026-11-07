const musicPhases = {
  plannerLoadMs: 'Préparation du planificateur',
  planningMs: 'Chargement et planification musicale',
  plannerReleaseMs: 'Libération du planificateur',
  synthLoadMs: 'Préparation de la synthèse',
  synthesisMs: 'Chargement et synthèse audio',
  audioDecodeMs: 'Chargement et décodage audio',
  normalizationMs: 'Normalisation audio',
} as const

export function browserMusicTiming(phase: unknown, milliseconds: unknown): Record<string, number> {
  return typeof phase === 'string' && Object.hasOwn(musicPhases, phase) && typeof milliseconds === 'number' && Number.isFinite(milliseconds) && milliseconds >= 0 && milliseconds <= 7 * 24 * 3600 * 1000 ? { [phase]: milliseconds } : {}
}

export function browserMusicPerformance(value: unknown) {
  if (!value || typeof value !== 'object') return []
  const record = value as Record<string, unknown>
  return Object.entries(musicPhases).flatMap(([phase, label]) => Object.values(browserMusicTiming(phase, record[phase])).map(ms => ({ label, ms })))
}
