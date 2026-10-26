<div align="center">
  <img src=".github/assets/novera-banner-en.png" alt="Novera — Knowledge for everyone. Cyan holographic hand above a connected world." width="100%" />
  <p><strong>Le savoir pour tous. Une IA qui avance avec son temps.</strong></p>
  <p>Un assistant IA indépendant porté par TRON-ABS, réunissant modèles locaux, fournisseurs cloud et outils évolutifs.</p>
  <p><strong>En développement</strong> · 70 langues et variantes d’interface · 27 fournisseurs cloud · Apache 2.0</p>
  <p>Contact officiel : <a href="mailto:contact.novera.tronabs@gmail.com">contact.novera.tronabs@gmail.com</a></p>
  <p><a href="#fournisseurs-cloud">Fournisseurs cloud</a> · <a href="#catalogue-de-modèles-hugging-face">Modèles locaux</a> · <a href="README.md">English</a> · <a href="docs/LANGUAGES.md">Langues</a> · <a href="ROADMAP.md">Feuille de route</a> · <a href="CONTRIBUTING.md">Contribuer</a></p>
</div>

---

## Pourquoi Novera

Notre objectif est de rendre le savoir et les capacités utiles de l’IA accessibles au plus grand nombre, quelles que soient la langue et l’expérience technique. Nous voulons développer un outil pour apprendre, créer et comprendre, avec l’éducation et les écoles dans notre ambition à long terme.

La direction du projet est claire : consolider les fondations, explorer rapidement les nouvelles capacités et transformer les expériences utiles en fonctions compréhensibles et accessibles.

## Les fondations

| Domaine | Présent dans les sources |
| --- | --- |
| IA locale et cloud | Un Hub relié directement à Hugging Face et 27 fournisseurs cloud prédéfinis. Les formats et modèles utilisables dépendent du moteur, du compte et du matériel. |
| Outils et documents | Des intégrations MCP, la recherche dans les documents et des fonctions d’assistant héritées du code existant. |
| Interface multilingue | 70 locales sélectionnables couvrant chacune les 1 587 clés anglaises actuelles. Relecture native encore nécessaire. |
| Application extensible | Une application de bureau avec des points d’extension pour les moteurs, les outils et les futures capacités. |

Ces éléments décrivent les sources. Des versions 1.0.0 antérieures ont été compilées et démarrées localement sous Windows x64. Les dernières sources attendent une nouvelle compilation du mainteneur ; la distribution publique et la validation sur davantage de matériels restent à préparer.

## Fournisseurs cloud

**27 fournisseurs cloud prédéfinis** dans les sources Novera, avec leurs icônes officielles embarquées. Les modèles disponibles dépendent du compte et de la région.

