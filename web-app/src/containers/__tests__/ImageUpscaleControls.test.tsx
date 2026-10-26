import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ImageUpscaleControls } from '../ImageUpscaleControls'
import { useImageUpscale } from '@/hooks/useImageUpscale'
const mocks = vi.hoisted(() => ({ open: vi.fn() }))
vi.mock('../CreationInstall', () => ({ CreationInstallButton: () => null }))
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
describe('optional upscaling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useImageUpscale.setState({
      enabled: false,
      factor: 2,
      models: { 2: '', 4: '' },
    })
  })
  it('starts disabled with x2 selected, supports x4 and preserves settings when disabled', async () => {
    render(<ImageUpscaleControls />)
    const toggle = screen.getByRole('checkbox', {
      name: 'chat:creation.upscaleTitle',
    })
    expect(toggle).not.toBeChecked()
    fireEvent.click(toggle)
    expect(screen.getByRole('combobox')).toHaveValue('2')
    expect(screen.getByLabelText('chat:creation.upscaleModel')).toHaveAttribute(
      'placeholder',
      expect.stringContaining('RealESRGAN_x2plus.pth')
    )
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '4' } })
    mocks.open.mockResolvedValue('D:/models/RealESRGAN_x4plus.pth')
    fireEvent.click(screen.getByRole('button', { name: 'common:browse' }))
    await waitFor(() =>
      expect(useImageUpscale.getState().models[4]).toBe(
        'D:/models/RealESRGAN_x4plus.pth'
      )
    )
    fireEvent.click(toggle)
    expect(useImageUpscale.getState()).toMatchObject({
      enabled: false,
      factor: 4,
    })
    fireEvent.click(toggle)
    fireEvent.click(screen.getByRole('button', { name: 'chat:creation.auto' }))
    expect(useImageUpscale.getState().models[4]).toBe('')
  })
})
