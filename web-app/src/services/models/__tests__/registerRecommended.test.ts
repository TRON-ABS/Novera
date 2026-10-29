import { beforeEach, expect, it, vi } from 'vitest'
import { registerRecommendedModels } from '../registerRecommended'
import manifest from '@/constants/text-manifest.json'
const mocks = vi.hoisted(() => ({ invoke: vi.fn() }))
vi.mock('@tauri-apps/api/core', () => ({ invoke: mocks.invoke }))
const file = { id: 'Nemotron-3.5-Bolt-E4B-Q4_K_M', path: 'C:/Downloads/Nemotron-3.5-Bolt-E4B-Q4_K_M.gguf', size: manifest[0].size, sha256: manifest[0].sha256 }
const engine = () => ({ get: vi.fn().mockResolvedValue(undefined), import: vi.fn().mockResolvedValue(undefined) })
beforeEach(() => { vi.clearAllMocks(); mocks.invoke.mockResolvedValue([file]) })
it('registers the verified recommendation by reference without a draft or download', async () => {
  const local = engine()
  await registerRecommendedModels(local)
  expect(local.import).toHaveBeenCalledWith(file.id, { modelPath: file.path, modelSha256: file.sha256, modelSize: file.size })
})
it('preserves existing model settings and skips repeat disk hashing', async () => {
  const local = engine(); local.get.mockResolvedValue({ id: file.id })
  await registerRecommendedModels(local)
  expect(mocks.invoke).not.toHaveBeenCalled()
  expect(local.import).not.toHaveBeenCalled()
})
it('does not resurrect an explicitly deleted recommendation', async () => {
  const local = engine()
  await registerRecommendedModels(local, [{ provider: 'llamacpp', id: file.id }])
  expect(local.import).not.toHaveBeenCalled()
  expect(mocks.invoke).not.toHaveBeenCalled()
})
it('shares an in-flight registration between focus and provider refresh', async () => {
  const local = engine()
  await Promise.all([registerRecommendedModels(local), registerRecommendedModels(local)])
  expect(local.import).toHaveBeenCalledOnce()
})
it('does not import incomplete or unknown files absent from native discovery', async () => {
  mocks.invoke.mockResolvedValue([{ ...file, id: 'unrecommended' }])
  const local = engine()
  await registerRecommendedModels(local)
  expect(local.import).not.toHaveBeenCalled()
})
