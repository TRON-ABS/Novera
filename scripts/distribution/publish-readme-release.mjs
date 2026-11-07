// Only public editorial content; installed applications are never modified.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../', import.meta.url))
const report = 'docs/RELEASE_1.0.1_2026-11-07.md'
const render = (text, facts) => text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
  if (!(key in facts)) throw new Error(`Missing publication fact: ${key}`)
  return String(facts[key])
})

export function preparePublishedReadme(source, locale, facts, copy) {
  source = source.replaceAll('\r\n', '\n')
  if (facts.published !== true || facts.stable !== facts.release || !/^\d+\.\d+\.\d+$/.test(facts.release)) throw new Error('Verified published release facts required')
  const t = Object.fromEntries(Object.entries(copy).map(([key, value]) => [key, render(value, facts)]))
  const start = `<!-- novera-release-${facts.release}:start -->`
  const end = `<!-- novera-release-${facts.release}:end -->`
  const first = source.indexOf(start), last = source.indexOf(end)
  if (first < 0 || last < first || source.indexOf(start, first + start.length) >= 0) throw new Error(`Ambiguous release block: ${locale}`)
  const block = source.slice(first, last).split('\n')
  const heading = block.findIndex(line => line.startsWith('## '))
  if (heading < 0) throw new Error(`Missing release title: ${locale}`)
  block[heading] = `## Novera ${facts.release}`
  const status = block.findIndex((line, i) => i > heading && line.trim())
  block[status] = t.status
  const limits = block.findLastIndex(line => line.startsWith('- '))
  if (limits < status) throw new Error(`Missing release limits: ${locale}`)
  block[limits] = '- ' + t.limits
  block[1] = `<a id="version-${facts.release.replaceAll('.', '-')}"></a>`
  let text = source.slice(0, first) + block.join('\n') + source.slice(last)
  const lines = text.split('\n')
  const changed = { metrics: 0, providers: 0, media: 0, android: 0, heading: 0 }
  let releaseEnded = false
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.includes(end)) releaseEnded = true
    if (line.includes('<p><strong>') && line.includes('Apache 2.0') && line.includes(facts.languages)) {
      lines[i] = line.slice(0, line.indexOf('</strong>') + 9) + ' · ' + t.metrics + '</p>'
      changed.metrics++
    } else if (!line.startsWith('|') && ['TabbyAPI', facts.providers, facts.cloud, facts.languages].every(value => line.includes(String(value)))) {
      lines[i] = t.providers
      changed.providers++
    } else if (!line.startsWith('|') && [facts.media, facts.mediaProviders, facts.images, facts.videos, facts.music].every(value => new RegExp(`(^|\\D)${value}(\\D|$)`).test(line))) {
      lines[i] = t.media
      changed.media++
    } else if (line.startsWith('|') && /releases\/tag\/v[\d.]+-android-\d+/.test(line)) {
      const columns = line.split('|')
      if (columns.length !== 4) throw new Error(`Ambiguous Android table: ${locale}`)
      columns[2] = ` ${t.android} Android 7+ · [APK](https://github.com/TRON-ABS/Novera/releases/tag/v${facts.release}-android-${facts.androidVersionCode}) · [${facts.release}](${report}). `
      lines[i] = columns.join('|')
      changed.android++
    } else if (releaseEnded && changed.heading === 0 && line.startsWith('## ')) {
      lines[i] = line.split('—')[0].trimEnd() + ' — 2026-11-07'
      changed.heading++
    }
  }
  for (const [key, count] of Object.entries(changed)) if (count !== 1) throw new Error(`Expected one ${key} section in ${locale}, found ${count}`)
  text = lines.join('\n')
  const paragraphs = text.split('\n\n')
  const upgrade = paragraphs.findIndex((paragraph, i) => !paragraph.startsWith('|') && paragraph.includes('](docs/LAUNCH_STATUS.md)') && paragraphs.slice(0, i).some(p => p.includes(end)))
  if (upgrade < 0) throw new Error(`Missing upgrade evidence paragraph: ${locale}`)
  const link = paragraphs[upgrade].match(/\[[^\]]+\]\(docs\/LAUNCH_STATUS\.md\)/)?.[0]
  if (!link) throw new Error(`Missing translated evidence link: ${locale}`)
  paragraphs[upgrade] = t.upgrade + ' ' + link
  text = paragraphs.join('\n\n')
    .replace(/docs\/RELEASE_[A-Z0-9_]+_1\.0\.0\.md/g, report)
    .replaceAll(facts.previous, facts.release)
  if (/\{\{\w+\}\}|android-1000012/.test(text)) throw new Error(`Stale publication content: ${locale}`)
  // The upgrade sentence must retain the actual previous version.
  text = text.replace(t.upgrade.replaceAll(facts.previous, facts.release), t.upgrade)
  return text
}

export function preparePublication(rootPath, preview = false) {
  const sourceFacts = JSON.parse(fs.readFileSync(path.join(rootPath, 'docs/release-preparation.json')))
  if (!preview && sourceFacts.published !== true) throw new Error('Refusing to announce an unpublished release')
  if (!preview && !sourceFacts.previous) throw new Error('The previous public version must be explicit')
  const android = JSON.parse(fs.readFileSync(path.join(rootPath, 'scripts/android/release.json')))
  const facts = { ...sourceFacts, previous: sourceFacts.previous ?? sourceFacts.stable, androidVersionCode: android.versionCode }
  if (preview) Object.assign(facts, { published: true, stable: facts.release })
  const locales = JSON.parse(fs.readFileSync(path.join(rootPath, 'docs/language-support.json')))
  const copies = JSON.parse(fs.readFileSync(path.join(rootPath, `scripts/readme-release-${facts.release}-published.json`)))
  if (Object.keys(copies).length !== locales.length) throw new Error('Incomplete publication translations')
  return locales.map(({ locale }) => {
    const name = locale === 'en' ? 'README.md' : `README.${locale === 'de-DE' ? 'de' : locale}.md`
    const before = fs.readFileSync(path.join(rootPath, name), 'utf8')
    return { name, before, after: preparePublishedReadme(before, locale, facts, copies[locale]) }
  })
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2), preview = args[0] === '--preview'
  if ((preview && args.length !== 2) || (!preview && args.length)) throw new Error('Usage: publish-readme-release.mjs [--preview NEW_OUTPUT_DIRECTORY]')
  const plan = preparePublication(root, preview)
  const destination = preview ? path.resolve(args[1]) : root
  if (preview && fs.existsSync(destination)) throw new Error('Preview output already exists')
  if (preview) fs.mkdirSync(destination, { recursive: true })
  for (const file of plan) if (!preview && fs.readFileSync(path.join(root, file.name), 'utf8') !== file.before) throw new Error(`README changed after planning: ${file.name}`)
  for (const file of plan) fs.writeFileSync(path.join(destination, file.name), file.after)
  console.log(JSON.stringify({ files: plan.length, preview, sourcesChanged: !preview, installedApplicationsChanged: false }))
}
