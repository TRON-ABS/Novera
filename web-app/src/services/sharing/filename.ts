/** Use ASCII at app handoff boundaries; keep document titles/content Unicode. */
export function attachmentFilename(filename: string): string {
  const extension = /\.([a-z0-9]{1,12})$/i.exec(filename)
  const stem = extension ? filename.slice(0, -extension[0].length) : filename
  let name = stem
    .replace(/œ/gi, 'oe')
    .replace(/æ/gi, 'ae')
    .replace(/ß/g, 'ss')
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9_-]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)
    .replace(/-+$/g, '')
  if (!name) name = 'Novera'
  if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(name))
    name = `Novera-${name}`
  return name + (extension ? `.${extension[1].toLowerCase()}` : '')
}
