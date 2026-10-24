import { locale } from '@tauri-apps/plugin-os'
import { isPlatformTauri } from '@/lib/platform/utils'
import { browserLanguagePreferences } from './browser-language'

/** Native language preferences only; choosing a supported UI language is a UI policy. */
export async function readSystemLanguagePreferences(): Promise<string[]> {
  if (isPlatformTauri()) {
    try {
      const systemLocale = await locale()
      if (systemLocale) return [systemLocale, ...browserLanguagePreferences()]
    } catch {
      // Browser preferences remain available when OS IPC fails.
    }
  }
  return browserLanguagePreferences()
}
