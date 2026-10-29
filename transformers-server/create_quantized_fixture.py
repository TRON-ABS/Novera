"""Create a tiny, untrained AWQ/GPTQ checkpoint offline for loader validation.

Requires the optional GPTQModel stack and CUDA. This is not a useful chat model.
Existing fixture/model directories are never replaced.
"""
import argparse
import os
from pathlib import Path


def create(directory, method):
    if method not in ('awq', 'gptq'):
        raise ValueError('Expected awq or gptq')
    os.environ.update(HF_HUB_OFFLINE='1', TRANSFORMERS_OFFLINE='1', HF_HUB_DISABLE_TELEMETRY='1')
    root = Path(directory)
    base, packed = root / 'base', root / 'packed'
    if base.exists() or packed.exists():
        raise FileExistsError('Select a new fixture directory')
    import torch
    from transformers import LlamaConfig, LlamaForCausalLM, AutoTokenizer
    from gptqmodel import GPTQModel, QuantizeConfig
    from gptqmodel.utils.backend import BACKEND
    from create_tiny_model import create as create_tokenizer_fixture

    create_tokenizer_fixture(base)
    model = LlamaForCausalLM(LlamaConfig(vocab_size=32, hidden_size=128, intermediate_size=256,
        num_hidden_layers=2, num_attention_heads=4, num_key_value_heads=2,
        max_position_embeddings=128, bos_token_id=2, eos_token_id=2, pad_token_id=1))
    model.save_pretrained(base, safe_serialization=True)
    del model
    config = QuantizeConfig(bits=4, group_size=32, method=method, device='cuda:0')
    # Offline environment flags apply to GPTQModel's config/shell loaders too.
    model = GPTQModel.from_pretrained(str(base), config, backend=BACKEND.TORCH,
        trust_remote_code=False, dtype=torch.float16)
    calibration = [{'input_ids': [8, 11, 16, 17, 18, 19, 20, 21] * 8, 'attention_mask': [1] * 64} for _ in range(8)]
    model.quantize(calibration, batch_size=1, backend=BACKEND.TORCH)
    model.save(str(packed))
    AutoTokenizer.from_pretrained(base, local_files_only=True).save_pretrained(packed)
    return packed


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('directory')
    parser.add_argument('--method', choices=('awq', 'gptq'), required=True)
    args = parser.parse_args()
    print(create(args.directory, args.method))
