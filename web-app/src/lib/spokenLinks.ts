// Keep descriptive link labels, but never read icon labels or URL addresses.
// Scan balanced destinations so URL parentheses / quoted titles cannot leak
// into speech. This is text preparation only; it never opens a URL.
export function spokenLinks(text: string): string {
  const link = /(!?)\[(\[cite:[^\]\n]*\]|[^\]\n]*)\]\(/gi
  let result = '', cursor = 0
  for (let match = link.exec(text); match; match = link.exec(text)) {
    let end = link.lastIndex, depth = 1, quote = ''
    for (; end < text.length && depth; end++) {
      const character = text[end]
      if (character === '\\') { end++; continue }
      if (quote) { if (character === quote) quote = ''; continue }
      if ((character === '"' || character === "'") && /\s/.test(text[end-1])) { quote = character; continue }
      if (character === '(') depth++
      else if (character === ')') depth--
    }
    if (depth) break
    const label = match[2].trim()
    const decorative = match[1] || /^\[cite:/i.test(label) || /^(?:image|source|favicon|icon|icône)$/i.test(label) || /^(?:https?:\/\/|www\.)/i.test(label)
    result += text.slice(cursor,match.index) + (decorative ? '' : label)
    cursor = end
    link.lastIndex = end
  }
  return (result + text.slice(cursor))
    .replace(/\b(?:https?:\/\/|www\.)[^\s<>[\]]+/gi, address => address.match(/[.!?,;:]+$/)?.[0] ?? '')
    .replace(/\((?:\s|[()[\]])*\)|\[(?:\s|[()[\]])*\]/g,'')
}
