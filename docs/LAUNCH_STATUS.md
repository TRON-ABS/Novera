# Novera 1.0.0 — disponibilité

**Sortie publique du 2 novembre 2026 : Windows x64, Windows ARM64 et Linux x64.** [Télécharger la version officielle](https://github.com/TRON-ABS/Novera/releases/tag/v1.0.0). La correction de l'updater est intégrée via la [PR #5](https://github.com/TRON-ABS/Novera/pull/5).

| Cible | Disponibilité |
| --- | --- |
| Windows x64 | Installateur NSIS public ; signature updater, installation et remplacement natif vérifiés. Contrôle manuel sur le canal public vérifié dans la vraie interface. |
| Linux x64 | AppImage publique ; signature, installation et remplacement natif vérifiés. Contrôle du feed public dans la vraie interface sous Xvfb. |
| CLI Windows x64 / Linux x64 | [CLI Novera](https://github.com/TRON-ABS/Novera/releases/tag/v1.0.0-cli-novera) : exécutables `novera.exe` / `novera`, nouveau format signé et canal dédié, publiés et vérifiés sur les hôtes natifs. Les anciennes archives immuables restent accessibles par leurs liens directs et leurs notes renvoient vers Novera. |
| Windows ARM64 | [Installateur NSIS public 1.0.0](https://github.com/TRON-ABS/Novera/releases/tag/v1.0.0-windows-arm64) ; moteur texte CPU natif, installation, remplacement et contrôle du canal public dans la vraie interface vérifiés. |
| macOS ARM64 / Intel | Candidats internes ; [chaîne de distribution préparée](RELEASE_MACOS_1.0.0.md), accès Apple absents et essais finaux sur Mac encore nécessaires. |
| Android ARM64 | [APK signé public 1.0.0](https://github.com/TRON-ABS/Novera/releases/tag/v1.0.0-android), build 1000011, lot par défaut 512. Paquet vierge sans conversations, modèles ni clés. Quatre fichiers publics vérifiés sans authentification ; retest du nouveau build sur téléphone en attente, après retour positif du mainteneur sur 1000010. [Preuves](RELEASE_ANDROID_1.0.0.md). |
| iOS | Candidat simulateur interne ; accès Apple, provisioning, build appareil et essais réels à reprendre selon la [note macOS/iOS](REPRISE_MACOS_IOS.md). |
| Web | Vitrine informative en ligne ; client Web hébergé encore interne. |
| Windows x64 portable | [ZIP signé public](https://github.com/TRON-ABS/Novera/releases/tag/v1.0.0-windows-portable) ; Program/Data séparés, remplacement natif et conservation des données vérifiés, interface testée sur Windows local. |
| MSI / Debian | Formats exclus de cette sortie ; scénarios de mise à jour propres à valider. |

Le complément `v1.0.0-windows-arm64` conserve la version applicative 1.0.0 et les paquets x64/Linux immuables. Le canal desktop ajoute Windows ARM64 ; la CLI reste disponible sur Windows x64 et Linux x64. Les deux manifests et les dix-neuf fichiers référencés sur les deux releases sont contrôlés sans authentification : disponibilité HTTPS, tailles, SHA-256 et cinq signatures de paquets. [Contrôle public 41466838497](https://github.com/TRON-ABS/Novera/actions/runs/41466838497).

Les fichiers exacts de cette release passent les essais natifs sur des hôtes vierges : installation, rejet d'un paquet altéré, absence d'offre à version égale, remplacement, contrôle du runtime et conservation du témoin de profil. [Essais 41386813422](https://github.com/TRON-ABS/Novera/actions/runs/41386813422).

L’installateur ARM64 exact passe aussi les essais natifs et le contrôle manuel du canal publié dans l’application installée : [essais ARM64 41466831298](https://github.com/TRON-ABS/Novera/actions/runs/41466831298). Le [bilan ARM64](RELEASE_WINDOWS_ARM64_1.0.0.md) précise la provenance et les limites.

La version portable Windows x64 reste en **1.0.0** et possède son canal propre. Les trois manifests et les **26 fichiers publics** sont vérifiés sans authentification, avec sept signatures de paquets : [contrôle public 41504580547](https://github.com/TRON-ABS/Novera/actions/runs/41504580547). L’interface Windows locale affiche la version à jour sur le canal portable publié ; les contrôles natifs de remplacement CI et les limites Windows Server sont détaillés dans le [bilan portable](RELEASE_WINDOWS_PORTABLE_1.0.0.md).

La sortie Android du **3 novembre 2026** conserve la version applicative **1.0.0** et utilise le tag `v1.0.0-android`. Le téléchargement anonyme des quatre fichiers publics et leurs SHA-256 ont été vérifiés. La release `latest` reste `v1.0.0-cli-novera` et ses fichiers sont inchangés. Pour les modèles locaux, un téléphone moderne ou un fournisseur API est conseillé ; pour la recherche web, prévoir au moins **16K tokens de contexte**.

## Limites et prochaines versions

La signature updater n'est pas une signature Authenticode Windows. Le premier installateur peut afficher un éditeur inconnu. Les fonctions locales dépendent du matériel, des pilotes et des modèles installés ; aucun modèle ou profil utilisateur n'est inclus dans les téléchargements.

Cette première sortie ne peut pas prouver une transition entre deux versions publiques. Les essais de remplacement natif et les contrôles du canal public sont distincts ; la transition publique complète sera vérifiée lors de la prochaine version. Les scénarios d'offre/téléchargement/installation depuis l'interface ne sont pas déclarés certifiés par le simple contrôle de version à jour.

Le [bilan de sortie](RELEASE_1.0.0_2026-11-02.md) conserve les commits de compilation exacts, les preuves et exclusions. Les [résultats du 1er novembre](VALIDATION_RESULTS_2026-11-01.md) et le [parcours correctif](UPDATE_CHANNEL_CHECK_2026-11-01.md) sont des historiques antérieurs à cette publication. La politique de [versions officielles](../OFFICIAL_RELEASES.md) et la procédure des [versions suivantes](FUTURES_VERSIONS.md) restent applicables.

**TRON-ABS**
*The art of Human with AI*
