// Mono PCM16 at 16 kHz. Bound capture even if noise prevents a clean pause.
export class VoiceUtterance {
  private frames: Uint8Array[] = []
  private preRoll: Uint8Array[] = []
  private elapsed = 0
  private voiced = 0
  private consecutive = 0
  private silent = 0
  private speaking = false
  push(pcm: ArrayBuffer, rms: number) {
    if (pcm.byteLength !== 640 || !Number.isFinite(rms)) throw new Error('invalid PCM frame')
    const frame = new Uint8Array(pcm)
    this.elapsed += 20
    if (rms >= 0.006) {
      this.voiced += 20; this.consecutive += 20; this.silent = 0
    } else { this.consecutive = 0; this.silent += 20 }
    if (this.speaking) this.frames.push(frame)
    else {
      this.preRoll.push(frame)
      if (this.preRoll.length > 15) this.preRoll.shift()
      if (this.consecutive >= 60) {
        this.speaking = true; this.frames = this.preRoll; this.preRoll = []
      }
    }
    return this.elapsed >= 20_000 ||
      (this.speaking && this.voiced >= 180 && this.silent >= 1100) ||
      (!this.speaking && this.elapsed >= 12_000)
  }
  pcm() {
    if (!this.speaking || this.voiced < 180) return new Uint8Array()
    const result = new Uint8Array(this.frames.length * 640)
    this.frames.forEach((frame, index) => result.set(frame, index * 640))
    return result
  }
}
