# Préparation de la future APK Novera

État vérifié le **24 octobre 2026** : **outillage installé, projet Gradle généré, contrôle Rust mobile réussi et worker CPU ARM64 compilé**. Aucune APK complète n'a encore été produite ou installée sur téléphone. Le lanceur conserve `NOVERA_BUILD_ANDROID=0` ; seule Novera-Desktop est activée.

La priorité retenue est l'**IA locale sur téléphone avec des modèles légers**. Le portage reste en cours : la compilation du worker ne prouve pas encore que la génération fonctionne dans une application Android.

## Environnement local préparé

Les versions sont centralisées dans [toolchain.json](../scripts/android/toolchain.json). Android Studio déjà installé est réutilisé.

| Élément | État local |
| --- | --- |
| Java | JDK 21.0.11 dans `C:/Users/jmsga/.jdks/jbr-21.0.11`, distinct du JBR 25 de Studio |
| SDK | `C:/Users/jmsga/AppData/Local/Android/Sdk` ; plateforme Android 36 et Build-Tools 36.0.0 |
| Command-line Tools | Version 15859902 installée après vérification SHA-256 de l'archive officielle |
| NDK | Version 27.2.12479018 installée |
| Rust | Toolchain 1.98.0, cible `aarch64-linux-android` installée |
| Gradle | Projet généré dans `src-tauri/gen/android` ; lecture de version réussie avec Gradle 8.14.3 et Java 21 |
| Architecture initiale | ARM64, ABI Android `arm64-v8a` ; autres architectures non validées |

[environment.ps1](../scripts/android/environment.ps1) sélectionne ces outils et règle l'environnement du processus sans modifier les variables persistantes du système. CMake et Ninja sont recherchés parmi les installations existantes.

Le projet généré utilise `io.github.tronabs.novera`, compile/target SDK 36 et minimum SDK 24. Ces paramètres ne constituent pas une validation de compatibilité sur les appareils. La configuration prévoit un identifiant distinct `io.github.tronabs.novera.debug` pour les futurs essais debug.

## Adaptations présentes dans les sources

- Sélection mobile explicite : `--no-default-features --features mobile`. La feature desktop reste le défaut du projet Windows et doit être exclue pour Android.
- Dépendances desktop isolées, notamment `rfd`, `machine-uid` et TLS natif ; prise en charge mobile des plugins de fichiers, dialogues et matériel.
- Données et base vectorielle dans le dossier privé de l'application ; lecture et écriture des URI Android `content://` pour les documents sélectionnés.
- Clé aléatoire locale pour le chiffrement des secrets dans le stockage privé. L'intégration au Keystore matériel Android n'est pas réalisée ; aucune protection matérielle n'est revendiquée.
- Permissions mobiles resserrées : retrait des origines IPC distantes et du lancement shell. Le manifeste généré désactive les sauvegardes Android et limite le FileProvider aux dossiers d'export privés.
- Modèle d'accueil Android : **LFM2.5-1.2B-Instruct Q4_K_M**, contexte initial de **4 096 jetons**. Le choix desktop reste distinct. Vitesse, mémoire et chauffe sur téléphone ne sont pas encore mesurées.
- Worker local CPU séparé, prévu dans les bibliothèques natives installées de l'APK ; un seul modèle chargé et cache de slots désactivé sur Android. Conditionnement et exécution sur téléphone restent à vérifier.
- Le Hub utilise désormais **« Adapté à mon matériel »**, traduit dans les 36 langues. Toute évolution visible doit continuer à être traduite dans toutes les langues prises en charge.

Les mises à jour automatiques restent désactivées dans l'environnement Android préparé. Aucun service de statistiques n'est configuré : les envois restent désactivés et leur éventuelle activation devra respecter l'accord explicite de l'utilisateur.

## Validations obtenues et preuves locales

