/** Public download references reviewed 2026-10-26. No automatic downloads. */
export const klein4bRecommendation = [
  {
    role: 'ggufImageModel',
    name: 'FLUX.2 Klein 4B · Q4_K_M · GPU',
    url: 'https://huggingface.co/unsloth/FLUX.2-klein-4B-GGUF/resolve/main/flux-2-klein-4b-Q4_K_M.gguf?download=true',
  },
  {
    role: 'ggufTextEncoder',
    name: 'Qwen3-4B · Q4_K_M · CPU',
    url: 'https://huggingface.co/Qwen/Qwen3-4B-GGUF/resolve/main/Qwen3-4B-Q4_K_M.gguf?download=true',
  },
  {
    role: 'ggufVae',
    name: 'FLUX.2 VAE · Safetensors',
    url: 'https://huggingface.co/black-forest-labs/FLUX.2-klein-4B/resolve/main/vae/diffusion_pytorch_model.safetensors?download=true',
  },
] as const

/** Video Q4 pack; source metadata checked 2026-10-27. */
export const wan13bRecommendation = [
  {
    "role": "videoModel",
    "name": "Wan2.1-T2V-1.3B-Q4_K_M.gguf",
    "url": "https://huggingface.co/samuelchristlie/Wan2.1-T2V-1.3B-GGUF/resolve/5a512b15fc35d1b67a074cfe55a591be9e9ef9b5/Wan2.1-T2V-1.3B-Q4_K_M.gguf"
  },
  {
    "role": "ggufTextEncoder",
    "name": "umt5-xxl-encoder-Q4_K_M.gguf",
    "url": "https://huggingface.co/city96/umt5-xxl-encoder-gguf/resolve/b535255bee98c2b0a59ea7c0ae2dcd0c6657b3b7/umt5-xxl-encoder-Q4_K_M.gguf"
  },
  {
    "role": "ggufVae",
    "name": "wan_2.1_vae.safetensors",
    "url": "https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged/resolve/123acf1cc74bccbb9bfff8ac1ee72edc08c2341d/split_files/vae/wan_2.1_vae.safetensors"
  }
] as const
