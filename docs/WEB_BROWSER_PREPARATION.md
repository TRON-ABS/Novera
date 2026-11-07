# Novera Web — préparation navigateur

Cette branche reprend l’application React, ses composants, ses couleurs et ses thèmes. Elle ne remplace pas la vitrine GitHub Pages et n’est pas encore une distribution Web publique.

Le mainteneur demande, après les tests de fonctionnement et les optimisations, un audit de sécurité complet avant la mise en ligne : dépendances et moteurs embarqués, intégrité des modèles téléchargés, clés API, stockage local, imports/exports, protections navigateur et déploiement GitHub. Les problèmes confirmés devront être corrigés puis les contrôles relancés ; aucune validation de sécurité globale n’est encore revendiquée pour cette préparation.

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

### Inférence locale observée le 7 novembre 2026

Dans l'interface Novera sous Edge, le vrai bundle FLUX.2 Klein Q4 a produit une image de 256 × 256 en quatre étapes : **32,7 secondes affichées**, téléchargement PNG et conservation après rechargement vérifiés. Le décodage VAE WebGPU corrigé remplace le premier repli CPU qui prenait 3 min 54 s. Ce résultat limité ne valide ni les grandes résolutions ni une performance identique aux réglages Desktop. Les images et leurs empreintes sont dans `examples/media/novera-web-flux/`.

Le moteur optionnel se construit avec `scripts/browser-media/build.py`. Ses archives sources, correctifs et sorties sont contrôlés par empreinte ; le reçu de compilation ne revendique jamais une validation d'inférence. Le portage ACE-Step et les essais Wan restent expérimentaux, hors des fonctions locales considérées comme prêtes. Un premier fichier musical complet a été obtenu après correction d'un débordement de précision WebGPU ; la qualité instrumentale, les paroles et la fidélité aux consignes restent à vérifier avant intégration.

Le texte Omni a produit une réponse réelle à 95,58 jetons/s pour 93 jetons, avec des défauts de structure et de contenu qui empêchent de revendiquer une qualité globale validée. Les métriques de délai sont exposées et la continuation du cache de conversation est couverte par tests ; sa performance après optimisation reste à mesurer dans le navigateur.

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


## Journal des mesures du 7 novembre 2026

Ces essais utilisent Edge et une RTX 5070 Laptop GPU de 8 Gio. Les poids étaient déjà disponibles en fichiers locaux : les temps incluent les chargements du moteur pendant la demande, mais pas un téléchargement initial des modèles depuis Internet. Les mesures ACE et Wan viennent d’un prototype navigateur isolé ; elles ne valent pas intégration finale aux conversations Novera, sauvegarde après rechargement, export utilisateur complet ou parité Desktop. Le budget reste **0 €**, sans génération payante.

| Essai | Réglages et durée réelle | Temps total observé | Portée |
| --- | --- | --- | --- |
| Image FLUX.2 Klein Q4 dans Novera | 256 × 256, 4 étapes | 32,7 s affichées | PNG téléchargé et conservé après rechargement |
| Texte LFM3 Omni Q4 / projecteur Q8 | 93 jetons | 95,58 jetons/s affichés | Réponse française réelle ; structure et qualité imparfaites ; cache optimisé à remesurer |
| ACE instrumental | Durée demandée/réelle 10 s, 8 étapes, graine 42 | 38,691 s | WAV valide ; écoute musicale à contrôler |
| ACE chanson française, piano et guitare | Durée demandée 10 s, réelle 9,84 s, 8 étapes, graine 42 | 34,911 s | Paroles fournies conservées dans la requête ; intelligibilité chantée à contrôler |
| ACE a cappella française | Durée demandée/réelle 10 s, 8 étapes, graine 42 | 37,294 s | Consigne sans instruments conservée ; résultat sonore à contrôler |
| Wan, petit clip avec préparation 3D sur CPU | 256 × 144, 5 images, 4 étapes, 8 FPS, graine 42 ; 0,625 s | 65,102 s | Référence sans instrumentation détaillée |
| Wan, même petit clip avec préparation 3D sur GPU | Réglages identiques ; 0,625 s | 32,046 s | WebM identique à la référence ; qualité finale non validée |
| Wan, clip plus représentatif | 256 × 144, 17 images, 20 étapes, 16 FPS, graine 42 ; 1,0625 s | 91,273 s | Découpage VAE automatique ; rendu visuel insuffisant à ce stade |

