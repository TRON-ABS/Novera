# Novera — instructions du projet

Le produit est **Novera**, maintenu par TRON-ABS : https://github.com/TRON-ABS/Novera.
Contact officiel : [contact.novera.tronabs@gmail.com](mailto:contact.novera.tronabs@gmail.com).
Objectif : **Knowledge for everyone.**

## Points d’entrée

Lire [le tableau de bord](TABLEAU_DE_BORD_NOVERA.md) pour l’état actuel, [le guide de développement](docs/DEVELOPMENT.md) pour l’architecture et [la feuille de route](ROADMAP.md) pour le travail restant. Mettre à jour le document de référence concerné après un changement, avec sa date et ses validations réelles ; éviter les nouveaux journaux Markdown par tâche.

## Règles de travail

- Sources principales : `C:\msys64\home\jmsga\Novera`. Préserver modifications locales, modèles, conversations, profils et identifiants. Ne pas importer ni effacer automatiquement les profils Jan.
- Application : `Novera-Desktop.exe`, identifiant `io.github.tronabs.novera`. Nouvel état d’agent : `~/.novera`. Instructions prioritaires : `NOVERA.md`, repli configurable sur `AGENTS.md`.
- Tout texte visible ajouté **ou modifié** doit être traduit dans les **70 locales** dans la même modification. Actualiser l’inventaire et exécuter `python scripts/check-novera-locales.py` ; le repli anglais ne remplace pas une traduction. Actualiser les nombres de locales de façon ciblée, sans remplacement global des valeurs numériques ni modification des chiffres historiques.
- À chaque mise à jour du dépôt, contrôler et actualiser aussi sa **vitrine GitHub** : description « À propos » et site associé (réglages distincts du README), README anglais/français rendus, chiffres des langues/fournisseurs/catégories, liens et images, sujets et état des versions publiques. Aligner les affirmations sur les sources et validations réelles ; distinguer sources publiées, builds locaux et binaires publics. Vérifier le résultat en ligne après publication. Ne pas annoncer la synchronisation terminée si la vitrine reste périmée ; signaler précisément tout champ impossible à modifier. Ce contrôle ne déclenche ni compilation, ni publication de binaire, ni activation de GitHub Actions.
- Respecter les six domaines de `architecture/modules.json`. Utiliser les règles pures et les adaptateurs ; vérifier `yarn check:architecture` et `yarn test:architecture` après modification des frontières. La migration du code historique reste progressive.
- Les versions Android proviennent uniquement de `scripts/android/toolchain.json`, des scripts et modèles associés. Les fichiers générés et caches ne sont pas la source des réglages. Une compilation locale ne prouve ni une validation officielle de la combinaison ni le fonctionnement sur téléphone.
- Vérifier les sources officielles et dater les modifications de catalogues cloud. Voir [la maintenance des fournisseurs](docs/USER_GUIDE.md#cloud).
- Conserver licences, notices, auteurs et attributions ; un renommage ne transfère pas les droits. Préserver les interfaces de compatibilité et l’identité des services tiers selon [le guide](docs/DEVELOPMENT.md#compatibility).

## Autorisations et état courant

Le mainteneur a demandé le **25 octobre 2026** que le dépôt reflète toutes les dernières sources et documentations. Les publications de sources sont autorisées ; exclure secrets, configuration locale, données utilisateur, exécutables/APK, caches et diagnostics bruts. Garder GitHub Actions désactivé.

Le mainteneur a demandé ensuite le **26 octobre 2026** de **mettre à jour le dépôt et sa vitrine avec les fournisseurs cloud et les nouvelles capacités**. Cette demande autorise la publication des sources et des documents, et remplace la pause de publication précédente. Elle ne déclenche aucune compilation supplémentaire de l’application, publication de binaire ou activation de GitHub Actions. Les tests de l’exécutable compilé par le mainteneur restent distincts des validations des sources.

Les compilations locales demandées les 23–25 octobre et le test synthétique Europe sont historiques et décrits dans [l’historique](docs/CHANGELOG.md). Une synchronisation de sources ou de documentation ne déclenche aucune nouvelle compilation, installation ni publication de binaire.

Les mises à jour automatiques restent désactivées avant validation de la chaîne signée Novera. Statistiques et suivi des erreurs sont indépendants et désactivés par défaut ; ne pas modifier les consentements du profil utilisateur pendant les tests. Le paramètre desktop explicite `-WithTelemetry` lit uniquement la configuration publique du fichier local ignoré `web-app/.env.local`, sans publier ses valeurs ni accorder de consentement. Android reste désactivé dans le lanceur.

Politiques conservées : [identité](BRANDING.md), [versions officielles et provenance](OFFICIAL_RELEASES.md), [contribution](CONTRIBUTING.md).
