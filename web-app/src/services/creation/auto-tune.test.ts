import { describe, expect, it, vi } from 'vitest'
import { runAutoTuneLoop, runCalibrationQueue } from './auto-tune'

describe('Auto Tune', () => {
  it('repeats a finished pass after a three-second pause until disabled', async () => {
    let passes = 0
    let paused = 0
    await runAutoTuneLoop(async () => { passes++ }, async () => passes < 2, async ms => { paused += ms })
    expect(passes).toBe(2)
    expect(paused).toBe(3_000)
  })

  it('does not start another pass when disabled during the pause', async () => {
    let enabled = true
    let passes = 0
    await runAutoTuneLoop(async () => { passes++ }, async () => enabled, async () => { enabled = false })
    expect(passes).toBe(1)
  })

  it('takes one job per category in order before continuing to the next round', async () => {
    const calls: string[] = []
    const job = (name: string) => async () => { calls.push(name) }
    await runCalibrationQueue([
      [job('text-1'), job('text-2')], [job('image')], [job('music')], [job('video')],
    ], async () => true)
    expect(calls).toEqual(['text-1', 'image', 'music', 'video', 'text-2'])
  })

  it('counts each of the profile jobs once after it is handled', async () => {
    const settled = vi.fn()
    const job = async () => {}
    await runCalibrationQueue([[job, job], [job], [], [job]], async () => true, settled)
    expect(settled).toHaveBeenCalledTimes(4)
  })

  it('stops starting jobs when Auto Tune is disabled', async () => {
    let enabled = true
    let videoStarted = false
    await runCalibrationQueue([
      [async () => { enabled = false }], [], [], [async () => { videoStarted = true }],
    ], async () => enabled)
    expect(videoStarted).toBe(false)
  })
})
