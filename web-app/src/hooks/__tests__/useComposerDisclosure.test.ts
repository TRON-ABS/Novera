import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { COMPOSER_COLLAPSED_KEY, useComposerDisclosure } from '../useComposerDisclosure'

describe('manual composer disclosure', () => {
  beforeEach(() => localStorage.removeItem(COMPOSER_COLLAPSED_KEY))
  afterEach(() => vi.restoreAllMocks())

  it('starts open and saves only a boolean preference', () => {
    const { result } = renderHook(useComposerDisclosure)
    expect(result.current[0]).toBe(false)
    act(() => result.current[1](true))
    expect(result.current[0]).toBe(true)
    expect(localStorage.getItem(COMPOSER_COLLAPSED_KEY)).toBe('true')
    act(() => result.current[1](false))
    expect(localStorage.getItem(COMPOSER_COLLAPSED_KEY)).toBe('false')
  })

  it('still folds and opens when webview storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked') })
    const { result } = renderHook(useComposerDisclosure)
    expect(result.current[0]).toBe(false)
    act(() => result.current[1](true))
    expect(result.current[0]).toBe(true)
    act(() => result.current[1](false))
    expect(result.current[0]).toBe(false)
  })
})
