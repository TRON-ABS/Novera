# Lecture continue des réponses — 7 novembre 2026

Préparation de la version 1.0.1. Version applicative inchangée : 1.0.0 ; aucune publication ou compilation Desktop de livraison. Le mainteneur compilera son application.

## Problème et corrections

Le lecteur LFM3 attendait la fin d'un WAV avant de demander le suivant. Cette séquence ajoutait tout le temps de génération au silence entre les extraits. Le code prépare désormais un extrait pendant la lecture du précédent, puis programme le démarrage sur l'horloge AudioContext à la fin exacte du précédent. Au plus deux sources sont programmées et une requête de synthèse est en cours ; aucune génération illimitée en avance. Le lecteur attend la fin du dernier extrait avant de réactiver l'écoute.

Les requêtes sont séparées aux limites des phrases et paragraphes, avec un plafond inchangé de 240 caractères Unicode / 1200 octets côté natif. La dernière phrase est envoyée comme extrait complet quand sa taille le permet. Ce choix réduit le risque qu'une synthèse générative omette une fin de texte ; il ne constitue pas une garantie de fidélité pour tout texte.

Pour les modèles classiques, le backend reste la voix système. Windows garde les réponses usuelles dans une seule session de synthèse : plafond par extrait porté de 1800 à 4500 caractères, en conservant les limites natives (64 KiB et 600 secondes). Les réponses très longues restent découpées pour éviter de dépasser ces bornes. Le navigateur compatible met au plus deux énoncés locaux en file, au lieu de recréer chaque énoncé après la fin du précédent ; son délai est réinitialisé au début réel de l'énoncé. Les voix distantes restent refusées.

Les échecs du helper Windows sont désormais signalés au lieu d'être assimilés à une lecture réussie. L'annulation de son signal cible la même session native. Couper le son, arrêter ou perdre le premier plan conserve l'arrêt prioritaire. Aucun droit de capture en arrière-plan ni changement de consentement.

## Validation

214 tests dans 9 fichiers, zéro échec. Ils couvrent notamment l'ordre de la file, l'attente de la dernière phrase, la programmation sans intervalle sur l'horloge audio, la file bornée, l'annulation pendant la préparation/lecture, le refus d'un échec de synthèse silencieux et la régénération. TypeScript et ESLint des deux bibliothèques modifiées : réussis. Build web Windows : réussi en 6,30 secondes, avec avertissements préexistants de découpage et taille des bundles. Les erreurs de lint préexistantes de la route chat ne sont pas incluses dans cette annonce.

Vraie application Windows debug, profil isolé, vrai LFM3-Omni Q4_K_M et moteur llama.cpp v0.9.0 build12110 (cd959bae99ff4bed22bef2604f45241c09bbb8c8). Phrase de test publique comportant 1889, 2019, 2026, 2,50, 21,7, 80,05 et 1,5, suivie de la phrase signalée par le mainteneur. Ce texte est un exemple inventé, pas une collection de faits sourcés.

- Voix masculine puis féminine : quatre phrases chacune, huit WAV valides, huit démarrages et huit fins de lecture. Les huit entrées sont présentes dans le JSON joint, sans perte de fin de texte.
- Six transitions entre extraits : intervalle ajouté par le lecteur **0 seconde**, mesuré sur les heures programmées et les durées réelles des buffers. Cela n'exclut pas les pauses naturelles contenues dans les audios générés.
- Le dernier WAV de chaque voix a été retranscrit localement, sans micro. Résultat exact dans les deux cas : « Ces trois faits sont des données factuelles vérifiables via des sources en ligne. » Cette vérification par le même modèle complète le test ; elle n'est pas une expertise indépendante de prononciation.
- Même texte lu jusqu'à la fin par le vrai backend vocal système Windows ; opération terminée avec succès.
- Confirmation du mainteneur après l'essai : **« Oui, lecture fluide et complète »**.
- Contextes audio fermés, pas d'ouverture de microphone. Profils et journaux temporaires supprimés après les essais ; aucun audio conservé.

Le premier passage du banc a joué les quatre phrases masculines puis échoué dans l'import de son outil de retranscription. L'import du banc a été corrigé et l'essai complet relancé avec succès ; ce défaut du banc n'était pas une erreur du lecteur.

## Limites

Le chemin commun s'applique aux modèles utilisant les backends concernés, pas uniquement à un modèle de chat précis. Le test matériel porte sur Omni et la voix système Windows. LFM3-Audio et les voix système des autres plateformes n'ont pas été réessayés matériellement. Les traductions ne changent pas dans ce lot.

Une machine qui produit l'audio plus lentement que sa lecture peut encore manquer de tampon. Les moteurs système peuvent imposer leurs propres pauses, notamment entre les blocs de réponses dépassant 4500 caractères sous Windows. Aucune promesse de zéro interruption sur tous les matériels, langues, moteurs ou réponses. La véracité des faits générés et des citations n'est pas corrigée par ce lot.
