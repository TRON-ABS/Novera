// Experimental worker-owned sd.cpp binding. No model compatibility claim is
// made until this target compiles and the exact Desktop bundles generate.
#include "stable-diffusion.h"
#include <cstdint>
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
    if (std::strstr(text, "decoding ") && std::strstr(text, "latents")) sd_set_backend_eval_callback(inspect_vae_node, nullptr);
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
EMSCRIPTEN_KEEPALIVE void novera_release() {
    clear_result();
    if (context) free_sd_ctx(context);
    context = nullptr;
}

// File paths refer only to files mounted into this worker's virtual filesystem.
// kind 0 = FLUX.2 Klein + Qwen3; kind 1 = Wan + UMT5.
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
    params.vae_conv_direct = true;
#endif
    params.enable_mmap = false;
    params.disable_prefetch = true;
    params.conditioning_cache_size = 0;
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
    return generate_video(context, &params, &video) && video && video->frame_count > 0;
}

EMSCRIPTEN_KEEPALIVE int novera_frame_count() { return video ? video->frame_count : images ? images->count : 0; }
EMSCRIPTEN_KEEPALIVE int novera_width(int index) { auto* value = frame(index); return value ? value->width : 0; }
EMSCRIPTEN_KEEPALIVE int novera_height(int index) { auto* value = frame(index); return value ? value->height : 0; }
EMSCRIPTEN_KEEPALIVE int novera_channels(int index) { auto* value = frame(index); return value ? value->channel : 0; }
EMSCRIPTEN_KEEPALIVE uintptr_t novera_frame_data(int index) { auto* value = frame(index); return value ? reinterpret_cast<uintptr_t>(value->data) : 0; }
}
