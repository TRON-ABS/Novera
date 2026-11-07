# Novera Web — préparation navigateur

Cette branche reprend l’application React, ses composants, ses couleurs et ses thèmes. Elle ne remplace pas la vitrine GitHub Pages et n’est pas encore une distribution Web publique.

Le mainteneur demande, après les tests de fonctionnement et les optimisations, un audit de sécurité complet avant la mise en ligne : dépendances et moteurs embarqués, intégrité des modèles téléchargés, clés API, stockage local, imports/exports, protections navigateur et déploiement GitHub. Les problèmes confirmés devront être corrigés puis les contrôles relancés ; aucune validation de sécurité globale n’est encore revendiquée pour cette préparation.

## Lancement local

Depuis la racine : `corepack yarn dev:web:browser --port 5187 --strictPort`.
Construction : `corepack yarn build:web:browser`.
Le backend navigateur est activé uniquement par `VITE_NOVERA_WEB_PREVIEW=true`, en dehors de Tauri. Le routage par fragment prépare les rechargements sur un hébergement statique.

Le navigateur choisit la langue initiale parmi les langues existantes de Novera. Un choix manuel enregistré reste prioritaire. La langue des réponses dépend du message et des instructions de conversation.

## Modèles et moteur

- Le contexte texte demandé au moteur est de **32 768 tokens** pour les modèles du catalogue Web. Le chargement refuse un moteur qui annonce une capacité inférieure. Le plafond d’une réponse reste séparé : 512 tokens par défaut, au maximum 1 024. Cela ne modifie pas le planificateur musical ACE-Step. Les sept tests du runtime et la construction de production passent ; une conversation courte ne constitue pas un test de charge sur toute la fenêtre de 32k.
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

### Musique raccordée aux conversations et sélecteur partagé — 7 novembre, après-midi

Le moteur ACE-Step reproductible est maintenant raccordé à une construction Web interne optionnelle (`VITE_NOVERA_WEB_LOCAL_MUSIC=true`, `NOVERA_BROWSER_MUSIC_BUILD` vers le dossier compilé vérifié). Les quatre fichiers GGUF Desktop sont choisis localement et restent attachés à la session. Les réglages musicaux sont restaurés au démarrage ; les WAV sont enregistrés en IndexedDB avant l’ajout de leur référence dans la discussion. Le lecteur, le téléchargement et l’annulation utilisent les parcours de Novera. Limites affichées : 10–30 s demandées, 8 étapes, WAV flottant 32 bits, stéréo 48 kHz, WebGPU automatique ; description et paroles limitées chacune à 512 octets UTF-8. Les réglages incompatibles sont refusés avant chargement.

Contrôles réels dans Edge, RTX 5070 Laptop, sans API payante :

| Demande | Temps total affiché dans Novera | Audio réel |
| --- | --- | --- |
| Chanson française, piano et guitare, paroles du test Desktop ci-dessus | 42,3 s au premier lancement | 9,84 s |
| `Gentle instrumental ambient piano, calm warm atmosphere, no vocals.` | 41,6 s | 9,44 s |
| `French a cappella solo voice, clear sung lyrics, absolutely no instruments, no musical accompaniment.` avec les mêmes paroles françaises | 36,3 s | 9,44 s |

Les trois demandes utilisent une durée manuelle de 10 s et la graine fixe 42. Les fichiers ont été téléchargés. La chanson a été retrouvée dans un nouvel onglet et lue jusqu’à la fin sans erreur ; l’a cappella a aussi atteint la fin du lecteur. La chanson exportée fait 3778604 octets ; SHA-256 `e3cd16ab1fd431adfed7fb7055a1da85fbbabd542e0c2145f5583253a98f95ef`, identique au prototype isolé. Les durées des deux autres sorties diffèrent des anciennes mesures : ne pas les présenter comme des comparaisons strictes ni comme des validations acoustiques de l’instrumentation. Les fins précoces restent possibles. L’objectif inférieur à 40 secondes n’est pas atteint pour toutes les demandes.

