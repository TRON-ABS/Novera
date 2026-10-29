import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  CreationInstallButton,
  CreationInstallIndicator,
} from '../CreationInstall'
import {
  useCreationInstall,
  applyInstalled,
  type InstallPlan,
  type InstallSnapshot,
} from '@/hooks/useCreationInstall'
import { useMediaLibrary } from '@/hooks/useMediaLibrary'
import { useImageUpscale } from '@/hooks/useImageUpscale'
import { creationDefaults, useCreation } from '@/hooks/useCreation'
const mocks = vi.hoisted(() => ({
  invoke: vi.fn(),
  open: vi.fn(),
  reveal: vi.fn(),
}))
vi.mock('@tauri-apps/api/core', () => ({ invoke: mocks.invoke }))
vi.mock('@/hooks/useServiceHub', () => ({
  useServiceHub: () => ({
    dialog: () => ({ open: mocks.open }),
    opener: () => ({ revealItemInDir: mocks.reveal }),
  }),
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
const plan: InstallPlan = {
  token: 'approved-plan',
  directory: 'D:/Novera models/FLUX.2 Klein 4B',
  total: 600,
  available: 10e9,
  files: ['ggufImageModel', 'ggufTextEncoder', 'ggufVae'].map((role, i) => ({
    role,
    name: `model-${i}.gguf`,
    size: 200,
    sha256: 'hash',
    url: 'https://huggingface.co/file',
  })),
}
function job(phase: InstallSnapshot['phase'] = 'downloading'): InstallSnapshot {
  return {
    plan,
    phase,
    running: phase === 'downloading',
    bytes: [200, 100, 0],
    verified: [true, false, false],
    acknowledged: false,
  }
}
describe('recommended configuration installation', () => {
  it.runIf(IS_WINDOWS)('reviews all defaults, checks storage and records an automatic setup only after confirmation',async()=>{
    const allPlan:InstallPlan={...plan,variant:'all-recommended',requiredSpace:plan.total+256*1024*1024,videoRuntimeReady:true}
    mocks.invoke.mockImplementation(async(command:string)=>command==='creation_bundle_plan'?allPlan:job())
    render(<CreationInstallButton variant="all-recommended" scope="new"/>)
    fireEvent.click(screen.getByRole('button',{name:'chat:creation.setupAllDownload'}))
    await waitFor(()=>expect(screen.getByRole('dialog')).toBeInTheDocument())
    expect(screen.getByText('chat:creation.setupStorage')).toBeInTheDocument()
    expect(mocks.invoke.mock.calls.some(([command])=>command==='creation_bundle_action')).toBe(false)
    fireEvent.click(screen.getByRole('button',{name:'hub:download'}))
    await waitFor(()=>expect(useCreationInstall.getState().autoApply[allPlan.token]).toMatchObject({scope:'new',done:false}))
    expect(mocks.invoke).toHaveBeenCalledWith('creation_bundle_action',{action:'start',token:allPlan.token})
  })
  it.runIf(IS_WINDOWS).each(['space','runtime'])('blocks global installation when %s is unavailable',async(reason)=>{
    const allPlan:InstallPlan={...plan,variant:'all-recommended',available:reason==='space'?10:10e9,videoRuntimeReady:reason!=='runtime'}
    mocks.invoke.mockResolvedValue(allPlan)
    render(<CreationInstallButton variant="all-recommended" scope="new"/>)
    fireEvent.click(screen.getByRole('button',{name:'chat:creation.setupAllDownload'}))
    await waitFor(()=>expect(screen.getByRole('dialog')).toBeInTheDocument())
    expect(screen.getByRole('button',{name:'hub:download'})).toBeDisabled()
    expect(screen.getByRole('alert')).toHaveTextContent(reason==='space'?'chat:creation.setupSpaceMissing':'Python + imageio-ffmpeg')
    expect(mocks.invoke.mock.calls.some(([command])=>command==='creation_bundle_action')).toBe(false)
  })
  it.runIf(!IS_WINDOWS)('offers custom music setup but does not advertise automatic Windows runtime downloads on another platform',()=>{
    render(<CreationInstallButton variant="all-recommended" scope="new"/> )
    expect(screen.getByRole('button',{name:'chat:creation.setupAllDownload'})).toBeDisabled()
  })
  beforeEach(() => {
    vi.clearAllMocks()
    useMediaLibrary.setState({ profiles: [], installed: [] })
    useCreationInstall.setState({ parent: '', job: undefined, autoApply:{} })
    useCreation.setState({ settings: { ...creationDefaults }, videoSettings: undefined })
    mocks.invoke.mockImplementation(async (command: string) =>
      command === 'creation_bundle_plan' ? plan : job()
    )
  })
  it('previews all files and background guidance without starting until confirmation', async () => {
    render(<CreationInstallButton />)
    fireEvent.click(screen.getByText('chat:creationInstall.install'))
    await screen.findByRole('dialog')
    expect(
      screen.getByText('chat:creationInstall.background')
    ).toBeInTheDocument()
    expect(screen.getAllByRole('link')).toHaveLength(6)
    expect(
      mocks.invoke.mock.calls.filter(
        ([command]) => command !== 'creation_bundle_nvfp4_probe'
      )
    ).toHaveLength(1)
    fireEvent.click(screen.getByText('hub:download'))
    await waitFor(() =>
      expect(mocks.invoke).toHaveBeenCalledWith('creation_bundle_action', {
        action: 'start',
        token: plan.token,
      })
    )
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    )
  })
  it('prepares the video variant using its own runtime without starting a transfer or probing image NVFP4', async () => {
    useCreation.getState().setSettings({ python: 'image-runtime' })
    useCreation.getState().setVideoSettings({ python: 'video-runtime' })
    mocks.invoke.mockResolvedValue({ ...plan, variant: 'video-gguf' })
    render(<CreationInstallButton variant="video-gguf" />)
    fireEvent.click(screen.getByText('chat:creationInstall.install'))
    await screen.findByRole('dialog')
    expect(mocks.invoke).toHaveBeenCalledWith('creation_bundle_plan', { parent: null, variant: 'video-gguf', python: 'video-runtime' })
    expect(mocks.invoke).not.toHaveBeenCalledWith('creation_bundle_action', expect.anything())
    expect(mocks.invoke).not.toHaveBeenCalledWith('creation_bundle_nvfp4_probe', expect.anything())
  })
  it('creates nothing if the user cancels and retains a cancelled folder selection', async () => {
    render(<CreationInstallButton />)
    fireEvent.click(screen.getByText('chat:creationInstall.install'))
    await screen.findByRole('dialog')
    mocks.open.mockResolvedValue(null)
    fireEvent.click(screen.getByText('common:browse'))
    await waitFor(() => expect(mocks.open).toHaveBeenCalled())
    fireEvent.click(screen.getByText('common:cancel'))
    expect(
      mocks.invoke.mock.calls.filter(
        ([command]) => command !== 'creation_bundle_nvfp4_probe'
      )
    ).toHaveLength(1)
    expect(useCreationInstall.getState().parent).toBe('')
  })
  it('offers the separate official upscaler download and registers both paths without creating an image profile', async () => {
    const upscalePlan = { ...plan, variant: 'upscale', directory: 'D:/custom/upscale_models', files: [
      { ...plan.files[0], role: 'upscale2', name: 'RealESRGAN_x2plus.pth' },
      { ...plan.files[1], role: 'upscale4', name: 'RealESRGAN_x4plus.pth' },
    ] }
    mocks.invoke.mockResolvedValue(upscalePlan)
    render(<CreationInstallButton variant="upscale" />)
    fireEvent.click(screen.getByText('chat:creation.upscaleInstall'))
    await screen.findByRole('dialog')
    expect(mocks.invoke).toHaveBeenCalledWith('creation_bundle_plan', expect.objectContaining({ variant: 'upscale' }))
    expect(mocks.invoke).not.toHaveBeenCalledWith('creation_bundle_nvfp4_probe', expect.anything())
    applyInstalled({ ...job('ready'), plan: upscalePlan, verified: [true, true] })
    expect(useImageUpscale.getState().installedModels).toEqual({
      2: 'D:/custom/upscale_models/RealESRGAN_x2plus.pth',
      4: 'D:/custom/upscale_models/RealESRGAN_x4plus.pth',
    })
    expect(useMediaLibrary.getState().profiles).toHaveLength(0)
  })
  it('shows byte-weighted progress and keeps ready visible until clicked', async () => {
    useCreationInstall.setState({ job: job() })
    render(<CreationInstallIndicator />)
    expect(
      screen.getByRole('button', { name: 'hub:download 50%' })
    ).toBeInTheDocument()
    act(() =>
      useCreationInstall.setState({
        job: {
          ...job('ready'),
          bytes: [200, 200, 200],
          verified: [true, true, true],
        },
      })
    )
    await screen.findByRole('button', { name: 'chat:creationInstall.ready' })
    expect(mocks.invoke).not.toHaveBeenCalled()
    mocks.invoke.mockResolvedValue({ ...job('ready'), acknowledged: true })
    fireEvent.click(
      screen.getByRole('button', { name: 'chat:creationInstall.ready' })
    )
    await waitFor(() =>
      expect(mocks.invoke).toHaveBeenCalledWith('creation_bundle_action', {
        action: 'acknowledge',
        token: undefined,
      })
    )
    expect(screen.getByText('chat:creationInstall.use')).toBeInTheDocument()
    fireEvent.click(screen.getByText('common:confirm'))
    await waitFor(() =>
      expect(
        screen.queryByText('chat:creationInstall.ready')
      ).not.toBeInTheDocument()
    )
  })
  it('applies only a fully verified bundle and uses the bundled engine with an independent CPU encoder', () => {
    applyInstalled(job())
    expect(useCreation.getState().settings.imageEngine).toBe('diffusers')
    applyInstalled({ ...job('ready'), verified: [true, true, true] })
    expect(useCreation.getState().settings).toMatchObject({
      imageEngine: 'sdcpp',
      cppExecutable: '',
      encoderDevice: 'cpu',
      device: 'auto',
      steps: 4,
      ggufGuidance: 1,
      ggufImageModel: `${plan.directory}/model-0.gguf`,
      ggufTextEncoder: `${plan.directory}/model-1.gguf`,
      ggufVae: `${plan.directory}/model-2.gguf`,
    })
  })
  it('does not acknowledge a completion just because its panel was already open', async () => {
    useCreationInstall.setState({ job: job() })
    render(<CreationInstallIndicator />)
    fireEvent.click(screen.getByRole('button', { name: 'hub:download 50%' }))
    act(() =>
      useCreationInstall.setState({
        job: { ...job('ready'), verified: [true, true, true] },
      })
    )
    expect(screen.getByText('chat:creationInstall.use')).toBeInTheDocument()
    expect(mocks.invoke).not.toHaveBeenCalled()
    mocks.invoke.mockResolvedValue({ ...job('ready'), acknowledged: true })
    fireEvent.click(screen.getByText('common:confirm'))
    await waitFor(() =>
      expect(mocks.invoke).toHaveBeenCalledWith('creation_bundle_action', {
        action: 'acknowledge',
        token: undefined,
      })
    )
  })
  it('enables the NVFP4 starter only after the configured runtime passes its GPU probe', async () => {
    mocks.invoke.mockImplementation(async (command) =>
      command === 'creation_bundle_nvfp4_probe'
        ? { eligible: true }
        : { ...plan, variant: 'nvfp4' }
    )
    render(<CreationInstallButton />)
    const native = screen.getByRole('button', {
      name: 'NVFP4 CUDA · FLUX.2 Klein 4B',
    })
    await waitFor(() => expect(native).toBeEnabled())
    fireEvent.click(native)
    await waitFor(() =>
      expect(mocks.invoke).toHaveBeenCalledWith(
        'creation_bundle_plan',
        expect.objectContaining({ variant: 'nvfp4' })
      )
    )
  })
  it('blocks confirmation when free space is insufficient', async () => {
    mocks.invoke.mockResolvedValue({ ...plan, available: 0 })
    render(<CreationInstallButton />)
    fireEvent.click(screen.getByText('chat:creationInstall.install'))
    await screen.findByRole('dialog')
    expect(screen.getByText('hub:download')).toBeDisabled()
    expect(
      mocks.invoke.mock.calls.filter(
        ([command]) => command !== 'creation_bundle_nvfp4_probe'
      )
    ).toHaveLength(1)
  })
  it('pauses and resumes from the global progress panel', async () => {
    useCreationInstall.setState({ job: job() })
    render(<CreationInstallIndicator />)
    fireEvent.click(screen.getByRole('button', { name: 'hub:download 50%' }))
    mocks.invoke.mockResolvedValue(job('paused'))
    fireEvent.click(screen.getByText('chat:creationInstall.pause'))
    await screen.findByText('chat:creationInstall.resume')
    expect(mocks.invoke).toHaveBeenLastCalledWith('creation_bundle_action', {
      action: 'pause',
      token: undefined,
    })
    mocks.invoke.mockResolvedValue(job())
    fireEvent.click(screen.getByText('chat:creationInstall.resume'))
    await waitFor(() =>
      expect(mocks.invoke).toHaveBeenLastCalledWith('creation_bundle_action', {
        action: 'resume',
        token: undefined,
      })
    )
  })
})
it('applies a verified video pack to its own settings bank and leaves image paths untouched', () => {
  useCreation.setState({ settings: { ...creationDefaults, ggufImageModel: 'D:/image.gguf' }, videoSettings: undefined })
  const videoPlan: InstallPlan = { ...plan, variant: 'video-gguf', token: 'video-pack', directory: 'D:/chosen/Wan', files: ['videoModel', 'ggufTextEncoder', 'ggufVae'].map((role) => ({ role, name: `${role}.gguf`, url: 'https://huggingface.co/example', size: 1, sha256: '0'.repeat(64) })) }
  applyInstalled({ ...job('ready'), plan: videoPlan, verified: [true, true, true] })
  expect(useCreation.getState().videoSettings).toMatchObject({ videoEngine: 'sdcpp', videoModel: 'D:/chosen/Wan/videoModel.gguf', ggufTextEncoder: 'D:/chosen/Wan/ggufTextEncoder.gguf', frames: 81, fps: 16, durationSeconds: 5, seedMode: 'random', mediaRatio: '21:9' })
  expect(useCreation.getState().settings.ggufImageModel).toBe('D:/image.gguf')
})
