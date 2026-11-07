# Conversation vocale continue — complément du 6 novembre 2026

Le mainteneur confirme que le modèle répond, mais constate une mauvaise reconnaissance, le message « Conversation vocale indisponible », la nécessité d'envoyer à la main puis de réactiver le micro, et l'absence de réponse audible.

## Causes et changements

Le helper Windows ajoutait un seuil de confiance de 0,5 à la reconnaissance déjà acceptée par le moteur. En dessous, il renvoyait `uncertain` ; le frontend transformait ce résultat en erreur fatale `unavailable`, terminant la session. L'envoi manuel suivant se faisait donc hors mode vocal et ne lançait plus la synthèse. [Microsoft précise que ces scores sont relatifs au moteur et servent à comparer les alternatives](https://learn.microsoft.com/en-us/dotnet/api/system.speech.recognition.recognizedphrase.confidence?view=netframework-4.8.1).

- Utiliser le résultat final accepté par Windows sans ce seuil supplémentaire ; silence, hypothèses seules et absence de résultat ne deviennent pas des messages automatiques.
- Traiter un ancien résultat `uncertain` comme une dictée à corriger, sans faux message d'indisponibilité ni fermeture de la session.
- Modifier le texte coupe la capture et garde le mode vocal en pause. Envoyer passe à l'attente de la réponse ; celle-ci est lue, puis l'écoute reprend. Un envoi manuel invalide une reconnaissance tardive pour éviter les doubles envois.
- Donner à chaque opération Windows sa propre session. La synthèse suivant une capture annulée ne doit pas réutiliser un identifiant déjà révoqué.
- [Configurer explicitement la sortie audio Windows par défaut](https://learn.microsoft.com/en-us/dotnet/api/system.speech.synthesis.speechsynthesizer.setoutputtodefaultaudiodevice?view=netframework-4.8.1). Cela ne modifie ni le périphérique choisi dans Windows ni son volume système.
- Afficher le micro sans barre pendant l'écoute ; réserver le micro barré aux phases sans capture. Conserver les cercles, les demi-largeurs et le repli validé par le mainteneur.
- En cas d'erreur réelle, journaliser uniquement la phase (`listening`, `waiting`, `speaking` ou démarrage), jamais paroles, réponse, chemin de périphérique ou exception brute.

La pause de correction réutilise `common:edit`, présent dans les 104 catalogues. Aucun nouveau texte ni modification de l'inventaire des 2 431 clés.

## Validation

- **111 tests réussis**, zéro échec, quatre fichiers. Deux tours automatiques complets, lecture de deux réponses puis troisième écoute ; correction/envoi manuel/reprise ; absence de double envoi tardif ; anciennes incertitudes non fatales ; identifiants distincts capture/synthèse ; annulation et contexte.
- **3 tests natifs réussis**, avec recompilation du helper embarqué ; aucun accès au microphone.
- TypeScript et ESLint ciblé réussis.
- Bridge Windows réel sur WAV français synthétique : 14 hypothèses puis résultat final reconnu. Cas final à confiance 0,2 injecté dans le helper de test pour vérifier le retrait du seuil supplémentaire ; ce cas n'est pas présenté comme une mesure d'exactitude réelle.
- Synthèse Windows réelle vers un WAV de test : **3,82 secondes**, données audio non silencieuses et statut `done`. La redirection du test vers un fichier évite de jouer du son ; elle ne valide pas les haut-parleurs du mainteneur.
- Edge headless, reconnaissance simulée, réseau externe bloqué : quatre formats. Affichage des mots, maintien de l'écoute, passage à la correction sans fermer le mode vocal, conservation du brouillon à l'arrêt, cercles et largeurs inchangés.
- [Résultats et empreintes](validation.json), [diagnostic vocal Windows](windows-speech-diagnostic.json).

## Limites restantes

La reconnaissance et la voix du produit utilisent encore les moteurs Windows installés. Le retrait d'un faux arrêt améliore le fonctionnement de la boucle, **pas une garantie d'exactitude de transcription**. Le choix d'une autre langue ou d'un meilleur moteur ne doit pas être remplacé par une correction inventée par un LLM du texte mal entendu.

Une expérience isolée avec l'entrée audio du GGUF LFM3-Omni et le point d'accès HTTP existant donne une transcription partielle aux deux limites de génération essayées (128 et 512 jetons). Aucun audio personnel utilisé. Ce résultat ne valide pas une intégration de reconnaissance Omni ; le transport temps réel et la voix native restent à raccorder et tester. Cette expérience n'est pas activée dans le produit.

Pas de nouvelle compilation Desktop de livraison ni de modification de l'installation personnelle. Le mainteneur compile lui-même. Après compilation, il reste à vérifier une conversation avec son vrai micro, la langue de reconnaissance et la lecture sur son périphérique audio Windows. Les adaptations natives des autres systèmes restent ouvertes.
