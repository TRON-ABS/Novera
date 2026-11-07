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

La priorité demandée par le mainteneur est de conserver **nos modèles locaux Desktop**, avec un budget de test de **0 €**. Il s’agit de FLUX.2 Klein 4B Q4_K_M et ses composants Qwen3/VAE, ACE-Step 1.5 Turbo GGUF et son planificateur/encodeur/VAE, ainsi que Wan2.1 T2V 1.3B Q4_K_M et UMT5/VAE. Aucun modèle ni API payante ne doit les remplacer silencieusement. Le texte Omni reste indépendant de ces générateurs.

En option secondaire, les trois sorties sont reliées à fal dans la préparation Web : sélection des modèles du catalogue Desktop, soumission et suivi de file, tentative d’annulation distante, stockage des fichiers dans IndexedDB, lecteurs Novera, partage et téléchargement. Qwen Image 2512, ACE-Step et Kling 3 Standard ont été sélectionnés dans Edge. Cette option n’est pas l’inférence locale de nos fichiers GGUF.

La clé personnelle est saisie dans `#/settings/providers/fal`. Elle reste dans l’état mémoire de la session et est retirée des préférences persistées par le mécanisme existant. Aucun secret partagé n’est incorporé au site. Les appels de génération sont adressés à fal ; le téléchargement des résultats n’envoie aucune clé, aucun cookie ni en-tête Authorization. Le fournisseur applique ses tarifs et quotas. Une clé personnelle en mémoire constitue un choix d’intégration : la documentation fal recommande un proxy serveur pour protéger les clés d’une application partagée. Un tel proxy ne doit jamais être remplacé par une clé publique dans les fichiers GitHub Pages.

Les fichiers doivent être lisibles par CORS, correspondre au type demandé et rester sous 256 Mio par fichier. Une erreur réseau, de quota, d’enregistrement ou d’annulation ne produit pas de faux résultat réussi. Les références persistées restent identiques après rechargement ; les URL blob de lecture sont temporaires et révoquées au démontage des lecteurs. Une copie téléchargée reste indépendante du stockage du navigateur. La suppression sélective des médias devenus orphelins reste à préparer.

### Vérifications réalisées

- Tests ciblés du protocole de file et du stockage pour les trois formats, avec réponses API simulées ; conservation du comportement Desktop et refus Web hors préparation.
- Dans Edge : import de trois fichiers publics officiels d’exemple, affichage de l’image, décodage et lecture sans erreur de l’audio et de la vidéo, conservation après rechargement, téléchargement PNG/MP3/MP4 aux tailles attendues. Il s’agit d’exemples existants, **pas de générations réalisées par Novera**.
- Aucune génération distante payante n’a été lancée. La validation réelle avec un compte fal reste conditionnée à une clé saisie par son propriétaire et à un plafond de dépense autorisé. Une réponse OPTIONS réussie ne prouve ni la disponibilité du modèle ni les droits du compte.
- Pika 2.2 a été retiré du catalogue : sa page officielle indique une suppression le 29 octobre 2026. Les réglages cloud conservent les préréglages du fournisseur ; les réglages locaux de taille, durée et moteur ne sont pas présentés comme appliqués à fal.

Sources : [file fal](https://fal.ai/docs/api-reference/inference-api/queue/submit), [Qwen Image](https://fal.ai/models/fal-ai/qwen-image-2512/api), [ACE-Step](https://fal.ai/models/fal-ai/ace-step/api), [Kling Standard](https://fal.ai/models/fal-ai/kling-video/v3/standard/text-to-video/api), [suppression de Pika](https://fal.ai/models/fal-ai/pika/v2.2/text-to-video/api).

### Calcul local gratuit restant à intégrer

Le texte WebGPU fonctionne localement ; les créations fal utilisent un service externe. GitHub Pages ne fournit aucun calcul GPU. Le moteur stable-diffusion.cpp utilisé pour FLUX et Wan possède une dépendance GGML avec un backend WebGPU Emscripten réel, mais aucune interface JavaScript prête pour ces modèles. L’essai de portage doit vérifier compilation, accès aux fichiers, mémoire, opérations GPU, encodage des images/vidéos, annulation et libération du moteur. Un build natif ou l’existence du backend ne prouve pas ce fonctionnement navigateur.

Une autre voie musicale existe dans [FluidAudio Web](https://github.com/FluidInference/fluidaudio-web/tree/8ff2a995d820981887b2c660f2e5b12a849ccc70) : ACE-Step exige environ 5,75 Go de modèles, OPFS, un worker et WebGPU avec `shader-f16`. Ces paquets sont convertis et ne chargent pas directement nos GGUF ; ils ne constituent donc pas un remplacement implicite. Le paquet npm publié n’exporte pas ce moteur musical. L’adaptation d’acestep.cpp pour nos fichiers exacts reste à réaliser. Les entrées audio/vision d’Omni, la localisation des nouveaux textes de préparation et le mode hors connexion complet restent à terminer.
