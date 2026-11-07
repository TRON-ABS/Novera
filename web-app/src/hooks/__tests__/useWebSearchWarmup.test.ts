import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest'
import {cleanup,renderHook} from '@testing-library/react'
const h=vi.hoisted(()=>({enabled:true,provider:'duckduckgo',native:true,android:false,ios:false,prepare:vi.fn()}))
vi.mock('../useWebSearchConfig',()=>({useWebSearchConfig:Object.assign(
  (select:(state:{webSearchEnabled:boolean;searchProvider:string})=>unknown)=>select({webSearchEnabled:h.enabled,searchProvider:h.provider}),
  {getState:()=>({webSearchEnabled:h.enabled,searchProvider:h.provider})},
)}))
vi.mock('@/lib/platform/utils',()=>({isPlatformTauri:()=>h.native,isPlatformAndroid:()=>h.android,isPlatformIOS:()=>h.ios}))
vi.mock('@/lib/duckduckgoSearch',()=>({prepareDuckDuckGo:h.prepare}))
import {useWebSearchWarmup} from '../useWebSearchWarmup'
beforeEach(()=>{vi.clearAllMocks();h.enabled=true;h.provider='duckduckgo';h.native=true;h.android=false;h.ios=false;h.prepare.mockResolvedValue(undefined)})
afterEach(()=>{cleanup();vi.restoreAllMocks()})
describe('desktop web preparation',()=>{
 it('waits for settings hydration and respects the saved Web-off choice',async()=>{
  const hook=renderHook(({ready})=>useWebSearchWarmup(ready),{initialProps:{ready:false}})
  expect(h.prepare).not.toHaveBeenCalled()
  h.enabled=false;hook.rerender({ready:true});await Promise.resolve()
  expect(h.prepare).not.toHaveBeenCalled()
 })
 it('prepares DuckDuckGo in the background when the desktop is ready',async()=>{
  renderHook(()=>useWebSearchWarmup(true))
  await vi.waitFor(()=>expect(h.prepare).toHaveBeenCalledOnce())
 })
 it('starts when Web is enabled later, without restarting on disable',async()=>{
  h.enabled=false
  const hook=renderHook(()=>useWebSearchWarmup(true))
  expect(h.prepare).not.toHaveBeenCalled()
  h.enabled=true;hook.rerender()
  await vi.waitFor(()=>expect(h.prepare).toHaveBeenCalledOnce())
  h.enabled=false;hook.rerender()
  expect(h.prepare).toHaveBeenCalledOnce()
 })
 it.each(['browser','android','ios','other-provider'])('does not launch a desktop process on %s',async mode=>{
  if(mode==='browser')h.native=false
  if(mode==='android')h.android=true
  if(mode==='ios')h.ios=true
  if(mode==='other-provider')h.provider='tavily'
  renderHook(()=>useWebSearchWarmup(true));await Promise.resolve()
  expect(h.prepare).not.toHaveBeenCalled()
 })
 it('does not prepare if Web is disabled while the import is pending',async()=>{
  renderHook(()=>useWebSearchWarmup(true));h.enabled=false
  await new Promise(resolve=>setTimeout(resolve,20))
  expect(h.prepare).not.toHaveBeenCalled()
 })
 it('contains preparation failures so a real search can retry later',async()=>{
  const warn=vi.spyOn(console,'warn').mockImplementation(()=>{})
  h.prepare.mockRejectedValueOnce(new Error('unavailable'))
  renderHook(()=>useWebSearchWarmup(true))
  await vi.waitFor(()=>expect(warn).toHaveBeenCalledWith('[Novera web] background preparation unavailable'))
 })
})
