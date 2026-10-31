"""Generate untrained ModelOpt-layout LLM fixtures offline; never quantize user weights."""
import argparse
import json
from pathlib import Path
import shutil


def create(path, family="llama", method="modelopt-fp8", sharded=False, tied=False):
    import torch
    from safetensors.torch import save_file
    from transformers import AutoConfig, AutoModelForCausalLM
    from create_tiny_model import create as create_tokenizer
    from float_quant import ARCHITECTURES
    root = Path(path)
    if root.exists():
        raise FileExistsError("Select a new fixture directory")
    base = root / "base"
    packed = root / "packed"
    create_tokenizer(base)
    packed.mkdir()
    for file in base.glob("*.json"):
        if file.name not in ("config.json", "generation_config.json"):
            shutil.copyfile(file, packed / file.name)
    torch.manual_seed(125)
    config = AutoConfig.for_model(family, vocab_size=32, hidden_size=128, intermediate_size=256,
                                  num_hidden_layers=2, num_attention_heads=4, num_key_value_heads=4,
                                  head_dim=32, max_position_embeddings=128, bos_token_id=2,
                                  eos_token_id=2, pad_token_id=1, tie_word_embeddings=tied)
    model = AutoModelForCausalLM.from_config(config, dtype=torch.bfloat16, attn_implementation="eager")
    data = model.state_dict()
    if tied:
        data.pop("lm_head.weight")
    linears = {name for name, module in model.named_modules() if isinstance(module, torch.nn.Linear) and name != "lm_head"}
    tensors = {}
    for name, value in data.items():
        prefix = name.removesuffix(".weight")
        if not name.endswith(".weight") or prefix not in linears:
            tensors[name] = value.cpu().contiguous()
            continue
        value = value.float()
        if method == "modelopt-fp8":
            scale = value.abs().amax() / 448
            tensors[name] = (value / scale).clamp(-448, 448).to(torch.float8_e4m3fn).contiguous()
            tensors[prefix + ".weight_scale"] = scale.reshape(1)
        else:
            scale2 = value.abs().amax() / (448 * 6)
            block = (value.reshape(value.shape[0], -1, 16).abs().amax(-1) / (6 * scale2)).clamp_min(2 ** -9).to(torch.float8_e4m3fn)
            normalized = value / (block.float().repeat_interleave(16, -1) * scale2)
            bounds = torch.tensor([0.25, 0.75, 1.25, 1.75, 2.5, 3.5, 5.0])
            code = torch.bucketize(normalized.abs().contiguous(), bounds).to(torch.uint8)
            ties = (normalized.abs().unsqueeze(-1) == bounds[[1, 3, 5]]).any(-1).to(torch.uint8)
            code = code + ties + ((normalized < 0).to(torch.uint8) << 3)
            tensors[name] = ((code[:, 1::2] << 4) | code[:, 0::2]).contiguous()
            tensors[prefix + ".weight_scale"] = block.contiguous()
            tensors[prefix + ".weight_scale_2"] = scale2.reshape(1)
            tensors[prefix + ".input_scale"] = torch.tensor([8 / (448 * 6)], dtype=torch.float32)
    config = config.to_dict()
    config["architectures"] = [ARCHITECTURES[family]]
    (packed / "config.json").write_text(json.dumps(config), encoding="utf-8")
    quant = {"quant_algo": "FP8" if method == "modelopt-fp8" else "NVFP4", "kv_cache_quant_algo": None, "exclude_modules": ["lm_head"]}
    if method == "modelopt-nvfp4":
        quant["group_size"] = 16
    (packed / "hf_quant_config.json").write_text(json.dumps({"producer": {"name": "novera-synthetic-test"}, "quantization": quant}), encoding="utf-8")
    if sharded:
        items = list(tensors.items())
        mapping = {}
        for i, subset in enumerate((items[::2], items[1::2]), 1):
            file = f"model-{i:05}-of-00002.safetensors"
            save_file(dict(subset), str(packed / file))
            mapping.update({key: file for key, _ in subset})
        (packed / "model.safetensors.index.json").write_text(json.dumps({"weight_map": mapping}), encoding="utf-8")
    else:
        save_file(tensors, str(packed / "model.safetensors"))
    return packed


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("path")
    parser.add_argument("--family", choices=("llama", "qwen2", "qwen3"), default="llama")
    parser.add_argument("--method", choices=("modelopt-fp8", "modelopt-nvfp4"), required=True)
    parser.add_argument("--sharded", action="store_true")
    args = parser.parse_args()
    print(create(args.path, args.family, args.method, args.sharded))
