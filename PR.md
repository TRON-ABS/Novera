# docs(benchmarks): record image timing without Real-ESRGAN

Update the English/French README at the existing GGUF desktop result with the maintainer's latest reported time: 11.3 seconds without Real-ESRGAN upscaling. Preserve the original recorded 25.5-second run and separate CLI timing; do not present the new report as an independently instrumented benchmark or a controlled speedup.

Document the actual upscaler device smoke test: official SHA-256-verified ×2 weights, synthetic 64 × 64 input and 128 × 128 output. A forward hook observed model parameters and input/output tensors on cuda:0 in Auto on RTX 5070 Laptop, and on CPU in an explicitly forced CPU control. Keep startup/loading timing out of performance comparisons. Application settings were unchanged.

Refresh the engine evidence, user guide, dashboard, changelog and rendered GitHub showcase. Validation is the real two-device upscale test plus documentation/source/link checks; no application code change, new application build, public binary release or CI claim.
