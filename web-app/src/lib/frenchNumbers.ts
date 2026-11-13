// Speech preparation only. Displayed replies and saved messages stay intact.
const small = ['zéro','un','deux','trois','quatre','cinq','six','sept','huit','neuf','dix','onze','douze','treize','quatorze','quinze','seize']
function cardinal(n: number, terminal = true): string {
  if (n < 17) return small[n]
  if (n < 20) return `dix-${small[n - 10]}`
  if (n < 70) {
    const tens = ['', '', 'vingt','trente','quarante','cinquante','soixante'][Math.floor(n / 10)]
    return tens + (n % 10 === 0 ? '' : n % 10 === 1 ? '-et-un' : `-${small[n % 10]}`)
  }
  if (n < 80) return n === 71 ? 'soixante-et-onze' : `soixante-${cardinal(n - 60)}`
  if (n < 100) return n === 80 ? `quatre-vingt${terminal ? 's' : ''}` : `quatre-vingt-${cardinal(n - 80)}`
  if (n < 1000) return `${n < 200 ? '' : `${cardinal(Math.floor(n / 100))} `}cent${n % 100 ? ` ${cardinal(n % 100, terminal)}` : n >= 200 && terminal ? 's' : ''}`
  for (const [scale, name] of [[1e9,'milliard'],[1e6,'million'],[1000,'mille']] as const) {
    if (n < scale) continue
    const count = Math.floor(n / scale), rest = n % scale
    const prefix = scale === 1000 && count === 1 ? '' : `${cardinal(count, scale !== 1000)} `
    return `${prefix}${name}${scale !== 1000 && count > 1 ? 's' : ''}${rest ? ` ${cardinal(rest, terminal)}` : ''}`
  }
  return String(n)
}
export function frenchNumbers(text: string, locale: string): string {
  if (locale.toLowerCase().split('-')[0] !== 'fr') return text
  const withSpokenEuros = text.replace(
    /(?<=€|\beuros?)[ \u00a0\u202f]*([−=])[ \u00a0\u202f]*(?=\d)/gu,
    (_, operator: string) => operator === '−' ? ' moins ' : ' égale '
  ).replace(
    /(?<![\p{L}\p{N}_/.,])([0-9]{1,12}(?:[\u00a0\u202f][0-9]{3})*)[,.]([0-9]{2})[ \u00a0\u202f]*(?:€|euros?\b)/giu,
    (amount, whole: string, fraction: string) => {
      const digits = whole.replace(/[\u00a0\u202f]/g, '')
      if (digits.length > 12) return amount
      const euros = Number(digits)
      const cents = Number(fraction)
      return `${cardinal(euros)} euro${euros > 1 ? 's' : ''}${cents ? ` ${cardinal(cents)}` : ''}`
    }
  ).replace(/(?<=\d)[ \u00a0\u202f]*€/gu, ' euros')
  // Exclude identifiers, URLs and multi-part version/date tokens. Fractional
  // digits are spoken separately to preserve precision and leading zeroes.
  return withSpokenEuros.replace(/(?<![\p{L}\p{N}_/.])\d+(?:[\u00a0\u202f]\d{3})*(?:[.,]\d+)?(?![\p{L}\p{N}_/]|\.\d)/gu, token => {
    const [whole, fraction] = token.replace(/[\u00a0\u202f]/g, '').split(/[.,]/)
    if (whole.length > 12) return token
    const integer = whole.length > 1 && whole.startsWith('0')
      ? [...whole].map(digit => small[Number(digit)]).join(' ') : cardinal(Number(whole))
    return integer + (fraction === undefined ? '' : ` virgule ${[...fraction].map(digit => small[Number(digit)]).join(' ')}`)
  })
}
