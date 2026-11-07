# Bouton de son, régénération, nombres français et réglages LFM3 — 7 novembre 2026

Préparation de la 1.0.1, application toujours en 1.0.0. Aucune publication, installation personnelle modifiée, compilation Desktop de livraison ou certification multiplateforme.

## Changements

Petit bouton de haut-parleur sous le microphone, dans sa colonne existante (30 px sur ordinateur, 22 px au format mobile testé). Réutilisation du réglage persistant « Lire les réponses à voix haute » et des traductions déjà présentes dans les 104 langues. La saisie et le repli restent inchangés. Couper le son annule immédiatement une lecture ; une conversation continue reprend l'écoute sans arrêter son fonctionnement. Une réponse reçue en mode muet ne déclenche aucune synthèse. Réactiver prépare les prochaines réponses, sans relire les anciennes.

La régénération depuis le bouton de la réponse arme maintenant la lecture sans ouvrir le micro, y compris quand l'identifiant et le texte de la réponse sont réutilisés. Le bouton de son reste prioritaire.

Les nombres dans des phrases françaises sont préparés en mots avant la synthèse, aussi bien pour LFM3 que pour la voix système : années 1889/2019, nombres composés, centaines, milliers, millions, décimales avec zéros. Les messages affichés et enregistrés ne sont pas modifiés. Les identifiants, versions et dates numériques testés restent intacts. La verbalisation ne corrige pas les faits ni les nombres inventés par un modèle.

Les modèles classiques conservent le backend vocal du système (Windows System.Speech ; navigateur : voix locales compatibles uniquement). LFM3-Omni/Audio local conserve sa synthèse native. Aucun repli silencieux vers une voix distante.

## Réglages réellement inspectés

Lecture seule du profil Windows personnel : LFM3-Omni Q4_K_M + mmproj présents ; contexte configuré à 32768, contre 128000 maximum déclaré par le GGUF. Réduire le contexte est un compromis mémoire, pas une erreur. Échantillonnage du modèle et paramètres de l'assistant par défaut laissés vides : le GGUF contient bien température texte 0, top_k 1 et répétition 1. Le 0,8 générique repéré dans le code n'était donc pas la preuve d'une température effective incorrecte sur cette installation. Raisonnement enregistré sur auto. Aucune limite explicite dans l'assistant par défaut. Les assistants de conversations individuelles n'ont pas été audités exhaustivement.

Le transport définit maintenant les valeurs manquantes des familles locales LFM3-Omni/Audio : température texte 0, limite de réponse 2048 tokens. Omni auto devient off au niveau de la requête ; les choix explicites restent prioritaires, notamment les paramètres d'assistant et une limite 0 volontaire. Ces changements seront présents après recompilation ; les fichiers personnels ne sont pas réécrits. Une limite de sortie borne une énumération, sans garantir la justesse de la réponse.

Sources primaires consultées : [Omni](https://huggingface.co/LiquidAI/LFM3-Omni-2B-GGUF), [Audio](https://huggingface.co/LiquidAI/LFM3-Audio-2B-GGUF). Température texte 0 pour les deux ; Omni non reasoning. Les réglages audio restent distincts et sont lus par le moteur depuis le GGUF (Omni : 0,4/répétition 1,2 ; Audio : 1,0/top_k 128/répétition 1,1). Aucun de ces réglages audio n'est copié dans les paramètres du texte. Moteur conservé : llama.cpp v0.9.0 build12110, cd959bae99ff4bed22bef2604f45241c09bbb8c8.

## Validation locale

- 206 tests dans 9 fichiers, zéro échec : contrôleur vocal, deux backends, nombres, bouton, route du chat et contrat du transport. Couverture de l'annulation en cours de lecture, écoute continue muette, régénération, valeur explicite de température et sortie illimitée choisie.
- TypeScript `tsc -b` : réussi. ESLint des bibliothèques et du bouton modifiés : zéro erreur. La route du chat a les mêmes 22 erreurs et 2 avertissements avant/après ce lot (comparaison en mémoire retirant uniquement les trois ajouts de ce lot) ; son lint global n'est pas annoncé comme réussi.
- Build web Windows : réussi ; avertissements existants de découpage/taille des bundles.
- `python scripts/check-novera-locales.py` : 104 catalogues, 2434 clés chacun, aucune erreur structurelle. Pas de relecture native des 104 traductions.
- Vraie application Windows debug + vrai LFM3-Omni, profil isolé : envoi clavier puis régénération produisent chacun un audio natif ; régénération muette n'en produit pas ; zéro ouverture de micro ; réglage réactivé persistant après rechargement. Bouton placé sous le micro aux largeurs ordinateur et 390 px. Capture publique de test et dimensions jointes.
- Deux voix Omni synthétisées et lues jusqu'au bout sur une phrase publique comportant 1889/2019. Deux WAV valides, deux fins de lecture, contextes audio fermés. Voix système française : opération réelle de synthèse terminée. La qualité phonétique de ces nouveaux essais n'a pas été confirmée à l'oreille par le mainteneur.

Pas de nouveau test matériel macOS/Linux/mobile, de modèle LFM3-Audio installé, ni de certification factuelle du texte sur Paris. La capture en largeur mobile est un test de mise en page Windows WebView, pas un test natif Android/iOS. Aucun audio ni conversation personnelle conservés. Profils temporaires et journaux de test supprimés après les essais.
