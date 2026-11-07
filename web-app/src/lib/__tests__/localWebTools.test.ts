import {describe,it,expect} from 'vitest'
import {localWebToolsSupported} from '../localWebTools'
describe('known local web tool support',()=>{
 it.each(['LFM3-Omni-2B-Q4_K_M','LFM3-Audio-2B-Q4_K_M'])('recognizes an imported %s with missing labels',id=>{
  expect(localWebToolsSupported('llamacpp',{id})).toBe(true)
 })
 it('respects an explicit capability edit and never assumes unknown models support tools',()=>{
  expect(localWebToolsSupported('llamacpp',{id:'LFM3-Omni-2B',_userConfiguredCapabilities:true})).toBe(false)
  expect(localWebToolsSupported('custom',{id:'LFM3-Omni-2B'})).toBe(false)
  expect(localWebToolsSupported('llamacpp',{id:'unknown'})).toBe(false)
  expect(localWebToolsSupported('llamacpp',null)).toBe(false)
 })
})
