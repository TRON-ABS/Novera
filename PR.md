# Retire unused Jan website and distribution files — 25 October 2026

The repository still carried Jan's website, downloads, media and Flatpak recipe
alongside Novera. The installers defaulted to Jan distributions and the Flatpak
recipe built Jan v0.8.5. Remove those obsolete files and their dedicated
workflows, the old Japanese/Chinese Jan READMEs and an unused logo. Keep current
Novera Markdown documentation, API tests, attribution and all runtime code.
Document source CLI usage and the absence of a validated Novera Flatpak package.
Preserve historical dependency links against the pre-cleanup Git revision.

Validation: checked deletion scope, retained runtime references and file hashes,
local workflow/document links, all four ADK source excerpts and `git diff --check`.
The native test now follows the migrated Markdown paths; it was not executed.
GitHub Actions was confirmed disabled through the GitHub API. No application rebuild,
binary publication, CI activation or history rewrite. Existing unrelated local
changes are excluded from this publication. Details: [cleanup](docs/JAN_CLEANUP.md).

---

# Prepare opt-in PostHog error tracking — 25 October 2026

Add a separate default-off Error tracking control in Privacy, with explicit disclosures in all 36 locales and destination-scoped persisted permission. Existing analytics consent does not authorize exception collection. Remove the legacy blanket aggregate-data promises from the privacy screen because exception reports are individual events.

Capture unhandled frontend errors and promise rejections through the documented manual `$exception` API. Allowlist error types and numeric positions from the packaged main bundle, replace messages and filenames, omit causes/custom fields/functions, deduplicate and cap reports at ten per collector activation. Withdrawal removes listeners and aborts pending requests. No replay, SDK initialization, breadcrumbs, persistent identity or raw messages. Native crashes, caught React/router/provider errors and source-map resolution remain outside this implementation.

Validation: 44 targeted tests passed across eight files; TypeScript without emission and all 36 locale inventories passed. Network calls are mocked. Real EU project ingestion, WebView2 CORS and dashboard grouping remain unvalidated. Build launchers still clear destination variables. The maintainer authorized publishing these sources and documentation to main on 25 October 2026. Exclude the Git-ignored local EU token, executables and build artifacts; keep GitHub Actions disabled. No application build or real event transmission.

---

# Document the local PostHog EU project preparation — 25 October 2026

Record the maintainer-provided public project token in a Git-ignored local frontend environment file and use the documented EU ingestion origin. Keep the token out of documentation, user consent unchanged and the existing Desktop/Android launcher safeguards in place. No application compilation, real event transmission or remote publication is performed. Live project region and ingestion remain unvalidated.

Validation: Vite loaded the local EU destination and public project token successfully. All 30 targeted telemetry, consent and privacy tests passed across five files, using mocked network requests.

---

# Rename the local agent launcher for Novera — 25 October 2026

Rename the unused root launcher from jan-agent.sh to novera-agent.sh and update its usage text and documentation. Resolve the local CLI under its Novera name when available, preserving compatibility with the existing internal jan/jan.exe binaries. Keep default interactive-agent startup, argument forwarding and the src-tauri working directory. Fail clearly when no executable is available; never download or compile a CLI automatically. The Desktop application and embedded agent implementation are unchanged.

Validation: Bash syntax passed and 13 isolated checks passed using stub executables, including all four binary names, paths and arguments containing spaces, exit-code forwarding and the missing-binary error. The real agent was not started and the application was not compiled. Publish the rename and documentation only; GitHub Actions remains disabled.

---

# Publish current cloud providers, catalogs and official logos — 25 October 2026

Publish the source changes for 18 cloud providers and 57 chat presets, seven official bundled logos, Alibaba help in all 36 locales and maintenance documentation. Include the documented local cleanup without publishing or deleting distribution artifacts on GitHub. This update follows the already-published Jan banner removal.

Validation: 215 affected provider/catalog tests and 60 utility tests passed; TypeScript without emission passed after the logo change; 36 locales passed; 13 architecture files had no violations and 7 architecture tests passed. The earlier broad run had one provider-refresh fixture failure, corrected and covered by the final targeted run. Authenticated inference and the updated UI in a newly compiled executable remain unvalidated. GitHub Actions remains disabled. Executables, APKs, archives, caches, test profiles and credentials are excluded.

---

# Add official logos for the seven new cloud providers — 25 October 2026

The new cloud providers displayed fallback initials instead of their brand icons. Bundle official DeepSeek, Kimi, Alibaba Cloud, Cerebras, Together AI, Fireworks AI and Perplexity assets and wire them through the existing provider-logo lookup. Preserve the original asset bytes and document first-party sources and checksums in docs/PROVIDER_LOGOS.md. Existing avatar consumers pick up the icons without remote image requests or new UI strings.

Validation: 60 existing utility tests passed; all seven mappings and asset hashes checked; SVGs checked for scripts and external references. A local preview decoded all 28 image occurrences at 18/40 pixels on light/dark backgrounds and was visually inspected. No application compilation or remote publication was performed.

---

# Remove obsolete local generated artifacts — 25 October 2026

Remove 41 obsolete generated directories and two downloaded archives from local build experiments and older distributions, totaling 14,378,737,833 logical bytes. Keep current Desktop outputs, a previous timestamped Desktop distribution, the main Android APK, installed tools, source snapshots, user data and validation reports. All 43 removals succeeded; SHA-256 checks of the protected Desktop executables, main APK and installed JDK are unchanged. Record scope and future cleanup safeguards in docs/LOCAL_CLEANUP.md. No tracked source files were deleted and no build or remote publication was performed.

---

# Refresh cloud providers and chat model presets — 25 October 2026

The provider picker lacked seven services and shipped outdated model presets. Add DeepSeek, Kimi (Moonshot AI), Alibaba Cloud (Qwen), Cerebras, Together AI, Fireworks AI and Perplexity. Centralize the current chat shortlists and their capabilities; update existing providers against official catalogs. Keep Azure deployment names account-specific. Preserve persisted models, credentials, settings and deletion tombstones during startup merging.

Extend catalog refresh to the maintained compatible services, filter recognized non-chat endpoints, read published capabilities, deduplicate IDs and retain curated ordering when creation dates tie. Use the Responses adapter for Perplexity Agent models. Allow Alibaba workspace/region endpoints to be edited and translate the new help in all 36 locales. Record dated sources and compatibility limits in docs/CLOUD_PROVIDERS.md and update language coverage.

Document the future maintenance procedure and link it from NOVERA.md: verify official API IDs and capabilities, preserve user configuration, translate UI changes into all 36 locales, run relevant checks and record actual validation results.

Validation: 215 affected tests passed across 9 files; TypeScript without emission passed; 36 locale catalogs passed with 1,511 English keys; 13 architecture files passed with no violations and 7 architecture tests passed. The broader run recorded 5,111 passes, 2 skips and one refresh fixture failure before its correction; the corrected provider-route suite passes in the final targeted run. The 18 providers offer 57 chat presets. Public model catalogs were read without credentials; no paid inference requests were made. API account availability and end-to-end inference remain unvalidated. No application binary or remote publication is included.

---

# Remove the unused Jan banner — 24 October 2026

Remove the legacy root-level `JanBanner.png`, which is no longer referenced by the application or READMEs. Both READMEs already display the Novera banner. Update the asset-audit inventory and development dashboard. Reference checks passed; no application build was needed. Existing license files and upstream attribution are unchanged.

---

# Integrate the tested Android toolchain — 24 October 2026

Pin SDK 37.2, Build-Tools 37.0.0, JDK 27.0.1.0.3, NDK r30 (30.0.16248370), Gradle 9.8.1, AGP 9.4.0 and Kotlin 2.4.21 in one manifest. Reapply these choices to generated projects, migrate typed compiler options, align the Kotlin dependency exported by buildSrc and verify the actually loaded plugin. Adapt generated copies of Tauri Android modules after Cargo regenerates settings, preserving the Cargo registry. Use ExecOperations and consistent JVM targets; select the exact portable JDK without changing persistent environment variables.

Separate native engine caches by NDK, find the CPU backend in its actual install location and retain ELF alignment checks and notices. Keep the Android launcher disabled and mobile reviews open. Documentation records local compilation evidence, the newer-than-fully-supported JetBrains compatibility range and outstanding real-device validation. This source publication excludes Windows executables, APKs, local tool installations and release signing. GitHub Actions remains disabled. No application UI text is changed.

Validation: 3 Android configuration regressions passed; 70 launcher assertions passed under each of PowerShell 5.1 and 7; 7 architecture tests and 13 module files passed. The main generated project assembled successfully (111 tasks executed, 23 up-to-date). The maintained engine preparation script then rebuilt/staged the ARM64 engine successfully, followed by a package refresh with those outputs (6 tasks executed, 128 up-to-date). Actual Kotlin 2.4.21 and its standard library were checked. Native app library and frontend inputs were reused from the prior validated Android experiment; the disabled full APK entry point and real-device operation remain unvalidated. Earlier entries describe their historical state.

---

# Official Novera contact address — 24 October 2026

Display the maintainer-confirmed project address, `contact.novera.tronabs@gmail.com`, near the top of both repository READMEs with clickable email links. Record the same contact in project instructions, official channels and the development dashboard. Documentation-only change; address and links checked locally, without sending email or compiling the application.

---

# Build launcher, Android groundwork and device-neutral Hub label — 24 October 2026

The manual build launcher now exposes the distribution variants while enabling only Windows x64 Novera-Desktop. Android groundwork adds pinned tool resolution, Gradle initialization/configuration, an isolated ARM64 CPU worker, mobile storage/export adaptations and a lightweight onboarding model. Android builds remain disabled and gated on unfinished reviews; neither a complete APK nor inference on a phone has been validated. The Hub hardware-fit label is translated in all 36 supported languages.

Local validation: 5,103 web tests passed, 2 skipped; TypeScript no-emit and 36 locale catalogs passed; 70 build-launcher assertions passed under Windows PowerShell 5.1 and PowerShell 7; 7 architecture tests passed. The Android worker release build succeeded. No application binaries, SDK files, build logs or workflow changes are included. No remote CI, production signing or device validation is claimed. Earlier entries retain their historical status.

---

# Documentation Android actualisée — 24 octobre 2026

`docs/ANDROID_PREPARATION.md` décrit maintenant les outils installés, le projet Gradle généré, le contrôle Rust mobile réussi et le worker ARM64 compilé, à partir des scripts et journaux locaux. Il distingue ces validations de l'assemblage APK, des audits encore ouverts et des essais sur téléphone non réalisés. Mise à jour documentaire uniquement ; aucune nouvelle compilation ou publication.

---

# Hub : libellé adapté à tous les appareils — 24 octobre 2026

Le filtre « Adapté à mon matériel » remplace la référence au PC dans les 36 langues prises en charge, pour convenir aussi aux autres appareils. La clé `hub:discovery.adapted` et le fonctionnement du filtre restent identiques.

Validation locale : 42 tests ciblés réussis et contrôle des 36 catalogues sans erreur. Sources locales ; aucune compilation ni publication pour ce changement.

---

# Lanceur de compilation et préparation APK — 24 octobre 2026

Fichier Compiler-Novera.bat créé à côté du dépôt dans C:\msys64\home\jmsga, avec copie source dans scripts. Seule Novera-Desktop Windows x64 est activée. Setup NSIS/MSI, Portable, Windows ARM64, Linux, macOS, Android, iOS, Web et CLI restent désactivés. Les plans et diagnostics ne compilent rien ; les autres hôtes sont indiqués sans prétendre les compiler depuis Windows. Les builds Windows créent un nouveau dossier horodaté et gardent journaux/empreintes, sans remplacer le runtime existant ni copier les profils.

Préparation Android : diagnostic en lecture seule, point d’entrée APK ARM64 désactivé, contrôle des outils et du vrai projet Gradle, blocage des features desktop et des audits mobiles non terminés. Java et une partie du SDK sont présents ; NDK, Command-line Tools, cible Rust Android et initialisation/adaptation mobile restent à terminer. Aucun outil installé, projet généré, clé créée ou APK compilée. Les nouveaux scripts de développement ne modifient pas les textes de l’application.

Validation : 65 assertions sous Windows PowerShell 5.1 et 65 sous PowerShell 7, plans des 11 variantes, refus des 10 variantes désactivées et des arguments inconnus, syntaxe PowerShell, blocages Android, JSON et frontières réussis. BAT du dossier parent vérifié, même contenu que la source. Exécutable actuel inchangé. Documentation : docs/LOCAL_BUILD_LAUNCHER.md et docs/ANDROID_PREPARATION.md. Sources locales uniquement ; aucune compilation ou publication distante. Preuve : .build/build-launcher-2026-10-24-verification.json.

---

# Publication du Hub Novera — 24 octobre 2026

Mise à jour des sources du Hub sur la dernière base main : sélection de six petits modèles GGUF, classement selon la mémoire estimée, tri et filtres par taille, comparaison et test local annulable. Les scores des fabricants restent sourcés et séparés des mesures locales ; aucune vitesse fictive ni classement global de qualité. 29 textes ajoutés aux 36 langues. Documentation, inventaire et tests associés inclus. Exécutable compilé et démarrage isolé vérifiés localement ; aucun binaire, archive ou changement de workflow inclus. Les anciennes mentions « local » dans les entrées suivantes décrivent leur état au moment de la compilation.

Validation locale avant publication : 5 103 tests web réussis, 2 ignorés ; 72 tests ciblés, TypeScript sans émission, 36 catalogues et contrôles de frontières réussis. Les campagnes se recouvrent. Pas de benchmark matériel réel des six modèles, de parcours graphique exhaustif ni de CI distante exécutée. GitHub Actions, mises à jour automatiques et statistiques non configurées restent désactivés.

---

# Hub Novera : petits modèles et performances — 24 octobre 2026

Le Hub embarque six petits modèles GGUF aux révisions et tailles vérifiées. Le catalogue historique reste disponible ; le tri par défaut tient compte de la mémoire estimée et de la sélection Novera, avec un tri par poids et des filtres de taille. Comparaison de trois modèles, scores fabricant sourcés sans classement global artificiel, estimation mémoire et test local sur les variantes déjà téléchargées et lancées. Le test est annulable, limité à 128 jetons et une minute, sans outils ni historique de discussion ; débit calculé depuis les jetons réellement rapportés, mémoire du système explicitement distincte de la mémoire du modèle. Annulation au départ du Hub et en cas de génération concurrente.

29 nouveaux textes traduits dans les 36 langues ; contrôle imposé même aux catalogues partiels. Inventaire : 1 510 clés anglaises, Wu partiel à 753. Documentation : docs/HUB_DISCOVERY.md. Validation : 72 tests ciblés et suite complète **5 103 réussis, 2 ignorés**, TypeScript sans émission, 36 catalogues et frontières sans erreur. Pas de téléchargement des poids, de benchmark matériel des six modèles ou de validation graphique exhaustive revendiqué.

Compilation locale Novera-Desktop release réussie, démarrage isolé vérifié ; ancien exécutable sauvegardé et 29 fichiers de moteur/ressources conservés. Taille : 59610112 octets ; SHA-256 : `F68F779BF51E1B48BB066B49B1DED84207CC13A65619A09FA912B8D321C10795`. Preuves : `.build/novera-desktop-hub-2026-10-24/verification.json`. Aucun ZIP, installateur ou publication distante. Mises à jour automatiques et statistiques non configurées restent désactivées.

---

# Mise à jour des sources Novera — 24 octobre 2026

Périmètre de publication : corrections des infobulles et statistiques dans les 36 langues, recherche Internet active par défaut avec choix enregistré conservé, filtrage des protocoles outils et fermeture du menu de sauvegarde au clic extérieur ; préparation de mises à jour signées Novera et de statistiques consenties, sans activation. Les modules extraits, contrôles de frontières, scripts de distribution et documentation associés sont inclus. Exécutables, archives locales et changements de workflows sont exclus.

Validation sur la dernière base main publiée et les 164 fichiers sélectionnés : **5 053 tests web réussis, 2 ignorés** ; TypeScript sans émission réussi ; 36 catalogues sans erreur ; 13 fichiers contrôlés sans violation de frontière ; 10 tests Node réussis ; packaging : 223 assertions sur 12 scénarios réussies. Le build Windows local et son démarrage isolé ont été vérifiés avant cette publication. Aucune exécution CI, validation officielle, installation signée réelle ni validation interactive des dialogues natifs revendiquée. GitHub Actions reste désactivé.

---

# Compilation des infobulles et statistiques localisées — 24 octobre 2026

Compilation locale release de Novera-Desktop réussie avec les dernières traductions des actions dans les 36 langues, dates et statistiques localisées, recherche Internet active par défaut avec préférence booléenne enregistrée conservée. Validation des sources préalable : 86 tests ciblés et TypeScript sans émission réussis. Bundle web et compilation native réussis ; démarrage isolé vérifié pendant 10 secondes. Ancien exécutable sauvegardé, 29 fichiers de moteurs/ressources conservés. Taille : 59540480 octets ; SHA-256 : `4549FBB7B893BED432F02942B2F89B2F190D8C3833FD673DDFC1BF0D4F96BF9C`. Preuves : `.build/novera-desktop-message-actions-2026-10-24/verification.json`. Mises à jour et envois statistiques non activés. Aucun ZIP, installateur ou publication distante.

---

# Infobulles des messages dans les 36 langues — 24 octobre 2026

Sources uniquement, sans compilation demandée : infobulles cohérentes et libellés accessibles pour les petites actions sous les messages ; traduction des actions mémoire/régénération/reprise manquantes, des versions et de la confirmation de suppression. Jauge de statistiques accessible en modes compact et détaillé, unités/libellés et nombres localisés ; dates des messages suivant la langue de l’interface avec adaptation des identifiants de locale. 436 traductions ajoutées, couverture de cette zone assurée dans les 36 catalogues, inventaire mis à jour à 1 481 clés anglaises. Les autres lacunes historiques restent distinctes.

Recherche web : défaut explicitement activé, y compris après hydratation d’un ancien profil sans préférence ; une préférence booléenne enregistrée reste conservée. Aucun changement du profil utilisateur. Validation : 86 tests ciblés réussis, contrôle TypeScript sans émission, vérification des 36 catalogues sans erreur. Exécutable inchangé, aucune compilation native ou Vite et aucune publication.

---

# Recherche désactivée et fermeture du menu de sauvegarde — 24 octobre 2026

Le modèle pouvait imprimer des appels `google(...)` entre balises de protocole alors que la recherche était désactivée. Instruction hors ligne explicite, retrait des schémas web même en cas de collision MCP et filtrage pur des balises brutes dans le rendu, la copie, les conversions d’historique et les exports. Les fragments de protocole incomplets sont masqués ; les textes utilisateur et les exemples de code restent préservés. Aucun appel n’est exécuté depuis ce texte. Les outils web intégrés conservent leur garde d’exécution.

Le menu de sauvegarde est désormais non modal et son état contrôlé ; écoute en capture des clics et changements de focus extérieurs pour fermer le menu même quand un parent consomme l’événement. Les choix de format et le dialogue natif restent inchangés. Validation ciblée : 49 tests réussis ; TypeScript et architecture sans violation. Aucun nouveau texte d’interface à traduire.

Compilation locale Novera-Desktop release réussie ; ancien exécutable sauvegardé, 29 fichiers de moteurs/ressources inchangés. Démarrage isolé vérifié. Suite web complète : **5 012 tests réussis, 2 ignorés**. Taille : 59515904 octets, SHA-256 : `87B374AE4C9E7BF2213126D055BCA6FA805C77FAAD4FB608E62AFB77216AA3FE`. Preuves : `.build/novera-desktop-search-save-2026-10-24/verification.json`. La préparation précédente des mises à jour/statistiques est intégrée dans ce build avec activation désactivée ; aucune clé ni destination de production créée. Aucun ZIP, installateur ou publication distante.

---

# Préparation mises à jour signées et statistiques consenties — 24 octobre 2026

Sources locales : chemin de mise à jour Tauri séparé des statistiques, flux limité à GitHub Releases TRON-ABS/Novera et enregistrement du plugin conditionné à la configuration d’une clé publique. Builds ordinaires désactivés ; outil de configuration/manifeste NSIS x64 sans téléversement ni clé de production. Les téléchargements de modèles ne passent plus par le miroir Jan et son identifiant HMAC. L’installation garde la séquence téléchargement vérifié, arrêt, installation et reprise MCP en cas d’échec.

Politique choisie par le mainteneur : statistiques minimales avec accord explicite, sans destination configurée pour l’instant. Aucun envoi activé. Collecte préparée limitée à la version et au système, UUID renouvelé à chaque événement, sans profil, cookies, conversations ni identifiant persistant. Ancien consentement Jan non repris ; Google Analytics et initialisation SDK automatique retirés. Deux nouveaux textes traduits dans les 36 langues ; inventaire actualisé à 1 472 clés anglaises. Première clé et release signées, installation de départ, destination statistique et validation réelle restent à fournir avant mise en service. Documentation : docs/UPDATES_AND_TELEMETRY.md. Aucun exécutable recompilé ni workflow activé par cette préparation.

Validation locale : suite web complète **4 990 tests réussis, 2 ignorés**, puis 30 tests ciblés réussis après les derniers ajustements de consentement et de format de requête ; TypeScript réussi ; 36 catalogues sans erreur. Trois tests Node de préparation des releases réussis. `cargo check --offline --locked --release --lib` réussi ; deux tests de la politique Rust exécutés sur le fichier réel avec `rustc --test` et les dépendances release existantes (pas de suite native complète revendiquée). Bundle web construit sans script Google Analytics ; contrôle d’architecture sans violation. Pas de clé de production, de requête statistique réelle, de test d’installation signé ou de publication distante pour cette préparation.

---

# Mise à jour du dépôt Novera — 24 octobre 2026

Ensemble de publication : 62 fichiers pour les commandes de sauvegarde/suppression, leurs dépendances Conversations, les six icônes emoji, les textes des commandes dans les 36 langues, la règle de traduction obligatoire et la correction d’export sans réflexions ni traces d’outils. Base distante vérifiée : `b8e8c819f2ca9a9c97a06a991a0cffb7b35aea70` ; aucune PR équivalente ouverte. Les autres refactorisations et outils locaux restent hors de cet ensemble. Aucun binaire, artefact de compilation ou workflow CI inclus.

Validation sur une copie de cette base distante avec les seuls fichiers sélectionnés : **4 987 tests web réussis, 2 ignorés** (400 fichiers réussis, 1 ignoré), TypeScript `tsc -b` réussi et `python scripts/check-novera-locales.py` sans erreur pour les 36 catalogues. La compilation native et le démarrage isolé de l’application locale sont documentés ci-dessous ; les dialogues Windows réels ne sont pas présentés comme testés. Actions reste désactivé. Le journal de publication et les empreintes sont conservés localement sous `.build/repository-update-2026-10-24`.

---

# Export sans réflexions ni traces de recherche — 24 octobre 2026

La sauvegarde sérialisait les réflexions et les résultats bruts d’outils comme du texte. Tous les formats exportent désormais les messages utilisateur/assistant sans les parties de réflexion, appels/résultats d’outils ou métadonnées d’exécution. Les anciens blocs de réflexion intégrés au texte et les sections incomplètes sont filtrés ; les messages utilisateur, liens de la réponse et exemples de code restent préservés. La sélection de branche précède le filtrage des nœuds internes. JSON passe en version 2 avec contenu filtré, toutes les versions conversationnelles et identifiants actifs. Les données stockées restent inchangées.

Compilation locale interface et Novera-Desktop release réussie, exécutable remplacé après sauvegarde vérifiée. 29 fichiers de moteurs/ressources conservés identiques. Démarrage dans un profil isolé réussi ; dialogues natifs réels non testés. Taille : 59415552 octets, SHA-256 : `FC9396491B1A06B89AD662F68E553C7C561B56BBCA71990AD71EE87044F396B3`. Preuves : `.build/novera-desktop-clean-export-2026-10-24/verification.json`. Aucun ZIP ni installateur généré, aucune publication.

Validation locale : 46 tests ciblés réussis, dont 28 tests d’export (réflexions distinctes/historiques/incomplètes, outils et métadonnées, cinq formats, branches, liens, Unicode, code et absence de mutation). TypeScript et architecture vérifiés. Aucun nouveau libellé d’interface à traduire.

---

# Compilation Desktop avec icônes et traductions — 24 octobre 2026

Interface et cible Novera-Desktop recompilées en release Windows x64 avec les six icônes ⚙️ 🌐 💻 ⚡ 💾 🗑️ et les 77 traductions récemment complétées dans les 36 catalogues. Exécutable local remplacé après sauvegarde vérifiée ; 29 fichiers de moteurs et ressources conservés identiques. Taille : 59 415 552 octets. SHA-256 : `25A463A968BDE6F3FB8D4D8930E0F777EFAEE0BDB0EBD7139C2BFD78131A04B2`. Styles emoji et six symboles vérifiés dans le bundle web. Aucun ZIP ni installateur généré, aucune publication. Preuves : `.build/novera-desktop-emoji-2026-10-24/verification.json`.

---

# Six icônes emoji harmonisées — 24 octobre 2026

Sources locales : remplacement des icônes de réglages, recherche web, shell, raisonnement, sauvegarde et suppression par ⚙️ 🌐 💻 ⚡ 💾 🗑️. Composant décoratif partagé, boîte centrée de 20 px, police emoji de 18 px et boutons uniformes de 32 px. Infobulles, libellés accessibles, états actifs et comportements conservés ; aucun nouveau texte à traduire. Test de disponibilité de la recherche web adapté pour cibler le libellé accessible plutôt que l’ancien SVG. 67 tests ciblés réussis. Exécutable non recompilé pour ce changement.

---

# Traductions des commandes dans les 36 langues — 24 octobre 2026

77 traductions ajoutées : cinq textes de la barre de saisie dans 15 catalogues hérités (paramètres avancés, valeurs du modèle, remplacements de l’assistant, PDF et explication de l’export), et deux descriptions de suppression en wu. Les textes de ces commandes sont présents dans les 36 langues ; les autres lacunes historiques des catalogues partiels restent distinctes. Inventaire de couverture actualisé. Règle ajoutée dans CONTRIBUTING.md et docs/LANGUAGES.md : tout nouveau texte ou texte modifié doit être traduit dans toutes les langues prises en charge, y compris les catalogues partiels, dans la même modification. Le contrôle des langues impose désormais la présence des textes de ces commandes dans tous les catalogues. Sources uniquement, exécutable non recompilé avec ces dernières traductions.

Validation : `python scripts/check-novera-locales.py` réussi, 36 catalogues sans erreur ; 26 tests ciblés réussis (intégrité wu et commandes de discussion). Relecture native encore à effectuer.

---

# Compilation Desktop et placement des commandes — 24 octobre 2026

Disquette et corbeille déplacées immédiatement après Raisonnement dans le groupe d’outils de la barre de saisie, conformément à l’emplacement demandé. Elles suivent le menu de débordement sur les fenêtres étroites. Sauvegarde : choix du format puis dialogue natif de destination ; PDF via impression système. Suppression confirmée : suppression persistante de la discussion courante, nettoyage des messages/brouillons/pièces jointes/file/session et retour à l’accueil ; nouvel identifiant au premier envoi. Interface et cible Novera-Desktop uniquement recompilées en release Windows x64, puis exécutable local remplacé après sauvegarde vérifiée. 29 fichiers de runtime conservés identiques. Aucun ZIP ni installateur construit.

Validation locale : 70 tests ciblés réussis (ChatInput, ConversationActions, fichiers et impression), TypeScript et architecture sans violation. Exécutable : 59 411 456 octets, SHA-256 `E6F0BA8D6ADD1C33876534310A99338DE905066A65BE64167DC42AB20E9125B8`. Preuves : `.build/novera-desktop-buttons-2026-10-24/verification.json`. Dialogues Windows réels et rendu interactif restent à vérifier.

---

# Nouvelle compilation locale Novera 1.0.0 — 24 octobre 2026

Compilation locale autorisée par le mainteneur puis reprise après interruption du contrôle d’approbation. Extensions, icônes, interface et Rust release Windows x64 construits avec LTO fat. **4 975 tests web réussis, 2 ignorés**, TypeScript et architecture réussis. Nouvelles fonctions de langue, architecture et discussion incluses. Démarrage natif isolé : français détecté ; choix anglais injecté dans le stockage conservé après redémarrage. Aucun modèle chargé ni message envoyé.

Exécutable courant : 59 411 456 octets, SHA-256 `B682ADF50B626792CFBFA729C4D06B178D7A46B47FCB73063693A21B1C84D55B`. ZIP du nouveau build : 563 340 637 octets, SHA-256 `00377ea53501acfd30e78ed8cfafd8989e87514e9728877462feffda66c442ca`, 33 fichiers et empreintes vérifiés. Runtime précédent sauvegardé sous `Novera-Desktop-local-1.0.0-sauvegarde-2026-10-24_03-26-05` ; 32 fichiers courants vérifiés, 29 ressources/auxiliaires inchangés. Dialogues d’export/PDF, interface exhaustive, inférence et PC propre restent à vérifier. Les 96 tests natifs de l’ancien build n’ont pas été revendiqués comme relancés. Aucun commit, push, publication ni activation/exécution de CI. Preuves : `.build/novera-local-build-2026-10-24_03-26-05/verification.json`.

---

# Distribution portable Windows — adaptation Novera de #9302 — 24 octobre 2026

Notre contribution `feat(ci): restore Windows portable ZIP distribution` est adaptée aux sources Novera. Implémentation sous `scripts/distribution/`, point d’entrée compatible, commandes Yarn, licences, inventaire et empreintes SHA-256. Mode build et mode runtime déjà constitué, architectures/dépendances vérifiées, fichiers privés exclus et ZIP précédent conservé après entrée invalide. Canaux stable/beta/nightly ; chemins relatifs PowerShell corrigés.

**223 assertions / 12 scénarios réussis sous Windows PowerShell 5.1 et PowerShell 7** ; deux workflows Novera manuels vérifiés avec Actionlint, cinq scénarios de préparation CI sur fixtures et contrôles d’architecture réussis. Les workflows sont préparés avec l’autorisation explicite du mainteneur : lecture uniquement, sans secrets ni publication de release. Actions non activé, aucun workflow exécuté. Les anciennes étapes de publication n’ont pas été reprises.

ZIP de validation créé depuis l’exécutable du 23 octobre, sans recompilation : 33 fichiers, 563 309 417 octets, SHA-256 `477132753a9c3e29cac4f522ce114f4c20f48ed187ee1b5cf45baa8d852d7f75`. Contenu et empreintes contrôlés, démarrage depuis le ZIP extrait réussi avec profil isolé et PATH sans outils de développement. 32 fichiers de l’original et de sa sauvegarde recontrôlés. Les fonctions UI et langue récemment ajoutées ne sont pas incluses dans cet ancien binaire. PC propre et générations CPU/GPU restent à valider avant distribution.

Un test de préparation de canal a initialement touché deux configurations par chemins relatifs .NET ; les seules différences ont été vérifiées et les octets avant test restaurés. Les chemins sont maintenant absolus et les scénarios passent sans toucher aux configurations réelles. Aucun changement de binaire ou de données utilisateur. Aucun build, commit, push ou envoi de release. Documentation : `docs/windows-portable.md` ; preuves : `.build/novera-portable-2026-10-24/verification.json`.

---

# Commandes de discussion et paramètres avancés — 24 octobre 2026

Sources locales : accès aux paramètres avancés derrière la roue dentée, réinitialisation des remplacements d’échantillonnage sans effacer les autres paramètres ; style harmonisé des icônes Web Search/Shell/Raisonnement. Nouvelle disquette d’export Markdown/TXT/JSON/HTML/CSV et impression/PDF ; corbeille à sa droite avec confirmation, attente des écritures, suppression persistante puis remise à zéro de la discussion. Les autres discussions et les brouillons d’une navigation ultérieure sont conservés. Règles d’export isolées dans Conversations, accès fichiers/impression dans un adaptateur plateforme. Cinq nouvelles clés traduites en français et dans les 19 catalogues contribués ; inventaire de couverture mis à jour.

Validation : **4 975 tests web réussis, 2 ignorés**, TypeScript sans émission, 7 tests d’architecture et 12 fichiers sans violation, 36 catalogues de langue conformes ; styles traités avec Tailwind. Aucun exécutable construit, aucun push, aucune conversation réelle supprimée ; exécutable et sauvegarde inchangés. Dialogues natifs et impression réelle à vérifier dans le prochain build. Documentation : `docs/CONVERSATION_CONTROLS.md`. Preuves : `.build/composer-actions-2026-10-24/verification.json`.

---

# Sauvegarde et architecture modulaire — 24 octobre 2026

Sauvegarde complète vérifiée : `deliverables/Novera-Desktop-local-1.0.0-sauvegarde-2026-10-24_02-14-10`, 2026-10-24T02:14:10.004287+02:00 ; 32 fichiers, 1 086 921 999 octets. Original préservé. Extraction des politiques interface/conversations/moteurs/outils, adaptateurs de plateforme et de statistiques UI, outil de distribution séparé ; anciens points d’entrée compatibles. Carte `architecture/modules.json`, contrôleur et 7 tests de frontières. 4 941 tests web réussis / 2 ignorés ; contrôle TypeScript sans émission, 26 tests de titres finaux et fixtures de flux hors réseau réussis. Aucune dépendance ajoutée, aucun build ni push ; données utilisateur inchangées. La migration des anciennes couches reste progressive et ses limites sont documentées dans `docs/ARCHITECTURE.md`. Tableau de bord et A_FAIRE.md mis à jour. Preuves locales : `.build/novera-architecture-2026-10-24_02-14-10/verification.json`.

---

# Android / APK à prévoir — 24 octobre 2026

Création de `A_FAIRE.md` : feuille de route Android/APK, base existante, étapes de développement, validation de l’inférence locale et critères avant distribution. Référence ajoutée au tableau de bord principal. Planification documentaire uniquement, aucune compilation, aucun développement Android supplémentaire et aucune publication.

---

# Tableau de bord principal Novera — 24 octobre 2026

Création de `TABLEAU_DE_BORD_NOVERA.md` à la racine : état des sources/binaire, priorités, carte des fichiers essentiels, commandes, preuves locales et procédure de tenue à jour. Liens ajoutés dans NOVERA.md et les README anglais/français. Tous les chemins locaux du tableau sont vérifiés. Documentation uniquement, aucune compilation ni publication.

---

# Inventaire des dépendances — 24 octobre 2026

Création locale de `docs/DEPENDENCIES.md` : versions déclarées des 189 dépendances externes directes JS/TS et 112 Rust, composants internes, outils Python et annexes des versions indirectes verrouillées. Tous les verrous Yarn/Cargo détectés sont inventoriés ; les verrous alternatifs Bun de la documentation sont explicitement hors périmètre. Liens relatifs et comptes vérifiés. Aucune dépendance installée ou mise à jour, aucun build ni push. Preuves : `.build/dependency-inventory-2026-10-24/verification.json`.

---

# Détection initiale de langue publiée — 24 octobre 2026

Sources publiées sur main : https://github.com/TRON-ABS/Novera/commit/b8e8c819f2ca9a9c97a06a991a0cffb7b35aea70. 9 fichiers ; détection système uniquement sans langue enregistrée. Chaque changement manuel remplace la sauvegarde, réutilisée aux démarrages suivants. 4 937 tests web réussis / 2 ignorés, dont 141 tests ciblés ; TypeScript sans émission validé. Actions désactivé, aucun build ni exécutable publié ; exécutable local existant inchangé. Preuves : `.build/novera-language-publication-2026-10-24/verification.json`.

---

# Langue système au premier démarrage — 24 octobre 2026

Détection OS Tauri, repli navigateur et correspondance aux 36 catalogues lorsqu’aucune langue n’est enregistrée. Résultat sauvegardé, préférences existantes et choix manuels prioritaires ; pas de réinitialisation sur erreur de lecture. Traductions appliquées avant affichage. 141 tests ciblés réussis ; 4 937 tests web réussis / 2 ignorés ; contrôle TypeScript sans émission réussi. Modification locale uniquement, aucun build ni push ; l’exécutable 1.0.0 reste inchangé. Documentation : `docs/SYSTEM_LANGUAGE.md`. Preuves : `.build/novera-system-language-2026-10-24/verification.json`.

---

# Publication des sources Novera 1.0.0 — 24 octobre 2026

Publié sur main : https://github.com/TRON-ABS/Novera/commit/e08edb502de2c68bdd8271bb30b0304965ff4097. 159 fichiers modifiés ; les 35 corrections Windows et leur documentation sont publiées. Sources du build local vérifiées, version distante 1.0.0. Campagnes : 4 906 tests web réussis (2 ignorés), 96 tests natifs ciblés. Actions désactivé, 0 exécution. Aucun binaire, donnée utilisateur, journal local ou sauvegarde publié. Preuves : `.build/novera-v1-publication-2026-10-24/verification.json`.

---

# Novera Desktop 1.0.0 — compilation locale validée, 23 octobre 2026

Compilation locale autorisée après intégration des 35 PR Windows. Interface/TypeScript/extensions et Rust release LTO fat compilés. Exécutable : `deliverables/Novera-Desktop-local-1.0.0/Novera-Desktop.exe`. SHA-256 : `20D6D569802B435E9DF66F618FB94C14F1F28262DA4CF47593BD42E47BD8B35C`. Démarrage isolé 10 secondes validé ; 33 tests natifs de conversations et 63 tests natifs MCP/requêtes réussis. Le manifeste Windows manquant a été ajouté uniquement à une copie du lanceur de tests ; binaire produit inchangé. Ajustement TypeScript de getOptions().name optionnel ; 24 tests ciblés réussis. Les 4 906 tests web précédents restent une campagne distincte. Aucune génération de modèle, installation ou publication distante. Ancien 0.8.7 conservé. Preuves : `.build/novera-v1-local-2026-10-23/verification.json`.

---

# Novera 1.0.0 — quatrième et dernier lot Windows, 23 octobre 2026

Sources locales : #9335, #9334, #9333, #9332, #9331, #9329, #9328, #9327, #9326, #9325. 4 906 tests web réussis, 2 ignorés. Syntaxe Rust vérifiée ; tests natifs non exécutés car compilation suspendue. 35/35 PR Windows de l’inventaire intégrées aux sources, aucune restante. Linux #9346 et distribution/CI #9302 restent séparés. Exécutable 0.8.7 inchangé ; aucun build, commit ou push. Attendre une nouvelle autorisation avant compilation ou publication. Suivi : `docs/NOVERA_1_INTEGRATION.md`. Preuves : `.build/novera-v1-batch4-2026-10-23/verification.json`.

---

# Novera 1.0.0 — troisième lot de dix corrections, 23 octobre 2026

Sources locales : #9368, #9367, #9366, #9345, #9343, #9342, #9339, #9338, #9337, #9336. 4 853 tests web réussis, 2 ignorés ; syntaxe des deux fichiers Rust vérifiée par rustfmt, tests Rust non exécutés car compilation suspendue. Catalogues valides. 25 PR Windows intégrées aux sources au total, 10 restantes. Exécutable 0.8.7 inchangé ; aucun build, commit ou push. Suivi : `docs/NOVERA_1_INTEGRATION.md`. Preuves : `.build/novera-v1-batch3-2026-10-23/verification.json`.

---

# Novera 1.0.0 — deuxième lot de dix corrections, 23 octobre 2026

Sources locales : #9380, #9379, #9378, #9377, #9376, #9375, #9373, #9372, #9371, #9369. 4 800 tests web réussis / 2 ignorés ; catalogues vérifiés sans erreur. Adaptations du stockage ordonné, des fournisseurs et de la route préservent les changements locaux. 15 PR Windows intégrées aux sources au total ; 20 restantes. Exécutable local 0.8.7 inchangé ; aucun build, commit ou push. Consigne de suspension de compilation/publication maintenue. Suivi : `docs/NOVERA_1_INTEGRATION.md`. Preuves : `.build/novera-v1-batch2-2026-10-23/verification.json`.

---

# Novera 1.0.0 — premier lot de cinq corrections, 23 octobre 2026

Sources locales uniquement : #9330, #9340, #9341, #9364, #9365. 133 tests réussis (8 fichiers). Versions frontend/desktop/CLI et verrous synchronisés sur 1.0.0. Aucun build, commit ou push. Exécutable 0.8.7 inchangé. Restent 30 PR Windows à intégrer aux sources, et toujours 35 absentes de l’exécutable avant reconstruction. Consigne : suspendre compilation et publication durant l’intégration ; nouvelle autorisation requise pour reprendre. Suivi : `docs/NOVERA_1_INTEGRATION.md`.

---

# Modèle par défaut Novera — LFM2.5, 23 octobre 2026

LFM2.5-2.6B Q6_K proposé au démarrage : température 0,1 ; top-k 50 ; repeat_penalty 1,1 ; contexte 32768. Recommandation et contrôle mémoire indépendants du catalogue/cache Jan. Paramètres natifs enregistrés à l’import ; ancien override d’usine de l’assistant retiré avec garde sur les personnalisations.
238 tests ciblés réussis ; compilation optimisée et démarrage isolé validés. Poids du modèle non téléchargés. SHA-256 Novera-Desktop : `62714E4022A5A08D5012146F18FBE2D5869E28B1D584DA96D5290C89C35E8211`.
Rapport : `.build/novera-lfm-default-2026-10-23/summary.md`. Aucune publication distante.

---

# Jan supprimé — Novera optimisé validé, 23 octobre 2026

Installation, données Jan (effacement confirmé), caches, archive, raccourcis et 135 éléments temporaires supprimés. Gain mesuré après désinstallation : 10.30 Go.
Binaire final Novera-Desktop 0.8.7 : `deliverables/Novera-Desktop-local-0.8.7/Novera-Desktop.exe` ; LTO fat validée, empreinte identique au résultat compilé. Aucune fermeture de Novera imposée par le nettoyage.
Rapport : `.build/jan-removal-2026-10-23/summary.md`.

---

# Novera — compilation locale du 23 octobre 2026

Novera-Desktop 0.8.7 compilé et démarrage isolé vérifié ; 45 tests ciblés réussis.
Exécutable : `deliverables/Novera-Desktop-local-0.8.7/Novera-Desktop.exe`.
SHA-256 : `739A35C08AF7FC075D7303E17284E5B14090534CB25AD26D0C50125920F38A0B`.
Rapport : `.build/novera-desktop-local-2026-10-23/summary.md`.
Aucune publication ni installation. Les entrées ci-dessous décrivent leur état historique.

---

# Suivi de Novera et historique des contributions à Jan

## Identité et versions officielles protégées — 23 octobre 2026

Publié : [a2189ac6](https://github.com/TRON-ABS/Novera/commit/a2189ac67f835597e348b1c3fbf73c56ac425c40) — `docs(governance): protect Novera identity and official releases`. Politiques BRANDING.md et OFFICIAL_RELEASES.md, CODEOWNERS et liens README anglais/français/contribution publiés. Apache 2.0 inchangée. Quatre rulesets actifs : main et création des tags réservés au compte TRON-ABS ; réécriture/suppression de main et modification/suppression des tags bloquées. Immutabilité activée pour les futures releases. Contrôles relus par API, push normal du propriétaire réussi, CODEOWNERS sans erreur. Actions désactivé, zéro exécution. Aucune compilation ni publication de version. Aucun dépôt de marque effectué ; disponibilité non vérifiée. Preuves : `deliverables/novera-identity-protection-2026-10-23/`.


## Anciens caches locaux nettoyés — 23 octobre 2026

20 dossiers de caches Rust, Vite et Python supprimés : 5 869 782 601 octets de fichiers, environ 5,9 Go d’espace libéré. Exécutables et distributions existants, sources, dépendances installées, sauvegardes Git et rapports conservés. État Git des sources inchangé et jonctions de dépendances toujours accessibles. Aucune compilation ni exécution de tests. Bilan : `deliverables/novera-cache-cleanup-2026-10-23/cleanup.json`.


## Chemin local Novera réparé — 23 octobre 2026

Après renommage de `C:\msys64\home\jmsga\jan` en `C:\msys64\home\jmsga\Novera`, les 60 jonctions, 77 métadonnées Git, 2 164 fichiers opérationnels de `.build` et deux entrées PATH utilisateur sont réorientés. Les 39 worktrees et quatre magasins d’objets Git sont vérifiés ; résolution Vitest/TypeScript et métadonnées Cargo hors ligne validées. Sources et modifications locales conservées ; rapports historiques préservés. Aucune compilation, aucun test applicatif, aucun push. Voir `deliverables/novera-path-relocation-2026-10-23/summary.md`.


## Dépôt indépendant et présentation Novera — 23 octobre 2026

Choix utilisateur : sources actuelles avec historique neuf dans `TRON-ABS/Novera`, historique complet et 68 branches conservés dans `TRON-ABS/Novera-Jan-archive`. L’archive garde l’identifiant du dépôt d’origine. Le nouveau dépôt public est indépendant du réseau de forks. Aucun dépôt contenant l’historique du projet n’a été supprimé.

Présentation publiée en anglais et français, avec bannière Novera, mission d’accès au savoir, 36 locales, limites des traductions et feuille de route. Cliché publié : `67b31c278fcc4557be9cbef555336886b06ed7b2` — `feat: establish independent Novera source baseline`. Bannière anglaise approuvée et publiée après le transfert : [8fa3351](https://github.com/TRON-ABS/Novera/commit/8fa3351db88cbe030f3d24349aa2242f1eb5073e) — `docs: add Novera knowledge banner`. Deux commits neufs sur main. Publication réalisée uniquement par Git classique ; aucune copie côté serveur exécutée, conformément au dernier choix utilisateur. Les 68 branches de l’archive ont été comparées à la sauvegarde et sont intactes.

Vérifications statiques : 3 056 fichiers conservent leurs blobs et modes Git, seuls README.md et NOVERA.md changent ; README.fr.md et ROADMAP.md sont ajoutés. Licence inchangée. `python scripts/check-novera-locales.py --root <snapshot>` : 36 locales, 19 contributions intégrées, 1 463 clés anglaises, aucune erreur structurelle. Wu partiel ; relecture native et validation en fonctionnement encore nécessaires. Aucune compilation, aucun binaire ni installateur. Actions désactivé sur les deux dépôts.

Preuves locales : `deliverables/novera-page-2026-10-23/`, dont capture de la page GitHub rendue. Présentations anglaise et française vérifiées dans le navigateur, bannière « Knowledge for everyone. » visible ; zéro exécution Actions. Seul TRON-ABS figure parmi les collaborateurs du nouveau dépôt ; aucune clé de déploiement ni aucun webhook. Les expériences locales moteur, conversation et interface restent conservées sans être incluses dans cette publication.

## Toutes nos contributions de langues intégrées et publiées dans Novera — 23 octobre 2026

**Publié sur `TRON-ABS/Novera:main` : [03aab484](https://github.com/TRON-ABS/Novera-Jan-archive/commit/03aab484eaf0980b5ab68669c8ed1f0db7da493e) — `feat(i18n): publish Novera with 36 interface locales`.** Les 19 PR de langues conservées ont été intégrées : bengali, arabe standard, ourdou, pidgin nigérian, arabe égyptien, marathi, télougou, tamoul, swahili, haoussa, pendjabi occidental, tagalog, portugais du Portugal, cantonais, wu/shanghaïen, persan iranien, amharique, thaï et javanais. Les 17 locales héritées restent présentes, soit **36 choix de langue** avec les variantes régionales et écritures.

Les 18 nouveaux catalogues complets couvrent chacun **1 463 clés anglaises** ; le wu reste partiel, **706/1 463 clés**, avec repli anglais. Réconciliation de cinq clés de compatibilité entre branches et ajout des trois messages moteur manquants en bengali/arabe. Les corrections partagées de rechargement de langue et RTL sont réunies ; paramètres d’interpolation et littéraux de code conservés. Relecture par des locuteurs natifs encore nécessaire. Les langues de l’interface ne garantissent pas les capacités linguistiques des modèles.

Le [README public](https://github.com/TRON-ABS/Novera#interface-languages), [l’inventaire complet](https://github.com/TRON-ABS/Novera/blob/main/docs/LANGUAGES.md), le registre `docs/language-support.json` et le descriptif GitHub indiquent cette prise en charge. `SUIVI_LANGUES.md` marque nos contributions comme intégrées, en conservant les estimations historiques comme feuille de route. Les PR tierces ne sont pas intégrées.

La publication inclut l’identité Novera précédemment préparée, avec attribution et licence conservées. Le snapshot public part du `main` existant du dépôt ; nos modifications locales du moteur, des conversations et de l’interface restent intactes et ne sont pas publiées dans ce commit. Aucun changement de branche ni reset dans le dossier de travail principal.

**Validation exécutée :** `python scripts/check-novera-locales.py` et la même commande sur le snapshot public, zéro erreur ; analyse syntaxique TypeScript sans émission de 70 fichiers dans chaque copie, zéro erreur ; cohérence des configurations, de la cible de bureau, du verrou de dépendances, des langues RTL et de la licence ; diff Git vérifié et contenu de 450 fichiers contrôlé par empreinte. Commit et arbre distants identiques à ceux préparés.

**Aucune compilation, aucun contrôle de types, test d’exécution, installateur ou nouvelle version.** Les tests de régression des contributions sont conservés dans les sources mais non exécutés. GitHub Actions a été désactivé avant publication pour respecter la consigne : contrôle distant final **0 exécution Actions, 0 check CI** pour ce commit. Les mises à jour applicatives restent désactivées en attendant une distribution Novera signée.

Les envois GraphQL groupés ont échoué avec HTTP 499 sans créer de commit ; la publication finale utilise un commit Git standard et un push en avance rapide, sans réécriture de l’historique. Aucune signature GitHub vérifiée n’est revendiquée pour ce commit.

Preuves locales : [publication vérifiée](deliverables/novera-languages-2026-10-23/git-publication.json), [manifestes des 19 contributions](deliverables/novera-languages-2026-10-23/integration-manifest.json), [catalogues locaux](deliverables/novera-languages-2026-10-23/validation-local.json), [catalogues publiés](deliverables/novera-languages-2026-10-23/validation-publication.json), [syntaxe TypeScript](deliverables/novera-languages-2026-10-23/syntax-validation.json). Sauvegarde des fichiers locaux avant intégration : `.build/novera-languages-2026-10-23/local-before/`.

## Passage à Novera — 23 octobre 2026

À la demande de l’utilisateur, le dépôt public `TRON-ABS/jan` est renommé **[TRON-ABS/Novera](https://github.com/TRON-ABS/Novera)**. Le remote local `origin` pointe vers cette nouvelle adresse ; `upstream` reste une référence de lecture vers Jan. Novera reste un fork public.

**61 PR de TRON-ABS vers `janhq/jan` fermées**, sans fusion ni suppression des branches sources. Vérification finale directe des 61 PR et des SHA de leurs branches dans Novera : toutes fermées, tous les commits sources conservés. Les contributions déjà publiques ou fusionnées restent accessibles ; leur fermeture ne crée aucune exclusivité. Aucun nouveau dépôt privé. Les travaux des branches retirées ne sont pas automatiquement fusionnés dans la branche de travail.

**Sources locales préparées pour Novera** : nom produit et exécutable de bureau, textes de l’interface et traductions, documentation et liens du dépôt, notes de version, identité MCP OAuth, emplacement de données et espace de clés indépendants. Configuration de mise à jour officielle Jan retirée ; contrôles et installation automatiques désactivés côté bureau, canal de mise à jour CLI désactivé. Les paquets techniques hérités, les identifiants de compatibilité et les noms de modèles externes sont conservés. Le visuel robot existant est réutilisé.

**Aucune compilation, aucun lancement de l’application et aucun nouvel installateur.** Aucun push des modifications de sources, aucun commit et aucun déclenchement de CI effectués. Les workflows de publication hérités doivent encore être adaptés avant une première distribution Novera. Installation et données Jan existantes inchangées ; aucune migration de profil exécutée.

**Validation statique uniquement** : lecture JSON/TOML/plist, analyse syntaxique TypeScript sans émission (27 fichiers, zéro erreur), accord entre cible Cargo et configuration Tauri, licence conservée, clés de traduction préservées et séparation des mises à jour. Aucun contrôle de types, test Rust ou test d’exécution revendiqué.

Preuves : [inventaire et branches conservées](deliverables/novera-transition-2026-10-23/withdrawn-prs.md), [vérification GitHub](deliverables/novera-transition-2026-10-23/github-verification.json), [contrôles statiques](deliverables/novera-transition-2026-10-23/static-validation.json), [syntaxe TypeScript](deliverables/novera-transition-2026-10-23/typescript-syntax.json), [manifeste local](deliverables/novera-transition-2026-10-23/local-changes.json). Préservation des fichiers avant édition dans `.build/novera-transition-2026-10-23/before/`.

# Suivi actuel de Jan et des pull requests — 19 octobre 2026

## Suivi transversal du moteur — 22 octobre 2026

Création de `SUIVI_MOTEUR.md` à la demande utilisateur : synthèse des quatre campagnes, priorités proposées, liens vers preuves et harnais, critères de validation et tâches restantes. Les optimisations sont à implémenter ; les réglages installés restent inchangés. Prochaine piste proposée : M02, chargement hors du verrou global. Aucun commit ou nouvelle PR pour ce suivi.

## Mesure locale du décodage spéculatif — 22 octobre 2026

Demande : passer au test 4. Harnais `scripts/benchmark-engine-speculative.py`, rapport et données dans `deliverables/speculative-benchmark-2026-10-22/`. Tron Q6_K : architecture LFM2 2,7B, 266 tenseurs, aucun tenseur MTP/draft identifié, configuration mtp_layers=0 ; aucun draft compatible trouvé dans les emplacements vérifiés. Test des variantes ngram-map-k (longueurs 4/8/16) contre baseline, sans téléchargement, modification de Jan, commit ou PR. 72 générations retenues (36 raisonnement normal, 36 réponse directe préfixée), trois mesures par tâche/profil/mode, 24 sorties propres de workers, 256 tokens générés par mesure et zéro token de prompt réutilisé. Spéculation réelle vérifiée par `/slots[].speculative` et compteurs draft_n/draft_n_accepted. À longueur 8 en réponse directe : prose 120 → 119 tokens/s, code 121 → 125, copie répétitive 128 → 430 (×3,37), acceptations 4,2 / 7,1 / 91,2 %. Sur la copie, textes identiques à la référence pour les trois répétitions de tous les profils ; prose/code différents, aucune équivalence de qualité établie. Le template Tron ignore enable_thinking=false et ouvre toujours `<think>` : la réponse directe testée préremplit explicitement `<think></think>` et deux sauts de ligne, sans changer le template installé. `/props` décrit les paramètres par défaut des requêtes, pas l'état spéculatif réel du slot ; deux essais de mise au point exclus sont documentés. MTP/EAGLE/DFlash/DSpark non évalués, variantes n-grammes non exposées par le générateur de presets actuel de l'interface. Artefacts natifs : `.build/speculative-2026-10-22/validated/` et `direct-prefixed/`. Aucun profil ou conversation utilisateur modifié.

## Mesure locale des réglages GPU et batching — 22 octobre 2026

Demande : passer au test de performance 3. Aucun changement du moteur ou des réglages installés, commit ou nouvelle PR. Harnais `scripts/benchmark-engine-tuning.py` (réutilise le gestionnaire de worker de `benchmark-engine-load-lock.py`) ; rapport et données dans `deliverables/engine-tuning-benchmark-2026-10-22/`. Tron Q6_K, RTX 5070 Laptop, contexte 8 704, un slot, cache de prompt et décodage spéculatif désactivés. Sept profils Flash Attention/batch/microbatch/KV f16-Q8-Q4, 63 mesures exploratoires ; confirmation référence 512/512 contre 2 048/2 048 avec 24 mesures, six par taille/profil. 87 générations de 128 tokens et 27 sorties propres de workers validées. À 8 192 tokens : TTFT médian 1 623 → 1 376 ms (−15,2 %), préfill 5 161 → 6 083 tokens/s, génération 112,1 → 121,2 tokens/s (+8,1 %, variabilité des plages), snapshots VRAM globale +282 MiB. Douze sorties de confirmation à 8 192 tokens identiques par empreinte de texte ; deux sorties distinctes à 2 048 tokens, aucune évaluation de qualité. Flash off et microbatch 128 défavorables au long prompt ; Q8/Q4 économisent de la mémoire sans gain de vitesse clair dans la matrice. Fréquences GPU variables, VRAM globale relevée après réponse et non pic par processus ; pas de généralisation à d'autres modèles/matériels. Journaux et configurations : `.build/engine-tuning-2026-10-22/` et `.build/engine-tuning-2026-10-22-confirm/`. Profil et conversations utilisateur inchangés.

## Mesure locale du verrou de chargement — 22 octobre 2026

Demande : passer au test de performance 2 (chargement sous verrou global). Aucun correctif, commit ou nouvelle PR. Harnais `scripts/benchmark-engine-load-lock.py`, rapport et données dans `deliverables/load-lock-benchmark-2026-10-22/`. Deux alias Tron Q6_K : A GPU déjà résident, B CPU en chargement, contrôle B dans un worker séparé ; sept répétitions par mode, ordre alterné. 14 essais, 168 probes HTTP, 42 générations de 16 tokens validées, deux workers arrêtés avec code 0. TTFT A : 37,2 ms avant chargement partagé, 930,3 ms pendant ; contrôle séparé 38,4 / 39,0 ms. `/models` passe de 20,6 à 907,7 ms, avec réponse à moins de 0,25 ms du retour de B sur les sept essais partagés ; la route HTTP sans registre reste à environ 21 ms. Attribution cohérente avec le mutex conservé pendant `reg.acquire`/initialisation native, sans chronométrage interne du mutex. Journaux et configurations : `.build/load-lock-2026-10-22/`. B CPU évite la contention GPU/GPU mais ne la représente pas ; worker précompilé, cache Windows non vidé. Profil et conversations utilisateur inchangés.

## Mesure locale du cache KV — 22 octobre 2026

Demande : commencer les mesures de performance du changement de conversation. Aucun correctif de l'engine, commit ou nouvelle PR. Ajout du harnais reproductible `scripts/benchmark-kv-cache.py` et du rapport `deliverables/kv-cache-benchmark-2026-10-22/report.md`, avec données vérifiées dans le fichier `results.json` voisin. Worker local précompilé b11721, Tron Q6_K, RTX 5070 Laptop ; 84 mesures de confirmation, sept répétitions par scénario et taille, ordre des workers inversé après un premier essai exploratoire. À 8 192 tokens, TTFT médian : résidence 19,5 ms, retour disque 187,3 ms, recalcul 1 585,6 ms. Réutilisation validée par les compteurs natifs, deux workers arrêtés avec code 0. Les durées de sauvegarde et restauration ne sont pas isolées ; les lectures peuvent bénéficier du cache Windows. Piste à éprouver ensuite : plusieurs slots résidents avec budget mémoire. Configurations, journaux et états de test : `.build/kv-cache-2026-10-22-confirm/`. Profil et conversations utilisateur inchangés.

## Consigne permanente — Faciliter la revue des PR — 20 octobre 2026

Pour chaque PR créée ou mise à jour, faciliter la revue avec :

- **Une reproduction courte** : prérequis et étapes minimales permettant de constater le problème.
- **Une preuve avant/après** : comportement observé avant correction et résultat obtenu après, avec test de régression, journal ou capture pertinent.
- **Les résultats des tests** : commandes exécutées, résultats obtenus et limites de la validation ; distinguer les contrôles locaux des résultats CI.
- **Les dépendances entre PR clairement indiquées** : liens vers les PR concernées, ordre de fusion nécessaire et chevauchements ou conflits connus ; préciser l'absence de dépendance lorsqu'elle a été vérifiée.

Ces éléments doivent figurer dans la description de la PR et être tenus à jour avec le correctif. Les preuves détaillées restent référencées dans ce fichier de suivi.

## Test du compteur portable selon la locale — PR #9361 — 20 octobre 2026

**PR publiée et ouverte : [#9361 — fix(tokens): respect the runtime locale in exact count tests](https://github.com/janhq/jan/pull/9361)**, vers `main`, depuis `TRON-ABS:codex/fix-token-counter-locale-test`. Base officielle recontrôlée `8c0615520239ba668717c20dd3a1b0733549b8f3`. Une seule assertion modifiée dans `web-app/src/components/__tests__/TokenCounter.test.tsx` : attente formatée selon la locale, sans normaliser les espaces Unicode. Le rendu du composant est inchangé. Reproduction sur le test officiel sous `fr-FR` : 19 réussites/1 échec avant, 20/20 après. Recherche de doublons renouvelée avant publication ; #8256 concerne les traductions du composant et ne modifie pas ce test. Aucune dépendance de fusion, aucune issue fermée automatiquement.

Commit GitHub signé et vérifié : `51728d1e6699cba686769debec8025090fbc5d1e`. Diff distant vérifié : un fichier, trois lignes ajoutées et une supprimée ; contenu distant identique au correctif relu. PR attachée au chat, prête pour revue. Au contrôle : aucune revue, aucun check-run, statut agrégé `pending`, aucune fusion. Validation locale uniquement, aucune validation anglaise ou CI annoncée. Preuves : `deliverables/pr-audit-v0.8.7/` (`preflight.json`, `reproduction.json`, `published.json`, `verification.json`, `commit-status.json`, description anglaise et journaux).

## Vérification des PR après résolution des échecs v0.8.7 — 20 octobre 2026

Audit distant en lecture seule sur main `8c0615520239ba668717c20dd3a1b0733549b8f3`. La limite des pages web est déjà couverte par **#9283, fusionnée** ; **#9321, ouverte**, porte déjà notre contribution DuckDuckGo et conserve cette limite dans son diff. L'import Cowork est présent dans main ; la migration des URL et la garde du nom de l'assistant corrigent des différences propres à notre variante. Les ajustements Hub/avatar/fournisseurs restent locaux. Un seul nouveau candidat relevé : rendre le test `TokenCounter` portable selon la locale. Défaut confirmé sur le test officiel en `fr-FR` : 19 réussites/1 échec avant, 20/20 après. Aucune PR équivalente trouvée ; #8256, ouverte, touche les traductions du composant sans corriger le test. Aucune validation anglaise revendiquée. Aucune publication ou modification de PR effectuée. [Audit et preuves](deliverables/pr-audit-v0.8.7/audit.md), [description proposée en anglais](deliverables/pr-audit-v0.8.7/token-counter-pr.md).

## Contrôle local après fusion de v0.8.7 — 20 octobre 2026

La référence `v0.8.7` est incluse dans `HEAD`, sans conflit restant. Erreurs TypeScript corrigées (import `HeaderPage` manquant dans Cowork, import inutilisé et limite de sortie DuckDuckGo ignorée), chargement des anciens assistants sans nom protégé. Les 29 échecs restants sont résolus : migration des URL historiques des fournisseurs corrigée, fixtures de moteurs locaux et tests des personnalisations actualisés, format numérique français pris en charge dans le test du compteur. TypeScript et build web Vite finaux réussis ; compilation de l'extension assistant réussie ; compatibilité Rust 9/9 lors du contrôle précédent ; suite Vitest complète finale **4 783/4 783, 377 fichiers, aucun échec ni test ignoré**. Tests DuckDuckGo 15/15, extension assistant 20/20, Cowork 11/11. Les scénarios du dialogue distant supprimé ont été remplacés par des vérifications des moteurs locaux. Validation locale uniquement. Rapport : [deliverables/control-v0.8.7-2026-10-20.md](deliverables/control-v0.8.7-2026-10-20.md).

## Crash du tray Linux au démarrage du serveur API — PR #9346 — 20 octobre 2026

**PR publiée et ouverte : [#9346 — fix(linux): keep Jan running when AppIndicator is unavailable](https://github.com/janhq/jan/pull/9346)**. Sujet retenu : [#9286](https://github.com/janhq/jan/issues/9286), qui rapporte la fermeture complète de Jan après le démarrage réussi du serveur API dans Flatpak, faute de bibliothèque AppIndicator. Le code est encore présent sur la tête officielle `main` contrôlée par API, `648e8da55438150ccfab78808fa97a7a8e458c9f` du 19 octobre. Recherche actualisée sur les PR ouvertes et fermées pour `9286`, `appindicator`, `tray`, `tray panic` et `tray crash` : aucune correction équivalente trouvée.

**Correction :** vérifier le chargement des quatre noms de bibliothèque utilisés par `libappindicator-sys` avant de créer le menu ou le tray, et retourner une erreur normale si aucun ne se charge. Garder le handle pendant la construction pour que le backend conserve sa propre référence. Le serveur déjà lancé continue ; l'échec facultatif est journalisé, y compris au démarrage avec tray permanent. Sans tray réellement créé, fermer la fenêtre quitte normalement au lieu de cacher Jan sans accès à la fenêtre. Documentation de dépannage actualisée ; dépendance `libloading` déjà présente, aucun nouveau paquet.

**Reproduction et preuve avant/après :** dans un environnement Linux/Flatpak sans les bibliothèques Ayatana/AppIndicator, charger un modèle puis démarrer le serveur API. Le journal de l'issue montre le serveur à l'écoute puis la panique de `libappindicator-sys` ; la source officielle entre dans le constructeur sans vérification préalable. Après correction, les tests locaux du véritable chargeur retournent `NotFound` sans panique pour les quatre noms absents et vérifient les chargements de repli. **5 tests réussis**, formatage du nouveau module et `git diff --cached --check` réussis, compilation `cargo check --offline --locked --release --manifest-path .build/thread-atomic/src-tauri/Cargo.toml --lib` réussie sur Windows. Deux avertissements AMD de nommage préexistants restent. Aucun lancement Linux/Flatpak, test HTTP du serveur ou essai visuel de fermeture n'est revendiqué. Le correctif vise les bibliothèques absentes ; les symboles incompatibles et fautes natives d'initialisation restent hors périmètre.

**Dépendances et publication :** branche indépendante `codex/fix-optional-linux-tray`, créée directement depuis main ; aucun prérequis ni ordre de fusion. #8990 concerne les bibliothèques du worker. #7278 partage `src-tauri/src/lib.rs` mais modifie l'initialisation graphique Linux plus tôt dans le fichier ; chevauchement de fichier signalé dans la description. Commit GitHub signé `3c36a9cdcd75e79802a6b91b3ce2a1265df01639`, arbre `aa057449fb931733471aa2b40ef6a3430cce86fa` identique à l'index testé. Les quatre fichiers et la description distante ont été vérifiés, la PR est attachée au chat et le checkout local est aligné et propre. Au contrôle : aucun check-run, statut agrégé `pending`, fusion `blocked` ; aucune approbation ni fusion annoncée.

**Accès rétabli :** l'exécution du script GitHub avec élévation retrouve bien le compte `TRON-ABS` et les droits d'écriture du fork. L'absence d'identifiant observée dans le bac à sable lors de la tentative Luna ne constituait donc pas un blocage général de publication. Aucun changement de l'application installée ou des données utilisateur.

Preuves : `.build/priority-fix/` (`main.json`, `issues.json`, `pulls.json`, `duplicate-search.json`, `final-duplicate-audit.json`, `tests.log`, `native-check.log`, `final-native-check.log`, `harness/`, `tray-pr.md`, `tray-spec.json`, `tray-published.json`, `verification.json`). La description de PR contient la reproduction, le journal avant correction référencé, les commandes réellement exécutées, le harnais reproductible, les dépendances et les limites de validation.

## Relais pour Luna — Choix d'un nouveau correctif et publication — 20 octobre 2026

**Demande utilisateur :** choisir un nouveau bug encore ouvert, vérifier les contributions existantes sur <https://github.com/janhq/jan/pulls>, corriger un défaut encore présent et publier une PR. L'utilisateur a confirmé cette demande après la PR #9345. Sa dernière instruction est de consigner ici toutes les informations utiles pour guider Luna. **La tentative précédente n'a produit aucun correctif, aucun test, aucun commit et aucune nouvelle PR.** Les résultats des PR précédentes restent historiques et ne constituent pas une validation de ce nouveau travail.

### Erreur de base identifiée pendant le relais

La tentative précédente a inspecté `upstream/dev` local, SHA `d0b10c50a0dafaab452443f9537fcc5591195aee`, puis en a extrait une copie. **Ce commit date du 28 août 2026**, malgré la date de consultation en octobre. Il ne faut pas le confondre avec la base officielle `main` utilisée pour les contributions récentes : `648e8da55438150ccfab78808fa97a7a8e458c9f`, datée du **19 octobre 2026** (`fix(macos): explain why Jan asks for Local Network access (#9318)`). Le `origin/main` local observé dans `.build/thread-atomic` pointe encore sur `a86d87ebcfb7eb542dbc548cd3a5936b4650c3c6` du 16 octobre : le nom d'une référence locale ne garantit donc pas sa fraîcheur.

**Contrôle effectué pendant ce relais :** sur `648e8da…`, `src-tauri/src/core/system/commands.rs` ne contient ni `add_to_path_windows`, ni `remove_from_path_windows`, ni `install_jan_cli_sync`. `extensions/llamacpp-extension/src/index.ts` précise aussi que le moteur est embarqué et qu'il n'y a plus de sélection de backend. Les deux candidats ci-dessous ne doivent donc pas être retenus sur la seule foi de leur statut « Open ». Recontrôler la tête distante officielle avant toute nouvelle sélection.

### Sujets déjà examinés

| Sujet | Observation GitHub lors de la tentative | Décision pour la reprise |
| --- | --- | --- |
| [#9101 — Windows sandbox / erreur 203](https://github.com/janhq/jan/issues/9101) | La page directe affiche **Closed**, résolu par [#9129](https://github.com/janhq/jan/pull/9129). | Écarté : ne pas refaire ce correctif. |
| [#9091 — CUDA 13 choisi sur GPU Pascal](https://github.com/janhq/jan/issues/9091) | La page consultée affiche **Open**, sans PR dans « Development ». La recherche web n'a pas trouvé de PR correspondante. | Ancien sélecteur absent de la base `main` contrôlée. Le statut ouvert et l'absence de lien ne prouvent ni la persistance du défaut ni l'absence de correction. |
| [#9093 — Sélecteur de pièces jointes macOS](https://github.com/janhq/jan/issues/9093) | La page affiche **Open** et référence [#9205](https://github.com/janhq/jan/pull/9205). | Examiner cette PR avant toute intervention ; ne pas dupliquer. |
| [#9096 — PATH Windows du CLI, préfixe verbatim et type du registre](https://github.com/janhq/jan/issues/9096) | La page affiche **Open**, sans PR dans « Development », mais cite déjà `b5dd5c2` et le backport `4397d1a`. Son texte précise que l'auto-installation a été retirée de `main`. | Le dernier message de la tentative l'avait retenu trop tôt. Le code fautif existe dans l'ancien `dev`, mais est absent de `648e8da…`. Une éventuelle réparation du PATH historique serait un autre périmètre, à justifier et vérifier séparément. Aucun code de réparation n'a été écrit. |
| [#9092 — `jan serve` et authentification 401](https://github.com/janhq/jan/issues/9092) | La page affiche **Open**, assignée à `thinhlpg` depuis le 9 octobre. | Simple piste consultée, sans reproduction ni audit complet des contributions associées. |

**Limite des contrôles GitHub précédents :** le moteur web a servi des pages mises en cache (liste des PR annoncée comme datant de trois jours ; certaines issues de six jours). La requête filtrée `/pulls?q=is%3Apr+is%3Aopen+9101` a échoué avec « Cache miss ». Aucune liste exhaustive et fraîche de toutes les PR n'a été obtenue. Le panneau « Development » peut être vide malgré une PR ou des commits liés. Actualiser les états via un accès GitHub disponible et rechercher les PR ouvertes **et fermées**, les commits et les mots clés avant de conclure à l'absence de doublon.

### Dépôts et artefacts laissés par la tentative

- **Dossier principal :** `C:/msys64/home/jmsga/jan`, branche `update-llamacpp-b11681`, HEAD `6f0bbf0e6e30951a82150c6428d9e1605259abdd`. Il contient de nombreuses modifications et personnalisations préexistantes. Les préserver ; ne pas faire de reset, de nettoyage global ou de commit de tout le dossier. Remotes : `origin` = `TRON-ABS/jan`, `upstream` = `janhq/jan`.
- **Checkout existant pour les contributions :** `C:/msys64/home/jmsga/jan/.build/thread-atomic`, vérifié propre pendant ce relais, branche `codex/fix-concurrent-memory-saves`, HEAD `9d2647a207e607f748a3cbce473a46889b4aaf48` correspondant à #9345. Il contient la base `648e8da…`. Suivre les procédures des contributions précédentes pour réutiliser ce checkout et préserver toutes les branches déjà publiées.
- **Worktree géré créé par la tentative :** `C:/Users/jmsga/.codex/worktrees/pascal-backend/jan`. Création et attachement confirmés par les outils de l'application ; `git worktree list --porcelain` le voit en HEAD détachée sur `d0b10c50…`. Les commandes du bac à sable n'ont pas réussi à y travailler : « Permission denied » ou « this operation must be run in a work tree ». Il est hors des racines d'écriture annoncées pour cette session. Aucun correctif n'y a été enregistré. Ne pas recréer aveuglément le même worktree ; vérifier les accès et les pièces jointes de la conversation avant utilisation ou archivage.
- **Copie extraite dans le workspace :** `C:/msys64/home/jmsga/jan/.build/pascal-auto-backend`. Issue d'un `git archive upstream/dev`, suivie de `git init`. Le dépôt interne est sur `master` **sans aucun commit**, avec tous les fichiers non suivis. Cette copie n'est pas une branche de contribution prête à publier et son contenu est ancien. Ne pas la confondre avec un clone récent de `main`.
- **Archive source :** `C:/msys64/home/jmsga/jan/.build/pascal-source.tar`, 279736320 octets, issue du même ancien `upstream/dev`. Aucun nettoyage de ces artefacts n'a été effectué pendant le relais.

### Blocages observés et voies de reprise

1. `git worktree add -b codex/fix-pascal-backend-selection .build/pascal-auto-backend upstream/dev` a échoué lors de la création de `.git/refs/heads/codex/fix-pascal-backend-selection.lock` : **Permission denied**. Le contexte du bac à sable annonce `.git` en lecture seule. Cela décrit l'accès de cette session ; ce n'est pas la preuve que le dépôt est inutilisable dans tout environnement.
2. `git clone --shared --no-hardlinks . .build/pascal-auto-backend` a échoué car `sh.exe` de Git/MSYS n'a pas pu créer son objet `BaseNamedObjects` (`NtCreateDirectoryObject`, `0xC0000022`). Aucun refus d'authentification GitHub n'a été démontré par cet essai local.
3. `gh` est absent du PATH. **Cela ne démontre pas l'impossibilité de publier une PR.** Les contributions précédentes ont des scripts de publication et de vérification : `.build/memory-save-review/publish.py`, `.build/nine-pulls/publish.py`, `.build/nine-pulls/verify.py`, `.build/six-pulls/publish.py` et `.build/six-pulls/verify.py`. Examiner leur méthode et les résultats conservés avant d'inventer une nouvelle procédure. Ne pas lancer un ancien script de mutation tel quel : il peut viser une ancienne branche ou PR. Ne jamais afficher ni copier de secrets dans les journaux, ce fichier ou la description de PR.
4. Aucun essai avec élévation du bac à sable, aucun refus de revue automatique et aucun échec d'une publication GitHub authentifiée n'ont été enregistrés dans cette tentative. Ne pas présenter ces possibilités non testées comme des blocages définitifs. Utiliser la procédure d'autorisation disponible si une opération nécessaire sort des accès accordés ; rapporter précisément un éventuel refus réel.

### Marche à suivre pour Luna

1. Lire les consignes de ce fichier et les éventuels `AGENTS.md` du checkout retenu. Retrouver la méthode de publication déjà employée avec succès et contrôler les accès au checkout avant de commencer un correctif.
2. Résoudre la tête officielle distante de `main`, noter son SHA et sa date, puis vérifier le statut du candidat et toutes les contributions voisines. Les recherches sur les anciennes versions ne suffisent pas. Choisir un autre sujet si le défaut a disparu ou possède déjà un correctif équivalent.
3. Préférer un défaut concret, limité, reproductible sur cette tête et vérifiable sans toucher aux données utilisateur ni à l'application installée. Créer une branche `codex/...` depuis cette base dans un checkout approprié, en préservant les travaux existants.
4. Reproduire le défaut, conserver la preuve avant correction, corriger sa cause et exécuter les tests et contrôles adaptés. Aucune commande de test ni compilation n'a été exécutée pour les candidats de cette tentative ; ne reprendre aucun chiffre des autres PR comme validation.
5. Préparer le commit Conventional Commits en anglais et la description de PR en anglais avec problème concret, reproduction courte, preuve avant/après, commandes et résultats réels, dépendances/ordre de fusion et limites. Utiliser « Closes #… » uniquement si toute l'issue est résolue. Vérifier de nouveau les doublons avant publication.
6. Publier la contribution autorisée, vérifier le SHA distant, les fichiers et la description, attacher la PR à cette conversation avec l'outil de l'application et mettre ce fichier à jour. Distinguer validation locale, CI, approbation et fusion. Si un accès empêche seulement la publication, conserver un correctif concret et ses preuves et décrire l'action exacte qui reste bloquée.

## Sauvegardes mémoire concurrentes — PR #9345 — 20 octobre 2026

**PR publiée : [#9345 — Sérialiser les sauvegardes Remember par dossier de données](https://github.com/janhq/jan/pull/9345)**, branche `codex/fix-concurrent-memory-saves`, base officielle contrôlée `648e8da55438150ccfab78808fa97a7a8e458c9f`. Le premier candidat #9137 est écarté car une correction existe déjà dans la PR ouverte #9168 ; le défaut d'attachements #9022 possède également #9030. Recherches ouvertes/fermées sur la mémoire, `Remember` et `rememberNote` avant de retenir le cas concurrent.

**Reproduction courte :** dans une discussion, sauvegarder deux messages différents avec « Remember this » pendant que la première écriture est encore en attente. Les deux appels peuvent choisir le même nom libre ; l'écriture par nom remplace alors une note malgré deux réponses de réussite. Le correctif attend la fin de chaque sauvegarde avant la suivante dans le même dossier, y compris lorsque deux titres produisent des noms/suffixes qui se chevauchent. Un rejet laisse les opérations suivantes avancer ; les dossiers distincts restent indépendants et le dossier est résolu une seule fois par action.

**Preuve avant/après :** les 17 tests finaux de `agentWorkspace` exécutés contre sa source officielle non modifiée donnent **5 échecs / 12 réussites**. Ils couvrent les faits distincts concurrents, le contenu identique concurrent, les collisions titre/suffixe, l'attente d'une écriture et le changement de dossier en cours d'action. Après correction : **58 tests réussis, aucun échec ni test ignoré dans trois suites** (`agentWorkspace` 17, `agentTools` 34, `skillStore` 7). ESLint production sans diagnostic et compilation complète TypeScript/Vite réussis. Avertissements Vite CJS/taille des chunks conservés ; les tests voisins d'erreurs journalisent leurs échecs simulés attendus. Le premier affichage Python du journal avant correction a échoué à cause de l'encodage console cp1252 ; le journal complet a bien été enregistré, le fichier corrigé a été restauré dans `finally`, puis les 58 tests finaux ont été réexécutés avec succès.

**Dépendances et limites :** PR indépendante, aucun ordre de fusion requis ni chevauchement connu avec nos autres PR. La déduplication des clics successifs existe déjà dans main (`284c31f9f`) et n'est pas revendiquée comme nouvelle. #8839 est seulement référencée : son problème d'aperçu HTML est hors périmètre, sans fermeture automatique. La file coordonne les actions Remember de ce module frontend, pas les autres fenêtres/processus, le CLI, les outils agent ou les modifications de fichiers externes. Aucun ancien souvenir n'est réécrit, récupéré ou dédupliqué globalement. Tests avec API plugin simulée en mémoire ; aucune validation disque/UI ou multi-processus annoncée.

**Publication vérifiée :** commit GitHub signé `9d2647a207e607f748a3cbce473a46889b4aaf48`, arbre distant identique à l'index testé `d2bd302c93947dd3dae10175d122912d2ee57841`. Deux fichiers seulement : `web-app/src/lib/agentWorkspace.ts` et son test existant. Description distante vérifiée identique au texte préparé, PR ouverte et prête pour revue, attachée au chat. Au contrôle final : aucun check-run, statut agrégé en attente, fusion bloquée ; aucune acceptation officielle acquise. Le checkout `.build/thread-atomic` existant est réutilisé, aligné sur le commit publié et propre. Aucune nouvelle copie de Jan, aucun changement de l'application installée ni de données utilisateur.

**Application des nouvelles consignes :** la description inclut une reproduction en trois étapes, la comparaison chiffrée avant/après, les commandes exactes et résultats locaux, une section dédiée aux dépendances/ordre de fusion et les limites explicites. Le titre et le message de commit suivent Conventional Commits en anglais. Cela rend le résultat plus facile à vérifier ; cela ne démontre pas à lui seul l'injection automatique des réglages de l'application et ne garantit pas l'acceptation par les mainteneurs.

Preuves et description complète : `.build/memory-save-review/` (`audit.json`, `full-baseline-tests.log`, `final-tests.log`, `lint.log`, `build.log`, `memory-pr.md`, `memory-published.json`, `verification.json`). Les commandes reproductibles figurent dans la description publiée.

## Neuf correctifs contrôlés et publiés un par un — 19 octobre 2026

Demande : choisir neuf défauts encore présents par importance, contrôler les correctifs existants, reproduire chaque problème, corriger/tester et publier une PR distincte avant de passer au suivant. Relecture des consignes et des contributions précédentes ; audit GitHub actualisé et recherches ciblées de doublons. Priorité aux modèles, aux opérations bloquées et aux autorisations, puis aux titres, aux images et au rendu. Les anciennes séries restent distinctes.

| Ordre | PR publiée | Preuve sur main | Validation individuelle |
| --- | --- | --- | --- |
| 1 | [#9335 — Suppression individuelle avec erreur et nouvelle tentative](https://github.com/janhq/jan/pull/9335) | Deux régressions échouent : mutation avant résultat disque et filtrage du modèle homonyme d’un autre fournisseur. | Quatre tests de composant réussis : attente, rejet/nouvelle tentative, filtrage ciblé et échec de rafraîchissement. |
| 2 | [#9336 — Suppressions du cache propres à chaque fournisseur](https://github.com/janhq/jan/pull/9336) | Cinq régressions initiales échouent : collisions, rafraîchissement, réapparition locale, déduplication et sélection obsolète. | 66 tests réussis, dont migration/réhydratation persistée réelle et réglages fournisseur. |
| 3 | [#9337 — File des choix d’import concurrents](https://github.com/janhq/jan/pull/9337) | Trois régressions échouent / cinq contrôles réussissent : le second choix remplace le premier résolveur et laisse l’opération attendre. | 49 tests réussis : FIFO, choix indépendants, annulation et traitement de pièces jointes. |
| 4 | [#9338 — Autorisations isolées par discussion et appel](https://github.com/janhq/jan/pull/9338) | Trois régressions initiales échouent / douze contrôles réussissent : collision entre discussions, demande identique remplacée, identité conflictuelle. | 158 tests réussis, dont boutons avec vrai store, allow/deny indépendants, annulation, décision ambiguë et ancienne carte terminée. |
| 5 | [#9339 — Préserver un titre renommé pendant sa génération](https://github.com/janhq/jan/pull/9339) | Deux régressions échouent / 70 contrôles réussissent : résultat tardif après renommage ou suppression. | 93 tests route/génération de titres réussis. |
| 6 | [#9340 — Normalisation des images MCP avant transport](https://github.com/janhq/jan/pull/9340) | Six régressions échouent / 17 contrôles réussissent : casse des data URLs et données invalides laissées dans des sentinelles indécodables. | 145 tests réussis : conversion en parties image, suppression pour modèle sans vision, factory et transport. |
| 7 | [#9341 — Réserver le budget des documents inline déjà préparés](https://github.com/janhq/jan/pull/9341) | Deux régressions échouent / 25 contrôles réussissent, document préparé placé avant ou après le nouveau document. | 48 tests de traitement/import réussis ; nouveaux documents auto dirigés vers embeddings si la place est occupée. |
| 8 | [#9342 — Propriétés et méthodes du stockage temporaire cohérentes](https://github.com/janhq/jan/pull/9342) | Cinq régressions échouent / sept contrôles réussissent : propriétés, suppression, clés de prototype et énumération. | 49 tests réussis : vrai script injecté, aperçu Cowork et artefacts HTML. |
| 9 | [#9343 — Code brut lisible en cas d’échec du highlighter](https://github.com/janhq/jan/pull/9343) | La nouvelle régression ciblée échoue car Shiki rejette sans fournir de rendu de repli ; 14 cas non ciblés ignorés lors de ce contrôle avant correction. | 53 tests réussis : source échappée sans balise active, deux thèmes, copie du code original, outils et artefacts. |

**ESLint production et compilation complète TypeScript/Vite réussis pour chaque contribution. Validation conjointe : 512 tests dans 23 suites réussis**, ainsi qu’ESLint et TypeScript/Vite avec les neuf corrections réunies. Les totaux individuels partagent des suites ; ils ne sont pas additionnés comme des tests uniques. Les réponses de modèles, le disque et les services sont simulés dans les tests concernés ; aucun modèle/fournisseur réel, fichier utilisateur, réglage utilisateur ou historique réel n’est utilisé.

**Chevauchement testé et documenté :** #9335 et #9336 touchent `DeleteModel.tsx`. La combinaison conserve la gestion d’échec/nouvelle tentative et appelle `deleteModelCache(selectedModelId, provider.provider)` seulement après la suppression disque réussie. Les neuf descriptions incluent le résultat conjoint ; les deux PR concernées précisent cette résolution. Patch combiné, arbre et empreinte conservés dans `.build/nine-pulls/combined.patch` et `combined-verification.json` : 27 fichiers, arbre `d24b8f01dcc19479493d1a9c1ac9d118932a6b38`.

**Compatibilité de l’ancienne PR #9329 :** deux tests ciblés supplémentaires réussissent contre le code des neuf correctifs complété par la suppression groupée résolue. Ils réussissent aussi sur sa branche propre après adaptation des assertions aux IDs supprimés indépendamment de l’argument fournisseur. Seul ce test a été actualisé dans la PR existante, commit signé vérifié `739673f27f0bb0ba767aac80fe46eb7f7fe7c70b`, arbre `e23acacfed6baf256f52395236c02c3371272281` ; aucune nouvelle PR et aucun changement de production ajouté à ce suivi. Description #9329 enrichie. Il s’agit d’un contrôle ciblé de compatibilité, pas d’une nouvelle validation complète de toutes les anciennes séries. Preuves `previous-bulk-compat.*`, `previous-bulk-followup-tests.log` et enregistrements avant/après dans `.build/nine-pulls/`.

**Périmètres précis :** #9336 enregistre désormais les suppressions sous `{provider, id}`, format de store 20 ; les anciens marqueurs globaux texte conservent leur comportement historique car leur propriétaire original n’est pas reconstructible. #9338 concerne les demandes en attente et les contrôles de leur discussion ; les permissions persistées et l’exécution réelle ne changent pas. #9339 préserve les renommages et ignore les discussions supprimées ; le choix du fournisseur des titres reste traité séparément par #9331. #9340 conserve les résultats stockés et normalise seulement leur transport. #9341 ne modifie pas la politique des budgets inconnus/épuisés ni les choix explicites ; une pièce jointe explicitement trop grande ne devient pas magiquement compatible. #9342 reste un stockage en mémoire dans le même sandbox ; aucun accès réseau/persistant ajouté. #9343 affiche du texte brut sans couleurs ni numéros en cas d’erreur ; les réponses de coloration devenues obsolètes restent traitées séparément par #9334.

Même base officielle contrôlée à chaque publication : `648e8da55438150ccfab78808fa97a7a8e458c9f`. Neuf PR ouvertes, non brouillon, attachées au chat ; signatures GitHub, SHA des têtes, listes exactes de fichiers et arbres distants contrôlés. Aucun check-run ni résultat CI présent au contrôle final : statut agrégé en attente, acceptation des mainteneurs non acquise. Aucune fusion sur GitHub, aucun déclenchement manuel de CI. Les avertissements Vite de taille des chunks et les journaux d’erreurs simulées restent visibles.

**Aucune nouvelle copie de projet ni d’application.** Le checkout `.build/thread-atomic` existant est réutilisé successivement. La branche locale temporaire de validation est retirée après conservation et vérification des patches ; le checkout est propre sur `codex/fix-code-highlight-fallback`. Le dossier principal et ses personnalisations sont conservés. **Ces neuf correctifs ne sont pas installés dans Jan-Desktop** : l’EXE original est inchangé, SHA-256 `4F83D8422878F8A397AD15825DC15F6FA8004CC6D064C461B9A1D14A5D275702`.

Preuves avant/après, audit ciblé, descriptions soumises, builds, scripts de publication et vérification finale : `.build/nine-pulls/`. Les sections ci-dessous sont historiques.


## Six correctifs contrôlés et publiés un par un — 19 octobre 2026

Demande : choisir six défauts par importance, vérifier leur présence dans le main actuel et l’absence de correctif équivalent actif, reproduire puis corriger/tester et publier chaque PR avant de passer à la suivante. Priorité donnée à la visibilité des modèles, à la persistance des réglages et au choix du fournisseur avant les défauts de saisie et de rendu. Les trois PR de la série précédente restent distinctes.

| Ordre | PR publiée | Preuve sur main | Validation individuelle |
| --- | --- | --- | --- |
| 1 | [#9329 — Conserver visibles les modèles dont la suppression groupée échoue](https://github.com/janhq/jan/pull/9329) | Deux régressions échouent : échec partiel et suppression encore en attente. | Deux tests de composant réussis ; ESLint et TypeScript/Vite réussis. |
| 2 | [#9330 — Respecter l’ordre des opérations sur les réglages](https://github.com/janhq/jan/pull/9330) | Cinq échecs / un contrôle réussi : retour A → B → A pendant une écriture, concurrence, suppression, lecture et cache obsolète. | 14 tests de stockage réussis ; ESLint et TypeScript/Vite réussis. |
| 3 | [#9331 — Générer le titre avec le modèle de sa discussion](https://github.com/janhq/jan/pull/9331) | Deux régressions initiales échouent : fournisseur propriétaire explicite et absence de modèle propriétaire. | 96 tests réussis, dont le callback de fin de la vraie route après changement de sélection globale ; contrôles MLX/annulation ; ESLint et TypeScript/Vite réussis. |
| 4 | [#9332 — Isoler les favoris par fournisseur et modèle](https://github.com/janhq/jan/pull/9332) | Trois régressions échouent sur le store actuel : collision, bascule et retrait entre fournisseurs. | 50 tests réussis : store, migration persistée Zustand réelle, classement dans le sélecteur et réglages fournisseur ; ESLint et TypeScript/Vite réussis. |
| 5 | [#9333 — Protéger le brouillon des flèches de navigation](https://github.com/janhq/jan/pull/9333) | Six nouveaux cas échouent / 40 réussissent : brouillon, flèche bas hors historique et raccourcis modifiés. | 51 tests de saisie/store réussis ; ESLint et TypeScript/Vite réussis. |
| 6 | [#9334 — Ignorer les colorations syntaxiques devenues obsolètes](https://github.com/janhq/jan/pull/9334) | Trois régressions échouent / 13 réussissent : changement de code, de langage ou de numérotation avant réponse de Shiki. | 54 tests réussis : bloc de code, outils et artefacts HTML ; ESLint et TypeScript/Vite réussis. |

**Validation conjointe : 267 tests dans 14 suites réussis**, ESLint production et compilation complète TypeScript/Vite réussis avec les six correctifs réunis. Un chevauchement entre #9329 et #9332 dans `DeleteAllModels.tsx` est résolu localement et indiqué dans les deux descriptions : attendre la suppression disque, enregistrer l’ID réussi, puis retirer le favori avec son fournisseur et actualiser le cache. Le test de #9329 a reçu un second commit signé pour rester compatible avec cet argument supplémentaire. Patch combiné conservé avec empreinte et arbre Git vérifiés dans `.build/six-pulls/combined.patch` et `combined-verification.json`. La branche temporaire de validation a été retirée après conservation du patch ; le checkout existant est propre sur la sixième branche publiée.

**Audit des doublons et limites :** #8442 reste ouvert ; #8457 et #8561 ont été fermés sans fusion, et sont crédités dans #9332. La migration conserve les anciens favoris sans effacer globalement les préférences : elle attribue seulement les propriétaires uniques ; les entrées ambiguës ou indisponibles restent stockées, sans étoiler tous les fournisseurs. Une sélection explicite réattribue un ancien favori ambigu. #9333 est reliée à #8719 sans fermeture automatique : elle protège le brouillon, mais n’ajoute pas d’option pour désactiver complètement l’historique. #9331 concerne les titres automatiques ; la boucle d’outils et la navigation restent couvertes séparément par #9313. #9329 couvre la suppression groupée. Les recherches ciblées et les diffs des propositions voisines ont été contrôlés avant publication. Les problèmes SDK #9264–#9274 consultés étaient déjà fermés par #9278/#9279 ; la classification Metal OOM et le sens LTR du code étaient déjà corrigés et ont été écartés.

Même base officielle pour les six : `648e8da55438150ccfab78808fa97a7a8e458c9f`. Fichiers publiés, arbres distants et signatures GitHub vérifiés ; six PR ouvertes, non brouillon, attachées au chat. Aucun check-run ni résultat de CI présent au contrôle final ; statut agrégé en attente, acceptation officielle non acquise. Les descriptions incluent les résultats individuels et conjoints. Les avertissements Vite de taille de chunks et les erreurs volontairement simulées/avertissements act de fixtures existantes restent visibles dans les journaux.

**Aucune nouvelle copie de projet ou d’application.** Le dossier `.build/thread-atomic` existant est réutilisé successivement avec six branches indépendantes. Le dossier principal et ses personnalisations sont conservés. Aucun fournisseur réel, modèle payant, historique ou réglage utilisateur utilisé par les tests. Ces six correctifs ne sont pas installés dans Jan-Desktop : l’EXE original reste identique, SHA-256 `4F83D8422878F8A397AD15825DC15F6FA8004CC6D064C461B9A1D14A5D275702`.

Preuves, descriptions soumises, tests avant/après, builds, scripts de publication et vérification finale : `.build/six-pulls/`. Les enregistrements ci-dessous restent historiques.


## Trois correctifs contrôlés et publiés successivement — 19 octobre 2026

Demande : choisir trois sujets importants encore non résolus, vérifier chaque défaut sur main, le reproduire, corriger/tester et publier une PR distincte avant de passer au suivant. Audit des PR ouvertes, des diffs et des recherches ouvertes/fermées ; les propositions équivalentes existantes sont écartées plutôt que dupliquées. Trois défauts sans PR corrective associée retenus : persistance (#9323), compaction distante (#9317), refus du shell désactivé (#9319).

| Ordre | Contribution officielle | Preuve avant / après | Validation |
| --- | --- | --- | --- |
| 1 | [#9326 — Ordre des sauvegardes et métadonnées de branches](https://github.com/janhq/jan/pull/9326) | Cinq régressions échouent sur main ; 37 tests réussissent après correction. | ESLint production, TypeScript et Vite réussis. |
| 2 | [#9327 — Auto Compact distant sans limite manuelle](https://github.com/janhq/jan/pull/9327) | La régression du vrai transport échoue car le résumé n'est jamais demandé ; 150 tests réussissent après correction. | Contrôles des limites explicites, moteurs locaux, option désactivée et valeurs invalides ; ESLint/TypeScript/Vite réussis. |
| 3 | [#9328 — Refus du shell et poursuite du tour](https://github.com/janhq/jan/pull/9328) | Fixture SDK finale sur main : 2 échecs / 7 réussites ; 175 tests réussissent après correction. | SDK 6.0.182 réel, une seule requête de reprise, propriété MCP préservée, tests route/exécution/approbation, ESLint/TypeScript/Vite réussis. |

**Périmètres précis :** #9326 sérialise les écritures de messages par discussion et ignore les accusés de création devenus obsolètes ; le rapport #9323 est référencé sans fermeture automatique, car sa reproduction utilisateur complète n'est pas documentée et les anciens historiques corrompus ne sont pas reconstruits. #9327 corrige le saut silencieux de la compaction avec un budget de repli de 128000 tokens, identique au CLI ; une limite explicite reste prioritaire, sans découverte des capacités fournisseur ni reprise automatique après erreur de débordement. #9328 conserve une définition de parsing sans exécuteur et l'exclut du modèle via `activeTools` ; le refus effectif reste dans la route, avant approbation/exécution, et les outils MCP indisponibles ne sont pas réactivés.

Même base officielle vérifiée pour les trois : `648e8da55438150ccfab78808fa97a7a8e458c9f`. Commits GitHub signés vérifiés, arbres distants contrôlés identiques à l'index préparé : #9326 `685d4cede7ba347ed39497413cd860e0a91317d3` / `738dc230510bb4c016124379c731d4cdd2ef3e81`, #9327 `d02bda385e8654df8a4d8c4471553379e28d5079` / `f0445a1f9546b06637b2e62445c4c9e03f50a6c2`, #9328 `358112f4824c30ac60f072c64510fa0bb65146c1` / `6dd3fcb0aec7c8bf4faf50010e5425ba0f5cdc38`. Respectivement trois, quatre et deux fichiers publiés ; PR attachées au chat. Les nombres de tests incluent des suites communes : ils ne sont pas additionnés comme des tests uniques.

**Pas de nouvelle copie de Jan ni de nouveau checkout.** Le dossier existant `.build/thread-atomic` est réutilisé successivement avec trois branches séparées. Dépendances installées réutilisées par liens ; API et bundles d'extensions de la base actuelle régénérés localement pour valider Vite. Changements personnalisés du dossier principal préservés. L'application installée avec la main cyan n'est pas remplacée dans cette série : EXE SHA-256 `4F83D8422878F8A397AD15825DC15F6FA8004CC6D064C461B9A1D14A5D275702`, worker b11721 `BDD20E296A6F4F143D564F7B27CDE15FFE670FED1EE0F29942C3B3F6F5A30B9F`. Aucun modèle distant payant appelé et aucune vraie discussion modifiée par les essais.

Preuves, descriptions soumises, scripts et contrôle GitHub final : `.build/three-pulls/`. Les builds Vite conservent leur avertissement de taille de chunks ; le test existant de repli après échec de résumé affiche son erreur simulée attendue. La réussite des contrôles locaux ne vaut pas validation CI ou acceptation des mainteneurs.

## Avatar Jan cyan dans la saisie et suivi PR — 19 octobre 2026

La main jaune visible à côté de Jan dans la barre de saisie provenait de l'avatar texte historique `👋`, distinct des ressources image et de l'icône Windows. Le composant partagé `AvatarEmoji` rend désormais cette valeur avec `/images/jan-logo.png`, à la taille demandée. Les sélecteurs, menus et avatars déjà stockés dans les discussions sont couverts sans réécriture des données ; les autres emoji et images personnalisées gardent leur rendu.

Correctif installé dans le Jan original existant, `C:/Users/jmsga/AppData/Local/Programs/Jan/Jan-Desktop.exe`. **Main cyan vérifiée à l'écran dans le sélecteur de la saisie**, et l'accessibilité signale une image Jan à la place du texte emoji. Ancien SHA-256 `3A02090919958003BBBEC8363A3A703E2589B5A625C4FE88D4FEC86D465B1146`, nouveau `4F83D8422878F8A397AD15825DC15F6FA8004CC6D064C461B9A1D14A5D275702`. Worker b11721 inchangé, SHA-256 `BDD20E296A6F4F143D564F7B27CDE15FFE670FED1EE0F29942C3B3F6F5A30B9F`. Jan fermé normalement puis rouvert ; aucune discussion envoyée ni donnée utilisateur réécrite, aucune nouvelle copie d'application.

**PR existante [janhq/jan#9324](https://github.com/janhq/jan/pull/9324) mise à jour**, branche `codex/tron-cyan-hand-icon`, commit signé vérifié `18efb6c196ae5093400d4520e7168f27639a1b55`, arbre `1b5cc2b3f2e62f3bcee995d45948bb69a8214539` vérifié identique à l'index Git préparé. Trois fichiers de suivi : composant, test de régression de l'avatar historique et documentation. Description enrichie d'une section expliquant la cause et la correction. La PR MCP #9325 reste séparée et conservée.

Validation : **25 tests ciblés réussis sur chaque jeu de sources** (adaptation installée et branche PR), TypeScript de la PR, ESLint du composant, build Vite/TypeScript local et build natif Windows réussis ; les six tailles ICO intégrées correspondent à la source cyan. Preuves et scripts : `.build/assistant-hand/`, `.build/build-assistant-hand.ps1`, `.build/install-assistant-hand.ps1`.

## Audit de pertinence et collisions MCP — 19 octobre 2026

PR officielle ouverte : [janhq/jan#9325](https://github.com/janhq/jan/pull/9325), depuis `TRON-ABS:codex/fix-mcp-tool-collisions`, vers `main`. Choix après contrôle des PR ouvertes : #9007 n'a plus de diff et son confinement des workers Windows par job object existe déjà dans main (commit `ee40b7e68`). Le problème MCP de #9127 reste présent dans `648e8da55438150ccfab78808fa97a7a8e458c9f` ; cette proposition est explicitement créditée et référencée. #9325 est une alternative qui traite aussi les noms répétés dans un seul serveur et dans le serveur gagnant, cas exclus de #9127.

Un seul fichier de production/tests : `src-tauri/src/core/agent/upstream.rs`. Chaque nom n'est annoncé qu'une fois ; la définition correspond au serveur réellement appelé. Le dernier serveur trié conserve sa priorité existante ; les doublons internes gardent la dernière définition listée. Ordre trié des définitions restantes conservé, avertissement pour les doublons écartés, noms d'outils et clés de permissions conservés.

Preuve avant correction : **63 tests réussis, 4 échecs**. Après : **67 tests réussis**, avec Cargo `--locked --release --no-default-features --features cli`, filtre `core::agent::upstream::tests`. Sections modifiées conformes à rustfmt, écarts de formatage restants identiques à main ; `git diff --cached --check` réussi. Pas de test avec fournisseur/modèle réel. Deux avertissements Windows préexistants sont documentés dans la PR.

Commit GitHub signé et vérifié `6320d5a7439f475131c8c285242057c1e1e33f3a`, arbre `dd8f1ffdd2c13dadfd808627edce16c02b7b4d49` vérifié identique aux fichiers préparés. Checkout existant `.build/thread-atomic` réutilisé, propre et synchronisé ; changements du dossier principal conservés. PR ouverte, prête pour revue, attachée au chat ; aucun check-run présent au premier contrôle. Aucun build ni remplacement de l'application installée. Preuves : `.build/mcp-collisions/`, description `.build/mcp-collisions-pr.md`, scripts de validation/publication dans `.build/`.

## Cache des icônes Windows corrigé — 19 octobre 2026

Main jaune réellement observée dans Explorer et la barre des tâches malgré les ressources cyan de l’EXE. Le simple rafraîchissement ciblé et `ie4uinit -show` ne suffisaient pas. Invalidation des listes d’images Shell par `SHCNE_ASSOCCHANGED`, puis F5 : EXE cyan vérifié à l’écran. Ajout du seul fichier `resources/jan-tron-cyan.ico` dans l’installation originale et affectation explicite aux trois raccourcis existants (Bureau/S, Démarrer, barre des tâches), cibles EXE conservées. Nouvelle notification Shell : **main cyan vérifiée visuellement dans Explorer et la barre des tâches**. Aucun redémarrage d’Explorer, aucune suppression de cache, aucune recompilation ni copie d’application. Jan original rouvert.

## DuckDuckGo uniquement dans Web Search — 19 octobre 2026

Demande : supprimer le double affichage de DuckDuckGo dans Outils/MCP et Web Search, garder DuckDuckGo par défaut, retirer la clé Exa locale. Réalisé dans Jan original : DuckDuckGo sélectionné, recherche activée, serveur interne démarré à la demande. Le serveur est masqué de la liste MCP et ses outils bruts sont exclus des listes complètes/sélectives et des résumés du routage intelligent. Les appels explicites internes de Web Search restent disponibles. La configuration du serveur est conservée lors des changements aux autres serveurs. Les fournisseurs alternatifs et les préférences enregistrées restent disponibles.

Clé Exa supprimée par l’API native du coffre Windows et index Jan nettoyé ; absence vérifiée sans lire ni afficher la valeur. Aucun fichier de repli chiffré présent dans cette installation. Configuration locale maintenue hors de la contribution.

104 tests ciblés réussis sur les sources installées et sur la branche publiée, un test opt-in réel ignoré (déjà validé précédemment). TypeScript et ESLint production réussis. Builds interface et natif Windows réussis. Vérification UI réelle : DuckDuckGo dans Web Search activé, absent des serveurs MCP, Jan Browser MCP conservé. Aucun message envoyé au modèle. Les six ressources ICO cyan sont vérifiées identiques ; worker b11721 inchangé.

EXE original : C:\Users\jmsga\AppData\Local\Programs\Jan\Jan-Desktop.exe, SHA-256 3A02090919958003BBBEC8363A3A703E2589B5A625C4FE88D4FEC86D465B1146. Correctifs précédents conservés. Aucune nouvelle application ni copie du projet.

PR existante [janhq/jan#9321](https://github.com/janhq/jan/pull/9321) actualisée sur codex/duckduckgo-default, commit signé vérifié d79efd7d3509bf38bf57421f8d7659e97babafe, arbre 914b479b157fea4117a3fd709cda5f32712db811. Six fichiers ajoutés/modifiés pour ce suivi ; branche locale propre et synchronisée. Description PR actualisée. Preuves : .build/duckduckgo-ui/ (tests, builds, réglages sans secrets, vérification UI et captures). Scripts build/install dédiés dans .build/.

## Main Jan cyan installée et proposée en PR — 19 octobre 2026

Demande utilisateur : retrouver la main Jan holographique cyan style Tron, l'installer dans notre version et la proposer en PR. Visuel original retrouvé à `C:\Users\jmsga\.codex\generated_images\01a14672-a278-71e1-b72c-97b7aa2a56df\exec-f9a80358-ff79-4980-9d16-41d9fef1644c.png` : PNG RGBA 1254 × 1254, fond transparent. Ce fichier est conservé. Application aux quatre chemins de logo existants dans `.build/panel-official` et la contribution : image maître app-icon et logos web, plus PNG desktop 512 px généré par Tauri. Le dossier principal avec ses personnalisations robot/disque antérieures n'est pas remplacé.

**Icône installée dans le Jan original**, à `C:\Users\jmsga\AppData\Local\Programs\Jan\Jan-Desktop.exe`, SHA-256 `F978A8D40BED4303F7454B33B4D54E7ED98E1EF0F4D8E6C6DADEA317D6B77C3C`. L'ancien SHA était `FE6A4691D48050E1ADCF939951936EB279C2356DFC982574D1EEF4A751129464`. Seul l'EXE existant a été remplacé, sans nouvelle application, portable ou sauvegarde. Moteur b11721 conservé strictement identique : SHA-256 worker `BDD20E296A6F4F143D564F7B27CDE15FFE670FED1EE0F29942C3B3F6F5A30B9F`. Les correctifs de version, #9311 et DuckDuckGo sont conservés. Aucun modèle chargé pour cette opération, aucune conversation modifiée.

Validation : génération Tauri des formats de plateforme, build Vite Windows réussi, release native réussie en 5 min 10 s. Les six tailles ICO **16, 24, 32, 48, 64 et 256 px** intégrées à l'EXE compilé puis à l'EXE installé sont vérifiées identiques octet pour octet à l'ICO source. Windows Shell renvoie la main jaune avant et la main cyan après remplacement ; notification ciblée du changement d'icône, sans suppression des caches ni redémarrage d'Explorer. Jan original est rouvert et son accueil avec saisie est vérifié. Les deux lignes de suivi PNG/ICO dans `src-tauri/build.rs` permettent de recompiler les ressources lors d'un futur changement d'icône seul. Pas de nouveaux tests de comportement pour cette modification de ressources.

**PR officielle [janhq/jan#9324](https://github.com/janhq/jan/pull/9324)** ouverte vers `main`, depuis [TRON-ABS/jan:codex/tron-cyan-hand-icon](https://github.com/TRON-ABS/jan/tree/codex/tron-cyan-hand-icon). Huit fichiers : les quatre logos, le suivi natif, les notes du visuel et les deux petits aperçus Shell avant/après. Les fichiers ICO/ICNS et tailles de plateformes générées restent ignorés selon les règles du dépôt. La création assistée par génération d'image depuis la main Jan d'origine est indiquée dans la PR, présentée comme une proposition graphique soumise aux mainteneurs. Aucun changement de moteur, de recherche ou de logique de conversation dans cette branche.

Quatre commits signés et vérifiés GitHub ; tête `aa2270c34cdf8490d0019830f81e3f668966b6c4`, arbre final `5b0f5b3f97ee0c4c85b97b8700070f508813e5b1` vérifié identique aux fichiers préparés, base `648e8da55438150ccfab78808fa97a7a8e458c9f`. L'envoi groupé des images a rencontré HTTP 499 ; les images ont été envoyées séparément et la reprise a conservé les commits déjà confirmés. Le dossier existant `.build/thread-atomic` est propre et suit cette nouvelle branche ; les branches précédentes sont conservées. La PR est attachée à ce chat.

Preuves : `.build/tron-hand/web-build.log`, `native-build.log`, `installed.json`, `embedded-verification.json`, `shell-before.png`, `shell-after.png`, `published.json`, `publish-progress.json`, `pull-request.json`, `pr-verification.json`, `submitted-pr-body.md`. Scripts : `.build/build-tron-hand.ps1`, `.build/install-tron-hand.ps1`, `.build/tron-hand/verify-exe.py`. Les notes ci-dessous concernant l'ancien logo robot/disque et les EXE précédents sont historiques.

## llama.cpp b11721 et version installée automatique partagés — 19 octobre 2026

Demandes explicites : partager le correctif de version sur notre fork et ouvrir une PR officielle, puis **inclure la mise à niveau vers b11721**. Réalisé : [janhq/jan#9322](https://github.com/janhq/jan/pull/9322), ouverte et prête pour revue vers `main`, depuis [TRON-ABS/jan:codex/llamacpp-b11721-runtime-version](https://github.com/TRON-ABS/jan/tree/codex/llamacpp-b11721-runtime-version). Commit signé et vérifié GitHub `ab82197d188e3d0cafbbdb8f441548322aae8606`, arbre publié vérifié identique au code testé `1845f43d4dabd01bd8aed12ab0fcfcd08b323c42`, douze fichiers ; base officielle `648e8da55438150ccfab78808fa97a7a8e458c9f`. Le dossier existant `.build/thread-atomic` est propre et suit cette branche. Les autres branches sont conservées, sans nouvelle copie de Jan.

Le pin officiel passe de b11146 / 0.5.0 à **b11721 / 0.7.0 / ff5a23376725e5a889fa0bfb987b7541dc304da0**. Les manifestes Rust/JS et les deux verrouillages Cargo restent alignés à 0.7.0. Les paramètres de compilation et la couverture matérielle du main actuel sont conservés : aucun ciblage imposé sur notre GPU, aucune désactivation des variantes CPU, aucun patch local du checkout llama.cpp partagé. Le shim C++ actuel de main est déjà compatible ; son code n'est pas modifié.

`get_engine_version` interroge désormais le worker résolu par le même mécanisme que l'inférence, via `--version-json`, plutôt que les constantes compilées dans l'EXE desktop. Le worker valide sa bibliothèque liée avant de répondre, sans ouvrir de serveur ni charger de modèle. Délai maximal de cinq secondes, arrêt à l'abandon et console Windows masquée. Métadonnées absentes/incohérentes, worker absent et sortie non réussie sont rejetés ; aucun repli silencieux sur le pin desktop. Le test de non-régression utilise un numéro de worker supérieur au pin desktop, sans dépendre du numéro précis du prochain moteur.

Validation sur cette branche : **186 tests natifs du plugin sans moteur**, **5 tests avec bibliothèque réellement liée**, **1 test de requête du worker installé**, **90 tests d'interface**, TypeScript, formatage des deux fichiers Rust de logique modifiés et métadonnées Cargo application avec `--locked` réussis. Le **worker Windows CPU exact de cette contribution a été compilé avec toutes les variantes CPU** depuis le checkout propre b11721 existant. Il renvoie la bonne identité puis charge exclusivement `C:\Users\jmsga\Desktop\T\Convertir GGUF\Tron-v1-Q6_K.gguf`, génère huit tokens et décharge le modèle avec succès. Aucun message ajouté à une conversation et aucune modification de l'installation originale pendant cet essai.

Précision de validation : le Clang 23 MSYS2 local a besoin de la cible MSVC explicite et de `-Wno-error=incompatible-pointer-types` pour des appels C de préchargement mémoire du ggml upstream. Ces réglages sont limités au build de test local et ses avertissements restent visibles ; ils ne sont pas ajoutés à la contribution. Les sources llama.cpp restent propres. Les configurations CUDA, Metal, Vulkan et Linux de cette branche n'ont pas été reconstruites. Le moteur CUDA b11721 déjà installé et ses validations précédentes restent conservés.

Documentation moteur actualisée, tests du panneau alignés sur b11721 et capture native montrant 0.7.0 / b11721 / ff5a2337 avec son lien de release, sans historique de conversation visible. Le Jan original dispose déjà de ce moteur et du correctif ; il n'a pas été réinstallé ni dupliqué pour cette publication. Les correctifs #9311 et DuckDuckGo sont conservés localement et exclus de cette PR.

L'ancienne PR [#9299](https://github.com/janhq/jan/pull/9299), b11681 vers `dev`, est **fermée sans fusion**, avec un lien de remplacement vers #9322 pour éviter deux propositions de mise à niveau concurrentes. Sa branche `update-llamacpp-b11681` et les changements non validés du dossier principal sont conservés. Les deux PR sont attachées à ce chat. Au premier contrôle de #9322 : ouverte, un commit, douze fichiers, aucun check GitHub encore présent et fusion `blocked`. Aucune fusion ou CI déclenchée manuellement ; l'acceptation dépend des mainteneurs.

Preuves : `.build/engine-version/native-tests.log`, `linked-engine-tests.log`, `live-worker-test.log`, `frontend-tests.log`, `worker-build.log`, `engine-native-build.log`, `smoke-report.json`, `smoke-worker.log`, `typescript.log`, `rustfmt-check.log`, `app-metadata.json`, `ui-verified.json`, `published.json`, `pull-request.json`, `pr-verification.json`, `submitted-pr-body.md`. Scripts : `.build/test-engine-version.ps1`, `.build/build-shared-b11721.ps1`, `.build/engine-version/smoke-worker.py`.

## DuckDuckGo intégré et PR officielle ouverte — 19 octobre 2026

Demande utilisateur : intégrer DuckDuckGo par défaut dans notre Jan original, puis publier sur notre fork **et ouvrir une PR officielle**. Réalisé : [janhq/jan#9321](https://github.com/janhq/jan/pull/9321), ouverte et prête pour revue, vers `main`, depuis [TRON-ABS/jan:codex/duckduckgo-default](https://github.com/TRON-ABS/jan/tree/codex/duckduckgo-default). Un commit signé et vérifié GitHub : `ff3ff5ced3e744d83b1320886d1df686c6b820a4`, neuf fichiers, arbre `034a9d78c2abd7757c1b6b339dade47e9e329ac1`, base officielle `648e8da55438150ccfab78808fa97a7a8e458c9f`. Aucun équivalent DuckDuckGo ouvert trouvé avant l'envoi. La PR est attachée à ce chat. Au premier contrôle, aucun check GitHub n'était encore présent ; le statut de fusion est `blocked`, sans fusion effectuée. L'adoption officielle reste soumise aux mainteneurs.

DuckDuckGo devient le fournisseur par défaut des nouvelles configurations desktop. Les préférences existantes restent respectées par le code ; les autres fournisseurs restent disponibles. Le plugin MCP est démarré à la demande, avec réutilisation de la connexion/configuration DuckDuckGo existante, démarrage partagé entre appels concurrents, reprise après échec, citations HTTP(S), expansion des liens `ref://` et pages bornées compatibles avec l'affichage Jan. Le nouveau preset est inactif au lancement et épinglé sur `duckduckgo-mcp-server[browser]==0.7.0`. Aucun champ de clé API pour DuckDuckGo. Documentation Web Search mise à jour, avec capture de la page de réglages sans historique visible. Périmètre : outils desktop ; les valeurs par défaut du plugin natif/CLI ne changent pas.

Validation contribution sur `main` : **192 tests ciblés réussis**, TypeScript et ESLint sans erreur ni avertissement. Validation de l'adaptation du Jan installé : **206 tests réussis**, dont les non-régressions #9311, compilation Vite Windows et release native réussies. **Recherche et lecture de page réelles réussies avec le package MCP épinglé** ; les réponses réelles sont aussi passées dans l'adaptateur et les parseurs de citations/pages. Aucun modèle nécessaire pour ces tests, aucun message ajouté à l'historique utilisateur. Les avertissements de build déjà présents concernent la taille des chunks, les noms AMD et les messages informatifs du linker.

Installation originale remplacée uniquement à `C:\Users\jmsga\AppData\Local\Programs\Jan\Jan-Desktop.exe`, SHA-256 `FE6A4691D48050E1ADCF939951936EB279C2356DFC982574D1EEF4A751129464`. Le worker b11721 reste identique (`BDD20E296A6F4F143D564F7B27CDE15FFE670FED1EE0F29942C3B3F6F5A30B9F`) ; le correctif #9311 est conservé. Vérification visuelle native effectuée : DuckDuckGo sélectionné, recherche activée, aucun champ de clé API. Le réglage local auparavant Exa/désactivé a été changé explicitement pour cette demande. Le serveur MCP et ses variables existantes ne sont pas réécrits. Jan reste ouvert sur Recherche Web.

Aucune copie de projet ou application supplémentaire : `.build/panel-official` et le dossier de contribution `.build/thread-atomic` existants sont réutilisés. Ce dernier est maintenant propre et suit `origin/codex/duckduckgo-default` ; les branches précédentes, dont `codex/fix-thread-navigation` et `codex/atomic-thread-message-write`, sont conservées. Le dossier principal et ses modifications antérieures ne sont pas remplacés.

Preuves : `.build/duckduckgo-tests.log`, `.build/duckduckgo-typescript.log`, `.build/duckduckgo-lint.log`, `.build/duckduckgo-web-build.log`, `.build/duckduckgo/native-build.log`, `live-report.json`, `publish-tests.log`, `publish-typescript.log`, `publish-lint.log`, `installed.json`, `ui-verified.json`, `published.json`, `pull-request.json`, `pr-verification.json`, `submitted-pr-body.md`. Scripts de reconstruction et installation : `.build/build-duckduckgo.ps1`, `.build/install-duckduckgo.ps1`.

## Consigne permanente pour les tests avec modèle — 19 octobre 2026

### Publication sur le fork — #9311

Publication explicitement demandée par l'utilisateur : branche dédiée [`codex/fix-thread-navigation`](https://github.com/TRON-ABS/jan/tree/codex/fix-thread-navigation), commit signé et vérifié GitHub [`0f108b10388ce613761c3ef75b7d24724e60659b`](https://github.com/TRON-ABS/jan/commit/0f108b10388ce613761c3ef75b7d24724e60659b). Base : `janhq/jan:main` au SHA `648e8da55438150ccfab78808fa97a7a8e458c9f`. Arbre distant vérifié identique au code testé : `f2fdd266bef059cb6565d23dbc70192228a00070` ; neuf fichiers, sans données utilisateur ni modèle embarqué.

Le dossier de contribution existant `.build/thread-atomic` a été réutilisé et pointe désormais sur `codex/fix-thread-navigation` ; la branche `codex/atomic-thread-message-write` et ses commits sont conservés, sans modification. Aucune nouvelle copie de projet créée. Le dossier principal reste sur `update-llamacpp-b11681` avec ses modifications préexistantes.

La version du fork est adaptée au `main` actuel, notamment ses protections récentes du bouton Arrêter ; elle diffère donc de l'adaptation v0.8.6 installée localement ci-dessous. Validation publication : **177 tests ciblés + 1 test avec le vrai Tron-v1-Q6_K.gguf réussis**, TypeScript et ESLint sans erreur ni avertissement. Journaux : `.build/issue-9311/publish-tests.log`, `publish-typescript.log`, `publish-lint.log`, `publish-model/model-test.log`, `published.json`.

La PR officielle [#9313](https://github.com/janhq/jan/pull/9313) est déjà ouverte pour #9311. Notre publication reste sur le fork : aucune PR upstream supplémentaire ni commentaire envoyé.

Tous les tests nécessitant un vrai modèle doivent utiliser exclusivement `C:\Users\jmsga\Desktop\T\Convertir GGUF\Tron-v1-Q6_K.gguf`. Ne pas télécharger ou substituer un autre modèle. Les tests unitaires simulés peuvent rester sans modèle.

Issue en cours : #9311, changement de conversation interrompant la boucle d'outils. Intervention sur la base officielle existante `.build/panel-official`, qui sert à construire notre Jan original installé ; aucune nouvelle copie du projet ou version portable à créer. Préserver les modifications existantes et les réglages/conversations utilisateur.

### Correctif #9311 installé dans Jan original — 19 octobre 2026

La vue de conversation est isolée par identifiant ; les contrôleurs d'outils, demandes d'autorisation et références de continuation appartiennent à la session persistante. La navigation conserve la boucle, les callbacks sont rafraîchis au retour et chaque transport utilise le modèle de sa propre conversation. Arrêter et supprimer une session annulent la boucle ; les résultats arrivant après annulation sont ignorés.

Validation : **141 tests ciblés réussis**, plus **1 essai avec le vrai modèle Tron-v1-Q6_K.gguf** utilisant le worker du Jan original installé. Cet essai fait produire un appel d'outil au modèle, passe de A à B, fournit le résultat à A, puis vérifie la réponse finale dans A et l'absence de messages dans B. Les tests d'interface et de session couvrent aussi les autorisations conservées et l'arrêt après aller-retour. Aucun message de test ajouté aux conversations utilisateur : sessions de test en mémoire, preset de worker séparé et port local temporaire.

TypeScript, compilation Vite Windows et **compilation native release réussis** (8 min 24 s après nettoyage antérieur du cache Cargo). ESLint : aucune erreur ni avertissement sur les quatre fichiers de production du correctif. Avertissements de compilation existants : imports dynamiques/taille des chunks, noms AMD et message informatif du linker. Test de non-régression vérifié : réintroduire temporairement l'ancienne annulation fait échouer le nouveau test ; le fichier corrigé est restauré immédiatement.

EXE original remplacé directement : `C:\Users\jmsga\AppData\Local\Programs\Jan\Jan-Desktop.exe`. SHA-256 installé vérifié identique au build : `4BB7DBDB3950A68DF453F6E55E706270C5047D8462401051CF08E58426CA46EF`. Le worker b11721 est conservé sans modification, empreinte `BDD20E296A6F4F143D564F7B27CDE15FFE670FED1EE0F29942C3B3F6F5A30B9F`. Aucune nouvelle copie d'application ou version portable créée ; seul l'EXE de l'installation existante a été remplacé depuis le répertoire de compilation C:/jb.

Ouverture native vérifiée avec la compétence Computer Use : accueil Jan visible, historique existant et champ de saisie présents. Jan original est laissé ouvert. Aucun message de test saisi dans son historique ; le scénario modèle a été testé séparément avec les composants de session et le vrai worker, pas manuellement dans la fenêtre installée.

Preuves : `.build/issue-9311-tests.log`, `.build/issue-9311-web-build.log`, `.build/issue-9311-lint.log`, `.build/issue-9311/model-test.log`, `.build/issue-9311/model-report.json`, `.build/issue-9311/regression-before.log`, `.build/issue-9311-native-build.log`, `.build/issue-9311/installed.json`. Patch source relisible, basé sur v0.8.6 : `.build/issue-9311/source.patch`. Aucun push ni PR publiée.

Suivi du **19/10/2026**, fuseau Europe/Paris : installation du moteur llama.cpp sur les deux versions de Jan et liste des PR vérifiée via l’API GitHub. Les relevés et consignes plus anciens restent historiques. Aucun push, rebase, fusion de branches, changement de PR ou déclenchement de CI n’a été effectué.

## Nettoyage disque terminé — 19 octobre 2026

Suppression explicitement autorisée du portable modifié actuel, du cache Cargo deps/build et de ses fichiers de suivi, des anciens installateurs Jan 0.8.4 et des anciennes sauvegardes/moteurs inventoriés. **23.37 Go libérés (21.76 Gio)** sur les deux phases ; environ **61.18 Go libres** après nettoyage. 22 cibles supprimées, aucun échec.

Jan installé et son moteur **b11721 / ff5a2337** sont conservés et vérifiés par empreinte. Les modèles, conversations, réglages et sources du fork sont conservés. Le portable modifié a été supprimé à la demande explicite de l’utilisateur ; une nouvelle version portable fondée sur la version originale pourra être préparée plus tard.

Les anciennes sauvegardes mentionnées dans les sections historiques, notamment panel-before, before, official-before et replaced-*, **ont été supprimées**. Les anciens chemins de restauration et de paquets ne sont plus disponibles. Aucun nouveau backup produit. Les futurs builds devront régénérer le cache Cargo.

Le contrôle automatique avait refusé le périmètre initial. Seuls le cache et le portable explicitement approuvés ont été supprimés lors de la première phase, puis la liste exacte des 17 anciennes copies après confirmation distincte. Les sources, journaux, patchs et manifestes de preuve restent conservés.

Rapports : .build/jan-cleanup-result.json, .build/jan-old-copies-cleanup-result.json et .build/jan-cleanup-summary.json.

## Panneau du moteur corrigé et vérifié — 19 octobre 2026

Le panneau de Jan installé affiche **llama.cpp 0.7.0**, **Build b11721**, **Commit ff5a2337**. Vérification native finale sur Fournisseurs de modèles > Llama.cpp ; Jan reste ouvert sur ce panneau. La page Général affiche **Jan 0.8.6** et les boutons Windows réduire/agrandir/fermer sont présents.

Cause : get_engine_version renvoyait les constantes de compilation de l’EXE. Correctif : requête asynchrone au worker installé via `--version-json`, délai maximal de cinq secondes, arrêt du processus en cas d’abandon, validation du build et du commit complet. Aucun repli sur une ancienne constante en cas d’échec. Le worker vérifie sa bibliothèque liée avant de fournir les métadonnées.

Application reconstruite depuis le tag officiel `v0.8.6` (`d198a3c15`) dans `.build/panel-official`, avec ce correctif ciblé. Versions des manifestes alignées sur 0.8.6 et paramètres Vite Windows explicités. L’EXE est désormais une compilation locale de la base officielle, sans la signature de distribution Jan AI. L’ancien EXE signé est sauvegardé dans `.build/llama-update-b11721/panel-before/Jan-Desktop.exe`. Le portable conserve son interface personnalisée et reçoit aussi la commande de métadonnées worker.

Validation : **8 tests natifs réussis**, dont worker plus récent que le pin de l’application et rejet des réponses incohérentes ; compilation TypeScript/Vite et release Windows réussies ; contrôle du diff réussi. Avertissements préexistants consignés : dépendances React/TypeScript, chunks Vite, identifiants AMD et messages informatifs du linker. Écarts rustfmt préexistants distingués du nouveau code.

Aucun réglage de modèle, contexte, cache ou conversation modifié. Aucun message de test envoyé ni publication distante. Les DLL CUDA/ggml validées précédemment sont conservées ; seul le worker reçoit la commande de métadonnées.

Preuves : `.build/llama-update-b11721/panel-installed.json`, `panel-tests.log`, `panel-web-build.log`, `panel-final-build.log`. Sources reproductibles : `panel-source.patch`, `worker-version-json.patch`, `.build/build-panel-official.ps1` et `install-panel.ps1`.

SHA-256 EXE : `9AE60112E48A7CBBA70EF5D1504D9EC94C48AC8D2899648FC7691B586F1D68CA`.
SHA-256 worker : `BDD20E296A6F4F143D564F7B27CDE15FFE670FED1EE0F29942C3B3F6F5A30B9F`.

## Moteur llama.cpp b11721 installé — 19 octobre 2026

Demande utilisateur : installer la dernière release de llama.cpp sur **notre portable**, puis **aussi sur Jan officiel**. Release vérifiée : [b11721](https://github.com/ggml-org/llama.cpp/releases/tag/b11721), publiée le 18/10/2026, marquée préversion ; commit `ff5a23376725e5a889fa0bfb987b7541dc304da0`. L’API `/releases/latest` renvoie la stable `v0.7.0` ; la liste chronologique des releases a été utilisée pour identifier la build la plus récente.

- Portable : `portable/Jan-Portable/resources/bin/jan-llama-worker.exe`, passage **b11696 → b11721**.
- Jan officiel 0.8.6 : `C:\Users\jmsga\AppData\Local\Programs\Jan\resources\bin\jan-llama-worker.exe`, passage **b11146 → b11721**.
- Ressources de compilation mises à jour dans `src-tauri/resources/bin`. Les exécutables d’interface sont inchangés par SHA-256 ; celui de Jan officiel conserve sa signature valide. Son moteur est désormais notre compilation locale, et non le runtime d’origine du paquet officiel.
- Limite historique, corrigée par la section Panneau du moteur corrigé et vérifié ci-dessus : le panneau moteur de Jan officiel affiche toujours **b11146 / 7fe450e1**. La commande `get_engine_version` de l’EXE officiel renvoie ses constantes compilées (`PINNED_*`), sans interroger le worker remplacé. Cet affichage ne reflète donc plus le runtime installé **b11721 / ff5a2337**, vérifié par `--version` et par le test de la bibliothèque liée. Le panneau n’a pas été corrigé ; une correction native exige de reconstruire l’application officielle, dont l’exécutable avait volontairement été conservé.
- Compilation **CUDA 13.4**, architecture **120 / RTX 5070 Laptop**, **GGML_CUDA_GRAPHS=ON** vérifié dans le CMakeCache réellement utilisé. Worker et toutes les DLL ggml/CUDA remplacés ensemble ; anciens modules Vulkan/CPU incompatibles retirés des dossiers actifs et conservés dans les sauvegardes. Le nouveau runtime contient CUDA et CPU.
- Sources : pin et test mis à jour dans `build.rs` et `src/engine/mod.rs`. Le shim reprend les initialisations de la version officielle 0.8.6 (projecteur GPU, préservation du raisonnement, contexte partagé par slot). Un test confondant la version du plugin 0.2.0 avec celle de llama.cpp 0.7.0 a été corrigé pour vérifier séparément les deux manifestes du plugin ; le vrai numéro de bibliothèque reste vérifié par liaison native.
- Le checkout source vendored pointe aussi sur b11721 ; ses deux modifications Windows préexistantes sont conservées, avec sauvegarde du diff dans `.build/llama-update-b11721/vendor-before.patch`. Le moteur livré a été compilé depuis le checkout officiel séparé `.build/llama-b11721`.

### Vérifications réalisées

**5 tests du moteur réussis**, aucun échec ni test ignoré dans cette sélection : constantes du pin, script de récupération, bibliothèque réellement liée, routes HTTP et versions des manifestes du plugin. Les 155 autres tests du crate n’ont pas été exécutés pour cette mise à jour. `git diff --check` passe sur les trois fichiers source concernés.

Depuis **chacun des deux emplacements installés** : version b11721 confirmée, détection CUDA, chargement de `Tron-v1-Q6_K.gguf`, deux générations de 128 tokens et déchargement réussis. Tests avec PATH limité à System32, sans CUDA_PATH : DLL embarquées suffisantes. Les sorties de ce modèle peuvent être du raisonnement ; le contrôle vérifie les tokens effectivement générés, sans imposer une réponse finale dans cette fenêtre de 128 tokens.

Réglages conservés : **128192 tokens demandés**, **128256 effectifs** dans les journaux, caches **BF16/BF16**, Flash Attention Auto. Le modèle et les profils utilisateur n’ont pas été modifiés par les essais ; presets de test séparés, aucun message ajouté aux conversations Jan. Vérification finale des paramètres persistés : contexte du modèle toujours 128192 et caches BF16.

| Essai hors compilation | Décodage, deux générations (tokens/s) |
|---|---|
| Ancien portable b11696 | 127,66 ; 116,21 |
| Ancien Jan officiel b11146 | 106,93 ; 107,84 |
| b11721 avant installation | 114,64 ; 116,99 |
| b11721 depuis le portable installé | 129,76 ; 118,75 |
| b11721 depuis Jan officiel installé | 115,86 ; 117,41 |

Ces essais courts ne démontrent pas un gain universel de vitesse. Les premières mesures faites pendant la compilation des sources sont conservées dans les rapports mais ne servent pas de comparaison principale.

Ouverture native vérifiée pour les deux interfaces. Chacune lance son worker depuis son propre dossier mis à jour ; le portable a ensuite été fermé, **Jan officiel est laissé ouvert**. Aucun nouveau build d’interface, installateur EXE/MSI ou ZIP n’a été produit : les anciens paquets restent historiques. Une réinstallation ou mise à jour officielle de Jan pourra remplacer ce runtime local.

Preuves, commandes, journaux et sauvegardes : `.build/llama-update-b11721/`. Manifeste des empreintes et cibles : `installed.json` ; compilation : `build.log`, `native-build.log` ; tests : `tests.log` ; essais : `baseline-idle/report.json`, `official-baseline-idle/report.json`, `b11721-idle/report.json`, `portable-installed/report.json`, `official-installed/report.json`. Scripts : `.build/build-engine-b11721.ps1`, `.build/test-engine-b11721.ps1`, `.build/llama-update-b11721/install.ps1`.

SHA-256 worker livré : `947E05F00BB67707B38206198A7A04582CB8BC2A4C3E53986DF18AD062BF24BC`.
SHA-256 ggml-cuda livré : `4273393BF11FF742E285E3088D3148ADC6A88AF28AA73F9FCAC7EBC91FCF3E5D`.
Sauvegardes complètes des dossiers remplacés : `replaced-portable-bin`, `replaced-official-bin`, `replaced-source-bin`, sous `.build/llama-update-b11721/`. Aucun push ni changement des PR GitHub.

## Liste complète des pull requests ouvertes

Source : [janhq/jan — Pull requests](https://github.com/janhq/jan/pulls). Relevé API GitHub du **19/10/2026 à 01:48**, Europe/Paris : **172 PR ouvertes**, dont **5 brouillons**. Deux pages API récupérées ; 172 numéros uniques vérifiés. Ordre : créations les plus récentes en premier.

Les titres et labels sont ceux de GitHub. « Ouverte » ne signifie pas validée ou prête à fusionner. Cette liste remplace le relevé global du 16 octobre conservé dans les archives plus bas.

| PR et titre | Auteur | État | Cible | Labels | Mise à jour (Paris) |
|---|---|---|---|---|---|
| [#9305 — feat(llamacpp): add support for llama.cpp speculative decoding types](https://github.com/janhq/jan/pull/9305) | PetersChristian | Ouverte | main | — | 17/10/2026 18:56 |
| [#9303 — feat(chat): Support MCP Prompts](https://github.com/janhq/jan/pull/9303) | bytrangle | Brouillon | main | — | 18/10/2026 11:56 |
| [#9302 — feat(ci): restore Windows portable ZIP distribution](https://github.com/janhq/jan/pull/9302) | TRON-ABS | Brouillon | main | — | 16/10/2026 13:19 |
| [#9301 — fix(agent-tui): copy through pbcopy on macOS so AppKit log lines stay off the terminal (#9300)](https://github.com/janhq/jan/pull/9301) | thinhlpg | Ouverte | main | — | 16/10/2026 12:40 |
| [#9299 — feat(llamacpp): upgrade engine to b11681](https://github.com/janhq/jan/pull/9299) | TRON-ABS | Ouverte | dev | — | 16/10/2026 10:39 |
| [#9297 — fix(providers): say why a model fetch failed instead of 'Unknown error' (#9292)](https://github.com/janhq/jan/pull/9297) | thinhlpg | Ouverte | main | — | 16/10/2026 09:39 |
| [#9296 — fix(chat): leave an @token that is not a file in the prompt as typed (#9291)](https://github.com/janhq/jan/pull/9296) | thinhlpg | Ouverte | main | — | 16/10/2026 09:39 |
| [#9294 — fix(downloads): say why a network error stopped a model download](https://github.com/janhq/jan/pull/9294) | thinhlpg | Ouverte | main | — | 16/10/2026 09:39 |
| [#9284 — fix(app): remove the hosted Exa MCP default 0.8.3 wrote (MCP schema 5)](https://github.com/janhq/jan/pull/9284) | thinhlpg | Ouverte | main | — | 16/10/2026 05:00 |
| [#9283 — fix(chat): hold a built-in web page to the model's context window](https://github.com/janhq/jan/pull/9283) | thinhlpg | Ouverte | main | — | 16/10/2026 05:00 |
| [#9281 — fix(cli): give up on an MCP server that never answers initialize](https://github.com/janhq/jan/pull/9281) | thinhlpg | Ouverte | main | — | 16/10/2026 05:00 |
| [#9280 — fix(cli): create the data folder when jan cli mcp add writes its first server](https://github.com/janhq/jan/pull/9280) | thinhlpg | Ouverte | main | — | 16/10/2026 05:00 |
| [#9278 — fix(adk): keep host tools callable and contain listener failures](https://github.com/janhq/jan/pull/9278) | thinhlpg | Ouverte | main | — | 15/10/2026 08:22 |
| [#9249 — feat: add Wally as a predefined cloud provider](https://github.com/janhq/jan/pull/9249) | adityabatra072 | Ouverte | main | — | 14/10/2026 00:42 |
| [#9247 — feat: add WebWright as an OpenAI-compatible provider](https://github.com/janhq/jan/pull/9247) | T145 | Ouverte | main | — | 13/10/2026 21:11 |
| [#9235 — feat(chat): a switch to turn the shell tool off (#9222)](https://github.com/janhq/jan/pull/9235) | thinhlpg | Ouverte | main | — | 15/10/2026 05:00 |
| [#9223 — feat: add LiteLLM as a predefined provider](https://github.com/janhq/jan/pull/9223) | misbahsy | Ouverte | main | — | 11/10/2026 19:08 |
| [#9219 — fix(chat): count a reply's tokens and speed across all its requests](https://github.com/janhq/jan/pull/9219) | harappa | Ouverte | main | — | 11/10/2026 11:29 |
| [#9218 — feat(chat): let a reply's text out at a steady pace](https://github.com/janhq/jan/pull/9218) | harappa | Ouverte | main | — | 11/10/2026 11:29 |
| [#9217 — fix(chat): show that Jan is working when a reply stalls mid-stream](https://github.com/janhq/jan/pull/9217) | harappa | Ouverte | main | — | 11/10/2026 11:29 |
| [#9216 — feat(chat): add a setting to make Enter add a new line](https://github.com/janhq/jan/pull/9216) | harappa | Ouverte | main | — | 11/10/2026 12:06 |
| [#9215 — feat(models): list each provider's models by name](https://github.com/janhq/jan/pull/9215) | harappa | Ouverte | main | — | 11/10/2026 11:29 |
| [#9214 — fix(chat): match model search terms as substrings, not fuzzy subsequences](https://github.com/janhq/jan/pull/9214) | harappa | Ouverte | main | — | 11/10/2026 11:29 |
| [#9213 — feat(chat): retry a reply on its own after a rate limit](https://github.com/janhq/jan/pull/9213) | harappa | Ouverte | main | — | 11/10/2026 11:29 |
| [#9212 — fix(providers): keep each model id once per provider](https://github.com/janhq/jan/pull/9212) | harappa | Ouverte | main | — | 11/10/2026 11:29 |
| [#9211 — feat(providers): show only the models deployed on the Azure resource](https://github.com/janhq/jan/pull/9211) | harappa | Ouverte | main | — | 11/10/2026 12:10 |
| [#9210 — fix(providers): don't use Azure's example endpoint as its base URL](https://github.com/janhq/jan/pull/9210) | harappa | Ouverte | main | — | 11/10/2026 11:29 |
| [#9209 — fix(chat): send PDFs as they are to Responses API models (stacked on #9206, #9207)](https://github.com/janhq/jan/pull/9209) | harappa | Ouverte | main | — | 11/10/2026 11:29 |
| [#9208 — feat(providers): search the web with Azure's built-in web search (stacked on #9206)](https://github.com/janhq/jan/pull/9208) | harappa | Ouverte | main | — | 11/10/2026 12:08 |
| [#9207 — fix(chat): attach dropped documents like picked ones](https://github.com/janhq/jan/pull/9207) | harappa | Ouverte | main | — | 11/10/2026 11:29 |
| [#9206 — fix(providers): send Azure requests through the Responses API](https://github.com/janhq/jan/pull/9206) | harappa | Ouverte | main | — | 11/10/2026 11:29 |
| [#9205 — fix: repair macOS chat attachments](https://github.com/janhq/jan/pull/9205) | j4mesbst | Brouillon | main | — | 11/10/2026 10:17 |
| [#9196 — fix: keep thread in its project after embedding attachments](https://github.com/janhq/jan/pull/9196) | enkynakamura | Ouverte | main | — | 09/10/2026 23:19 |
| [#9181 — fix(llamacpp): say the engine stopped instead of a raw connection error (stacked on #9182)](https://github.com/janhq/jan/pull/9181) | jamesdam | Ouverte | main | — | 09/10/2026 05:49 |
| [#9168 — fix(updater): keep update failures visible](https://github.com/janhq/jan/pull/9168) | lorenzozanee | Ouverte | main | — | 07/10/2026 23:29 |
| [#9150 — fix(cmdscan): close grant bypasses via time -o and cmd caret escapes](https://github.com/janhq/jan/pull/9150) | aniketkrs | Ouverte | main | — | 07/10/2026 06:44 |
| [#9144 — fix(llamacpp): preserve checkpoint settings from numeric inputs](https://github.com/janhq/jan/pull/9144) | lorenzozanee | Ouverte | main | — | 07/10/2026 05:29 |
| [#9132 — docs: fix broken macOS install guide link in ja/zh READMEs](https://github.com/janhq/jan/pull/9132) | jrlprost | Ouverte | main | — | 06/10/2026 01:31 |
| [#9127 — fix(agent): advertise one definition per MCP tool name](https://github.com/janhq/jan/pull/9127) | aien-spark | Ouverte | main | — | 05/10/2026 14:07 |
| [#9123 — Feat/sidecar permission gate](https://github.com/janhq/jan/pull/9123) | shise2023 | Ouverte | main | — | 05/10/2026 01:41 |
| [#9122 — i18n(ja): fill 403 missing Japanese translation keys](https://github.com/janhq/jan/pull/9122) | akine | Ouverte | main | — | 04/10/2026 14:50 |
| [#9120 — docs: sync Chinese translation with Windows build guide and signed commits note](https://github.com/janhq/jan/pull/9120) | JasonYeYuhe | Ouverte | main | — | 04/10/2026 10:01 |
| [#9118 — feat: add FlexAI as a predefined cloud provider](https://github.com/janhq/jan/pull/9118) | sundar-flex | Ouverte | main | — | 03/10/2026 11:45 |
| [#9085 — feat(agent-tui): render images inline in the TUI (idea)](https://github.com/janhq/jan/pull/9085) | thinhlpg | Brouillon | main | feature | 29/09/2026 05:09 |
| [#9071 — feat(websearch): add Serply as a native search provider](https://github.com/janhq/jan/pull/9071) | googio | Ouverte | main | — | 26/09/2026 15:21 |
| [#9060 — fix(websearch): apply the configured proxy to web search and fetch requests](https://github.com/janhq/jan/pull/9060) | alter | Ouverte | main | — | 25/09/2026 00:25 |
| [#9059 — chore: remove download:lib script referencing deleted download-lib.mjs](https://github.com/janhq/jan/pull/9059) | simpleqt | Ouverte | main | — | 24/09/2026 15:50 |
| [#9054 — i18n(zh-CN): fill 613 missing translation keys, full parity with en](https://github.com/janhq/jan/pull/9054) | theluckystrike | Ouverte | main | — | 05/10/2026 04:31 |
| [#9036 — test(agent): give the plugin-install fixtures their own git identity](https://github.com/janhq/jan/pull/9036) | xiechimon | Ouverte | main | — | 22/09/2026 19:40 |
| [#9030 — fix: avoid mutating inline attachment messages](https://github.com/janhq/jan/pull/9030) | yaodong-shen | Ouverte | main | — | 09/10/2026 12:58 |
| [#9019 — fix(build): get linuxdeploy&appimagetool for $ARCH](https://github.com/janhq/jan/pull/9019) | peppergrayxyz | Ouverte | main | — | 21/09/2026 15:41 |
| [#9018 — fix(build): uv and bun download for musl](https://github.com/janhq/jan/pull/9018) | peppergrayxyz | Ouverte | main | — | 21/09/2026 15:38 |
| [#9017 — fix(build): add node-gyp for sharp](https://github.com/janhq/jan/pull/9017) | peppergrayxyz | Ouverte | main | — | 21/09/2026 15:36 |
| [#9007 — Fix worker processes surviving a force-quit of Jan on Windows](https://github.com/janhq/jan/pull/9007) | statsback2zero | Ouverte | main | — | 13/10/2026 04:46 |
| [#9006 — Fix thread-cache directory path separator on Windows extended paths](https://github.com/janhq/jan/pull/9006) | statsback2zero | Ouverte | main | — | 13/10/2026 04:46 |
| [#9004 — fix: require Yarn 4.10 for musl builds](https://github.com/janhq/jan/pull/9004) | lorenzozanee | Ouverte | main | — | 21/09/2026 00:12 |
| [#9000 — feat(i18n): Türkçe (tr) locale desteği eklendi](https://github.com/janhq/jan/pull/9000) | alkank | Ouverte | main | — | 27/09/2026 12:35 |
| [#8998 — feat: add GitGot as a predefined provider](https://github.com/janhq/jan/pull/8998) | respectus | Ouverte | main | — | 19/09/2026 19:01 |
| [#8997 — feat(cli): add Y-API to the login provider catalog](https://github.com/janhq/jan/pull/8997) | jiweiyeah | Ouverte | main | — | 04/10/2026 05:11 |
| [#8994 — docs: fix broken macOS install guide link in README](https://github.com/janhq/jan/pull/8994) | jrlprost | Ouverte | main | — | 19/09/2026 01:29 |
| [#8990 — fix(llamacpp): resolve bundled worker libraries in Flatpak](https://github.com/janhq/jan/pull/8990) | lorenzozanee | Ouverte | main | — | 18/09/2026 14:32 |
| [#8950 — fix(extensions): restore user-installed third-party extension loading](https://github.com/janhq/jan/pull/8950) | santhiprakash | Ouverte | main | — | 15/09/2026 08:35 |
| [#8944 — fix: allow empty API key for custom OpenAI-compatible providers](https://github.com/janhq/jan/pull/8944) | gokay-ai | Ouverte | main | — | 14/09/2026 13:40 |
| [#8940 — fix(markdown): restore remark-breaks for assistant responses](https://github.com/janhq/jan/pull/8940) | nomad-geek | Ouverte | main | — | 14/09/2026 03:12 |
| [#8939 — feat: add Turkish language support and assistant localization](https://github.com/janhq/jan/pull/8939) | projectaccc | Ouverte | main | — | 15/09/2026 16:59 |
| [#8927 — feat(ci): publish windows-aarch64 to the stable release manifest](https://github.com/janhq/jan/pull/8927) | qnixsynapse | Ouverte | main | — | 11/09/2026 08:02 |
| [#8922 — feat(mcp): add You.com to default MCP server list](https://github.com/janhq/jan/pull/8922) | tyler5673 | Ouverte | main | — | 18/09/2026 08:45 |
| [#8901 — fix(llamacpp): forward GPU Layers to llama-server even when Fit is on](https://github.com/janhq/jan/pull/8901) | gokay-ai | Ouverte | main | — | 09/09/2026 08:43 |
| [#8888 — feat: add API Route provider](https://github.com/janhq/jan/pull/8888) | DennyHo0917 | Ouverte | main | — | 14/09/2026 15:31 |
| [#8872 — docs: fix broken install-guide links in data-folder and troubleshooting pages](https://github.com/janhq/jan/pull/8872) | simpleqt | Ouverte | main | — | 07/09/2026 18:22 |
| [#8871 — docs: fix @param modelId JSDoc tags that mismatch the actual 'model' parameter](https://github.com/janhq/jan/pull/8871) | simpleqt | Ouverte | main | — | 07/09/2026 18:21 |
| [#8869 — fix(agent-tui): drop leaked SGR mouse reports from the composer](https://github.com/janhq/jan/pull/8869) | gokay-ai | Ouverte | main | — | 07/09/2026 08:33 |
| [#8867 — feat(agent): offer OpenCode Go alongside Zen, and Codex fast mode](https://github.com/janhq/jan/pull/8867) | thinhlpg | Ouverte | main | — | 09/10/2026 14:21 |
| [#8862 — docs: fix JSDoc param and return types in fs.ts and threadInterface.ts](https://github.com/janhq/jan/pull/8862) | simpleqt | Ouverte | main | — | 06/09/2026 21:18 |
| [#8861 — fix: rename DownloadManegement.tsx (typo) and fix models.ts JSDoc params](https://github.com/janhq/jan/pull/8861) | simpleqt | Ouverte | main | — | 06/09/2026 21:14 |
| [#8860 — docs: fix copy-pasted JSDoc in extension.ts](https://github.com/janhq/jan/pull/8860) | simpleqt | Ouverte | main | — | 06/09/2026 21:14 |
| [#8859 — docs: fix personal paths and wrong binary name in AGENT-TUI.md](https://github.com/janhq/jan/pull/8859) | simpleqt | Ouverte | main | — | 06/09/2026 21:14 |
| [#8855 — fix(app): fall back to default data folder when persisted path is stale](https://github.com/janhq/jan/pull/8855) | santhiprakash | Ouverte | main | — | 18/09/2026 22:06 |
| [#8849 — fix: omit tauri Origin on outbound provider requests](https://github.com/janhq/jan/pull/8849) | gokay-ai | Ouverte | main | — | 04/09/2026 08:45 |
| [#8845 — fix(llamacpp): install ggml into lib/ so Fedora lib64 hosts can link](https://github.com/janhq/jan/pull/8845) | gokay-ai | Ouverte | main | — | 08/09/2026 08:29 |
| [#8836 — fix(server): honor CORS enabled setting](https://github.com/janhq/jan/pull/8836) | Alphaxiaoteng | Ouverte | main | — | 02/09/2026 17:21 |
| [#8829 — feat(i18n): add Swedish locale](https://github.com/janhq/jan/pull/8829) | yeager | Ouverte | main | — | 11/09/2026 13:31 |
| [#8805 — feat(cli): poll for new published builds on an interval in the TUI](https://github.com/janhq/jan/pull/8805) | thinhlpg | Ouverte | main | — | 29/09/2026 05:34 |
| [#8786 — feat(hub): revamp model marketplace — three-source search, README, i18n, scroll restore](https://github.com/janhq/jan/pull/8786) | xinspark | Ouverte | main | — | 29/08/2026 10:22 |
| [#8778 — fix(web): respect MCP ownership for web tool names](https://github.com/janhq/jan/pull/8778) | Totoro-qaq | Ouverte | main | — | 30/08/2026 21:32 |
| [#8767 — Update French localization for setup.json](https://github.com/janhq/jan/pull/8767) | Dadu042 | Ouverte | main | — | 24/08/2026 21:08 |
| [#8760 — fix: Increase Context Size works for custom OpenAI endpoints](https://github.com/janhq/jan/pull/8760) | gokay-ai | Ouverte | main | — | 10/09/2026 09:16 |
| [#8713 — feat(cli): persistent structured log and one-command bug-report archive (#8709)](https://github.com/janhq/jan/pull/8713) | thinhlpg | Ouverte | main | — | 29/09/2026 05:33 |
| [#8699 — feat: enable MiniMax-M3 video input in the remote attachment pipeline](https://github.com/janhq/jan/pull/8699) | octo-patch | Ouverte | main | — | 18/08/2026 11:29 |
| [#8698 — fix: upgrade seroval to 1.5.3 (CVE-2026-59940)](https://github.com/janhq/jan/pull/8698) | anupamme | Ouverte | dev | — | 18/08/2026 10:55 |
| [#8685 — fix(server): don't panic on Cyrillic chat bodies](https://github.com/janhq/jan/pull/8685) | tzh476 | Ouverte | main | — | 17/09/2026 18:32 |
| [#8684 — fix(web-app): let the custom Jinja chat template textarea grow/resize](https://github.com/janhq/jan/pull/8684) | vjymisal0 | Ouverte | main | — | 08/10/2026 17:17 |
| [#8658 — feat: add SayGM as a predefined cloud provider](https://github.com/janhq/jan/pull/8658) | markdavison | Brouillon | main | — | 13/08/2026 16:32 |
| [#8657 — feat: add OrcaRouter as a named model provider](https://github.com/janhq/jan/pull/8657) | XiaoHuo888-hue | Ouverte | main | — | 13/08/2026 14:34 |
| [#8636 — fix(hub): avoid duplicate org in "View on HuggingFace" URL](https://github.com/janhq/jan/pull/8636) | SnowingFox | Ouverte | main | — | 28/08/2026 06:21 |
| [#8633 — fix(utils): honor NO_PROXY/no_proxy env var in should_bypass_proxy](https://github.com/janhq/jan/pull/8633) | SnowingFox | Ouverte | main | — | 28/08/2026 05:45 |
| [#8631 — fix(i18n): complete Traditional Chinese chat and assistant copy](https://github.com/janhq/jan/pull/8631) | nrps9909 | Ouverte | main | — | 27/08/2026 22:15 |
| [#8627 — fix(server): accept custom-scheme origins (e.g. app://obsidian.md) in CORS trusted hosts](https://github.com/janhq/jan/pull/8627) | SnowingFox | Ouverte | main | — | 28/08/2026 05:39 |
| [#8589 — feat(mcp): add per-server auto-approve toggle in settings](https://github.com/janhq/jan/pull/8589) | wuisabel-gif | Ouverte | main | — | 04/08/2026 06:40 |
| [#8587 — add Hebrew localization](https://github.com/janhq/jan/pull/8587) | chovevan-miktsoi | Ouverte | main | — | 07/08/2026 03:04 |
| [#8560 — feat: add Apiário Dev as a native provider](https://github.com/janhq/jan/pull/8560) | Elissdev | Ouverte | main | — | 29/07/2026 19:03 |
| [#8512 — Add Eden AI as a predefined model provider](https://github.com/janhq/jan/pull/8512) | MVS-source | Ouverte | main | — | 23/07/2026 14:48 |
| [#8452 — fix: upgrade form-data to 2.5.4, 3.0.4, 4.0.4 (CVE-2025-7783)](https://github.com/janhq/jan/pull/8452) | anupamme | Ouverte | main | — | 21/07/2026 03:54 |
| [#8451 — feat(desktop): add fish shell support for Claude Code env export](https://github.com/janhq/jan/pull/8451) | dfjay | Ouverte | main | — | 21/07/2026 10:40 |
| [#8445 — fix: send a single auth header when listing models and testing keys](https://github.com/janhq/jan/pull/8445) | MFA-G | Ouverte | main | — | 17/07/2026 16:28 |
| [#8424 — feat: add MiniMax M3 model support](https://github.com/janhq/jan/pull/8424) | octo-patch | Ouverte | main | — | 13/07/2026 09:01 |
| [#8413 — feat: add DaoXE as a predefined provider](https://github.com/janhq/jan/pull/8413) | seven7763 | Ouverte | main | — | 17/07/2026 22:13 |
| [#8407 — feat: add UnoRouter as a remote model provider](https://github.com/janhq/jan/pull/8407) | 0-don | Ouverte | main | — | 10/07/2026 00:06 |
| [#8399 — feat: add TokenLab provider](https://github.com/janhq/jan/pull/8399) | hedging8563 | Ouverte | main | — | 02/10/2026 23:57 |
| [#8367 — feat: multi-model Compare view](https://github.com/janhq/jan/pull/8367) | caezium | Ouverte | main | — | 30/06/2026 14:10 |
| [#8361 — feat: add Gonka Broker as a model provider](https://github.com/janhq/jan/pull/8361) | iamoeco | Ouverte | main | — | 13/07/2026 08:49 |
| [#8355 — Fix for windows arm64.](https://github.com/janhq/jan/pull/8355) | larroy | Ouverte | main | — | 06/08/2026 17:30 |
| [#8347 — feat: add category filter bar to the Hub for improved model discoverability](https://github.com/janhq/jan/pull/8347) | JoelJose23 | Ouverte | main | — | 28/06/2026 09:06 |
| [#8326 — feat: add Requesty as a remote model provider](https://github.com/janhq/jan/pull/8326) | Thibaultjaigu | Ouverte | main | — | 12/09/2026 13:23 |
| [#8319 — feat(lemonade): native Lemonade server integration](https://github.com/janhq/jan/pull/8319) | abn | Ouverte | main | — | 29/08/2026 20:02 |
| [#8307 — Add TrustedRouter as a built-in cloud provider](https://github.com/janhq/jan/pull/8307) | jperla | Ouverte | main | — | 08/08/2026 22:10 |
| [#8302 — fix: invoke Windows copy through cmd in Makefile](https://github.com/janhq/jan/pull/8302) | ianmohney | Ouverte | main | — | 12/06/2026 04:06 |
| [#8301 — feat(mcp): add Olostep as a default web data MCP server](https://github.com/janhq/jan/pull/8301) | awais-yousaf75 | Ouverte | main | — | 25/07/2026 16:16 |
| [#8292 — add copyable code snippets](https://github.com/janhq/jan/pull/8292) | FedeCuci | Ouverte | main | — | 09/06/2026 04:08 |
| [#8289 — fix(i18n): complete and clean up German (de-DE) common translations](https://github.com/janhq/jan/pull/8289) | tobiasheinrichfaska | Ouverte | main | — | 13/06/2026 04:05 |
| [#8288 — feat: full-text thread search](https://github.com/janhq/jan/pull/8288) | FedeCuci | Ouverte | main | — | 09/06/2026 04:08 |
| [#8287 — feat: manual model filter for providers and filtered model dropdown](https://github.com/janhq/jan/pull/8287) | FedeCuci | Ouverte | main | — | 25/06/2026 15:52 |
| [#8286 — feat: model name labels, SSE custom event filter, emoji chat titles](https://github.com/janhq/jan/pull/8286) | FedeCuci | Ouverte | main | — | 10/06/2026 09:20 |
| [#8285 — fix(i18n): complete and improve German (de-DE) settings translations](https://github.com/janhq/jan/pull/8285) | tobiasheinrichfaska | Ouverte | main | — | 30/06/2026 06:14 |
| [#8284 — fix(i18n): complete and improve German (de-DE) provider translations](https://github.com/janhq/jan/pull/8284) | tobiasheinrichfaska | Ouverte | main | — | 10/06/2026 04:05 |
| [#8256 — Resolve (untested): 8221-improve-german-translation](https://github.com/janhq/jan/pull/8256) | Schwachinformatiker | Ouverte | main | — | 01/07/2026 20:15 |
| [#8251 — feat: upgrade MiniMax default model to M3](https://github.com/janhq/jan/pull/8251) | octo-patch | Ouverte | main | — | 03/06/2026 10:41 |
| [#8218 — feat: add OpenUI integration](https://github.com/janhq/jan/pull/8218) | vishxrad | Ouverte | main | — | 20/06/2026 04:07 |
| [#8169 — feat: add NEAR AI Cloud provider](https://github.com/janhq/jan/pull/8169) | PierreLeGuen | Ouverte | main | — | 03/06/2026 10:40 |
| [#8118 — feat: Codex support](https://github.com/janhq/jan/pull/8118) | thewulf7 | Ouverte | main | — | 03/06/2026 10:41 |
| [#8115 — feat: adding speculative decoding and draft model support](https://github.com/janhq/jan/pull/8115) | thewulf7 | Ouverte | main | — | 06/06/2026 04:06 |
| [#8114 — fix(ci): explicit Discord workflow secrets (workflow_call)](https://github.com/janhq/jan/pull/8114) | enjoyandlove | Ouverte | main | — | 03/06/2026 10:41 |
| [#8113 — feat(desktop): add category for linux build](https://github.com/janhq/jan/pull/8113) | xuars | Ouverte | main | — | 25/06/2026 11:32 |
| [#8103 — feat: add Perplexity as a cloud model provider](https://github.com/janhq/jan/pull/8103) | jliounis | Ouverte | main | blocked: Out of scope | 24/09/2026 22:26 |
| [#8093 — fix: isolate model selection per chat to prevent cross-chat leakage](https://github.com/janhq/jan/pull/8093) | octo-patch | Ouverte | main | — | 01/05/2026 04:04 |
| [#8091 — Re-read assistant definition from disk on editing](https://github.com/janhq/jan/pull/8091) | sshirokov | Ouverte | main | — | 25/06/2026 01:34 |
| [#8088 — docs: Add FuturMix as a remote model provider](https://github.com/janhq/jan/pull/8088) | FuturMix | Ouverte | main | blocked: Out of scope | 06/06/2026 04:03 |
| [#8077 — chore: remove unused jan_utils::string::parse_uuid](https://github.com/janhq/jan/pull/8077) | since-2017-hub | Ouverte | main | — | 01/05/2026 04:05 |
| [#8071 — fix(threads): write messages.jsonl atomically to prevent corruption (#8019)](https://github.com/janhq/jan/pull/8071) | greatjourney589 | Ouverte | main | — | 01/05/2026 04:03 |
| [#8068 — fix(filesystem): prevent path traversal in mv, mkdir, and write_file_sync](https://github.com/janhq/jan/pull/8068) | greatjourney589 | Ouverte | main | — | 01/05/2026 04:03 |
| [#8066 — Refactor/8063 decompose monolithic components](https://github.com/janhq/jan/pull/8066) | thomascolden585-svg | Ouverte | main | — | 01/05/2026 04:04 |
| [#8065 — chore: remove unused `jan_utils::cli` module](https://github.com/janhq/jan/pull/8065) | FairyPigDev | Ouverte | main | — | 01/05/2026 04:04 |
| [#8061 — chore: remove unused emptyThreadContent export from lib/completion](https://github.com/janhq/jan/pull/8061) | atoz96 | Ouverte | main | — | 03/06/2026 10:41 |
| [#8049 — fix: add xhtml to supported file extensions for upload](https://github.com/janhq/jan/pull/8049) | octo-patch | Ouverte | main | — | 01/05/2026 04:03 |
| [#8043 — chore: remove duplicate local sanitizeModelId in MlxModelDownloadAction](https://github.com/janhq/jan/pull/8043) | atoz96 | Ouverte | main | — | 03/06/2026 10:42 |
| [#8039 — feat: add reasoning, web search, and embeddings capability toggles](https://github.com/janhq/jan/pull/8039) | dataCenter430 | Ouverte | main | — | 06/06/2026 04:12 |
| [#8038 — fix(mcp): guard backoff multiplier and delay against non-finite floats](https://github.com/janhq/jan/pull/8038) | carladams1299-lab | Ouverte | main | — | 01/05/2026 04:04 |
| [#8037 — fix(security): enforce JAN_SIGNING_KEY for release HMAC signing (#8016)](https://github.com/janhq/jan/pull/8037) | enjoyandlove | Ouverte | main | — | 06/06/2026 04:14 |
| [#8035 — Test/proxy failure path coverage](https://github.com/janhq/jan/pull/8035) | Lobster-0429 | Ouverte | main | — | 06/06/2026 04:12 |
| [#8033 — fix: prevent backend panic on download event emit failure](https://github.com/janhq/jan/pull/8033) | Lobster-0429 | Ouverte | main | — | 06/06/2026 04:03 |
| [#8021 — chore: remove unused ConversationEmptyState component](https://github.com/janhq/jan/pull/8021) | bitcompass | Ouverte | main | — | 03/06/2026 10:41 |
| [#8013 — refactor: extract getVectorDBExtension() helper in RagExtension](https://github.com/janhq/jan/pull/8013) | dataCenter430 | Ouverte | main | — | 03/06/2026 10:41 |
| [#8008 — fix/llamacpp-thread-model-openAI-fallback #8007](https://github.com/janhq/jan/pull/8008) | enjoyandlove | Ouverte | main | — | 03/06/2026 10:42 |
| [#7992 — add OpenAI-compatible provider docs and improve refresh error feedback](https://github.com/janhq/jan/pull/7992) | jimmyzhuu | Ouverte | main | — | 03/06/2026 10:41 |
| [#7974 — fix(llamacpp): fetch updates from upstream and fix install-from-file](https://github.com/janhq/jan/pull/7974) | Lobster-0429 | Ouverte | main | — | 06/06/2026 04:14 |
| [#7958 — feat: Add folder-based GGUF import in Llamacpp UI](https://github.com/janhq/jan/pull/7958) | jsdevninja | Ouverte | main | new feature | 01/05/2026 04:04 |
| [#7944 — feat: add /v1/models/load, /v1/models/available, and /v1/models/unload API endpoints](https://github.com/janhq/jan/pull/7944) | ccaicomics-dev | Ouverte | main | — | 03/06/2026 10:41 |
| [#7943 — fix: local embedding model for offline RAG uploads](https://github.com/janhq/jan/pull/7943) | EndlessLucky | Ouverte | main | need: testing | 03/06/2026 10:41 |
| [#7933 — feat: add option to play sound when AI finishes responding](https://github.com/janhq/jan/pull/7933) | statxc | Ouverte | main | blocked: Out of scope | 03/06/2026 10:41 |
| [#7928 — fix: resolve 422 error when using Cerebras as inference provider](https://github.com/janhq/jan/pull/7928) | rohanprichard | Ouverte | main | needs: rework | 01/05/2026 04:04 |
| [#7926 — fix: drag-and-drop functionality and bugs in Tauri 2.0](https://github.com/janhq/jan/pull/7926) | T03N | Ouverte | main | new feature | 01/05/2026 04:04 |
| [#7919 — fix: migrate remaining raw localStorage usages to fileStorage to prevent settings reset on restart](https://github.com/janhq/jan/pull/7919) | Crystora | Ouverte | main | need: testing | 01/05/2026 04:05 |
| [#7918 — feat: add thinking budget to llama.cpp](https://github.com/janhq/jan/pull/7918) | markmehere | Ouverte | main | needs: rework, new feature | 06/06/2026 04:03 |
| [#7911 — fix: remove toaster position offset](https://github.com/janhq/jan/pull/7911) | urmauur | Ouverte | main | need: testing, needs: rework | 01/05/2026 04:05 |
| [#7908 — feat: add conversation export as Markdown and JSON from thread sidebar menu and header](https://github.com/janhq/jan/pull/7908) | Crystora | Ouverte | main | need: testing, new feature | 01/05/2026 04:05 |
| [#7900 — feat: screen-to-text capture with OCR, overlay, and region/window modes](https://github.com/janhq/jan/pull/7900) | claytonlin1110 | Ouverte | main | new feature | 21/06/2026 04:07 |
| [#7814 — feat: add Lightpanda Browser MCP](https://github.com/janhq/jan/pull/7814) | YashJain14 | Ouverte | main | blocked: Out of scope | 06/06/2026 04:03 |
| [#7784 — feat: llmfit integration - score models based on users hardware](https://github.com/janhq/jan/pull/7784) | thewulf7 | Ouverte | main | blocked: Out of scope, new feature | 06/06/2026 04:04 |
| [#7534 — fix(security): guard archive extraction paths](https://github.com/janhq/jan/pull/7534) | lawyered0 | Ouverte | main | needs: rework | 01/05/2026 04:05 |
| [#7349 — feat: Aggiunta localizzazione italiana](https://github.com/janhq/jan/pull/7349) | CR0CCO | Ouverte | main | needs: rework, i18n | 01/05/2026 04:05 |
| [#7346 — Create fedora rpms build artifacts for release](https://github.com/janhq/jan/pull/7346) | SidShaytay | Ouverte | main | blocked: Out of scope | 01/05/2026 04:05 |
| [#7278 — fix: mcp failed+wayland nvidia fallback on Linux ](https://github.com/janhq/jan/pull/7278) | endermeme | Ouverte | main | needs: rework | 03/10/2026 22:03 |

Données du relevé : `.build/jan-open-prs-2026-10-19.json`. Les analyses détaillées de nos deux contributions suivent ci-dessous.

## Application et fork conservé

- Application utilisée : **Jan officiel 0.8.6**, réinstallé depuis [la release officielle](https://github.com/janhq/jan/releases/tag/v0.8.6), signature Jan AI valide, installation terminée avec le code 0 et ouverture de l’interface vérifiée. Conversations et modèles conservés.
- Exécutable installé : `C:\Users\jmsga\AppData\Local\Programs\Jan\Jan-Desktop.exe`.
- Installateur vérifié : `exe/Jan_0.8.6_x64-official-setup.exe`, SHA-256 `F47F2D205EB92743BDD60FFE7D3B7B434B45A97A8DCE092C1185C97D1F5A5268`.
- À la demande explicite de l’utilisateur, le fork et toutes les modifications locales sont conservés dans `C:\msys64\home\jmsga\jan`. `origin` reste `https://github.com/TRON-ABS/jan.git` et `upstream` reste `https://github.com/janhq/jan.git`.
- Branche locale active : `update-llamacpp-b11681`, HEAD `6f0bbf0e6e30951a82150c6428d9e1605259abdd`, avec des modifications non commitées. Les branches du fork ne sont pas incorporées à l’application officielle par cette installation.

## Nos pull requests en cours

La recherche `repo:janhq/jan is:pr author:TRON-ABS` renvoie **deux PR, toutes deux ouvertes et non fusionnées**.

| PR | État vérifié | Contrôles et prochaine action |
|---|---|---|
| [#9299 — llama.cpp b11681](https://github.com/janhq/jan/pull/9299) | Ouverte, hors brouillon ; `update-llamacpp-b11681` vers `dev` ; tête `6f0bbf0e6e30951a82150c6428d9e1605259abdd`. Dernière mise à jour GitHub : 16/10/2026 à 10 h 39, heure de Paris. Aucun commentaire ni revue soumis au relevé. | Aucun check run renvoyé sur cette tête, ni upstream ni sur le fork. Le statut combiné « pending » sans statut enregistré ne prouve pas qu’une CI tourne. Restent les essais CPU/Vulkan, chargement/déchargement et génération, puis la clarification de la cible `dev` avant toute modification de PR. |
| [#9302 — Distribution Windows portable](https://github.com/janhq/jan/pull/9302) | Ouverte, **brouillon** ; `codex/windows-portable` vers `main` ; tête `aaa998f3521fece5c04d634cbe6fd8c33d4d1650`. Dernière mise à jour GitHub : 16/10/2026 à 13 h 19, heure de Paris. Aucun commentaire ni revue soumis au relevé. | Check [`package` du fork réussi](https://github.com/TRON-ABS/jan/actions/runs/38892765556/job/116945981028) ; aucun check run upstream renvoyé. Restent une compilation réelle de cette branche, extraction séparée du ZIP, ouverture de l’interface, chargement/génération, chemins avec espaces et contrôle du parcours de publication/signature avant demande de revue. |

GitHub rapporte `mergeable_state=unstable` pour les deux PR. Ce seul champ ne démontre ni un conflit de fusion ni une validation complète. Les essais historiques de la version maison ne remplacent pas les validations des têtes exactes ci-dessus.

## Correctifs déjà présents sur le fork, sans PR upstream de notre auteur

| Branche conservée | Commit local relevé | Référence |
|---|---|---|
| `codex/fix-filesystem-path-scope` | `cd4bea85a` | Adaptation de [#8068](https://github.com/janhq/jan/pull/8068). |
| `codex/atomic-thread-message-write` | `ef1feae40` | Adaptation de [#8071](https://github.com/janhq/jan/pull/8071). |
| `codex/fix-api-utf8` | `9bc866c86` | Adaptation de [#8685](https://github.com/janhq/jan/pull/8685). |
| `codex/fix-windows-mcp-clippy` | `13e8373c3` | Nettoyage Clippy MCP Windows. |

Ces commits sont relevés dans les branches locales existantes ; leurs résultats de tests historiques sont conservés plus bas. Aucun nouveau test ou build de ces branches n’a été exécuté pour cette mise à jour documentaire.

## Autres PR du suivi recontrôlées

Les PR **#8068, #8071, #8685, #9150, #9281, #8855, #9294, #9297, #9168, #9235, #7908, #9007, #9006, #7534, #8698 et #7943** sont toutes encore **ouvertes et non fusionnées** au relevé. Leurs anciennes analyses ci-dessous restent des observations datées : les diffs, labels et validations fonctionnelles n’ont pas été réaudités ici.

---

# Historique : version maison Jan, correctifs et compilations locales

## Consigne permanente — préserver les performances CUDA

Pour notre portable sur RTX 5070 Laptop, utiliser **CUDA 13.4**, architecture
`sm_120` (transformée en `120a` par llama.cpp), avec **`GGML_CUDA_GRAPHS=ON`**.
Ne pas revenir au moteur Vulkan par défaut lors d'une reconstruction locale.
Conserver le contexte utilisateur de **130 000 tokens** et ses paramètres de
cache ; ne pas les réduire pour masquer une régression de performances.

**Erreur à ne plus reproduire :** notre compilation de ggml en étage séparé
perdait `GGML_CUDA_GRAPHS_DEFAULT=ON`, défini par le CMake racine de llama.cpp.
Le défaut autonome de ggml est OFF. Cela a produit un moteur à environ
20–30 tokens/s malgré CUDA, toutes les couches sur GPU et Flash Attention actif.
Le correctif explicite est dans
`src-tauri/plugins/tauri-plugin-llamacpp/build.rs` ; le helper
`scripts/build-windows-cuda-engine.ps1` vérifie l'option avant staging.

Avant de livrer un moteur reconstruit :

1. Vérifier `GGML_CUDA_GRAPHS:BOOL=ON` dans le **CMakeCache du build CUDA utilisé**.
2. Vérifier que le **worker du portable final** détecte `CUDA0` / RTX 5070,
   avec les DLL CUDA embarquées et sans dépendre du PATH du toolkit.
3. Comparer les empreintes du worker **et de `ggml-cuda.dll`** entre le moteur
   testé et le portable livré. Le hash du seul EXE d'interface ne suffit pas :
   il peut rester identique après une correction du moteur.
4. Après une modification ou mise à jour du moteur, mesurer le décodage réel
   avec le même GGUF, le même prompt, le même contexte effectif, les mêmes
   types de cache et une longueur de génération fixée. Contrôler le contexte
   dans les logs (`n_ctx` / `n_ctx_slot`), pas uniquement dans l'interface.
5. Si la vitesse régresse fortement, diagnostiquer avant livraison et conserver
   les résultats et journaux. Ne pas conclure à partir de la seule VRAM ou du
   simple succès d'une génération de quelques tokens.

Référence du 17 octobre 2026 : après correction, deux essais de 128 tokens à
130 000 tokens de contexte demandé donnent **146–178 tokens/s** sur le portable
(Flash Attention Auto), contre environ **134 tokens/s** pour Jan original dans
ce contrôle. Ces valeurs sont des mesures de référence, pas une garantie pour
toutes les conversations. Preuves : `.build/tron-speed-graphs/results.json` et
`.build/cuda-graphs-artifacts.json`.

## Régression de hauteur des discussions corrigée — 17 octobre 2026

Défaut reproduit visuellement dans le portable : après navigation vers une discussion, la saisie remontait en haut et les réponses étaient masquées. Cause : les routes avaient été passées à `h-full`, mais le conteneur AppLayout utilisait lui-même une hauteur relative sans parent de hauteur définie. La zone de messages en position absolue ne donnait aucune hauteur intrinsèque au conteneur flex.

Correction ciblée : AppLayout possède désormais une hauteur explicite `h-dvh`, bornée au viewport. Dans les discussions et Cowork, les conteneurs flex de messages ont `min-h-0` et ne forcent plus inutilement `h-full` ; la saisie ne rétrécit pas (`shrink-0`). Navigation intégrée et voyant sous la saisie conservés.

Validation : 65 tests ciblés réussis avec contrôle du conteneur de hauteur explicite ; TypeScript/Vite, EXE release et installateurs NSIS/MSI reconstruits, portable actualisé. Contrôle natif avec computer-use : défaut observé avant correction dans Jan ; lancement du nouvel EXE portable ; accueil avec saisie en bas ; recherche d'une discussion sauvegardée puis ouverture ; question, réponse enregistrée et ses sources visibles au-dessus de la saisie restée en bas. Aucun nouveau message envoyé et aucune discussion supprimée. Jan est laissé ouvert sur cette discussion après validation. Les six tailles de l'icône robot/disque ont également été contrôlées.

Base locale conservée : `update-llamacpp-b11681`, HEAD `6f0bbf0e6`, Jan 0.8.4. Artefacts actualisés dans `exe/` et `portable/Jan-Portable`. SHA-256 portable : `5914DC9C54E5825E07936C6C5BB073B8990BF5A78BBF2CC01E9145E995BF850D`. Journal : `.build/conversation-height-fix-build.log` ; empreintes : `.build/conversation-height-fix-artifacts.json`. Aucun changement d'inférence ni publication distante.

## Navigation intégrée au cadre — 17 octobre 2026, 00 h 09

Navigation Home/Cowork/Nouvelle discussion/Nouveaux projets/Rechercher/Configurations intégrée à gauche dans le cadre de ChatInput, sur une ligne compacte de 24 pixels et défilable horizontalement si nécessaire. Voyant de compatibilité déplacé seul au centre sous le cadre, avec ses critères et couleurs existants. Accueil descendu à 8 pixels du bas pour l'ensemble saisie/voyant. Marges inférieures et anciennes réservations de footer supprimées sur les discussions et Cowork ; leurs hauteurs suivent désormais le parent. Navigation indépendante conservée sur les pages sans champ de saisie, notamment les réglages.

Validation : 65 tests ciblés réussis (ChatInput 32, historique 7, accueil 11, layout racine 15), lint de la navigation et diff vérifiés. Trois attentes de tests obsolètes sur l'ancienne barre latérale, l'ancien header et l'ancien sélecteur de l'accueil ont été adaptées à l'interface maison déjà en place. TypeScript/Vite, EXE release et installateurs NSIS/MSI compilés. Portable mis à jour et empreinte identique au release ; six tailles d'icônes embarquées contrôlées. L'interface native n'a pas été lancée pour contrôle visuel pendant cette modification. Historique et logique d'inférence préservés.

Base locale conservée : `update-llamacpp-b11681`, HEAD `6f0bbf0e6`, Jan 0.8.4. Portable : `portable/Jan-Portable/Jan-Desktop.exe`. Installateurs actualisés dans `exe/`. SHA-256 portable : `4EA7E810BF8A2282916EBA75CFC9FCD7D14D949B6C2377322EDC0E651293E5D3`. Journal : `.build/composer-navigation-build.log` ; preuves : `.build/composer-navigation-artifacts.json`. Aucun envoi distant.

## Historique dans la barre de saisie — 16 octobre 2026, 23 h 52

Ajout de `ConversationHistoryPopover` immédiatement après les contrôles et le voyant de compatibilité du modèle, via ChatInput. Le bouton ouvre vers le haut un panneau borné au bord supérieur du cadre de saisie ; hauteur recalculée avec ResizeObserver, redimensionnement et défilement. Résultats défilants, titre et date/heure locale de dernière activité, tri récent en premier. Présentation compacte pour les petits cadres. Toutes les discussions sauvegardées, y compris celles des projets, sont incluses ; les discussions temporaires sont exclues.

Recherche par titre, date/heure affichées et nom de projet, sans distinction d'accents ni de casse. Elle ne constitue pas une indexation du contenu intégral des messages. Clic pour ouvrir la discussion ; suppression individuelle via le dialogue existant. Effacer une autre discussion conserve la discussion active ; supprimer celle en cours renvoie à l'accueil. Textes FR/EN ajoutés. Le bouton reste hors de la zone désactivée pendant le streaming.

Validation : 7 tests du panneau et 31 tests ChatInput réussis (38 au total), lint du nouveau composant, TypeScript/Vite, compilation release Windows, packaging NSIS/MSI et portable réussis. Le cas compact a été ajouté avant la compilation finale. Interface native non lancée pour validation visuelle pendant ce travail ; géométrie, recherche et interactions vérifiées par les tests. Icônes robot/disque embarquées vérifiées aux six tailles. Aucun changement d'inférence, de données existantes ou de publication distante.

Base locale conservée : `update-llamacpp-b11681`, HEAD `6f0bbf0e6`, Jan 0.8.4. EXE utilisateur à jour : `portable/Jan-Portable/Jan-Desktop.exe`, identique au nouvel EXE release. Installateurs actualisés dans `exe/`. SHA-256 portable : `D4571B33DCA9518A36250A796A8D36EBBA31E8A1BFF50A0790177E7403C65A53`. Journal : `.build/conversation-history-build.log` ; empreintes : `.build/conversation-history-artifacts.json`. Les conseils Vite sur les gros chunks et Tauri sur l'identifiant historique sont conservés.

## Logo robot/disque et icône du portable — 16 octobre 2026, 23 h 30

Logo sélectionné appliqué aux quatre sources partagées : robot masculin moderne au centre du disque d'identité cyan, puis régénération des icônes Tauri. Base locale conservée : `update-llamacpp-b11681`, HEAD `6f0bbf0e6`, Jan 0.8.4 ; aucun changement du worker ni publication distante.

Diagnostic de la copie précise signalée (`portable/Jan-Portable/Jan-Desktop.exe`) : les ressources PE contenaient déjà six icônes, et Windows Shell renvoyait la main holographique avant remplacement (`.build/shell-icon-before.png`). L'absence d'icône signalée dans la vue de l'Explorateur n'a donc pas été reproduite par extraction Shell ; un affichage en cache est une hypothèse. Après reconstruction et notification ciblée SHCNE_UPDATEITEM, Shell renvoie le robot/disque (`.build/shell-icon-after.png`). Pas de suppression de caches ni de redémarrage de l'Explorateur.

Défaut de build indépendant constaté : tauri-build ne suivait pas le fichier ICO dans ses directives Cargo. Ajout de `cargo:rerun-if-changed=icons/icon.ico` dans `src-tauri/build.rs` ; présence vérifiée dans la nouvelle sortie du build. `scripts/refresh-windows-icon.ps1` notifie désormais Windows après remplacement du portable, appelé par le packager. Références : [Cargo, suivi des entrées](https://doc.rust-lang.org/cargo/reference/build-scripts.html#rerun-if-changed) et [Microsoft SHChangeNotify](https://learn.microsoft.com/en-us/windows/win32/api/shlobj_core/nf-shlobj_core-shchangenotify).

Validation : syntaxe des scripts PowerShell et diff contrôlés ; TypeScript/Vite, release Windows, installateurs NSIS/MSI et portable reconstruits. Comparaison binaire des ressources ICO 16, 24, 32, 48, 64 et 256 pixels avec la source : six correspondances exactes (`.build/check-exe-icon.py`, `.build/robot-disc-icon-verification.json`). Ce contrôle échouait sur l'ancien EXE après sélection du nouveau logo (`.build/robot-disc-icon-before.log`). Contrôle Shell final effectué sur le chemin utilisateur. Pas de lancement de Jan ni de test d'inférence pour ce changement visuel.

Nouveaux artefacts : `exe/Jan_0.8.4_x64-setup.exe`, `exe/Jan_0.8.4_x64_en-US.msi`, `portable/Jan-Portable/Jan-Desktop.exe`. SHA-256 portable : `965B20E652B17BC10C56316144E6EF74C33019EC225E5B8931CC9270641B6FE7`. Journal : `.build/robot-disc-build.log`. Empreintes : `.build/robot-disc-artifacts.json`. Conseils de taille JS et identifiant macOS historique conservés ; aucune réapparition de l'avertissement de marquage updater.

## Avertissements corrigés — 16 octobre 2026, 23 h 06

Base conservée : `update-llamacpp-b11681`, HEAD `6f0bbf0e6`, Jan 0.8.4 et changements maison existants. Le CLI Tauri 2.8.4 utilisait l'ancien repérage du symbole Windows, incompatible avec le marqueur du moteur Rust Tauri 2.11.5 / tauri-utils 2.9.3 présent. `@tauri-apps/cli` est désormais fixé à 2.11.4 dans package.json et yarn.lock. Aucun changement des dépendances Rust ni de l'identifiant de l'application. Référence technique : [implémentation officielle 2.11.4](https://github.com/tauri-apps/tauri/blob/tauri-cli-v2.11.4/crates/tauri-bundler/src/bundle.rs), qui remplace le marqueur `__TAURI_BUNDLE_TYPE_VAR_UNK` et restaure l'EXE après chaque format de paquet.

Corrections de code : deux variables locales AMD renommées en snake_case sans toucher aux symboles DLL ; suppression de la fonction et de la branche mortes liées aux variantes CPU déjà désactivées ; imports statiques de l'API event dans ThemeProvider et TauriWindowService, API déjà présente dans les chunks.

Validation : 24 tests thème/fenêtres réussis ; TypeScript/Vite, Rust release, installateurs NSIS/MSI et portable reconstruits via `.build/build-tron-ui.ps1`. Aucun avertissement Rust ni échec de marquage Tauri dans `.build/warnings-fixed-build.log`. Marquage des entrées de packaging NSIS et MSI contrôlé : marqueur UNK absent, marqueur attendu présent deux fois. MSI extrait sans installation avec `msiexec /a`, puis contrôle de l'EXE livré réussi (`.build/verify-windows-bundle.py`, `.build/warnings-fixed-bundle-check.json`). Aucune mise à jour distante réellement installée, aucun lancement GUI ni changement du worker.

Artefacts à jour : `exe/Jan_0.8.4_x64-setup.exe`, `exe/Jan_0.8.4_x64_en-US.msi`, `portable/Jan-Portable/Jan-Desktop.exe`. SHA-256 EXE portable : `DE1B5AC0CC581E84C5E53FBCB68C932ED5B77B01501FE09EE721BDCE1CAC2708`. Empreintes complètes : `.build/warnings-fixed-artifacts.json`.

Conseils restants : gros chunks JavaScript et identifiant historique `jan.ai.app` (préservé pour l'identité et les données). Le nouveau CLI a renouvelé automatiquement son cache NSIS incomplet vers NSIS 3.11 ; téléchargement et vérification de hash réussis. L'installation Yarn signale aussi des peer dependencies préexistantes React/TypeScript, hors de ces corrections ciblées. Aucun avertissement n'a été masqué et aucune publication distante effectuée.

## Compilation locale du 16 octobre 2026 — icônes Tron et Web Search

Base : `update-llamacpp-b11681`, HEAD `6f0bbf0e6`, Jan 0.8.4, modifications locales conservées. Logos de la main remplacés par le visuel holographique cyan, avatars existants pris en charge. DuckDuckGo masqué dans la liste MCP et son éditeur JSON ; les éditions globales préservent son état, contrôlé par Web Search.

Compilation réussie via `.build/build-tron-ui.ps1` : extensions, icônes, TypeScript/Vite, EXE release, NSIS et MSI. Portable préparé avec ses ressources dans `portable/Jan-Portable`. Tests ciblés déjà exécutés : 14 tests AvatarEmoji et 5 tests page MCP réussis. Empreinte EXE portable identique au nouvel EXE de `C:/jb/release`. Pas de lancement graphique ni de nouveau test d'inférence pour cette compilation d'interface.

Artefacts : `exe/Jan_0.8.4_x64-setup.exe`, `exe/Jan_0.8.4_x64_en-US.msi`, `portable/Jan-Portable/Jan-Desktop.exe`. SHA-256 EXE portable : `5FBADDDFDC5F900A2BA12BAF50F725E15F12C631FB688522D71D8B946DD253AA`. Empreintes complètes : `.build/tron-ui-artifacts.json` ; journal : `.build/tron-ui-build.log`. Worker embarqué : SHA-256 `85F41C860D78D239344996D7055E62ED66D845D63DE9693D476477AE29FDDF5B`.

Avertissements conservés dans le journal : imports Vite et tailles de chunks, identifiant `.app`, fonction build llama.cpp inutilisée, noms AMD, et variable `__TAURI_BUNDLE_TYPE` introuvable lors du packaging. Ce dernier avertissement peut affecter la mise à jour automatique ; compilation et création des deux installateurs réussies. Aucun envoi distant.

**Consigne active du 16 octobre 2026 — Europe/Paris : plus aucun fork ni publication ; uniquement des correctifs sur notre version maison, pour le moment.** Cette consigne remplace les anciennes instructions de contribution et les autorisations de publication précédentes, jusqu'à une nouvelle demande explicite de l'utilisateur.

## Mode de travail en vigueur

- Corriger et améliorer notre version maison dans le dépôt local. Priorité au fonctionnement des modèles, à la stabilité, à la sécurité et aux versions EXE/portable.
- Aucun nouveau fork, `git push`, création ou mise à jour de PR, release GitHub, envoi de code distant ou déclenchement de CI distante. Une ancienne autorisation ou une clé disponible ne réactive pas ces opérations.
- Les branches et commits locaux peuvent servir à isoler les correctifs. Préserver les modifications existantes et les données utilisateur.
- Les PR et le code amont restent des références consultables pour comparer, comprendre un problème ou adapter localement une solution. Vérifier que notre version présente réellement le défaut avant d'intégrer un changement.
- Les branches, forks et PR déjà publiés restent conservés en historique. Leur suivi de contribution est suspendu ; cette consigne ne demande pas leur suppression.

## Procédure active pour chaque correctif maison

1. **Identifier notre base réelle** : état Git, branche, modifications locales, version de Jan, version et empreinte du worker llama.cpp, dossier exact de l'EXE ou du portable utilisé. Un fix présent dans une autre branche du fork n'est pas automatiquement intégré à notre version maison.
2. **Reproduire le défaut** sur cette version avec les logs et, si pertinent, le modèle et les paramètres de l'utilisateur. Utiliser des données et presets de test séparés quand c'est possible.
3. **Appliquer un correctif ciblé et relisible**, en préservant le travail déjà présent. Comparer les solutions amont sans fusion ni rebase automatique.
4. **Traiter les nouvelles découvertes** : mettre en évidence les erreurs, avertissements et défauts de tests découverts ; déterminer leur cause et leur présence avant modification ; corriger les problèmes actionnables dans le périmètre avant livraison locale. Les avertissements préexistants pertinents doivent aussi être corrigés quand c'est sûr. Isoler les sujets indépendants et signaler tout blocage. Ne pas masquer les lints pour obtenir du vert ; vérifier qu'un test n'a pas silencieusement sauté son scénario après un échec de préparation.
5. **Tester et compiler les composants concernés** : régression avant/après, tests pertinents, formatage des lignes modifiées, contrôle du diff. Pour un changement touchant le portable ou l'inférence, reconstruire les éléments concernés et vérifier le vrai chargement et une génération avec le modèle visé. Distinguer test du moteur et validation visuelle de l'interface.
6. **Préparer les artefacts locaux** dans `C:\jb\release`, avec un dossier distinct pour les essais. Extraire le nouveau ZIP, vérifier ses ressources et leurs empreintes, puis tester depuis cette extraction. La présence d'un ancien EXE ne prouve pas que le nouveau build a réussi.
7. **Tenir le suivi local à jour** dans `PR.md` et `Novera_Contributions.txt` : problème, cause, fichiers corrigés, branche/base locale, commandes, résultats, limites, logs, chemins des artefacts et SHA-256. Terminer par un compte rendu des changements et des vérifications, sans publication distante.

## Dernière référence locale validée

- Branche de la réparation portable : `update-llamacpp-b11681` ; Jan **0.8.4**, llama.cpp **b11681**.
- EXE : `C:\jb\release\Jan-Desktop.exe`.
- Copie portable extraite : `C:\jb\release\Jan-Portable-Corrige\Jan-Desktop.exe`.
- ZIP corrigé : `C:\jb\release\portable-fixed\Jan_0.8.4_x64-portable.zip`.
- Dernière réparation : chemin Windows du cache ; **206 tests extension réussis**, chargement et génération MiniCPM5-2B-Q4_K_M vérifiés depuis le worker du ZIP extrait, contexte 68 192, réponse « Hello! ». Interface non vérifiée visuellement pendant cet essai.
- Les versions, chemins et résultats ci-dessus sont un relevé historique à recontrôler lors de la prochaine intervention.

---

## Archive : ancienne procédure de contribution suspendue

**Tout ce qui suit est conservé comme référence et historique. Les étapes de fork, push, PR, signature/publication et les anciens ordres de priorité ne sont plus des instructions actives. Ils ne doivent être réactivés que sur nouvelle demande explicite de l'utilisateur.** Les preuves de tests et les liens historiques restent utiles pour les correctifs locaux.

## 1. Vérifier l'espace de travail avant toute modification

Depuis le dépôt concerné :

```powershell
git status --short
git branch --show-current
git remote -v
git worktree list
```

Contrôler que `origin` désigne `TRON-ABS/jan` et `upstream` désigne `janhq/jan`. Identifier les fichiers déjà modifiés et leur propriétaire. Ne pas embarquer les changements de build, de moteur ou de portable dans une autre contribution. Ne pas utiliser `reset --hard`, `clean -fd`, un changement global de fins de ligne ou un stash automatique pour faire disparaître des modifications inconnues.

Lire les `AGENTS.md` applicables, le `CONTRIBUTING.md` actuel, les instructions du composant et le modèle de PR. Relever les versions imposées par `rust-toolchain.toml`, les manifests et les lockfiles. Une ancienne note disant « toujours dev » n'est pas une règle permanente.

## 2. Actualiser les références, sans fusion automatique

```powershell
git fetch upstream main
git fetch origin
git log -1 --format="%H %s" upstream/main
```

Vérifier la réussite des commandes. Un `fetch` actualise les références ; il n'applique pas les commits à notre branche. Ne pas lancer un `git pull` sans avoir choisi sa branche et sa stratégie de fusion/rebase. Le `main` du fork peut être en retard : la base d'une nouvelle contribution vient de la branche upstream vérifiée. Voir la [documentation de git fetch](https://git-scm.com/docs/git-fetch).

Noter le SHA exact de la base, la date, le système et les versions des outils pour reproduire les résultats. Si la contribution vise une release ou `dev`, récupérer cette référence explicitement et expliquer ce choix.

## 3. Contrôler l'issue et les PR existantes

Sur GitHub, chercher dans les PR **ouvertes et fermées**, avec plusieurs indices : symptôme, message d'erreur, nom de fonction, chemin du fichier et numéro d'issue. Lire la description, les dernières discussions, les demandes de changements et les labels. Vérifier auteur, état brouillon, branche cible, SHA de tête et éventuelles PR dont dépend le travail.

Lire le diff réel et sa taille. Un titre « mise à jour d'une dépendance » ne suffit pas si le diff contient des dizaines de fichiers. Un nombre de fichiers nul mérite un contrôle de la comparaison et des branches. L'absence de résultat pour une seule recherche n'est pas une preuve d'absence de doublon.

| Situation constatée | Suite à donner |
|---|---|
| Le correctif est déjà dans la branche cible et le test passe | Ne pas réimplémenter. Documenter la vérification ; vérifier si l'issue ou la PR doit encore être suivie. |
| Une PR ouverte traite déjà le problème | La tester/revoir ; préparer au besoin une adaptation sur notre fork en citant l'origine. Éviter une nouvelle PR upstream identique. |
| Une partie du correctif est déjà intégrée | Isoler ce qui manque et vérifier son utilité ; ne pas appliquer tout le patch aveuglément. |
| La PR est fermée et le problème persiste | Comprendre la raison de fermeture, reproduire sur la base actuelle, puis expliquer ce qui justifie une nouvelle proposition. |
| Le patch est ancien, en conflit ou marqué `needs: rework` | Relire les demandes et l'architecture actuelle avant toute reprise. |
| Le sujet est marqué hors périmètre | Clarifier le périmètre avec les mainteneurs avant d'investir dans une nouvelle implémentation. Ne pas envoyer de message sans autorisation de l'utilisateur. |

## 4. Vérifier que main contient encore le problème

Comparer le patch proposé au **code actuel**, pas seulement au statut de la PR :

```powershell
git log upstream/main --oneline -- src-tauri/src/core/mcp/helpers.rs
git show upstream/main:src-tauri/src/core/mcp/helpers.rs
git show upstream/main:src-tauri/src/core/mcp/lockfile.rs
```

Adapter les chemins au sujet. Chercher aussi les nouvelles fonctions qui auraient remplacé l'ancien code. Une autre PR peut avoir intégré le même correctif sous un autre numéro ou par squash : la présence d'un ancien commit dans l'historique n'est pas le seul critère.

Reproduire le problème sur la base : test qui échoue, avertissement Clippy exact, erreur de build ou comportement observé. Conserver la commande, son code de sortie et un extrait de résultat. Si le problème n'est plus reproductible, analyser la différence avant de modifier quoi que ce soit.

## 5. Isoler le sujet dans une branche dédiée

Exemple de nouvelle contribution, avec un nom et un chemin encore inutilisés :

```powershell
git worktree add -b codex/fix-sujet .build/fix-sujet upstream/main
git -C .build/fix-sujet status --short
```

Réutiliser un checkout adapté s'il existe déjà. Un worktree laisse intact le travail en cours et permet de séparer les contributions. Il partage néanmoins l'historique et une partie de la configuration Git du dépôt : ce n'est pas une sandbox. Voir [git worktree](https://git-scm.com/docs/git-worktree).

Pour examiner la tête d'une PR, récupérer explicitement sa référence dans une branche locale distincte après avoir vérifié son numéro. Ne pas confondre le code proposé par son auteur et la base upstream. Créditer la PR ou le commit repris ; ne pas présenter une adaptation comme une découverte originale.

## 6. Appliquer le plus petit correctif utile

Corriger le comportement ou l'avertissement identifié. Garder séparés les changements indépendants : UTF-8, avertissements MCP, moteur llama.cpp et packaging portable ont leurs propres branches. Éviter les reformatages globaux, mises à jour de dépendances opportunistes et régénérations sans rapport.

Pendant cette correction, consigner chaque découverte et décider explicitement : la reproduire, comparer à `main`, puis la corriger avant publication si elle est actionnable et dans le périmètre. Une anomalie adjacente (y compris un avertissement de test préexistant) doit être réparée si elle est sûre et locale ; si elle forme un sujet indépendant, créer et finir un correctif séparé avant de publier la branche initiale. Ne pas supprimer un avertissement en le masquant avec un attribut `allow` sans justification.

Un test de régression est utile lorsqu'il protège un comportement réel. Pour enlever deux emprunts superflus d'un appel `Command::args`, les tests existants et Clippy sont préférables à un nouveau test qui recopie l'implémentation. Conserver les arguments, les protections et les règles de nettoyage des processus.

## 7. Valider avec des commandes et des preuves précises

| Contrôle | Preuve attendue |
|---|---|
| Avant / après | Même régression ou même commande de lint : échec avant, réussite après. |
| Tests ciblés | Tests du vrai composant ; nom de la suite, nombre de réussites, échecs et exclusions. Un extrait de fonction compilé seul est une reproduction, pas une validation du backend complet. |
| Formatage | `cargo fmt --check` ou rustfmt selon le dépôt. Distinguer les diagnostics hérités de ceux introduits ; ne pas annoncer une réussite si la commande échoue. |
| Lint Rust | Configuration pertinente de Clippy, dont `-D warnings` si c'est la politique CI. Ne pas désactiver les lints pour obtenir du vert. |
| Compilation | Cible, features, profil, version de Rust, code de sortie et chemin exact de l'artefact. La présence d'un ancien EXE ne prouve pas qu'un nouveau build a réussi. |
| Interface / paquet | Si concernés : construire l'interface, contrôler les ressources et extraire le paquet dans un dossier propre. |
| Démarrage / métier | Distinguer « processus lancé », « interface vérifiée », « API vérifiée » et « inférence terminée ». Ne pas résumer ces preuves différentes par « tout fonctionne ». |
| Diff final | `git diff --check`, liste des fichiers et absence de modifications hors sujet. |

Exemples pour le backend desktop, après préparation des ressources requises par Jan :

```powershell
cargo clippy --locked --manifest-path src-tauri/Cargo.toml --release --no-default-features --features test-tauri --lib -- -D warnings
git diff --check
git diff --stat
```

Pour les essais MCP de cette session, l'override doit rester limité au processus de validation. Exemple PowerShell, après vérification des chemins et des deux exclusions décrites à l'étape 8 :

```powershell
$previousDataRoot = $env:JAN_DATA_ROOT
try {
    $env:JAN_DATA_ROOT = 'C:\msys64\home\jmsga\jan\.build\validation-profile'
    New-Item -ItemType Directory -Force -Path $env:JAN_DATA_ROOT | Out-Null
    cargo test --locked --manifest-path src-tauri/Cargo.toml --release --no-default-features --features test-tauri --lib -- core::mcp:: --test-threads=1 --skip test_check_and_cleanup_stale_lock_removes_dead_pid_lock --skip test_cleanup_own_locks_removes_only_current_pid_locks
    $testExitCode = $LASTEXITCODE
    if ($testExitCode -ne 0) { throw "Tests MCP en échec : $testExitCode" }
} finally {
    $env:JAN_DATA_ROOT = $previousDataRoot
}
```

Ces exclusions sont liées au harness actuel, pas au correctif des deux avertissements. Les réévaluer après mise à jour des tests ; ne pas transformer une liste d'exclusions en moyen de masquer des régressions.

Ces commandes doivent être adaptées au sujet ; un correctif Windows exige une validation Windows. Le backend CLI n'inclut pas tous les modules desktop. Ne pas confondre les builds avec et sans Tauri. Les tests qui modifient des variables d'environnement doivent respecter la sérialisation prévue par le projet.

Conserver les logs et leurs codes de sortie dans un dossier local de validation. Sur PowerShell, récupérer `$LASTEXITCODE` immédiatement après le programme ; une commande de lecture exécutée ensuite peut masquer l'échec. Une redirection vers un fichier ne constitue pas une réussite.

Un test affiché comme réussi doit avoir réellement exécuté son scénario : vérifier les codes de sortie de la préparation (Git, création de worktree, serveur de test). Ne pas transformer un échec de préparation en retour silencieux. Les fixtures Git doivent fournir une identité limitée à leur commande et ne pas dépendre de la configuration personnelle ou de la signature de commits de l'utilisateur.

Si une vérification échoue déjà sur la base, le démontrer et noter le périmètre. Distinguer les avertissements du paquet principal de ceux des dépendances et les lints des messages du linker. Corriger séparément les problèmes indépendants ; ne pas prétendre que la CI est verte sans l'avoir vérifiée sur le commit publié.

Pour chaque avertissement apparu après modification, relever l'outil et sa version, la configuration, le fichier/ligne, le message et la différence avec la base exécutée dans les mêmes conditions. Cette règle couvre aussi les nouveaux avertissements de compilation, de dépendances, de frontend et de packaging provoqués par notre changement. Ne pas les masquer par un `allow`, une baisse du niveau de lint, une exclusion de test ou un filtre de logs destiné uniquement à faire passer les contrôles.

Corriger un avertissement causé par notre patch fait partie de ce patch. Si sa correction exige un changement indépendant plus large, le préparer séparément, résoudre la dépendance et revalider l'ensemble avant publication. Les avertissements déjà présents sur la base restent clairement signalés avec leur preuve et leur suivi distinct ; ils ne doivent pas être confondus avec de nouveaux avertissements introduits par notre travail.

## 8. Protéger les données pendant les essais

Identifier les chemins effectivement utilisés **avant** de lancer Jan. Sous Windows, changer `APPDATA`/`LOCALAPPDATA` ne suffit pas pour les appels qui passent par les dossiers connus du système. Le code actuel fournit notamment `JAN_DATA_ROOT`, distinct de `JAN_DATA_FOLDER` : vérifier quels chemins et quels composants respectent chaque variable, et constater que les fichiers sont bien créés dans le dossier de test.

Les anciens tests qui appellent directement `app.path().app_data_dir()` peuvent contourner l'override du projet. Les isoler correctement ou annoncer leurs exclusions et leur raison. Un nom de profil dans un script ne prouve pas l'isolation.

Ne charger que des jeux de données de test, ne pas convertir les vrais modèles et ne terminer que les processus créés pour l'essai. Préserver les exécutables validés : un build d'une autre branche dans `C:\jb` peut remplacer le binaire précédent. Préférer des sorties distinctes ou conserver une copie identifiée par SHA avant remplacement.

## 9. Relire exactement ce qui sera publié

```powershell
git status --short
git diff
```

Ajouter explicitement les fichiers du sujet, puis relire l'index. Exemple pour cette correction MCP :

```powershell
git add src-tauri/src/core/mcp/helpers.rs src-tauri/src/core/mcp/lockfile.rs
git diff --cached --check
git diff --cached --stat
git diff --cached
```

Contrôler absence de secrets, identifiants, données utilisateur, logs sensibles, exécutables et fichiers générés non demandés. `PR.md`, `Novera_Contributions.txt`, les scripts de validation locaux et les chemins personnels ne doivent pas entrer accidentellement dans une PR de code upstream.

Les fichiers publiés doivent être exactement ceux validés. Si le code change après les tests, refaire les contrôles concernés. Une publication via API doit utiliser une liste explicite de fichiers et contrôler le SHA attendu de la branche, comme une publication Git doit contrôler son index et son commit.

## 10. Créer un commit signé et publier sur le fork existant

Vérifier l'identité Git et la méthode de signature. Si une clé est déjà configurée :

```powershell
git commit -S -m "fix(mcp): remove needless Windows command argument borrows"
git log -1 --show-signature
git push -u origin codex/fix-sujet
```

Adapter le nom de branche au travail réel. Ne pas créer automatiquement une nouvelle clé de signature au nom de l'utilisateur. L'alternative déjà utilisée ici est l'API GitHub `createCommitOnBranch`, avec contrôle du SHA de base, pour obtenir un commit signé par GitHub. Vérifier la signature retournée et les fichiers distants, puis aligner le checkout local sans écraser son contenu.

Réutiliser Git Credential Manager. Aucun token dans le chat, ce document, un script, un log ou une URL de remote. Ne pas afficher la réponse de `git credential fill`, qui contient le secret. Une clé exposée doit être révoquée ; une nouvelle connexion se fait dans le gestionnaire d'identifiants.

Un rejet de push demande un diagnostic et un fetch, pas un `--force` réflexe. Ne pas réécrire une branche partagée ou le `main` du fork. Une réécriture de branche de travail déjà publiée doit être intentionnelle et autorisée ; `--force-with-lease` réduit certains risques mais ne remplace pas ces contrôles. Voir [git push](https://git-scm.com/docs/git-push).

## 11. Créer ou mettre à jour la bonne PR

Rechercher une dernière fois une PR existante pour cette branche et ce problème. Vérifier **base repository**, **base branch**, **head repository**, **head branch** et le diff affiché. Le parcours officiel est décrit dans [Créer une PR depuis un fork](https://docs.github.com/en/pull-requests/how-tos/create-pull-requests/creating-a-pull-request-from-a-fork).

La description doit expliquer le déclencheur, le comportement avant/après, le correctif, les tests réellement exécutés, les plateformes, les limites, les éventuelles dépendances et les références d'origine. Ajouter une preuve avant/après et la capture ou démonstration demandée par le dépôt lorsque pertinente. Respecter le modèle de PR et annoncer les vérifications non faites.

Utiliser un brouillon si des validations indispensables manquent. Publier seulement sur notre fork lorsque c'est le périmètre demandé ; ne pas ouvrir une PR upstream en doublon d'une contribution existante. Une correction indépendante mérite sa propre proposition. Ne pas fusionner, publier une release ou modifier la branche d'autrui sans autorisation correspondante.

## 12. Contrôler après publication et tenir le suivi à jour

Vérifier que le SHA distant correspond au commit testé et signé. Lire les checks du **bon SHA** : un ancien run vert ne couvre pas de nouveaux commits. Distinguer échec fonctionnel, défaut hérité, problème d'infrastructure et job non déclenché. Un push de branche ne déclenche pas nécessairement les workflows filtrés sur `main`.

Après modification : relire le nouveau diff, tester les parties touchées et relancer les contrôles pertinents. Si la base a évolué, choisir merge ou rebase en connaissance de cause, résoudre les conflits puis revalider. La fusion upstream reste la décision des mainteneurs.

Mettre `PR.md` et `Novera_Contributions.txt` à jour avec branche, base et SHA, lien du commit/PR, commandes, résultats, exclusions, logs, artefact et empreinte, limites et prochaine action. Une branche publiée sur le fork n'est pas automatiquement une PR ouverte. Le nombre de PR en attente se vérifie sur GitHub.

### Checklist finale

- [ ] Dépôt, remotes, instructions et base actuelle vérifiés.
- [ ] Issue, PR ouvertes/fermées, code de main et éventuels doublons contrôlés.
- [ ] Problème reproduit et changement minimal isolé.
- [ ] Tests et contrôles pertinents exécutés ; exclusions et limites annoncées.
- [ ] Nouveaux avertissements mis en évidence, causes identifiées et corrigées ; contrôles relancés avant tout push sur le fork ou publication de PR.
- [ ] Données et processus d'essai isolés réellement ; artefacts identifiés.
- [ ] Diff relu, aucun secret ni fichier hors sujet publié.
- [ ] Commit attribué et signé ; branche distante et SHA vérifiés.
- [ ] Bonne PR créée/mise à jour si demandée ; checks du dernier SHA consultés.
- [ ] Suivi local mis à jour et prochaines validations explicites.

---

# Application de la procédure : correctif MCP publié le 16 octobre 2026

- Vérification du `main` récupéré : `a86d87ebcfb7eb542dbc548cd3a5936b4650c3c6`. Les deux emprunts superflus sont encore présents dans cette base. Les recherches de PR ouvertes/fermées n'ont pas révélé de correctif identique ; cela ne constitue pas un audit exhaustif de tous les diffs du projet.
- Reproduction avant correction : Clippy avec `-D warnings` échoue sur `helpers.rs:992` et `lockfile.rs:97`.
- Correctif : retrait de deux `&` dans les appels `Command::args` de `taskkill` et `tasklist`. Aucun changement d'argument, de permission ou de sélection des processus.
- Publication : [`codex/fix-windows-mcp-clippy`](https://github.com/TRON-ABS/jan/tree/codex/fix-windows-mcp-clippy), [commit signé 13e8373](https://github.com/TRON-ABS/jan/commit/13e8373c3e5fdb3043cb33070388985bb529c94e). Deux fichiers, deux insertions et deux suppressions. Pas de nouvelle PR upstream créée pendant cette intervention.
- Validation après correction : **Clippy strict réussi sur Jan**, **95 tests MCP réussis**, `git diff --check` réussi et aucun nouveau diagnostic rustfmt par rapport à la base.
- Deux tests existants exclus pour leurs accès directs à un dossier système qui contournent l'override de test : `test_check_and_cleanup_stale_lock_removes_dead_pid_lock` et `test_cleanup_own_locks_removes_only_current_pid_locks`. Les autres essais utilisent `JAN_DATA_ROOT` dans `.build/mcp-test-profile` et une exécution séquentielle.
- La dépendance `tauri-plugin-hardware` émet encore deux avertissements `non_snake_case`, hors de cette correction. Les avertissements MCP visés sont supprimés ; ne pas présenter ce résultat comme zéro avertissement dans toute la chaîne de dépendances.
- Logs : `.build/mcp-clippy-before.log`, `.build/mcp-clippy-after.log` et `.build/mcp-clippy-tests.log`. Checkout : `.build/mcp-clippy`.
- Cette branche est indépendante du correctif UTF-8. Aucun nouvel EXE desktop n'a été produit pour ce nettoyage ; le binaire précédemment compilé du correctif UTF-8 reste un artefact de sa propre branche.

# Archive : relevé des PR Jan — 16 octobre 2026

Relevé effectué le **16/10/2026**, fuseau Europe/Paris, sur [janhq/jan](https://github.com/janhq/jan/pulls) : **169 PR ouvertes**. Deux sont nos contributions : **#9299** et **#9302**.

Cette sélection propose les travaux les plus utiles pour notre fork et pour contribuer à Jan. Les priorités ci-dessous sont notre appréciation, pas un classement officiel du projet. Les PR citées existent déjà : aider à les tester, les revoir ou les remettre à jour avant d'en créer une autre sur le même sujet.

## Travail réalisé le 16 octobre 2026 : correctif UTF-8 (#8685)

Le correctif inspiré de [#8685](https://github.com/janhq/jan/pull/8685), avec trois tests de régression supplémentaires, est publié sur notre fork dans [`codex/fix-api-utf8`](https://github.com/TRON-ABS/jan/tree/codex/fix-api-utf8). [Commit signé 9bc866c](https://github.com/TRON-ABS/jan/commit/9bc866c86dbfbbd90402db67a7141bf64cb1be39). Deux fichiers modifiés ; aucune PR upstream supplémentaire créée.

- La panique UTF-8 a été reproduite avant correction ; le même test passe après.
- **91 tests du serveur passent**, dont les nouveaux cas cyrillique, accents/emojis, messages JSON et en-têtes valides devant un texte Unicode.
- Les API de plugins, les extensions et l'interface ont compilé. L'exécutable Windows **Jan 0.8.5** a compilé en release : `C:\jb\release\Jan-Desktop.exe`.
- Clippy termine avec succès, avec deux avertissements dans des fichiers MCP non modifiés. Aucun nouveau diagnostic rustfmt par rapport à la base ; `git diff --check` passe.
- Le processus du nouvel exécutable est resté actif pendant un test de démarrage de huit secondes, puis a été arrêté. Attention : la redirection APPDATA/LOCALAPPDATA n'isole pas les dossiers Windows utilisés par Jan. Ce lancement a utilisé le profil habituel et actualisé ses fichiers de paramètres et logs.
- Ce test de démarrage n'est pas une validation visuelle de l'interface ni une génération complète avec un modèle.

SHA-256 de l'exécutable : `E3A98DB9340374C57A46E65C7E2C3033A3D2907FC370A684CE59C930BA17921B`.

La liste ci-dessous reste le relevé des PR ouvertes à cette date ; le correctif #8685 est maintenant disponible sur notre fork pour essais/revue.

## Nos contributions à terminer

| PR | État au relevé | Prochaine action |
|---|---|---|
| [#9302 — Distribution Windows portable](https://github.com/janhq/jan/pull/9302) | Brouillon ; branche `codex/windows-portable`, cible `main`. [Tests de packaging réussis](https://github.com/TRON-ABS/jan/actions/runs/38892765556). | Compiler réellement cette branche, extraire le ZIP dans un dossier distinct, lancer l'interface et charger un modèle. Vérifier aussi les chemins avec espaces, les prérequis et le parcours de publication/signature avant de demander la revue. |
| [#9299 — llama.cpp b11681](https://github.com/janhq/jan/pull/9299) | Ouverte ; branche `update-llamacpp-b11681`, cible `dev`. | Vérifier les retours de revue et la CI, puis documenter les essais CPU/Vulkan, chargement/déchargement et génération. Confirmer avec les mainteneurs la branche cible adaptée ; ne pas la changer automatiquement. |

Le ZIP local `C:\jb\release\Jan_0.8.4_x64-portable.zip` provient d'un build existant. Son essai réussi ne remplace pas une compilation de la branche #9302, basée sur le `main` actuel en 0.8.5.

## Priorité haute : sécurité, conversations et blocages

| Ordre | PR | Pourquoi elle mérite du travail | Action utile à réaliser |
|---|---|---|---|
| 1 | [#8068 — Limiter les écritures au dossier de données Jan](https://github.com/janhq/jan/pull/8068) | `mkdir`, `mv` et `write_file_sync` utilisaient encore le résolveur non limité dans `main`. PR toujours ouverte, cible `main`. | Correctif adapté, validé et [publié sur le fork](https://github.com/TRON-ABS/jan/tree/codex/fix-filesystem-path-scope) : 20 tests filesystem passent, commit signé `cd4bea85`. Ne pas ouvrir une PR amont en doublon. |
| 2 | [#8071 — Écriture atomique de messages.jsonl](https://github.com/janhq/jan/pull/8071) | `main` tronquait directement le fichier avec `File::create`, risquant de perdre l'historique si l'écriture était interrompue. La PR amont est ouverte et approuvée. | Correctif adapté à `a86d87e`, renforcé avec un temporaire unique. Suivi publié : quatre avertissements supprimés et partage des skills entre worktrees Windows corrigé, **138 tests Windows réussis**, [commit signé `ef1feae4`](https://github.com/TRON-ABS/jan/commit/ef1feae40e5cb8a38d733203cda1e2b29483c14c). Aucun doublon upstream créé. |
| 3 | [#8685 — Éviter une panique sur du texte UTF-8](https://github.com/janhq/jan/pull/8685) | Corrige le contrôle d'un préfixe dans le serveur API pour éviter une découpe au milieu d'un caractère. Changement ciblé et panne utilisateur décrite précisément. | Correctif déjà publié sur notre fork. Reproduire avec du cyrillique, des accents et des emojis, vérifier la réponse HTTP et exécuter les tests dans le vrai crate. L'auteur indique avoir testé une copie isolée de la fonction, pas lié tout le backend Tauri. |
| 4 | [#9150 — Corriger des contournements des autorisations shell](https://github.com/janhq/jan/pull/9150) | Concerne l'application des autorisations « toujours autoriser ». Le traitement de `time` est déjà en partie présent dans `main`, mais la fonction inspectée ne normalise pas les échappements `^` de `cmd`. | Revoir le correctif restant et ses tests de non-régression pour cmd, PowerShell et POSIX. Utiliser des commandes de démonstration inoffensives ; ne pas rejouer les exemples destructifs de la description. |
| 5 | [#9281 — Délai maximal pour l'initialisation MCP](https://github.com/janhq/jan/pull/9281) | Un serveur MCP qui ne répond jamais peut bloquer le lancement d'un tour d'agent. La PR borne l'attente et laisse continuer la session. | Tester un serveur silencieux, un démarrage lent et un serveur normal, en stdio et HTTP. Sous Windows, vérifier aussi le nettoyage du processus enfant après expiration. |
| 6 | [#8855 — Gérer un ancien chemin de données devenu invalide](https://github.com/janhq/jan/pull/8855) | Un chemin mémorisé devenu introuvable peut empêcher Jan de fonctionner après un déplacement ou un changement de profil. | Tester dossier déplacé, disque absent et accès refusé, sans modifier les vraies données. Vérifier l'information donnée à l'utilisateur pour éviter de présenter silencieusement un dossier vide comme une perte de conversations. |

Les problèmes et résultats annoncés par les auteurs restent à reproduire sur notre environnement. Ces recommandations ne signifient pas que les correctifs sont prêts à fusionner.

## Priorité suivante : diagnostic et usage quotidien

| PR | Utilité | Travail concret |
|---|---|---|
| [#9294 — Expliquer les erreurs de téléchargement](https://github.com/janhq/jan/pull/9294) | Donne une cause exploitable lorsqu'un téléchargement de modèle échoue. | Tester absence de réseau, refus de connexion, expiration et messages traduits ; vérifier la reprise après échec. |
| [#9297 — Expliquer les échecs de connexion aux fournisseurs](https://github.com/janhq/jan/pull/9297) | Remplace certains « Unknown error » par un diagnostic de connexion. | Tester fournisseur local inaccessible et réponses 401/403/404 ; vérifier que les messages existants restent corrects. |
| [#9168 — Conserver les erreurs de mise à jour visibles](https://github.com/janhq/jan/pull/9168) | Évite de perdre la raison d'un échec et permet de réessayer. | Tester les étapes échec avant installation, installation réussie et échec de relancement dans un build packagé. Pour le portable, respecter la procédure de remplacement du ZIP prévue par #9302. |
| [#9235 — Interrupteur pour désactiver le shell](https://github.com/janhq/jan/pull/9235) | Donne un contrôle explicite à l'utilisateur sur la disponibilité de l'outil shell. | Vérifier que l'outil et sa description disparaissent réellement lorsqu'il est désactivé, que le choix persiste et que le français est couvert. |
| [#7908 — Export des conversations en Markdown/JSON](https://github.com/janhq/jan/pull/7908) | Fonction utile pour récupérer et partager ses conversations. Label `need: testing` au relevé. | Tester Unicode, longues conversations, outils et pièces jointes ; vérifier les fichiers exportés et les références aux images. Ancienne PR : comparer avec les fonctionnalités actuelles avant reprise. |

## PR à examiner avant toute intégration

| PR | Observation au relevé | Décision proposée |
|---|---|---|
| [#9007 — Arrêter les workers Windows après fermeture forcée](https://github.com/janhq/jan/pull/9007) | L'API « Files changed » renvoie zéro fichier. Le `main` local inspecté contient déjà un Job Object avec `KILL_ON_JOB_CLOSE`. | Vérifier si le besoin est couvert et signaler un éventuel doublon aux mainteneurs. Ne pas refaire ce correctif sans reproduire une panne restante. |
| [#9006 — Séparateurs des chemins Windows étendus](https://github.com/janhq/jan/pull/9006) | L'API renvoie aussi zéro fichier modifié. Des tests de chemins Windows étendus sont déjà présents dans `main`. | Vérifier la couverture réelle des cas signalés ; demander clarification plutôt que créer une nouvelle PR identique. |
| [#7534 — Contrôler les chemins lors de l'extraction d'archives](https://github.com/janhq/jan/pull/7534) | Sujet de sécurité utile, mais label `needs: rework`. La proposition traite chemins d'archive et liens symboliques. | Examiner les demandes de revue et adapter le correctif au téléchargeur actuel, avec des archives de test inoffensives. Ne pas l'intégrer sans traiter la demande de reprise. |
| [#8698 — Mise à jour seroval annoncée comme correctif de sécurité](https://github.com/janhq/jan/pull/8698) | La description annonce deux fichiers, mais le diff API examiné contient **75 fichiers**, dont backend, interface et CI. La cible est `dev`. | Comprendre le décalage de branches et isoler le changement de dépendance pertinent. Vérifier l'avis de sécurité et les versions réellement utilisées avant de conclure sur l'exposition. Le titre seul ne suffit pas pour décider d'intégrer. |
| [#7943 — Embeddings locaux pour le RAG hors ligne](https://github.com/janhq/jan/pull/7943) | Utile pour un Jan hors ligne, mais PR ancienne, label `need: testing`. Son diff touche notamment `src/args.rs`, absent du plugin dans le `main` inspecté. | Revoir l'adaptation à l'architecture actuelle du worker avant toute reprise. Tester ensuite import d'un modèle d'embedding local et ajout de documents sans réseau. |

Les nouvelles intégrations de fournisseurs et les gros ajouts d'interface peuvent attendre ces travaux de fiabilité. Les PR portant un label `blocked: Out of scope` ne sont pas des premières candidates sans accord des mainteneurs.

## Archive : ancien ordre de travail sur le fork, suspendu

1. **Terminer #9302** : obtenir un vrai build de la branche portable et une preuve de lancement/inférence.
2. **Consolider #9299** : vérifier revue, CI, cible et essais du moteur, en gardant les deux contributions séparées.
3. **Prendre un correctif ciblé à la fois** : #8071 est maintenant publié sur notre fork ; poursuivre avec la validation de #8685, déjà présent sur le fork.
4. **Revoir les limites de sécurité restantes** : le correctif #8068 est publié sur le fork dans `codex/fix-filesystem-path-scope` ; poursuivre ensuite le reste utile de #9150 et la reprise de #7534.
5. **Tester les parcours Windows/MCP** : #9281 et #8855, puis les diagnostics #9294/#9297.

Avant chaque reprise : récupérer les refs à jour, relire la discussion et le diff, vérifier la branche cible et les dépendances entre PR. Travailler dans une branche isolée, préserver les modifications locales et ne pas créer de doublon. Ce document n'applique ni ne fusionne aucune PR.

## Sources et limites du relevé

- Inventaire historique : [API des PR ouvertes](https://api.github.com/repos/janhq/jan/pulls?state=open&per_page=100), 169 entrées visibles lors du contrôle du 16/10/2026. Le nombre évolue avec les ouvertures et les fusions.
- Titres, descriptions, auteurs, labels et branches cibles : réponses API du jour ; liens directs dans les tableaux.
- Fichiers modifiés consultés pour 14 PR présélectionnées via l'API `/pulls/<numéro>/files`.
- Comparaisons de code ciblées avec [`main` au commit a86d87e](https://github.com/janhq/jan/tree/a86d87ebcfb7eb542dbc548cd3a5936b4650c3c6), récupéré lors de la préparation de notre contribution.
- Aucun test supplémentaire des PR tierces, audit exhaustif de sécurité ou contrôle complet de leur CI n'a été réalisé pour ce classement. Leurs preuves de test sont celles déclarées par leurs auteurs.
- Les états, diffs et priorités peuvent évoluer après le 16 octobre 2026 : vérifier GitHub avant d'agir.

## Correctif filesystem publié — PR #8068 — 16 octobre 2026

- Vérification : `upstream/main` est toujours `a86d87ebcfb7eb542dbc548cd3a5936b4650c3c6`. La PR #8068 est ouverte, cible `main` et corrige les trois mêmes commandes. Son patch est adapté à la base actuelle ; aucune nouvelle PR upstream n'est créée pour éviter un doublon.
- Branche locale : `codex/fix-filesystem-path-scope`, checkout `.build/filesystem-scope`. Le diff contient uniquement `src-tauri/src/core/filesystem/commands.rs` et `tests.rs`.
- Correctif : le résolveur canonique du dossier de données Jan protège `mkdir`, la source et la destination de `mv`, ainsi que `write_file_sync`.
- Tests du vrai crate Windows : **20 réussis, 0 échec**, dont refus de chemins absolus hors dossier et de traversées `..`, plus des cas positifs pour les URI `file://` et les déplacements autorisés. Le test de lien symbolique est limité à Unix et n'a donc pas tourné sur Windows.
- Rustfmt 1.98.0 réussi. Clippy strict complet échoue sur les deux emprunts superflus déjà présents dans `core/mcp/helpers.rs` et `core/mcp/lockfile.rs` sur `main`; ils sont corrigés séparément dans `codex/fix-windows-mcp-clippy`. Après neutralisation ciblée de ce seul lint préexistant, Clippy strict réussit. Aucun avertissement ne provient des deux fichiers filesystem modifiés. Les avertissements de compilation visibles viennent du plugin AMD, de deux tests/fonctions existants et des messages du linker.
- `git diff --check` réussi. Logs locaux : `.build/filesystem-scope/filesystem-final-tests.log`, `filesystem-clippy.log` et `filesystem-clippy-baseline-exception.log`.
- État : **publié sur le fork** dans [`codex/fix-filesystem-path-scope`](https://github.com/TRON-ABS/jan/tree/codex/fix-filesystem-path-scope). [Commit `cd4bea85a593043c7f6b2a3724a2b1871535d832`](https://github.com/TRON-ABS/jan/commit/cd4bea85a593043c7f6b2a3724a2b1871535d832), signature GitHub `VALID`. SHA distant vérifié ; arbre Git identique au code testé (`537c05b6f357ef7f08699ecc2cc359a8f463f9c3`). Branche locale alignée, propre et suivie sur `origin`. Authentification fournie par l'utilisateur utilisée uniquement en mémoire ; aucun secret conservé dans les fichiers du projet. Aucune nouvelle PR upstream créée. La validation porte sur le backend et les tests ; aucun nouveau paquet portable n'a été compilé pour cette contribution.

## Correctif messages.jsonl publié — PR #8071 — 16 octobre 2026

- Vérification : PR amont toujours ouverte et approuvée. `upstream/main` est `a86d87ebcfb7eb542dbc548cd3a5936b4650c3c6`; `write_messages_to_file` y tronquait le fichier avec `File::create`. Le correctif de l'auteur s'appliquait proprement à cette base, mais sa version utilisait un nom temporaire fixe.
- Adaptation : écrire puis vider/synchroniser un fichier temporaire voisin, unique et créé avec `create_new`, avant le renommage atomique. Cela évite les collisions et liens symboliques préexistants, tout en préservant le fichier existant si une écriture échoue. Un point d'injection interne permet de tester une écriture partielle interrompue.
- Fichiers : `src-tauri/src/core/threads/helpers.rs` et `tests.rs`.
- Vérification initiale : **35 tests threads réussis sous Windows**, dont échec d'écriture après données partielles, fichier temporaire ancien, écrasement normal et absence de résidu. Rustfmt ciblé et `git diff --check` réussis. Le `cargo fmt --check` global remonte des écarts préexistants dans de nombreux fichiers non concernés. Clippy strict relève les deux lints MCP `needless_borrows_for_generic_args` déjà présents dans `main`; avec cette seule exception, Clippy passe. Les avertissements AMD, `downloads` et `agent/skills` observés initialement sont corrigés dans le suivi ci-dessous. La validation de ce suivi a pu aboutir après reprise de l'environnement MSVC et du cache `C:\jb`.
- Publication : [`codex/atomic-thread-message-write`](https://github.com/TRON-ABS/jan/tree/codex/atomic-thread-message-write), [commit signé `0b5c68e78c241e39b08521fd3000e4cd8638809b`](https://github.com/TRON-ABS/jan/commit/0b5c68e78c241e39b08521fd3000e4cd8638809b), signature `VALID`. Arbre distant vérifié (`4aad4e705cfc2ede5be8a40f58c8c9c37293ae43`), worktree propre et aligné sur `origin`. Pas de PR upstream en doublon ; aucun secret conservé.

## Suivi publié : avertissements Windows et skills des worktrees — 16 octobre 2026

- Les deux variables ADL du plugin AMD utilisent maintenant `snake_case`. Les symboles DLL et les signatures de fonctions restent identiques. L'import du résolveur `downloads` et `UserSkills::track` sont compilés uniquement sur Unix, comme les tests de liens symboliques qui les utilisent. Aucun lint désactivé.
- Nouvelle découverte : le test `linked_worktree_sees_main_worktree_skills_and_plugins` passait sans exécuter son scénario si son commit Git échouait faute d'identité. Sa préparation fournit désormais une identité propre à la commande, désactive la signature pour ce commit de test et échoue explicitement en cas d'erreur. Aucune configuration Git globale modifiée.
- Le test ainsi activé a **échoué avant correction sous Windows** : aucun skill partagé trouvé. Le chemin du checkout principal lu dans `.git` n'avait pas la même représentation que celui issu de `canonicalize` (préfixe Windows `\\?\`), produisant deux clés de stockage. Le chemin principal est désormais canonisé avant calcul de la clé ; le test `workspace` utilise un chemin gitdir ordinaire pour couvrir cette différence. La clé du checkout principal reste la référence. Les anciens dossiers éventuellement créés sous une mauvaise clé ne sont ni supprimés ni migrés automatiquement.
- Validation finale Windows, profil release, Rust 1.98.0, MSVC : **138 tests réussis, 0 échec** — `workspace` 30, `downloads` 48, `agent/skills` 25 (dont le vrai test de worktree), conversations 35. Les quatre avertissements Rust ciblés et l'erreur d'identité Git ont disparu. Reste le diagnostic `linker_messages` rapportant la création de la bibliothèque `.lib/.exp` par MSVC ; ce message ne signale pas un défaut source. Aucun test GPU AMD physique ni nouveau paquet portable pour ce suivi.
- Formatage : aucun changement demandé par rustfmt sur les lignes modifiées ; les écarts anciens du reste des fichiers ne sont pas reformattés. `git diff --cached --check` réussi. Logs dans `.build/thread-atomic/` : `workspace-quality.log`, `core-downloads-tests-quality.log`, `core-agent-skills-tests-quality.log`, `core-threads-quality.log`. Commandes reproductibles : `.build/run-thread-quality.ps1`.
- Publication sur la branche demandée : [commit signé `ef1feae40e5cb8a38d733203cda1e2b29483c14c`](https://github.com/TRON-ABS/jan/commit/ef1feae40e5cb8a38d733203cda1e2b29483c14c), parent `0b5c68e7`, signature GitHub `VALID`. Arbre publié identique au code testé : `3cead3dc28607fa31ca104b066e2a6cbe6d52320`. Branche locale alignée et propre. Publication par API GitHub sur la même branche, le moteur de contrôle navigateur étant indisponible ; aucune PR upstream créée. Authentification utilisée uniquement en mémoire, aucun secret enregistré.

## Incident portable local corrigé — MiniCPM5 — 16 octobre 2026

Le dossier « Jan Portable TEST » utilisait un ancien exécutable 0.8.4. Ses logs montraient un arrêt du worker avec statut 7 et erreur Windows 123 : le chemin `slot-save-path` mélangeait le préfixe canonique Windows et `/thread-cache`. Le moteur quittait avant le chargement du modèle.

Correction locale dans la branche `update-llamacpp-b11681` : `extensions/llamacpp-extension/src/preset.ts` construit le cache avec des séparateurs natifs Windows et conserve les chemins POSIX. Quatre nouvelles régressions Windows ont échoué avant correction puis passé après ; la suite complète de l'extension compte **206 tests réussis**. Les checkouts basés sur main possèdent déjà une correction équivalente ; aucun doublon upstream créé pour ce défaut.

Interface, extensions et exécutable Windows release reconstruits. Archive créée depuis ce nouveau build, extraite dans un nouveau dossier, hashes desktop/worker comparés. Depuis le worker de cette extraction, **MiniCPM5-2B-Q4_K_M a été chargé avec 68 192 tokens de contexte et fit désactivé**, avec un cache canonique Windows : génération terminée par « Hello! ». Le test utilise un preset séparé et ne modifie pas les paramètres réels. Cette preuve couvre le moteur du paquet ; aucune validation visuelle de l'interface n'est annoncée.

- Exécutable : `C:\jb\release\Jan-Portable-Corrige\Jan-Desktop.exe`.
- ZIP : `C:\jb\release\portable-fixed\Jan_0.8.4_x64-portable.zip` (105220709 octets).
- SHA-256 EXE : `51606DE40F86F4D3EBCACB38D4F8E58CC0BC8E1F5A420C3EDB75CAF0A4FE8F00`.
- SHA-256 ZIP : `BBCCC6593FF94B3B2BB9CA516CB99650E88D23D6BF9A5F8E2FBCFD1E4DE49E6A`.
- Preuves : `.build/portable-fixed-build.log`, `.build/portable-fixed-artifacts.json`, `.build/portable-model-check/completion.json` et `worker.log`.

Cette compilation de l'ancienne branche moteur émet encore des avertissements de nommage AMD et une fonction inutilisée dans le script build llama.cpp, dans des fichiers non modifiés par ce correctif ; les warnings du frontend concernent le routeur, les imports mixtes et les tailles de chunks. Les suppressions de warnings publiées sur `codex/atomic-thread-message-write` restent une contribution distincte. Les modifications source de cette réparation portable sont locales ; aucune publication GitHub de ces fichiers n'est annoncée.


## Diagnostic VRAM Tron-v1 — 17 octobre 2026

Investigation en lecture seule des réglages utilisateur. Le preset actif sous Roaming/Jan/data/llamacpp contient `fit = off` et `ctx-size = 130000`; Tron-v1 ne surcharge pas ce contexte dans model.yml. Le store de l'interface contient également ctx_len=130000. Les caches K/V sont f16 et leur offload est activé. Le code HEAD de référence utilisait 8192; les modifications locales de predefined.ts, preset.ts et la migration version 18 de useModelProvider.ts imposent 130000 (la migration remplace même les anciennes valeurs 8192).

Métadonnées lues directement dans Tron-v1-Q4_K_M.gguf : architecture llama, 42 couches, 2 têtes KV, dimensions K/V 128, contexte natif 131072, fichier 1561314560 octets. Estimation de capacité du seul cache K+V f16 pour les 42 couches : environ 5,21 Gio à 130000 tokens contre 0,328 Gio à 8192, hors alignement et buffers de calcul. Cette capacité est en VRAM si les couches/cache sont entièrement sur GPU; ce n'est pas une mesure comparative des deux applications. Le moteur n'était pas actif lors de l'inspection et aucune mesure de Jan original n'a été fournie. Le changement de contexte explique une réserve bien supérieure sans changement de poids du modèle. Aucune préférence ni source de fonctionnement modifiée; aucun nouveau build nécessaire pour le diagnostic.


### Rectification du diagnostic VRAM — contexte identique

L'utilisateur précise que Jan original et le portable sont tous deux configurés à 130000 tokens : la comparaison 8192/130000 ne démontre donc pas la cause de l'écart constaté. Conserver son contexte. Paramètres effectivement retrouvés côté portable : caches K/V f16, Flash Attention auto, parallel 0, no_kv_offload false, batch 2048, ubatch 512, kv_unified auto. Les réglages cache K/V et Flash Attention existent dans les settings globaux llama.cpp et sont rendus sur la page du fournisseur; ils ne sont pas dans les paramètres individuels du modèle. Le portable embarque ggml-vulkan.dll sans ggml-cuda.dll; les anciens backends présents dans le dossier utilisateur sont win-cuda-13.4-x64 (b11513/b11535/b11601/b11621). Cela établit une différence de moteurs disponibles, pas une comparaison mesurée ni les anciens paramètres réellement utilisés. Réponse utilisateur au chemin de Jan original : « retirer », interprétée comme version retirée. Cause exacte restant à confirmer par anciens réglages/logs ou comparaison contrôlée. Aucune modification de contexte, cache ou moteur appliquée.


## Portable CUDA RTX 5070 — 17 octobre 2026

À la demande de l'utilisateur, moteur local recompilé avec CUDA 13.4.92, architecture sm_120 (RTX 5070 Laptop, capacité 12.0), llama.cpp b11696 inchangé. Le portable embarque le worker CUDA, ggml-cuda et les DLL redistribuables cudart/cuBLAS/cuBLASLt; Vulkan retiré du runtime préparé. Assistant de compilation locale : scripts/build-windows-cuda-engine.ps1; dépendances ajoutées au bundle Windows et procédure documentée. Le script local de compilation de l'interface vérifie la présence de CUDA avant packaging.

Validation réelle : Tron-v1 chargé avec 130000 tokens demandés (130048 après alignement), réponse visible obtenue et worker arrêté normalement. Contrôle du portable final avec PATH limité à System32, sans CUDA_PATH : CUDA0 / RTX 5070 détecté. Empreintes de toutes les DLL et du worker identiques aux sources testées; EXE portable identique au release. Interface TypeScript/Vite et release Rust compilés; NSIS/MSI et portable actualisés. Aucun changement des préférences utilisateur de contexte, de cache ou de Flash Attention. Aucun envoi distant; interface native non lancée pour ce changement de moteur.

Mesures exploratoires nvidia-smi (VRAM totale incluant bureau/autres applications, sujette à WDDM) : CUDA FP16 contrôle 853 -> 7726 Mio; CUDA Q8_0 avec Flash Attention explicitement activé 857 -> 5438 Mio; ancien worker Vulkan contrôle 751 -> 6513 Mio. Générations réussies dans les trois cas. Le passage à CUDA ne prouve donc pas une baisse de VRAM; le cache quantifié reste une piste testée, non appliquée. Jan original retiré : aucun accès à ses réglages exacts, aucune comparaison mesurée avec cette installation.

SHA-256 portable : 0FE61A9155F3E68600B27B248DC23B8562FC85091FD94CA7CC3CB67ED6D1A3B2. Preuves : .build/cuda-build-artifacts.json, .build/cuda-packaged-devices.log, .build/cuda-vram-comparison/report.json. Journaux : .build/cuda-engine-build.log, .build/cuda-native-build.log et .build/cuda-desktop-build.log. Les avertissements préexistants sur les chunks et l'identifiant .app restent présents.


## Contrôle de Jan original installé — 17 octobre 2026

Inspection de la fenêtre Jan.exe de C:/Users/jmsga/AppData/Local/Programs/Jan par le skill computer-use, sans modifier de paramètres ni arrêter/recharger le modèle. Version UI 0.8.4; moteur sélectionné b11621 / win-cuda-13.4-x64. Le panneau de Tron-v1 affiche effectivement Context Size = 130000. Le store version 17 contient aussi ctx_len=130000. Cependant le modèle YAML ne contient aucun ctx_size, et le preset actif a [*] ctx-size = 8192 sans surcharge pour Tron-v1.

Preuve du contexte effectif : processus enfant llama-server.exe PID 13292 lancé avec --alias Tron-v1-Q4_K_M --ctx-size 8192 --no-cont-batching --cache-ram -1 --fit off --model C:/msys64/home/jmsga/jan/Tron-v1-Q4_K_M.gguf. Le journal de chargement confirme n_slots=4, n_ctx_slot=8192, kv_unified=true (app.log ligne 276 lors de l'inspection). La VRAM totale relevée par nvidia-smi est de 2791 Mio sur 8151 Mio. Caches K/V f16, Flash Attention auto. Il existe donc un décalage démontré entre valeur affichée/persistée dans l'interface et configuration effectivement transmise au moteur dans cette installation. Cela explique la faible consommation observée; ce contrôle n'établit pas une consommation de 2,7 Go à 130000 tokens réellement alloués.

La version maison avait été testée avec un contexte réellement chargé de 130048 (alignement de 130000). La comparaison précédente mélangeait donc deux contextes effectifs différents. Les hypothèses CUDA/Vulkan et cache quantifié n'expliquent pas ce contrôle précis. Jan original laissé ouvert sur le panneau montrant Context Size 130000; aucune préférence modifiée, aucune discussion envoyée/supprimée, aucun nouveau build.


## Correction vitesse CUDA Graphs — 17 octobre 2026

Écart utilisateur confirmé dans les logs du portable : environ 22 tokens/s, contre environ 130 dans Jan original. Comparaison contrôlée du même GGUF, même prompt, contexte effectif 130048 (130000 demandé), 128 tokens générés : ancien worker environ 17 tokens/s sur cet essai, ancien llama-server b11621 environ 156 tokens/s. Toutes les couches étaient sur GPU, mêmes 5334 Mio de cache KV, Flash Attention effectivement activé. Les CUDA Graphs étaient désactivés dans le CMakeCache du worker; le moteur original déclarait USE_GRAPHS=1.

Cause de compilation corrigée dans build.rs : le premier étage construit ggml séparément et perdait GGML_CUDA_GRAPHS_DEFAULT=ON défini par le CMake racine de llama.cpp. GGML_CUDA_GRAPHS=ON est maintenant explicite pour engine-cuda. Le helper Windows vérifie aussi cette option avant staging. Aucun réglage utilisateur de contexte, de cache ou Flash Attention modifié.

Mesures après correction, deux générations de 128 tokens par variante (tokens/s de décodage) : {"portable-auto": [177.62, 146.25], "original-auto": [133.61, 133.97], "portable-flash-on": [136.64, 135.43]}. Preuves et journaux : .build/tron-speed/, .build/tron-speed-graphs/, .build/cuda-graphs-engine-build.log, .build/cuda-graphs-package.log et .build/cuda-graphs-artifacts.json. Ces essais sont locaux et ne créent aucune discussion dans Jan.

Le worker et ggml ont été recompilés; les ressources CUDA corrigées ont été incorporées aux installateurs EXE/MSI et au portable via tauri bundle. L'exécutable d'interface validé précédemment est réutilisé, car l'interface et le protocole worker n'ont pas changé. Empreintes du runtime portable comparées au moteur testé; détection CUDA0 validée avec PATH limité à System32, sans CUDA_PATH. Contexte 130000 conservé. Aucune publication distante.

SHA-256 worker corrigé : F8F357371DE602735F806B90694874CCC5779E0058E8016AE5F614F6DA921321. SHA-256 ggml-cuda corrigé : 266487069CDF6C80062F697476E03EAAA7F36A783FA54968190FD5BFC12A85F7. SHA-256 desktop : 0FE61A9155F3E68600B27B248DC23B8562FC85091FD94CA7CC3CB67ED6D1A3B2.


## Question sous les boutons de fenêtre — 17 octobre 2026

Réservation de 64 pixels en haut des routes discussions et Cowork, hors de la zone de défilement. Le premier message ne démarre plus à y=0 sous la barre de déplacement et les contrôles Windows (conteneur de 60 pixels). La saisie conserve sa position basse. Les longs échanges restent défilants; le comportement d'ancrage automatique en bas est conservé.

Validation : 48 tests ciblés réussis (discussions 33, layout racine 15). Une assertion obsolète attendait encore le header et le sélecteur supprimés précédemment; elle décrit désormais le compositeur sans ces anciens éléments. Premier essai Vitest bloqué par EPERM du bac à sable; relance autorisée réussie. TypeScript/Vite et EXE release compilés, NSIS/MSI et portable actualisés. Contrôle natif sur une copie de test du nouveau build pendant le packaging : recherche puis ouverture du fil Ferrari F50, défilement au début, question entière à y=65 sous les contrôles et saisie maintenue en bas. Aucun message envoyé ni supprimé; copie de test fermée ensuite.

Le runtime CUDA Graphs livré est strictement identique par SHA-256 au moteur validé à 146–178 tokens/s; aucune préférence de contexte ou de cache modifiée. Empreintes : .build/message-top-spacing-artifacts.json. Journaux : .build/message-top-spacing-tests.log et .build/message-top-spacing-build.log. SHA-256 portable : B3E7631B151B40834D2B8443A02A5BF97DA44D28BD61F893317E1D3ACDD11F7E. Aucun envoi distant.

## Reprise Luna — vérification GitHub du 20 octobre 2026

Le navigateur connecté a permis de vérifier directement `https://github.com/janhq/jan/pulls` : GitHub affiche 185 PR ouvertes. Les entrées récentes incluent déjà plusieurs contributions `TRON-ABS` des 19–20 octobre ; les vérifier avant tout nouveau correctif. Le bug #9076 est **fermé** par #9124, et l'issue récente #9323 est déjà reliée à la PR ouverte #9326 : tous deux sont écartés.

La liste GitHub `is:open type:Bug`, triée par création, montre entre autres #9308 (AppImage), #9306 (Ubuntu 26.04), #9304 (police russe), #9286 (crash du serveur API Flatpak), #9275, #9270 et #9220. #9304 est ouvert et sans PR liée au moment du contrôle, mais son rapport « Menlo ne rend pas le russe » est trop vague pour retenir le cas sans reproduire le défaut : la base consultée déclare Inter comme police sans-serif principale. Aucun correctif n'a été écrit pour ce candidat.

La branche isolée locale `codex/fix-cyrillic-font-fallback` a été créée dans le checkout de contribution pour examiner #9304; elle est propre et ne contient aucun commit. La création a nécessité une opération avec élévation après le refus d'accès sur `.git/refs/heads`. Le dossier principal, avec ses nombreuses modifications préexistantes, n'a pas été modifié par cette reprise.

**État publication :** l'API GitHub par script échoue faute d'identifiant GitHub enregistré pour les commandes locales (`github-access.py`: « No saved GitHub credential available »). Le navigateur est connecté et permet la consultation, mais aucune tentative de publication authentifiée n'a encore été faite. Ne pas considérer cela comme un refus de publication. Avant de choisir un nouvel issue, confirmer le `main` officiel actuel et les doublons PR ouverts/fermés, puis sélectionner un défaut suffisamment décrit et reproductible. Aucune validation, aucun commit, aucune PR ne sont annoncés pour cette reprise.

## Mise à jour locale 0.8.7 — variante installée cyan, 20 octobre 2026

L’utilisateur a explicitement choisi le Jan installé avec la main cyan. La variante Tron du dépôt principal ne doit pas remplacer cette installation. Sources cyan `.build/panel-official` fusionnées depuis v0.8.6 vers le tag officiel v0.8.7, en conservant DuckDuckGo, l’icône cyan et les conversations persistantes (#9311). Contrôles : TypeScript et Vite réussis, 4 303 tests cyan réussis / zéro échec / deux tests optionnels désactivés, 71 tests de route réussis et test avec le modèle réel réussi. CLI release 0.8.7 compilée. Moteur b11721 CUDA existant à préserver par empreinte. Compilation desktop et installation suivies dans `deliverables/installation-cyan-v0.8.7-2026-10-20.md`, preuves dans `.build/local-update-0.8.7/`. Aucune publication GitHub pour cette mise à jour locale.

### Installation cyan 0.8.7 terminée — 20 octobre 2026, 15:30

Desktop et CLI release compilés. Archive extraite et tous les fichiers vérifiés par SHA-256 ; démarrage isolé validé avec migration store 0.8.6 vers 0.8.7, schéma MCP 4 vers 5, configuration MCP strictement conservée. Les six icônes intégrées correspondent à la main cyan. EXE installé : SHA-256 5A1332D51CEC3B86BECDB4EC7264F3FDD54D8F75C322AAB949BDD7319827270D. Les huit fichiers du moteur CUDA restent identiques et les 17 fichiers utilisateur suivis sont inchangés avant/après remplacement. CLI ajouté, bun/uv et raccourcis conservés ; métadonnée Windows DisplayVersion=0.8.7. Application laissée fermée pour relance utilisateur. Retour arrière disponible sous `.build/local-update-0.8.7/rollback/`. Rapport : `deliverables/installation-cyan-v0.8.7-2026-10-20.md`. Aucun contrôle visuel de la nouvelle fenêtre ni publication distante.

## Dépôt principal remplacé par la variante cyan — 20 octobre 2026

Sur demande explicite de l’utilisateur, les sources Tron actives à la racine ont été supprimées et remplacées par les sources cyan 0.8.7 précédemment sous `.build/panel-official`. Emplacement actuel unique de travail : `C:/msys64/home/jmsga/jan`. Branche : `codex/jan-cyan-0.8.7`, basée sur le tag officiel v0.8.7 ; personnalisations cyan conservées comme modifications locales. Historique Git, contributions existantes et rapports conservés. Les 2 907 fichiers sources déplacés ont été contrôlés par SHA-256, aucun écart ; 19 jonctions internes réorientées et vérifiées. Scripts de compilation cyan et de contrôle d’icône actualisés. Aucun nouveau test ni build exécuté pour ce déplacement ; les validations précédentes restent celles de la version installée. L’application installée et ses données ne sont pas modifiées par cette opération.

## Deux correctifs publiés séparément — 20 octobre 2026

1. **PR #9364 — fix(markdown): preserve fenced and inline code during math normalization** : https://github.com/janhq/jan/pull/9364. Défaut reproduit sur main officiel 8c0615520 : 8 tests échouent et 2 passent avant ; 47 tests Markdown réussis après. TypeScript, ESLint et diff réussis. Commit signé vérifié aa7d51465b486a930010fccc784dd25f1a5de42e. Deux fichiers, protection des clôtures de code et spans contre les transformations mathématiques.
2. **PR #9365 — fix(tables): preserve literal code whitespace in exported cells** : https://github.com/janhq/jan/pull/9365. Reproduction avec une vraie réponse Markdown : les espaces dans une valeur littérale de code étaient condensés dans les exports. Avant : 5 régressions en échec et un contrôle prose réussi ; après : 43 tests réussis. TypeScript, ESLint et diff réussis. Commit signé vérifié 03d33936fd48c5be6304d9f54ea36ae502d276f1. Le candidat initial concernant les retours <br> a été abandonné après contrôle d’intégration ; il ne fait pas partie de la PR.

Main et doublons revérifiés avant chaque publication. PR indépendantes, même base officielle, aucun fichier modifié commun, aucun ordre de fusion requis. Contenu et descriptions distants vérifiés ; toutes deux ouvertes, non brouillons, non fusionnées, sans revue ni check-run, statut agrégé pending au contrôle. Validation locale uniquement. Attachées à cette conversation. Checkout de contribution propre ; sources principales cyan et installation inchangées. Rapport et preuves : deliverables/two-pr-2026-10-20/README.md et final-verification.json.

## Série de dix contributions — travail en cours — 20 octobre 2026

Demande autorisée : dix nouveaux défauts reproductibles, sélectionnés par importance, avec une PR indépendante publiée et vérifiée avant la suivante. Quatre agents : coordination/publication, recherche de doublons, reproduction/correction, revue indépendante. Aucun correctif historique n'est compté dans cette série.

Base officielle initiale contrôlée par API et fetch : `8c0615520239ba668717c20dd3a1b0733549b8f3`. Checkouts isolés : `.build/ten-fixes/implementation` et `.build/ten-fixes/review`. Sources cyan préservées ; empreintes initiales dans `.build/ten-fixes/cyan-source-baseline.json`. Aucun déploiement, aucune installation ni utilisation de données réelles.

Premier candidat sélectionné : les suppressions de conversations ignorent les erreurs disque côté natif et retirent l'état en avance côté interface. Audit de doublons conservé dans `.build/ten-fixes/discovery/deletion-search.json`. Reproduction et correctif en cours ; aucun test réussi ni aucune nouvelle PR encore annoncés. Les candidats déjà couverts par #9326, #9327, #9328 et #9337 sont écartés.

### Contribution 1/10 publiée — suppression des conversations — PR #9366

[#9366](https://github.com/janhq/jan/pull/9366) — `fix(threads): preserve conversations when deletion fails`. Main et doublons recontrôlés juste avant publication. Preuve native avant : retour Ok malgré fichier verrouillé conservé ; après : erreur remontée et nouvelle tentative réussie. Validation locale : **87 tests web, 33 tests natifs Windows**, TypeScript et ESLint réussis. Revue indépendante approuvée, génération arrêtée avant tentative, échecs individuels/groupés conservés dans l'interface. Limite : suppression disque non transactionnelle, aucun rollback des fichiers déjà retirés.

Commit signé vérifié `de1cd02a7859aad195514eee2d23f3c5bfe1deca`, arbre et contenu exact des 17 fichiers distants contrôlés, description distante identique. PR ouverte, non fusionnée ; au contrôle aucun check-run ni revue GitHub, statut agrégé pending. Attachée au chat. Preuves `.build/ten-fixes/implementation-evidence/` et `deletion-prepublish.json`.

### Contribution 2/10 publiée — création refusée et brouillon — PR #9367

[#9367](https://github.com/janhq/jan/pull/9367) — `fix(threads): preserve new chat drafts when creation fails`. Avant sur main : 2 régressions service en échec / 1 contrôle réussi, test UI également en échec avec composant officiel. Après : **65 tests / 3 suites réussis**, TypeScript et ESLint réussis ; revue indépendante et répétition indépendante des 65 tests réussies. Le service ne renvoie plus une conversation non sauvée ; l'interface affiche l'erreur, conserve brouillon/pièces jointes et permet de réessayer sans naviguer prématurément.

Commit signé vérifié `704e99c4cd046ad6b164e9c52846a2789cfdbf64`, arbre et cinq fichiers distants contrôlés, description distante identique. Main et doublons recontrôlés avant publication, aucune dépendance. PR ouverte non fusionnée ; aucun check-run ni revue GitHub, statut pending lors du contrôle. Attachée au chat. Preuves `.build/ten-fixes/creation-evidence/` et `creation-prepublish.json`. Les persistances sont simulées dans les tests ; aucun disque réel saturé ni installation testée.

### Contribution 3/10 publiée — conserver le modèle sans assistant — PR #9368

[#9368](https://github.com/janhq/jan/pull/9368) — `fix(threads): preserve selected model when removing an assistant`. Retirer l'assistant persistait un tableau vide, puis rechargeait la conversation sans son modèle. Le service écrit désormais l'entrée model-only déjà utilisée à la création. Roundtrip réel du service avec extension simulée : échec avant, **24 tests réussis après**, TypeScript et ESLint réussis. Revue indépendante par deux autres agents.

Commit signé vérifié `c8a78e3473334a7877137415b6731a679bce3b9d`, arbre et trois fichiers distants contrôlés. Main et doublons recontrôlés avant publication ; PR ouverte non fusionnée, aucun check-run ni revue GitHub, statut pending au contrôle. Attachée au chat. Pas de dépendance de fusion ; chevauchement de fichier avec #9366/#9367 sur d'autres méthodes du service. Preuves `.build/ten-fixes/review-evidence/` et `model-prepublish.json`. Les modèles déjà perdus ne sont pas récupérés.

### Contribution 4 publiée et arrêt demandé — pièces jointes en attente — PR #9369

[#9369](https://github.com/janhq/jan/pull/9369) — `fix(chat): retain attachment drafts while a turn is running`. Avant : deux régressions échouent, le message texte part dans la file sans ses pièces jointes. Après : brouillon et fichiers conservés avec invitation à attendre, entrées fichiers bloquées pendant streaming/outils selon contrat text-only de #7836. **44 tests réussis**, TypeScript et ESLint réussis, revue finale par coordinateur distinct de l'auteur. Commit signé vérifié `b000aa4a7aa872d649dff5b51a137a0947845c33`, arbre et deux fichiers distants ainsi que description contrôlés. PR attachée ; ouverte non fusionnée, zéro check-run et revue GitHub, pending au contrôle. Chevauchement avec #9367 dans ChatInput/test signalé, aucune validation combinée revendiquée.

**Arrêt explicite de l'utilisateur pour manque de crédits. Série arrêtée à quatre nouvelles PR, pas dix.** Aucun travail ni publication supplémentaire ne doit continuer sans nouvelle demande. Les quatre PR #9366, #9367, #9368, #9369 restent indépendantes et non fusionnées. Aucun déploiement ni installation, aucune donnée utilisateur ou source cyan modifiée.

Travaux incomplets conservés pour éventuelle reprise, NON prêts à publier :
- `.build/ten-fixes/settings`, branche `codex/protect-settings-after-read-failure` : protection lecture IPC/hydratation, 14 tests réussis / 3 échoués ; pas de TypeScript, lint, revue ni validation combinée avec #9330. Preuves settings-evidence.
- `.build/ten-fixes/stats`, branche `codex/isolate-stream-statistics` : propriété des statistiques de flux, 87 tests réussis / 6 échoués ; pas de TypeScript/lint. Preuves stats-evidence.
- `.build/ten-fixes/coordinator`, branche `codex/report-message-loading-failures` : aucune correction commencée sur le chargement ; branche propre basée sur main.
Les autres pistes/audits restent sous discovery ; elles ne constituent pas des contributions publiées ou validées. Tous les agents sont arrêtés.

## Reprise seul — trois contributions — 20 octobre 2026

Demande utilisateur : trois nouveaux correctifs choisis par importance, contrôles main/doublons pour chacun et publication une par une. Travail sans sous-agents. Main vérifié `8c0615520239ba668717c20dd3a1b0733549b8f3`, preuves `.build/three-more-2026-10-20/`. Les quatre PR de la série précédente ne sont pas comptées.

### 1/3 — réglages après échec de lecture — PR #9371

[#9371](https://github.com/janhq/jan/pull/9371) — `fix(settings): protect saved preferences after hydration read failures`. Cinq régressions échouaient avant sur main ; **17 tests réussis après / trois suites**, ESLint réussi. Contrôle TypeScript de l'application réussi avec configuration temporaire mappant core et les trois API plugins sur leurs déclarations existantes ; `tsc -b` standard a échoué faute de liens de paquets workspace, aucun build réussi revendiqué. Protection des clés pending/failed et retries hydratation bornés ; aucune donnée ou préférence réelle utilisée.

PR indépendante de #9330 mais conflit manuel attendu dans backendStorage.ts : conserver sérialisation et garde des lectures ; combinaison non testée explicitement. Main et doublons recontrôlés juste avant publication. Commit signé `a319690445e403949cdd05cca2aa82da6e35bde6`, arbre et cinq fichiers distants vérifiés ; description distante identique. Attachée au chat, ouverte non fusionnée ; aucun check-run ni revue GitHub, pending au contrôle. Revue finale effectuée par le coordinateur seul, conformément à la consigne utilisateur. Preuves `.build/ten-fixes/settings-evidence/`.

### 2/3 — erreur de lecture de l'historique et reprise — PR #9372

[#9372](https://github.com/janhq/jan/pull/9372) — `fix(chat): report history read failures and allow retry`. Le service convertissait une lecture refusée/extension absente en conversation vide. Défaut reproduit avant : trois nouveaux tests en échec ; ancien code de route vérifié séparément 75 tests existants réussis, nouveau test de reprise échoué. Après : **102 tests / quatre fichiers réussis**, ESLint et contrôle TypeScript application avec dépendances workspace explicitement mappées réussis. Erreur visible avec bouton Try again, état local conservé, réponses tardives ignorées après navigation. Pas de réparation automatique de fichiers endommagés ni modification du comportement initial de lecture en attente.

Main et doublons recontrôlés, aucun correctif équivalent ; #7908 export, #8071 écriture atomique et #9326 ordonnancement distincts. Commit signé vérifié `c8afc7895d839dd4a9dc7eb0844d6ba9e41f2b6a`, arbre, six fichiers et description distants vérifiés. PR attachée, ouverte non fusionnée, aucun check-run/revue GitHub et statut pending au contrôle. Revue finale seul ; aucune validation CI, build de packages ou test desktop réel revendiqués. Preuves `.build/ten-fixes/history-evidence/`.

### 3/3 — statistiques des flux attribuées à leur discussion — PR #9373

[#9373](https://github.com/janhq/jan/pull/9373) — `fix(chat): keep live stream statistics with their originating thread`. Trois régressions échouaient sur main avant correction. Le transport transmet désormais un identifiant client distinct des paramètres d'inférence ; chaque extracteur local le capture au lieu de relire le marqueur global pour chaque chunk. Deux flux llama.cpp/MLX entrelacés gardent leurs compteurs, chargements et progression ; un modèle sans discussion renvoie ses métadonnées mais ne modifie pas les indicateurs du chat.

**236 tests / 14 fichiers réussis**, ESLint et contrôle TypeScript application avec déclarations workspace existantes mappées réussis. Pas d'inférence parallèle réelle ni test macOS MLX : sessions natives/constructeurs sont simulés. Contrôle final a détecté une ligne vide superflue dans le nouveau test ; retirée avant création de branche/commit distants, puis diff check réussi. Main/doublons revérifiés, aucun équivalent. Commit signé `3609a35104c8b05a6488b7b69940d72c7cabe8ef`, arbre, cinq fichiers et description distants vérifiés. PR attachée, ouverte non fusionnée, zéro check-run/revue GitHub et pending au contrôle. Revue finale seul. Preuves `.build/ten-fixes/stats-evidence/`.

### Bilan de cette reprise

Trois nouvelles PR publiées et contrôlées successivement : #9371 puis #9372 puis #9373. Aucun sous-agent lancé pendant cette reprise. Aucune fusion, aucun déploiement ou installation. Les mentions historiques « settings/stats incomplets » de l'arrêt précédent sont remplacées par les contributions #9371/#9373 ci-dessus. Aucun succès CI ou approbation de mainteneur revendiqué. Le TypeScript validé est celui de l'application avec configuration temporaire de résolution des paquets workspace ; pas un build standard de tous les packages. Les branches sont indépendantes ; conflits/chevauchements connus et limites sont indiqués dans les descriptions, aucune validation combinée revendiquée.

## Trois nouveaux correctifs — 21 octobre 2026 — en cours

Travail seul, sur main officiel `8c0615520239ba668717c20dd3a1b0733549b8f3`, avec contrôles des PR ouvertes et fermées avant chaque publication. Checkouts isolés sous `.build/three-fixes-2026-10-21/` ; sources cyan et installation préservées.

### 1/3 publiée — projets et erreurs de stockage — PR #9375

[#9375](https://github.com/janhq/jan/pull/9375) — `fix(projects): preserve saved projects when storage operations fail`. Une lecture échouée devenait une liste vide puis écrasait le stockage lors d'une mutation. Les erreurs de lecture/JSON et d'écriture remontent maintenant ; mutation interrompue avant écriture et retry possible. Avant : 9 échecs / 9 réussites ; après : 28 tests réussis / 3 fichiers. ESLint et TypeScript application avec déclarations workspace mappées réussis ; avertissements React act existants. Deux fichiers, commit signé vérifié `ad61ef51fe557be364bc90430486d856322ea180`, contenu/arbre/description distants vérifiés et PR attachée. Main et doublons recontrôlés. #7919 migre vers fileStorage mais conserve les deux erreurs avalées : conflit manuel attendu, sans dépendance de fusion ni validation combinée. Protection au niveau service ; aucun changement des dialogues/toasts ni réparation de données. Ouverte non fusionnée, aucun check-run/revue GitHub, pending au contrôle. Preuves `projects/` sous le dossier de cette série.

### 2/3 publiée — isolation des moteurs en panne — PR #9376

[#9376](https://github.com/janhq/jan/pull/9376) — `fix(providers): isolate runtime engine discovery failures`. Un rejet de list/getSettings par un seul moteur vidait tout le résultat, y compris les fournisseurs intégrés. L'erreur est maintenant isolée par moteur ; les autres restent disponibles et le moteur est interrogé au prochain refresh. Avant : 3 nouveaux échecs / 37 réussites ; après : 53 tests réussis / 3 fichiers. ESLint et TypeScript application avec déclarations workspace mappées réussis. Deux fichiers, commit signé vérifié `325ccfa0b49f0e674868fe55012216070b2bedc4`, arbre/contenu/description distants vérifiés, PR attachée. Main/doublons recontrôlés ; #7992 touche la récupération distante des modèles dans une autre méthode. Aucun prérequis, aucun fichier modifié commun à #9375. Aucun démarrage desktop réel ; le registre global garde son catch historique. Ouverte non fusionnée, zéro check-run/revue GitHub, pending au contrôle. Preuves `providers/`.

Piste des paramètres des fournisseurs abandonnée : #7481/#7487 montrent que leur suppression sur les fournisseurs prédéfinis est volontaire. Aucun correctif de paramètres publié. Le checkout initialement nommé `parameters-implementation` sert maintenant au dialogue de projet, branche `codex/await-project-dialog-saves`.

### 3/3 publiée — attendre la sauvegarde du dialogue — PR #9377

[#9377](https://github.com/janhq/jan/pull/9377) — `fix(projects): await dialog saves and retain failed drafts`. Le dialogue annonçait le succès et effaçait nom/assistant avant la résolution du callback asynchrone. Le composant attend maintenant la sauvegarde, conserve le brouillon après rejet avec message d'erreur traduit (en/fr), permet de réessayer et bloque doubles soumissions/fermeture pendant l'attente. Avant : 4 échecs / 1 contrôle réussi ; après : 26 tests réussis / 4 fichiers sur branche indépendante. Avec les fichiers service/tests de #9375 temporairement appliqués : 33 tests réussis / 4 fichiers ; fichiers de base restaurés à l'octet avant publication. ESLint et TypeScript application avec déclarations workspace mappées réussis. Tests React/jsdom avec hooks simulés, aucun essai desktop ni quota disque réel.

Quatre fichiers, commit signé vérifié `d2273990205974eace801a1abd2f56387f11ead3`. L'API GitHub Contents a renvoyé un base64 incohérent pour la traduction française : publication interrompue avant création de PR, puis reprise après vérification de l'arbre et des octets des quatre blobs Git exacts, tous identiques à l'index testé. Aucun second commit ni PR en doublon. Détail `dialog/content-diagnostic.json` et `dialog/verification.json`. Description et diff distants vérifiés, PR attachée. Main/doublons recontrôlés avant la reprise. Ouverte non fusionnée, zéro check-run/revue GitHub, pending au contrôle.

**Ordre recommandé : #9375 puis #9377** pour que les erreurs de stockage cessent d'être avalées au niveau service et atteignent le dialogue. Branches basées chacune directement sur main ; aucun fichier modifié commun. #9376 est indépendante des deux autres. #7919 nécessite une résolution manuelle avec #9375 ; le dialogue est distinct. Aucun contrôle combiné avec les autres contributions historiques n'est revendiqué.

### Bilan final de la série du 21 octobre

Trois nouvelles PR publiées successivement et vérifiées : #9375, #9376, #9377. Contrôles main/doublons renouvelés pour chacune, défauts reproduits avant correction, tests/lint/TypeScript ciblés réussis. Aucun sous-agent utilisé. Les trois branches locales isolées sont alignées sur les commits signés distants et propres pour les fichiers suivis ; configurations de validation temporaires non suivies conservées. Sources cyan, installation et données utilisateur inchangées. Validation locale uniquement, aucune approbation GitHub, CI réussie ou fusion annoncée. Rapport : `deliverables/three-pr-2026-10-21.md` ; preuves : `.build/three-fixes-2026-10-21/`.

## Nouvelle série de trois contributions — 21 octobre 2026

Demande renouvelée de trois nouveaux correctifs, choisis par importance, contrôles main/doublons pour chacun et publication successive. Aucun sous-agent. Base officielle `8c0615520239ba668717c20dd3a1b0733549b8f3`, vérifiée via API et fetch. Sources cyan et données utilisateur préservées, checkouts dédiés sous `.build/next-three-2026-10-21/`.

### 1/3 publiée — suppression des assistants — PR #9378

[#9378](https://github.com/janhq/jan/pull/9378) — `fix(assistants): preserve state when deletion fails`. Le store retirait l'assistant et modifiait les sélections avant l'issue de la suppression ; le dialogue se fermait malgré l'échec. Suppression attendue, erreurs d'extension absente propagées, sélections actuelles relues après l'attente, dialogue gardé ouvert avec erreur et retry. Avant : store 3 échecs / 1 contrôle réussi ; dialogue 1 échec / 1 contrôle réussi. Après : 58 tests réussis / 8 fichiers ; ESLint des quatre sources et TypeScript application avec déclarations workspace mappées réussis. 11 fichiers, commit signé `239ee94e62f20399dcf5d4d12abae09fc3dfac14`. Arbre, blobs Git, diff et description distants vérifiés ; PR attachée. Zéro check-run/revue GitHub, pending, ouverte non fusionnée au contrôle. #8091 modifie la relecture avant édition ; #7919 garde la suppression prématurée dans sa migration et exige une résolution manuelle du store. Aucune dépendance, aucune validation combinée avec ces PR. Preuves `assistant-evidence/`.

### Rectification d'encodage de la PR existante #9377

Le contrôle UTF-8 strict a détecté que le nouveau message français de #9377 était encodé en Windows-1252. Corrigé dans cette même PR par le commit signé vérifié `43997138eef1554c2225f6c7621bf69c2f04ac38`, un seul fichier. Message décodé strictement en UTF-8 et JSON parsé ; arbre et blob distants vérifiés et description actualisée. Aucun nouveau comportement ni test revendiqué pour cette correction de traduction. Checkout local aligné propre. Ne compte pas parmi les trois nouveaux correctifs. Détail : `9377-utf8-followup.json` dans le dossier de cette série. Les 11 fichiers de #9378 sont valides UTF-8, les deux traductions JSON validées.

### 2/3 publiée — délimiteurs SSE mélangés — PR #9379

[#9379](https://github.com/janhq/jan/pull/9379) — `fix(chat): preserve SSE responses across mixed line endings`. Le découpage limité à trois séparateurs regroupait certains événements nommés avec les réponses normales, supprimant la réponse. Analyse incrémentale des lignes CR/LF/CRLF et attente d'un CR terminal pour préserver les octets ; politique de flush conservée. Avant : 4 échecs / 16 réussites ; après : 63 tests réussis / 2 fichiers, vérification de toutes les coupures pour huit combinaisons et flux Unicode octet par octet. ESLint et TypeScript application avec déclarations workspace mappées réussis. Deux fichiers, commit signé `d40cf205869f365b122e386f42f50685934dc4e1`. Arbre, blobs, diff et description distants vérifiés ; reproduction affichant explicitement les séquences CR/LF et PR attachée. #8392 est l'implémentation initiale déjà fusionnée ; #8286 propose encore un ancien filtre inline sans corriger ce parseur. Aucune dépendance de fusion. Zéro check-run/revue GitHub, pending, ouverte non fusionnée au contrôle. Preuves `sse-evidence/`.

### 3/3 publiée — filtre SSE après retry sampling — PR #9380

[#9380](https://github.com/janhq/jan/pull/9380) — `fix(chat): filter named SSE events after sampling retries`. Le retry automatique d'un paramètre refusé pouvait réussir puis transmettre un événement progress non filtré au SDK, produisant AI_TypeValidationError. Traitement des réponses réussies partagé entre l'appel initial et le retry. Avant : 2 échecs / 45 réussites, dont erreur réelle de l'adaptateur SDK compatible. Après : 120 tests réussis / 7 fichiers, dont véritable SDK avec fetch simulé ; statut/en-têtes/signal conservés, paramètre retiré au retry, protocoles natifs et JSON inchangés. Avec les fichiers parseur/tests de #9379 appliqués temporairement : 130 tests réussis / 7 fichiers, base indépendante restaurée à l'octet ensuite. ESLint et TypeScript application avec déclarations workspace mappées réussis.

Deux fichiers, commit signé `49efdb336fe7205a660a11ad1dfbced7f057d4c2`. Main/doublons recontrôlés, arbre/blobs/diff/description distants vérifiés, PR attachée. #9373 partage le fichier factory dans d'autres régions ; #8286 propose un filtre inline à réconcilier s'il est repris. Aucune dépendance de fusion entre #9378, #9379 et #9380, aucun fichier modifié commun dans cette série. Les deux PR SSE sont complémentaires et validées ensemble. Zéro check-run/revue GitHub, pending, ouverte non fusionnée au contrôle. Preuves `retry-evidence/`.

### Bilan final de cette nouvelle série

Trois nouvelles PR publiées successivement : #9378, #9379, #9380. Aucune contribution précédente comptée. Contrôles des défauts sur main et des doublons renouvelés avant chaque publication. 58 tests comportementaux + 60 tests de clés de traduction pour #9378, 63 tests pour #9379, 120 pour #9380 et 130 pour la combinaison SSE (comptages chevauchants, pas de total global additionné). Les 60 tests de traduction ont aussi été ajoutés à la description distante de #9378. Tests/lint/TypeScript locaux réussis ; TypeScript via déclarations workspace existantes, pas un build standard des packages. Aucun appel réel à un fournisseur, aucun test desktop réel, aucune CI réussie/approbation/fusion revendiquée. Trois branches locales isolées alignées sur les commits signés distants et propres pour les fichiers suivis ; configurations temporaires non suivies conservées. Sources cyan, installation et données utilisateur préservées. Rapport : `deliverables/next-three-pr-2026-10-21.md`.

## Bengali ajouté — PR #9381 — 21 octobre 2026

Demande utilisateur : créer une PR pour le bengali. [#9381](https://github.com/janhq/jan/pull/9381) — `fix(i18n): add missing Bengali language support`, branche `codex/add-bengali-localization`, basée sur main officiel `8c0615520239ba668717c20dd3a1b0733549b8f3`. Recherches ouvertes/fermées Bengali, Bangla et বাংলা avant création et publication : aucun équivalent. Ajout du code `bn`, du libellé natif « বাংলা » et des 14 namespaces, soit 1 460 feuilles de texte correspondant exactement à l'anglais de cette base. Le sélecteur importe le hook depuis son module existant ; test avec vrai sélecteur/provider de traduction, interpolation et préférence bn conservée.

Traduction initiale assistée par Google Translate à partir des textes publics anglais, marqueurs protégeant variables/code/liens/termes techniques et glossaire manuel. Reprises manuelles des libellés, invites de saisie, textes de chat, commandes et de l'intégralité du namespace outils/autorisations. **Aucune relecture par un locuteur natif ni certification linguistique revendiquée** ; limite explicitement indiquée dans la description de PR.

Validation : 111 tests réussis / 7 fichiers (clés, placeholders/code, i18n, sélecteur, réglages généraux et store), ESLint du sélecteur et des déclarations réussi, TypeScript application réussi avec déclarations workspace existantes mappées. La première suite de réglages n'a pas pu résoudre l'API agent-tools ; la configuration temporaire pointe ensuite sur les guest-js agent-tools/websearch du checkout et sur le core construit existant. Les 14 fichiers sont valides UTF-8/JSON, toutes les clés et variables correspondent ; code inline, URL, tags et flags CLI conservés ; aucun marqueur résiduel ni caractère de remplacement. Aucun build standard de tous les packages, lancement desktop ou contrôle visuel des glyphes revendiqué.

18 fichiers, commit signé vérifié `5affd45c30b10057f5f7751f5550ce148a7adcfc`. Arbre/blobs/diff et description distants vérifiés ; PR attachée, ouverte non fusionnée, aucun check-run/revue GitHub, pending au contrôle. Branche locale alignée sur le commit distant, propre pour les fichiers suivis ; configuration de test temporaire non suivie conservée. Pas de dépendance de fusion. Les PR pendantes #9377/#9378 ajoutent des messages anglais distincts : leurs équivalents bengalis devront accompagner ces clés lors de leur fusion, sans les inclure artificiellement dans la base officielle actuelle. Préserver aussi les ajouts des autres langues lors de la réconciliation du sélecteur/type. Sources cyan, installation et données utilisateur inchangées.

Preuves : `.build/bengali-2026-10-21/` (`initial-audit.json`, `preflight.json`, `locale-audit.json`, `translation-generation.json`, `manual-review.json`, `final-tests.log`, `typecheck.log`, `lint.log`, `pr.md`, `published.json`, `verification.json`). Aucun helper de traduction ou configuration temporaire dans le commit.

## Arabe standard ajouté — PR #9382 — 21 octobre 2026

Demande utilisateur : créer la PR pour l’arabe standard. [#9382](https://github.com/janhq/jan/pull/9382) — `fix(i18n): add standard Arabic translations and RTL support`, branche `codex/add-standard-arabic-localization`, base officielle `8c0615520239ba668717c20dd3a1b0733549b8f3`. Recherche Arabic/العربية/RTL renouvelée avant publication : aucune PR équivalente de langue arabe. Les contributions antérieures #7542/#8350 concernent le texte bidirectionnel et les blocs de code, dont le comportement LTR existant est conservé ; aucune clôture de #8346 revendiquée.

Ajout de العربية (`ar`), 14 namespaces et 1 460 feuilles correspondant exactement aux clés anglaises. Synchronisation initiale et au changement de langue des attributs HTML lang/dir, contexte de direction Radix, champs libres en direction automatique, URL/email/nombres en LTR et titres de dialogue à alignement logique. Dépendance directe react-direction 1.1.1 déjà résolue transitivement ; une seule ligne ajoutée au workspace dans yarn.lock, aucune nouvelle version. Traduction initiale assistée par Google Translate à partir de l’anglais public, reprises manuelles assistants/chat/outils/autorisations et libellés sélectionnés. Formulations de compte neutres compatibles avec le moteur one/other existant, sans changement du moteur pluriel. Relecture par un arabophone non obtenue, limite explicite dans la PR.

Validation locale : 168 tests réussis / 11 fichiers, dont vrai sélecteur/provider, persistance et restauration ar, retour LTR en anglais, comptes 0/1/2/3/11/102, champs techniques et tests existants des dialogues/blocs de code. ESLint des sept fichiers TypeScript de production et TypeScript application réussis. Configurations temporaires mappant le core construit, les guest-js Tauri et les déclarations workspace existantes ; aucun clean install/build standard de tous les packages revendiqué. Audit UTF-8/JSON, clés/variables/code/URL/tags/flags et absence de marqueurs résiduels réussi. Aperçu navigateur local des vrais composants inspecté : glyphes arabes joints, texte RTL, URL/nombre négatif/code LTR ; capture `rtl-preview.png`. Cela ne valide pas tous les panneaux physiques, resizers/toasts ni l’application native complète.

26 fichiers, commit signé vérifié `a4bca7f321e6ea296de0e9d4fa45923e6828b689`. Arbre/blobs/diff/titre/description distants vérifiés, PR attachée, ouverte non fusionnée ; zéro check-run/revue GitHub, statut pending au contrôle. Pas de dépendance de fusion ; chevauchement sélecteur/type avec Bengali #9381, conserver les deux langues. Les clés anglaises futures de #9377/#9378 devront recevoir leurs équivalents arabes lors de leur fusion. Sources cyan, installation et données utilisateur préservées.

Preuves : `.build/arabic-2026-10-21/` (`preflight.json`, `locale-audit.json`, `translation-generation.json`, `manual-review.json`, `refine-labels.py`, `tests.log`, `typecheck.log`, `eslint.log`, `rtl-preview.png`, `pr.md`, `published.json`, `verification.json`). Helpers, aperçu et configurations temporaires exclus du commit.

## Ourdou ajouté — PR #9397 — 21 octobre 2026

Demande utilisateur : créer une PR pour l’ourdou. [#9397](https://github.com/janhq/jan/pull/9397) — `fix(i18n): add Urdu translations and RTL support`, branche `codex/add-urdu-localization`, basée sur main officiel actuel `44aee093ae5a974c31ec43d24ceca163c0e59c14`. Recherches Urdu/اردو avant implémentation et juste avant publication : aucun équivalent trouvé. Ajout de اردو (`ur`), 14 namespaces et 1 463 textes, correspondant exactement aux clés anglaises actuelles, y compris les nouveaux messages de documents de main.

Support RTL initial et au changement de langue : lang/dir du document, contexte Radix, champs libres en auto et URL/email/nombres en LTR avec surcharge explicite possible, titres des dialogues à alignement logique et code existant en LTR conservé. Détection de direction compatible avec `ar` et `ur`, même si seuls les nouveaux fichiers ourdou sont ajoutés ici. Dépendance directe react-direction 1.1.1 déjà résolue transitivement, une ligne ajoutée au workspace de yarn.lock, aucune nouvelle version.

Le contrôle navigateur a révélé que le provider appliquait la langue restaurée après rendu sans rafraîchir les consommateurs : direction RTL mais libellés anglais. Reproduction par un vrai libellé rendu : 1 test en échec / 4 réussis avant correction. État de langue appliquée dans le provider pour rafraîchir les consommateurs après restauration des réglages ; le test vérifie ensuite les libellés ourdou et le retour en anglais. Le défaut et sa correction sont décrits dans la PR.

Traduction initiale assistée par Google Translate sur textes publics anglais avec marqueurs de protection. Révisions des namespaces assistants/chat/outils/autorisations, libellés sélectionnés common/settings/setup et 18 formes de comptes common avec formulations neutres ; pas de changement du moteur pluriel. **Relecture par un locuteur natif non obtenue**, limite explicite. Audit UTF-8/JSON, clés/variables/code/URL/tags/flags et absence de marqueurs résiduels : zéro problème. Les 169 tests ciblés / 11 fichiers passent, dont sélecteur réel, persistance/restauration ur, libellé après hydratation, comptes 0/1/2/3/11/102, champs et tests existants de dialogue/code. ESLint des sept fichiers TypeScript de production et TypeScript application réussis avec configurations temporaires et déclarations workspace existantes mappées ; pas de clean install ni build complet revendiqué.

Aperçu local avec vrais composants inspecté : glyphes ourdou joints, libellés traduits et texte RTL, URL/nombre négatif/code LTR ; capture `rtl-preview.png`. Aucun contrôle de toutes les vues desktop/panneaux/resizers/toasts ni validation native complète revendiqué. Serveur d’aperçu temporaire arrêté et onglet de validation fermé.

26 fichiers, commit signé vérifié `8aefadf68b30506d7327e55a978c85d68607d762`. Arbre/blobs/diff/titre/description distants vérifiés, PR attachée, ouverte non fusionnée ; zéro check-run/revue GitHub, statut pending au contrôle. Branche locale isolée alignée sur le commit distant. Pas de dépendance ni ordre de fusion obligatoire, mais chevauchement substantiel avec #9382 : réconcilier une seule implémentation RTL, conserver `ar`/`ur`, les deux langues/types et le rafraîchissement du provider ajouté ici. #9381 chevauche aussi sélecteur/type : préserver `bn`. Les clés futures de #9377/#9378 devront être traduites en ourdou lors de leur fusion. Installation, données et sources utilisateur préservées.

Preuves : `.build/urdu-2026-10-21/` (`initial-audit.json`, `preflight.json`, `locale-audit.json`, `translation-generation.json`, `manual-review.json`, `before-hydration-fix.log`, `tests.log`, `typecheck.log`, `eslint.log`, `rtl-preview.png`, `pr.md`, `published.json`, `verification.json`). Configurations, helpers et aperçu exclus du commit.

## Pidgin nigérian ajouté — PR #9398 — 21 octobre 2026

Demande utilisateur : créer la PR pour le pidgin nigérian. [#9398](https://github.com/janhq/jan/pull/9398) — `fix(i18n): add Nigerian Pidgin language support`, branche `codex/add-nigerian-pidgin-localization`, base officielle `44aee093ae5a974c31ec43d24ceca163c0e59c14`. Recherches pidgin/Nigerian renouvelées avant publication : aucun équivalent trouvé. Ajout du code `pcm` et du libellé natif « Naijíriá Píjin », référencés dans Unicode CLDR, avec les 14 namespaces et toutes les 1 463 clés anglaises de main. Aucun changement RTL ni dépendance ajoutée.

Provenance : brouillon de pidgin nigérian rédigé entrée par entrée par l’IA à partir de l’anglais public ; Google Translate n’a pas été utilisé pour la traduction, son endpoint rejetant pcm. Prose latine simple, libellé de langue CLDR accentué. Les libellés logiciels, noms techniques et formulations partagées avec l’anglais sont conservés lorsque pertinents : 643 feuilles identiques à l’anglais, essentiellement courtes. Couverture des clés ne signifie pas qualité linguistique certifiée. **Aucune relecture par un locuteur natif ni certification orthographique obtenue**, limite et demande de relecture explicites dans la PR.

La restauration pcm dans les réglages après initialisation anglaise reproduisait le défaut de rafraîchissement des consommateurs du provider : 1 échec / 3 réussites avant correction. Mise à jour d’état après application de la langue, pour rafraîchir les vrais libellés rendus. Le test vérifie le texte « How I fit help you today? » après restauration puis le retour en anglais. Tests complémentaires de sélection via vrai menu, préférence pcm sauvegardée/restaurée, interpolation d’autorisation et comptes 0/1/2/3/11/102.

Validation locale : 114 tests réussis / 7 fichiers, ESLint des trois fichiers de production TypeScript réussi, TypeScript application réussi avec déclarations workspace existantes mappées. Audit des 14 fichiers UTF-8/JSON, clés exactes, valeurs non vides, variables/code/URL/tags/flags et absence de marqueurs : zéro problème. Configurations Vitest temporaires avec core construit existant et guest-js Tauri du checkout. Aucun clean build global, lancement desktop ni validation native linguistique revendiqué.

19 fichiers, commit signé vérifié `9c6f6ae3caf4c9dd85f715ca38d44157bca2a245`. Arbre/blobs/diff/titre/description distants vérifiés, PR attachée, ouverte non fusionnée ; zéro check-run/revue GitHub, statut pending au contrôle. Branche isolée alignée sur le commit distant. Pas de dépendance ni ordre de fusion requis. Préserver `bn`, `ar`, `ur`, `pcm` en réconciliant les sélecteurs/types des PR #9381/#9382/#9397 ; le rafraîchissement du provider est également présent dans #9397 : conserver une seule version et préserver son état/contexte RTL. Traduire les clés futures de #9377/#9378 lors de leur fusion. Sources, installation et données utilisateur préservées.

Preuves : `.build/pidgin-2026-10-21/` (`initial-audit.json`, `preflight.json`, `translation-generation.json`, brouillons numérotés, `locale-audit.json`, `before-hydration-fix.log`, `tests.log`, `typecheck.log`, `eslint.log`, `pr.md`, `published.json`, `verification.json`). Helpers, brouillons et configurations temporaires exclus du commit.

## Arabe égyptien ajouté — PR #9400 — 21 octobre 2026

Demande utilisateur : créer la PR pour l’arabe égyptien. [#9400](https://github.com/janhq/jan/pull/9400) — `fix(i18n): add Egyptian Arabic translations and RTL support`, branche `codex/add-egyptian-arabic-localization`, base officielle `44aee093ae5a974c31ec43d24ceca163c0e59c14`. Recherches Egyptian/مصرى/مصري renouvelées avant publication : aucun équivalent trouvé. Sous-tag `arz` confirmé dans le registre IANA comme Egyptian Arabic, distinct de `ar`. Ajout du libellé « مصري » et des 14 namespaces, toutes les 1 463 clés anglaises actuelles, dont les trois nouveaux messages moteur.

Provenance : adaptation égyptienne rédigée par IA à partir des textes anglais publics et de la base arabe standard assistée par machine de #9382. 865 entrées explicitement rédigées/revues, 598 entrées arabes courtes partagées conservées ; tous les textes sources de plus de 65 caractères ont une adaptation explicite dans le relevé. Les namespaces assistants/chat/outils/erreurs moteur sont repris entièrement ; formulations égyptiennes pour les projets, réglages, fournisseurs, installation, sécurité, suppression et erreurs. Variables, code, liens et noms techniques préservés. **Relecture par un locuteur égyptien natif et certification orthographique non obtenues** ; brouillon et limites clairement indiqués dans la PR. Google Translate n’a pas produit la variante égyptienne, son endpoint rejetant arz.

RTL au chargement et au changement de langue : lang/dir du document, contexte Radix, champs libres en auto, URL/email/nombres LTR et surcharges explicites possibles, alignement logique des titres de dialogue ; code LTR existant préservé. Rafraîchissement des consommateurs après restauration de la langue repris du correctif de #9397/#9398. Détection RTL conserve ar/ur/arz, sans ajouter les ressources des autres langues. Dépendance directe react-direction 1.1.1 déjà résolue transitivement, une ligne workspace ajoutée au lockfile, aucune nouvelle version.

Validation locale finale : 169 tests réussis / 11 fichiers, ESLint des sept fichiers TypeScript de production et TypeScript application réussis. Vrais sélecteur/provider, préférence arz, libellés visibles après hydratation, textes égyptiens spécifiques, métadonnées lang/RTL/restauration et retour anglais/LTR, comptes 0/1/2/3/11/102, champs techniques, suites existantes de réglages/dialogue/code. Formulation du compte singulier de référence de fichier harmonisée avec l’affichage numérique pendant les contrôles. Audit UTF-8/JSON, clés exactes, valeurs non vides, variables/code/URL/tags/flags et absence de marqueurs : zéro problème. Configurations temporaires utilisant déclarations workspace existantes, core construit et guest-js Tauri du checkout ; pas de clean install/build complet revendiqué.

Aperçu navigateur local avec vrais composants inspecté : glyphes joints, textes égyptiens et RTL, URL/nombre négatif/code LTR. Capture `rtl-preview.png`. Aucun contrôle de toutes les vues natives/panneaux/resizers/toasts ni relecture linguistique native revendiqué. Onglet fermé et serveur temporaire arrêté après validation.

26 fichiers, commit signé vérifié `482d429940d2cbdb68d5a0b3c7d685667c73533b`. Arbre/blobs/diff/titre/description distants vérifiés, PR attachée, ouverte non fusionnée ; zéro check-run/revue GitHub, statut pending au contrôle. Branche locale isolée alignée sur le commit distant. Pas de dépendance ni ordre de fusion obligatoire, mais chevauchement substantiel RTL avec #9382/#9397 : réconcilier une seule implémentation en gardant ar/ur/arz et le rafraîchissement du provider partagé avec #9398. Préserver bn/ar/ur/pcm/arz dans les sélecteurs/types des PR #9381/#9382/#9397/#9398. Traduire les clés futures de #9377/#9378 lors de leur fusion. Installation, données et sources utilisateur préservées.

Preuves : `.build/egyptian-2026-10-21/` (`initial-audit.json`, `preflight.json`, `translation-generation.json`, `adaptation-audit.json`, brouillons numérotés, `locale-audit.json`, `tests.log`, `typecheck.log`, `eslint.log`, `rtl-preview.png`, `pr.md`, `published.json`, `verification.json`). Helpers, brouillons, aperçu et configurations temporaires exclus du commit.

## Marathi ajouté — PR #9401 — 21 octobre 2026

Demande utilisateur : créer la PR pour le marathi. [#9401](https://github.com/janhq/jan/pull/9401) — `fix(i18n): add Marathi language support`, branche `codex/add-marathi-localization`, base officielle `44aee093ae5a974c31ec43d24ceca163c0e59c14`. Recherches Marathi/मराठी renouvelées avant publication : aucun équivalent trouvé. Ajout de « मराठी » (`mr`), des 14 namespaces et de toutes les 1 463 clés anglaises actuelles. Aucun ajout de paquet ni changement RTL.

Traduction initiale assistée par Google Translate sur les textes anglais publics, avec glossaire commun et marqueurs de protection des variables/code/liens/commandes. Le moteur avait converti des chiffres de marqueurs en devanagari : normalisation uniquement à l’intérieur des délimiteurs de marqueurs puis reprise depuis le cache, toutes les protections contrôlées ensuite. Révisions complètes des namespaces assistants/chat/outils/autorisations et de libellés sélectionnés common/settings/providers. Compteurs courants reformulés en libellés neutres, sans changement du moteur pluriel. **Aucune relecture par un locuteur marathi natif obtenue**, limite et demande de relecture explicites dans la PR.

Un contrôle complémentaire a trouvé quatre identifiants traduits par erreur : YOUR-RESOURCE-NAME, web_search/web_fetch et memory_write/memory_read dans quatre entrées. Révisions des textes concernés et tests permanents comparant ces identifiants, chat_template_kwargs, /help et /models avec l’anglais. Le provider rafraîchit les consommateurs après application de la langue restaurée, correctif partagé avec #9397/#9398/#9400. Les tests vérifient le vrai libellé « आज तुम्हाला कशी मदत करू? » après hydratation et le retour anglais, la sélection, la préférence mr restaurée, les autorisations et les comptes 0/1/2/3/11/102.

Validation finale locale : 114 tests réussis / 7 fichiers, ESLint des trois fichiers TypeScript de production et TypeScript application réussis. Audit des 14 fichiers UTF-8/JSON, clés exactes, valeurs non vides, variables/code/URL/tags/flags et absence de marqueurs : zéro problème. Configurations temporaires avec déclarations workspace existantes, core construit et guest-js Tauri du checkout. Aucun clean install/build global ni lancement desktop complet revendiqué. Aperçu navigateur local avec vrais composants inspecté : caractères devanagari lisibles, libellés traduits, URL/nombre négatif/code intacts ; capture `preview.png`. Cela ne constitue pas une certification linguistique ni un contrôle de toutes les polices natives. Onglet fermé et serveur temporaire arrêté après validation.

19 fichiers, commit signé vérifié `5d1787d233aa8edb6afed65985749fd970ea5dba`. Arbre/blobs/diff/titre/description distants vérifiés, PR attachée, ouverte non fusionnée ; zéro check-run/revue GitHub, statut pending au contrôle. Branche isolée alignée sur le commit distant. Pas de dépendance ni ordre de fusion requis. Préserver bn/ar/ur/pcm/arz/mr dans les sélecteurs/types des PR #9381/#9382/#9397/#9398/#9400/#9401, conserver un seul correctif de rafraîchissement du provider et le contexte/état de direction des PR RTL. Les clés futures de #9377/#9378 devront recevoir leurs traductions marathies lors de leur fusion. Installation, données et sources utilisateur préservées.

Preuves : `.build/marathi-2026-10-21/` (`initial-audit.json`, `preflight.json`, `translation-generation.json`, `manual-review.json`, `translation.log`, `translation-resume.log`, `locale-audit.json`, `tests.log`, `typecheck.log`, `eslint.log`, `preview.png`, `pr.md`, `published.json`, `verification.json`). Helpers, aperçu et configurations temporaires exclus du commit.

## Télougou ajouté — PR #9402 — 21 octobre 2026

Demande utilisateur : créer la PR pour le télougou. [#9402](https://github.com/janhq/jan/pull/9402) — `fix(i18n): add Telugu language support`, branche `codex/add-telugu-localization`, base officielle `44aee093ae5a974c31ec43d24ceca163c0e59c14`. Recherches Telugu/తెలుగు renouvelées avant publication : aucun équivalent trouvé. Ajout de « తెలుగు » (`te`), des 14 namespaces et de toutes les 1 463 clés anglaises actuelles. Aucun ajout de paquet ni changement RTL.

Traduction initiale assistée par Google Translate à partir des textes anglais publics, glossaire commun et protection des variables/code/liens/flags/commandes/identifiants techniques. Identifiants memory_read/memory_write/web_search/web_fetch/chat_template_kwargs/YOUR-RESOURCE-NAME protégés dès le premier jet ; normalisation de chiffres de marqueurs limitée à leurs délimiteurs si nécessaire. Révisions complètes des namespaces assistants/chat/outils/autorisations et de libellés sélectionnés common/settings. Compteurs courants sous forme de libellés neutres, sans modification du moteur one/other. **Relecture par un locuteur télougou natif non obtenue**, limite et demande de relecture explicites dans la PR.

Le provider rafraîchit les consommateurs après application de la langue restaurée, comme dans #9397/#9398/#9400/#9401. Tests des vrais sélecteur/provider, préférence te, initialisation sauvegardée, libellé « ఈ రోజు మీకు ఎలా సహాయపడగలను? » après hydratation et retour anglais, interpolation d’autorisation et comptes 0/1/2/3/11/102. Contrôles permanents de parité des clés, variables, code, identifiants techniques et commandes /help et /models.

Validation locale : 114 tests réussis / 7 fichiers, ESLint des trois fichiers TypeScript de production et TypeScript application réussis. Audit des 14 fichiers UTF-8/JSON, clés exactes, valeurs non vides, variables/code/URL/tags/flags et absence de marqueurs : zéro problème. Configurations temporaires avec déclarations workspace existantes, core construit et guest-js Tauri du checkout. Aucun clean install/build global ni lancement desktop complet revendiqué. Aperçu navigateur local avec vrais composants inspecté : glyphes télougous lisibles et libellés traduits, URL/nombre négatif/code intacts ; capture `preview.png`. Cela ne constitue ni validation linguistique native ni audit de toutes les polices natives. Onglet fermé et serveur temporaire arrêté.

19 fichiers, commit signé vérifié `039bf57e59537eaa043ab22ddc4a75e7a5567f8b`. Arbre/blobs/diff/titre/description distants vérifiés, PR attachée, ouverte non fusionnée ; zéro check-run/revue GitHub, statut pending au contrôle. Branche isolée alignée sur le commit distant. Pas de dépendance ni ordre de fusion requis. Préserver bn/ar/ur/pcm/arz/mr/te dans les sélecteurs/types des PR #9381/#9382/#9397/#9398/#9400/#9401/#9402 ; garder un seul rafraîchissement du provider et préserver l’état/contexte de direction des PR RTL. Traduire les futures clés de #9377/#9378 lors de leur fusion. Installation, données et sources utilisateur préservées.

Preuves : `.build/telugu-2026-10-21/` (`initial-audit.json`, `preflight.json`, `translation-generation.json`, `manual-review.json`, `translation.log`, `locale-audit.json`, `tests.log`, `typecheck.log`, `eslint.log`, `preview.png`, `pr.md`, `published.json`, `verification.json`). Helpers, aperçu et configurations temporaires exclus du commit.

## Turc vérifié et tamoul ajouté — PR #9403 — 21 octobre 2026

Demande utilisateur : créer les PR turque et tamoule. Contrôle préalable : le turc est déjà proposé par projectaccc dans [#8939](https://github.com/janhq/jan/pull/8939) et alkank dans [#9000](https://github.com/janhq/jan/pull/9000), deux PR ouvertes, non draft et non fusionnées au dernier contrôle. Chacune ajoute les 14 fichiers tr ; les auteurs ont déjà signalé le chevauchement dans #9000. Aucune troisième PR turque créée en doublon, aucun changement ni commentaire publié sur leurs contributions.

Tamoul : [#9403](https://github.com/janhq/jan/pull/9403) — `fix(i18n): add Tamil language support`, branche `codex/add-tamil-localization`, base officielle `44aee093ae5a974c31ec43d24ceca163c0e59c14`. Recherches Tamil/தமிழ் renouvelées avant publication : aucun équivalent trouvé. Ajout de « தமிழ் » (`ta`), des 14 namespaces et des 1 463 clés anglaises actuelles. Aucun paquet ni changement RTL ajouté.

Traduction initiale assistée par Google Translate depuis l’anglais public, glossaire et protection des variables/code/liens/flags/commandes/identifiants. Révisions complètes assistants/chat/outils/autorisations et de libellés sélectionnés common/settings. Compteurs courants sous forme de libellés neutres, moteur one/other conservé. **Aucune relecture par un locuteur tamoul natif obtenue**, limite et demande explicites dans la PR. Rafraîchissement des consommateurs du provider après application de la langue restaurée, partagé avec les autres PR de langue, pour afficher le vrai libellé tamoul après hydratation et permettre le retour anglais.

Validation locale : 114 tests réussis / 7 fichiers, ESLint des trois fichiers TypeScript de production et TypeScript application réussis. Tests de sélection réelle, préférence ta sauvegardée/restaurée, libellé rendu « இன்று உங்களுக்கு எப்படி உதவலாம்? », autorisations et comptes 0/1/2/3/11/102. Contrôles permanents de parité clés/variables/code/identifiants et /help,/models. Audit des 14 fichiers UTF-8/JSON, clés exactes, valeurs non vides, variables/code/URL/tags/flags et marqueurs : zéro problème. Configurations temporaires, core construit existant, guest-js Tauri et déclarations workspace mappées ; aucun clean install/build complet ni lancement desktop revendiqué. Aperçu local inspecté : caractères tamouls lisibles, libellés traduits, URL/nombre négatif/code intacts ; capture `preview.png`. Aucun avis linguistique natif ni audit de toutes les polices natives revendiqué. Onglet fermé et serveur temporaire arrêté.

19 fichiers, commit signé vérifié `df665fdf9b70d06b9f10203d53eb5167bbd21e03`. Arbre/blobs/diff/titre/description distants vérifiés, PR attachée, ouverte non fusionnée ; zéro check-run/revue GitHub, statut pending au contrôle. Branche isolée alignée sur le commit distant. Pas de dépendance ni ordre de fusion requis. Réconcilier les sélecteurs/types en conservant bn/ar/ur/pcm/arz/mr/te/ta et tr des PR tierces ; conserver un seul correctif de rafraîchissement et l’état/contexte des PR RTL. Les clés futures de #9377/#9378 devront être traduites lors de leur fusion. Installation, données et sources utilisateur préservées.

Preuves : `.build/tamil-2026-10-21/` (`initial-audit.log`, `preflight.json`, `translation-generation.json`, `manual-review.json`, `translation.log`, `locale-audit.json`, `tests.log`, `typecheck.log`, `eslint.log`, `preview.png`, `pr.md`, `published.json`, `verification.json`). Helpers, aperçu et configurations temporaires exclus du commit.

### Couverture des 20 langues du tableau utilisateur

Dans main actuel, 11 langues du tableau sont présentes : anglais, chinois écrit en variantes simplifiée/traditionnelle pour le mandarin, hindi, espagnol, français, portugais brésilien, indonésien, russe, allemand, japonais et vietnamien. Nos huit PR proposent bengali #9381, arabe standard #9382, ourdou #9397, pidgin nigérian #9398, arabe égyptien #9400, marathi #9401, télougou #9402 et tamoul #9403. Le turc est proposé par les PR tierces #8939/#9000. Couverture proposée du tableau : 11 + 8 + 1 = 20, sous réserve de relecture/acceptation/fusion. Cela ne constitue pas une validation d’un classement démographique mondial indépendant. Le sélecteur aurait 26 options après réconciliation de tous ces ajouts : 17 actuelles + 8 nôtres + 1 turque ; le chinois est proposé en deux écritures, soit 25 langues/variétés selon la distinction du tableau. Les cinq langues supplémentaires au tableau sont italien, polonais, tchèque, coréen et catalan.


## Suivi des 50 langues — 21 octobre 2026

Tableau de suivi : [SUIVI_LANGUES.md](SUIVI_LANGUES.md). Contient uniquement les 50 entrées classées, les estimations de locuteurs et leur année, les états et liens de PR, ainsi que les 27 prochaines traductions numérotées par priorité. Contrôle officiel main `44aee093ae5a974c31ec43d24ceca163c0e59c14` et audit des 221 PR ouvertes : 14 langues présentes, 8 proposées par nos PR, turc proposé par deux PR tierces, 27 à préparer. Une PR ouverte n'est pas une fusion ; présence du catalogue ne signifie pas complétude linguistique. Positions 1–38 issues du tableau public 2026 ; positions 39–50 provisoires d'une compilation communautaire 2025, explicitement signalées. Le tableau initial de 20 langues ne correspond pas au top 20 actualisé : swahili et haoussa restent à proposer. Aucun code applicatif modifié ni nouvelle PR publiée pour ce document ; validation des 50 rangs, de l'unicité des langues et des 27 priorités effectuée.


## Swahili ajouté — PR #9404 — 21 octobre 2026

Demande utilisateur : créer la PR pour le swahili. [#9404](https://github.com/janhq/jan/pull/9404) — `fix(i18n): add Swahili language support`, branche `codex/add-swahili-localization`, base officielle `44aee093ae5a974c31ec43d24ceca163c0e59c14`. Recherches Swahili/Kiswahili/locales/sw renouvelées juste avant publication : aucun équivalent trouvé ; catalogue absent de main. Ajout de « Kiswahili » (`sw`), des 14 namespaces et des 1 463 clés anglaises actuelles.

Traduction initiale assistée par Google Translate depuis les textes anglais publics, glossaire et protection des variables, code, liens, commandes et identifiants. Révisions par IA de tous les messages assistants/chat/tools/setup/model-errors/system-monitor/hub et de libellés common/settings sélectionnés (320 clés), compteurs courants neutres compatibles avec le moteur existant. Aucune relecture par un locuteur swahili natif obtenue ; réserve et demande explicites dans la PR. Pas de changement de paquet, RTL ou capacités vocales/modèles. Rafraîchissement du provider après restauration de la langue, partagé avec les PR de langue précédentes.

Validation locale finale : 114 tests réussis / 7 fichiers, dont vrais sélecteur/provider, sélection et préférence sw sauvegardée/restaurée, libellé « Ninaweza kukusaidiaje leo? » rendu après hydratation et retour anglais, interpolation des autorisations et comptes 0/1/2/3/11/102. ESLint des trois fichiers de production et deux tests réussis ; TypeScript application réussi. Audit 14 JSON UTF-8, clés exactes, valeurs non vides, variables/code/URL/tags/flags et marqueurs : zéro problème. Dépendances et core construits existants, configurations temporaires avec alias guest-js et déclarations workspace ; aucun clean install/build complet ni audit visuel desktop revendiqué.

19 fichiers, commit signé vérifié `fc7127b9e45db9bd2c150b448c15edfe23f94123`. Arbre/blobs/diff/titre/description distants vérifiés ; PR ouverte non fusionnée ; zéro check-run et revue GitHub, statut pending au contrôle. PR attachée au chat. Pas d'ordre de fusion requis ; chevauchements de sélecteur/types et provider documentés avec nos huit PR, les contributions turques #8939/#9000 et suédoise #8829. Préserver toutes les entrées fusionnées et le contexte RTL ; traduire les nouvelles clés de #9377/#9378 si elles sont fusionnées.

[SUIVI_LANGUES.md](SUIVI_LANGUES.md) actualisé : swahili en PR créée, 9 de nos langues proposées, 14 disponibles, 1 langue tierce proposée, 26 à faire ; priorités restantes renumérotées 1–26 avec le haoussa en premier. Preuves : `.build/swahili-2026-10-21/` (preflight.json, translation-generation.json, manual-review.json, locale-audit.json, tests.log, eslint.log, typecheck.log, spec.json, pr.md, published.json, verification.json). Helpers et configurations temporaires exclus du commit. Sources et données utilisateur préservées.


## Haoussa ajouté — PR #9406 — 21 octobre 2026

Demande utilisateur : créer la PR pour le haoussa. [#9406](https://github.com/janhq/jan/pull/9406) — `fix(i18n): add Hausa language support`, branche `codex/add-hausa-localization`, base officielle `44aee093ae5a974c31ec43d24ceca163c0e59c14`. Contrôles Hausa/Haoussa/Harshen Hausa/locales/ha renouvelés juste avant publication : aucun équivalent trouvé, catalogue absent de main. Ajout de « Hausa » (`ha`) en écriture latine (Boko), des 14 namespaces et des 1 463 clés anglaises actuelles. Écriture ajami hors périmètre.

Brouillon assisté par Google Translate à partir des seuls textes anglais publics, glossaire et protection des variables/code/URL/commandes/identifiants. Rejet des résultats avec marqueurs endommagés, passage à des marqueurs ASCII et préservation directe des identifiants techniques seuls ; correction manuelle du libellé « {{provider}} Instance URL ». Renforcement de la détection de tout séparateur résiduel, y compris tronqué : 84 résultats de cache rejetés puis retraduits ; zéro marqueur résiduel dans les catalogues finaux. Révisions IA de tous les textes assistants/chat/tools/model-errors et de libellés common/settings sélectionnés (216 clés), harmonisation de libellés récurrents et compteurs neutres. Aucune relecture par un locuteur haoussa natif obtenue ; réserve et demande de relecture dans la PR. Aucun paquet ni changement RTL/vocal/modèle ajouté.

Validation locale : 114 tests réussis / 7 fichiers ; sélection réelle, sauvegarde/restauration de ha, rendu « Ta yaya zan iya taimaka muku yau? » après hydratation, retour anglais, autorisations et comptes 0/1/2/3/11/102. ESLint des trois fichiers TypeScript de production réussi ; tests exclus par la configuration ESLint du dépôt et exécutés via Vitest. TypeScript application réussi. Audit final 14 JSON UTF-8, clés exactes, valeurs non vides, variables/code/URL/tags/flags et marqueurs : zéro problème. Dépendances et core existants, alias temporaires guest-js et déclarations workspace ; aucun clean install/build complet ni audit visuel desktop revendiqué.

19 fichiers, commit signé vérifié `e4259f6a100b26f71fa2e775fe43c054671149d8`. Arbre, blobs, fichiers, titre et description distants vérifiés ; PR ouverte non fusionnée, zéro check-run/revue GitHub, statut pending au contrôle ; PR attachée au chat. Branche isolée alignée avec le commit publié. Aucun ordre de fusion requis ; chevauchements sélecteur/types et provider explicités avec nos neuf autres PR, turc #8939/#9000 et suédois #8829. Conserver toutes les langues fusionnées, un seul correctif d'hydratation et le contexte RTL ; traduire les clés de #9377/#9378 si fusionnées.

[SUIVI_LANGUES.md](SUIVI_LANGUES.md) actualisé et vérifié : 50 entrées, 14 disponibles, 10 de nos langues proposées, 1 langue tierce proposée, 25 à faire numérotées 1–25 ; pendjabi occidental en première priorité restante. Preuves : `.build/hausa-2026-10-21/` (preflight.json, translation-generation.json, manual-review.json, locale-audit.json, tests.log, eslint.log, typecheck.log, spec.json, pr.md, published.json, verification.json). Helpers/configurations temporaires exclus du commit. Sources et données utilisateur préservées.


## Pendjabi occidental ajouté — PR #9408 — 21 octobre 2026

Demande utilisateur : créer la PR pour le pendjabi occidental. [#9408](https://github.com/janhq/jan/pull/9408) — `fix(i18n): add Western Punjabi translations and RTL support`, branche `codex/add-western-punjabi-localization`, base officielle `44aee093ae5a974c31ec43d24ceca163c0e59c14`. Recherches Punjabi/Panjabi/Shahmukhi/پنجابی/locales/pnb renouvelées juste avant publication : aucun équivalent trouvé, catalogue absent de main. Ajout de « پنجابی (شاہ مکھی) » (`pnb`), des 14 namespaces et des 1 463 clés anglaises actuelles. Code pnb vérifié dans le registre officiel IANA (Western Panjabi) ; écriture Shahmukhi, aucune variante Gurmukhi ajoutée ni couverture de tous les dialectes revendiquée.

Brouillon assisté par Google Translate avec cible pa-Arab (et non pa/our­dou), à partir des textes anglais publics, glossaire et protection des variables/code/URL/flags/commandes/identifiants. Résultats avec marqueurs altérés rejetés ; formats alternatifs vérifiés avant restauration. Révision explicite des messages de références de ressources et d'avertissement Vulkan pour conserver leurs informations techniques. Révisions IA de l'ensemble assistants/chat/tools et de libellés common/settings sélectionnés (152 clés), compteurs courants neutres. Aucune relecture par un locuteur pendjabi occidental natif obtenue ; demande de revue linguistique et dialectale explicite dans la PR. Les tests de script ne distinguent pas à eux seuls le pendjabi de l'ourdou.

Direction document/lang synchronisée pour pnb et Radix RTL, texte libre automatique, URL/email/nombres LTR, dérogations explicites conservées et titres de dialogue en alignement logique. Conserve le comportement LTR existant des blocs de code. Provider rafraîchi après hydratation des préférences. Dépendance directe @radix-ui/react-direction 1.1.1 et entrée workspace du lock déclarées, version déjà résolue transitivement ; pas de nouvelle version ni installation propre revendiquée.

Validation locale finale : 169 tests réussis / 11 fichiers : parité des clés/variables/code/identifiants et absence de caractères Gurmukhi/marqueurs, vrais sélecteur/provider, sauvegarde/restauration pnb, libellés rendus après hydratation, document/Radix RTL puis LTR, comptes 0/1/2/3/11/102, champs et dialogue, code-block existant. ESLint des sept fichiers TypeScript de production réussi ; tests exclus par la configuration de lint et exécutés via Vitest. TypeScript application réussi. Audit 14 JSON UTF-8, clés exactes, valeurs non vides, variables/code/URL/tags/flags et marqueurs : zéro problème. Configurations temporaires et dépendances/core/déclarations workspace existants ; aucun clean install/build complet ni audit visuel desktop/polices ou audit RTL de tous les écrans revendiqué. Positionnement physique sidebar/resizer/toast à revoir dans un audit RTL plus large.

26 fichiers, commit signé vérifié `cef56cd697fe9edfbcc1441ae97b69f03f0ea7a6`. Arbre, blobs, fichiers, titre et description distants vérifiés ; PR ouverte non fusionnée, zéro check-run/revue GitHub, statut pending au contrôle ; PR attachée au chat. Branche isolée alignée sur le commit distant. Pas d'ordre de fusion requis. Réconcilier une fois les changements RTL partagés avec #9382/#9397/#9400, garder ar/ur/arz/pnb dans la détection de direction, préserver toutes les langues et le rafraîchissement d'hydratation des autres PR. Chevauchements avec nos dix autres langues et turc/suédois documentés ; traduire les nouvelles clés de #9377/#9378 si elles fusionnent.

[SUIVI_LANGUES.md](SUIVI_LANGUES.md) actualisé et vérifié : 50 entrées, 14 disponibles, 11 de nos langues proposées, 1 langue tierce proposée, 24 à faire numérotées 1–24 ; tagalog en première priorité restante. Preuves : `.build/western-punjabi-2026-10-21/` (preflight.json, language-reference.json, translation-generation.json, manual-review.json, locale-audit.json, tests.log, eslint.log, typecheck.log, spec.json, pr.md, published.json, verification.json). Helpers/configurations temporaires exclus du commit. Sources et données utilisateur préservées.


## Tagalog ajouté — PR #9409 — 21 octobre 2026

Demande utilisateur : créer la PR pour le tagalog. [#9409](https://github.com/janhq/jan/pull/9409) — `fix(i18n): add Tagalog language support`, branche `codex/add-tagalog-localization`, base officielle `44aee093ae5a974c31ec43d24ceca163c0e59c14`. Recherches Tagalog/Filipino/locales/tl/locales/fil renouvelées avant publication : aucun équivalent trouvé, catalogue absent de main. Ajout de « Tagalog » (`tl`), des 14 namespaces et des 1 463 clés anglaises actuelles. Aucun alias fil, changement RTL, paquet ou capacité vocale/modèle ajouté.

Provenance distincte des autres traductions : Google Translate a renvoyé HTTP 429, y compris après un délai et une nouvelle tentative ; aucune traduction du service n'a été acceptée pour cette contribution. Rédaction directe du brouillon par IA à partir des textes anglais publics, glossaire commun, correspondances explicites namespace/clé et réutilisation contrôlée des libellés identiques. Toutes les 1 463 clés couvertes sans valeur anglaise de secours dans la génération ; termes techniques, noms propres et emprunts courants conservés intentionnellement. Passe dédiée sur assistants/chat/tools et des libellés sélectionnés common/settings ; compteurs courants neutres. Aucune relecture par un locuteur tagalog natif obtenue ; demande explicite de vérification terminologique et de naturel dans la PR. La complétude structurelle ne certifie pas la qualité linguistique.

Validation locale finale : 114 tests réussis / 7 fichiers : parité clés/variables/code/identifiants, vrais sélecteur/provider, sauvegarde/restauration tl, libellé « Paano kita matutulungan ngayon? » rendu après hydratation, retour anglais, autorisations et comptes 0/1/2/3/11/102. ESLint des trois fichiers TypeScript de production réussi ; tests exclus par la configuration de lint et exécutés via Vitest. TypeScript application réussi. Audit final 14 JSON UTF-8, clés exactes, valeurs non vides, variables/code/URL/tags/flags et marqueurs : zéro problème. Configurations temporaires et dépendances/core/déclarations workspace existants ; aucun clean install/build complet ni audit visuel desktop revendiqué.

19 fichiers, commit signé vérifié `9a5c67ec3631d45bf9d093523c46c239ae6f3ea7`. Arbre, blobs, fichiers, titre et description distants vérifiés ; PR ouverte non fusionnée, zéro check-run/revue GitHub, statut pending au contrôle ; PR attachée au chat. Branche isolée alignée sur le commit distant. Pas d'ordre de fusion requis ; chevauchements sélecteur/types et provider avec nos onze autres langues et turc/suédois documentés. Préserver toutes les entrées fusionnées et le contexte RTL ; garder un seul rafraîchissement d'hydratation ; traduire les clés de #9377/#9378 si elles fusionnent.

[SUIVI_LANGUES.md](SUIVI_LANGUES.md) actualisé et vérifié : 50 entrées, 14 disponibles, 12 de nos langues proposées, 1 langue tierce proposée, 23 à faire numérotées 1–23 ; yue/cantonais en première priorité restante. Preuves : `.build/tagalog-2026-10-21/` (preflight.json, offline-*.txt, offline.py, translation-generation.json, manual-review.json, locale-audit.json, tests.log, eslint.log, typecheck.log, spec.json, pr.md, published.json, verification.json). Helpers/configurations temporaires exclus du commit. Sources et données utilisateur préservées.


## Suivi étendu à 100 langues — 21 octobre 2026

Demande utilisateur : étendre [SUIVI_LANGUES.md](SUIVI_LANGUES.md) de 50 à 100 langues. Ajout des positions 51–100 avec estimations L1+L2 et année 2025, issues de la même compilation communautaire que les positions 39–50. Toutes les positions 39–100 restent explicitement provisoires ; les positions 1–38 conservent la référence 2026, sans présenter l'ensemble comme un classement officiel homogène. Les 50 entrées précédentes et les liens de nos PR sont conservés.

Audit GitHub renouvelé : main `44aee093ae5a974c31ec43d24ceca163c0e59c14`, 225 PR ouvertes ; les douze PR de nos langues, les deux PR turques et la PR suédoise #8829 sont toujours ouvertes. Suédois ajouté au rang provisoire 97 avec sa PR tierce existante. Totaux du suivi : 14 disponibles, 12 de nos langues proposées, 2 langues proposées par des tiers, 72 à préparer. Repérage des PR par titres, à compléter par une recherche dédiée avant toute nouvelle traduction.

Vérification documentaire : 100 rangs uniques et consécutifs, 100 noms uniques, 72 priorités consécutives, nombres de locuteurs positifs et décroissants, années/astérisques cohérents, sommes des états correctes et PR référencées présentes dans l'audit. Aucune modification de code applicatif ni publication de PR pour ce document. Preuve GitHub actualisée : `.build/language-tracker-2026-10-21/github.json`.


## Portugais du Portugal séparé du Brésil — PR #9410 — 21 octobre 2026

Demande utilisateur : proposer les deux variantes de traduction séparément. [#9410](https://github.com/janhq/jan/pull/9410) — `fix(i18n): add separate Portugal Portuguese locale`, branche `codex/add-portuguese-portugal-localization`, base officielle `44aee093ae5a974c31ec43d24ceca163c0e59c14`. Contrôles pt-PT/European Portuguese/Portugal Portuguese renouvelés avant publication : aucune PR active équivalente, catalogue Portugal absent de main. Ancienne #6808 fermée sans fusion et concernant pt-BR ; #6809 a intégré le Brésil ; #7672/#8327 n'ajoutaient pas pt-PT.

Ajout de « Português (Portugal) » (`pt-PT`) à côté de « Português (Brasil) » (`pt-BR`), dossier Portugal distinct avec 14 namespaces et les 1 463 clés anglaises actuelles. Traduction assistée par IA : libellés courts du dépôt pt-BR réutilisés et adaptés, longs messages/nouvelles clés rédigés à partir de l'anglais actuel, glossaire Portugal (ficheiro/utilizador/guardar/definições/transferir/registos/palavra-passe et formes « A carregar… »). Révision des résidus régionaux et correction du libellé de fournisseur personnalisé pour correspondre au sens anglais actuel. Aucune relecture par un locuteur du Portugal natif obtenue ; réserve et demande explicites dans la PR. Aucun service de traduction externe utilisé pour cette contribution.

Validation locale finale : 116 tests réussis / 7 fichiers. Test réel Portugal → Brésil → Portugal, préférence exacte pt-PT/pt-BR conservée à chaque étape, « Definições / Guardar » contre « Configurações / Salvar », initialisation avec une préférence Brésil existante, restauration Portugal après hydratation, retour anglais, variables/identifiants et comptes 0/1/2/3/11/102. ESLint des trois fichiers TypeScript de production et TypeScript application réussis. Audit 14 JSON UTF-8, clés exactes, valeurs non vides, variables/code/URL/tags/flags et marqueurs : zéro problème. SHA-256 des 14 catalogues brésiliens inchangés ; aucune migration ni substitution de leur préférence. Configurations temporaires avec core/déclarations workspace et alias guest-js existants ; aucun clean install/build complet ni audit visuel desktop revendiqué.

19 fichiers, commit signé vérifié `feebfd09e9790284a48c4412eec8bd0a1c725d48`. Arbre, blobs, fichiers, titre et description distants vérifiés ; PR ouverte non fusionnée, zéro check-run/revue GitHub, statut pending au contrôle ; PR attachée au chat. Branche isolée alignée sur le commit distant. Aucun ordre de fusion requis. Les PR brésiliennes #9384/#9385/#9386/#9390/#9391 ciblent d'autres catalogues et restent indépendantes. Préserver les deux variantes et toutes les langues lors de la réconciliation des sélecteurs/types, garder un seul rafraîchissement d'hydratation et le contexte RTL ; traduire les clés de #9377/#9378 si elles fusionnent.

[SUIVI_LANGUES.md](SUIVI_LANGUES.md) actualisé sur la ligne du portugais, avec le Brésil disponible et le Portugal en PR. Compteurs par langue conservés (100 entrées, 14 disponibles, 12 langues proposées par nous, 2 par des tiers, 72 à faire) : une variante régionale ne devient pas une nouvelle langue du classement. Preuves : `.build/portuguese-pt-2026-10-21/` (preflight.json, related-prs.json, reused-labels.json, offline-*.txt, translation-generation.json, brazil-preservation.json, locale-audit.json, tests.log, eslint.log, typecheck.log, spec.json, pr.md, published.json, verification.json). Helpers et configurations temporaires exclus du commit. Sources, données et installation utilisateur préservées.


## Cantonese — PR #9411 — 21 octobre 2026

Lot demandé : rangs 25, 26, 27, 29, 30 et 31. [Cantonese #9411](https://github.com/janhq/jan/pull/9411) — `yue`, libellé « 粵語 », branche `codex/add-cantonese-localization`, base officielle `44aee093ae5a974c31ec43d24ceca163c0e59c14`. Catalogue absent et aucune PR active équivalente au dernier contrôle. 1463 clés, 14 namespaces. Traduction assistée par IA avec glossaire/révisions sélectionnées, sans relecture native obtenue ; provenance et limites documentées dans la PR.

Validation locale : 114 tests réussis / 7 fichiers, ESLint production et TypeScript application réussis. Audit JSON UTF-8, clés, valeurs, variables/code/URL/tags/flags/identifiants/marqueurs réussi. Dépendances et déclarations workspace existantes, configurations temporaires exclues ; aucun clean install/build complet ni audit desktop/polices revendiqué. Pas de changement RTL ni paquet.

Commit signé vérifié `c08f3313b074d6449fb4d08f9d6a7a1a10973723`, 19 fichiers. Arbre/blobs/diff/titre/description distants contrôlés, PR ouverte non fusionnée. Au contrôle : 0 check-run, 0 revue, statut pending. PR attachée au chat ; branche locale alignée. Chevauchements et absence d'ordre de fusion imposé documentés ; préserver toutes les langues et les correctifs RTL/hydratation communs. Suivi des 100 langues actualisé : 13 langues proposées par nos PR, 71 à préparer. Preuves : `.build/cantonese-2026-10-21/` (preflight.json, metadata.json, translation-generation.json, manual-review.json, locale-audit.json, validation.json, tests.log, eslint.log, typecheck.log, spec.json, pr.md, published.json, verification.json). Sources/données/installation utilisateur préservées.


## Wu (Shanghainese) — PR #9412 — 21 octobre 2026

Lot demandé : rangs 25, 26, 27, 29, 30 et 31. [Wu (Shanghainese) #9412](https://github.com/janhq/jan/pull/9412) — `wuu`, libellé « 吴语（上海话） », branche `codex/add-wu-localization`, base officielle `44aee093ae5a974c31ec43d24ceca163c0e59c14`. Catalogue absent et aucune PR active équivalente au dernier contrôle. 706 clés, 14 namespaces. Traduction assistée par IA avec glossaire/révisions sélectionnées, sans relecture native obtenue ; provenance et limites documentées dans la PR.

Validation locale : 115 tests réussis / 7 fichiers, ESLint production et TypeScript application réussis. Audit JSON UTF-8, clés, valeurs, variables/code/URL/tags/flags/identifiants/marqueurs réussi. Dépendances et déclarations workspace existantes, configurations temporaires exclues ; aucun clean install/build complet ni audit desktop/polices revendiqué. Pas de changement RTL ni paquet.

Commit signé vérifié `cea04c0e641ce91656c02ca79d11db318508afa7`, 19 fichiers. Arbre/blobs/diff/titre/description distants contrôlés, PR brouillon non fusionnée. Au contrôle : 0 check-run, 0 revue, statut pending. PR attachée au chat ; branche locale alignée. Chevauchements et absence d'ordre de fusion imposé documentés ; préserver toutes les langues et les correctifs RTL/hydratation communs. Suivi des 100 langues actualisé : 14 langues proposées par nos PR, 70 à préparer. Preuves : `.build/wu-2026-10-21/` (preflight.json, metadata.json, translation-generation.json, manual-review.json, locale-audit.json, validation.json, tests.log, eslint.log, typecheck.log, spec.json, pr.md, published.json, verification.json). Sources/données/installation utilisateur préservées.

Précision Wu #9412 : brouillon explicitement partiel, 706 clés traduites sur 1 463 ; 757 clés utilisent le repli anglais. Les 62 messages tools sont couverts ; tests de validité des sous-ensembles et de repli anglais, sans revendication de parité complète. Spécialiste natif requis pour les formes écrites et les traductions restantes.


## Iranian Persian — PR #9413 — 21 octobre 2026

Lot demandé : rangs 25, 26, 27, 29, 30 et 31. [Iranian Persian #9413](https://github.com/janhq/jan/pull/9413) — `fa-IR`, libellé « فارسی (ایران) », branche `codex/add-iranian-persian-localization`, base officielle `44aee093ae5a974c31ec43d24ceca163c0e59c14`. Catalogue absent et aucune PR active équivalente au dernier contrôle. 1463 clés, 14 namespaces. Traduction assistée par IA avec glossaire/révisions sélectionnées, sans relecture native obtenue ; provenance et limites documentées dans la PR.

Validation locale : 169 tests réussis / 11 fichiers, ESLint production et TypeScript application réussis. Audit JSON UTF-8, clés, valeurs, variables/code/URL/tags/flags/identifiants/marqueurs réussi. Dépendances et déclarations workspace existantes, configurations temporaires exclues ; aucun clean install/build complet ni audit desktop/polices revendiqué. Primitives RTL document/Radix, champs techniques LTR et tests partagés inclus ; audit RTL de tous les écrans restant à faire.

Commit signé vérifié `7390c493df3373aae20a3598d6942fc59db71e3c`, 26 fichiers. Arbre/blobs/diff/titre/description distants contrôlés, PR ouverte non fusionnée. Au contrôle : 0 check-run, 0 revue, statut pending. PR attachée au chat ; branche locale alignée. Chevauchements et absence d'ordre de fusion imposé documentés ; préserver toutes les langues et les correctifs RTL/hydratation communs. Suivi des 100 langues actualisé : 15 langues proposées par nos PR, 69 à préparer. Preuves : `.build/iranian-persian-2026-10-21/` (preflight.json, metadata.json, translation-generation.json, manual-review.json, locale-audit.json, validation.json, tests.log, eslint.log, typecheck.log, spec.json, pr.md, published.json, verification.json). Sources/données/installation utilisateur préservées.


## Amharic — PR #9414 — 21 octobre 2026

Lot demandé : rangs 25, 26, 27, 29, 30 et 31. [Amharic #9414](https://github.com/janhq/jan/pull/9414) — `am`, libellé « አማርኛ », branche `codex/add-amharic-localization`, base officielle `44aee093ae5a974c31ec43d24ceca163c0e59c14`. Catalogue absent et aucune PR active équivalente au dernier contrôle. 1463 clés, 14 namespaces. Traduction assistée par IA avec glossaire/révisions sélectionnées, sans relecture native obtenue ; provenance et limites documentées dans la PR.

Validation locale : 114 tests réussis / 7 fichiers, ESLint production et TypeScript application réussis. Audit JSON UTF-8, clés, valeurs, variables/code/URL/tags/flags/identifiants/marqueurs réussi. Dépendances et déclarations workspace existantes, configurations temporaires exclues ; aucun clean install/build complet ni audit desktop/polices revendiqué. Pas de changement RTL ni paquet.

Commit signé vérifié `5834c83c2c0134af807454ba5f9d155dd0c0cfae`, 19 fichiers. Arbre/blobs/diff/titre/description distants contrôlés, PR ouverte non fusionnée. Au contrôle : 0 check-run, 0 revue, statut pending. PR attachée au chat ; branche locale alignée. Chevauchements et absence d'ordre de fusion imposé documentés ; préserver toutes les langues et les correctifs RTL/hydratation communs. Suivi des 100 langues actualisé : 16 langues proposées par nos PR, 68 à préparer. Preuves : `.build/amharic-2026-10-21/` (preflight.json, metadata.json, translation-generation.json, manual-review.json, locale-audit.json, validation.json, tests.log, eslint.log, typecheck.log, spec.json, pr.md, published.json, verification.json). Sources/données/installation utilisateur préservées.


## Thai — PR #9415 — 21 octobre 2026

Lot demandé : rangs 25, 26, 27, 29, 30 et 31. [Thai #9415](https://github.com/janhq/jan/pull/9415) — `th`, libellé « ไทย », branche `codex/add-thai-localization`, base officielle `44aee093ae5a974c31ec43d24ceca163c0e59c14`. Catalogue absent et aucune PR active équivalente au dernier contrôle. 1463 clés, 14 namespaces. Traduction assistée par IA avec glossaire/révisions sélectionnées, sans relecture native obtenue ; provenance et limites documentées dans la PR.

Validation locale : 114 tests réussis / 7 fichiers, ESLint production et TypeScript application réussis. Audit JSON UTF-8, clés, valeurs, variables/code/URL/tags/flags/identifiants/marqueurs réussi. Dépendances et déclarations workspace existantes, configurations temporaires exclues ; aucun clean install/build complet ni audit desktop/polices revendiqué. Pas de changement RTL ni paquet.

Commit signé vérifié `9b9a4cab272ad9b96ae52a0c9c33f3d6ca891e70`, 19 fichiers. Arbre/blobs/diff/titre/description distants contrôlés, PR ouverte non fusionnée. Au contrôle : 0 check-run, 0 revue, statut pending. PR attachée au chat ; branche locale alignée. Chevauchements et absence d'ordre de fusion imposé documentés ; préserver toutes les langues et les correctifs RTL/hydratation communs. Suivi des 100 langues actualisé : 17 langues proposées par nos PR, 67 à préparer. Preuves : `.build/thai-2026-10-21/` (preflight.json, metadata.json, translation-generation.json, manual-review.json, locale-audit.json, validation.json, tests.log, eslint.log, typecheck.log, spec.json, pr.md, published.json, verification.json). Sources/données/installation utilisateur préservées.


## Javanese — PR #9416 — 21 octobre 2026

Lot demandé : rangs 25, 26, 27, 29, 30 et 31. [Javanese #9416](https://github.com/janhq/jan/pull/9416) — `jv`, libellé « Basa Jawa », branche `codex/add-javanese-localization`, base officielle `44aee093ae5a974c31ec43d24ceca163c0e59c14`. Catalogue absent et aucune PR active équivalente au dernier contrôle. 1463 clés, 14 namespaces. Traduction assistée par IA avec glossaire/révisions sélectionnées, sans relecture native obtenue ; provenance et limites documentées dans la PR.

Validation locale : 114 tests réussis / 7 fichiers, ESLint production et TypeScript application réussis. Audit JSON UTF-8, clés, valeurs, variables/code/URL/tags/flags/identifiants/marqueurs réussi. Dépendances et déclarations workspace existantes, configurations temporaires exclues ; aucun clean install/build complet ni audit desktop/polices revendiqué. Pas de changement RTL ni paquet.

Commit signé vérifié `ea9a66394fcbee0da167ab8776fbb857285aa865`, 19 fichiers. Arbre/blobs/diff/titre/description distants contrôlés, PR ouverte non fusionnée. Au contrôle : 0 check-run, 0 revue, statut pending. PR attachée au chat ; branche locale alignée. Chevauchements et absence d'ordre de fusion imposé documentés ; préserver toutes les langues et les correctifs RTL/hydratation communs. Suivi des 100 langues actualisé : 18 langues proposées par nos PR, 66 à préparer. Preuves : `.build/javanese-2026-10-21/` (preflight.json, metadata.json, translation-generation.json, manual-review.json, locale-audit.json, validation.json, tests.log, eslint.log, typecheck.log, spec.json, pr.md, published.json, verification.json). Sources/données/installation utilisateur préservées.


## LiquidAI d1-3B — API locale — PR #9419 — 22 octobre 2026

Demande : supporter LiquidAI/d1-3B-GGUF dans notre Jan installé et publier une PR officielle. Réalisé : [#9419](https://github.com/janhq/jan/pull/9419), branche `codex/d1-systemone-api`, commit signé vérifié `9f60d60bc1f6dfc20b9d96ef4cf8ad7a53672a99`, 18 fichiers. Base officielle `44aee093ae5a974c31ec43d24ceca163c0e59c14`. Arbre, blobs, diff, titre et description distants vérifiés ; branche locale isolée alignée et PR attachée au chat. PR ouverte non fusionnée ; au contrôle initial, zéro revue et check-run, statut pending.

`POST /v1/systemone` passe de 404 à 200. Routage modèle/authentification conservés ; décisions `noul`, `choice`, `score`, contenu préservé, hors cache de conversation. Schéma OpenAPI et documentation ajoutés. Le prérequis moteur b11721/version runtime de #9322 est inclus ; fusionner #9322 puis rebaser, ou conserver ces fichiers. #9399 chevauche le pin et le catch JSON, sans exposer systemone ; coordination indiquée dans la PR. Aucune issue clôturée.

Validation : 206 tests plugin, 156 serveur, 1 essai réel (d1 sur les trois types, requête invalide 400 et chat Tron de huit tokens), 5 tests du panneau moteur réussis. Worker CUDA et desktop Windows compilés. GGUF Q4_K_M vérifié par SHA-256 officiel. Le test Windows nécessite le manifeste Common Controls v6 injecté dans le seul exécutable de tests. Compilation locale avec dépendances/ressources existantes et adaptation temporaire du Clang MSYS2 vers MSVC ; chaîne upstream restaurée, paramètres matériels publiés inchangés. Pas de clean install, matrice de plateformes ni test d’images revendiqués ; mmproj nécessaire pour les images.

Installation existante mise à jour : `C:\Users\jmsga\AppData\Local\Programs\Jan\Jan-Desktop.exe` ; application SHA-256 `ACFE8FA1F5BA93D92594D74636B4CDB4B584DCDBA8D6E024112FF945814D099B`, worker `405B9632B2875518EA39F465DDBD56044146617CC0FFC666CF8AF1542777C021`. Sept DLL et treize fichiers utilisateur contrôlés inchangés. Six tailles d’icône cyan vérifiées ; frontend compilé et personnalisations conservés. Essai du binaire exact dans un profil isolé, puis du worker installé : 200, probabilité de remboursement 0.9908665982200412, 29 tokens d’entrée, zéro de sortie. Jan laissé fermé. Sauvegardes et preuves `.build/d1-support-2026-10-22/`. Guide `deliverables/d1-local-api-2026-10-22.md`, exemple PowerShell `deliverables/test-d1-api.ps1`.


## Vision d1-3B confirmée — mise à jour PR #9419 — 22 octobre 2026

Projecteur `C:/Users/jmsga/Downloads/mmproj-d1-3B-Q8_0.gguf`, 583 109 728 octets, SHA-256 officiel vérifié `2505920ce464b7c54acd8b7b74a931c0c671f06d0c8833760b2fbceeb253e92a`. Association modèle et preset mmproj constatés. Requêtes vers le serveur API déjà démarré de l’utilisateur, `127.0.0.1:1337/v1/systemone` ; propriétaire du port vérifié : exécutable Jan installé. Empreintes application/worker inchangées par rapport à l’installation testée. Aucun redémarrage, nouveau build, changement de code ou réglage utilisateur effectué.

Cinq essais visuels valides réussis : photo COCO de deux chats sur un canapé (JPEG), avec texte puis état null ; classification et dénombrement corrects, question oui/non du canapé et score de comptage cohérents. PNG rouge → bleu → rouge, mêmes questions sans indice de couleur : réponses correctes, dépendantes de l’image. Retour texte réussi après l’image invalide. Chaque réponse réussie : HTTP 200, tokens d’entrée positifs, zéro token de sortie. L’image base64 corrompue renvoie 500 ; l’assertion attendue 4xx échoue. Limite documentée explicitement, sans annoncer sept tests tous verts. Cause observée : loader d’image upstream `std::runtime_error` et catch générique 500. Le modèle reste opérationnel.

Description de [#9419](https://github.com/janhq/jan/pull/9419) mise à jour et relue via GitHub ; commit inchangé `9f60d60bc1f6dfc20b9d96ef4cf8ad7a53672a99`, PR ouverte non fusionnée. Le besoin restant d’un mmproj n’est plus une absence de test vision. Résultats locaux limités à ces cas, sans revendication de benchmark, CI ou test du bouton de pièce jointe UI. Preuves `.build/d1-vision-2026-10-22/`, rapport `deliverables/d1-vision-2026-10-22.md`.


## Améliorations locales du moteur — M02, M03, M01, M04 — 22 octobre 2026

Demande utilisateur exécutée dans cet ordre : initialisation native hors verrou
du registre avec réservation et annulation ; profil de batch volontaire limité
au domaine calibré avec repli manuel ; affinité bornée sur les slots déjà alloués
et repli disque ; n-grammes ciblés désactivés par défaut. L’identité du cache suit
le contexte réellement chargé pendant les reloads et distingue le repli manuel.
Les flux conservent les réservations jusqu’à leur fin, y compris l’annulation.

Validation locale : 194 tests Rust, 88 tests preset/profil, 136 tests transport et
réglages ; TypeScript ciblé réussi. Worker CUDA et shim reconstruits avec les
archives natives b11721 existantes via JAN_LLAMA_PREBUILT_DIR. Cinq contrôles
natifs finaux réussis, conversations croissantes/concurrentes et suppression
validées. 42 mesures finales M01 : 8 192 tokens, 219,0 → 42,9 ms avec deux slots
à contexte constant par slot ; +146 MiB GPU global observés. M02, sept essais
CPU : 930,3 → 34,2 ms pendant B ; trois essais avec deux GGUF GPU différents
restent réactifs. M04 : contrôle natif confirmant l’activation, pas de validation
générale de qualité ni MTP/EAGLE. Aucun gain additionné entre scénarios.

Ces changements restent locaux, sans nouveau commit, PR, CI, approbation ni
fusion. Jan installé et ses réglages n’ont pas été remplacés pour ce travail.
Suivi : [SUIVI_MOTEUR.md](SUIVI_MOTEUR.md), 12/18 points traités et six validations
restantes ; [rapport et preuves](deliverables/engine-improvements-2026-10-22/report.md).


## Six validations finales du moteur — 22 octobre 2026

Six validations exécutées : mémoire bornée par Windows Job Object (plafond
6 656 Mio, deux contextes GPU, caches 16/192 Mio, 48 changements) ; application
complète et cache ; deux GPU (RTX CUDA et Intel Vulkan) et deux architectures,
36 mesures de profils avec pics échantillonnés ; six tâches réelles, 36
générations n-grammes ; Qwen officiel Q8 avec sa tête MTP, 36 générations ;
comparaison des sorties et stabilité. Provenance/empreinte du GGUF vérifiées.
MTP : 18 paires identiques, acceptation 94,3 %, débit médian 191,7 → 289,8 t/s.
N-grammes : 15/18 paires identiques, même score strict 6/18, erreurs de consigne
déjà présentes en référence. Pas d’adoption générale justifiée. Un chat libre
atteint 8 191 tokens et une erreur de contexte ; suivi borné après restauration
du cache réussi. Résultats négatifs conservés, pas présentés comme tous verts.

L’essai réel a révélé un défaut d’affichage : les modes sauvegardés dans YAML
étaient remplacés par les libellés par défaut à l’import UI. Liste de l’extension
et fournisseur corrigés, valeurs admises uniquement. 173 tests web ciblés passent,
dont nouveau cas d’hydratation. Extension/frontend et application release MSVC
reconstruits puis testés dans un nouveau profil. Backend Vulkan de la même
révision b11721 compilé dans un runtime isolé, aucune modification upstream.
Pas de clean install, tsc global ni CI revendiqués ; tests Rust/preset précédents
conservés comme preuves du worker/profil inchangés, sans annoncer un nouveau run.

[Suivi](SUIVI_MOTEUR.md) : 18/18 points traités dans le périmètre local.
[Rapport et données finales](deliverables/engine-validation-2026-10-22/report.md).
Copies de test arrêtées, protocole préexistant restauré, installation et profil
utilisateur inchangés. Aucun nouveau commit ni PR créé pour ce travail.

## Engine b11823 update and local deployment — 2026-10-22

The installed personalized application still used the older engine despite the
source improvements. Rebuilt the complete application and CPU/CUDA runtime from
llama.cpp b11823 (`5c19a5a7560024bb19745b4ae04a75613d4b9aa3`), the most recent
published build at the initial release check. Updated the source pin and the
measured-profile allowlist after recalibration. Deployed M02/M03/M01/M04 in the
installed application and synchronized its source packaging runtime.

Validation: 194 Rust tests, 5 linked-native tests and 88 preset tests passed.
Native cancellation/concurrency/fallback, growing conversations, bounded memory
stress, d1 text/vision/recovery, MTP and n-gram quality campaigns completed.
The exact desktop binary and bundled worker passed isolated application API
smoke tests before and after installation, including Tron → Qwen → Tron and d1.
The first smoke attempt raced model registration; the harness now waits for it.
All 324 checked user configuration files and root settings retained their hashes.
The 21 runtime files and desktop executable match the staged manifest; CUDA0 is
available. Previous executable/runtime backups retained locally, test apps closed.

At 8,192 prompt tokens, Tron Q6/f16 TTFT median: 1,625.1 → 1,401.5 ms for
512/512 → 2048/2048 (-13.8%, three repeats per cell). This compares settings on
b11823, not old/new upstream versions. MTP: 18/18 identical pairs, strict score
9/18 in both modes; n-grams: 15/18 identical, score 6/18 in both modes. Optional
modes remain guarded; the user's long-context bf16 settings are preserved.
Invalid d1 image input still returns structured HTTP 500. No global tsc, clean
install, CI, upstream approval or merge claimed. No commit or PR created.

[Current deployment report](deliverables/engine-update-2026-10-22/report.md).

## String-copy and streaming measurements — 2026-10-22

The engine tracker still listed string copies and streaming transport as unmeasured.
Added a standalone optimized Rust copy benchmark and a repeatable Python SSE
benchmark for an isolated worker or the installed desktop application's test API.
No production engine change or configuration tuning was retained from these tests.

Executed 252 microbenchmark cells and 48 real completions on installed b11823:
direct worker and full application, short/long prompts, 64/256 generated tokens,
stream/non-stream, three repeats. All 24 paired outputs matched. Each complete
stream had one DONE marker and the expected token count. Seven-byte reads with a
slow consumer preserved Unicode/SSE integrity; cancellation followed by a healthy
16-token request completed in 162.9 ms direct and 170.3 ms through Jan.

String-to-Bytes ownership transfer and Bytes cloning share the payload (pointer
assertions passed); the OpenAI passthrough already forwards Bytes. Current copy
plus UTF-8 validation costs approximately 0.16–0.18 microseconds per 512-byte
block; a conservative microbenchmark-based estimate is at most 0.047 ms per
measured response. This estimate is not instrumentation of the running boundary.
The application streaming wall-time residual outside native timers is about
25–40 ms. Sequential runs and GPU frequency drift prevent attributing differences
solely to the proxy. Chat/progress, Anthropic conversion, UI rendering and saturated
multi-client/network buffers remain outside this measurement campaign.

Desktop and 21 runtime hashes unchanged. Of 324 configuration files compared to
the earlier installation backup, 322 still match; store.json/settings.json had
already changed before this campaign and were preserved, never restored. Test
profile isolated, test processes closed, previous protocol association restored.
No production speedup, CI, upstream approval, commit or PR claimed.

[Streaming/copy report and evidence](deliverables/engine-streaming-2026-10-22/report.md).

## Spark-X2.6-4B validation on installed Jan — 2026-10-23

Verified the user's Spark-X2.6-4B Q6_K with the installed b11823 application,
its bundled worker and its real API proxy. Copied model/global extension settings
into an isolated profile: configured context 68,192, bf16 KV, automatic parallelism.
Native initialization reports four slots with 68,352 context per slot (alignment).

Seven checks passed: default chat, effective per-request thinking disable,
Unicode chat streaming, strict JSON schema, automatic tool call, streamed tool
call and final answer following a simulated multiply(6,7)=42 tool result.
Default thinking generated 116 tokens for a simple arithmetic answer; disabling
it generated two, with no reasoning content. This is a single functional test,
not a statistically controlled speed comparison or a UI-toggle validation.
No real MCP tool, external service or shell command was executed by the model.

The first attempt hit Windows report encoding on Unicode; explicit UTF-8 fixed
the harness, then all seven checks were rerun successfully. Installed desktop/
worker fingerprints retained. All 565 checked user JSON/YAML files and root
settings matched between test preparation and completion. Jan was closed
gracefully after its previous generation had finished, the isolated instance
was stopped, the protocol association restored, and normal Jan reopened.

No full 68k prompt, concurrency, sustained agent loop, memory saturation, vision,
MTP, UI rendering, CI or upstream approval claimed. No production modification,
commit or PR created. [Evidence](deliverables/spark-validation-2026-10-23/report.md).

## Prompt and web-tool round-trip audit — 2026-10-23

Audited the persisted Spark/Tesla conversation and the local chat transport.
The 5,538-character replacement prompt is attached to the target thread and
matches the current Tron assistant; the old professional-tool-caller rule is
absent. Three distinct announcements precede three actual tool waves: two web
searches, two page fetches, then one final page fetch, followed by the synthesis.
All five tool outputs are persisted without a transport truncation marker.

The prompt limits announcements before a group of tool calls, not per user
request, so three groups can produce three announcements without proving prompt
loss. Jan appends its own Web Access instructions requiring [[cite:URL]]; that
syntax is intentional. Prior advice to prohibit it was inappropriate here.
The SDK sends system instructions as system messages and results as tool messages
with matching call IDs, then the UI resumes after completed tool calls.
Local graphical chat connects to the engine session directly; public API server
activation is not required. No historical raw HTTP body capture is available.

63 targeted tests passed, one skipped, across five suites. Initial workspace
module-resolution failures were resolved using an isolated test config pointing
to existing local modules; no production configuration change. One memory-mock
warning retained in the log. No app rebuild, install or user-setting modification.
The results identify announcement-scope ambiguity and weak source selection /
unsupported synthesis, rather than showing prompt loss or UI text duplication.

[Audit report and evidence](deliverables/prompt-audit-2026-10-23/report.md).