| | | |
| --- | --- | --- |
| <img src="web-app/public/images/model-provider/openai.svg" alt="OpenAI" width="28" height="28" /> [OpenAI](https://platform.openai.com/docs/models) | <img src="web-app/public/images/model-provider/azure.svg" alt="Azure" width="28" height="28" /> [Azure](https://oai.azure.com/deployments) | <img src="web-app/public/images/model-provider/anthropic.svg" alt="Anthropic" width="28" height="28" /> [Anthropic](https://platform.claude.com/docs/en/models/overview) |
| <img src="web-app/public/images/model-provider/open-router.svg" alt="OpenRouter" width="28" height="28" /> [OpenRouter](https://openrouter.ai/models) | <img src="web-app/public/images/model-provider/mistral.svg" alt="Mistral" width="28" height="28" /> [Mistral](https://docs.mistral.ai/models) | <img src="web-app/public/images/model-provider/groq.svg" alt="Groq" width="28" height="28" /> [Groq](https://console.groq.com/docs/models) |
| <img src="web-app/public/images/model-provider/xai.svg" alt="xAI" width="28" height="28" /> [xAI](https://docs.x.ai/developers/models) | <img src="web-app/public/images/model-provider/gemini.svg" alt="Gemini" width="28" height="28" /> [Gemini](https://ai.google.dev/gemini-api/docs/models) | <img src="web-app/public/images/model-provider/minimax.svg" alt="MiniMax" width="28" height="28" /> [MiniMax](https://platform.minimax.io/docs/api-reference/text-openai-api) |
| <img src="web-app/public/images/model-provider/huggingface.svg" alt="Hugging Face" width="28" height="28" /> [Hugging Face](https://huggingface.co/models?pipeline_tag=text-generation&inference_provider=all) | <img src="web-app/public/images/model-provider/nvidia.svg" alt="NVIDIA NIM" width="28" height="28" /> [NVIDIA NIM](https://build.nvidia.com/models) | <img src=".github/assets/providers/deepseek.png" alt="DeepSeek" width="28" height="28" /> [DeepSeek](https://api-docs.deepseek.com/) |
| <img src="web-app/public/images/model-provider/moonshot.png" alt="Kimi (Moonshot AI)" width="28" height="28" /> [Kimi (Moonshot AI)](https://platform.kimi.ai/docs/models) | <img src="web-app/public/images/model-provider/alibaba.png" alt="Alibaba Cloud (Qwen)" width="28" height="28" /> [Alibaba Cloud (Qwen)](https://www.alibabacloud.com/help/en/model-studio/models) | <img src="web-app/public/images/model-provider/cerebras.png" alt="Cerebras" width="28" height="28" /> [Cerebras](https://inference-docs.cerebras.ai/models/overview) |
| <img src="web-app/public/images/model-provider/together.svg" alt="Together AI" width="28" height="28" /> [Together AI](https://docs.together.ai/docs/serverless/models) | <img src="web-app/public/images/model-provider/fireworks.svg" alt="Fireworks AI" width="28" height="28" /> [Fireworks AI](https://docs.fireworks.ai/getting-started/models) | <img src="web-app/public/images/model-provider/perplexity.png" alt="Perplexity" width="28" height="28" /> [Perplexity](https://docs.perplexity.ai/docs/agent-api/models) |
| <img src=".github/assets/providers/meta.png" alt="Meta AI" width="28" height="28" /> [Meta AI](https://dev.meta.ai/docs/models) | <img src="web-app/public/images/model-provider/cohere.svg" alt="Cohere" width="28" height="28" /> [Cohere](https://docs.cohere.com/docs/models) | <img src="web-app/public/images/model-provider/zai.svg" alt="Z.ai" width="28" height="28" /> [Z.ai](https://docs.z.ai/guides/llm/glm-5.3) |
| <img src="web-app/public/images/model-provider/ai21.png" alt="AI21 Labs" width="28" height="28" /> [AI21 Labs](https://docs.ai21.com/docs/jamba-foundation-models) | <img src="web-app/public/images/model-provider/byteplus.png" alt="BytePlus (ByteDance)" width="28" height="28" /> [BytePlus (ByteDance)](https://docs.byteplus.com/en/docs/modelark/model-parameter-support) | <img src=".github/assets/providers/baidu.png" alt="Baidu Qianfan" width="28" height="28" /> [Baidu Qianfan](https://cloud.baidu.com/doc/qianfan/s/rmh4stp0j) |
| <img src=".github/assets/providers/tencent.png" alt="Tencent TokenHub" width="28" height="28" /> [Tencent TokenHub](https://cloud.tencent.com/document/product/1823/130078) | <img src="web-app/public/images/model-provider/bedrock.png" alt="Amazon Bedrock" width="28" height="28" /> [Amazon Bedrock](https://docs.aws.amazon.com/bedrock/latest/userguide/inference-chat-completions.html) | <img src="web-app/public/images/model-provider/watsonx.png" alt="IBM watsonx" width="28" height="28" /> [IBM watsonx](https://www.ibm.com/docs/en/watsonx/saas?topic=preview-inferencing-gateway-models) |

[Modèles récents et configuration](docs/USER_GUIDE.md#cloud) · [Provenance des icônes et marques](docs/DEVELOPMENT.md#logos)

## Catalogue de modèles Hugging Face

**Hugging Face : 3 187 159 dépôts de modèles, soit environ 3,19 millions**, relevés le **26 octobre 2026** ([catalogue global](https://huggingface.co/models)). Relevés par format : **214 900 dépôts GGUF**, **27 295 dépôts MLX** et **1 440 138 dépôts Safetensors** ([GGUF](https://huggingface.co/models?library=gguf), [MLX](https://huggingface.co/models?library=mlx), [Safetensors](https://huggingface.co/models?library=safetensors)), observés le **26 octobre 2026**. Ces comptes par format peuvent se recouper. Ces nombres incluent variantes et conversions ; ils ne mesurent ni les modèles distincts ni une compatibilité garantie avec Novera. Le moteur Safetensors de Novera exécute actuellement les architectures textuelles causales reconnues, depuis un dossier local complet ; le catalogue Safetensors contient aussi des modèles image, audio, des adaptateurs et des quantifications que ce moteur ne prend pas en charge.

Le Hub explore 23 entrées de navigation à partir des métadonnées Hugging Face, avec conseils matériels locaux et vérification avant téléchargement. Les modèles de la catégorie sélectionnée se chargent progressivement au défilement, avec ajout des résultats sous les lignes existantes. Les six présélections restent disponibles. Image, vidéo et autres tâches nécessitent encore leurs moteurs ; découvrir un modèle ne garantit pas son exécution. Les modèles textuels Safetensors utilisent le nouveau moteur local Transformers : voir les [capacités et limites testées](docs/SUIVI_MOTEURS.md). Les derniers correctifs de défilement progressif et de diagnostic attendent la compilation du mainteneur.

## 70 langues et variantes d’interface

Nos 19 contributions linguistiques sont intégrées aux 17 locales héritées et à 34 nouveaux catalogues Novera. Les dix derniers sont ouzbek du Nord, zoulou, arabe saïdi, pachto du Nord, oromo du Centre-Ouest, saraiki, néerlandais, somali, roumain et assamais. **Les 70 catalogues couvrent chacun les 1 587 clés anglaises actuelles (100 %)**, y compris le wu / shanghaïen. Les dernières 9 219 entrées des locales héritées et 757 entrées wu ont été complétées le 25 octobre 2026. Ce chiffre mesure la présence des clés ; une relecture par des locuteurs natifs reste nécessaire. La compilation Windows locale terminée le 26 octobre inclut ces traductions ; aucun binaire public n’est publié. Certains catalogues sont des variantes éditoriales fondées en partie sur des textes techniques écrits communs ; leur adaptation vernaculaire intégrale reste ouverte. Le guide des langues précise leur périmètre.

L’arabe standard, l’arabe égyptien, l’arabe levantin, l’arabe soudanais, l’arabe algérien, l’arabe marocain, l’arabe saïdi, le pachto du Nord, le saraiki, le sindhi, le dari, l’ourdou, le pendjabi occidental et le persan iranien bénéficient du support de l’écriture de droite à gauche. Les capacités linguistiques des modèles dépendent du modèle choisi et sont distinctes de la traduction de l’interface.

**[Consulter toutes les langues, leurs noms et leur couverture →](docs/LANGUAGES.md)**

## État du projet

**Novera 1.0.0 est en développement ; aucun binaire public n’est encore publié.** Les sources intègrent 35 corrections Windows, 70 catalogues complets en clés (1 587 chacun), le Hub adaptatif, le moteur textuel local Safetensors/Transformers et les fournisseurs cloud actualisés. La relecture native des traductions reste nécessaire.

Le premier démarrage sauvegarde la langue système, propose LFM2.5-2.6B Q6_K sur desktop avec DSpark facultatif, et demande séparément le suivi des erreurs, désactivé par défaut. Les sources et les binaires sont suivis séparément ; les derniers correctifs du Hub attendent la compilation du mainteneur. Voir [le tableau de bord](TABLEAU_DE_BORD_NOVERA.md) pour les validations et limites exactes. GitHub Actions et mises à jour automatiques restent désactivés.

## Documentation et contribution

- [Guide utilisateur](docs/USER_GUIDE.md) : démarrage, modèles, discussions et confidentialité.
- [Développement](docs/DEVELOPMENT.md) et [construction/distribution](docs/BUILD_AND_RELEASE.md).
- [Langues](docs/LANGUAGES.md), [feuille de route](ROADMAP.md), [historique](docs/CHANGELOG.md) et [contribuer](CONTRIBUTING.md).

## Identité et licence

Novera est maintenu par **TRON-ABS** dans [ce dépôt](https://github.com/TRON-ABS/Novera). [Politique d’identité](BRANDING.md), [versions officielles](OFFICIAL_RELEASES.md).

Novera s’appuie sur [Jan](https://github.com/janhq/jan), créé par Menlo Research et ses contributeurs. Les attributions d’origine, celles des projets tiers et la [licence Apache 2.0](LICENSE) sont conservées. Les téléchargements Jan ne sont pas des versions Novera.
