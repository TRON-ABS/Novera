import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import { TextSetupPanel } from '../TextSetupPanel'
import { useHardware } from '@/hooks/useHardware'
import { useModelProvider } from '@/hooks/useModelProvider'
import { modelSettings } from '@/lib/predefined'
import { LIGHT_OMNI_MODEL, LIGHT_TEXT_MODEL } from '@/lib/noveraRecommendedModel'
const mocks = vi.hoisted(() => ({ navigate: vi.fn(), update: vi.fn(), invoke: vi.fn() }))
vi.mock('@tanstack/react-router', () => ({ useNavigate: () => mocks.navigate }))
vi.mock('@tauri-apps/api/core', () => ({ invoke: mocks.invoke }))
vi.mock('@/lib/platform/utils', () => ({ isPlatformTauri: () => true }))
vi.mock('@/hooks/useServiceHub', () => ({ useServiceHub: () => ({ models: () => ({ updateModelSettings: mocks.update }) }) }))
vi.mock('@/i18n/react-i18next-compat', () => ({ useTranslation: () => ({ t: (key: string) => key }) }))
vi.mock('../DropdownModelProvider', () => ({ default: () => null }))
vi.mock('../ModelSetting', () => ({ ModelSetting: () => null }))
vi.mock('../dialogs/ImportLlamacppModelDialog', () => ({ ImportLlamacppModelDialog: () => null }))
vi.mock('../HubHardwareDiagnostic', () => ({ HubHardwareDiagnostic: ({ context }: { context: number }) => <span>context {context}</span> }))
vi.mock('../DownloadButton', () => ({ DownloadButtonPlaceholder: ({ model, handleUseModel }: { model: typeof LIGHT_TEXT_MODEL; handleUseModel: (id: string) => void }) =>
  <button onClick={() => handleUseModel(model.quants![0].model_id)}>Use recommendation</button> }))
vi.mock('@/lib/backendStorage', () => ({ backendStorage: { getItem: async () => null, setItem: async () => {}, removeItem: async () => {} } }))

beforeEach(() => {
  vi.clearAllMocks()
  mocks.invoke.mockResolvedValue({ build_number: '11960' })
  mocks.update.mockResolvedValue(undefined)
  useHardware.setState({ hardwareData: { ...useHardware.getState().hardwareData, os_type: 'android', total_memory: 4096, gpus: [] },
    systemUsage: { cpu: 0, total_memory: 4096, used_memory: 1000, gpus: [] } })
})
it('offers the Omni pair and Nemotron on mobile without an automatic download or selection', async () => {
  render(<TextSetupPanel scope="new" onNavigate={vi.fn()} />)
  expect(within(screen.getByTestId('default-omni-model')).getByText(/LFM3-Omni-2B · Q4_K_M/)).toBeInTheDocument()
  expect(screen.getByTestId('alternative-text-model')).toHaveTextContent('Nemotron-3.5-Bolt-E4B')
  expect(screen.getAllByText('context 2048')).toHaveLength(2)
  await waitFor(()=>expect(mocks.invoke).toHaveBeenCalled())
  expect(mocks.navigate).not.toHaveBeenCalled()
  expect(mocks.update).not.toHaveBeenCalled()
})
it('keeps the same default pair when the engine and memory qualify', async () => {
  useHardware.setState({ hardwareData: { ...useHardware.getState().hardwareData, total_memory: 8192 },
    systemUsage: { cpu: 0, total_memory: 8192, used_memory: 2048, gpus: [] } })
  render(<TextSetupPanel scope="new" onNavigate={vi.fn()} />)
  await waitFor(() => expect(within(screen.getByTestId('default-omni-model')).getByText(/LFM3-Omni-2B · Q4_K_M/)).toBeInTheDocument())
  expect(screen.getByText(/mmproj-LFM3-Omni-2B-Q4_K_M.gguf · 291.59 MB/)).toBeInTheDocument()
  expect(mocks.update).not.toHaveBeenCalled()
})
it('applies the short context only to the explicitly chosen recommendation and preserves other models', async () => {
  const id = LIGHT_OMNI_MODEL.quants![0].model_id
  useModelProvider.setState({ providers: [{ provider: 'llamacpp', models: [
    { id, name: id, settings: { ctx_len: modelSettings.ctx_len } },
    { id: 'manual', name: 'manual', settings: { ctx_len: modelSettings.ctx_len } },
  ] } as ModelProvider] })
  render(<TextSetupPanel scope="new" onNavigate={vi.fn()} />)
  fireEvent.click(within(screen.getByTestId('default-omni-model')).getByText('Use recommendation'))
  await waitFor(() => expect(mocks.navigate).toHaveBeenCalled())
  expect(mocks.update).toHaveBeenCalledWith(id, { ctx_len: 2048 })
  const models = useModelProvider.getState().providers[0].models
  expect(models[0].settings?.ctx_len.controller_props.value).toBe(2048)
  expect(models[1].settings?.ctx_len.controller_props.value).toBe(8192)
  expect(LIGHT_OMNI_MODEL.mmproj_models![0].path).toContain('mmproj-LFM3-Omni')
})
it('offers both choices with 32K on desktop, including memory-limited computers',async()=>{
  useHardware.setState({hardwareData:{...useHardware.getState().hardwareData,os_type:'windows',total_memory:4096,gpus:[]}})
  render(<TextSetupPanel scope="new" onNavigate={vi.fn()} />)
  expect(screen.getAllByText('context 32768')).toHaveLength(2)
  expect(screen.getByTestId('default-omni-model')).toHaveTextContent('mmproj-LFM3-Omni-2B-Q4_K_M.gguf')
  expect(screen.getByTestId('alternative-text-model')).toHaveTextContent('Nemotron')
  await waitFor(()=>expect(screen.queryByText(/llama\.cpp ≥ b11960/)).not.toBeInTheDocument())
})