Deux défauts fonctionnels découverts pendant cette passe sont corrigés : le magasin des réglages musicaux n’était réhydraté que par le suivi d’installation Desktop ; une entrée de progression terminée avec une valeur `undefined` pouvait encore bloquer une nouvelle création image/musique. Les vérifications n’interprètent plus cette entrée comme un travail actif.

À la demande du mainteneur, le sélecteur partagé affiche le modèle du mode actif sur les prochaines compilations Web/Desktop/mobile, avec déduction du modèle local configuré même sans sélection média explicite. Auto suit le brouillon puis le mode soumis pendant la génération. Le contrôle Edge montre FLUX.2 Klein Q4 en Image et ACE-Step Q4 en Musique ; la sélection du modèle texte reste conservée. Aucun paquet publié n’a été remplacé.

Validation source : 160 tests ciblés dans dix fichiers passent (sélecteur, compositeur, musique, persistance initiale, annulation, encodage WAV et flux image), quatre contrats Node de paquetage passent, compilation TypeScript/production réussie avec les deux moteurs inclus. Le paquet ACE conserve ses licences et son propre chemin versionné par empreinte. Cette préparation n’est pas une publication complète ; la vidéo Web, l’écoute qualitative, les mesures texte complémentaires et l’audit de sécurité final restent à terminer.

Le parcours image a également été rejoué avec le moteur versionné par empreinte, après les créations musicales : FLUX.2 Klein Q4, 256 × 256, quatre étapes, demande `A small red ceramic cup on a wooden table, soft morning light, clean product photograph.`. Image réelle affichée en **31,9 s**, tasse rouge reconnaissable, PNG téléchargé et sélecteur FLUX correct pendant la génération. Cette mesure porte sur le petit préréglage expérimental, sans agrandissement ; elle ne valide pas une génération haute résolution en moins de 40 secondes.

Dernier contrôle dans un nouvel onglet : les trois pistes sont décodables sans erreur (9,84 / 9,44 / 9,44 s), le PNG est entièrement chargé en 256 × 256 et les quatre références de conversation sont conservées. Le worker propriétaire est terminé après chaque résultat. L’aperçu local est destiné aux essais du mainteneur ; aucune annonce de disponibilité publique complète n’en découle.

### Référence haute résolution fournie par le mainteneur

Le mainteneur rapporte **38,7 s au total sur Desktop 1.0.1**, pour une image **2048 × 880, ratio 21:9, puis Real-ESRGAN ×2**, soit une sortie attendue de **4096 × 1760**. Cette mesure utilisateur confirme le fonctionnement de l’agrandissement après réparation du Python ; le modèle exact, sa quantification, la graine et les étapes de cette demande ne sont pas reconfirmés dans le message. Ne pas la comparer comme un essai identique à la Web 256 × 256. La mention « 8K » appartient au prompt, pas à la taille réelle du fichier.

Prompt fourni, à conserver pour les essais suivants :

```text
créer une image Photographie réaliste d'un lieu naturel époustouflant : une vallée majestueuse au coucher du soleil, avec des cascades puissantes tombant de falaises rocheuses couvertes de mousse verte. Un lac parfaitement calme au centre reflète un ciel rose, orange et violet. Brume légère flottant entre les montagnes, rayons de lumière dorée traversant les nuages. Forêt luxuriante, rochers texturés, eau cristalline avec de légers reflets. Aucun texte, aucun logo, aucune inscription. Prise de vue panoramique grand angle, objectif 24mm, lumière naturelle cinématographique, haute résolution 8K, détails ultra-réalistes, photographie de paysage primée, aucune personne, aucun élément artificiel.
```

À sa demande, le parcours Web ne force plus silencieusement 256 × 256 : il transmet largeur, hauteur et étapes réelles, valide les dimensions jusqu’à 2048 par côté et utilise les contrôles de ratio/résolution communs. La graine choisie est respectée. Le moteur image active l’attention économe en mémoire déjà implémentée dans le backend GGML WebGPU épinglé afin d’éviter le tampon d’attention quadratique aux grandes tailles.

