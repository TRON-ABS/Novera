// Same-origin worklet: no blob URL, eval, network access or audio output.
class PcmCapture extends AudioWorkletProcessor {
  constructor() { super(); this.samples = []; this.energy = 0 }
  process(inputs, outputs) {
    for (const output of outputs) for (const channel of output) channel.fill(0)
    const channel = inputs[0]?.[0]
    if (!channel) return true
    for (const sample of channel) {
      this.samples.push(sample)
      this.energy += sample * sample
      if (this.samples.length === 320) {
        const pcm = new ArrayBuffer(640)
        const view = new DataView(pcm)
        this.samples.forEach((value, index) => view.setInt16(index * 2,
          Math.round(Math.max(-1, Math.min(1, value)) * (value < 0 ? 32768 : 32767)), true))
        this.port.postMessage({ pcm, rms: Math.sqrt(this.energy / 320) }, [pcm])
        this.samples = []; this.energy = 0
      }
    }
    return true
  }
}
registerProcessor('novera-pcm-capture', PcmCapture)
