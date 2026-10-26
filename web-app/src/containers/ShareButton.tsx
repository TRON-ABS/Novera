import { useEffect, useMemo, useRef, useState } from 'react'
import type { UIMessage } from 'ai'
import type { ThreadMessage } from '@janhq/core'
import { IconShare } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { ActionTooltip } from '@/components/ActionTooltip'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useTranslation } from '@/i18n/react-i18next-compat'
import { useServiceHub } from '@/hooks/useServiceHub'
import { useThreads } from '@/hooks/useThreads'
import { useMessages, waitForThreadMessageWrites } from '@/hooks/useMessages'
import { TEMPORARY_CHAT_ID } from '@/constants/chat'
import { parseCitationsFromToolOutput } from '@/lib/citation-parser'
import { useWebCitationStore } from '@/stores/web-citation-store'
import { convertUIMessageToThreadMessage } from '@/modules/conversations/messages'
import {
  shareEntries,
  selectShareEntries,
  formatsForShare,
  type ShareOptions,
  type ShareFormat,
  type ShareEntry,
} from '@/modules/conversations/share'
import {
  prepareShare,
  savePrepared,
  canSystemShare,
  systemShare,
  copyPrepared,
  copyShareFile,
  type PreparedShare,
} from '@/services/sharing'
import { printConversation } from '@/adapters/platform/conversation-files'
import { parseCreationReference } from '@/modules/engines/creation'
import { isPlatformTauri } from '@/lib/platform/utils'
import printStyles from '@/styles/conversation-print.css?url'

