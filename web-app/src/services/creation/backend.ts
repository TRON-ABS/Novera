import { invoke } from '@tauri-apps/api/core'
import { browserPreviewEnabled } from '../browser-preview/config'

/** Keep native commands native; the opt-in Web build owns its media storage. */
export function invokeCreation<T = unknown>(command: string, args?: Record<string, unknown>): Promise<T> {
  if (!browserPreviewEnabled()) return invoke<T>(command, args)
  return import('../browser-preview/media').then(module => module.browserMediaCommand(command, args)) as Promise<T>
}
