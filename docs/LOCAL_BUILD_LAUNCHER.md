# Lanceur local de compilation Novera

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

## Prérequis Windows et résultats

Le dépôt doit déjà avoir ses dépendances Yarn, ses extensions compilées, le moteur et les auxiliaires dans `src-tauri/resources`. Le lanceur ne remplace pas une préparation initiale du dépôt. Node.js/Corepack, la version Rust MSVC épinglée dans `rust-toolchain.toml`, Visual Studio Build Tools C++ et Windows SDK sont nécessaires. MSVC est recherché via `vswhere`.

Le cache Rust suit `CARGO_TARGET_DIR` s'il est défini ; sinon il utilise `C:\jb` lorsqu'il existe, puis `src-tauri/target`. Le build desktop est hors ligne et verrouillé pour Cargo : une dépendance non disponible doit être préparée séparément. Corepack peut nécessiter une première mise en cache de Yarn.

Les journaux sont dans `.build/launcher-<variante>-<date>`. Un résultat complet est créé dans **un nouveau dossier** `deliverables/Novera-desktop-<version>-<date>` ; il contient l'EXE, les ressources du moteur, Bun, uv, les licences et `SHA256SUMS`. Les modèles et conversations ne sont jamais copiés. Le dossier de l'application existante n'est pas remplacé. Un verrou empêche deux exécutions simultanées de ce lanceur ; il ne verrouille pas des builds externes lancés avec d'autres scripts. Les résultats locaux sont ignorés par Git.

Setup/MSI utilisent le bundler Tauri et leurs sorties sont copiées dans un nouveau dossier. Portable compile d'abord le desktop, puis utilise le packager existant sur ce nouveau runtime. Ces variantes restent désactivées, non signées par cette préparation et non validées comme distributions officielles. En cas d'échec, consulter le journal ; un dossier incomplet peut rester pour le diagnostic. Aucune suppression récursive de dossiers utilisateur n'est effectuée.

## Future APK

Voir [ANDROID_PREPARATION.md](ANDROID_PREPARATION.md) et [ANDROID_TOOLCHAIN.md](ANDROID_TOOLCHAIN.md). Les scripts intègrent JDK 27.0.1.0.3, SDK 37.2, NDK r30, Gradle 9.8.1, AGP 9.4.0 et Kotlin 2.4.21, avec contrôle du plugin réellement chargé. Des APK debug ARM64 ont été assemblées localement. Android reste désactivé dans le BAT et bloqué sur les audits ; le diagnostic ne télécharge ni ne compile rien. Les versions et fichiers générés se préparent explicitement avec `yarn prepare:android`. Les essais sur téléphone, la signature de production et le parcours gardé complet restent à valider.

Ces scripts de développement n'ajoutent pas de textes à l'interface de l'application. Les nouvelles fonctions visibles de Novera doivent toujours être traduites dans les 36 langues.