/** One explicit preview/selection step for every local export and OS handoff. */
export function ShareButton({
  threadId,
  message,
  assetUrl,
  disabled = false,
  conversation = false,
}: {
  threadId?: string
  message?: UIMessage
  assetUrl?: string
  disabled?: boolean
  conversation?: boolean
}) {
  const { t } = useTranslation(),
    hub = useServiceHub()
  const [open, setOpen] = useState(false),
    [entries, setEntries] = useState<ShareEntry[]>([])
  const [title, setTitle] = useState('Novera'),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [notice, setNotice] = useState('')
  const [options, setOptions] = useState<ShareOptions>({
    scope: conversation ? 'conversation' : 'render',
    selected: [],
    questions: true,
    sources: true,
    parameters: false,
    messageId: message?.id,
    assetUrl,
  })
  const [format, setFormat] = useState<ShareFormat>('html'),
    [prepared, setPrepared] = useState<PreparedShare>()
  const [full, setFull] = useState(false)
  const [storedSources, setStoredSources] = useState<
    Record<string, { url: string; title: string }[]>
  >({})
  const job = useRef<AbortController | undefined>(undefined),
    version = useRef(0)
  const selected = useMemo(
      () => selectShareEntries(entries, options),
      [entries, options]
    ),
    formats = useMemo(
      () => formatsForShare(selected, isPlatformTauri()),
      [selected]
    )
  const change = (patch: Partial<ShareOptions>) => {
    setOptions((s) => ({ ...s, ...patch }))
    invalidate()
  }
  function invalidate() {
    version.current++
    job.current?.abort()
    setPrepared(undefined)
    setNotice('')
    setError('')
  }
  useEffect(() => {
    if (!open) return
    let live = true
    setBusy(true)
    setFull(false)
    setEntries([])
    setError('')
    setPrepared(undefined)
    setNotice('')
    const thread = threadId
      ? useThreads.getState().getThreadById(threadId)
      : undefined
    setTitle(thread?.title || 'Novera')
    void (async () => {
      let complete = !!threadId
      let messages: ThreadMessage[]
      try {
        messages =
          threadId === TEMPORARY_CHAT_ID
            ? [...(useMessages.getState().messages[threadId] ?? [])]
            : threadId
              ? (await waitForThreadMessageWrites(threadId),
                await hub.messages().fetchMessages(threadId))
              : []
      } catch (error) {
        if (conversation || (!message && !assetUrl)) throw error
        messages = []
        complete = false
      }
      if (
        assetUrl &&
        !messages.some((m) =>
          m.content.some(
            (p) =>
              p.image_url?.url === assetUrl || p.input_video?.data === assetUrl
          )
        )
      ) {
        const ref = parseCreationReference(assetUrl)
        if (ref) {
          messages.push(
            convertUIMessageToThreadMessage(
              {
                id: 'share-media',
                role: 'assistant',
                parts: [
                  {
                    type: 'file',
                    url: assetUrl,
                    mediaType: ref.task === 'video' ? 'video/mp4' : 'image/png',
                  },
                ],
              },
              threadId || 'share'
            )
          )
          complete = false
        }
      }
      if (message) {
        const current = convertUIMessageToThreadMessage(
          message,
          threadId || 'share'
        )
        const previous = messages.find((m) => m.id === current.id)
        current.metadata = { ...previous?.metadata, ...current.metadata }
        messages = messages.filter((m) => m.id !== current.id).concat(current)
      }
      const persistedSources: Record<string, { url: string; title: string }[]> =
        {}
      for (const m of messages) {
        const calls = m.metadata?.tool_calls
        if (!Array.isArray(calls)) continue
        for (const call of calls) {
          const citation = parseCitationsFromToolOutput(
            (call as { response?: unknown }).response
          )
          if (citation?.kind === 'web')
            persistedSources[m.id] = [
              ...(persistedSources[m.id] ?? []),
              ...citation.citations.map((c) => ({
                url: c.url,
                title: c.title || c.url,
              })),
            ]
        }
      }
      const list = shareEntries(
        messages,
        typeof thread?.metadata?.activeRootId === 'string'
          ? thread.metadata.activeRootId
          : undefined
      )
      if (!live) return
      const id =
        message?.id ||
        (assetUrl
          ? list.find((e) => e.assets.some((a) => a.url === assetUrl))?.id
          : undefined) ||
        [...list].reverse().find((e) => e.role === 'assistant')?.id
      setEntries(list)
      setStoredSources(persistedSources)
      setFull(complete)
      const opts = {
        scope: conversation ? ('conversation' as const) : ('render' as const),
        messageId: id,
        assetUrl,
        selected: id ? [id] : [],
        questions: true,
        sources: true,
        parameters: false,
      }
      setOptions(opts)
      const only = selectShareEntries(list, opts)
      setFormat(
        only.length === 1 && !only[0].text.trim() && only[0].assets.length === 1
          ? 'original'
          : 'html'
      )
    })()
      .catch(() => {
        if (live) setError(t('chat:sharing.failed'))
      })
      .finally(() => {
        if (live) setBusy(false)
      })
    return () => {
      live = false
      job.current?.abort()
      // This is a job sequence counter, not a DOM ref: invalidate pending work.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      version.current++
    }
    // Freeze the clicked render while this dialog is open; background store
    // updates must not replace a selection the user is reviewing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, threadId, hub])
  useEffect(() => {
    if (!formats.includes(format)) {
      setFormat(formats[0] ?? 'html')
      setPrepared(undefined)
    }
  }, [formats, format])

  async function prepare() {
    const controller = new AbortController(),
      token = ++version.current
    job.current?.abort()
    job.current = controller
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const sourceMap = useWebCitationStore.getState().byMessageId
      const sources = options.sources
        ? [
            ...new Map(
              selected
                .flatMap((e) => [
                  ...Object.values(sourceMap[e.id] ?? {}),
                  ...(storedSources[e.id] ?? []),
                ])
                .map((s) => [s.url, { url: s.url, title: s.title || s.url }])
            ).values(),
          ]
        : []
      const parameters: unknown[] = []
      if (options.parameters)
        for (const asset of selected.flatMap((e) => e.assets)) {
          const ref = parseCreationReference(asset.url)
          if (ref)
            parameters.push({
              name: asset.name,
              ...(await hub
                .core()
                .invoke<Record<string, unknown>>('sharing_metadata', ref)),
            })
        }
      const result = await prepareShare({
        title,
        entries: selected,
        format,
        core: hub.core(),
        signal: controller.signal,
        sources,
        parameters,
        labels: {
          user: t('chat:sharing.user'),
          assistant: t('chat:sharing.assistant'),
          sources: t('chat:sharing.sources'),
          parameters: t('chat:sharing.parameters'),
        },
      })
      if (token === version.current) {
        setPrepared(result)
        setNotice(t('chat:sharing.ready'))
      }
    } catch (e) {
      if (!controller.signal.aborted && token === version.current)
        setError(
          t(
            String(e).includes('SHARE_TOO_LARGE')
              ? 'chat:sharing.tooLarge'
              : 'chat:sharing.failed'
          )
        )
    } finally {
      if (token === version.current) setBusy(false)
    }
  }
  async function act(
    action: 'save' | 'system' | 'copy' | 'copyFile' | 'print'
  ) {
    if (!prepared || busy) return
    setBusy(true)
    setError('')
    setNotice('')
    try {
      if (action === 'print' || (action === 'save' && format === 'pdf'))
        await printConversation(prepared.html)
      else if (action === 'save') {
        if (!(await savePrepared(prepared, hub.dialog(), hub.core()))) return
      } else if (action === 'copy') await copyPrepared(prepared, hub.core())
      else if (action === 'copyFile') await copyShareFile(prepared, hub.core())
      else await systemShare(prepared, hub.core())
      setNotice(
        t(
          action === 'system' ||
            action === 'print' ||
            (action === 'save' && format === 'pdf')
            ? 'chat:sharing.opened'
            : action === 'copy' || action === 'copyFile'
              ? 'common:copied'
              : 'common:done'
        )
      )
    } catch (e) {
      if (
        (e as { name?: string })?.name !== 'AbortError' &&
        !String(e).includes('SHARE_CANCELLED')
      )
        setError(t('chat:sharing.failed'))
    } finally {
      setBusy(false)
    }
  }
  return (
    <>
      <ActionTooltip label={t('chat:sharing.share')}>
        <Button
          size={conversation ? 'icon-sm' : 'icon-xs'}
          variant="ghost"
          disabled={disabled}
          aria-label={t('chat:sharing.share')}
          className={
            open
              ? 'border border-primary/25 bg-primary/10 text-primary'
              : undefined
          }
          onClick={() => setOpen(true)}
        >
          <IconShare size={16} />
        </Button>
      </ActionTooltip>
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!value) {
            job.current?.abort()
            version.current++
            setBusy(false)
          }
          setOpen(value)
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t('chat:sharing.share')}</DialogTitle>
            <DialogDescription>{t('chat:sharing.localHint')}</DialogDescription>
          </DialogHeader>
          <label className="space-y-1 text-sm">
            {t('chat:sharing.scope')}
            <select
              className="block w-full rounded border bg-background p-2"
              value={options.scope}
              disabled={busy}
              onChange={(e) =>
                change({ scope: e.target.value as ShareOptions['scope'] })
              }
            >
              <option value="render">{t('chat:sharing.render')}</option>
              <option value="conversation" disabled={!full}>
                {t('chat:sharing.conversation')}
              </option>
              <option value="selection" disabled={!full}>
                {t('chat:sharing.selection')}
              </option>
            </select>
          </label>
          {options.scope === 'selection' && (
            <div
              className="max-h-44 space-y-2 overflow-auto rounded border p-2"
              role="group"
              aria-label={t('chat:sharing.selection')}
            >
              {entries.map((e) => (
                <label key={e.id} className="flex gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={options.selected.includes(e.id)}
                    disabled={busy}
                    onChange={(event) =>
                      change({
                        selected: event.target.checked
                          ? [...options.selected, e.id]
                          : options.selected.filter((id) => id !== e.id),
                      })
                    }
                  />
                  <span>
                    {e.role === 'user'
                      ? t('chat:sharing.user')
                      : t('chat:sharing.assistant')}{' '}
                    ·{' '}
                    {e.text.slice(0, 140) ||
                      e.assets.map((a) => a.name).join(', ')}
                  </span>
                </label>
              ))}
            </div>
          )}
          {![
            'original',
            'png',
            'jpeg',
            'webp',
            'gif',
            'bmp',
            'tiff',
            'ico',
            'tga',
            'ppm',
            'qoi',
            'avif',
            'svg',
          ].includes(format) && (
            <div className="flex flex-wrap gap-3 text-xs">
              {(['questions', 'sources', 'parameters'] as const).map((key) => (
                <label key={key} className="flex gap-1.5">
                  <input
                    type="checkbox"
                    disabled={busy}
                    checked={options[key]}
                    onChange={(e) => change({ [key]: e.target.checked })}
                  />
                  {t(`chat:sharing.${key}`)}
                </label>
              ))}
            </div>
          )}
          <label className="text-sm">
            {t('chat:sharing.format')}
            <select
              className="mt-1 block w-full rounded border bg-background p-2"
              value={format}
              disabled={busy}
              onChange={(e) => {
                invalidate()
                setFormat(e.target.value as ShareFormat)
              }}
            >
              {formats.map((value) => (
                <option value={value} key={value}>
                  {value === 'original'
                    ? t('chat:sharing.original')
                    : value === 'pdf'
                      ? 'PDF'
                      : value === 'svg'
                        ? `SVG · ${t('chat:sharing.embedded')}`
                        : value.toUpperCase()}
                </option>
              ))}
            </select>
          </label>
          {selected.some((e) =>
            e.assets.some((a) => a.mime.startsWith('image/'))
          ) && (
            <p className="text-xs text-muted-foreground">
              {t('chat:sharing.imageHint')}
            </p>
          )}
          {selected.some((e) =>
            e.assets.some((a) => a.mime.startsWith('video/'))
          ) &&
            !['html', 'zip', 'original', 'epub'].includes(format) && (
              <p className="text-xs text-muted-foreground">
                {t('chat:sharing.videoHint')}
              </p>
            )}
          <Button
            disabled={busy || !selected.length}
            onClick={() => void prepare()}
          >
            {t('chat:sharing.prepare')}
          </Button>
          {prepared && (
            <section className="space-y-2">
              <h3 className="text-sm font-medium">
                {t('chat:sharing.preview')}
              </h3>
              {prepared.previewUrl ? (
                prepared.mime.startsWith('video/') ? (
                  <video
                    controls
                    src={prepared.previewUrl}
                    className="max-h-80 w-full rounded border"
                  />
                ) : (
                  <img
                    src={prepared.previewUrl}
                    alt={prepared.filename}
                    className="max-h-80 w-full object-contain"
                  />
                )
              ) : (
                <iframe
                  title={t('chat:sharing.preview')}
                  sandbox="allow-same-origin"
                  srcDoc={prepared.html.replace(
                    '</head>',
                    `<link rel="stylesheet" href="${new URL(printStyles, window.location.href).href.replace(/"/g, '&quot;')}"></head>`
                  )}
                  className="h-80 w-full rounded border bg-white"
                />
              )}
              <p className="break-all text-xs text-muted-foreground">
                {prepared.filename}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={busy || !canSystemShare(prepared)}
                  onClick={() => void act('system')}
                >
                  {t('chat:sharing.system')}
                </Button>
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() => void act('save')}
                >
                  {t('common:save')}
                </Button>
                {isPlatformTauri() && (
                  <Button
                    variant="outline"
                    disabled={busy || format === 'pdf'}
                    onClick={() => void act('copyFile')}
                  >
                    {t('chat:sharing.copyFile')}
                  </Button>
                )}
                <Button
                  variant="outline"
                  disabled={
                    busy ||
                    prepared.mime.startsWith('video/') ||
                    prepared.mime === 'image/svg+xml' ||
                    (prepared.mime.startsWith('image/') &&
                      (!navigator.clipboard?.write ||
                        typeof ClipboardItem === 'undefined'))
                  }
                  onClick={() => void act('copy')}
                >
                  {t('common:copy')}
                </Button>
                <Button
                  variant="outline"
                  disabled={busy || !prepared.html}
                  onClick={() => void act('print')}
                >
                  {t('common:composer.printPdf')}
                </Button>
              </div>
              {!canSystemShare(prepared) && (
                <p className="text-xs text-muted-foreground">
                  {t('chat:sharing.fallback')}
                </p>
              )}
              {IS_LINUX && (
                <p className="text-xs text-muted-foreground">
                  {t('chat:sharing.linuxHint')}
                </p>
              )}
            </section>
          )}
          {busy && (
            <p role="status" className="text-sm">
              {t('chat:creation.loading')}
            </p>
          )}
          {notice && (
            <p role="status" className="text-sm">
              {notice}
            </p>
          )}
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <Button
            variant="ghost"
            onClick={() => {
              job.current?.abort()
              setOpen(false)
            }}
          >
            {t('common:close')}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
