#pragma once
#include <emscripten.h>

// Wall-clock spans include suspension. Nested spans must not be added together.
struct novera_trace_span {
    const char * name;
    bool enabled;
    double started;
    explicit novera_trace_span(const char * label, bool active)
        : name(label), enabled(active), started(active ? emscripten_get_now() : 0) {}
    explicit novera_trace_span(const char * label)
        : novera_trace_span(label, EM_ASM_INT({ return globalThis.noveraTraceNative === true ? 1 : 0; })) {}
    ~novera_trace_span() {
        if (enabled) {
            EM_ASM({
                (globalThis.noveraNativeSpans ||= []).push([UTF8ToString($0), $1, $2]);
            }, name, started, emscripten_get_now());
        }
    }
};
