import { useEffect, useState } from 'react'
import { intlLocale } from '@/utils/intlLocale'
import {
  parseCreationReference,
  creationTiming,
  formatCreationDuration,
} from '@/modules/engines/creation'
import { useServiceHub } from '@/hooks/useServiceHub'
import { useTranslation } from '@/i18n/react-i18next-compat'
import { useCreation, videoSettingsFor } from '@/hooks/useCreation'
import { usePrompt } from '@/hooks/usePrompt'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { ShareButton } from './ShareButton'
import { MediaPlayer } from '@/components/MediaPlayer'

export function GeneratedCreation({
  url,
  threadId,
  timing,
}: {
  url: string
  threadId?: string
  timing?: unknown
}) {
  const { t, i18n } = useTranslation()
  const duration = creationTiming(timing)
  const locale = intlLocale(i18n?.language ?? 'en')
  const service = useServiceHub()
  const [file, setFile] = useState<{ path: string; src: string }>()
  const [failed, setFailed] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const canAnimate = useCreation((state) => videoSettingsFor(state).videoEngine !== 'sdcpp')
  const busy = useCreation((state) =>
    threadId ? !!state.progress[threadId] : false
  )
  const reference = parseCreationReference(url)
  useEffect(() => {
    let active = true
    setFile(undefined)
    setFailed(false)
    const ref = parseCreationReference(url)
    if (!ref) {
      setFailed(true)
      return
    }
    void service
      .core()
      .invoke<string>('creation_resolve', ref)
      .then((path) => {
        if (active) setFile({ path, src: service.core().convertFileSrc(path) })
      })
      .catch(() => {
        if (active) setFailed(true)
      })
    return () => {
      active = false
    }
  }, [url, service])
  if (!reference) return null
  return (
    <figure className="generated-creation novera-media-card my-3 w-full min-w-0 overflow-hidden rounded-xl border bg-secondary/10">
      {file ? (
        <MediaPlayer src={file.src} kind={reference.task} name={reference.name}
          onExpand={() => setExpanded(true)} />
      ) : (
        <p className="p-3 text-sm">
          {t(failed ? 'chat:creation.missing' : 'chat:creation.loading')}
        </p>
      )}
      <figcaption className="space-y-2 p-3">
        {duration && (
          <div
            className="text-xs text-muted-foreground"
            title={t('chat:creation.totalTimeHint')}
          >
            {duration.generationMs !== undefined && (
              <p>
                {t('chat:creation.generationTime')}:{' '}
                {formatCreationDuration(duration.generationMs, locale)}
              </p>
            )}
            <p>
              {t('chat:creation.totalTime')}:{' '}
              {formatCreationDuration(duration.totalMs, locale)}
            </p>
          </div>
        )}
        <p className="break-all text-xs text-muted-foreground">
          {reference.name}
        </p>
        <div className="flex flex-wrap gap-2">
          {threadId && (
            <ShareButton
              threadId={threadId}
              assetUrl={url}
              disabled={!file || busy}
            />
          )}
          <Button
            size="sm"
            variant="outline"
            disabled={!file}
            onClick={() => {
              if (file) void service.opener().revealItemInDir(file.path)
            }}
          >
            {t('chat:creation.openFolder')}
          </Button>
          {reference.task === 'image' && threadId && (
            <Button
              size="sm"
              variant="outline"
              disabled={!file || busy}
              onClick={() => {
                useCreation.getState().setMode(threadId, 'image')
                useCreation.getState().setSource(threadId, url)
                usePrompt.getState().setPrompt(t('chat:creation.variantPrompt'))
              }}
            >
              {t('chat:creation.variant')}
            </Button>
          )}
          {reference.task === 'image' && threadId && canAnimate && (
            <Button
              size="sm"
              variant="outline"
              disabled={!file || busy}
              onClick={() => {
                useCreation.getState().setMode(threadId, 'video')
                useCreation.getState().setSource(threadId, url)
                usePrompt.getState().setPrompt(t('chat:creation.animatePrompt'))
              }}
            >
              {t('chat:creation.video')}
            </Button>
          )}
        </div>
      </figcaption>
      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogContent className="w-[95vw] max-w-none sm:max-w-none">
          <DialogTitle>{t(`chat:creation.${reference.task}`)}</DialogTitle>
          {file && <MediaPlayer src={file.src} kind={reference.task} name={reference.name} expanded />}
        </DialogContent>
      </Dialog>
    </figure>
  )
}
