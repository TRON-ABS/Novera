// Experimental worker-owned sd.cpp binding. No model compatibility claim is
// made until this target compiles and the exact Desktop bundles generate.
#include "stable-diffusion.h"
#include <cstdint>
#include <string>
#include <vector>
#include <cstdio>
#include <emscripten.h>
#ifdef NOVERA_WEBGPU_VAE_PROBE
#include "ggml.h"
#include "ggml-backend.h"
#include <string>
#include <cstring>
#endif

EM_JS(void, browser_log, (int level, const char* text), {
    self.postMessage({ type: 'engine-log', level: level, message: UTF8ToString(Number(text)) });
});
EM_JS(void, browser_progress, (int step, int total, float seconds), {
    self.postMessage({ type: 'engine-progress', step: step, total: total, seconds: seconds });
});

namespace {
sd_ctx_t* context = nullptr;
sd_image_generation_result_t* images = nullptr;
sd_video_generation_result_t* video = nullptr;
float video_cfg = 6.0f;
float video_flow_shift = 3.0f;
float image_budget_gib = 2.0f;

#ifdef NOVERA_WEBGPU_VAE_PROBE
bool inspect_vae_node(ggml_tensor* tensor, bool ask, void*) {
    if (ask) {
        std::string message = std::string("VAE node: ") + ggml_op_name(tensor->op) + " " + tensor->name;
        for (int index = 0; index < GGML_MAX_SRC && tensor->src[index]; ++index) {
            auto* source = tensor->src[index];
            message += " | src" + std::to_string(index) + "=" + source->name + ":" + (source->buffer ? ggml_backend_buffer_name(source->buffer) : "no-buffer");
        }
        browser_log(2, message.c_str());
    }
    return true;
}
#endif
void log_callback(sd_log_level_t level, const char* text, void*) {
#ifdef NOVERA_WEBGPU_VAE_PROBE
    if ((std::strstr(text, "decoding ") && std::strstr(text, "latents")) || std::strstr(text, "wan_vae build cached")) sd_set_backend_eval_callback(inspect_vae_node, nullptr);
#endif
    if (level >= SD_LOG_INFO) browser_log(static_cast<int>(level), text);
}
void progress_callback(int step, int steps, float seconds, void*) {
    browser_progress(step, steps, seconds);
}

void clear_result() {
    if (images) free_sd_image_generation_result(images);
    if (video) free_sd_video_generation_result(video);
    images = nullptr;
    video = nullptr;
}

sd_image_t* frame(int index) {
    if (index < 0) return nullptr;
    if (video && index < video->frame_count) return &video->frames[index];
    if (images && index < images->count) return &images->items[index].image;
    return nullptr;
}
}