L’ancien diagnostic vidéo par opération avait pris 68,835 secondes pour cinq images ; le comparer séparément aux mesures normales. Le gain du petit clip provient surtout du VAE, de 31,33 à 1,72 seconde. Les douze comparaisons numériques GPU/CPU couvrent sorties F16/F32, padding, dilation, lots, pas et vues décalées. Empreinte du WebM identique avant/après : `f5570cbfbc9cca4da27182f8be77b6509fcc069b717239e7fe9e523bffaff7a4`.

Le cache de lecture ACE fait passer l’instrumental de 43,601 à 38,691 secondes avec un WAV identique : `dbde0d33c4514229f77952890f4aa9a6575d87a20f83ec248dddde73b2a46531`. La description est verrouillée ; le budget de codes respecte la durée maximale, mais un EOS peut finir plus tôt. Atteindre la limite ne garantit pas une fin musicale naturelle. Aucun de ces trois fichiers n’est encore présenté comme une démonstration musicale de qualité validée.

### Test musical Desktop à comparer

Utiliser les mêmes quatre fichiers du bundle **ACE-Step 1.5 Turbo 2B Q4_K_M** :

- `acestep-v15-turbo-Q4_K_M.gguf` ;
- `acestep-5Hz-lm-1.7B-Q8_0.gguf` ;
- `Qwen3-Embedding-0.6B-Q8_0.gguf` ;
- `vae-BF16.gguf`.

Durée manuelle **10 secondes**, durée automatique désactivée, **8 étapes**, graine **42**, sortie **WAV 32 bits flottants, 48 kHz, stéréo**. Désactiver la réécriture de description si cette option est disponible. Chronométrer du clic de génération au morceau prêt à lire ; noter séparément le premier lancement et le suivant. Conserver durée réellement obtenue et réglages effectifs : moteurs CUDA et WebGPU, politique de description et fin de génération peuvent encore différer. La mesure Web à comparer est **34,911 secondes pour 9,84 secondes d’audio**.

Description exacte :

```text
French gentle pop song, clear sung French lyrics, piano and acoustic guitar accompaniment.
```

Paroles exactes :

```text
[Verse]
Le jour se lève et je souris
Une lumière éclaire ma vie
```

Le premier prompt musical du mainteneur reste un autre essai, instrumental :

```text
[Style: neoclassical, cinematic, emotional piano] [Mood: tender, hopeful, awe] [Instrumentation: grand piano, strings, no vocals, no drums] [Tempo: slow]
```

Il s’agit d’une description pour le modèle, pas d’une grammaire de commandes garantie ; utiliser `[Instrumental]` dans le champ paroles. Les trois modes à vérifier restent instrumental, chanson avec accompagnement et a cappella. Le mainteneur attend la fin des essais vidéo avant de chronométrer la musique Desktop.

### État et suite

Desktop 1.0.1 est publique et le mainteneur rapporte une mise à jour réussie. Les canaux Desktop/CLI, les signatures publiques et les contrôles natifs de publication ont passé leurs vérifications ; le portable reste dans son canal indépendant en 1.0.0 pendant sa compilation. La préparation Web conserve l’interface et ses couleurs ; elle n’est pas publiée comme application complète.

Avis du mainteneur sur Wan : qualité visuelle jugée faible, mais intérêt pour sa petite taille. Conserver Wan1.3B Q4 comme option légère de travail, sans annoncer un niveau de qualité élevé ni une validation globale du modèle à partir de ce seul essai basse résolution. Aucun remplacement de modèle n’a été décidé.