| Vérification | Résultat et limite |
| --- | --- |
| Contrôle Rust Android de l'application | Commande ci-dessous réussie avec avertissements ; ce n'est pas un assemblage APK |
| Worker ARM64 | Build release de `src-tauri/android-worker/Cargo.toml` réussi ; aucune exécution sur appareil |
| Projet Gradle | Génération et lecture de version réussies ; build complet non validé |
| Traductions du libellé Hub | 42 tests ciblés réussis et contrôle des 36 catalogues sans erreur |

```powershell
cargo check --locked --lib --manifest-path src-tauri/Cargo.toml --no-default-features --features mobile --target aarch64-linux-android
```

Journaux locaux dans `.build/android-completion-2026-10-24/` : `android-init-final.log`, `gradle-version.log`, `native-check.log` et `worker-build.log`. Ces preuves sont locales, sans CI distante ni publication. Le worker utilise la révision llama.cpp épinglée `5c19a5a7560024bb19745b4ae04a75613d4b9aa3`.

## Scripts disponibles

Depuis la racine du dépôt :

```powershell
# Diagnostic : ne compile ni n'installe l'application.
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/android/check-android.ps1

# Initialisation si nécessaire, puis réapplication des réglages Novera.
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/android/initialize-project.ps1

# Compilation et préparation des bibliothèques natives, encore à valider de bout en bout.
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/android/build-engine.ps1
```

Le diagnostic est également accessible par `Compiler-Novera.bat /android-check`. Il contrôle les outils, le projet Gradle, les features mobiles, la présence des bibliothèques natives et les indicateurs d'audit de [readiness.json](../scripts/android/readiness.json). Un diagnostic favorable ne remplacera pas les essais sur téléphone.

[configure-project.ps1](../scripts/android/configure-project.ps1) réapplique les versions épinglées, l'identifiant debug, les réglages du manifeste, le lancement Node et les chemins de partage après une initialisation Tauri. Les scripts conservent les réglages à réappliquer aux fichiers générés.

[build-engine.ps1](../scripts/android/build-engine.ps1) prévoit la compilation du worker, la copie des bibliothèques ARM64 et le contrôle de l'alignement ELF à 16 Kio, puis un manifeste d'empreintes. Cette chaîne complète n'a pas encore été exécutée avec succès : aucun manifeste `.build/android-engine-manifest.json` n'est présent et les bibliothèques JNI ne sont pas encore préparées dans le projet.

## Travail restant avant la première APK de test

1. Terminer et vérifier la préparation des cinq bibliothèques natives : worker, `libggml.so`, `libggml-base.so`, `libggml-cpu.so` et `libc++_shared.so`. Contrôler architecture, dépendances, alignement et licences dans le contenu final de l'APK.
2. Achever les audits des dépendances, permissions et stockage. Les trois indicateurs de `readiness.json` restent **false** : les adaptations écrites ne valent pas validation finale. Vérifier notamment l'accès au service matériel et les opérations de fichiers sur Android ; la sélection de dossier n'est pas encore disponible dans l'adaptateur mobile.
3. Finaliser [build-apk.ps1](../scripts/android/build-apk.ps1) : orchestration des étapes, mode debug explicite pour les premiers essais, journaux et empreinte du livrable. Le script actuel reste désactivé et bloqué par le diagnostic ; il n'a pas encore validé un build APK complet.
4. Assembler l'APK ARM64, contrôler son manifeste et ses bibliothèques, puis vérifier installation, démarrage et génération locale sur appareil réel. Tester téléchargement des modèles, export/annulation, clavier, retour système, petits écrans, arrière-plan/reprise et manque de mémoire.
5. Définir séparément signature et distribution release. Aucune clé de production ni publication Google Play n'a été préparée. L'AAB constitue une étape distincte de l'APK de test.

Le détail des critères fonctionnels reste dans [A_FAIRE.md](../A_FAIRE.md). La préparation actuelle n'a pas remplacé l'exécutable Windows ni modifié les modèles et conversations existants.
