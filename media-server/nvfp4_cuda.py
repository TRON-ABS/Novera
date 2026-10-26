"""Strict native CUDA FP4 path for the supported FLUX.2 Klein 4B layout.

Packed diffusion weights stay packed. GEMMs use PyTorch scaled_mm with NVFP4
recipes; no BF16 weight cache and no eager/dequantization fallback in those GEMMs.
Layout specification: https://github.com/Comfy-Org/comfy-quants/blob/main/docs/formats/nvfp4.md
"""
import gc
import json
import os
import time
from pathlib import Path


def native_available():
    import torch
    return (torch.cuda.is_available() and torch.cuda.get_device_capability()[0] >= 10
            and hasattr(torch.nn.functional, 'scaled_mm') and hasattr(torch, 'float4_e2m1fn_x2'))


def unblocked(scales, rows, cols):
    pr, pc = (rows + 127) // 128 * 128, (cols + 3) // 4 * 4
    return scales.reshape(-1, 32, 4, 4).transpose(1, 2).reshape(pr // 128, pc // 4, 128, 4).permute(0, 2, 1, 3).reshape(pr, pc)[:rows, :cols]


def blocked(scales):
    import torch
    r, c = scales.shape
    pr, pc = (r + 127) // 128 * 128, (c + 3) // 4 * 4
    x = torch.nn.functional.pad(scales.view(torch.uint8), (0, pc-c, 0, pr-r)).view(scales.dtype)
    return x.reshape(pr//128, 128, pc//4, 4).permute(0, 2, 1, 3).reshape(-1, 4, 32, 4).transpose(1, 2).reshape(pr, pc).contiguous()


def native_linear(weight, scales, scale2, input_scale, bias=None):
    import torch
    import comfy_kitchen as ck
    from torch.nn.functional import ScalingType, SwizzleType

    class NativeLinear(torch.nn.Module):
        def __init__(self):
            super().__init__()
            self.in_features, self.out_features = weight.shape[1] * 2, weight.shape[0]
            self.register_buffer('packed_weight', weight.contiguous())
            self.register_buffer('block_scale', scales.contiguous())
            self.register_buffer('tensor_scale', scale2.float().reshape(()))
            self.register_buffer('activation_scale', input_scale.float().reshape(()))
            self.register_buffer('bias', bias)
            self.calls = 0

        def forward(self, x):
            if x.device.type != 'cuda' or x.shape[-1] != self.in_features:
                raise RuntimeError('NVFP4_NATIVE_UNAVAILABLE')
            shape = x.shape
            flat = x.reshape(-1, self.in_features).to(torch.bfloat16).contiguous()
            packed, a_scale = ck.quantize_nvfp4(flat, self.activation_scale, pad_16x=True)
            y = torch.nn.functional.scaled_mm(
                packed.view(torch.float4_e2m1fn_x2), self.packed_weight.view(torch.float4_e2m1fn_x2).t(),
                scale_a=[a_scale.flatten(), self.activation_scale],
                scale_b=[self.block_scale.flatten(), self.tensor_scale],
                scale_recipe_a=[ScalingType.BlockWise1x16, ScalingType.TensorWise],
                scale_recipe_b=[ScalingType.BlockWise1x16, ScalingType.TensorWise],
                swizzle_a=[SwizzleType.SWIZZLE_32_4_4, SwizzleType.NO_SWIZZLE],
                swizzle_b=[SwizzleType.SWIZZLE_32_4_4, SwizzleType.NO_SWIZZLE],
                output_dtype=torch.bfloat16,
            )[:flat.shape[0], :self.out_features]
            if self.bias is not None:
                y = y + self.bias
            self.calls += 1
            return y.reshape(*shape[:-1], self.out_features)
    return NativeLinear()


def load_transformer(path, config):
    import torch
    from safetensors import safe_open
    from diffusers import Flux2Transformer2DModel
    from diffusers.loaders.single_file_utils import convert_flux2_transformer_checkpoint_to_diffusers
    from nvfp4_compat import header, quantized_layers
    data, _ = header(path)
    quant = quantized_layers(data)
    source, descriptors = {}, {}
    with safe_open(str(path), framework='pt', device='cpu') as tensors:
        excluded = {prefix + suffix for prefix in quant.values() for suffix in ('.weight_scale', '.weight_scale_2', '.input_scale', '.comfy_quant')}
        for key in tensors.keys():
            if key in excluded:
                continue
            if key in quant:
                prefix = quant[key]
                packed = tensors.get_tensor(key)
                full_shape = (packed.shape[0], packed.shape[1] * 2)
                placeholder = torch.empty(full_shape, device='meta', dtype=torch.bfloat16)
                source[key] = placeholder
                descriptors[placeholder.untyped_storage()._cdata] = (packed, tensors.get_tensor(prefix+'.weight_scale').view(torch.float8_e4m3fn), tensors.get_tensor(prefix+'.weight_scale_2'), tensors.get_tensor(prefix+'.input_scale'))
            else:
                source[key] = tensors.get_tensor(key)
        converted = convert_flux2_transformer_checkpoint_to_diffusers(source)
        with torch.device('meta'):
            transformer = Flux2Transformer2DModel.from_config(config)
        regular, modules = {}, []
        for key, value in converted.items():
            if not value.is_meta:
                regular[key] = value.to(torch.bfloat16) if value.is_floating_point() else value
                continue
            packed, scales, scale2, input_scale = descriptors[value.untyped_storage()._cdata]
            start = value.storage_offset() // value.shape[1]
            rows = value.shape[0]
            if start or rows != packed.shape[0]:
                plain = unblocked(scales, packed.shape[0], value.shape[1]//16)
                scales = blocked(plain[start:start+rows])
                packed = packed[start:start+rows]
            name = key.removesuffix('.weight')
            parent, _, leaf = name.rpartition('.')
            bias = converted.get(name+'.bias')
            layer = native_linear(packed, scales, scale2, input_scale, bias)
            transformer.get_submodule(parent).add_module(leaf, layer)
            modules.append(layer)
        for name, _ in transformer.named_buffers():
            regular.pop(name, None)
        missing, unexpected = transformer.load_state_dict(regular, strict=False, assign=True)
        allowed = {name for name, _ in transformer.named_buffers()}
        if unexpected or any(key not in allowed for key in missing) or any(p.is_meta for p in transformer.parameters()):
            raise ValueError(f'Unsupported native transformer layout: missing={missing[:4]}, unexpected={unexpected[:4]}')
    if not modules:
        raise ValueError('No native NVFP4 layers were loaded')
    return transformer.eval().to('cuda'), modules


def encoder_target(requested):
    import torch
    if requested not in ('auto', 'cpu', 'cuda'):
        raise ValueError('Invalid encoder device')
    available = torch.cuda.is_available()
    if requested == 'cuda' and not available:
        raise RuntimeError('NVFP4_NATIVE_UNAVAILABLE: encoder CUDA unavailable')
    if requested == 'auto':
        # Qwen3-4B expands to roughly 8 GB BF16. Prefer CPU when there is no
        # headroom for it, avoiding repeated PCIe transfers on small GPUs.
        # Explicit CUDA remains available with one-block-at-a-time offload.
        return 'cuda' if available and torch.cuda.mem_get_info()[0] >= 10 * 1024**3 else 'cpu'
    return requested


def encode_prompt(path, prompt, config_dir, emit, device='cuda'):
    import torch
    from transformers import AutoModelForCausalLM, AutoTokenizer, Qwen3Config
    from accelerate import cpu_offload
    text_config = json.loads((config_dir/'text_encoder'/'config.json').read_text())
    config = Qwen3Config(**{k:v for k,v in text_config.items() if not k.startswith('_')})
    emit(stage='loading', progress=5)
    tokenizer = AutoTokenizer.from_pretrained(str(config_dir/'text_encoder'), gguf_file=str(path), local_files_only=True, trust_remote_code=False, fix_mistral_regex=False)
    encoder = AutoModelForCausalLM.from_pretrained(str(config_dir/'text_encoder'), gguf_file=str(path), config=config, dtype=torch.bfloat16, local_files_only=True, trust_remote_code=False, low_cpu_mem_usage=True).eval()
    if device == 'cuda':
        cpu_offload(encoder.model, execution_device=torch.device('cuda'), offload_buffers=True)
    text = tokenizer.apply_chat_template([{'role':'user','content':prompt}], tokenize=False, add_generation_prompt=True, enable_thinking=False)
    inputs = tokenizer(text, return_tensors='pt', padding='max_length', truncation=True, max_length=512).to(device)
    emit(stage='loading', progress=20, encoder_device=device)
    with torch.inference_mode():
        out = encoder.model(**inputs, output_hidden_states=True, use_cache=False)
        embeds = torch.stack([out.hidden_states[i] for i in (9,18,27)], dim=1).permute(0,2,1,3).reshape(1,512,7680).contiguous()
    del out, inputs, encoder, tokenizer
    gc.collect(); torch.cuda.empty_cache()
    return embeds.to('cuda')


def generate(config, emit):
    if config.get('task', 'image') != 'image' or config.get('input_image') or config.get('device', 'auto') not in ('auto','cuda'):
        raise RuntimeError('NVFP4_NATIVE_UNAVAILABLE')
    if not str(config.get('prompt','')).strip() or len(config['prompt']) > 32000:
        raise ValueError('A bounded prompt is required')
    for name, low, high in [('width',64,2048),('height',64,2048),('steps',1,100),('seed',0,2**32-1)]:
        value = config[name]
        if isinstance(value,bool) or not isinstance(value,int) or not low <= value <= high:
            raise ValueError('Invalid generation setting: '+name)
    if config['width'] % 16 or config['height'] % 16:
        raise ValueError('Dimensions must be multiples of 16')
    # Set these before importing Transformers. Parallel loading crashes on CPython 3.15/Windows.
    os.environ.update(HF_HUB_OFFLINE='1', TRANSFORMERS_OFFLINE='1', HF_DEACTIVATE_ASYNC_LOAD='1')
    import torch
    from safetensors.torch import load_file
    from diffusers import AutoencoderKLFlux2, FlowMatchEulerDiscreteScheduler, Flux2KleinPipeline
    from diffusers.loaders.single_file_utils import convert_ldm_vae_checkpoint
    if not native_available() or config.get('device') == 'cpu':
        raise RuntimeError('NVFP4_NATIVE_UNAVAILABLE')
    if Path(config['cpp_llm']).suffix.lower() != '.gguf' or Path(config['cpp_vae']).suffix.lower() != '.safetensors':
        raise ValueError('Native FLUX.2 Klein currently needs a Qwen3-4B GGUF encoder and a Safetensors VAE')
    config_dir = Path(config.get('native_config_dir', Path(__file__).parent/'native-flux2-klein-4b'))
    cfg = {name:json.loads((config_dir/name/'config.json').read_text()) for name in ('transformer','vae')}
    scheduler_config = json.loads((config_dir/'scheduler'/'scheduler_config.json').read_text())
    torch.set_num_threads(min(8, torch.get_num_threads()))
    torch.cuda.reset_peak_memory_stats()
    start = time.monotonic()
    encoder_device = encoder_target(config.get('encoder_device') or 'auto')
    embeds = encode_prompt(config['cpp_llm'], config['prompt'], config_dir, emit, encoder_device)
    torch.cuda.synchronize()
    encoding_seconds = time.monotonic() - start
    emit(stage='loading', progress=35)
    transformer, modules = load_transformer(config['model'], cfg['transformer'])
    vae_source = load_file(config['cpp_vae'])
    if 'decoder.mid_block.attentions.0.to_q.weight' in vae_source:
        vae_state = vae_source
    else:
        vae_state = convert_ldm_vae_checkpoint(vae_source, cfg['vae'])
        vae_state.update({key:value for key,value in vae_source.items() if key.startswith('bn.')})
    with torch.device('meta'):
        vae = AutoencoderKLFlux2.from_config(cfg['vae'])
    vae.load_state_dict(vae_state, strict=True, assign=True)
    vae = vae.eval().to(device='cuda',dtype=torch.bfloat16)
    vae.enable_tiling()
    pipe = Flux2KleinPipeline(transformer=transformer, vae=vae, text_encoder=None, tokenizer=None, scheduler=FlowMatchEulerDiscreteScheduler.from_config(scheduler_config), is_distilled=True)
    def callback(_pipe,step,_time,values):
        emit(stage='generating',progress=min(99,round(100*(step+1)/config['steps'])));return values
    emit(stage='generating',progress=0)
    torch.cuda.synchronize()
    generation_start = time.monotonic()
    with torch.inference_mode():
        result = pipe(prompt_embeds=embeds, width=config['width'], height=config['height'], num_inference_steps=config['steps'], guidance_scale=1.0, generator=torch.Generator('cuda').manual_seed(config['seed']), callback_on_step_end=callback, output_type='pil')
    torch.cuda.synchronize()
    generation_seconds = time.monotonic() - generation_start
    calls = sum(module.calls for module in modules)
    if calls == 0:
        raise RuntimeError('NVFP4 native GEMM did not execute')
    return result.images[0], {'native_nvfp4':True,'native_matmuls':calls,'native_layers':len(modules),'gpu':torch.cuda.get_device_name(),'capability':list(torch.cuda.get_device_capability()),'torch':torch.__version__,'compatibility_cache':False,'encoder_device':encoder_device,'encoder_gpu_layer_offload':encoder_device == 'cuda','encoding_seconds':encoding_seconds,'generation_seconds':generation_seconds,'peak_torch_vram_bytes':torch.cuda.max_memory_allocated()}
