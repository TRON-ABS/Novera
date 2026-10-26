# Suivi des moteurs locaux Novera

## Résolution interne du moteur image Windows — 26 octobre 2026

L’interface n’expose plus le champ d’exécutable stable-diffusion.cpp sous Windows. Le flux envoie un remplacement nul et la commande native résout toujours `resources/image-engine/novera-image-engine.exe`, même si un ancien profil contient un chemin absolu de développement. Le lanceur et les bibliothèques CUDA/Vulkan/CPU sont déjà préparés par la compilation Windows et copiés dans les ressources du livrable. Le moteur reste un processus embarqué distinct ; il n’est pas lié statiquement à l’EXE principal. Les autres plateformes conservent leur sélection d’exécutable personnalisé.

Les boutons Auto, Texte, Image et Vidéo réutilisent `composer-tool-active` pour le cadre, le fond et le texte de la sélection, y compris au survol. Validation : 23 tests ciblés sous Windows et 23 avec la configuration par défaut, TypeScript et build Vite Windows/Tauri réussis avant l’ajustement visuel ; les cinq tests du composant passent aussi après cet ajustement. Aucun nouvel EXE Novera ni essai réel de génération pour cette correction. Le binaire existant doit être recompilé.

## Gestion mémoire entre texte, image et vidéo — 26 octobre 2026

Sur desktop, Automatique est la préférence globale par défaut, persistée séparément des configurations média ; importer ou sélectionner une configuration ne la remet pas à zéro. Une file pure de baux d’inférence protège les travaux actifs, permet le partage du même modèle texte, attend les modèles différents et accorde un passage réentrant aux chargements internes. Une préparation partagée empêche un second utilisateur du même modèle de démarrer avant la fin de l’éviction ; annuler un demandeur ne casse pas l’autre. Les baux sont libérés à la fin, à l’erreur ou à l’annulation du flux.

L’adaptateur attend la publication et la sortie des anciens workers média ; la commande native `creation_release_idle` ne retire que leurs handles terminés et livrés, sans tuer de génération ni supprimer de sortie. Il décharge ensuite les modèles inutilisés via les API llama.cpp/MLX/Transformers et actualise la liste chargée. Les appels cloud seuls passent sans éviction. Les documents/RAG et modèles locaux de routage des outils partagent le bail du tour ; un routeur local est recréé après éviction pour retrouver sa vraie session. Les modèles et conversations ne sont pas retirés du catalogue ou du disque.

Manuel suit aussi les travaux actifs mais autorise leur coexistence : le worker natif valide la politique puis permet plusieurs processus image/vidéo indépendants. Le service texte désactive son éviction implicite lorsque la mémoire est gérée par Novera. Texte/image/vidéo peuvent donc être demandés simultanément dans des discussions distinctes si le matériel le permet. Les workers média se terminent normalement après chaque tâche ; aucun cache média permanent n’est ajouté. Une préférence modifiée ne préempte pas les travaux en cours.

Validation locale : **369 tests web réussis dans 24 fichiers**, dont permutations texte/image/vidéo, concurrence manuelle, équité, annulation, préparation partagée, RAG/routeur auxiliaire et contrôles visibles ; **3 tests Rust autonomes** de politique de concurrence ; contrôle Rust de la bibliothèque, TypeScript, **70 locales × 1 689 clés**, frontières et tests d’architecture. Ces preuves sont des tests de politique/orchestration avec moteurs simulés ; elles ne prouvent pas la cohabitation de trois gros modèles sur chaque GPU. Les anciens essais CUDA/Vulkan/NVFP4 demeurent séparés. Pas de nouveau build Novera ni binaire publié.

## Installation groupée, bibliothèque et moteur embarqué — 26 octobre 2026

Sources locales : installation explicitement confirmée du trio FLUX.2 Klein/Qwen3/VAE vers le dossier système Documents ou un parent choisi, progression par octets/fichier, SHA-256 et révisions officielles, pause/reprise HTTP Range avec contrôle Content-Range et redémarrage sûr si le serveur ignore Range. Les fichiers finaux différents déjà présents ne sont jamais écrasés. L’état de la tâche est conservé ; une tâche interrompue au redémarrage devient en pause. Aucun modèle complet téléchargé pendant ce développement.

Notification limitée à l’icône globale, son pourcentage et son panneau ; fin persistante jusqu’à acquittement explicite, sans son/notification système. Import automatique de la configuration vérifiée dans la bibliothèque Image de la page llama.cpp ; import/édition/suppression d’entrées Image/Vidéo et sélection locale dans la discussion. Une suppression d’entrée importée préserve les fichiers et n’est pas annulée par le suivi de téléchargement. Les trois composants FLUX ne sont pas ajoutés comme trois modèles texte. Les modifications des configurations sont persistées et le flux de génération utilise la configuration de sa discussion, même si une autre discussion a modifié les réglages globaux.

Une seconde installation conseillée utilise le fichier BFL officiel `FLUX.2-klein-4b-nvfp4`, révision `1db2b2f776c24b76f1122e5f69ab1949fc620068`, SHA-256 `d8c5007b6a3bbbdfd38538bbcef5101a55dfde81894f58d2e3c8701cdef3542b`, avec **Qwen3-4B GGUF CPU conservé** et le même VAE. Total : **5 125 814 622 octets**. Elle est activée après une sonde dans le Python configuré : dépendances locales, CUDA, SM ≥ 10, au moins 4,5 Gio de VRAM libre et une minuscule GEMM FP4 native réellement exécutée. Sonde positive réelle sur RTX 5070 Laptop, Python 3.15.1 / PyTorch 2.14.1+cu130. Le Qwen NVFP4 demandé ensuite a été annulé par le mainteneur et ne figure ni dans le catalogue ni dans le chargeur. Aucun nouveau checkpoint complet n’a été téléchargé.

Le moteur C++ **CUDA Toolkit 13.4.3 / NVCC 13.4.92**, stable-diffusion.cpp `e41fbcf455e0fbb45e08bd535b00d6cba865e921`, GGML `a5915eb0e47adef21c3f25b889a008925ea838c2`, a été construit localement. Le lanceur vérifie le pilote, les DLL et la disponibilité réelle du backend ; la sonde sélectionne `cuda0`, SM 12.0, sur RTX 5070 Laptop. Maxwell/Pascal/Volta sont exclus de ce CUDA 13 et dirigés vers Vulkan si le pilote l’expose, sinon CPU. Ces anciennes cartes sont couvertes par tests de politique simulés, pas par un essai matériel. Les choix CPU indépendants pour Qwen et l’annulation des processus enfants sont conservés.

Le lanceur Windows et `yarn build:tauri:win32` préparent des ressources `resources/image-engine/` avec empreintes et licences : aucun SDK CUDA n’est requis chez l’utilisateur final. La première préparation du moteur sur un hôte de compilation demande les outils MSVC et le Toolkit épinglé. Champ exécutable vide = moteur embarqué ; les remplacements manuels restent disponibles. Les chemins Safetensors/GGUF compatibles utilisent ce C++ ; **le NVFP4 matériel natif reste le chemin PyTorch 2.14.1+cu130 déjà validé séparément**, et ses DLL CUDA 13.0 ne sont pas remplacées par celles du Toolkit 13.4. Aucun ajout de vidéo GGUF : les dossiers Diffusers vidéo restent le chemin pris en charge.

