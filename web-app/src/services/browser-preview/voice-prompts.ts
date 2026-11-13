// Task prompts documented by LiquidAI/LFM3-Omni-2B, not chat paraphrases.
const languages: Record<string, string> = {
  ar: 'Arabic', da: 'Danish', de: 'German', el: 'Greek', en: 'American English',
  'en-us': 'American English', 'en-gb': 'British English', fi: 'Finnish', fr: 'French',
  he: 'Hebrew', it: 'Italian', ja: 'Japanese', ko: 'Korean', nl: 'Dutch', pl: 'Polish',
  pt: 'Portuguese', es: 'Spanish', sv: 'Swedish', tr: 'Turkish', zh: 'Chinese',
}
export function omniSpeechLanguage(locale: string) {
  const normalized = locale.toLowerCase().replaceAll('_', '-')
  const language = languages[normalized] ?? languages[normalized.split('-')[0]]
  if (!language) throw new Error('unavailable')
  return language
}
export function omniTtsPrompt(locale: string, voice: 'male' | 'female' = 'male') {
  return `Perform TTS in ${omniSpeechLanguage(locale)} using a ${voice} voice.`
}
export function omniAsrPrompt(locale: string) { return `Perform ASR in ${omniSpeechLanguage(locale)}.` }
export function nativeSpeechSettings(prompt: unknown) {
  const text = typeof prompt === 'string' ? prompt : ''
  const named = /Perform (?:TTS|ASR) in (.+?)(?: using a |\.)/.exec(text)?.[1]
  const locale = Object.entries(languages).find(([, name]) => name === named)?.[0]
  const hint = /(?:Language(?: hint)?):\s*([a-z]{2}(?:-[a-z]{2})?)/i.exec(text)?.[1].toLowerCase()
  return { lang: locale ?? hint ?? 'fr', voice: /using a female voice\./.test(text) ? 'female' : 'male' }
}
