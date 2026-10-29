import { cloudModelPresets } from './cloudModels'

/**
 * Model-related constants
 */

export const JAN_CODE_HF_REPO = 'janhq/Jan-Code-4b-Gguf'
export const DEFAULT_MODEL_QUANTIZATIONS = ['iq4_xs', 'q4_k_m']

/**
 * Quantizations to check for SetupScreen quick start
 * Novera pins the NVIDIA Q4_K_M file selected by the maintainer
 */
export const SETUP_SCREEN_QUANTIZATIONS = ['q4_k_m']

export const JAN_V2_VL_MODEL_HF_REPO = 'janhq/Jan-v2-VL-high-gguf'
export const JAN_V2_VL_QUANTIZATIONS = ['q4_k_m', 'q4_k_s', 'q4_0', 'q3_k_m']

/**
 * Provider model capabilities; maintained cloud presets are defined in cloudModels.ts
 */
export const providerModels = {
  'openai-compatible': {
    models: true,
    supportsCompletion: true,
    supportsStreaming: true,
    supportsJSON: true,
    supportsImages: true,
    supportsToolCalls: true,
    supportsN: true,
  },
  ...Object.fromEntries(Object.entries(cloudModelPresets).map(([provider, presets]) => {
    const ids = presets.map((model) => model.id)
    return [provider, {
      models: ids,
      supportsCompletion: true,
      supportsStreaming: ids,
      supportsJSON: [],
      supportsImages: presets.filter((model) => model.vision).map((model) => model.id),
      supportsToolCalls: presets.filter((model) => model.tools).map((model) => model.id),
      supportsN: false,
    }]
  })) as unknown as Record<keyof typeof cloudModelPresets, {
    models: string[]; supportsCompletion: boolean; supportsStreaming: string[];
    supportsJSON: string[]; supportsImages: string[]; supportsToolCalls: string[]; supportsN: boolean
  }>,
} as const

/**
 * The one llama.cpp slot Jan pins, and the thread identities that share it.
 *
 * Every surface -- chat, Cowork, background tasks -- sends `id_slot: 0` plus a
 * `thread_id`. Jan reserves no slot of its own, so the emitted "Parallel
 * Sequences" count is exactly what the user configured (llama.cpp's own default
 * when unset). What keeps the surfaces from destroying each other's KV cache is
 * not a slot each but the engine's per-`thread_id` slot-cache park/restore
 * (`engine/http.rs`'s `SlotHint`): a claim by a different identity saves the
 * outgoing thread's prefix before overwriting it, and restores it on return.
 *
 * Slot 0 specifically, and a fixed index rather than one derived from the
 * sequence count, because upstream *wraps* an out-of-range `id_slot` instead of
 * rejecting it (`get_slot_by_id`: `id_slot = id_slot % slots.size()`) -- so any
 * pin above 0 silently lands back here whenever the resolved count disagrees.
 * Slot 0 is the only index guaranteed to exist.
 *
 * A `thread_id` is required for the park to happen at all: a request without one
 * yields no `SlotHint`, so it overwrites whatever the slot held with no save.
 * That is why background work has an identity of its own instead of no field.
 */
export const CHAT_SLOT_ID = 0

/** Thread identity for background work (title generation) sharing slot 0. */
export const BACKGROUND_THREAD_ID = 'background'

/** Thread identity for a Cowork session sharing slot 0 with the chat it names. */
export const coworkThreadId = (threadId?: string) => `cowork:${threadId ?? ''}`