Les premiers essais 2048 ont révélé un refus de préparation des poids au segment FLUX 3/27. Le backend épinglé renvoie `maxBufferSize` (limite d’un seul tampon) comme mémoire GPU totale et libre ; cette valeur ne mesure pas la VRAM. Un correctif gardé par empreintes conserve la mémoire physique comme inconnue sur WebGPU et fait appliquer le budget de calcul explicite, sans modifier les autres backends. Le réglage Web propose 2/4/6/8/12 Gio ; 6 Gio ont été sélectionnés pour la RTX 5070 Laptop de 8 Gio. Ce budget ne garantit pas la disponibilité réelle de cette mémoire.

Essai réel terminé vers 13:49 dans Novera Web/Edge : **2048 × 880, quatre étapes, graine 42, sans ×2**, prompt ci-dessus, trois fichiers FLUX/Qwen/VAE Desktop. PNG téléchargé de **4 431 973 octets**, dimensions naturelles DOM 2048 × 880, image de vallée reconnaissable. SHA-256 : `8d8590536e3e81b4db73a8a65529e4e901554347a07aa296c4b409cff435799e`. Mesures affichées : **7 min 29 s total**, **7 min 23 s génération**, initialisation 0,2 s, chargement 5,3 s, texte 4,5 s, diffusion 5 min 22 s, décodage 1 min 57 s, export PNG 0,2 s. Les valeurs d’interface sont arrondies. Le délai de 38,7 s n’est pas atteint et la comparaison reste incomplète sans agrandissement et sans confirmation des réglages Desktop exacts.

Le mainteneur précise que l’agrandissement peut coûter plus que la génération initiale : toujours mesurer séparément génération, Real-ESRGAN et total. Une expérience de décodage image par multiplication matricielle et tuiles de 512 pixels (recouvrement 25 %) est disponible avec `--image-vae-matmul-probe`, désactivée dans la compilation normale. Les tuiles peuvent modifier les pixels ; aucun gain ni équivalence qualitative ne découle de la compilation seule.

Résultat de cette expérience vers 14:12 : 6 min 5 s au total, diffusion 5 min 22 s, décodage 32,1 s, sortie 2048 × 880. **Essai rejeté pour qualité invalide : tous les canaux du PNG valent exactement 255**, confirmé par lecture des pixels du fichier téléchargé (38 224 octets). Le délai plus court n’est donc pas un progrès utilisable et ne remplace pas la référence valide de 7 min 29 s. Le moteur normal conserve la convolution directe correcte.

L’intégration expérimentale du fichier officiel `RealESRGAN_x2plus.pth` vérifie son SHA-256 avant toute inférence, termine le worker de diffusion avant d’allouer celui de l’agrandissement et refuse ×4. La topologie ×2 officielle utilise un pixel-unshuffle de facteur 2 puis deux blocs ×2 ; le modèle amont épinglé ne reconnaissait pas ses 12 canaux d’entrée. Le correctif de topologie conserve les poids. Six comparaisons de la boucle C++ réelle compilée contre `torch.nn.functional.pixel_unshuffle` passent exactement, avec images rectangulaires et lots multiples.

Les premières erreurs mémoire ont deux corrections vérifiées : le diagnostic avec garde de pile confirme un dépassement de la pile Emscripten de 64 Kio pendant la préparation du graphe ; celle-ci passe à 8 Mio, garde active. Le backend ne gérait pas Leaky-ReLU, utilisé en place par ESRGAN : son repli CPU sur des données GPU pouvait corrompre les tampons. Une opération F32 native WebGPU conserve désormais le calcul sur GPU. **Six comparaisons GPU/CPU donnent exactement les mêmes valeurs finies**, avec calculs en place, vues décalées/stridées, tailles impaires, plusieurs pentes et valeurs dépassant la plage F16. Les **douze tests IM2COL GPU/CPU** précédents passent toujours octet pour octet. L’outil diagnostique local optionnel se prépare avec `node scripts/browser-media/create-upscale-probe.mjs web-app/dist <build>` ; il n’est pas inclus dans une compilation normale.

