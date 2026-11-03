import { invoke } from '@tauri-apps/api/core'
import { isPlatformAndroid, isPlatformIOS, isPlatformTauri } from '@/lib/platform/utils'

/** Write only in response to the user's Copy action; never read clipboard data. */
export async function writeClipboardText(text: string): Promise<void> {
  if ((isPlatformAndroid() || isPlatformIOS()) && isPlatformTauri()) {
    await invoke('sharing_copy_text', { text })
    return
  }
  if (!navigator.clipboard?.writeText) throw new Error('Clipboard API not available')
  await navigator.clipboard.writeText(text)
}
