"""Policy tests plus opt-in real FP8/NVFP4 dense LLM generation on CUDA."""
import gc
import json
import os
from pathlib import Path
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import patch

from float_quant import modelopt_method, read_model_config, kernel_probe


class FloatPolicyTests(unittest.TestCase):
    def test_cpu_and_old_gpu_never_report_native_ready(self):
        for method in ("modelopt-fp8", "modelopt-nvfp4"):
            for available, capability in ((False, (12, 0)), (True, (8, 0))):
                torch = SimpleNamespace(cuda=SimpleNamespace(is_available=lambda: available, get_device_capability=lambda _: capability),
                                        version=SimpleNamespace(cuda="13.0"))
                with self.assertRaises(RuntimeError):
                    kernel_probe(torch, method)

    def test_sidecar_normalization_conflicts_and_no_source_mutation(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            config = {"model_type": "llama", "architectures": ["LlamaForCausalLM"]}
            quant = {"quant_algo": "NVFP4", "group_size": 16, "kv_cache_quant_algo": None}
            (root / "config.json").write_text(json.dumps(config))
            (root / "hf_quant_config.json").write_text(json.dumps({"quantization": quant}))
            self.assertEqual(modelopt_method(read_model_config(root)), "modelopt-nvfp4")
            self.assertEqual(json.loads((root / "config.json").read_text()), config)
            config["quantization_config"] = {"quant_method": "modelopt", **quant}
            (root / "config.json").write_text(json.dumps(config))
            self.assertEqual(modelopt_method(read_model_config(root)), "modelopt-nvfp4")
            config["quantization_config"]["quant_algo"] = "FP8"
            (root / "config.json").write_text(json.dumps(config))
            with self.assertRaisesRegex(ValueError, "Conflicting"):
                read_model_config(root)


@unittest.skipUnless(os.environ.get("NOVERA_FLOAT_CUDA_TEST") == "1", "Opt-in real FP8/NVFP4 CUDA test")
class FloatCudaTests(unittest.TestCase):
    def test_kernel_prefill_and_decode_match_reference(self):
        import torch
        for method in ("modelopt-fp8", "modelopt-nvfp4"):
            with self.subTest(method=method):
                result = kernel_probe(torch, method)
                self.assertTrue(result["kernelValidated"])
                self.assertEqual(len(result["relativeErrors"]), 2)

    def test_all_architectures_load_packed_generate_and_keep_bounded_numeric_error(self):
        import torch
        from safetensors.torch import load_file
        from transformers import AutoConfig, AutoModelForCausalLM
        from create_float_fixture import create
        from server import Inference, weight_files
        results = []
        for family in ("llama", "qwen2", "qwen3"):
            for method in ("modelopt-fp8", "modelopt-nvfp4"):
                with self.subTest(family=family, method=method), tempfile.TemporaryDirectory() as temp:
                    root = create(Path(temp) / "fixture", family, method, sharded=method.endswith("nvfp4"))
                    engine = Inference(root, "test", 128, "cuda")
                    self.assertEqual(engine.runtime["packed_layers"], 14)
                    self.assertTrue(engine.runtime["kernel_validated"])
                    self.assertEqual(engine.runtime["packed_weight_bytes"], 327680 if method.endswith("fp8") else 163840)
                    config = read_model_config(root)
                    config.pop("quantization_config")
                    kind = config.pop("model_type")
                    reference = AutoModelForCausalLM.from_config(AutoConfig.for_model(kind, **config), dtype=torch.bfloat16, attn_implementation="eager")
                    checkpoint = {}
                    for file in weight_files(root, read_model_config(root)):
                        checkpoint.update(load_file(root / file))
                    decoded = {}
                    lut = torch.tensor([0, .5, 1, 1.5, 2, 3, 4, 6, 0, -.5, -1, -1.5, -2, -3, -4, -6])
                    for key, value in checkpoint.items():
                        if not key.endswith(".weight") or key.removesuffix(".weight") + ".weight_scale" not in checkpoint:
                            if key in reference.state_dict():
                                decoded[key] = value
                            continue
                        name = key.removesuffix(".weight")
                        scale = checkpoint[name + ".weight_scale"].float()
                        if method.endswith("fp8"):
                            decoded[key] = (value.float() * scale).to(torch.bfloat16)
                        else:
                            codes = torch.stack((value & 15, value >> 4), -1).flatten(-2)
                            decoded[key] = (lut[codes.long()] * scale.repeat_interleave(16, -1) * checkpoint[name + ".weight_scale_2"]).to(torch.bfloat16)
                    reference.load_state_dict(decoded, strict=True)
                    reference = reference.to("cuda").eval()
                    # A plain decoded-weight baseline omits activation quantization.
                    # Compare the kernels against the SAME quantized activations;
                    # retain the plain-baseline difference as a separate observation.
                    class ReferenceLinear(torch.nn.Module):
                        def __init__(self, weight, activation_scale, bias):
                            super().__init__()
                            self.register_buffer("decoded_weight", weight.to("cuda"))
                            self.register_buffer("activation_scale", activation_scale.to("cuda") if activation_scale is not None else None)
                            self.register_buffer("bias", bias.to("cuda") if bias is not None else None)
                        def forward(self, x):
                            shape = x.shape
                            flat = x.reshape(-1, shape[-1]).to(torch.bfloat16).contiguous()
                            if self.activation_scale is None:
                                scale = (flat.float().abs().amax() / 448).clamp_min(1e-12)
                                values = (flat.float() / scale).clamp(-448, 448).to(torch.float8_e4m3fn).float() * scale
                            else:
                                import comfy_kitchen as ck
                                packed, scales = ck.quantize_nvfp4(flat, self.activation_scale, pad_16x=True, hi_first=True)
                                values = ck.dequantize_nvfp4(packed, self.activation_scale, scales, output_type=torch.float32, hi_first=True)[:flat.shape[0]]
                            output = (values @ self.decoded_weight.t()).to(torch.bfloat16)
                            if self.bias is not None:
                                output = output + self.bias
                            return output.reshape(*shape[:-1], self.decoded_weight.shape[0])
                    ids = torch.tensor([[8, 11, 16, 17, 18, 19, 20, 21]], device="cuda")
                    with torch.inference_mode():
                        native_logits = engine.model(input_ids=ids).logits.float()
                        plain_logits = reference(input_ids=ids).logits.float()
                        baseline_error = float((native_logits - plain_logits).norm() / plain_logits.norm())
                    for name, module in list(reference.named_modules()):
                        key = name + ".weight"
                        if name + ".weight_scale" not in checkpoint:
                            continue
                        value = checkpoint[key]
                        if method.endswith("fp8"):
                            exact_weight = value.float() * checkpoint[name + ".weight_scale"]
                            activation_scale = None
                        else:
                            codes = torch.stack((value & 15, value >> 4), -1).flatten(-2)
                            exact_weight = lut[codes.long()] * checkpoint[name + ".weight_scale"].float().repeat_interleave(16, -1) * checkpoint[name + ".weight_scale_2"]
                            activation_scale = checkpoint[name + ".input_scale"].float().reshape(())
                        parent, _, child = name.rpartition(".")
                        setattr(reference.get_submodule(parent), child, ReferenceLinear(exact_weight, activation_scale, checkpoint.get(name + ".bias")))
                    with torch.inference_mode():
                        actual = engine.model(input_ids=ids).logits.float()
                        expected = reference(input_ids=ids).logits.float()
                        error = float((actual - expected).norm() / expected.norm())
                        self.assertLess(error, 0.02)
                        inputs, options, prompt = engine.prepare({"model": "test", "messages": [{"role": "user", "content": "Bonjour Novera"}], "max_tokens": 4, "temperature": 0})
                        generated = engine.model.generate(**inputs, **options)
                    self.assertGreater(generated.shape[-1], prompt)
                    results.append({"family": family, "method": method, "relativeLogitError": error, "decodedWeightOnlyBaselineError": baseline_error,
                                    "generatedTokens": generated.shape[-1] - prompt, **engine.runtime})
                    del engine, reference, actual, expected, checkpoint, decoded
                    gc.collect()
                    torch.cuda.empty_cache()
        report = os.environ.get("NOVERA_FLOAT_TEST_REPORT")
        if report:
            Path(report).write_text(json.dumps(results, indent=2), encoding="utf-8")

    def test_tied_embeddings_inline_metadata_and_missing_parameters(self):
        import torch
        from safetensors.torch import load_file, save_file
        from create_float_fixture import create
        from server import Inference
        with tempfile.TemporaryDirectory() as temp:
            root = create(Path(temp) / "fixture", "qwen3", "modelopt-nvfp4", tied=True)
            config = read_model_config(root)
            (root / "config.json").write_text(json.dumps(config), encoding="utf-8")
            (root / "hf_quant_config.json").unlink()
            engine = Inference(root, "tied", 128, "cuda")
            self.assertEqual(engine.model.get_input_embeddings().weight.data_ptr(), engine.model.get_output_embeddings().weight.data_ptr())
            with torch.inference_mode():
                self.assertTrue(bool(torch.isfinite(engine.model(input_ids=torch.zeros((1, 2), device="cuda", dtype=torch.long)).logits).all()))
            del engine
            state = load_file(root / "model.safetensors")
            state.pop("model.norm.weight")
            save_file(state, str(root / "model.safetensors"))
            with self.assertRaisesRegex(ValueError, "missing="):
                Inference(root, "broken", 128, "cuda")

    def test_invalid_layout_scales_architecture_memory_and_missing_kernel_fail_closed(self):
        import torch
        from safetensors.torch import load_file, save_file
        from create_float_fixture import create
        from float_quant import make_linear
        from server import Inference
        with tempfile.TemporaryDirectory() as temp:
            root = create(Path(temp) / "fixture", "llama", "modelopt-fp8")
            with patch("server.quantization_capabilities", return_value={"modelopt-fp8": {"available": False, "reason": "missing GPU kernel"}}):
                with self.assertRaisesRegex(RuntimeError, "missing GPU kernel"):
                    Inference(root, "test", 128, "cuda")
            with patch.object(torch.cuda, "mem_get_info", return_value=(1, 1)):
                with self.assertRaises(MemoryError):
                    Inference(root, "test", 128, "cuda")
            with self.assertRaisesRegex(ValueError, "requires CUDA"):
                Inference(root, "test", 128, "cpu")
            state = load_file(root / "model.safetensors")
            key = next(key for key in state if key.endswith(".weight_scale"))
            state[key] = torch.tensor([float("nan")])
            save_file(state, str(root / "model.safetensors"))
            with self.assertRaisesRegex(ValueError, "positive scale"):
                Inference(root, "test", 128, "cuda")
            state[key] = torch.ones(2)
            save_file(state, str(root / "model.safetensors"))
            with self.assertRaisesRegex(ValueError, "scalar layout"):
                Inference(root, "test", 128, "cuda")
        with self.assertRaisesRegex(ValueError, "row-major"):
            make_linear("modelopt-nvfp4", torch.zeros(128, 64, device="cuda", dtype=torch.uint8),
                        torch.ones(128, 4, device="cuda").to(torch.float8_e4m3fn), torch.ones(1, device="cuda"), torch.ones(1, device="cuda"))


if __name__ == "__main__":
    unittest.main()
