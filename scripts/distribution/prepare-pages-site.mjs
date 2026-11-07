import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'

const repository = 'https://github.com/TRON-ABS/Novera'
const facebookPage = 'https://www.facebook.com/profile.php?id=61596114515071'
const socialProfiles = [
  ['Facebook', facebookPage],
  ['Instagram', 'https://www.instagram.com/noveratronabs/'],
  ['TikTok', 'https://www.tiktok.com/@tronabs0'],
  ['YouTube', 'https://www.youtube.com/@noveratronabs'],
  ['X', 'https://x.com/noveratronabs'],
  ['Bluesky', 'https://bsky.app/profile/noveratronabs.bsky.social'],
]
export function preparePagesSite(output, commit, factsOverride) {
  if (!/^[a-f0-9]{40}$/.test(commit)) throw new Error('An exact reviewed source commit is required')
  if (fs.existsSync(output)) throw new Error('Pages staging output already exists')
  const root = fileURLToPath(new URL('../../', import.meta.url))
  const facts = factsOverride ?? JSON.parse(fs.readFileSync(path.join(root, 'docs/release-preparation.json'), 'utf8'))
  const copy = JSON.parse(fs.readFileSync(path.join(root, 'scripts/readme-release-1.0.1.json'), 'utf8')).fr
  const published = facts.published === true
  const androidVersion = facts.androidReleaseVersion ?? facts.stable
  const androidVersionCode = facts.androidVersionCode ?? 1000012
  if (![facts.release, facts.stable, androidVersion].every(version => /^\d+\.\d+\.\d+$/.test(version)) || !Number.isSafeInteger(androidVersionCode)) throw new Error('Invalid public release identity')
  const androidReleaseTag = `v${androidVersion}-android-${androidVersionCode}`
  const androidDownload = `${repository}/releases/download/${androidReleaseTag}/Novera_${androidVersion}_android-arm64.apk`
  let publicationCopy
  if (published) {
    if (facts.stable !== facts.release || !Number.isSafeInteger(facts.androidVersionCode) || facts.androidVersionCode < 1000013) throw new Error('Published release versions require review')
    publicationCopy = JSON.parse(fs.readFileSync(path.join(root, `scripts/readme-release-${facts.release}-published.json`), 'utf8')).fr
    Object.assign(copy, { title: `Novera ${facts.release}`, status: publicationCopy.status, limits: publicationCopy.limits })
  }
  const locales = JSON.parse(fs.readFileSync(path.join(root, 'docs/language-support.json'), 'utf8'))
  const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
  const render = value => escape(value.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (!(key in facts)) throw new Error(`Missing release fact: ${key}`)
    return facts[key]
  })).replace(/`([^`]+)`/g, '<code>$1</code>')
  if (typeof facts.published !== 'boolean' || String(locales.length) !== facts.languages) throw new Error('Release-preparation facts require review')
  const noteKeys = ['security', 'privacy', 'engine', 'languages', 'recommendation', 'voice', 'microphone', 'web', 'optimization', 'interface', 'api', 'checks', 'limits']
  const preparedNotes = `<section class="notice" aria-labelledby="preparation-title"><h2 id="preparation-title">${render(copy.title)}</h2><p>${render(copy.status)}</p><p>${render(copy.interface)}</p><p>${render(copy.optimization)}</p><details><summary>${render(copy.details)}</summary><ul>${noteKeys.map(key => `<li>${render(copy[key])}</li>`).join('')}</ul><p><a href="${repository}/blob/main/docs/CHANGELOG.md">Notes 1.0.1</a> · <a href="${repository}/blob/main/SECURITY.md">Sécurité et limites</a></p></details></section>`
  const languageLinks = locales.map(locale => {
    const filename = locale.locale === 'en' ? 'README.md' : `README.${locale.locale === 'de-DE' ? 'de' : locale.locale}.md`
    if (!fs.existsSync(path.join(root, filename))) throw new Error(`Missing translated README: ${filename}`)
    return `<a class="button" dir="auto" href="${repository}/blob/main/${filename}">${escape(locale.label)}</a>`
  }).join('')
  let html = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="Novera, l’assistant IA indépendant de TRON-ABS. Novera 1.0.0 est disponible sur Windows, Linux, macOS et Android ; téléchargez la version officielle.">
<meta name="novera-pages-commit" content="${commit}"><title>Novera — Windows, Linux, macOS et Android</title>
<style>
.notice code{overflow-wrap:anywhere;word-break:break-word}.notice li{margin:10px 0}
:root{color-scheme:dark;--ink:#f1f5fc;--muted:#b0bbce;--line:#29334a;--accent:#b9a3ff}*{box-sizing:border-box}body{margin:0;background:radial-gradient(ellipse at 85% 15%,#243043 0,transparent 42%),#0b101a;color:var(--ink);font:16px/1.65 system-ui,-apple-system,"Segoe UI",sans-serif}a{color:inherit}header,main,footer{max-width:1180px;margin:auto;padding:24px}header{display:flex;align-items:center;justify-content:space-between;gap:24px}header img{width:min(370px,60vw);height:auto}nav{display:flex;gap:20px;font-size:.9rem}nav a{text-decoration:none;color:var(--muted)}.hero{display:grid;grid-template-columns:1fr 1.18fr;gap:48px;align-items:center;padding:48px 0 30px}.label{display:inline-block;border:1px solid #67558f;background:#2a2141;color:#dfd1ff;padding:5px 13px;border-radius:100px;font-size:.8rem;letter-spacing:.04em}h1{font-size:clamp(2.4rem,4.5vw,4rem);line-height:1.08;letter-spacing:-.045em;margin:24px 0}p{color:var(--muted)}.lead{font-size:1.1rem;max-width:39em}.actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:28px}.button{padding:11px 18px;border-radius:10px;text-decoration:none;border:1px solid var(--line);font-weight:600;font-size:.94rem}.primary{background:#c0a8ff;color:#191128;border-color:#c0a8ff}figure{margin:0}figure img{display:block;width:100%;border-radius:17px;border:1px solid #4a5268;box-shadow:0 22px 70px #0006}figcaption{font-size:.78rem;color:var(--muted);margin-top:10px}.notice{border:1px solid var(--line);border-left:3px solid var(--accent);padding:20px 24px;border-radius:12px;margin:28px 0 38px;background:#101827}.notice p{margin:4px 0 0}.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.card{border-top:1px solid var(--line);padding:20px 0}.card h2{font-size:1.05rem;margin:0 0 8px}.card p{font-size:.94rem;margin:0}.numbers{font-size:.9rem;color:#b5a5da;margin:30px 0}footer{border-top:1px solid var(--line);margin-top:25px;padding-top:30px;padding-bottom:45px;font-size:.9rem}footer p{max-width:760px}.signature{color:var(--ink);font-weight:700}.signature span{font-weight:400;color:var(--muted)}a:focus-visible{outline:3px solid #deceff;outline-offset:5px}@media(max-width:780px){header{align-items:flex-start;flex-direction:column;gap:10px}.hero{grid-template-columns:1fr;gap:30px;padding-top:22px}.cards{grid-template-columns:1fr;gap:0}h1{max-width:12em}main{padding-top:0}}
</style></head><body>
<header><img src="assets/banner.png" alt="Novera — Knowledge for everyone"><nav aria-label="Navigation"><a href="${repository}">GitHub</a><a href="#community-title">Communauté</a><a href="${repository}/blob/main/README.md">English</a></nav></header>
<main><section class="hero"><div><span class="label">WINDOWS · LINUX · MACOS · ANDROID</span><h1>Novera 1.0.0 est disponible.</h1><p class="lead">Vous décrivez. Novera prépare, exécute et organise. Texte, images, musique et vidéo se retrouvent dans un même espace de conversation.</p><div class="actions"><a class="button primary" href="${repository}/releases/tag/v1.0.0">Windows x64 / Linux x64</a><a class="button" href="${repository}/releases/download/v1.0.0-macos/Novera_1.0.0_aarch64.dmg">Mac Apple Silicon · DMG</a><a class="button" href="${repository}/releases/download/v1.0.0-macos/Novera_1.0.0_x64.dmg">Mac Intel · DMG</a><a class="button" href="${androidDownload}">Android ARM64 · APK</a><a class="button" href="${repository}/releases/tag/v1.0.0-windows-arm64">Windows ARM64</a><a class="button" href="${repository}/releases/tag/v1.0.0-windows-portable">Windows x64 portable · USB</a><a class="button" href="${repository}/releases/tag/v1.0.0-cli-novera">Novera CLI</a><a class="button" href="${repository}/blob/main/README.fr.md">Découvrir le projet</a></div></div><figure><img src="assets/dashboard.png" alt="Capture réelle du tableau de bord Novera, avec une image créée et ses commandes de génération"><figcaption>Application Windows : capture réelle fournie par le mainteneur.</figcaption></figure></section>
<aside class="notice" aria-label="Disponibilité"><strong>Windows x64, Windows ARM64, Linux x64, macOS et Android ARM64 sont disponibles.</strong><p>Les installateurs Windows et l’AppImage Linux sont disponibles en version 1.0.0, avec des mises à jour signées. Windows ARM64 inclut le moteur texte CPU natif. La CLI Novera utilise désormais novera.exe sous Windows et novera sous Linux. Son nouveau canal signé est distinct des anciens paquets.</p><p>La version portable Windows x64 1.0.0 est disponible : discussions, réglages et modèles téléchargés restent dans son dossier Data. Extraire l’archive complète et ouvrir Novera.exe ; fermer Novera avant de déplacer le dossier ou d’éjecter la clé USB. <a href="${repository}/blob/main/docs/WINDOWS_PORTABLE.md">Guide portable et limites</a>.</p><p><strong>Android 1.0.0 est disponible en APK signé.</strong> Le mainteneur confirme le bon fonctionnement du build 1000012 sur son téléphone. L’APK est vierge : aucune conversation, aucun modèle téléchargé ni aucune clé API personnelle embarqués. Installez-le par-dessus la version existante pour conserver vos données. <a href="${repository}/releases/tag/${androidReleaseTag}">Publication Android et vérification</a>.</p><p>Pour les modèles locaux, un téléphone moderne avec suffisamment de mémoire est conseillé ; sur un appareil moins puissant, privilégiez un fournisseur API. Pour la recherche web, un contexte d’au moins <strong>16K tokens</strong> est conseillé. La taille de lot Android par défaut est <strong>512</strong>.</p><p><strong>macOS 1.0.0 est disponible en version officielle pour Intel (macOS 13+) et Apple Silicon (macOS 14+).</strong> Interface et couleurs communes aux versions Desktop ; tests automatiques réussis séparément sur les deux architectures. Sans signature Developer ID ni notarisation Apple ; essais visuels et MLX différés. Ouvrir le DMG puis copier Novera dans Applications. Si macOS bloque le premier lancement, aller dans Réglages Système → Confidentialité et sécurité → Ouvrir quand même pour Novera. <a href="${repository}/blob/main/docs/RELEASE_MACOS_1.0.0.md">Guide Mac et preuves</a>. iOS reste en préparation et n’est pas encore installable sur iPhone. <a href="${repository}/blob/main/docs/RELEASE_ANDROID_1.0.0.md">Suivi Android</a></p></aside>
${preparedNotes}
<section class="cards" aria-label="Le projet"><article class="card"><h2>Du premier message au résultat</h2><p>Conversation, recherche et création se suivent dans un tableau de bord commun.</p></article><article class="card"><h2>Local et cloud</h2><p>Les capacités locales dépendent du matériel et des modèles installés. Le cloud utilise les accès choisis par l’utilisateur.</p></article><article class="card"><h2>Un projet indépendant</h2><p>Sources ouvertes, documentation et disponibilité sont suivies sur le dépôt officiel TRON-ABS/Novera.</p></article></section>
<section class="notice" aria-labelledby="community-title"><h2 id="community-title">Novera évolue avec vous</h2><p>Le savoir pour tous, un avenir à construire ensemble. Partagez vos créations, vos modèles et vos réglages : vos expériences peuvent aussi aider les autres utilisateurs à trouver une configuration adaptée.</p><p>Un retour, une question, un problème ou une idée ? Nous sommes là pour vous aider. Indiquez si possible votre version de Novera, votre appareil et si vous utilisez un modèle local ou une API. Masquez les données personnelles ; ne partagez jamais vos clés API ou mots de passe.</p><p>Retrouvez les comptes officiels de Novera :</p><div class="actions" aria-label="Réseaux officiels de Novera">${socialProfiles.map(([name, url]) => `<a class="button" href="${url}">${name}</a>`).join('')}<a class="button" href="mailto:contact.novera.tronabs@gmail.com">Écrire à Novera</a></div></section>
<section class="notice" aria-labelledby="languages-title"><h2 id="languages-title">La présentation dans ${facts.languages} langues et variantes</h2><p>Consultez les README du dépôt avec les notes de préparation de la ${facts.release}. Les traductions assistées et variantes écrites nécessitent encore une relecture native.</p><details><summary>Choisir une langue</summary><div class="actions">${languageLinks}</div></details></section>
<p class="numbers">Sources ${facts.release} en préparation : ${facts.languages} langues d’interface · ${facts.providers} profils dont ${facts.cloud} fournisseurs cloud · ${facts.media} préréglages média · Apache 2.0</p></main>
<footer><p>Je vous souhaite à toutes et à tous une merveilleuse aventure avec Novera. Que votre curiosité ouvre de nouvelles portes, que vos idées prennent vie et que chaque création vous emmène un peu plus loin.</p><p class="signature">TRON-ABS<br><span>Mr Sachet Jean-Marc — Chercheur indépendant — France</span><br><span>The art of Human with AI</span></p><p>Merci à toutes les personnes qui contribuent à un monde meilleur. Par leurs découvertes, leur travail, leur entraide et leur transmission, elles nous ont permis d’en être là aujourd’hui.</p><p>Nous leur souhaitons le meilleur pour l’avenir, ainsi qu’à toutes celles et ceux qui poursuivent cet élan de partage et d’entraide.</p><p><small>Outil de développement : 🧠 Codex — GPT-6.1 Sol</small></p></footer></body></html>`
  if (published) {
    const report = `${repository}/blob/main/docs/RELEASE_1.0.1_2026-11-07.md`
    html = html.replace(/<p><strong>Android 1\.0\.0 est disponible en APK signé\.<\/strong>[\s\S]*?<\/p>/,
      `<p>${render(publicationCopy.android)} <a href="${repository}/releases/tag/${androidReleaseTag}">Publication Android et vérification</a>.</p>`)
      .replace(/https:\/\/github\.com\/TRON-ABS\/Novera\/blob\/main\/docs\/RELEASE_(?:MACOS|ANDROID)_1\.0\.0\.md/g, report)
      .replaceAll('1.0.0', facts.stable)
      .replace('notes de préparation de la', 'notes de version de la')
      .replace(`Sources ${facts.release} en préparation :`, `Version ${facts.release} :`)
  }
  fs.mkdirSync(path.join(output, 'assets'), { recursive: true })
  fs.writeFileSync(path.join(output, 'index.html'), html)
  for (const [source, target] of [['novera-banner-en.png', 'banner.png'], ['novera-dashboard-2026-11-01.png', 'dashboard.png']]) {
    fs.copyFileSync(path.join(root, '.github/assets', source), path.join(output, 'assets', target))
  }
  const probe = { product: 'Novera launch information', commit, applicationPublished: false, publicDownloadsEnabled: true, desktopReleaseVersion: '1.0.0', cliReleaseTag: 'v1.0.0-cli-novera', cliExecutableNames: ['novera.exe', 'novera'], macosReleaseTag: 'v1.0.0-macos', macosOfficial: true, macosAppleNotarized: false, macosVisualTestsPerformed: false, androidStatus: 'maintainer-confirmed-public', androidReleaseTag, androidVersionCode: 1000012, androidDownloadUrl: androidDownload, htmlSha256: createHash('sha256').update(html).digest('hex') }
  Object.assign(probe, { preparedSourceVersion: facts.release, preparedVersionPublished: false, readmeLanguageCount: locales.length, preparedMediaPresets: Number(facts.media) })
  if (published) Object.assign(probe, { applicationPublished: true, desktopReleaseVersion: facts.stable, cliReleaseTag: `v${facts.stable}-cli-novera`, macosReleaseTag: `v${facts.stable}-macos`, preparedVersionPublished: true, androidVersionCode, androidStatus: 'package-verified-device-pending' })
  fs.writeFileSync(path.join(output, 'pages-probe.json'), JSON.stringify(probe, null, 2) + '\n')
  return probe
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.length !== 4) throw new Error('Usage: node prepare-pages-site.mjs NEW_OUTPUT SOURCE_COMMIT')
  console.log(JSON.stringify(preparePagesSite(process.argv[2], process.argv[3]), null, 2))
}
