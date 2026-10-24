/**
 * Tauri Updater Service - Desktop implementation
 *
 * Uses Tauri signature verification and the Novera-only release feed.
 * Update requests are independent from optional product statistics.
 */

import { check } from '@tauri-apps/plugin-updater'
import { invoke } from '@tauri-apps/api/core'
import type { UpdateInfo, UpdateProgressEvent } from './types'
import { DefaultUpdaterService } from './default'

export class TauriUpdaterService extends DefaultUpdaterService {
  /**
   * Check the configured Novera signed release feed without analytics.
   */
  async check(): Promise<UpdateInfo | null> {
    if (AUTO_UPDATER_DISABLED) return null
    try {
      // Tauri reads the dedicated Novera feed and verifies artifact signatures.
      // No HMAC headers, analytics proxy, store or installation id is involved.
      const update = await check()
      if (!update) return null
      return { version: update.version, date: update.date, body: update.body }
    } catch (error) {
      console.error('Error checking for updates in Tauri:', error)
      return null
    }
  }

  async installAndRestart(): Promise<void> {
    if (AUTO_UPDATER_DISABLED) return
    await this.downloadAndInstallWithProgress(() => {})
  }

  async downloadAndInstallWithProgress(
    progressCallback: (event: UpdateProgressEvent) => void
  ): Promise<void> {
    if (AUTO_UPDATER_DISABLED) return
    try {
      const update = await check()
      if (!update) {
        throw new Error('No update available')
      }

      // Download and verify first, then stop everything the app started, then
      // run the installer. `downloadAndInstall` would exit the process (Windows)
      // or swap the bundle (macOS/Linux) without raising `RunEvent::Exit`, so
      // the engine, MCP servers and agent shells would be left running. The
      // cleanup sits between the two so a failed download or signature check
      // leaves the running app untouched.
      await update.download((event) => {
        try {
          // Forward the event to the callback
          progressCallback(event as UpdateProgressEvent)
        } catch (callbackError) {
          console.warn('Error in download progress callback:', callbackError)
        }
      })
      await invoke('shutdown_for_update')
      try {
        await update.install()
      } catch (installError) {
        // The app is still running, so bring back what `shutdown_for_update`
        // stopped. The engine restarts on the next model load, MCP servers do
        // not, and a failed restart must not hide the install error.
        await invoke('restart_mcp_servers').catch((restartError) => {
          console.warn('Could not restart MCP servers after a failed install:', restartError)
        })
        throw installError
      }
    } catch (error) {
      console.error('Error downloading update with progress in Tauri:', error)
      throw error
    }
  }
}
