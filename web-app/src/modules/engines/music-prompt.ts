/** Recognize a pasted song sheet, without treating requests to write lyrics as audio. */
const normalize = (value: string) => value.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase()
const clean = (line: string) => line.trim().replace(/^>\s?/, '').replace(/^#{1,6}\s+/, '').replace(/^\*\*(.*?)\*\*$/, '$1').trim()
const section = (line: string) => /^\[(?:intro|outro|verse|couplet|pre[- ]?(?:chorus|refrain)|post[- ]chorus|chorus|refrain|bridge|pont|final chorus)(?:\b|\s|[-—])/i.test(normalize(line))
const lyricsHeader = (line: string) => /^(?:(?:a coller dans|paste (?:into|in))\s+)?(?:paroles|lyrics)\b/.test(normalize(line).replace(/[*_]/g, ''))
const styleHeader = (line: string) => /^(?:style\s*(?:&|et|and)\s*ambiance|description de l['’]accompagnement souhaite|description de l['’]accompagnement|accompagnement souhaite|balises de style|pour la voix,|astuce\s*:)/.test(normalize(line).replace(/[*_]/g, ''))

export type MusicPrompt = { caption: string; lyrics: string; bpm?: number }
export function parseMusicPrompt(prompt: string): MusicPrompt | undefined {
  const lines = prompt.split(/\r?\n/).map(clean).filter((line) => !/^```(?:text|lyrics|paroles)?\s*$/i.test(line))
  const first = lines.find((line) => line.length) ?? ''
  const title = /^(?:titre|title)\s*:\s*(.+)$/i.exec(first)
  if (!title && !lyricsHeader(first) && !styleHeader(first) && !section(first)) return
  const start = lines.findIndex(section)
  if (start < 0) return
  let end = lines.findIndex((line, index) => index > start && styleHeader(line))
  if (end < 0) end = lines.length
  const lyrics = lines.slice(start, end)
  if (lyrics.filter(section).length < 2 || lyrics.filter((line) => line && !section(line) && line !== '---').length < 4) return
  const description = [...lines.slice(title ? 1 : 0, start), ...lines.slice(end)]
    .filter((line) => line && line !== '---' && !lyricsHeader(line) && !styleHeader(line))
    .join('\n').trim()
  const caption = description || title?.[1] || ''
  const tempo = /\b(\d{2,3})\s*bpm\b/i.exec(caption)
  const bpm = tempo ? Number(tempo[1]) : undefined
  return { caption, lyrics: lyrics.join('\n').trim(), ...(bpm && bpm >= 30 && bpm <= 300 ? { bpm } : {}) }
}
