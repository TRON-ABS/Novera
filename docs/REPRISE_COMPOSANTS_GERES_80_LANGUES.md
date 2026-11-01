# Composants gérés par Novera — état, profils et reprise

## Paquets Windows propres et vitrine publiée — 1er novembre 2026

Le mainteneur autorise désormais la préparation **desktop, portable et installateur Windows** depuis son desktop testé, sans discussions ni données personnelles incluses. Les sources et la nouvelle capture sont publiées sur **main** ; les vitrines anglais/français portent le message souhaitant une belle aventure et la signature TRON-ABS. Les notes plus anciennes ci-dessous décrivent leur état au moment de rédaction.

Voir le [résultat de préparation, les empreintes et les limites avant release publique](DISTRIBUTION_WINDOWS_2026-11-01.md). Les paquets restent des candidats locaux non signés ; aucun binaire de release publique ni tag n’est publié, et Actions reste désactivé. Les données présentes sur le PC sont conservées.

## Retour du mainteneur et publication sur main — 1er novembre 2026

Le mainteneur confirme **« tout marche bien »** et fournit une nouvelle capture réelle du desktop montrant une image créée et les commandes du tableau de bord. Il demande explicitement la publication des sources sur **main**, la mise à jour de la vitrine et la signature **TRON-ABS — The art of Human with AI** en bas des README anglais/français.

Ce retour est une validation manuelle déclarée du desktop utilisé, sans relevé détaillé par moteur, profil ou scénario. Il ne remplace pas les essais propres aux profils CUDA/ExLlama/GenAI, aux installations sur PC neuf, au mobile ou à chaque autre système. Aucun nouveau binaire, portable, tag ou release n’est publié par cette mise à jour ; Actions n’est pas activé. L’embarquement Python/PyTorch dans l’EXE reste reporté.

La capture originale est conservée sans retouche sous `.github/assets/novera-dashboard-2026-11-01.png`. Les attributions et licences existantes restent présentes. Les éléments publiés, vérifications et identifiant du commit sont consignés dans les résultats de publication de ce lot.

## État livré dans les sources — 1er novembre 2026

Le plan initial conservé plus bas est désormais mis en œuvre pour **Windows x64**. Le gestionnaire est `src-tauri/src/core/components.rs`, le panneau `web-app/src/containers/ManagedComponents.tsx`. Les commandes n'acceptent que des identifiants de profils et des opérations fermées ; le frontend ne transmet ni script, ni URL d'installation, ni commande shell.

### Parcours et stockage

1. Ouvrir **Novera · Configurations → Composants locaux**. Les profils conseillés suivent le GPU détecté et conservent le choix explicite existant ; les variantes restent disponibles sous Paramètres avancés.
2. Lire le budget de téléchargement et d'espace disque avant de confirmer **Installer cette configuration**. Ce sont des estimations conservatrices, pas la taille d'un modèle ; les poids restent un téléchargement distinct. Rien ne s'installe à l'ouverture du panneau.
3. Python est obtenu avec le `uv` distribué par Novera et conservé sous le dossier local de l'application, dans `components-v1/python`. Chaque profil a ses propres générations d'environnement. Aucun prérequis Python/Node/Git/compilateur n'est imposé au novice.
4. Seuls des wheels sont acceptés, avec versions et hashes des verrous embarqués dans le binaire. Absence de wheel ou échec de sonde : erreur visible, sans compiler de dépendance sur le PC utilisateur. Les extensions ExLlama précompilées sont importées avant la bibliothèque pour empêcher son repli JIT dans le mode géré.
5. Le reçu est publié après `uv pip check`, sonde d'import/opération, inventaire et contrôles. Une génération reste à son emplacement initial : les venvs ne sont pas déplacés. Le reçu identifie profil, plateforme/architecture, versions Python/Novera, empreintes, paquets, taille et date. Un échec ne remplace pas le reçu actif.
6. **Vérifier**, **Réparer**, **Utiliser**, **Mettre à jour** quand un verrou diffère, **Restaurer l'environnement précédent** quand disponible, et **Désinstaller** concernent uniquement le profil sélectionné. Une réparation ne sélectionne pas un autre profil à votre place. La restauration vise une génération du même verrou courant ; le retour arbitraire à une ancienne version de catalogue n'est pas proposé.

