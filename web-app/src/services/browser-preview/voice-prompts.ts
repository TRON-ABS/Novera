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
