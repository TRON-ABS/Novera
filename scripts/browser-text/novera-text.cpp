#include "llama.h"
#include "ggml-backend.h"
#include "ggml-cpu.h"
#include "ggml-alloc.h"
#include <atomic>
#include "chat.h"
#include "imatrix-loader.h"
#include "llama-model.h"
#include "diagnostic-trace.h"
#include <nlohmann/json.hpp>
#include <emscripten.h>
#include <algorithm>
#include <cstdio>
#include <cstring>
#include <memory>
#include <stdexcept>
#include <string>
#include <vector>

using json = nlohmann::ordered_json;
namespace {
llama_model * model = nullptr;
llama_context * context = nullptr;
llama_sampler * sampler = nullptr;
llama_sampler * cpu_sampler = nullptr;
llama_sampler_seq_config sampler_config{};
common_chat_templates_ptr templates;
std::string result;
std::atomic<bool> cancelled{false};
int cpu_threads = 1;
ggml_threadpool_t cpu_batch_pool = nullptr;
bool audit_cpu_threads = false;
std::atomic<int> cpu_phase{0};
std::atomic<uint32_t> cpu_rows[2][64]{};
std::atomic<bool> cpu_audit_enabled{false};
json cpu_row_audit() {
    json counts = {{"prefill", json::array()}, {"decode", json::array()}};
    for (int i = 0; i < cpu_threads; ++i) {
        counts["prefill"].push_back(cpu_rows[0][i].load(std::memory_order_relaxed));
        counts["decode"].push_back(cpu_rows[1][i].load(std::memory_order_relaxed));
    }
    return counts;
}
bool running = false;
bool audit_placement = false;
json evaluation_placement = json::object();
llama_model_tensor_buft_override embedding_overrides[2]{};
bool trace_native = false;
bool single_sync_sampling = false;
bool token_only_sampler = false;
std::vector<llama_token_data> cpu_candidates;
json cpu_tuning = {{"enabled", false}, {"reason", "disabled"}};
std::vector<std::pair<int, int>> cpu_thread_policy;

int prefill_cpu_threads(int rows) {
    if (rows < 32) return 1;
    if (cpu_thread_policy.empty()) return cpu_threads;
    int selected = 1;
    for (const auto & entry : cpu_thread_policy) {
        if (rows < entry.first) break;
        selected = entry.second;
    }
    return selected;
}

void tune_cpu_threads(bool requested) {
    cpu_audit_enabled.store(false, std::memory_order_relaxed);
    cpu_thread_policy.clear();
    cpu_tuning = {{"enabled", false}, {"reason", requested ? "single-thread" : "disabled"}};
    if (!requested || cpu_threads == 1) return;
    // Tied input/output weights can share a name while using different buffers.
    ggml_tensor * embedding = model->tok_embd;
    const ggml_tensor * storage = embedding;
    while (storage && !storage->buffer && storage->view_src) storage = storage->view_src;
    if (!storage || !storage->buffer || !ggml_backend_buft_is_host(ggml_backend_buffer_get_type(storage->buffer))) {
        cpu_tuning["reason"] = !embedding ? "missing-embedding" : !storage->buffer ? "missing-embedding-buffer" : "non-host-embedding-buffer";
        cpu_tuning["embeddingBuffer"] = storage && storage->buffer ? ggml_backend_buft_name(ggml_backend_buffer_get_type(storage->buffer)) : "none";
        return;
    }
    const double started = emscripten_get_now();
    std::unique_ptr<ggml_backend, decltype(&ggml_backend_free)> backend(ggml_backend_cpu_init(), ggml_backend_free);
    if (!backend) throw std::runtime_error("CPU calibration backend creation failed");
    ggml_backend_cpu_set_threadpool(backend.get(), cpu_batch_pool);
    std::vector<int> counts{1};
    for (int count = 2; count < cpu_threads; count *= 2) counts.push_back(count);
    counts.push_back(cpu_threads);
    json profiles = json::array();
    for (const int rows : {32, 128, 256}) {
        ggml_init_params params{ggml_graph_overhead() + 4 * ggml_tensor_overhead() + 1024, nullptr, true};
        std::unique_ptr<ggml_context, decltype(&ggml_free)> tensors(ggml_init(params), ggml_free);
        if (!tensors) throw std::runtime_error("CPU calibration graph allocation failed");
        auto * indices = ggml_new_tensor_1d(tensors.get(), GGML_TYPE_I32, rows);
        auto * output = ggml_get_rows(tensors.get(), embedding, indices);
        auto * graph = ggml_new_graph(tensors.get());
        ggml_build_forward_expand(graph, output);
        std::unique_ptr<ggml_backend_buffer, decltype(&ggml_backend_buffer_free)> buffer(
            ggml_backend_alloc_ctx_tensors(tensors.get(), backend.get()), ggml_backend_buffer_free);
        if (!buffer) throw std::runtime_error("CPU calibration buffer allocation failed");
        std::vector<int32_t> ids(rows);
        for (int row = 0; row < rows; ++row) ids[row] = (int64_t(row) * 997 + 17) % embedding->ne[1];
        ggml_backend_tensor_set(indices, ids.data(), 0, ids.size() * sizeof(ids[0]));
        std::vector<std::vector<double>> samples(counts.size());
        // Warm each count, then rotate measurement order to reduce order bias.
        for (int round = 0; round < 6; ++round) {
            for (size_t step = 0; step < counts.size(); ++step) {
                const size_t index = (step + round) % counts.size();
                ggml_backend_cpu_set_threadpool(backend.get(), counts[index] > 1 ? cpu_batch_pool : nullptr);
                ggml_backend_cpu_set_n_threads(backend.get(), counts[index]);
                const double before = emscripten_get_now();
                if (ggml_backend_graph_compute(backend.get(), graph) != GGML_STATUS_SUCCESS)
                    throw std::runtime_error("CPU calibration compute failed");
                const double elapsed = emscripten_get_now() - before;
                if (round > 0) samples[index].push_back(elapsed);
            }
        }
        std::vector<double> medians;
        json trials = json::array();
        for (size_t index = 0; index < counts.size(); ++index) {
            auto sorted = samples[index];
            std::sort(sorted.begin(), sorted.end());
            medians.push_back(sorted[sorted.size() / 2]);
            trials.push_back({{"threads", counts[index]}, {"medianMs", medians.back()}, {"samplesMs", samples[index]}});
        }
        const double best = *std::min_element(medians.begin(), medians.end());
        int selected = 1;
        // Require a measured 10% benefit over serial; prefer fewer threads near the best.
        for (size_t index = 1; index < counts.size(); ++index) {
            if (best > 0 && medians[0] > 0 && medians[index] <= best * 1.05 && medians[index] <= medians[0] * 0.90) {
                selected = counts[index];
                break;
            }
        }
        cpu_thread_policy.emplace_back(rows, selected);
        profiles.push_back({{"rows", rows}, {"selectedThreads", selected}, {"trials", trials}});
    }
    ggml_threadpool_pause(cpu_batch_pool);
    cpu_tuning = {{"enabled", true}, {"reason", "measured-host-embedding-cost"}, {"elapsedMs", emscripten_get_now() - started}, {"profiles", profiles}};
}

llama_sampler * make_backend_sampler() {
    auto * chain = llama_sampler_chain_init(llama_sampler_chain_default_params());
    llama_sampler_chain_add(chain, llama_sampler_init_greedy());
    if (token_only_sampler) {
        // Keep the original greedy computation; do not export unused sampling data.
        // This immutable, stateless suffix is used only by this private greedy chain.
        static llama_sampler_i filter = [] {
            llama_sampler_i result{};
            result.name = [](const llama_sampler *) { return "novera-token-only-output"; };
            result.apply = [](llama_sampler *, llama_token_data_array *) {};
            result.backend_init = [](llama_sampler *, ggml_backend_buffer_type_t, uint32_t) { return true; };
            result.backend_apply = [](llama_sampler *, ggml_context *, ggml_cgraph *, llama_sampler_data * data) {
                if (data->sampled) {
                    data->logits = nullptr;
                    data->probs = nullptr;
                    data->candidates = nullptr;
                }
            };
            return result;
        }();
        llama_sampler_chain_add(chain, llama_sampler_init(&filter, nullptr));
    }
    return chain;
}
double last_progress = 0;

std::string buffer_name(const ggml_tensor * tensor) {
    while (tensor && !tensor->buffer && tensor->view_src) tensor = tensor->view_src;
    return tensor && tensor->buffer ? ggml_backend_buft_name(ggml_backend_buffer_get_type(tensor->buffer)) : "unallocated";
}

json model_placement() {
    json weights = json::object();
    json cpu_weights = json::array();
    json layers = json::array();
    for (int i = 0; i < llama_model_n_layer(model); ++i) {
        auto device = model->dev_layer(i);
        layers.push_back({{"layer", i}, {"assignedDevice", device ? ggml_backend_dev_name(device) : "none"}, {"weightBuffers", json::object()}});
    }
    for (const auto & named : model->tensors_by_name) {
        const auto name = buffer_name(named.second);
        if (!weights.contains(name)) weights[name] = {{"tensors", 0}, {"bytes", 0}};
        weights[name]["tensors"] = weights[name]["tensors"].get<size_t>() + 1;
        weights[name]["bytes"] = weights[name]["bytes"].get<size_t>() + ggml_nbytes(named.second);
        if (name.find("CPU") != std::string::npos) cpu_weights.push_back(named.first);
        for (int i = 0; i < llama_model_n_layer(model); ++i) {
            if (named.first.rfind("blk." + std::to_string(i) + ".", 0) != 0) continue;
            auto & buffers = layers[i]["weightBuffers"];
            buffers[name] = buffers.value(name, size_t(0)) + 1;
            break;
        }
    }
    auto output = model->dev_output();
    return {{"modelLayers", llama_model_n_layer(model)}, {"requestedGpuLayers", 99},
            {"outputAssignedDevice", output ? ggml_backend_dev_name(output) : "none"},
            {"layers", layers}, {"weights", weights}, {"cpuWeightNames", cpu_weights}};
}

bool observe_placement(ggml_tensor * tensor, bool ask, void *) {
    if (!ask) return true;
    const auto buffer = buffer_name(tensor);
    const std::string operation = ggml_op_name(tensor->op);
    const auto key = buffer + ":" + operation;
    if (!evaluation_placement.contains(key)) evaluation_placement[key] = {{"nodes", 0}, {"cpuNames", json::array()}};
    auto & entry = evaluation_placement[key];
    entry["nodes"] = entry["nodes"].get<size_t>() + 1;
    if (buffer.find("CPU") != std::string::npos && entry["cpuNames"].size() < 32) entry["cpuNames"].push_back(tensor->name);
    return false; // Observe placement only; never request tensor data.
}

EM_JS(void, publish_bytes, (const char * ptr, int length), {
    const start = typeof ptr === 'bigint' ? Number(ptr) : (ptr < 0 ? ptr >>> 0 : ptr);
    const bytes = HEAPU8.slice(start, start + length);
    postMessage({type: 'text-bytes', bytes: bytes.buffer}, [bytes.buffer]);
});
EM_JS(void, publish_progress, (float fraction), {
    postMessage({type: 'loading', progress: fraction});
});
bool progress(float fraction, void *) {
    const double now = emscripten_get_now();
    if (now - last_progress > 50 || fraction == 1) { publish_progress(fraction); last_progress = now; }
    return !cancelled;
}
void clear() {
    templates.reset();
    if (context) llama_free(context);
    if (cpu_batch_pool) ggml_threadpool_free(cpu_batch_pool);
    cpu_batch_pool = nullptr;
    cpu_thread_policy.clear();
    if (sampler) llama_sampler_free(sampler);
    if (cpu_sampler) llama_sampler_free(cpu_sampler);
    if (model) llama_model_free(model);
    context = nullptr; model = nullptr; sampler = nullptr; cpu_sampler = nullptr;
}
std::vector<llama_token> tokenize(const std::string & text) {
    const auto * vocab = llama_model_get_vocab(model);
    // The rendered GGUF template already contains its BOS marker.
    const int count = -llama_tokenize(vocab, text.data(), text.size(), nullptr, 0, false, true);
    if (count <= 0 || count > 32768) throw std::runtime_error("Invalid tokenized prompt length");
    std::vector<llama_token> tokens(count);
    if (llama_tokenize(vocab, text.data(), text.size(), tokens.data(), count, false, true) != count) throw std::runtime_error("Tokenization failed");
    return tokens;
}
}