Le verrou natif protège les utilisations actives ; le verrou de fichier protège des installations concurrentes. Une opération continue au changement d'écran ; son journal permet de signaler une interruption après redémarrage, puis de recommencer avec les caches `uv`. Le journal technique local est limité à **64 Kio**, n'est pas envoyé au collecteur, et n'inclut aucune donnée de conversation. L'annulation n'est pas signalée comme une erreur de maintenance. Les diagnostics consentis n'envoient que des codes fixes `COMPONENT_*` autorisés.

Les anciens chemins personnalisés sont conservés comme overrides avancés. Les valeurs par défaut vides, `auto`, `python` et `python.exe` demandent le profil géré ; pour continuer à utiliser un Python externe, choisir son exécutable explicitement dans les options avancées. Les sondes ne gardent plus de cache pouvant annoncer l'ancien environnement après une réparation ou sélection.

La désinstallation garde les modèles, créations, conversations, interpréteurs externes et les éléments partagés (Python privé/cache de téléchargement). Elle supprime les générations et reçus du profil seulement. Une copie du portable utilise toujours les données locales Novera ; elle ne transporte pas ces venvs entre machines. Réinstaller un profil déplacé ou invalide plutôt que recopier ses chemins absolus.

### Matrice du catalogue initial

Tous les profils ci-dessous ciblent **Windows x64 / CPython 3.12.12**. Les entrées `.in`, les verrous complets `.txt` et leurs SHA-256 sont sous `src-tauri/components/`. Sources : PyPI, index officiels PyTorch et wheels ExLlama des dépôts officiels. Les licences distribuées dans les wheels sont conservées.

| Identifiant | Pile principale / fonction | Validation de ce lot |
| --- | --- | --- |
| `transformers-cpu` | torch 2.14.1 CPU, Transformers 5.20.2, Safetensors, PEFT/Accelerate | Installation privée et génération réelle sur Llama synthétique CPU réussies |
| `transformers-cuda` | torch 2.14.1 CUDA 13.0, Transformers, bitsandbytes, noyaux FP8/NVFP4 | Verrou résolu ; installation, kernels et génération CUDA à valider |
| `diffusers-cpu` | torch CPU, Diffusers 0.42.0, Transformers, GGUF, image/vidéo | Verrou résolu ; génération réelle de ce profil géré à valider |
| `diffusers-cuda` | Pile Diffusers CUDA 13.0, dépendances NVFP4 | Verrou résolu ; sonde native NVFP4 et génération à valider |
| `onnx-cpu` | numpy 2.5.4, onnx 1.23.2, onnxruntime 1.31.1 | Installation privée et inférence numérique Identity réelles réussies |
| `onnx-genai` | Pile ONNX CPU + onnxruntime-genai 0.18.0 | Verrou résolu ; génération avec export GenAI utile à valider |
| `video-export` | imageio 2.37.0, imageio-ffmpeg 0.6.0 et dépendances ; aucun torch | Cycle privé complet et vérification FFmpeg réussis |
| `upscale-cpu` | torch CPU, numpy, Pillow 12.0.0 ; sans Diffusers | Verrou résolu ; rendu Real-ESRGAN dans ce profil à valider |
| `upscale-cuda` | torch CUDA 13.0, numpy, Pillow | Verrou résolu ; rendu CUDA dans ce profil à valider |
| `exllama` | torch 2.9.0 CUDA 12.8, Transformers 4.57.1, ExLlamaV2/V3 et Triton Windows | Wheels CPython 3.12 spécifiques, verrou résolu ; sonde/génération de ce profil géré à valider |