Validations : 98 tests web ciblés et contrôle TypeScript, contrôle des 70 locales à **1 681 clés**, frontières et sept tests d’architecture ; six tests Rust du module exact dans un harnais isolé (HTTP local, petits fichiers, reprise, serveur ignorant Range, empreinte, pause et fichiers existants), et `cargo check --lib`. Le lanceur de tests Rust complet rencontre un ancien conflit de point d’entrée DLL dans son environnement ; le harnais évite cette dépendance aux moteurs texte. Sonde CUDA réelle validée, mais **ni génération CUDA avec le nouvel exécutable embarqué dans l’interface ni parcours graphique complet de téléchargement des 5,27 Go validés ici**. Les 11,3/11,4 s rapportées par le mainteneur ne prouvent pas CUDA ; le chemin communiqué était Vulkan. Publication des sources et de la vitrine autorisée ; aucune nouvelle compilation de l’application Novera ni publication de binaire.

État local au **26 octobre 2026**. Ce suivi distingue capacités des sources, tests exécutés et binaires disponibles. Une publication de sources a été autorisée et effectuée précédemment ; la **dernière consigne autorise la publication des sources et la mise à jour de la vitrine, sans nouvelle compilation de Novera ni publication de binaire**. Environnements, modèles, exécutables et journaux restent locaux.

