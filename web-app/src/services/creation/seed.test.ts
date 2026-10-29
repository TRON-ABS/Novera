import { beforeEach, describe, expect, it, vi } from 'vitest'
import { reserveImageSeed, reserveCreationSeed } from './seed'
import { useCreation, creationDefaults } from '@/hooks/useCreation'
import { useMediaLibrary } from '@/hooks/useMediaLibrary'
vi.mock('@/lib/backendStorage', () => ({
  backendStorage: {
    getItem: async () => null,
    setItem: async () => {},
    removeItem: async () => {},
  },
}))

describe('image seed reservation', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    useCreation.setState({ settings: { ...creationDefaults }, videoSettings: undefined })
    useMediaLibrary.setState({ profiles: [] })
  })
  it('draws a concrete random seed and keeps the fixed input available for reuse', () => {
    vi.spyOn(crypto, 'getRandomValues').mockImplementation((array) => {
      ;(array as Uint32Array)[0] = 123
      return array
    })
    expect(reserveImageSeed()).toBe(123)
    expect(useCreation.getState().settings).toMatchObject({
      seed: 42,
      lastImageSeed: 123,
    })
  })
  it('reserves distinct incrementing seeds for consecutive requests', () => {
    useCreation.getState().setSettings({ seedMode: 'increment' })
    expect([reserveImageSeed(), reserveImageSeed()]).toEqual([42, 43])
    expect(useCreation.getState().settings.seed).toBe(44)
  })
  it('updates only the selected profile and preserves explicitly fixed seeds', () => {
    useMediaLibrary.setState({
      profiles: [
        {
          id: 'a',
          name: 'a',
          task: 'image',
          settings: { ...creationDefaults, seedMode: 'decrement', seed: 10 },
        },
        {
          id: 'b',
          name: 'b',
          task: 'image',
          settings: { ...creationDefaults, seedMode: 'fixed', seed: 99 },
        },
      ],
    })
    expect(reserveImageSeed('a')).toBe(10)
    expect(reserveImageSeed('a')).toBe(9)
    expect(reserveImageSeed('b')).toBe(99)
    expect(reserveImageSeed('b')).toBe(99)
    expect(useCreation.getState().settings.seed).toBe(42)
    expect(
      useMediaLibrary.getState().profiles.find((p) => p.id === 'a')?.settings
        .seed
    ).toBe(8)
  })
  it('reserves random video seeds by default without changing image seeds', () => {
    vi.spyOn(crypto, 'getRandomValues').mockImplementation((array) => {
      ;(array as Uint32Array)[0] = 987
      return array
    })
    const image = { ...useCreation.getState().settings }
    expect(reserveCreationSeed('video')).toBe(987)
    expect(useCreation.getState().videoSettings).toMatchObject({ seedMode: 'random', lastImageSeed: 987 })
    expect(useCreation.getState().settings).toEqual(image)
  })
  it('supports fixed, incrementing and decrementing video seeds in the selected profile', () => {
    useMediaLibrary.setState({ profiles: [{ id: 'v', name: 'video', task: 'video', settings: { ...creationDefaults, seed: 3, seedMode: 'decrement' } }] })
    expect([reserveCreationSeed('video', 'v'), reserveCreationSeed('video', 'v')]).toEqual([3, 2])
    expect(useMediaLibrary.getState().profiles[0].settings).toMatchObject({ seed: 1, lastImageSeed: 2 })
    expect(useCreation.getState().settings.seed).toBe(42)
  })
})
