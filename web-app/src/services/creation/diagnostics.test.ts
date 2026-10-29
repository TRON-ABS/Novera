import { describe, expect, it, vi } from 'vitest'
import { creationFailure } from './diagnostics'

vi.mock('@/i18n', () => ({ default: { t: (key: string) => key } }))

describe('actionable generation diagnostics', () => {
  it.each([
    new Error('Disk full (os error 112)'),
    'CREATION_BUNDLED_ENGINE_MISSING',
    { message: 'Permission denied', code: 13 },
  ])('keeps the actual failure without claiming the model is unconfigured', error => {
    const visible = creationFailure(error).message
    const detail = error instanceof Error ? error.message : typeof error === 'string' ? error : error.message
    expect(visible).toContain(detail)
    expect(visible).toContain('chat:creation.failed')
    expect(visible).not.toContain('chat:creation.configure')
  })
  it.each(['CUDA out of memory', 'failed to allocate device buffer', 'workspace capacity check failed'])(
    'includes memory advice for a startup failure: %s', detail => {
      expect(creationFailure(detail).message).toContain('hub:catalog.tipLimited')
      expect(creationFailure(detail).message).toContain(detail)
    },
  )
  it('does not expose configured primary/fallback keys, bearer tokens or query credentials', () => {
    const primary = 'primary-test-key-only'
    const fallback = 'backup/test-key-only'
    const error = `Fetch failed: ${primary}, ${encodeURIComponent(fallback)} https://example.test?api_key=query-secret Authorization: Bearer header-secret`
    const visible = creationFailure(error, [primary, fallback]).message
    for (const secret of [primary, fallback, encodeURIComponent(fallback), 'query-secret', 'header-secret']) expect(visible).not.toContain(secret)
    expect(visible).toContain('Fetch failed')
    expect(visible).toContain('[redacted]')
  })
  it('caps verbose worker output without fabricating setup instructions', () => {
    const visible = creationFailure('Worker failed: ' + 'x'.repeat(5000)).message
    expect(visible.length).toBeLessThan(1800)
    expect(visible).not.toContain('chat:creation.configure')
  })
})
