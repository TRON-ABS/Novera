<div align="center">
  <img src=".github/assets/novera-banner-en.png" alt="Novera — Knowledge for everyone" width="100%" />
  <p><strong>You describe. Novera prepares, runs and organizes.</strong></p>
  <p>An independent AI assistant by TRON-ABS, from first launch to results: text, images, music and video in one conversation.</p>
  <p><strong>In development</strong> · 80 interface languages · 42 cloud providers · 49 media presets · Apache 2.0</p>
  <p><a href="#from-first-launch-to-results">Automation</a> · <a href="#one-dashboard-for-every-creation">Dashboard</a> · <a href="#local-models-in-use">Local models</a> · <a href="#cloud-providers">Cloud</a> · <a href="README.fr.md">Français</a> · <a href="CONTRIBUTING.md">Contribute</a></p>
  <p>Official contact: <a href="mailto:contact.novera.tronabs@gmail.com">contact.novera.tronabs@gmail.com</a></p>
</div>

---

## One dashboard for every creation

![Novera generated image and unified dashboard with quantity, seed, upscaling and automatic memory](.github/assets/novera-dashboard-2026-10-29.png)

*Real Windows application screenshot supplied by the maintainer on 29 October 2026. It shows an image and the controls used to create it; this is not a mockup.*

One panel, five modes: **Auto, Text, Image, Music and Video**. Controls follow the selected mode: ratio, resolution, duration, cadence, quality, instrumental, lyrics, seed and quantity. Panel width and buttons adapt to the window and translated labels.

- **1–10 sequential generations**, defaulting to 1, with independent quantities for image, music and video. Stop cancels the active task and the remaining queue.
- **Random, fixed, +1 and −1 seeds**, preset or custom ratios and optional **Real-ESRGAN ×2/×4** upscaling with final dimensions displayed.
- The selected model, automatic memory, attachments, instructions, web search and tools stay in the same bar. Tools depend on model capabilities and granted access.

## From first launch to results

**Our automation connects preparation to the complete execution workflow.** Novera handles the technical steps available for the selected configuration, while keeping advanced controls accessible.

| Step | What Novera handles |
| --- | --- |
| **1. Start** | Selects a supported system language at first launch and saves your preference. Presents starting models and useful hardware information. |
| **2. Prepare** | Guided installation offers text, embeddings, image, music, video and upscaling. It previews components, sizes and free space before your approval, then tracks downloads with progress, pause/resume and SHA-256 verification. |
| **3. Configure** | Registers models and their components, prepares the relevant profiles and reports required dependencies. Retrieval embeddings start on CPU with a saved CPU/GPU choice. New music profiles default to instrumental mode. |
| **4. Understand the request** | Auto routes recognized creation requests to text, image, music or video. You can also explicitly select the output mode and a local or cloud model. |
| **5. Execute** | Automatic memory waits for active work, releases unneeded models and reloads required resources. A 1–10 job series runs in order and releases resources before the next job. Cloud providers use the selected account and configuration. |
| **6. Retrieve and reuse** | Saves media in Novera system folders, displays results and available timings, then offers variants, the library, copying, exports or system sharing. Sending to another application remains your action. |

Automation covers integrated engines and workflows; it does not make every Hub model executable. Hardware, installed components and provider access determine what can run. Folders, file changes and shell commands follow the conversation's access grants.

[User guide](docs/USER_GUIDE.md) · [Engines and validation](docs/SUIVI_MOTEURS.md) · [Development](docs/DEVELOPMENT.md)

## Capabilities in the source

| Area | Features |
| --- | --- |
| **Text and vision** | Conversation, document attachments, streamed replies and local or cloud models. Vision depends on the model; understanding and generating images are separate capabilities. |
| **Image** | In-conversation generation, seeds, ratios, resolution, GGUF/Safetensors components, configured Diffusers folders and the supported native NVFP4 CUDA profile. |
| **Music** | Local or cloud generation, duration, quality, instrumental or vocals where supported, structured lyrics and an audio player. Provider options differ. |
| **Video** | Local or cloud generation, duration, frame count/cadence for local profiles, ratios, resolution and a video player. |
| **Search and tools** | Web search, embedding-based document retrieval, MCP, workspaces and local tools according to model support and granted access. |
| **Results and sharing** | Media library, variants, response/conversation exports, documents and original media, printing/PDF and platform-dependent system sharing. |
| **Resource management** | Automatic memory enabled by default, CPU/GPU settings for supported components and manual profiles when resources allow. |

