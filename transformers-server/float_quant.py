"""Native CUDA ModelOpt FP8/NVFP4 for explicitly supported dense text LLMs.

ModelOpt NVFP4 uses low-first nibbles and row-major block-16 E4M3 scales.
No image loader, dequantized weight cache, model download or CPU fallback.
"""
import json
from pathlib import Path

ARCHITECTURES = {"llama": "LlamaForCausalLM", "qwen2": "Qwen2ForCausalLM", "qwen3": "Qwen3ForCausalLM"}


def modelopt_method(config):
    raw = config.get("quantization_config")
    if not isinstance(raw, dict) or raw.get("quant_method") != "modelopt":
        raise ValueError("Expected an explicit ModelOpt quantization configuration")
    quant = raw.get("quantization", raw)
    if not isinstance(quant, dict):
        raise ValueError("Invalid ModelOpt quantization object")
    algo = quant.get("quant_algo")
    if algo not in ("FP8", "NVFP4"):
        raise ValueError("Only ModelOpt per-tensor FP8 and block-16 NVFP4 are supported")
    if quant.get("kv_cache_quant_algo") is not None:
        raise ValueError("Quantized KV caches are not supported by this LLM engine")
    if any(key in quant for key in ("quantized_layers", "moe_quant_algo", "weight_block_size")):
        raise ValueError("Mixed, MoE and block-FP8 layouts require a different loader")
    excluded = quant.get("exclude_modules", [])
    if not isinstance(excluded, list) or any(name != "lm_head" for name in excluded):
        raise ValueError("Only lm_head may be excluded from quantization")
    if algo == "FP8" and quant.get("group_size") is not None:
        raise ValueError("FP8 must use per-tensor scaling")
    if algo == "NVFP4" and (type(quant.get("group_size")) is not int or quant["group_size"] != 16):
        raise ValueError("NVFP4 requires group_size=16")
    family = config.get("model_type")
    if family not in ARCHITECTURES or config.get("architectures") != [ARCHITECTURES[family]]:
        raise ValueError("ModelOpt LLMs require dense Llama/Qwen2/Qwen3 ForCausalLM architectures")
    if any(key in config for key in ("auto_map", "vision_config", "text_config", "num_local_experts", "num_experts")):
        raise ValueError("Custom code, multimodal and expert architectures are not supported")
    return "modelopt-fp8" if algo == "FP8" else "modelopt-nvfp4"


def read_model_config(root):
    root = Path(root)
    config = json.loads((root / "config.json").read_text(encoding="utf-8"))
    if not isinstance(config, dict):
        raise ValueError("config.json must be an object")
    sidecar = root / "hf_quant_config.json"
    if sidecar.exists():
        target = sidecar.resolve(strict=True)
        if not target.is_relative_to(root.resolve()):
            raise ValueError("ModelOpt metadata must stay inside the model directory")
        data = json.loads(target.read_text(encoding="utf-8"))
        if not isinstance(data, dict):
            raise ValueError("hf_quant_config.json must be an object")
        quant = data.get("quantization")
        if not isinstance(quant, dict):
            raise ValueError("hf_quant_config.json must declare quantization")
        inline = config.get("quantization_config")
        if inline is not None:
            if not isinstance(inline, dict) or inline.get("quant_method") != "modelopt":
                raise ValueError("Conflicting inline and sidecar quantization")
            flattened = inline.get("quantization", {k: v for k, v in inline.items() if k != "quant_method"})
            if flattened != quant:
                raise ValueError("Conflicting inline and sidecar ModelOpt configurations")
        config["quantization_config"] = {"quant_method": "modelopt", "quantization": quant}
    return config


