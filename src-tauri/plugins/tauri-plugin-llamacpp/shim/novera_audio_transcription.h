#pragma once

#include "server-context.h"
#include "server-http.h"
#include "server-common.h"
#include <atomic>
#include <chrono>
#include <condition_variable>
#include <deque>
#include <mutex>

// Adapt one bounded PCM utterance to llama.cpp's native realtime transcription
// session. No HTTP chat-template workaround, external socket or new FFI ABI.
namespace novera_audio {
class transcription_connection final : public server_http_context::ws_conn {
    const server_http_req & req;
    const std::chrono::steady_clock::time_point deadline = std::chrono::steady_clock::now() + std::chrono::seconds(90);
    std::atomic<bool> open{true};
    std::mutex mutex;
    std::condition_variable changed;
    std::deque<std::string> input;
public:
    std::string transcript;
    bool completed = false;
    bool failed = false;

    transcription_connection(const server_http_req & request, const std::string & audio, const std::string & language) : req(request) {
        input.push_back(json({{"type", "session.update"}, {"session", {
            {"type", "transcription"}, {"max_output_tokens", 1024},
            {"output_modalities", json::array({"text"})}, {"tools", json::array()}, {"tool_choice", "none"},
            {"audio", {{"input", {{"format", {{"type", "audio/pcm"}, {"rate", 16000}}},
                {"transcription", {{"language", language}}}}}}}
        }}}).dump());
        // Each append is independently decodable base64, bounded to 48 KiB PCM.
        for (size_t offset = 0; offset < audio.size(); offset += 65536) {
            input.push_back(json({{"type", "input_audio_buffer.append"}, {"audio", audio.substr(offset, 65536)}}).dump());
        }
        input.push_back(json({{"type", "input_audio_buffer.commit"}}).dump());
    }
    bool is_open() const override {
        return open.load() && !req.should_stop() && std::chrono::steady_clock::now() < deadline;
    }
    void close() override { open = false; changed.notify_all(); }
    int read(std::string & message) override {
        std::unique_lock<std::mutex> lock(mutex);
        while (is_open()) {
            if (!input.empty()) {
                message = std::move(input.front()); input.pop_front(); return 1;
            }
            changed.wait_for(lock, std::chrono::milliseconds(25));
        }
        return 0;
    }
    bool send(const std::string & message) override {
        std::lock_guard<std::mutex> lock(mutex);
        try {
        const auto event = json::parse(message);
        const auto type = event.value("type", std::string());
        if (type == "error") { failed = true; close(); }
        if (type == "conversation.item.input_audio_transcription.completed") {
            transcript = event.value("transcript", std::string());
            completed = transcript.size() <= 16384;
            failed = !completed;
            close();
        }
        return is_open();
        } catch (...) { failed = true; close(); return false; }
    }
    bool send_binary(const std::string &) override {
        std::lock_guard<std::mutex> lock(mutex); failed = true; close(); return false;
    }
};

class transcription_response final : public server_http_res {
    transcription_connection connection;
    const server_http_req & req;
    server_routes & routes;
    std::thread task;
    std::mutex result_mutex;
    std::condition_variable ready;
    bool done = false;
    std::string result;
public:
    transcription_response(server_routes & server, const server_http_req & request, const std::string & audio, const std::string & language)
        : connection(request, audio, language), req(request), routes(server) {
        next = [this](std::string & data) {
            if (!task.joinable()) {
                task = std::thread([this]() {
                    try { routes.ws_realtime(req, connection); }
                    catch (...) { connection.failed = true; }
                    std::string response;
                    if (!connection.completed || connection.failed) {
                        response = json({{"error", {{"code", "audio_transcription_failed"}, {"message", "native audio transcription did not complete"}}}}).dump();
                    } else {
                        response = json({{"text", connection.transcript}, {"engine", "native-audio"}, {"sample_rate", 16000}}).dump();
                    }
                    { std::lock_guard<std::mutex> lock(result_mutex); result = std::move(response); done = true; }
                    ready.notify_all();
                });
            }
            std::unique_lock<std::mutex> lock(result_mutex);
            ready.wait_for(lock, std::chrono::milliseconds(25), [this] { return done; });
            if (done) { data = result; return false; }
            // A heartbeat lets the Rust HTTP body observe client disconnects
            // and set the existing cancellation flag while inference is active.
            return true;
        };
    }
    void on_complete() override {
        connection.close();
        if (task.joinable()) task.join();
    }
    ~transcription_response() override { on_complete(); }
};

inline server_http_res_ptr transcribe(server_routes & routes, const server_http_req & req) {
    const auto body = json::parse(req.body);
    const auto audio = body.value("audio", std::string());
    const auto language = body.value("language", std::string("en"));
    if (body.value("sample_rate", 0) != 16000 || audio.size() < 4 || audio.size() > 1280000 || audio.size() % 4 != 0 ||
        language.empty() || language.size() > 64) {
        throw std::invalid_argument("expected bounded mono PCM16 at 16000 Hz");
    }
    for (size_t i = 0; i < audio.size(); i++) {
        const auto c = audio[i];
        if (!((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') || c == '+' || c == '/' ||
            (c == '=' && i >= audio.size() - 2))) { throw std::invalid_argument("invalid PCM encoding"); }
    }
    const auto padding = (audio.back() == '=' ? 1 : 0) + (audio[audio.size() - 2] == '=' ? 1 : 0);
    const auto bytes = audio.size() / 4 * 3 - padding;
    if (bytes % 2 != 0 || bytes > 960000) { throw std::invalid_argument("invalid PCM sample count"); }
    for (const auto c : language) {
        if (!((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') || c == '-')) {
            throw std::invalid_argument("invalid transcription language");
        }
    }
    return std::make_unique<transcription_response>(routes, req, audio, language);
}
} // namespace novera_audio
