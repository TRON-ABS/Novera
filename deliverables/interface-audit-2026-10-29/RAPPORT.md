# Audit de l’interface et génération en série — 29 octobre 2026

## Périmètre

L’audit porte sur les sources locales de Novera : menus, configurations,
paramètres, fournisseurs, modèles, dépendances, dialogue de conversation,
indicateurs de progression et contrôles de création. Le nouveau catalogue
`ui.json` contient 616 entrées ; la référence anglaise totalise 2 400 entrées
dans 15 espaces de noms.

Les textes auparavant écrits directement dans les composants utilisent les
catalogues. Un registre traduit également les titres, descriptions, choix et
aides des réglages livrés sous forme de métadonnées. Les noms personnalisés
des extensions et textes saisis par l’utilisateur restent leurs propres textes.
Les formes plurielles suivent les catégories Intl de la langue sélectionnée.
Les commandes Ouvrir/Quitter de la zone de notification reçoivent la langue de
l’interface ; leur validation dans le binaire attend la compilation.

Les aides précisent la différence entre langue d’interface et langue de réponse,
les points à vérifier dans la documentation d’un modèle, et le fonctionnement
des générations successives. Les noms de produits, modèles, protocoles,
commandes et unités techniques conservent leur écriture requise.

## Images, musique et vidéo

Le contrôle Quantité propose les valeurs 1 à 10, avec 1 par défaut. Il suit le
contrôle de graine des panneaux locaux et existe aussi pour les fournisseurs
cloud. Images, musique et vidéo conservent chacune leur propre valeur.

Les tâches s’exécutent successivement, dans un même message de résultat, avec
les réglages de départ et la politique de graines existante. Chaque tâche
libère ses ressources avant la suivante. Arrêter annule la tâche active et la
suite ; une erreur interrompt la série. Le sélecteur est désactivé pendant la
génération. Les demandes sauvegardées sans quantité utilisent la valeur 1.

## Origine et limites des traductions

Les traductions existantes sont conservées, à l’exception des passages repérés
comme restant identiques à une phrase anglaise. Les nouvelles traductions
proviennent de Google/Microsoft, de brouillons produits par le modèle local
déjà installé et d’adaptations rédigées par l’assistant. Seuls les textes publics de l’interface ont été soumis aux
services de traduction ; aucun message de conversation, identifiant secret ou
réglage privé n’a été envoyé.

Les variantes régionales sont demandées explicitement et ancrées dans les
catalogues existants. Une couverture des clés à 100 % ne constitue pas une
validation linguistique native. Les limites dialectales historiques décrites
dans `docs/LANGUAGES.md` demeurent ; relecture native, contrôle visuel des 80
langues et vérification dans l’application compilée restent nécessaires.

## Vérifications

- Analyse statique : 2 117 appels, aucune clé manquante et aucun texte littéral
  d’interface non examiné dans le périmètre du vérificateur.
- Générations et menu natif : 94 tests ciblés réussis.
- Composants concernés : 170 tests ciblés réussis.
- Indicateur de progression : 9 tests réussis, également inclus dans les composants.
- TypeScript sans émission : réussi.
- Architecture : 26 fichiers contrôlés, aucune violation.
- Catalogues, métadonnées et régressions des deux écrans corrigés : 945 tests
  réussis, aucun échec ; trois cas d’installation déjà désactivés restent ignorés.
- Contrôle des 80 catalogues intégrés : 2 400 clés chacun, aucune erreur de
  structure, d’interpolation, de code ou de marqueur temporaire.
- Cache de traduction : 50 111 couples texte/langue requis, aucune entrée
  manquante ou invalide. Douze anciennes entrées wolof contaminées par des
  marqueurs ont également été corrigées, avec conservation des valeurs précédentes
  dans `existing-marker-repairs.json`.
- Lint des 77 fichiers du périmètre initial : aucune erreur. Les dix avertissements
  liés aux fonctions de traduction ont été corrigés ; le contrôle ciblé final
  n’a plus d’avertissement. Les cinq autres avertissements concernent les
  dépendances des objets d’état et les exports pour le rafraîchissement à chaud.

Les suites ci-dessus se recouvrent et leurs nombres ne doivent pas être additionnés.
Rapports : [catalogues](catalog-validation.json), [cache](cache-validation.json),
[contrôles finaux](verification-summary.json). Les valeurs précédentes et
les brouillons de reprise sont conservés pour relecture.

Aucune compilation de l’application, du natif ou des
extensions n’est effectuée. Aucune génération réelle sur GPU ou fournisseur
payant n’est lancée ; les tests utilisent des services simulés. Compilation et
validation de l’application produite restent à la charge du mainteneur.
