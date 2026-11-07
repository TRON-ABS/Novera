# Fournisseurs API et 104 langues — contrôle du 7 novembre 2026

Travail local pour la 1.0.1, toujours en préparation. Aucun paquet publié ni clé utilisateur consultée. Aucun appel d'inférence payant.

## Corrections

Les nouveaux identifiants sont dans le catalogue partagé par les 104 langues, pas dans 104 copies divergentes. Les marques et identifiants techniques restent officiels ; catégories, actions et messages utilisent les traductions existantes. Le bouton de rafraîchissement reçoit aussi un nom accessible et une infobulle traduits dans les 104 catalogues. Aucun nom de modèle n'est traduit ou inventé.

- OpenAI et Bedrock : ajout de GPT-6.1 Terra.
- Groq : Qwen3.8 27B, proposé en preview par le fournisseur.
- Together : Kimi K3.1 Pro et MiniMax M3.1 Flash ; Fireworks : identifiant exact `accounts/fireworks/models/kimi-k3p1-pro`.
- OpenRouter : LFM3 1.7B, GPT-6.1 Terra et Hy4 ; Hugging Face : MiniMax M3.1 Flash et GLM 5.3 Flash.
- Tencent : Hy4, avec maintien de la variante preview ; NVIDIA : correction de `z-ai/glm-5.3` absent du catalogue en `z-ai/glm-5.3-flash`.
- Mistral : GLM 5.3 Flash remplace Medium 3.5, classé déprécié dans la documentation actuelle, dans la sélection initiale. Les modèles personnels existants ne sont pas supprimés.
- Création : GPT Image 2.6 Sunburst/Flare, Gemini Omni 1.2 Flash, FLUX 3 Image/Klein/Video chez BFL, FLUX 3 Image/Video chez fal et FLUX 3 Video chez Replicate (early access preview).
- Appel BFL : FLUX 3 Image utilise `images` ; FLUX 3 Video utilise `mode=t2v` ou `mode=i2v` avec `keyframes`. FLUX.2 conserve `input_image`. Les clés restent sur le même hôte BFL.
- Le rafraîchissement ne tronque plus les modèles admissibles à dix résultats. Il conserve les filtres de modalités, les dédoublonnages et les modèles importés. Il ne constitue pas une implémentation universelle de la pagination de toutes les API.
- Liens BytePlus/Vidu corrigés. Les sélections de compte Azure et IBM restent propres aux déploiements et alias de la passerelle ; aucun modèle arbitraire n'y est injecté.

## Contrôle par fournisseur

Les pages officielles et les trois catalogues publics ont été récupérés sans authentification. HTTP 200 seul ne prouve ni le contenu ni une autorisation de génération. La sélection compatible n'est pas la totalité des produits de chaque fournisseur.

