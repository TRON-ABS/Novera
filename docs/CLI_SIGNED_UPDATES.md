# Canal signé de la CLI Novera

Le canal est **en validation**, sans publication ni manifeste public. Les anciens binaires CLI, compilés sans cette option, refusent toujours les mises à jour automatiques.

Le premier job Linux compile et signe son archive, puis son test de signature publique détecte une conversion de fin de ligne dans la fixture versionnée. Les octets originaux authentifiés sont désormais conservés dans un fichier binaire ; leur signature passe le vérificateur Node avec la clé épinglée. La validation du remplacement CLI reste à obtenir sur les trois hôtes. La signature des véritables archives conserve son contrôle strict.

La fonctionnalité Cargo `signed-updates` de `novera-cli` sélectionne uniquement le manifeste officiel `https://github.com/TRON-ABS/Novera/releases/latest/download/latest-cli.json`. Elle utilise la clé publique déjà épinglée pour les bundles desktop. Les archives prises en charge sont Windows x64, Linux x64 et macOS Apple Silicon.

Chaque ZIP contient l’exécutable et `CLI-UPDATE.json`, avec version, architecture, commit et empreinte du binaire. La signature Minisign couvre les deux fichiers. Le client vérifie la signature, l’empreinte de l’archive, l’identité interne et le format natif avant d’écrire un fichier de remplacement. Un ancien paquet signé ne peut pas être renommé pour simuler une version supérieure. Les rétrogradations sont refusées, même avec une mise à jour forcée. Windows conserve l’ancien exécutable dans une sauvegarde distincte ; les autres hôtes utilisent un renommage atomique.

Le workflow manuel `target=cli, signed_updates=true` compile uniquement les trois CLI, signe leurs archives finales avec les secrets Actions Novera existants et produit `CLI-UPDATER-READINESS.json`. Ce reçu prouve la signature du paquet ; il ne certifie pas l’installation ni une mise à jour complète. Aucun `latest-cli.json` public n’est produit par ce workflow.

Avant toute diffusion, contrôler indépendamment les archives et les architectures, exercer le remplacement dans un environnement dédié sur chaque hôte et valider la disponibilité du manifeste et des fichiers de la version. Voir [le protocole général](INSTALL_UPDATE_VALIDATION.md). Les canaux des applications mobiles et du Web demandent leurs propres preuves.
