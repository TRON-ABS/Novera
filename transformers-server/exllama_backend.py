"""Explicit NVIDIA EXL3/EXL2 loaders behind Novera's local chat protocol.

No conversion, repository code, automatic download or CPU fallback is used.
ExLlamaV3 is preferred for EXL3; EXL2 always uses ExLlamaV2.
"""
import json
import queue
import threading

from server import Inference, quantization_method, quantized_memory_bytes, validate_directory, weight_files


class ExLlamaInference(Inference):
    def __init__(self, path, model_id, context_size=2048, device="auto"):
        import torch
        from transformers import AutoTokenizer

        root = validate_directory(path)
        config = json.loads((root / "config.json").read_text(encoding="utf-8"))
        self.method = quantization_method(config)
        if self.method not in ("exl3", "exl2"):
            raise ValueError("Select an explicitly quantized EXL3 or EXL2 checkpoint")
        if device == "cpu" or not torch.cuda.is_available() or not torch.version.cuda:
            raise ValueError("ExLlama requires NVIDIA CUDA; CPU fallback is disabled")
        minimum = (8, 0) if self.method == "exl3" else (7, 5)
        if torch.cuda.get_device_capability(0) < minimum:
            raise ValueError(f"{self.method} requires NVIDIA compute capability {minimum}")
        limit = config.get("max_position_embeddings", context_size)
        self.context_size = min(context_size, limit) if type(limit) is int and limit > 0 else context_size
        weights = sum((root / name).stat().st_size for name in weight_files(root, config))
        required = quantized_memory_bytes(config, weights, self.context_size)
        free, _total = torch.cuda.mem_get_info(0)
        if required > max(0, free - 1024 ** 3):
            raise MemoryError(f"Insufficient free VRAM for {self.method}: estimated {required} bytes plus 1 GiB reserve; {free} bytes free")
        self.tokenizer = AutoTokenizer.from_pretrained(root, local_files_only=True, trust_remote_code=False)
        if self.method == "exl3":
            from exllamav3 import Config, Model, Cache, Tokenizer, Generator
            native_config = Config.from_directory(str(root))
            self.native_tokenizer = Tokenizer.from_config(native_config)
            self.model = Model.from_config(native_config)
            # Page cache must fit the configured context. Single GPU, FP16 KV,
            # no CPU/disk cache or speculative draft during baseline comparison.
            self.cache = Cache(self.model, max_num_tokens=((self.context_size + 255) // 256) * 256)
            self.model.load(device="cuda:0")
            self.generator = Generator(model=self.model, cache=self.cache, tokenizer=self.native_tokenizer)
        else:
            from exllamav2 import ExLlamaV2, ExLlamaV2Config, ExLlamaV2Cache, ExLlamaV2Tokenizer
            from exllamav2.generator import ExLlamaV2StreamingGenerator
            native_config = ExLlamaV2Config(str(root))
            native_config.max_seq_len = self.context_size
            native_config.no_flash_attn = True
            # The pinned Torch 2.9 SDPA path produces incorrect Qwen2 logits on
            # the tested Blackwell GPU. Explicit eager CUDA attention is correct.
            native_config.no_sdpa = True
            native_config.arch_compat_overrides()
            self.model = ExLlamaV2(native_config)
            self.model.load(gpu_split=[99999])  # Explicitly GPU 0 only.
            self.cache = ExLlamaV2Cache(self.model, max_seq_len=self.context_size)
            self.native_tokenizer = ExLlamaV2Tokenizer(native_config)
            self.generator = ExLlamaV2StreamingGenerator(self.model, self.cache, self.native_tokenizer)
            self.generator.set_stop_conditions(self.eos_ids())
        self.model_id = model_id
        self.device = "cuda"
        self.input_device = "cpu"
        self.runtime = {
            "python": __import__("sys").version.split()[0], "torch": torch.__version__,
            "device": "cuda", "cuda": torch.version.cuda, "gpu": torch.cuda.get_device_name(0),
            "quantization": self.method, "quantization_backend": "exllamav3" if self.method == "exl3" else "exllamav2",
            "gpu_allocated_bytes": torch.cuda.memory_allocated(0),
        }
        self.lock = threading.Lock()
        self.cancel = threading.Event()
        self.jobs = queue.Queue()
        self.active_request = None

    def eos_ids(self):
        ids = self.tokenizer.eos_token_id
        return ids if isinstance(ids, list) else [ids] if ids is not None else []

    def generate_chunks(self, inputs, options):
        maximum = options["max_new_tokens"]
        temperature = options.get("temperature", 0.0)
        top_p = options.get("top_p", 1.0)
        if self.method == "exl3":
            from exllamav3 import Job, TopPSampler
            job = Job(input_ids=inputs.input_ids, max_new_tokens=maximum,
                      stop_conditions=self.eos_ids(), sampler=TopPSampler(top_p, temperature=temperature),
                      token_healing=False)
            self.generator.enqueue(job)
            tokens = 0
            try:
                while self.generator.num_remaining_jobs():
                    if self.cancel.is_set():
                        break
                    for result in self.generator.iterate():
                        if result.get("text"):
                            yield "text", result["text"]
                        if result.get("eos"):
                            tokens = result["new_tokens"]
                            yield "done", (tokens, "length" if result.get("eos_reason") == "max_new_tokens" else "stop")
                            return
                yield "done", (job.new_tokens, "stop")
            finally:
                self.generator.cancel(job)
        else:
            from exllamav2.generator import ExLlamaV2Sampler
            settings = ExLlamaV2Sampler.Settings.greedy() if temperature == 0 else ExLlamaV2Sampler.Settings(
                temperature=temperature, top_p=top_p, top_k=0, token_repetition_penalty=1.0)
            self.generator.begin_stream(inputs.input_ids, settings, token_healing=False, abort_event=self.cancel)
            tokens = 0
            reason = "stop"
            while tokens < maximum and not self.cancel.is_set():
                text, eos, ids = self.generator.stream()
                tokens += ids.numel()
                if text:
                    yield "text", text
                if eos:
                    break
            else:
                if tokens >= maximum:
                    reason = "length"
            yield "done", (tokens, reason)

    def run(self):
        import torch
        while True:
            body, output = self.jobs.get()
            try:
                inputs, options, prompt_tokens = self.prepare(body)
                output.put(("ready", None))
                with torch.inference_mode():
                    for kind, value in self.generate_chunks(inputs, options):
                        output.put((kind, (value[0], prompt_tokens, value[1]) if kind == "done" else value))
            except Exception as error:
                output.put(("error", str(error)))
            finally:
                self.active_request = None
                self.lock.release()
