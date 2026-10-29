import { invoke } from '@tauri-apps/api/core'
import { isPlatformTauri } from '@/lib/platform/utils'

/** Tray labels also survive closing/reopening the main webview. */
export async function syncTrayLabels(open: string, quit: string): Promise<void> {
  if (!isPlatformTauri()) return
  await invoke('set_tray_labels', { open, quit })
}