extern "C" {
void novera_cpu_get_rows_audit(int thread, int rows) {
    if (rows > 0 && thread >= 0 && thread < 64 && cpu_audit_enabled.load(std::memory_order_relaxed))
        cpu_rows[cpu_phase.load(std::memory_order_relaxed)][thread].fetch_add(rows, std::memory_order_relaxed);
}
EMSCRIPTEN_KEEPALIVE const char * novera_result() { return result.c_str(); }
EMSCRIPTEN_KEEPALIVE void novera_cancel() { cancelled = true; }
EMSCRIPTEN_KEEPALIVE void novera_unload() { if (!running) clear(); else cancelled = true; }

// Browser quantization uses the same GGUF quantizer as the native CLI.
EMSCRIPTEN_KEEPALIVE int novera_quantize_q4(const char * input, const char * output, const char * matrix_path) {
    if (running || model) return 1;
    auto params = llama_model_quantize_default_params();
    params.nthread = 1;
    params.ftype = LLAMA_FTYPE_MOSTLY_Q4_K_M;
    params.allow_requantize = true;
    params.max_buf_size = 64 * 1024 * 1024;
    const llama_model_tensor_override overrides[] = {
        {"attn_", GGML_TYPE_Q8_0},
        {"token_embd", GGML_TYPE_Q6_K},
        {"ffn_gate", GGML_TYPE_Q8_0},
        {nullptr, GGML_TYPE_COUNT},
    };
    common_imatrix matrix;
    std::vector<llama_model_imatrix_data> weights;
    if (matrix_path && *matrix_path) {
        if (!common_imatrix_load(matrix_path, matrix) || matrix.is_legacy || !matrix.has_metadata || matrix.entries.empty()) return 1;
        for (auto & [name, entry] : matrix.entries) {
            const auto count = entry.counts.size();
            if (count == 0 || entry.sums.empty() || entry.sums.size() % count != 0) return 1;
            const auto stride = entry.sums.size() / count;
            for (size_t j = 0; j < count; ++j) {
                for (size_t i = j * stride; i < (j + 1) * stride; ++i) {
                    entry.sums[i] = entry.counts[j] > 0 ? entry.sums[i] / float(entry.counts[j]) : 1.0f;
                }
            }
            weights.push_back({name.c_str(), entry.sums.data(), entry.sums.size()});
        }
        weights.push_back({nullptr, nullptr, 0});
        params.imatrix = weights.data();
        params.tt_overrides = overrides;
    }
    return llama_model_quantize(input, output, &params) != 0;
}

// Export the complete next-token distribution without running a sampler.
EMSCRIPTEN_KEEPALIVE const float * novera_probe_logits(const char * prompt) {
    if (!context || running) return nullptr;
    cancelled = false;
    running = true;
    const float * logits = nullptr;
    try {
        const auto tokens = tokenize(prompt);
        if (tokens.empty() || tokens.size() > 512) throw std::runtime_error("Invalid probe context");
        llama_set_sampler(context, 0, nullptr);
        llama_memory_clear(llama_get_memory(context), true);
        auto batch = llama_batch_get_one(const_cast<llama_token *>(tokens.data()), (int) tokens.size());
        if (llama_decode(context, batch) != 0) throw std::runtime_error("Probe decode failed");
        logits = llama_get_logits_ith(context, -1);
        result = json({{"vocab", llama_vocab_n_tokens(llama_model_get_vocab(model))}, {"tokens", tokens}}).dump();
    } catch (const std::exception & error) {
        result = json({{"error", error.what()}}).dump();
    }
    running = false;
    return logits;
}

EMSCRIPTEN_KEEPALIVE int novera_load(const char * path, int context_tokens) {
    if (running || context_tokens != 32768) {
        result = json({{"error", running ? "An operation is already running" : "Full 32768 context is required"}}).dump();
        return 1;
    }
    cancelled = false;
    clear();
    try {
        llama_backend_init();
        auto log = [](ggml_log_level level, const char * text, void *) { if (level >= GGML_LOG_LEVEL_WARN) std::fputs(text, stderr); };
        llama_log_set(log, nullptr);
        ggml_log_set(log, nullptr);
        ggml_backend_load_all();
        std::vector<ggml_backend_dev_t> devices;
        json descriptions = json::array();
        for (size_t i = 0; i < ggml_backend_dev_count(); ++i) {
            auto device = ggml_backend_dev_get(i);
            const std::string backend = ggml_backend_reg_name(ggml_backend_dev_backend_reg(device));
            if (backend == "WebGPU") {
                devices.push_back(device);
                descriptions.push_back({{"name", ggml_backend_dev_name(device)}, {"description", ggml_backend_dev_description(device)}});
                break;
            }
        }
        if (devices.empty()) throw std::runtime_error("No WebGPU device initialized");
        devices.push_back(nullptr);
        auto parameters = llama_model_default_params();
        parameters.devices = devices.data();
        parameters.n_gpu_layers = 99;
        parameters.load_mode = LLAMA_LOAD_MODE_NONE;
        parameters.progress_callback = progress;
        const bool gpu_embeddings = EM_ASM_INT({ return globalThis.noveraGpuEmbeddings ? 1 : 0; });
        if (gpu_embeddings) {
            embedding_overrides[0] = {"^token_embd[.]weight$", ggml_backend_dev_buffer_type(devices[0])};
            embedding_overrides[1] = {nullptr, nullptr};
            parameters.tensor_buft_overrides = embedding_overrides;
        }
        model = llama_model_load_from_file(path, parameters);
        if (!model) throw std::runtime_error("Native browser model loading failed");
        auto options = llama_context_default_params();
        trace_native = EM_ASM_INT({ return globalThis.noveraTraceNative === true ? 1 : 0; });
        single_sync_sampling = EM_ASM_INT({ return globalThis.noveraSingleSyncSampling === true ? 1 : 0; });
        token_only_sampler = EM_ASM_INT({ return globalThis.noveraTokenOnlySampler === true ? 1 : 0; });
        sampler = make_backend_sampler();
        cpu_sampler = llama_sampler_chain_init(llama_sampler_chain_default_params());
        llama_sampler_chain_add(cpu_sampler, llama_sampler_init_greedy());
        sampler_config = {0, sampler};
        options.samplers = &sampler_config;
        options.n_samplers = 1;
        options.n_ctx = context_tokens;
        options.n_batch = 512;
        options.n_ubatch = 256;
        options.n_seq_max = 1;
        options.n_threads = 1;
#ifdef __EMSCRIPTEN_PTHREADS__
        cpu_threads = EM_ASM_INT({ return globalThis.noveraCpuThreads || 1; });
#else
        cpu_threads = 1;
#endif
        if (cpu_threads < 1 || cpu_threads > 64) throw std::runtime_error("Invalid CPU worker count");
        options.n_threads_batch = cpu_threads;
        audit_cpu_threads = EM_ASM_INT({ return globalThis.noveraAuditCpuThreads === true ? 1 : 0; });
        options.flash_attn_type = LLAMA_FLASH_ATTN_TYPE_ENABLED;
        options.abort_callback = [](void *) { return cancelled.load(); };
        audit_placement = EM_ASM_INT({ return globalThis.noveraAuditPlacement ? 1 : 0; });
        if (audit_placement) options.cb_eval = observe_placement;
        context = llama_init_from_model(model, options);
        if (!context || llama_n_ctx(context) < 32768) throw std::runtime_error("Full 32768 context allocation failed");
        if (cpu_threads > 1) {
            auto pool_options = ggml_threadpool_params_default(cpu_threads);
            pool_options.poll = 0; // Sleep between CPU work; do not busy-spin during GPU execution.
            pool_options.paused = true;
            cpu_batch_pool = ggml_threadpool_new(&pool_options);
            if (!cpu_batch_pool) throw std::runtime_error("CPU worker pool creation failed");
            llama_attach_threadpool(context, nullptr, cpu_batch_pool);
        }
        tune_cpu_threads(EM_ASM_INT({ return globalThis.noveraCpuAutoTune === true ? 1 : 0; }));
        templates = common_chat_templates_init(model, "");
        const int command_batch_size = EM_ASM_INT({ return globalThis.noveraSelectedCommandBatchSize || 64; });
        const bool bulk_dispatch = EM_ASM_INT({ return globalThis.noveraSelectedBulkDispatch ? 1 : 0; });
        const bool queue_ordered_readback = EM_ASM_INT({ return globalThis.noveraSelectedQueueOrderedReadback ? 1 : 0; });
        const bool completed_fence_cache = EM_ASM_INT({ return globalThis.noveraSelectedCompletedFenceCache ? 1 : 0; });
        result = json({{"version", "1.0.1"}, {"engine", "native-wasm-webgpu"}, {"cpuThreads", cpu_threads}, {"cpuDecodeThreads", 1}, {"cpuTuning", cpu_tuning}, {"contextTokens", llama_n_ctx(context)}, {"commandBatchSize", command_batch_size}, {"bulkDispatch", bulk_dispatch}, {"gpuEmbeddingsRequested", gpu_embeddings}, {"singleSyncSampling", single_sync_sampling}, {"tokenOnlySampler", token_only_sampler}, {"queueOrderedReadback", queue_ordered_readback}, {"completedFenceCache", completed_fence_cache}, {"nativeTracing", trace_native}, {"devices", descriptions}, {"placement", model_placement()}, {"placementAuditEnabled", audit_placement}}).dump();
        return 0;
    } catch (const std::exception & error) {
        result = json({{"error", error.what()}}).dump();
        clear();
        return 1;
    }
}

EMSCRIPTEN_KEEPALIVE int novera_generate(const char * messages_json, int max_tokens, int gpu_sampling) {
    if (running || !context || max_tokens < 1 || max_tokens > 1024) {
        result = json({{"error", running ? "An operation is already running" : !context ? "Load the model first" : "Token limit must be between 1 and 1024"}}).dump();
        return 1;
    }
    cancelled = false; running = true;
    evaluation_placement = json::object();
    cpu_audit_enabled.store(audit_cpu_threads, std::memory_order_relaxed);
    cpu_phase.store(0, std::memory_order_relaxed);
    for (auto & phase : cpu_rows) for (auto & count : phase) count.store(0, std::memory_order_relaxed);
    try {
        // Backend sampler initialization is one-shot in this pinned core.
        // Detach before replacing it; graph reservation is invalidated by set_sampler.
        llama_set_sampler(context, 0, nullptr);
        llama_sampler_free(sampler);
        sampler = make_backend_sampler();
        sampler_config = {0, sampler};
        llama_sampler_reset(cpu_sampler);
        const bool sampler_supported = gpu_sampling && llama_set_sampler(context, 0, sampler);
        const auto messages = json::parse(messages_json);
        if (!messages.is_array() || messages.empty() || messages.size() > 256) throw std::runtime_error("Invalid text conversation");
        common_chat_templates_inputs input;
        input.enable_thinking = false;
        size_t characters = 0;
        for (const auto & item : messages) {
            common_chat_msg message;
            message.role = item.at("role").get<std::string>();
            message.content = item.at("content").get<std::string>();
            if (message.role != "user" && message.role != "assistant" && message.role != "system") throw std::runtime_error("Text messages only in this validation build");
            characters += message.content.size();
            input.messages.push_back(std::move(message));
        }
        if (characters > 100000) throw std::runtime_error("Conversation too large");
        const double started = emscripten_get_now();
        const auto formatted = common_chat_templates_apply(templates.get(), input);
        const auto tokens = tokenize(formatted.prompt.str());
        if (tokens.size() + max_tokens > llama_n_ctx(context)) throw std::runtime_error("Context capacity exceeded");
        llama_memory_clear(llama_get_memory(context), true);
        json cpu_prefill_threads = json::array();
        for (size_t offset = 0; offset < tokens.size(); offset += 256) {
            if (cancelled) throw std::runtime_error("cancelled");
            const int batch_tokens = (int) std::min<size_t>(256, tokens.size() - offset);
            const int active_threads = prefill_cpu_threads(batch_tokens);
            llama_attach_threadpool(context, nullptr, active_threads > 1 ? cpu_batch_pool : nullptr);
            llama_set_n_threads(context, 1, active_threads);
            cpu_prefill_threads.push_back({{"tokens", batch_tokens}, {"threads", active_threads}});
            auto batch = llama_batch_get_one(const_cast<llama_token *>(tokens.data() + offset), batch_tokens);
            novera_trace_span trace("prompt.decode", trace_native);
            if (llama_decode(context, batch) != 0) throw std::runtime_error("Prompt decode failed");
        }
        const double prefilled = emscripten_get_now();
        cpu_phase.store(1, std::memory_order_relaxed);
        const auto * vocab = llama_model_get_vocab(model);
        std::vector<llama_token> ids;
        size_t gpu_sampled_tokens = 0;
        std::string text;
        double first_token = 0;
        bool stopped = false;
        for (int i = 0; i < max_tokens && !cancelled; ++i) {
            llama_token token = LLAMA_TOKEN_NULL;
            if (!single_sync_sampling || gpu_sampling) {
                novera_trace_span trace("sample.probe", trace_native);
                token = llama_get_sampled_token_ith(context, -1);
            }
            if (token != LLAMA_TOKEN_NULL) { ++gpu_sampled_tokens; llama_sampler_accept(sampler, token); }
            else {
                if (gpu_sampling && sampler_supported && token_only_sampler) {
                    throw std::runtime_error("GPU sampler returned no token; CPU logits were not exported");
                }
                novera_trace_span trace("sample.cpu", trace_native);
                if (single_sync_sampling && !gpu_sampling) {
                    const float * logits = llama_get_logits_ith(context, -1);
                    if (!logits) throw std::runtime_error("CPU logits unavailable");
                    const int count = llama_vocab_n_tokens(vocab);
                    cpu_candidates.resize(count);
                    for (int id = 0; id < count; ++id) cpu_candidates[id] = {id, logits[id], 0.0f};
                    llama_token_data_array candidates{cpu_candidates.data(), cpu_candidates.size(), -1, false};
                    llama_sampler_apply(cpu_sampler, &candidates);
                    if (candidates.selected < 0 || size_t(candidates.selected) >= candidates.size) throw std::runtime_error("CPU sampling failed");
                    token = candidates.data[candidates.selected].id;
                    llama_sampler_accept(cpu_sampler, token);
                } else token = llama_sampler_sample(cpu_sampler, context, -1);
            }
            if (ids.empty()) first_token = emscripten_get_now();
            ids.push_back(token);
            if (llama_vocab_is_eog(vocab, token)) { stopped = true; break; }
            std::vector<char> piece(256);
            int length = llama_token_to_piece(vocab, token, piece.data(), piece.size(), 0, false);
            if (length < 0) { piece.resize(-length); length = llama_token_to_piece(vocab, token, piece.data(), piece.size(), 0, false); }
            if (length < 0) throw std::runtime_error("Token rendering failed");
            if (length) { novera_trace_span trace("stream.publish", trace_native); text.append(piece.data(), length); publish_bytes(piece.data(), length); }
            if (i + 1 < max_tokens) {
                auto batch = llama_batch_get_one(&token, 1);
                novera_trace_span trace("step.decode", trace_native);
                if (llama_decode(context, batch) != 0) { if (cancelled) break; throw std::runtime_error("Token decode failed"); }
            }
        }
        const double finished = emscripten_get_now();
        const double decode_ms = first_token ? finished - first_token : 0;
        result = json({{"text", text}, {"ids", ids}, {"finishReason", cancelled ? "cancelled" : stopped ? "stop" : "length"},
            {"gpuSamplingRequested", gpu_sampling != 0}, {"tokenOnlySampler", token_only_sampler}, {"samplerSupported", sampler_supported}, {"gpuSampledTokens", gpu_sampled_tokens},
            {"cpuThreads", cpu_threads}, {"cpuPrefillThreads", cpu_prefill_threads}, {"cpuTuningEnabled", cpu_tuning.value("enabled", false)}, {"cpuRowsByThread", audit_cpu_threads ? cpu_row_audit() : json(nullptr)}, {"promptTokens", tokens.size()}, {"completionTokens", ids.size()}, {"evaluationPlacement", evaluation_placement}, {"firstTokenMs", first_token - started},
            {"prefillMs", prefilled - started}, {"decodeMs", decode_ms}, {"totalMs", finished - started},
            {"tokensPerSecond", ids.size() > 1 && decode_ms > 0 ? (ids.size() - 1) * 1000.0 / decode_ms : 0}}).dump(-1, ' ', false, json::error_handler_t::replace);
        running = false;
        return 0;
    } catch (const std::exception & error) {
        result = json({{"error", error.what()}}).dump();
        running = false;
        return 1;
    }
}
}
