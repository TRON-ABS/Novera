# Validation des installations et mises à jour

## Exécution des cinq essais — 1er novembre 2026

La matrice [41333359988](https://github.com/TRON-ABS/Novera/actions/runs/41333359988), commit cd5171da, est lancée pour les cinq plateformes desktop. Les contrats source passent. Les programmes de contrôle Windows x64, Windows ARM64 et Linux compilent, mais leur téléchargement des assets du brouillon échoue HTTP 403 avec le jeton en lecture seule. Le job de validation reçoit donc l’accès requis aux brouillons ; le contrôleur effectue seulement des lectures et retire le jeton avant de démarrer tout exécutable testé. Les installations restent à valider. Les deux premiers essais Windows ont échoué avant installation, sur la sélection du linker puis sur le passage du paramètre de plateforme dans Bash ; ces deux problèmes sont corrigés. Aucune installation réussie n’est déduite de ces préparatifs.

Un [canal CLI signé](CLI_SIGNED_UPDATES.md) est aussi en préparation, distinct des anciens candidats sans updater. Seuls les deux secrets de signature Novera sont actuellement configurés dans Actions ; aucune identité Apple/Android de production n’a été constatée dans ces secrets.

## Essai Windows : sélection du linker de validation — 1er novembre 2026

Le premier run de validation 41332189234 passe les contrats source mais échoue avant installation : Bash résout le link.exe de Git pendant la compilation du programme de contrôle. Le job utilise désormais le sélecteur MSVC déjà présent et testé dans le dépôt, avec son chemin de linker explicite. Une relance ciblée est préparée ; aucun échec d’installation de Novera ni validation réussie n’est déduit de cet incident de préparation.

Le mainteneur demande le **1er novembre 2026** de poursuivre après les compilations pour valider les installations et mises à jour réelles, ainsi que les canaux encore incomplets. Les paquets et le brouillon restent ceux décrits dans [la disponibilité](LAUNCH_STATUS.md). Cette nouvelle phase ne publie aucune version.

## Essais isolés des paquets desktop

Le workflow manuel propose `validate-windows` pour commencer par Windows x64, puis `validate-desktop` pour les cinq architectures desktop. Il réutilise les bundles déjà compilés et signés, sans recompiler les moteurs. Les identifiants d’assets, tailles, empreintes et commits examinés sont fixés dans `scripts/distribution/validation-assets.json`.

Le programme de contrôle utilise les mêmes versions de Tauri et du composant updater que les candidats. Il est distinct de l’application livrée et ne peut effectuer une installation que sur un runner GitHub hébergé, dans un dossier dédié de `RUNNER_TEMP`. Les comptes personnels, clés privées et profils du mainteneur ne sont pas utilisés. La configuration de production et son endpoint GitHub restent inchangés.

Le scénario doit contrôler :

- Le téléchargement des seuls assets retenus et la correspondance exacte de leurs tailles/SHA-256.
- La signature avec le vrai vérificateur natif et la clé publique Novera épinglée ; un contenu altéré doit échouer spécifiquement à la vérification cryptographique.
- Le refus normal d’une mise à jour lorsque le manifeste annonce la même version.
- L’installation du paquet réel, puis le maintien en vie de l’application avant et après remplacement.
- Le remplacement effectif des fichiers par l’updater natif et la conservation d’un témoin synthétique dans le dossier de données isolé.

Les reçus JSON doivent distinguer ces preuves des validations non réalisées. Le programme de contrôle annonce une version synthétique antérieure `0.9.9` pour exercer le composant d’update avec le vrai paquet `1.0.0`. Cela ne vaut **pas** essai complet entre deux versions de Novera publiées, ni validation du parcours de mise à jour dans l’interface. Le maintien du processus ne constitue pas une inspection visuelle ou une validation de tous les moteurs.

| Cible | État des nouveaux essais |
| --- | --- |
| Windows x64 NSIS | Scénario préparé ; résultat CI à obtenir. |
| Windows ARM64 NSIS | Scénario préparé ; résultat CI à obtenir. |
| Linux x64 AppImage | Scénario préparé ; résultat CI à obtenir. |
| macOS ARM64 et Intel | Scénario préparé ; résultats CI à obtenir. |
| MSI, Debian et portable | Scénarios propres encore requis ; ne pas déduire leur validation de celle du NSIS/AppImage. |

## Canaux encore à terminer

| Plateforme | Travail restant |
| --- | --- |
| Android | Signature durable, canal de distribution/update adapté et essais sur appareil ; le candidat existant reste debug. |
| iOS | Identité et accès Apple réels, build appareil, distribution/update via un canal approprié et essais ; le simulateur ne suffit pas. |
| Web | Hébergement, déploiement, versionnement et renouvellement du client public. |
| CLI | Canal d’update signé adapté aux trois hôtes et validation de son installation/remplacement. |

Les accès Apple/Google et certificats éventuels doivent provenir du mainteneur, hors du chat et du dépôt. Aucune clé ou certification de production n’est inventée. La publication reste conditionnée aux preuves réellement obtenues et à la [politique officielle](../OFFICIAL_RELEASES.md).
