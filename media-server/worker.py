"""Offline image/video generation. One isolated process per creation; no HTTP server."""
import inspect
import json
import os
from pathlib import Path
import sys
import threading
import time

os.environ.update(HF_HUB_OFFLINE="1", TRANSFORMERS_OFFLINE="1", HF_DEACTIVATE_ASYNC_LOAD="1")
IMAGE_PIPELINES = {"StableDiffusionPipeline", "StableDiffusionXLPipeline", "FluxPipeline", "Flux2Pipeline", "QwenImagePipeline"}
VIDEO_PIPELINES = {"CogVideoXPipeline", "WanPipeline", "HunyuanVideoPipeline", "LTXPipeline", "LTX2Pipeline",
                   "CogVideoXImageToVideoPipeline", "WanImageToVideoPipeline", "HunyuanVideoImageToVideoPipeline", "LTXImageToVideoPipeline"}


def emit(**data):
    print(json.dumps(data), flush=True)


def watch_parent(pid):
    def watch():
        if os.name == "nt":
            import ctypes
            kernel = ctypes.windll.kernel32
            kernel.OpenProcess.restype = ctypes.c_void_p
            handle = kernel.OpenProcess(0x00100000, False, pid)
            if not handle:
                os._exit(1)
            kernel.WaitForSingleObject.argtypes = [ctypes.c_void_p, ctypes.c_uint32]
            kernel.WaitForSingleObject(handle, 0xFFFFFFFF)
            os._exit(1)
        else:
            while True:
                try: os.kill(pid, 0)
                except ProcessLookupError: os._exit(1)
                time.sleep(1)
    threading.Thread(target=watch, daemon=True).start()


def validate(config):
    task = config["task"]
    if task not in ("image", "video"):
        raise ValueError("Unsupported output type")
    model = Path(config["model"]).resolve(strict=True)
    index = json.loads((model / "model_index.json").read_text(encoding="utf-8"))
    allowed = IMAGE_PIPELINES if task == "image" else VIDEO_PIPELINES
    if index.get("_class_name") not in allowed:
        raise ValueError("This local folder does not contain a supported pipeline for the selected output")
    for name, component in index.items():
        if not name.startswith("_") and isinstance(component, list) and component and component[0] not in (None, "diffusers", "transformers"):
            raise ValueError("Custom pipeline components are not supported")
    if not str(config.get("prompt", "")).strip():
        raise ValueError("A prompt is required")
    for key, low, high in [("width", 64, 2048), ("height", 64, 2048), ("steps", 1, 100), ("frames", 1, 257), ("fps", 1, 60)]:
        value = config[key]
        if isinstance(value, bool) or not isinstance(value, int) or not low <= value <= high:
            raise ValueError("Invalid generation setting: " + key)
    if config["width"] % 16 or config["height"] % 16:
        raise ValueError("Dimensions must be multiples of 16")
    return model, index["_class_name"]


