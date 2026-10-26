# fix(creation): use the bundled Windows image engine and highlight output mode

Windows image settings still exposed an executable picker, and a saved `.build/.../sd-cli.exe` path bypassed the packaged image launcher. Hide the picker on Windows, send no executable override, and always resolve `resources/image-engine/novera-image-engine.exe` in the native Windows handler. Existing profiles work without clearing their old path. Other platforms retain custom executable selection. The Windows build already stages and packages the launcher and its CUDA/Vulkan/CPU libraries; the renderer remains a separate bundled process.

The selected Auto/Text/Image/Video button now uses the same colored border, background, foreground and hover style as the other active composer controls. Transparent inactive borders preserve button dimensions.

Update the user guide, changelog, engine tracking, dashboard, launcher README and French/English engine guidance to match these behaviors.

Validation: 23 targeted tests passed with `TAURI_ENV_PLATFORM=windows` and 23 with the default platform (`node_modules/.bin/vitest run --project @janhq/web-app web-app/src/containers/__tests__/CreationControls.test.tsx web-app/src/services/creation/stream.test.ts`). Regression cases retain a saved development executable path and check that Windows hides it and sends no override. The five component tests also passed after the style change. Windows/Tauri TypeScript and Vite frontend compilation passed before the style-only adjustment, using the installed local executables because Corepack could not download Yarn on the restricted network.

No native application binary was rebuilt, no real-model generation was run for these corrections, and CI/approval are not claimed. Recompile Novera to apply the changes to the application. This update builds on the existing media installation and memory management sources already on main; it introduces no separate merge dependency or issue closure.
