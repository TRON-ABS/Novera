# Démarrage du modèle et transcription visible — préparation 1.0.1

Retour du mainteneur : erreur `Cannot read properties of undefined (reading 'kv_unified')` avec LFM3-Omni, micro activé sous Windows et cercle rouge, mais aucun texte visible. Le bouton de repli convient et reste inchangé.

## Cause confirmée et correction

Le journal local de l'application compilée par le mainteneur signale `Extension onLoad failed (@janhq/llamacpp-extension): SETTINGS is not defined`, également pour téléchargement. Aucun contenu personnel du journal n'est copié dans ce dossier. Les configurations Rolldown 1.3 utilisaient encore `define` et `inject` à la racine : les constantes restaient dans les bundles. L'échec de l'initialisation laissait ensuite la configuration moteur absente.

- Déplacer les substitutions et injections dans `transform` pour le cœur et les extensions concernées ; retirer les options vides obsolètes.
- Vérifier automatiquement les huit bundles avant de terminer `yarn build:extensions`. Analyse syntaxique des identifiants réservés, pas recherche dans les chaînes traduites. Le contrôle échoue sur les quatre anciens bundles concernés, puis passe après reconstruction.
- Initialiser la configuration et attendre les réglages/migrations avant le démarrage ; publier le moteur seulement après initialisation. Ne pas masquer l'échec d'un démarrage partagé par plusieurs appels. Ne pas déclencher de rafraîchissement moteur pendant les migrations de démarrage.
- Accepter les anciens appels de génération de preset sans configuration, en conservant les chemins du modèle et du projecteur.

## Microphone et champ de saisie

Le parcours précédent ne montrait rien avant la fin de reconnaissance. Windows publie désormais les hypothèses de `SpeechHypothesized`, puis le résultat final de `RecognizeCompleted`. Le helper reste local et caché. Rust lit des lignes JSON bornées et transmet les mots uniquement au webview appelant, avec une session propre à chaque capture. Ni transcript technique enregistré sur disque, ni journal de paroles, ni code utilisateur exécuté.

La saisie affiche les mots pendant l'écoute sans interrompre celle-ci. La fin de phrase reconnue déclenche l'envoi normal au modèle. Une transcription incertaine reste disponible pour correction et n'est pas envoyée automatiquement. Arrêter conserve les mots affichés ; un échec de soumission récupère la phrase seulement si le brouillon est vide. La saisie manuelle arrête le vocal. Une erreur précédente du chat ne doit pas annuler immédiatement un nouvel essai vocal ; une nouvelle erreur arrête la session.

Les API locales du navigateur affichent également leurs résultats intermédiaires ; seuls les résultats finaux sont envoyés. Les abonnements sont supprimés et les résultats tardifs/étrangers ignorés. Les règles du cercle et la disposition restent celles du lot précédent. Aucun nouveau texte : les libellés des 104 catalogues sont réutilisés.

## Contrôles exécutés

- **377 tests réussis**, zéro échec, 15 fichiers : extension llama.cpp, preset, ordre de démarrage, vocal, saisie et bouton.
- **3 tests natifs réussis**, compilation Rust du module final comprise ; aucun accès au micro.
- Contrôle TypeScript et ESLint ciblé réussis. Reconstruction du cœur et des sept extensions réussie ; contrôle des huit bundles réussi.
- Vrai moteur Windows sur une phrase française synthétisée dans un WAV de test local : **14 événements intermédiaires**, puis résultat final reconnu. Aucun microphone ouvert et aucun son joué.
- GGUF et projecteur locaux réellement chargés dans un worker CPU isolé : une réponse textuelle réelle, 18 jetons d'entrée et trois de sortie. Arrêt du worker possédé par le test ; aucun accès aux conversations personnelles.
- Edge headless, reconnaissance simulée et réseau externe bloqué : quatre formats, affichage immédiat des mots, maintien de l'écoute, conservation du texte à l'arrêt, cercles et demi-largeurs conservés. [Aperçu](live-transcription.png).
- [Résultats et empreintes](validation.json), [échec du contrôle avant correction](bundle-check-before.log), [reconstruction et contrôle après correction](extension-rebuild.log).

Pas de nouvelle compilation Desktop de livraison : le mainteneur compile lui-même. L'exécutable déjà ouvert ne reçoit pas ces modifications. Le test avec la voix et le microphone réels du mainteneur reste à refaire après compilation. Le choix Auto / Dicter et envoyer / Discussion continue et la voix native LFM3-Omni restent ouverts ; cette correction utilise la reconnaissance/synthèse Windows et la génération textuelle normale.
