import { useState } from 'react'
import { useMusicCreation } from '@/hooks/useMusicCreation'
import { useCreation } from '@/hooks/useCreation'
import { MusicSetupPanel } from '@/containers/MusicControls'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useTranslation } from '@/i18n/react-i18next-compat'
import { joinLocalPath } from '@/modules/platform/local-path'

/** Registered local music bundles, shown alongside image and text models. */
export function MusicModelLibrary() {
  const { t } = useTranslation()
  const { profiles, select } = useMusicCreation()
  const [open, setOpen] = useState(false)
  const scope = 'settings-music-library'
  const modelPath = (directory: string, name: string) => /^(?:[A-Za-z]:|[/\\])/.test(name) ? name : joinLocalPath(directory, name)
  const configure = (id?: string) => {
    if (id) select(id, scope)
    useCreation.getState().setSelection(scope, 'music')
    setOpen(true)
  }
  return <section aria-label={t('chat:creation.music')} className="rounded-lg border p-3 space-y-3">
    <div className="flex items-center justify-between gap-2">
      <h3 className="text-sm font-medium">{t('chat:creation.music')} · {t('chat:creation.local')}
        <span className="ml-2 rounded-full border px-2 py-0.5 text-xs">{profiles.length}</span>
      </h3>
      <Button size="sm" variant="secondary" onClick={() => configure()}>{t('chat:creation.configure')}</Button>
    </div>
    {!profiles.length && <p className="text-sm text-muted-foreground">{t('providers:noInstalledModels')}</p>}
    {profiles.map((profile) => <article key={profile.id} className="rounded-xl border border-violet-400/25 p-3 space-y-2">
      <h4 className="font-medium break-words">{profile.name}</h4>
      <p className="break-all text-xs text-muted-foreground">{profile.settings.directory}</p>
      <dl className="grid gap-2 text-xs sm:grid-cols-2">
        {(['generator', 'planner', 'encoder', 'vae'] as const).map((role) => <div key={role}>
          <dt className="font-medium">{t(`chat:creation.${{generator: 'musicGenerator', planner: 'musicPlanner', encoder: 'musicEncoder', vae: 'musicVae'}[role]}`)}</dt>
          <dd className="break-all text-muted-foreground">{profile.settings[role] ? modelPath(profile.settings.directory, profile.settings[role]) : '—'}</dd>
        </div>)}
      </dl>
      <Button size="sm" variant="outline" onClick={() => configure(profile.id)}>{t('common:edit')}</Button>
    </article>)}
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{t('chat:creation.music')} · {t('chat:creation.configure')}</DialogTitle>
          <DialogDescription>{t('chat:creation.autosave')}</DialogDescription>
        </DialogHeader>
        {open && <MusicSetupPanel scope={scope} disabled={false} />}
      </DialogContent>
    </Dialog>
  </section>
}
