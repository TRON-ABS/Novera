import { beforeEach, expect, it, vi } from 'vitest'
const h=vi.hoisted(()=>({android:true,tauri:true,invoke:vi.fn()}))
vi.mock('@tauri-apps/api/core',()=>({invoke:h.invoke}))
vi.mock('@/lib/platform/utils',()=>({isPlatformAndroid:()=>h.android,isPlatformTauri:()=>h.tauri}))
import { writeClipboardText } from '../clipboard'
beforeEach(()=>{h.android=true;h.tauri=true;h.invoke.mockReset().mockResolvedValue(undefined)})
it('uses the native Android writer without requiring the WebView clipboard API',async()=>{
  await writeClipboardText('Texte à coller')
  expect(h.invoke).toHaveBeenCalledWith('sharing_copy_text',{text:'Texte à coller'})
})
it('propagates native write failure rather than reporting a successful copy',async()=>{
  h.invoke.mockRejectedValueOnce(new Error('CLIPBOARD_UNAVAILABLE'))
  await expect(writeClipboardText('Texte')).rejects.toThrow('CLIPBOARD_UNAVAILABLE')
})
it('keeps the browser clipboard route outside Android Tauri',async()=>{
  h.android=false
  const writeText=vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText}})
  await writeClipboardText('Desktop')
  expect(writeText).toHaveBeenCalledWith('Desktop')
  expect(h.invoke).not.toHaveBeenCalled()
})
