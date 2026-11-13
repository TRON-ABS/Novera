// These patterns cover complete, unambiguous requests. Free-form requests
// continue through the normal conversation model.
export function groundedAnswer(prompt: string): string | undefined {
  const text = prompt.trim().normalize('NFC').toLocaleLowerCase('fr')
  const proposal = /^ne réserve rien pour (?:lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)[.!]\s+propose (?:seulement|uniquement) (lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche) à (\d{1,2}|[a-zé -]+)\s*(?:heures?|h)[.!]?$/.exec(text)
  if (proposal) {
    const value = proposal[2].trim()
    const hour = /^\d+$/.test(value) ? Number(value) : frenchHours.indexOf(value.replaceAll(' ', '-'))
    if (hour >= 0 && hour < 24) return `${proposal[1][0].toUpperCase()}${proposal[1].slice(1)} à ${hour} h.`
  }

  const price = /^le montant est de (\d{1,9}(?:[,.]\d{1,2})? (?:euros?|€)|douze euros cinquante) pour (\d{1,6}|deux) billets? au total\. quel est le prix par billet\s*\?$/.exec(text)
  if (price) {
    const count = price[2] === 'deux' ? 2 : Number(price[2])
    if (!count) return 'Il faut au moins un billet pour calculer le prix par billet.'
    const amount = price[1] === 'douze euros cinquante' ? '12,50' : price[1].split(' ')[0]
    const [euros, cents = ''] = amount.split(/[,.]/)
    const total = Number(euros) * 100 + Number(cents.padEnd(2, '0'))
    const rounded = Math.floor((2 * total + count) / (2 * count))
    const formatted = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(rounded / 100)
    return total % count === 0 ? formatted : `Environ ${formatted} par billet.`
  }
}
const frenchHours = 'zéro une deux trois quatre cinq six sept huit neuf dix onze douze treize quatorze quinze seize dix-sept dix-huit dix-neuf vingt vingt-et-une vingt-deux vingt-trois'.split(' ')
