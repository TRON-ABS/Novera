/** UI catalog names are not all standard Intl/BCP-47 locale identifiers. */
export function intlLocale(language: string): string {
  const aliases: Record<string, string> = {
    gan: 'zh-Hant-CN', pbt: 'ps-AF', ars: 'ar-SA', acm: 'ar-IQ', tts: 'th-TH', ctg: 'bn-BD', azb: 'az-Arab-IR', fuv: 'ff-Latn-NG', bar: 'de-AT',
    kmr: 'ku-Latn-TR',
    dcc: 'ur-IN', vjk: 'mai-IN', ayn: 'ar-YE', aeb: 'ar-TN', ktu: 'ln-CD',
    acw: 'ar-SA', acq: 'ar-YE', sck: 'hi-IN', hae: 'om-ET', wes: 'en-CM',
    ayp: 'ar-IQ', mos: 'fr-BF', mnp: 'zh-Hant-CN', syl: 'bn-BD',
    vn: 'vi-VN', wuu: 'zh-CN', yue: 'zh-HK', arz: 'ar-EG', apc: 'ar-LB', apd: 'ar-SD',
    arq: 'ar-DZ', ary: 'ar-MA', cjy: 'zh-CN', nan: 'zh-TW', hak: 'zh-TW',
    hsn: 'zh-CN', prs: 'fa-AF', sd: 'sd-Arab-PK', pa: 'pa-Guru-IN',
    pnb: 'pa-Arab-PK', pcm: 'en-NG',
    uzn: 'uz-Latn-UZ', pbu: 'ps-AF', gaz: 'om-ET', aec: 'ar-EG', skr: 'ur-PK',
  }
  const locale = aliases[language] ?? language
  try {
    if (Intl.DateTimeFormat.supportedLocalesOf(locale).length) return locale
  } catch { /* An invalid legacy catalog code must not break the message row. */ }
  return 'en-US'
}