L'installation et la sonde de l'environnement ne prouvent ni la compatibilité de tous les modèles ni une génération validée. Les sondes spécifiques des moteurs et les contrôles RAM/VRAM restent appliqués avant usage. GPTQ/AWQ sans wheel validé ne sont pas annoncés installables par ce catalogue. Les moteurs natifs GGUF et ACE-Step gardent leur installation existante et ne reçoivent pas Python par défaut.

Les profils non-Windows sont indisponibles dans cet installateur. Android/iOS n'appellent pas ces commandes desktop, ne téléchargent pas Python/PyTorch, et conservent leurs moteurs mobiles réellement disponibles ainsi que le cloud. L'embarquement de la pile locale Python 3.15.1 / torch 2.15.0 CUDA 13.4 / Transformers 5.21.0 dans l'EXE a été reporté par le mainteneur ; son installation existante n'a pas été modifiée.

### Validation et limites

- `cargo test --manifest-path src-tauri/Cargo.toml --locked --offline --lib -- --test-threads=1` : **1 161 réussis, 5 ignorés**. Les serveurs HTTP des tests exigent un accès loopback ; une première exécution dans le bac à sable a été interrompue après refus réseau, puis la suite complète a passé avec cet accès.
- Tests `core::components::tests` : garde d'utilisation, reçus endommagés, refus du Python système, profils inconnus/chemins, verrou interprocessus, disque insuffisant et échec sans publication de reçu. Les trois intégrations réseau sont ignorées par défaut. Un dernier cycle vidéo a aussi passé avec `PYTHONPATH` et `IMAGEIO_FFMPEG_EXE` volontairement invalides : les profils privés ignorent ces chemins hérités.
- Avec `NOVERA_COMPONENT_TEST_UV` pointant vers le `uv.exe` embarqué : `app_lib-<hash>.exe core::components::tests::real_private_ --ignored --test-threads=1` : **3 réussis**. Aucun poids préentraîné téléchargé. Vidéo : installation, vérification, réparation, retour précédent, annulation, échec conservant l'actif et désinstallation ; ONNX : vrai graphe numérique ; Transformers : génération sur petit Llama créé localement, journal plafonné à 64 Kio.
- Web ciblé : **174 réussis / 1 scénario non-Windows ignoré**, 12 fichiers avec `TAURI_ENV_PLATFORM=windows` ; l’exécution sans ce drapeau a donné 172 réussis / 3 ignorés. TypeScript réussi ; lint ciblé sans erreur, deux avertissements de hooks existants dans CreationControls. Architecture : 6 domaines sans violation / 7 tests ; distributions : 11 variantes / 9 tests. Voir aussi `docs/SUIVI_VALIDATION_DISTRIBUTIONS.md`.
- Python : `test_worker.py` **8 réussis**, `test_nvfp4_compat.py` **7 réussis**, `test_managed.py` **2 réussis** (absence de repli JIT dans le mode géré, contrat externe conservé). Une tentative de la suite média complète dans le Python global rencontre trois dépendances absentes (`comfy_kitchen`, `diffusers`, `imageio_ffmpeg`) ; ce Python n'a pas été modifié pour les installer. Ce résultat ne valide pas les profils média/CUDA gérés.
- Interface réelle du composant, données simulées pour le rendu : français, allemand long et arabe RTL ; vue 360 px, largeur de contenu égale à 360 px sans défilement horizontal, dialogue de confirmation et focus. Captures locales sous `.build/components/ui-*-360.png` ; ce n'est pas un essai du nouveau binaire.
- **80 catalogues × 2 429 clés**, variables conservées, sans erreur structurelle. Traductions assistées, corrections françaises et variantes régionales rédigées ; aucune relecture native complète des 80 langues revendiquée.

La compilation desktop, l'essai novice sur un Windows neuf, les profils GPU/ExLlama/GenAI et médias complets, les autres OS et la validation du portable futur restent distincts des tests de sources. Aucun push, publication, réglage Actions, signature ou binaire public créé. Ne pas remplacer le portable existant avec un ancien exécutable pour annoncer cette fonction.

## Archive du plan initial

Les cases ci-dessous conservent l’intention et l’état avant ce chantier ; l’état actuel et les validations restantes sont décrits plus haut.

