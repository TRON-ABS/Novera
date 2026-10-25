# Synchronisation des sources — 25 octobre 2026

> Ce document décrit la publication de synchronisation précédente à 1 513 clés.
> Le complément ultérieur [DSpark et suivi des erreurs au premier démarrage](FIRST_RUN_OPTIONS.md)
> porte les 36 catalogues à 1 516 clés.

Cette publication aligne le dépôt avec les sources et la documentation du
dossier principal. Elle complète les publications du nettoyage Jan et des
noms internes Novera déjà présentes sur `main`.

## Contenu synchronisé

- Les 36 catalogues couvrent les 1 513 clés anglaises actuelles : les 757
  traductions manquantes du wu et 9 219 entrées des 16 catalogues hérités sont
  intégrées. La relecture par des locuteurs natifs reste nécessaire.
- Les contrôles de couverture s’appliquent aussi aux langues héritées ; les
  README et documents de suivi présentent les mêmes chiffres.
- Le lanceur Desktop inclut son option explicite `-WithTelemetry`, avec lecture
  limitée aux deux valeurs publiques du fichier local ignoré. Les consentements
  restent indépendants et désactivés par défaut.
- Les derniers workflows manuels de paquet portable, tests et documents de
  maintenance sont inclus. GitHub Actions reste désactivé.
- Les comptes rendus et résumés structurés des compléments de langues sont
  publiés ; les brouillons et journaux bruts restent locaux.

## Vérifications locales

- Suite web complète : **5 177 tests réussis, 2 ignorés, aucun échec**.
- TypeScript sans émission : réussi lors du contrôle des mêmes sources
  applicatives ; les ajouts de cette synchronisation portent ensuite sur les
  catalogues, leurs contrôles, le lanceur et la documentation.
- Catalogues : 36/36 à 1 513/1 513 clés, aucune erreur de validation.
- Architecture, mises à jour et configuration Android : 13 tests Node réussis.
- Lanceur : 69 assertions réussies, sans compilation ni modification du binaire.
- Configuration de télémétrie : 16 assertions réussies sur valeurs synthétiques,
  sans appel réseau, clé réelle ou exécution du contenu dotenv.
- Le renommage précédent a passé 223 assertions de paquet portable et trois
  tests Rust d’installateur ; cette synchronisation n’en change pas la logique.

Le contrôle de publication compare les empreintes Git des fichiers sélectionnés
avec le dossier principal après normalisation des fins de ligne texte. Une
seconde comparaison après l’envoi confirme qu’aucune source publiable ne reste
en attente selon ce périmètre.

## Ce qui reste local

Secrets et fichiers `.env`, profils, modèles et conversations, dépendances
installées, caches, journaux, captures et rapports bruts, anciens dossiers de
travail, exécutables, APK et archives de compilation ne sont pas publiés.
Leur présence dans le dossier ne constitue pas un retard de mise à jour des
sources. Les états plus anciens des documents et rapports restent historiques.

Aucune nouvelle compilation applicative, installation, publication de binaire,
activation de CI, modification de consentement ou requête PostHog n’est faite
pour cette synchronisation. Le dernier exécutable local reste celui de sa
compilation précédente ; il ne contient pas automatiquement les nouvelles
traductions ni les derniers noms internes.
