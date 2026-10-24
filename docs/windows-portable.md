# Novera — Windows x64 sans installation

Adaptation locale de notre [contribution Jan #9302](https://github.com/janhq/jan/pull/9302), le 24 octobre 2026. Le paquet s’appelle `Novera_<version>_x64-portable.zip`, avec variantes `Novera-beta` et `Novera-nightly`.

## Utilisation

Extraire **tout** le ZIP dans un dossier accessible en écriture, puis lancer `Novera-Desktop.exe` (ou son nom de canal). Conserver `resources/`, Bun, uv et les DLL avec l’exécutable. Les modèles ne sont pas fournis.

La machine doit disposer de Microsoft Edge WebView2 Runtime et du runtime Microsoft Visual C++ x64. Les pilotes compatibles restent nécessaires à l’accélération GPU. Le paquet reprend les backends du build fourni, sans les remplacer ni les télécharger pendant le packaging.

Il s’agit d’une application **sans installation**. Les réglages, discussions et modèles restent dans le profil Novera habituel, normalement `%APPDATA%/Novera`. Ce ZIP ne déplace pas ces données sur une clé USB. Fermer l’application et extraire le nouveau ZIP complet dans un nouveau dossier pour changer de version. Les mises à jour automatiques restent désactivées.

## Préparer le ZIP en local

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

## Contenu et intégrité

- Exécutable desktop Novera x64, worker llama.cpp, DLL des backends, Bun et uv.
- Licences et attributions d’origine, identité et règles des versions officielles.
- `README.txt`, `portable-manifest.json` et `SHA256SUMS` dans l’archive ; empreinte du ZIP dans son fichier `.sha256` adjacent.

L’inventaire décrit les tailles et empreintes des fichiers de charge utile. `SHA256SUMS` inclut aussi le manifeste, sans chercher à se hacher lui-même. Aucun profil utilisateur, historique, identifiant, modèle ou fichier arbitraire du dossier d’entrée n’est copié.

Les fichiers sont triés, les dates ZIP fixées et les textes générés encodés en UTF-8 sans BOM. Deux passages avec les mêmes entrées dans le même runtime PowerShell/.NET produisent la même archive. La compression peut différer entre versions de .NET ; aucune identité binaire entre PowerShell 5.1 et 7 n’est garantie.

Les dépendances absentes ou vides, les PE d’une autre architecture, l’absence de backend CPU, les bibliothèques CUDA incomplètes et les chemins de ressources sortant du dossier attendu sont refusés. Un échec avant remplacement conserve le ZIP précédent. Seul le staging créé pour l’opération est supprimé, après vérification de son chemin absolu. Les chemins relatifs suivent le dossier PowerShell courant.

Une empreinte assure l’intégrité, sans authentifier l’éditeur. Le paquet local est non signé et ne constitue pas une release officielle publiée ; voir [OFFICIAL_RELEASES.md](../OFFICIAL_RELEASES.md).

## CI Novera préparée, sans exécution

Le mainteneur a explicitement autorisé **la préparation** des workflows manuels le 24 octobre 2026, après refus automatique des étapes historiques de publication. Ni activation d’Actions, ni déclenchement de workflow, ni publication distante n’ont été effectués.

- [Manual Windows portable build](../.github/workflows/manual-build-portable.yml) : sources Novera sélectionnées, version prise dans ces sources, canal stable/beta/nightly, backend CPU ou Vulkan, compilation sans installateurs puis stockage du ZIP et de son empreinte comme artefact du job.
- [Packaging tests](../.github/workflows/windows-portable-tests.yml) : tests sous Windows PowerShell 5.1 et PowerShell 7, sans compiler l’application.

Ces workflows ont uniquement `contents: read`, ne reçoivent aucun secret, ne publient aucune release et n’utilisent pas le workflow distant de Jan. Les identifiants de dépôt ne sont pas conservés par checkout. Le code sélectionné doit déjà contenir le packager Novera. Il n’y a aucun déclenchement automatique sur push ou PR.

La préparation de canal travaille dans le checkout du job, avec des chemins absolus ; elle adapte les noms de produit, l’identifiant et la cible Cargo, sans changer les versions des dépendances. La configuration de l’updater et ses artefacts restent désactivés. La chaîne historique de publication Windows reste inchangée et n’est pas appelée par ce workflow portable. Signature et release publique constituent un travail distinct.

## Validation initiale du packaging — avant recompilation

- **223 assertions, 12 scénarios** sous Windows PowerShell 5.1 et sous PowerShell 7 : canaux, chemins avec espaces/relatifs, dépendances, architecture, inventaire, empreintes, remplacement propre, refus des entrées invalides et exclusion des données privées. Fichiers PE de test synthétiques, jamais exécutés.
- Actionlint sans erreur pour les deux workflows préparés ; contrôles des permissions, déclencheurs, absence de secrets/publication ; cinq scénarios de préparation CI sur fixtures et analyse syntaxique PowerShell.
- ZIP de validation de l’exécutable existant : **33 fichiers**, tous les éléments de charge utile et leur manifeste vérifiés ; original et sauvegarde de 32 fichiers inchangés.
- Sources de l’application non recompilées. La suite web précédente reste à **4 975 tests réussis, 2 ignorés** ; elle n’a pas été relancée pour ce changement de packaging.

Le ZIP local est dans [deliverables/Novera-portable-validation-1.0.0-2026-10-24](../deliverables/Novera-portable-validation-1.0.0-2026-10-24). Il reprend le build du **23 octobre 2026**, antérieur à la détection de langue, à la restructuration modulaire et aux nouvelles commandes de discussion. Ce n’est pas un nouveau build des dernières sources.

Un démarrage du ZIP extrait est testé avec un profil isolé et un PATH sans outils de développement ; résultat détaillé dans les preuves locales. Cela ne remplace pas un essai sur PC propre : installation des prérequis, extraction, interface, génération CPU/GPU et gestion de version restent à valider avant distribution publique. Aucun workflow distant n’a été exécuté et aucune signature de release n’a été validée.

Preuves locales : `.build/novera-portable-2026-10-24/verification.json`.

## Développement et tests

```powershell
yarn test:portable:win32
# ou
pwsh -NoProfile -File scripts/tests/package-windows-portable.Tests.ps1
```

L’implémentation appartient à [Distribution](../scripts/distribution/package-windows-portable.ps1) ; [scripts/package-windows-portable.ps1](../scripts/package-windows-portable.ps1) conserve le point d’entrée simple. Les contrôles de frontière JS/TS ne couvrent pas PowerShell : celui-ci est vérifié par son parseur et ses tests Windows.

## Nouveau build local — 24 octobre 2026

Un nouveau ZIP a ensuite été assemblé depuis **les dernières sources recompilées**, avec la détection de langue, les modules et les commandes de discussion : [ZIP actuel](../deliverables/Novera-Portable-local-1.0.0-build-2026-10-24_03-26-05/Novera_1.0.0_x64-portable.zip), 563 340 637 octets, 33 fichiers. SHA-256 : `00377ea53501acfd30e78ed8cfafd8989e87514e9728877462feffda66c442ca`. Le binaire inclus correspond à celui du dossier local courant, SHA-256 `B682ADF50B626792CFBFA729C4D06B178D7A46B47FCB73063693A21B1C84D55B`. Les empreintes du manifeste et du ZIP sont vérifiées ; le dossier précédent est sauvegardé. Les limites de signature, d’exécution CI, d’essai sur PC propre et d’inférence demeurent. Preuves : `.build/novera-local-build-2026-10-24_03-26-05/verification.json`.
