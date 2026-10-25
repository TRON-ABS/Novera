export const supportedLanguages = [
  'en', 'bn', 'ar', 'ur', 'pcm', 'arz', 'mr', 'te', 'ta', 'sw', 'ha',
  'pnb', 'tl', 'pt-PT', 'yue', 'wuu', 'fa-IR', 'am', 'th', 'jv', 'gu', 'kn', 'apc', 'apd',
  'yo', 'bho', 'cjy', 'nan', 'my', 'arq', 'hak', 'ln', 'ary', 'or',
  'uk', 'hsn', 'ml', 'sd', 'pa', 'su', 'ig', 'prs', 'ne', 'ms',
  'uzn', 'zu', 'aec', 'pbu', 'gaz', 'skr', 'nl', 'so', 'ro', 'as',
  'es', 'fr', 'it', 'hi', 'id', 'pl', 'vn', 'zh-CN', 'zh-TW',
  'de-DE', 'cs', 'pt-BR', 'ko', 'ja', 'ru', 'ca',
] as const satisfies readonly Language[]

export const isSupportedLanguage = (value: unknown): value is Language =>
  typeof value === 'string' && supportedLanguages.some((language) => language === value)

export function matchSystemLanguage(preferences: readonly string[]): Language {
  for (const preference of preferences) {
    try {
      // Accept Windows/BCP-47 tags and POSIX locales such as fr_FR.UTF-8.
      const normalized = preference.trim().replaceAll('_', '-').split(/[.@]/)[0]
      const tag = new Intl.Locale(normalized)
      // Intl canonicalizes dialect identifiers; keep Southern Pashto distinct.
      if (normalized.split('-')[0].toLowerCase() === 'pbt') continue
      if (tag.language === 'uz' && tag.script && tag.script !== 'Latn') continue
      if (tag.language === 'ps' && tag.script && tag.script !== 'Arab') continue
      if (tag.language === 'om' && tag.script && tag.script !== 'Latn') continue
      const exact = supportedLanguages.find((language) => language.toLowerCase() === tag.baseName.toLowerCase())
      if (exact) return exact
      const language = tag.language
      if (language === 'uz') return 'uzn'
      if (language === 'ps') return 'pbu'
      if (language === 'om') return 'gaz'
      if (language === 'zh') {
        if (tag.script === 'Hant') return 'zh-TW'
        if (tag.script === 'Hans') return 'zh-CN'
        return ['TW', 'HK', 'MO'].includes(tag.region ?? '') ? 'zh-TW' : 'zh-CN'
      }
      if (language === 'pt') return tag.region === 'BR' ? 'pt-BR' : 'pt-PT'
      if (language === 'de') return 'de-DE'
      if (language === 'vi' || language === 'vn') return 'vn'
      if (language === 'fa' && tag.region === 'AF') return 'prs'
      if (language === 'fa') return 'fa-IR'
      if (language === 'fil') return 'tl'
      if (language === 'ar' && ['LB', 'SY', 'JO', 'PS'].includes(tag.region ?? '')) return 'apc'
      if (language === 'ar' && tag.region === 'SD') return 'apd'
      if (language === 'ar' && tag.region === 'DZ') return 'arq'
      if (language === 'ar' && tag.region === 'MA') return 'ary'
      if (language === 'pa' && (tag.script === 'Arab' || (!tag.script && tag.region === 'PK'))) return 'pnb'
      // The Sindhi catalog uses Arabic script, not the Devanagari variant.
      if (language === 'sd' && tag.script === 'Deva') continue
      if (isSupportedLanguage(language)) return language
    } catch {
      // An unavailable or invalid locale must not prevent startup.
    }
  }
  return 'en'
}

