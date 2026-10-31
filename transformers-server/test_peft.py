"""Real offline tiny-model LoRA inference and rejection/memory regressions."""
import json
import os
from pathlib import Path
import tempfile
import unittest

os.environ['HF_HUB_OFFLINE'] = '1'
os.environ['TRANSFORMERS_OFFLINE'] = '1'

from server import Inference, adapter_memory, validate_adapter, validate_directory


class AdapterPolicy(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.base = Path(self.temp.name).resolve() / 'base'
        self.adapter = Path(self.temp.name).resolve() / 'adapter'
        self.base.mkdir()
        self.adapter.mkdir()
        self.config = dict(peft_type='LORA', task_type='CAUSAL_LM', base_model_name_or_path=str(self.base))
        (self.base / 'config.json').write_text('{}')
        (self.adapter / 'adapter_model.safetensors').write_bytes(b'weights')
        self.save()

    def save(self):
        (self.adapter / 'adapter_config.json').write_text(json.dumps(self.config))

    def test_adapter_is_never_a_complete_model(self):
        with self.assertRaisesRegex(ValueError, 'not a complete model'):
            validate_directory(self.adapter)

    def test_requires_exact_base_identity_and_supported_task(self):
        self.assertEqual(validate_adapter(self.adapter, self.base), self.adapter)
        for patch in [dict(base_model_name_or_path='other/base'), dict(task_type='SEQ_CLS'), dict(revision='commit')]:
            previous = self.config.copy()
            self.config.update(patch)
            self.save()
            with self.assertRaises(ValueError):
                validate_adapter(self.adapter, self.base)
            self.config = previous

    def test_quantized_bases_and_missing_weights_are_rejected(self):
        (self.base / 'config.json').write_text(json.dumps({'quantization_config': {'quant_method':'gptq', 'bits':4}}))
        with self.assertRaisesRegex(ValueError, 'unquantized'):
            validate_adapter(self.adapter, self.base)
        (self.base / 'config.json').write_text('{}')
        (self.adapter / 'adapter_model.safetensors').unlink()
        with self.assertRaises(FileNotFoundError):
            validate_adapter(self.adapter, self.base)


@unittest.skipUnless(os.environ.get('NOVERA_TEST_PEFT') == '1', 'Set NOVERA_TEST_PEFT=1 with requirements-peft installed')
class RealAdapter(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        import torch
        from transformers import LlamaConfig, LlamaForCausalLM, PreTrainedTokenizerFast
        from tokenizers import Tokenizer, models, pre_tokenizers
        from peft import LoraConfig, get_peft_model
        cls.temp = tempfile.TemporaryDirectory()
        cls.base = Path(cls.temp.name).resolve() / 'base'
        cls.adapter = Path(cls.temp.name).resolve() / 'adapter'
        torch.manual_seed(7)
        model = LlamaForCausalLM(LlamaConfig(vocab_size=8, hidden_size=16, intermediate_size=32,
            num_hidden_layers=1, num_attention_heads=2, num_key_value_heads=1,
            max_position_embeddings=128, bos_token_id=1, eos_token_id=2, pad_token_id=0))
        model.save_pretrained(cls.base)
        tokenizer = Tokenizer(models.WordLevel({'[PAD]':0, '[BOS]':1, '[EOS]':2, '[UNK]':3, 'user':4, 'assistant':5, 'hello':6, ':':7}, unk_token='[UNK]'))
        tokenizer.pre_tokenizer = pre_tokenizers.Whitespace()
        PreTrainedTokenizerFast(tokenizer_object=tokenizer, pad_token='[PAD]', eos_token='[EOS]', unk_token='[UNK]').save_pretrained(cls.base)
        model.name_or_path = str(cls.base)
        wrapped = get_peft_model(model, LoraConfig(task_type='CAUSAL_LM', r=2, lora_alpha=4, target_modules=['q_proj', 'v_proj']))
        with torch.no_grad():
            for name, parameter in wrapped.named_parameters():
                if 'lora_B' in name:
                    parameter.fill_(0.25)
        wrapped.save_pretrained(cls.adapter)

    @classmethod
    def tearDownClass(cls):
        cls.temp.cleanup()

    def test_load_and_generate_with_resident_adapter(self):
        import torch
        engine = Inference(self.base, 'base+lora', 128, 'cpu', self.adapter)
        self.assertTrue(any('lora_A' in name for name, _ in engine.model.named_parameters()))
        self.assertFalse(any(p.requires_grad for p in engine.model.parameters()))
        inputs, options, count = engine.prepare({'model':'base+lora', 'messages':[{'role':'user','content':'hello'}], 'max_tokens':3, 'temperature':0})
        with torch.inference_mode():
            adapted = engine.model(**inputs).logits
            with engine.model.disable_adapter():
                plain = engine.model(**inputs).logits
            self.assertFalse(torch.allclose(adapted, plain))
            result = engine.model.generate(**inputs, **options)
        self.assertGreater(result.shape[-1], count)
        memory = engine.runtime['memory']
        self.assertEqual(memory['totalBytes'], memory['baseBytes'] + memory['adapterBytes'] + memory['overheadAndCacheBytes'])
        self.assertGreater(memory['adapterBytes'], 0)
        self.assertGreaterEqual(memory['baseBytes'], sum(p.numel() * p.element_size() for n, p in engine.model.named_parameters() if 'lora_' not in n))

    def test_wrong_tensor_shape_is_rejected(self):
        import torch
        from safetensors.torch import load_file, save_file
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            (root / 'adapter_config.json').write_bytes((self.adapter / 'adapter_config.json').read_bytes())
            weights = load_file(self.adapter / 'adapter_model.safetensors')
            key = next(iter(weights))
            weights[key] = torch.zeros((99, 99))
            save_file(weights, root / 'adapter_model.safetensors')
            with self.assertRaises((ValueError, RuntimeError)):
                Inference(self.base, 'invalid', 128, 'cpu', root)

    def test_memory_counts_tensors_rather_than_adapter_file_alone(self):
        memory = adapter_memory(self.base, self.adapter, 128, 'cpu')
        self.assertGreater(memory['totalBytes'], (self.adapter / 'adapter_model.safetensors').stat().st_size)
        self.assertGreater(memory['baseBytes'], memory['adapterBytes'])

    def test_inspection_cli_returns_the_cumulative_report(self):
        import subprocess
        import sys
        result = subprocess.run([sys.executable, str(Path(__file__).with_name('server.py')),
            '--inspect', '--model', str(self.base), '--adapter', str(self.adapter), '--ctx-size', '128'],
            capture_output=True, text=True, check=True, timeout=30)
        self.assertEqual(json.loads(result.stdout), adapter_memory(self.base, self.adapter, 128, 'cpu'))

    def test_insufficient_cumulative_ram_is_rejected_before_loading(self):
        from types import SimpleNamespace
        from unittest.mock import patch
        with patch('psutil.virtual_memory', return_value=SimpleNamespace(available=1)):
            with self.assertRaisesRegex(MemoryError, 'base \\+ adapter'):
                Inference(self.base, 'too-large', 128, 'cpu', self.adapter)


if __name__ == '__main__':
    unittest.main()
