# Local ONNX Runtime engine

The desktop engine imports complete local export folders, keeps weights in place, and serves authenticated loopback inference. It does not download weights or execute Python from a model repository. Windows, Linux and macOS use CPU by default. Explicit CUDA requires a compatible separately installed ONNX Runtime CUDA environment; CUDA inference has not been validated here.

Create a separate Python environment and install the tested CPU stack:

```powershell
python -m venv .build/onnx/runtime
.build/onnx/runtime/Scripts/python.exe -m pip install -r onnx-server/requirements-genai.txt
```

Select that interpreter in **Settings → Providers → ONNX Runtime → Python**, then import a folder. The Hub's ONNX engine selector requests ONNX repositories explicitly and links to local import. Downloads of arbitrary export bundles are not automated: retain all graph, external weight and tokenizer files with their original relative names.

## General graphs and specialized tasks

One `.onnx` graph is selected automatically, including a graph in a subdirectory. For multiple graphs, add `novera_onnx.json` to the imported root:

```json
{"model":"onnx/model.onnx"}
```

Use the model in chat by sending a JSON tensor request as the user message. This is a tensor interface; image/audio preprocessing, tokenization, label decoding and multi-stage pipelines must be supplied by the caller for that exported task. A graph containing `Add(x, [1,2])` accepts:

```json
{"inputs":{"x":{"dtype":"float32","shape":[1,2],"data":[3,4]}}}
```

It returns `{"outputs":{"y":{"dtype":"float32","shape":[1,2],"data":[4,6]}}}`. Data is flat, shapes and dtypes must match the graph, and shared dynamic dimensions must agree. Integer 64-bit values may be decimal strings and are always returned as strings to preserve precision in JavaScript. Numeric/bool tensors are supported; sequences, maps, sparse/string inputs and custom operators are outside this interface. Each input/output is limited to one million elements; requests are capped at 4 MiB. Output allocation still depends on the graph itself.

For integration code, the managed session also serves `GET /v1/onnx/schema` and `POST /v1/onnx/run`, using the session bearer key. Chat uses `/v1/chat/completions` with streaming, busy rejection and request-specific cancellation. Raw tensor chat reports zero token usage because it does not tokenize text. Unregistering removes only the registry entry.

## Text generation

An export with `genai_config.json`, a local decoder graph, `tokenizer.json` and a string `chat_template` in `tokenizer_config.json` uses ONNX Runtime GenAI. This requires `requirements-genai.txt`. The engine applies the export's chat template, bounds context by the model configuration and exposes temperature, top-p and output length. Only text messages and a single decoder are integrated; vision, speech, encoder pipelines, tools and adapters are rejected. Import validation checks files; actual operator/runtime compatibility is established at load time.

## Validation

```powershell
.build/onnx/runtime/Scripts/python.exe -m unittest discover -s onnx-server -v
python scripts/tests/check-onnx-native.py
cargo check --manifest-path src-tauri/Cargo.toml --locked --lib
```

Tests execute a real CPU Add graph, external-data graph and int64 identity graph, plus a synthetic zero-layer GenAI decoder through the real GenAI library. The synthetic decoder checks API integration, templates, context, sampling and cancellation; it does not establish trained-model quality, KV-cache behavior or performance. No broad compatibility or GPU speed claim is made.

References: [ONNX Runtime inference](https://onnxruntime.ai/docs/api/python/api_summary.html), [GenAI Python API](https://onnxruntime.ai/docs/genai/api/python.html).

The isolated Rust harness runs the supervisor source with a test registry and a stand-in app handle. It checks import, Python environment probing, startup, authenticated inference, session tracking and unregister/unload while retaining the graph. It does not validate Tauri IPC. The Windows `STATUS_ENTRYPOINT_NOT_FOUND (0xc0000139)` startup failure has been corrected by linking the existing Common-Controls v6 manifest into the unit-test harness. Both actual Tauri ONNX tests now pass, including worker startup/inference/unload. See the [Windows test report](../deliverables/tauri-windows-tests-2026-10-31/validation.md). Installed-application behavior remains unverified.
