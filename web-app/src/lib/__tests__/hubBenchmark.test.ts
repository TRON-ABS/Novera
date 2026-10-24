import { describe, it, expect, vi, beforeEach } from 'vitest'
const stream = vi.hoisted(() => vi.fn())
vi.mock('ai', () => ({ streamText: stream }))
import { measureHubModel } from '../hubBenchmark'
const model = {} as Parameters<typeof measureHubModel>[0]
beforeEach(() => vi.restoreAllMocks())
function mockRun(parts: unknown[], tokens?: number) {
  stream.mockReturnValue({ fullStream: (async function*(){ yield* parts })(), totalUsage: Promise.resolve({ outputTokens: tokens }) })
}
describe('local Hub measurement', () => {
  it('uses actual token usage, fixed local prompt and bounded output without tools', async () => {
    vi.spyOn(performance, 'now').mockReturnValueOnce(0).mockReturnValueOnce(200).mockReturnValueOnce(1000)
    mockRun([{type:'text-delta',text:'hello'}], 20)
    const signal = new AbortController().signal
    const result = await measureHubModel(model, signal)
    expect(result.firstTokenMs).toBe(200)
    expect(result.tokensPerSecond).toBe(20)
    expect(stream.mock.calls.at(-1)![0]).toMatchObject({ maxOutputTokens:128,maxRetries:0,abortSignal:signal })
    expect(stream.mock.calls.at(-1)![0]).not.toHaveProperty('tools')
    expect(stream.mock.calls.at(-1)![0]).not.toHaveProperty('messages')
  })
  it('does not substitute character counts when usage is missing', async () => {
    mockRun([{type:'text-delta',text:'some output'}])
    expect((await measureHubModel(model, new AbortController().signal)).tokensPerSecond).toBeNull()
  })
  it('rejects stream errors and cancellation instead of storing partial scores', async () => {
    mockRun([{type:'error',error:Error('failed')}])
    await expect(measureHubModel(model,new AbortController().signal)).rejects.toThrow('failed')
    mockRun([{type:'text-delta',text:'partial'}],4)
    const ac=new AbortController();ac.abort()
    await expect(measureHubModel(model,ac.signal)).rejects.toThrow()
  })
})
