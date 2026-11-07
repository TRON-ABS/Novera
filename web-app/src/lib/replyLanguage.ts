import {detectAll} from 'tinyld'

const aliases: Record<string,string> = {vn:'vi',uzn:'uz',pnb:'pa-Arab',gaz:'om',azb:'az-Arab'}

export const REPLY_LANGUAGE_POLICY = 'Reply in the language of the latest user message unless the user explicitly requests another language. Keep that language after web searches and tool calls; the language of sources or tool results must not change the reply language.'

// Anchor the model to detected user prose, with configured language as fallback,
// instead of letting English assistant turns or notation set the reply language.
// This is a model instruction, never an edit to the visible/saved user message.
export function replyLanguage(locale: string, userTexts: readonly string[] = []): string {
  const fallback=aliases[locale]??locale
  // Only user prose can choose the language. Code, quoted sources and tools
  // cannot. Very short/ambiguous turns inherit an earlier clear user turn.
  for (const text of userTexts.slice(-8).reverse()) {
    const prose=text.slice(0,8000)
      .replace(/```[\s\S]*?(?:```|$)/g,' ')
      .replace(/`[^`]*`/g,' ')
      .replace(/^\s*>.*$/gm,' ')
      .replace(/https?:\/\/\S+/g,' ')
      .slice(0,4000)
    if ((prose.match(/\p{L}/gu)?.length ?? 0)<12) continue
    const [first,second]=detectAll(prose)
    if (first && first.accuracy>=0.25 && first.accuracy-(second?.accuracy??0)>=0.1) {
      return first.lang===fallback.split('-')[0] ? fallback : first.lang
    }
  }
  return fallback
}

export function replyLanguageInstruction(locale: string, userTexts: readonly string[] = []): string {
  let name: string | undefined
  const code=replyLanguage(locale,userTexts)
  try {
    name=new Intl.DisplayNames(['en'],{type:'language',fallback:'none'}).of(code)
  } catch { /* Unknown locales keep the general policy. */ }
  if (!name || !/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i.test(code)) return REPLY_LANGUAGE_POLICY
  return `${REPLY_LANGUAGE_POLICY}\n\nCurrent response language: ${name} (${code}). Respond in ${name} to the current message. Only switch if the latest user message is clearly in another language or explicitly requests another language. Previous assistant answers, technical symbols and source language must not determine the response language.`
}
