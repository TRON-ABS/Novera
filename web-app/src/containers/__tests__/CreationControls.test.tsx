import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CreationControls, CreationModelControl, CreationSettingsControl } from '../CreationControls'
import { useCreation, creationDefaults } from '@/hooks/useCreation'
import { useImageUpscale } from '@/hooks/useImageUpscale'
import { useMusicCreation } from '@/hooks/useMusicCreation'
import { musicDefaults } from '@/modules/engines/music'
import { useModelProvider } from '@/hooks/useModelProvider'
vi.mock('../TextSetupPanel', () => ({ TextSetupPanel: () => <div>Text setup</div> }))
vi.mock('../EmbeddingSetupPanel', () => ({ EmbeddingSetupPanel: () => <div>Embedding setup</div> }))
const mocks = vi.hoisted(() => ({ open: vi.fn() }))
vi.mock('@/lib/platform/utils', () => ({ isPlatformTauri: () => true }))
vi.mock('@/hooks/useServiceHub', () => ({
  useServiceHub: () => ({ dialog: () => ({ open: mocks.open }) }),
}))
vi.mock('@/i18n/react-i18next-compat', async () => {
  const { translateUiForTest } = await import('@/test/translate-ui')
  return { useTranslation: () => ({ t: translateUiForTest }) }
})
vi.mock('@/lib/backendStorage', () => ({
  backendStorage: {
    getItem: async () => null,
    setItem: async () => {},
    removeItem: async () => {},
  },
}))
describe('creation choices in the composer', () => {
  it('offers 1–10 generations after the image seed and keeps image/video/music counts independent', () => {
    useCreation.setState({ selections: {}, modes: { countbar: 'image' }, settings: { ...creationDefaults, imageModel: 'image.gguf' }, videoSettings: { ...creationDefaults, videoModel: 'video.gguf' } })
    useMusicCreation.setState({ settings: { ...musicDefaults, directory: 'D:/music', generator: 'music.gguf' }, profiles: [], selections: {} })
    const { rerender } = render(<CreationControls scope="countbar" disabled={false} />)
    let count = screen.getByRole('combobox', { name: 'Quantity' })
    const seed = screen.getByRole('button', { name: 'chat:creation.seedMode' })
    expect(seed.compareDocumentPosition(count) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(count).toHaveValue('1')
    expect(within(count).getAllByRole('option').map(option => option.getAttribute('value'))).toEqual(['1','2','3','4','5','6','7','8','9','10'])
    fireEvent.change(count, { target: { value: '10' } })
    expect(useCreation.getState().settings.generationCount).toBe(10)
    useCreation.getState().setMode('countbar', 'video')
    rerender(<CreationControls scope="countbar" disabled={false} />)
    count = screen.getByRole('combobox', { name: 'Quantity' })
    expect(count).toHaveValue('1')
    fireEvent.change(count, { target: { value: '3' } })
    expect(useCreation.getState().videoSettings?.generationCount).toBe(3)
    expect(useCreation.getState().settings.generationCount).toBe(10)
    useCreation.getState().setMode('countbar', 'music')
    rerender(<CreationControls scope="countbar" disabled={false} />)
    count = screen.getByRole('combobox', { name: 'Quantity' })
    expect(count).toHaveValue('1')
    fireEvent.change(count, { target: { value: '2' } })
    expect(useMusicCreation.getState().settings.generationCount).toBe(2)
    expect(useCreation.getState().videoSettings?.generationCount).toBe(3)
    rerender(<CreationControls scope="countbar" disabled />)
    expect(screen.getByRole('combobox', { name: 'Quantity' })).toBeDisabled()
  })
  it('edits and reuses the image seed directly after the upscaler', () => {
    useCreation.setState({ modes: { seedbar: 'image' }, settings: { ...creationDefaults, imageModel: 'image.gguf', lastImageSeed: 1583954823 } })
    const { rerender } = render(<CreationControls scope="seedbar" disabled={false} />)
    const seedButton = screen.getByRole('button', { name: 'chat:creation.seedMode' })
    const upscaleButton = screen.getByRole('button', { name: /chat:creation.upscaleTitle/ })
    expect(upscaleButton.compareDocumentPosition(seedButton) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    fireEvent.click(seedButton)
    const seed = screen.getByRole('spinbutton', { name: 'chat:creation.seed' })
    expect(seed).toBeDisabled()
    fireEvent.change(screen.getByRole('combobox', { name: 'chat:creation.seedMode' }), { target: { value: 'fixed' } })
    fireEvent.change(seed, { target: { value: '42' } })
    expect(useCreation.getState().settings).toMatchObject({ seedMode: 'fixed', seed: 42 })
    fireEvent.change(seed, { target: { value: '4294967296' } })
    expect(useCreation.getState().settings.seed).toBe(42)
    fireEvent.click(screen.getByRole('button', { name: 'chat:creation.seedReuse · 1583954823' }))
    expect(useCreation.getState().settings).toMatchObject({ seedMode: 'fixed', seed: 1583954823 })
    expect(useCreation.getState().videoSettings?.seedMode).not.toBe('fixed')
    rerender(<CreationControls scope="seedbar" disabled={true} />)
    expect(seedButton).toBeDisabled()
    expect(seed).toBeDisabled()
  })
  it('keeps Auto selected when an installed media profile is applied',()=>{
    useCreation.getState().setMode('auto-installed','auto')
    render(<CreationControls scope="auto-installed" disabled={false}/>)
    fireEvent(window,new CustomEvent('novera-creation-settings',{detail:{installed:true,task:'music',profileId:'music-test'}}))
    expect(useCreation.getState().modes['auto-installed']).toBe('auto')
    expect(document.querySelector('.composer-mode.composer-tool-active')).toHaveAttribute('aria-pressed','true')
    fireEvent(window,new CustomEvent('novera-creation-settings',{detail:{installed:true,task:'image',profileId:'image-test'}}))
    expect(useCreation.getState().modes['auto-installed']).toBe('auto')
  })
  it('changes the video dashboard seed without changing image settings', () => {
    useCreation.setState({ modes: { videoseed: 'video' }, settings: { ...creationDefaults, seed: 42 }, videoSettings: { ...creationDefaults, videoModel: 'video.gguf', seed: 100, lastImageSeed: 777 } })
    render(<CreationControls scope="videoseed" disabled={false} />)
    fireEvent.click(screen.getByRole('button', { name: 'chat:creation.seedMode' }))
    fireEvent.change(screen.getByRole('combobox', { name: 'chat:creation.seedMode' }), { target: { value: 'increment' } })
    fireEvent.change(screen.getByRole('spinbutton', { name: 'chat:creation.seed' }), { target: { value: '123' } })
    expect(useCreation.getState().videoSettings).toMatchObject({ seedMode: 'increment', seed: 123 })
    expect(useCreation.getState().settings).toMatchObject({ seedMode: 'random', seed: 42 })
    fireEvent.click(screen.getByRole('button', { name: 'chat:creation.seedReuse · 777' }))
    expect(useCreation.getState().videoSettings).toMatchObject({ seedMode: 'fixed', seed: 777 })
    expect(screen.queryByRole('button', { name: /chat:creation.upscaleTitle/ })).not.toBeInTheDocument()
  })
  it('keeps Auto enabled while draft routing switches the active output and its compact model', () => {
    useCreation.setState({ settings: { ...creationDefaults, imageModel: 'D:/models/image.gguf' }, videoSettings: { ...creationDefaults, videoModel: 'D:/models/video.gguf' } })
    useMusicCreation.setState({ settings: { ...musicDefaults, directory: 'D:/music', generator: 'music.gguf' } })
    useModelProvider.setState({ selectedModel: { id: 'text.gguf', name: 'Text model' } as never })
    const view = (prompt: string, disabled = false) => <><CreationControls scope="auto-preview" prompt={prompt} disabled={disabled}/><CreationModelControl scope="auto-preview" prompt={prompt} disabled={disabled}/></>
    const { rerender } = render(view(''))
    for (const [prompt, output, name] of [
      ['', 'text', 'Text model'],
      ['Crée une bande originale pour le film', 'music', 'music.gguf'],
      ['Crée une vidéo avec de la musique', 'video', 'video.gguf'],
      ['Crée une image pour un film', 'image', 'image.gguf'],
      ['Explique cette musique', 'text', 'Text model'],
    ]) {
      rerender(view(prompt))
      const group = within(screen.getByRole('group', { name: 'chat:creation.output' }))
      expect(group.getByRole('button', { name: 'chat:creation.auto' })).toHaveAttribute('aria-pressed', 'true')
      for (const task of ['text', 'image', 'music', 'video']) expect(group.getByRole('button', { name: `chat:creation.${task}` })).toHaveAttribute('aria-pressed', String(task === output))
      expect(screen.getByText(name)).toBeInTheDocument()
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    }
    useCreation.getState().setResolvedMode('auto-preview', 'music')
    rerender(view('Crée une vidéo', true))
    expect(screen.getByText('music.gguf')).toBeInTheDocument()
    expect(useCreation.getState().modes['auto-preview']).toBeUndefined()
    expect(useCreation.getState().modes['another-thread']).toBeUndefined()
  })
  it('places Music between Image and Video and exposes its own duration and quality controls',()=>{
    useMusicCreation.setState({settings:{...musicDefaults,directory:'D:/music',generator:'dit.gguf'}})
    useCreation.getState().setMode('music-order','music')
    render(<CreationControls scope="music-order" disabled={false}/>)
    const group=screen.getByRole('group',{name:'chat:creation.output'})
    expect(within(group).getAllByRole('button').map((button)=>button.textContent)).toEqual([
      expect.stringContaining('chat:creation.auto'),expect.stringContaining('chat:creation.text'),expect.stringContaining('chat:creation.image'),expect.stringContaining('chat:creation.music'),expect.stringContaining('chat:creation.video'),
    ])
    expect(screen.getByRole('button',{name:'chat:creation.musicDuration'})).toBeInTheDocument()
    expect(screen.getByRole('button',{name:'chat:creation.musicQuality'})).toBeInTheDocument()
    expect(screen.queryByRole('button',{name:'chat:creation.ratio'})).not.toBeInTheDocument()
  })
  it('offers independent random seed modes for image and video', () => {
    render(<CreationControls scope="seed-both" disabled={false} />)
    fireEvent.click(screen.getByRole('button', { name: 'chat:creation.settings' }))
    for (const task of ['image', 'video']) {
      const section = within(screen.getByRole('region', { name: `chat:creation.${task}` }))
      expect(section.getByRole('combobox', { name: 'chat:creation.seedMode' })).toHaveValue('random')
      expect(section.getByLabelText('chat:creation.seed')).toBeDisabled()
      fireEvent.change(section.getByRole('combobox', { name: 'chat:creation.seedMode' }), { target: { value: 'fixed' } })
      expect(section.getByLabelText('chat:creation.seed')).not.toBeDisabled()
    }
  })
  it('places duration before the ratio, defaults to five seconds, and allows one second to one hour', () => {
    useCreation.getState().setVideoSettings({ videoModel: 'D:/chosen/video.gguf' })
    useCreation.getState().setMode('duration', 'video')
    render(<CreationControls scope="duration" disabled={false} />)
    const duration = screen.getByRole('button', { name: 'chat:creation.videoDuration: common:duration.seconds' })
    const ratio = screen.getByRole('button', { name: 'chat:creation.ratio' })
    expect(duration.compareDocumentPosition(ratio) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(ratio).toHaveTextContent('21:9')
    fireEvent.click(duration)
    const input = screen.getByLabelText('chat:creation.videoDuration')
    expect(input).toHaveValue(5)
    for (const seconds of [1, 3600]) {
      fireEvent.change(input, { target: { value: String(seconds) } })
      expect(useCreation.getState().videoSettings?.durationSeconds).toBe(seconds)
    }
    fireEvent.change(input, { target: { value: '3601' } })
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(useCreation.getState().settings.durationSeconds).toBeUndefined()
  })
  it('switches video duration between the prompt and the saved manual value', () => {
    useCreation.getState().setVideoSettings({ videoModel: 'D:/chosen/video.gguf', durationSeconds: 5 })
    useCreation.getState().setMode('duration', 'video')
    render(<CreationControls scope="duration" disabled={false} prompt="Une vidéo de 10 secondes" />)
    const trigger = screen.getByRole('button', { name: 'chat:creation.videoDuration: common:duration.seconds' })
    expect(trigger).toHaveTextContent('chat:creation.auto')
    fireEvent.click(trigger)
    const input = screen.getByLabelText('chat:creation.videoDuration')
    expect(input).toHaveValue(10)
    expect(input).toBeEnabled()
    fireEvent.click(screen.getByRole('switch', { name: 'chat:creation.videoDuration · chat:creation.auto' }))
    expect(input).toHaveValue(5)
    expect(input).toBeEnabled()
    expect(useCreation.getState().videoSettings?.durationAuto).toBe(false)
  })
  it('opens the same scoped setup from the relocated footer control', () => {
    render(<><CreationControls scope="relocated" disabled={false} showSettingsButton={false} /><CreationSettingsControl scope="relocated" disabled={false} /></>)
    const buttons = screen.getAllByRole('button', { name: 'chat:creation.settings' })
    expect(buttons).toHaveLength(1)
    fireEvent(window, new CustomEvent('novera-creation-settings', { detail: { scope: 'other-composer' } }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    fireEvent.click(buttons[0])
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'chat:creation.image' })).toBeInTheDocument()
  })

  it('opens one setup page with all three sections and empty model paths until chosen', () => {
    render(<CreationControls scope="fresh" disabled={false} />)
    const setup = screen.getByRole('button', { name: 'chat:creation.settings' })
    expect(setup).toHaveAttribute('title', expect.stringContaining('chat:creation.text / chat:creation.image / chat:creation.music / chat:creation.video'))
    fireEvent.click(setup)
    expect(screen.getByRole('region', { name: 'providers:embeddingModels' })).toHaveTextContent('Embedding setup')
    for (const task of ['text', 'image', 'music', 'video']) expect(screen.getByRole('region', { name: `chat:creation.${task}` })).toBeInTheDocument()
    const image = within(screen.getByRole('region', { name: 'chat:creation.image' }))
    const video = within(screen.getByRole('region', { name: 'chat:creation.video' }))
    expect(image.getByLabelText('chat:creation.imageModel')).toHaveValue('')
    expect(video.getByLabelText('chat:creation.videoModel')).toHaveValue('')
    fireEvent.change(image.getByRole('combobox', { name: 'chat:creation.imageEngine' }), { target: { value: 'sdcpp' } })
    for (const key of ['ggufImageModel', 'ggufTextEncoder', 'ggufVae']) expect(image.getByLabelText(`chat:creation.${key}`)).toHaveValue('')
    fireEvent.change(video.getByRole('combobox', { name: 'chat:creation.video · chat:creation.model' }), { target: { value: 'sdcpp' } })
    expect(video.getByLabelText('UMT5-XXL · GGUF')).toHaveValue('')
    expect(video.getByLabelText('Wan2.1 VAE')).toHaveValue('')
    expect(video.getByRole('option', { name: 'NVFP4 · common:editModel.notAvailable' })).toBeDisabled()
  })
  it('keeps image and video settings independent when browsing and adjusting resolution', async () => {
    render(<CreationControls scope="independent" disabled={false} />)
    fireEvent.click(screen.getByRole('button', { name: 'chat:creation.settings' }))
    const image = within(screen.getByRole('region', { name: 'chat:creation.image' }))
    const video = within(screen.getByRole('region', { name: 'chat:creation.video' }))
    fireEvent.change(video.getByRole('combobox', { name: 'chat:creation.video · chat:creation.model' }), { target: { value: 'sdcpp' } })
    mocks.open.mockResolvedValue('D:/chosen/video.gguf')
    const input = video.getByLabelText('chat:creation.video · GGUF')
    fireEvent.click(input.parentElement!.querySelector('button')!)
    await waitFor(() => expect(useCreation.getState().videoSettings?.videoModel).toBe('D:/chosen/video.gguf'))
    expect(useCreation.getState().settings.videoModel).toBe('')
    expect(mocks.open).toHaveBeenCalledWith(expect.objectContaining({ directory: false }))
    fireEvent.change(image.getByLabelText('chat:creation.width'), { target: { value: '1024' } })
    expect(useCreation.getState().settings.width).toBe(1024)
    expect(useCreation.getState().videoSettings?.width).toBe(512)
  })
  beforeEach(() => {
    vi.clearAllMocks()
    useImageUpscale.setState({ enabled: false, factor: 2 })
    useMusicCreation.setState({settings:{...musicDefaults},profiles:[],selections:{},installed:[]})
    useCreation.setState({
      settings: { ...creationDefaults },
      videoSettings: undefined,
      modes: {},
      resolvedModes: {},
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
    expect(badge).toHaveTextContent('×2 · Enabled')
    expect(badge).toHaveTextContent('1024 × 448')
    expect(badge).toHaveAttribute('title', 'Real-ESRGAN ×2 · 1024 × 448')
    useImageUpscale.setState({ factor: 4 })
    rerender(<CreationControls scope="sized" disabled={false} />)
    expect(
      screen.getByRole('button', {
        name: 'chat:creation.upscaleTitle · ×4 · 2048 × 896',
      })
    ).toHaveTextContent('2048 × 896')
    useImageUpscale.setState({ enabled: false })
    rerender(<CreationControls scope="sized" disabled={false} />)
    expect(screen.getByRole('button', { name: 'chat:creation.upscaleTitle · ×4 · Disabled' })).toHaveTextContent('×4 · Disabled')
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
  it('opens the creation settings from the compact model selector and marks only the selected mode', () => {
    useCreation.setState({
      modes: { compact: 'image' },
      settings: { ...creationDefaults, imageModel: 'D:/models/klein.gguf' },
    })
    render(<><CreationControls scope="compact" disabled={false} /><CreationModelControl scope="compact" disabled={false} /></>)
    expect(screen.getByRole('button', { name: 'chat:creation.image' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'chat:creation.text' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'chat:creation.model: klein.gguf' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
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
  it.each([
    ['loading', -1, 'loading'],
    ['generating', 35, 'generating'],
    ['finalizing', 99, 'finalizing'],
  ])('displays the actual %s stage rather than keeping the loading label', (stage, progress, label) => {
    useCreation.setState({ progress: { phase: { stage, progress } } })
    render(<CreationControls scope="phase" disabled />)
    expect(screen.getByRole('status')).toHaveTextContent(`chat:creation.${label}`)
    if (stage !== 'loading') expect(screen.getByRole('status')).not.toHaveTextContent('chat:creation.loading')
    if (progress >= 0) expect(screen.getByRole('status')).toHaveTextContent(`${progress}%`)
    else expect(screen.getByRole('status')).not.toHaveTextContent('%')
  })
  it('offers video frame count and cadence beside the size controls without image upscaling', () => {
    useCreation.setState({ modes: { video: 'video' }, settings: { ...creationDefaults, videoModel: 'D:/video', frames: 49, fps: 16 } })
    render(<CreationControls scope="video" disabled={false} />)
    fireEvent.click(screen.getByRole('button', { name: 'chat:creation.frames · chat:creation.fps' }))
    fireEvent.change(screen.getByLabelText('chat:creation.frames'), { target: { value: '81' } })
    fireEvent.change(screen.getByLabelText('chat:creation.fps'), { target: { value: '24' } })
    expect(useCreation.getState().videoSettings).toMatchObject({ frames: 81, fps: 24 })
    expect(screen.queryByRole('button', { name: /upscaleTitle/ })).not.toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('chat:creation.fps'), { target: { value: '0' } })
    expect(useCreation.getState().videoSettings?.fps).toBe(24)
  })
  it('opens size choices directly and switches upscaling on/off without opening model settings', () => {
    useCreation.setState({ modes: { direct: 'image' }, settings: { ...creationDefaults, imageModel: 'D:/model', width: 512, height: 512 } })
    render(<CreationControls scope="direct" disabled={false} />)
    fireEvent.click(screen.getByRole('button', { name: 'chat:creation.upscaleTitle · ×2 · Disabled' }))
    expect(useImageUpscale.getState().enabled).toBe(true)
    expect(screen.queryByText('chat:creation.localNote')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'chat:creation.upscaleTitle · ×2 · 1024 × 1024' }))
    expect(useImageUpscale.getState().enabled).toBe(false)
    fireEvent.click(screen.getByRole('button', { name: 'chat:creation.ratio' }))
    fireEvent.click(screen.getByRole('button', { name: '16:9' }))
    expect(useCreation.getState().settings.mediaRatio).toBe('16:9')
    expect(screen.queryByText('chat:creation.localNote')).not.toBeInTheDocument()
  })
  it('offers image seed modes, reuses the previous seed and shows the resolution limit', () => {
    useCreation.getState().setSettings({ lastImageSeed: 1234 })
    render(<CreationControls scope="seed-thread" disabled={false} />)
    fireEvent.click(
      screen.getByRole('button', { name: 'chat:creation.settings' })
    )
    const seed = within(screen.getByRole('region', { name: 'chat:creation.image' })).getByLabelText('chat:creation.seed')
    expect(seed).toBeDisabled()
    expect(
      screen.getByText('chat:creation.imageResolutionMax')
    ).toBeInTheDocument()
    fireEvent.change(
      within(screen.getByRole('region', { name: 'chat:creation.image' })).getByRole('combobox', { name: 'chat:creation.seedMode' }),
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
      within(screen.getByRole('region', { name: 'chat:creation.image' })).getByRole('combobox', { name: 'chat:creation.generationDevice' }),
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
      within(screen.getByRole('region', { name: 'chat:creation.image' })).getByRole('button', {
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
