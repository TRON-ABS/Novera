# Langue des réponses et lecture numérique — 7 novembre 2026

La vérification demandée au-delà de LFM3-Omni a révélé que Qwen3 pouvait suivre la langue de l'interface plutôt que celle du nouveau message. Le rappel précédent fondé sur ce seul réglage ne suffisait donc pas. Les [résultats initiaux](before.json) sont conservés, y compris les réponses Nemotron vides lorsque la limite de génération était trop courte.

## Correction commune

La prose des derniers messages **utilisateur** détermine maintenant localement la langue cible, avec `tinyld` **1.3.4** verrouillé dans les dépendances. Aucun texte n'est envoyé à un service de détection. Code, citations de bloc, URL et messages assistant/outils sont écartés ; analyse bornée aux huit derniers messages, 4 000 caractères utiles par message, avec seuil et écart de scores. Si le dernier tour est trop court ou ambigu, la dernière langue utilisateur suffisamment identifiable est conservée, puis le réglage de l'interface sert de repli. Les variantes régionales sont préservées quand la langue de base correspond.

La consigne est ajoutée **après** le prompt propre à chaque surface et avant les adaptateurs de fournisseurs : les overrides Cowork ne peuvent plus la contourner. Les messages visibles et enregistrés ne sont pas réécrits. Les demandes explicites de changement de langue restent prioritaires.

## Essais réels sur trois modèles

Poids personnels existants, inchangés ; worker local CUDA/RTX 5070, llama.cpp **v0.9.0/build 12110**, commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8`.

| Modèle GGUF | Scénarios de langue réussis |
| --- | --- |
| Qwen3-4B-Q4_K_M | 7 / 7 |
| Nemotron-3.5-Bolt-E4B-Q4_K_M | 7 / 7 |
| LFM3-Omni-2B-Q4_K_M | 7 / 7 |

Les sept scénarios : message français de la capture après historique anglais ; suivi français ; nouveau message anglais avec interface française ; demande explicite anglaise ; demande espagnole ; français avec interface anglaise ; demande d'anglais formulée en français. **21 réponses dans la langue attendue, aucune tronquée**. Génération à température zéro, limite 1 536 tokens et budget de raisonnement 128 pour obtenir une réponse visible de Nemotron ; aucun réglage personnel changé. [Réponses brutes](language-results.json).

Les tests du transport couvrent également les contrats `llamacpp`, MLX, ONNX, Transformers, OpenAI, Anthropic, Google, Gemini, Mistral, xAI, Groq et custom. Les adaptateurs cloud sont vérifiés sans appel réel à leurs API : aucune prétention de validation de tous leurs modèles. Les modèles image, vidéo, musique, OCR et embeddings ne sont pas assimilés à des assistants de discussion.

## Précision du mainteneur : c'était aussi la voix

Sur la nouvelle capture « Combien font deux plus deux ? », le texte « 2 + 2 = 4 » est neutre linguistiquement. Le mainteneur précise que **la voix entendue** changeait de langue. Deux adaptations complètent le contrôle du texte :

1. Le contrôleur vocal transmet le message utilisateur reconnu ou envoyé manuellement au backend avant la réponse. La voix suit cette langue, au lieu de rester attachée au seul réglage de l'interface, pour Omni comme pour les adaptateurs locaux Windows/navigateur disponibles.
2. Une réponse composée uniquement de chiffres et d'opérateurs est préparée pour la parole. En français, « 2 + 2 = 4 » devient **« Calcul : deux plus deux égale quatre. »**, et « 4 » devient « Résultat : quatre. ». L'affichage reste identique. La normalisation utilise un vocabulaire borné pour les langues vocales prises en charge ; les autres locales et la prose normale restent inchangées. Ce n'est pas un calculateur.

Vraie application debug Windows avec profil isolé : backend initialisé en anglais, message utilisateur français transmis au sélecteur, réponse numérique synthétisée par le vrai Omni en voix masculine puis féminine. Deux lectures démarrées et terminées, contextes fermés, aucun micro ouvert. Le mainteneur confirme : **« Oui, les deux voix sont en français »**.

La question courte a aussi été envoyée aux trois modèles : Qwen répond par une question française, Nemotron « Quatre. », Omni « 2 + 2 = 4 ». Ce contrôle vérifie la langue, pas la pertinence ou la justesse mathématique de toutes les sorties. Le premier filtre lexical omettait « résultat » et marquait à tort la réponse française Qwen comme un échec ; la relecture est consignée séparément, sans réécrire la sortie du modèle.

## Vérifications finales et limites

**344 tests réussis dans 21 fichiers**, TypeScript et ESLint ciblé réussis, installation avec verrou immuable et compilation web réussies. La licence MIT de tinyld est conservée dans `web-app/public/licenses/tinyld-LICENSE.txt`, asset inclus par la compilation web.

Les résultats finaux des tests, TypeScript, ESLint ciblé, compilation web et installation à verrou immuable sont dans [validation.json](validation.json). Aucun nouveau binaire Desktop de livraison, aucune installation ou conversation personnelle remplacée. Profil/journal de test supprimés ; processus de test arrêtés. Aucun son utilisateur enregistré.

La bibliothèque est [locale, sans dépendance transitive ni appel API](https://github.com/komodojp/tinyld) ; sa couverture n'est pas celle des 104 catalogues d'interface. Interrogation OSV pour cette version : zéro avis retourné au moment du contrôle, sans garantie d'absence de vulnérabilité. Les scores ne constituent pas des probabilités calibrées. Les dialectes non couverts, les messages mixtes et très courts restent des limites. Ces essais n'établissent ni une garantie universelle des modèles génératifs, ni une validation linguistique de 104 langues, ni la validité scientifique des réponses sur les mésons B.
