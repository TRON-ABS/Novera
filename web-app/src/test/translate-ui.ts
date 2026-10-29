import english from '@/locales/en/ui.json'

/** Keep existing key-based fixtures, but render newly localized copy in English. */
export function translateUiForTest(key: string, values: Record<string, unknown> = {}): string {
  const text = key.startsWith('ui:')
    ? (english as Record<string, string>)[key.slice(3)] ?? key
    : key
  return text.replace(/\{\{(\w+)\}\}/g, (token, name) => values[name] === undefined ? token : String(values[name]))
}
