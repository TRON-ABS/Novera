/** UI catalog names are not all standard Intl/BCP-47 locale identifiers. */
export function intlLocale(language: string): string {
  const aliases: Record<string, string> = {
    vn: 'vi-VN', wuu: 'zh-CN', yue: 'zh-HK', arz: 'ar-EG', apc: 'ar-LB', apd: 'ar-SD',
    arq: 'ar-DZ', ary: 'ar-MA', cjy: 'zh-CN', nan: 'zh-TW', hak: 'zh-TW',
    hsn: 'zh-CN', prs: 'fa-AF', sd: 'sd-Arab-PK', pa: 'pa-Guru-IN',
    pnb: 'pa-Arab-PK', pcm: 'en-NG',
  }
  const locale = aliases[language] ?? language
  try {
    if (Intl.DateTimeFormat.supportedLocalesOf(locale).length) return locale
  } catch { /* An invalid legacy catalog code must not break the message row. */ }
  return 'en-US'
}
