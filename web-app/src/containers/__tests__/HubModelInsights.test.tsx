import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import french from '@/locales/fr/hub.json'
import { NOVERA_HUB_MODELS } from '@/lib/hubDiscovery'
const mocks = vi.hoisted(() => ({ active:vi.fn(), measure:vi.fn(), factory:vi.fn(), busy:false, cowork:false }))
vi.mock('@/i18n/react-i18next-compat',()=>({useTranslation:()=>({i18n:{language:'fr'},t:(key:string)=>key.startsWith('hub:discovery.')?french.discovery[key.split('.').at(-1) as keyof typeof french.discovery]:key})}))
vi.mock('@/hooks/useServiceHub',()=>({useServiceHub:()=>({models:()=>({getActiveModels:mocks.active})})}))
vi.mock('@/hooks/useAppState',()=>({useAppState:()=>mocks.busy}))
vi.mock('@/hooks/useCoworkRun',()=>({useCoworkRun:()=>mocks.cowork}))
vi.mock('@/hooks/useHardware',()=>({useHardware:Object.assign((select:(s:unknown)=>unknown)=>select({hardwareData:{total_memory:16384,cpu:{arch:'x86_64'},gpus:[],os_type:'windows'}}),{getState:()=>({systemUsage:{used_memory:3000}})})}))
vi.mock('@/hooks/useModelProvider',()=>({useModelProvider:{getState:()=>({getProviderByName:()=>({provider:'llamacpp',models:[{id:'LFM2.5-230M-Q4_K_M'}]})})}}))
vi.mock('@/lib/model-factory',()=>({ModelFactory:{createModel:mocks.factory}}))
vi.mock('@/lib/hubBenchmark',()=>({measureHubModel:mocks.measure}))
import { HubModelFacts, HubComparison } from '../HubModelInsights'
beforeEach(()=>{
  vi.clearAllMocks();mocks.busy=false;mocks.cowork=false
  mocks.active.mockResolvedValue(['LFM2.5-230M-Q4_K_M'])
  mocks.factory.mockResolvedValue({})
  mocks.measure.mockResolvedValue({elapsedMs:1000,firstTokenMs:100,outputTokens:20,tokensPerSecond:20,measuredAt:'2026-10-24T12:00:00Z'})
})
it('shows French labels, localized units and attributable publisher scores',()=>{
  render(<HubModelFacts model={NOVERA_HUB_MODELS[0]} />)
  expect(screen.getByText(/153,41.*Mo/)).toBeInTheDocument()
  expect(screen.getByRole('link',{name:french.discovery.benchmarks})).toHaveAttribute('href','https://huggingface.co/LiquidAI/LFM2.5-230M')
  expect(screen.getByText(french.discovery.benchmarkNote)).toBeInTheDocument()
})
it('does not start or download a model which is not running',async()=>{
  mocks.active.mockResolvedValue([])
  render(<HubComparison models={[NOVERA_HUB_MODELS[0]]} clear={()=>{}} />)
  fireEvent.click(screen.getByRole('button',{name:french.discovery.test}))
  expect(await screen.findByRole('alert')).toHaveTextContent(french.discovery.testHint)
  expect(mocks.factory).not.toHaveBeenCalled()
})
it('runs only the active local variant and displays actual local measurement',async()=>{
  render(<HubComparison models={[NOVERA_HUB_MODELS[0]]} clear={()=>{}} />)
  fireEvent.click(screen.getByRole('button',{name:french.discovery.test}))
  expect(await screen.findByText('LFM2.5-230M-Q4_K_M')).toBeInTheDocument()
  expect(mocks.factory).toHaveBeenCalledWith('LFM2.5-230M-Q4_K_M',expect.objectContaining({provider:'llamacpp'}),{chat_template_kwargs:{enable_thinking:false}})
  expect(mocks.measure).toHaveBeenCalledTimes(1)
})
it('disables local tests while a chat is generating',()=>{
  mocks.busy=true
  render(<HubComparison models={[NOVERA_HUB_MODELS[0]]} clear={()=>{}} />)
  expect(screen.getByRole('button',{name:french.discovery.test})).toBeDisabled()
  expect(mocks.active).not.toHaveBeenCalled()
})
it('aborts an in-flight measurement when leaving the Hub',async()=>{
  let signal:AbortSignal|undefined
  mocks.measure.mockImplementation((_model:unknown,s:AbortSignal)=>{signal=s;return new Promise((_,reject)=>s.addEventListener('abort',()=>reject(new Error('aborted'))))})
  const view=render(<HubComparison models={[NOVERA_HUB_MODELS[0]]} clear={()=>{}} />)
  fireEvent.click(screen.getByRole('button',{name:french.discovery.test}))
  await waitFor(()=>expect(signal).toBeDefined())
  view.unmount()
  expect(signal!.aborted).toBe(true)
})