Préparé le **1er novembre 2026**, à la demande du mainteneur, pour une nouvelle discussion. **Document de travail uniquement : aucune installation automatique ni modification des moteurs réalisée pour ce lot.**

## Demande et résultat attendu

Permettre à un utilisateur novice de préparer les fonctions locales depuis **Novera · Configurations**, sans installer Python/PyTorch à la main ni saisir des chemins d'exécutables. Novera détecte le matériel, propose les composants compatibles, annonce le téléchargement et l'espace requis, installe après confirmation, vérifie puis configure automatiquement les moteurs.

Traiter les **80 langues dans ce même chantier**, y compris les textes existants devenus faux. Ne pas livrer une interface française seule en laissant une seconde traduction à faire. Réutiliser les libellés existants quand leur sens convient ; traduire les nouveaux messages réellement nécessaires dans les 80 catalogues avant livraison. Ne pas promettre zéro nouvelle traduction si les nouveaux états n'existent pas encore.

« Retirer les chemins » concerne le parcours normal des **composants techniques** : Python, moteurs, encodeurs et outils auxiliaires. Conserver l'import de modèles/fichiers utilisateur par sélecteur et les choix de dossiers utiles. Un chemin interne reste nécessaire au système ; il ne doit plus être saisi par le novice.

## Contexte à conserver

- Dépôt : `C:/msys64/home/jmsga/Novera`, origine `https://github.com/TRON-ABS/Novera`.
- Le mainteneur compile lui-même le desktop. Ne pas lancer de compilation applicative complète, publier ni pousser sans nouvelle instruction.
- Après succès de compilation et essais desktop confirmés par le mainteneur, préparer le portable à partir du **même runtime exact**, puis attendre ses essais. Pas de portable provenant d'un ancien binaire.
- Les anciens desktop et portable 1.0.0 ont été déclarés fonctionnels ; ils précèdent les dernières modifications. Voir `docs/SUIVI_VALIDATION_DISTRIBUTIONS.md`.
- Dernière tentative desktop : `.build/launcher-desktop-2026-11-01_02-07-58-188`, arrêt à `engine-toolchain` faute de Clang sur PATH. Détection corrigée ; 24 assertions et contrôle réel des prérequis réussis. Cela ne prouve pas la réussite de la recompilation suivante.
- L'en-tête du panneau latéral affiche maintenant `Novera {VERSION}`, lié à `web-app/package.json` (1.0.0). Sept tests de navigation/panneau et TypeScript réussis.
- Profils légers et mobile déjà ajoutés dans les sources : recommandation LFM3 texte ou Omni selon conditions. Image, musique et vidéo **cloud restent disponibles**, indépendamment des restrictions locales.
- Régression corrigée après retour musique : un PC nominal 16 Gio rapporte 15 789 Mio utilisables et était refusé par le seuil strict de 16 384 Mio. Les paliers RAM totale tolèrent désormais 5 % de réserve matérielle ; la RAM libre et les contrôles natifs restent réels. Conserver ces régressions et distinguer conseil matériel d'une preuve d'OOM dans les futurs diagnostics. 106 tests / 6 fichiers réussis ; inférence réelle à refaire sur le nouveau binaire.
- Après recompilation/essai, le mainteneur a signalé les boutons Musique/Vidéo absents avant un prompt Auto. Filtre de visibilité corrigé : garder les boutons média accessibles avant installation ou choix cloud ; limiter le moteur local dans les réglages et à l'exécution. Ne pas réintroduire ce masquage dans le futur parcours novice. Correctif validé par 103 tests / 6 fichiers et TypeScript ; prochain binaire encore à produire.
- Diagnostics PostHog avec consentement v2 et données filtrées ; alerte e-mail horaire de production active, réception du test confirmée par le mainteneur. Symboles privés de la prochaine release encore à envoyer et vérifier. Voir `docs/MAINTENANCE.md`.
- Arbre de travail déjà très modifié : préserver les changements sans rapport. Lire les instructions du dépôt et vérifier l'état réel avant intervention ; ce document n'est pas une validation des versions futures des dépendances.
- Observation du mainteneur : avant la dernière modification, la compilation utilisait un CPU ; il constate maintenant huit CPU. Le lanceur définit `CARGO_BUILD_JOBS=8`, soit jusqu'à huit travaux Cargo concurrents, et non une garantie de huit cœurs pour chaque étape native. Ne pas modifier la compilation en cours. Pour le futur installateur, adapter séparément la concurrence au matériel et à la mémoire ; ne pas imposer huit travaux aux petites configurations.

