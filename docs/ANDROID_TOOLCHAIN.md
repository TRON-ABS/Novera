# Chaîne Android Novera — versions intégrées

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

Il s'agit d'une combinaison validée localement à la compilation. La [matrice JetBrains](https://kotlinlang.org/docs/gradle-configure-project.html) indique pour Kotlin 2.4.21 une plage entièrement prise en charge allant jusqu'à Gradle 9.7 et AGP 9.3.1. Les versions retenues sont plus récentes : aucune validation officielle de cette combinaison par JetBrains n'est revendiquée. Les essais sur téléphone restent nécessaires.

## Installation et sélection des outils

Le SDK reste dans son dossier Android existant. Les nouvelles versions sont installées côte à côte avec les anciennes. Sur le poste du mainteneur, le JDK portable vérifié est conservé dans `C:/Users/jmsga/.jdks/jdk-27.0.1.0.3`, hors des dossiers de tests temporaires. Aucune variable système permanente n'a été modifiée.

[environment.ps1](../scripts/android/environment.ps1) recherche la version exacte du JDK dans NOVERA_ANDROID_JAVA_HOME, JAVA_HOME, les dossiers `.jdks`, puis Android Studio. Il refuse de choisir silencieusement une autre version. SDK/NDK, compilateurs ARM64 et drapeaux de liaison 16 Kio sont réglés pour le processus de compilation uniquement. Les commandes `sdkmanager` ci-dessous supposent les outils déjà installés et les licences acceptées par leur titulaire :

```powershell
sdkmanager --install 'platforms;android-37.2' 'build-tools;37.0.0' 'ndk;30.0.16248370'
rustup target add aarch64-linux-android --toolchain 1.98.0
```

Sources officielles : [JDK Oracle](https://www.oracle.com/java/technologies/downloads/), [SDK Android 17](https://developer.android.com/about/versions/17/setup-sdk), [NDK r30](https://developer.android.com/ndk/downloads), [Gradle 9.8.1](https://docs.gradle.org/9.8.1/release-notes.html), [Kotlin 2.4.21](https://kotlinlang.org/docs/releases.html).

## Configuration reproductible après initialisation

```powershell
# Générer le projet Android si nécessaire, puis appliquer les réglages Novera.
yarn prepare:android
# Diagnostic en lecture seule.
yarn check:android
# Tests de configuration, sans compilation de l'application.
yarn test:android
# Préparer le worker CPU ARM64 et ses bibliothèques.
yarn build:android:engine
```

[configure-project.ps1](../scripts/android/configure-project.ps1) appelle [configure-project.mjs](../scripts/android/configure-project.mjs). Les fichiers générés dans `src-tauri/gen/android` restent exclus du dépôt ; les scripts et modèles sont versionnés pour reproduire les réglages.

La configuration applique les versions à l'application, au wrapper Gradle et à buildSrc. Kotlin est déclaré **dans le build principal et dans les dépendances exportées par buildSrc**, afin qu'une ancienne dépendance transitive d'AGP ne prenne pas le dessus.

Les anciens blocs `kotlinOptions` sont remplacés par `kotlin.compilerOptions` typés. Les cibles de bytecode restent JVM 11 pour l'application et JVM 1.8 pour les modules Android Tauri. Le projet auxiliaire buildSrc cible JVM 21, tout en s'exécutant sous JDK 27. Le Kotlin embarqué dans Gradle pour ses propres scripts reste celui de Gradle ; il est distinct du plugin Android 2.4.21.

Les modules Android Tauri sont copiés dans le dossier généré `novera-plugins`, adaptés localement et accompagnés de leurs notices disponibles. Le cache Cargo n'est pas modifié. Un hook de settings rafraîchit ces copies après les fichiers régénérés par Cargo, puis vérifie le JAR Kotlin effectivement chargé. Les relances sont vérifiées sans duplication de blocs. Le lancement Rust depuis Gradle utilise ExecOperations, compatible avec Gradle 9.

## Moteur, fichiers et garde-fous

Le cache CMake du moteur inclut la version NDK dans son chemin. Un changement de NDK force ainsi une nouvelle construction native. Le script de préparation récupère le module CPU dans `ggml-prefix/bin` lorsque CMake l'y installe, contrôle AArch64 et l'alignement ELF à 16 Kio, conserve les licences et produit `.build/android-engine-manifest.json`.

L'application debug utilise un identifiant séparé `io.github.tronabs.novera.debug`. Les fichiers et sauvegardes restent privés ; les URI de documents sélectionnés sont prises en charge. Le lanceur n'active ni mises à jour automatiques, ni envoi de statistiques non configurées.

**Seule Novera-Desktop reste activée dans Compiler-Novera.bat.** `yarn build:android` et `yarn build:android:apk` passent par le point d'entrée gardé, en mode debug explicite. Android reste désactivé par défaut et les trois audits de [readiness.json](../scripts/android/readiness.json) restent ouverts. Un diagnostic peut signaler ces blocages même si des APK de test ont déjà été assemblées manuellement pour validation.

## Validation et limites

Les essais successifs ont assemblé des APK debug ARM64 avec SDK 37.2, JDK 27, NDK r30 et Kotlin 2.4.21. Le moteur et la bibliothèque Android ont été reconstruits avec r30 ; les six fichiers natifs, dépendances, alignement 16 Kio, manifeste et signature debug sont contrôlés. Les vérifications d'intégration utilisent le projet principal configuré par les scripts versionnés.

Validation des sources intégrées : **3 tests de configuration**, **70 assertions sous chacun de PowerShell 5.1 et 7**, **7 tests d'architecture** et **13 fichiers de modules** vérifiés. Assemblage du projet principal réussi (111 tâches exécutées, 23 à jour), préparation du moteur par le script maintenu réussie, puis actualisation du paquet avec ces sorties (6 tâches exécutées, 128 à jour). Le frontend et la bibliothèque native de l'application proviennent de l'essai NDK r30 déjà validé ; le moteur et ses bibliothèques sont préparés par le script intégré. Le compilateur Maven Central préchargé et vérifié a été fourni au contrôle d'intégration pour éviter un nouveau téléchargement lent ; les scripts du projet conservent leurs dépôts normaux.

APK locale issue de cette intégration : version **1.0.0-debug**, **50 408 405 octets**, SHA-256 `B3355AE6AC41F289F3894FD9CFAE1E646E8D8459FA823719BA426E410C25E8A8`. Vérification enregistrée dans `.build/android-toolchain-integration-2026-10-24/verification.json`. Le binaire Windows est inchangé.

Preuves locales : `.build/android-sdk-latest-test-2026-10-24/`, `.build/android-jdk-latest-test-2026-10-24/`, `.build/android-ndk-r30-test-2026-10-24/`, `.build/android-kotlin-2.4.21-test-2026-10-24/` et `.build/android-toolchain-integration-2026-10-24/`. Les journaux et binaires sont locaux et exclus du dépôt.

L'initialisation, la préparation du moteur et l'assemblage Gradle sont des étapes distinctes. Le parcours gardé complet `build-apk.ps1` reste bloqué sur les audits et n'est pas présenté comme validé de bout en bout. Installation, démarrage, accès aux fichiers, reprise, téléchargement et génération locale doivent encore être vérifiés sur téléphone. Aucune signature de production, release publique ou CI distante n'est créée par cette intégration.
