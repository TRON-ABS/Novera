import { beforeEach, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { EmbeddingSetupPanel, recommendedEmbedding } from '../EmbeddingSetupPanel'
import { useModelProvider } from '@/hooks/useModelProvider'
import { useDefaultEmbeddingModel } from '@/hooks/useDefaultEmbeddingModel'

vi.mock('@/i18n/react-i18next-compat', () => ({ useTranslation: () => ({ t: (key: string) => key }) }))
vi.mock('@/lib/backendStorage', () => ({ backendStorage: { getItem: async () => null, setItem: async () => {}, removeItem: async () => {} } }))
vi.mock('../EmbeddingDeviceControl', () => ({ EmbeddingDeviceControl: ({ modelId }: { modelId: string }) => <div data-testid="embedding-device">{modelId} · CPU / GPU</div> }))
vi.mock('../DownloadButton', () => ({ DownloadButtonPlaceholder: ({ model, useLabel, handleUseModel }: any) =>
  <button onClick={() => handleUseModel(model.quants[0].model_id)}>{useLabel}</button> }))

beforeEach(() => {
  useModelProvider.setState({ providers: [], selectedModel: { id: 'chat-model' } as Model })
  useDefaultEmbeddingModel.setState({ defaultByProvider: {} })
})

it('offers the official Q8 embedding independently of the chat model', () => {
  render(<EmbeddingSetupPanel />)
  expect(screen.getByRole('heading')).toHaveTextContent('Qwen3-Embedding-0.6B · Q8_0 · 639 MB')
  expect(recommendedEmbedding.quants![0].path).toBe('https://huggingface.co/Qwen/Qwen3-Embedding-0.6B-GGUF/resolve/main/Qwen3-Embedding-0.6B-Q8_0.gguf?download=true')
  expect(screen.queryByTestId('embedding-device')).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'providers:embeddingModelSetDefault' }))
  expect(useDefaultEmbeddingModel.getState().defaultByProvider.llamacpp).toBe('Qwen3-Embedding-0.6B-Q8_0')
  expect(useModelProvider.getState().selectedModel?.id).toBe('chat-model')
})

it('shows the saved CPU/GPU control when Qwen is installed and marks the embedding default', () => {
  const id = 'Qwen3-Embedding-0.6B-Q8_0'
  useModelProvider.setState({ providers: [{ provider: 'llamacpp', models: [{ id, embedding: true }] } as ProviderObject] })
  useDefaultEmbeddingModel.setState({ defaultByProvider: { llamacpp: id } })
  render(<EmbeddingSetupPanel />)
  expect(screen.getByTestId('embedding-device')).toHaveTextContent(`${id} · CPU / GPU`)
  expect(screen.getByRole('button', { name: 'providers:embeddingModelIsDefault' })).toBeInTheDocument()
})
