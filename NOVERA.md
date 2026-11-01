# Novera — instructions du projet

## Compilations sur GitHub autorisées — 1er novembre 2026

Point de contrôle : Web corrigé et compilé (`307fbb16`), premier lancement navigateur/fournisseurs vérifié sans clé ni modèle ; trois CLI Windows/Linux/macOS compilées (`7cced48a`), commande d’aide et architectures/empreintes contrôlées. Les applications natives sont encore en compilation/validation ; suivre le tableau des onze variantes dans `docs/CI_DISTRIBUTIONS.md`, qui conserve le run et le commit propres à chaque candidat. Les notices TRON-ABS ne remplacent pas une signature cryptographique de production.

Activation distante autorisée explicitement puis appliquée : **37 anciens workflows désactivés**, seul le nouveau workflow manuel actif. [Premier run `target=all`](https://github.com/TRON-ABS/Novera/actions/runs/41272733352), commit `3f072579`. Les résultats effectifs sont suivis dans `docs/CI_DISTRIBUTIONS.md` ; ne pas annoncer toutes les plateformes compilées avant leur réussite.

Le mainteneur demande maintenant les **onze variantes sur GitHub Actions**, et confirme Linux, Android, iOS et macOS. Cette demande remplace les restrictions historiques de préparation sans CI ci-dessous. Le workflow manuel Novera conserve des candidats propres avec empreintes, provenance et signature TRON-ABS ; les résultats ne doivent pas être confondus avec une release signée ou une validation sur appareil. [Périmètre, contrôles et résultats CI](docs/CI_DISTRIBUTIONS.md). Les données et discussions du PC ne sont jamais utilisées comme entrées de compilation.

## Paquets Windows propres et vitrine publiée — 1er novembre 2026

Le mainteneur autorise désormais la préparation **desktop, portable et installateur Windows** depuis son desktop testé, sans discussions ni données personnelles incluses. Les sources et la nouvelle capture sont publiées sur **main** ; les vitrines anglais/français portent le message souhaitant une belle aventure et la signature TRON-ABS. Les notes plus anciennes ci-dessous décrivent leur état au moment de rédaction.

Voir le [résultat de préparation, les empreintes et les limites avant release publique](docs/DISTRIBUTION_WINDOWS_2026-11-01.md). Les paquets restent des candidats locaux non signés ; aucun binaire de release publique ni tag n’est publié, et Actions reste désactivé. Les données présentes sur le PC sont conservées.

## Retour du mainteneur et publication sur main — 1er novembre 2026

Le mainteneur confirme **« tout marche bien »** et fournit une nouvelle capture réelle du desktop montrant une image créée et les commandes du tableau de bord. Il demande explicitement la publication des sources sur **main**, la mise à jour de la vitrine et la signature **TRON-ABS — The art of Human with AI** en bas des README anglais/français.

Ce retour est une validation manuelle déclarée du desktop utilisé, sans relevé détaillé par moteur, profil ou scénario. Il ne remplace pas les essais propres aux profils CUDA/ExLlama/GenAI, aux installations sur PC neuf, au mobile ou à chaque autre système. Aucun nouveau binaire, portable, tag ou release n’est publié par cette mise à jour ; Actions n’est pas activé. L’embarquement Python/PyTorch dans l’EXE reste reporté.

La capture originale est conservée sans retouche sous `.github/assets/novera-dashboard-2026-11-01.png`. Les attributions et licences existantes restent présentes. Les éléments publiés, vérifications et identifiant du commit sont consignés dans les résultats de publication de ce lot.

## Composants privés dans Configurations — 1er novembre 2026

Implémentation locale dans les sources Windows x64 : **dix profils facultatifs** gérés avec le `uv` embarqué. Configurations présente matériel, profils conseillés, budgets estimés de téléchargement/espace libre, confirmation, étapes, annulation, vérification, réparation, sélection, mise à jour d'un verrou devenu ancien, restauration de la génération précédente du même catalogue et désinstallation. Aucune installation ne démarre à l'ouverture. Le mobile ne reçoit pas les piles Python/PyTorch desktop ; les fonctions cloud restent indépendantes.

Les profils standards utilisent **Python 3.12.12**, PyTorch **2.14.1 CPU ou CUDA 13.0** selon le profil ; ExLlama reste isolé avec PyTorch **2.9.0 / CUDA 12.8**. Les dix verrous Windows x64 épinglent les dépendances indirectes et leurs empreintes. Python 3.15.1 et les chemins personnalisés existants restent utilisables comme overrides avancés ; aucun Python global, PATH, modèle ou conversation n'est modifié. L'embarquement de Python/PyTorch dans le `.exe` a été **reporté explicitement par le mainteneur**.

Les sondes/imports/chargements Transformers et ONNX, les médias, la conversion NVFP4, l'export vidéo et l'upscale utilisent le résolveur natif. Le défaut `python` désigne désormais le profil géré ; aucun repli silencieux vers le Python système. Les chemins techniques sont regroupés dans les options avancées. Une réparation conserve le choix d'un autre profil. Les opérations de maintenance refusent les moteurs locaux encore chargés ou générations en cours, sans les arrêter de force.

Vérifications : suite Rust **1 161 réussis / 5 optionnels ignorés**, puis tests ciblés du gestionnaire ; **trois intégrations réelles** en environnements temporaires privés (export vidéo, graphe ONNX numérique et génération CPU sur un Llama synthétique non entraîné). Le cycle vidéo couvre réparation, restauration, annulation, échec sans remplacement de l'environnement actif et conservation d'un fichier utilisateur. Interface vérifiée à 360 px, français/allemand/arabe RTL ; contrôles des **80 × 2 429 clés** sans erreur. Tests web Windows : **174 réussis / 1 scénario non-Windows ignoré**, 12 fichiers ; TypeScript et lint ciblé sans erreur (deux avertissements de hooks existants dans CreationControls). Python ciblé : **17 réussis**. Voir le [suivi détaillé](docs/REPRISE_COMPOSANTS_GERES_80_LANGUES.md).

Aucune compilation de Novera Desktop, modification de binaire installé, publication ou activation d'Actions. Les profils CUDA/ExLlama, GenAI et médias complets restent à valider par installation/génération réelle ; Linux/macOS ne sont pas annoncés prêts par ces essais Windows. Le mainteneur garde la compilation et les essais du nouveau desktop, puis le portable depuis ce runtime exact.

## RAM réservée et génération musique — 1er novembre 2026

Le mainteneur signale le refus « variante plus légère / contexte plus court » pour la musique. Son état matériel persistant indique Windows, **15 789 Mio de RAM utilisable**, GPU de 8 151 Mio notamment. Le seuil strict de 16 384 Mio bloquait la musique avant démarrage natif sur ce PC nominal 16 Gio. Les paliers de capacité RAM totale admettent désormais **5 % de mémoire réservée au matériel** ; la RAM disponible, les budgets de pack et contrôles natifs ne sont pas gonflés. Test du profil réel et du lancement musique avec ce profil : **106 tests réussis / 6 fichiers**. La génération matérielle réelle et le prochain binaire restent à vérifier ; aucun modèle ou paramètre utilisateur modifié.

## Accès direct aux modes média rétabli — 1er novembre 2026

Le mainteneur confirme avoir recompilé et testé le desktop, puis signale l'absence des boutons Musique/Vidéo ; saisir une intention dans Auto faisait apparaître les réglages. Cause : le filtre matériel masquait les modes sans moteur local admis ni sélection cloud préexistante. Les boutons Image/Musique/Vidéo restent désormais visibles avant toute configuration, avec accès direct aux réglages sans prompt. Les gardes de génération locale, les choix cloud et le blocage pendant une génération restent appliqués. **103 tests réussis dans 6 fichiers**, dont régressions desktop limité musique/vidéo sans prompt et accès mobile avant choix cloud ; TypeScript réussi. Aucun nouveau texte, donc mêmes libellés dans les 80 langues. Ce correctif nécessite un nouveau binaire ; aucune compilation lancée par l'agent.

## Prochaine discussion : composants gérés et 80 langues

Le mainteneur demande un plan complet avant une reprise dans un nouveau chat : retirer les chemins techniques du parcours novice, gérer les environnements et installations depuis Configurations, migrer les préférences existantes, et traiter les textes nouveaux ou corrigés dans les **80 langues au cours du même chantier**. Lire [le document de reprise complet](docs/REPRISE_COMPOSANTS_GERES_80_LANGUES.md) : périmètre, profils, installation/réparation, migration, cloud, plateformes, tests et message de reprise. Le plan initial a depuis été mis en œuvre pour les profils Windows x64 décrits en tête de ce fichier ; les validations restantes y sont distinguées. Le mainteneur conserve la compilation desktop, puis essais avant préparation du portable.

## Clang détecté au lancement desktop — 1er novembre 2026

Échec réel du build desktop à `engine-toolchain` : Clang est installé sous `C:/msys64/mingw64/bin`, absent du PATH hérité par le double-clic. La préparation du moteur conserve un Clang déjà présent ou cherche LLVM, les outils LLVM de Visual Studio puis MSYS2. Le dossier trouvé est ajouté en fin de PATH pour préserver le linker MSVC ; le build Rust fixe déjà explicitement la cible MSVC. Aucune installation ni modification persistante de l'environnement. **24 assertions de préparation réussies**, dont découverte hors PATH avec espaces et priorité MSVC ; contrôle Bash réel réussi après initialisation MSVC. Seul avertissement restant de ce contrôle : cache de compilation absent. Aucun build applicatif lancé ; le mainteneur relance son BAT desktop.

## Version dans le panneau latéral — 1er novembre 2026

L'en-tête affiche `Novera {VERSION}` (actuellement **Novera 1.0.0**) depuis la constante Vite déjà liée à `web-app/package.json`. Chaque nouvelle compilation reprend la version déclarée, sans numéro codé en dur ni requête distante. Le texte peut être tronqué pour une version longue, avec intitulé complet au survol et bouton de réduction préservé. Les règles existantes de masquage pour les contrôles natifs à gauche restent appliquées. Sept tests existants du panneau latéral réussis ; compilation desktop laissée au mainteneur.

## Maintenance et diagnostics de release — 1er novembre 2026

À la demande du mainteneur, instrumentation des erreurs interceptées (texte, chargement, téléchargements/validation, mémoire, image/musique/vidéo, sauvegarde cloud, frontière React, OOM et arrêt détecté du worker). Collecteur sans messages bruts, conversations, clés, modèles ou chemins personnels ; champs bornés, identifiant de session en mémoire, répétitions comptées jusqu'à 60/minute avec compteurs de pertes, timeout 10 s et retrait immédiat. Consentement indépendant **v2** demandé pour le schéma enrichi ; les libellés réutilisent les 80 langues existantes.

Le BAT source et la copie utilisée à côté du dépôt préparent désormais les diagnostics facultatifs et les maps privées pour la prochaine compilation, sans compiler ici. Build ID propre, commit et état des sources pour distinguer les variantes locales. Les maps JS/CSS sont retirées du frontend distribué, conservées sous `.build/monitoring-symbols/<build_id>` et contrôlées avant l'envoi privé au projet PostHog EU 319433.

**616 tests réussis / 32 fichiers, 1 scénario ignoré**, 4 tests de symboles dont un build Vite de fixture, TypeScript, architecture, lint ciblé, 16 assertions de configuration, 69 du lanceur et `cargo check` du plugin sans features par défaut réussis. Aucun nouveau binaire applicatif ni CI distante. Test synthétique visible dans PostHog : [issue de validation](https://eu.posthog.com/project/319433/error-tracking/01a19487-c02b-73c1-8566-e158a3a069d6).

**Alerte de tendance e-mail activée** au compte PostHog TRON ABS : contrôle horaire, seuil > 0, Novera production uniquement, tests exclus. État actif et première évaluation vérifiés ; réception du test e-mail confirmée par le mainteneur le 1er novembre 2026. Les règles spécialisées nouvelles issues/réouvertures/pics ne sont pas activées. Restent la clé CLI privée et l'envoi des symboles de la prochaine release, puis l'essai du nouveau binaire compilé par le mainteneur avec consentement. [Procédure et limites](docs/MAINTENANCE.md).

## Configuration automatique légère et cloud — 1er novembre 2026

Le mainteneur confirme les essais **desktop et portable réussis** avant cette évolution. Les sources de Novera · Configurations recommandent désormais LFM3-1.7B Q4_K_M, ou LFM3-Omni-2B Q4_K_M avec projecteur épinglé quand le profil léger dispose de 8 Gio RAM totale, 4 Gio disponibles et d'un moteur identifiable ≥ b11960. Le profil léger couvre le mobile, les faibles capacités et le matériel inconnu ; contexte de 2 048 tokens appliqué uniquement au modèle recommandé explicitement choisi. Aucun téléchargement automatique ou changement des autres modèles à l'ouverture.

Les restrictions portent sur les générations **locales** ; les trois sorties **cloud image, musique et vidéo restent accessibles**, y compris sur mobile. Auto est également contrôlé avant exécution locale. Les budgets sont conservateurs, pas des mesures matérielles ; le pack complet Windows exige une capacité connue et une réserve disponible. Les libellés existants sont réutilisés dans les 80 langues, sans nouvelles clés. **469 tests réussis / 21 fichiers, 1 scénario non-Windows ignoré**, TypeScript et architecture réussis, 80 × 2 412 clés sans erreur. Vérification des nouveaux profils sur appareils, voix Omni et nouveaux binaires encore à faire. [Suivi et seuils](docs/SUIVI_VALIDATION_DISTRIBUTIONS.md).

## Validation avant distributions — 1er novembre 2026

Le mainteneur a compilé la **version desktop Windows** et confirme les essais desktop puis portable réussis. Release confirmée par le journal et le reçu de `.build/launcher-desktop-2026-11-01_00-20-48-287`. À sa demande, portable préparé sans recompilation depuis ce runtime : `deliverables/Novera-portable-1.0.0-2026-11-01/Novera_1.0.0_x64-portable.zip`. Tests du packager : 223 assertions / 12 scénarios réussis ; 95 entrées du ZIP, empreintes et correspondance de l'exécutable desktop vérifiées. Consigner les résultats, anomalies et reprises dans [le suivi de validation des distributions](docs/SUIVI_VALIDATION_DISTRIBUTIONS.md). Ces binaires précèdent les nouveaux profils légers. Les autres compilations ne sont pas lancées à ce stade. Contrôle des définitions des 11 variantes réussi et 9 tests du contrôle de distribution réussis.

## Attente mémoire entre générations — 1er novembre 2026

Incident confirmé dans le journal local : lors de la deuxième image, le déchargement de Nemotron renvoyait le refus explicite du routeur llama.cpp `409 Conflict`, « the model has requests in flight; retry once they finish ». Le coordinateur transformait cette occupation transitoire en échec de génération multimédia.

Le mode Automatique attend désormais la fin de cette requête native, avec nouvelle tentative espacée de 250 ms et annulation possible. Il reconnaît uniquement ce refus précis ; les erreurs de configuration, connexion ou autres déchargements restent des échecs visibles. Il accepte aussi un modèle déjà libéré pendant l’attente. Pas d’arrêt forcé d’une génération active ni de passage automatique en Manuel.

Contrôle commun texte/image/musique/vidéo : deux demandes successives par catégorie, protection du texte actif, attente de publication média, annulation puis reprise, erreur réelle après occupation et modes manuel/automatique. **240 tests web dans 16 fichiers réussis**, TypeScript, architecture et lint ciblé réussis. Le contrôle cloud distingue les 42 profils cloud du serveur local optionnel TabbyAPI. Aucun nouveau texte utilisateur ni changement des 80 catalogues (2 412 clés chacun).

Validation des sources et contrats avec moteur simulé ; le journal confirme le refus natif réel. Aucun nouvel essai de génération matérielle ou de l’application installée, compilation desktop ou binaire public pour ce correctif. L’application existante nécessite une prochaine compilation intégrant ce changement.

## Publication des sources et de la vitrine — 31 octobre 2026

Demande explicite de mise à jour directement sur `main` : lot ONNX, tri récent adapté au matériel, LoRA/PEFT, FP8/NVFP4 LLM et correction des tests Tauri Windows. README anglais/français, À propos GitHub, guides moteurs, rapports et suivi TokenEconomizer actualisés ensemble. Actions reste désactivé ; aucun nouveau binaire public. Les huit nouveaux textes PEFT sont traduits dans les 80 locales ; inventaire à 2 412 clés par langue et contrôle structurel sans erreur. Traductions assistées avec corrections ciblées, sans prétendre à une relecture native complète. Autres travaux locaux préservés. Dernier relevé TokenEconomizer : 3 sessions consolidées, 9,3 M tokens effectifs, 0 surcoût, 0 fait injecté, 0 redirection ; aucune économie prouvée.

## Safetensors FP8 / NVFP4 pour les LLM — 31 octobre 2026

Demande explicite : exploiter les exports quantifiés adaptés au GPU avec validation des architectures et des kernels ; le chemin NVFP4 image ne suffit pas. Les sources du fournisseur Safetensors disposent d’un chargeur CUDA distinct pour **ModelOpt FP8 par tenseur et NVFP4 bloc 16**, sur **Llama, Qwen2 et Qwen3 denses ForCausalLM**. Conserver les poids quantifiés compacts, lire la configuration inline ou `hf_quant_config.json`, contrôler tous les tenseurs/projections/échelles et les conflits de métadonnées. Vérifier une GEMM numérique réelle en préremplissage et décodage, puis un passage préremplissage + cache sur le modèle chargé avant disponibilité. Ne pas utiliser de repli silencieux CPU ou de cache de poids BF16. Les embeddings, normalisations et tête non quantifiés restent BF16.

Le Hub propose **FP8 · LLM** et **NVFP4 · LLM** ; sa sonde doit confirmer les kernels exécutés. Les métadonnées ModelOpt distantes sont des JSON publics bornés et épinglés à une révision ; une lecture impossible ou incohérente reste non prise en charge. Conditions minimales de sélection : NVIDIA CUDA, SM ≥ 8.9 pour FP8 ou ≥ 10.0 pour NVFP4, sous réserve de la sonde réelle. Dimensions actuellement alignées sur 16 (FP8) ou 128 (NVFP4). Exclure les FP8 par blocs, formats compressed-tensors, variantes mixtes, MoE/hybrides/multimodales, caches KV quantifiés et adaptateurs sur ces bases. La matrice vLLM sert de référence de formats ; ce lot n’installe pas vLLM.

**Validation réelle RTX 5070 Laptop / SM120** : les six combinaisons famille/format génèrent sur CUDA, plus un cas Qwen3 à embeddings liés ; poids NVFP4 découpés, JSON/SSE, authentification, reprise après erreur et arrêt du worker vérifiés. Parcours natifs Tauri FP8 et NVFP4 réussis ; **1 154 tests Tauri réussis, 0 échec, 2 intégrations optionnelles ignorées**. **220 tests web**, **33 tests Python réussis / 9 optionnels ignorés**, TypeScript, architecture et lint ciblé réussis. Fixtures non entraînées créées hors ligne : aucune preuve de qualité sur des modèles utiles ni de gain de vitesse, aucun poids préentraîné téléchargé et aucune application installée mise à jour pour ce lot.

[Installation, formats et limites](transformers-server/README.md#modelopt-fp8-and-nvfp4-llms) · [Mesures et commandes](deliverables/llm-float-2026-10-31/validation.md). Actualiser les MD et le suivi TokenEconomizer à la fin des travaux, sans assimiler ses tokens effectifs à une économie ou au quota de l’abonnement.


## ONNX et modèles récents adaptés au matériel — 31 octobre 2026

Demande du mainteneur : ajouter un moteur général pour les exports ONNX compatibles, notamment les petites tâches spécialisées, et proposer ONNX dans le filtre des moteurs du Hub. Les sources desktop intègrent désormais ONNX Runtime : import local validé de dossiers complets, graphes numériques/booléens via tenseurs JSON et exports texte préparés pour ONNX Runtime GenAI. Réutiliser le cycle local, le transport authentifié, le streaming et l’arrêt ; conserver les poids lors du retrait de l’enregistrement. Les pré/post-traitements spécialisés restent à fournir par l’appelant. Ne pas présenter tout fichier `.onnx` comme un pipeline conversationnel ou multimodal utilisable directement. Le Hub interroge les exports ONNX et conduit à l’import local ; pas de téléchargement automatique de bundles arbitraires.

Le tri **adapté au matériel**, conservé par défaut, favorise automatiquement les sorties récentes **à compatibilité et mémoire disponible équivalentes**, avant l’éditeur, la sélection épinglée et la taille. Une simple édition récente d’un ancien dépôt ne remplace pas sa date de création connue. Ne pas remplacer automatiquement les modèles déjà installés.

Validation du lot : **155 tests web**, **9 tests Python**, **2 tests Rust isolés**, TypeScript et architecture réussis. Inférence CPU réelle sur petits graphes ; GenAI testé avec un décodeur synthétique, sans preuve de qualité d’un modèle entraîné, de cache KV réaliste ou de performance CUDA. [Installation et limites](onnx-server/README.md), [rapport ONNX](deliverables/onnx-2026-10-31/validation.md).

## Tests Tauri Windows débloqués — 31 octobre 2026

Le blocage `STATUS_ENTRYPOINT_NOT_FOUND (0xc0000139)` venait du manifeste Common Controls v6 absent du binaire de tests de la bibliothèque : l’ancienne `comctl32.dll` n’exporte pas `TaskDialogIndirect`. Réutiliser la ressource compilée par Tauri, liée aux tests uniquement sous Windows/MSVC avec `tauri-app`, et conserver sa liaison unique au binaire normal. Un test de régression résout la fonction sans ouvrir de fenêtre.

Résultats locaux finaux : **1 153 tests Tauri réussis, aucun échec, 2 tests optionnels ignorés** ; les **2 tests ONNX avec le véritable environnement Tauri passent séparément**, dont import, chargement, inférence HTTP authentifiée, déchargement et conservation des poids. Deux anciennes fixtures ont été corrigées : nom du skill intégré Novera et création portable d’un fichier témoin au lieu de `touch`. Les assertions d’autorisation des outils restent conservées.

La **compilation desktop debug Windows réussit**, et son manifeste v6 a été vérifié. Il s’agit d’une compilation de validation sous `src-tauri/target/debug`, sans installation, publication de binaire, validation de l’interface graphique ni changement du build distribué. [Diagnostic, commandes et preuves](deliverables/tauri-windows-tests-2026-10-31/validation.md). La correction lève la limitation DLL précédemment signalée pour ONNX.

## Suivi TokenEconomizer — 1er novembre 2026

Relevé après le correctif Clang et la mise à jour documentaire : **4 sessions consolidées, 13,9 M tokens effectifs, 91,1 k de surcoût plugin (0,7 %)** ; 0 fait injecté, 0 exclusion, 0 redirection, enveloppe de 80 appels / 24 tours terminés sans erreur observés. Historique exact dans le suivi dédié, sans économie démontrée.

Dernier relevé après le lot maintenance : **4 sessions consolidées, 13,9 M tokens effectifs, 55,1 k de surcoût plugin (0,4 %)** ; catalogue des capacités observé sur une session / 32 prompts, aucune exclusion proposée ou appliquée, aucun fait injecté ni redirection. Enveloppe de 65 appels / 18 tours terminés sans erreur observés. Relevé exact conservé dans le MD dédié ; aucun gain démontré.

Demande explicite : tenir le mainteneur informé des statistiques à la fin des travaux et actualiser [le suivi TokenEconomizer](docs/TOKENECONOMIZER.md). Dernier relevé pendant le lot profils légers : **3 sessions consolidées, 9,3 M tokens effectifs, 12,1 k tokens de surcoût plugin (0,1 %), 0 fait injecté, 0 redirection et 0 notification de boucle persistante** ; enveloppe de 43 appels d'outils, 16 tours terminés sans erreur observés et 6 tours recensés. Réglages : `microskills=envfacts`, `toolprune=auto`, `loopguard=nudge`, `repomap=off`. Activation demandée par l'utilisateur pour ce dépôt seulement ; aucun outil encore écarté ou proposé, aucun catalogue disponible. `toolprune restore` permet de restaurer les capacités écartées à la prochaine session ; elles ne seront plus exclues automatiquement.

Ce cumul ne mesure pas le coût isolé de cette tâche, les tokens économisés ou le quota hebdomadaire ChatGPT. Ne pas annoncer de gain démontré sans comparaison. La correction Tauri et ses tests ne prouvent pas que TokenEconomizer a contribué à la résolution. Conserver dans son MD les relevés exacts, leur contexte et leurs limites.


## Sélecteur de modèle unique dans le tableau de bord — 29 octobre 2026

Demande explicite avec les deux captures : déplacer le sélecteur complet du haut à la place du petit bouton de modèle du tableau de bord, en conservant le style compact de celui du bas, le petit engrenage et le voyant d’évaluation matériel original. Supprimer le doublon du haut sur l’accueil, les conversations et les projets. Garder un seul choix dans ces vues. Ouvrir la liste vers le haut et afficher le modèle réellement sélectionné (ou la sélection média de la tâche active), sans remplacer le voyant estimatif par un vert forcé.

Ordre demandé : modèles locaux en premier avec l’accès aux paramètres des moteurs locaux, puis modèles cloud regroupés **Texte → Image → Musique → Vidéo**. Garder les filtres, la recherche et les choix de fournisseurs. Les profils musicaux locaux et les modèles cloud audio sont sélectionnables sans changer le modèle de conversation. Une clé cloud manquante ouvre les paramètres du fournisseur au-dessus du tableau de bord. Le petit engrenage affiche exactement **Paramètres du modèle** en français, traduit via une clé courte dans les 80 langues, sans nom de modèle dans l’infobulle. Le titre de sa fenêtre garde le nom du modèle. Inventaire : 2 402 clés par langue.

## Paramètres du modèle : fenêtre Novera au-dessus du tableau de bord — 29 octobre 2026

Demande explicite à partir de la capture Nemotron : appliquer le style Novera à **Paramètres du modèle** et ouvrir aussi cette fenêtre au-dessus du tableau de bord. Remplacer le volet latéral par la même fenêtre non bloquante, avec fond bleu nuit, cadre cyan/violet, sections arrondies et curseurs/interrupteurs/champs assortis. Garder la saisie et les petits boutons visibles et utilisables. Un propriétaire global unique conserve la fenêtre quand le menu de modèles d’origine se ferme ; changer de panneau la remplace. Lire les dernières valeurs du modèle depuis le fournisseur et conserver tous les réglages, temporisations de sauvegarde et actions existantes. Réutiliser les libellés déjà traduits dans les 80 langues.

## Fenêtres Novera au-dessus du tableau de bord — 29 octobre 2026

Fonctionnement explicitement approuvé : ouvrir Modèles, Configuration, Recherche et la confirmation de Nouveau projet dans une fenêtre Novera **au-dessus** du tableau de bord, sans le recouvrir, avec la saisie et les quatre petits boutons toujours visibles et utilisables. Un seul panneau à la fois ; un autre bouton remplace celui qui est ouvert. Cadre cyan/violet arrondi et fond bleu nuit en thème sombre, équivalent clair, hauteur bornée avec défilement. Suivre la position et la taille réelles du tableau de bord et la fenêtre ; aucun voile bloquant derrière ces panneaux.

Réutiliser toutes les pages existantes de Modèles et Configuration et leurs sous-pages dans une navigation interne indépendante, sans remplacer la conversation ni sa saisie. Choisir un modèle applique le choix à la conversation et referme le panneau. Rechercher puis choisir une conversation garde le parcours normal. Nouveau projet conserve le sélecteur de dossier Windows (apparence système), puis une confirmation Novera explicite avec lecture seule par défaut. Changer de panneau abandonne la sélection de projet en attente sans accorder d’accès. Les autres fenêtres modales de l’application conservent leur comportement ; aucune autorisation d’accès ni validation sensible n’est supprimée.

## Navigation intégrée autour de la saisie — 29 octobre 2026

Disposition explicitement validée : entre le cadre extérieur du tableau de bord et le cadre de saisie, deux boutons superposés à gauche, **Recherche puis Nouveau projet**, et deux à droite, **Modèles puis Configuration**. Garder Nouvelle discussion et Envoyer/Arrêter dans leurs zones actuelles, sans superposer les nouvelles commandes au texte. Reprendre le style Novera, les noms accessibles et les infobulles déjà traduites dans les 80 langues.

Retirer ces quatre accès de la barre latérale, y compris Configuration côté Cowork. Le raccourci Configuration du nouveau rail ouvre la page générale existante ; le réglage de création dans la rangée basse conserve son rôle distinct. Nouveau projet garde le sélecteur de dossier et l’approbation d’accès, avec lecture seule par défaut, et non la création silencieuse d’un dossier ou une autorisation d’écriture. Recherche et les fenêtres de projet ont un propriétaire global unique, indépendant des montages du tableau de bord et de la barre latérale, pour préserver les raccourcis clavier et le parcours existant.

## Unités des durées dans les 80 langues — 29 octobre 2026

Correction demandée après capture « A travaillé pour 21 » : les durées doivent toujours porter leur unité (secondes, minutes, heures), dans les 80 langues. Corriger les unités absentes et les traductions de minutes confondues avec des mètres ; en français afficher par exemple `21 s`, `1 min 30 s`, `1 h 20 min`. Garder les durées réellement mesurées et le format compact existant. Vérifier les unités distinctes et non vides dans les 80 catalogues réels, en complément des tests avec traductions simulées. Aucun changement du calcul ni compilation applicative dans ce lot.

## Compilation locale sur 8 tâches — 29 octobre 2026

Demande explicite du mainteneur : passer le lanceur `Compiler-Novera.bat` à huit tâches de compilation Rust en parallèle. Le BAT du dossier parent appelle `scripts/distribution/build-novera-local.ps1`, qui fixe désormais `CARGO_BUILD_JOBS=8` au lieu de 4. Il s’agit du parallélisme Cargo, pas d’une affinité CPU ni d’une modification du nombre de threads d’inférence. Aucune compilation déclenchée par ce réglage.

## Cadre des réponses du modèle — 29 octobre 2026

Style explicitement validé : donner aux réponses du modèle leur propre cadre arrondi à bordure cyan bien visible et fond bleu ardoise, distinct des messages utilisateur bleu nuit/indigo à droite. Adapter le fond au thème clair. Conserver le même cadre fixe pendant la rédaction et après la réponse, avec espace intérieur pour texte, listes, code et contenu multimédia, sans animation. Un seul cadre regroupe les parties d’une réponse ; les actions restent disponibles. Aucune modification des messages utilisateur ni nouveau libellé à traduire. Compilation applicative à réaliser par le mainteneur.

## Doubles cercles des boutons — 29 octobre 2026

Disposition explicitement validée : anneaux concentriques autour des boutons Envoyer et Nouvelle discussion, sans déplacer leurs zones réservées. Correction explicite du mainteneur après essai : les couleurs indiquent si une réponse est en cours, pas si la saisie est prête à envoyer. Au repos, les deux anneaux sont verts, même avant le premier envoi, avec une saisie vide ou une pièce jointe en préparation. De la soumission jusqu’à la fin de la réponse ou des outils, Envoyer est rouge et Nouvelle discussion jaune. Revenir au vert/vert lorsque le tour se termine ou s’arrête. Conserver les verrouillages du bouton Envoyer, le carré Arrêter et les actions existantes. Les anneaux restent fixes, visibles quand Envoyer est désactivé, sans halo animé ni nouveau texte à traduire.

## Infobulle Envoyer — 29 octobre 2026

Correction explicitement approuvée : afficher uniquement **Envoyer**, traduit dans les 80 langues, au survol du bouton d’envoi, y compris lorsqu’il est désactivé. Employer la clé dédiée `chat:send` pour cette infobulle ; conserver le nom accessible et les autres usages de `chat:sendMessage`. Le déclencheur englobe le bouton désactivé sans changer son verrouillage, son action ou son apparence. Aucun changement du bouton Arrêter ni compilation applicative dans ce lot.

## Direction finale : tout autour du tableau de bord — 29 octobre 2026

Objectif explicite pour les prochaines améliorations : **rendre toutes les fonctions accessibles dans le tableau de bord ou juste à côté, puis supprimer le panneau latéral permanent**. Cela inclut conversations et historique, recherche, projets, fichiers, modèles, configurations, téléchargements et outils. Préserver chaque possibilité pendant son déplacement ; ne pas supprimer un accès tant que son remplacement n’est pas disponible et validé.

Cette direction est un objectif futur, pas une autorisation de réorganisation immédiate. Avancer progressivement : une proposition concrète, la validation explicite du mainteneur, puis ce seul changement. Conserver la compacité, les 80 langues, l’accessibilité et l’adaptation aux tailles d’écran. Ne pas imposer dès maintenant une nouvelle maquette ou retirer le panneau latéral.

## Validation progressive du tableau de bord — règle du 29 octobre 2026

Dernière demande explicite : retirer **toutes** les icônes Téléchargements de l’en-tête et du panneau latéral, même dans Configurations. L’ancien masquage conditionnel ne suffit plus. Garder uniquement le déclencheur du tableau de bord et un gestionnaire de notifications sans interface à la racine de la fenêtre principale. Déplacer aussi **Nouvelle discussion** du panneau latéral vers une zone intégrée à gauche de la saisie, symétrique à Envoyer à droite, sans recouvrir le texte. Préserver l’action de nouvelle discussion normale et son raccourci clavier. Ces deux déplacements sont autorisés par cette demande précise, sans autre changement du tableau de bord.

Changement explicitement validé par la demande suivante : pendant la réponse du modèle, conserver le tableau de bord sans assombrissement et sans halo animé. Seul le bouton d’envoi change légèrement de teinte avec le petit carré Arrêter. Conserver les verrouillages des commandes indisponibles ; leur état désactivé ne doit plus atténuer visuellement l’ensemble du tableau de bord.

Changement explicitement demandé ensuite : supprimer le doublon Téléchargements en haut lorsque le raccourci du tableau de bord est présent. Conserver l’accès du haut sur les autres pages et le gestionnaire de notifications actif. Il s’agit uniquement de retirer cette icône dupliquée ; aucune autre réorganisation n’est autorisée par cette demande.

Le mainteneur demande désormais une progression **changement par changement** pour le tableau de bord. Présenter une proposition concrète, avec aperçu ou comparaison compréhensible, puis **attendre sa validation explicite avant de modifier le tableau de bord**. Ne pas regrouper plusieurs nouvelles évolutions sous une seule validation implicite et ne pas passer au changement suivant sans accord. Une proposition ou un objectif général ne vaut pas autorisation de toutes ses étapes. Cette règle concerne aussi les déplacements, dimensions, couleurs, icônes et nouvelles commandes.

Les ajustements expressément demandés avant cette règle sont consignés ci-dessous ; les travaux déjà préparés doivent rester identifiables et vérifiables. Une validation d’interface, une autorisation de fusion, une compilation et une publication de binaire restent des décisions distinctes.

## Préparation des distributions et compteur au démarrage — 29 octobre 2026

Le mainteneur demande de préparer Novera pour une future automatisation, **sans compilation multiplateforme pour le moment**, avec la version **portable Windows** incluse. Le [plan des distributions](docs/PREPARATION_DISTRIBUTIONS.md), son manifeste et le diagnostic de sources couvrent les onze variantes du lanceur. Ne pas activer Actions ou déclencher les anciens workflows sur la base de cette préparation. Les audits mobiles, runtimes par architecture, signatures et essais restent explicitement à terminer.

Le compteur de contexte doit être présent dès l’écran initial lorsqu’un modèle local est sélectionné : afficher un repère d’attente tant que la capacité réelle n’est pas connue, puis le pourcentage mesuré. Ne pas inventer de capacité ou de taux d’occupation. Le petit cercle du pourcentage est une jauge de contexte, pas une animation de téléchargement.

Dernier choix visuel du mainteneur : bouton d’envoi **bleu sombre**, mode Arrêter dans la même palette et **petit carré de 12 px**. Cette demande remplace les propositions rouge/rosé/violet de cet échange. Conserver sa zone réservée dans la saisie, les noms accessibles traduits et le fonctionnement d’arrêt.

La largeur maximale commune est désormais **1 024 px**, avec retour à la ligne sous cette limite. Dans la rangée basse : **Mémoire auto → Réglages → Téléchargements**. Le raccourci de téléchargement consulte le même état partagé, sans doubler les notifications de mise à jour. L’accès global aux téléchargements reste disponible ailleurs dans l’application. L’évolution générale « OVNI » est reportée à la demande du mainteneur ; ne pas l’inclure dans ce lot.

## Règles d’or et information utilisateur — 29 octobre 2026

Les [règles d’or détaillées de Novera](docs/REGLES_D_OR.md) constituent la référence durable pour l’ensemble du produit. Elles incluent explicitement **la qualité des informations fournies aux utilisateurs**, du premier démarrage à l’exécution complète : rôle des modèles et composants, local/cloud, réglages, automatismes, coûts éventuels, résultats, durées conservées, erreurs et solutions.

Toute nouvelle aide visible doit être disponible dans les 80 langues et rester lisible dans le tableau de bord adaptable. Le [guide utilisateur](docs/USER_GUIDE.md) décrit les usages concrets. Les règles distinguent exigences du produit, vérifications effectuées et limites encore à essayer ; les anciennes notes datées ci-dessous restent historiques. Pour le lot en cours, le mainteneur s’occupe de la compilation applicative.

## Téléchargement du Hub vers Documents — correction du 28 octobre 2026

La tentative Qwen3.5-2B Q6_K révélait une incohérence : la destination était bien `Documents/Novera models/Qwen3.5-2B-Q6_K/model.gguf`, mais le gestionnaire natif refusait encore toute sortie du dossier interne de données. Le téléchargement échouait avant l’écriture du modèle avec « outside of Jan data folder ».

Le gestionnaire accepte maintenant le stockage interne existant et, pour un téléchargement portant un identifiant de modèle valide, **le sous-dossier de ce modèle uniquement** sous `Documents/Novera models`. La génération du dossier et sa validation partagent la même règle de nommage. Modèle, projection, fichiers associés et temporaires suivent cette règle. Les chemins des autres modèles, les sorties du dossier autorisé et les jonctions Windows vers un emplacement extérieur restent refusés. Vérifier l’ensemble du lot avant les requêtes réseau ; utiliser la même validation pour le téléchargement et le nettoyage après annulation.

Validation : quatre tests natifs isolés et 17 tests du relais de téléchargement passent ; aucune violation d’architecture. Compilation Windows réussie, worker b11940 et empreintes vérifiés. [Application corrigée](deliverables/Novera-desktop-1.0.0-2026-10-28_04-25-37-548/Novera-Desktop.exe). SHA-256 : `2CF2B8ECAEE094592479A80C50AF30D055977E41C1CCE88CE61CE0A09E1D3479`. Preuves : `.build/download-model-storage/final-artifact.json`. Le parcours réel du Hub démarre Qwen3.5-2B Q6_K sans erreur de chemin ; vérification de fin en cours.


## Rangement des modèles et import automatique — 28 octobre 2026

Build courant : [Novera Windows local](deliverables/Novera-desktop-1.0.0-2026-10-28_03-08-27-045/).

Instruction confirmée : les **prochains téléchargements de modèles** doivent aller par défaut dans **Documents/Novera models/<modèle>/**, avec leurs fichiers associés. Les téléchargements GGUF et MLX utilisent le même emplacement ; les packs image, musique, vidéo et le pack complet gardent un sous-dossier par modèle. Une sélection explicite d’un autre disque reste possible dans le parcours des packs. Les anciens profils et les anciennes installations groupées conservent leurs chemins ; un import manuel conserve le fichier choisi à son emplacement.

État du poste du mainteneur :

| Modèle | Poids |
| --- | --- |
| LFM3 Q6_K | `C:/Users/jmsga/Documents/Novera models/LFM3-1.7B-Q6_K/LFM3-1.7B-Q6_K.gguf` |
| MiniLM embeddings | `C:/Users/jmsga/Documents/Novera models/all-MiniLM-L6-v2/model.gguf` |
| Tron et draft DSpark | **Ne pas déplacer** : `C:/Users/jmsga/Desktop/T/Convertir GGUF/` |

Les petits fichiers d’enregistrement `model.yml` restent dans le dossier de données Novera et pointent vers les poids réels. MiniLM conserve son identifiant et son rôle d’embeddings. Test réel après déplacement : LFM3 termine sa réponse à 32 K de contexte ; MiniLM produit un vecteur de 384 dimensions.

Les recommandations texte déjà présentes sont enregistrées automatiquement par référence après vérification du nom attendu, de la taille et du SHA-256. Chercher le dossier commun en priorité, puis le stockage géré et Téléchargements ; accepter le sous-dossier du modèle. Actualiser le catalogue au chargement du moteur, à l’ouverture de Modèles et au retour dans la fenêtre. Aucun téléchargement silencieux, aucune copie en double, aucun remplacement des paramètres existants ni réimport d’un modèle explicitement supprimé. Les fichiers incomplets ou modifiés ne sont pas importés automatiquement.


## LFM3 et moteur b11940 — état validé du 28 octobre 2026

La compilation locale **Windows x64** de Novera est terminée avec **llama.cpp b11940**, révision `eb7818c0b85c08ccb39ec2299548b85147c47495`, CPU et CUDA 13.4. Le worker du dossier livré annonce la bonne version ; ses empreintes correspondent aux sorties compilées.

**LFM3-1.7B Q6_K** est le choix conseillé dans **Configurations / Texte** et au premier démarrage desktop, **sans modèle draft**. Le fichier officiel de **1 427 638 304 octets** est vérifié par SHA-256, installé dans le dossier de modèles utilisé par Novera et sélectionné dans les réglages enregistrés. Les autres modèles et une sauvegarde des réglages précédents sont conservés. Qwen3 reste l’encodeur FLUX.2 ; le choix Android existant reste inchangé. Le pack complet contient **21 fichiers / 16 306 425 431 octets**, environ **16,31 Go**, hors marge et dépendances supplémentaires.

Test réel réussi : le moteur intégré charge le Q6_K sur la RTX 5070 Laptop avec **32 768 tokens de contexte** et termine une réponse de test en français. Le maximum annoncé par LiquidAI est de 256 K ; le défaut Novera reste 32 K selon la mémoire. Paramètres initiaux : température 0,1, top-k 50, pénalité de répétition 1,1.

L’option **NVFP4** propose le fichier source aux GPU NVIDIA compatibles détectés et actifs, avec le seuil conservateur de 4,5 Gio de VRAM. **Aucune instruction ni bouton de connexion à un serveur externe.** b11940 possède déjà le type NVFP4 et ses kernels ; le fichier Safetensors exige une conversion validée du dépôt complet en GGUF NVFP4 avant usage dans Novera. Cette conversion et l’inférence NVFP4 de ce modèle restent à vérifier. **Q6_K est directement utilisable.**

Tests ciblés, TypeScript, ESLint et architecture validés. Inventaire structurel : **80 locales × 1 770 clés** ; nouvelle aide NVFP4 français/anglais avec repli anglais ailleurs. Le test du worker ne valide pas l’ensemble de l’interface graphique, les autres plateformes ou la qualité générale du modèle. Aucun binaire publié ni validation CI.

Build : [dossier Windows local](deliverables/Novera-desktop-1.0.0-2026-10-28_02-16-25-120/). [Détails et preuves](docs/SUIVI_MOTEURS.md#lfm3-et-moteur-b11940--28-octobre-2026).


## Auto musical, aide et retour du partage — 28 octobre 2026

Le mainteneur demande qu'Auto reconnaisse un morceau collé sous forme de sections `[Intro]`, `[Verse]`, `[Chorus]`, etc., avec ou sans titre ou en-tête Paroles, sans imposer une formule de création. Séparer les paroles du style/accompagnement dans les paramètres du moteur, sans enregistrer le texte de cet échange dans les profils. Une demande explicite de rédaction, analyse ou traduction reste du texte ; le choix Texte explicite garde priorité.

Dans **Novera · Configurations / Musique**, afficher une courte aide générique sur style/voix, champ Paroles et balises ; ne pas y copier les paroles du mainteneur. Le libellé est traduit dans les 80 locales, base 1 769 clés.

Précision du mainteneur : le volet Windows finit par s'ouvrir avec délai, puis le problème apparaît lorsqu'il est refermé. Il s'agit du retour du partage, pas de l'arrêt de Novera. Fermer la fenêtre modale de préparation avant l'appel système, libérer le verrouillage des clics/focus, et restaurer la préparation seulement en cas d'erreur. Le fichier de cache est présent ; ne pas supprimer ce cache sans diagnostic. Aucun changement du parcours d'arrêt de l'application pour ce lot.

## Réactivité du partage Windows — 28 octobre 2026

Le mainteneur signale un nouveau blocage du partage système. La résolution WinRT du fichier ne doit jamais attendre de manière synchrone sur le thread de l'interface. Préparer le StorageFile sur un worker MTA, transmettre une référence inter-thread puis ouvrir la fenêtre de partage sur le thread propriétaire. Borner la préparation à 15 secondes ; un échec doit libérer les commandes de partage et laisser Copier le fichier/Fermer disponibles. Conserver l'envoi du fichier seul, sans automatiser le choix d'un destinataire. Toute validation par tests isolés doit rester distincte d'un essai de l'application recompilée.

## Chant musical par défaut — 28 octobre 2026

Le mainteneur demande **Instrumental désactivé par défaut** pour la musique : les nouvelles configurations et l'application des réglages recommandés autorisent le chant avec l'accompagnement. Le choix Instrumental reste disponible ; conserver les profils et préférences déjà enregistrés. Ce réglage ne fournit pas à lui seul des paroles prédéfinies.

## Messages envoyés — 28 octobre 2026

Les bulles utilisateur colorées utilisent désormais le style Novera : fond bleu nuit/indigo, cadre fin cyan/violet et texte clair ajusté au fond. Remplacer le rouge-orangé uniquement sur les messages envoyés ; conserver le choix de bulle neutre dans les préférences. Ce changement visuel reste local et nécessite une application recompilée.

## Partage système et fenêtre principale — 28 octobre 2026

Dernier ajustement du mainteneur : **retirer la vitesse de lecture ajustable en musique et en vidéo**. Les lecteurs Novera gardent la vitesse normale sans sélecteur ; les aperçus natifs de partage demandent aussi de masquer ce réglage lorsque leur webview le permet. Cette instruction remplace la commande de vitesse prévue dans la direction précédente.

Le mainteneur précise que le **partage système transmet le fichier seul** : aucune capture du lecteur, aucun cadre/en-tête Novera et aucun message dupliqué joint au fichier. L'aperçu de partage montre le média simplement, sans utiliser le visualiseur Novera ; ses commandes restent dans la conversation. Un rendu contenant un seul média sélectionne son original, même accompagné d'une légende. Un résultat texte seul propose TXT ; les exports riches de discussion restent un choix explicite. Les musiques MP3/WAV doivent être reconnues comme audio, y compris lorsqu'un fichier vient d'être créé ou que l'historique utilise une ancienne enveloppe de référence.

Au démarrage desktop, ouvrir la fenêtre principale **maximisée par le système**, redimensionnable et adaptée à la zone d'écran disponible ; réduire les minima à 640 × 480 pour éviter les anciennes contraintes 1024 × 740 sur petits écrans. Configurations Windows/Linux/macOS actualisées ; ne pas assimiler cela au plein écran exclusif ni à un essai réel de chaque système. Ces changements restent locaux, sans nouvelle compilation applicative ni publication.

## Direction confirmée — lecteurs et durée manuelle, 28 octobre 2026

Les lecteurs audio et vidéo doivent avoir des commandes **Novera**, à la place de la barre native grise : cadre fin cyan/violet, commandes tactiles et clavier, progression, temps, son et vitesse. Appliquer la même identité au visualiseur d'images avec zoom et agrandissement, aux conversations, pièces jointes et aperçus. Une seule lecture à la fois ; démarrer un autre média met le précédent en pause sans le rembobiner. Préparer ces contrôles pour Windows, Linux, Android, iOS et macOS via les API web et leurs replis, tout en distinguant préparation des sources et validation réelle sur chaque système.

La **saisie manuelle de durée doit pouvoir être vidée et retapée** : ne jamais rétablir 240 ou un autre préréglage pendant une saisie incomplète. Modifier la valeur désactive Auto et prime sur la durée du prompt. Le local ACE-Step accepte **10–600 secondes**, dont **360 s**, sans réduction silencieuse ; ce choix remplace l'ancienne limite produit 30–240 s. Les bornes propres aux fournisseurs restent visibles et appliquées à l'envoi. Défaut musical : **MP3 320 kb/s**, durée de secours 30 s ; conserver les formats explicitement choisis. Auto de durée ne concerne pas la longueur du contexte texte.

Les musiques enregistrées doivent rester lisibles après fermeture/redémarrage, comme les textes/images/vidéos. Conserver les références `novera-creation:music/…` dans l'historique ; ne pas les convertir en faux contenus base64. Corriger également les anciennes références enveloppées par erreur, sans supprimer les fichiers ni les messages. Les six nouveaux libellés des lecteurs sont présents dans les 80 locales, base 1 768 clés. [Usage et limites](docs/USER_GUIDE.md#lecteurs-novera-et-durée-manuelle--28-octobre-2026), [état et validations](TABLEAU_DE_BORD_NOVERA.md#lecteurs-novera-durée-libre-et-reprise-musicale--28-octobre-2026).

Ce lot reste local : aucune nouvelle demande de commit/push, de publication ou de compilation applicative. Les tests Rust isolés ne constituent pas un nouveau binaire Novera.

## Direction produit : automatisation avancée, simplicité mondiale

Novera prend en charge la complexité technique pour que chacun puisse discuter, créer et apprendre au même endroit. Concevoir les parcours autour de l’intention de l’utilisateur, avec des choix automatiques utiles, des explications compréhensibles dans les 80 locales et un accès direct aux réglages avancés.

- Automatiser les tâches déjà prises en charge : diagnostic matériel, sélection du moteur compatible, installation confirmée des configurations conseillées, vérification des fichiers, progression, mémoire des modèles et sauvegarde dans les bons dossiers système.
- La gestion mémoire est **Automatique par défaut** : attendre les travaux locaux actifs, préserver leurs modèles auxiliaires, décharger les modèles inutilisés puis charger le modèle demandé. Garder les fichiers, conversations, sélections et réglages ; recharger à la prochaine demande. Les appels cloud seuls ne nécessitent pas d’éviction locale.
- Le mode **Manuel** autorise des modèles texte/image/vidéo concurrents dans des discussions distinctes, selon les capacités réelles de RAM/VRAM. Ne pas interrompre une génération en cours lors d’un changement de préférence. Les nouvelles demandes utilisent la nouvelle préférence. Les moteurs média qui terminent leur processus libèrent naturellement leurs poids même en Manuel.
- L’optimisation ne supprime jamais les fichiers du mainteneur ou de l’utilisateur. Une attente ou un échec doit être explicite ; ne pas annoncer une libération réussie si le moteur refuse de se décharger.
- Garder les confirmations nécessaires pour les téléchargements, licences, coûts cloud et actions sensibles, en respectant les consentements existants. L’automatisation produit ne signifie pas autonomie sans limites ni validation universelle de tous les matériels/modèles.
- Distinguer fonctions effectivement présentes, validation des sources, essais matériels et objectifs futurs. Maintenir la vitrine et les références cohérentes ; rechercher le maximum de simplicité sans masquer les limites utiles à la décision.

Le produit est **Novera**, maintenu par TRON-ABS : https://github.com/TRON-ABS/Novera.
Contact officiel : [contact.novera.tronabs@gmail.com](mailto:contact.novera.tronabs@gmail.com).
Objectif : **Knowledge for everyone.**

## Points d’entrée

Lire [le tableau de bord](TABLEAU_DE_BORD_NOVERA.md) pour l’état actuel, [le guide de développement](docs/DEVELOPMENT.md) pour l’architecture et [la feuille de route](ROADMAP.md) pour le travail restant. Mettre à jour le document de référence concerné après un changement, avec sa date et ses validations réelles ; éviter les nouveaux journaux Markdown par tâche.

## Règles de travail

- Sources principales : `C:\msys64\home\jmsga\Novera`. Préserver modifications locales, modèles, conversations, profils et identifiants. Ne pas importer ni effacer automatiquement les profils Jan.
- Application : `Novera-Desktop.exe`, identifiant `io.github.tronabs.novera`. Nouvel état d’agent : `~/.novera`. Instructions prioritaires : `NOVERA.md`, repli configurable sur `AGENTS.md`.
- Tout texte visible ajouté **ou modifié** doit être traduit dans les **80 locales** dans la même modification. Actualiser l’inventaire et exécuter `python scripts/check-novera-locales.py` ; le repli anglais ne remplace pas une traduction. Actualiser les nombres de locales de façon ciblée, sans remplacement global des valeurs numériques ni modification des chiffres historiques.
- À chaque mise à jour du dépôt, contrôler et actualiser aussi sa **vitrine GitHub** : description « À propos » et site associé (réglages distincts du README), README anglais/français rendus, chiffres des langues/fournisseurs/catégories, liens et images, sujets et état des versions publiques. Aligner les affirmations sur les sources et validations réelles ; distinguer sources publiées, builds locaux et binaires publics. Vérifier le résultat en ligne après publication. Ne pas annoncer la synchronisation terminée si la vitrine reste périmée ; signaler précisément tout champ impossible à modifier. Ce contrôle ne déclenche ni compilation, ni publication de binaire, ni activation de GitHub Actions.
- Respecter les six domaines de `architecture/modules.json`. Utiliser les règles pures et les adaptateurs ; vérifier `yarn check:architecture` et `yarn test:architecture` après modification des frontières. La migration du code historique reste progressive.
- Les versions Android proviennent uniquement de `scripts/android/toolchain.json`, des scripts et modèles associés. Les fichiers générés et caches ne sont pas la source des réglages. Une compilation locale ne prouve ni une validation officielle de la combinaison ni le fonctionnement sur téléphone.
- Vérifier les sources officielles et dater les modifications de catalogues cloud. Voir [la maintenance des fournisseurs](docs/USER_GUIDE.md#cloud).
- Conserver licences, notices, auteurs et attributions ; un renommage ne transfère pas les droits. Préserver les interfaces de compatibilité et l’identité des services tiers selon [le guide](docs/DEVELOPMENT.md#compatibility).

## Autorisations et état courant

**Dernière instruction du mainteneur, 31 octobre 2026 : mettre à jour les sources directement sur `main`, la vitrine GitHub et les Markdown.** Cette demande explicite lève la pause ci-dessous pour le lot ONNX, sélection récente adaptée au matériel, LoRA/PEFT, FP8/NVFP4 LLM et correction des tests Windows. Préserver les autres travaux locaux ; ne pas activer Actions ni publier de binaire.

**Instruction remplacée du 27 octobre 2026 : pause historique de publication.** Les corrections de l’éditeur officiel des instructions, des aperçus d’images et de la configuration Texte/Image/Vidéo restent locales. Aucun chemin personnel ne doit être préconfiguré par défaut. Les poids vidéo ne sont pas téléchargés sans demande ou confirmation explicite. Aucun commit/push ni modification de vitrine sans nouvelle demande explicite ; cette pause remplace les autorisations de publication antérieures.

Derniers choix du 27 octobre : graines Image/Vidéo **aléatoires par défaut**, modes avancés conservés dans les deux sections, **21:9 par défaut**, vidéo **5 secondes par défaut** (remplace la demande initiale de 3 secondes). Garder le choix expérimental de **1 seconde à 1 heure**, à gauche du format sur le tableau de bord, et annoncer les limites réelles des assemblages longs. Aperçus vidéo adaptés à la fenêtre. Le bouton des conseils retrouve l’**icône à curseurs**, distincte du bouclier des autorisations. Direction confirmée : simple, facile, performant et utile, sans masquer les échecs ni promettre des expériences non validées.

Demandes supplémentaires du 27 octobre : ajouter **Musique entre Image et Vidéo**, avec recommandation au même ordre dans la page commune, réglages détaillés propres à chaque modèle, durée/qualité/graines accessibles au tableau de bord et graine aléatoire par défaut. Choix retenu : ACE-Step 1.5 Turbo 2B **Q4_K_M**, planificateur 1.7B Q8_0, encodeur Qwen3-Embedding 0.6B Q8_0 et VAE BF16, **4 543 113 728 octets de poids**, sans prétendre avoir validé la qualité sonore sur cette machine. Préserver les formats auxiliaires fiables, les licences et les chemins vides par défaut.

En haut de la page : **tout télécharger et configurer automatiquement** pour les quatre configurations conseillées, après affichage des fichiers, tailles, dossier, espace libre, marge et manque éventuel. Vérifier à nouveau le disque au démarrage ; permettre un autre dossier/disque. Utiliser LFM3 pour le texte et conserver Qwen3 comme encodeur image. Documenter dans les MD le budget actuel d’environ **16,31 Go** (composition exacte, inclusions/exclusions, dépendances et validations), pour pouvoir comparer à l’avenir des solutions aussi capables ou meilleures à volume égal ou inférieur. Cette demande ne lève pas la pause de publication et n’autorise pas un téléchargement silencieux des poids.

Référence exacte enregistrée dans [le suivi des moteurs](docs/SUIVI_MOTEURS.md#référence-texte-image-musique-vidéo--1488-go--27-octobre-2026) : **14 878 787 127 octets**, 20 fichiers uniques, plus 256 Mio de marge de stockage. Comparer les futures solutions sur ce même périmètre, avec leurs dépendances, qualité, capacités, temps et mémoire mesurés ; ne pas assimiler le budget du pack à celui de l'application entière.

Dernier ajustement du 27 octobre : **Auto par défaut** pour un nouveau contexte, sans écraser les choix manuels existants. Auto reste actif et allume la sortie effective Texte/Image/Musique/Vidéo ; le modèle correspondant apparaît dans le sélecteur compact à la volée. Reconnaissance multilingue des demandes, sans confondre bande originale et film. Musique : **30 à 240 secondes**, saisie à la seconde, raccourcis toutes les 30 secondes, 30 secondes par défaut. Une durée explicite prise en charge dans la demande prime sur le préréglage, sans modifier celui-ci. Sauvegarde dans le dossier système **Musique / Novera musique**. Le vocabulaire des 80 locales reste un recognizer déterministe à enrichir et relire, pas une certification de toutes les formulations.

Ajout demandé ensuite : retirer MiniMax des **choix musicaux** et proposer ElevenLabs, Stability AI, fal et Replicate avec leurs icônes ; préserver ses autres fonctions, profils et clés. Auto actif doit le rester après sélection ou installation d'un modèle. Traiter l'erreur locale VAE CUDA `device not ready` sans l'assimiler automatiquement à un manque de mémoire ; documenter les mesures et les limites. Ces demandes ne lèvent pas la pause de publication ou de compilation applicative.

Le **27 octobre 2026**, le mainteneur demande aussi l’application de la fenêtre commune, Nouveau projet sur dossier, choix initial des accès au dossier et au shell, toutes les langues déjà disponibles et préparation de l’interface vidéo. Le consentement au dossier ne vaut jamais accord implicite de modification/suppression ; le shell exige son propre premier choix. Le lot met à jour les sources, MD, dépôt et vitrine sans nouvelle compilation ni publication de binaire.

Le **27 octobre 2026**, le mainteneur demande de publier les dix nouvelles langues et de mettre à jour les Markdown, le dépôt et la vitrine. Les sources passent à 80 locales ; les essais Lara sans clé ne constituent pas six catalogues supplémentaires. Aucune compilation ni publication de binaire pour ce lot.

Le **26 octobre 2026**, le mainteneur demande la mise à jour des MD, du dépôt et de sa vitrine après le panneau compact, les consignes Texte/Image/Vidéo dans 70 langues, Réinitialiser, Auto amélioré et les tailles finales ×2/×4. La publication des sources et des documents est autorisée. Un build Windows a déjà été compilé et contrôlé localement pour ce lot ; cette synchronisation ne déclenche ni compilation supplémentaire, ni publication de binaire, ni activation des Actions.


Le **26 octobre 2026**, le mainteneur demande aussi la publication de l’installation conseillée, de la bibliothèque média, du moteur image embarqué et la mise à jour des MD et de la vitrine. Conserver Qwen3 GGUF CPU ; le Qwen NVFP4 a été explicitement annulé. Cette demande ne lance pas de compilation de Novera ni de publication de binaire.

Le mainteneur a demandé le **25 octobre 2026** que le dépôt reflète toutes les dernières sources et documentations. Les publications de sources sont autorisées ; exclure secrets, configuration locale, données utilisateur, exécutables/APK, caches et diagnostics bruts. Garder GitHub Actions désactivé.

Le mainteneur a demandé ensuite le **26 octobre 2026** de **mettre à jour le dépôt et sa vitrine avec les fournisseurs cloud et les nouvelles capacités**. Cette demande autorise la publication des sources et des documents, et remplace la pause de publication précédente. Elle ne déclenche aucune compilation supplémentaire de l’application, publication de binaire ou activation de GitHub Actions. Les tests de l’exécutable compilé par le mainteneur restent distincts des validations des sources.

Les compilations locales demandées les 23–25 octobre et le test synthétique Europe sont historiques et décrits dans [l’historique](docs/CHANGELOG.md). Une synchronisation de sources ou de documentation ne déclenche aucune nouvelle compilation, installation ni publication de binaire.

Les mises à jour automatiques restent désactivées avant validation de la chaîne signée Novera. Statistiques et suivi des erreurs sont indépendants et désactivés par défaut ; ne pas modifier les consentements du profil utilisateur pendant les tests. Le paramètre desktop explicite `-WithTelemetry` lit uniquement la configuration publique du fichier local ignoré `web-app/.env.local`, sans publier ses valeurs ni accorder de consentement. Android reste désactivé dans le lanceur.

Politiques conservées : [identité](BRANDING.md), [versions officielles et provenance](OFFICIAL_RELEASES.md), [contribution](CONTRIBUTING.md).

Compilation finale du rangement/import automatique réussie : `deliverables/Novera-desktop-1.0.0-2026-10-28_03-08-27-045/Novera-Desktop.exe`. SHA-256 : `C23A75AEA1616C0C01D86B1031E727A08E4D206BAAE2FBBD90CB9A8862F3AC7C`. Exécutable et moteur embarqué b11940 vérifiés ; manifeste d’empreintes présent. Les 40 tests supplémentaires du service de fournisseurs passent. L’interface graphique complète n’a pas été parcourue ; les tests de catalogue et de stockage, ainsi que les deux chargements réels depuis Documents, sont distincts de cette validation visuelle. Preuves : `.build/recommended-model-import/final-artifact.json` et journaux associés.
