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
  // Exclude identifiers, URLs and multi-part version/date tokens. Fractional
  // digits are spoken separately to preserve precision and leading zeroes.
  return text.replace(/(?<![\p{L}\p{N}_/.])\d+(?:[\u00a0\u202f]\d{3})*(?:[.,]\d+)?(?![\p{L}\p{N}_/]|\.\d)/gu, token => {
    const [whole, fraction] = token.replace(/[\u00a0\u202f]/g, '').split(/[.,]/)
    if (whole.length > 12) return token
    const integer = whole.length > 1 && whole.startsWith('0')
      ? [...whole].map(digit => small[Number(digit)]).join(' ') : cardinal(Number(whole))
    return integer + (fraction === undefined ? '' : ` virgule ${[...fraction].map(digit => small[Number(digit)]).join(' ')}`)
  })
}
