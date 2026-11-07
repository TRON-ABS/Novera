import type {UIMessage} from '@ai-sdk/react'

// Some small models resume an earlier task after tool results. Repeat the
// actual user request at user priority for this inference only. Do this before
// context budgeting; never store the reminder or count it as a new web request.
export function withWebFollowUpRequest(messages:UIMessage[],isolateCurrentTurn=false):UIMessage[] {
  const last=messages.at(-1)
  if(last?.role!=='assistant')return messages
  const tail=last.parts.filter(part=>part.type!=='step-start').at(-1)
  if(!tail || !('state' in tail) || typeof tail.state!=='string' || !['output-available','output-error'].includes(tail.state) ||
    !(tail.type==='tool-web_search'||tail.type==='tool-web_fetch'||
      (tail.type==='dynamic-tool'&&(tail.toolName==='web_search'||tail.toolName==='web_fetch'))))return messages
  const user=messages.slice().reverse().find(message=>message.role==='user')
  const request=user?.parts.filter(part=>part.type==='text').map(part=>part.text).join('\n')
    .split(/\n---\nReferenced file contents:/)[0].trim().slice(0,4000)
  if(!user||!request)return messages
  // LFM3's small audio models can replay older one-off tasks even with this
  // reminder. Tool selection still sees history; answer synthesis receives
  // this question and its own tool results. The stored conversation is intact.
  const context=isolateCurrentTurn ? messages.slice(messages.lastIndexOf(user)) : messages
  return [...context,{id:`${user.id}__web_follow_up`,role:'user',parts:[{type:'text',text:
    `Use the tool results above to answer the current request below. Do not repeat an already completed search or an answer to an earlier question. If the available evidence is insufficient, explain what is missing.\n\n${request}`}]}]
}

// A first real search is required for clear current-weather or explicit web
// requests. Do not let a previous model refusal masquerade as tool availability.
export function needsInitialWebSearch(messages:readonly UIMessage[]):boolean {
  let index=messages.length-1
  while(index>=0&&messages[index].role!=='user')index--
  if(index<0)return false
  const attempted=messages.slice(index+1).some(message=>message.parts.some(part=>
    (part.type==='tool-web_search'||part.type==='tool-web_fetch'||
      (part.type==='dynamic-tool'&&(part.toolName==='web_search'||part.toolName==='web_fetch'))) &&
    'state' in part && ['output-available','output-error'].includes(part.state)))
  if(attempted)return false
  const text=messages[index].parts.filter(part=>part.type==='text').map(part=>part.text).join('\n')
    .split(/\n---\nReferenced file contents:/)[0]
    .replace(/```[\s\S]*?(?:```|$)/g,' ').replace(/^\s*>.*$/gm,' ').slice(0,2000)
  if(/\b(?:sans\s+(?:internet|recherche|web)|without\s+(?:internet|search|browsing|web)|do\s+not\s+(?:search|browse)|ne\s+(?:cherche|recherche)[^.!?]*\bpas)\b/i.test(text))return false
  const explicit=/\b(?:cherche|recherche|vérifie|verifie|search|browse|look\s+up)\b[^.!?]{0,80}\b(?:internet|web|online|en\s+ligne)\b/i.test(text)
  // "Quel temp aujourd'hui" is a common typed/dictated weather question.
  // Accept the missing s in this phrase, without treating every "temp" (for
  // example a hardware temperature) as a weather request.
  const weather=/\b(?:météo|meteo|weather|forecast|temps)\b|\bquel\s+temp\b/i.test(text)&&/\b(?:aujourd|demain|actuel|actuelle|today|tomorrow|current|now)\b/i.test(text)
  return explicit||weather
}
