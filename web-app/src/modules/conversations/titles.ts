export const MAX_TITLE_WORDS = 10

/**
 * Clean a model-generated title: strip reasoning tags, special characters,
 * quotes, and enforce a word limit. Returns null if the result is unusable.
 */
export function cleanTitle(raw: string): string | null {
  let text = raw.trim()

  // Strip complete reasoning blocks like <think>...</think> (any tag name)
  text = text.replace(/<(think|thinking|reasoning|analysis)[^>]*>[\s\S]*?<\/\1>/gi, '').trim()

  // If a reasoning opener remains without a close, the output is all reasoning — unusable
  if (/<(think|thinking|reasoning|analysis)[^>]*>/i.test(text)) return null

  // If only a closing tag is present, take what's after the last one
  const lastClose = text.match(/<\/(?:think|thinking|reasoning|analysis)>\s*([\s\S]*)$/i)
  if (lastClose) {
    text = lastClose[1].trim()
  }

  // Remove leftover XML-like tags
  text = text.replace(/<[^>]+>/g, '').trim()

  // Collapse whitespace and newlines into single spaces
  text = text.replace(/\s+/g, ' ').trim()

  // Remove surrounding quotes
  text = text.replace(/^["']+|["']+$/g, '').trim()

  // Keep only letters, numbers, and spaces (unicode-aware)
  text = text.replace(/[^\p{L}\p{N}\s]/gu, '').trim()

  // Enforce word limit
  const words = text.split(/\s+/).slice(0, MAX_TITLE_WORDS)
  text = words.join(' ')

  if (!text || text.length < 2) return null

  return text
}

