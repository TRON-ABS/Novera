import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MediaLibrary } from '../MediaLibrary'
import { useMediaLibrary, type MediaProfile } from '@/hooks/useMediaLibrary'
import { useCreation, creationDefaults } from '@/hooks/useCreation'
import type { InstallSnapshot } from '@/hooks/useCreationInstall'
const mocks = vi.hoisted(() => ({ invoke: vi.fn(), open: vi.fn() }))
vi.mock('@tauri-apps/api/core', () => ({ invoke: mocks.invoke }))
vi.mock('@/hooks/useServiceHub', () => ({
  useServiceHub: () => ({ dialog: () => ({ open: mocks.open }) }),
}))
vi.mock('@/i18n/react-i18next-compat', () => ({
  useTranslation: () => ({ t: (s: string) => s }),
}))
vi.mock('@/lib/backendStorage', () => ({
  backendStorage: {
    getItem: async () => null,
    setItem: async () => {},
    removeItem: async () => {},
  },
}))
const profile: MediaProfile = {
  id: 'media-test',
  name: 'My FLUX',
  task: 'image',
  settings: {
    ...creationDefaults,
    imageEngine: 'sdcpp',
    ggufImageModel: 'D:/flux.gguf',
    ggufTextEncoder: 'D:/qwen.gguf',
    ggufVae: 'D:/vae.safetensors',
  },
}
const ready: InstallSnapshot = {
  phase: 'ready',
  running: false,
  acknowledged: false,
  bytes: [1, 1, 1],
  verified: [true, true, true],
  plan: {
    token: 'test',
    directory: 'D:/models/FLUX',
    available: 10e9,
    total: 3,
    files: ['ggufImageModel', 'ggufTextEncoder', 'ggufVae'].map((role, i) => ({
      role,
      name: `${i}.gguf`,
      url: 'https://huggingface.co/model',
      size: 1,
      sha256: '0'.repeat(64),
    })),
  },
}
describe('categorized imported media library', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useMediaLibrary.setState({ profiles: [], installed: [] })
    useCreation.setState({
      settings: { ...creationDefaults },
      selections: {},
      modes: {},
    })
    mocks.invoke.mockResolvedValue(undefined)
  })
  it('registers one verified configuration and does not resurrect a removed entry', () => {
    const library = useMediaLibrary.getState()
    library.importReady({ ...ready, phase: 'verifying' })
    expect(useMediaLibrary.getState().profiles).toHaveLength(0)
    library.importReady(ready)
    library.importReady(ready)
    expect(useMediaLibrary.getState().profiles).toHaveLength(1)
    expect(useMediaLibrary.getState().profiles[0]).toMatchObject({
      task: 'image',
      settings: { encoderDevice: 'cpu', imageEngine: 'sdcpp' },
    })
    library.remove('media-test')
    library.importReady(ready)
    expect(useMediaLibrary.getState().profiles).toHaveLength(0)
    library.importReady(ready, true)
    expect(useMediaLibrary.getState().profiles).toHaveLength(1)
  })
  it('keeps the official NVFP4 image and the GGUF CPU encoder in one native configuration', () => {
    useMediaLibrary
      .getState()
      .importReady({
        ...ready,
        plan: {
          ...ready.plan,
          variant: 'nvfp4',
          python: 'D:/Python315/python.exe',
        },
      })
    expect(useMediaLibrary.getState().profiles[0]).toMatchObject({
      name: 'FLUX.2 Klein 4B · NVFP4',
      settings: {
        imageEngine: 'nvfp4-cuda',
        python: 'D:/Python315/python.exe',
        device: 'cuda',
        encoderDevice: 'cpu',
      },
    })
  })
  it('groups image and video entries beside import actions', () => {
    useMediaLibrary.setState({
      profiles: [
        profile,
        { ...profile, id: 'video', name: 'My video', task: 'video' },
      ],
    })
    render(<MediaLibrary />)
    expect(
      screen.getByRole('region', { name: 'chat:creation.image' })
    ).toHaveTextContent('My FLUX')
    expect(
      screen.getByRole('region', { name: 'chat:creation.video' })
    ).toHaveTextContent('My video')
    expect(
      screen.getAllByRole('button', { name: 'providers:import' })
    ).toHaveLength(2)
  })
  it('validates edited components before saving the imported profile', async () => {
    useMediaLibrary.setState({ profiles: [profile] })
    render(<MediaLibrary />)
    fireEvent.click(screen.getByText('common:edit'))
    fireEvent.change(screen.getByLabelText('common:name'), {
      target: { value: 'Renamed FLUX' },
    })
    fireEvent.change(screen.getByLabelText('chat:creation.ggufTextEncoder'), {
      target: { value: 'E:/Qwen3.gguf' },
    })
    fireEvent.click(screen.getByText('common:save'))
    await waitFor(() =>
      expect(useMediaLibrary.getState().profiles[0].name).toBe('Renamed FLUX')
    )
    expect(mocks.invoke).toHaveBeenCalledWith('creation_check_files', {
      request: expect.objectContaining({
        backend: 'sdcpp',
        cpp_llm: 'E:/Qwen3.gguf',
      }),
    })
  })
  it('requires deletion confirmation and preserves files and unrelated selections', () => {
    useMediaLibrary.setState({ profiles: [profile] })
    useCreation.setState({
      selections: {
        a: { image: { provider: 'diffusers', id: profile.id } },
        b: { image: { provider: 'openai', id: 'cloud' } },
      },
    })
    render(<MediaLibrary />)
    fireEvent.click(screen.getByText('common:delete'))
    expect(
      screen.getByText('providers:deleteModel.importedDescription')
    ).toBeInTheDocument()
    expect(useMediaLibrary.getState().profiles).toHaveLength(1)
    fireEvent.click(screen.getByText('providers:deleteModel.removeFromJan'))
    expect(useMediaLibrary.getState().profiles).toHaveLength(0)
    expect(useCreation.getState().selections.a.image).toBeUndefined()
    expect(useCreation.getState().selections.b.image?.id).toBe('cloud')
    expect(mocks.invoke).not.toHaveBeenCalled()
  })
})
