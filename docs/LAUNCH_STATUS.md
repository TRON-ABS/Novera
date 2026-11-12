# Novera — disponibilité

## Android 1.0.3 — 12 novembre 2026

Le build ARM64 1000025 est publié avec les 120 langues. Le mainteneur a confirmé le clavier et le sélecteur de langue sur Huawei P20. [APK signé](https://github.com/TRON-ABS/Novera/releases/tag/v1.0.3-android-1000025).

## Publications 1.0.2 du 11 novembre 2026

- Android ARM64 1000023 est publié. Le clavier et les 120 langues d’interface ont été validés sur Huawei P20. [APK signé et somme SHA-256](https://github.com/TRON-ABS/Novera/releases/tag/v1.0.2-android-1000023).
- Le client Web expérimental 1.0.2 est en ligne avec 120 langues d’interface. [Ouvrir Novera Web](https://tron-abs.github.io/Novera/web/).
- Les publications Desktop, CLI et portable sont suivies séparément. iOS reste en attente.

<!-- novera-current-distributions:start -->
### Paquets 1.0.2 disponibles

- [Windows x64 (EXE et MSI)](https://github.com/TRON-ABS/Novera/releases/tag/v1.0.2)
- [Windows ARM64 (EXE)](https://github.com/TRON-ABS/Novera/releases/tag/v1.0.2-windows-arm64)
- [Linux x64 (AppImage et Debian)](https://github.com/TRON-ABS/Novera/releases/tag/v1.0.2-linux-x64)
- [macOS Apple Silicon (DMG)](https://github.com/TRON-ABS/Novera/releases/tag/v1.0.2-macos-arm64)
- [macOS Intel (DMG)](https://github.com/TRON-ABS/Novera/releases/tag/v1.0.2-macos)
- [CLI Windows, Linux et macOS Apple Silicon](https://github.com/TRON-ABS/Novera/releases/tag/v1.0.2-cli-novera)
- [Windows x64 portable (ZIP)](https://github.com/TRON-ABS/Novera/releases/tag/v1.0.2-windows-portable)


<!-- novera-current-distributions:end -->

## Publications 1.0.1

État actualisé le **7 novembre 2026** à partir des publications et manifests publics : [Desktop Windows x64 / Linux](https://github.com/TRON-ABS/Novera/releases/tag/v1.0.1), [Windows ARM64](https://github.com/TRON-ABS/Novera/releases/tag/v1.0.1-windows-arm64), [macOS Intel / Apple Silicon](https://github.com/TRON-ABS/Novera/releases/tag/v1.0.1-macos), [CLI Novera](https://github.com/TRON-ABS/Novera/releases/tag/v1.0.1-cli-novera) et [Android ARM64 1000013](https://github.com/TRON-ABS/Novera/releases/tag/v1.0.1-android-1000013) sont publiés en **1.0.1**. Les paquets et leurs contrôles sont suivis dans le [bilan 1.0.1](RELEASE_1.0.1_2026-11-07.md).

Le canal Desktop `latest.json` et la CLI actuelle `latest-novera-cli.json` annoncent 1.0.1. **La version portable Windows et l’ancien canal `latest-cli.json` restent en 1.0.0** : aucun lien vers une portable 1.0.1 inexistante n’est proposé. Leurs paquets historiques restent immuables. L’installation Android 1000013 sur téléphone et la transition publique entre versions ne sont confirmées que pour les scénarios réellement documentés.

**Novera Web 1.0.1 : publication expérimentale autorisée le 8 novembre 2026**, interface Desktop, contexte local de 32k et recherche Internet Exa préparée à l’activation testés dans Edge. La [vitrine](https://tron-abs.github.io/Novera/) présente ces travaux ; le [client Web expérimental](https://tron-abs.github.io/Novera/web/) est en ligne ; 757 fichiers, démarrage et conversation après rechargement sont vérifiés. [Reçu public](release-evidence/1.0.1/WEB-PUBLIC-EXPERIMENTAL.json). Wan vidéo, audit complet, licence du SDK et contrôles de déploiement restent à terminer. [Suivi Web](WEB_BROWSER_PREPARATION.md).

## Historique de la sortie 1.0.0

**Sortie publique du 2 novembre 2026 : Windows x64, Windows ARM64 et Linux x64.** [Télécharger la version officielle](https://github.com/TRON-ABS/Novera/releases/tag/v1.0.0). La correction de l'updater est intégrée via la [PR #5](https://github.com/TRON-ABS/Novera/pull/5).

| Cible | Disponibilité |
| --- | --- |
| Windows x64 | Installateur NSIS public ; signature updater, installation et remplacement natif vérifiés. Contrôle manuel sur le canal public vérifié dans la vraie interface. |
| Linux x64 | AppImage publique ; signature, installation et remplacement natif vérifiés. Contrôle du feed public dans la vraie interface sous Xvfb. |
| CLI Windows x64 / Linux x64 | [CLI Novera](https://github.com/TRON-ABS/Novera/releases/tag/v1.0.0-cli-novera) : exécutables `novera.exe` / `novera`, nouveau format signé et canal dédié, publiés et vérifiés sur les hôtes natifs. Les anciennes archives immuables restent accessibles par leurs liens directs et leurs notes renvoient vers Novera. |
| Windows ARM64 | [Installateur NSIS public 1.0.0](https://github.com/TRON-ABS/Novera/releases/tag/v1.0.0-windows-arm64) ; moteur texte CPU natif, installation, remplacement et contrôle du canal public dans la vraie interface vérifiés. |
| macOS ARM64 / Intel | [Sortie officielle 1.0.0 — DMG](https://github.com/TRON-ABS/Novera/releases/tag/v1.0.0-macos), macOS 14+ ARM64 / 13+ Intel. Paquets et remplacement signés Novera vérifiés ; tests natifs sur les deux architectures. Sans Developer ID/notarisation Apple ; aucun essai visuel ni MLX revendiqué. [Preuves et installation](RELEASE_MACOS_1.0.0.md). |
| Android ARM64 | [APK signé public 1.0.0](https://github.com/TRON-ABS/Novera/releases/tag/v1.0.0-android-1000012), build 1000012, lot par défaut 512, destination du suivi des erreurs configurée avec consentement obligatoire. Paquet vierge sans conversations, modèles ni clés. Quatre fichiers publics vérifiés sans authentification ; le mainteneur confirme le bon fonctionnement du 1000012 sur téléphone le 3 novembre ; ancien 1000011 retiré à sa demande. [Preuves](RELEASE_ANDROID_1.0.0.md). |
| iOS | Candidat simulateur interne ; accès Apple, provisioning, build appareil et essais réels à reprendre selon la [note macOS/iOS](REPRISE_MACOS_IOS.md). |
| Web | Vitrine informative en ligne ; client Web hébergé encore interne. |
| Windows x64 portable | [ZIP signé public](https://github.com/TRON-ABS/Novera/releases/tag/v1.0.0-windows-portable) ; Program/Data séparés, remplacement natif et conservation des données vérifiés, interface testée sur Windows local. |
| MSI / Debian | Formats exclus de cette sortie ; scénarios de mise à jour propres à valider. |

Le complément `v1.0.0-windows-arm64` conserve la version applicative 1.0.0 et les paquets x64/Linux immuables. Le canal desktop ajoute Windows ARM64 ; la CLI reste disponible sur Windows x64 et Linux x64. Les deux manifests et les dix-neuf fichiers référencés sur les deux releases sont contrôlés sans authentification : disponibilité HTTPS, tailles, SHA-256 et cinq signatures de paquets. [Contrôle public 41466838497](https://github.com/TRON-ABS/Novera/actions/runs/41466838497).

Les fichiers exacts de cette release passent les essais natifs sur des hôtes vierges : installation, rejet d'un paquet altéré, absence d'offre à version égale, remplacement, contrôle du runtime et conservation du témoin de profil. [Essais 41386813422](https://github.com/TRON-ABS/Novera/actions/runs/41386813422).

L’installateur ARM64 exact passe aussi les essais natifs et le contrôle manuel du canal publié dans l’application installée : [essais ARM64 41466831298](https://github.com/TRON-ABS/Novera/actions/runs/41466831298). Le [bilan ARM64](RELEASE_WINDOWS_ARM64_1.0.0.md) précise la provenance et les limites.

La version portable Windows x64 reste en **1.0.0** et possède son canal propre. Les trois manifests et les **26 fichiers publics** sont vérifiés sans authentification, avec sept signatures de paquets : [contrôle public 41504580547](https://github.com/TRON-ABS/Novera/actions/runs/41504580547). L’interface Windows locale affiche la version à jour sur le canal portable publié ; les contrôles natifs de remplacement CI et les limites Windows Server sont détaillés dans le [bilan portable](RELEASE_WINDOWS_PORTABLE_1.0.0.md).

La sortie Android du **3 novembre 2026** conserve la version applicative **1.0.0** et utilise le tag `v1.0.0-android-1000012`. L’ancienne publication 1000011 a été supprimée ; ses reçus historiques sont conservés dans le dépôt. Le téléchargement anonyme des quatre fichiers publics et leurs SHA-256 ont été vérifiés. Depuis la sortie Mac, la release `latest` est `v1.0.0-macos` : le manifest desktop ajoute Darwin ; les entrées Windows/Linux/ARM64 sont conservées et les manifests CLI Novera/portable sont recopiés sans modification. Pour les modèles locaux, un téléphone moderne ou un fournisseur API est conseillé ; pour la recherche web, prévoir au moins **16K tokens de contexte**.

La sortie officielle Mac du **3 novembre 2026** ajoute [Intel et Apple Silicon](https://github.com/TRON-ABS/Novera/releases/tag/v1.0.0-macos). Les paquets exacts passent les tests natifs, la comparaison DMG/archive, la signature updater, le refus de corruption et la conservation du profil synthétique. Sur Intel, la revalidation réutilise les mêmes octets après un dépassement du délai de découverte Metal à froid. Aucun essai visuel, sur Mac physique ou d’inférence MLX n’est revendiqué.

## Limites et prochaines versions

La signature updater n'est pas une signature Authenticode Windows. Le premier installateur peut afficher un éditeur inconnu. Les fonctions locales dépendent du matériel, des pilotes et des modèles installés ; aucun modèle ou profil utilisateur n'est inclus dans les téléchargements.

Cette première sortie ne peut pas prouver une transition entre deux versions publiques. Les essais de remplacement natif et les contrôles du canal public sont distincts ; la transition publique complète sera vérifiée lors de la prochaine version. Les scénarios d'offre/téléchargement/installation depuis l'interface ne sont pas déclarés certifiés par le simple contrôle de version à jour.

Le [bilan de sortie](RELEASE_1.0.0_2026-11-02.md) conserve les commits de compilation exacts, les preuves et exclusions. Les [résultats du 1er novembre](VALIDATION_RESULTS_2026-11-01.md) et le [parcours correctif](UPDATE_CHANNEL_CHECK_2026-11-01.md) sont des historiques antérieurs à cette publication. La politique de [versions officielles](../OFFICIAL_RELEASES.md) et la procédure des [versions suivantes](FUTURES_VERSIONS.md) restent applicables.

**TRON-ABS**
*The art of Human with AI*
