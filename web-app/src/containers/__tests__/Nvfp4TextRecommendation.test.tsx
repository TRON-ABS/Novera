import { render, screen } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import { useHardware, type GPU } from '@/hooks/useHardware'
import { Nvfp4TextRecommendation, LFM3_NVFP4_URL } from '../Nvfp4TextRecommendation'
vi.mock('@/i18n/react-i18next-compat', () => ({ useTranslation: () => ({ t: (key: string) => key }) }))
vi.mock('@/lib/backendStorage', () => ({ backendStorage: { getItem: async () => null, setItem: async () => {}, removeItem: async () => {} } }))
function gpu(capability: string, extra: Partial<GPU> = {}): GPU {
  return { name: 'NVIDIA GeForce RTX 5070', vendor: 'NVIDIA', total_memory: 8192, activated: true,
    nvidia_info: { compute_capability: capability, index: 0 }, ...extra } as GPU
}
function hardware(gpus: GPU[]) {
  useHardware.setState({ hardwareData: { ...useHardware.getState().hardwareData, gpus } })
}
beforeEach(() => { vi.clearAllMocks(); hardware([]) })
it.each(['8.9', '9.0', ''])('does not offer native NVFP4 without supported hardware (%s)', (cap) => {
  hardware([gpu(cap)])
  render(<Nvfp4TextRecommendation />)
  expect(screen.queryByRole('link')).not.toBeInTheDocument()
})
it('offers the requested source weights on Blackwell without external-server controls', () => {
  hardware([gpu('12.0')])
  render(<Nvfp4TextRecommendation />)
  expect(screen.getByRole('link', { name: 'hub:download' })).toHaveAttribute('href', LFM3_NVFP4_URL)
  expect(screen.getByText('chat:creation.setupTextNvfp4Note')).toBeInTheDocument()
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
})
it.each([{ activated: false }, { total_memory: 2048 }, { vendor: 'AMD', name: 'Radeon' }])('hides the option for an unavailable GPU %o', (extra) => {
  hardware([gpu('12.0', extra)])
  render(<Nvfp4TextRecommendation />)
  expect(screen.queryByRole('link')).not.toBeInTheDocument()
})
