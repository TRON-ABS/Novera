// Compatibility entry point. Policies and native access live in separate modules.
export { supportedLanguages, isSupportedLanguage, matchSystemLanguage } from '@/modules/interface/languages'
export { browserLanguagePreferences } from '@/modules/platform/browser-language'
import { matchSystemLanguage } from '@/modules/interface/languages'
import { readSystemLanguagePreferences } from '@/modules/platform/system-locale'

export async function detectSystemLanguage(): Promise<Language> {
  return matchSystemLanguage(await readSystemLanguagePreferences())
}
