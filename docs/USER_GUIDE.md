# Novera — guide utilisateur

Comportements présents dans les sources au **26 octobre 2026**. Le [tableau de bord](../TABLEAU_DE_BORD_NOVERA.md) précise ce qui est déjà compilé et ce qui reste à valider. Aucun binaire public n’est encore disponible.

[Premier démarrage](#first-run) · [Discussions](#conversations) · [Hub](#hub) · [Cloud](#cloud) · [Confidentialité](#privacy) · [Agent](#agent)

<a id="first-run"></a>

## Premier démarrage

Le sélecteur affiche les **70 noms natifs** (Français, English, العربية, 日本語, etc.), avec sens de lecture automatique et un menu élargi et défilant. Le nom indonésien est précisé en **Bahasa Indonesia**.

Sans préférence sauvegardée, la langue système est sélectionnée puis enregistrée. Un choix manuel remplace cette préférence pour les démarrages suivants. Voir [les langues](LANGUAGES.md#system-language).

Le préréglage desktop LFM2.5-2.6B Q6_K utilise une température de **0,1**, top-k **50**, pénalité de répétition **1,1** et un contexte configuré de **32 768 tokens**. Cette valeur configurée ne garantit pas la capacité disponible sur tout matériel.

### Accélération optionnelle de LFM2.5-2.6B

Le premier démarrage propose une case **DSpark**, décochée par défaut, avec le
modèle de bureau recommandé **LFM2.5-2.6B Q6_K**. Le téléchargement démarre
uniquement après l’action de l’utilisateur. Si la case est cochée, le chemin
d’import existant ajoute le compagnon Q8_0 avec le type `dspark` ; il prépare
le décodage spéculatif `draft-dspark`. Le modèle principal reste le même.
Le choix reste associé au téléchargement si le contrôle de support est encore
en attente et ne peut pas changer pendant le téléchargement.

Le [dépôt officiel LiquidAI](https://huggingface.co/LiquidAI/LFM2.5-2.6B-DSpark-GGUF)
décrit ce fichier comme un brouillon auxiliaire à associer à LFM2.5-2.6B.
[Fichier demandé](https://huggingface.co/LiquidAI/LFM2.5-2.6B-DSpark-GGUF/resolve/main/LFM2.5-2.6B-DSpark-Q8_0.gguf?download=true).
Les métadonnées Hugging Face consultées donnent **356 491 776 octets**, soit
environ 356 MB à télécharger. Les poids n’ont pas été téléchargés pour ce travail.
La taille du fichier ne mesure pas la consommation totale en mémoire.

L’explication visible avant le téléchargement précise que DSpark **peut**
accélérer la génération, utilise davantage de RAM ou de VRAM et laisse moins
de mémoire pour le contexte. L’utilisateur doit tester son matériel et régler
la longueur du contexte, ou désactiver le décodage spéculatif dans les paramètres
du modèle. La valeur du contexte n’est pas réduite automatiquement, aucun gain
de vitesse ni capacité matérielle n’est garanti. L’option 2.6B n’est pas proposée
pour la recommandation Android 1.2B ni pour un autre modèle.

### Demande indépendante pour le suivi des erreurs

Le parcours contient une étape dédiée au suivi des erreurs avant le modèle,
distincte du consentement aux statistiques. Elle présente le destinataire et
le contenu limité des rapports, puis **Autoriser / Refuser**. Aucun consentement
aux statistiques n’active les rapports d’erreurs. Le suivi reste désactivé par
défaut ; le choix est enregistré dans le même état persistant, lié à sa
destination, pour éviter de reposer la question à chaque démarrage.

Sans service configuré, l’étape indique qu’aucun rapport n’est envoyé et le
bouton d’autorisation est désactivé. Un profil ayant déjà autorisé le suivi ne
reçoit pas une nouvelle demande. Un import de modèle en arrière-plan ne peut
pas contourner la question encore en attente. Le nombre d’étapes reste stable
une fois les consentements présentés. Le réglage reste modifiable dans
Confidentialité ; le filtre des données envoyées est inchangé.

<a id="conversations"></a>

## Discussions et outils

### Paramètres et outils

La rangée sous chaque message utilise des infobulles et noms accessibles traduits pour copier/copier terminé, mémoriser, modifier, supprimer, redemander, continuer, régénérer et parcourir les versions. La jauge ouvre les statistiques dans les modes compact et détaillé ; ses libellés et unités suivent la langue. La date des messages et les nombres utilisent la langue sélectionnée, avec adaptation des codes de catalogue non standard pour `Intl`. Les exemples et dialogues de confirmation de suppression des messages sont localisés. Ces textes sont présents dans les 60 catalogues.

La recherche Internet est activée par défaut pour un nouveau profil ou un ancien profil sans préférence valide. Un choix booléen déjà enregistré, notamment une désactivation manuelle, reste conservé au redémarrage. Aucune préférence du profil utilisateur n’a été modifiée par cette mise à jour des sources.

Style actualisé dans les sources : ⚙️ réglages, 🌐 recherche web, 💻 shell, ⚡ raisonnement, 💾 sauvegarde, 🗑️ suppression. Les emoji décoratifs partagent une boîte centrée de 20 px, une taille de police de 18 px et des boutons de 32 px. Les infobulles et libellés accessibles traduits restent portés par les boutons ; les états actifs et les restrictions existantes sont conservés.

Le panneau de l’assistant indique si le modèle conserve ses valeurs par défaut ou si des paramètres de l’assistant les remplacent. La roue dentée ouvre les paramètres avancés ; « Add parameter » reste dans cette partie. Le bouton de réinitialisation retire les paramètres d’échantillonnage propres à l’assistant et conserve ses autres réglages. Sans remplacement, le modèle reprend ses valeurs configurées, y compris le profil LFM de Novera.

La portée des réglages existants est conservée : dans une discussion, sa copie de l’assistant est mise à jour, ainsi que l’assistant canonique s’il existe encore. Cette copie canonique sert aux futures discussions ; les copies des autres discussions existantes ne sont pas réécrites. Les paramètres du modèle restent distincts.

Web Search, Shell et Raisonnement partagent un contour arrondi, une épaisseur de trait cohérente et un fond teinté quand le réglage est actif. Les restrictions du Shell, les capacités nécessaires et les différents modes de raisonnement sont conservés. La recherche web possède désormais un libellé accessible et un état `aria-pressed`.

### Disquette : sauvegarder la discussion ouverte

Le menu de formats est non modal et contrôlé : un clic ou déplacement du focus ailleurs dans l’interface le ferme, même si un composant parent intercepte l’événement. Le clic extérieur peut aussi activer le contrôle visé. Le bouton, la sélection d’un format et Échap conservent leur comportement normal. Cela concerne le menu de formats ; le dialogue Windows de choix de fichier reste le dialogue natif.

Placement actualisé : disquette puis corbeille immédiatement après Raisonnement, dans le groupe d’outils à gauche de la barre de saisie. Sur une fenêtre étroite, elles suivent ces outils dans le menu de débordement.

| Choix | Contenu |
| --- | --- |
| Markdown `.md` | Texte de la branche affichée, organisé par rôle |
| Texte `.txt` | Texte de la branche affichée |
| JSON `.json` | Messages utilisateur/assistant filtrés de toutes les branches, références de branche et identifiants actifs ; schéma version 2 |
| HTML `.html` | Document autonome lisible ; les contenus des messages sont échappés |
| CSV `.csv` | Une ligne par message de la branche affichée ; UTF-8 et protection contre les formules de tableur |
| Imprimer / Enregistrer en PDF | Dialogue d’impression système, avec choix PDF s’il est disponible |

Aucune connexion externe n’est nécessaire pour l’export. Les fichiers externes joints ne sont pas regroupés dans une archive : les formats lisibles indiquent leurs références ; le JSON conserve les données et références déjà présentes dans les messages. Il ne constitue pas une sauvegarde complète du profil, des réglages globaux ou des modèles. Aucun import JSON n’est ajouté par cette modification.

Tous les formats, y compris JSON et PDF, excluent les blocs de réflexion, les appels/résultats des outils et leurs métadonnées internes. Les anciens blocs `<think>`, `<thought>`, `<thinking>`, `<reasoning>`, `<analysis>` et le canal `analysis` sont également retirés du texte de l’assistant ; les blocs incomplets ne sont pas exportés. Les messages utilisateur, les réponses visibles, leurs liens et les exemples de code restent disponibles. Les messages contenant seulement des traces internes ne créent pas d’entrée vide. La branche affichée est calculée avant filtrage afin de conserver la réponse qui suit un nœud outil. Le JSON filtré utilise la version 2 et ne constitue plus une archive brute des données de session. Aucun historique stocké n’est modifié.

Sous Tauri, l’utilisateur choisit le fichier dans le dialogue natif, puis l’écriture passe par la commande existante. Dans le navigateur, l’action télécharge un fichier. Annuler ne modifie rien ; une erreur d’écriture est affichée. Le PDF passe par une impression réelle, sans renommer un autre format en `.pdf`. Sa feuille de style est également fournie comme ressource locale pour respecter la CSP de WebView2.

### Corbeille : supprimer et repartir à zéro

La corbeille se trouve à droite de la disquette et demande confirmation. Elle vise uniquement la discussion ouverte. L’écriture des messages en attente est terminée avant la suppression persistante. Les mécanismes existants nettoient la session et demandent le nettoyage du cache moteur, de l’index documentaire et de l’espace des outils.

Après une suppression réussie, les messages en mémoire, la file d’attente et les pièces jointes préparées de cette discussion sont retirés ; la saisie et son brouillon sont réinitialisés. L’écran d’accueil permet de commencer une nouvelle discussion : un nouvel identifiant et un nouveau titre sont créés par le fonctionnement habituel au premier envoi. Aucune discussion vide supplémentaire n’est enregistrée immédiatement.

Les autres discussions restent disponibles. Une erreur conserve la discussion et la saisie, et permet de réessayer. Si l’utilisateur a changé de discussion ou est revenu à l’accueil pendant l’opération, son nouveau brouillon n’est pas effacé. Les commandes sont indisponibles pendant une génération ou le traitement des pièces jointes. La discussion de démarrage reste protégée tant que sa configuration n’est pas terminée. Cowork garde ses propres commandes et son propre cycle de session.

Il s’agit d’une suppression applicative, sans garantie d’effacement sécurisé du disque ou des copies exportées. Les nettoyages secondaires hérités sont effectués au mieux et ne transforment pas une suppression persistante réussie en échec.

### Recherche Internet désactivée et protocole brut du modèle

Quand la recherche est désactivée, une instruction explicite demande au modèle de répondre depuis ses connaissances sans simuler de recherche ; les schémas `web_search` et `web_fetch` sont retirés, y compris si un serveur MCP les expose sous ces mêmes noms. L’exécution des outils web intégrés conserve sa vérification de l’interrupteur juste avant l’appel. Les outils MCP personnalisés ayant d’autres noms conservent leur propre configuration ; l’interrupteur web n’est pas présenté comme un pare-feu général.

Certains modèles peuvent écrire `<|tool_call_start|>[google(...)]<|tool_call_end|>` comme du texte. Ce texte n’est jamais interprété ou exécuté. Il est retiré du rendu assistant, de la copie, de la sauvegarde des nouveaux messages, du rechargement de l’historique et des exports. Les balises incomplètes sont masquées pendant la génération. Les questions utilisateur et les exemples explicitement placés dans du code sont conservés. Le filtrage ne garantit pas qu’un modèle produira toujours une réponse correcte ni une réponse exploitable s’il ne génère que ce protocole invalide.

<a id="hub"></a>

## Découvrir et comparer des modèles

**Hugging Face : 3 187 159 dépôts de modèles, soit environ 3,19 millions**, relevés le **26 octobre 2026** ([catalogue global](https://huggingface.co/models)). Parmi eux : **214 900 dépôts GGUF** et **27 295 dépôts MLX** ([GGUF](https://huggingface.co/models?library=gguf), [MLX](https://huggingface.co/models?library=mlx)). Ces nombres incluent variantes et conversions ; ils ne mesurent ni les modèles distincts ni une compatibilité garantie avec Novera.

Le Hub interroge directement l’API publique Hugging Face, sans catalogue Jan sur GitHub. Il charge les modèles textuels et multimodaux GGUF par lots et MLX uniquement sur la plateforme prévue. Le bouton « Suivant » charge le lot suivant ; on peut aussi saisir un identifiant `éditeur/dépôt` ou son URL Hugging Face. La recherche par nom filtre la liste déjà chargée. Les versions déjà installées et les six présélections Novera restent inchangées. Le catalogue public peut contenir des modèles soumis à une licence ou à un accès restreint ; leur présence ne débloque pas le téléchargement.

Les listes sont mises en cache pendant dix minutes ; les métadonnées de fichiers sont chargées par trois requêtes simultanées au maximum. Aucune clé utilisateur ni poids de modèle n’est envoyé ou téléchargé pour cette découverte. Une erreur réseau conserve le dernier cache ; les six présélections restent disponibles hors ligne. Le cache ancien du catalogue Jan est abandonné à la migration, sans toucher aux modèles ou conversations.

Le Hub ajoute un catalogue Novera embarqué de six petits modèles : LiquidAI LFM2.5-230M, 350M, 1.2B-Instruct, 2.6B et Qwen3.5-0.8B, 2B. Les autres modèles découverts sur Hugging Face sont ajoutés par lots, sans dépendre du catalogue Jan. Le catalogue Novera est disponible même si le flux distant échoue. Aucune préférence de modèle installée, aucun modèle ni profil utilisateur n'est remplacé.

### Taille et classement

Les tailles et révisions des GGUF ont été vérifiées via les métadonnées Hugging Face le 24 octobre 2026 ; aucun poids téléchargé pour ce travail. Les URL pointent une révision précise. La version Q4_K_M proposée par défaut pèse respectivement 153 406 304, 229 312 224, 730 895 168, 1 674 455 040, 532 517 120 et 1 280 835 840 octets. Q6_K et Q8_0 sont également proposés lorsqu'ils existent. Le choix initial de l'assistant au premier démarrage reste LFM2.5-2.6B Q6_K.

Le tri par défaut « Adapté à mon matériel » applique l'estimation mémoire existante (RAM, GPU, contexte de 8 192 jetons), puis les dépôts d’éditeurs d’origine, la sélection Novera et le compromis 1.2B/2.6B, puis le poids. Ce n'est pas un score de qualité ni une garantie de compatibilité moteur. Les modèles aux besoins mémoire trop élevés sont classés après ceux qui paraissent tenir en mémoire. Les dimensions inconnues restent inconnues. La détection ne constitue pas une mesure instantanée de mémoire libre.

Les tris donnent priorité aux dépôts d’éditeurs d’origine reconnus, sans faire passer un modèle estimé incompatible devant un modèle adapté dans le tri matériel. Dans chaque groupe, le tri « Les plus petits » utilise le poids réel de la variante proposée, avec les tailles inconnues en dernier. Les deux variantes Qwen3.5 présélectionnées restent des conversions Unsloth : leur attribution d’origine est conservée. Les filtres sont moins de 1 Go, 1–2 Go, 2–4 Go, 4 Go et plus, avec bornes inférieures incluses et supérieures exclues. Ils s'appliquent aussi aux recherches directes Hugging Face. La mémoire estimée représente les poids et une heuristique de cache de contexte, hors système et avec des limites selon l'architecture ; elle ne remplace pas une mesure réelle.

### Comparaison et performances

Jusqu'à trois modèles peuvent être sélectionnés ; la comparaison reste visible au-dessus de la liste et n'est pas perdue pendant le filtrage ou le défilement. Le poids, les paramètres, la mémoire estimée et les scores publiés sont présentés côte à côte.

Les scores de qualité viennent des fiches des fabricants :

- [LFM2.5-230M](https://huggingface.co/LiquidAI/LFM2.5-230M), [350M](https://huggingface.co/LiquidAI/LFM2.5-350M) et [1.2B-Instruct](https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct) : MMLU-Pro et IFEval.
- [LFM2.5-2.6B](https://huggingface.co/LiquidAI/LFM2.5-2.6B) : IFBench et LiveCodeBench v6.
- [Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B) et [2B](https://huggingface.co/Qwen/Qwen3.5-2B) : MMLU-Pro et IFEval sans mode de raisonnement.
- GGUF LiquidAI : dépôts officiels ; GGUF Qwen3.5 : dépôts [Unsloth 0.8B](https://huggingface.co/unsloth/Qwen3.5-0.8B-GGUF) et [2B](https://huggingface.co/unsloth/Qwen3.5-2B-GGUF).

Ces chiffres ne sont pas des évaluations Novera des fichiers quantifiés sélectionnés. Les méthodes, versions et modes peuvent différer. Aucun classement global commun, aucune vitesse matérielle inventée et aucun score français indépendant ne sont affichés. La date visible est celle de vérification des sources, pas la date d'exécution du benchmark fabricant.

« Tester sur mon PC » nécessite une variante locale téléchargée et déjà lancée ; le test n'effectue aucun téléchargement ni changement de modèle automatique. Il utilise un prompt fixe en anglais, identique pour tous les modèles, sans historique ni outils, avec raisonnement désactivé dans les paramètres de requête et un maximum de 128 jetons. L'anglais est une condition du protocole de mesure, pas un texte d'interface. Le modèle peut toutefois ne pas respecter ce mode.

Le débit global est calculé à partir du nombre de jetons réellement déclaré par le moteur et de toute la durée d'inférence, traitement de la question inclus, chargement du modèle exclu. Il n'est pas comparable à une mesure de décodage pur. Le premier délai correspond au premier texte reçu. Si le moteur ne rapporte pas le nombre de jetons, aucun débit n'est inventé à partir des caractères. La mémoire affichée est le dernier relevé de mémoire utilisée du système entier ; ce n'est pas la consommation propre au modèle ni un pic mémoire. La variante et la date sont conservées avec le résultat dans l'état de la page uniquement.

Le test est interdit pendant une génération de discussion ou Cowork, annulé si une génération commence, si le modèle quitte la sélection ou si l'utilisateur quitte le Hub. Annulation manuelle et limite d'une minute. Aucun message n'est enregistré dans une conversation, aucun résultat n'est envoyé à une destination statistique. Les mesures restent en mémoire et ne survivent pas à une nouvelle ouverture de la page.

<a id="cloud"></a>

Les six modèles locaux présélectionnés affichent l’icône officielle de leur éditeur : **Liquid AI** pour les quatre LFM2.5 et **Qwen** pour les deux Qwen3.5. Ces icônes sont embarquées, visibles dans la liste du Hub et sur la fiche du modèle, avec fond clair pour rester lisibles dans les deux thèmes. Aucun téléchargement de poids ne démarre à l’affichage.

## Fournisseurs cloud et maintenance

Catalogue initial vérifié le **25 octobre 2026**, neuf fournisseurs supplémentaires vérifiés le **26 octobre 2026** dans les sources officielles. Novera propose **27 fournisseurs prédéfinis** et **69 modèles de conversation présélectionnés**. Azure utilise les noms de déploiement du compte ; IBM watsonx utilise les alias de sa passerelle et ne possède pas de sélection universelle.

Les sélections de conversation sont centralisées dans `web-app/src/constants/cloudModels.ts`. Elles offrent des modèles actuels sans prétendre reproduire tous les catalogues commerciaux. Les noms de marques et identifiants API restent identiques dans les 70 langues ; toute nouvelle explication d’interface est traduite dans les 70 langues.

Les fournisseurs ajoutés disposent de leurs propres logos officiels embarqués. Voir la [provenance et la procédure de maintenance des logos](DEVELOPMENT.md#logos).

### Sélections et sources officielles

| Fournisseur | Sélection intégrée | Source vérifiée |
| --- | --- | --- |
| OpenAI | GPT-6.1 Sol, GPT-6 Astra, GPT-6 Luna, GPT-6 Sol | [Catalogue](https://developers.openai.com/api/docs/models/all), [compatibilité GPT-6](https://developers.openai.com/api/docs/guides/latest-model) |
| Azure | Noms des déploiements propres au compte ; aucun identifiant universel inventé | [Déploiements et API v1](https://learn.microsoft.com/en-us/azure/ai-foundry/foundry-models/concepts/endpoints) |
| Anthropic | Claude Sonnet 5.5, Opus 5.5, Fable 5.1, Haiku 5.5 | [Modèles](https://platform.claude.com/docs/en/models/overview) |
| Gemini | Gemini 4 Argon, 3.8 Flash, 3.6 Flash, 3.5 Flash-Lite | [Modèles](https://ai.google.dev/gemini-api/docs/models) |
| Mistral | Large 4, Medium 3.5, Small 4, Ministral 3 3B | [Catalogue](https://docs.mistral.ai/models), [Large](https://docs.mistral.ai/models/mistral-large-4-0), [Medium](https://docs.mistral.ai/models/mistral-medium-3-5-26-04), [Small](https://docs.mistral.ai/models/mistral-small-4-0-26-03), [Ministral](https://docs.mistral.ai/models/ministral-3-3b-25-12) |
| Groq | GPT-OSS 120B et 20B ; Llama 3.3 70B et 3.1 8B | [Modèles disponibles](https://console.groq.com/docs/models) |
| xAI | Grok 4.7 | [Catalogue](https://docs.x.ai/developers/models), [Chat Completions](https://docs.x.ai/developers/model-capabilities/legacy/chat-completions) |
| MiniMax | MiniMax-M3.1-Flash et MiniMax-M3 | [Modèles](https://platform.minimax.io/docs/guides/models-intro), [API compatible OpenAI](https://platform.minimax.io/docs/api-reference/text-openai-api) |
| OpenRouter | Kimi K3.1 Pro, MiniMax M3.1 Flash, DeepSeek V4.1 Flash 1017, Nemotron 3.5 Super VL gratuit | [Catalogue API public](https://openrouter.ai/api/v1/models) |
| Hugging Face | DeepSeek V4.1 Flash 1017, Qwen3.8 27B, Kimi K3, GLM 5.3 | [Catalogue des modèles servis](https://router.huggingface.co/v1/models) |
| NVIDIA NIM | MiniMax M3.1 Flash, DeepSeek V4.1 Flash, Nemotron 3.5 Super VL et Lightning, GLM 5.3 | [Catalogue API public](https://integrate.api.nvidia.com/v1/models) |
| DeepSeek | `deepseek-flash` (V4.1-Flash-1017), `deepseek-v4-pro` | [Modèles et identifiants](https://api-docs.deepseek.com/quick_start/pricing/) |
| Kimi | `kimi-k3.1-pro`, `kimi-k3.1-pro-highspeed`, `kimi-k3` | [Modèles](https://platform.kimi.ai/docs/models), [adresse internationale](https://platform.kimi.ai/docs/get-your-api-key) |
| Alibaba Cloud | `qwen3.8-max`, `qwen3.7-plus`, `qwen3.8-flash` | [Catalogue](https://www.alibabacloud.com/help/en/model-studio/models), [compatibilité et régions](https://www.alibabacloud.com/help/en/model-studio/compatibility-of-openai-with-dashscope) |
| Cerebras | `qwen-3.8-27b`, `gpt-oss-120b` | [Catalogue](https://inference-docs.cerebras.ai/models/overview), [API et vision](https://inference-docs.cerebras.ai/resources/openai) |
| Together AI | DeepSeek V4.1 Flash 1017, Kimi K3, Qwen3.8 Flash et 2.4T-A95B | [Catalogue](https://docs.together.ai/docs/serverless/models), [adresse API](https://docs.together.ai/docs/inference/openai-compatibility) |
| Fireworks AI | DeepSeek V4.1 Flash 1017, Kimi K3, MiniMax M3 | [Catalogue](https://docs.fireworks.ai/getting-started/models), [DeepSeek](https://app.fireworks.ai/models/fireworks/deepseek-v4p1-flash-1017), [Kimi](https://app.fireworks.ai/models/fireworks/kimi-k3), [MiniMax](https://app.fireworks.ai/models/fireworks/minimax-m3) |
| Perplexity | Sonar Agent, GPT-6.1 Sol, Gemini 4 Argon, Kimi K3 | [Modèles Agent](https://docs.perplexity.ai/docs/agent-api/models), [API Responses](https://docs.perplexity.ai/docs/agent-api/openai-compatibility) |

| Meta AI | `muse-wonder-1.0`, `muse-spark-1.3` | [Modèles](https://dev.meta.ai/docs/models), [API](https://dev.meta.ai/docs/api-reference) |
| Cohere | `command-a-plus-05-2026` | [Modèles](https://docs.cohere.com/docs/models), [compatibilité OpenAI](https://docs.cohere.com/v2/docs/compatibility-api) |
| Z.ai | `glm-5.3`, `glm-5.3-flash`, `glm-5.3-flashx` | [GLM-5.3](https://docs.z.ai/guides/llm/glm-5.3), [Flash](https://docs.z.ai/guides/vlm/glm-5.3-flash), [configuration](https://zcode.z.ai/en/docs/configuration) |
| AI21 Labs | `jamba-large` (1.7), `jamba-mini-2` (2) | [Modèles et alias API](https://docs.ai21.com/docs/jamba-foundation-models), [API](https://docs.ai21.com/reference/jamba-1-6-api-ref) |
| BytePlus (ByteDance) | `dola-seed-2-1-turbo-260628` | [Paramètres et disponibilité](https://docs.byteplus.com/en/docs/modelark/model-parameter-support), [retraits](https://docs.byteplus.com/en/docs/modelark/model-deprecation-notice) |
| Baidu Qianfan | `ernie-5.1` | [Catalogue Chine](https://cloud.baidu.com/doc/qianfan/s/rmh4stp0j), [ERNIE 5.1](https://ernie.baidu.com/blog/posts/ernie-5.1-0508-release/) |
| Tencent TokenHub | `hy4-preview` | [API et régions](https://cloud.tencent.com/document/product/1823/130078), [modèle](https://cloud.tencent.com/document/product/1823/132252) |
| Amazon Bedrock | `openai.gpt-6.1-sol` via Mantle | [API](https://docs.aws.amazon.com/bedrock/latest/userguide/inference-chat-completions.html), [fiche du modèle](https://docs.aws.amazon.com/fr_fr/bedrock/latest/userguide/model-card-openai-gpt-6-1-sol.html) |
| IBM watsonx | Catalogue du compte via Model Gateway ; aucun identifiant inventé | [Passerelle](https://www.ibm.com/docs/en/watsonx/saas?topic=preview-inferencing-gateway-models), [SDK officiel](https://ibm.github.io/watsonx-ai-python-sdk/model_gateway.html) |

### Configuration et actualisation

- Les ajouts du 26 octobre emploient les API compatibles Chat Completions. Meta AI désigne son API développeur, distincte de l’abonnement grand public. Les modèles auto-hébergés sans identifiant cloud (par exemple Jamba 3B) ne sont pas inventés dans la liste.
- Les URL Z.ai, BytePlus, Baidu, Tencent, Bedrock et IBM sont modifiables. Z.ai distingue prépaiement (`/api/paas/v4`) et Coding Plan (`/api/coding/paas/v4`) : choisir l’offre de la clé ; GLM-5.3 impose son raisonnement. Baidu utilise par défaut l’API Chine `/v2` pour ERNIE 5.1 ; sa disponibilité sur l’API internationale n’est pas présumée. Tencent utilise TokenHub Chine ; Singapour emploie `https://tokenhub-intl.tencentmaas.com/v1`, avec une clé et des modèles autorisés pour ce site. BytePlus conserve l’endpoint ModelArk de Singapour ; `dola-seed-evolving` n’est pas proposé car la documentation l’indique indisponible sur BytePlus.
- Amazon Bedrock utilise une clé API bearer Bedrock et l’endpoint Mantle régional, sans signature SigV4. Le catalogue est interrogé sur `/v1/models` ; GPT-6 utilise `/openai/v1`, GPT-OSS `/v1`. Les URL de proxy personnalisées restent intactes. Le catalogue importé est limité aux familles GPT dont ce transport Chat Completions est pris en charge ; la disponibilité varie selon région et compte.
- IBM nécessite l’URL réelle du Model Gateway du compte (`https://YOUR-GATEWAY-HOST/ml/gateway/v1`) et son authentification autorisée. Laisser l’URL vide bloque l’inférence. Actualiser la liste après configuration : les alias et versions, y compris les éventuels modèles Granite récents, sont ceux réellement enregistrés dans la passerelle. Cette intégration ne remplace pas l’API native watsonx à projet/IAM.
- Cohere conserve l’URL d’inférence `/compatibility/v1` et lit son catalogue natif `/v1/models?endpoint=chat&page_size=1000`, en écartant les modèles retirés et non conversationnels. Les anciennes configurations Cohere sont conservées et leur URL native obsolète est corrigée ; les clés et URL de proxy ne sont pas remplacées.
- Z.ai, AI21, BytePlus, Baidu et Tencent utilisent une sélection maintenue dans les sources : l’actualisation réintroduit les modèles de cette sélection sans supprimer les modèles existants. Aucun endpoint de catalogue non documenté n’est supposé ; le test des clés par catalogue est désactivé pour ces services. La disponibilité d’une nouvelle version exige une nouvelle vérification et mise à jour de cette sélection.
- Une clé API du fournisseur est nécessaire. Aucune clé utilisateur n’a été lue ni utilisée pour cette vérification ; aucun appel d’inférence payant n’a été lancé.
- Alibaba utilise une URL propre à l’espace de travail et à la région. Le champ est modifiable, comme pour Azure. Remplacer `YOUR-WORKSPACE-ID` et sélectionner la région correspondant à la clé. L’aide est traduite dans les 70 langues.
- Perplexity utilise désormais `/v1/responses` avec l’adaptateur OpenAI existant. Les anciens préréglages Sonar Chat Completions ne sont plus proposés par défaut.
- Le bouton d’actualisation sait lire les catalogues des nouveaux fournisseurs lorsqu’ils exposent `/models`. Il conserve au maximum dix modèles récents, filtre les services non conversationnels reconnus et exploite les métadonnées de capacités disponibles. Les dates égales ou absentes utilisent l’ordre de la sélection vérifiée avant le tri alphabétique.
- Un modèle inconnu reste limité au texte tant que ses capacités ne sont pas confirmées. Le catalogue NVIDIA ne fournit pas ces capacités : ses nouvelles sélections sont volontairement limitées au texte dans Novera. La disponibilité commerciale d’un modèle ne prouve pas la compatibilité complète de toutes ses fonctions.
- Les sélections intégrées sont actualisées au démarrage par le service des fournisseurs. Le store conserve les modèles et réglages enregistrés ; utiliser l’actualisation pour remplacer les anciennes sélections par le catalogue du compte. Les modèles marqués comme importés sont conservés par cette action. Les modèles supprimés volontairement restent masqués lors de la fusion initiale.
- Si une API ne propose pas de catalogue ou refuse l’accès, l’actualisation affiche une erreur traduite et laisse la liste en place. Azure garde sa gestion existante : les identifiants de modèle utilisés pour l’inférence sont les noms des déploiements.

### Procédure pour les futures mises à jour

1. Relire les catalogues et annonces officiels de chaque fournisseur concerné. Vérifier les identifiants API exacts, les retraits annoncés, les régions et les formats d’API ; dater la vérification et conserver les liens ici. Ne pas déduire un identifiant à partir d’un nom commercial.
2. Actualiser `web-app/src/constants/cloudModels.ts`, y compris `CLOUD_CATALOG_VERIFIED_AT`. Ne déclarer les outils ou la vision que sur preuve officielle. Conserver les choix de gamme et ne pas remplacer silencieusement un modèle choisi par l’utilisateur.
3. Pour un fournisseur ajouté ou une API modifiée, contrôler `constants/providers.ts`, `lib/remoteModelCatalog.ts`, `lib/model-factory.ts`, `lib/providerCaps.ts` et les noms affichés dans `lib/utils.ts`. Les modèles Azure restent liés aux noms des déploiements du compte.
4. Préserver les clés, adresses personnalisées, réglages, modèles importés et suppressions volontaires. Tester l’actualisation, les réponses vides ou invalides et les erreurs d’accès sans effacer la liste existante.
5. Traduire tout texte d’interface ajouté ou modifié dans les **70 langues prises en charge**, puis actualiser `docs/language-support.json` et `docs/LANGUAGES.md`. Les marques et identifiants techniques gardent leur écriture officielle.
6. Exécuter les tests concernés du catalogue, du service des fournisseurs, de la fusion des modèles et de l’écran de configuration ; vérifier TypeScript sans émission et `python scripts/check-novera-locales.py`. Vérifier aussi l’architecture si ses frontières changent. Distinguer les tests simulés des appels réellement validés avec un compte autorisé.
7. Mettre à jour ce document, `PR.md` et `TABLEAU_DE_BORD_NOVERA.md` avec les résultats réels et les limites. La mise à jour de cette documentation ne déclenche ni compilation, ni publication, ni activation de GitHub Actions.

### Validation et limites

Les tests locaux vérifient le catalogue, les filtres, les métadonnées, le tri, les doublons, les erreurs de réponse et le choix de l’adaptateur Perplexity. Les tests de fusion et de suppression des modèles existants restent applicables. Les catalogues publics OpenRouter, Hugging Face et NVIDIA ont été consultés pour vérifier les identifiants.

L’accès réel dépend de la clé, du compte, des droits et de la région. Conversation, outils et vision de chaque fournisseur restent à valider avec des comptes autorisés. Le catalogue décrit les sources du 25 octobre ; son utilisation réelle nécessite des comptes autorisés et une validation du programme construit.

<a id="privacy"></a>

## Confidentialité

Les statistiques et le suivi des erreurs ont des consentements **indépendants**, désactivés par défaut et liés à l’hôte/projet destinataire. Le suivi des erreurs est demandé au premier démarrage ; l’accord aux statistiques ne l’active jamais. Le refus est mémorisé. Sans destination configurée, aucun envoi n’est possible. Un changement de destinataire demande une nouvelle décision. Le retrait dans Paramètres → Confidentialité annule les requêtes en attente et les envois suivants.

| Fonction | Données et limites |
| --- | --- |
| Statistiques facultatives | Événement `novera_app_started`, version et OS, UUID aléatoire par événement, jamais réutilisé. Compte des démarrages consentis, pas des utilisateurs uniques. |
| Suivi des erreurs facultatif | Erreurs JavaScript non interceptées et promesses rejetées sans gestionnaire ; type d’erreur autorisé, message technique constant, version/OS et éventuellement positions numériques du bundle principal. Déduplication, au plus dix rapports par activation et dix positions par pile. |

Aucune conversation, prompt, recherche, résultat d’outil, clé, identité utilisateur, nom de modèle ou chemin n’est sérialisé. Les messages d’erreurs bruts, causes et propriétés personnalisées sont exclus. Pas de cookies, enregistrement de session, profil de personne ou SDK de capture automatique. Le serveur voit les informations de connexion : sa rétention et le traitement des IP restent à configurer ; le client seul ne garantit pas l’anonymat des journaux serveur.

Les erreurs interceptées par React/le routeur et les crashs natifs Rust, Android ou moteur ne sont pas couverts. Pas de source maps publiées, ni file persistante de rapports. Les diagnostics locaux et l’OpenTelemetry avancé des agents sont distincts, ce dernier désactivé sans configuration explicite du collecteur.

La configuration de construction et les essais réalisés sont décrits dans [construction](BUILD_AND_RELEASE.md#telemetry) et [historique](CHANGELOG.md#history).

<a id="agent"></a>

## Agent en terminal

Depuis Bash, `./novera-agent.sh` lance l’interface de l’agent sans argument et transmet les arguments sinon. Il utilise une CLI déjà placée dans `src-tauri/resources/bin/`, sous les noms Novera ou les noms internes `jan` compatibles. Il ne télécharge ni ne compile automatiquement.

La construction et l’appel direct du binaire sont décrits dans [le guide de construction](BUILD_AND_RELEASE.md#cli). Les références techniques restent séparées car les tests ADK utilisent leurs exemples : [CLI](agent/cli.md), [protocole](agent/protocol.md).
