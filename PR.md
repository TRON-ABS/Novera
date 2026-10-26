# fix(docs): record successful desktop GGUF image generation

The showcase and guides still described the suggested GGUF download trio and graphical image/save path as unvalidated. Record the successful run in the maintainer-built Windows application and update the English/French README, engine tracking, dashboard, roadmap, changelog and usage guidance.

The failure came from selecting the native NVFP4 backend for a GGUF image model and using an encoder GGUF as the sd-cli executable. Correcting those settings produced a real 512 × 512 image, displayed inline and saved with its sidecar in the system Pictures/Novera image folder, with 25.5 s total time shown. The exact FLUX.2 Klein Q4_K_M + Qwen3 Q4_K_M CPU + official VAE trio is now tested on this PC with Vulkan. Other hardware and graphical NVFP4, cloud and video paths retain their separate validation limits.

Validation: the saved PNG and sidecar were decoded and inspected, the application showed the image and duration, and the owned CLI log reported success. Documentation links, rendered READMEs and GitHub showcase metadata are checked for this publication. The earlier 369-test source suite remains historical evidence; it is not rerun for this documentation-only change. No application build, source-code fix, model rewrite, private log/image publication, binary release or GitHub Actions activation.
