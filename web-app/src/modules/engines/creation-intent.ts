import vocabulary from './creation-intents.json'

type Intent = 'text' | 'image' | 'music' | 'video'
const normalize = (value: string) => value.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase()
const entries = Object.values(vocabulary).map((entry) => ({
  verbs: entry.verbs.map(normalize),
  terms: Object.entries(entry.terms).flatMap(([kind, words]) => words.map((word) => ({ kind: kind as Intent, word: normalize(word) }))),
}))
const wordCharacter = /[\p{L}\p{N}]/u
const compactScript = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\p{Script=Thai}\p{Script=Khmer}\p{Script=Myanmar}]/u
const writingTargets = ['prompt','script','code','html','description','guion','descripcion','roteiro','descricao','drehbuch','beschreibung','anleitung','copione','descrizione','сценарий','описание','код','сценарій','опис','نص','سيناريو','وصف','شرح','提示词','提示詞','脚本','劇本','代码','代碼','描述','プロンプト','説明','コード','프롬프트','스크립트','설명','코드','प्रॉम्प्ट','स्क्रिप्ट','विवरण'].map(normalize)
function occurrences(text: string, word: string) {
  const found: number[] = []
  if (!word.trim()) return found
  for (let at = text.indexOf(word); at >= 0; at = text.indexOf(word, at + 1)) {
    // Word boundaries for Latin/Cyrillic avoid matching 'video' inside a noun.
    // Other scripts also support attached particles and inflections.
    if (!/[a-z\p{Script=Cyrillic}]/u.test(word) ||
      ((!at || !wordCharacter.test(text[at - 1])) && (!text[at + word.length] || !wordCharacter.test(text[at + word.length])))) found.push(at)
  }
  return found
}

/** Conservative public command vocabulary for all 80 interface locales.
 * This is a deterministic recognizer, not an unrestricted language classifier.
 * Select the work nearest its creation verb, never a later contextual keyword.
 */
export function multilingualCreationIntent(prompt: string): Intent | undefined {
  const request = normalize(prompt).trim().slice(0, 600)
  const writingAt = writingTargets.flatMap((word) => occurrences(request, word)).sort((a, b) => a - b)[0]
  let best: { kind: Intent; distance: number } | undefined
  for (const entry of entries) {
    if (request.startsWith('/')) {
      for (const { kind, word } of entry.terms) if (request.startsWith(`/${word}`) && (!request[word.length + 1] || /\s/.test(request[word.length + 1]))) return kind
      continue
    }
    for (const verb of entry.verbs) for (const at of occurrences(request, verb)) {
      const before = request.slice(0, at).trim()
      const after = request.slice(at + verb.length).trim()
      const prefix = !before || /^(?:please|bitte|por favor|per favore|alsjeblieft|alstublieft|sil vous plait|s'il vous plait)[,\s]*$/.test(before)
      const suffix = !after || /^(?:[.!?。！？]|줘|주세요|لطفا|please)[\s.!?。！？]*$/.test(after)
      if (!prefix && !suffix && !compactScript.test(verb)) continue
      if (/解释|解釋|说明|說明|如何|怎么|怎麼|説明|方法|설명|방법/.test(before)) continue
      if (/\p{Script=Han}/u.test(verb)) {
        const clause = request.slice(at + verb.length).split(/[,，。;；!?！？]/)[0].trim()
        if (writingTargets.some((word) => clause.endsWith(word))) return 'text'
      }
      for (const { kind, word } of entry.terms) for (const index of occurrences(request, word)) {
        let distance = index >= at + verb.length ? index - at - verb.length : at - index - word.length
        if (distance < 0 || (prefix && index < at) || (suffix && index > at)) continue
        if (writingAt !== undefined && writingAt < index && (prefix || compactScript.test(verb))) return 'text'
        // Chinese head nouns follow their attributes: 音乐的视频 asks for video.
        if (/\p{Script=Han}/u.test(verb) && index >= at + verb.length) {
          const clause = request.slice(at + verb.length).split(/[,，。;；!?！？]/)[0].trim()
          if (/[的嘅]/u.test(clause) && clause.endsWith(word)) distance = -1
        }
        if (!best || distance < best.distance) best = { kind, distance }
      }
    }
  }
  return best?.kind
}
