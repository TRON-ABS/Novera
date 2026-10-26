<div align="center">
  <img src=".github/assets/novera-banner-en.png" alt="Novera — Knowledge for everyone. Cyan holographic hand above a connected world." width="100%" />
  <p><strong>Knowledge for everyone. AI that keeps moving forward.</strong></p>
  <p>An independent AI assistant by TRON-ABS, bringing local models, cloud providers and evolving tools into one project.</p>
  <p><strong>In development</strong> · 70 interface language options · 27 cloud providers · Apache 2.0</p>
  <p>Official contact: <a href="mailto:contact.novera.tronabs@gmail.com">contact.novera.tronabs@gmail.com</a></p>
  <p>
    <a href="#cloud-providers">Cloud providers</a> ·
    <a href="#hugging-face-model-catalog">Local models</a> ·
    <a href="README.fr.md">Français</a> ·
    <a href="docs/LANGUAGES.md">Languages</a> ·
    <a href="ROADMAP.md">Roadmap</a> ·
    <a href="CONTRIBUTING.md">Contribute</a>
  </p>
</div>

---

## Why Novera

Our goal is to make knowledge and useful AI capabilities accessible to as many people as possible, across languages and levels of technical experience. We want Novera to grow into a tool for learning, creating and understanding, with education and schools part of its long-term direction.

We are building around a clear product direction: keep a dependable foundation, explore new capabilities quickly, and turn useful experiments into features people can understand and use.

## The foundation

| Area | What the source includes |
| --- | --- |
| Local and cloud AI | Local model engines alongside connections to remote model providers. Compatibility depends on the model, provider and hardware. |
| Tools and documents | MCP integrations, document retrieval and assistant workflows inherited from the existing codebase. |
| Multilingual interface | 70 selectable locales, each covering all 1,587 current English keys. Native-speaker review remains pending. |
| An extensible application | A desktop application with extension points for model engines, tools and future capabilities. |

These describe the source foundation. Earlier 1.0.0 builds were compiled and launched locally on Windows x64. The latest source changes await a new maintainer build; public packaging and broader runtime validation remain in preparation.

## Cloud providers

**27 predefined cloud providers** in the Novera source, with their official bundled icons. Available models depend on your account and region.

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

[Current models and setup](docs/USER_GUIDE.md#cloud) · [Icon provenance and trademarks](docs/DEVELOPMENT.md#logos)

## Hugging Face model catalog

**Hugging Face: 3,187,159 model repositories, about 3.19 million**, observed on **26 October 2026** ([global catalog](https://huggingface.co/models)). This includes **214,900 GGUF repositories** and **27,295 MLX repositories** ([GGUF](https://huggingface.co/models?library=gguf), [MLX](https://huggingface.co/models?library=mlx)). Counts include versions and conversions; they do not represent distinct models or guaranteed Novera compatibility.

The Hub explores 23 navigation categories using Hugging Face metadata, with local hardware advice and a review before downloading. Models in the selected category load progressively as you scroll, with new results appended below existing rows. The six Novera presets remain available. Discovery does not imply execution support: image, video and other tasks still need their own engines. Safetensors text models use the new local Transformers engine; see [tested capabilities and limitations](docs/SUIVI_MOTEURS.md). The latest progressive-scrolling and compatibility-label fixes require a new build, which the maintainer will perform.

## 70 interface language options

All 19 of our language contributions are integrated alongside the 17 inherited locales and 34 new Novera catalogs. The latest ten are Northern Uzbek, Zulu, Saidi Arabic, Northern Pashto, West Central Oromo, Saraiki, Dutch, Somali, Romanian and Assamese. **All 70 catalogs cover 1,587 / 1,587 current English keys (100%)**, including Wu / Shanghainese. The last 9,219 inherited-locale entries and 757 Wu entries were completed on 25 October 2026. This measures key coverage; native-speaker review remains outstanding. The local Windows build completed on 26 October includes these translations; no public binary has been released. Some catalogs are editorial variants partly based on shared written technical text; full vernacular adaptation remains open. See the language guide for their exact scope.

Arabic, Egyptian Arabic, Levantine Arabic, Sudanese Arabic, Algerian Arabic, Moroccan Arabic, Saidi Arabic, Northern Pashto, Saraiki, Sindhi, Dari, Urdu, Western Punjabi and Iranian Persian include right-to-left interface support. Model language capabilities depend on the selected model and are separate from interface localization.

**[Explore every language, native label and coverage level →](docs/LANGUAGES.md)**

## Project status

**Novera 1.0.0 is in development; no public binary is available yet.** The source includes 35 Windows fixes, 70 interface catalogs with complete key coverage (1,587 keys each), the adaptive model Hub, the local Safetensors/Transformers text engine and updated cloud-provider presets. Native-language review is still needed.

First launch saves the system language, recommends LFM2.5-2.6B Q6_K on desktop with optional DSpark, and asks separately about error reporting, off by default. Source changes and compiled artifacts are tracked separately; the latest Hub fixes await the maintainer’s build. See the [dashboard](TABLEAU_DE_BORD_NOVERA.md) for exact validation and limitations. GitHub Actions and automatic updates remain disabled.

## Documentation and contributions

- [User guide](docs/USER_GUIDE.md): setup, models, conversations and privacy.
- [Development](docs/DEVELOPMENT.md) and [build/release guide](docs/BUILD_AND_RELEASE.md).
- [Languages](docs/LANGUAGES.md), [roadmap](ROADMAP.md), [changelog](docs/CHANGELOG.md) and [contribution guide](CONTRIBUTING.md).

## Identity and license

Novera is maintained by **TRON-ABS** in [this repository](https://github.com/TRON-ABS/Novera). See the [identity policy](BRANDING.md) and [official release policy](OFFICIAL_RELEASES.md).

Novera builds on [Jan](https://github.com/janhq/jan), created by Menlo Research and its contributors. Original and third-party attributions and the [Apache 2.0 license](LICENSE) are retained. Jan downloads are not Novera releases.
