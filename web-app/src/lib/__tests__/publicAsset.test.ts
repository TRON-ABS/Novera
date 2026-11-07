import { afterEach, expect, it, vi } from 'vitest'
import { publicAsset } from '../publicAsset'

afterEach(() => vi.unstubAllEnvs())
it('keeps bundled logos below the Web deployment without rewriting API or external URLs', () => {
  vi.stubEnv('BASE_URL', '/Novera/web/')
  expect(publicAsset('/images/novera-logo.png')).toBe('/Novera/web/images/novera-logo.png')
  expect(publicAsset('https://example.com/avatar.png')).toBe('https://example.com/avatar.png')
  expect(publicAsset('data:image/png;base64,abc')).toBe('data:image/png;base64,abc')
  expect(publicAsset('/v1/images/generations')).toBe('/v1/images/generations')
  vi.stubEnv('BASE_URL', '/')
  expect(publicAsset('/images/novera-logo.png')).toBe('/images/novera-logo.png')
})
