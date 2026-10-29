# Novera — règles d’or du produit et de l’information utilisateur

Référence normative demandée par le mainteneur le 29 octobre 2026. Ces règles concernent toute Novera : démarrage, tableau de bord, conversations, configurations, modèles, outils, créations et vitrine. Elles définissent les exigences ; elles ne constituent pas une certification de tous les appareils ou de toutes les traductions.

## 1. Informer pour permettre d’agir

Chaque fonction explique son utilité, ses prérequis, son effet et ses limites importantes au moment où l’utilisateur en a besoin. Une icône seule ne remplace pas un nom accessible. Les réglages complexes disposent d’une aide courte et d’une explication détaillée accessible.

L’information répond aux questions : « Que puis-je faire ? », « Que dois-je installer ou connecter ? », « Où va ma demande ? », « Que change ce réglage ? », « Où retrouver mon résultat ? » et « Que faire en cas d’échec ? ». Employer des mots simples ; définir les termes utiles : graine, encodeur, VAE, RAM, VRAM, contexte, résolution, cadence et clé API.

Ne pas présenter une possibilité comme prête si elle exige encore une installation, une clé, un abonnement, une compilation ou une vérification matérielle. Distinguer les limites du logiciel, du modèle, du fournisseur et de la machine. Exclure des aides les secrets, détails internes inutiles et informations personnelles provenant des conversations de développement.

## 2. Les 80 langues font partie du fonctionnement

Toute nouvelle information visible est préparée dans les 80 catalogues : menus, boutons, infobulles, états, erreurs, dialogues, aides et noms accessibles. Réutiliser les clés qui portent exactement le même sens. Conserver variables, pluriels, unités et liens ; respecter les écritures de droite à gauche et les conventions de nombres et de durées.

Une chaîne anglaise copiée ou un repli anglais ne constitue pas une traduction achevée. Les noms officiels de modèles, formats et fournisseurs restent identifiables. Vérifier la structure des catalogues et l’affichage des textes longs ; distinguer cette vérification d’une relecture linguistique par des locuteurs et annoncer les limites de relecture.

## 3. Un seul tableau de bord adaptable

Conserver l’apparence approuvée, les couleurs et les états explicites. Les rangées s’adaptent à la largeur disponible : retour à la ligne, regroupement cohérent et commandes secondaires accessibles. La taille maximale actuelle du tableau de bord est de **1 024 px** ; un petit écran ne reçoit pas une largeur fixe de bureau. Placer Réglages à droite de Mémoire auto, puis le raccourci Téléchargements ; conserver l’ordre lorsque la rangée passe à la ligne.

Les mots traduits ne doivent ni se toucher ni recouvrir un interrupteur ou une commande. Préserver les espaces, permettre la hauteur nécessaire et conserver le nom accessible complet en mode compact. Les noms longs de modèles restent utilisables. Tenir compte du zoom, du clavier, du focus, du contraste, du tactile et de la réduction des animations.

Envoyer/Arrêter occupe une zone réservée à droite dans le cadre de saisie, sans masquer le texte ou la bordure. Utiliser le **bleu sombre**, avec un **petit carré de 12 px** pendant l’exécution, plutôt qu’un état rouge. Le passage Envoyer → Arrêter conserve l’annulation et les comportements de file d’attente. Toutes les commandes restent accessibles quand les outils sont regroupés sur petit écran.

## 4. Un démarrage guidé et une automatisation explicable

Guider du démarrage au résultat : choix du mode, installation des composants nécessaires, vérification, sélection du modèle, exécution, affichage et enregistrement. Montrer ce qui manque avec une action correspondante.

Expliquer Auto : reconnaissance de l’intention, orientation vers la tâche et réglages automatiques disponibles. Le choix explicite Texte, Image, Musique ou Vidéo garde priorité. Préserver profils, fichiers et préférences ; ne pas remplacer silencieusement une valeur manuelle. L’automatisation ne rend pas utilisables un modèle absent, une clé invalide ou un matériel insuffisant.

L’ajustement automatique de mémoire reste compréhensible et soumis aux limites matérielles. Ne pas relancer une opération coûteuse en changeant de fournisseur ou en multipliant les appels payants sans parcours prévu et explicite.

## 5. Modèles et composants : préciser leur rôle

Présenter ensemble le nom exact, la fonction et les composants nécessaires. Dans Configurations, préciser que **FLUX.2 Klein 4B et ses composants servent à l’image**. Expliquer simplement : l’encodeur traite la consigne ; le modèle produit les représentations du média ; le VAE participe à leur conversion vers le résultat. Les composants ne sont pas universellement interchangeables.

Séparer conversation, embeddings, image, musique, vidéo et agrandissement. Vérifier les noms et composants contre les manifestes du produit. Décrire les variantes de précision et leur compatibilité sans promettre un gain universel. Contextualiser les recommandations matérielles : une quantité de VRAM ne garantit pas seule la réussite.

L’installation affiche progression et erreurs ; vérifier les fichiers avant de les annoncer prêts. Distinguer téléchargement, intégrité, installation, chargement et génération. Identifier les composants manquants par leur rôle et leur réglage.

## 6. Fournisseurs cloud : identité et transparence

