# Novera 1.0.1 — suivi de publication

Le mainteneur autorise le 7 novembre 2026 la mise à jour du dépôt, de la vitrine et des distributions en 1.0.1, y compris les nouveaux modèles des fournisseurs API.

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

## Livraison

Préparer les paquets signés et leurs reçus par plateforme. Android exige le certificat de production existant ; le candidat debug CI ne sert pas de mise à jour publique. iOS conserve ses prérequis Apple et ses essais sur appareil. MSI/Debian ne deviennent pas publiables par une compilation seule.

Avant de modifier le canal public, vérifier les signatures, tailles, empreintes et la transition depuis la 1.0.0 sur profil isolé. Toute nouvelle release `latest` doit préserver les manifests desktop, CLI actuel `latest-novera-cli.json`, CLI historique `latest-cli.json` et portable, ainsi que les références immuables des plateformes non remplacées. Ne pas confondre les deux noms CLI.

La vitrine doit annoncer uniquement les téléchargements disponibles. Les anciens paquets 1.0.0 restent immuables.
