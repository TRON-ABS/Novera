import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ImportMlxModelDialog } from '../ImportMlxModelDialog'

const mocks = vi.hoisted(() => ({ import: vi.fn(), open: vi.fn(), getEngine: vi.fn() }))
vi.mock('@/hooks/useServiceHub', () => ({ useServiceHub: () => ({ dialog: () => ({ open: mocks.open }) }) }))
vi.mock('@/lib/extension', () => ({ ExtensionManager: { getInstance: () => ({ getEngine: mocks.getEngine }) } }))
vi.mock('@/i18n/react-i18next-compat', () => ({ useTranslation: () => ({ t: (key: string) => key }) }))
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

describe('Safetensors folder import', () => {
  it('imports the complete selected folder into Transformers and refreshes its provider', async () => {
    mocks.open.mockResolvedValue('C:/models/tiny')
    mocks.import.mockResolvedValue(undefined)
    mocks.getEngine.mockReturnValue({ import: mocks.import })
    const success = vi.fn()
    render(<ImportMlxModelDialog provider={{ provider: 'transformers', models: [], settings: [], active: true }}
      onSuccess={success} trigger={<button>Open Safetensors</button>} />)
    fireEvent.click(screen.getByText('Open Safetensors'))
    expect(screen.getByText('providers:import Safetensors')).toBeInTheDocument()
    fireEvent.click(screen.getByText('common:browse'))
    await waitFor(() => expect(screen.getByDisplayValue('tiny')).toBeInTheDocument())
    fireEvent.click(screen.getByText('providers:import'))
    await waitFor(() => expect(success).toHaveBeenCalledWith('tiny'))
    expect(mocks.getEngine).toHaveBeenCalledWith('transformers')
    expect(mocks.import).toHaveBeenCalledWith('tiny', { modelPath: 'C:/models/tiny' })
  })
})