Afficher nom et icône officielle disponible de chaque fournisseur dans les parcours concernés et la vitrine Image, Musique et Vidéo. Réutiliser les actifs vérifiés du dépôt et leur provenance ; ne pas inventer de logo. Une icône ne signifie pas un partenariat ou une approbation.

Préciser le modèle utilisé, la nécessité d’une clé et les capacités prises en charge. Disponibilité, crédits, quotas et conditions dépendent du compte fournisseur. Une clé de conversation n’ouvre pas automatiquement tous les modèles multimédias.

Informer du traitement local ou distant avant un envoi cloud. Exclure les clés des erreurs, captures, journaux publics et documents. Actualiser les catalogues et nombres annoncés dans les README lorsqu’une intégration change.

## 7. Réglages de création compréhensibles

Expliquer séparément ratio et résolution : forme du cadre et dimensions en pixels. L’agrandissement augmente la taille et peut ajouter un traitement ; il n’est pas gratuit en temps ou en mémoire.

La graine contrôle une partie de l’aléatoire. Elle aide à comparer des essais dans un même environnement ; elle ne garantit pas des résultats identiques entre moteurs, versions ou fournisseurs.

La quantité est indépendante pour Image, Musique et Vidéo : **1 à 10, avec 1 par défaut**. Expliquer qu’elle multiplie les résultats demandés, le temps potentiel et éventuellement le coût. Les exécutions séquentielles conservent annulation et nettoyage ; un lot ne signifie pas dix calculs simultanés.

Pour Musique et Vidéo, distinguer durée du média, durée de calcul et temps total. Limites de durée et formats suivent le moteur. Une valeur manuelle valide reste prioritaire ; signaler les valeurs incomplètes sans substitution silencieuse. Expliquer style, voix, paroles, balises et Instrumental sans chanson prédéfinie.

## 8. Résultats et informations durables

Conserver une référence durable au fichier et les informations publiques mesurées : temps total, temps de génération lorsqu’il est connu et graine lorsqu’elle est disponible. Les conserver par résultat, y compris dans les lots ; ne pas attribuer le temps d’un résultat à un autre.

Restaurer ces informations après redémarrage. Pour les anciens résultats, récupérer seulement les valeurs présentes dans leurs fichiers d’informations valides. Ne jamais inventer une durée absente ni confondre la durée du lecteur avec celle de génération.

Permettre de retrouver le fichier et partager son original. Expliquer qu’un déplacement ou une suppression peut rendre la référence indisponible. Préserver l’historique ; une erreur de lecture ne déclenche pas son écrasement. Le partage d’un média transmet le fichier demandé sans imposer une capture du lecteur.

## 9. Erreurs utiles et actions adaptées

Conserver la cause réelle : composant manquant, clé, quota, modèle indisponible, mémoire, interruption, réseau, décodage ou écriture. Ne pas transformer toute exception en « configurez un modèle ». Masquer les secrets et borner les détails.

Proposer une action cohérente : vérifier sélection et composants, consulter le fournisseur, réduire résolution/charge mémoire, libérer de l’espace ou réessayer après résolution. Expliquer les conséquences d’un nouvel essai cloud. Ne pas annoncer de fichier enregistré si l’écriture échoue.

Les arrêts et erreurs libèrent commandes et ressources. Distinguer annulation et échec. Ne pas effacer les résultats obtenus d’un lot parce qu’une étape suivante échoue.

## 10. Accès aux outils et données

Expliquer la portée des accès aux dossiers, au shell et aux outils connectés. Respecter choix explicites et révocation. Auto n’est pas une autorisation universelle d’écrire, supprimer ou envoyer des données.

Les exemples publics restent génériques ; ne pas intégrer de contenu privé de développement aux profils proposés. Préserver clés, réglages personnels et fichiers sans rapport lors des mises à jour.

## 11. Documentation et vitrine maintenues ensemble

Le guide utilisateur explique comment utiliser les fonctions ; les présentes règles formalisent les exigences durables. NOVERA.md conserve les décisions ; PR.md décrit changement, preuves et limites. Les README présentent les capacités, modèles et fournisseurs réellement intégrés avec des images représentatives.

Maintenir la cohérence entre interface, configurations, aide, premier démarrage et vitrine. Décrire une nouveauté par son bénéfice et son utilisation. Garder les détails d’implémentation dans les documents techniques. Les comptes rendus datés restent des états historiques.

## 12. Vérification et publication honnêtes

Vérifier les parcours affectés, l’historique, les erreurs, les catalogues et l’architecture. Contrôler plusieurs largeurs et des traductions longues ; distinguer aperçu de mise en page et essai de l’application compilée. Ne pas annoncer de test natif ou de validation officielle sans preuve.

Pour ce lot, **le mainteneur réalise la compilation applicative**. Les tests web et contrôles de sources ne remplacent ni cette compilation ni les essais de GPU, d’appareils ou de fournisseurs. Ne pas lancer de génération payante pour vérifier une documentation.

Publier les fichiers utiles sans secrets, journaux ou artefacts. Respecter les protections de branche ; une exception pour une PR ne s’étend pas aux suivantes. Ne pas modifier les protections pour contourner un blocage. Distinguer travail local, PR, CI, fusion et disponibilité d’un nouveau binaire.

Voir aussi le [guide utilisateur](USER_GUIDE.md).
