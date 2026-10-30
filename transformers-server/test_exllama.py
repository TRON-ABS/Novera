import json
from pathlib import Path
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import MagicMock, patch

from exllama_backend import ExLlamaInference
from server import validate_directory, weight_files


class ExLlamaTest(unittest.TestCase):
    def fixture(self, root, method):
        (root / "config.json").write_text(json.dumps({"quantization_config": {"quant_method": method, "bits": 4.0}, "max_position_embeddings": 2048}))
        (root / "tokenizer.json").write_text("{}")
        (root / "output.safetensors").write_bytes(b"fixture")

    def modules(self):
        torch = MagicMock()
        torch.cuda.is_available.return_value = True
        torch.cuda.get_device_capability.return_value = (12, 0)
        torch.cuda.mem_get_info.return_value = (8 * 1024**3, 8 * 1024**3)
        torch.__version__ = "test"
        transformers = MagicMock()
        transformers.AutoTokenizer.from_pretrained.return_value.eos_token_id = 2
        return {"torch": torch, "transformers": transformers, "exllamav3": MagicMock(),
                "exllamav2": MagicMock(), "exllamav2.generator": MagicMock()}

    def test_each_checkpoint_selects_its_dedicated_loader_without_transformers_weights(self):
        for method in ("exl3", "exl2"):
            with self.subTest(method), tempfile.TemporaryDirectory() as temp:
                root = Path(temp)
                self.fixture(root, method)
                modules = self.modules()
                with patch.dict("sys.modules", modules):
                    engine = ExLlamaInference(root, "test", 1024)
                self.assertEqual(engine.runtime["quantization"], method)
                modules["transformers"].AutoModelForCausalLM.from_pretrained.assert_not_called()
                if method == "exl3":
                    modules["exllamav3"].Model.from_config.return_value.load.assert_called_once_with(device="cuda:0")
                    modules["exllamav2"].ExLlamaV2.assert_not_called()
                else:
                    modules["exllamav2"].ExLlamaV2.return_value.load.assert_called_once_with(gpu_split=[99999])
                    self.assertIs(modules["exllamav2"].ExLlamaV2Config.return_value.no_sdpa, True)
                    modules["exllamav3"].Model.from_config.assert_not_called()

    def test_cuda_and_free_memory_are_required_before_loading(self):
        for defect in ("cpu", "no-cuda", "old-gpu", "oom"):
            with self.subTest(defect), tempfile.TemporaryDirectory() as temp:
                root = Path(temp)
                self.fixture(root, "exl3")
                modules = self.modules()
                if defect == "no-cuda":
                    modules["torch"].cuda.is_available.return_value = False
                if defect == "old-gpu":
                    modules["torch"].cuda.get_device_capability.return_value = (7, 5)
                if defect == "oom":
                    modules["torch"].cuda.mem_get_info.return_value = (1024, 8 * 1024**3)
                with patch.dict("sys.modules", modules), self.assertRaises((ValueError, MemoryError)):
                    ExLlamaInference(root, "test", 1024, "cpu" if defect == "cpu" else "auto")
                modules["exllamav3"].Model.from_config.assert_not_called()

    def test_exl2_arbitrary_shard_names_are_validated_and_no_weights_is_rejected(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            self.fixture(root, "exl2")
            self.assertEqual(validate_directory(root), root.resolve())
            config = json.loads((root / "config.json").read_text())
            self.assertEqual(weight_files(root, config), {"output.safetensors"})
            (root / "output.safetensors").unlink()
            with self.assertRaisesRegex(ValueError, "no weights"):
                validate_directory(root)

    def test_exl3_stream_reports_usage_and_releases_its_job(self):
        engine = ExLlamaInference.__new__(ExLlamaInference)
        engine.method = "exl3"
        engine.cancel = MagicMock()
        engine.cancel.is_set.return_value = False
        engine.tokenizer = SimpleNamespace(eos_token_id=2)
        engine.generator = MagicMock()
        engine.generator.num_remaining_jobs.return_value = 1
        engine.generator.iterate.return_value = [{"text": "hello", "eos": False},
            {"text": "!", "eos": True, "new_tokens": 2, "eos_reason": "max_new_tokens"}]
        module = MagicMock()
        with patch.dict("sys.modules", {"exllamav3": module}):
            result = list(engine.generate_chunks(SimpleNamespace(input_ids="ids"), {"max_new_tokens": 2}))
        self.assertEqual(result, [("text", "hello"), ("text", "!"), ("done", (2, "length"))])
        engine.generator.cancel.assert_called_once_with(module.Job.return_value)

    def test_exl3_cancel_removes_job_and_returns_stop(self):
        engine = ExLlamaInference.__new__(ExLlamaInference)
        engine.method = "exl3"
        engine.cancel = MagicMock()
        engine.cancel.is_set.return_value = True
        engine.tokenizer = SimpleNamespace(eos_token_id=2)
        engine.generator = MagicMock()
        module = MagicMock()
        module.Job.return_value.new_tokens = 0
        with patch.dict("sys.modules", {"exllamav3": module}):
            self.assertEqual(list(engine.generate_chunks(SimpleNamespace(input_ids="ids"), {"max_new_tokens": 2})), [("done", (0, "stop"))])
        engine.generator.iterate.assert_not_called()
        engine.generator.cancel.assert_called_once()

    def test_exl2_stream_limits_tokens_and_uses_abort_event(self):
        engine = ExLlamaInference.__new__(ExLlamaInference)
        engine.method = "exl2"
        engine.cancel = MagicMock()
        engine.cancel.is_set.return_value = False
        engine.generator = MagicMock()
        ids = SimpleNamespace(numel=lambda: 1)
        engine.generator.stream.side_effect = [("a", False, ids), ("b", False, ids)]
        module = MagicMock()
        with patch.dict("sys.modules", {"exllamav2.generator": module}):
            result = list(engine.generate_chunks(SimpleNamespace(input_ids="ids"), {"max_new_tokens": 2}))
        self.assertEqual(result, [("text", "a"), ("text", "b"), ("done", (2, "length"))])
        engine.generator.begin_stream.assert_called_once_with("ids", module.ExLlamaV2Sampler.Settings.greedy.return_value,
                                                             token_healing=False, abort_event=engine.cancel)


if __name__ == "__main__":
    unittest.main()
