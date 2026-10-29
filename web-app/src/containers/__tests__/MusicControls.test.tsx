import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import {
  MusicDashboardControls,
  MusicSetupPanel,
  MusicModelControl,
} from '../MusicControls'
import { useMusicCreation } from '@/hooks/useMusicCreation'
import { musicDefaults } from '@/modules/engines/music'
import { useCreation } from '@/hooks/useCreation'
const mocks = vi.hoisted(() => ({ open: vi.fn(), invoke: vi.fn() }))
vi.mock('@tauri-apps/api/core', () => ({ invoke: mocks.invoke }))
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
beforeEach(() => {
  vi.clearAllMocks()
  useCreation.setState({selections:{},modes:{}})
  useMusicCreation.setState({
    settings: { ...musicDefaults },
    profiles: [],
    selections: {},
    installed: [],
  })
})
it('offers official cloud music providers with their icons and preserves Auto when selecting one',async()=>{
  render(<MusicSetupPanel scope="cloud" disabled={false}/>)
  fireEvent.keyDown(screen.getByRole('button',{name:'chat:creation.music · chat:creation.model'}),{key:'ArrowDown'})
  await waitFor(()=>expect(screen.getByRole('menu')).toBeInTheDocument())
  for(const provider of ['ElevenLabs','Stability AI','fal','Replicate'])expect(screen.getByRole('img',{name:provider})).toHaveAttribute('src',expect.stringMatching(/\/images\/model-provider\//))
  expect(screen.queryByText(/MiniMax/)).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('menuitem',{name:/ElevenMusic v2.5/}))
  expect(useCreation.getState().selections.cloud?.music?.provider).toBe('elevenlabs')
  expect(useCreation.getState().modes.cloud).toBeUndefined()
  expect(screen.getByRole('button',{name:'chat:creation.seedMode'})).toBeDisabled()
})
it('starts with empty paths, random seed, automatic duration and MP3 320', () => {
  expect(useMusicCreation.getState().settings).toMatchObject({
    directory: '',
    engineDirectory: '',
    generator: '',
    planner: '',
    encoder: '',
    vae: '',
    seedMode: 'random',
    durationSeconds: 30,
    quality: 'mp3-320',
    durationAuto: true,
    instrumental: true,
  })
  render(<MusicDashboardControls scope="new" disabled={false} />)
  fireEvent.click(
    screen.getByRole('button', { name: 'chat:creation.musicDuration' })
  )
  const duration = screen.getByRole('spinbutton', {
    name: 'chat:creation.musicDuration',
  })
  expect(duration).toHaveValue(30)
  expect(duration).toHaveAttribute('min', '10')
  expect(duration).toHaveAttribute('max', '600')
  expect(duration).toHaveAttribute('step', '1')
  fireEvent.change(duration, { target: { value: '137' } })
  expect(useMusicCreation.getState().settings.durationSeconds).toBe(137)
  fireEvent.change(duration, { target: { value: '601' } })
  expect(duration).toHaveAttribute('aria-invalid', 'true')
  const shortcuts = screen.getAllByRole('button', { name: 'common:duration.seconds' })
  const values = [10, 30, 60, 90, 120, 150, 180, 210, 240, 360, 480, 600]
  expect(shortcuts).toHaveLength(values.length)
  for (const [index, button] of shortcuts.entries()) {
    fireEvent.click(button)
    expect(useMusicCreation.getState().settings.durationSeconds).toBe(values[index])
  }
})
it('toggles instrumental from the dashboard and saves the active profile', () => {
  useMusicCreation.setState({ profiles: [
    { id: 'active', name: 'Active', settings: { ...musicDefaults, lyrics: 'Des paroles', instrumental: false } },
    { id: 'other', name: 'Other', settings: { ...musicDefaults, instrumental: false } },
  ], selections: { music: 'active' } })
  const { rerender } = render(<MusicDashboardControls scope="music" disabled={false} />)
  const toggle = screen.getByRole('switch', { name: 'chat:creation.musicInstrumental' })
  expect(toggle).toHaveAttribute('aria-checked', 'false')
  fireEvent.click(toggle)
  expect(toggle).toHaveAttribute('aria-checked', 'true')
  expect(useMusicCreation.getState().profiles[0].settings).toMatchObject({ instrumental: true, lyrics: 'Des paroles' })
  expect(useMusicCreation.getState().profiles[1].settings.instrumental).toBe(false)
  fireEvent.click(toggle)
  expect(useMusicCreation.getState().profiles[0].settings.instrumental).toBe(false)
  rerender(<MusicDashboardControls scope="music" disabled={true} />)
  expect(toggle).toBeDisabled()
})
it('exposes audio format quality in the dashboard independently from image/video settings', () => {
  render(<MusicDashboardControls scope="new" disabled={false} />)
  fireEvent.click(
    screen.getByRole('button', { name: 'chat:creation.musicQuality' })
  )
  fireEvent.change(
    screen.getByRole('combobox', { name: 'chat:creation.musicQuality' }),
    { target: { value: 'mp3-320' } }
  )
  expect(useMusicCreation.getState().settings.quality).toBe('mp3-320')
})
it('lets Auto follow the prompt and restores the manual duration when disabled', () => {
  render(<MusicDashboardControls scope="new" disabled={false} prompt="Compose 3 minutes de musique" />)
  const trigger = screen.getByRole('button', { name: 'chat:creation.musicDuration' })
  expect(trigger).toHaveTextContent('chat:creation.auto')
  fireEvent.click(trigger)
  const input = screen.getByRole('spinbutton', { name: 'chat:creation.musicDuration' })
  expect(input).toHaveValue(180)
  expect(input).toBeEnabled()
  fireEvent.click(screen.getByRole('switch', { name: 'chat:creation.musicDuration · chat:creation.auto' }))
  expect(input).toHaveValue(30)
  expect(input).toBeEnabled()
  expect(useMusicCreation.getState().settings.durationAuto).toBe(false)
})
it('allows clearing 240 and typing 360 digit by digit even when the prompt specifies another duration', () => {
  useMusicCreation.getState().setSettings({ durationSeconds: 240 })
  render(<MusicDashboardControls scope="new" disabled={false} prompt="Compose 3 minutes de musique" />)
  fireEvent.click(screen.getByRole('button', { name: 'chat:creation.musicDuration' }))
  const input = screen.getByRole('spinbutton', { name: 'chat:creation.musicDuration' })
  fireEvent.change(input, { target: { value: '' } })
  expect(input).toHaveValue(null)
  for (const value of ['3', '36', '360']) {
    fireEvent.change(input, { target: { value } })
    expect(input).toHaveValue(Number(value))
  }
  fireEvent.blur(input)
  expect(input).toHaveValue(360)
  expect(input).toHaveAttribute('aria-invalid', 'false')
  expect(useMusicCreation.getState().settings).toMatchObject({ durationSeconds: 360, durationAuto: false })
})
it('browses the model folder, binds all four roles and saves a configuration without a personal default path', async () => {
  mocks.open.mockResolvedValue('D:/chosen/music')
  mocks.invoke.mockResolvedValue({
    generator: ['dit-Q4_K_M.gguf'],
    planner: ['lm-Q8.gguf'],
    encoder: ['enc-Q8.gguf'],
    vae: ['vae-BF16.gguf'],
  })
  render(<MusicSetupPanel scope="new" disabled={false} />)
  expect(screen.getByText('chat:creation.musicLyricsGuide')).toBeInTheDocument()
  expect(screen.getByText('[Intro] → [Verse] → [Chorus] → [Bridge] → [Outro]')).toBeInTheDocument()
  const folder = screen
    .getByText('common:selectFolder · GGUF')
    .closest('label')!
  fireEvent.click(within(folder).getByRole('button', { name: 'common:browse' }))
  await waitFor(() =>
    expect(useMusicCreation.getState().settings.directory).toBe(
      'D:/chosen/music'
    )
  )
  expect(useMusicCreation.getState().settings).toMatchObject({
    generator: 'dit-Q4_K_M.gguf',
    planner: 'lm-Q8.gguf',
    encoder: 'enc-Q8.gguf',
    vae: 'vae-BF16.gguf',
  })
  expect(screen.getByRole('checkbox', { name: 'chat:creation.musicInstrumental' })).toBeChecked()
  fireEvent.click(screen.getByRole('checkbox', { name: 'chat:creation.musicInstrumental' }))
  fireEvent.change(screen.getByLabelText('chat:creation.musicLyrics'), {
    target: { value: '[Verse]\nBonjour' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'common:save' }))
  expect(useMusicCreation.getState().profiles[0].settings).toMatchObject({
    instrumental: false,
    lyrics: '[Verse]\nBonjour',
  })
  fireEvent.click(screen.getByRole('button', { name: 'common:delete' }))
  expect(useMusicCreation.getState().profiles).toHaveLength(0)
  expect(useMusicCreation.getState().settings.directory).toBe('')
})
it('keeps the compact model button tied to the music configuration and opens the common setup page', () => {
  useMusicCreation.getState().setSettings({ generator: 'dit-Q4_K_M.gguf' })
  const listener = vi.fn()
  window.addEventListener('novera-creation-settings', listener)
  render(<MusicModelControl scope="new" disabled={false} />)
  fireEvent.click(
    screen.getByRole('button', {
      name: 'chat:creation.music · chat:creation.model: dit-Q4_K_M.gguf',
    })
  )
  expect(listener).toHaveBeenCalledOnce()
  window.removeEventListener('novera-creation-settings', listener)
})
