export function browserLanguagePreferences(): string[] {
  if (typeof navigator === 'undefined') return []
  return [...(navigator.languages ?? []), navigator.language].filter(Boolean)
}

