import { beforeEach, describe, expect, it, vi } from 'vitest'
import { reserveImageSeed } from './seed'
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
    useCreation.setState({ settings: { ...creationDefaults } })
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
  it('updates only the selected profile and preserves legacy fixed seeds', () => {
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
          settings: { ...creationDefaults, seedMode: undefined, seed: 99 },
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
})