Restent notamment : qualité visuelle et comparaison native à réglages identiques, écoute et intelligibilité des trois modes musicaux, intégration des sorties locales aux conversations et leur conservation, chemins moteur versionnés par empreinte pour éviter les mélanges de cache, mesures texte après optimisation et essais de l’autre modèle. Ensuite : audit de sécurité complet, corrections et nouveaux contrôles avant publication Web.


### Piste demandée : édition directe des poids, sans entraînement

Le mainteneur précise qu’il vise une intervention directe dans les poids, sans entraînement ni LoRA. L’article Tech Insider fourni a permis de retrouver le [billet primaire des auteurs, publié le 2 novembre 2026](https://rikiyat.github.io/blog/weight-space-programming/). Leur expérience Qwen3.5-0.8B corrige une direction associée aux boucles de raisonnement dans deux couches : 131072 paramètres modifiés, avec un score MATH-500 rapporté de 7,9 à 48,1 %. Les auteurs distinguent cette réparation d’une capacité absente et rapportent aussi un cas sans amélioration établie.

Pour Wan, conserver l’édition directe comme **piste expérimentale à étudier**, sans transfert automatique du résultat Qwen. Identifier un défaut précis et reproductible, comparer les mêmes scènes à réglages fixes et vérifier les régressions. Aucun poids de modèle n’a été modifié pendant les essais Web actuels ; les gains mesurés proviennent du moteur. Aucun remplacement de modèle ni entraînement n’a été décidé.


### Fin de la passe vidéo et disponibilité du GPU

Après reconnexion d’Edge, un onglet de test neuf a fonctionné. Le contrôle Web en **832 × 480, 5 images, 20 étapes, 8 FPS, CFG 6, flow shift 3 et graine 42** produit un WebM de 0,625 seconde, exporté puis lu jusqu’à la fin sans erreur. Temps total : **346,512 secondes**, dont 340,126 secondes dans la génération et 49,87 secondes pour le VAE. Le budget mémoire estimé du backend déclenche 49 tuiles VAE. La première image montre une balle rouge reconnaissable sur une table ; cette durée très courte ne valide pas la qualité temporelle générale. La vitesse cible en 480p n’est pas atteinte.

La référence native en 832 × 480 utilise 17 images et 30 étapes, donc ses 138,823 secondes ne constituent pas une comparaison de vitesse à réglages identiques. À mêmes réglages natifs (17 images, 30 étapes, CFG 6, shift 3), le passage à 384 × 224 prend 25,680 secondes mais produit de fortes déformations. Le précédent essai natif en 256 × 144 prenait 16,355 secondes, avec d’autres paramètres et un rendu également dégradé. Ne pas attribuer automatiquement les défauts basse résolution au port Web ni prétendre que tous les réglages Wan sont équivalents.

Le worker de test a été arrêté après export et lecture. Le GPU indique ensuite 0 % d’utilisation : le mainteneur est informé qu’il peut commencer son test musique Desktop sans une génération vidéo concurrente. Cela termine cette passe de mesures, sans annoncer la vidéo Web comme une fonctionnalité finale prête à publier.

Le paquet Web utilise maintenant un chemin de moteur versionné par l’empreinte de l’ensemble vérifié (module, WASM, reçu et licences), afin d’éviter les mélanges entre anciennes et nouvelles versions en cache. Trois contrats Node de paquetage et les trois tests ciblés de flux image passent ; le build TypeScript/production avec le moteur inclus réussit. Le parcours d’image complet sur cette nouvelle URL reste à rejouer dans le navigateur.

La piste d’édition directe des poids est **reportée à la demande du mainteneur**. Les travaux présents conservent les poids d’origine et portent sur le moteur, les réglages, les mesures et la conservation des résultats.
