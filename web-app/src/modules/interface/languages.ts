export const supportedLanguages = [
  'en', 'bn', 'ar', 'ur', 'pcm', 'arz', 'mr', 'te', 'ta', 'sw', 'ha',
  'pnb', 'tl', 'pt-PT', 'yue', 'wuu', 'fa-IR', 'am', 'th', 'jv',
  'es', 'fr', 'it', 'hi', 'id', 'pl', 'vn', 'zh-CN', 'zh-TW',
  'de-DE', 'cs', 'pt-BR', 'ko', 'ja', 'ru', 'ca',
] as const satisfies readonly Language[]

export const isSupportedLanguage = (value: unknown): value is Language =>
  typeof value === 'string' && supportedLanguages.some((language) => language === value)

export function matchSystemLanguage(preferences: readonly string[]): Language {
  for (const preference of preferences) {
    try {
      // Accept Windows/BCP-47 tags and POSIX locales such as fr_FR.UTF-8.
      const tag = new Intl.Locale(preference.trim().replaceAll('_', '-').split(/[.@]/)[0])
      const exact = supportedLanguages.find((language) => language.toLowerCase() === tag.baseName.toLowerCase())
      if (exact) return exact
      const language = tag.language
      if (language === 'zh') {
        if (tag.script === 'Hant') return 'zh-TW'
        if (tag.script === 'Hans') return 'zh-CN'
        return ['TW', 'HK', 'MO'].includes(tag.region ?? '') ? 'zh-TW' : 'zh-CN'
      }
      if (language === 'pt') return tag.region === 'BR' ? 'pt-BR' : 'pt-PT'
      if (language === 'de') return 'de-DE'
      if (language === 'vi' || language === 'vn') return 'vn'
      if (language === 'fa') return 'fa-IR'
      if (language === 'fil') return 'tl'
      if (language === 'pa' && (tag.script === 'Arab' || (!tag.script && tag.region === 'PK'))) return 'pnb'
      if (isSupportedLanguage(language)) return language
    } catch {
      // An unavailable or invalid locale must not prevent startup.
    }
  }
  return 'en'
}

