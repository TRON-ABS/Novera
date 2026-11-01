# Canal signé de la CLI Novera

Le canal est **en validation**, sans publication ni manifeste public. Les anciens binaires CLI, compilés sans cette option, refusent toujours les mises à jour automatiques.

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

Un manifeste `1.0.0` couvrant les trois archives réellement vérifiées est préparé localement, sans transfert. Aucun `latest-cli.json` public n’est activé ; disponibilité du feed/URLs de production et transition entre deux versions publiées restent à vérifier. Le remplacement d’un témoin synthétique par le vrai binaire ne prétend pas tester le processus complet d’auto-remplacement d’une CLI en cours d’utilisation.