## Local models in use

These models form the current guided configuration. You can import other compatible models or change the profiles.

| Role | Model / configured components |
| --- | --- |
| **Text — first-run model** | **Nemotron-3.5-Bolt-E4B**, file `Nemotron-3.5-Bolt-E4B-Q4_K_M.gguf`. |
| **Document retrieval** | **Qwen3-Embedding-0.6B Q8_0**, **CPU by default**, with a saved CPU/GPU choice. |
| **Image** | **FLUX.2 Klein 4B Q4_K_M**, **Qwen3-4B Q4_K_M** encoder and official FLUX.2 VAE. |
| **Image — hardware option** | **FLUX.2 Klein 4B NVFP4**, through the native CUDA path when the GPU and environment are compatible. |
| **Music** | **ACE-Step 1.5 Turbo 2B Q4_K_M**, `acestep-5Hz-lm-1.7B-Q8_0.gguf` planner, dedicated Qwen music encoder and VAE. |
| **Video** | **Wan2.1 T2V 1.3B Q4_K_M**, **UMT5-XXL Q4_K_M** encoder and Wan 2.1 VAE. |
| **Upscaling** | Optional **Real-ESRGAN ×2 and ×4**, with dependency checks. |

The Qwen music encoder and the Qwen retrieval model are **different files**, stored separately. Model licenses remain those of their publishers.

[Text manifest](web-app/src/constants/text-manifest.json) · [Embeddings](web-app/src/constants/embedding-manifest.json) · [Music](web-app/src/constants/music-manifest.json) · [Image/video components](src-tauri/src/core/creation_bundle.rs)

## Cloud providers

**42 provider profiles** are integrated. **ElevenLabs** now appears in the showcase alongside the music routes from Stability AI, fal and Replicate.

