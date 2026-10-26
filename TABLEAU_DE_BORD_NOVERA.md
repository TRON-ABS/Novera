# Novera — tableau de bord

## Real-ESRGAN : incident corrigé et taille finale — 26 octobre 2026

Deux causes confirmées sur le PC du mainteneur : chemins de poids Windows mal assemblés et `python` sans PyTorch/Pillow/NumPy. Sources corrigées, diagnostic préalable avant génération, réglages sauvegardés réparés vers le Python CUDA existant. **Vrai ×2 : 512 × 224 → 1024 × 448 en 4,52 s**. Le compositeur affiche un bouton Real-ESRGAN actif avec facteur et taille finale à droite de Ratio/Résolution. **42 tests web, un test Rust isolé de reproduction Windows**, TypeScript et contrôle natif réussis ; aucun nouveau binaire. [Détails et périmètre](docs/USER_GUIDE.md#real-esrgan--chemins-windows-python-et-taille-finale--26-octobre-2026).

## Partage, messageries et ratios — 26 octobre 2026

Sources : petite icône sous chaque réponse/création et pour la discussion ; résultat, branche active complète ou sélection, aperçu explicite, copie riche/image/fichier, exports et impression/PDF. DOCX/ODT/RTF/EPUB/ZIP complètent les formats textuels ; original et onze encodeurs d’image, SVG incorporé ; vidéo originale. Messageries via les capacités du système, copie ou pièce jointe ; Linux utilise le portail courriel. Dix-neuf ratios + personnalisé et résolutions ajustées au grand côté courant pour les profils locaux. **70 locales × 1 734 clés ; 145 tests web, trois tests Rust**, TypeScript, Vite, contrôle natif Windows et architecture réussis. Sources des autres adaptateurs présentes, essais natifs correspondants encore nécessaires. Aucun nouveau binaire, aucun envoi automatique ni lien public hébergé. [Guide et limites](docs/USER_GUIDE.md#partage-des-résultats-et-ratios--sources-du-26-octobre-2026).

## Graines et agrandissement d’image — 26 octobre 2026

Sources : modes de graine aléatoire/fixe/+1/−1, réutilisation, limite de génération **2048 × 2048**, agrandissement **Real-ESRGAN optionnel** ×2 par défaut/×4, modèles officiels installables ou fichier choisi. Désactivé initialement ; Python/PyTorch média requis une fois activé. **70 locales × 1 704 clés**, 82 tests web, quatre tests Python, sept tests Rust d’installation, types et contrôle natif ; vrais essais des deux poids sur CPU et CUDA, sur une entrée 16². Aucun nouveau binaire Novera ; les tailles maximales et le parcours graphique complet restent à valider après compilation. [Utilisation et limites](docs/USER_GUIDE.md#graines-résolution-et-agrandissement--sources-du-26-octobre-2026).

## Moteur image intégré et boutons actifs — 26 octobre 2026

Sources corrigées : sous Windows, plus de champ d’exécutable `sd-cli` ; les anciens chemins enregistrés sont ignorés et le moteur inclus dans Novera est résolu automatiquement. Auto, Texte, Image et Vidéo reprennent le cadre coloré des autres commandes actives. Tests ciblés réussis ; aucun nouvel EXE construit pour ces corrections. Recompiler Novera pour les appliquer au binaire. [Preuves et limites](docs/SUIVI_MOTEURS.md#résolution-interne-du-moteur-image-windows--26-octobre-2026).

## Automatisation mémoire et contrôle manuel — 26 octobre 2026

Gestion **Automatique par défaut**, dans les deux sens entre texte, image et vidéo : attente des travaux locaux actifs, déchargement des modèles devenus inutiles, rechargement à la demande et conservation des conversations/fichiers. Mode **Manuel** pour demandes texte/image/vidéo simultanées dans des discussions distinctes selon la RAM/VRAM ; les workers média restent des processus par génération. Contrôle visible dans la discussion et les paramètres généraux, traduit dans les 70 locales. **369 tests web / 24 fichiers**, trois tests natifs de politique, types et architecture ; **1 689 clés par locale**. Publication des sources/vitrine autorisée, sans nouveau build de Novera ni binaire. [Détails et limites](docs/SUIVI_MOTEURS.md#gestion-mémoire-entre-texte-image-et-vidéo--26-octobre-2026).

## Installation conseillée et bibliothèque Image/Vidéo — sources locales

Le lot du 26 octobre ajoute l’installation confirmée du trio FLUX dans `Documents/Novera models` ou un dossier choisi, progression globale/per-file, pause/reprise et vérification SHA-256. Icône seule, sans audio ni notification système, fin conservée jusqu’au clic. Import automatique dans la section Image de la page llama.cpp, import manuel/édition/retrait des configurations et sélecteur de discussion par catégorie. Le prochain build Windows embarque le moteur C++ CUDA 13.4.3/Vulkan/CPU ; plus de chemin `.build` à choisir. **70 locales × 1 681 clés**, 98 tests web ciblés/TypeScript/architecture et six tests natifs isolés validés. La sonde CUDA fonctionne ; le nouveau parcours graphique complet reste à tester avec la compilation du mainteneur. Publication des sources et contrôle de la vitrine autorisés ; aucune compilation de Novera ni publication de binaire pour ce lot. [Détails et limites](docs/SUIVI_MOTEURS.md#installation-groupée-bibliothèque-et-moteur-embarqué--26-octobre-2026).

État des sources au **26 octobre 2026**. Ce fichier est le point d’entrée ; les procédures, tâches et preuves détaillées sont dans les documents ci-dessous.



## Test réel dans Novera — images GGUF, 26 octobre 2026

Échec diagnostiqué puis corrigé par les réglages : le moteur NVFP4 était associé à un GGUF et l’exécutable C++ pointait vers un fichier d’encodeur. Après choix de stable-diffusion.cpp/Vulkan et de son vrai `sd-cli.exe`, **le trio conseillé FLUX.2 Klein 4B Q4_K_M + Qwen3-4B Q4_K_M CPU + VAE BFL a produit une vraie image 512² dans la discussion**, sauvegardée dans Images/Novera image ; durée totale affichée **25,5 s**. Binaire compilé par le mainteneur, aucune nouvelle compilation ici. Validation limitée à ce parcours GGUF sur ce PC ; cloud, vidéo et NVFP4 graphique restent distincts. [Diagnostic et preuve](docs/SUIVI_MOTEURS.md#diagnostic-graphique-et-trio-gguf-réel--26-octobre-2026).


## Synchronisation du dépôt et de la vitrine — 26 octobre 2026

Le mainteneur a autorisé la publication des nouvelles sources et de la vitrine : **41 profils cloud**, dont **19 avec routes de génération**, **45 préréglages média (25 image / 20 vidéo)**, **70 locales × 1 668 clés**, création dans la discussion, moteurs mixtes et NVFP4 CUDA natif testé. L’ambition publique inclut l’aide aux personnes et les contributions dans tous les secteurs, avec simplicité et accessibilité au savoir à travers le monde ; ces orientations restent distinctes des fonctions déjà validées. Description GitHub, site associé, sujets, README rendus, icônes/liens, absence de binaire public et GitHub Actions désactivé font partie du contrôle de synchronisation. La vérification en ligne de la révision publiée est enregistrée localement avec la publication. Aucune nouvelle compilation déclenchée ici ; le mainteneur teste sa propre compilation. Contrôles de publication : **369 tests web réussis dans 22 fichiers**, TypeScript sans émission, 70 locales à 1 668 clés, frontières et sept tests d’architecture validés. Contrôle documentaire local : 254 références sans cible manquante et 41 icônes par README.


## NVFP4 natif, placement et durées — sources locales

NVFP4 CUDA FLUX.2 Klein 4B testé réellement sur RTX 5070 Laptop : image 512²/quatre étapes, 400 GEMM natives, sans cache BF16 de diffusion. Choix CPU/CUDA/Auto indépendants pour Qwen et le générateur ; durées sous les images et vidéos, conservées dans la conversation. Conseil corrigé Qwen3-4B CPU + FLUX.2 Q4_K_M GPU et VAE officiel ; aucune nouvelle famille de poids téléchargée. Le Hub conseille NVFP4 sous conditions matérielles, et Q6_K/fidélité ou Q4_K_M/équilibre pour les composants GGUF texte/image/vidéo. 106 tests web, 21 Python CUDA, 20 Python CPU et un test matériel ignoré, 70 × 1 668 clés. **Pas de compilation ni publication.** [Preuves et limites](docs/SUIVI_MOTEURS.md#nvfp4-cuda-natif-placement-et-durées--26-octobre-2026).


## Où trouver l’information ?

| Besoin | Document de référence |
| --- | --- |
| Présentation | [Français](README.fr.md) · [English](README.md) |
| Utiliser Novera : premier démarrage, modèles, discussions, confidentialité | [Guide utilisateur](docs/USER_GUIDE.md) |
| Architecture, moteur, compatibilité, dépendances et logos | [Développement](docs/DEVELOPMENT.md) |
| Suivi local des moteurs, Safetensors CPU/GPU et versions PyTorch | [Suivi des moteurs](docs/SUIVI_MOTEURS.md) |
| Compiler, préparer Windows/Android, signer et distribuer | [Construction et distribution](docs/BUILD_AND_RELEASE.md) |
| Couverture des 70 locales, traductions et feuille de route des langues | [Langues](docs/LANGUAGES.md) |
| Prochaines tâches | [Feuille de route unique](ROADMAP.md) |
| Changements et preuves historiques | [Historique](docs/CHANGELOG.md) |
| Revue de la modification courante | [PR.md](PR.md) |
| Consignes du projet | [NOVERA.md](NOVERA.md) · [Contribuer](CONTRIBUTING.md) |
| Identité, licences et publication officielle | [Identité](BRANDING.md) · [Versions officielles](OFFICIAL_RELEASES.md) · [Licence](LICENSE) |

## Catalogue média cloud — sources locales

41 profils cloud, dont 14 nouveaux fournisseurs avec icônes officielles, et 45 présélections de génération documentées. Filtres Texte/Image/Vidéo/Multimodal et Local/Cloud dans la discussion ; choix média séparé du modèle texte, sauvegarde système commune. Les tests cloud sont simulés, sans compte ni facturation réels. Ce lot cloud avait porté les 70 locales à 1 645 clés ; le lot GGUF ci-dessous porte la base actuelle à 1 653. Relecture native requise. Voir [le suivi détaillé](docs/SUIVI_MOTEURS.md#création-cloud-dans-la-discussion--26-octobre-2026). **Aucune compilation ni publication de ce lot** : la vitrine GitHub ci-dessous décrit toujours l’état précédemment publié à 27 fournisseurs.

## Moteur image mixte et compatibilité NVFP4 — sources locales

Composants GGUF/Safetensors séparés, préparation automatique du NVFP4 ComfyUI reconnu dans un cache BF16, rendu C++ avec règle Q8_0 limitée à la diffusion. L’encodeur « uncensored » conserve son rôle et sa quantification GGUF. **Deux images réelles finales produites : Vulkan RTX 5070 Laptop, 512²/4 étapes ; CPU, 64²/1 étape.** Le mode de compatibilité ne nécessite pas de RTX 50 et n’est pas un calcul NVFP4 matériel natif. Originaux intacts. 581 tests web/26 fichiers, 15 tests Python dans les environnements CPU et CUDA, 70 locales à 1 653 clés, contrôles de types et d’architecture validés. L’application n’est ni recompilée ni publiée ; son flux natif complet attend validation. [Preuves et limites](docs/SUIVI_MOTEURS.md#formats-mixtes-ggufsafetensors-et-compatibilité-nvfp4--26-octobre-2026).

## Sources actuelles

- Version préparée : **1.0.0** ; 35 corrections Windows intégrées, architecture en six domaines et nouveaux noms internes Novera.
- **70/70 catalogues**, chacun à **1 653/1 653 clés anglaises (100 %)** dans 14 espaces de noms. Dernier lot : ouzbek du Nord, zoulou, arabe saïdi, pachto du Nord, oromo du Centre-Ouest, saraiki, néerlandais, somali, roumain et assamais. Relecture native encore nécessaire.
- Premier démarrage : langue système sauvegardée, recommandation desktop LFM2.5-2.6B Q6_K, compagnon DSpark Q8_0 facultatif avec explication RAM/VRAM/contexte, demande distincte pour le suivi des erreurs.
- **Hugging Face : environ 3,19 millions de dépôts de modèles** (3 187 159 au 26 octobre 2026), dont 214 900 GGUF et 27 295 MLX ; découverte directe des formats compatibles par lots, avec six présélections Novera conservées ; **41 profils cloud**, **69 présélections textuelles** et **45 présélections de génération**, avec neuf fournisseurs et leurs icônes ajoutés le 26 octobre (listes initiales relevées le 25). Disponibilité et capacités réelles dépendent du modèle, du compte et du matériel.
- Dernière suite web complète enregistrée : **5 187 tests réussis, 2 ignorés** ; TypeScript sans émission, catalogues et frontières d’architecture validés. Ce résultat précède la consolidation documentaire et ne prouve pas un fonctionnement natif complet.

Lot Hub antérieur : **257 tests web réussis dans 11 fichiers**, TypeScript sans émission, sept tests d’architecture réussis et 70 locales complètes. Essai API publique : 44 dépôts avec tailles, pagination disponible, aucun poids téléchargé. Aucun exécutable reconstruit.

Dernier lot cloud : **310 tests ciblés réussis dans quatorze fichiers**, TypeScript sans émission, 70 catalogues complets et 980 JSON inchangés ; 27 fournisseurs et six modèles locaux avec icônes officielles vérifiées ; les 70 noms de langues restent natifs. Aucun exécutable reconstruit pour ce lot.

Dernier lot langues : **963 tests ciblés réussis dans 45 fichiers**, TypeScript sans émission, 70 catalogues complets en clés et contrôles d’architecture validés. Relecture native et adaptation vernaculaire intégrale des variantes éditoriales restent ouvertes. Ces tests ne reconstruisent pas le programme.

## Créations dans la discussion — non publié

Les sources locales ajoutent Auto/Texte/Image/Vidéo au même compositeur, modèles Diffusers locaux et paramètres, progression/arrêt, aperçu image, lecteur vidéo, variante image et sauvegarde automatique dans **Images/Novera image** et **Vidéos/Novera vidéo** via les dossiers connus du système. Les créations conservent leurs paramètres ; les conversations stockent des références légères. PNG et MP4 ont été générés réellement sur CPU/CUDA avec des fixtures non entraînées, sans télécharger de poids ; la variante image a été validée sur CPU et l’animation d’une image sur CUDA avec une fixture conditionnée par image distincte. Lot final : **370 tests web réussis dans 17 fichiers**, **8 tests Python**, **7 tests d’architecture**, TypeScript sans émission et 70 catalogues validés. Les contrôles sont présents dans les 70 langues, à 1 620 clés chacune.

**Dernière consigne : pas de compilation de l’application ni de mise à jour du dépôt pour ce lot.** Les builds, commits et chiffres historiques des sections suivantes précèdent cet ajout. Les modèles complets, la configuration Python 3.15.1/Diffusers et la mémoire adaptée restent nécessaires. Le parcours graphique dans un nouveau binaire reste à vérifier. [Suivi des moteurs](docs/SUIVI_MOTEURS.md) · [Utilisation](docs/USER_GUIDE.md).

## Hub et Safetensors — suivi local du 26 octobre

Le Hub prépare 23 entrées de navigation, des conseils matériels expliqués et une revue avant téléchargement. Safetensors textuel : Python 3.15.1, PyTorch 2.14.1 CPU/CUDA, tests réels CPU/GPU réussis sur le modèle minuscule. Image, vidéo et autres modalités restent dépendantes de moteurs à intégrer. [Versions, résultats et limites](docs/SUIVI_MOTEURS.md).

Dernier correctif : chargement progressif au défilement sans bouton « Suivant », résultats de la catégorie active ajoutés en bas dans un ordre stable, badge raccordé au diagnostic traduit ; 16 tests ciblés réussis dans 5 fichiers et TypeScript validé. Les 70 catalogues existants sont réutilisés. Le mainteneur prend en charge sa compilation. Mise à jour des sources du dépôt autorisée ensuite par le mainteneur ; aucun binaire publié.

## Compilations locales enregistrées

Le journal `.build/launcher-desktop-2026-10-26_02-58-48-043/result.json` enregistre une compilation desktop réussie, sans publication, avant le dernier correctif de pagination/badge. Le dossier de sortie consigné n’est plus présent à son emplacement lors de ce contrôle ; sa disponibilité actuelle n’est donc pas attestée ici. Aucun nouveau build lancé pour les correctifs ou cette mise à jour documentaire.

### Compilation antérieure du 25–26 octobre

Compilation Windows x64 terminée le **26 octobre 2026 à 00:04 (Paris)**, démarrée le 25 à 23:59, dans `deliverables/Novera-desktop-1.0.0-2026-10-25_23-59-09-633`. Elle intègre les **70 catalogues**, les noms internes Novera et les options DSpark/consentements. Elle précède les neuf ajouts cloud et la découverte directe Hugging Face du 26 octobre ; ceux-ci nécessitent une nouvelle compilation.

EXE : **65 208 832 octets**, SHA-256 `1D3E1F545BF11CDC50F6E5F031ABFCA2DBD1E6293818F3D12A049263CDAC187A`.

Le BAT fourni a terminé les étapes moteur, interface et desktop. Le dossier contient 26 exécutables/DLL contrôlés x64 ; worker `novera-llama-worker.exe` version 0.7.0, llama.cpp b11823, CUDA x64 et CPU chargés. Le worker du dossier final détecte la RTX 5070 Laptop. L’ancien worker n’est pas livré. Réutilisation du moteur vérifiée sans environnement de compilation spécial, après contrôle des empreintes. Preuves locales : `.build/engine-launcher-fix-2026-10-25/runtime-audit.json` et `.build/launcher-desktop-2026-10-25_23-59-09-633/result.json`.

La compilation ne remplace pas l’application installée et ne modifie aucun profil. Aucun nouveau démarrage de l’interface, génération de modèle ou essai de mise à niveau n’a été réalisé pour cette correction. Suivi des erreurs, statistiques et mises à jour restent désactivés dans ce build sans télémétrie configurée. Les premiers démarrages et le transport réel d’erreurs depuis le WebView restent à valider.

## Vitrine GitHub — contrôle du 26 octobre 2026

Le champ « À propos », indépendant du README, a été corrigé : **70 locales d’interface**, **27 fournisseurs cloud**, Hub adaptatif et état en développement. Site associé et sujets du dépôt contrôlés ; aucune version binaire publique présente et GitHub Actions désactivé lors de la vérification.

Les README anglais/français présentent le défilement progressif, le moteur textuel Safetensors, les 23 entrées de navigation et les 14 locales RTL. Le contrôle des sources a confirmé 70 catalogues à 1 587 clés, 27 icônes par galerie et **98 références locales valides** au total, images et ancres incluses. Les derniers changements restent à compiler par le mainteneur. Le texte et les attributions de licence hérités sont conservés ; l’API GitHub classe actuellement la courte notice `LICENSE` en « Other », ce qui ne constitue pas un changement de licence.

Le catalogue Safetensors officiel recensait **1 440 138 dépôts** lors du relevé du 26 octobre 2026. Ce nombre est ajouté aux deux README avec sa source ; il ne compte pas les modèles vérifiés compatibles Novera et ne s’additionne pas aux autres formats sans risque de doublons.

La règle permanente est inscrite dans [NOVERA.md](NOVERA.md) et le [guide de développement](docs/DEVELOPMENT.md) : vérifier et actualiser la vitrine lors de chaque synchronisation, puis contrôler le résultat en ligne. Les preuves de cet audit restent locales sous `.build/showcase-2026-10-26/` ; aucune compilation ou publication binaire pour cette modification.

## Limites de distribution

**Aucun binaire Novera public.** GitHub Actions et mises à jour automatiques restent désactivés. Les sources publiées peuvent être plus récentes que le programme installé. La consolidation documentaire ne compile ni ne remplace l’application.

Android : APK debug ARM64 assemblée dans les essais antérieurs ; trois audits restent ouverts. Essais sur téléphone, signature de production et parcours de construction gardé complet non validés. Android reste désactivé dans le lanceur.

Les validations à réaliser sont centralisées dans [ROADMAP.md](ROADMAP.md), sans les recopier dans chaque guide.

Contrôle final avant publication des sources : **309 tests réussis dans 17 fichiers**, TypeScript sans émission réussi ; contrôles des 70 locales et des frontières d’architecture sans erreur. Aucun nouveau build ni binaire publié pour cette synchronisation.
