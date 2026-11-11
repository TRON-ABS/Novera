import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/i18n/react-i18next-compat'
import type { ConfirmedGain } from './AutoTuneDashboard'

import { contributionConsentKey, contributionEndpoint, contributionReport } from '@/services/creation/auto-tune-contribution'

export function AutoTuneContribution({ gains, browser }: { gains: ConfirmedGain[]; browser: boolean }) {
  const { t, i18n } = useTranslation()
  const automatic = Boolean(contributionEndpoint())
  const [consent, setConsent] = useState(() => {
    try { return localStorage.getItem(contributionConsentKey()) === 'true' }
    catch { return false }
  })
  const [selected, setSelected] = useState(0)
  const gain = gains[selected] ?? gains[0]
  const report = consent && gain ? contributionReport(gain, browser) : null
  const contents = report ? JSON.stringify(report, null, 2) + '\n' : ''
  const stamp = gain?.recordedAt ?? 0
  const filename = `contributions/auto-tune/${report?.platform}-${stamp}-${report?.task}.json`
  const github = 'https://github.com/TRON-ABS/Novera/new/main?' +
    new URLSearchParams({ filename, value: contents }).toString()

  return (
    <div className="space-y-1.5 rounded-md border border-border px-2 py-1.5">
      <label className="flex items-center gap-2 font-medium">
        <input type="checkbox" checked={consent} onChange={event => {
          const selected = event.currentTarget.checked
          setConsent(selected)
          try { localStorage.setItem(contributionConsentKey(), String(selected)) }
          catch { /* The choice still applies for this session. */ }
          window.dispatchEvent(new Event('novera:auto-tune-contribution-consent'))
        }} />
        {t(automatic ? 'ui:autoTuneContributionAutoSend' : 'ui:autoTuneContributionOptIn')}
      </label>
      <p className="text-muted-foreground">{t('ui:autoTuneContributionWhy')}</p>
      {report && (
        <details>
          <summary className="cursor-pointer">{t('ui:autoTuneContributionReview')}</summary>
          {gains.length > 1 && (
            <label className="mt-2 grid gap-1">
              {t('ui:autoTuneContributionReport')}
              <select className="rounded border border-border bg-background p-1" value={selected}
                onChange={event => setSelected(Number(event.currentTarget.value))}>
                {gains.map((entry, index) => (
                  <option key={index} value={index}>
                    {entry.model.split(/[\\/]/).at(-1)} · {new Intl.NumberFormat(i18n.language, {
                      style: 'percent', signDisplay: 'always', maximumFractionDigits: 1,
                    }).format(entry.percent / 100)}
                  </option>
                ))}
              </select>
            </label>
          )}
          <pre className="my-2 max-h-40 overflow-auto rounded bg-muted p-2">{contents}</pre>
          {!automatic && (
            <Button asChild variant="outline" size="xs">
              <a href={github} target="_blank" rel="noopener noreferrer">{t('ui:autoTuneContributionGithub')}</a>
            </Button>
          )}
        </details>
      )}
    </div>
  )
}
