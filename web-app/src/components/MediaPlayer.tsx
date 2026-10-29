import { useEffect, useRef, useState, type SyntheticEvent, type CSSProperties } from 'react'
import { Disc3, Film, ImageIcon, Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, LoaderCircle, ZoomIn, ZoomOut } from 'lucide-react'
import { useTranslation } from '@/i18n/react-i18next-compat'

type Props = {
  src: string
  kind: 'image' | 'music' | 'video'
  name?: string
  expanded?: boolean
  onExpand?: () => void
}
type SafariVideo = HTMLVideoElement & {
  webkitEnterFullscreen?: () => void
  webkitExitFullscreen?: () => void
  webkitDisplayingFullscreen?: boolean
}
const clock = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '--:--'
  const value = Math.floor(seconds)
  const hours = Math.floor(value / 3600)
  return `${hours ? `${hours}:` : ''}${hours ? String(Math.floor(value / 60) % 60).padStart(2, '0') : Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`
}

/** Changing sources remounts playback state and prevents stale controls. */
export function MediaPlayer(props: Props) {
  return <NoveraPlayer key={`${props.kind}:${props.src}`} {...props} />
}

function NoveraPlayer({ src, kind, name, expanded = false, onExpand }: Props) {
  const { t } = useTranslation()
  const root = useRef<HTMLDivElement>(null)
  const media = useRef<HTMLMediaElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [waiting, setWaiting] = useState(false)
  const [failed, setFailed] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [localExpanded, setLocalExpanded] = useState(false)
  const [zoom, setZoom] = useState(1)
  const label = t(`chat:creation.${kind}`)
  const hasDuration = Number.isFinite(duration) && duration > 0

  useEffect(() => {
    const element = media.current
    const syncFullscreen = () => setFullscreen(document.fullscreenElement === root.current)
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLocalExpanded(false)
    }
    document.addEventListener('fullscreenchange', syncFullscreen)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('fullscreenchange', syncFullscreen)
      document.removeEventListener('keydown', close)
      if (element && !element.paused) element.pause()
    }
  }, [])

  useEffect(() => {
    if (!localExpanded || !root.current) return
    const previousFocus = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    const element = root.current
    document.body.style.overflow = 'hidden'
    element.focus()
    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return
      const controls = element.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled)')
      const first = controls[0]
      const last = controls[controls.length - 1]
      if (event.shiftKey && (document.activeElement === first || document.activeElement === element)) {
        event.preventDefault(); last?.focus()
      } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === element)) {
        event.preventDefault(); first?.focus()
      }
    }
    element.addEventListener('keydown', trapFocus)
    return () => {
      document.body.style.overflow = previousOverflow
      element.removeEventListener('keydown', trapFocus)
      if (previousFocus?.isConnected) previousFocus.focus()
    }
  }, [localExpanded])

  const togglePlayback = async () => {
    const element = media.current
    if (!element) return
    if (!element.paused) { element.pause(); return }
    try {
      if (failed) element.load()
      setFailed(false)
      // Keep play inside the user gesture for Safari/iOS; never autoplay.
      await element.play()
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        setFailed(true)
        setWaiting(false)
      }
    }
  }
  const toggleFullscreen = async () => {
    const video = media.current as SafariVideo | null
    if (localExpanded) { setLocalExpanded(false); return }
    try {
      if (video?.webkitDisplayingFullscreen && video.webkitExitFullscreen) {
        video.webkitExitFullscreen(); return
      }
      if (document.fullscreenElement === root.current && document.exitFullscreen) {
        await document.exitFullscreen(); return
      }
      if (onExpand) { onExpand(); return }
      if (root.current?.requestFullscreen) {
        await root.current.requestFullscreen(); return
      }
      if (kind === 'video' && video?.webkitEnterFullscreen) {
        video.webkitEnterFullscreen(); return
      }
    } catch { /* Some webviews expose fullscreen but deny it. Expand in-app. */ }
    setLocalExpanded(true)
  }
  const sync = (event: SyntheticEvent<HTMLMediaElement>) => {
    const element = event.currentTarget
    setTime(Number.isFinite(element.currentTime) ? element.currentTime : 0)
    setDuration(element.duration)
  }
  const events = {
    onPlay: () => setPlaying(true),
    onPlaying: () => { setPlaying(true); setWaiting(false) },
    onPause: () => { setPlaying(false); setWaiting(false) },
    onEnded: () => { setPlaying(false); setWaiting(false) },
    onWaiting: () => setWaiting(true),
    onCanPlay: () => setWaiting(false),
    onError: () => { setFailed(true); setPlaying(false); setWaiting(false) },
    onTimeUpdate: sync,
    onLoadedMetadata: sync,
    onDurationChange: sync,
    onSeeked: (event: SyntheticEvent<HTMLMediaElement>) => { sync(event); setWaiting(false) },
    onVolumeChange: (event: SyntheticEvent<HTMLMediaElement>) => {
      setVolume(event.currentTarget.volume); setMuted(event.currentTarget.muted)
    },
  }
  return <div ref={root} className={`novera-media-player ${localExpanded ? 'novera-media-expanded' : ''}`}
    data-playing={playing} role={localExpanded ? 'dialog' : 'group'} aria-modal={localExpanded || undefined}
    tabIndex={-1} aria-label={label}>
    <div className="novera-media-heading">
      <span className="novera-media-emblem" aria-hidden="true">
        {kind === 'music' ? <Disc3 size={26} /> : kind === 'video' ? <Film size={24} /> : <ImageIcon size={24} />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{label} <span className="novera-media-brand">NOVERA</span></p>
        {name && <p dir="auto" className="truncate text-xs text-muted-foreground" title={name}>{name}</p>}
      </div>
      {kind === 'music' && <div className="novera-media-wave" aria-hidden="true">
        {[10, 20, 14, 28, 18, 32, 24, 14, 26, 18, 30, 12].map((height, index) =>
          <span key={index} style={{ height, animationDelay: `${index * -0.11}s` }} />)}
      </div>}
    </div>
    {kind === 'image' ? <div className="novera-image-viewport">
      <img src={src} alt={name || label} onError={() => setFailed(true)}
        style={{ width: `${zoom * 100}%`, maxWidth: 'none' }} />
    </div> : kind === 'music' ? <audio ref={(node) => { media.current = node }} preload="metadata" src={src}
      className="sr-only w-full" aria-label={label} {...events} /> :
      <video ref={(node) => { media.current = node }} playsInline preload="metadata" src={src} aria-label={label}
        className={`block h-auto w-full object-contain ${expanded ? 'max-h-[80dvh]' : 'max-h-[75dvh]'}`}
        {...events} />}
    {kind !== 'image' && <div className="novera-media-timeline" dir="ltr">
      <input type="range" min={0} max={hasDuration ? duration : 0} step={0.1}
        value={hasDuration ? Math.min(time, duration) : 0} disabled={!hasDuration}
        aria-label={t('chat:player.seek')} aria-valuetext={`${clock(time)} / ${clock(hasDuration ? duration : NaN)}`}
        style={{ '--media-progress': `${hasDuration ? Math.min(100, time / duration * 100) : 0}%` } as CSSProperties}
        onChange={(event) => {
          if (media.current && hasDuration) {
            try { media.current.currentTime = Number(event.target.value); setTime(media.current.currentTime) } catch { /* Not seekable yet. */ }
          }
        }} />
      <span className="novera-media-time">{clock(time)} <span>/ {clock(hasDuration ? duration : NaN)}</span></span>
    </div>}
    <div className="novera-media-controls">
      {kind !== 'image' ? <>
        <button type="button" className="novera-media-play" onClick={() => void togglePlayback()}
          aria-label={t(playing ? 'chat:player.pause' : 'chat:player.play')}>
          {waiting && playing ? <LoaderCircle className="animate-spin" size={20} /> : playing ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <button type="button" aria-label={t('chat:player.mute')} aria-pressed={muted || volume === 0}
          onClick={() => { if (media.current) media.current.muted = !media.current.muted }}>
          {muted || volume === 0 ? <VolumeX size={19} /> : <Volume2 size={19} />}
        </button>
        <input type="range" className="novera-media-volume" dir="ltr" min={0} max={1} step={0.05}
          value={muted ? 0 : volume} aria-label={t('chat:player.volume')}
          onChange={(event) => {
            if (media.current) {
              try {
                media.current.volume = Number(event.target.value)
                media.current.muted = false
                setVolume(media.current.volume); setMuted(media.current.muted)
              } catch { /* Device volume remains controlled by the OS. */ }
            }
          }} />
      </> : <>
        <button type="button" aria-label={t('settings:shortcuts.zoomOut')} disabled={zoom <= 1}
          onClick={() => setZoom((value) => Math.max(1, value - 0.25))}><ZoomOut size={19} /></button>
        <button type="button" aria-label={t('common:reset')} onClick={() => setZoom(1)}>{Math.round(zoom * 100)}%</button>
        <button type="button" aria-label={t('settings:shortcuts.zoomIn')} disabled={zoom >= 3}
          onClick={() => setZoom((value) => Math.min(3, value + 0.25))}><ZoomIn size={19} /></button>
      </>}
      {kind !== 'music' && <button type="button" className="novera-media-fullscreen"
        aria-label={t(fullscreen || localExpanded ? 'common:close' : 'chat:creation.expand')}
        onClick={() => void toggleFullscreen()}>
        {fullscreen || localExpanded ? <Minimize2 size={19} /> : <Maximize2 size={19} />}
      </button>}
    </div>
    {failed && <p role="alert" className="mt-2 text-sm text-muted-foreground">{t('common:preview.unsupported')}</p>}
  </div>
}
