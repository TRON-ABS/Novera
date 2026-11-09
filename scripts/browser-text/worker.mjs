let engine;
let initializedCpuThreads;
let initializedModuleSha;
let busy = false;
const modelName = 'LFM3-Omni-2B-Q4_K_M.gguf';
const modelSha = '9f8d30e9d4fd7a9349d586e077988229b3ca0a0e4ad730897563d1eccc9893e2';
const digest = async bytes => [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(x=>x.toString(16).padStart(2,'0')).join('');
async function verified(url, sha) {
  const response=await fetch(url);if(!response.ok)throw new Error('Asset unavailable: '+url);
  const data=await response.arrayBuffer();if(await digest(data)!==sha)throw new Error('Asset checksum mismatch');return data;
}
const modelUrl = 'https://huggingface.co/LiquidAI/LFM3-Omni-2B-GGUF/resolve/d508b88f08a5b4286f2d2805a6a8d69a0ff44c72/' + modelName;
const modelSize = 1099630080;

async function readModel(body) {
  if (!body) throw new Error('Téléchargement du modèle impossible.');
  const bytes = new Uint8Array(modelSize);
  const reader = body.getReader();
  let offset = 0;
  let lastPercent = -1;
  try {
    for (;;) {
      const {done, value} = await reader.read();
      if (done) break;
      if (offset + value.byteLength > bytes.byteLength) throw new Error('Taille du modèle invalide.');
      bytes.set(value, offset);
      offset += value.byteLength;
      const percent = Math.floor(90 * offset / modelSize);
      if (percent > lastPercent) {
        lastPercent = percent;
        postMessage({type:'loading', progress:percent / 100});
      }
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
  if (offset !== modelSize || await digest(bytes) !== modelSha) throw new Error('Le modèle ne correspond pas à la révision vérifiée.');
  return bytes;
}

async function loadCatalogModel() {
  const root = await navigator.storage?.getDirectory?.().catch(() => undefined);
  const filename = `novera-text-${modelSha}.gguf`;
  const cached = await root?.getFileHandle(filename).then(handle => handle.getFile()).catch(() => undefined);
  if (cached?.size === modelSize) {
    try { return await readModel(cached.stream()); }
    catch (error) { postMessage({type:'log',line:`Vérification du cache texte : ${error}`}); }
  }
  const response = await fetch(modelUrl, {credentials:'omit', referrerPolicy:'no-referrer'});
  if (!response.ok) throw new Error('Téléchargement du modèle impossible.');
  const bytes = await readModel(response.body);
  if (root) await cacheModel(root, filename, bytes);
  return bytes;
}

async function cacheModel(root, filename, bytes) {
  let stream;
  try {
    const handle = await root.getFileHandle(filename, {create:true});
    stream = await handle.createWritable();
    const block = 4 * 1024 * 1024;
    for (let offset = 0; offset < bytes.length; offset += block) {
      await stream.write(bytes.subarray(offset, offset + block));
    }
    await stream.close();
  } catch (error) {
    await stream?.abort().catch(() => {});
    postMessage({type:'log',line:`Enregistrement du cache texte : ${error}`});
  }
}
function result(){return JSON.parse(engine.UTF8ToString(engine._novera_result()));}
self.onmessage=async event=>{
  if(event.data.type==='cancel'){engine?._novera_cancel();return;}
  if(busy){postMessage({type:'error',error:'An operation is already running'});return;}
  busy=true;
  try{
    if(event.data.type==='load'){
      const batchSize = event.data.commandBatchSize ?? 64;
      if (![8,16,32,64,128,256].includes(batchSize)) throw new Error('Unsupported command batch size');
      self.noveraWebgpuBatchSize = batchSize;
      self.noveraWebgpuBulkDispatch = event.data.bulkDispatch === true;
      self.noveraAuditPlacement = event.data.auditPlacement === true;
      self.noveraGpuEmbeddings = event.data.gpuEmbeddings === true;
      self.noveraTraceNative = event.data.traceNative === true;
      self.noveraSingleSyncSampling = event.data.singleSyncSampling === true;
      if (event.data.queueOrderedReadback !== undefined && typeof event.data.queueOrderedReadback !== 'boolean') throw new Error('Invalid readback mode');
      if (event.data.completedFenceCache !== undefined && typeof event.data.completedFenceCache !== 'boolean') throw new Error('Invalid completed-fence cache mode');
      if (event.data.batchedHostInputs !== undefined && typeof event.data.batchedHostInputs !== 'boolean') throw new Error('Invalid batched host-input mode');
      if(typeof WebAssembly.Suspending!=='function'||typeof WebAssembly.promising!=='function')throw new Error('JSPI support is required for this native WebGPU build');
      const receipt=await(await fetch('./BUILD-VERIFICATION.json')).json();
      if(!receipt.compiled||receipt.sourceCommit!=='cd959bae99ff4bed22bef2604f45241c09bbb8c8')throw new Error('Unexpected native engine receipt');
      const reported = navigator.hardwareConcurrency;
      const validCount = Number.isSafeInteger(reported) && reported > 0;
      const detected = validCount ? reported : 1;
      const maximum = receipt.pthreads === true ? Math.min(detected, receipt.cpuThreadLimit ?? 64) : 1;
      const requested = event.data.cpuThreads ?? 'auto';
      const selected = requested === 'auto' ? maximum : requested;
      if (!Number.isSafeInteger(selected) || selected < 1 || selected > maximum) throw new Error('Invalid CPU thread count; this build supports 1..' + maximum);
      if (receipt.pthreads === true && (!self.crossOriginIsolated || typeof SharedArrayBuffer !== 'function')) throw new Error('CPU workers require cross-origin isolation; start the local validation server with --isolated');
      if (event.data.cpuAutoTune !== undefined && typeof event.data.cpuAutoTune !== 'boolean') throw new Error('Invalid CPU tuning mode');
      self.noveraCpuAutoTune = event.data.cpuAutoTune ?? (requested === 'auto' && receipt.cpuAutoTuneDefault === true);
      if (self.noveraCpuAutoTune && receipt.cpuAutoTune !== true) throw new Error('Build the CPU calibration wrapper for this mode');
      self.noveraCpuThreads = selected;
      self.noveraCpuPoolSize = selected - 1;
      self.noveraAuditCpuThreads = event.data.auditCpuThreads === true;
      const cpuTopology = {reportedLogicalProcessors: validCount ? reported : null, detectedLogicalProcessors: detected, usedFallback: !validCount, maximumThreads: maximum, selectedThreads: selected, mode: requested === 'auto' ? 'auto' : 'explicit', pthreads: receipt.pthreads === true, crossOriginIsolated: self.crossOriginIsolated};
      if (event.data.tokenOnlySampler !== undefined && typeof event.data.tokenOnlySampler !== 'boolean') throw new Error('Invalid token-only sampler mode');
      self.noveraTokenOnlySampler = event.data.tokenOnlySampler ?? (receipt.tokenOnlySampler === true);
      if (self.noveraTokenOnlySampler && receipt.tokenOnlySampler !== true) throw new Error('Build the token-only sampler wrapper for this mode');
      if (event.data.reuseQ8 !== undefined && typeof event.data.reuseQ8 !== 'boolean') throw new Error('Invalid Q8 reuse mode');
      self.noveraReuseQ8 = event.data.reuseQ8 === true;
      if (self.noveraReuseQ8 && receipt.backendPatch?.reuseQ8 !== true) throw new Error('Build with --reuse-q8 for this mode');
      self.noveraMatvecRows = event.data.matvecRows ?? 4;
      if (![1,2,4,8,16].includes(self.noveraMatvecRows)) throw new Error('Invalid matvec row grouping');
      if (self.noveraMatvecRows !== 4 && receipt.backendPatch?.matvecGeometry !== true) throw new Error('Build with --matvec-geometry for this row grouping');
      if ([1,2].includes(self.noveraMatvecRows) && receipt.backendPatch?.matvecSmall !== true) throw new Error('Build with --matvec-small for this row grouping');
      self.noveraMatvecThreads = event.data.matvecThreads ?? 256;
      if (![64,128,256,512].includes(self.noveraMatvecThreads)) throw new Error('Invalid matvec thread count');
      if (self.noveraMatvecThreads !== 256 && receipt.backendPatch?.matvecThreadGeometry !== true) throw new Error('Build with --matvec-threads for this thread count');
      if (event.data.commandBatchSize === undefined && receipt.backendPatch?.batchedHostInputs === true) self.noveraWebgpuBatchSize = 32;
      self.noveraBatchHostInputs = event.data.batchedHostInputs ?? (receipt.backendPatch?.batchedHostInputs === true);
      if (self.noveraBatchHostInputs && receipt.backendPatch?.batchedHostInputs !== true) throw new Error('Build with --batched-host-inputs to enable this mode');
      self.noveraQueueOrderedReadback = event.data.queueOrderedReadback ?? (receipt.backendPatch?.queueOrderedReadback === true);
      if (self.noveraQueueOrderedReadback && receipt.backendPatch?.queueOrderedReadback !== true) throw new Error('Build with --queue-ordered-readback to enable this mode');
      self.noveraCompletedFenceCache = event.data.completedFenceCache ?? (receipt.backendPatch?.completedFenceCache === true);
      if (self.noveraCompletedFenceCache && receipt.backendPatch?.completedFenceCache !== true) throw new Error('Build with --completed-fence-cache to enable this mode');
      if(self.noveraTraceNative && receipt.backendPatch?.patch !== 'patches/webgpu-synchronization-trace.patch') throw new Error('Build with --trace-synchronization for native tracing');
      const metadata=receipt.artifacts.find(x=>x.name==='novera-text.mjs');
      const binary=receipt.artifacts.find(x=>x.name==='novera-text.wasm');
      await verified('./novera-text.mjs',metadata.sha256);
      const wasm=await verified('./novera-text.wasm',binary.sha256);
      if (engine && (initializedCpuThreads !== selected || initializedModuleSha !== metadata.sha256)) throw new Error('Create a new Worker to change the CPU pool or compiled module');
      if (!engine) {
        const factory=(await import('./novera-text.mjs')).default;
        engine=await factory({wasmBinary:wasm,print:line=>postMessage({type:'log',line}),printErr:line=>postMessage({type:'log',line})});
        initializedCpuThreads = selected; initializedModuleSha = metadata.sha256;
      }
      postMessage({type:'phase',phase:'reading-verified-model'});
      const bytes = event.data.catalogModel === true ? await loadCatalogModel() : new Uint8Array(await verified('/models/'+modelName,modelSha));
      engine.FS.writeFile('/model.gguf',bytes,{canOwn:true});
      const started=performance.now();
      const code=await engine.ccall('novera_load','number',['string','number'],['/model.gguf',32768],{async:true});
      engine.FS.unlink('/model.gguf');
      if(code!==0)throw new Error(result().error??'Native loading failed');
      postMessage({type:'ready',...result(),cpuTopology,reuseQ8Requested:self.noveraReuseQ8,matvecRowsRequested:self.noveraMatvecRows,matvecThreadsRequested:self.noveraMatvecThreads,batchedHostInputsRequested:self.noveraBatchHostInputs,loadMs:performance.now()-started,heapBytes:engine.HEAPU8.buffer.byteLength,receipt});
    }else if(event.data.type==='generate'){
      self.noveraNativeSpans = [];
      self.noveraBatchedHostInputSplits = 0;
      self.noveraBatchedHostInputTensors = 0;
      self.noveraQ8Candidates = self.noveraQ8Reused = self.noveraQ8AliasFallbacks = 0;
      if(!engine)throw new Error('Load the model first');
      // GPU argmax was slower in the paired benchmark; keep it opt-in.
      const code=await engine.ccall('novera_generate','number',['string','number','number'],[JSON.stringify(event.data.messages),event.data.maxTokens,event.data.gpuSampling===true?1:0],{async:true});
      const output=result();if(code!==0)throw new Error(output.error??'Native generation failed');
      postMessage({type:'result',...output,reuseQ8:self.noveraSelectedReuseQ8 === true,q8Candidates:self.noveraQ8Candidates,q8Reused:self.noveraQ8Reused,q8AliasFallbacks:self.noveraQ8AliasFallbacks,matvecRows:self.noveraSelectedMatvecRows ?? 4,matvecThreads:self.noveraSelectedMatvecThreads ?? 256,batchedHostInputSplits:self.noveraBatchedHostInputSplits,batchedHostInputTensors:self.noveraBatchedHostInputTensors,heapBytes:engine.HEAPU8.buffer.byteLength,...(self.noveraTraceNative?{nativeSpans:self.noveraNativeSpans}: {})});
    }else if(event.data.type==='unload'){
      if(engine)await engine.ccall('novera_unload',null,[],[],{async:true});
      postMessage({type:'unloaded'});
    }else throw new Error('Unknown validation operation');
  }catch(error){postMessage({type:'error',error:String(error)});}
  finally{busy=false;}
};
