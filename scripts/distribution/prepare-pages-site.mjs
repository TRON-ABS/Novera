import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { creationPromptGuide } from './creation-prompt-guide.mjs'

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
export function preparePagesSite(output, commit, factsOverride, webVersion) {
  if (!/^[a-f0-9]{40}$/.test(commit)) throw new Error('An exact reviewed source commit is required')
  if (fs.existsSync(output)) throw new Error('Pages staging output already exists')
  const root = fileURLToPath(new URL('../../', import.meta.url))
  const dashboardRevision = createHash('sha256').update(fs.readFileSync(path.join(root, '.github/assets/novera-dashboard-2026-11-07.png'))).digest('hex').slice(0, 12)
  const collapsedRevision = createHash('sha256').update(fs.readFileSync(path.join(root, '.github/assets/novera-dashboard-collapsed-2026-11-07.png'))).digest('hex').slice(0, 12)
  const collapsedUrl = `assets/dashboard-collapsed.png?v=${collapsedRevision}`
  const dashboardUrl = `assets/dashboard.png?v=${dashboardRevision}`
  const facts = factsOverride ?? JSON.parse(fs.readFileSync(path.join(root, 'docs/release-preparation.json'), 'utf8'))
  const copy = JSON.parse(fs.readFileSync(path.join(root, 'scripts/readme-release-1.0.1.json'), 'utf8')).fr
  const published = facts.published === true
  const androidVersion = facts.androidCurrentRelease?.version ?? facts.androidReleaseVersion ?? facts.stable
  const androidVersionCode = facts.androidCurrentRelease?.versionCode ?? facts.androidVersionCode ?? 1000012
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
  const readmeLocales = locales.map(locale => ({
    label: locale.label,
    filename: locale.locale === 'en' ? 'README.md' : `README.${locale.locale === 'de-DE' ? 'de' : locale.locale}.md`,
  })).filter(({ filename }) => fs.existsSync(path.join(root, filename)))
  if (webVersion !== undefined && !/^\d+\.\d+\.\d+$/.test(webVersion)) throw new Error('Invalid public Web version')
  const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
  const render = value => escape(value.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (!(key in facts)) throw new Error(`Missing release fact: ${key}`)
    return facts[key]
  })).replace(/`([^`]+)`/g, '<code>$1</code>')
  if (typeof facts.published !== 'boolean' || !/^\d+$/.test(facts.languages) || readmeLocales.length < Number(facts.languages)) {
    throw new Error('Release-preparation facts require review')
  }
  const noteKeys = ['security', 'privacy', 'engine', 'languages', 'recommendation', 'voice', 'microphone', 'web', 'optimization', 'interface', 'api', 'checks', 'limits']
  const preparedNotes = `<section class="notice" aria-labelledby="preparation-title"><h2 id="preparation-title">${render(copy.title)}</h2><p>${render(copy.status)}</p><p>${render(copy.interface)}</p><p>${render(copy.optimization)}</p><details><summary>${render(copy.details)}</summary><ul>${noteKeys.map(key => `<li>${render(copy[key])}</li>`).join('')}</ul><p><a href="${repository}/blob/main/docs/CHANGELOG.md">Notes 1.0.1</a> · <a href="${repository}/blob/main/SECURITY.md">Sécurité et limites</a></p></details></section>`
  const languageLinks = readmeLocales.map(({ filename, label }) =>
    `<a class="button" dir="auto" href="${repository}/blob/main/${filename}">${escape(label)}</a>`
  ).join('')
  let html = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="Novera, l’assistant IA indépendant de TRON-ABS. Novera 1.0.0 est disponible sur Windows, Linux, macOS et Android ; téléchargez la version officielle.">
<meta name="novera-pages-commit" content="${commit}"><title>Novera — Windows, Linux, macOS et Android</title>
<style>
.notice code{overflow-wrap:anywhere;word-break:break-word}.notice li{margin:10px 0}.creation-guide pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#0b101a;border:1px solid var(--line);border-radius:8px;padding:14px;font:inherit;font-size:.9rem;line-height:1.6}.creation-guide h3{margin-top:24px}.creation-guide summary{cursor:pointer}.creation-guide .card{min-width:0}
:root{color-scheme:dark;--ink:#f1f5fc;--muted:#b0bbce;--line:#29334a;--accent:#b9a3ff}*{box-sizing:border-box}body{margin:0;background:radial-gradient(ellipse at 85% 15%,#243043 0,transparent 42%),#0b101a;color:var(--ink);font:16px/1.65 system-ui,-apple-system,"Segoe UI",sans-serif}a{color:inherit}header,main,footer{max-width:1180px;margin:auto;padding:24px}header{display:flex;align-items:center;justify-content:space-between;gap:24px}header img{width:min(370px,60vw);height:auto}nav{display:flex;gap:20px;font-size:.9rem}nav a{text-decoration:none;color:var(--muted)}.hero{display:grid;grid-template-columns:1fr 1.18fr;gap:48px;align-items:center;padding:48px 0 30px}.label{display:inline-block;border:1px solid #67558f;background:#2a2141;color:#dfd1ff;padding:5px 13px;border-radius:100px;font-size:.8rem;letter-spacing:.04em}h1{font-size:clamp(2.4rem,4.5vw,4rem);line-height:1.08;letter-spacing:-.045em;margin:24px 0}p{color:var(--muted)}.lead{font-size:1.1rem;max-width:39em}.actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:28px}.button{padding:11px 18px;border-radius:10px;text-decoration:none;border:1px solid var(--line);font-weight:600;font-size:.94rem}.primary{background:#c0a8ff;color:#191128;border-color:#c0a8ff}figure{margin:0}figure img{display:block;width:100%;border-radius:17px;border:1px solid #4a5268;box-shadow:0 22px 70px #0006}figcaption{font-size:.78rem;color:var(--muted);margin-top:10px}.notice{border:1px solid var(--line);border-left:3px solid var(--accent);padding:20px 24px;border-radius:12px;margin:28px 0 38px;background:#101827}.notice p{margin:4px 0 0}.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.card{border-top:1px solid var(--line);padding:20px 0}.card h2{font-size:1.05rem;margin:0 0 8px}.card p{font-size:.94rem;margin:0}.numbers{font-size:.9rem;color:#b5a5da;margin:30px 0}footer{border-top:1px solid var(--line);margin-top:25px;padding-top:30px;padding-bottom:45px;font-size:.9rem}footer p{max-width:760px}.signature{color:var(--ink);font-weight:700}.signature span{font-weight:400;color:var(--muted)}a:focus-visible{outline:3px solid #deceff;outline-offset:5px}@media(max-width:780px){header{align-items:flex-start;flex-direction:column;gap:10px}.hero{grid-template-columns:1fr;gap:30px;padding-top:22px}.cards{grid-template-columns:1fr;gap:0}h1{max-width:12em}main{padding-top:0}}
</style></head><body>
<header><img src="assets/banner.png" alt="Novera — Knowledge for everyone"><nav aria-label="Navigation"><a href="${repository}">GitHub</a><a href="#community-title">Communauté</a><a href="${repository}/blob/main/README.md">English</a></nav></header>
<main><section class="hero"><div><span class="label">WINDOWS · LINUX · MACOS · ANDROID</span><h1>Novera 1.0.0 est disponible.</h1><p class="lead">Vous décrivez. Novera prépare, exécute et organise. Texte, images, musique et vidéo se retrouvent dans un même espace de conversation.</p><div class="actions"><a class="button primary" href="${repository}/releases/tag/v1.0.0">Windows x64 / Linux x64</a><a class="button" href="${repository}/releases/download/v1.0.0-macos/Novera_1.0.0_aarch64.dmg">Mac Apple Silicon · DMG</a><a class="button" href="${repository}/releases/download/v1.0.0-macos/Novera_1.0.0_x64.dmg">Mac Intel · DMG</a><a class="button" href="${androidDownload}">Android ARM64 · APK</a><a class="button" href="${repository}/releases/tag/v1.0.0-windows-arm64">Windows ARM64</a><a class="button" href="${repository}/releases/tag/v1.0.0-windows-portable">Windows x64 portable · USB</a><a class="button" href="${repository}/releases/tag/v1.0.0-cli-novera">Novera CLI</a><a class="button" href="${repository}/blob/main/README.fr.md">Découvrir le projet</a></div></div><figure><a href="${dashboardUrl}" target="_blank" rel="noreferrer" aria-label="Voir la capture originale en pleine résolution"><img src="${dashboardUrl}" alt="Capture réelle du nouveau tableau de bord Novera, avec une image créée et ses commandes de génération"></a><figcaption>Application Windows : capture réelle fournie par le mainteneur. Cliquez sur l’image pour voir le PNG original en pleine résolution.</figcaption></figure></section>
<section class="notice" aria-labelledby="workspace-title"><h2 id="workspace-title">Tableau de bord repliable : espace de travail maximal</h2><p>Repliez les réglages pour laisser toute la place à vos créations. La saisie, le microphone et les commandes principales restent accessibles. Dépliez le panneau pour retrouver vos réglages.</p><figure><a href="${collapsedUrl}" target="_blank" rel="noreferrer" aria-label="Voir le tableau de bord replié en pleine résolution"><img src="${collapsedUrl}" loading="lazy" alt="Novera : tableau de bord replié pour maximiser l’espace de travail et la visibilité de l’image créée"></a><figcaption>Capture réelle, PNG original sans réduction ni recompression. Cliquez pour la pleine résolution.</figcaption></figure></section>
<aside class="notice" aria-label="Disponibilité"><strong>Windows x64, Windows ARM64, Linux x64, macOS et Android ARM64 sont disponibles.</strong><p>Les installateurs Windows et l’AppImage Linux sont disponibles en version 1.0.0, avec des mises à jour signées. Windows ARM64 inclut le moteur texte CPU natif. La CLI Novera utilise désormais novera.exe sous Windows et novera sous Linux. Son nouveau canal signé est distinct des anciens paquets.</p><p>La version portable Windows x64 1.0.0 est disponible : discussions, réglages et modèles téléchargés restent dans son dossier Data. Extraire l’archive complète et ouvrir Novera.exe ; fermer Novera avant de déplacer le dossier ou d’éjecter la clé USB. <a href="${repository}/blob/main/docs/WINDOWS_PORTABLE.md">Guide portable et limites</a>.</p><p><strong>Android 1.0.0 est disponible en APK signé.</strong> Le mainteneur confirme le bon fonctionnement du build 1000012 sur son téléphone. L’APK est vierge : aucune conversation, aucun modèle téléchargé ni aucune clé API personnelle embarqués. Installez-le par-dessus la version existante pour conserver vos données. <a href="${repository}/releases/tag/${androidReleaseTag}">Publication Android et vérification</a>.</p><p>Pour les modèles locaux, un téléphone moderne avec suffisamment de mémoire est conseillé ; sur un appareil moins puissant, privilégiez un fournisseur API. Pour la recherche web, un contexte d’au moins <strong>16K tokens</strong> est conseillé. La taille de lot Android par défaut est <strong>512</strong>.</p><p><strong>macOS 1.0.0 est disponible en version officielle pour Intel (macOS 13+) et Apple Silicon (macOS 14+).</strong> Interface et couleurs communes aux versions Desktop ; tests automatiques réussis séparément sur les deux architectures. Sans signature Developer ID ni notarisation Apple ; essais visuels et MLX différés. Ouvrir le DMG puis copier Novera dans Applications. Si macOS bloque le premier lancement, aller dans Réglages Système → Confidentialité et sécurité → Ouvrir quand même pour Novera. <a href="${repository}/blob/main/docs/RELEASE_MACOS_1.0.0.md">Guide Mac et preuves</a>. iOS reste en préparation et n’est pas encore installable sur iPhone. <a href="${repository}/blob/main/docs/RELEASE_ANDROID_1.0.0.md">Suivi Android</a></p></aside>
${preparedNotes}
<section class="cards" aria-label="Le projet"><article class="card"><h2>Du premier message au résultat</h2><p>Conversation, recherche et création se suivent dans un tableau de bord commun.</p></article><article class="card"><h2>Local et cloud</h2><p>Les capacités locales dépendent du matériel et des modèles installés. Le cloud utilise les accès choisis par l’utilisateur.</p></article><article class="card"><h2>Un projet indépendant</h2><p>Sources ouvertes, documentation et disponibilité sont suivies sur le dépôt officiel TRON-ABS/Novera.</p></article></section>
<section class="notice" aria-labelledby="community-title"><h2 id="community-title">Novera évolue avec vous</h2><p>Le savoir pour tous, un avenir à construire ensemble. Partagez vos créations, vos modèles et vos réglages : vos expériences peuvent aussi aider les autres utilisateurs à trouver une configuration adaptée.</p><p>Un retour, une question, un problème ou une idée ? Nous sommes là pour vous aider. Indiquez si possible votre version de Novera, votre appareil et si vous utilisez un modèle local ou une API. Masquez les données personnelles ; ne partagez jamais vos clés API ou mots de passe.</p><p>Retrouvez les comptes officiels de Novera :</p><div class="actions" aria-label="Réseaux officiels de Novera">${socialProfiles.map(([name, url]) => `<a class="button" href="${url}">${name}</a>`).join('')}<a class="button" href="mailto:contact.novera.tronabs@gmail.com">Écrire à Novera</a></div></section>
${creationPromptGuide(repository)}
<section class="notice" aria-labelledby="languages-title"><h2 id="languages-title">La présentation dans ${readmeLocales.length} langues et variantes</h2><p>Consultez les README du dépôt avec les notes de préparation de la ${facts.release}. Les traductions assistées et variantes écrites nécessitent encore une relecture native.</p><details><summary>Choisir une langue</summary><div class="actions">${languageLinks}</div></details></section>
<p class="numbers">Sources ${facts.release} en préparation : ${facts.languages} langues d’interface · ${facts.providers} profils dont ${facts.cloud} fournisseurs cloud · ${facts.media} préréglages média · Apache 2.0</p></main>
<footer><p>Je vous souhaite à toutes et à tous une merveilleuse aventure avec Novera. Que votre curiosité ouvre de nouvelles portes, que vos idées prennent vie et que chaque création vous emmène un peu plus loin.</p><p class="signature">TRON-ABS<br><span>Mr Sachet Jean-Marc — Chercheur indépendant — France</span><br><span>The art of Human with AI</span></p><p>Merci à toutes les personnes qui contribuent à un monde meilleur. Par leurs découvertes, leur travail, leur entraide et leur transmission, elles nous ont permis d’en être là aujourd’hui.</p><p>Nous leur souhaitons le meilleur pour l’avenir, ainsi qu’à toutes celles et ceux qui poursuivent cet élan de partage et d’entraide.</p><p><small>Outil de développement : 🧠 Codex — GPT-6.1 Sol</small></p></footer></body></html>`
  if (published) {
    const report = `${repository}/blob/main/docs/RELEASE_1.0.1_2026-11-07.md`
    const androidSummary = facts.androidCurrentRelease?.deviceValidated === true
      ? `<strong>Android ${androidVersion} est disponible en APK signé.</strong> Le clavier et les langues d’interface ont été testés sur Huawei P20 avec le build ${androidVersionCode}. Installez l’APK par-dessus la version existante pour conserver vos données.`
      : render(publicationCopy.android)
    html = html.replace(/<p><strong>Android 1\.0\.0 est disponible en APK signé\.<\/strong>[\s\S]*?<\/p>/,
      `<p>${androidSummary} <a href="${repository}/releases/tag/${androidReleaseTag}">Publication Android et vérification</a>.</p>`)
      .replace(/https:\/\/github\.com\/TRON-ABS\/Novera\/blob\/main\/docs\/RELEASE_(?:MACOS|ANDROID)_1\.0\.0\.md/g, report)
      .replaceAll('1.0.0', facts.stable)
      .replace('notes de préparation de la', 'notes de version de la')
      .replace(`Sources ${facts.release} en préparation :`, `Version ${facts.release} :`)
    const portableVersion = facts.portableVersion ?? facts.stable
    html = html.replaceAll(`v${facts.stable}-windows-portable`, `v${portableVersion}-windows-portable`)
      .replace(`La version portable Windows x64 ${facts.stable} est disponible`, `La version portable Windows x64 ${portableVersion} est disponible`)
  }
  const distributionLinks = {
    windows: ['Windows x64 · EXE et MSI', ''],
    windowsArm: ['Windows ARM64 · EXE', '-windows-arm64'],
    linux: ['Linux x64 · AppImage et Debian', '-linux-x64'],
    macArm: ['macOS Apple Silicon · DMG', '-macos-arm64'],
    macIntel: ['macOS Intel · DMG', '-macos'],
    cli: ['Novera CLI', '-cli-novera'],
    portable: ['Windows x64 portable · ZIP', '-windows-portable'],
  }
  const publicDistributions = facts.publicDistributions ?? {}
  for (const [platform, version] of Object.entries(publicDistributions)) {
    if (!Object.hasOwn(distributionLinks, platform) || !/^\d+\.\d+\.\d+$/.test(version)) throw new Error('Invalid public distribution')
  }
  if (Object.keys(publicDistributions).length) {
    const currentVersion = publicDistributions.windows ?? facts.stable
    const buttons = Object.entries(publicDistributions).map(([platform, version]) => {
      const [label, suffix] = distributionLinks[platform]
      return `<a class="button" href="${repository}/releases/tag/v${version}${suffix}">${label} · ${version}</a>`
    }).join('')
    const androidButton = `<a class="button" href="${androidDownload}">Android ARM64 · APK · ${androidVersion}</a>`
    const pending = Object.keys(distributionLinks).some(platform => !Object.hasOwn(publicDistributions, platform))
    const earlier = pending ? `<a class="button" href="${repository}/releases">Versions précédentes</a>` : ''
    const androidEvidence = facts.androidCurrentRelease?.deviceValidated === true
      ? `Le clavier et le sélecteur de langue de l’APK Android ${androidVersion} (build ${androidVersionCode}) ont été testés sur Huawei P20.`
      : 'Le clavier et les 120 langues de l’APK Android 1.0.2 ont été testés sur Huawei P20.'
    html = html.replace('<h2 id="preparation-title">Novera', '<h2 id="preparation-title">Historique Novera')
      .replace(/<h1>Novera [\d.]+ est disponible\.<\/h1>/, '<h1>Télécharger Novera</h1>')
      .replace(/(<meta name="description" content="[^"]*?Novera )[\d.]+( est disponible)/, (_, start, end) => start + currentVersion + end)
      .replace(/<p class="numbers">[^<]+<\/p>/, `<p class="numbers">Novera ${currentVersion} · ${locales.length} langues et variantes d’interface · ${escape(facts.providers)} profils dont ${escape(facts.cloud)} fournisseurs cloud · ${escape(facts.media)} préréglages média · Apache 2.0</p>`)
      .replace(/<div class="actions"><a class="button primary" href="[^"]+">Windows x64 \/ Linux x64<\/a>[\s\S]*?<\/div><\/div><figure>/,
        `<div class="actions" aria-label="Téléchargements publics">${buttons}${androidButton}${earlier}</div></div><figure>`)
      .replace(/<aside class="notice" aria-label="Disponibilité">[\s\S]*?<\/aside>/,
        `<aside class="notice" aria-label="Disponibilité"><p>La version de chaque paquet figure sur son lien de téléchargement. ${androidEvidence} Sur macOS, consultez les instructions d’installation du DMG sur la page de sa version. iOS reste en préparation.</p></aside>`)
  }
  html = html.replace('<section class="cards"', `<section class="notice" aria-labelledby="web-title"><h2 id="web-title">Novera Web : préparation expérimentale</h2><p>L’interface et ses couleurs sont reprises de Desktop. Les essais locaux utilisent un contexte texte de 32k et une recherche Internet Exa sans clé, préparée dès l’activation, dans les limites du quota gratuit du fournisseur. Les créations image et musique locales sont testées ; Wan vidéo reste expérimental et n’est pas encore intégré à la conversation Web.</p><p>Les sources et résultats sont publics sur le dépôt. Le client Web n’est pas encore proposé comme service hébergé : audit de sécurité complet, licences du moteur et validations de publication restent à terminer. <a href="${repository}/blob/main/docs/WEB_BROWSER_PREPARATION.md">Fonctions, essais et limites de Novera Web</a>.</p></section><section class="cards"`)
  if (published && facts.webExperimentalPublished === true) {
    const start = html.indexOf('<section class="notice" aria-labelledby="web-title">')
    const end = html.indexOf('</section>', start) + '</section>'.length
    if (start < 0 || end <= start) throw new Error('Missing Web showcase section')
    html = html.slice(0, start) + html.slice(end)
    const webLanguageSummary = webVersion ? ` L’interface Web propose ${locales.length} langues et variantes.` : ''
    const hero = `<section class="notice" aria-labelledby="web-title"><h2 id="web-title">Novera Web ${webVersion ?? facts.release} · version expérimentale</h2><p>Retrouvez l’interface et les couleurs de Desktop directement dans votre navigateur. Texte local, contexte 32k, recherche Exa sans clé dans les limites du quota du fournisseur, essais image FLUX.2 Klein et musique ACE-Step avec vos fichiers Desktop.${webLanguageSummary}</p><p><a class="button" href="web/">Ouvrir Novera Web</a></p><p>Un navigateur récent compatible WebGPU et une mémoire suffisante sont nécessaires pour les modèles locaux. Le téléchargement du modèle texte représente environ 1,61 Go. Image et musique restent expérimentales ; les grandes images peuvent prendre plusieurs minutes ou échouer. Wan vidéo n’est pas encore intégré. Les services cloud facultatifs utilisent votre propre clé et peuvent être payants. Aucun serveur GPU ni crédit API n’est fourni. <a href="${repository}/blob/main/docs/WEB_BROWSER_PREPARATION.md">Guide et limites</a>.</p></section>`
    html = html.replace('<main>', '<main>' + hero)
  }
  fs.mkdirSync(path.join(output, 'assets'), { recursive: true })
  fs.writeFileSync(path.join(output, 'index.html'), html)
  for (const [source, target] of [['novera-banner-en.png', 'banner.png'], ['novera-dashboard-2026-11-07.png', 'dashboard.png'], ['novera-dashboard-collapsed-2026-11-07.png', 'dashboard-collapsed.png']]) {
    fs.copyFileSync(path.join(root, '.github/assets', source), path.join(output, 'assets', target))
  }
  const probe = { product: 'Novera launch information', commit, applicationPublished: false, publicDownloadsEnabled: true, desktopReleaseVersion: '1.0.0', cliReleaseTag: 'v1.0.0-cli-novera', cliExecutableNames: ['novera.exe', 'novera'], macosReleaseTag: 'v1.0.0-macos', macosOfficial: true, macosAppleNotarized: false, macosVisualTestsPerformed: false, androidStatus: 'maintainer-confirmed-public', androidReleaseTag, androidVersionCode: 1000012, androidDownloadUrl: androidDownload, htmlSha256: createHash('sha256').update(html).digest('hex') }
  Object.assign(probe, { preparedSourceVersion: facts.release, preparedVersionPublished: false, readmeLanguageCount: readmeLocales.length, preparedMediaPresets: Number(facts.media) })
  if (published) Object.assign(probe, { applicationPublished: true, desktopReleaseVersion: facts.stable, cliReleaseTag: `v${facts.stable}-cli-novera`, macosReleaseTag: `v${facts.stable}-macos`, preparedVersionPublished: true, androidVersionCode, androidStatus: facts.androidCurrentRelease?.deviceValidated === true ? 'maintainer-confirmed-public' : 'package-verified-device-pending' })
  if (published && facts.webExperimentalPublished === true && webVersion) {
    Object.assign(probe, { webVersion, webInterfaceLanguageCount: locales.length })
  }
  if (Object.keys(publicDistributions).length) {
    probe.publicDistributions = publicDistributions
    if (publicDistributions.windows) probe.desktopReleaseVersion = publicDistributions.windows
    if (publicDistributions.cli) probe.cliReleaseTag = `v${publicDistributions.cli}-cli-novera`
    if (publicDistributions.macIntel) probe.macosReleaseTag = `v${publicDistributions.macIntel}-macos`
  }
  fs.writeFileSync(path.join(output, 'pages-probe.json'), JSON.stringify(probe, null, 2) + '\n')
  return probe
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.length !== 4) throw new Error('Usage: node prepare-pages-site.mjs NEW_OUTPUT SOURCE_COMMIT')
  console.log(JSON.stringify(preparePagesSite(process.argv[2], process.argv[3]), null, 2))
}
