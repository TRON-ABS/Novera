"""Offline configuration/loader contracts and opt-in real CUDA round trips."""
import gc
import io
import json
import os
from pathlib import Path
import tempfile
import unittest
from types import SimpleNamespace
from unittest.mock import MagicMock, patch
from contextlib import redirect_stdout, redirect_stderr

from server import Inference, quantization_method, quantization_capabilities, quantized_memory_bytes, validate_directory


class QuantizationPolicyTest(unittest.TestCase):
    def test_shared_configuration_contract(self):
        cases = json.loads(Path(__file__).with_name('quantization-cases.json').read_text())
        for case in cases:
            with self.subTest(case['name']):
                if case['expected'] == 'unsupported':
                    with self.assertRaises(ValueError):
                        quantization_method(case['config'])
                else:
                    self.assertEqual(quantization_method(case['config']), case['expected'])

    def test_missing_optional_loader_is_not_ready(self):
        torch = SimpleNamespace(cuda=SimpleNamespace(is_available=lambda: True, get_device_capability=lambda _: (12, 0)), version=SimpleNamespace(cuda='13.0'))
        with patch('server.importlib.import_module', side_effect=ImportError('missing loader')):
            for result in quantization_capabilities(torch).values():
                self.assertFalse(result['available'])
                self.assertIn('missing loader', result['reason'])

    def test_cpu_never_reports_quantized_cuda_ready(self):
        torch = SimpleNamespace(cuda=SimpleNamespace(is_available=lambda: False), version=SimpleNamespace(cuda=None))
        self.assertTrue(all(not result['available'] for result in quantization_capabilities(torch).values()))

    def test_loader_banners_cannot_corrupt_probe_json_stdout(self):
        torch = SimpleNamespace(cuda=SimpleNamespace(is_available=lambda: True, get_device_capability=lambda _: (12, 0)), version=SimpleNamespace(cuda='13.0'))
        output, diagnostics = io.StringIO(), io.StringIO()
        with patch('server.importlib.import_module', side_effect=lambda _: print('loader banner')), redirect_stdout(output), redirect_stderr(diagnostics):
            quantization_capabilities(torch)
        self.assertEqual(output.getvalue(), '')
        self.assertIn('loader banner', diagnostics.getvalue())

    def test_context_and_packed_weight_memory(self):
        config = dict(num_hidden_layers=32, num_attention_heads=32, num_key_value_heads=8, hidden_size=4096)
        short = quantized_memory_bytes(config, 4 * 1024 ** 3, 8192)
        long = quantized_memory_bytes(config, 4 * 1024 ** 3, 32768)
        self.assertGreater(short, 4 * 1024 ** 3)
        self.assertEqual(long - short, 3 * 1024 ** 3)

    def test_quantized_directory_still_requires_every_local_shard(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            (root / 'config.json').write_text(json.dumps({'quantization_config': {'quant_method':'gptq', 'bits':4}}))
            (root / 'tokenizer.json').write_text('{}')
            (root / 'model.safetensors').write_bytes(b'fixture')
            self.assertEqual(validate_directory(root), root.resolve())
            (root / 'model.safetensors.index.json').write_text(json.dumps({'weight_map': {'x':'../outside.safetensors'}}))
            with self.assertRaises((ValueError, FileNotFoundError)):
                validate_directory(root)

    def test_all_quantized_loaders_dispatch_to_cuda_without_moving_or_expanding_weights(self):
        for method, config in [('awq', {'quant_method':'awq', 'bits':4}),
                               ('gptq', {'quant_method':'gptq', 'bits':4}),
                               ('bitsandbytes-4bit', {'quant_method':'bitsandbytes', 'load_in_4bit':True}),
                               ('bitsandbytes-8bit', {'quant_method':'bitsandbytes', 'load_in_8bit':True})]:
            with self.subTest(method), tempfile.TemporaryDirectory() as temp:
                root = Path(temp)
                (root / 'config.json').write_text(json.dumps({'quantization_config':config}))
                (root / 'tokenizer.json').write_text('{}')
                (root / 'model.safetensors').write_bytes(b'fixture')
                torch = MagicMock()
                torch.cuda.is_available.return_value = True
                torch.cuda.mem_get_info.return_value = (8 * 1024 ** 3, 8 * 1024 ** 3)
                torch.__version__ = 'test'
                transformers = MagicMock()
                model = transformers.AutoModelForCausalLM.from_pretrained.return_value
                model.parameters.return_value = iter([SimpleNamespace(device='cuda:0')])
                model.config.max_position_embeddings = 128
                with patch.dict('sys.modules', {'torch':torch, 'transformers':transformers}), patch('server.quantization_capabilities', return_value={method:{'available':True}}):
                    engine = Inference(root, 'test', 128, 'cuda')
                    kwargs = transformers.AutoModelForCausalLM.from_pretrained.call_args.kwargs
                    self.assertEqual(kwargs['device_map'], {'':0})
                    self.assertIs(kwargs['dtype'], torch.float16)
                    self.assertTrue(kwargs['local_files_only'])
                    self.assertFalse(kwargs['trust_remote_code'])
                    model.to.assert_not_called()
                    self.assertEqual(engine.runtime['quantization'], method)
                transformers.AutoModelForCausalLM.reset_mock()
                with patch.dict('sys.modules', {'torch':torch, 'transformers':transformers}), patch('server.quantization_capabilities', return_value={method:{'available':False, 'reason':'missing loader'}}):
                    with self.assertRaisesRegex(RuntimeError, 'missing loader'):
                        Inference(root, 'test', 128, 'cuda')
                    transformers.AutoModelForCausalLM.from_pretrained.assert_not_called()
                torch.cuda.mem_get_info.return_value = (200 * 1024 ** 2, 8 * 1024 ** 3)
                with patch.dict('sys.modules', {'torch':torch, 'transformers':transformers}), patch('server.quantization_capabilities', return_value={method:{'available':True}}):
                    with self.assertRaisesRegex(MemoryError, 'Insufficient free VRAM'):
                        Inference(root, 'test', 128, 'cuda')
                    transformers.AutoModelForCausalLM.from_pretrained.assert_not_called()


@unittest.skipUnless(os.environ.get('NOVERA_TEST_QUANTIZED_CUDA') == '1', 'Opt-in real CUDA quantization test')
class BitsandbytesCudaTest(unittest.TestCase):
    def round_trip(self, bits):
        import torch
        from transformers import AutoModelForCausalLM, BitsAndBytesConfig, LlamaConfig, LlamaForCausalLM
        from create_tiny_model import create
        self.assertTrue(torch.cuda.is_available(), 'CUDA required for this validation')
        with tempfile.TemporaryDirectory(prefix='novera-quantized-') as temp:
            root = Path(temp)
            base, packed = root / 'base', root / 'packed'
            create(base)
            # Standard Linear attention/MLP layers exercise actual BNB kernels.
            model = LlamaForCausalLM(LlamaConfig(vocab_size=32, hidden_size=128, intermediate_size=256,
                num_hidden_layers=2, num_attention_heads=4, num_key_value_heads=2,
                max_position_embeddings=128, bos_token_id=2, eos_token_id=2, pad_token_id=1))
            model.save_pretrained(base, safe_serialization=True)
            del model
            config = BitsAndBytesConfig(**{f'load_in_{bits}bit': True}, **({'bnb_4bit_quant_type':'nf4'} if bits == 4 else {}))
            model = AutoModelForCausalLM.from_pretrained(base, quantization_config=config,
                device_map={'':0}, dtype=torch.float16, local_files_only=True, trust_remote_code=False)
            self.assertTrue(any(type(module).__name__ == ('Linear4bit' if bits == 4 else 'Linear8bitLt') for module in model.modules()))
            model.save_pretrained(packed, safe_serialization=True, max_shard_size='50KB')
            from transformers import AutoTokenizer
            AutoTokenizer.from_pretrained(base, local_files_only=True).save_pretrained(packed)
            del model
            gc.collect()
            torch.cuda.empty_cache()
            engine = Inference(packed, f'tiny-{bits}', 128, 'cuda')
            self.assertEqual(engine.runtime['quantization'], f'bitsandbytes-{bits}bit')
            self.assertTrue(engine.runtime['parameter_device'].startswith('cuda'))
            inputs, options, count = engine.prepare({'model':f'tiny-{bits}', 'messages':[{'role':'user','content':'Bonjour Novera'}], 'max_tokens':3, 'temperature':0})
            with torch.inference_mode():
                output = engine.model.generate(**inputs, **options)
            self.assertGreater(output.shape[-1], count)
            # A quantized checkpoint must never silently expand onto CPU.
            with self.assertRaisesRegex(ValueError, 'requires CUDA'):
                Inference(packed, 'cpu-refused', 128, 'cpu')
            del engine
            gc.collect()
            torch.cuda.empty_cache()

    def test_nf4_cuda_save_reload_generate(self):
        self.round_trip(4)

    def test_int8_cuda_save_reload_generate(self):
        self.round_trip(8)


@unittest.skipUnless(os.environ.get('NOVERA_TEST_GPTQ_CUDA') == '1', 'Opt-in real GPTQModel CUDA test')
class AwqGptqCudaTest(unittest.TestCase):
    def round_trip(self, method):
        import torch
        from create_quantized_fixture import create
        self.assertTrue(torch.cuda.is_available())
        with tempfile.TemporaryDirectory(prefix=f'novera-{method}-') as temp:
            packed = create(temp, method)
            engine = Inference(packed, method, 128, 'cuda')
            self.assertEqual(engine.runtime['quantization'], method)
            self.assertEqual(engine.runtime['quantization_backend'], 'torch-cuda')
            self.assertTrue(engine.runtime['parameter_device'].startswith('cuda'))
            self.assertTrue(any(hasattr(module, 'qweight') for module in engine.model.modules()))
            inputs, options, count = engine.prepare({'model':method, 'messages':[{'role':'user', 'content':'Bonjour Novera'}], 'max_tokens':3, 'temperature':0})
            with torch.inference_mode():
                output = engine.model.generate(**inputs, **options)
            self.assertGreater(output.shape[-1], count)
            del engine
            gc.collect()
            torch.cuda.empty_cache()

    def test_awq_cuda_save_reload_generate(self):
        self.round_trip('awq')

    def test_gptq_cuda_save_reload_generate(self):
        self.round_trip('gptq')


if __name__ == '__main__':
    unittest.main(verbosity=2)
