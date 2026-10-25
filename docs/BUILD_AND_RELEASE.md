# Novera — construction et distribution

Procédures des sources au **26 octobre 2026**. Les commandes de compilation, installation et signature ci-dessous sont à exécuter dans le cadre d’une demande correspondante ; la consolidation de documentation ne les exécute pas. [État actuel](../TABLEAU_DE_BORD_NOVERA.md), [tâches de validation](../ROADMAP.md), [règles de publication](../OFFICIAL_RELEASES.md).

[Desktop](#desktop) · [Portable](#portable) · [Android](#android) · [CLI](#cli) · [Mises à jour](#updates) · [Collecte facultative](#telemetry) · [Nettoyage](#cleanup)

<a id="desktop"></a>

## Construire Novera Desktop

Le fichier `C:\msys64\home\jmsga\Compiler-Novera.bat` est prévu à côté du dossier `Novera`. Sa copie source est [scripts/Compiler-Novera.bat](../scripts/Compiler-Novera.bat), et l'implémentation est [build-novera-local.ps1](../scripts/distribution/build-novera-local.ps1).

Un double-clic compile **Novera-Desktop Windows x64 uniquement**. Les autres variantes ont leur interrupteur à `0` en tête du BAT. Un argument ne contourne pas cet interrupteur. Aucun menu ne déclenche toutes les compilations. Le lanceur ne publie rien et n'active ni Actions, ni mises à jour automatiques, ni statistiques.

```bat
Compiler-Novera.bat
Compiler-Novera.bat /list
Compiler-Novera.bat /plan
Compiler-Novera.bat /plan portable
Compiler-Novera.bat /android-check
```

`/list`, `/plan` et `/android-check` ne compilent rien. Le diagnostic Android n'installe rien non plus. Pour une commande automatisée, `set NOVERA_BUILD_NO_PAUSE=1` évite la pause finale ; après un double-clic, la fenêtre reste ouverte pour lire les messages.

| Identifiant | Livrable / environnement | État initial |
| --- | --- | --- |
| `desktop` | Dossier complet Novera-Desktop Windows x64, sans installateur ni ZIP | **Activé** |
| `setup` | Installateur Windows x64 NSIS `.exe` | Désactivé |
| `msi` | Installateur Windows x64 `.msi` | Désactivé |
| `portable` | Nouveau build desktop puis ZIP et empreinte | Désactivé |
| `arm64` | Windows ARM64, ressources et outils ARM64 nécessaires | Désactivé ; commande à préparer sur environnement adapté |
| `linux` | `.deb` / AppImage depuis Linux | Désactivé ; commande native indiquée |
| `macos` | `.app` / `.dmg` universel depuis macOS et Xcode | Désactivé ; commande native indiquée |
| `android` | APK debug ARM64, chaîne récente intégrée ; essais sur téléphone à faire | Désactivé et bloqué par les audits mobiles |
| `ios` | Construction pour appareil depuis macOS/Xcode, signature à prévoir | Désactivé ; commande native indiquée |
| `web` | Interface compilée `dist`, sans serveur ou déploiement | Désactivé ; fonctionnement navigateur à valider |
| `cli` | CLI sans interface, nom de binaire historique défini par son manifeste | Désactivé |

Pour une activation ultérieure, modifier **la copie du BAT réellement utilisée** (`NOVERA_BUILD_SETUP=1`, par exemple), puis appeler `Compiler-Novera.bat setup`. Cela autorise la tentative mais ne fournit pas ses dépendances. Linux/macOS/iOS ne se compilent pas automatiquement depuis ce BAT Windows ; leurs commandes existantes sont présentées avec le système requis. Windows ARM64 exige d'abord des ressources de cette architecture. Les APK Android ont été assemblées dans les validations séparées documentées ci-dessous ; les autres variantes désactivées restent à valider.

### Prérequis Windows et résultats

Le dépôt doit déjà avoir ses dépendances Yarn, ses extensions compilées et les auxiliaires Bun/uv dans `src-tauri/resources`. Node.js/Corepack, la version Rust MSVC épinglée dans `rust-toolchain.toml`, Visual Studio Build Tools C++ et Windows SDK sont nécessaires. MSVC est recherché via `vswhere`.

Avant `desktop`, `portable`, `setup` ou `msi`, le lanceur prépare désormais `novera-llama-worker.exe` et ses bibliothèques, avant même la compilation de l’interface et la résolution des ressources Tauri. [Préparation du moteur](../scripts/distribution/prepare-novera-engine.ps1) : sources llama.cpp épinglées, contrôle des outils, compilation Cargo hors ligne/verrouillée, préparation des DLL et vérification `--version-json`. Un échec arrête le lanceur avec un journal distinct. L’ancien nom `jan-llama-worker.exe` ne satisfait pas ce prérequis.

La première préparation du moteur demande Bash (Git for Windows ou MSYS2), CMake, Ninja et Clang sur PATH, ainsi que le kit correspondant au backend GPU choisi. `JAN_LLAMA_CPP_DIR` peut désigner les sources locales préparées ; sinon le script récupère la révision épinglée. `JAN_ENGINE_VARIANT` permet un choix explicite (`cpu`, `vulkan`, `cuda12`, `cuda13`, `hip`/`rocm`, ou combinaison). Sans choix explicite, les backends déjà préparés sont conservés ; un dossier sans moteur commence avec Vulkan. Les variantes CUDA explicites sont confrontées à la version réelle de nvcc. Les préréglages locaux historiques peuvent cibler uniquement le matériel testé et ne prouvent pas une distribution universelle.

Un reçu local ignoré, `.novera-engine-build.json`, permet de réutiliser le moteur lorsque les empreintes de ses sources et de tous ses binaires correspondent encore. Un changement de sources, de DLL ou d’options explicitement demandées déclenche une nouvelle préparation. Les outils GNU ne passent avant PATH que pendant les étapes Bash ; le lien Cargo garde les outils MSVC. La sélection des DLL CUDA vérifie leur architecture PE contre celle du worker, notamment quand un même kit contient `bin/arm64` et `bin/x64`. `cudart` accompagne le runtime Windows même si le module courant le lie statiquement.

Le cache Rust suit `CARGO_TARGET_DIR` s'il est défini ; sinon il utilise `C:\jb` lorsqu'il existe, puis `src-tauri/target`. Le build desktop est hors ligne et verrouillé pour Cargo : une dépendance non disponible doit être préparée séparément. Corepack peut nécessiter une première mise en cache de Yarn.

Les journaux sont dans `.build/launcher-<variante>-<date>`. Un résultat complet est créé dans **un nouveau dossier** `deliverables/Novera-desktop-<version>-<date>` ; il contient l'EXE, les ressources du moteur, Bun, uv, les licences et `SHA256SUMS`. Les modèles et conversations ne sont jamais copiés. Le dossier de l'application existante n'est pas remplacé. Un verrou empêche deux exécutions simultanées de ce lanceur ; il ne verrouille pas des builds externes lancés avec d'autres scripts. Les résultats locaux sont ignorés par Git.

Setup/MSI utilisent le bundler Tauri et leurs sorties sont copiées dans un nouveau dossier. Portable compile d'abord le desktop, puis utilise le packager existant sur ce nouveau runtime. Ces variantes restent désactivées, non signées par cette préparation et non validées comme distributions officielles. En cas d'échec, consulter le journal ; un dossier incomplet peut rester pour le diagnostic. Aucune suppression récursive de dossiers utilisateur n'est effectuée.

<a id="portable"></a>

## Paquet Windows portable

Le paquet est `Novera_<version>_x64-portable.zip`, avec variantes de canal beta/nightly.

### Utilisation

Extraire **tout** le ZIP dans un dossier accessible en écriture, puis lancer `Novera-Desktop.exe` (ou son nom de canal). Conserver `resources/`, Bun, uv et les DLL avec l’exécutable. Les modèles ne sont pas fournis.

La machine doit disposer de Microsoft Edge WebView2 Runtime et du runtime Microsoft Visual C++ x64. Les pilotes compatibles restent nécessaires à l’accélération GPU. Le paquet reprend les backends du build fourni, sans les remplacer ni les télécharger pendant le packaging.

Il s’agit d’une application **sans installation**. Les réglages, discussions et modèles restent dans le profil Novera habituel, normalement `%APPDATA%/Novera`. Ce ZIP ne déplace pas ces données sur une clé USB. Fermer l’application et extraire le nouveau ZIP complet dans un nouveau dossier pour changer de version. Les mises à jour automatiques restent désactivées.

### Préparer le ZIP en local

Après un build Windows explicitement autorisé, utiliser :

```powershell
yarn package:portable:win32
```

Le script cherche l’exécutable dans `CARGO_TARGET_DIR/release`, ou dans `src-tauri/target/release` si la variable est absente. Les ressources et auxiliaires viennent de la même préparation de build dans `src-tauri/resources`. L’archive est placée par défaut dans `src-tauri/target/portable`.

```powershell
./scripts/package-windows-portable.ps1 -ReleaseDir C:/build/release -OutputDir C:/build/portable
```

Un dossier d’application déjà complet peut aussi être reconditionné, sans compiler :

```powershell
./scripts/package-windows-portable.ps1 -RuntimeDir ./deliverables/Novera-Desktop-local-1.0.0 -OutputDir ./deliverables/Novera-portable-validation-1.0.0-2026-10-24
```

Dans ce mode, ressources et auxiliaires viennent uniquement du dossier fourni. Son `BUILD_INFO.md`, s’il existe, est conservé. **Reconditionner un ancien exécutable n’ajoute pas les corrections récentes des sources.** La version produit du binaire est comparée à la version demandée lorsqu’elle est présente.

### Contenu et intégrité

- Exécutable desktop Novera x64, worker llama.cpp, DLL des backends, Bun et uv.
- Licences et attributions d’origine, identité et règles des versions officielles.
- `README.txt`, `portable-manifest.json` et `SHA256SUMS` dans l’archive ; empreinte du ZIP dans son fichier `.sha256` adjacent.

L’inventaire décrit les tailles et empreintes des fichiers de charge utile. `SHA256SUMS` inclut aussi le manifeste, sans chercher à se hacher lui-même. Aucun profil utilisateur, historique, identifiant, modèle ou fichier arbitraire du dossier d’entrée n’est copié.

Les fichiers sont triés, les dates ZIP fixées et les textes générés encodés en UTF-8 sans BOM. Deux passages avec les mêmes entrées dans le même runtime PowerShell/.NET produisent la même archive. La compression peut différer entre versions de .NET ; aucune identité binaire entre PowerShell 5.1 et 7 n’est garantie.

Les dépendances absentes ou vides, les PE d’une autre architecture, l’absence de backend CPU, les bibliothèques CUDA incomplètes et les chemins de ressources sortant du dossier attendu sont refusés. Un échec avant remplacement conserve le ZIP précédent. Seul le staging créé pour l’opération est supprimé, après vérification de son chemin absolu. Les chemins relatifs suivent le dossier PowerShell courant.

Une empreinte assure l’intégrité, sans authentifier l’éditeur. Le paquet local est non signé et ne constitue pas une release officielle publiée ; voir [OFFICIAL_RELEASES.md](../OFFICIAL_RELEASES.md).

Le packager est un assemblage du runtime fourni : reconditionner un ancien exécutable n’intègre pas les dernières sources. Les modèles ne sont pas embarqués. Le profil reste dans l’emplacement habituel `%APPDATA%/Novera` ; « portable » signifie ici sans installateur, pas sans données persistantes. La CI manuelle préparée reste désactivée et n’est pas une preuve de fonctionnement sur runner ou PC propre.

<a id="android"></a>

## Android : chaîne et garde-fous

Mise à jour : **24 octobre 2026**. Les versions validées par les essais locaux sont maintenant les versions de référence des scripts Android du projet. Leur source unique est [toolchain.json](../scripts/android/toolchain.json).

| Composant | Version retenue |
| --- | --- |
| JDK | **27.0.1.0.3** |
| SDK de compilation | **37.2** — API majeure 37, mineure 2 |
| Target SDK / minimum SDK | **37 / 24** |
| Build-Tools | **37.0.0** |
| NDK LTS | **r30 — 30.0.16248370**, Clang 21 |
| Gradle | **9.8.1** |
| Android Gradle Plugin | **9.4.0** |
| Plugin Kotlin Android / bibliothèque standard | **2.4.21** |
| Rust / première architecture | **1.98.0 / aarch64-linux-android**, ABI arm64-v8a |

Il s’agit d’une combinaison compilée dans les essais locaux du 24 octobre, sans certification officielle de compatibilité entre tous les outils. Les essais sur téléphone restent nécessaires.

### Installation et sélection des outils

Le SDK reste dans son dossier Android existant. Les nouvelles versions sont installées côte à côte avec les anciennes. Sur le poste du mainteneur, le JDK portable vérifié est conservé dans `C:/Users/jmsga/.jdks/jdk-27.0.1.0.3`, hors des dossiers de tests temporaires. Aucune variable système permanente n'a été modifiée.

[environment.ps1](../scripts/android/environment.ps1) recherche la version exacte du JDK dans NOVERA_ANDROID_JAVA_HOME, JAVA_HOME, les dossiers `.jdks`, puis Android Studio. Il refuse de choisir silencieusement une autre version. SDK/NDK, compilateurs ARM64 et drapeaux de liaison 16 Kio sont réglés pour le processus de compilation uniquement. Les commandes `sdkmanager` ci-dessous supposent les outils déjà installés et les licences acceptées par leur titulaire :

```powershell
sdkmanager --install 'platforms;android-37.2' 'build-tools;37.0.0' 'ndk;30.0.16248370'
rustup target add aarch64-linux-android --toolchain 1.98.0
```

Sources officielles : [JDK Oracle](https://www.oracle.com/java/technologies/downloads/), [SDK Android 17](https://developer.android.com/about/versions/17/setup-sdk), [NDK r30](https://developer.android.com/ndk/downloads), [Gradle 9.8.1](https://docs.gradle.org/9.8.1/release-notes.html), [Kotlin 2.4.21](https://kotlinlang.org/docs/releases.html).

### Configuration reproductible après initialisation

```powershell
## Générer le projet Android si nécessaire, puis appliquer les réglages Novera.
yarn prepare:android
## Diagnostic en lecture seule.
yarn check:android
## Tests de configuration, sans compilation de l'application.
yarn test:android
## Préparer le worker CPU ARM64 et ses bibliothèques.
yarn build:android:engine
```

[configure-project.ps1](../scripts/android/configure-project.ps1) appelle [configure-project.mjs](../scripts/android/configure-project.mjs). Les fichiers générés dans `src-tauri/gen/android` restent exclus du dépôt ; les scripts et modèles sont versionnés pour reproduire les réglages.

La configuration applique les versions à l'application, au wrapper Gradle et à buildSrc. Kotlin est déclaré **dans le build principal et dans les dépendances exportées par buildSrc**, afin qu'une ancienne dépendance transitive d'AGP ne prenne pas le dessus.

Les anciens blocs `kotlinOptions` sont remplacés par `kotlin.compilerOptions` typés. Les cibles de bytecode restent JVM 11 pour l'application et JVM 1.8 pour les modules Android Tauri. Le projet auxiliaire buildSrc cible JVM 21, tout en s'exécutant sous JDK 27. Le Kotlin embarqué dans Gradle pour ses propres scripts reste celui de Gradle ; il est distinct du plugin Android 2.4.21.

Les modules Android Tauri sont copiés dans le dossier généré `novera-plugins`, adaptés localement et accompagnés de leurs notices disponibles. Le cache Cargo n'est pas modifié. Un hook de settings rafraîchit ces copies après les fichiers régénérés par Cargo, puis vérifie le JAR Kotlin effectivement chargé. Les relances sont vérifiées sans duplication de blocs. Le lancement Rust depuis Gradle utilise ExecOperations, compatible avec Gradle 9.

### Moteur, fichiers et garde-fous

Le cache CMake du moteur inclut la version NDK dans son chemin. Un changement de NDK force ainsi une nouvelle construction native. Le script de préparation récupère le module CPU dans `ggml-prefix/bin` lorsque CMake l'y installe, contrôle AArch64 et l'alignement ELF à 16 Kio, conserve les licences et produit `.build/android-engine-manifest.json`.

L'application debug utilise un identifiant séparé `io.github.tronabs.novera.debug`. Les fichiers et sauvegardes restent privés ; les URI de documents sélectionnés sont prises en charge. Le lanceur n'active ni mises à jour automatiques, ni envoi de statistiques non configurées.

**Seule Novera-Desktop reste activée dans Compiler-Novera.bat.** `yarn build:android` et `yarn build:android:apk` passent par le point d'entrée gardé, en mode debug explicite. Android reste désactivé par défaut et les trois audits de [readiness.json](../scripts/android/readiness.json) restent ouverts. Un diagnostic peut signaler ces blocages même si des APK de test ont déjà été assemblées manuellement pour validation.

Les APK debug assemblées dans les essais antérieurs ne valident pas les derniers renommages et options du premier démarrage. Installation, reprise, stockage, secrets, téléchargement et génération doivent être vérifiés sur appareil. Les trois audits de dépendances, permissions et stockage restent ouverts ; le parcours gardé complet et la signature de production restent non validés. Les résultats historiques sont dans [CHANGELOG.md](CHANGELOG.md#history).

<a id="cli"></a>

## CLI locale

Le code de la CLI reste dans `src-tauri/novera-cli`. Pour une compilation locale
depuis la racine du dépôt :

```sh
cd src-tauri/novera-cli
cargo build --no-default-features --features cli --release
```

Le nom interne du binaire reste `jan` (`jan.exe` sous Windows). Le fichier de
configuration Cargo redirige la sortie vers `src-tauri/target/release/`.
Depuis la racine du dépôt, une fois la compilation effectuée :

```sh
./src-tauri/target/release/jan agent ui
```

Sous PowerShell, utiliser `./src-tauri/target/release/jan.exe agent ui`.
Le lanceur `novera-agent.sh` existant reste disponible pour les distributions
locales dont la CLI est déjà placée dans `src-tauri/resources/bin/`.

Les anciens installateurs distants Jan ont été retirés. Aucun canal de téléchargement Novera ne les remplace actuellement. Références : [CLI](agent/cli.md), [protocole](agent/protocol.md).

<a id="updates"></a>

## Mises à jour signées Novera

### Mises à jour : GitHub Releases et signature Novera

Le client utilise exclusivement le flux :

`https://github.com/TRON-ABS/Novera/releases/latest/download/latest.json`

Il utilise le plugin Tauri, sans proxy analytique, identifiant d’installation ni en-têtes HMAC Jan. Une compilation ordinaire garde l’updater désactivé. Pour une compilation de distribution, il faut **à la fois** une configuration contenant la clé publique Novera et le flux ci-dessus, et `NOVERA_ENABLE_UPDATER=true`. Le backend refuse d’enregistrer le plugin si le flux diffère ou si la clé est absente ; le plugin valide la clé et vérifie la signature des fichiers téléchargés. Aucun contournement de vérification n’est ajouté.

Le téléchargement signé est terminé avant l’arrêt des moteurs/outils. Si la vérification ou le téléchargement échoue, ils restent actifs. Si l’installation échoue après l’arrêt, un redémarrage des serveurs MCP est tenté.

#### Première mise en service

1. Le mainteneur génère sa paire de clés Tauri une seule fois, hors du dépôt, et conserve une sauvegarde privée. Exemple : `corepack yarn tauri signer generate -w "$env:LOCALAPPDATA/Novera/release-signing/novera.key"`. Créer le dossier au préalable. Ne jamais publier la clé privée ou son mot de passe ; conserver la même clé publique pour les versions futures. Le présent travail n’a pas créé cette clé.
2. Préparer la configuration publique avec `node scripts/updates/novera-update.mjs config --public-key CHEMIN/novera.key.pub --out .build/novera-updater.json`. Le fichier de sortie doit être nouveau. Les clés absentes, factices ou de format incorrect sont refusées.
3. Choisir une nouvelle version stable et synchroniser `web-app/package.json`, `src-tauri/Cargo.toml` et `src-tauri/tauri.conf.json`. Configurer `TAURI_SIGNING_PRIVATE_KEY` et, le cas échéant, `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` uniquement dans l’environnement de construction. Puis définir `$env:NOVERA_ENABLE_UPDATER='true'` et lancer `corepack yarn tauri build --config .build/novera-updater.json --bundles nsis`. Cette opération nécessite les dépendances, ressources et outils Windows de construction habituels.
4. Préparer le manifeste, par exemple : `node scripts/updates/novera-update.mjs manifest --version 1.0.1 --artifact CHEMIN/Novera_1.0.1_x64-setup.exe --signature CHEMIN/Novera_1.0.1_x64-setup.exe.sig --notes CHEMIN/notes.md --out .build/latest.json`. L’outil écrit aussi `.build/latest.json.sha256` pour l’installateur. Il refuse un exécutable portable, une version incohérente, une préversion ou une signature de format incorrect. Cette validation de structure ne remplace pas une vérification cryptographique de signature.
5. Tester l’installation, une mise à jour depuis la version précédente et un rejet de signature invalide sur un profil de test. Préparer un brouillon de release `v1.0.1` dans **TRON-ABS/Novera**, avec l’installateur, sa signature, `latest.json`, les empreintes et les notices. La publication finale reste une action du mainteneur, après validation. Aucun script ajouté ici ne téléverse de fichiers.

Le flux actuel préparé couvre **Windows x64 avec installateur NSIS**. Ajouter les autres plateformes seulement après leur construction et validation. Les chemins du manifeste sont fixés au dépôt Novera et au tag correspondant à la version. Une nouvelle publication doit avoir une version strictement supérieure à celle de l’application installée. Un commit source seul ne constitue pas une mise à jour distribuable.

La version portable actuelle exige une **première installation manuelle** de la version signée contenant la clé publique et l’updater activé. Elle ne se transforme pas en installation actualisable en recevant seulement un nouveau manifeste. Une signature Tauri d’update est distincte d’une signature de code Windows Authenticode ; aucune certification Windows n’est revendiquée ici.

Référence de format et de signature : [documentation officielle Tauri Updater](https://v2.tauri.app/plugin/updater/).

<a id="telemetry"></a>

## Configuration facultative de collecte

Par défaut, le lanceur ne configure aucune destination. Le paramètre desktop explicite suivant incorpore uniquement les deux valeurs publiques du fichier local ignoré `web-app/.env.local` :

```powershell
./scripts/distribution/build-novera-local.ps1 -WithTelemetry
```

`scripts/distribution/read-novera-telemetry.ps1` lit sans exécuter le contenu. Variables : `NOVERA_ANALYTICS_HOST` (origine HTTPS sans chemin, identifiants, paramètres ni fragment) et `NOVERA_ANALYTICS_PROJECT_KEY` (clé publique du projet, jamais une clé personnelle d’administration). Le lecteur refuse doublons, clés privées, hôtes Jan et destinations incorrectes ; aucun jeton ne doit figurer dans les journaux ou la documentation. Sans le paramètre, les variables sont vidées. Android garde sa configuration sans destination.

Les anciennes variables `POSTHOG_KEY`, `POSTHOG_HOST` et Google Analytics ne peuvent pas activer cette collecte. Incorporer une destination n’accorde aucun consentement. Les deux choix restent indépendants et désactivés par défaut ; [données, révocation et limites](USER_GUIDE.md#privacy). Le projet local de validation utilise la région Europe. Réception synthétique validée séparément du transport WebView : [preuves](CHANGELOG.md#history).

Pour vérifier la préparation sans réseau : `node --test scripts/__tests__/novera-update.test.mjs` et les suites de consentement/filtrage. Ces tests utilisent des données synthétiques, pas une clé de production ni une vraie mise à jour.

<a id="cleanup"></a>

## Nettoyage local

Refaire un inventaire avant toute suppression ; ne pas relancer aveuglément une ancienne liste de cibles. Conserver la version actuelle, une version précédente vérifiée, les preuves utiles et les données utilisateur. Ne jamais supprimer un dossier sur son seul âge ou son nom. Vérifier les références des scripts et comparer les empreintes des fichiers conservés. Les caches externes au projet et les outils installés nécessitent un examen distinct.

Vérifier les chemins absolus et l’absence de fichiers suivis, redirections, modèles et bases utilisateur dans les cibles. Effectuer les suppressions avec des chemins explicites dans le même shell PowerShell, après contrôle du périmètre. Garder le runtime courant, une version précédente vérifiée et les preuves utiles. Le retrait de documentation versionnée doit préserver les informations utiles et leurs liens.
