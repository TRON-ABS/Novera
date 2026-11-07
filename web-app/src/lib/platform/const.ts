/**
 * Platform Feature Configuration
 * Centralized feature flags for different platforms
 */

import { PlatformFeature } from './types'
import { isPlatformTauri, isPlatformIOS, isPlatformAndroid } from './utils'
import { browserPreviewEnabled } from '@/services/browser-preview/config'

/**
 * Platform Features Configuration
 * Centralized feature flags for different platforms
 */
export const PlatformFeatures: Record<PlatformFeature, boolean> = {
  // Hardware monitoring and GPU usage
  [PlatformFeature.HARDWARE_MONITORING]:
    isPlatformTauri() && !isPlatformIOS() && !isPlatformAndroid(),

  // Local model inference (llama.cpp)
  [PlatformFeature.LOCAL_INFERENCE]:
    (isPlatformTauri() && !isPlatformIOS() && !isPlatformAndroid()) || browserPreviewEnabled(),

  // Local API server
  [PlatformFeature.LOCAL_API_SERVER]:
    isPlatformTauri() && !isPlatformIOS() && !isPlatformAndroid(),

  // Hub/model downloads
  [PlatformFeature.MODEL_HUB]:
    isPlatformTauri() && !isPlatformIOS() && !isPlatformAndroid(),

  // System integrations (logs, file explorer, etc.)
  [PlatformFeature.SYSTEM_INTEGRATIONS]:
    isPlatformTauri() && !isPlatformIOS() && !isPlatformAndroid(),

  // HTTPS proxy
  [PlatformFeature.HTTPS_PROXY]:
    isPlatformTauri() && !isPlatformIOS() && !isPlatformAndroid(),

  // Default model providers (OpenAI, Anthropic, etc.) - disabled for web-only Jan builds
  [PlatformFeature.DEFAULT_PROVIDERS]: isPlatformTauri(),

  // Projects management
  [PlatformFeature.PROJECTS]:
    (isPlatformTauri() && !isPlatformIOS() && !isPlatformAndroid()) || browserPreviewEnabled(),

  // Analytics and telemetry - disabled for web
  [PlatformFeature.ANALYTICS]:
    isPlatformTauri() && !isPlatformIOS() && !isPlatformAndroid(),

  // Web-specific automatic model selection from jan provider - enabled for web only
  [PlatformFeature.WEB_AUTO_MODEL_SELECTION]: !isPlatformTauri() && !browserPreviewEnabled(),

  // Model provider settings page management - disabled for web only
  [PlatformFeature.MODEL_PROVIDER_SETTINGS]: isPlatformTauri() || browserPreviewEnabled(),

  // Auto-enable MCP tool permissions - enabled for web platform
  [PlatformFeature.MCP_AUTO_APPROVE_TOOLS]: !isPlatformTauri() && !browserPreviewEnabled(),

  // MCP servers settings page - disabled for web
  [PlatformFeature.MCP_SERVERS_SETTINGS]:
    isPlatformTauri() && !isPlatformIOS() && !isPlatformAndroid(),

  // Extensions settings page - disabled for web
  [PlatformFeature.EXTENSIONS_SETTINGS]:
    isPlatformTauri(),

  // Assistant functionality - disabled for web
  [PlatformFeature.ASSISTANTS]: isPlatformTauri() || browserPreviewEnabled(),

  // Shortcut
  [PlatformFeature.SHORTCUT]: !isPlatformIOS() && !isPlatformAndroid(),

  // File attachments/RAG UI and tooling - desktop platforms only
  [PlatformFeature.FILE_ATTACHMENTS]:
    isPlatformTauri() && !isPlatformIOS() && !isPlatformAndroid(),
}
