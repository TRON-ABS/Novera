# Novera Web — préparation navigateur

Cette branche reprend l’application React, ses composants, ses couleurs et ses thèmes. Elle ne remplace pas la vitrine GitHub Pages et n’est pas encore une distribution Web publique.

## Lancement local

Depuis la racine : `corepack yarn dev:web:browser --port 5187 --strictPort`.
Construction : `corepack yarn build:web:browser`.
Le backend navigateur est activé uniquement par `VITE_NOVERA_WEB_PREVIEW=true`, en dehors de Tauri. Le routage par fragment prépare les rechargements sur un hébergement statique.

Le navigateur choisit la langue initiale parmi les langues existantes de Novera. Un choix manuel enregistré reste prioritaire. La langue des réponses dépend du message et des instructions de conversation.

## Modèles et moteur

- Défaut : LiquidAI/LFM3-Omni-2B-GGUF, modèle Q4_K_M. Le SDK Web officiel exige actuellement le projecteur Q8_0 : son essai avec le projecteur Q4 échoue avec une absence de kernel de quantification dans la bibliothèque. Le téléchargement compatible représente 1 606 472 608 octets. Cela ne représente pas la mémoire GPU totale nécessaire.
- Alternative sélectionnable : LiquidAI/LFM3-1.7B-GGUF, Q4_K_M, moteur texte distinct. Les autres architectures devront être vérifiées avant leur ajout ; un fichier GGUF quelconque ne garantit pas la compatibilité navigateur.
- Les révisions du modèle et du moteur sont figées dans `web-app/src/services/browser-preview/catalog.json`. Le JavaScript du moteur distant est contrôlé par SHA-256 avant import. Les poids restent téléchargés par le SDK depuis Hugging Face ; les SHA-256 du catalogue documentent les fichiers attendus, sans constituer un contrôle supplémentaire de chaque poids par Novera.
- WebGPU et HTTPS ou localhost sont nécessaires. Aucun serveur de calcul n’est exécuté par GitHub Pages. Les discussions sont stockées dans IndexedDB et les préférences dans ce navigateur. Le mode hors connexion complet reste à tester.
- Les modèles conservent leur licence LiquidAI. La licence de redistribution du SDK Omni doit encore être clarifiée avant une distribution publique. Aucun SDK ni poids n’est incorporé au dépôt.

## Résultats observés le 7 novembre 2026

Dans Edge connecté par l’extension : chargement du modèle Omni Q4 avec projecteur Q8 réussi, réponse réelle en français à une question arithmétique, puis messages conservés après rechargement de la page. Le sélecteur expose aussi LFM3 1.7B. La génération de cette alternative, l’annulation dans Edge et les scénarios mémoire restent à valider. Les tests unitaires utilisent des doubles explicites et ne remplacent pas ces essais.

## Image, musique et vidéo

Les trois sorties restent désactivées dans cette préparation. Le moteur branché expose du texte ; il ne fournit pas de générateur d’images, de musique ou de vidéos. Les flux existants de Novera appellent le backend natif pour lancer les moteurs et sauvegarder les résultats. Leur refus dans le navigateur a été vérifié ; aucune génération multimédia réelle n’est revendiquée.

Pour rendre ces sorties utilisables : adapter le stockage et l’affichage des fichiers aux blobs persistés dans IndexedDB, brancher un moteur Web compatible ou un fournisseur autorisant les appels navigateur, vérifier CORS et l’annulation, puis tester un résultat réel de chaque type, son rechargement, son export et ses erreurs. Une connexion API implique ses propres clés, tarifs et quotas ; GitHub ne fournit pas gratuitement cette inférence. Les entrées audio/vision du modèle Omni nécessitent également leurs adaptateurs propres et une vérification des capacités du SDK.
