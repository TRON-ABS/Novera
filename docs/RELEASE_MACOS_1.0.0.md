# Novera 1.0.0 — sortie officielle macOS

**3 novembre 2026 : sortie officielle en téléchargement direct pour Mac Intel et Apple Silicon.** [Release et reçus](https://github.com/TRON-ABS/Novera/releases/tag/v1.0.0-macos). La [PR #21](https://github.com/TRON-ABS/Novera/pull/21) intègre la batterie automatique et les corrections de démarrage. Le mainteneur demande une version officielle avec essais visuels différés ; les utilisateurs peuvent signaler leurs problèmes dans les issues.

## Téléchargement et installation

| Architecture | Téléchargement | Minimum vérifié | SHA-256 du DMG |
| --- | --- | --- | --- |
| Apple Silicon | [DMG ARM64](https://github.com/TRON-ABS/Novera/releases/download/v1.0.0-macos/Novera_1.0.0_aarch64.dmg) | macOS 14.0 | `8ff60455455f654f37b9cd58d0c3bc7d302c45b2f60de4bd7b40195cea35ef1c` |
| Intel | [DMG x64](https://github.com/TRON-ABS/Novera/releases/download/v1.0.0-macos/Novera_1.0.0_x64.dmg) | macOS 13.0 | `735c5ecf0ce13289cc59afd25edff237a88ee011b6fff656090e9cd0c1d32a54` |

Ouvrir le DMG et copier Novera dans Applications, puis lancer Novera depuis Applications. **Ces paquets ne sont pas signés Developer ID et ne sont pas notariés par Apple.** Si macOS bloque le premier lancement parce que le développeur est non identifié ou que l’application n’a pas été vérifiée, ouvrir **Réglages Système → Confidentialité et sécurité → Ouvrir quand même** pour Novera, puis confirmer. [Procédure officielle Apple](https://support.apple.com/fr-fr/guide/mac-help/-mh40616/mac). Le parcours du DMG final sur un Mac physique reste à vérifier.

## Sources et preuves

- Sources applicatives compilées : `04d91426356a43b678aef690115cc4d0d0150244`. Fusion officielle : `10f4c4a6fe32c68a4e495ab0531454adc15f6b6f`. Les différences supplémentaires concernent le banc de revalidation et sa documentation, sans modification des sources natives des paquets.
- [Compilation et suites natives 41642608432](https://github.com/TRON-ABS/Novera/actions/runs/41642608432) : succès complet Apple Silicon ; toutes les suites natives Intel réussies, puis délai de 45 secondes atteint lors de la découverte Metal du paquet.
- [Revalidation Intel 41669833311](https://github.com/TRON-ABS/Novera/actions/runs/41669833311) : mêmes paquets signés, empreinte de l’artefact vérifiée, sources natives inchangées, signature de l’archive revérifiée. Le contrôle de découverte Metal dispose de 180 secondes et aboutit en environ 53 secondes. Le délai de handshake applicatif reste de 30 secondes.
- Par architecture : 226 tests frontend, 187 tests unitaires moteur, 9 tests moteur, 18 tests HTTP, 5 tests de supervision, 7 tests unitaires updater et 9 tests de migration réussis. Un test updater opt-in reste ignoré dans la sélection unitaire ; le remplacement réel est vérifié séparément par le probe natif.
- DMG et archive comparés au bundle construit dans le run de compilation. La revalidation Intel reconstruit sa référence depuis l’archive signée et refait la comparaison DMG/archive ; son reçu distingue cette référence de la preuve initiale.
- Exécutables et bibliothèques Mach-O contrôlés pour architecture, dépendances et minimum macOS ; bun/uv et worker livrés exécutés. Lancement du processus applicatif avant/après remplacement, signature native, absence d’offre à version égale, rejet du paquet altéré et conservation d’une sentinelle de profil synthétique vérifiés.

Les reçus `MACOS-*-HEADLESS.json`, `MACOS-*-COMPATIBILITY.json`, `MACOS-x64-REUSE.json`, `MACOS-PROVENANCE.json` et `SHA256SUMS.txt` sont joints à la release. Les archives updater ont les SHA-256 `1f9ec666550300dbc2acd7db6346845537509f72a7c0161bc94e954f166564f8` (ARM64) et `a8c8fa8f7729563235f038225a21cefb437a390c841dad2312c282096dee7515` (Intel). Les anciens brouillons et paquets historiques ne servent pas à cette sortie.

## Corrections et limites

Le worker diffère la découverte GPU jusqu’au chargement d’un modèle ou à la demande de liste des appareils : un moteur idle ou une configuration invalide ne doit pas attendre l’initialisation GPU avant de répondre au superviseur. Les tests de processus utilisent `ps` sur macOS, au lieu de supposer l’existence du `/proc` Linux. Le mode sans distribution Apple omet entièrement les variables de certificat Apple vides ; la signature updater Novera est conservée séparément.

Aucun test visuel, parcours sur Mac physique ni benchmark n’est revendiqué. L’inférence MLX et la génération GPU ne sont pas validées par la petite génération GGUF CPU ; la découverte d’un périphérique ne prouve pas son inférence. Un processus actif pendant quinze secondes ne prouve pas le bon affichage. Le modèle de test, les profils synthétiques et les clés privées ne sont pas inclus dans le produit. Les couleurs et composants proviennent du frontend Desktop partagé.

Pour les modèles locaux, un appareil récent avec assez de mémoire est conseillé ; les fournisseurs API sont une autre possibilité. Pour la recherche web, un contexte d’au moins **16 K tokens** est conseillé.

La release conserve les entrées Windows/Linux/ARM64 du manifest desktop, ajoute `darwin-aarch64` et `darwin-x86_64`, et recopie sans changement les manifests CLI Novera et portable. La transition entre deux versions applicatives publiques reste à vérifier lors d’une version supérieure.

## Future signature Apple

Le mainteneur ne possède pas encore de compte Apple Developer. La chaîne Developer ID/notarisation préparée dans `macos-distribution.mjs` reste disponible pour une future sortie : six secrets `NOVERA_APPLE_CERTIFICATE`, `NOVERA_APPLE_CERTIFICATE_PASSWORD`, `NOVERA_APPLE_SIGNING_IDENTITY`, `NOVERA_APPLE_ID`, `NOVERA_APPLE_PASSWORD`, `NOVERA_APPLE_TEAM_ID`, puis `target=macos`, `signed_updates=true`, `macos_distribution=true`. Les valeurs doivent rester hors du dépôt, du chat et des artefacts. Aucune validation Apple n’est revendiquée pour cette publication.

Voir [MACOS_HEADLESS_VALIDATION.md](MACOS_HEADLESS_VALIDATION.md), [LAUNCH_STATUS.md](LAUNCH_STATUS.md) et [REPRISE_MACOS_IOS.md](REPRISE_MACOS_IOS.md).
