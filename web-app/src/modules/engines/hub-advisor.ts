import type { HubDiagnosis } from './hub-catalog'

export type HubPriority = 'ready' | 'compact' | 'recent'
export interface AdviceCandidate {
  id: string
  diagnosis: HubDiagnosis
  updatedAt?: string
  languages?: readonly string[]
  preferred?: boolean
}
export interface HubAdvice {
  picks: { id: string; reasons: string[] }[]
  tips: string[]
}

/** Explainable local suggestions. Neither parameter count nor file size implies model quality. */
export function adviseHub(candidates: readonly AdviceCandidate[], priority: HubPriority, language: string, now = Date.now()): HubAdvice {
  const locale = language.toLowerCase().split('-')[0]
  const languageMatches = (candidate: AdviceCandidate) => candidate.languages?.some(code => code.toLowerCase().split('-')[0] === locale) ?? false
  const date = (candidate: AdviceCandidate) => Date.parse(candidate.updatedAt ?? '') || 0
  const usable = candidates.filter(candidate => candidate.diagnosis.canDownload &&
    ['fits', 'tight'].includes(candidate.diagnosis.memory) && (candidate.diagnosis.weightsBytes ?? 0) > 0)
  const ordered = [...usable].sort((left, right) => {
    const memory = Number(left.diagnosis.memory !== 'fits') - Number(right.diagnosis.memory !== 'fits')
    if (memory) return memory
    const runtime = Number(left.diagnosis.engineState !== 'check') - Number(right.diagnosis.engineState !== 'check')
    if (runtime) return runtime
    if (priority === 'compact' && left.diagnosis.weightsBytes !== right.diagnosis.weightsBytes) return left.diagnosis.weightsBytes! - right.diagnosis.weightsBytes!
    if (priority === 'recent' && date(left) !== date(right)) return date(right) - date(left)
    const linguistic = Number(languageMatches(right)) - Number(languageMatches(left))
    if (linguistic) return linguistic
    if (priority === 'ready' && left.preferred !== right.preferred) return Number(!!right.preferred) - Number(!!left.preferred)
    return left.diagnosis.weightsBytes! - right.diagnosis.weightsBytes! || left.id.localeCompare(right.id)
  })
  const picks = ordered.slice(0, 3).map(candidate => {
    const reasons: string[] = []
    if (candidate.diagnosis.memory === 'fits' && candidate.diagnosis.engineState === 'check') reasons.push('reasonReady')
    if (languageMatches(candidate)) reasons.push('reasonLanguage')
    if (priority === 'recent' && date(candidate) <= now && now - date(candidate) < 180 * 86400000) reasons.push('reasonRecent')
    else if (priority === 'compact' || (candidate.diagnosis.weightsBytes ?? Infinity) < 1e9) reasons.push('reasonSmall')
    if (candidate.diagnosis.engineState === 'runtime') reasons.push('tipRuntime')
    if (candidate.diagnosis.memory === 'tight') reasons.push('tipLimited')
    return { id: candidate.id, reasons: reasons.slice(0, 3) }
  })
  const tips: string[] = []
  if (candidates.length && candidates.every(candidate => candidate.diagnosis.engineState === 'planned' || candidate.diagnosis.engineState === 'platform')) tips.push('tipFuture')
  if (candidates.some(candidate => ['insufficient', 'tight'].includes(candidate.diagnosis.memory))) tips.push('tipLimited')
  if (candidates.some(candidate => candidate.diagnosis.engineState === 'runtime')) tips.push('tipRuntime')
  if (candidates.some(candidate => candidate.diagnosis.ramBudgetBytes === null)) tips.push('hardwareUnknown')
  if (candidates.some(candidate => candidate.diagnosis.engine !== 'future')) tips.push('contextTip')
  return { picks, tips: [...new Set(tips)].slice(0, 3) }
}
