import { expect,it } from 'vitest'
import type { UIMessage } from 'ai'
import { messageExportText } from '../messageExportText'
it('prefers the answer and excludes reasoning from a normal answer copy',()=>{
  expect(messageExportText({id:'m',role:'assistant',parts:[{type:'reasoning',text:'Trace'},{type:'text',text:'Réponse'}]})).toBe('Réponse')
})
it('exports a visible trace and error when no final answer exists, without tool inputs',()=>{
  const m={id:'m',role:'assistant',parts:[{type:'reasoning',text:'Trace visible'},{type:'tool-web_search',state:'output-error',errorText:'HTTP 403',input:{secret:'PRIVATE_INPUT'}}]} as unknown as UIMessage
  expect(messageExportText(m)).toBe('Trace visible\n\nHTTP 403')
})
it('keeps a genuinely empty message empty',()=>{
  expect(messageExportText({id:'m',role:'assistant',parts:[]})).toBe('')
})
