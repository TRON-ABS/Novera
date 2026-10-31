import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ImportMlxModelDialog } from '../ImportMlxModelDialog'

const mocks = vi.hoisted(() => ({ import: vi.fn(), open: vi.fn(), getEngine: vi.fn(), inspectAdapter: vi.fn() }))
vi.mock('@/hooks/useServiceHub', () => ({ useServiceHub: () => ({ dialog: () => ({ open: mocks.open }) }) }))
vi.mock('@/lib/extension', () => ({ ExtensionManager: { getInstance: () => ({ getEngine: mocks.getEngine }) } }))
vi.mock('@/i18n/react-i18next-compat', () => ({ useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }) }))
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

describe('Safetensors folder import', () => {
  it.each(['transformers', 'onnx'])('imports the complete selected folder into %s and refreshes its provider', async (provider) => {
    mocks.open.mockResolvedValue('C:/models/tiny')
    mocks.import.mockResolvedValue(undefined)
    mocks.getEngine.mockReturnValue({ import: mocks.import })
    const success = vi.fn()
    render(<ImportMlxModelDialog provider={{ provider, models: [], settings: [], active: true }}
      onSuccess={success} trigger={<button>Open Safetensors</button>} />)
    fireEvent.click(screen.getByText('Open Safetensors'))
    expect(screen.getByText(`providers:import ${provider === 'onnx' ? 'ONNX' : 'Safetensors'}`)).toBeInTheDocument()
    fireEvent.click(screen.getByText('common:browse'))
    await waitFor(() => expect(screen.getByDisplayValue('tiny')).toBeInTheDocument())
    fireEvent.click(screen.getByText('providers:import'))
    await waitFor(() => expect(success).toHaveBeenCalledWith('tiny'))
    expect(mocks.getEngine).toHaveBeenCalledWith(provider)
    expect(mocks.import).toHaveBeenCalledWith('tiny', { modelPath: 'C:/models/tiny' })
  })

  it('requires an adapter inspection and imports the selected pair', async () => {
    mocks.import.mockClear()
    mocks.open.mockResolvedValueOnce('C:/models/base').mockResolvedValueOnce('C:/models/adapter')
    mocks.inspectAdapter.mockResolvedValue({ baseBytes: 1024, adapterBytes: 128, overheadAndCacheBytes: 256, totalBytes: 1408 })
    mocks.getEngine.mockReturnValue({ import: mocks.import, inspectAdapter: mocks.inspectAdapter })
    render(<ImportMlxModelDialog provider={{ provider: 'transformers', models: [], settings: [], active: true }}
      trigger={<button>Open pair</button>} />)
    fireEvent.click(screen.getByText('Open pair'))
    fireEvent.click(screen.getByLabelText('providers:peft.attach'))
    expect(screen.getByText('providers:import')).toBeDisabled()
    fireEvent.click(screen.getByText('common:browse'))
    await waitFor(() => expect(screen.getByDisplayValue('base')).toBeInTheDocument())
    fireEvent.click(screen.getByText('providers:peft.folder'))
    await waitFor(() => expect(mocks.inspectAdapter).toHaveBeenCalledWith('C:/models/base', 'C:/models/adapter'))
    await waitFor(() => expect(screen.getByText(/providers:peft.total/)).toBeInTheDocument())
    fireEvent.click(screen.getByText('providers:import'))
    await waitFor(() => expect(mocks.import).toHaveBeenCalledWith('base', { modelPath:'C:/models/base', adapterPath:'C:/models/adapter' }))
  })

  it('blocks import when the adapter/base inspection fails', async () => {
    mocks.open.mockResolvedValueOnce('C:/models/base').mockResolvedValueOnce('C:/models/wrong')
    mocks.inspectAdapter.mockRejectedValue(new Error('Adapter/base mismatch'))
    mocks.getEngine.mockReturnValue({ import: mocks.import, inspectAdapter: mocks.inspectAdapter })
    render(<ImportMlxModelDialog provider={{ provider: 'transformers', models: [], settings: [], active: true }}
      trigger={<button>Open mismatch</button>} />)
    fireEvent.click(screen.getByText('Open mismatch'))
    fireEvent.click(screen.getByLabelText('providers:peft.attach'))
    fireEvent.click(screen.getByText('common:browse'))
    await waitFor(() => expect(screen.getByDisplayValue('base')).toBeInTheDocument())
    fireEvent.click(screen.getByText('providers:peft.folder'))
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Adapter/base mismatch'))
    expect(screen.getByText('providers:import')).toBeDisabled()
  })
})
