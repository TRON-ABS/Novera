# Novera — instructions du projet

## Direction produit : automatisation avancée, simplicité mondiale

Novera prend en charge la complexité technique pour que chacun puisse discuter, créer et apprendre au même endroit. Concevoir les parcours autour de l’intention de l’utilisateur, avec des choix automatiques utiles, des explications compréhensibles dans les 80 locales et un accès direct aux réglages avancés.

- Automatiser les tâches déjà prises en charge : diagnostic matériel, sélection du moteur compatible, installation confirmée des configurations conseillées, vérification des fichiers, progression, mémoire des modèles et sauvegarde dans les bons dossiers système.
- La gestion mémoire est **Automatique par défaut** : attendre les travaux locaux actifs, préserver leurs modèles auxiliaires, décharger les modèles inutilisés puis charger le modèle demandé. Garder les fichiers, conversations, sélections et réglages ; recharger à la prochaine demande. Les appels cloud seuls ne nécessitent pas d’éviction locale.
- Le mode **Manuel** autorise des modèles texte/image/vidéo concurrents dans des discussions distinctes, selon les capacités réelles de RAM/VRAM. Ne pas interrompre une génération en cours lors d’un changement de préférence. Les nouvelles demandes utilisent la nouvelle préférence. Les moteurs média qui terminent leur processus libèrent naturellement leurs poids même en Manuel.
- L’optimisation ne supprime jamais les fichiers du mainteneur ou de l’utilisateur. Une attente ou un échec doit être explicite ; ne pas annoncer une libération réussie si le moteur refuse de se décharger.
- Garder les confirmations nécessaires pour les téléchargements, licences, coûts cloud et actions sensibles, en respectant les consentements existants. L’automatisation produit ne signifie pas autonomie sans limites ni validation universelle de tous les matériels/modèles.
- Distinguer fonctions effectivement présentes, validation des sources, essais matériels et objectifs futurs. Maintenir la vitrine et les références cohérentes ; rechercher le maximum de simplicité sans masquer les limites utiles à la décision.

Le produit est **Novera**, maintenu par TRON-ABS : https://github.com/TRON-ABS/Novera.
Contact officiel : [contact.novera.tronabs@gmail.com](mailto:contact.novera.tronabs@gmail.com).
Objectif : **Knowledge for everyone.**

## Points d’entrée

Lire [le tableau de bord](TABLEAU_DE_BORD_NOVERA.md) pour l’état actuel, [le guide de développement](docs/DEVELOPMENT.md) pour l’architecture et [la feuille de route](ROADMAP.md) pour le travail restant. Mettre à jour le document de référence concerné après un changement, avec sa date et ses validations réelles ; éviter les nouveaux journaux Markdown par tâche.

## Règles de travail

