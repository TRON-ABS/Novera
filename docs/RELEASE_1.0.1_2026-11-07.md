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
- Suites applicatives et compilations natives : résultats à consigner après exécution ; les preuves de la 1.0.0 ne valent pas validation de la 1.0.1.

## Livraison

Préparer les paquets signés et leurs reçus par plateforme. Android exige le certificat de production existant ; le candidat debug CI ne sert pas de mise à jour publique. iOS conserve ses prérequis Apple et ses essais sur appareil. MSI/Debian ne deviennent pas publiables par une compilation seule.

Avant de modifier le canal public, vérifier les signatures, tailles, empreintes et la transition depuis la 1.0.0 sur profil isolé. Toute nouvelle release `latest` doit préserver les manifests desktop, CLI actuel `latest-novera-cli.json`, CLI historique `latest-cli.json` et portable, ainsi que les références immuables des plateformes non remplacées. Ne pas confondre les deux noms CLI.

La vitrine doit annoncer uniquement les téléchargements disponibles. Les anciens paquets 1.0.0 restent immuables.