## État avant ce chantier (historique)

| Parcours | Situation actuelle | Travail attendu |
| --- | --- | --- |
| Transformers / Safetensors | Champ `python_path`, défaut `python`, chemins transmis aux commandes natives | Résolution par profil géré ; override avancé facultatif |
| ONNX Runtime / GenAI | Champ `python_path`, installation séparée documentée | Profil géré ONNX avec sonde et import fonctionnels |
| Diffusers image/vidéo | Réglage Python dans la création | Profil compatible configuré automatiquement |
| NVFP4 image / FP8-NVFP4 LLM | Extensions CUDA et contraintes matérielles particulières | Profils séparés, disponibilité prouvée par la sonde réelle |
| Vidéo C++ / export MP4 | Python + imageio-ffmpeg encore nécessaires pour certains exports | Encodeur géré et résolu automatiquement |
| Upscale | Python/PyTorch et modèles compatibles | Composants gérés ; conserver le choix des poids |
| Musique ACE-Step | Exécutables natifs `ace-*` et composants modèle | Auditer l'installation existante ; aucun Python ajouté si inutile |
| Texte GGUF / image C++ | Moteurs natifs, dont ressources Windows déjà embarquées | Réutiliser ces moteurs ; ne pas imposer PyTorch au parcours GGUF |
| Cloud | Fonctions indépendantes des composants locaux | Aucun téléchargement local imposé avant un appel cloud |

Inventaire des fichiers requirements Transformers/média/ONNX : **21 noms de bibliothèques directes uniques**, options comprises, hors dépendances indirectes : accelerate, bitsandbytes, comfy-kitchen, diffusers, exllamav2, exllamav3, gguf, gptqmodel, imageio, imageio-ffmpeg, numpy, onnx, onnxruntime, onnxruntime-genai, optimum, peft, pillow, safetensors, torch, transformers, triton-windows. Ce n'est ni le nombre de paquets installés sur une machine ni une obligation de tous les installer.

Les scripts actuels séparent déjà une pile Python 3.15.1 / torch 2.14.1 et une pile ExLlama Windows x64 Python 3.12 / torch 2.9.0 CUDA 12.8. **Réexaminer la disponibilité effective des distributions avant de les figer dans un installateur produit.** Ne pas fusionner ces environnements ni déduire la compatibilité d'une extension du seul GPU détecté.

## 1. Audit et matrice des profils

- [ ] Recenser tous les champs de chemins techniques dans Configurations, fournisseurs, image, musique, vidéo, upscale, import et diagnostic Hub.
- [ ] Recenser chaque lancement natif/Python, y compris chargement, import/inspection d'adaptateurs, sondes, export et réparation.
- [ ] Produire une matrice versionnée OS / architecture / Python ABI / torch / backend CPU-CUDA / extensions / sonde / taille / licence / support prouvé.
- [ ] Prévoir profils minimaux : Transformers CPU ; Transformers CUDA ; Diffusers CPU/CUDA ; ONNX CPU ; ONNX GenAI ; export vidéo ; upscale. Ajouter options PEFT, quantification, GPTQ/AWQ, FP8/NVFP4, ExLlama uniquement sur combinaisons réellement compatibles.
- [ ] Choisir le partage des environnements à partir de contraintes compatibles ; les séparer dès qu'une extension exige une autre ABI ou pile CUDA.
- [ ] Auditer uv déjà embarqué et ses capacités disponibles ; décider comment gérer Python sans dépendre de celui du système. Vérifier les ressources de tous les paquets distribués.
- [ ] Distinguer « composant installé », « modèle installé », « matériel compatible » et « génération vérifiée ».

