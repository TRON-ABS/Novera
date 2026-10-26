import printStyles from '@/styles/conversation-print.css?url'
import type { ConversationExport } from '@/modules/conversations/export'
import type { CoreService } from '@/services/core/types'
import type { DialogService } from '@/services/dialog/types'
import { isPlatformTauri } from '@/lib/platform/utils'

/** Native writes are allowed only after the user chooses the destination. */
export async function saveConversationFile(
  file: ConversationExport,
  dialog: DialogService,
  core: CoreService
): Promise<boolean> {
  if (isPlatformTauri()) {
    const extension = file.filename.split('.').pop()!
    const path = await dialog.save({
      filters: [{ name: `Novera (${extension})`, extensions: [extension] }],
    })
    if (!path) return false
    const destination =
      path.startsWith('content://') || /\.[^/\\.]+$/.test(path)
        ? path
        : `${path}.${extension}`
    await core.invoke('write_file_sync', { args: [destination, file.content] })
    return true
  }
  const url = URL.createObjectURL(new Blob([file.content], { type: file.mime }))
  const link = document.createElement('a')
  link.href = url
  link.download = file.filename
  document.body.appendChild(link)
  try {
    link.click()
  } finally {
    link.remove()
    // Allow the browser to consume the Blob before revoking its URL.
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  }
  return true
}

/** The system print dialog lets the user choose a printer or Save as PDF. */
export function printConversation(content: string): Promise<void> {
  return new Promise((resolve, reject) => {
    let expired = false
    const frame = document.createElement('iframe')
    frame.title = 'Novera — PDF'
    frame.className = 'conversation-print-frame'
    const timeout = setTimeout(() => {
      expired = true
      frame.remove()
      reject(new Error('Print preview unavailable'))
    }, 15_000)
    frame.onload = async () => {
      frame.onload = null
      try {
        const target = frame.contentWindow
        if (!target) throw new Error('Print preview unavailable')
        await Promise.all(
          Array.from(target.document.images).map((image) =>
            typeof image.decode === 'function'
              ? image.decode()
              : Promise.resolve()
          )
        )
        if (target.document.fonts?.ready) await target.document.fonts.ready
        if (expired) return
        clearTimeout(timeout)
        target.addEventListener('afterprint', () => frame.remove(), {
          once: true,
        })
        target.focus()
        target.print()
        resolve()
      } catch (error) {
        clearTimeout(timeout)
        frame.remove()
        reject(error)
      }
    }
    // WebView2 inherits the app CSP: inline styles may be blocked by hashes.
    // Load a bundled stylesheet from self instead of weakening that policy.
    const stylesheet = new URL(printStyles, window.location.href).href.replace(
      /"/g,
      '&quot;'
    )
    frame.srcdoc = content.replace(
      '</head>',
      `<link rel="stylesheet" href="${stylesheet}"></head>`
    )
    document.body.appendChild(frame)
  })
}
