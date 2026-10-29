/** Coordinate every player, including attachment previews and dialog portals. */
export function installExclusiveMediaPlayback() {
  const onPlay = (event: Event) => {
    const active = event.target
    if (!(active instanceof HTMLMediaElement) || active.paused) return
    document.querySelectorAll<HTMLMediaElement>('audio, video').forEach((player) => {
      if (player !== active && !player.paused) player.pause()
    })
  }
  // Media play events do not bubble, so listen during the capture phase.
  document.addEventListener('play', onPlay, true)
  return () => document.removeEventListener('play', onPlay, true)
}
