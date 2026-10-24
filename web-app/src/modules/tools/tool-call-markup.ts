const OPEN = '<|tool_call_start|>'
const CLOSE = '<|tool_call_end|>'

/** Some local models print tool protocol as prose. It is never executable text.
 * Keep actual code examples intact, and hide unfinished protocol while streaming.
 */
export function stripToolCallMarkup(input: string): string {
  if (!input.includes('<|')) return input
  let hidden = false
  const prose = (text: string, final = false): string => {
    let result = ''
    let offset = 0
    for (const token of text.matchAll(/<\|tool_call_(?:start|end)\|>/g)) {
      if (!hidden) result += text.slice(offset, token.index)
      hidden = token[0] === OPEN
      offset = token.index! + token[0].length
    }
    if (!hidden) result += text.slice(offset)
    if (final && !hidden) {
      // A generated delimiter may stop midway, or arrive one character at a time.
      for (let length = Math.min(OPEN.length - 1, result.length); length >= 2; length--) {
        const suffix = result.slice(-length)
        if (OPEN.startsWith(suffix) || CLOSE.startsWith(suffix)) return result.slice(0, -length)
      }
    }
    return result
  }
  const inline = (text: string, final = false): string => {
    const runs = /`+/g
    let result = ''
    let cursor = 0
    let open: RegExpExecArray | null
    while ((open = runs.exec(text)) !== null) {
      const afterOpen = runs.lastIndex
      let close: RegExpExecArray | null
      while ((close = runs.exec(text)) !== null) {
        if (close[0].length === open[0].length) break
      }
      if (!close) { runs.lastIndex = afterOpen; continue }
      result += prose(text.slice(cursor, open.index))
      if (!hidden) result += text.slice(open.index, runs.lastIndex)
      cursor = runs.lastIndex
    }
    return result + prose(text.slice(cursor), final)
  }
  const fences = /^ {0,3}(`{3,}|~{3,})([^\r\n]*)(?:\r?\n|$)/gm
  let result = ''
  let cursor = 0
  let open: RegExpExecArray | null
  while ((open = fences.exec(input)) !== null) {
    const marker = open[1]
    if (marker[0] === '`' && open[2].includes('`')) continue
    const closing = new RegExp(`^ {0,3}${marker[0]}{${marker.length},}[\\t ]*\\r?$`, 'gm')
    closing.lastIndex = fences.lastIndex
    const close = closing.exec(input)
    const end = close ? closing.lastIndex : input.length
    result += inline(input.slice(cursor, open.index))
    if (!hidden) result += input.slice(open.index, end)
    cursor = end
    fences.lastIndex = end
    if (!close) break
  }
  return result + inline(input.slice(cursor), true)
}