def blocked(scales):
    """ModelOpt row-major scales -> cuBLAS 128x4 tiled scale storage."""
    import torch
    rows, cols = scales.shape
    padded_rows, padded_cols = (rows + 127) // 128 * 128, (cols + 3) // 4 * 4
    data = torch.nn.functional.pad(scales.view(torch.uint8), (0, padded_cols - cols, 0, padded_rows - rows))
    return (data.reshape(padded_rows // 128, 128, padded_cols // 4, 4).permute(0, 2, 1, 3)
            .reshape(-1, 4, 32, 4).transpose(1, 2).reshape(padded_rows, padded_cols)
            .contiguous().view(torch.float8_e4m3fn))


def scalar(value, name):
    import torch
    if value.numel() != 1 or value.dtype not in (torch.float32, torch.float16, torch.bfloat16):
        raise ValueError(f"{name}: expected a floating-point scalar")
    result = value.float().reshape(())
    if not bool(torch.isfinite(result)) or not bool(result > 0):
        raise ValueError(f"{name}: expected a finite positive scale")
    return result


def make_linear(method, weight, weight_scale, input_scale=None, weight_scale_2=None, bias=None):
    import torch
    if weight.device.type != "cuda":
        raise ValueError("Packed LLM weights must be on CUDA")
    if weight.ndim != 2:
        raise ValueError("Expected a dense matrix")
    rows, cols = weight.shape
    if method == "modelopt-fp8":
        if weight.dtype != torch.float8_e4m3fn or cols % 16 or rows % 16:
            raise ValueError("FP8 requires E4M3FN weights and aligned dimensions")
        scale = scalar(weight_scale, "weight_scale")
        activation = scalar(input_scale, "input_scale") if input_scale is not None else None
        scale2 = None
    elif method == "modelopt-nvfp4":
        cols *= 2
        if weight.dtype != torch.uint8 or rows % 128 or cols % 128:
            raise ValueError("NVFP4 requires U8 packed weights and dimensions divisible by 128")
        if weight_scale.dtype != torch.float8_e4m3fn or tuple(weight_scale.shape) != (rows, cols // 16):
            raise ValueError("Expected ModelOpt row-major E4M3 block-16 weight scales")
        if not bool(torch.isfinite(weight_scale.float()).all()) or not bool((weight_scale.float() > 0).all()):
            raise ValueError("Invalid NVFP4 block scales")
        # ModelOpt stores the even element in the low nibble. PyTorch's native
        # FP4 tensor/Comfy quantizer path here uses the high-first representation.
        weight = ((weight << 4) | (weight >> 4)).contiguous()
        scale = blocked(weight_scale)
        scale2 = scalar(weight_scale_2, "weight_scale_2")
        activation = scalar(input_scale, "input_scale")
    else:
        raise ValueError("Unsupported floating-point quantization")

    class PackedLinear(torch.nn.Module):
        def __init__(self):
            super().__init__()
            self.in_features, self.out_features = cols, rows
            for name, value in (("packed_weight", weight), ("weight_scale", scale),
                                ("weight_scale_2", scale2), ("input_scale", activation), ("bias", bias)):
                self.register_buffer(name, value)
            self.calls = 0

        def forward(self, x):
            if x.device.type != "cuda" or x.shape[-1] != self.in_features:
                raise RuntimeError("Native quantized LLM input/device mismatch")
            shape = x.shape
            flat = x.reshape(-1, self.in_features).to(torch.bfloat16).contiguous()
            if method == "modelopt-fp8":
                activation_scale = self.input_scale
                if activation_scale is None:
                    activation_scale = (flat.float().abs().amax() / 448).clamp_min(1e-12)
                values = (flat.float() / activation_scale).clamp(-448, 448).to(torch.float8_e4m3fn)
                # Tensor-core GEMMs require M aligned to 16; decode often has M=1.
                count = values.shape[0]
                values = torch.nn.functional.pad(values.view(torch.uint8), (0, 0, 0, (-count) % 16)).view(values.dtype)
                result = torch._scaled_mm(values, self.packed_weight.t(), scale_a=activation_scale,
                                          scale_b=self.weight_scale, out_dtype=torch.bfloat16)[:count]
            else:
                import comfy_kitchen as ck
                from torch.nn.functional import ScalingType, SwizzleType
                packed, scales = ck.quantize_nvfp4(flat, self.input_scale, pad_16x=True, hi_first=True)
                result = torch.nn.functional.scaled_mm(
                    packed.view(torch.float4_e2m1fn_x2), self.packed_weight.view(torch.float4_e2m1fn_x2).t(),
                    scale_a=[scales.flatten(), self.input_scale], scale_b=[self.weight_scale.flatten(), self.weight_scale_2],
                    scale_recipe_a=[ScalingType.BlockWise1x16, ScalingType.TensorWise],
                    scale_recipe_b=[ScalingType.BlockWise1x16, ScalingType.TensorWise],
                    swizzle_a=[SwizzleType.SWIZZLE_32_4_4, SwizzleType.NO_SWIZZLE],
                    swizzle_b=[SwizzleType.SWIZZLE_32_4_4, SwizzleType.NO_SWIZZLE], output_dtype=torch.bfloat16,
                )[:flat.shape[0], :self.out_features]
            if self.bias is not None:
                result = result + self.bias
            self.calls += 1
            return result.reshape(*shape[:-1], self.out_features)
    return PackedLinear()


def kernel_probe(torch, method):
    """Execute prefill and single-token decode GEMMs, compare against decoded data."""
    if not torch.cuda.is_available() or not torch.version.cuda:
        raise RuntimeError("Native FP8/NVFP4 LLMs require NVIDIA CUDA; no CPU fallback")
    minimum = (8, 9) if method == "modelopt-fp8" else (10, 0)
    if torch.cuda.get_device_capability(0) < minimum:
        raise RuntimeError(f"{method} requires compute capability >= {minimum}")
    with torch.inference_mode():
        # Deterministic, asymmetric data also detects incorrect nibble order/scales.
        weight = torch.linspace(-1.5, 2.0, 128 * 128, device="cuda").reshape(128, 128).to(torch.bfloat16)
        x = torch.sin(torch.arange(128 * 16, device="cuda").float()).reshape(16, 128).to(torch.bfloat16)
        if method == "modelopt-fp8":
            scale = weight.float().abs().amax() / 448
            packed = (weight.float() / scale).to(torch.float8_e4m3fn)
            layer = make_linear(method, packed, scale)
            reference = packed.float() * scale
        else:
            import comfy_kitchen as ck
            scale2 = weight.float().abs().amax() / (448 * 6)
            activation = x.float().abs().amax() / (448 * 6)
            packed, tiled = ck.quantize_nvfp4(weight, scale2, pad_16x=True, hi_first=False)
            # Inverse of blocked(), independently specified by ModelOpt scale layout.
            row_major = (tiled.reshape(-1, 32, 4, 4).transpose(1, 2).reshape(1, 2, 128, 4)
                         .permute(0, 2, 1, 3).reshape(128, 8).contiguous())
            layer = make_linear(method, packed, row_major, activation, scale2)
            reference = ck.dequantize_nvfp4(packed, scale2, tiled, output_type=torch.float32, hi_first=False)
        errors = []
        for values in (x, x[:1]):
            actual = layer(values)
            if method == "modelopt-fp8":
                input_scale = (values.float().abs().amax() / 448).clamp_min(1e-12)
                decoded_input = (values.float() / input_scale).clamp(-448, 448).to(torch.float8_e4m3fn).float() * input_scale
            else:
                qx, sx = ck.quantize_nvfp4(values, activation, pad_16x=True, hi_first=True)
                decoded_input = ck.dequantize_nvfp4(qx, activation, sx, output_type=torch.float32, hi_first=True)[:values.shape[0]].float()
            expected = decoded_input @ reference.float().t()
            torch.cuda.synchronize()
            error = (actual.float() - expected.float()).norm() / expected.float().norm().clamp_min(1e-8)
            if not bool(torch.isfinite(actual).all()) or float(error) > (0.03 if method == "modelopt-nvfp4" else 0.01):
                raise RuntimeError(f"{method} kernel failed numeric validation: relative error={float(error)}")
            errors.append(float(error))
    return {"available": True, "kernelValidated": True, "backend": "torch-scaled-mm-cuda",
            "relativeErrors": errors, "capability": list(torch.cuda.get_device_capability(0))}


def load_model(root, config, method, runtime):
    """Build an empty supported HF architecture, replace linears, then load exact tensors."""
    import torch
    from accelerate import init_empty_weights
    from accelerate.utils import set_module_tensor_to_device
    from safetensors import safe_open
    from transformers import AutoConfig, AutoModelForCausalLM
    from server import weight_files

    if modelopt_method(config) != method:
        raise ValueError("Quantization method mismatch")
    clean = dict(config)
    clean.pop("quantization_config", None)
    family = clean.pop("model_type")
    hf_config = AutoConfig.for_model(family, **clean)
    with init_empty_weights():
        model = AutoModelForCausalLM.from_config(hf_config, dtype=torch.bfloat16, attn_implementation="eager")
    modules = {name: module for name, module in model.named_modules() if isinstance(module, torch.nn.Linear) and name != "lm_head"}
    expected_modules = {f"model.layers.{i}.{part}" for i in range(hf_config.num_hidden_layers)
                        for part in ("self_attn.q_proj", "self_attn.k_proj", "self_attn.v_proj", "self_attn.o_proj",
                                     "mlp.gate_proj", "mlp.up_proj", "mlp.down_proj")}
    if not modules or set(modules) != expected_modules:
        raise ValueError("Unsupported dense decoder module graph")
    index = {}
    for file in sorted(weight_files(root, config)):
        with safe_open(root / file, framework="pt", device="cpu") as tensors:
            for key in tensors.keys():
                if key in index:
                    raise ValueError(f"Duplicate checkpoint tensor: {key}")
                view = tensors.get_slice(key)
                index[key] = (file, view.get_shape(), view.get_dtype())
    def read(key):
        with safe_open(root / index[key][0], framework="pt", device="cpu") as tensors:
            return tensors.get_tensor(key).to("cuda")
    expected = dict(model.named_parameters(remove_duplicate=False))
    consumed = set()
    for name, module in modules.items():
        n, k = module.out_features, module.in_features
        alignment = 128 if method == "modelopt-nvfp4" else 16
        if n % alignment or k % alignment:
            raise ValueError(f"Unsupported quantized dimensions at {name}: {n}x{k}")
        specs = {"weight": ([n, k // 2] if method == "modelopt-nvfp4" else [n, k],
                             "U8" if method == "modelopt-nvfp4" else "F8_E4M3"),
                 "weight_scale": ([n, k // 16], "F8_E4M3") if method == "modelopt-nvfp4" else (None, None)}
        if method == "modelopt-nvfp4":
            specs.update(weight_scale_2=(None, None), input_scale=(None, None))
        elif name + ".input_scale" in index:
            specs["input_scale"] = (None, None)
        for suffix, (shape, dtype) in specs.items():
            key = name + "." + suffix
            if key not in index:
                raise ValueError(f"Missing quantization tensor: {key}")
            _, actual_shape, actual_dtype = index[key]
            if shape is not None and (actual_shape != shape or actual_dtype != dtype):
                raise ValueError(f"Unsupported packed tensor layout: {key}")
            if shape is None and (actual_shape not in ([], [1]) or actual_dtype not in ("F32", "F16", "BF16")):
                raise ValueError(f"Invalid scalar layout: {key}")
        consumed.update(name + "." + suffix for suffix in specs)
    allowed = set(expected) | consumed
    if hf_config.tie_word_embeddings and "lm_head.weight" in index:
        raise ValueError("Tied embeddings require the shared lm_head tensor to be omitted")
    if hf_config.tie_word_embeddings and "lm_head.weight" not in index:
        expected.pop("lm_head.weight", None)
    missing = set(expected) - set(index)
    extra = set(index) - allowed
    if missing or extra:
        raise ValueError(f"Checkpoint tensors do not match architecture: missing={sorted(missing)}, extra={sorted(extra)}")
    for key, parameter in expected.items():
        if key in consumed:
            continue
        _, shape, dtype = index[key]
        if shape != list(parameter.shape) or dtype not in ("F16", "BF16", "F32"):
            raise ValueError(f"Unsupported unquantized tensor: {key}")
    # Only after validating the entire header do we allocate persistent model tensors.
    for name, module in modules.items():
        kwargs = {suffix: read(name + "." + suffix) for suffix in ("weight", "weight_scale", "input_scale", "weight_scale_2")
                  if name + "." + suffix in index}
        if module.bias is not None:
            kwargs["bias"] = read(name + ".bias").to(torch.bfloat16)
        parent, _, child = name.rpartition(".")
        setattr(model.get_submodule(parent), child, make_linear(method, **kwargs))
    for key in expected:
        if key not in consumed and not any(key == name + ".bias" for name in modules):
            set_module_tensor_to_device(model, key, "cuda", value=read(key), dtype=torch.bfloat16)
    if hf_config.tie_word_embeddings:
        model.tie_weights()
    for name, buffer in list(model.named_buffers()):
        if buffer.is_meta:
            raise ValueError(f"Uninitialized architecture buffer: {name}")
        if buffer.device.type != "cuda":
            parent, _, child = name.rpartition(".")
            setattr(model.get_submodule(parent), child, buffer.to("cuda"))
    if any(parameter.is_meta for parameter in model.parameters()):
        raise ValueError("Incomplete model parameters")
    model.eval()
    # Both prefill and decode must traverse the actual loaded kernels before readiness.
    with torch.inference_mode():
        ids = torch.zeros((1, 2), device="cuda", dtype=torch.long)
        first = model(input_ids=ids, use_cache=True)
        second = model(input_ids=ids[:, :1], past_key_values=first.past_key_values, use_cache=True)
        if not bool(torch.isfinite(first.logits).all()) or not bool(torch.isfinite(second.logits).all()):
            raise RuntimeError("Loaded quantized model failed numeric warmup")
    packed = [model.get_submodule(name) for name in modules]
    if any(layer.calls < 2 for layer in packed):
        raise RuntimeError("Not every packed layer executed prefill and decode")
    runtime.update(quantization_backend="torch-scaled-mm-cuda", packed_layers=len(packed),
                   kernel_validated=True, architecture=ARCHITECTURES[family],
                   packed_weight_bytes=sum(layer.packed_weight.numel() * layer.packed_weight.element_size() for layer in packed))
    return model