## 2. Gestionnaire natif de composants

- [ ] Créer un catalogue de profils déclaratifs, versions/révisions épinglées, sources officielles et intégrité vérifiable. Aucun installateur ou commande arbitraire reçu du frontend/modèle.
- [ ] Stocker les environnements dans un dossier de données Novera par utilisateur, hors du répertoire installé en lecture seule. Ne pas modifier Python global, PATH système ou pilotes.
- [ ] Identifier les installations par profil, plateforme et version ; résoudre tous les chemins depuis ce registre, jamais depuis un chemin propre à cette machine.
- [ ] Préparer les composants dans un dossier temporaire, contrôler espace disponible pour téléchargement + extraction + installation, vérifier puis publier atomiquement l'environnement utilisable.
- [ ] Prévoir verrouillage, progression par étapes, annulation et récupération après interruption ; ne jamais déclarer un environnement partiel prêt.
- [ ] Réutiliser une installation validée et les caches compatibles. Traiter réseau indisponible, proxy, permissions, antivirus, disque plein, espaces, accents et chemins longs.
- [ ] Épingler aussi les dépendances indirectes par plateforme lorsque possible ; gérer les changements de contraintes sans mise à niveau implicite du reste de la pile.
- [ ] Privilégier des distributions binaires validées pour les novices. Une absence de wheel compatible doit produire « indisponible » avec une solution explicite, sans lancer silencieusement une compilation CUDA.
- [ ] Distinguer le parallélisme du build mainteneur de celui des installations utilisateur. Borner les téléchargements, décompressions et éventuelles tâches natives selon CPU/RAM ; prévoir un réglage avancé sans appliquer aveuglément `CARGO_BUILD_JOBS=8` aux machines modestes.
- [ ] Conserver un reçu d'installation : profil/version, composants, empreintes, taille, sonde, date et état. Journaux locaux bornés, sans secrets.
- [ ] Réparer seulement le profil concerné. Mettre à jour à côté de la version active, basculer après validation et conserver une possibilité de retour.
- [ ] Désinstaller uniquement les fichiers gérés et non partagés, après arrêt des processus concernés ; conserver modèles, créations, conversations et environnements externes.
- [ ] Au changement de version Novera, revalider les reçus ; ne pas retélécharger tous les composants à chaque lancement.

## 3. Résolution automatique et migration

- [ ] Ajouter une résolution centrale par identifiant de profil et fonction requise, employée par **tous** les appels natifs.
- [ ] Retirer les champs Python/exécutables du parcours novice ; ne pas simplement les cacher en conservant `python` comme dépendance système implicite.
- [ ] Migrer les préférences existantes sans écraser les installations fonctionnelles : vérifier les chemins personnalisés et les conserver comme mode avancé/externe.
- [ ] Définir une priorité explicite entre profil géré et override externe ; afficher le mode effectif et pouvoir revenir au mode géré.
- [ ] Invalider les caches de sondes lors d'une installation, réparation, migration ou sélection de profil.
- [ ] Bloquer un changement destructif pendant une génération et arrêter uniquement les processus possédés par Novera.
- [ ] Garantir qu'aucun import ou chargement ne retombe sur un Python système différent du profil annoncé.

## 4. Interface dans Novera · Configurations

