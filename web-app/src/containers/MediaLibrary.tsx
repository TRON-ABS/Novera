import { useState } from 'react'
import { MusicModelLibrary } from '@/containers/MusicModelLibrary'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useTranslation } from '@/i18n/react-i18next-compat'
import { useServiceHub } from '@/hooks/useServiceHub'
import { creationDefaults } from '@/hooks/useCreation'
import {
  useMediaLibrary,
  selectMediaProfile,
  validateMediaProfile,
  type MediaProfile,
} from '@/hooks/useMediaLibrary'

/** Shares the existing llama import page, while media stays out of the text engine. */
export function MediaLibrary() {
  const { t } = useTranslation()
  const service = useServiceHub()
  const { profiles, put, remove } = useMediaLibrary()
  const [editing, setEditing] = useState<MediaProfile>()
  const [deleting, setDeleting] = useState<MediaProfile>()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  const component =
    editing?.task === 'video' ? editing.settings.videoEngine === 'sdcpp' : editing?.settings.imageEngine !== 'diffusers'
  const fields = component
    ? ([editing?.task === 'video' ? 'videoModel' : 'ggufImageModel', 'ggufTextEncoder', 'ggufVae'] as const)
    : ([editing?.task === 'video' ? 'videoModel' : 'imageModel'] as const)
  return (
    <section className="novera-settings-card space-y-4" aria-label={t('providers:installedMediaModels')}>
      <h2 className="font-studio text-base font-medium">{t('providers:installedMediaModels')}</h2>
      {(['image', 'video'] as const).map((task) => (
        <section
          key={task}
          aria-label={t(`chat:creation.${task}`)}
          className="rounded-lg border p-3 space-y-3"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-medium">
              {t(`chat:creation.${task}`)} · {t('chat:creation.local')}
              <span className="ml-2 rounded-full border px-2 py-0.5 text-xs">{profiles.filter((p) => p.task === task).length}</span>
            </h2>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setError(false)
                setEditing({
                  id: `media-${crypto.randomUUID()}`,
                  name: '',
                  task,
                  settings: {
                    ...creationDefaults,
                    imageEngine: task === 'image' ? 'sdcpp' : 'diffusers',
                    encoderDevice: 'cpu',
                    steps: task === 'image' ? 4 : 20,
                  },
                })
              }}
            >
              {t('providers:import')}
            </Button>
          </div>
          {!profiles.some((p) => p.task === task) && <p className="text-sm text-muted-foreground">{t('providers:noInstalledModels')}</p>}
          {profiles
            .filter((p) => p.task === task)
            .map((profile) => (
              <div key={profile.id} className="rounded border p-3 space-y-2">
                <div className="flex flex-wrap gap-2 items-center">
                  <p className="text-sm font-medium break-words">
                    {profile.name}
                  </p>
                  <span
                    className="text-xs text-muted-foreground"
                    title={t('providers:importedTooltip')}
                  >
                    {t('providers:imported')}
                  </span>
                </div>
                <p className="break-all text-xs text-muted-foreground">
                  {task === 'video'
                    ? profile.settings.videoModel
                    : profile.settings.imageEngine === 'diffusers'
                      ? profile.settings.imageModel
                      : profile.settings.ggufImageModel}
                </p>
                <details className="text-xs text-muted-foreground">
                  <summary className="cursor-pointer">{t('providers:modelComponents')}</summary>
                  <dl className="mt-2 grid gap-2">
                    {Object.entries({
                      [t('chat:creation.model')]: task === 'video' ? profile.settings.videoModel : profile.settings.imageEngine === 'diffusers' ? profile.settings.imageModel : profile.settings.ggufImageModel,
                      [t('chat:creation.ggufTextEncoder')]: profile.settings.ggufTextEncoder,
                      VAE: profile.settings.ggufVae,
                    }).filter(([, path]) => path).map(([label, path]) => <div key={label}><dt className="font-medium">{label}</dt><dd className="break-all">{path}</dd></div>)}
                  </dl>
                </details>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      selectMediaProfile(profile)
                      window.dispatchEvent(
                        new CustomEvent('novera-creation-settings', {
                          detail: {
                            installed: true,
                            profileId: profile.id,
                            task: profile.task,
                          },
                        })
                      )
                    }}
                  >
                    {t('chat:creationInstall.use')}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setError(false)
                      setEditing(structuredClone(profile))
                    }}
                  >
                    {t('common:edit')}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleting(profile)}
                  >
                    {t('common:delete')}
                  </Button>
                </div>
              </div>
            ))}
        </section>
      ))}
      <MusicModelLibrary />
      <Dialog
        open={!!editing}
        onOpenChange={(open) => {
          if (!open && !busy) setEditing(undefined)
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t('providers:import')} ·{' '}
              {t(`chat:creation.${editing?.task ?? 'image'}`)}
            </DialogTitle>
            <DialogDescription>
              {t('providers:importedTooltip')}
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <>
              <label className="text-sm">
                {t('common:name')}
                <input
                  className="block w-full border rounded p-2"
                  value={editing.name}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                />
              </label>
              {editing.task === 'video' && <label className="text-sm">{t('chat:creation.video')} · {t('chat:creation.model')}<select className="block w-full rounded border p-2" value={editing.settings.videoEngine ?? 'diffusers'} onChange={(e) => setEditing({ ...editing, settings: { ...editing.settings, videoEngine: e.target.value as 'diffusers' | 'sdcpp' } })}><option value="diffusers">Diffusers</option><option value="sdcpp">stable-diffusion.cpp · GGUF</option></select></label>}
              {editing.task === 'image' && (
                <label className="text-sm">
                  {t('chat:creation.imageEngine')}
                  <select
                    className="block w-full border rounded p-2"
                    value={editing.settings.imageEngine}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        settings: {
                          ...editing.settings,
                          imageEngine: e.target
                            .value as MediaProfile['settings']['imageEngine'],
                        },
                      })
                    }
                  >
                    <option value="sdcpp">
                      stable-diffusion.cpp · GGUF / Safetensors
                    </option>
                    <option value="diffusers">Diffusers</option>
                    <option value="nvfp4-cuda">NVFP4 CUDA · PyTorch</option>
                  </select>
                </label>
              )}
              {fields.map((field) => (
                <label className="text-sm space-y-1" key={field}>
                  {editing.task === 'video' && field === 'videoModel' && component ? `${t('chat:creation.video')} · GGUF` : editing.task === 'video' && field === 'ggufTextEncoder' ? 'UMT5-XXL · GGUF' : editing.task === 'video' && field === 'ggufVae' ? 'Wan2.1 VAE' : t(`chat:creation.${field}`)}
                  <div className="flex gap-2">
                    <input
                      className="block min-w-0 flex-1 border rounded p-2 text-xs"
                      value={editing.settings[field] ?? ''}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          settings: {
                            ...editing.settings,
                            [field]: e.target.value,
                          },
                        })
                      }
                    />
                    <Button
                      variant="outline"
                      onClick={async () => {
                        const directory =
                          field === 'imageModel' || (field === 'videoModel' && !component)
                        const path = await service.dialog().open({
                          directory,
                          multiple: false,
                          ...(!directory
                            ? {
                                filters: [
                                  {
                                    name: t(`chat:creation.${field}`),
                                    extensions: ['gguf', 'safetensors'],
                                  },
                                ],
                              }
                            : {}),
                        })
                        if (typeof path === 'string')
                          setEditing({
                            ...editing,
                            settings: { ...editing.settings, [field]: path },
                          })
                      }}
                    >
                      {t('common:browse')}
                    </Button>
                  </div>
                </label>
              ))}
              {(
                [
                  'device',
                  ...(component ? (['encoderDevice'] as const) : []),
                ] as const
              ).map((field) => (
                <label key={field} className="text-sm">
                  {t(`chat:creation.${field}`)}
                  <select
                    className="block w-full border rounded p-2"
                    value={editing.settings[field]}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        settings: {
                          ...editing.settings,
                          [field]: e.target.value,
                        },
                      })
                    }
                  >
                    <option value="auto">{t('chat:creation.auto')}</option>
                    <option value="cpu">CPU</option>
                    <option value="cuda">CUDA</option>
                  </select>
                </label>
              ))}
              {error && (
                <p role="alert" className="text-xs">
                  {t('chat:creationInstall.error')}
                </p>
              )}
              <Button
                disabled={busy || !editing.name.trim()}
                onClick={async () => {
                  setBusy(true)
                  setError(false)
                  try {
                    await validateMediaProfile(editing)
                    put({ ...editing, name: editing.name.trim() })
                    setEditing(undefined)
                  } catch {
                    setError(true)
                  } finally {
                    setBusy(false)
                  }
                }}
              >
                {t('common:save')}
              </Button>
              <Button
                variant="ghost"
                disabled={busy}
                onClick={() => setEditing(undefined)}
              >
                {t('common:cancel')}
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open) setDeleting(undefined)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('providers:deleteModel.title', { modelId: deleting?.name })}
            </DialogTitle>
            <DialogDescription>
              {t('providers:deleteModel.importedDescription')}
            </DialogDescription>
          </DialogHeader>
          <Button
            onClick={() => {
              if (deleting) remove(deleting.id)
              setDeleting(undefined)
            }}
          >
            {t('providers:deleteModel.removeFromJan')}
          </Button>
          <Button variant="ghost" onClick={() => setDeleting(undefined)}>
            {t('common:cancel')}
          </Button>
        </DialogContent>
      </Dialog>
    </section>
  )
}
