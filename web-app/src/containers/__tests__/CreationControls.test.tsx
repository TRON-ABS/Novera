import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CreationControls } from '../CreationControls'
import { useCreation, creationDefaults } from '@/hooks/useCreation'
import { useImageUpscale } from '@/hooks/useImageUpscale'
const mocks = vi.hoisted(() => ({ open: vi.fn() }))
vi.mock('@/lib/platform/utils', () => ({ isPlatformTauri: () => true }))
vi.mock('@/hooks/useServiceHub', () => ({
  useServiceHub: () => ({ dialog: () => ({ open: mocks.open }) }),
}))
vi.mock('@/i18n/react-i18next-compat', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))
vi.mock('@/lib/backendStorage', () => ({
  backendStorage: {
    getItem: async () => null,
    setItem: async () => {},
    removeItem: async () => {},
  },
}))
describe('creation choices in the composer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useImageUpscale.setState({ enabled: false, factor: 2 })
    useCreation.setState({
      settings: { ...creationDefaults },
      modes: {},
      sources: {},
      progress: {},
    })
  })
  it('shows the active upscaler and final dimensions beside the ratio controls only for local images', () => {
    useCreation.setState({
      modes: { sized: 'image' },
      settings: {
        ...creationDefaults,
        width: 512,
        height: 224,
        imageModel: 'D:/image',
      },
    })
    useImageUpscale.setState({ enabled: true, factor: 2 })
    const { rerender } = render(
      <CreationControls scope="sized" disabled={false} />
    )
    const badge = screen.getByRole('button', {
      name: 'chat:creation.upscaleTitle · ×2 · 1024 × 448',
    })
    expect(badge).toHaveClass('composer-tool-active')
    expect(badge).toHaveTextContent('Real-ESRGAN ×2 · 1024 × 448')
    useImageUpscale.setState({ factor: 4 })
    rerender(<CreationControls scope="sized" disabled={false} />)
    expect(
      screen.getByRole('button', {
        name: 'chat:creation.upscaleTitle · ×4 · 2048 × 896',
      })
    ).toBeInTheDocument()
    useImageUpscale.setState({ enabled: false })
    rerender(<CreationControls scope="sized" disabled={false} />)
    expect(screen.queryByText(/Real-ESRGAN ×/)).not.toBeInTheDocument()
  })
  it('keeps output choice scoped to the current thread and offers local model selection', async () => {
    mocks.open.mockResolvedValue('D:/models/image')
    render(<CreationControls scope="thread-a" disabled={false} />)
    fireEvent.click(screen.getByRole('button', { name: 'chat:creation.image' }))
    expect(useCreation.getState().modes['thread-a']).toBe('image')
    expect(useCreation.getState().modes['thread-b']).toBeUndefined()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.click(screen.getAllByRole('button', { name: 'common:browse' })[0])
    await waitFor(() =>
      expect(useCreation.getState().settings.imageModel).toBe('D:/models/image')
    )
    expect(mocks.open).toHaveBeenCalledWith({
      directory: true,
      multiple: false,
    })
  })
  it('locks output changes while a request is running and exposes progress', () => {
    useCreation.setState({
      progress: { 'thread-a': { stage: 'generating', progress: 35 } },
    })
    render(<CreationControls scope="thread-a" disabled />)
    expect(
      screen.getByRole('button', { name: 'chat:creation.video' })
    ).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent('35%')
  })
  it('offers image seed modes, reuses the previous seed and shows the resolution limit', () => {
    useCreation.getState().setSettings({ lastImageSeed: 1234 })
    render(<CreationControls scope="seed-thread" disabled={false} />)
    fireEvent.click(
      screen.getByRole('button', { name: 'chat:creation.settings' })
    )
    const seed = screen.getByLabelText('chat:creation.seed')
    expect(seed).toBeDisabled()
    expect(
      screen.getByText('chat:creation.imageResolutionMax')
    ).toBeInTheDocument()
    fireEvent.change(
      screen.getByRole('combobox', { name: 'chat:creation.seedMode' }),
      {
        target: { value: 'increment' },
      }
    )
    expect(seed).not.toBeDisabled()
    expect(useCreation.getState().settings.seedMode).toBe('increment')
    fireEvent.click(
      screen.getByRole('button', { name: 'chat:creation.seedReuse' })
    )
    expect(useCreation.getState().settings).toMatchObject({
      seedMode: 'fixed',
      seed: 1234,
    })
  })
  it('offers separate image GGUF, Qwen GGUF and VAE file choices', async () => {
    useCreation.getState().setSettings({
      cppExecutable: 'C:/old-build/runtime/vulkan/sd-cli.exe',
    })
    render(<CreationControls scope="gguf-thread" disabled={false} />)
    fireEvent.click(
      screen.getByRole('button', { name: 'chat:creation.settings' })
    )
    fireEvent.change(
      screen.getByRole('combobox', { name: 'chat:creation.imageEngine' }),
      { target: { value: 'sdcpp' } }
    )
    expect(useCreation.getState().settings.imageEngine).toBe('sdcpp')
    expect(useCreation.getState().settings.steps).toBe(4)
    if (IS_WINDOWS) {
      expect(
        screen.queryByLabelText('chat:creation.cppExecutable')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByDisplayValue('C:/old-build/runtime/vulkan/sd-cli.exe')
      ).not.toBeInTheDocument()
    } else {
      expect(
        screen.getByLabelText('chat:creation.cppExecutable')
      ).toBeInTheDocument()
    }
    expect(
      screen.getByLabelText('chat:creation.ggufTextEncoder')
    ).toBeInTheDocument()
    mocks.open.mockResolvedValue('D:/Qwen3-4B-Q4_K_M.gguf')
    const input = screen.getByLabelText('chat:creation.ggufTextEncoder')
    fireEvent.click(input.parentElement!.querySelector('button')!)
    await waitFor(() =>
      expect(useCreation.getState().settings.ggufTextEncoder).toBe(
        'D:/Qwen3-4B-Q4_K_M.gguf'
      )
    )
    expect(mocks.open).toHaveBeenCalledWith({
      directory: false,
      multiple: false,
      filters: [
        {
          name: 'chat:creation.ggufTextEncoder',
          extensions: ['gguf', 'safetensors'],
        },
      ],
    })
  })
  it('offers native FP4 and keeps encoder and generation device choices independent', () => {
    render(<CreationControls scope="native" disabled={false} />)
    fireEvent.click(
      screen.getByRole('button', { name: 'chat:creation.settings' })
    )
    fireEvent.change(
      screen.getByRole('combobox', { name: 'chat:creation.imageEngine' }),
      { target: { value: 'nvfp4-cuda' } }
    )
    expect(
      screen.queryByLabelText('chat:creation.cppExecutable')
    ).not.toBeInTheDocument()
    expect(
      screen.getByLabelText('chat:creation.ggufTextEncoder')
    ).toBeInTheDocument()
    fireEvent.change(
      screen.getByRole('combobox', { name: 'chat:creation.encoderDevice' }),
      { target: { value: 'cpu' } }
    )
    fireEvent.change(
      screen.getByRole('combobox', { name: 'chat:creation.generationDevice' }),
      { target: { value: 'cuda' } }
    )
    expect(useCreation.getState().settings).toMatchObject({
      imageEngine: 'nvfp4-cuda',
      encoderDevice: 'cpu',
      device: 'cuda',
      steps: 4,
    })
  })
  it('offers the corrected Qwen3 recommendation and applies placement without replacing local files', () => {
    useCreation.getState().setSettings({
      imageEngine: 'sdcpp',
      ggufImageModel: 'D:/mine.gguf',
      ggufTextEncoder: 'D:/my-qwen.gguf',
      encoderDevice: 'cuda',
      device: 'cpu',
    })
    render(<CreationControls scope="advice" disabled={false} />)
    fireEvent.click(
      screen.getByRole('button', { name: 'chat:creation.settings' })
    )
    expect(
      screen.getByRole('link', { name: 'Qwen3-4B · Q4_K_M · CPU' })
    ).toHaveAttribute(
      'href',
      'https://huggingface.co/Qwen/Qwen3-4B-GGUF/resolve/main/Qwen3-4B-Q4_K_M.gguf?download=true'
    )
    fireEvent.click(
      screen.getByRole('button', {
        name: 'chat:creation.applyRecommendedPlacement',
      })
    )
    expect(useCreation.getState().settings).toMatchObject({
      encoderDevice: 'cpu',
      device: 'auto',
      steps: 4,
      ggufGuidance: 1,
      ggufImageModel: 'D:/mine.gguf',
      ggufTextEncoder: 'D:/my-qwen.gguf',
    })
  })
})