- [ ] Présenter des fonctions compréhensibles (texte, image, musique, vidéo, amélioration), avec détails techniques repliés.
- [ ] Afficher matériel détecté, profil proposé, compatibilité, taille à télécharger et espace maximal estimé avant confirmation.
- [ ] Proposer Installer, Vérifier, Réparer, Mettre à jour et Désinstaller, avec états indisponible / absent / en cours / prêt / erreur / mise à jour disponible.
- [ ] Montrer une progression honnête par étape et l'annulation ; conserver l'état au changement d'écran et après redémarrage.
- [ ] En cas d'échec, proposer une action de reprise compréhensible ; les codes techniques restent dans les détails.
- [ ] Reprendre les résultats de compatibilité dans le Hub et avant génération : ne pas proposer un modèle comme utilisable avec un composant absent.
- [ ] Installer les composants nécessaires au choix confirmé, sans téléchargement automatique de tous les modèles ou des 21 paquets.
- [ ] Garder les fonctions cloud image/musique/vidéo accessibles sans installation de moteur local ni sélection automatique de fournisseur payant.
- [ ] Vérifier fenêtre étroite, zoom, navigation clavier, lecteurs d'écran et langues RTL.

## 5. Les 80 langues dans la même livraison

- [ ] Utiliser `docs/language-support.json` comme inventaire réel des 80 locales ; vérifier l'état initial avec `scripts/check-novera-locales.py`.
- [ ] Cartographier les libellés déjà disponibles : installation, téléchargement, vérification, reprise, annulation, suppression, taille, matériel, détails et erreurs.
- [ ] Définir d'abord le parcours et les messages nécessaires ; réutiliser les clés dont le sens convient, sans assemblages de fragments impossibles à traduire.
- [ ] Mettre à jour les anciens textes « choisissez Python », « installez PyTorch » ou chemins d'exécutables qui deviennent faux dans le mode géré.
- [ ] Auditer notamment `chat.json` (setupVideoNote, localNote, ggufNote, nativeNote, upscaleNote, upscaleMissing) et `hub.json` (runtime, pythonNote, tipRuntime) ; relever leurs clés complètes avant édition.
- [ ] Remplacer les descriptions/erreurs visibles codées en anglais dans les adaptateurs de moteurs et les retours natifs par des codes stables associés à des messages localisés. Conserver le détail technique local sans le confondre avec une traduction.
- [ ] Introduire seulement les clés manquantes et les renseigner dans **les 80 langues**, avec variables de taille/profil/version, pluriels et ordre des mots adaptés.
- [ ] Vérifier clés manquantes/supplémentaires, types, variables, HTML éventuel, Unicode, RTL et textes trop longs. Ne pas présenter 2 412 clés comme un total immuable après ajout.
- [ ] Compléter les contrôles automatiques par une revue des textes modifiés et un contrôle visuel de langues longues/RTL ; ne pas déclarer une relecture native des 80 langues sans preuve.
- [ ] Mettre à jour les guides français/anglais et le nombre de clés publié si nécessaire. Aucun lot de traduction laissé en attente avant la livraison de ce chantier.

## 6. Desktop, portable et autres plateformes

- [ ] Windows desktop en premier : profil neuf sans Python, Node, Git, LLVM ou outils de développement installés. Les outils de compilation du mainteneur ne deviennent pas des prérequis d'utilisation.
- [ ] Portable : documenter son comportement réel. Le paquet actuel est sans installation mais garde les données dans le profil utilisateur ; ne pas promettre un mode totalement autonome sur clé USB.
- [ ] Tester le lancement depuis un dossier déplacé/avec accents et sur un autre PC : résolution via données Novera, pas d'ancien chemin de poste. Ne pas supposer un venv relogeable entre PC/OS.
- [ ] Linux/macOS : profils distincts et validés sur ces systèmes ; conserver MLX sur matériel compatible, sans imposer une pile Windows/CUDA.
- [ ] Android/iOS : ne pas appliquer l'installateur desktop pip/uv tel quel. Garder profils légers, moteurs mobiles intégrés effectivement disponibles et cloud ; afficher l'indisponibilité locale réelle.
- [ ] Ne pas annoncer toutes les plateformes prêtes à partir de tests Windows. Garder une matrice de validation avec « non testé » explicite.

## 7. Vérifications et maintenance