Après correction, le véritable worker packagé agrandit la tasse **256 × 256 → 512 × 512 en 3,435 s**, puis le paysage réel **2048 × 880 → 4096 × 1760 en 31,889 s** (dont 30,86 s dans le moteur). Les dimensions DOM, les pixels variables et les téléchargements sont vérifiés. Le PNG 4096 × 1760 fait **15 146 227 octets**, SHA-256 `f31250f4ce59e7a63fdeb592e25b66996345a053a94a7b8a5d142782a12a57de`. Il s’agit de l’agrandissement seul, pas d’une nouvelle génération FLUX ni d’un total combiné mesuré.

Contrôle comparatif sur la tasse source 256 × 256 : la véritable fonction Desktop `media-server/upscale.py`, poids officiels et CUDA F32, produit son PNG 512 en 3,530 s. Différence moyenne des canaux RGB : **0,357/255**, percentile 95 : **1/255**, maximum : **26/255**. Les images sont proches mais pas identiques : poids convertis F16 dans le moteur Web contre F32 Desktop et bordures de tuiles différentes (recouvrement/blend Web contre padding/crop Desktop). Ce contrôle de fonction ne constitue pas un test complet de l’interface Desktop.

Le parcours intégré Novera Web réussit ensuite le prompt paysage complet en **2048 × 880, quatre étapes, graine 42, puis ×2**, avec une véritable sortie **4096 × 1760** enregistrée, affichée et téléchargée. Temps total affiché : **8 min 4 s** ; génération de base : **7 min 25 s**, dont texte 4,9 s, diffusion 5 min 22 s et décodage 1 min 57 s ; agrandissement **33,1 s** ; chargement des modèles 5,3 s. Le PNG est **identique octet pour octet** à l’agrandissement isolé du même paysage (`f31250…57de`, 15 146 227 octets). L’interface garde ses couleurs, affiche le modèle FLUX et la taille finale ; le bouton ×2 du compositeur peut être activé/désactivé après sélection du modèle officiel pour la session.

Une comparaison plus grande évite de généraliser le petit essai : la même fonction Desktop agrandit le même paysage en **7,836 s**, contre **31,889 s Web** pour l’étape seule. Écart moyen RGB **1,049/255**, percentile 95 **4/255**, maximum **44/255**. Ce sont des mesures de fonction/worker, pas une seconde mesure dans l’interface Desktop.

Les blocs d’agrandissement plus grands ont été testés, sans réduire la résolution :

| Bloc Web | Temps de l’étape ×2 | Écart RGB moyen face à la fonction Desktop de référence | Percentile 95 | Maximum |
| --- | --- | --- | --- | --- |
| 128 | 31,889 s | 1,049/255 | 4/255 | 44/255 |
| 256 | 26,939 s | 1,807/255 | 7/255 | 134/255 |
| 512 | 26,432 s | 12,864/255 | 37/255 | 155/255 |

Le bloc 512 atténue nettement les couleurs chaudes. La différence de tuilage et de contexte modifie le rendu ; un gain de temps ne certifie pas une meilleure qualité. **Conserver 128 par défaut**, quel que soit le budget mémoire. Les autres tailles restent des contrôles diagnostiques explicites, bornés par la mémoire et la limite d’un tampon.

Le contrôle source passe désormais **51 tests Vitest dans quatre fichiers**, **sept tests hors ligne du chargeur de patches**, les **18 comparaisons GPU/CPU** et les **six comparaisons de réarrangement C++/PyTorch** ci-dessus. La compilation WASM est reproductible dans le cache déjà patché ; la construction TypeScript/production avec les deux moteurs réussit. Ces validations ne valent pas audit de sécurité complet ni approbation de publication.

