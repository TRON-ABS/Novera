import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MediaSizeControls } from '../MediaSizeControls'
import { creationDefaults } from '@/hooks/useCreation'
vi.mock('@/i18n/react-i18next-compat', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))
describe('ratio and resolution buttons', () => {
  it('adapts the current resolution and shows the actual compatible pixels', () => {
    function Test() {
      const [settings, setSettings] = useState({
        ...creationDefaults,
        width: 1024,
        height: 1024,
      })
      return (
        <MediaSizeControls
          settings={settings}
          setSettings={(patch) => setSettings((s) => ({ ...s, ...patch }))}
        />
      )
    }
    render(<Test />)
    fireEvent.click(screen.getByRole('button', { name: '16:9' }))
    expect(screen.getByRole('button', { name: '1024 × 576' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    fireEvent.click(screen.getByRole('button', { name: '1280 × 720' }))
    expect(screen.getByRole('button', { name: '1280 × 720' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    fireEvent.click(screen.getByRole('button', { name: '9:16' }))
    expect(screen.getByRole('button', { name: '720 × 1280' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(screen.getByRole('button', { name: '21:9' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '32:9' })).toBeInTheDocument()
  })
})
