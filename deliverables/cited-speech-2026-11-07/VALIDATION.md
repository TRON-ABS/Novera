# Citation cachée et langue de la voix — 7 novembre 2026

Le mainteneur signale encore une lecture dans une autre langue. La capture montre une formule suivie du pictogramme « W ». Il a déjà précisé que le défaut concerne la voix.

## Élément manquant reproduit

`RenderMarkdown` transforme `[[cite:URL]]` en pastille avec favicon. Le contrôleur vocal recevait cependant le texte brut et conservait ce marqueur. Avec `3 + 7 = 10 [[cite:https://fr.wikipedia.org/wiki/Addition]]`, le nettoyage laissait donc la formule **et son URL** ; la préparation des réponses numériques ne reconnaissait plus une formule seule et ne l'explicitait pas en français.

Les source maps privées de la compilation locale **1.0.0-2026-11-07_01-29-57-032** confirment la présence des premiers correctifs de langue et de calcul, mais pas du retrait des citations. Le dossier compilé est contrôlé ; aucun processus Novera n'était visible au moment du contrôle pour attester le chemin du dernier exécutable lancé. Aucun symbole privé n'est copié dans ces preuves.

Le correctif retire maintenant les citations web, leurs URL cachées et les marqueurs tronqués avant de préparer le texte parlé. Les pastilles et les réponses affichées/enregistrées restent inchangées. Résultat : **« Calcul : trois plus sept égale dix. »** transmis au moteur en `fr`.

## Vérifications exécutées

- Deux régressions : retrait des marqueurs complets/multiples/tronqués et passage d'une réponse numérique citée au backend sans URL. Vérification du résultat de la normalisation française.
- **60 tests vocaux réussis dans cinq fichiers**, TypeScript, ESLint ciblé et compilation web réussis.
- Vraie application Windows debug, profil isolé, **contrôleur `VoiceConversation` de production**, vrai backend et vrai modèle LFM3-Omni. Réponse citée fournie comme fixture après les textes « quoi. » puis « tu pense a quoi ? » ; reconnaissance et génération du chat ne sont pas présentées comme réelles dans ce test. Le contrôleur retire la citation, le backend reçoit la phrase française exacte et produit deux audios natifs, masculin et féminin. Deux lectures terminées, contextes fermés, reprise d'écoute observée puis arrêt ; aucun microphone ouvert.
- Le mainteneur confirme : **« Oui, les deux sont en français, sans lien »**.
- Contrôle natif distinct avec cache actif, slot 0 et identifiant de fil : première réponse `3 + 7 = 10`, synthèse native entre les tours, puis nouvelle consigne demandant seulement « bonjour ». Réponse obtenue : `Bonjour`. Aucune répétition du calcul dans ce contrôle. Cela ne valide pas la pertinence générale des réponses du modèle aux questions courtes.

[Résultats, avant/après et empreintes](validation.json). Moteur inchangé : llama.cpp **v0.9.0/build 12110**, commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8`.

Le profil et son journal temporaires sont supprimés ; processus et serveur de test arrêtés. Aucun audio utilisateur enregistré, aucune conversation personnelle modifiée et aucun binaire de livraison remplacé. Le correctif JavaScript reste à intégrer dans la prochaine compilation Desktop du mainteneur. Les essais précédents de lecture numérique utilisaient une formule sans citation ; leur réussite ne couvrait pas ce cas.
