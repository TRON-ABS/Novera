import { invoke } from '@tauri-apps/api/core'
import i18n from '@/i18n'

export interface ComponentProfile {
  id: string
  family: 'transformers' | 'onnx' | 'media' | 'video' | 'upscale'
  backend: string
  python: string
  downloadBytes: number
  requiredBytes: number
  supported: boolean
}
export interface ComponentStatus {
  profiles: { profile: ComponentProfile; state: 'ready' | 'absent' | 'error' | 'outdated'; selected: boolean; canRollback?: boolean }[]
  freeBytes: number
  operation?: { id: string; profile: string; action: string; phase: string; running: boolean; error?: string } | null
}
export type ComponentAction = 'install' | 'verify' | 'repair' | 'update' | 'select' | 'uninstall' | 'cancel' | 'rollback'
export const componentStatus = () => invoke<ComponentStatus>('components_status')
export const componentAction = (profileId: string, action: ComponentAction) =>
  invoke<string>('components_action', { profileId, action })

/** Detection proposes candidates; installation still has to pass native runtime probes. */
export function componentCompatibility(profile: ComponentProfile, nvidia: boolean) {
  return profile.supported && (profile.backend === 'cpu' || nvidia)
}

export function recommendedComponents(rows: ComponentStatus['profiles'], nvidia: boolean): Set<string> {
  const selected = new Set<string>()
  for (const family of ['transformers', 'media', 'onnx', 'video', 'upscale']) {
    const candidates = rows.filter(row => row.profile.family === family)
    const row = candidates.find(row => row.selected) ?? candidates.find(row =>
      componentCompatibility(row.profile, nvidia) && (nvidia ? row.profile.backend === 'cu130' : row.profile.backend === 'cpu')) ?? candidates[0]
    if (row) selected.add(row.profile.id)
  }
  return selected
}
export function managedDefault(value?: string): boolean {
  return !value?.trim() || ['python', 'python.exe', 'auto'].includes(value.trim()) || value.startsWith('managed:')
}

/** Localize fixed component failures at the existing engine boundary. */
export async function invokeWithComponents<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  try { return await (args === undefined ? invoke<T>(command) : invoke<T>(command, args)) }
  catch (error) {
    const code = String(error).match(/COMPONENT_[A-Z_]+/)?.[0]
    if (code) throw new Error(`${i18n.t('common:components.required')}\n${code}`)
    throw error
  }
}