| Fournisseur | Résultat / portée | Source officielle |
|---|---|---|
| OpenAI | Terra et Image 2.6 ajoutés | [Modèles](https://developers.openai.com/api/docs/models) |
| Anthropic | Quatre familles Claude actuelles déjà présentes | [Identifiants](https://platform.claude.com/docs/en/models/overview) |
| Gemini | Chat actuel conservé ; Omni 1.2 ajouté | [Modèles](https://aistudio.google.com/docs/models), [Omni](https://aistudio.google.com/docs/models/gemini-omni-flash) |
| Mistral | GLM Flash ajouté, Medium déprécié retiré de la présélection | [Catalogue](https://docs.mistral.ai/models), [GLM Flash](https://docs.mistral.ai/models/zai-glm-5-3-flash) |
| Groq | Qwen3.8 27B preview ajouté ; outils et images documentés | [Fiche](https://console.groq.com/docs/model/qwen/qwen3.8-27b) |
| xAI | Grok 4.7 et Imagine 2.0/1.5 déjà présents | [Modèles](https://docs.x.ai/developers/models) |
| MiniMax | M3.1 Flash/M3 et H3 déjà présents | [Catalogue](https://platform.minimax.io/docs/guides/models-intro) |
| DeepSeek | Alias Flash actuel et V4 Pro déjà présents | [Identifiants](https://api-docs.deepseek.com/) |
| Moonshot/Kimi | K3.1 Pro et Highspeed déjà présents | [Modèles](https://platform.kimi.ai/docs/models) |
| Alibaba | Qwen3.8 Max/Flash et 3.7 Plus déjà présents | [Modèles](https://www.alibabacloud.com/help/en/model-studio/models) |
| Cerebras | Qwen3.8 27B et GPT-OSS 120B déjà présents | [Modèles](https://inference-docs.cerebras.ai/models/overview) |
| Together | Kimi K3.1 Pro et MiniMax M3.1 Flash ajoutés | [Catalogue](https://docs.together.ai/docs/serverless/models) |
| Fireworks | Kimi K3.1 Pro ajouté avec identifiant vérifié | [Fiche](https://fireworks.ai/models/fireworks/kimi-k3p1-pro) |
| Perplexity | Sélection de l'API Agent conservée ; offres du compte variables | [Modèles Agent](https://docs.perplexity.ai/docs/agent-api/models) |
| OpenRouter | Présélection entièrement présente dans l'API publique et le parseur réel | [Catalogue](https://openrouter.ai/api/v1/models) |
| Hugging Face | Présélection entièrement présente dans l'API publique et le parseur réel | [Catalogue](https://router.huggingface.co/v1/models) |
| NVIDIA | Identifiant GLM corrigé ; présélection entièrement présente dans l'API publique | [Catalogue](https://integrate.api.nvidia.com/v1/models) |
| Meta | Muse Wonder 1.0 et Spark 1.3 déjà présents | [Modèles](https://dev.meta.ai/docs/models) |
| Cohere | Command A+ 05-2026 déjà présent ; modèles du compte via catalogue natif | [Modèles](https://docs.cohere.com/docs/models) |
| Z.ai | Famille GLM 5.3 conservée ; pas de nouvel identifiant déduit d'une annonce | [GLM 5.3](https://docs.z.ai/guides/llm/glm-5.3) |
| AI21 | Jamba Large et Mini 2 déjà présents ; modèle local 3B non ajouté arbitrairement | [Modèles et alias](https://docs.ai21.com/docs/jamba-foundation-models) |
| BytePlus | Dola Seed 2.1 Turbo conservé ; lien catalogue actualisé | [Liste](https://docs.byteplus.com/en/docs/modelark/model-list) |
| Baidu | ERNIE 5.1 conservé ; région et compte nécessaires | [Catalogue](https://cloud.baidu.com/doc/qianfan/s/rmh4stp0j) |
| Tencent | Hy4 ajouté, preview conservée ; disponibilité régionale | [Modèles et API](https://cloud.tencent.com/document/product/1823/130078) |
| Bedrock | Terra ajouté ; filtre conservé aux familles compatibles avec le transport intégré | [Identifiants Terra](https://developers.openai.com/api/docs/models/gpt-6.1-terra) |
| Azure | Déploiements du compte, contrôle public insuffisant pour leur liste réelle | [Modèles](https://learn.microsoft.com/en-us/azure/ai-foundry/openai/concepts/models) |
| IBM watsonx | Alias du Model Gateway du compte, aucun catalogue universel présumé | [Passerelle](https://www.ibm.com/docs/en/watsonx/saas?topic=preview-inferencing-gateway-models) |
| TabbyAPI | Catalogue local du serveur utilisateur ; pas de dernier modèle cloud universel | [Projet](https://github.com/theroyallab/tabbyAPI) |
| ElevenLabs | Music v2.5 déjà présent ; pas d'ajout de TTS hors du flux intégré | [Contrat musique](https://elevenlabs.io/docs/api-reference/music/compose) |
| BFL | FLUX 3 Image, Klein et Video ajoutés ; nouveaux champs testés | [Image](https://docs.bfl.ai/flux_3/flux3_image_generate), [Klein](https://docs.bfl.ai/flux_3/flux3_image_klein), [Vidéo](https://docs.bfl.ai/flux_3/flux3_video) |
| Stability | Image Ultra/Core et Audio 3 conservés ; autres produits non présumés compatibles | [API](https://docs.stability.ai/api-reference) |
| Recraft | V4.1, Flash et Pro déjà présents | [Contrats API](https://www.recraft.ai/docs/api-reference/agents.md) |
| Ideogram | 4.5 déjà présent | [API](https://developer.ideogram.ai/ideogram-api/api-overview) |
| Adobe Firefly | Image 5 et transport vidéo conservés | [API](https://developer.adobe.com/firefly-services/docs/firefly-api/) |
| Runway | Gen-4.5 conservé ; autres endpoints hors du transport intégré | [API](https://docs.dev.runwayml.com/api/) |
| Luma | Uni-1 Max, Uni-1, Ray 3.2 déjà présents | [Contrats](https://docs.agents.lumalabs.ai/guides/model/) |
| LTX | 2.5 Pro/Fast déjà présents | [Modèles](https://docs.ltx.io/models) |
| fal | FLUX 3 Image/Video ajoutés aux choix intégrés ; catalogue complet non répliqué | [Image](https://fal.ai/models/blackforestlabs/flux-3/text-to-image/api), [Vidéo](https://fal.ai/models/blackforestlabs/flux-3/text-to-video/api) |
| Replicate | FLUX 3 Video ajouté en preview ; catalogue complet non répliqué | [Fiche](https://replicate.com/black-forest-labs/flux-3/api), [Exemples](https://replicate.com/blog/flux-3) |
| Leonardo | Lucid Origin et choix image conservés ; derniers modèles vidéo non certifiés par cet adaptateur image | [API image](https://docs.leonardo.ai/reference/creategeneration), [Lucid](https://docs.leonardo.ai/docs/lucid-origin) |
| Krea | Krea 3 déjà présent | [Contrat](https://www.krea.ai/docs/developers/krea-3/overview) |
| Vidu | Q4 Preview déjà présent, limité au parcours avec image ; page générale rendue côté client | [Contrat Q4](https://platform.vidu.com/docs/api-reference/video-models/vidu-q4-preview/image-to-video) |
| PixVerse | V6 Max déjà présent | [Historique et renvoi à la matrice actuelle](https://docs.platform.pixverse.ai/changelog-2394996m0) |

## Vérifications

- 194 tests réussis dans dix fichiers : listes, transport/erreurs, fusion/préservation des réglages et requêtes média simulées, dont cinq scénarios des champs BFL.
- Trois tests d'intégration réels réussis contre les API publiques OpenRouter, Hugging Face et NVIDIA, sans clé et sans génération : chaque présélection est retournée par le parseur de Novera. Reproduction : `NOVERA_LIVE_CATALOG_TEST=1`, puis Vitest sur `web-app/src/lib/__tests__/publicCatalog.integration.test.ts`. Ces tests sont ignorés dans la suite hors ligne ordinaire.
- TypeScript réussi ; ESLint des sources de catalogue et du transport média réussi. Le fichier de tests est exclu par la configuration ESLint habituelle. Le lint global du grand écran fournisseur conserve ses défauts préexistants ; aucune réussite globale de lint n'est annoncée.
- Cinq builds Vite de l'interface réussis : Windows, macOS (`darwin`), Linux, Android et iOS. Aucun paquet natif ni exécution sur ces cinq OS n'est certifié.
- Validation structurelle des 104 catalogues : 2435 clés chacun, aucune erreur ; traduction de l'action Refresh présente partout. Aucun nouveau texte d'interface n'exige de traduction : les nouveaux modèles utilisent le catalogue commun et les actions déjà traduites.
- La suite web complète avait passé 7494 tests, 17 ignorés, avant ce lot API. Les 194 tests ciblés et les trois tests publics ci-dessus concernent l'état après ce lot ; ces résultats ne sont pas confondus.

Les clés, URL régionales/personnalisées, modèles importés et choix de l'utilisateur sont conservés. Les nouveaux choix seront disponibles après reconstruction/mise à jour ; une ancienne application publiée n'est pas modifiée. Il n'est pas affirmé que tous les produits de tous les fournisseurs sont pris en charge ni accessibles à chaque compte. La génération réelle des nouvelles variantes nécessite un compte autorisé et n'a pas été exécutée ici.
