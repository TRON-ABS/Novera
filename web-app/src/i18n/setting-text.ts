import keys from './setting-text-keys.json'

type Translator = (key: string, options?: Record<string, unknown>) => string

/** Translate shipped English metadata at render time, preserving stored values. */
export function translateSettingText<T extends string | undefined | null>(text: T, t: Translator): T {
  if (!text) return text
  const key = (keys as Record<string, string>)[text.replace(/\s+/g, ' ').trim()]
  return (key ? t(key) : text) as T
}
