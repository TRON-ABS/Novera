# Novera 1.0.1 — suivi de publication

Le mainteneur autorise le 7 novembre 2026 la mise à jour du dépôt, de la vitrine et des distributions en 1.0.1, y compris les nouveaux modèles des fournisseurs API.

## État public actualisé le 7 novembre 2026

Les publications **1.0.1** Windows x64/Linux, Windows ARM64, macOS Intel/ARM64, CLI Novera et Android 1000013 sont désormais publiques. Le canal `latest` pointe sur `v1.0.1` ; `latest.json` et `latest-novera-cli.json` annoncent 1.0.1. Les manifests historiques `latest-cli.json` et `latest-portable.json` conservent **1.0.0**, conformément aux paquets encore disponibles. Les anciennes mentions « en cours » ci-dessous décrivent les étapes antérieures de cette sortie.

Le contrôle anonyme des manifests est conservé dans [le reçu de publication](release-evidence/1.0.1/PUBLICATION-STATUS-2026-11-07.json). Les essais natifs détaillés et leurs limites restent distincts de la disponibilité des téléchargements. Les 104 README et la vitrine sont actualisés sans modifier les paquets, leurs signatures ni les feeds. La portable n’est pas annoncée en 1.0.1 ; l’APK Android n’est pas présentée comme déjà testée sur téléphone.

Le dépôt inclut aussi la **préparation expérimentale de Novera Web** : contexte 32k, recherche Exa sans clé préparée à l’activation, essais locaux image/musique et diagnostic Wan. Ces sources n’actualisent pas le binaire Desktop publié et ne constituent pas une sortie Web hébergée. [Tests et contrôles restant avant diffusion](WEB_BROWSER_PREPARATION.md).

**Ancienne CLI : blocage confirmé.** La CLI actuelle `novera` est bien disponible en 1.0.1. Le canal historique ne peut pas proposer ce paquet au programme `jan` 1.0.0 : celui-ci impose une URL d’archive dans `v1.0.1`, désormais immuable. Les paquets de compatibilité ont passé signatures et lancement natif sur les trois hôtes, mais GitHub refuse leur ajout à cet emplacement ; la migration automatique d’une ancienne CLI n’est pas validée. Installer manuellement le paquet CLI actuel. [Reçu détaillé](release-evidence/1.0.1/CLI-LEGACY-COMPATIBILITY-BLOCKED.json).

**iOS :** le mainteneur confirme le 7 novembre ne pas encore disposer du compte et des accès de signature Apple. Les sources communes sont en 1.0.1 ; aucune distribution iPhone signée n’est annoncée.

## État initial vérifié

- Sources applicatives synchronisées en 1.0.1 ; Android versionCode 1000013, identité de signature conservée.
- GitHub `main` : `d28074830637783586e3026e7fd3c8424f83f41e` ; aucune release 1.0.1 ni correction équivalente ouverte lors du contrôle.
- Les téléchargements publics restent en 1.0.0 tant que les nouveaux paquets ne sont pas construits et vérifiés.
- La vitrine existante est GitHub Pages : https://tron-abs.github.io/Novera/.
- La PR iOS #22 est indépendante ; elle ne constitue pas une distribution iPhone disponible.

## Périmètre

Sécurité, dépendances et moteurs, 104 langues, voix Windows, recherche Web, modèles locaux recommandés et catalogues API partagés. Les changements détaillés et limites sont dans [CHANGELOG.md](CHANGELOG.md) et [PR.md](../PR.md).

Les fournisseurs API utilisent les identifiants officiels vérifiés le 7 novembre et le rafraîchissement réel des catalogues publics. Les déploiements Azure/IBM et l'accès régional restent propres au compte. Aucun appel de génération payant n'est nécessaire à ces contrôles. [Sources et portée](../deliverables/api-catalog-2026-11-07/VALIDATION.md).

## Contrôles de ce cycle

