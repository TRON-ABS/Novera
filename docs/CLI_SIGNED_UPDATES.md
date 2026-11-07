# Canal signé de la CLI Novera

## État au 7 novembre 2026 : installation manuelle de la CLI actuelle

La CLI actuelle **Novera 1.0.1** est publiée pour Windows x64, Linux x64 et macOS Apple Silicon dans la [publication officielle](https://github.com/TRON-ABS/Novera/releases/tag/v1.0.1-cli-novera). Elle utilise `novera.exe` sous Windows, `novera` sur les autres hôtes et le manifeste signé `latest-novera-cli.json`.

Le passage depuis l’ancienne CLI `jan` 1.0.0 nécessite une **installation manuelle du paquet actuel** : son ancien mécanisme impose des fichiers sous la publication `v1.0.1`, déjà immuable. Le serveur refuse leur ajout. Les paquets de compatibilité préparés et vérifiés ne sont donc pas publiés ; aucune migration automatique 1.0.0 → 1.0.1 n’est annoncée comme validée.

1. Télécharger l’archive correspondant au système depuis la publication officielle et vérifier les empreintes et la signature publiées.
2. Fermer l’ancienne CLI. Extraire le nouveau paquet dans un dossier dédié sans écraser les discussions, les modèles ou le profil utilisateur.
3. Ajouter ce dossier au `PATH` ou lancer directement le nouvel exécutable. Adapter les raccourcis et scripts qui appelaient `jan` pour qu’ils appellent `novera`.
4. Exécuter `novera --version` : le résultat doit être `novera 1.0.1`. Puis `novera update --check` pour contrôler le canal actuel.

Conserver le profil et l’ancien exécutable en sauvegarde tant que ses usages n’ont pas été contrôlés. Cette installation n’affirme pas que les anciens répertoires de profil `jan` sont migrés automatiquement.

Les sections suivantes conservent l’historique des premiers essais du canal signé ; leurs versions et identifiants ne décrivent pas la publication actuelle.

Le canal est **public et vérifié pour Windows x64 et Linux x64 depuis le 2 novembre 2026**. La CLI macOS reste interne. [Disponibilité et preuves actuelles](LAUNCH_STATUS.md). Les anciens binaires CLI, compilés sans cette option, refusent toujours les mises à jour automatiques.

Le [run 41341759700](https://github.com/TRON-ABS/Novera/actions/runs/41341759700), commit `78678bf6`, réussit sur **Windows x64, Linux x64 et macOS Apple Silicon**. Les trois artefacts sont téléchargés : onze empreintes chacun, architecture native, clé publique réellement embarquée et identité interne version/platform/commit vérifiées. La signature cryptographique est recontrôlée indépendamment avec la clé épinglée. Les reçus du runner confirment le refus d’une archive altérée, le remplacement du fichier et l’exécution du binaire remplacé, avec témoin de profil préservé.

| Hôte CLI | État vérifié |
| --- | --- |
| Linux x64 | Remplacement signé et exécution réussis ; artefact `13097997692`, onze empreintes contrôlées. |
| macOS ARM64 | Remplacement signé et exécution réussis ; artefact `13098367758`, onze empreintes contrôlées. |
| Windows x64 | Remplacement signé et exécution réussis ; artefact `13098069269`, onze empreintes contrôlées. |

Les archives signées ont les SHA-256 `a2bb4f61d3a5662afbf4d9b8de7804ee9643fd134d7c60473a7c2cf14ae67e9d` (Linux), `e29abbdb8fe9ac1f1b5d292d22f03713e1fd29f3c4b315f751bc2a34ac7ad55f` (macOS ARM64) et `50be6f3d48711ecb1142c791034d1d1198d52b852da7b6c80f437119f553176d` (Windows). Les premiers essais avaient révélé une conversion de fin de ligne de la fixture puis un chemin relatif passé à Cargo ; les deux corrections sont incluses. Les signatures restent strictement exigées.

La fonctionnalité Cargo `signed-updates` de `novera-cli` sélectionne uniquement le manifeste officiel `https://github.com/TRON-ABS/Novera/releases/latest/download/latest-cli.json`. Elle utilise la clé publique déjà épinglée pour les bundles desktop. Les archives prises en charge sont Windows x64, Linux x64 et macOS Apple Silicon.

Chaque ZIP contient l’exécutable et `CLI-UPDATE.json`, avec version, architecture, commit et empreinte du binaire. La signature Minisign couvre les deux fichiers. Le client vérifie la signature, l’empreinte de l’archive, l’identité interne et le format natif avant d’écrire un fichier de remplacement. Un ancien paquet signé ne peut pas être renommé pour simuler une version supérieure. Les rétrogradations sont refusées, même avec une mise à jour forcée. Windows conserve l’ancien exécutable dans une sauvegarde distincte ; les autres hôtes utilisent un renommage atomique.

Le workflow manuel `target=cli, signed_updates=true` compile uniquement les trois CLI, signe leurs archives finales avec les secrets Actions Novera existants et produit `CLI-UPDATER-READINESS.json`. Ce reçu prouve la signature du paquet ; le reçu distinct `CLI-INSTALL-VALIDATION.json` rapporte le remplacement isolé réellement effectué. Aucun de ces reçus ne certifie l’endpoint de production ni une transition entre deux versions publiées. Aucun `latest-cli.json` public n’est produit par ce workflow.

Avant toute diffusion, contrôler indépendamment les archives et les architectures, exercer le remplacement dans un environnement dédié sur chaque hôte et valider la disponibilité du manifeste et des fichiers de la version. Voir [le protocole général](INSTALL_UPDATE_VALIDATION.md). Les canaux des applications mobiles et du Web demandent leurs propres preuves.

## Préparer le manifeste hors publication

`scripts/distribution/prepare-cli-feed.mjs` exige les trois preuves indépendantes, recontrôle chaque signature et ouvre l’identité à l’intérieur du ZIP authentifié. Il refuse les versions non stables, mauvais hôtes/architectures, reçus incomplets, empreintes divergentes et plateformes manquantes ou dupliquées. Il produit des URLs strictes sous `TRON-ABS/Novera/releases/download/vVERSION/` et refuse d’écraser une sortie existante.

```powershell
node scripts/distribution/prepare-cli-feed.mjs 1.0.0 CHEMIN/latest-cli.json PREUVE_LINUX.json PREUVE_MACOS.json PREUVE_WINDOWS.json
```

Le manifeste public `1.0.0` couvre les deux archives Windows/Linux retenues. Feed, URLs, empreintes et signatures de production sont vérifiés ; une transition entre deux versions publiées reste à exercer lors de la prochaine sortie. Le remplacement d’un témoin synthétique par le vrai binaire ne prétend pas tester le processus complet d’auto-remplacement d’une CLI en cours d’utilisation.
