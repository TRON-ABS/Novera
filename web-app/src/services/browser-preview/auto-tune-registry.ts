import { restoreBrowserModelImports } from './model-imports'
import type { BrowserMediaProbe } from './auto-tune'

type Source = () => BrowserMediaProbe | undefined | Promise<BrowserMediaProbe | undefined>
const sources = new Map<string, Source>()
const listeners = new Set<() => void>()
let revision = 0

export function subscribeBrowserAutoTuneSources(listener: () => void) {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

function changed() {
  revision++
  listeners.forEach(listener => listener())
}

export function browserAutoTuneWait() {
  let observed = revision
  return (ms: number) => new Promise<void>(resolve => {
    if (observed !== revision) { observed = revision; resolve(); return }
    const finish = () => { observed = revision; unsubscribe(); clearTimeout(timer); resolve() }
    const unsubscribe = subscribeBrowserAutoTuneSources(finish)
    const timer = setTimeout(finish, ms)
  })
}

/** Register only after Novera accepts an import. This never enables Auto Tune. */
export function registerBrowserAutoTuneSource(id: string, source: Source) {
  sources.set(id, source)
  changed()
}

export function removeBrowserAutoTuneSource(id: string) {
  if (sources.delete(id)) changed()
}

/** A failing adapter must not hide other compatible imports. */
export async function discoverBrowserAutoTuneProbes() {
  await restoreBrowserModelImports()
  const results = await Promise.allSettled([...sources.values()].map(source => Promise.resolve().then(source)))
  const probes = new Map<string, BrowserMediaProbe>()
  for (const result of results) {
    if (result.status === 'rejected') console.warn('Auto Tune model discovery:', result.reason)
    else if (result.value) probes.set(result.value.key, result.value)
  }
  return [...probes.values()]
}