- Définitions de distribution valides pour 1.0.1.
- 63 contrats Node de préparation, versions, canaux, distribution et vitrine réussis localement, aucun échec ni test ignoré.
- `corepack yarn test` : 172 tests core, 7 500 tests Web et 397 tests extensions réussis, soit 8 069 réussites ; 20 tests Web ignorés. Aucun échec.
- Build de production Web/TypeScript réussi ; 23 tests de catalogue réussis, dont trois catalogues publics réels.
- Contrôles complémentaires : 17 Node réussis / deux ignorés, 16 Python distribution et huit Python Android réussis.
- [Contrôles source GitHub](https://github.com/TRON-ABS/Novera/actions/runs/42341229174) réussis ; [candidat Web](https://github.com/TRON-ABS/Novera/actions/runs/42341138005) réussi. Il ne s'agit pas du déploiement de la vitrine.
- [Desktop Windows x64 signé](https://github.com/TRON-ABS/Novera/actions/runs/42341089285), [Linux](https://github.com/TRON-ABS/Novera/actions/runs/42341126078), [Windows ARM64](https://github.com/TRON-ABS/Novera/actions/runs/42341128270), [Mac](https://github.com/TRON-ABS/Novera/actions/runs/42341130724), [CLI](https://github.com/TRON-ABS/Novera/actions/runs/42341133260) et [portable](https://github.com/TRON-ABS/Novera/actions/runs/42341135482) lancés sur le commit `ea08b41bd9e15bfcd54d4e4864689ed00730f390` ; résultats natifs à consigner après exécution.
- Android : diagnostic local sans blocage de toolchain. L'identité de production est retrouvée dans le stockage virtualisé de Codex et copiée sous `LOCALAPPDATA/Novera-Signing/Android`, avec ACL privée et originaux conservés. Mot de passe DPAPI déchiffré en mémoire ; le certificat exporté du PKCS12 correspond exactement au SHA-256 de production. Aucune nouvelle identité générée. Compilation release locale démarrée.

Les preuves de la 1.0.0 ne valent pas validation de la 1.0.1.

## Publication des sources et premier incident CI

La [PR #26](https://github.com/TRON-ABS/Novera/pull/26) est fusionnée sur `main` (`cd7451690bddbfd39c7a3b390bfb4e129b6b3229`). Le déploiement de la vitrine depuis ce commit est lancé ; ses liens restent en 1.0.0 et présentent les notes 1.0.1 en préparation.

Le [déploiement GitHub Pages](https://github.com/TRON-ABS/Novera/actions/runs/42341584526) réussit. Lecture publique : révision exacte, notes 1.0.1, 104 langues et deux images HTTP 200 vérifiées ; liens 1.0.0 préservés. La [PR #27](https://github.com/TRON-ABS/Novera/pull/27) corrige l'import `tar` et est fusionnée (`03987eec917df91ccb59ee0ec9bc3df68a0c5da6`). Les nouveaux builds desktop utilisent `df02143b6018aa1c6d54c7d6359ce94409a8e87f`.

Les cinq premiers builds desktop échouent avant la compilation applicative : `scripts/download-bin.mjs` importe un export par défaut absent de `tar` 7. Le correctif charge son espace de noms ; syntaxe Node et vraie création/extraction gzip-tar passent localement. Relancer les cibles avec ce correctif ; ne pas qualifier les jobs de sélection ignorée comme des compilations réussies.

La [PR #28](https://github.com/TRON-ABS/Novera/pull/28) est fusionnée : chemins Android et prérequis CLI/Gradle corrigés. Les nouveaux contrôles source réussissent ; CLI et Android CI sont relancés. Le portable exige aussi une correction du format SHA-256 après `sha2` et le retrait des valeurs 1.0.0 figées dans ses scripts. Huit tests Rust portables, 18 tests Python de distribution et 12 contrats Node ciblés passent après ces changements. Le nouveau packaging impose le moteur texte courant ; la provenance du runtime de base réutilisé reste distincte.

## Livraisons partielles vérifiées

Les corrections de préparation #29 à #39 sont fusionnées : portable, chemins CLI Windows, API zbus Linux, génération Android, transitions documentaires, descripteurs de validation et transfert direct CI vers les brouillons. Les corrections d'outillage ne sont pas assimilées à des compilations natives réussies.

- [Windows ARM64 1.0.1](https://github.com/TRON-ABS/Novera/releases/tag/v1.0.1-windows-arm64) est publié. [Compilation signée](https://github.com/TRON-ABS/Novera/actions/runs/42341687065) et [installation/remplacement/interface natifs](https://github.com/TRON-ABS/Novera/actions/runs/42345384781) réussis. Le paquet est signé par la clé updater Novera ; ces contrôles isolés ne certifient pas une transition entre deux applications publiques.
- [CLI 1.0.1](https://github.com/TRON-ABS/Novera/releases/tag/v1.0.1-cli-novera) est publiée pour Windows x64, Linux x64 et macOS ARM64. Le [run 42343121038](https://github.com/TRON-ABS/Novera/actions/runs/42343121038) passe sur les trois hôtes ; le test explicite d'archive signée, remplacement et lancement isolés réussit sur chacun. Les signatures finales et empreintes sont vérifiées avant transfert et après stockage GitHub.
- [Android 1.0.1 / 1000013](https://github.com/TRON-ABS/Novera/releases/tag/v1.0.1-android-1000013) est publiée : APK release locale, certificat de production conservé, signature/alignement et six ELF vérifiés. SHA-256 APK : `e3656733703b26ef306ddd6d0d03c2cbf2d2bb63fae0b8affc4012e9dfa4a3e7`. Aucun essai téléphone de cette APK n'est revendiqué. Le correctif de régénération Android #38 est lancé séparément en CI.
- Le canal global `latest` reste volontairement sur la sortie 1.0.0 pendant les compilations Windows x64, portable, Linux et Mac Intel. Ces publications de plateformes ne changent pas le canal Desktop de l'installation 1.0.0 du mainteneur.
- Linux atteint la compilation et la signature finales, puis le run 42345624586 échoue sur la première capture WebDriver après le message attendu. Le diagnostic conserve la lecture DOM et une seconde capture réussie ; le run échoué reste compté comme tel. Une relance native est en cours, la capture reçoit un retry borné séparément.

Les identités de signature disponibles sont copiées dans une sauvegarde privée hors dépôt. Les 18 fichiers sont contrôlés ; la restauration Android et la récupération chiffrée de la même clé updater Windows/macOS/Linux/CLI/portable sont vérifiées. Aucun secret n'est ajouté au dépôt.

## Livraison

Préparer les paquets signés et leurs reçus par plateforme. Android exige le certificat de production existant ; le candidat debug CI ne sert pas de mise à jour publique. iOS conserve ses prérequis Apple et ses essais sur appareil. MSI/Debian ne deviennent pas publiables par une compilation seule.

Avant de modifier le canal public, vérifier les signatures, tailles, empreintes et la transition depuis la 1.0.0 sur profil isolé. Toute nouvelle release `latest` doit préserver les manifests desktop, CLI actuel `latest-novera-cli.json`, CLI historique `latest-cli.json` et portable, ainsi que les références immuables des plateformes non remplacées. Ne pas confondre les deux noms CLI.

La vitrine doit annoncer uniquement les téléchargements disponibles. Les anciens paquets 1.0.0 restent immuables.
