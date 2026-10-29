import i18n from '@/i18n'

/** Preserve the actual failure instead of treating every native error as missing setup. */
export function creationFailure(error: unknown, secrets: readonly string[] = []): Error {
  let detail: string
  if (error instanceof Error) detail = error.message
  else if (typeof error === 'string') detail = error
  else if (error == null) detail = ''
  else {
    try { detail = JSON.stringify(error) ?? '' } catch { detail = String(error) }
  }
  for (const secret of [...secrets].filter(Boolean).sort((a, b) => b.length - a.length)) {
    detail = detail.split(secret).join('[redacted]')
    detail = detail.split(encodeURIComponent(secret)).join('[redacted]')
  }
  detail = detail
    .replace(/([?&](?:key|api_key|api-key|token|access_token)=)[^&#\s]+/gi, '$1[redacted]')
    .replace(/(Bearer\s+)[^\s"'<>]+/gi, '$1[redacted]')
    .replace(/("?(?:api[-_]?key|access_token|authorization)"?\s*[:=]\s*"?)[^\s",;]+/gi, '$1[redacted]')
    .trim()
    .slice(0, 1600)
  const memory = /out of memory|memoryerror|workspace (?:capacity check|allocation)|cannot make enough memory available|not enough (?:device )?memory|failed to allocate.*(?:memory|buffer)|cudaErrorMemoryAllocation/i.test(detail)
  return new Error(
    `${i18n.t('chat:creation.failed')}${memory ? ` ${i18n.t('hub:catalog.tipLimited')}` : ''}` +
    (detail ? `\n${i18n.t('common:errorDialog.details')}: ${detail}` : '')
  )
}
