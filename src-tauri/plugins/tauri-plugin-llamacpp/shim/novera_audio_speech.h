#pragma once

#include "server-context.h"
#include "server-http.h"
#include "server-common.h"
#include "base64.hpp"
#include <atomic>
#include <chrono>
#include <condition_variable>
#include <mutex>

namespace novera_audio {
// The shim's string FFI is UTF-8, so raw WAV must cross it as base64 JSON.
// Start the blocking TTS handler lazily; heartbeats keep disconnect cancellation
// observable while the model synthesizes, without adding another server.
class speech_response final : public server_http_res {
    std::atomic<bool> stopped{false};
    std::function<bool()> should_stop;
    server_http_req request;
    server_routes & routes;
    std::thread task;
    std::mutex mutex;
    std::condition_variable changed;
    bool done = false;
    std::string result;
public:
    speech_response(server_routes & server, const server_http_req & original, const std::string & body)
        : should_stop([this, &original, deadline = std::chrono::steady_clock::now() + std::chrono::seconds(120)] {
              return stopped.load() || original.should_stop() || std::chrono::steady_clock::now() >= deadline;
          }),
          request{original.params, {}, original.path, original.query_string, body, {}, should_stop}, routes(server) {
        next = [this](std::string & data) {
            if (!task.joinable()) {
                task = std::thread([this] {
                    std::string response = json({{"error", {{"code", "audio_synthesis_failed"}}}}).dump();
                    try {
                        auto audio = routes.post_tts(request);
                        if (!should_stop() && audio->status == 200 && !audio->is_stream() &&
                            audio->content_type == "audio/wav" && audio->data.size() >= 44 &&
                            audio->data.size() <= 12000000 && audio->data.compare(0, 4, "RIFF") == 0 &&
                            audio->data.compare(8, 4, "WAVE") == 0) {
                            response = json({{"audio", base64::encode(audio->data)}, {"format", "wav"},
                                {"engine", "native-audio"}}).dump();
                        }
                        audio->on_complete();
                    } catch (...) { /* No prompts or model internals in errors. */ }
                    { std::lock_guard<std::mutex> lock(mutex); result = std::move(response); done = true; }
                    changed.notify_all();
                });
            }
            std::unique_lock<std::mutex> lock(mutex);
            changed.wait_for(lock, std::chrono::milliseconds(25), [this] { return done; });
            if (done) { data = result; return false; }
            return true;
        };
    }
    void on_complete() override {
        stopped = true;
        if (task.joinable()) task.join();
    }
    ~speech_response() override { on_complete(); }
};

inline server_http_res_ptr speak(server_routes & routes, const server_http_req & req) {
    const auto body = json::parse(req.body);
    const auto text = body.value("input", std::string());
    const auto voice = body.value("voice", std::string("male"));
    const auto lang = body.value("lang", std::string());
    // Limit one spoken segment, not the entire conversation. Only expose the
    // built-in male/female voices, never speaker files or reference uploads.
    if (text.empty() || text.size() > 1200 || (voice != "male" && voice != "female") ||
        !(lang == "ar" || lang == "da" || lang == "de" || lang == "el" || lang == "en" ||
          lang == "en-us" || lang == "en-gb" || lang == "fi" || lang == "fr" || lang == "he" ||
          lang == "it" || lang == "ja" || lang == "ko" || lang == "nl" || lang == "pl" ||
          lang == "pt" || lang == "es" || lang == "sv" || lang == "tr" || lang == "zh")) {
        throw std::invalid_argument("invalid bounded speech input, voice or language");
    }
    const auto sanitized = json({{"input", text}, {"voice", voice}, {"lang", lang},
        {"response_format", "wav"}, {"stream", false}, {"max_tokens", 2048}}).dump();
    return std::make_unique<speech_response>(routes, req, sanitized);
}
} // namespace novera_audio