Dernière vérification du décodage : une variante diagnostique applique l’échelle de convolution réversible 1/32 déjà utilisée par le moteur SDXL, sans écrêter les activations ni modifier les fichiers de poids. Sur la tasse 256, elle diffère de la référence directe d’au plus **1/255**, moyenne **0,007665/255** ; les temps totaux sont 31,0 et 31,2 s. Mais le paysage 2048 sort en **6 min 6 s** avec bandes colorées et voile, malgré des pixels finis (écart RGB moyen **38,860/255**, percentile 95 **87/255**, maximum **255/255**). **Variante rejetée**, elle reste derrière le drapeau explicite de diagnostic, désactivé par défaut. Une garde refuse désormais les valeurs non finies avant conversion en PNG ; elle ne remplace pas le contrôle visuel.

Après restauration du moteur direct et du bloc ×2 de 128, le contrôle intégré final réussit à nouveau : **8 min 3 s**, dont diffusion **5 min 22 s**, décodage **1 min 58 s** et ×2 **33,0 s**. Sortie réelle 4096 × 1760, à nouveau **identique octet pour octet** au PNG `f31250…57de`. Ce contrôle utilise aussi la nouvelle garde de pixels, le bouton ×2 commun au style Desktop et les workers successifs. Aucun chemin rapide dégradé n’est activé dans la construction normale.

Le passage **Image → Musique** est ensuite rejoué sans rechargement : sélection des quatre GGUF ACE, instrumental, demande exacte `Gentle instrumental ambient piano, calm warm atmosphere, no vocals.`, durée manuelle 10 s, huit étapes, graine fixe 42 vérifiée dans les contrôles. Résultat **39,0 s** dans l’interface ; WAV 9,44 s / 48 kHz / stéréo / IEEE float32, **identique octet pour octet** à l’instrumental précédent à 41,6 s (`03e4ea…c67`, 3 625 004 octets). La lecture silencieuse atteint la fin sans erreur et les réglages du lecteur sont restaurés. Ce contrôle vérifie aussi la libération du créneau GPU entre les deux modalités ; il ne certifie pas à lui seul les instruments à l’écoute.

### Optimisation musique face aux 14,5 s Desktop rapportées

Le mainteneur rapporte ensuite **14,5 s dans Desktop 1.0.1** avec la même demande. Après déchargement de son modèle texte Desktop, la référence diagnostique Web donne 37,5965 s. Un tampon de lecture GGUF borné à 1 Mio réduit les petites lectures synchrones WORKERFS : 21,2555 s. L’opération audio COL2IM F32 est ensuite exécutée sur WebGPU, avec le même ordre de sommation que la référence CPU : **16,5904 s**. Douze comparaisons GPU/CPU sont exactes, y compris les cinq strides du VAE, le padding, les décalages et les grands dispatchs ; deux gardes refusent F16 et les sources non contiguës.

La véritable interface Novera Web, reconstruite avec les moteurs vérifiés et les mêmes réglages, donne **16,2 s puis 16,0 s**. Les mesures par phase sont affichées dans la conversation. La première sortie téléchargée, comme celles des variantes diagnostiques, garde le SHA-256 **`03e4ea7612f883405061330939d4620d15bfbefd56e4bf17cef8a0629db63c67`** de l’ancien instrumental en 39,0 s : aucun changement du WAV, de la graine, des fichiers de poids ou des huit étapes. Le résultat dépasse encore le temps Desktop rapporté de 1,5–1,7 s ; ce n’est pas une promesse de délai universel. Les caches et la concurrence GPU doivent être consignés séparément.

Validation source de cette passe : **28 tests Vitest dans cinq fichiers**, **huit contrats Node de packaging/livraison**, compilation WASM et construction TypeScript/production réussies. L’essai initial avec un autre modèle en VRAM (75,578 s) est un diagnostic de concurrence, exclu de la comparaison du gain. Publication Web, qualité du chant et audit de sécurité complet restent des validations distinctes.
