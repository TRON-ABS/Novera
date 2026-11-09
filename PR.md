## Web autonomous text and Wan update

Normal LFM3-Omni text replies in compatible browsers use the pinned single-thread WebAssembly/WebGPU Worker and compact GPU sampling. The Worker verifies the model bytes downloaded from the pinned catalog revision. It caches verified weights when browser storage is available. Voice, tool history, assistant prefills and browsers without JSPI use the autonomous SDK. The 147.39 tokens/s figure is the median of the earlier local 512-token decode series and depends on the browser and device.

Pages builds and checksums the engine, Worker and license. No weights or native bridge are bundled. Local checks cover the production TypeScript configuration and the runtime, voice and transport tests. A local Edge run through the packaged chat answered 42 using the checksum-verified model from a local mirror.

The Pages candidate adds a linked Wan page at `/Novera/web/video-performance/`. It selects profile 12742898, the five-second Desktop preset, Flash Attention, separate CFG passes and a 4 GiB GPU budget. It requires the three original Wan files, processes them in the browser, and offers WebM and a measurement report. Its binary builds separately from FLUX, which continues to use profile 143602.

The November 9 local Edge comparison used the RTX 5070 Laptop, seed 331914466 and 20 steps at 512 × 224. VAE decode fell from 121.41 s to 97.87 s and total through WebM export from 642.876 s to 619.918 s. All 80 RGBA hashes matched. Both WebM SHA-256 values were `c6855682cdf638a3513ab46b68b39cb19f67eb7846f3735d05df788b18fc3f9d`. These are local reference measurements.

The public 1.0.1 build at `a48093137f50351305606375606b9b7ff01aa6a5` was checked before the update. The hosted JS and Wasm files match both the FLUX profile 143602 and the ACE bounded read-ahead receipts. Deployment and browser checks for the new candidate are tracked in [PR #58](https://github.com/TRON-ABS/Novera/pull/58).

# fix(web): record the public release and follow shared version facts

Novera Web 1.0.1 is deployed at `/Novera/web/` from commit 9ec7c5efea4ae669af74082466588399e397970d. Record the successful deployment, 757 public file hash comparisons, actual short text generation and conversation persistence after reload. Preserve the experimental media, Wan, audit and Pages cache limitations; no full upgrade or Desktop performance parity is claimed.

Remove hardcoded 1.0.1 values from Web staging and showcase/README publishing so the next coordinated release follows the application version and shared release facts. README generation remains idempotent.

Validation: ten distribution/publication tests pass. The deployed code is unchanged by this documentation/staging follow-up; the public runtime remains the exact verified #53/#54 build. The real six-GiB image timeout is recorded as a failed test, with no claimed speed improvement.

## Web 1.0.1 music update

The local music worker previously copied the composite model and waited for each planner weight read before uploading it. The Web release now selects 64 MiB windows, planner read-ahead, direct GPU head copies, DiT file-ordered reads and exact sampling exponential reuse. The release version stays at 1.0.1. This PR builds the Pages candidate in CI and keeps deployment on a separate workflow dispatch after merge.

The existing image kernel profile and pinned text SDKs are part of the same Pages build. The four runtime packaging tests passed locally. Combined-model inference and public deployment are verified separately.

The same update makes MP3 320 kb/s the default for new local Web songs. The existing sharing and download flows use the stored MP3. WAV 32-bit remains selectable for exact-reference checks.

The Web search default is DuckDuckGo. Existing saved provider choices are still restored, and Exa remains available as an explicit option for full search.
