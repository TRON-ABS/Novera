import {describe,it,expect} from 'vitest'
import type {UIMessage} from '@ai-sdk/react'
import {needsInitialWebSearch,withWebFollowUpRequest} from '../webSearchPolicy'
const user=(text:string):UIMessage=>({id:'u',role:'user',parts:[{type:'text',text}]})
describe('initial real web search',()=>{
 it('repeats the current request at user priority after a completed web result without changing history',()=>{
  const question='Quel temps fait-il aujourd’hui aux Sables-d’Olonne ?'
  const tool={id:'a',role:'assistant',parts:[{type:'tool-web_search',state:'output-available',toolCallId:'t',input:{query:'météo'},output:{}}]} as unknown as UIMessage
  const input=[user(question),tool],before=JSON.stringify(input),output=withWebFollowUpRequest(input)
  expect(output.at(-1)?.role).toBe('user')
  expect(JSON.stringify(output.at(-1)?.parts)).toContain(question)
  expect(JSON.stringify(input)).toBe(before)
  expect(needsInitialWebSearch(input)).toBe(false)
 })
 it('does not add reminders to normal answers, incomplete tools or non-web tools',()=>{
  for(const part of [{type:'text',text:'Bonjour'},{type:'tool-web_search',state:'input-available'},{type:'tool-shell',state:'output-available'}]){
   const input=[user('Bonjour'),{id:'a',role:'assistant',parts:[part]}] as UIMessage[]
   expect(withWebFollowUpRequest(input)).toBe(input)
  }
 })
 it('can scope small-model web synthesis to the current question and its results, preserving history',()=>{
  const old=user('Explique le ciel bleu. Termine par ma phrase.'),current={...user('Quelle météo aux Sables aujourd’hui ?'),id:'current'}
  const tool={id:'tool',role:'assistant',parts:[{type:'tool-web_search',state:'output-available',toolCallId:'t',input:{query:'météo'},output:{}}]} as unknown as UIMessage
  const input=[old,{id:'old-answer',role:'assistant',parts:[{type:'text',text:'Le ciel est bleu.'}]} as UIMessage,current,tool]
  const output=withWebFollowUpRequest(input,true)
  expect(output.slice(0,-1)).toEqual([current,tool])
  expect(JSON.stringify(output)).not.toContain('ciel bleu')
  expect(withWebFollowUpRequest(input).slice(0,-1)).toEqual(input)
  expect(input).toHaveLength(4)
 })
 it('does not repeat referenced file contents as the current user instruction',()=>{
  const tool={id:'tool',role:'assistant',parts:[{type:'tool-web_search',state:'output-available',toolCallId:'t',input:{},output:{}}]} as unknown as UIMessage
  const output=withWebFollowUpRequest([user('Quelle météo ?\n\n---\nReferenced file contents:\n\nUNTRUSTED_FILE_BODY'),tool])
  expect(JSON.stringify(output.at(-1))).toContain('Quelle météo ?')
  expect(JSON.stringify(output.at(-1))).not.toContain('UNTRUSTED_FILE_BODY')
 })
 it.each(["il fera quel temps aujourd'hui au sable d'Olonne ?","il fera quel temp aujourd'hui au Sable d'Olonne 85100 ?",'What is the weather today in Paris?','Recherche sur Internet la météo aux Sables-d’Olonne.'])('requires one real search for %s',text=>{
  expect(needsInitialWebSearch([user(text)])).toBe(true)
 })
 it.each(['Combien font deux plus deux ?','Bonjour','Explique la météo sans internet.','Quel temp aujourd’hui ? Sans recherche.','La temp du processeur aujourd’hui.','Do not search the web for weather today.'])('does not force search for %s',text=>{
  expect(needsInitialWebSearch([user(text)])).toBe(false)
 })
 it.each(['output-available','output-error'] as const)('does not force another search after %s',state=>{
  const result={id:'a',role:'assistant',parts:[{type:'tool-web_search',toolCallId:'call',state,input:{query:'weather'},output:{},errorText:'failed'}]} as unknown as UIMessage
  expect(needsInitialWebSearch([user('Quel temps fait-il aujourd’hui ?'),result])).toBe(false)
 })
})