def run(config):
    started = time.monotonic()
    if sys.version_info[:3] != (3, 15, 1):
        raise ValueError("Select the configured Python 3.15.1 environment")
    if config.get("backend") == "nvfp4-cuda":
        os.environ["TORCHINDUCTOR_CACHE_DIR"] = str(config.get("torch_cache", Path(config["staged_output"]).parent / ".novera-torch-cache"))
        from nvfp4_cuda import generate
        from types import SimpleNamespace
        image, diagnostics = generate(config, emit)
        diagnostics['total_seconds'] = time.monotonic()-started
        publish(config, SimpleNamespace(images=[image]), "Flux2KleinPipeline", "cuda", diagnostics)
        return
    model, pipeline_name = validate(config)
    import torch
    import diffusers
    requested = config.get("device", "auto")
    if requested not in ("auto", "cpu", "cuda"):
        raise ValueError("Invalid device")
    if requested == "cuda" and not torch.cuda.is_available():
        raise ValueError("CUDA is not available in the selected Python environment")
    device = "cuda" if requested != "cpu" and torch.cuda.is_available() else "cpu"
    emit(stage="loading", progress=0, device=device)
    dtype = torch.float32 if device == "cpu" else torch.bfloat16 if torch.cuda.is_bf16_supported() else torch.float16
    pipeline = diffusers.DiffusionPipeline.from_pretrained(
        str(model), local_files_only=True, use_safetensors=True,
        trust_remote_code=False, torch_dtype=dtype,
    ).to(device)
    parameters = inspect.signature(pipeline.__call__).parameters
    args = {"prompt": config["prompt"], "width": config["width"], "height": config["height"], "num_inference_steps": config["steps"]}
    if "generator" in parameters:
        args["generator"] = torch.Generator(device=device).manual_seed(int(config["seed"]))
    if config["task"] == "video":
        if "num_frames" not in parameters:
            raise ValueError("This video pipeline does not expose a frame count")
        args["num_frames"] = config["frames"]
    if config.get("input_image"):
        from PIL import Image
        if config["task"] == "image":
            pipeline = diffusers.AutoPipelineForImage2Image.from_pipe(pipeline)
            parameters = inspect.signature(pipeline.__call__).parameters
            args["strength"] = 0.75
            args["num_inference_steps"] = max(2, config["steps"])
        elif "image" not in parameters:
            raise ValueError("Choose an image-to-video model folder to animate an image")
        args["image"] = Image.open(config["input_image"]).convert("RGB")
    elif "image" in parameters and parameters["image"].default is inspect.Parameter.empty:
        raise ValueError("This pipeline requires an input image")
    def progress(_pipeline, step, _timestep, callback_kwargs):
        emit(stage="generating", progress=min(99, round(100 * (step + 1) / config["steps"])))
        return callback_kwargs
    if "callback_on_step_end" in parameters:
        args["callback_on_step_end"] = progress
    emit(stage="generating", progress=0)
    if device == "cuda":
        torch.cuda.synchronize()
    generating = time.monotonic()
    with torch.inference_mode():
        result = pipeline(**args)
    if device == "cuda":
        torch.cuda.synchronize()
    publish(config, result, pipeline_name, device, {'generation_seconds': time.monotonic()-generating, 'total_seconds': time.monotonic()-started})


def publish(config, result, pipeline_name, device, diagnostics=None):
    import torch
    import diffusers
    output = Path(config["output"])
    # Native code selects these unique paths. Publish only a completed file.
    staged = Path(config["staged_output"])
    if output.exists():
        raise ValueError("Output already exists")
    if config["task"] == "image":
        result.images[0].save(staged, format="PNG")
    else:
        from diffusers.utils import export_to_video
        export_to_video(result.frames[0], str(staged), fps=config["fps"])
    metadata = {k: v for k, v in config.items() if k not in ("staged_output", "input_image")}
    metadata.update(pipeline=pipeline_name, device=device, torch=torch.__version__, diffusers=diffusers.__version__)
    if diagnostics:
        metadata.update(diagnostics)
    if config.get("upscale_factor"):
        # The parent starts the bundled upscaler only after this worker exits,
        # releasing the diffusion model before it loads the ESRGAN weights.
        with Path(config["upscale_metadata"]).open("x", encoding="utf-8") as handle:
            json.dump(metadata, handle, ensure_ascii=False, indent=2)
        emit(stage="generating", progress=99, generation_seconds=metadata.get("generation_seconds"))
        return
    sidecar = output.with_suffix(output.suffix + ".json")
    with sidecar.open("x", encoding="utf-8") as handle:
        json.dump(metadata, handle, ensure_ascii=False, indent=2)
    try:
        # Windows rename is exclusive and atomic, including redirected Known Folders.
        # POSIX rename can replace files; hard-link publication there stays exclusive.
        if os.name == "nt":
            os.rename(staged, output)
        else:
            os.link(staged, output)
            staged.unlink()
    except Exception:
        sidecar.unlink(missing_ok=True)
        raise
    emit(stage="done", progress=100, generation_seconds=metadata.get("generation_seconds"))


if __name__ == "__main__":
    try:
        config = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
        if config.get("parent_pid"):
            watch_parent(config["parent_pid"])
        run(config)
    except Exception as error:
        emit(stage="error", error=str(error))
        sys.exit(1)
