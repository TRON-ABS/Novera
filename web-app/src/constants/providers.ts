export const anthropicProviderSettings = [
  {
    key: 'api-key',
    title: 'API Key',
    description:
      "The Anthropic API uses API keys for authentication. Visit your [API Keys](https://console.anthropic.com/settings/keys) page to retrieve the API key you'll use in your requests.",
    controller_type: 'input',
    controller_props: {
      placeholder: 'Insert API Key',
      value: '',
      type: 'password',
      input_actions: ['unobscure', 'copy'],
    },
  },
  {
    key: 'base-url',
    title: 'Base URL',
    description:
      'The base endpoint to use. See the [Anthropic API documentation](https://docs.anthropic.com/en/api/getting-started) for more information.',
    controller_type: 'input',
    controller_props: {
      placeholder: 'https://api.anthropic.com/v1',
      value: 'https://api.anthropic.com/v1',
    },
  },
]

export const openAIProviderSettings = [
  {
    key: 'api-key',
    title: 'API Key',
    description:
      "The OpenAI API uses API keys for authentication. Visit your [API Keys](https://platform.openai.com/account/api-keys) page to retrieve the API key you'll use in your requests.",
    controller_type: 'input',
    controller_props: {
      placeholder: 'Insert API Key',
      value: '',
      type: 'password',
      input_actions: ['unobscure', 'copy'],
    },
  },
  {
    key: 'base-url',
    title: 'Base URL',
    description:
      'The base endpoint to use. See the [OpenAI API documentation](https://platform.openai.com/docs/api-reference/chat/create) for more information.',
    controller_type: 'input',
    controller_props: {
      placeholder: 'https://api.openai.com/v1',
      value: 'https://api.openai.com/v1',
    },
  },
]
export const predefinedProviders = [
  {
    active: true,
    api_key: '',
    base_url: 'https://api.openai.com/v1',
    explore_models_url: 'https://platform.openai.com/docs/models',
    provider: 'openai',
    settings: [
      {
        key: 'api-key',
        title: 'API Key',
        description:
          "The OpenAI API uses API keys for authentication. Visit your [API Keys](https://platform.openai.com/account/api-keys) page to retrieve the API key you'll use in your requests.",
        controller_type: 'input',
        controller_props: {
          placeholder: 'Insert API Key',
          value: '',
          type: 'password',
          input_actions: ['unobscure', 'copy'],
        },
      },
    ],
    models: [],
  },
  {
    active: true,
    api_key: '',
    base_url: 'https://YOUR-RESOURCE-NAME.openai.azure.com/openai/v1',
    explore_models_url: 'https://oai.azure.com/deployments',
    provider: 'azure',
    settings: [
      {
        key: 'api-key',
        title: 'API Key',
        description:
          'The Azure OpenAI API uses API keys for authentication. Visit your [Azure OpenAI Studio](https://oai.azure.com/) to retrieve the API key from your resource.',
        controller_type: 'input',
        controller_props: {
          placeholder: 'Insert API Key',
          value: '',
          type: 'password',
          input_actions: ['unobscure', 'copy'],
        },
      },
      {
        key: 'base-url',
        title: 'Base URL',
        description:
          'Your Azure OpenAI resource endpoint, e.g. https://YOUR-RESOURCE-NAME.openai.azure.com/openai/v1',
        controller_type: 'input',
        controller_props: {
          placeholder: 'https://YOUR-RESOURCE-NAME.openai.azure.com/openai/v1',
          value: 'https://YOUR-RESOURCE-NAME.openai.azure.com/openai/v1',
        },
      },
    ],
    models: [],
  },
  {
    active: true,
    api_key: '',
    base_url: 'https://api.anthropic.com/v1',
    provider: 'anthropic',
    api_type: 'anthropic',
    explore_models_url:
      'https://platform.claude.com/docs/en/models/overview',
    settings: [
      {
        key: 'api-key',
        title: 'API Key',
        description:
          "The Anthropic API uses API keys for authentication. Visit your [API Keys](https://console.anthropic.com/settings/keys) page to retrieve the API key you'll use in your requests.",
        controller_type: 'input',
        controller_props: {
          placeholder: 'Insert API Key',
          value: '',
          type: 'password',
          input_actions: ['unobscure', 'copy'],
        },
      },
    ],
    models: [],
    custom_header: [
      {
        header: 'anthropic-version',
        value: '2023-06-01'
      },
      {
        header: 'anthropic-dangerous-direct-browser-access',
        value: 'true'
      }
    ]
  },
  {
    active: true,
    api_key: '',
    base_url: 'https://openrouter.ai/api/v1',
    explore_models_url: 'https://openrouter.ai/models',
    provider: 'openrouter',
    settings: [
      {
        key: 'api-key',
        title: 'API Key',
        description:
          "The OpenRouter API uses API keys for authentication. Visit your [API Keys](https://openrouter.ai/settings/keys) page to retrieve the API key you'll use in your requests.",
        controller_type: 'input',
        controller_props: {
          placeholder: 'Insert API Key',
          value: '',
          type: 'password',
          input_actions: ['unobscure', 'copy'],
        },
      },
    ],
    models: [],
  },
  {
    active: true,
    api_key: '',
    base_url: 'https://api.mistral.ai/v1',
    explore_models_url:
      'https://docs.mistral.ai/models',
    provider: 'mistral',
    settings: [
      {
        key: 'api-key',
        title: 'API Key',
        description:
          "The Mistral API uses API keys for authentication. Visit your [API Keys](https://console.mistral.ai/api-keys/) page to retrieve the API key you'll use in your requests.",
        controller_type: 'input',
        controller_props: {
          placeholder: 'Insert API Key',
          value: '',
          type: 'password',
          input_actions: ['unobscure', 'copy'],
        },
      },
    ],
    models: [],
  },
  {
    active: true,
    api_key: '',
    base_url: 'https://api.groq.com/openai/v1',
    explore_models_url: 'https://console.groq.com/docs/models',
    provider: 'groq',
    settings: [
      {
        key: 'api-key',
        title: 'API Key',
        description:
          "The Groq API uses API keys for authentication. Visit your [API Keys](https://console.groq.com/keys) page to retrieve the API key you'll use in your requests.",
        controller_type: 'input',
        controller_props: {
          placeholder: 'Insert API Key',
          value: '',
          type: 'password',
          input_actions: ['unobscure', 'copy'],
        },
      },
    ],
    models: [],
  },
  {
    active: true,
    api_key: '',
    base_url: 'https://api.x.ai/v1',
    explore_models_url: 'https://docs.x.ai/developers/models',
    provider: 'xai',
    settings: [
      {
        key: 'api-key',
        title: 'API Key',
        description:
          "The xAI API uses API keys for authentication. Visit your [API Keys](https://console.x.ai/) page to retrieve the API key you'll use in your requests.",
        controller_type: 'input',
        controller_props: {
          placeholder: 'Insert API Key',
          value: '',
          type: 'password',
          input_actions: ['unobscure', 'copy'],
        },
      },
    ],
    models: [],
  },
  {
    active: true,
    api_key: '',
    base_url: 'https://generativelanguage.googleapis.com/v1beta/openai',
    explore_models_url: 'https://ai.google.dev/gemini-api/docs/models',
    provider: 'gemini',
    settings: [
      {
        key: 'api-key',
        title: 'API Key',
        description:
          "The Google API uses API keys for authentication. Visit your [API Keys](https://aistudio.google.com/apikey) page to retrieve the API key you'll use in your requests.",
        controller_type: 'input',
        controller_props: {
          placeholder: 'Insert API Key',
          value: '',
          type: 'password',
          input_actions: ['unobscure', 'copy'],
        },
      },
    ],
    models: [],
  },
  {
    active: true,
    api_key: '',
    base_url: 'https://api.minimax.io/v1',
    explore_models_url: 'https://platform.minimax.io/docs/api-reference/text-openai-api',
    provider: 'minimax',
    settings: [
      {
        key: 'api-key',
        title: 'API Key',
        description:
          "The MiniMax API uses API keys for authentication. Visit your [API Keys](https://platform.minimax.io/user-center/basic-information/interface-key) page to retrieve the API key you'll use in your requests.",
        controller_type: 'input',
        controller_props: {
          placeholder: 'Insert API Key',
          value: '',
          type: 'password',
          input_actions: ['unobscure', 'copy'],
        },
      },
    ],
    models: [],
  },
  {
    active: true,
    api_key: '',
    base_url: 'https://router.huggingface.co/v1',
    explore_models_url:
      'https://huggingface.co/models?pipeline_tag=text-generation&inference_provider=all',
    provider: 'huggingface',
    settings: [
      {
        key: 'api-key',
        title: 'API Key',
        description:
          "The Hugging Face API uses tokens for authentication. Visit your [Access Tokens](https://huggingface.co/settings/tokens) page to retrieve the token you'll use in your requests.",
        controller_type: 'input',
        controller_props: {
          placeholder: 'Insert API Token',
          value: '',
          type: 'password',
          input_actions: ['unobscure', 'copy'],
        },
      },
    ],
    models: [],
  },
  {
    active: true,
    api_key: '',
    base_url: 'https://integrate.api.nvidia.com/v1',
    explore_models_url: 'https://build.nvidia.com/models',
    provider: 'nvidia',
    settings: [
      {
        key: 'api-key',
        title: 'API Key',
        description:
          "The NVIDIA NIM API uses API keys for authentication. Visit [NVIDIA NGC API Keys](https://org.ngc.nvidia.com/setup/api-keys) to create an API key for your requests.",
        controller_type: 'input',
        controller_props: {
          placeholder: 'Insert API Key',
          value: '',
          type: 'password',
          input_actions: ['unobscure', 'copy'],
        },
      },
    ],
    models: [],
  },

  {
    active: true,
    api_key: '',
    provider: 'deepseek',
    base_url: 'https://api.deepseek.com',
    explore_models_url: 'https://api-docs.deepseek.com/',
    settings: [],
    models: [],
  },
  {
    active: true,
    api_key: '',
    provider: 'moonshot',
    base_url: 'https://api.moonshot.ai/v1',
    explore_models_url: 'https://platform.kimi.ai/docs/models',
    settings: [],
    models: [],
  },
  {
    active: true,
    api_key: '',
    provider: 'alibaba',
    base_url: 'https://YOUR-WORKSPACE-ID.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1',
    explore_models_url: 'https://www.alibabacloud.com/help/en/model-studio/models',
    settings: [],
    models: [],
  },
  {
    active: true,
    api_key: '',
    provider: 'cerebras',
    base_url: 'https://api.cerebras.ai/v1',
    explore_models_url: 'https://inference-docs.cerebras.ai/models/overview',
    settings: [],
    models: [],
  },
  {
    active: true,
    api_key: '',
    provider: 'together',
    base_url: 'https://api.together.ai/v1',
    explore_models_url: 'https://docs.together.ai/docs/serverless/models',
    settings: [],
    models: [],
  },
  {
    active: true,
    api_key: '',
    provider: 'fireworks',
    base_url: 'https://api.fireworks.ai/inference/v1',
    explore_models_url: 'https://docs.fireworks.ai/getting-started/models',
    settings: [],
    models: [],
  },
  {
    active: true,
    api_key: '',
    provider: 'perplexity',
    base_url: 'https://api.perplexity.ai/v1',
    explore_models_url: 'https://docs.perplexity.ai/docs/agent-api/models',
    settings: [],
    models: [],
  },
]