- [ ] Tests unitaires : choix des profils, compatibilité, résolution, migration, cache, interpréteur attendu et erreurs.
- [ ] Tests d'installation isolés : intégrité, annulation, panne réseau, stockage insuffisant, interruptions, verrou concurrent, réparation, retour arrière et désinstallation limitée.
- [ ] Tests des commandes natives : arguments séparés, chemins avec espaces/accents, aucune interpolation shell de données utilisateur, conservation des poids.
- [ ] Tests d'intégration avec petits modèles/fixtures : texte Transformers, graphe ONNX, GenAI, image, export MP4, upscale et musique selon profils ; charge réelle de GPU seulement sur matériel disponible.
- [ ] Essai novice bout en bout : machine sans Python → Configurations → installation confirmée → vérification → génération → redémarrage → réutilisation sans nouvelle saisie de chemin.
- [ ] Vérifier les parcours cloud sans aucun composant local installé et les anciennes configurations migrées.
- [ ] Ajouter aux diagnostics consentis des codes fixes pour installation/vérification/réparation ; ne pas envoyer de chemins, sorties pip brutes, tokens ou données utilisateur.
- [ ] Exécuter tests affectés, TypeScript, contrôles architecture et locales ; consigner commandes, résultats et limites.
- [ ] Mettre à jour `NOVERA.md`, `PR.md` (anglais), guides, suivi moteurs, suivi distributions et TokenEconomizer avec les résultats réels.
- [ ] Préparer les contrôles du futur build ; laisser la compilation desktop au mainteneur, puis portable sur son accord après essais desktop.

## Points d'entrée dans le dépôt

- `web-app/src/services/transformers/engine.ts` et `web-app/src/services/onnx/engine.ts` : réglages Python et invocation des sondes/imports/chargements.
- `web-app/src/hooks/useCreation.ts`, `useCreationInstall.ts`, `useAutoConfiguration.ts` : préférences création, installation et recommandations.
- `web-app/src/containers/CreationControls.tsx`, `CreationInstall.tsx`, `MusicControls.tsx`, `TextSetupPanel.tsx`, `HubHardwareDiagnostic.tsx`.
- `web-app/src/services/creation/` et `web-app/src/modules/engines/` : contrats de préparation/génération et diagnostics.
- `src-tauri/src/core/transformers.rs`, `onnx.rs`, `creation.rs`, `creation_bundle.rs`, `creation_music.rs`, `creation_policy.rs`, `src-tauri/src/lib.rs` : implémentations et commandes.
- `transformers-server/setup.ps1`, `setup-exllama.ps1`, les requirements Transformers/média/ONNX et les scripts Python associés : référence technique actuelle, pas encore un installateur produit universel.
- `src-tauri/tauri.windows.conf.json`, ressources Bun/uv, `scripts/distribution/` et `scripts/package-windows-portable.ps1` : embarquement et distribution.
- `web-app/src/locales/`, `scripts/check-novera-locales.py`, `docs/language-support.json`, `scripts/fixtures/ui-invariant-text.json` : localisation et invariants.

## Critères de fin

Un novice peut installer et utiliser chaque profil déclaré pris en charge sans chemin technique saisi. La sonde vérifie le composant réellement utilisé. Les environnements restent isolés ; une réparation ne modifie pas les données ou les autres installations. Les anciens réglages avancés restent utilisables. Les fonctions cloud restent disponibles. Tous les messages nouveaux ou modifiés sont traités dans les 80 langues. Les plateformes et fonctions non validées sont indiquées honnêtement. La compilation et les essais réels restent distincts des seuls tests de sources.

## Message initial de reprise (historique)

> Lis `NOVERA.md` et `docs/REPRISE_COMPOSANTS_GERES_80_LANGUES.md`. Mets en œuvre le chantier des composants gérés dans Novera · Configurations pour supprimer la saisie de chemins techniques du parcours novice. Préserve les configurations existantes et les options avancées, les fonctions cloud et les travaux locaux. Traite tous les textes nouveaux et modifiés dans nos 80 langues au cours du même chantier. Commence par vérifier l'état réel du dépôt et la matrice de compatibilité, puis implémente et valide progressivement. Je garde la compilation desktop ; ne lance pas les compilations complètes ou la publication. Nous préparerons ensuite le portable depuis le desktop testé.
