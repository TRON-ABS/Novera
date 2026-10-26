import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryModeControl } from '../MemoryModeControl'
import { useMemoryPolicy } from '@/hooks/useMemoryPolicy'
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
describe('visible memory policy guidance', () => {
  beforeEach(() => useMemoryPolicy.setState({ policy: 'auto', waiting: {} }))
  it('defaults to Automatic and explains Manual parallel text/image/video without resetting model choices', () => {
    render(<MemoryModeControl scope="a" />)
    fireEvent.click(screen.getByRole('button', { name: 'chat:memory.title' }))
    expect(screen.getByText('chat:memory.autoNote')).toBeInTheDocument()
    fireEvent.change(screen.getByRole('combobox', { name: 'chat:memory.title' }), {
      target: { value: 'manual' },
    })
    expect(useMemoryPolicy.getState().policy).toBe('manual')
    expect(screen.getByText('chat:memory.manualNote')).toBeInTheDocument()
    expect(screen.getByText('chat:memory.preserve')).toBeInTheDocument()
  })
  it('keeps waiting status visible in the collapsed summary and scoped to its conversation', () => {
    useMemoryPolicy.setState({ waiting: { a: 1 } })
    render(<MemoryModeControl scope="a" />)
    expect(screen.getByRole('button', { name: 'chat:memory.title' })).toHaveTextContent(
      'chat:memory.waiting'
    )
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
  it('balances overlapping waiting operations without hiding the remaining one', () => {
    const state = useMemoryPolicy.getState()
    state.setWaiting('a', true)
    state.setWaiting('a', true)
    state.setWaiting('a', false)
    expect(useMemoryPolicy.getState().waiting.a).toBe(1)
    state.setWaiting('a', false)
    expect(useMemoryPolicy.getState().waiting.a).toBeUndefined()
  })
})
