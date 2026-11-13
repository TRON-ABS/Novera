# Private local conversation bridge — Novera 1.0.1

**Private development only. Do not publish, upload, push or package for public distribution without a new user instruction.** The user explicitly requested privacy on 8 November 2026. No public installer or model-download integration is implemented here.

The autonomous WebGPU browser remains the default and requires no Novera Desktop installation. The optional bridge requires a native worker running locally, independently of the Desktop GUI. Its setup UI is enabled only for a private build with `VITE_NOVERA_PRIVATE_NATIVE_CONVERSATION=true`. Pairing lasts for the page session; no token is persisted to browser storage.

The bridge runs the existing Desktop worker at its configured SHA-256, verifies the pinned Omni Q4 or Q8 text weights and the Q8 projector, and uses a 32768-token context. HTTP callers can submit bounded text or audio, but cannot choose executables, model files, paths, URLs, backends or arbitrary worker routes. It binds only 127.0.0.1, requires the exact configured Origin and bearer token, validates Host, and permits one operation at a time. Cancellation closes the upstream socket and remembers operations cancelled before their POST arrives. A private temporary preset and worker token are removed when the bridge closes normally.

Local configuration (keep actual paths and receipts outside source control):

```json
{
  "worker": "C:/path/to/novera-llama-worker.exe",
  "workerSha256": "SHA256_OF_THE_REVIEWED_WORKER",
  "model": "C:/path/to/LFM3-Omni-2B-Q4_K_M.gguf",
  "projector": "C:/path/to/mmproj-LFM3-Omni-2B-Q8_0.gguf"
}
```

```powershell
python scripts/native-conversation-bridge/server.py --config .build/private-conversation-config.json --origin http://127.0.0.1:5187 --connection .build/private-conversation-connection.json
```

For the Q8 weights, set "modelId": "LFM3-Omni-2B-Q8_0" in the local configuration and set "model" to the Q8 GGUF path. The Q8 model uses the native bridge in the private Web build.

Import the generated connection JSON in the private Web build. Never commit or share this session credential. Keep the bridge terminal alive during use; stopping it closes its worker. Desktop installation settings are not modified. Only the two existing browser Web-search tools may cross this bridge; the browser executes them through its existing search policy. The bridge itself never fetches their URLs or accepts arbitrary tools. The native voice adapter carries the selected male/female setting and the language from the documented Omni task prompt; listening quality and real microphone use need dedicated validation.

The future optional model-download flow can offer the matching native companion and delegate model acquisition/hash verification to it. A browser download cannot silently install or execute a native program: the first launch and pairing require a user action. This workflow remains a design decision, not a shipped feature. No auto-start, protocol handler, installation or OS setting is registered by these scripts.

Validation:

```powershell
python -m unittest discover -s scripts/native-conversation-bridge -p test_server.py
corepack yarn test:web web-app/src/services/browser-preview/native-conversation.test.ts
```

Real engine tests are provided separately in `scripts/validation/web-runtime/`. Simulated tests do not certify audio accuracy or GPU throughput.
