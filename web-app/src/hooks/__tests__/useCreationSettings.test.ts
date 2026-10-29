import { beforeEach, expect, it, vi } from 'vitest'
vi.mock('@/lib/backendStorage', () => ({ backendStorage: { getItem: async () => null, setItem: async () => {}, removeItem: async () => {} } }))
import { creationDefaults, useCreation, videoSettingsFor } from '../useCreation'

beforeEach(() => useCreation.setState({ settings: { ...creationDefaults }, videoSettings: undefined }))

it('ships empty local model paths for both media configurations', () => {
  for (const settings of [creationDefaults, videoSettingsFor(useCreation.getState())]) {
    for (const key of ['imageModel', 'videoModel', 'ggufImageModel', 'ggufTextEncoder', 'ggufVae', 'cppExecutable'] as const) expect(settings[key]).toBe('')
  }
})
it('defaults both media to random seeds and 21:9, with five-second video clips', () => {
  for (const settings of [creationDefaults, videoSettingsFor(useCreation.getState())]) {
    expect(settings.seedMode).toBe('random')
    expect(settings.mediaRatio).toBe('21:9')
    expect(settings.width % 16).toBe(0)
    expect(settings.height % 16).toBe(0)
  }
  expect(videoSettingsFor(useCreation.getState())).toMatchObject({ durationSeconds: 5, frames: 81, fps: 16 })
})
it('keeps a legacy video folder without copying image-model paths into the video bank', () => {
  const settings = { ...creationDefaults, videoModel: 'D:/legacy/video', ggufImageModel: 'D:/legacy/image.gguf', ggufTextEncoder: 'D:/legacy/qwen.gguf', ggufVae: 'D:/legacy/flux.safetensors' }
  const video = videoSettingsFor({ settings })
  expect(video.videoModel).toBe('D:/legacy/video')
  expect(video.ggufImageModel).toBe('')
  expect(video.ggufTextEncoder).toBe('')
  expect(video.ggufVae).toBe('')
  expect(settings.ggufTextEncoder).toBe('D:/legacy/qwen.gguf')
})
it('never changes one media bank when editing the other', () => {
  useCreation.getState().setVideoSettings({ width: 832, videoModel: 'D:/chosen/video.gguf' })
  const video = { ...useCreation.getState().videoSettings }
  useCreation.getState().setSettings({ width: 1024, ggufTextEncoder: 'D:/chosen/image-encoder.gguf' })
  expect(useCreation.getState().videoSettings).toEqual(video)
  const image = { ...useCreation.getState().settings }
  useCreation.getState().setVideoSettings({ width: 640, ggufTextEncoder: 'D:/chosen/video-encoder.gguf' })
  expect(useCreation.getState().settings).toEqual(image)
})
