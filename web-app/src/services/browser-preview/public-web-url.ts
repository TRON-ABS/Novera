export function publicWebUrl(value: string): string {
  if (value.length > 8192) throw new Error('Adresse de page trop longue.')
  const url = new URL(value)
  const host = url.hostname.toLowerCase()
  if (url.protocol !== 'https:' || url.username || url.password || !host.includes('.') || host.includes(':') ||
    /^(localhost|127\.|10\.|0\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host) || /\.(local|localhost|internal|test|invalid)$/.test(host)) throw new Error('Seules les pages publiques HTTPS sont autorisées.')
  return url.href
}
