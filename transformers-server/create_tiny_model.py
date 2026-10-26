"""Create a deterministic, untrained ~35 KiB Safetensors fixture, entirely offline."""
import argparse
import json
from pathlib import Path
import torch
from tokenizers import Tokenizer, models, pre_tokenizers
from transformers import GPT2Config, GPT2LMHeadModel, PreTrainedTokenizerFast


def create(path, sharded=False):
    path = Path(path)
    path.mkdir(parents=True, exist_ok=True)
    torch.manual_seed(42)
    vocab = {word: i for i, word in enumerate([
        "[UNK]", "[PAD]", "[EOS]", "system", "user", "assistant", ":", ".",
        "Bonjour", "Hello", "test", "Novera", "local", "model", "is", "a",
        "small", "safe", "text", "one", "two", "three", "yes", "no",
        "the", "and", "of", "to", "in", "for", "with", "!",
    ])}
    raw = Tokenizer(models.WordLevel(vocab, unk_token="[UNK]"))
    raw.pre_tokenizer = pre_tokenizers.Whitespace()
    tokenizer = PreTrainedTokenizerFast(tokenizer_object=raw, unk_token="[UNK]", pad_token="[PAD]", eos_token="[EOS]")
    tokenizer.save_pretrained(path)
    model = GPT2LMHeadModel(GPT2Config(vocab_size=len(vocab), n_positions=128, n_embd=16, n_layer=2, n_head=2,
                                      bos_token_id=2, eos_token_id=2, pad_token_id=1))
    model.save_pretrained(path, safe_serialization=True, max_shard_size="10KB" if sharded else "5GB")
    return {"directory": str(path.resolve()), "parameters": model.num_parameters(),
            "weights_bytes": sum(p.stat().st_size for p in path.glob("*.safetensors")),
            "trained": False, "purpose": "Offline loading and generation test only"}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("directory")
    parser.add_argument("--sharded", action="store_true")
    args = parser.parse_args()
    print(json.dumps(create(args.directory, args.sharded), indent=2))
