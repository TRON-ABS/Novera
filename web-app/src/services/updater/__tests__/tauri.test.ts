import { describe, it, expect, vi, beforeEach } from 'vitest'
import { check, type Update } from '@tauri-apps/plugin-updater'
import { invoke } from '@tauri-apps/api/core'
import { TauriUpdaterService } from '../tauri'

vi.mock('@tauri-apps/plugin-updater', () => ({ check: vi.fn() }))
vi.mock('@tauri-apps/api/core', () => ({ invoke: vi.fn() }))

describe('Novera updater', () => {
  let svc: TauriUpdaterService
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.mocked(check).mockReset()
    vi.mocked(invoke).mockReset().mockResolvedValue(undefined)
    svc = new TauriUpdaterService()
  })
  it('checks the signed feed without an analytics proxy or nonce', async () => {
    vi.mocked(check).mockResolvedValueOnce({ version: '1.0.1', body: 'Notes' } as Update)
    expect(await svc.check()).toEqual({ version: '1.0.1', body: 'Notes', date: undefined })
    expect(check).toHaveBeenCalledWith()
    expect(invoke).not.toHaveBeenCalled()
  })
  it('returns null when no newer release exists', async () => {
    vi.mocked(check).mockResolvedValueOnce(null)
    expect(await svc.check()).toBeNull()
    expect(invoke).not.toHaveBeenCalled()
  })
  it('handles an unavailable feed without falling back to another vendor', async () => {
    vi.mocked(check).mockRejectedValueOnce(new Error('Feed unavailable'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(await svc.check()).toBeNull()
    expect(check).toHaveBeenCalledOnce()
    expect(invoke).not.toHaveBeenCalled()
  })
  it('uses the verified-download and shutdown path for every install entry point', async () => {
    const safe = vi.spyOn(svc, 'downloadAndInstallWithProgress').mockResolvedValueOnce(undefined)
    await svc.installAndRestart()
    expect(safe).toHaveBeenCalledOnce()
  })
  describe('downloadAndInstallWithProgress()', () => {
    it('downloads, stops the app, then installs, in that order', async () => {
      const calls: string[] = []
      const download = vi.fn().mockImplementation(async (cb) => {
        calls.push('download')
        cb({ event: 'Started', data: { contentLength: 1000 } })
        cb({ event: 'Progress', data: { chunkLength: 500 } })
        cb({ event: 'Finished' })
      })
      const install = vi.fn().mockImplementation(async () => {
        calls.push('install')
      })
      vi.mocked(invoke).mockImplementation(async (cmd: string) => {
        calls.push(cmd)
      })
      vi.mocked(check).mockResolvedValueOnce({
        version: '2.0.0',
        download,
        install,
      } as unknown as Update)

      const progressCb = vi.fn()
      await svc.downloadAndInstallWithProgress(progressCb)

      expect(calls).toEqual(['download', 'shutdown_for_update', 'install'])
      expect(progressCb).toHaveBeenCalledTimes(3)
      expect(progressCb).toHaveBeenCalledWith({ event: 'Started', data: { contentLength: 1000 } })
      expect(progressCb).toHaveBeenCalledWith({ event: 'Finished' })
    })

    it('throws when no update is available', async () => {
      vi.mocked(check).mockResolvedValueOnce(null)
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(svc.downloadAndInstallWithProgress(vi.fn())).rejects.toThrow(
        'No update available'
      )
      errorSpy.mockRestore()
    })

    it('leaves the app running when the download or signature check fails', async () => {
      const err = new Error('download error')
      const install = vi.fn()
      vi.mocked(check).mockResolvedValueOnce({
        version: '2.0.0',
        download: vi.fn().mockRejectedValue(err),
        install,
      } as unknown as Update)
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(svc.downloadAndInstallWithProgress(vi.fn())).rejects.toBe(err)
      expect(errorSpy).toHaveBeenCalledWith(
        'Error downloading update with progress in Tauri:',
        err
      )
      expect(invoke).not.toHaveBeenCalledWith('shutdown_for_update')
      expect(install).not.toHaveBeenCalled()
      errorSpy.mockRestore()
    })

    it('does not run the installer when the shutdown fails', async () => {
      const err = new Error('shutdown failed')
      const install = vi.fn()
      vi.mocked(invoke).mockRejectedValueOnce(err)
      vi.mocked(check).mockResolvedValueOnce({
        version: '2.0.0',
        download: vi.fn().mockResolvedValue(undefined),
        install,
      } as unknown as Update)
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(svc.downloadAndInstallWithProgress(vi.fn())).rejects.toBe(err)
      expect(install).not.toHaveBeenCalled()
      errorSpy.mockRestore()
    })

    it('restarts the MCP servers when the installer fails after the shutdown', async () => {
      const err = new Error('install failed')
      vi.mocked(invoke).mockResolvedValue(undefined)
      vi.mocked(check).mockResolvedValueOnce({
        version: '2.0.0',
        download: vi.fn().mockResolvedValue(undefined),
        install: vi.fn().mockRejectedValue(err),
      } as unknown as Update)
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(svc.downloadAndInstallWithProgress(vi.fn())).rejects.toBe(err)
      expect(vi.mocked(invoke).mock.calls.map(([command]) => command)).toEqual([
        'shutdown_for_update',
        'restart_mcp_servers',
      ])
      errorSpy.mockRestore()
    })

    it('reports the install error when restarting the MCP servers fails too', async () => {
      const err = new Error('install failed')
      vi.mocked(invoke).mockImplementation(async (command: string) => {
        if (command === 'restart_mcp_servers') throw new Error('restart failed')
      })
      vi.mocked(check).mockResolvedValueOnce({
        version: '2.0.0',
        download: vi.fn().mockResolvedValue(undefined),
        install: vi.fn().mockRejectedValue(err),
      } as unknown as Update)
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      await expect(svc.downloadAndInstallWithProgress(vi.fn())).rejects.toBe(err)
      errorSpy.mockRestore()
      warnSpy.mockRestore()
    })

    it('handles errors in progress callback gracefully', async () => {
      const download = vi.fn().mockImplementation(async (cb) => {
        cb({ event: 'Started' })
      })
      vi.mocked(check).mockResolvedValueOnce({
        version: '2.0.0',
        download,
        install: vi.fn().mockResolvedValue(undefined),
      } as unknown as Update)

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const badCallback = vi.fn().mockImplementation(() => {
        throw new Error('callback error')
      })

      await svc.downloadAndInstallWithProgress(badCallback)

      expect(warnSpy).toHaveBeenCalledWith(
        'Error in download progress callback:',
        expect.any(Error)
      )
      warnSpy.mockRestore()
    })
  })
})
