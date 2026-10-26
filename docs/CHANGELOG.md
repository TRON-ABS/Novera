# Novera — historique consolidé

## 26 octobre — protection contre le gel du partage Windows

Un gel réel de Novera et un volet Partager impossible à fermer ont invalidé la validation limitée aux sources du premier adaptateur Windows. Désactivation temporaire du volet WinRT côté interface et commande native ; aucune préparation ne le lance désormais sous Windows. Copier le fichier est mis en avant et utilise le format natif CF_HDROP Unicode entièrement matérialisé, dans un worker, avec libération correcte de la mémoire en cas d’erreur. Enregistrer, copie riche/image et impression restent disponibles. Autres adaptateurs inchangés.

Vingt tests web sous configuration Windows, un test Rust avec DragQueryFileW pour Unicode/UNC, types et contrôle natif réussis. Le bureau a été libéré en fermant seulement l’instance de partage résiduelle, sans redémarrage de l’Explorateur. Aucun réglage Windows manquant identifié ; cause exacte du gel non établie et volet non présenté comme réparé/réactivé. Aucun nouveau binaire Novera ni envoi réel de message. [Guide de récupération](USER_GUIDE.md#partage-windows--volet-bloquant-suspendu--26-octobre-2026).

## 26 octobre — correction Real-ESRGAN et dimensions finales visibles

Réparation des chemins Windows canoniques assemblés avec un séparateur incompatible, y compris les registres existants à l’envoi d’une demande. L’installation des composants média utilise désormais une jonction correcte. Contrôle des dépendances Python/PyTorch/Pillow/NumPy avant le rendu optionnel, avec diagnostic technique distinct des poids manquants et priorité à l’erreur mémoire. Bouton actif **Real-ESRGAN ×2/×4 · largeur × hauteur finale** à droite de Ratio/Résolution, actualisé avec leurs réglages et masqué lorsque désactivé ou hors image locale.

Validation : **42 tests web / cinq fichiers**, un test Rust isolé utilisant la fonction exacte qui reproduit le refus du chemin Windows puis valide sa réparation ; essai réel du poids ×2 installé sur une image 512 × 224, sortie 1024 × 448 en 4,52 s avec l’environnement CUDA existant. Réglages locaux corrigés pendant que Novera était fermé. Types et contrôle natif réussis ; aucun nouvel EXE, ni validation d’un nouveau parcours graphique complet. [Guide](USER_GUIDE.md#real-esrgan--chemins-windows-python-et-taille-finale--26-octobre-2026).

## 26 octobre — partage local, messageries, exports et ratios

Ajout d’une icône de partage sous les réponses/images/vidéos et dans la barre de discussion : résultat seul, branche active complète avec messages hors écran, ou sélection ; aperçu avant copie, sauvegarde, impression/PDF et passage au système. Formats documentaires enrichis DOCX/ODT/RTF/EPUB en plus de Markdown/TXT/HTML/JSON/CSV/ZIP ; onze encodeurs matriciels dont AVIF, SVG incorporé et original préservé. Copie de fichier pour les applications de chat compatibles ; adaptateurs Windows/macOS/Android/iOS et Linux (courriel XDG + presse-papiers), sans envoi automatique ni liens publics hébergés. Dix-neuf ratios et ratio personnalisé, boutons de résolution avec ajustement aux dimensions actuelles, pour profils locaux image/vidéo. Trente nouveaux libellés dans les 70 locales : **1 734 clés**.

Validation : **145 tests web / 14 fichiers**, trois tests Rust isolés, types, build Vite, contrôle natif Windows, architecture, dictionnaires et lecture indépendante des conteneurs/export DOCX. Les plateformes autres que Windows et les transmissions réelles restent à essayer après compilation ; aucun nouvel EXE Novera ni binaire public. [Utilisation, formats et limites](USER_GUIDE.md#partage-des-résultats-et-ratios--sources-du-26-octobre-2026).

## 26 octobre — graines d’image et agrandissement optionnel

Ajout des graines Aléatoire, Fixe, +1 et −1, graine précédente réutilisable et conservation par profil ; limite de génération 2048 × 2048 visible. Agrandissement Real-ESRGAN activable/désactivable, désactivé initialement, ×2 par défaut ou ×4, deux poids officiels installables après confirmation et choix automatique ou fichier local. Le worker PyTorch intervient après la sortie du générateur et la publication attend la réussite de l’agrandissement. Quinze nouveaux textes dans les 70 locales : **1 704 clés** par catalogue. **82 tests web, quatre tests Python, sept tests Rust d’installation**, types, contrôle natif et build de l’interface ; vrais essais ×2/×4 sur CPU/CUDA avec entrée 16². Aucun nouvel EXE Novera. [Utilisation](USER_GUIDE.md#graines-résolution-et-agrandissement--sources-du-26-octobre-2026) · [Preuves et limites](SUIVI_MOTEURS.md#graines-et-agrandissement-real-esrgan--26-octobre-2026).

## 26 octobre — moteur image Windows intégré et sélection de sortie visible

Suppression du champ d’exécutable stable-diffusion.cpp sous Windows : Novera utilise automatiquement le lanceur inclus dans ses ressources, même lorsqu’un ancien profil conserve un chemin `.build/.../sd-cli.exe`. Les choix de diffusion, encodeur et VAE restent séparés. Le bouton sélectionné parmi Auto, Texte, Image et Vidéo utilise désormais le cadre, le fond et la couleur des autres commandes actives du compositeur.

Validation : 23 tests ciblés réussis sous configuration Windows et 23 sous configuration par défaut ; les cinq tests du composant réussissent après le changement visuel. Compilation TypeScript et Vite Windows/Tauri réussie avant ce dernier ajustement de style. Aucun nouvel exécutable Novera construit ou publié pour ces corrections ; une recompilation est nécessaire pour les retrouver dans l’application. [Détails](SUIVI_MOTEURS.md#résolution-interne-du-moteur-image-windows--26-octobre-2026).

Les entrées ci-dessous décrivent des étapes datées. Elles ne remplacent pas [l’état courant des sources et du binaire](../TABLEAU_DE_BORD_NOVERA.md). Les journaux bruts, caches et exécutables restent locaux.



## 26 octobre — diagnostic de l’échec image dans le binaire du mainteneur

Contrôle direct de Novera : correction de l’association moteur/format et du chemin d’exécutable dans les réglages, sans modification des modèles. Le trio GGUF conseillé a ensuite généré une image 512 × 512 affichée et sauvegardée, avec durée totale 25,5 s. Ce test valide ce parcours graphique C++/Vulkan sur un PC ; il ne valide pas les parcours cloud, vidéo ou NVFP4 graphique. Aucun nouveau build ou push. [Preuves](SUIVI_MOTEURS.md#diagnostic-graphique-et-trio-gguf-réel--26-octobre-2026).


## 26 octobre — publication des capacités média et nouvelle vitrine

Synchronisation demandée des sources image/vidéo, des 41 profils cloud dont 19 avec routes de génération et 45 préréglages média, des moteurs locaux et du Hub conseillé. README anglais/français restructurés avec les 70 locales à 1 668 clés, les icônes officielles, les sorties réellement implémentées, les preuves natives NVFP4 et les limites des essais cloud simulés. Ambition élargie : aider les personnes et contribuer dans les secteurs de l’éducation, des sciences, de la santé, de l’environnement, de l’agriculture, des entreprises, des services publics, de la création, de l’accessibilité et de la vie quotidienne, avec des parcours simples et un accès mondial au savoir. Cette demande autorise la publication des sources et de la vitrine, sans nouveau build ni binaire public.


## 26 octobre — NVFP4 CUDA natif, placement et durées (local uniquement)

Ajout du chemin NVFP4 natif FLUX.2 Klein 4B, testé avec une vraie image sur RTX 5070 Laptop. Placement CPU/GPU séparé de Qwen et du générateur, Auto prudent, durées persistées sous images et vidéos, conseil Qwen3 corrigé, conseils Hub NVFP4 et GGUF Q6_K/Q4_K_M. Sources et 70 langues actualisées ; aucun nouvel exécutable ni publication. [Preuves](SUIVI_MOTEURS.md#nvfp4-cuda-natif-placement-et-durées--26-octobre-2026).


## 26 octobre — les fournisseurs cloud dans la vitrine GitHub

Les README français et anglais mettent en avant les 27 fournisseurs cloud avec leurs icônes et liens officiels, la découverte Hugging Face et les 70 langues. Ajout de liens directs depuis l’en-tête. Quatre dérivés PNG des ICO existants servent uniquement au rendu de la documentation. Aucun changement de l’application, des modèles, des traductions ou des consentements.

## 26 octobre — catalogue Hugging Face direct et chiffres actualisés

Le Hub découvre directement les dépôts Hugging Face compatibles par lots, avec priorité aux éditeurs d’origine, pagination et cache ; il conserve les six présélections Novera et abandonne le flux JSON Jan sur GitHub. Modèles installés, conversations et profils inchangés. Chiffres mis en avant dans les README et le tableau de bord : **3 187 159 dépôts de modèles** au total, environ **3,19 millions**, dont **214 900 GGUF** et **27 295 MLX**, relevés le 26 octobre ; variantes et conversions incluses, sans garantie de compatibilité de tous ces dépôts.

Validation : **257 tests web réussis dans 11 fichiers**, TypeScript sans émission, sept tests d’architecture et contrôle des frontières réussis, 70 locales complètes en clés. Essai réel public : 44 dépôts, 44 tailles disponibles et page suivante récupérés en 49 requêtes de métadonnées ; aucun poids téléchargé. Pas de compilation applicative ou de validation native Mac. [Fonctionnement et limites](USER_GUIDE.md#hub).

## 26 octobre — neuf fournisseurs cloud et modèles récents

Ajout de Meta AI, Cohere, Z.ai, AI21 Labs, BytePlus, Baidu Qianfan, Tencent TokenHub, Amazon Bedrock et IBM watsonx : **27 fournisseurs** et **69 modèles présélectionnés** au total. Modèles récents vérifiés dans les sources officielles ; IBM utilise les alias réellement activés dans la passerelle du compte. Neuf icônes officielles raccordées, dont le SVG Cohere existant. URL régionales et passerelles modifiables, catalogue Cohere natif et routes Mantle distinctes, migration Cohere sans suppression des clés ou proxy.

Noms natifs des 70 langues, menu élargi avec sens de lecture automatique ; icônes officielles Liquid AI et Qwen ajoutées aux six modèles locaux dans le Hub et sur leurs fiches.

Validation : **310 tests ciblés réussis dans quatorze fichiers**, TypeScript sans émission, 70 catalogues complets à 1 516 clés et 980 JSON inchangés, 177 liens locaux valides. Aperçu des icônes : 36/36 images décodées sur fonds clair et sombre. Les cinq services sans contrat de catalogue vérifié gardent des listes maintenues et le test par catalogue désactivé. Aucun accès aux clés utilisateur, appel d’inférence payant, exécutable reconstruit ou binaire publié. [Sources et limites](USER_GUIDE.md#cloud), [provenance des icônes](DEVELOPMENT.md#logos).

## 26 octobre — corriger la compilation Windows après le renommage du worker

Le BAT échouait dans Tauri car `novera-llama-worker.exe` n’était pas préparé. Le lanceur construit et prépare désormais le worker avant l’interface/desktop, ou réutilise un build local dont les sources et binaires correspondent. Les étapes ont leurs propres journaux et arrêtent le lancement sur erreur. Le staging CUDA compare l’architecture PE au worker et prend les DLL x64 dans les kits qui contiennent aussi ARM64 ; `cudart` est conservé pour les contrôles du runtime Windows.

Validation : 19 assertions de préparation sous PowerShell 5.1 et 7, 69 assertions du lanceur, 223 assertions du packager, 16 de configuration télémétrie, trois tests Bash/CUDA et sept tests d’architecture réussis. Compilation réelle via le BAT utilisateur, terminée à 00:04 Paris : `deliverables/Novera-desktop-1.0.0-2026-10-25_23-59-09-633`, EXE **65 208 832 octets**, SHA-256 `1D3E1F545BF11CDC50F6E5F031ABFCA2DBD1E6293818F3D12A049263CDAC187A`. Les 26 binaires du dossier sont x64 ; le worker b11823 détecte la RTX 5070 Laptop depuis le dossier final. Le cache du moteur est vérifié séparément depuis un environnement normal. Les 70 catalogues sont inclus. Aucun lancement de l’interface, génération de modèle, installation, changement de profil ou publication binaire pour cette correction.

## 25 octobre — de l’ouzbek du Nord à l’assamais

Ajout de uzn, zu, aec, pbu, gaz, skr, nl, so, ro et as : **70 catalogues à 1 516 clés**, soit 15 160 nouvelles entrées dans 140 JSON. Les 840 JSON précédents sont préservés. Détection système avec canonicalisation et distinction des écritures, persistance, formats compatibles et RTL raccordés. Validation : 963 tests ciblés dans 45 fichiers, TypeScript et contrôles des langues/architecture réussis. [Méthodes et limites](LANGUAGES.md) : traduction assistée, compléments éditoriaux, saïdi/saraiki encore partiels en vernaculaire ; relecture native requise. Aucun binaire reconstruit, profil modifié ou CI activée.

## 25 octobre — ukrainien à malais

Ajout de uk, hsn, ml, sd, pa, su, ig, prs, ne et ms : **60 catalogues à 1 516 clés chacun**, avec 15 160 nouvelles entrées. Les 50 catalogues précédents sont préservés. Validation finale : 856 tests ciblés dans 45 fichiers, TypeScript sans émission, 60 catalogues et architecture sans erreur ; 176 liens locaux vérifiés et 700 JSON précédents inchangés. Détection dari malgré canonicalisation Intl, séparation gurmukhi/shahmukhi et refus d’imposer le sindhi arabe à une préférence Devanagari. Méthodes, textes écrits partagés et limites linguistiques dans [Langues](LANGUAGES.md). Aucun binaire reconstruit, profil modifié ou CI activée.

## 25 octobre — dix locales supplémentaires

Ajout de yo, bho, cjy, nan, my, arq, hak, ln, ary et or : **50 catalogues à 1 516 clés chacun**, avec 15 160 nouvelles entrées. Registres, détection système, persistance, RTL et formats régionaux raccordés. Les méthodes et le partage de textes techniques des variantes éditoriales sont détaillés dans [Langues](LANGUAGES.md) ; relecture native et approfondissement vernaculaire restent ouverts. Les 40 anciens catalogues sont conservés. Validation finale : 757 tests ciblés dans 45 fichiers, TypeScript sans émission, catalogues/architecture sans erreur et 175 liens locaux valides. Retrait de 2 904 préfixes parasites dans les brouillons bhojpuri/lingala, avec garde de régression. Aucune compilation applicative ni activation de CI.

## 25 octobre — quatre locales supplémentaires

Ajout du gujarati, kannada, arabe levantin et arabe soudanais : **40 catalogues**, chacun à **1 516/1 516 clés**. Sélecteur, typage, détection système, persistance, formats régionaux et RTL sont raccordés. Méthodes et limites linguistiques dans [Langues](LANGUAGES.md). Les 36 anciens catalogues sont inchangés ; relecture native des nouveaux textes ouverte. Validation : 660 tests ciblés réussis dans 45 fichiers, TypeScript sans émission, catalogues et architecture sans erreur. Aucune compilation applicative, modification de profil ou activation de CI pour cet ajout.

<a id="history"></a>

## 25 octobre 2026 — documentation regroupée

Les **36 Markdown principaux** de la racine et du premier niveau de `docs` sont regroupés en **14 documents** : deux présentations, tableau de bord, feuille de route, instructions, contribution, revue courante, deux politiques et cinq références dans `docs`. Les références techniques imbriquées, licences, notices et README de sous-projets restent à leur place.

Les anciens journaux par tâche et le journal texte redondant sont remplacés par ce relevé, la feuille de route et les guides thématiques. L’ancien inventaire de dépendances incluait le site Jan supprimé ; les manifestes/verrous deviennent la référence courante. Les 100 lignes de la feuille de route des langues et les 35 corrections ci-dessous sont conservées.

Aucune compilation, modification de profil, activation de CI ni publication de binaire pour cette restructuration.

## 25 octobre — premier démarrage et derniers contrôles de sources

Commit [0765c3b](https://github.com/TRON-ABS/Novera/commit/0765c3b1766ccb52905f876ef149e55e260c4b50) : DSpark Q8_0 facultatif pour LFM2.5-2.6B desktop, explication RAM/VRAM/contexte et demande indépendante Autoriser/Refuser pour les erreurs. Trois nouvelles clés dans les 36 locales : 1 516 clés chacune. Dernière suite web complète : **5 187 réussis, 2 ignorés** ; TypeScript sans émission, contrôle des langues, sept tests d’architecture et 13 modules sans violation. Les appels réseau des tests sont simulés. Aucun nouveau build applicatif.

## 25 octobre — langues, identité interne et nettoyage

Wu complété par 757 entrées puis 16 catalogues hérités par 9 219 traductions ; relecture native ouverte. Les comptes 1 513 de leurs [rapports](../deliverables/locale-completion-2026-10-25/report.md) sont ceux de cette étape. Les textes ultérieurs portent le total à 1 516.

Les composants propres au projet deviennent `novera-llama-worker`, `novera_llama_shim`, 17 fonctions FFI et modules `useNovera…`. Compatibilité de stockage, variables de construction et identité des véritables fournisseurs Jan conservées. Contrôles de cette étape : 234 tests web, TypeScript, 223 assertions portable/12 scénarios, trois tests de ressources Rust en harnais isolé, en-tête C/C++ et concordance des 17 symboles. Aucune liaison complète de moteur ni mise à niveau réelle validée.

Retrait de 762 chemins de l’ancien site Jan (environ 244 Mio de sources), anciens installateurs pointant `delta.jan.ai`, recette Flatpak Jan 0.8.5 et workflows associés. Les références CLI/protocole sont conservées dans `docs/agent`, avec leurs exemples ADK. Licences et ressources de fournisseurs réellement utilisés restent présentes. Un nettoyage local distinct avait retiré environ 14,4 Go d’artefacts reproductibles, en conservant sources, données, outils de référence et preuves. Ses anciens chemins d’artefacts ne garantissent plus leur disponibilité.

Les catalogues cloud et sept logos officiels ont été actualisés d’après les sources relevées le 25 octobre, sans utiliser de clé utilisateur ni effectuer d’inférence payante. Leur provenance est dans [Développement](DEVELOPMENT.md#logos), les limites et la maintenance dans [le guide utilisateur](USER_GUIDE.md#cloud).

## 25 octobre, 02:59 — dernier build Desktop et essai Europe

Construction web/Rust release locale, dossier `deliverables/Novera-desktop-1.0.0-2026-10-25_02-59-20-029`, EXE **60 113 408 octets**, SHA-256 `3EA0AB5571BF9EFEDF2584C0EE5D4DEAD87B8E12CA4E94AB2A9EC04A2A19B426`. Ancienne distribution conservée. Démarrage dans un profil et WebView2 isolés : confidentialité en français, destination Europe et deux interrupteurs désactivés. Aucun choix du profil habituel modifié.

Un harnais Node utilisant l’adaptateur a envoyé un unique `$exception` synthétique (`1.0.0-validation`), sans son message sentinelle brut. Réponse Europe HTTP 200, réception puis regroupement Error tracking constatés dans le projet **319433**, une occurrence. Le précontrôle CORS acceptait `http://tauri.localhost`. Cela ne valide pas le transport depuis le WebView ; aucune erreur volontaire dans l’application ni événement de démarrage utilisateur envoyé. Preuve locale : `.build/posthog-desktop-validation-2026-10-25/validation.json`.

Le lecteur de configuration et `-WithTelemetry` sont ensuite publiés dans les sources, avec 16 assertions de sécurité et 69 assertions du lanceur, sans nouveau build ou rapport réel. La configuration locale et les jetons sont exclus. Ce build précède les derniers renommages, compléments de langues et options DSpark/consentement.

## 24 octobre — bureau, Hub, Android et portable

Commandes de discussion, exports filtrés, suppression confirmée, langue système persistée, infobulles/dates/statistiques localisées, recherche web avec préférence conservée, filtrage du protocole brut et fermeture du menu au clic extérieur. Plusieurs builds isolés ont été contrôlés à leurs étapes respectives. Les comptes historiques de tests ne sont pas ceux des dernières sources.

Hub : six petits GGUF épinglés, estimation mémoire, tri, comparaison et test local annulable. La suite de cette étape comptait **5 103 réussis, 2 ignorés**. Le packaging portable #9302 a été adapté, testé sur fixtures (223 assertions/12 scénarios), extrait et démarré en profil isolé ; PC propre, signature et runner distant restent séparés.

Android : chaîne JDK 27.0.1.0.3 / SDK 37.2 / NDK r30 / Gradle 9.8.1 / AGP 9.4.0 / Kotlin 2.4.21. APK debug ARM64 **50 408 405 octets**, SHA-256 `B3355AE6AC41F289F3894FD9CFAE1E646E8D8459FA823719BA426E410C25E8A8`. Contrôles manifeste, six bibliothèques natives, signature debug et alignement 16 Kio. Trois tests de configuration et 70 assertions sous PowerShell 5.1 et 7. Preuve locale : `.build/android-toolchain-integration-2026-10-24/verification.json`. Ces résultats ne valident ni téléphone, ni signature de production, ni les changements postérieurs ; les trois audits restent ouverts.

Architecture : séparation progressive de six responsabilités, règles pures et adaptateurs, contrôle de frontières. Une sauvegarde antérieure avait été comparée par SHA-256 avant refonte. Les anciennes formulations « non compilé » ou « uniquement local » dans les journaux décrivent leur étape, pas l’état final des sources publiées.

## 23 octobre — fondation de Novera 1.0.0

Intégration des 35 corrections Windows ci-dessous, puis compilation locale autorisée. Build historique `Novera-Desktop-local-1.0.0`, SHA-256 `20D6D569802B435E9DF66F618FB94C14F1F28262DA4CF47593BD42E47BD8B35C`. Démarrage isolé, 33 tests natifs conversations et 63 MCP/requêtes réussis ; le harnais de tests comportait un manifeste Common-Controls v6, sans modifier l’EXE produit. Ce build n’est plus le dernier. La publication des sources a ensuite été autorisée le 24 octobre, sans binaire public.

<a id="engine-history"></a>

## 22–23 octobre — campagnes moteur historiques

M01–M04 ont été implémentés puis testés localement, sur Tron-v1-Q6_K (LFM2 2,7B) et RTX 5070 Laptop 8 151 Mio, puis sur d’autres scénarios CUDA/Intel. Les premières campagnes utilisaient b11721 ; le déploiement suivant et sa calibration utilisaient b11823. Ces chiffres ne sont ni des promesses pour DSpark ni des mesures du dernier arbre source ; les gains de scénarios différents ne s’additionnent pas.

| Priorité | ID | Amélioration possible | Preuve disponible | État |
| --- | --- | --- | --- | --- |
| 1 | M02 | Charger les modèles hors du verrou global du registre | A déjà prêt : premier token à 37 ms normalement, 930 ms pendant le chargement de B | Implémenté : 930 → 34 ms pendant B ; contrôles natifs réussis |
| 2 | M03 | Choisir batch/microbatch selon le modèle, le GPU et la mémoire disponible | À 8 192 tokens : 512/512 → 2 048/2 048 réduit le TTFT de 15,2 %, avec +282 MiB observés | Profil mesuré volontaire + repli manuel ; UI réelle testée ; hydratation des modes corrigée |
| 3 | M01 | Garder plusieurs conversations récentes dans des slots résidents, avec repli disque | À 8 192 tokens : 20 ms en mémoire, 187 ms via disque, 1 586 ms par recalcul | Affinité bornée et repli disque ; 219 → 43 ms avec deux slots |
| 4 | M04 | Réserver la spéculation n-gramme aux usages qui en bénéficient | Copie répétitive : 128 → 430 tokens/s ; pas de gain clair en prose/code | Option texte répétitif ; désactivée par défaut |

Les validations finales incluaient mémoire contrainte, hydratation des options, plusieurs profils GPU/modèles et tâches réelles. Le batch 2 048 n’est pas universel ; la spéculation n-gramme n’a pas de bénéfice général démontré en prose/code. La calibration b11823 relevait −13,8 % de TTFT à 8 192 tokens en 2 048/2 048 contre 512/512 sur Tron Q6/f16, sans extrapolation au profil long bf16.

Les mesures de copies de chaînes/streaming n’ont pas justifié d’optimisation de production. Les sept contrôles Spark-X2.6-4B du 23 octobre validaient certains comportements dans l’application installée de cette époque, sans remplir le contexte configuré de 68 192 tokens. [Relevé intégral et liens de preuves](https://github.com/TRON-ABS/Novera/blob/0765c3b1766ccb52905f876ef149e55e260c4b50/SUIVI_MOTEUR.md).

<a id="windows-fixes"></a>

## Les 35 corrections Windows intégrées

Numéros historiques de contributions ; ils ne sont pas des PR encore ouvertes dans Novera.

| PR historique | Correction |
| --- | --- |
| #9365 | fix(tables): preserve literal code whitespace in exported cells |
| #9364 | fix(markdown): preserve fenced and inline code during math normalization |
| #9341 | fix(attachments): reserve context for already prepared inline documents |
| #9340 | fix(mcp): normalize image data URLs before encoding tool results |
| #9330 | fix(settings): serialize backend operations before deduplicating writes |
| #9380 | fix(chat): filter named SSE events after sampling retries |
| #9379 | fix(chat): preserve SSE responses across mixed line endings |
| #9378 | fix(assistants): preserve state when deletion fails |
| #9377 | fix(projects): await dialog saves and retain failed drafts |
| #9376 | fix(providers): isolate runtime engine discovery failures |
| #9375 | fix(projects): preserve saved projects when storage operations fail |
| #9373 | fix(chat): keep live stream statistics with their originating thread |
| #9372 | fix(chat): report history read failures and allow retry |
| #9371 | fix(settings): protect saved preferences after hydration read failures |
| #9369 | fix(chat): retain attachment drafts while a turn is running |
| #9368 | fix(threads): preserve selected model when removing an assistant |
| #9367 | fix(threads): preserve new chat drafts when creation fails |
| #9366 | fix(threads): preserve conversations when deletion fails |
| #9345 | fix(memory): serialize concurrent Remember saves per data folder |
| #9343 | fix(code): render escaped plain text when syntax highlighting fails |
| #9342 | fix(preview): keep Storage properties and methods in sync |
| #9339 | fix(chat): preserve manual titles when background generation finishes late |
| #9338 | fix(tools): isolate pending approvals by owning thread and call |
| #9337 | fix(attachments): queue concurrent ingestion choices without stranding callers |
| #9336 | fix(models): scope deletion records and cache updates by provider |
| #9335 | fix(models): keep individual deletions retryable on filesystem failure |
| #9334 | fix(code): ignore obsolete asynchronous highlighting results |
| #9333 | fix(chat): protect drafts from arrow-key history navigation |
| #9332 | fix(favorites): isolate models by provider and migrate unique legacy owners |
| #9331 | fix(chat): generate titles with the owning thread model |
| #9329 | fix(models): keep failed bulk deletions visible and retryable |
| #9328 | fix(chat): let disabled shell calls receive a refusal and continue |
| #9327 | fix(chat): activate remote auto compact without a manual context limit |
| #9326 | fix(chat): preserve branch metadata and order message persistence |
| #9325 | fix(agent): deduplicate MCP tool definitions consistently with routing |

Le packaging #9302 est une intégration d’outillage supplémentaire, distincte de ces 35 corrections. La correction Linux #9346 reste à examiner ; les essais exhaustifs en fonctionnement restent dans [la feuille de route](../ROADMAP.md).
