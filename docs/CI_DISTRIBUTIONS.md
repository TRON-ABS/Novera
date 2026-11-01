# Compilations Novera sur GitHub Actions

<!-- NOVERA CI STATUS START -->
## Tableau de suivi des onze variantes — 1er novembre 2026

Ce tableau relève les résultats des derniers runs concernés, sans transformer un job en cours en réussite. Une relance ciblée remplace le statut de la variante dans l'ancien run global, qui peut donc rester rouge malgré un correctif ultérieur réussi.

| Variante | Dernier état relevé | Provenance |
| --- | --- | --- |
| Desktop Windows x64 | windows / x64: en cours | [run 41276293618](https://github.com/TRON-ABS/Novera/actions/runs/41276293618) · `a84f8cf6` |
| Setup Windows x64 | windows / x64: en cours | [run 41276293618](https://github.com/TRON-ABS/Novera/actions/runs/41276293618) · `a84f8cf6` |
| MSI Windows x64 | windows / x64: en cours | [run 41276293618](https://github.com/TRON-ABS/Novera/actions/runs/41276293618) · `a84f8cf6` |
| Portable Windows x64 | windows / x64: en cours | [run 41276293618](https://github.com/TRON-ABS/Novera/actions/runs/41276293618) · `a84f8cf6` |
| Windows ARM64 | arm64 / arm64: compilé | [run 41275047042](https://github.com/TRON-ABS/Novera/actions/runs/41275047042) · `bb8a1040` |
| Linux | linux / x64: en cours | [run 41279778571](https://github.com/TRON-ABS/Novera/actions/runs/41279778571) · `e870627e` |
| macOS | macos / arm64: en cours; macos / x64: en cours | [run 41278737556](https://github.com/TRON-ABS/Novera/actions/runs/41278737556) · `5468f183` |
| Android | android / windows-2025: en cours | [run 41279776001](https://github.com/TRON-ABS/Novera/actions/runs/41279776001) · `e870627e` |
| iOS simulateur | ios / macos-15: compilé | [run 41276290611](https://github.com/TRON-ABS/Novera/actions/runs/41276290611) · `a84f8cf6` |
| Web | web / ubuntu-22.04: compilé | [run 41275648200](https://github.com/TRON-ABS/Novera/actions/runs/41275648200) · `307fbb16` |
| CLI | cli / ubuntu-22.04: compilé; cli / windows-2025: en cours; cli / macos-15: en cours | [run 41280300978](https://github.com/TRON-ABS/Novera/actions/runs/41280300978) · `410caea5` |

Artefacts téléchargés et contrôlés indépendamment :

- [Novera-arm64-arm64-41275047042](https://github.com/TRON-ABS/Novera/actions/runs/41275047042/artifacts/13071721946) : 19 empreintes vérifiées, signature de marque et provenance conformes, architecture binaire confirmée.
- [Novera-cli-Linux-41280300978](https://github.com/TRON-ABS/Novera/actions/runs/41280300978/artifacts/13073505849) : 7 empreintes vérifiées, signature de marque et provenance conformes, architecture binaire confirmée.
- [Novera-cli-Windows-41273037531](https://github.com/TRON-ABS/Novera/actions/runs/41273037531/artifacts/13070655221) : 7 empreintes vérifiées, signature de marque et provenance conformes, architecture binaire confirmée.
- [Novera-cli-macOS-41273037531](https://github.com/TRON-ABS/Novera/actions/runs/41273037531/artifacts/13069439592) : 7 empreintes vérifiées, signature de marque et provenance conformes, architecture binaire confirmée.
- [Novera-ios-macOS-41276290611](https://github.com/TRON-ABS/Novera/actions/runs/41276290611/artifacts/13071509324) : 6 empreintes vérifiées, signature de marque et provenance conformes, architecture binaire confirmée.
- [Novera-linux-x64-41275746510](https://github.com/TRON-ABS/Novera/actions/runs/41275746510/artifacts/13071478788) : 7 empreintes vérifiées, signature de marque et provenance conformes, architecture binaire confirmée.
- [Novera-macos-arm64-41276594974](https://github.com/TRON-ABS/Novera/actions/runs/41276594974/artifacts/13071619315) : 6 empreintes vérifiées, signature de marque et provenance conformes, architecture binaire confirmée; minimum natif maximal relevé : macOS 15.0.0.
- [Novera-web-Linux-41275648200](https://github.com/TRON-ABS/Novera/actions/runs/41275648200/artifacts/13070388490) : 593 empreintes vérifiées, signature de marque et provenance conformes.

Les signatures ci-dessus sont les notices personnelles TRON-ABS. Elles ne remplacent pas une signature cryptographique de production. Les validations sur PC neuf, téléphone et tablette restent distinctes des compilations CI.
<!-- NOVERA CI STATUS END -->

Le 1er novembre 2026, le mainteneur autorise explicitement **toutes les plateformes et variantes**, en confirmant Linux, Android, iOS et macOS, avec contrôle des résultats et mise à jour des MD. Cette autorisation remplace la consigne historique de garder Actions désactivé pour la préparation seule. Aucun profil utilisateur ni discussion du PC du mainteneur n'est envoyé aux runners.

## Préparation des prochaines versions

Le [cycle durable des versions](FUTURES_VERSIONS.md) ajoute un contrôle préalable des six sources de version, les tests de migration desktop et un générateur de manifeste pour cinq cibles desktop. Le [run de contrats `41281084320`](https://github.com/TRON-ABS/Novera/actions/runs/41281084320), commit `85558421`, réussit : 39 tests Node et deux tests propres à Windows ignorés sur Ubuntu ; les 41 passent localement sur Windows. La CLI Linux du run `41280300978` réussit ses deux tests Rust de politique et d’aide ; son nouveau paquet est téléchargé et vérifié. Les nouveaux tests de migration desktop et les autres hôtes CLI restent suivis dans leurs jobs effectifs.

## Lancement manuel

Workflow : [Novera — All distribution candidates](../.github/workflows/novera-build-all.yml). Entrée `target=all`, ou une des onze variantes du [catalogue](../scripts/distribution/release-targets.json). Les quatre variantes Windows x64 partagent un même build afin de conserver le même code et les mêmes dépendances. Une variante Windows demandée séparément produit également les formats Windows associés.

| Variante | Runner / résultat demandé |
| --- | --- |
| Desktop, Setup, MSI, portable | Windows x64 : runtime complet, NSIS, MSI et ZIP |
| Windows ARM64 | Runner ARM64 natif, moteur texte CPU et NSIS |
| Linux | Ubuntu : `.deb` et AppImage, moteur Vulkan |
| macOS | Deux builds natifs séparés Intel / Apple Silicon, DMG et moteur Metal |
| Android | Windows + JDK/SDK/NDK épinglés : APK de test ARM64 |
| iOS | macOS/Xcode : application pour simulateur Apple Silicon |
| Web | Frontend navigateur compilé |
| CLI | Windows, Linux et macOS : binaire et sortie `--help` |

Les applications macOS sont construites séparément par architecture : elles ne sont pas présentées comme un paquet universel dont tous les moteurs auraient deux tranches. Le moteur image Windows x64 n'est jamais copié dans Windows ARM64. La disponibilité des médias sur ces autres plateformes reste propre à leurs moteurs et prérequis ; une compilation ne garantit pas chaque fonction locale.

## Résultats et conservation

Chaque job réussi conserve un artefact GitHub Actions pendant **14 jours**, contenant les fichiers compilés, `candidate.json`, `SHA256SUMS`, les licences et `SIGNATURE.txt` : **TRON-ABS — The art of Human with AI**, avec le souhait d'une belle aventure en français et en anglais. Le portable porte aussi ce message dans son mode d'emploi. Les applications desktop embarquent une notice de signature. Aucun poids de modèle, discussion, clé personnelle, profil ou map privée n'est inclus par le collecteur.

Le commit et le run exacts figurent dans la provenance. Les matrices continuent lorsqu'une plateforme échoue ; le résumé global échoue si une matrice échoue. Les diagnostics de build sont conservés séparément pendant 7 jours quand ils sont disponibles. Un job vert signifie que sa commande et sa collecte ont réussi ; les champs `deviceValidated`, `productionSigned` et `publicReleasePublished` restent faux. Le worker desktop est exécuté avec `--version-json` ; la CLI avec `--help`. Cela ne remplace pas une inférence ni un essai d'installation sur une machine neuve.

Les anciens workflows de publication Jan, notifications et tâches planifiées doivent rester désactivés lors de l'activation du nouveau workflow manuel. Les commandes de ce lot ne publient pas vers npm, AWS, Discord, les stores Apple/Google ou un flux de mise à jour. Les artefacts Actions ne sont pas une release GitHub permanente ; une release exige une préparation et validation distinctes selon [la politique de publication](../OFFICIAL_RELEASES.md).

## Signature et mobile

Au contrôle initial, aucun secret Actions n'est configuré. Aucun certificat ni identité de production n'est inventé. Les signatures de marque TRON-ABS ne constituent pas une signature cryptographique des exécutables.

Les trois audits Android restent explicitement non validés dans `readiness.json`. Le nouveau commutateur `-AllowUnreviewedTestBuild` permet seulement un **APK debug de test sur GitHub Actions**, après tous les contrôles techniques existants. Il n'assouplit pas les builds ordinaires, n'ignore pas un SDK/moteur/permission manquant, ne coche pas les audits et ne certifie pas une distribution publique. Les licences SDK doivent être déjà provisionnées sur le runner : aucun acquittement automatique de nouveaux termes. Les SHA-256 du JDK et des outils Google sont contrôlés.

Le résultat iOS visé est pour **simulateur**, sans prétendre produire une IPA installable sur iPhone. Une archive appareil, TestFlight ou App Store exige l'équipe Apple réelle, les certificats et les profils appropriés. Le placeholder du dépôt est retiré dans la configuration temporaire du candidat simulateur uniquement. L'initialisation et la compilation réelles peuvent encore révéler des dépendances natives à corriger ; leurs résultats doivent être consignés.

## Contrôles avant premier lancement

`actionlint 1.7.12` valide le nouveau workflow. Les YAML sont parsés. Quatre tests du collecteur/politique Android réussissent ; les neuf tests du contrôle des distributions et ses onze références sont valides. Les 223 assertions / 12 scénarios du portable réussissent. La première tentative de contrôle Bash a été bloquée par l'isolation Windows ; les contrôles de syntaxe Bash des trois scripts ont ensuite réussi avec accès approprié. Ces contrôles ne sont pas des compilations multiplateformes.

## Premier lancement distant — 1er novembre 2026

Le mainteneur a explicitement autorisé l'activation de GitHub Actions, la désactivation des anciens workflows et la limitation des actions autorisées. État vérifié après application : **37 anciens workflows désactivés**, un seul workflow actif (`Novera - All distribution candidates`). La politique autorise les actions GitHub et l'action MSVC épinglée utilisée par ce workflow ; aucun secret de signature n'a été ajouté.

Le [run 41272733352](https://github.com/TRON-ABS/Novera/actions/runs/41272733352) est déclenché avec `target=all` depuis le commit `3f072579bbc2e97c15ea2cd4d0c6bf49d3902641`. GitHub a créé onze jobs de compilation, initialement en file d'attente, avec les quatre formats Windows regroupés et plusieurs hôtes pour macOS/CLI. Le résumé dépend de ces matrices. Aucun artefact compilé ni succès distant n'est encore attesté par ce premier relevé. Les résultats ultérieurs doivent conserver le commit exact de leur run plutôt que le HEAD courant.


### Premier correctif issu du run

Le job Web échoue réellement à l'installation immuable Yarn (`YN0028`), avant la compilation : l'entrée racine `novera-app@workspace:.` est restée à l'ancienne position alphabétique de son nom précédent. L'entrée est déplacée à sa position canonique. Les arbres YAML avant/après sont comparés égaux : aucune version ni dépendance n'est changée. L'essai local de validation Corepack a été empêché par l'accès réseau du bac à sable ; le résultat de l'installation immuable doit être confirmé par le prochain run GitHub. Une relance depuis le commit corrigé remplace le run initial, dont les résultats ne sont pas présentés comme des compilations réussies.

### Préparation native Windows et actions imbriquées

Les journaux du premier run révèlent également deux causes distinctes : l'action composite demandait une action tierce d'installation de jq absente de la liste autorisée ; la CLI Windows prenait le `link.exe` GNU de Git Bash à la place du linker MSVC. Le provisionnement jq utilise désormais l'outil présent sur le runner ou son gestionnaire natif, sans élargir les permissions GitHub. Un script commun sélectionne le linker MSVC par chemin complet pour le bon hôte/cible x64 ou ARM64, y compris pour la CLI. Une relance du workflow manuel remplace les candidats précédents du même groupe ; elle ne crée pas de publication automatique.

Validation du correctif natif : **5 tests de candidats/politiques réussis**, dont sélection réelle du chemin MSVC pour fixtures x64/ARM64 avec espaces et refus d’un outil absent ; actionlint toujours sans erreur.

### Run corrigé et première compilation réussie

[Run 41273037531](https://github.com/TRON-ABS/Novera/actions/runs/41273037531), commit `7cced48a4b6924f9e20e91a064c2c2a027638e24` : **Web compilé et artefact retenu**, identifiant `13069523743`, 49 318 112 octets. Cette réussite confirme l'installation Yarn immuable après normalisation du verrou. Les autres plateformes sont encore suivies individuellement.

Windows x64 a ensuite échoué sur une comparaison SHA-256 CUDA. Vérification indépendante du premier composant depuis le manifeste officiel NVIDIA : archive NVCC 13.4.92 de 32 991 192 octets, SHA-256 attendu et réel `23950047aa5405993129a982a99924b4e6d5eb9bc312300030f3afd9b3b49ea4`, conformes. Cause reproduite localement : GNU `sha256sum` préfixe l'empreinte par un caractère d'échappement lorsque le nom contient les antislashs d'un chemin Windows. Calculer sur l'entrée standard évite ce marqueur, sans retirer la vérification. Seul Windows est relancé après ce correctif ; les plateformes encore actives conservent leur run.

### Validation des artefacts et catalogue CUDA

L'artefact Web est téléchargé et validé indépendamment : **594 fichiers, 593 empreintes vérifiées**, signature TRON-ABS et provenance conformes. SHA-256 de l'archive GitHub : `ace1e40c9b803052d505ebed92aa1b89ef24d89e04383beab7b667cd220b91a5`. Aucun profil, discussion ou poids de modèle n'est présent selon le contrôle du contenu et le manifeste.

Relance Windows [41273326935](https://github.com/TRON-ABS/Novera/actions/runs/41273326935), commit `dfe64604` : la comparaison des archives est rétablie ; le provisionnement révèle ensuite le renommage officiel `cuda_cccl` → `cccl` dans CUDA 13.4.3. Un planificateur valide désormais tous les composants, leur architecture, version, chemin et SHA-256 avant le premier téléchargement. Il conserve les anciens catalogues et n'autorise les trois composants historiquement intégrés à NVCC que sur les anciennes versions concernées. Les notices de chaque composant sont conservées ; le document EULA officiel de NVCC est copié sans modification sous le nom attendu par le packager image. Le runtime image conserve aussi ces notices redist. **8 tests** des nouveaux contrôles passent, ainsi qu'actionlint.

### CLI et premier démarrage Android

Les CLI Linux x64 et macOS ARM64 ont compilé sur le run `41273037531`, exécuté `--help`, puis retenu leurs artefacts. Vérification indépendante de chaque archive : **8 fichiers, 7 empreintes conformes**, signature TRON-ABS, provenance et architecture réelle (ELF x64 / Mach-O ARM64) confirmées. Artefacts : Linux `13069749955` (20 828 083 octets, SHA-256 `610412c849c00616419dbc3e1c6c6bd815502ba7ca720423370612d6ef7418fb`) ; macOS `13069439592` (13 882 558 octets, SHA-256 `42c920a8af6c6c9462d3a1c930cad967cda0d5cce1e6874e8eae4c1fd8f6841b`). Le binaire interne reste nommé `jan` ; après téléchargement d'un artefact ZIP sur Unix, rétablir au besoin son droit d'exécution avec `chmod +x jan`.

Android : le provisionnement JDK/SDK/NDK épinglé a abouti, sans nouvelle acceptation automatique de licence. Le projet Tauri est généré mais la configuration échoue faute de `tauri.settings.gradle`, normalement émis par le premier Cargo mobile. L'initialisation ajoute donc un bootstrap frontend puis `cargo check --locked --lib --no-default-features --features mobile --target aarch64-linux-android` avec le contexte Android avant de configurer les copies Gradle. Un projet déjà initialisé conserve le chemin existant. Les trois tests de configuration Android et la syntaxe PowerShell réussissent ; le bootstrap natif réel est à confirmer par la relance Android.

### Cause commune aux builds natifs vierges : icônes générées

Windows ARM64 atteint le build Tauri mais échoue sur `icons/icon.ico` absent ; le message `package.metadata does not exist` qui le précède n'est pas la cause bloquante. iOS atteint sa compilation Rust/Xcode de simulateur, puis échoue sur `icons/32x32.png` absent. Ces icônes sont générées localement par le lanceur existant et ne sont pas des entrées binaires versionnées. Le script CI ajoute `yarn build:icon` avant toutes les constructions natives, y compris le bootstrap Android.

Le sélecteur manuel `native` relance uniquement les applications desktop et mobiles. Il ne recompilera pas les trois CLI et le Web déjà compilés et vérifiés. Les anciennes tentatives natives sont remplacées ; leurs artefacts déjà réussis restent disponibles. Aucune réussite complète ARM64/iOS n'est déduite de ce correctif avant son nouveau build.

La notice personnelle TRON-ABS est également copiée dans les assets du futur APK Android, et pas seulement dans son artefact extérieur. Le test du collecteur confirme qu’une notice seule ne permet jamais de certifier une compilation vide. Les **11 tests** candidats/CUDA/configuration Android passent après ces modifications ; actionlint est sans erreur.

### Linker CMake du moteur CUDA

Le build Windows du run `41273736808` dépasse le provisionnement, puis CMake choisit à son tour le `link.exe` GNU pour son test NVCC, bien que Cargo ait déjà son linker MSVC. Le journal confirme que NVCC compile le test CUDA et que le lien échoue sur l'outil GNU. Le même chemin MSVC vérifié est maintenant transmis explicitement au build CMake du moteur avec `NOVERA_MSVC_LINKER`, sans modifier le comportement des environnements qui ne le définissent pas. Le test x64/ARM64 contrôle les deux réglages exportés ; les cinq tests de candidats/politiques passent. Android confirme le même défaut d'icônes dans son bootstrap Cargo précédent ; la génération commune des icônes couvre également ce cas.

### Régression de compilation GTK 3

Le premier build Linux a une seconde erreur réelle, en plus des icônes : `gtk::Clipboard` 0.18.2 ne possède pas `set_uris`. L'archive officielle de cette version a été vérifiée contre le SHA-256 du verrou Cargo ; `set_uris` appartient à `SelectionData`. La copie de fichiers utilise maintenant `Clipboard::set_with_data` avec une cible `text/uri-list`, conserve l'URI dans le callback, propage un refus d'appropriation et demande sa conservation au gestionnaire de presse-papiers.

Le contrôle Linux isolé compile le **même module que la production** et demande réellement l'URI au presse-papiers sous Xvfb, avec espace/Unicode encodés. Il ne duplique pas l'implémentation dans une fixture et ne touche pas le presse-papiers du mainteneur. Son résultat doit être confirmé par GitHub ; il n'a pas été exécuté sur Windows. Les tentatives natives concernées sont remplacées par un run depuis ces correctifs, tandis que les quatre artefacts Web/CLI validés restent conservés.

### Contrôle visuel Web et premier lancement navigateur

L'artefact Web vérifié est servi localement sans recompiler les sources et ouvert dans un navigateur vierge. L'interface charge Novera 1.0.0 sans discussion, mais l'accueil initial impose le wizard d'installation du moteur desktop, inadapté au navigateur. L'accueil Web sans fournisseur utilisable est maintenant dirigé vers les réglages existants des fournisseurs ; les applications Tauri (desktop/mobile) conservent leur parcours natif. Aucun nouveau libellé ni catalogue de traduction n'est ajouté.

**13 tests de route réussis**, dont navigateur vierge, navigateur avec fournisseur distant et parcours natif existant ; TypeScript et lint ciblé réussissent. Une nouvelle compilation Web GitHub doit confirmer le correctif, puis son écran initial sera contrôlé. Le serveur d'aperçu initial isolé n'était pas accessible au navigateur ; il a été relancé hors de cette isolation, sur boucle locale uniquement, sans changement du pare-feu ni des paramètres de sécurité.

### Contrat du test GTK

Le run natif `41275047042` compile le nouveau module de production GTK. Son test isolé échoue ensuite à la compilation parce que `wait_for_uris()` renvoie directement un `Vec<GString>`, et non une option. Retirer l'appel `expect` du test conserve les assertions sur la liste et l'URI retournée. Ce défaut appartient au test ajouté ; aucune réussite de l'échange presse-papiers n'est encore annoncée avant la relance Linux.

### Web corrigé : build et contrôle visuel confirmés

[Run Web 41275648200](https://github.com/TRON-ABS/Novera/actions/runs/41275648200), commit `307fbb16a78abf4a0baaa7d70b5d6a36a433a233` : job et résumé réussis. Artefact `13070388490`, **49 318 320 octets / 594 fichiers / 593 empreintes conformes**, SHA-256 `110792ff7fdf6e41505c46065a4f7aed1e986296ec394734670e6075a121d8aa`. Notice personnelle et provenance vérifiées.

Le navigateur vierge ouvre désormais `/settings/providers` directement. Le formulaire existant de fournisseur compatible OpenAI/Anthropic s'ouvre correctement ; aucune clé ni génération n'est utilisée pour ce test. Aucun téléchargement de modèle n'est lancé. La capture de contrôle est conservée localement hors Git. Les onglets et deux serveurs d'aperçu créés pour le test sont fermés/arrêtés. Ce contrôle du premier lancement n'est pas une preuve d'inférence cloud ni un test de chaque fournisseur.

### Collecte iOS et chemins Windows : relances ciblées

Le run natif `41275047042` compile réellement l’application iOS : Xcode annonce `BUILD SUCCEEDED`, puis Tauri produit `src-tauri/gen/apple/build/arm64-sim/Novera.app`. Le collecteur attendait un chemin contenant `simulator` et refusait donc ce résultat. Le filtre reconnaît désormais les répertoires Tauri `arm64-sim` / `x86_64-sim` et les produits `iphonesimulator`, en excluant une application device `arm64`. Un test archive la bonne application parmi les deux et relit son contenu : réussi. Relance iOS `41276290611`, commit `a84f8cf6` ; la compilation précédente ne vaut pas artefact téléchargeable puisqu’elle n’avait pas été collectée.

Windows x64 passe désormais la détection CUDA mais échoue dans le sous-build Vulkan sur `RC1109`, lors de la création d’un manifeste dans un chemin très imbriqué. Le build CI utilise le répertoire moteur court sous `RUNNER_TEMP`, avec l’isolation par `OUT_DIR` déjà fournie par le moteur et son reçu de staging. Aucune modification du registre ou des réglages Windows. Relance Windows x64 `41276293618`, même commit. Six tests de collecteur/politiques réussissent, ainsi que la syntaxe Bash. Les autres architectures continuent sur leur run d’origine.

### Android : environnement des commandes frontend

Le run natif `41275047042` termine le bootstrap Android et le moteur ARM64, puis échoue dans `beforeBuildCommand` : `cross-env` introuvable. L’entrée APK invoquait directement le fichier JavaScript de Tauri, sans le chemin des outils du workspace fourni par Yarn. Elle passe maintenant par `corepack yarn tauri`, sans changer les contrôles Android ni les dépendances. Syntaxe PowerShell et neuf tests ciblés collecteur/configuration/politiques réussis. Relance Android `41276458095`, commit `ce35ecbd`.

### macOS : prérequis et ressources propres à l’architecture

Le serveur MLX documente Apple Silicon et Xcode 26.2 comme prérequis. Le nouveau workflow choisit maintenant cette installation Xcode par `DEVELOPER_DIR` pour le desktop ARM64, comme les workflows macOS existants ; aucun changement persistant de `xcode-select`. Intel conserve son worker GGUF natif et exclut les ressources MLX réservées à Apple Silicon. Le manifeste de candidat indique cette limite. Un test relit la vraie configuration macOS et vérifie que le worker GGUF reste présent sur Intel, que MLX est exclu sur Intel et conservé sur ARM64. Sept tests de collecteur/politiques et syntaxe Bash réussis. Relance macOS `41276594974`, commit `9f68b5d3` ; les compilations natives restent à confirmer par les résultats du run.

### iOS simulateur : candidat téléchargé et inspecté

[Run iOS `41276290611`](https://github.com/TRON-ABS/Novera/actions/runs/41276290611), commit `a84f8cf64b03367e9b6e2d271083a20d1e29e30e` : compilation, collecte et résumé réussis. Artefact `13071509324`, **81 814 413 octets / 7 fichiers / 6 empreintes conformes**, SHA-256 `bb3a16377d1da77a722d68932ded5ffd0463f778094aa970d3d07d761124218a`.

L’archive interne `Novera-iOS-simulator-0.tar.gz` contient **17 entrées**. Lecture indépendante de l’exécutable Mach-O : **ARM64**, commande `LC_BUILD_VERSION` indiquant la plateforme **iOS Simulator (7)**. La notice TRON-ABS est présente dans l’application elle-même ; chemins, inventaire et absence de poids/profils/discussions contrôlés. Cela confirme un paquet de simulateur, pas une IPA signée pour iPhone. Aucun lancement sur simulateur ou appareil réel n’est encore certifié. Le journal conserve aussi un avertissement Xcode sur l’identifiant personnalisé du plist ; il n’a pas empêché ce build de simulateur et devra être revu avant le provisioning d’une version device.

### Windows ARM64 : desktop et NSIS vérifiés

Job ARM64 `124755700775` réussi dans le [run `41275047042`](https://github.com/TRON-ABS/Novera/actions/runs/41275047042), commit `bb8a1040c17f5b9326859f945bfe1212966c9a81`. Artefact `13071721946` : **291 192 696 octets / 20 fichiers / 19 empreintes conformes**, SHA-256 `cb3d9ac4b51d5c39a0393e857aeed1d107ad25702f6b17e44e97ffd226690620`.

Les **sept exécutables/DLL du desktop sont réellement ARM64**. Le worker CPU et ses bibliothèques sont présents ; le runtime image x64 est exclu. Extraction indépendante du NSIS `Novera_1.0.0_arm64-setup.exe` avec 7-Zip 26.05 : **16 fichiers**, les **neuf fichiers runtime attendus** correspondent exactement aux empreintes du desktop. Les autres entrées appartiennent à NSIS et au désinstalleur. Notice TRON-ABS embarquée. Aucun installateur ni application ARM64 n’est exécuté sur le PC x64 du mainteneur ; l’essai sur appareil Windows ARM64 reste à effectuer.

Après cette réussite, les deux anciens jobs macOS encore en cours dans le run natif sont remplacés par la relance macOS dédiée. L’arrêt du run global conserve les artefacts réussis ; il ne transforme pas ses anciennes erreurs en validations.

### macOS Apple Silicon : premier DMG inspecté

Le job macOS ARM64 `124755700844` termine également avec succès juste avant la fin du run natif `41275047042`. Artefact `13072130830` : **108 367 202 octets / 7 fichiers / 6 empreintes conformes**, SHA-256 `8a55653d9995f8211fedb124da112bae684d6e88442330893ce2a5a0bfc22e21`.

Inspection indépendante du DMG/HFS sans installer ni exécuter l’application : **35 entrées**, **16 binaires/bibliothèques Mach-O ARM64** vérifiés, dont l’application, Bun, uv, le worker GGUF et MLX. Notice personnelle présente dans l’application ; `default.metallib` est embarqué. Les dépendances chargées référencent les frameworks système ou les bibliothèques livrées via `@rpath`, avec `@loader_path` en tête des chemins de recherche du worker. Les chemins de développement supplémentaires du runner ne sont pas nécessaires à ces bibliothèques locales ; cela reste un contrôle statique, pas une validation d’inférence ou de lancement sur un Mac neuf. La relance dédiée macOS `41276594974` poursuit les contrôles Intel et Apple Silicon.

### Linux : Debian et AppImage vérifiés, test GTK réussi

[Run Linux `41275746510`](https://github.com/TRON-ABS/Novera/actions/runs/41275746510), commit `0beb13a3280c0665063674391112d493ec2ba991` : compilation, collecte et résumé réussis. Artefact `13071478788` : **321 560 268 octets / 8 fichiers / 7 empreintes conformes**, SHA-256 `bad4f68ae0b8da53ab9deba7f5cd49ceea6f4dd4b6b45ba453d7597b37c1e911`. Debian : **127 787 272 octets** ; AppImage : **193 747 448 octets**.

Le journal confirme le test réel `clipboard_serves_a_file_uri_to_a_consumer` sous Xvfb : **1 réussi, 0 échec, 0 ignoré**, exécuté sur le module GTK de production. Inspection indépendante des paquets sans les installer ni les exécuter : Debian **47 entrées / 25 ELF x64**, AppImage **564 entrées / 25 ELF x64**. Application, Bun, uv, worker, modules CPU et Vulkan présents ; signature TRON-ABS embarquée dans les deux formats. L’AppImage conserve `.DirIcon` et exclut les bibliothèques de pilote `libcuda.so` / chargeur `libvulkan.so` qui doivent provenir du système utilisateur. Lancement graphique, inférence et installation sur distributions cibles restent à tester séparément.

### Android : argument Cargo perdu par le CLI verrouillé

La relance `41276458095` dépasse bien `cross-env`, puis échoue sur les API tray/updater desktop activées dans le build mobile. Le journal montre le Cargo initial sans `--no-default-features`, malgré l’argument demandé. Le [source officiel du CLI Tauri 2.8.4](https://github.com/tauri-apps/tauri/blob/tauri-cli-v2.8.4/crates/tauri-cli/src/mobile/android/build.rs) utilise les options par défaut pour ce premier build Android. Le [CLI 2.11.4](https://github.com/tauri-apps/tauri/blob/tauri-cli-v2.11.4/crates/tauri-cli/src/mobile/android/build.rs) transmet les arguments demandés au premier Cargo.

Épingler `@tauri-apps/cli` à **2.11.4** corrige ce chemin sans activer les fonctions desktop sur mobile. Comparaison sémantique du verrou : seules les entrées CLI Tauri, ses binaires hôtes et la référence du workspace racine changent. Installation `corepack yarn install --immutable --mode=skip-build` réussie et `tauri-cli --version` confirme 2.11.4 ; aucun build d’application local. Les avertissements de peers React/TypeScript préexistants restent visibles. Relance Android depuis `d142e12ee4e785d5204d027e73b722f21becec4f`.

### macOS : minimums de compilation et métadonnées alignés

La relance ARM64 `41276594974` réussit, puis son DMG `13071619315` est téléchargé et inspecté : **108 550 638 octets / 6 empreintes conformes / 16 Mach-O ARM64**, SHA-256 `2fff8b4c5ed0a0587a0624e443a25a3242ad226a4cba10feec8850a2ad7d7b63`. MLX, ses shaders et la notice embarquée sont présents. Toutefois, la lecture des commandes Mach-O révèle que **les bibliothèques GGUF de ce candidat exigent macOS 15**, contrairement au minimum plus ancien annoncé par l’application. Les anciens DMG restent donc des candidats pour macOS 15 ; ils ne prouvent pas le fonctionnement sur macOS 13/14.

Le nouveau profil CI définit un minimum commun à la compilation CMake/Rust et au plist Tauri : **macOS 14.0 sur Apple Silicon** (minimum MLX déclaré) et **13.0 sur Intel** (minimum Bun observé). Un helper partagé fournit ces valeurs aux deux étapes. Après packaging, le contrôle lit les commandes de chaque Mach-O dans l’application, vérifie CPU/plateforme/version minimale et compare le plist ; toute bibliothèque plus exigeante bloque la collecte. Un reçu `MACOS-COMPATIBILITY.json` est ajouté aux candidats qui passent ce contrôle.

Douze tests ciblés réussissent : contrats du collecteur, prérequis MLX lus dans son vrai manifeste et quatre cas de lecture Mach-O, dont le défaut observé macOS 15 sous une déclaration 14, les commandes Intel anciennes, les versions patch, une cible iOS/CPU incorrecte et les entrées tronquées. Syntaxe Bash réussie. [Relance macOS `41278737556`](https://github.com/TRON-ABS/Novera/actions/runs/41278737556), commit `5468f183c5b94f276d1de7ca4f95edf9bc586d83`, encore en compilation. Ce ciblage ABI ne certifie pas à lui seul un lancement ou une inférence sur les anciennes versions de macOS.
