# Validation des installations et mises à jour

## Cinq installations et remplacements natifs vérifiés — 1er novembre 2026

Les essais réussissent sur **Windows x64 et ARM64, Linux x64, macOS ARM64 et Intel**. Les reçus téléchargés et leurs digests GitHub sont vérifiés : installation du vrai paquet, signature native, rejet du contenu altéré, aucune offre à version égale, restauration effective par l’updater, empreintes runtime et témoin de profil conservés, démarrage pendant 15 secondes avant et après. Le [run Windows 41336767111](https://github.com/TRON-ABS/Novera/actions/runs/41336767111) compare 106 fichiers x64 et neuf ARM64 ; le [run Linux/macOS 41334675673](https://github.com/TRON-ABS/Novera/actions/runs/41334675673) compare l’AppImage exacte, 22 fichiers macOS ARM64 et 30 Intel.

Le programme de contrôle annonce `0.9.9` pour exercer le vrai paquet `1.0.0`. Ces preuves ne couvrent pas le parcours d’update dans l’interface, une transition entre deux applications publiées ni une inspection visuelle de tous les moteurs. Le défaut Windows était celui du profil synthétique du banc d’essai ; son arborescence standard corrige le démarrage sans recompiler Novera.

**La publication reste bloquée** : aucun feed public n’est créé, les trois CLI signées passent également le remplacement isolé et leur manifeste est préparé localement, sans endpoint public activé, les exigences Apple/mobile/Web et les scénarios MSI/Debian/portable restent distincts. Le brouillon privé conserve ses 15 assets vérifiés. Voir le [protocole de validation](INSTALL_UPDATE_VALIDATION.md) et la [disponibilité actuelle](LAUNCH_STATUS.md).

## Essais isolés des paquets desktop

Le workflow manuel propose `validate-windows` pour les deux architectures Windows, puis `validate-desktop` pour les cinq architectures desktop. Il réutilise les bundles déjà compilés et signés, sans recompiler les moteurs. Les identifiants d’assets, tailles, empreintes et commits examinés sont fixés dans `scripts/distribution/validation-assets.json`.

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
| Windows x64 NSIS | Installation NSIS, démarrage et restauration native réussis ; limites du programme de contrôle ci-dessus. |
| Windows ARM64 NSIS | Installation NSIS, démarrage et restauration native réussis ; limites du programme de contrôle ci-dessus. |
| Linux x64 AppImage | Installation et remplacement natif réussis ; limites du programme de contrôle ci-dessus. |
| macOS ARM64 et Intel | Installation et remplacement natif réussis sur les deux architectures ; limites ci-dessus. |
| MSI, Debian et portable | Scénarios propres encore requis ; ne pas déduire leur validation de celle du NSIS/AppImage. |

## Canaux encore à terminer

| Plateforme | Travail restant |
| --- | --- |
| Android | Signature durable, canal de distribution/update adapté et essais sur appareil ; le candidat existant reste debug. |
| iOS | Identité et accès Apple réels, build appareil, distribution/update via un canal approprié et essais ; le simulateur ne suffit pas. |
| Web | [Révision et contrat HTTP contrôlés](WEB_DELIVERY.md), rechargement réel entre deux builds au navigateur local avec thème préservé ; hébergement HTTPS et cache/CDN de production restent requis. |
| CLI | [Remplacement signé et exécution vérifiés sur les trois hôtes CLI](CLI_SIGNED_UPDATES.md) ; manifeste complet préparé localement, endpoint de production non validé. |

Les accès Apple/Google et certificats éventuels doivent provenir du mainteneur, hors du chat et du dépôt. Aucune clé ou certification de production n’est inventée. La publication reste conditionnée aux preuves réellement obtenues et à la [politique officielle](../OFFICIAL_RELEASES.md).
