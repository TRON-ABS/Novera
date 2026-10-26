# Suivi des moteurs locaux Novera

État local au **26 octobre 2026**. Ce suivi distingue capacités des sources, tests exécutés et binaires disponibles. Le mainteneur a autorisé la mise à jour du dépôt de sources le **26 octobre 2026**, après les validations locales. Environnements, modèles, exécutables et journaux restent locaux ; aucune publication binaire ni compilation supplémentaire n’est demandée.

| Moteur | Formats et matériel | Version / état |
| --- | --- | --- |
| llama.cpp | GGUF ; CPU et accélérateurs selon la construction | Moteur 0.7.0, llama.cpp b11823 ; [état existant](DEVELOPMENT.md#engine). Non mis à jour par ce travail. |
| MLX | Dossiers MLX sur Mac Apple Silicon | Intégration existante ; aucune nouvelle validation Mac ici. |
| Transformers / Safetensors | Dossiers Hugging Face textuels, poids simples ou découpés ; CPU et NVIDIA CUDA | Nouveau moteur desktop Windows/Linux dans les sources locales. |

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
