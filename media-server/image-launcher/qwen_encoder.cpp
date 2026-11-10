#include "stable-diffusion.h"
#include "conditioning/conditioner.hpp"
#include "model_manager.h"

// This entry point is called in a separate process from the PyTorch worker.
// Use the same conditioner as stable-diffusion.cpp, without a diffusion model.
extern "C" SD_API int novera_encode_qwen_gguf(const char* runtime,
                                            const char* model,
                                            const char* prompt,
                                            bool cuda,
                                            float* output,
                                            size_t count) {
    try {
        constexpr auto prefix = "text_encoders.llm.";
        constexpr int channels = 7680;
        constexpr int tokens = 512;
        if (count != channels * tokens) {
            return 1;
        }
        ggml_backend_load_all_from_path(runtime);
        std::unique_ptr<ggml_backend, decltype(&ggml_backend_free)> backend(
            ggml_backend_init_by_name(cuda ? "CUDA0" : "CPU", nullptr),
            ggml_backend_free);
        if (!backend) {
            return 2;
        }

        const int threads = std::clamp(sd_get_num_physical_cores(), 1, 8);
        sd::ParallelExecutor executor(threads);
        sd::ParallelScope tensor_scope(&executor);
        ModelLoader loader;
        loader.set_n_threads(threads);
        if (!loader.init_from_file_and_convert_name(model, prefix, VERSION_FLUX2_KLEIN)) {
            return 3;
        }
        auto manager = std::make_shared<ModelManager>();
        manager->set_n_threads(threads);
        manager->set_enable_mmap(true);
        if (!manager->set_loader(std::move(loader))) {
            return 3;
        }
        manager->prepare_file_io();
        LLMEmbedder encoder(backend.get(), manager->loader().get_tensor_storage_map(),
                            VERSION_FLUX2_KLEIN, prefix, false, manager);
        struct Registration {
            ModelManager& manager;
            ~Registration() { manager.unregister_param_tensors(ModelComponent::Conditioner); }
        } registration{*manager};
        std::map<std::string, ggml_tensor*> params;
        std::map<ggml_tensor*, ggml_op> ops;
        encoder.get_param_tensors(params);
        encoder.get_param_tensor_ops(ops);
        if (!manager->register_param_tensors(ModelComponent::Conditioner, std::move(params),
                ModelManager::ResidencyMode::ParamBackend, backend.get(), backend.get(),
                nullptr, false, false, &ops) || !manager->validate_registered_tensors()) {
            return 3;
        }
        // Match the FLUX.2 Klein conditioner template while retaining the
        // NVFP4 worker's 512-token limit, including for very long prompts.
        std::string text = "<|im_start|>user\n";
        const int begin = static_cast<int>(text.size());
        text += prompt;
        const int end = static_cast<int>(text.size());
        text += "<|im_end|>\n<|im_start|>assistant\n<think>\n\n</think>\n\n";
        auto embedding = encoder.encode_prompt(threads, text, {begin, end}, tokens,
            0, {}, {9, 18, 27}, 0, false, tokens);
        if (embedding.shape() != std::vector<int64_t>{channels, tokens}) {
            return 4;
        }
        std::copy_n(embedding.data(), count, output);
        return 0;
    } catch (const std::exception& error) {
        std::fprintf(stderr, "Qwen GGUF: %s\n", error.what());
        return 5;
    }
}
