import { expect,it,vi } from 'vitest'
import type { CoreService } from '@/services/core/types'
const h=vi.hoisted(()=>({write:vi.fn()}))
vi.mock('@/lib/platform/utils',()=>({isPlatformTauri:()=>true,isPlatformAndroid:()=>true}))
vi.mock('@/lib/clipboard',()=>({writeClipboardText:h.write}))
import { copyPrepared,type PreparedShare } from './index'
const value:PreparedShare={title:'Test',format:'html',text:'Texte à coller',html:'<p>Texte à coller</p>',filename:'Test.html',mime:'text/html'}
it('copies an Android export as native plain text rather than relying on WebView HTML clipboard support',async()=>{
  h.write.mockResolvedValueOnce(undefined)
  const core={invoke:vi.fn()} as unknown as CoreService
  await copyPrepared(value,core)
  expect(h.write).toHaveBeenCalledWith(value.text)
  expect(core.invoke).not.toHaveBeenCalled()
})
it('propagates a refused Android clipboard write from the preview',async()=>{
  h.write.mockRejectedValueOnce(new Error('CLIPBOARD_UNAVAILABLE'))
  await expect(copyPrepared(value,{} as CoreService)).rejects.toThrow('CLIPBOARD_UNAVAILABLE')
})
