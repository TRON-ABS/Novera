# Novera 1.0.0 — disponibilité

**Sortie publique du 2 novembre 2026 : Windows x64 et Linux x64.** [Télécharger la version officielle](https://github.com/TRON-ABS/Novera/releases/tag/v1.0.0). La correction de l'updater est intégrée via la [PR #5](https://github.com/TRON-ABS/Novera/pull/5).

| Cible | Disponibilité |
| --- | --- |
| Windows x64 | Installateur NSIS public ; signature updater, installation et remplacement natif vérifiés. Contrôle manuel sur le canal public vérifié dans la vraie interface. |
| Linux x64 | AppImage publique ; signature, installation et remplacement natif vérifiés. Contrôle du feed public dans la vraie interface sous Xvfb. |
| CLI Windows x64 / Linux x64 | ZIP signés publics ; architectures, identité interne, remplacement et consultation du feed de production vérifiés. Nom actuel des exécutables : `jan.exe` / `jan`. |
| Windows ARM64 | Candidat interne ; contrôle visuel sur machine ARM64 encore nécessaire. |
| macOS ARM64 / Intel | Candidats internes ; signature/notarisation Apple et contrôles du canal propres à la plateforme encore nécessaires. |
| Android / iOS | Essais internes debug/simulateur ; signature durable, distribution et validation sur appareil à terminer. |
| Web | Vitrine informative en ligne ; client Web hébergé encore interne. |
| MSI / Debian / portable | Formats exclus de cette sortie ; scénarios de mise à jour propres à valider. |

Les deux manifests `latest.json` et `latest-cli.json` sont publics et annoncent seulement Windows x64 et Linux x64. Les quinze assets sont contrôlés sans authentification : disponibilité HTTPS, tailles, SHA-256 et signatures updater. [Contrôle public 41388605836](https://github.com/TRON-ABS/Novera/actions/runs/41388605836).

Les fichiers exacts de cette release passent les essais natifs sur des hôtes vierges : installation, rejet d'un paquet altéré, absence d'offre à version égale, remplacement, contrôle du runtime et conservation du témoin de profil. [Essais 41386813422](https://github.com/TRON-ABS/Novera/actions/runs/41386813422).

## Limites et prochaines versions

La signature updater n'est pas une signature Authenticode Windows. Le premier installateur peut afficher un éditeur inconnu. Les fonctions locales dépendent du matériel, des pilotes et des modèles installés ; aucun modèle ou profil utilisateur n'est inclus dans les téléchargements.

Cette première sortie ne peut pas prouver une transition entre deux versions publiques. Les essais de remplacement natif et les contrôles du canal public sont distincts ; la transition publique complète sera vérifiée lors de la prochaine version. Les scénarios d'offre/téléchargement/installation depuis l'interface ne sont pas déclarés certifiés par le simple contrôle de version à jour.

Le [bilan de sortie](RELEASE_1.0.0_2026-11-02.md) conserve les commits de compilation exacts, les preuves et exclusions. Les [résultats du 1er novembre](VALIDATION_RESULTS_2026-11-01.md) et le [parcours correctif](UPDATE_CHANNEL_CHECK_2026-11-01.md) sont des historiques antérieurs à cette publication. La politique de [versions officielles](../OFFICIAL_RELEASES.md) et la procédure des [versions suivantes](FUTURES_VERSIONS.md) restent applicables.

**TRON-ABS**
*The art of Human with AI*
