# LoRA / PEFT validation — 31 October 2026

Implemented locally in the existing Novera checkout; no commit, publication, desktop release or CI validation is claimed. Existing unrelated working changes were preserved.

## Behavior

- Import a complete local Transformers base folder and attach a separate PEFT LoRA folder. Persist both paths as one selectable model; include both disk weights in its size. Unregistering preserves user files.
- Reject standalone adapters, mismatched/unknown declared bases, unsupported tasks, quantized bases, unverifiable revision pins, tokenizer overrides and invalid/missing weights. PEFT validates target modules and tensor dimensions at load; missing/unexpected tensors fail loading.
- Display the base, adapter, cache/overhead and total resident-memory estimate before registration. Recalculate for the requested context at load; check RAM/VRAM with a reserve. The estimate reads tensor shapes/dtypes instead of treating adapter disk size as full-model memory. Use conservative FP32 floating-point storage, including cache. Expose runtime memory in the health response and desktop session.
- Identify adapter-only Hub entries as requiring a base and leave their independent inference-memory estimate unknown.

## Checks actually run

| Check | Result |
| --- | --- |
| Vitest import dialog, engine IPC, Hub catalog, discovery and Hugging Face feed | 83 passed across 5 files (82 initially; the added feed regression brought the total to 83) |
| `NOVERA_TEST_PEFT=1 python -m unittest discover -s transformers-server -p test_peft.py` | 8 passed, real tiny Llama CPU generation, changed logits with adapter enabled, mismatched tensors/base rejection, cumulative RAM guard and CLI JSON inspection |
| `python -m unittest discover -s transformers-server -p test_server.py` | 10 passed; required local-socket execution outside the restricted sandbox after WinError 10013 inside it |
| `python -m unittest discover -s transformers-server -p test_quantization.py` | 7 passed, 4 CUDA opt-in tests skipped |
| `node core/node_modules/typescript/bin/tsc -p core` | Passed; regenerated local core declarations |
| `node web-app/node_modules/typescript/bin/tsc -b web-app --pretty false` | Passed |
| `cargo check --offline --locked --manifest-path src-tauri/Cargo.toml --lib` | Passed; existing AMD naming warnings |
| Native library test harness, `core::transformers::tests` | 3 passed, 1 explicit model lifecycle test ignored; compiled all library tests first |
| `git diff --check` | Passed |

The native harness was built with Rust 1.98.0/MSVC and given the existing common-controls manifest before execution. Commands and raw test outputs are in the ignored `.build/lora-peft` directory. Python inference used 3.15.1, PyTorch 2.14.1+cpu, Transformers 5.20.2, Safetensors 0.8.0, PEFT 0.21.2 and Accelerate 1.15.0.

## Limits

LoRA `CAUSAL_LM` on an unquantized Transformers base only. GGUF, MLX, ExLlama and quantized adapter combinations are not implemented. Real CUDA adapter inference and a full desktop UI/binary build were not run. Native unit tests verify registry backward compatibility and standalone-adapter refusal; a real base-plus-adapter desktop lifecycle was not exercised. Runtime memory is estimated, not a measured peak. Local base metadata matching is not cryptographic provenance. Optional dependencies must be installed into the Python environment selected by the user; the existing repository test environment was equipped for this validation.

## TokenEconomizer

The final local `status` query recognized `tron-abs/novera`, but reported 0 consolidated sessions, 0 effective tokens, 0 overhead tokens, 0 injected facts, 0 redirects and 0 still-stuck notices. No token savings or automatic hook operation can be established from these counters. Configuration remains envfacts / nudge, with tool pruning and repository map off. See `docs/TOKENECONOMIZER.md`.
