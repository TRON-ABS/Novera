import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useHubDownloadReview } from '../HubHardwareDiagnostic'
import type { CatalogModel } from '@/services/models/types'

const mocks = vi.hoisted(() => ({ metadata: vi.fn(), download: vi.fn(), convert: vi.fn() }))
vi.mock('@/i18n/react-i18next-compat', () => ({ useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }) }))
vi.mock('@/hooks/useHardware', () => ({ useHardware: (selector: (state: unknown) => unknown) => selector({
  hardwareData: { os_type: 'windows', total_memory: 16384, cpu: { arch: 'x86_64' }, gpus: [] },
  systemUsage: { total_memory: 16384, used_memory: 2000, gpus: [] },
}) }))
vi.mock('@/hooks/useGeneralSetting', () => ({ useGeneralSetting: (selector: (state: unknown) => unknown) => selector({ huggingfaceToken: '' }) }))
vi.mock('@/hooks/useServiceHub', () => ({ useServiceHub: () => ({ models: () => ({ fetchHuggingFaceRepo: mocks.metadata, convertHfRepoToCatalogModel: mocks.convert }) }) }))
vi.mock('@/lib/extension', () => ({ ExtensionManager: { getInstance: () => ({ getEngine: () => undefined }) } }))
const model: CatalogModel = { model_name: 'publisher/tiny', downloads: 1, description: '', pipeline_tag: 'text-generation', quants: [{ model_id: 'tiny', path: 'tiny.gguf', file_size: '100 MB' }] }
function Harness({ input = model }: { input?: CatalogModel }) {
  const { reviewDownload, reviewDialog } = useHubDownloadReview(input, input.quants?.[0])
  return <><button onClick={() => void reviewDownload(mocks.download)}>Review</button>{reviewDialog}</>
}

describe('pre-download hardware diagnostic', () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.metadata.mockResolvedValue({ id: model.model_name }); mocks.convert.mockReturnValue(model) })
  it('checks metadata before any weight transfer and starts only after the review', async () => {
    render(<Harness />)
    fireEvent.click(screen.getByText('Review'))
    expect(mocks.download).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('button', { name: 'hub:download' })).toBeEnabled())
    expect(mocks.metadata).toHaveBeenCalledWith('publisher/tiny', '', undefined)
    fireEvent.click(screen.getByRole('button', { name: 'hub:download' }))
    expect(mocks.download).toHaveBeenCalledTimes(1)
  })
  it('blocks an image pipeline even when weights use a recognised container', async () => {
    const image = { ...model, pipeline_tag: 'text-to-image' }
    mocks.convert.mockReturnValue(image)
    render(<Harness input={image} />)
    fireEvent.click(screen.getByText('Review'))
    await waitFor(() => expect(screen.queryByText('hub:catalog.checking')).not.toBeInTheDocument())
    expect(screen.getByRole('button', { name: 'hub:download' })).toBeDisabled()
    expect(screen.getByText(/hub:catalog.planned/)).toBeInTheDocument()
    expect(mocks.download).not.toHaveBeenCalled()
  })
  it('requires acknowledgement after incomplete metadata and lets the user cancel', async () => {
    mocks.metadata.mockResolvedValue(null)
    render(<Harness />)
    fireEvent.click(screen.getByText('Review'))
    expect(await screen.findByText('hub:catalog.metadataMissing')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'hub:download' })).toBeDisabled()
    fireEvent.click(screen.getByRole('checkbox'))
    expect(screen.getByRole('button', { name: 'hub:download' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'common:cancel' }))
    expect(mocks.download).not.toHaveBeenCalled()
  })
})
