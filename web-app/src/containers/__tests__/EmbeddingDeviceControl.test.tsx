import { beforeEach, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { EmbeddingDeviceControl } from '../EmbeddingDeviceControl'

const models = vi.hoisted(() => ({ getEmbeddingDevice: vi.fn(), updateModelSettings: vi.fn() }))
vi.mock('@/hooks/useServiceHub', () => ({ useServiceHub: () => ({ models: () => models }) }))
vi.mock('@/i18n/react-i18next-compat', () => ({ useTranslation: () => ({ t: (key: string) => key }) }))
beforeEach(() => {
  vi.clearAllMocks()
  models.getEmbeddingDevice.mockResolvedValue('cpu')
  models.updateModelSettings.mockResolvedValue(undefined)
})

it('defaults to CPU, persists GPU auto offload, and allows returning to CPU', async () => {
  render(<EmbeddingDeviceControl modelId="qwen" />)
  const device = screen.getByRole('combobox')
  expect(device).toHaveValue('cpu')
  await waitFor(() => expect(device).toBeEnabled())
  fireEvent.change(device, { target: { value: 'gpu' } })
  await waitFor(() => expect(device).toHaveValue('gpu'))
  expect(models.updateModelSettings).toHaveBeenLastCalledWith('qwen', { ngl: -1 })
  fireEvent.change(device, { target: { value: 'cpu' } })
  await waitFor(() => expect(device).toHaveValue('cpu'))
  expect(models.updateModelSettings).toHaveBeenLastCalledWith('qwen', { ngl: 0 })
})

it('restores a saved GPU choice on reopening', async () => {
  models.getEmbeddingDevice.mockResolvedValue('gpu')
  render(<EmbeddingDeviceControl modelId="qwen" />)
  await waitFor(() => expect(screen.getByRole('combobox')).toHaveValue('gpu'))
  expect(models.getEmbeddingDevice).toHaveBeenCalledWith('qwen')
})

it('retains CPU and allows retrying when persistence fails', async () => {
  models.updateModelSettings.mockRejectedValueOnce(new Error('engine busy'))
  render(<EmbeddingDeviceControl modelId="qwen" />)
  const device = screen.getByRole('combobox')
  await waitFor(() => expect(device).toBeEnabled())
  fireEvent.change(device, { target: { value: 'gpu' } })
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('engine busy'))
  expect(device).toHaveValue('cpu')
  expect(device).toBeEnabled()
  fireEvent.change(device, { target: { value: 'gpu' } })
  await waitFor(() => expect(device).toHaveValue('gpu'))
})
