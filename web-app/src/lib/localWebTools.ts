// GGUF imports report projector capabilities, so older LFM3 entries can lack
// the tools label even though these families implement native tool calls.
export function localWebToolsSupported(provider:string,model: {id:string;name?:string;_userConfiguredCapabilities?:boolean}|null|undefined) {
  return provider==='llamacpp' && model?._userConfiguredCapabilities!==true &&
    /lfm3[-_\s]*(omni|audio)/i.test(`${model?.id??''} ${model?.name??''}`)
}
