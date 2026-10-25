# Fournisseurs cloud Novera

Catalogue vérifié le **25 octobre 2026** dans les documentations et catalogues officiels. Novera propose **18 fournisseurs prédéfinis** et **57 modèles de conversation présélectionnés**, dont sept nouveaux fournisseurs : DeepSeek, Kimi (Moonshot AI), Alibaba Cloud (Qwen), Cerebras, Together AI, Fireworks AI et Perplexity.

Les sélections de conversation sont centralisées dans `web-app/src/constants/cloudModels.ts`. Elles offrent des modèles actuels sans prétendre reproduire tous les catalogues commerciaux. Les noms de marques et identifiants API restent identiques dans les 36 langues ; toute nouvelle explication d’interface est traduite dans les 36 langues.

Les sept fournisseurs ajoutés disposent de logos officiels embarqués. Voir la [provenance et la procédure de maintenance des logos](PROVIDER_LOGOS.md).

## Sélections et sources officielles

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

## Configuration et actualisation

- Une clé API du fournisseur est nécessaire. Aucune clé utilisateur n’a été lue ni utilisée pour cette vérification ; aucun appel d’inférence payant n’a été lancé.
- Alibaba utilise une URL propre à l’espace de travail et à la région. Le champ est modifiable, comme pour Azure. Remplacer `YOUR-WORKSPACE-ID` et sélectionner la région correspondant à la clé. L’aide est traduite dans les 36 langues.
- Perplexity utilise désormais `/v1/responses` avec l’adaptateur OpenAI existant. Les anciens préréglages Sonar Chat Completions ne sont plus proposés par défaut.
- Le bouton d’actualisation sait lire les catalogues des nouveaux fournisseurs lorsqu’ils exposent `/models`. Il conserve au maximum dix modèles récents, filtre les services non conversationnels reconnus et exploite les métadonnées de capacités disponibles. Les dates égales ou absentes utilisent l’ordre de la sélection vérifiée avant le tri alphabétique.
- Un modèle inconnu reste limité au texte tant que ses capacités ne sont pas confirmées. Le catalogue NVIDIA ne fournit pas ces capacités : ses nouvelles sélections sont volontairement limitées au texte dans Novera. La disponibilité commerciale d’un modèle ne prouve pas la compatibilité complète de toutes ses fonctions.
- Les sélections intégrées sont actualisées au démarrage par le service des fournisseurs. Le store conserve les modèles et réglages enregistrés ; utiliser l’actualisation pour remplacer les anciennes sélections par le catalogue du compte. Les modèles marqués comme importés sont conservés par cette action. Les modèles supprimés volontairement restent masqués lors de la fusion initiale.
- Si une API ne propose pas de catalogue ou refuse l’accès, l’actualisation affiche une erreur traduite et laisse la liste en place. Azure garde sa gestion existante : les identifiants de modèle utilisés pour l’inférence sont les noms des déploiements.

## Procédure pour les futures mises à jour

1. Relire les catalogues et annonces officiels de chaque fournisseur concerné. Vérifier les identifiants API exacts, les retraits annoncés, les régions et les formats d’API ; dater la vérification et conserver les liens ici. Ne pas déduire un identifiant à partir d’un nom commercial.
2. Actualiser `web-app/src/constants/cloudModels.ts`, y compris `CLOUD_CATALOG_VERIFIED_AT`. Ne déclarer les outils ou la vision que sur preuve officielle. Conserver les choix de gamme et ne pas remplacer silencieusement un modèle choisi par l’utilisateur.
3. Pour un fournisseur ajouté ou une API modifiée, contrôler `constants/providers.ts`, `lib/remoteModelCatalog.ts`, `lib/model-factory.ts`, `lib/providerCaps.ts` et les noms affichés dans `lib/utils.ts`. Les modèles Azure restent liés aux noms des déploiements du compte.
4. Préserver les clés, adresses personnalisées, réglages, modèles importés et suppressions volontaires. Tester l’actualisation, les réponses vides ou invalides et les erreurs d’accès sans effacer la liste existante.
5. Traduire tout texte d’interface ajouté ou modifié dans les **36 langues prises en charge**, puis actualiser `docs/language-support.json` et `docs/LANGUAGES.md`. Les marques et identifiants techniques gardent leur écriture officielle.
6. Exécuter les tests concernés du catalogue, du service des fournisseurs, de la fusion des modèles et de l’écran de configuration ; vérifier TypeScript sans émission et `python scripts/check-novera-locales.py`. Vérifier aussi l’architecture si ses frontières changent. Distinguer les tests simulés des appels réellement validés avec un compte autorisé.
7. Mettre à jour ce document, `PR.md` et `TABLEAU_DE_BORD_NOVERA.md` avec les résultats réels et les limites. La mise à jour de cette documentation ne déclenche ni compilation, ni publication, ni activation de GitHub Actions.

## Validation et limites

Les tests locaux vérifient le catalogue, les filtres, les métadonnées, le tri, les doublons, les erreurs de réponse et le choix de l’adaptateur Perplexity. Les tests de fusion et de suppression des modèles existants restent applicables. Les catalogues publics OpenRouter, Hugging Face et NVIDIA ont été consultés pour vérifier les identifiants.

L’accès réel dépend de la clé, du compte, des droits et de la région. Conversation, outils et vision de chaque fournisseur restent à valider avec des comptes autorisés. Aucun binaire n’est compilé et aucune publication distante n’est réalisée pour cette actualisation.