| | | |
| --- | --- | --- |
| <img src="web-app/public/images/model-provider/openai.svg" alt="OpenAI" width="28" height="28" /> [OpenAI](https://platform.openai.com/docs/models) | <img src="web-app/public/images/model-provider/azure.svg" alt="Microsoft Azure" width="28" height="28" /> [Microsoft Azure](https://oai.azure.com/deployments) | <img src="web-app/public/images/model-provider/anthropic.svg" alt="Anthropic" width="28" height="28" /> [Anthropic](https://platform.claude.com/docs/en/models/overview) |
| <img src="web-app/public/images/model-provider/open-router.svg" alt="OpenRouter" width="28" height="28" /> [OpenRouter](https://openrouter.ai/models) | <img src="web-app/public/images/model-provider/mistral.svg" alt="Mistral" width="28" height="28" /> [Mistral](https://docs.mistral.ai/models) | <img src="web-app/public/images/model-provider/groq.svg" alt="Groq" width="28" height="28" /> [Groq](https://console.groq.com/docs/models) |
| <img src="web-app/public/images/model-provider/xai.svg" alt="xAI" width="28" height="28" /> [xAI](https://docs.x.ai/developers/models) | <img src="web-app/public/images/model-provider/gemini.svg" alt="Google Gemini" width="28" height="28" /> [Google Gemini](https://ai.google.dev/gemini-api/docs/models) | <img src="web-app/public/images/model-provider/minimax.svg" alt="MiniMax" width="28" height="28" /> [MiniMax](https://platform.minimax.io/docs/api-reference/text-openai-api) |
| <img src="web-app/public/images/model-provider/huggingface.svg" alt="Hugging Face" width="28" height="28" /> [Hugging Face](https://huggingface.co/models?pipeline_tag=text-generation&inference_provider=all) | <img src="web-app/public/images/model-provider/nvidia.svg" alt="NVIDIA NIM" width="28" height="28" /> [NVIDIA NIM](https://build.nvidia.com/models) | <img src=".github/assets/providers/deepseek.png" alt="DeepSeek" width="28" height="28" /> [DeepSeek](https://api-docs.deepseek.com/) |
| <img src="web-app/public/images/model-provider/moonshot.png" alt="Kimi · Moonshot AI" width="28" height="28" /> [Kimi · Moonshot AI](https://platform.kimi.ai/docs/models) | <img src="web-app/public/images/model-provider/alibaba.png" alt="Alibaba Cloud · Qwen" width="28" height="28" /> [Alibaba Cloud · Qwen](https://www.alibabacloud.com/help/en/model-studio/models) | <img src="web-app/public/images/model-provider/cerebras.png" alt="Cerebras" width="28" height="28" /> [Cerebras](https://inference-docs.cerebras.ai/models/overview) |
| <img src="web-app/public/images/model-provider/together.svg" alt="Together AI" width="28" height="28" /> [Together AI](https://docs.together.ai/docs/serverless/models) | <img src="web-app/public/images/model-provider/fireworks.svg" alt="Fireworks AI" width="28" height="28" /> [Fireworks AI](https://docs.fireworks.ai/getting-started/models) | <img src="web-app/public/images/model-provider/perplexity.png" alt="Perplexity" width="28" height="28" /> [Perplexity](https://docs.perplexity.ai/docs/agent-api/models) |
| <img src=".github/assets/providers/meta.png" alt="Meta AI" width="28" height="28" /> [Meta AI](https://dev.meta.ai/docs/models) | <img src="web-app/public/images/model-provider/cohere.svg" alt="Cohere" width="28" height="28" /> [Cohere](https://docs.cohere.com/docs/models) | <img src="web-app/public/images/model-provider/zai.svg" alt="Z.ai" width="28" height="28" /> [Z.ai](https://docs.z.ai/guides/llm/glm-5.3) |
| <img src="web-app/public/images/model-provider/ai21.png" alt="AI21 Labs" width="28" height="28" /> [AI21 Labs](https://docs.ai21.com/docs/jamba-foundation-models) | <img src="web-app/public/images/model-provider/byteplus.png" alt="BytePlus · ByteDance" width="28" height="28" /> [BytePlus · ByteDance](https://docs.byteplus.com/en/docs/modelark/model-parameter-support) | <img src=".github/assets/providers/baidu.png" alt="Baidu Qianfan" width="28" height="28" /> [Baidu Qianfan](https://cloud.baidu.com/doc/qianfan/s/rmh4stp0j) |
| <img src=".github/assets/providers/tencent.png" alt="Tencent TokenHub" width="28" height="28" /> [Tencent TokenHub](https://cloud.tencent.com/document/product/1823/130078) | <img src="web-app/public/images/model-provider/bedrock.png" alt="Amazon Bedrock" width="28" height="28" /> [Amazon Bedrock](https://docs.aws.amazon.com/bedrock/latest/userguide/inference-chat-completions.html) | <img src="web-app/public/images/model-provider/watsonx.png" alt="IBM watsonx" width="28" height="28" /> [IBM watsonx](https://www.ibm.com/docs/en/watsonx/saas?topic=preview-inferencing-gateway-models) |
| <img src="web-app/public/images/model-provider/elevenlabs.png" alt="ElevenLabs" width="28" height="28" /> [ElevenLabs](https://elevenlabs.io/docs/api-reference/music/compose) | <img src="web-app/public/images/model-provider/bfl.png" alt="Black Forest Labs" width="28" height="28" /> [Black Forest Labs](https://docs.bfl.ai/quick_start/generating_images) | <img src="web-app/public/images/model-provider/stability.png" alt="Stability AI" width="28" height="28" /> [Stability AI](https://docs.stability.ai/api-reference) |
| <img src="web-app/public/images/model-provider/recraft.png" alt="Recraft" width="28" height="28" /> [Recraft](https://www.recraft.ai/docs/api-reference/agents.md) | <img src="web-app/public/images/model-provider/ideogram.png" alt="Ideogram" width="28" height="28" /> [Ideogram](https://developer.ideogram.ai/ideogram-api/api-overview) | <img src="web-app/public/images/model-provider/adobe-firefly.png" alt="Adobe Firefly" width="28" height="28" /> [Adobe Firefly](https://developer.adobe.com/firefly-services/docs/firefly-api/) |
| <img src="web-app/public/images/model-provider/runway.png" alt="Runway" width="28" height="28" /> [Runway](https://docs.dev.runwayml.com/api/) | <img src="web-app/public/images/model-provider/luma.png" alt="Luma" width="28" height="28" /> [Luma](https://docs.agents.lumalabs.ai/guides/model/) | <img src="web-app/public/images/model-provider/ltx.png" alt="LTX (Lightricks)" width="28" height="28" /> [LTX (Lightricks)](https://docs.ltx.io/models) |
| <img src="web-app/public/images/model-provider/fal.png" alt="fal" width="28" height="28" /> [fal](https://fal.ai/docs/documentation/model-apis/inference/queue) | <img src="web-app/public/images/model-provider/replicate.png" alt="Replicate" width="28" height="28" /> [Replicate](https://replicate.com/docs/reference/http) | <img src="web-app/public/images/model-provider/leonardo.png" alt="Leonardo.Ai" width="28" height="28" /> [Leonardo.Ai](https://docs.leonardo.ai/reference/creategeneration) |
| <img src="web-app/public/images/model-provider/krea.png" alt="Krea" width="28" height="28" /> [Krea](https://www.krea.ai/docs/developers/krea-3/overview) | <img src="web-app/public/images/model-provider/vidu.png" alt="Vidu" width="28" height="28" /> [Vidu](https://platform.vidu.com/docs/model-map) | <img src="web-app/public/images/model-provider/pixverse.png" alt="PixVerse" width="28" height="28" /> [PixVerse](https://docs.platform.pixverse.ai/changelog-2394996m0) |

### Image, music and video

**20 providers expose generation routes**, with **49 presets: 25 image, 20 video and 4 music**. Music routes are **ElevenMusic v2.5**, **Stable Audio 3**, **ACE-Step through fal** and **Stable Audio 2.5 through Replicate**.

| Provider | Outputs in Novera | Catalog models |
| --- | --- | --- |
| <img src="web-app/public/images/model-provider/elevenlabs.png" alt="ElevenLabs" width="24" height="24" /> [ElevenLabs](https://elevenlabs.io/docs/api-reference/music/compose) | Music | `ElevenMusic v2.5` |
| <img src="web-app/public/images/model-provider/stability.png" alt="Stability AI" width="24" height="24" /> [Stability AI](https://docs.stability.ai/api-reference/stable-audio/text-to-audio) | Image / Music | `Stable Audio 3` · `Stable Image Ultra` · `Stable Image Core` |
| <img src="web-app/public/images/model-provider/fal.png" alt="fal" width="24" height="24" /> [fal](https://fal.ai/models/fal-ai/ace-step/api) | Image / Music / Video | `ACE-Step · cloud` · `Pika 2.2 · fal` · `Qwen Image 2512 · fal` · `FLUX.2 Max · fal` · `Kling 3 Pro · fal` · `Kling 3 Standard · fal` |
| <img src="web-app/public/images/model-provider/replicate.png" alt="Replicate" width="24" height="24" /> [Replicate](https://replicate.com/stability-ai/stable-audio-2.5/api/schema) | Image / Music | `Stable Audio 2.5 · Replicate` · `FLUX.2 Max · Replicate` |
| <img src="web-app/public/images/model-provider/byteplus.png" alt="BytePlus · ByteDance" width="24" height="24" /> [BytePlus · ByteDance](https://docs.byteplus.com/en/docs/ModelArk/image-generation-api) | Image / Video | `Dola Seedream 5 Pro` · `Dreamina Seedance 2.5` |
| <img src="web-app/public/images/model-provider/adobe-firefly.png" alt="Adobe Firefly" width="24" height="24" /> [Adobe Firefly](https://developer.adobe.com/firefly-services/docs/firefly-api/api/) | Image / Video | `Adobe Firefly Image 5` · `Adobe Firefly Video` |
| <img src="web-app/public/images/model-provider/gemini.svg" alt="Google Gemini" width="24" height="24" /> [Google Gemini](https://ai.google.dev/gemini-api/docs/omni) | Image / Video | `Gemini Omni 1.1 Flash` · `Gemini Nano Banana 2.1` |
| <img src="web-app/public/images/model-provider/krea.png" alt="Krea" width="24" height="24" /> [Krea](https://www.krea.ai/docs/developers/krea-3/overview.md) | Image | `Krea 3` |
| <img src="web-app/public/images/model-provider/leonardo.png" alt="Leonardo.Ai" width="24" height="24" /> [Leonardo.Ai](https://docs.leonardo.ai/docs/lucid-origin) | Image | `Lucid Origin` · `Krea 2 Turbo · Leonardo` · `Ideogram 3 · Leonardo` |
| <img src="web-app/public/images/model-provider/vidu.png" alt="Vidu" width="24" height="24" /> [Vidu](https://platform.vidu.com/docs/api-reference/video-models/vidu-q4-preview/image-to-video) | Video | `Vidu Q4 Preview` · `Vidu Q3 Pro` · `Vidu Q3 Turbo` |
| <img src="web-app/public/images/model-provider/openai.svg" alt="OpenAI" width="24" height="24" /> [OpenAI](https://developers.openai.com/api/docs/guides/image-generation) | Image | `GPT Image 2.5 Sunburst` · `GPT Image 2.5 Flare` |
| <img src="web-app/public/images/model-provider/xai.svg" alt="xAI" width="24" height="24" /> [xAI](https://docs.x.ai/developers/model-capabilities/imagine) | Image / Video | `Grok Imagine Image 2.0` · `Grok Imagine Video 1.5` · `Grok Imagine Video 1.5 Lite` |
| <img src="web-app/public/images/model-provider/bfl.png" alt="Black Forest Labs" width="24" height="24" /> [Black Forest Labs](https://docs.bfl.ai/quick_start/generating_images) | Image | `FLUX.2 [max]` · `FLUX.2 [pro]` · `FLUX.2 [klein] 9B` |
| <img src="web-app/public/images/model-provider/recraft.png" alt="Recraft" width="24" height="24" /> [Recraft](https://www.recraft.ai/docs/api-reference/agents.md) | Image | `Recraft V4.1` · `Recraft V4.1 Flash` · `Recraft V4.1 Pro` |
| <img src="web-app/public/images/model-provider/ideogram.png" alt="Ideogram" width="24" height="24" /> [Ideogram](https://developer.ideogram.ai/ideogram-api/api-overview) | Image | `Ideogram 4.5` |
| <img src="web-app/public/images/model-provider/runway.png" alt="Runway" width="24" height="24" /> [Runway](https://docs.dev.runwayml.com/api/) | Video | `Runway Gen-4.5` |
| <img src="web-app/public/images/model-provider/luma.png" alt="Luma" width="24" height="24" /> [Luma](https://docs.agents.lumalabs.ai/guides/model/) | Image / Video | `Luma Uni-1 Max` · `Luma Uni-1` · `Luma Ray 3.2` |
| <img src="web-app/public/images/model-provider/ltx.png" alt="LTX (Lightricks)" width="24" height="24" /> [LTX (Lightricks)](https://docs.ltx.io/models) | Video | `LTX-2.5 Pro` · `LTX-2.5 Fast` |
| <img src="web-app/public/images/model-provider/minimax.svg" alt="MiniMax" width="24" height="24" /> [MiniMax](https://platform.minimax.io/docs/api-reference/video-generation-v2-create) | Image / Video | `MiniMax H3 Max` · `MiniMax H3` · `MiniMax H3 Highspeed` · `MiniMax Image-01` |
| <img src="web-app/public/images/model-provider/pixverse.png" alt="PixVerse" width="24" height="24" /> [PixVerse](https://docs.platform.pixverse.ai/changelog-2394996m0) | Video | `PixVerse V6 Max` · `PixVerse V6` |

<details>
<summary><strong>Show text and vision model shortlists by provider</strong></summary>

| Provider | Model IDs offered in the source |
| --- | --- |
| [OpenAI](https://platform.openai.com/docs/models) | `gpt-6.1-sol` · `gpt-6-astra` · `gpt-6-luna` · `gpt-6-sol` |
| [Microsoft Azure](https://oai.azure.com/deployments) | Account-specific deployment or gateway |
| [Anthropic](https://platform.claude.com/docs/en/models/overview) | `claude-sonnet-5-5` · `claude-opus-5-5` · `claude-fable-5-1` · `claude-haiku-5-5` |
| [OpenRouter](https://openrouter.ai/models) | `moonshotai/kimi-k3.1-pro` · `minimax/minimax-m3.1-flash` · `deepseek/deepseek-v4.1-flash-1017` · `nvidia/nemotron-3.5-super-vl:free` |
| [Mistral](https://docs.mistral.ai/models) | `mistral-large-4` · `mistral-medium-3-5` · `mistral-small-2603` · `ministral-3b-2512` |
| [Groq](https://console.groq.com/docs/models) | `openai/gpt-oss-120b` · `openai/gpt-oss-20b` · `llama-3.3-70b-versatile` · `llama-3.1-8b-instant` |
| [xAI](https://docs.x.ai/developers/models) | `grok-4.7` |
| [Google Gemini](https://ai.google.dev/gemini-api/docs/models) | `gemini-4-argon` · `gemini-3.8-flash` · `gemini-3.6-flash` · `gemini-3.5-flash-lite` |
| [MiniMax](https://platform.minimax.io/docs/api-reference/text-openai-api) | `MiniMax-M3.1-Flash` · `MiniMax-M3` |
| [Hugging Face](https://huggingface.co/models?pipeline_tag=text-generation&inference_provider=all) | `deepseek-ai/DeepSeek-V4.1-Flash-1017` · `Qwen/Qwen3.8-27B` · `moonshotai/Kimi-K3` · `zai-org/GLM-5.3` |
| [NVIDIA NIM](https://build.nvidia.com/models) | `minimaxai/minimax-m3.1-flash` · `deepseek-ai/deepseek-v4.1-flash` · `nvidia/nemotron-3.5-super-vl-120b-a12b` · `nvidia/nemotron-3.5-lightning-30b-a3b` · `z-ai/glm-5.3` |
| [DeepSeek](https://api-docs.deepseek.com/) | `deepseek-flash` · `deepseek-v4-pro` |
| [Kimi · Moonshot AI](https://platform.kimi.ai/docs/models) | `kimi-k3.1-pro` · `kimi-k3.1-pro-highspeed` · `kimi-k3` |
| [Alibaba Cloud · Qwen](https://www.alibabacloud.com/help/en/model-studio/models) | `qwen3.8-max` · `qwen3.7-plus` · `qwen3.8-flash` |
| [Cerebras](https://inference-docs.cerebras.ai/models/overview) | `qwen-3.8-27b` · `gpt-oss-120b` |
| [Together AI](https://docs.together.ai/docs/serverless/models) | `deepseek-ai/DeepSeek-V4.1-Flash-1017` · `moonshotai/Kimi-K3` · `Qwen/Qwen3.8-Flash` · `Qwen/Qwen3.8-2.4T-A95B` |
| [Fireworks AI](https://docs.fireworks.ai/getting-started/models) | `accounts/fireworks/models/deepseek-v4p1-flash-1017` · `accounts/fireworks/models/kimi-k3` · `accounts/fireworks/models/minimax-m3` |
| [Perplexity](https://docs.perplexity.ai/docs/agent-api/models) | `perplexity/sonar` · `openai/gpt-6.1-sol` · `google/gemini-4-argon` · `perplexity/kimi-k3` |
| [Meta AI](https://dev.meta.ai/docs/models) | `muse-wonder-1.0` · `muse-spark-1.3` |
| [Cohere](https://docs.cohere.com/docs/models) | `command-a-plus-05-2026` |
| [Z.ai](https://docs.z.ai/guides/llm/glm-5.3) | `glm-5.3` · `glm-5.3-flash` · `glm-5.3-flashx` |
| [AI21 Labs](https://docs.ai21.com/docs/jamba-foundation-models) | `jamba-large` · `jamba-mini-2` |
| [BytePlus · ByteDance](https://docs.byteplus.com/en/docs/modelark/model-parameter-support) | `dola-seed-2-1-turbo-260628` |
| [Baidu Qianfan](https://cloud.baidu.com/doc/qianfan/s/rmh4stp0j) | `ernie-5.1` |
| [Tencent TokenHub](https://cloud.tencent.com/document/product/1823/130078) | `hy4-preview` |
| [Amazon Bedrock](https://docs.aws.amazon.com/bedrock/latest/userguide/inference-chat-completions.html) | `openai.gpt-6.1-sol` |
| [IBM watsonx](https://www.ibm.com/docs/en/watsonx/saas?topic=preview-inferencing-gateway-models) | Account-specific deployment or gateway |

</details>

Inventory checked against the source on **29 October 2026**. These names describe Novera presets, not guaranteed access for every account. Remote catalogs, regions, licenses, quotas and billing remain provider-specific. Compatible profiles can refresh their catalogs; Azure and some gateways use account deployments. Cloud contracts have simulated tests; no paid generation was performed for this showcase update.

[Media catalog](web-app/src/constants/mediaProviders.ts) · [Text/vision models](web-app/src/constants/cloudModels.ts) · [Cloud setup](docs/USER_GUIDE.md#cloud) · [Icon provenance](docs/DEVELOPMENT.md#logos)

## Hub and compatible models

Explore Hugging Face Hub categories, **GGUF, MLX and Safetensors** formats, model roles and hardware advice before downloading. Results load progressively as you scroll. Engines include llama.cpp, MLX on supported platforms and Transformers for recognized text architectures; image and video use their own engines and components.

A catalog listing does not guarantee compatibility or execution on your hardware. See the actual tested workflows in [engine tracking](docs/SUIVI_MOTEURS.md).

## 80 interface languages and variants

**All 80 catalogs cover the current 2,400 English keys** across 15 namespaces, including menus, configurations, settings, help and media controls. Plural forms and interface direction follow the selected language. Response and voice languages depend separately on the model.

This technical coverage does not certify linguistic quality: **native review and regional adaptation remain necessary**. See native labels and known limits in the [language guide](docs/LANGUAGES.md) and [audit report](deliverables/interface-audit-2026-10-29/RAPPORT.md).

## Helping people, in every sector

Beyond school and education, our ambition is to help people learn, solve problems, create and develop useful projects worldwide. Novera aims to make current AI advances easier to understand and use, across languages, levels of experience and available hardware.

| Sectors we want to help develop | Examples of useful contributions |
| --- | --- |
| Schools, education and lifelong learning | Explain concepts, adapt learning materials and support teachers, students and families. |
| Research, science and space | Explore literature, explain methods, analyse data and share knowledge. |
| Health, care and social support | Make information easier to understand and support research and professional workflows. |
| Agriculture, food and rural communities | Share practical knowledge, support planning and develop locally useful tools. |
| Environment, climate, water and biodiversity | Explain evidence, support observation and help communities plan projects. |
| Energy, industry, construction and crafts | Support documentation, design, maintenance, technical learning and process improvement. |
| Businesses, commerce, finance and employment | Help organise work, understand information, develop projects and learn professional skills. |
| Public services, law and civic participation | Make documents and procedures easier to understand and information easier to access. |
| Computing, cybersecurity, robotics and telecommunications | Help develop software, understand systems and build useful tools. |
| Arts, culture, media, languages and heritage | Support writing, translation, images, video, creative projects and cultural sharing. |
| Transport, logistics, tourism, sport and community life | Help with planning, communication, learning and local initiatives. |
| Accessibility, humanitarian work and everyday life | Reduce language and knowledge barriers and support people with practical assistance. |

These are directions for contribution and development, not a claim that every sector-specific application is already delivered or validated. We want simple guidance for everyday use, clear advanced options when needed, transparent hardware and cloud requirements, and collaboration with the people who know each field and local context.

## Project status

**Novera 1.0.0 is in development.** The screenshot shows a Windows application compiled locally by the maintainer. Source changes, targeted tests and hardware validation are documented separately; this does not validate every model, platform or cloud account.

This showcase update does not compile a new application. Distribution channels and requirements are described in the [official release policy](OFFICIAL_RELEASES.md) and [releases page](https://github.com/TRON-ABS/Novera/releases). GitHub Actions and automatic updates remain disabled in the project configuration.

## Documentation and contributions

- [User guide](docs/USER_GUIDE.md), [models and engines](docs/SUIVI_MOTEURS.md).
- [Development](docs/DEVELOPMENT.md), [build and release guide](docs/BUILD_AND_RELEASE.md).
- [Project dashboard](TABLEAU_DE_BORD_NOVERA.md), [roadmap](ROADMAP.md), [changelog](docs/CHANGELOG.md).
- [Contributing](CONTRIBUTING.md): code, tests, native review across 80 languages and real workflow feedback.

## Identity and license

Novera is maintained by **TRON-ABS** in [this repository](https://github.com/TRON-ABS/Novera). See the [identity policy](BRANDING.md) and [official release policy](OFFICIAL_RELEASES.md).

Novera builds on [Jan](https://github.com/janhq/jan), created by Menlo Research and its contributors. Original and third-party attributions and the [Apache 2.0 license](LICENSE) are retained. Jan downloads are not Novera releases.
