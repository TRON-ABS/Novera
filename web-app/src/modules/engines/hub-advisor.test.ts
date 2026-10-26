import { describe, expect, it } from 'vitest'
import { diagnoseHubModel } from './hub-catalog'
import { adviseHub } from './hub-advisor'

const GiB = 1024 ** 3
const hardware = { platform: 'windows', ramBytes: 16 * GiB, gpus: [] }
const model = { pipeline_tag: 'text-generation', quants: [{ model_id: 'model', path: 'model.gguf' }] }
const item = (id: string, bytes: number) => ({ id, diagnosis: diagnoseHubModel(model, hardware, { weightsBytes: bytes }) })

describe('local Hub advice', () => {
  it('excludes unsupported pipelines and models that exceed memory', () => {
    const image = { ...model, pipeline_tag: 'text-to-image' }
    const advice = adviseHub([item('fits', GiB), item('too-large', 30 * GiB), { id: 'image', diagnosis: diagnoseHubModel(image, hardware, { weightsBytes: GiB }) }], 'ready', 'fr')
    expect(advice.picks.map(pick => pick.id)).toEqual(['fits'])
    expect(advice.tips).toContain('tipLimited')
  })
  it('explains language metadata and distinguishes simple-start from smallest-download priorities', () => {
    const small = item('small', 0.2 * GiB)
    const preset = { ...item('preset', GiB), preferred: true, languages: ['fr'] }
    expect(adviseHub([small, preset], 'ready', 'fr-FR').picks[0]).toMatchObject({ id: 'preset', reasons: expect.arrayContaining(['reasonLanguage', 'reasonReady']) })
    expect(adviseHub([small, preset], 'compact', 'fr').picks[0].id).toBe('small')
  })
  it('uses actual dates for recent models without labelling old or future metadata recent', () => {
    const now = Date.parse('2026-10-26T12:00:00Z')
    const old = { ...item('old', GiB), updatedAt: '2020-01-01' }
    const recent = { ...item('recent', GiB), updatedAt: '2026-10-25' }
    const advice = adviseHub([old, recent], 'recent', 'en', now)
    expect(advice.picks[0].id).toBe('recent')
    expect(advice.picks[0].reasons).toContain('reasonRecent')
    expect(advice.picks.find(pick => pick.id === 'old')?.reasons).not.toContain('reasonRecent')
  })
  it('prepares future tasks with explicit engine advice and no invented recommendation', () => {
    const video = diagnoseHubModel({ pipeline_tag: 'text-to-video', safetensors_files: [{ path: 'model.safetensors' }] }, hardware, { weightsBytes: GiB })
    const advice = adviseHub([{ id: 'video', diagnosis: video }], 'ready', 'fr')
    expect(advice.picks).toEqual([])
    expect(advice.tips).toContain('tipFuture')
  })
})
