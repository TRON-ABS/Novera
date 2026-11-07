import { useState } from 'react'
import { useCreation } from '@/hooks/useCreation'
import { useMusicCreation, musicSettingsFor } from '@/hooks/useMusicCreation'
import { BROWSER_MUSIC_MODEL, BROWSER_MUSIC_PROVIDER, browserLocalMusicEnabled, musicComponentNames, setBrowserMusicFiles } from '@/services/browser-preview/local-music'

export function BrowserLocalMusicSetup({ scope, disabled }: { scope: string; disabled: boolean }) {
  const [files, setFiles] = useState<Array<File | undefined>>([undefined, undefined, undefined, undefined])
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  useMusicCreation()
  const settings = musicSettingsFor(scope)
  const setSettings = (value: Parameters<ReturnType<typeof useMusicCreation.getState>['setSettings']>[0]) => useMusicCreation.getState().setSettings(value, scope)
  if (!browserLocalMusicEnabled()) return null
  return <fieldset className="rounded-md border border-border p-3 space-y-3" disabled={disabled}>
    <legend className="px-1 font-medium">Musique sur cet appareil · essai ACE-Step</legend>
    <p className="text-sm text-muted-foreground">Choisissez les quatre fichiers Desktop. Ils restent sur cet appareil pour cette session. Essai : 10–30 secondes, 8 étapes, WebGPU, WAV 32 bits stéréo 48 kHz. La fin peut être plus courte ; la qualité du chant reste à vérifier. Décrivez les instruments ou « a cappella, sans instruments » dans votre demande.</p>
    {musicComponentNames.map((name, index) => <label key={name} className="block text-xs break-all">{name}
      <input className="block w-full mt-1" type="file" accept=".gguf" onChange={event => {
        setReady(false); setError('')
        const next = files.slice(); next[index] = event.target.files?.[0]; setFiles(next)
        if (!next.every(Boolean)) return
        try {
          setBrowserMusicFiles(next as File[])
          setSettings({ durationSeconds: 10, durationAuto: false, steps: 8, quality: 'wav32', bpm: 0, device: 'auto', generationCount: 1 })
          useCreation.getState().setSelection(scope, 'music', { provider: BROWSER_MUSIC_PROVIDER, id: BROWSER_MUSIC_MODEL })
          setReady(true)
        } catch (reason) { setError(reason instanceof Error ? reason.message : String(reason)) }
      }} />
    </label>)}
    <label className="flex gap-2 text-sm"><input type="checkbox" checked={settings.instrumental} onChange={event => setSettings({ instrumental: event.target.checked })} />Instrumental · sans paroles</label>
    {!settings.instrumental && <>
      <label className="block text-sm">Paroles · [Verse] / [Chorus]<textarea aria-label="Paroles ACE-Step Web" className="block w-full rounded border bg-background p-2" value={settings.lyrics} onChange={event => setSettings({ lyrics: event.target.value })} /></label>
      <label className="block text-sm">Langue du chant · code (fr, en…)<input aria-label="Langue ACE-Step Web" className="block rounded border bg-background p-2" placeholder="Langue du navigateur" value={settings.language} onChange={event => setSettings({ language: event.target.value })} /></label>
    </>}
    {ready && <p role="status" className="text-sm">Modèle musical sélectionné. Fermez les réglages et envoyez votre demande en mode Musique.</p>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  </fieldset>
}
