# Microphone directement relié à LFM3-Omni — préparation 1.0.1

L'essai sur le microphone du mainteneur a reconnu exactement la phrase de référence et repris l'écoute après la réponse. Il confirme : **« Oui, texte exact et réponse lue »**.

## Parcours réalisé

Avec un LFM3-Omni local sélectionné chez llama.cpp : microphone → PCM mono 16 bits à 16 kHz → transcription par le vrai modèle → envoi normal de la discussion → réponse lue par la synthèse Windows → nouvelle écoute. Aucun repli silencieux sur la reconnaissance Windows si la transcription Omni échoue. La génération de voix native par Omni reste distincte.

Un détecteur d'énergie conserve 300 ms de préambule, attend 1 100 ms de silence et borne la phrase à 20 secondes. Le transport HTTP natif Tauri appelle le moteur sur `127.0.0.1` avec authentification Bearer. Le worker adapte en mémoire la transcription temps réel de **llama.cpp v0.9.0, build 12110, commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8`** ; aucun serveur WebSocket ni nouvelle dépendance ajouté. Aucune politique CORS ou permission distante élargie.

Les boutons, le repli et les libellés des 104 catalogues sont conservés. Cela ne signifie pas que 104 langues de reconnaissance ont été validées. L'entrée Omni a été essayée sur Windows x64 ; les autres plateformes restent à adapter et valider.

## Vérifications

- Poids existants `LFM3-Omni-2B-Q4_K_M.gguf` et `mmproj-LFM3-Omni-2B-Q4_K_M.gguf`, sans modification ni téléchargement.
- Trois phrases françaises synthétiques locales : trois transcriptions exactes sur CPU, puis les trois exactes sur CUDA/RTX 5070. CPU proche de 3 secondes par phrase ; CUDA entre 1,208 et 1,565 seconde, hors chargement.
- Vrai micro et modèle CPU dans une application debug isolée : **8 mots attendus, 8 reconnus, zéro erreur de mots**, sans tenir compte de la casse et de la ponctuation. Référence : « Bonjour, ceci est un test de reconnaissance vocale. » L'interface passe à la lecture de la réponse puis reprend l'écoute. Le mainteneur confirme exactitude et audibilité ; Stop ferme toutes les pistes.
- API : mauvaise clé 401, fréquence/base64 invalides 400, corps trop volumineux 413. Après annulation, modèle libéré en 1,016 seconde ; rechargement puis discussion textuelle encore fonctionnels.
- Tests ciblés : PCM, pauses, limites, absence de reconnaissance Windows, annulation pendant chargement, permission tardive, contrôle du premier plan. Résultats finaux, commandes et empreintes : [validation.json](validation.json).

Le contrôle complémentaire a reproduit un état WebView2 périmé : document focalisé et visible alors que la fenêtre native est minimisée, microphone encore ouvert. Le backend vérifie maintenant le vrai HWND appelant avant capture, puis toutes les 100 ms pendant capture/transcription. Une perte de premier plan ou une erreur annule l'opération. Ce délai d'échantillonnage n'est pas une garantie temps réel. La synthèse garde sa surveillance native existante.

Résultat final : **126 tests réussis dans six fichiers**, TypeScript et ESLint des modules vocaux réussis, compilation web réussie en 8,89 s. L'ESLint étendu à ChatInput relève trois erreurs React préexistantes, détaillées dans le JSON ; aucun lint global réussi n'est revendiqué. Worker release compilé en 9,12 s, application debug en 3 min 46 s, avec avertissements. Sur cette application, la minimisation ramène effectivement le bouton au repos et ferme toutes les pistes malgré l'état WebView2 périmé. La conversation humaine complète précède l'ajout final de cette garde ; la garde dispose de deux tests unitaires et de cet essai réel distinct.

## Confidentialité et limites

Ouverture du micro après action et permission, jamais au démarrage. Worklet local sans réseau ni son émis. PCM en mémoire, sans fichier audio du microphone. Stop et changements de contexte ferment pistes/contexte ; une permission tardive est immédiatement libérée. Threads natifs joints avant libération du moteur ; annulation vérifiée pendant la réponse HTTP. Diagnostics limités à la phase d'erreur.

Limites serveur : corps 1 400 000 octets, PCM 30 secondes, sortie 16 384 octets/1 024 tokens, délai 90 secondes ; client 95 secondes, capture interactive 20 secondes. Le texte envoyé suit le stockage normal des discussions. Le test humain a créé une discussion dans un profil temporaire isolé, ensuite supprimé avec son journal. Les preuves gardent les mesures et la référence publique, sans autre parole. Les compteurs IPC expérimentaux inopérants sont exclus : leurs zéros ne constituent pas des preuves.

Ce petit échantillon ne mesure pas la précision générale avec bruit, tous accents ou langues. Worker et exécutable debug compilés `--offline --locked`, compilation web vérifiée. Aucun paquet Desktop de livraison créé ni installation personnelle remplacée. La prochaine compilation habituelle reste au mainteneur. Les dossiers précédents sont des états historiques, complétés ici pour l'entrée audio Omni.
