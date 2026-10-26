import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useHubProgressiveOrder } from '../useHubProgressiveOrder'
import type { CatalogModel } from '@/services/models/types'

const model = (id: string, downloads = 0): CatalogModel => ({ model_name: id, downloads, description: '' })
describe('Hub progressive model order', () => {
  it('appends new models without moving existing rows and refreshes their metadata', () => {
    const { result, rerender } = renderHook(({ models, scope }) => useHubProgressiveOrder(models, scope), {
      initialProps: { models: [model('b'), model('c')], scope: 'image' },
    })
    rerender({ models: [model('a'), model('b', 20), model('c')], scope: 'image' })
    expect(result.current.map(item => item.model_name)).toEqual(['b', 'c', 'a'])
    expect(result.current[0].downloads).toBe(20)
    rerender({ models: [model('z'), model('a')], scope: 'video' })
    expect(result.current.map(item => item.model_name)).toEqual(['z', 'a'])
  })
  it('resets the order when sorting or filters change and drops removed rows', () => {
    const { result, rerender } = renderHook(({ models, scope }) => useHubProgressiveOrder(models, scope), {
      initialProps: { models: [model('b'), model('a')], scope: 'text:adapted' },
    })
    rerender({ models: [model('a'), model('b')], scope: 'text:smallest' })
    expect(result.current.map(item => item.model_name)).toEqual(['a', 'b'])
    rerender({ models: [model('b')], scope: 'text:smallest' })
    expect(result.current.map(item => item.model_name)).toEqual(['b'])
  })
})
