"""No weights or network: check the configured native FP4 runtime with one tiny GEMM."""
import json
import platform


def probe():
    import torch
    import comfy_kitchen as ck
    import gguf
    import accelerate
    from diffusers import Flux2Transformer2DModel
    from transformers import Qwen3Model
    from nvfp4_cuda import native_available, native_linear

    result = {"eligible": False, "python": platform.python_version(), "torch": torch.__version__}
    if not native_available():
        return result
    free, total = torch.cuda.mem_get_info()
    result.update(free_vram=free, total_vram=total, capability=list(torch.cuda.get_device_capability()))
    if free < 4.5 * 1024**3:
        return result
    x = torch.randn(128, 64, device="cuda", dtype=torch.bfloat16)
    w = torch.randn(128, 64, device="cuda", dtype=torch.bfloat16)
    ws = w.abs().amax().float() / (448 * 6)
    xs = x.abs().amax().float() / (448 * 6)
    packed, scales = ck.quantize_nvfp4(w, ws, pad_16x=True)
    layer = native_linear(packed, scales, ws, xs)
    with torch.inference_mode():
        y = layer(x)
        torch.cuda.synchronize()
    result["eligible"] = layer.calls == 1 and tuple(y.shape) == (128, 128) and bool(torch.isfinite(y).all())
    return result


if __name__ == "__main__":
    try:
        print(json.dumps(probe()))
    except Exception:
        print(json.dumps({"eligible": False}))
