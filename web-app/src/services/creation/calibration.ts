import { joinLocalPath } from '@/modules/platform/local-path'
import type { MusicProfile } from '@/hooks/useMusicCreation'
import type { CreationSettings } from '@/hooks/useCreation'

export function visualCalibrationRequest(task: 'image' | 'video', s: CreationSettings) {
  const backend = task === 'image' ? s.imageEngine ?? 'diffusers' : s.videoEngine ?? 'diffusers'
  const model = task === 'video' ? s.videoModel :
    backend === 'diffusers' ? s.imageModel : s.ggufImageModel
  if (!model) return
  return {
    task, model, backend, prompt: 'Calibration', seed: 42, device: s.device,
    encoder_device: s.encoderDevice ?? 'auto', python: s.python,
    width: s.width, height: s.height, steps: s.steps, frames: s.frames, fps: s.fps,
    cpp_executable: typeof IS_WINDOWS !== 'undefined' && IS_WINDOWS ? null : s.cppExecutable ?? null,
    cpp_llm: s.ggufTextEncoder ?? null, cpp_vae: s.ggufVae ?? null, cpp_cfg: s.ggufGuidance ?? 1,
    ...(task === 'video' ? { duration_seconds: s.durationSeconds ?? 5 } : {}),
  }
}

export function musicCalibrationRequest(s: MusicProfile['settings']) {
  if (!(s.directory && s.generator && s.planner && s.encoder && s.vae)) return
  return {
    task: 'music', backend: 'acestep', prompt: 'Calibration', seed: 42,
    model: joinLocalPath(s.directory, s.generator),
    music_lm: joinLocalPath(s.directory, s.planner),
    cpp_llm: joinLocalPath(s.directory, s.encoder),
    cpp_vae: joinLocalPath(s.directory, s.vae),
    music_engine: s.engineDirectory || s.directory,
    music_format: s.quality.startsWith('mp3') ? 'mp3' : s.quality,
    music_bitrate: s.quality === 'mp3-128' ? 128 : 320,
    music_lyrics: s.instrumental ? '[Instrumental]' : s.lyrics,
    music_language: s.instrumental ? 'unknown' : s.language,
    music_bpm: s.bpm || 0, duration_seconds: s.durationSeconds, device: s.device,
    steps: s.steps, python: 'python', width: 1024, height: 432, frames: 81, fps: 16,
  }
}