extern "C" {
EMSCRIPTEN_KEEPALIVE int novera_configure_image_budget(float budget_gib) {
    if (!(budget_gib >= 2.f && budget_gib <= 12.f)) return 0;
    image_budget_gib = budget_gib;
    return 1;
}
EMSCRIPTEN_KEEPALIVE void novera_release() {
    clear_result();
    if (context) free_sd_ctx(context);
    context = nullptr;
}

// File paths refer only to files mounted into this worker's virtual filesystem.
// kind 0 = FLUX.2 Klein + Qwen3; kind 1 = Wan + UMT5.
EMSCRIPTEN_KEEPALIVE int novera_configure_video(float cfg, float flow_shift) {
    if (!(cfg >= 1.f && cfg <= 15.f && flow_shift > 0.f && flow_shift <= 20.f)) return 0;
    video_cfg = cfg;
    video_flow_shift = flow_shift;
    return 1;
}
EMSCRIPTEN_KEEPALIVE int novera_load(const char* diffusion, const char* encoder, const char* vae, int kind) {
    if (!diffusion || !encoder || !vae || (kind != 0 && kind != 1)) return 0;
    novera_release();
    sd_set_log_callback(log_callback, nullptr);
    sd_set_progress_callback(progress_callback, nullptr);
    sd_ctx_params_t params;
    sd_ctx_params_init(&params);
    params.diffusion_model_path = diffusion;
    params.vae_path = vae;
    if (kind == 0) params.llm_path = encoder;
    else params.t5xxl_path = encoder;
    params.n_threads = 1;
#ifdef NOVERA_CPU_VAE_FALLBACK
    params.backend = "diffusion=WebGPU,te=WebGPU,vae=CPU";
#else
    // The reviewed group-normalization patch preserves buffer ownership when
    // unsupported normalization nodes temporarily execute on the CPU.
    params.backend = "diffusion=WebGPU,te=WebGPU,vae=WebGPU";
#ifndef NOVERA_IMAGE_VAE_MATMUL_PROBE
    params.vae_conv_direct = kind == 0;
#endif
#endif
    params.enable_mmap = false;
    params.disable_prefetch = true;
    params.conditioning_cache_size = 0;
    // Browser APIs expose no reliable VRAM size. Use an explicit bounded budget.
    const std::string memory_budget = kind == 0 ? std::to_string(image_budget_gib) : "2";
    params.max_vram = memory_budget.c_str();
    // Avoid the quadratic attention buffer at desktop-sized image resolutions.
    // The pinned GGML WebGPU backend implements FLASH_ATTN_EXT on this path.
    if (kind == 0) {
        params.flash_attn = true;
        params.diffusion_flash_attn = true;
    }
    context = new_sd_ctx(&params);
    return context ? 1 : 0;
}

EMSCRIPTEN_KEEPALIVE int novera_generate(int kind, const char* prompt, int width, int height,
                                        int steps, uint32_t seed, int frames, int fps) {
    if (!context || !prompt || width < 64 || height < 64 || width > 2048 || height > 2048 ||
        steps < 1 || steps > 100 || (kind != 0 && kind != 1)) return 0;
    if (kind == 1 && (frames < 1 || frames > 161 || fps < 1 || fps > 60)) return 0;
    clear_result();
    if (kind == 0) {
        sd_img_gen_params_t params;
        sd_img_gen_params_init(&params);
        params.prompt = prompt;
        params.width = width;
        params.height = height;
        params.seed = seed;
        params.batch_count = 1;
        params.sample_params.sample_steps = steps;
        params.sample_params.sample_method = sd_get_default_sample_method(context);
        params.sample_params.scheduler = sd_get_default_scheduler(context, params.sample_params.sample_method);
        params.sample_params.guidance.txt_cfg = 1.0f;
#ifdef NOVERA_IMAGE_VAE_MATMUL_PROBE
        // Benchmark only: cap im2col buffers while retaining the requested size.
        params.vae_tiling_params.enabled = width > 512 || height > 512;
        params.vae_tiling_params.tile_size_w = 512;
        params.vae_tiling_params.tile_size_h = 512;
        params.vae_tiling_params.target_overlap = 0.25f;
#endif
        return generate_image(context, &params, &images) && images && images->count > 0;
    }
    sd_vid_gen_params_t params;
    sd_vid_gen_params_init(&params);
    params.prompt = prompt;
    params.width = width;
    params.height = height;
    params.seed = seed;
    params.video_frames = frames;
    params.fps = fps;
    params.sample_params.sample_steps = steps;
    params.sample_params.sample_method = sd_get_default_sample_method(context);
    params.sample_params.scheduler = sd_get_default_scheduler(context, params.sample_params.sample_method);
    params.sample_params.guidance.txt_cfg = video_cfg;
    params.sample_params.flow_shift = video_flow_shift;
    return generate_video(context, &params, &video) && video && video->frame_count > 0;
}

EMSCRIPTEN_KEEPALIVE int novera_frame_count() { return video ? video->frame_count : images ? images->count : 0; }
EMSCRIPTEN_KEEPALIVE int novera_upscale_image(const char* model_path, const char* rgba_path, int width, int height, int tile_size) {
    if (!model_path || !rgba_path || width < 64 || height < 64 || width > 2048 || height > 2048 || width % 2 || height % 2) return 0;
    if (tile_size != 128 && tile_size != 256 && tile_size != 512) return 0;
    novera_release();
    sd_set_log_callback(log_callback, nullptr);
    sd_set_progress_callback(progress_callback, nullptr);
    std::vector<uint8_t> rgba(static_cast<size_t>(width) * height * 4);
    auto* input_file = std::fopen(rgba_path, "rb");
    if (!input_file) return 0;
    const auto read = std::fread(rgba.data(), 1, rgba.size(), input_file);
    const auto extra = std::fgetc(input_file);
    std::fclose(input_file);
    if (read != rgba.size() || extra != EOF) return 0;
    sd_image_t input = {static_cast<uint32_t>(width), static_cast<uint32_t>(height), 4, rgba.data()};
    auto* upscaler = new_upscaler_ctx(model_path, false, 1, tile_size, "WebGPU", "WebGPU");
    if (!upscaler) return 0;
    sd_image_generation_result_t* enlarged = nullptr;
    const bool ok = get_upscale_factor(upscaler) == 2 &&
        upscale(upscaler, input, 2, &enlarged);
    free_upscaler_ctx(upscaler);
    if (!ok || !enlarged || enlarged->count != 1) {
        if (enlarged) free_sd_image_generation_result(enlarged);
        return 0;
    }
    images = enlarged;
    return 1;
}
EMSCRIPTEN_KEEPALIVE int novera_width(int index) { auto* value = frame(index); return value ? value->width : 0; }
EMSCRIPTEN_KEEPALIVE int novera_height(int index) { auto* value = frame(index); return value ? value->height : 0; }
EMSCRIPTEN_KEEPALIVE int novera_channels(int index) { auto* value = frame(index); return value ? value->channel : 0; }
EMSCRIPTEN_KEEPALIVE uintptr_t novera_frame_data(int index) { auto* value = frame(index); return value ? reinterpret_cast<uintptr_t>(value->data) : 0; }
}