| Moteur | Formats et matériel | Version / état |
| --- | --- | --- |
| llama.cpp | GGUF ; CPU et accélérateurs selon la construction | Moteur 0.7.0, llama.cpp b11823 ; [état existant](DEVELOPMENT.md#engine). Non mis à jour par ce travail. |
| MLX | Dossiers MLX sur Mac Apple Silicon | Intégration existante ; aucune nouvelle validation Mac ici. |
| Transformers / Safetensors | Dossiers Hugging Face textuels, poids simples ou découpés ; CPU et NVIDIA CUDA | Ajout de sources publié précédemment ; distinct du nouveau parcours multimédia local. |
| Diffusers / créations | Dossiers Diffusers image/vidéo reconnus ; CPU ou CUDA, hors réseau | Nouvel adaptateur local, non compilé dans l’application et non publié, à la demande du mainteneur. |
| NVFP4 CUDA natif / image | FLUX.2 Klein 4B Comfy NVFP4 + Qwen3 GGUF + VAE Safetensors ; GPU Blackwell | PNG réel RTX 5070 Laptop, 400 GEMM FP4 ; Qwen CPU/GPU/Auto validés. Sources locales, interface native à valider après compilation. |
| stable-diffusion.cpp / créations mixtes | Composants GGUF/Safetensors compatibles, choisis séparément ; NVFP4 ComfyUI reconnu via cache BF16 puis représentation de diffusion Q8_0 ; CPU ou backend GPU disponible | Runtime officiel master-1015-e41fbcf ; PNG réels CPU et Vulkan avec l’encodeur GGUF « uncensored ». Sources Novera publiées ; génération graphique GGUF validée le 26 octobre sur le binaire compilé par le mainteneur, sur un PC Windows. |

## Versions CPU et GPU

| Composant | Version retenue | Provenance |
| --- | --- | --- |
| Python | **3.15.1** | Installation existante du mainteneur ; environnements isolés, sans modification globale. |
| PyTorch | **2.14.1**, dernière stable vérifiée le 26 octobre 2026 | [Annonce officielle](https://dev-discuss.pytorch.org/t/pytorch-2-14-1-general-availability/3455). La 2.15 est encore en RC : [annonces](https://dev-discuss.pytorch.org/c/release-announcements/27). |
| PyTorch CPU | **2.14.1+cpu** | [Index CPU officiel](https://download.pytorch.org/whl/cpu/torch/). |
| PyTorch GPU | **2.14.1+cu130**, CUDA 13.0 | [Index CUDA officiel](https://download.pytorch.org/whl/cu130/torch/), paquet Windows CPython 3.15. |
| Transformers | **5.20.2** | Version installée et épinglée dans les dépendances. |
| Safetensors | **0.8.0** | Version installée et épinglée dans les dépendances. |

Les paquets PyTorch Python 3.15 proviennent de `download.pytorch.org`, sans paquet Python 3.15 sur PyPI. La génération reste en mode eager : `torch.compile` n’est pas pris en charge sous Python 3.15 dans cette version. [Notes officielles PyTorch 2.14](https://pytorch.org/blog/pytorch-2-14-release-blog/).

Le toolkit déjà installé sur le PC est **CUDA SDK 13.4.3**, avec **NVCC 13.4.92** ; il n’a pas été remplacé. Le paquet PyTorch `+cu130` utilise son runtime CUDA **13.0** embarqué. Le toolkit local sert notamment à compiler depuis les sources ou des extensions ; sa présence ne change pas le runtime d’un paquet précompilé. [Explication PyTorch](https://discuss.pytorch.org/t/is-it-required-to-set-up-cuda-on-pc-before-installing-cuda-enabled-pytorch/60181/26).

## Fonctionnement et limites

- **CPU / GPU** propose Auto, CPU ou CUDA. Auto choisit CUDA si PyTorch le déclare disponible ; CPU impose le processeur ; CUDA échoue explicitement si le paquet, le matériel ou le pilote ne le permet pas.
- Modèle et entrées sont transférés sur le périphérique choisi. Le GPU conserve le dtype déclaré ; le CPU utilise float32. Le modèle doit tenir en RAM ou VRAM, sans répartition automatique des couches.
- Import du dossier complet : configuration, tokenizer et poids Safetensors, simples ou découpés. Chargement hors réseau, sans conversion GGUF ni code du dépôt modèle.
- Une session à la fois, démarrage à la demande, clé aléatoire, écoute sur `127.0.0.1`, annulation limitée à la requête et arrêt avec l’application. Supprimer l’import conserve les fichiers originaux.
- Texte, streaming, comptes de tokens, température, top-p et limite de sortie. Outils, vision, audio, embeddings, adaptateurs seuls et quantifications AWQ/GPTQ/MLX restent exclus.
- AMD ROCm, Intel XPU, Apple MPS, macOS et l’exécution Linux ne sont pas validés pour ce moteur. Architectures limitées à celles reconnues par `AutoModelForCausalLM` sans `trust_remote_code`.
- Python 3.15.1/Windows : le chargement parallèle et les opérations PyTorch dans un thread secondaire ont provoqué des violations d’accès natives. Le moteur charge séquentiellement et exécute PyTorch dans le thread principal ; les requêtes passent par une file et le transport HTTP séparé.

## Modèle minuscule et preuves

Fixture GPT-2 non entraînée : **9 152 paramètres**, vocabulaire de 32 tokens, contexte de 128 tokens et **39 168 octets de poids**. Ses sorties servent au test technique ; elles ne sont pas conversationnelles.

- [Générateur reproductible](../transformers-server/create_tiny_model.py) et [tests réels](../transformers-server/test_server.py).
- Modèle local : `deliverables/safetensors-test-2026-10-26/tiny-model/`.
- [Installation et utilisation](../transformers-server/README.md).
- Journaux et environnements personnels : `.build/safetensors-2026-10-26/`. Preuves JSON du SDK dans le livrable local. Ces fichiers ne constituent pas une publication.

## Résultats locaux — 26 octobre 2026

- Serveur Python sous **3.15.1** : **10 tests CPU réussis**, puis **10 tests CUDA réussis**. Vérifications du chargement réel, génération normale et streaming, authentification, validation des shards et annulation.
- Intégration native : **2 tests CPU réussis**, puis **2 tests CUDA réussis**, comprenant import, sonde Python/PyTorch, chargement, génération et suppression de l’enregistrement sans effacer les poids. Sous Windows, le harnais de test a nécessité l’injection locale du manifeste Common Controls v6 dans l’exécutable de test ; ce correctif de harnais ne constitue pas une validation sur PC propre.
- Transport réel du SDK Novera : génération normale et streaming réussis en CPU et CUDA, **8 tokens de sortie par requête**. Preuves locales : `deliverables/safetensors-test-2026-10-26/sdk-proof-cpu.json` et `sdk-proof-cuda.json`.
- GPU testé : **NVIDIA GeForce RTX 5070 Laptop GPU**, paramètres sur **cuda:0**, **44 032 octets alloués** pour la fixture minuscule. Ce résultat ne mesure ni la vitesse ni la capacité avec un grand modèle.
- Contrôle Rust et vérification TypeScript réussis. Journaux : `python-tests-cpu.log`, `python-tests-cuda.log`, `native-tests.log`, `native-tests-cuda.log`, `sdk-cpu.log`, `sdk-cuda.log` sous `.build/safetensors-2026-10-26/`.

Ces résultats sont locaux : aucune CI, certification multi-matériel, validation Linux/macOS ou publication n’en découle. Une compilation Web ou un contrôle Rust ne prouve pas qu’un ancien exécutable contient ce moteur.

## Hub, matériel et conseils

Le catalogue prépare **23 entrées de navigation**, dont tous les domaines et les tâches inconnues. Le contrôle public des métadonnées a couvert **47 tâches Hugging Face sur 47**, sans poids téléchargés ni jeton de compte utilisé ; preuve locale `deliverables/safetensors-test-2026-10-26/hub-live-proof.json`. Image, vidéo, médical et autres domaines sont découvrables ; leur présence ne signifie pas que leurs moteurs d’exécution sont intégrés. Le domaine médical n’est pas une validation clinique.

Le diagnostic avant téléchargement sépare moteur, système, mémoire et métadonnées manquantes. Il adapte l’estimation à la RAM et au GPU disponibles, à la variante, au contexte et aux compagnons identifiés. Pour Safetensors, une sonde de l’environnement Python/PyTorch vérifie CUDA avant de compter sur sa mémoire GPU. Sans accélération confirmée, l’estimation tient compte du repli CPU float32. Les GPU ne sont pas additionnés et aucune répartition automatique CPU/GPU n’est promise.

Les conseils sont calculés localement et expliqués : priorité démarrage, petit téléchargement ou nouveauté, mémoire estimée et langue déclarée. Les performances restent à mesurer. L’import Safetensors nécessite actuellement un **dossier local complet** ; le téléchargement automatique d’un dépôt Safetensors complet n’est pas intégré.

Validation Hub enregistrée : **158 tests dans 13 fichiers**, puis **195 tests dans 4 fichiers** pour conseils, catalogues et import. Ces lots ne sont pas un total de tests uniques. Les **70 locales couvrent chacune 1 587 clés** ; relecture native encore nécessaire.

## Cohérence du diagnostic Hub — 26 octobre 2026

Le badge de compatibilité utilise désormais le même diagnostic que la vérification avant téléchargement, avec les traductions existantes dans les 70 locales. Une taille ou une information matérielle manquante reste explicitement une estimation indisponible. Le bouton « Suivant » a été retiré à la demande du mainteneur. Le défilement vers le bas charge progressivement les résultats de la catégorie active ; les modèles supplémentaires s’ajoutent en bas sans déplacer les précédents. Le chargement se suspend pendant une requête, en cas d’erreur ou à la fin des résultats. Les observateurs périmés ne déclenchent pas de chargement après un changement de catégorie.

Validation précédente du badge et de la pagination manuelle : 6 tests réussis. Nouveau défilement progressif : 16 tests ciblés réussis dans 5 fichiers (défilement, ordre stable, catégories, catalogue et badge), contrôle TypeScript sans émission réussi. Les libellés réutilisent les 70 catalogues existants, 1 587 clés par locale. Aucune compilation lancée pour ce correctif : le mainteneur prend en charge la compilation. Publication des sources autorisée ensuite par le mainteneur le 26 octobre ; aucun binaire publié.

Contrôle final avant publication des sources : **309 tests réussis dans 17 fichiers**, TypeScript sans émission réussi ; contrôles des 70 locales et des frontières d’architecture sans erreur. Aucun nouveau build ni binaire publié pour cette synchronisation.

## Créations dans la discussion — travail local du 26 octobre 2026

Dernière consigne du mainteneur : **aucune nouvelle compilation de l’application, aucun commit, push ni mise à jour du dépôt pour ce lot**. L’autorisation de publication des étapes précédentes ne s’applique pas à ce travail.

Le compositeur réunit Auto, Texte, Image et Vidéo ; le transport choisit le moteur de diffusion avant toute création de modèle textuel. Le choix manuel prime et les réglages/modes sont persistants, par conversation pour le mode. Agent/Cowork restent sur leur parcours existant. Les nouvelles commandes, aides et erreurs sont présentes dans les **70 locales**, désormais **1 620 clés par locale** (33 ajouts). Les erreurs détaillées du moteur restent dans les diagnostics locaux ; l’interface présente les messages traduits. Auto reconnaît les demandes explicites françaises/anglaises et les commandes `/image`/`/video` ; les autres langues disposent des boutons explicites. La relecture native reste nécessaire.

Moteur **Diffusers 0.42.0**, **Python 3.15.1**, PyTorch CPU **2.14.1+cpu** et CUDA **2.14.1+cu130**. Bibliothèques installées dans les deux environnements isolés existants : Pillow **13.0.0**, imageio **2.38.1**, imageio-ffmpeg **0.6.0**. Aucun Python global ni toolkit CUDA modifié, aucun poids de modèle téléchargé. Installation optionnelle reproductible : `transformers-server/setup.ps1 -Backend cu130 -Media` ou `cpu`. Le dossier complet du modèle et cet exécutable Python se choisissent dans les réglages de création. [Installation, familles reconnues et limites](../media-server/README.md).

Résultats réels locaux : fixtures Stable Diffusion et CogVideoX non entraînées, construites sur place. **PNG et MP4 produits sur CPU et CUDA**, puis variante image-à-image produite sur CPU et animation image-à-vidéo produite sur CUDA avec une fixture CogVideoXImageToVideo distincte. Les vidéos de test, y compris l’animation, contiennent cinq images 64×64 à 8 FPS ; ce sont des tests techniques, pas des preuves de qualité ou de performance de grands modèles. Preuves privées sous `.build/media-creation-2026-10-26/runtime-proof.json` et journaux voisins. Les tests écrivent dans une galerie de test confinée à `.build`, sans créer de fichiers dans les dossiers personnels Images/Vidéos.

En fonctionnement natif, les dossiers connus du système déterminent **Images/Novera image** et **Vidéos/Novera vidéo**, y compris leurs redirections. Un nom UUID et une publication exclusive évitent les écrasements ; un JSON voisin garde les paramètres. Le fil conserve une référence légère rechargée via un résolveur limité à ces fichiers. Aperçu/agrandissement, lecteur vidéo, affichage dans le dossier et préparation d’une variante sont intégrés. Déplacer/supprimer le fichier laisse un état indisponible explicite. Les fichiers ne sont pas envoyés à un moteur texte pour lui attribuer une capacité visuelle inexistante.

Un seul job de création à la fois. Stop annule le processus concerné, la fermeture de Novera arrête les workers possédés et un observateur du parent traite la disparition de l’application. Mémoire sans offload automatique ; modèles quantifiés/custom non certifiés. L’adaptateur vidéo traite le texte-à-vidéo et l’image-à-vidéo avec des dossiers conditionnés par image explicitement reconnus ; il ne convertit pas automatiquement les poids texte-à-vidéo. Le montage et les variantes de vidéos existantes restent à intégrer. Le Hub n’installe pas encore automatiquement les dossiers Diffusers et son diagnostic général ne certifie pas ces pipelines.

Vérifications enregistrées : **8 tests Python de validation réussis** ; lot final de discussion/transport/messages/contrôles/locales à **370 tests réussis dans 17 fichiers**. Une sélection intermédiaire de 188 tests avait également passé ; ces lots ne doivent pas être additionnés comme des tests uniques. TypeScript sans émission et contrôles des 70 catalogues et des frontières d’architecture sont exécutés localement. Un contrôle Rust initial a passé avant les derniers ajustements ; aucune nouvelle compilation native depuis la consigne du mainteneur. Le parcours graphique complet dans un nouveau binaire reste à valider après sa compilation par le mainteneur.

## Création cloud dans la discussion — 26 octobre 2026

**Sources locales en cours de validation, sans compilation ni publication.** Le sélecteur commun propose **Tous / Texte / Image / Vidéo / Multimodal**, avec **Tous / Local / Cloud** pour l’emplacement. Comprendre une image est une capacité d’entrée ; créer une image ou une vidéo est une capacité de sortie distincte. Un modèle de vision textuel ne devient pas un générateur d’images. Les modèles de recherche vectorielle restent exclus du sélecteur de discussion.

**41 profils cloud distincts**, dont 14 ajouts : Black Forest Labs, Stability AI, Recraft, Ideogram, Adobe Firefly, Runway, Luma, LTX/Lightricks, fal, Replicate, Leonardo.Ai, Krea, Vidu et PixVerse. Les profils OpenAI, Google Gemini, xAI, MiniMax et BytePlus existants sont réutilisés. **45 présélections de génération** documentées ; il s’agit d’un catalogue entretenu, pas d’une garantie d’accès au compte. Kling, Pika et Qwen Image sont aussi proposés via fal : la clé, le prestataire qui reçoit le texte et sa facturation sont ceux de fal. Replicate héberge sa propre entrée FLUX. Les identifiants et sources exactes se trouvent dans [mediaProviders.ts](../web-app/src/constants/mediaProviders.ts), vérifiés le 26 octobre 2026.

| Profil | Présélections de génération |
| --- | --- |
| byteplus | `dola-seedream-5-0-pro-260628`, `dreamina-seedance-2-5-260628` |
| fal | `fal-ai/pika/v2.2/text-to-video`, `fal-ai/qwen-image-2512`, `fal-ai/flux-2-max`, `fal-ai/kling-video/v3/pro/text-to-video`, `fal-ai/kling-video/v3/standard/text-to-video` |
| adobe-firefly | `firefly_image`, `firefly-video` |
| gemini | `gemini-omni-1.1-flash`, `gemini-nano-banana-2.1` |
| krea | `krea-3` |
| leonardo | `lucid-origin`, `krea-2-turbo`, `ideogram-v3.0` |
| replicate | `black-forest-labs/flux-2-max` |
| vidu | `viduq4-preview`, `viduq3-pro`, `viduq3-turbo` |
| openai | `gpt-image-2.5-sunburst`, `gpt-image-2.5-flare` |
| xai | `grok-imagine-image-2.0`, `grok-imagine-video-1.5`, `grok-imagine-video-1.5-lite` |
| bfl | `flux-2-max`, `flux-2-pro`, `flux-2-klein-9b` |
| stability | `stable-image/generate/ultra`, `stable-image/generate/core` |
| recraft | `recraftv4_1`, `recraftv4_1_flash`, `recraftv4_1_pro` |
| ideogram | `ideogram-4-5` |
| runway | `gen4.5` |
| luma | `uni-1-max`, `uni-1`, `ray-3.2` |
| ltx | `ltx-2-5-pro`, `ltx-2-5-fast` |
| minimax | `MiniMax-H3-Max`, `MiniMax-H3`, `MiniMax-H3-Highspeed`, `image-01` |
| pixverse | `v6-max`, `v6` |

Le plus récent modèle documenté est placé avant les variantes conservées, sous réserve des familles et de l’ordre propre à chaque fournisseur. Vidu Q4 est explicitement un **aperçu exigeant une image** ; Q3 conserve le texte-vers-vidéo. Adobe Image utilise le modèle géré `firefly_image` de l’API v4 (Image 5) ; Adobe Video utilise le service géré v3, sans inventer un numéro de modèle. Les variantes vectorielles SVG de Recraft ne sont pas proposées par cet adaptateur raster. Le modèle le plus récent disponible dans une application web n’est pas nécessairement accessible dans une API publique.

**Modèles retirés exclus** : les anciennes API OpenAI GPT Image 1 et DALL-E ne sont pas réintroduites ; Sora/Videos API est arrêtée depuis le 24 septembre 2026, donc aucune entrée Sora utilisable. Sources : [images OpenAI](https://developers.openai.com/api/docs/guides/image-generation), [arrêt vidéo OpenAI](https://developers.openai.com/api/docs/guides/video-generation). Les changements de catalogue nécessitent une nouvelle vérification officielle datée ; aucun modèle n’est déclaré disponible sur la seule base de son nom.

### Routage, enregistrement et identifiants

Un choix image/vidéo reste propre à la discussion et à sa sortie, séparé du modèle texte. Les choix de la page d’accueil sont transférés à la nouvelle discussion. Agent/Cowork restent sur leur chemin texte. Une catégorie filtre les capacités ; le choix d’un modèle de création configure la sortie correspondante. Les clés sont celles des profils existants, stockées par le mécanisme de trousseau du système ; aucune clé supplémentaire dans les paramètres de création ni dans les fichiers générés. Adobe utilise le jeton d’accès dans le champ clé et l’identifiant client public `x-api-key` dans son champ dédié.

L’adaptateur soumet une seule demande payante et ne bascule pas automatiquement vers un autre compte ou fournisseur. Les tâches asynchrones sont suivies toutes les cinq secondes, au plus trente minutes. Arrêter tente l’annulation documentée pour Runway, fal, Replicate et Adobe lorsque l’URL est disponible ; un arrêt local ne garantit pas l’annulation de la facturation distante. Après délai dépassé, vérifier le tableau de bord du prestataire avant de relancer. La liste statique peut être actualisée sans clé : cela **ne teste pas** l’authentification ni les droits du compte et ne lance aucune création payante.

Les résultats terminés sont téléchargés immédiatement et sauvegardés dans les dossiers système **Images/Novera image** et **Vidéos/Novera vidéo**, comme les résultats locaux ; la discussion garde une référence légère. Formats acceptés : PNG, JPEG, WebP, MP4. Pas de SVG exécutable ni de fichier HTML présenté comme une image. Le téléchargement natif exige HTTPS, vérifie les adresses publiques et chaque redirection, fixe la résolution DNS validée, n’envoie aucune clé du fournisseur au CDN, limite à 32 Mio par image / 512 Mio par vidéo et écrit d’abord un fichier provisoire. Publication sans écrasement ; métadonnées avec texte, fournisseur et modèle, sans URL signée ni identifiant secret.

Les paramètres numériques locaux concernent Diffusers. Le cloud utilise des préréglages propres aux contrats API (notamment vidéos de 5 s, LTX 8 s, ou valeurs par défaut du fournisseur). Une seule image de départ est acceptée lorsque le modèle et l’adaptateur l’annoncent ; aucune conversion silencieuse d’un modèle texte vers une variante conditionnée. Les adaptateurs Luma/PixVerse de ce lot exposent la création depuis le texte ; leurs autres fonctions ne sont pas annoncées comme implémentées. Les éditions vidéo, références multiples, montage, streaming vidéo et paramètres avancés restent hors de ce lot.

### Niveau de confiance et validation

Sélection fondée sur une identité publique établie, une documentation API officielle, un canal de compte identifiable et une génération documentée ; cela ne certifie ni la sécurité du fournisseur ni sa disponibilité dans toutes les régions. Les plateformes d’hébergement indiquent clairement le service réellement appelé. Pas de profil direct Kling/Pika inventé à partir d’un site non documenté ; les accès hébergés vérifiés sont distincts. Les passerelles Azure/AWS/Alibaba/IBM et autres API déjà présentes ne reçoivent pas de capacités de génération fictives sur leur seul endpoint texte. Leur intégration média supplémentaire attend un contrat d’authentification et de déploiement vérifié.

Contrôles locaux : tests de contrat HTTP simulés, routage, annulation, persistance et interface ; chiffres finaux consignés ci-dessous. **Aucun appel cloud réel avec compte fournisseur, aucune création cloud facturée, aucune validation d’un nouvel exécutable ni compilation Rust de ce lot.** L’analyse rustfmt vérifie seulement la syntaxe/présentation. Les preuves CPU/CUDA précédentes concernent les créations locales et ne valident pas le cloud.


Validation finale locale du lot cloud (26 octobre 2026) : **576 tests web réussis dans 26 fichiers**, couvrant les 20 recettes API simulées, le flux de sauvegarde, les arrêts pendant la préparation, les filtres et le maintien du modèle texte, la reprise des profils/identifiants, les 41 icônes fournisseurs et les régressions de conversation. **TypeScript `--noEmit` réussi**, **70 × 1 645 clés validées sans erreur**, contrôle des six frontières d’architecture (17 fichiers stricts, zéro violation) et **7 tests d’architecture réussis**. `rustfmt --edition 2021 --check` réussi pour les deux sources natives modifiées ; aucune compilation native ni test cloud réel. Preuves locales ignorées du dépôt : `.build/cloud-media-2026-10-26/{final-tests.log,types.log,locales.log,official-icons.json}`. Les messages d’erreur simulés dans les tests sont attendus, sans échec de test.


## Images GGUF et encodeur Qwen3 GGUF — 26 octobre 2026

État initial du lot ; le correctif et les générations réussies sont documentés plus bas dans « Formats mixtes GGUF/Safetensors et compatibilité NVFP4 ».

**Adaptateur ajouté aux sources locales, sans nouvelle compilation ni publication.** Le moteur image se choisit entre Diffusers et **stable-diffusion.cpp**. La vidéo conserve Diffusers et son environnement Python 3.15.1 ; le moteur C++ ne dépend pas de Python. La discussion, les aperçus, l’arrêt du processus possédé et les dossiers système de sauvegarde restent communs.

Pour FLUX.2 Klein 4B, les réglages sélectionnent séparément :

1. L’exécutable `sd-cli.exe`, conservé avec les DLL de son archive.
2. Le **véritable GGUF de diffusion image**.
3. L’**encodeur de texte Qwen3-4B GGUF** (dont la quantification peut différer de celle du modèle image).
4. Le **VAE FLUX.2**, Safetensors ou GGUF compatible.

Source du montage : [documentation FLUX.2 officielle de stable-diffusion.cpp](https://github.com/leejet/stable-diffusion.cpp/blob/master/docs/flux2.md). Le format GGUF ne détermine pas le rôle d’un fichier. Un encodeur Qwen3 GGUF peut fonctionner dans le nœud d’encodage de ComfyUI tout en étant impropre au champ diffusion. Le contrôle natif détecte les architectures textuelles courantes depuis les métadonnées GGUF bornées et renvoie un diagnostic traduit, sans déduire le rôle du seul nom. Les autres incompatibilités de tenseurs restent vérifiées par le moteur.

### Runtime préparé et paramètres

Version officielle épinglée **master-1015-e41fbcf**, commit `e41fbcf` ; [version publiée](https://github.com/leejet/stable-diffusion.cpp/releases/tag/master-1015-e41fbcf). Archives Windows x64 CPU et Vulkan téléchargées et extraites uniquement sous `.build/gguf-image-2026-10-26/runtime/`, sans installation globale, recompilation, téléchargement de poids ni changement du SDK CUDA 13.4 existant. SHA-256 comparés aux empreintes de la publication :

| Runtime | Octets de l’archive | SHA-256 |
| --- | --- | --- |
| CPU | 18 080 790 | `bfc02f16df7744296ecc7720503a2b633575490dd7d8b448aee035c1fc836bec` |
| Vulkan | 29 744 345 | `259ceeb62f1069190d24c85ea1c4549d2d61deb0ef712510dbe98d79ce93a38b` |

Ces fichiers ignorés restent locaux ; ils ne sont ni empaquetés dans l’installeur ni publiés dans le dépôt. La sélection explicite de leur exécutable est nécessaire. Conserver les licences et DLL fournies. Auto utilise les périphériques du binaire sélectionné ; CPU ajoute `--backend cpu`, CUDA demande `cuda0` et nécessite un binaire CUDA, distinct du runtime Vulkan préparé. L’énumération réelle du runtime Vulkan a reconnu **NVIDIA GeForce RTX 5070 Laptop GPU**, **Intel Graphics** et **Intel Core Ultra 7 255HX**. Aucun modèle n’a été exécuté avec succès du seul fait de cette détection.

Le profil de départ Klein distillé propose **4 étapes, CFG 1, Euler** ; il ne certifie pas les réglages d’une variante base ou personnalisée. Largeur/hauteur/graine/étapes et CFG sont transmis explicitement, avec offload RAM et tuilage VAE. Arguments structurés, sans shell ; vérification des chemins locaux, en-têtes GGUF, limites et modalité image. Une seule image de référence est transmise quand demandée. Le texte du processus CLI n’est pas interprété comme un résultat de génération : progression indéterminée, puis PNG complet et métadonnées publiés sans écrasement, avant insertion dans la conversation. L’arrêt couvre aussi une sortie de processus pas encore publiée.

### Essais avec les fichiers du mainteneur : limites constatées

Inspection en lecture seule des fichiers du dossier indiqué puis de ComfyUI ; aucun original modifié. `flux2-klein-4b-uncensored-q4_k_m.gguf` annonce **`general.architecture=qwen3`**, **« Flux2 Klein 4b Uncensored Text Encoder »**, 36 blocs et dimension 2 560. C’est un **encodeur**, utilisable dans ce rôle selon le mainteneur dans ComfyUI. Il ne remplace pas le modèle de diffusion. `Qwen3-4B-Q5_K_M.gguf` est également un encodeur textuel Qwen3 ; `flux2-vae.safetensors` est présent.

Les workflows ComfyUI observés séparent un `CLIPLoaderGGUF` Qwen3-4B, un VAE FLUX.2 et un `UNETLoader` de modèle image **Safetensors NVFP4**. La tentative CLI utilisant l’encodeur comme diffusion échoue, conformément au rôle réel du fichier. Une seconde tentative, avec le modèle de diffusion local `flux-2-4b-nvpfp4.safetensors` et le GGUF « uncensored » au bon rôle d’encodeur, reconnaît **Flux.2 klein**, puis échoue sur une assertion des échelles de quantification NVFP4 (`scale_nelements`). **Aucune image réelle produite par ces essais.** La réussite dans ComfyUI ne valide donc pas ce fichier NVFP4 avec ce runtime stable-diffusion.cpp. Le nouvel adaptateur Novera expose ici le chemin image **GGUF** ; il n’annonce pas la compatibilité de cette quantification Safetensors NVFP4.

Les binaires CPU/Vulkan ont aussi accepté les options prévues et refusé des poids volontairement invalides sans écrire de PNG. Preuves locales : `runtime-proof.json`, `devices.txt`, `real-vulkan.log`, `real-vulkan-nvfp4.log` et inspection de métadonnées sous `.build/gguf-image-2026-10-26/`. Une génération avec un vrai GGUF de diffusion compatible, la retouche image, l’arrêt natif et le flux complet dans un nouvel exécutable restent à valider. **Ne pas annoncer une génération CPU/GPU réussie pour ce lot.**


Validation finale des sources de ce lot : **579 tests web réussis dans 26 fichiers**, contrôle TypeScript **sans émission** réussi, **70 × 1 653 clés** sans erreur, 7 tests d’architecture réussis et aucune violation dans les 17 fichiers stricts. `rustfmt --edition 2021 --check` réussi pour les sources natives concernées. Logs locaux : `final-tests.log`, `types-final.log`, `locales.log`, `architecture-tests.log` sous `.build/gguf-image-2026-10-26/`. Ces contrôles ne remplacent ni une compilation Rust/application ni une génération réelle avec des poids de diffusion compatibles. Les originaux ComfyUI et les modèles du mainteneur restent intacts.


## Formats mixtes GGUF/Safetensors et compatibilité NVFP4 — 26 octobre 2026

**Correctif du lot initial ci-dessus : réussite réelle du runtime avec les fichiers du mainteneur. Les sources Novera restent locales, sans compilation de l’application ni publication.** Le choix du modèle image, de l’encodeur et du VAE est indépendant : GGUF ou Safetensors, lorsque leur architecture et leur disposition sont prises en charge par stable-diffusion.cpp. Un fichier de poids seul n’acquiert pas une autre architecture en changeant d’extension ; les composants doivent correspondre à la famille de pipeline.

### Correctif du NVFP4 ComfyUI

Le crash initial venait des échelles NVFP4 : poids FP4 E2M1 empaquetés deux par octet, échelles FP8 par blocs de 16 dans une disposition tuilée cuBLAS et échelle globale FP32. Le binaire C++ ne consommait pas directement cette disposition. Le normaliseur local [nvfp4_compat.py](../media-server/nvfp4_compat.py), sous **Python 3.15.1 / PyTorch**, décode cette disposition sur CPU, couche par couche, et écrit une copie **BF16 Safetensors** dans un cache détenu par Novera. Spécification : [format Comfy-Org officiel](https://github.com/Comfy-Org/comfy-quants/blob/main/docs/formats/nvfp4.md). Aucun import de ComfyUI, code de modèle distant, téléchargement de poids ni écrasement de source.

Le décodage a été comparé à la référence eager ComfyUI/comfy-kitchen en float32 puis BF16 sur une couche réelle `double_blocks.0.img_attn.proj` : tenseurs BF16 **identiques**, écart maximal nul. Les tests couvrent aussi les 16 valeurs FP4 et une disposition d’échelles non uniforme pour détecter une permutation erronée. Cette comparaison locale n’est pas une certification indépendante de toutes les quantifications.

L’identifiant du cache combine la version de conversion et le **SHA-256 intégral du fichier source**. Validation du fichier terminé avant réutilisation ; refus d’un cache incomplet, contrôle d’espace libre et de changement du fichier source pendant la préparation. Publication exclusive depuis un fichier temporaire. La copie préparée pour ce modèle occupe **7 751 105 584 octets, environ 7,22 Gio** ; prévoir plus de disque et de RAM que pour le seul fichier NVFP4. Le rendu C++ utilise ensuite une représentation Q8_0 **limitée à la diffusion** (`--tensor-type-rules ^model\.=q8_0`), sans forcer une nouvelle quantification de l’encodeur GGUF ni du VAE. Ce chemin ajoute une étape de compatibilité et ne promet ni identité pixel par pixel avec ComfyUI ni gain de performances NVFP4 natif.

### Flux dans Novera

Le natif détecte les métadonnées NVFP4 reconnues dans les composants image/encodeur Safetensors. Il lance d’abord le préparateur Python possédé, expose sa progression, vérifie les chemins retournés dans son cache, puis lance le processus CLI possédé. Stop empêche le passage à la phase suivante et nettoie le fichier temporaire du travail ; arrêt normal de l’application et surveillance parent du préparateur conservent la séparation des processus. Les composants ordinaires GGUF/Safetensors passent directement au moteur sans préparation Python. Le chemin Diffusers et la vidéo conservent leur fonctionnement.

Le JSON de génération conserve les chemins originaux et les chemins de compatibilité, ainsi que la représentation de calcul choisie. Le PNG n’est inséré dans la conversation qu’après son enregistrement complet et sa publication exclusive dans le dossier Images/Novera image. Les profils et modèles ComfyUI existants ne sont pas modifiés. Les six aides actualisées sont présentes dans les **70 locales**, toujours **1 653 clés** chacune ; revue linguistique native encore ouverte.

### Matériel : NVFP4 natif et compatibilité

Ce chemin **n’exige pas une RTX 50** : le décodage se fait sur CPU et le rendu peut utiliser le runtime CPU ou un GPU pris en charge par son backend. Le NVFP4 matériel natif dépend en revanche de GPU et noyaux compatibles, notamment Blackwell ; les GeForce RTX 50 sont Blackwell, mais un nom professionnel « RTX 5000 » ne suffit pas à identifier cette architecture. Sources : [table NVIDIA des architectures](https://developer.nvidia.com/cuda/gpus), [précondition du format Comfy-Org](https://github.com/Comfy-Org/comfy-quants/blob/main/docs/quantization/nvfp4.md).

La préparation a passé les tests dans l’environnement **PyTorch 2.14.1+cpu**, avec `torch.cuda.is_available() == False`, ainsi que dans l’environnement CUDA où les opérations du préparateur restent sur CPU. Cela valide l’absence de besoin CUDA pour le décodage testé, pas le fonctionnement de tout fichier NVFP4 sur tout processeur. La RAM, le disque, les instructions CPU et le backend disponible restent déterminants. Les autres modèles, GPU AMD/Intel/anciennes RTX et plateformes n’ont pas été exécutés dans ce lot.

### Générations réelles avec l’encodeur « uncensored »

Combinaison utilisée : diffusion d’origine `flux-2-4b-nvpfp4.safetensors` (copie de compatibilité), **encodeur `flux2-klein-4b-uncensored-q4_k_m.gguf`**, VAE `flux2-vae.safetensors`. L’encodeur conserve son rôle et sa quantification GGUF. Les deux sorties finales ont été décodées et leurs SHA-256 enregistrés :

| Runtime | Sortie | Paramètres | Temps de phase `generate_image` rapporté par le CLI |
| --- | --- | --- | --- |
| Vulkan0 — RTX 5070 Laptop | PNG 512 × 512, cabane au bord d’un lac | 4 étapes, Euler, CFG 1, graine 42 | 31,08 s |
| CPU — Core Ultra 7 255HX | PNG 64 × 64, essai technique | 1 étape, Euler, CFG 1, graine 42, 8 threads | 17,66 s |

Dimensions et étapes différentes : **ces durées ne comparent pas les performances CPU/GPU**. Elles excluent la préparation initiale et ne constituent pas une latence totale de la discussion. Les premiers essais Q8 global (48,06 s GPU / 21,96 s CPU) sont remplacés par la règle limitée à la diffusion, qui conserve mieux la configuration de l’encodeur et réduit la mémoire de paramètres annoncée de 8 209,83 Mo à **6 515,18 Mo**. Ce chiffre de stockage RAM avec offload ne mesure pas un pic global RAM/VRAM.

Preuves locales ignorées du dépôt : `.build/nvfp4-fix-2026-10-26/runtime-proof.json`, `mixed-rules-vulkan.log`, `mixed-rules-cpu.log`, deux PNG, copie mise en cache et paramètres d’essai. Le succès du runtime corrige l’échec initial, mais **le flux natif complet dans un nouvel exécutable Novera reste à tester après une compilation autorisée**. Aucun nouvel exécutable Novera, commit, push ou changement de métadonnées GitHub. Les runtimes officiels téléchargés lors du lot initial ne sont pas nouvellement compilés ni intégrés à l’installeur.

### Contrôles des sources

**581 tests web réussis dans 26 fichiers**, **15 tests Python réussis** dans l’environnement CPU et dans l’environnement CUDA (même suite, pas 30 tests uniques), TypeScript `--noEmit`, **70 × 1 653 clés**, frontières et 7 tests d’architecture validés. Les tests Python vérifient décodage/tuilage, source intacte, cache réutilisé, refus de cache incomplet ou d’espace insuffisant, publication temporaire et association image/encodeur. Les tests de transport couvrent les mélanges GGUF/Safetensors et la transition préparation/rendu avant émission du fichier. Le contrôle rustfmt parse les sources Rust ; **aucune compilation Rust/application de ce lot**, donc pas de validation de liaison native ni d’interface graphique dans un nouveau binaire. Logs dans `.build/nvfp4-fix-2026-10-26/`.

## NVFP4 CUDA natif, placement et durées — 26 octobre 2026

Un chemin **NVFP4 CUDA · PyTorch** est ajouté aux sources locales pour le modèle **FLUX.2 Klein 4B au format Comfy NVFP4**, avec encodeur **Qwen3-4B GGUF** et VAE **FLUX.2 Safetensors**. Il conserve les poids quantifiés E2M1 et les échelles par blocs ; les 100 couches linéaires quantifiées utilisent `torch.nn.functional.scaled_mm` avec la recette NVFP4. La quantification des activations utilise comfy-kitchen. Les autres opérations, le VAE et l’encodeur ne sont pas tous en FP4. Aucun cache BF16 du modèle de diffusion et aucun repli de ces GEMM vers un poids BF16 ; un matériel ou format incompatible échoue explicitement. Le mode de compatibilité C++ précédent reste distinct.

**Preuves réelles sur RTX 5070 Laptop, SM 12.0, Python 3.15.1 et PyTorch 2.14.1+cu130 :** une image significative 512 × 512, quatre étapes, a exécuté **400 GEMM NVFP4 natives**. Un profilage séparé identifie le noyau Tensor Core `cutlass3x_sm120_bstensorop_…e2m1…`. Une multiplication réelle et un test CUDA indépendant concordent avec la référence BF16 des mêmes valeurs quantifiées. Le fichier diffusion original conserve son SHA-256 `d8c5007b6a3bbbdfd38538bbcef5101a55dfde81894f58d2e3c8701cdef3542b`.

Les choix **Encodeur de texte : CPU / GPU** et **Génération : CPU / GPU** sont indépendants dans les moteurs à composants séparés. Chaque sélecteur offre Auto, CPU et CUDA. C++ transmet les affectations `te=…`, `diffusion=…` et `vae=…` séparément ; Auto conserve le choix disponible du runtime, dont Vulkan. Un vrai PNG 64²/une étape a réussi avec `te=cpu` et le runtime Vulkan. Dans le chemin natif, la génération exige Blackwell et CUDA. Qwen sur GPU transfère ses couches à la demande ; Auto conserve Qwen sur CPU si moins de **10 Gio de VRAM libre** sont signalés, repère prudent pour un encodeur 4B pouvant occuper environ 8 Go en BF16 plus ses activations. Ce seuil est une heuristique de placement, pas un optimiseur de vitesse certifié. Le choix manuel reste prioritaire. Le parcours Diffusers générique conserve un choix global pour son pipeline ; son encodeur n’est pas déplacé séparément par ces contrôles.

Des générations réelles ont réussi avec Qwen CPU et GPU, ainsi qu’Auto choisissant CPU. Pour le dernier essai explicite Qwen GPU : **66,40 s** de chargement/encodage, **1,50 s** de génération avec décodage VAE et **83,88 s** au total dans le worker. Le pic d’allocations PyTorch est **3 349 144 576 octets**, environ **3,12 Gio** ; ce n’est pas la mémoire totale du pilote ou des autres processus. Le test Auto/encodeur CPU a mesuré 48,42 s de chargement/encodage et 16,55 s de génération incluant une initialisation GPU à froid. Ces essais ne forment pas un benchmark contrôlé et ne prouvent aucun gain universel ou facteur d’accélération face au chemin C++.

Les créations image **et vidéo**, locales et cloud, transportent désormais une durée totale monotone dans `providerMetadata.novera.totalMs`. Le composant de média l’affiche sous l’image ou le lecteur, y compris après sérialisation/réouverture. Lorsque le worker fournit `generation_seconds`, le temps de génération apparaît séparément. La durée totale comprend chargement, encodage, attente cloud éventuelle, téléchargement et sauvegarde ; elle ne prétend pas mesurer uniquement le calcul du fournisseur. Les sidecars locaux/cloud enregistrent également leurs mesures de durée. Les anciennes créations sans mesure n’affichent pas de durée inventée. Deux nouvelles fixtures PNG/MP4 réelles ont confirmé l’enregistrement des temps ; la vidéo utilise une petite fixture technique, pas un modèle entraîné de production.

### Conseil de téléchargement et Hub

Le conseil FLUX.2 Klein utilise les références publiques corrigées du mainteneur :

| Composant | Variante et placement conseillé | Référence |
| --- | --- | --- |
| Image | FLUX.2 Klein 4B Q4_K_M, GPU | [Unsloth GGUF](https://huggingface.co/unsloth/FLUX.2-klein-4B-GGUF/resolve/main/flux-2-klein-4b-Q4_K_M.gguf?download=true) |
| Texte | **Qwen3-4B**, Q4_K_M, CPU | [Qwen officiel](https://huggingface.co/Qwen/Qwen3-4B-GGUF/resolve/main/Qwen3-4B-Q4_K_M.gguf?download=true) |
| VAE | FLUX.2 Safetensors officiel | [Black Forest Labs](https://huggingface.co/black-forest-labs/FLUX.2-klein-4B/resolve/main/vae/diffusion_pytorch_model.safetensors?download=true) |

Les pages/fichiers ont été vérifiés publiquement le 26 octobre, sans télécharger ces trois poids. Leur combinaison exacte reste à tester : les preuves natives utilisent le modèle NVFP4 et l’encodeur « uncensored » déjà présents sur le PC. Le bouton de conseil règle Qwen sur CPU, la génération sur Auto, quatre étapes et CFG 1 ; il conserve les chemins locaux et ne télécharge rien. Le montage GGUF utilise C++, pas le chargeur NVFP4 natif.

Le Hub suggère NVFP4 lorsque les métadonnées indiquent cette quantification, la famille FLUX.2 Klein 4B est reconnue, **un même GPU NVIDIA** signale une capacité SM ≥ 10 et au moins **4,5 Gio** disponibles/déclarés. Il n’additionne pas les GPU et ne déduit pas la capacité du seul nom RTX. Les autres cas sont « à vérifier » ou déconseillés. CUDA seul, un tag NVFP4 ou une taille réduite ne suffisent pas ; l’aide demande encore de vérifier le moteur, PyTorch CUDA, les dépendances, l’organisation Comfy des poids et les compagnons. Ce conseil matériel ne déclare pas le runtime prêt, ne remplace pas le diagnostic mémoire complet et n’active pas l’import automatique d’un modèle média incomplet.

Repère **GGUF Novera**, commun aux composants texte/image/vidéo : **Q6_K minimum conseillé pour privilégier la fidélité, Q4_K_M pour l’équilibre qualité/mémoire**. Ce n’est ni un seuil universel de précision ni une conversion imposée. La qualité dépend du modèle, de la tâche et de la calibration ; seules les variantes réellement proposées et acceptées par leur moteur sont pertinentes. NVFP4, les projecteurs multimodaux et les VAE conservent leur propre évaluation. [Référence sur la quantification](https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md).

### Dépendances, vérifications et limites

Versions optionnelles testées dans l’environnement CUDA isolé : **accelerate 1.15.0**, **gguf 0.19.0**, **comfy-kitchen 0.2.35**. `transformers-server/setup.ps1 -Backend cu130 -NativeNvfp4` prépare cette option avec le parcours média. Les configurations BFL sont embarquées hors réseau avec leur licence ; aucun poids n’est embarqué. Le SDK CUDA 13.4.3 du PC reste intact ; PyTorch utilise son runtime CUDA 13.0. Voir [installation](../media-server/README.md) et [provenance des configurations](../media-server/native-flux2-klein-4b/README.md).

**106 tests web dans 10 fichiers**, **21 tests Python réussis sous CUDA**, et la même suite sous PyTorch CPU avec **20 réussis / un test matériel ignoré**. Sept tests d’architecture, frontières, TypeScript `--noEmit`, syntaxe/format Rust et **70 locales × 1 668 clés** vérifiés. Tests cloud simulés, sans dépense ni accès de compte validé. Journaux, images et preuves restent dans `.build/native-nvfp4-2026-10-26/`.

**Aucune compilation de Novera/Rust, aucun commit/push ni mise à jour GitHub.** Le nouveau flux graphique/natif attend la compilation et le test du mainteneur. Le 9B, d’autres architectures NVFP4, l’édition d’image native, la vidéo NVFP4, les autres GPU et les autres systèmes n’ont pas été validés par ce lot.

## Synchronisation des sources et de la vitrine — 26 octobre 2026

Le mainteneur autorise ensuite la publication des sources média et de la vitrine GitHub, en conservant la séparation avec le binaire qu’il compile et teste lui-même. Contrôles de cette publication : **369 tests web dans 22 fichiers**, TypeScript sans émission, 70 × 1 668 clés, frontières et sept tests d’architecture. Les preuves Python et runtime ci-dessus restent celles exécutées pour les moteurs ; elles ne sont pas présentées comme une nouvelle compilation applicative. Les 41 profils cloud incluent 19 profils de génération, 25 préréglages image et 20 vidéo ; contrats cloud simulés. Aucun build ni binaire n’est déclenché par cette synchronisation, et GitHub Actions reste désactivé. L’ambition d’aide dans tous les secteurs est une orientation publique distincte des capacités validées. Les preuves de synchronisation en ligne restent locales sous `.build/publish-capabilities-2026-10-26/`.

## Diagnostic graphique et trio GGUF réel — 26 octobre 2026

À la demande du mainteneur, contrôle direct de Novera compilé par lui (`Novera-desktop-1.0.0-2026-10-26_09-28-15-858`). L’échec affichait une aide générique ; le journal de l’application indiquait `Unsupported local file format`. Deux réglages incompatibles étaient présents : **NVFP4 CUDA** avec le modèle de diffusion **GGUF Q4_K_M**, et le champ **exécutable sd-cli** contenant un GGUF d’encodeur plutôt qu’un exécutable. La validation refusait donc la demande avant démarrage du moteur.

Correction uniquement des réglages par l’interface : moteur **stable-diffusion.cpp · GGUF / Safetensors**, exécutable Vulkan existant `sd-cli.exe` et ses DLL, diffusion sur Auto et encodeur sur CPU. Conservation des trois fichiers téléchargés par le mainteneur : **flux-2-klein-4b-Q4_K_M.gguf** (Unsloth), **Qwen3-4B-Q4_K_M.gguf** (Qwen) et **diffusion_pytorch_model.safetensors** (VAE BFL). 512 × 512, quatre étapes, CFG 1, graine 42.

**Génération réussie depuis le bouton de relance de Novera**, image de voiture affichée dans la conversation, **durée totale 25,5 s** sous l’aperçu et sauvegarde effective dans le dossier système **Images/Novera image**. Le journal CLI signale 22,99 s pour sa phase `generate_image`, mesure distincte du total de la discussion. Le PNG et son sidecar sont lisibles ; les trois téléchargements conseillés sont donc maintenant testés ensemble sur ce PC Windows avec le runtime Vulkan. Cette validation concerne **GGUF/C++**, pas le parcours graphique NVFP4, la vidéo ou les fournisseurs cloud.

La preuve précédente du trio « encore à tester » dans les sections antérieures est historique et remplacée, pour cette combinaison et ce PC, par cet essai graphique. Les validations sur d’autres matériels restent ouvertes. Les réglages corrigés sont conservés ; aucun poids réécrit, aucun profil importé ou effacé, aucune compilation supplémentaire ni publication du dépôt déclenchée par ce diagnostic. Preuve locale : `.build/image-ui-diagnosis-2026-10-26/proof.json` ; les journaux de travail restent dans les données personnelles de l’application.

Amélioration ergonomique encore souhaitable : filtrer les sélecteurs de fichiers selon leur rôle et afficher la cause de validation précise, pour éviter qu’un modèle GGUF soit sélectionné comme exécutable ou qu’un moteur incompatible soit choisi. Ce diagnostic ne prétend pas que cette amélioration des sources est déjà livrée.
