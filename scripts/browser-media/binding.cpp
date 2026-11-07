// Experimental worker-owned sd.cpp binding. No model compatibility claim is
// made until this target compiles and the exact Desktop bundles generate.
#include "stable-diffusion.h"
#include <cstdint>
#include <string>
#include <vector>
#include <cstdio>
#include <emscripten.h>
#include "ggml.h"
#include "ggml-backend.h"
#include <set>
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
float video_budget_gib = 2.0f;
bool video_flash_attention = false;
bool video_batched_cfg = true;
bool video_trace_cpu = false;
bool video_expand_linear_weights = false;
std::set<std::string> video_cpu_nodes;

bool inspect_video_cpu_node(ggml_tensor* tensor, bool ask, void*) {
    if (ask && tensor->buffer && tensor->op != GGML_OP_NONE && video_cpu_nodes.size() < 32) {
        const char* owner = ggml_backend_buffer_name(tensor->buffer);
        if (std::string(owner).find("CPU") != std::string::npos) {
            std::string key = std::string(ggml_op_name(tensor->op)) + " type=" + ggml_type_name(tensor->type);
            for (int i=0;i<4;++i) key += " " + std::to_string(tensor->ne[i]);
            if (video_cpu_nodes.insert(key).second) browser_log(2, ("Video CPU fallback: " + key).c_str());
        }
    }
    // Observation only: never request per-node synchronization or readback.
    return false;
}

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
    sd_set_backend_eval_callback(nullptr, nullptr);
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
// Explicit diagnostic/runtime policy, independent of image settings. Physical
// VRAM is not measurable through WebGPU; the caller must leave a reserve.
EMSCRIPTEN_KEEPALIVE int novera_configure_video_runtime(float budget_gib, int flash_attention) {
    if (!(budget_gib == 2.f || budget_gib == 4.f || budget_gib == 6.f || budget_gib == 8.f || budget_gib == 12.f) ||
        (flash_attention != 0 && flash_attention != 1)) return 0;
    video_budget_gib = budget_gib;
    video_flash_attention = flash_attention == 1;
    return 1;
}
EMSCRIPTEN_KEEPALIVE int novera_configure_video_execution(int batched_cfg, int trace_cpu) {
    if ((batched_cfg != 0 && batched_cfg != 1) || (trace_cpu != 0 && trace_cpu != 1)) return 0;
    video_batched_cfg = batched_cfg == 1;
    video_trace_cpu = trace_cpu == 1;
    return 1;
}
EMSCRIPTEN_KEEPALIVE int novera_configure_video_weights(int expand_linear_weights) {
    if (expand_linear_weights != 0 && expand_linear_weights != 1) return 0;
    video_expand_linear_weights = expand_linear_weights == 1;
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
    if (kind == 1) params.batched_cfg = video_batched_cfg;
    if (kind == 1 && video_expand_linear_weights) {
        if (video_budget_gib < 6.f) return 0;
        // Expand only the repeated DiT linear matrices in memory. Leave original
        // GGUFs, normalization, text encoder and VAE precision untouched.
        params.tensor_type_rules = R"(^model\.diffusion_model\.blocks\.[0-9]+\.(self_attn\.[qkvo]|cross_attn\.[qkvo]|ffn\.[02])\.weight$=f16)";
    }
    // Browser APIs expose no reliable VRAM size. Use an explicit bounded budget.
    const std::string memory_budget = std::to_string(kind == 0 ? image_budget_gib : video_budget_gib);
    params.max_vram = memory_budget.c_str();
    // Avoid the quadratic attention buffer at desktop-sized image resolutions.
    // The pinned GGML WebGPU backend implements FLASH_ATTN_EXT on this path.
    if (kind == 0 || video_flash_attention) {
        params.flash_attn = true;
        params.diffusion_flash_attn = true;
    }
    context = new_sd_ctx(&params);
    if (context && kind == 1 && video_trace_cpu) {
        video_cpu_nodes.clear();
        sd_set_backend_eval_callback(inspect_video_cpu_node, nullptr);
    }
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
    if (video_budget_gib > 2.f) {
        // A larger DiT budget must not create one oversized 3D VAE dispatch.
        // Leave room for browser/driver memory and bound temporal scratch.
        params.vae_tiling_params.enabled = true;
        params.vae_tiling_params.temporal_tiling = true;
        params.vae_tiling_params.tile_size_w = 256;
        params.vae_tiling_params.tile_size_h = 192;
    }
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
