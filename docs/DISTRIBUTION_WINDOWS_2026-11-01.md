# Distribution Windows x64 — 1er novembre 2026

## Origine des paquets

Le mainteneur a compilé et testé le desktop, puis confirmé « tout marche bien ». Il autorise ensuite la préparation du desktop, du portable et de l'installateur Windows, sans ses discussions. Les paquets sont préparés depuis ce runtime exact, sans nouvelle compilation de l'application :

- Version : **1.0.0**.
- Build ID : `1.0.0-2026-11-01_04-10-51-711`.
- Runtime source : `deliverables/Novera-desktop-1.0.0-2026-11-01_04-10-51-711`.
- SHA-256 de `Novera-Desktop.exe` : `8ef7dc04470dcc33abc7cd45d81bebb456af49c067c663daa07faa09c21c49e5`.

Le reçu du build indique les diagnostics facultatifs configurés, avec consentement désactivé par défaut. Les maps privées restent dans `.build/monitoring-symbols/` ; elles ne sont pas distribuées. Le reçu conserve l'identité et l'état des sources utilisés lors de la compilation ; les commits de publication ultérieurs ne réécrivent pas cette provenance.

## Contenu propre

Les résultats locaux sont regroupés sous `deliverables/Novera-Windows-1.0.0-2026-11-01/`, dossier ignoré par Git. Le desktop comporte **94 fichiers / 1 872 746 958 octets**, uniquement l'application, ses moteurs, outils, ressources et notices. L'inventaire de fichiers et les empreintes sont conservés dans `runtime-inventory.json`.

Aucune discussion, clé API, base utilisateur, profil personnel, poids de modèle, journal ou map privée n'est inclus. Les données présentes sur le PC du mainteneur ne sont ni supprimées ni copiées. Sur un PC ayant déjà utilisé Novera, l'application peut retrouver son profil existant : cela ne signifie pas que les discussions sont dans le paquet. Le portable ne stocke pas les données à côté de l'EXE ; il réutilise le profil habituel.

Le ZIP portable est produit avec `scripts/package-windows-portable.ps1 -RuntimeDir <runtime-source> -OutputDir <sortie-portable>`. Ses **96 entrées**, les empreintes du manifeste et de `SHA256SUMS`, et la correspondance de tous les fichiers du runtime sont vérifiées. Le binaire principal est identique au desktop testé.

| Paquet | Emplacement local | Taille |
| --- | --- | ---: |
| Desktop | `desktop/Novera-Desktop.exe`, avec tout son dossier | 1 872 746 958 octets au total |
| Portable | `portable/Novera_1.0.0_x64-portable.zip` | 1 337 284 496 octets |
| Installateur | `installer/Novera_1.0.0_x64-setup.exe` | 812 961 689 octets |

SHA-256 du ZIP : `c771b5e6ab47c1385ac3d435656a3484629d9998f20dce271ddb0268da904db1`.

SHA-256 de l'installateur : `6ea228d38ae7a0d9cb14d24d2c7f1d7fc6a23bfa91ef4591cd6dba4735d7963c`.

L'installateur NSIS est préparé avec **Tauri `bundle`**, sans `build`, dans un répertoire cible privé. Sa configuration remplace les ressources par les 93 fichiers annexes du desktop propre et utilise son EXE exact. Installation par utilisateur, choix anglais/français et bootstrapper officiel Microsoft WebView2 embarqué. La signature Authenticode de ce bootstrapper est valide, éditeur Microsoft Corporation. L'installation de WebView2 nécessite Internet lorsqu'il est absent. Visual C++ x64 reste un prérequis distinct à installer s'il manque.

Le bundler signale l'absence de la variable `__TAURI_BUNDLE_TYPE` dans le binaire déjà compilé : aucun marquage n'est ajouté et son empreinte reste identique. Les mises à jour automatiques sont désactivées ; cette préparation ne prétend pas valider un futur updater. Le plugin NSIS en cache a été retéléchargé et son hash vérifié par Tauri avant la création réussie de l'installateur.

Extraction indépendante avec 7-Zip 26.05 réussie : **102 fichiers**, dont les **94 fichiers du runtime strictement identiques** par SHA-256. Les huit ajouts sont le désinstallateur, six ressources/plugins NSIS et le bootstrapper Microsoft WebView2, lui aussi identique à la copie signée contrôlée. Aucun fichier utilisateur supplémentaire. Le dossier de distribution contient `validation.json`, un mode d'emploi français/anglais et un `SHA256SUMS` global couvrant chaque fichier livré ; les manifestes internes du desktop et du portable restent conservés. L'installateur n'a pas été exécuté sur le profil du mainteneur.

## Installation et prérequis

Conserver le dossier desktop complet ou extraire entièrement le ZIP avant lancement. Windows x64, Microsoft Edge WebView2, Visual C++ x64 et des pilotes compatibles avec les moteurs choisis restent requis. Le [redistribuable Visual C++ officiel](https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist?view=msvc-170) est un prérequis système, distinct des environnements Python privés. Les profils Python/PyTorch facultatifs ne sont installés qu'après confirmation dans Configurations ; aucune pile desktop n'est ajoutée au mobile.

## Publication des sources et vitrine

Les sources et la capture originale sont publiées sur `main` : `ac00242546a1ab8c6b484d372b74af65f14d4902` puis `56e4b70ea6cb3cb928a75e711b988882a559fd3c`. La description GitHub mentionne les composants privés Windows, tout en conservant les 80 langues, 42 fournisseurs et 49 préréglages. Les deux README présentent la nouvelle capture, un message souhaitant une belle aventure avec Novera et la signature **TRON-ABS — The art of Human with AI**.

Le message de bienvenue est publié dans `adfe296aa61eda066cb49e5a95645f2ef4df5ba7`. Lecture des deux README et du blob image depuis l'API GitHub : contenu et empreintes conformes, signature et souhait présents ; homepage conservée et Actions toujours désactivé.

Contrôles complémentaires de ce lot : lint complet `node node_modules/eslint/bin/eslint.js . --quiet` réussi depuis `web-app` ; les **28 tests** de `src/modules/conversations/__tests__/export.test.ts` passent. Le commentaire ESLint du nettoyeur de noms de fichiers explique la suppression volontaire des caractères de contrôle, sans changement du comportement.

## Limites avant release publique

Les binaires Novera restent **non signés**. Les empreintes garantissent leur intégrité, pas l'identité de l'éditeur. Aucun tag, binaire de release publique, activation d'Actions ou certification CI n'est créé par cette préparation. Une signature de production et les essais d'installation/lancement/désinstallation sur un Windows neuf restent à réaliser. L'envoi privé des maps de ce build est encore en attente. La confirmation manuelle du mainteneur ne certifie pas chaque profil GPU, moteur ou plateforme ; voir les suivis de validation existants. Python/PyTorch dans l'EXE reste reporté à sa demande.