- Sources principales : `C:\msys64\home\jmsga\Novera`. Préserver modifications locales, modèles, conversations, profils et identifiants. Ne pas importer ni effacer automatiquement les profils Jan.
- Application : `Novera-Desktop.exe`, identifiant `io.github.tronabs.novera`. Nouvel état d’agent : `~/.novera`. Instructions prioritaires : `NOVERA.md`, repli configurable sur `AGENTS.md`.
- Tout texte visible ajouté **ou modifié** doit être traduit dans les **80 locales** dans la même modification. Actualiser l’inventaire et exécuter `python scripts/check-novera-locales.py` ; le repli anglais ne remplace pas une traduction. Actualiser les nombres de locales de façon ciblée, sans remplacement global des valeurs numériques ni modification des chiffres historiques.
- À chaque mise à jour du dépôt, contrôler et actualiser aussi sa **vitrine GitHub** : description « À propos » et site associé (réglages distincts du README), README anglais/français rendus, chiffres des langues/fournisseurs/catégories, liens et images, sujets et état des versions publiques. Aligner les affirmations sur les sources et validations réelles ; distinguer sources publiées, builds locaux et binaires publics. Vérifier le résultat en ligne après publication. Ne pas annoncer la synchronisation terminée si la vitrine reste périmée ; signaler précisément tout champ impossible à modifier. Ce contrôle ne déclenche ni compilation, ni publication de binaire, ni activation de GitHub Actions.
- Respecter les six domaines de `architecture/modules.json`. Utiliser les règles pures et les adaptateurs ; vérifier `yarn check:architecture` et `yarn test:architecture` après modification des frontières. La migration du code historique reste progressive.
- Les versions Android proviennent uniquement de `scripts/android/toolchain.json`, des scripts et modèles associés. Les fichiers générés et caches ne sont pas la source des réglages. Une compilation locale ne prouve ni une validation officielle de la combinaison ni le fonctionnement sur téléphone.
- Vérifier les sources officielles et dater les modifications de catalogues cloud. Voir [la maintenance des fournisseurs](docs/USER_GUIDE.md#cloud).
- Conserver licences, notices, auteurs et attributions ; un renommage ne transfère pas les droits. Préserver les interfaces de compatibilité et l’identité des services tiers selon [le guide](docs/DEVELOPMENT.md#compatibility).

## Autorisations et état courant

Le **27 octobre 2026**, le mainteneur demande aussi l’application de la fenêtre commune, Nouveau projet sur dossier, choix initial des accès au dossier et au shell, toutes les langues déjà disponibles et préparation de l’interface vidéo. Le consentement au dossier ne vaut jamais accord implicite de modification/suppression ; le shell exige son propre premier choix. Le lot met à jour les sources, MD, dépôt et vitrine sans nouvelle compilation ni publication de binaire.

Le **27 octobre 2026**, le mainteneur demande de publier les dix nouvelles langues et de mettre à jour les Markdown, le dépôt et la vitrine. Les sources passent à 80 locales ; les essais Lara sans clé ne constituent pas six catalogues supplémentaires. Aucune compilation ni publication de binaire pour ce lot.

Le **26 octobre 2026**, le mainteneur demande la mise à jour des MD, du dépôt et de sa vitrine après le panneau compact, les consignes Texte/Image/Vidéo dans 70 langues, Réinitialiser, Auto amélioré et les tailles finales ×2/×4. La publication des sources et des documents est autorisée. Un build Windows a déjà été compilé et contrôlé localement pour ce lot ; cette synchronisation ne déclenche ni compilation supplémentaire, ni publication de binaire, ni activation des Actions.


Le **26 octobre 2026**, le mainteneur demande aussi la publication de l’installation conseillée, de la bibliothèque média, du moteur image embarqué et la mise à jour des MD et de la vitrine. Conserver Qwen3 GGUF CPU ; le Qwen NVFP4 a été explicitement annulé. Cette demande ne lance pas de compilation de Novera ni de publication de binaire.

Le mainteneur a demandé le **25 octobre 2026** que le dépôt reflète toutes les dernières sources et documentations. Les publications de sources sont autorisées ; exclure secrets, configuration locale, données utilisateur, exécutables/APK, caches et diagnostics bruts. Garder GitHub Actions désactivé.

Le mainteneur a demandé ensuite le **26 octobre 2026** de **mettre à jour le dépôt et sa vitrine avec les fournisseurs cloud et les nouvelles capacités**. Cette demande autorise la publication des sources et des documents, et remplace la pause de publication précédente. Elle ne déclenche aucune compilation supplémentaire de l’application, publication de binaire ou activation de GitHub Actions. Les tests de l’exécutable compilé par le mainteneur restent distincts des validations des sources.

Les compilations locales demandées les 23–25 octobre et le test synthétique Europe sont historiques et décrits dans [l’historique](docs/CHANGELOG.md). Une synchronisation de sources ou de documentation ne déclenche aucune nouvelle compilation, installation ni publication de binaire.

Les mises à jour automatiques restent désactivées avant validation de la chaîne signée Novera. Statistiques et suivi des erreurs sont indépendants et désactivés par défaut ; ne pas modifier les consentements du profil utilisateur pendant les tests. Le paramètre desktop explicite `-WithTelemetry` lit uniquement la configuration publique du fichier local ignoré `web-app/.env.local`, sans publier ses valeurs ni accorder de consentement. Android reste désactivé dans le lanceur.

Politiques conservées : [identité](BRANDING.md), [versions officielles et provenance](OFFICIAL_RELEASES.md), [contribution](CONTRIBUTING.md).
