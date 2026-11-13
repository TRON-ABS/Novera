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
const defaultModel = { repo: 'LiquidAI/LFM3-Omni-2B-GGUF', revision: 'd508b88f08a5b4286f2d2805a6a8d69a0ff44c72',
  file: modelName, bytes: 1099630080, sha256: modelSha };

async function readModel(body, model) {
  if (!body) throw new Error('Téléchargement du modèle impossible.');
  const bytes = new Uint8Array(model.bytes);
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
      const percent = Math.floor(90 * offset / model.bytes);
      if (percent > lastPercent) {
        lastPercent = percent;
        postMessage({type:'loading', progress:percent / 100});
      }
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
  if (offset !== model.bytes || await digest(bytes) !== model.sha256) throw new Error('Le modèle ne correspond pas à la révision vérifiée.');
  return bytes;
}

async function loadCatalogModel(model = defaultModel) {
  if (!/^[\w.-]+\/[\w.-]+$/.test(model.repo) || !/^[a-f0-9]{40}$/.test(model.revision) ||
      !/^[\w.-]+\.gguf$/.test(model.file) || !/^[a-f0-9]{64}$/.test(model.sha256) ||
      !Number.isSafeInteger(model.bytes) || model.bytes <= 0) throw new Error('Invalid catalog model');
  const url = 'https://huggingface.co/' + model.repo + '/resolve/' + model.revision + '/' + model.file;
  const root = await navigator.storage?.getDirectory?.().catch(() => undefined);
  const filename = `novera-text-${model.sha256}.gguf`;
  const cached = await root?.getFileHandle(filename).then(handle => handle.getFile()).catch(() => undefined);
  if (cached?.size === model.bytes) {
    try { return await readModel(cached.stream(), model); }
    catch (error) { postMessage({type:'log',line:`Vérification du cache texte : ${error}`}); }
  }
  const response = await fetch(url, {credentials:'omit', referrerPolicy:'no-referrer'});
  if (!response.ok) throw new Error('Téléchargement du modèle impossible.');
  const bytes = await readModel(response.body, model);
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
function configureLocalFileReads(filesystem) {
  if (!filesystem) return;
  const operations = filesystem.stream_ops;
  const read = operations.read;
  const chunkSize = 32 * 1024 * 1024;
  // A tensor can be larger than the browser's single FileReaderSync allocation.
  operations.read = (stream, buffer, offset, length, position) => {
    if (length <= chunkSize) return read(stream, buffer, offset, length, position);
    let total = 0;
    while (total < length) {
      const count = read(stream, buffer, offset + total, Math.min(chunkSize, length - total), position + total);
      if (count === 0) break;
      total += count;
    }
    return total;
  };
}
function result(){return JSON.parse(engine.UTF8ToString(Number(engine._novera_result())));}
self.onmessage=async event=>{
  if(event.data.type==='cancel'){engine?._novera_cancel();return;}
  if(busy){postMessage({type:'error',error:'An operation is already running'});return;}
  busy=true;
  try{
    if(event.data.type==='load' || event.data.type==='quantize-q4'){
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
        configureLocalFileReads(engine.WORKERFS);
        initializedCpuThreads = selected; initializedModuleSha = metadata.sha256;
      }
      const localFile = event.data.localFile;
      if (event.data.type === 'quantize-q4') {
        if (!(localFile instanceof Blob) || localFile.size <= 24 || !engine.WORKERFS) throw new Error('Invalid local GGUF file');
        const started = performance.now();
        engine.FS.mkdirTree('/local-model');
        engine.FS.mount(engine.WORKERFS, { blobs: [{ name: 'model.gguf', data: localFile }] }, '/local-model');
        const output = '/Novera-Q4_K_M.gguf';
        const matrixPath = '/importance.gguf';
        try {
          const matrix = event.data.importanceMatrix;
          if (matrix !== undefined) {
            if (!(matrix instanceof Blob) || matrix.size < 24 || matrix.size > 64 * 1024 * 1024) throw new Error('Invalid GGUF importance matrix');
            engine.FS.writeFile(matrixPath, new Uint8Array(await matrix.arrayBuffer()), { canOwn: true });
          }
          const code = engine.ccall('novera_quantize_q4', 'number', ['string', 'string', 'string'],
            ['/local-model/model.gguf', output, matrix ? matrixPath : '']);
          if (code !== 0) throw new Error('GGUF quantization failed');
          const blob = new Blob([engine.FS.readFile(output)], { type: 'application/octet-stream' });
          postMessage({ type: 'quantized', blob, inputBytes: localFile.size, outputBytes: blob.size, elapsedMs: performance.now() - started });
        } finally {
          engine.FS.unmount('/local-model');
          if (engine.FS.analyzePath(output).exists) engine.FS.unlink(output);
          if (engine.FS.analyzePath(matrixPath).exists) engine.FS.unlink(matrixPath);
        }
        return;
      }
      let modelPath = '/model.gguf';
      const benchmarkFile = event.data.benchmark === true && localFile instanceof Blob;
      if (benchmarkFile) {
        const bytes = new Uint8Array(await localFile.arrayBuffer());
        engine.FS.writeFile(modelPath, bytes, {canOwn:true});
      } else if (localFile !== undefined) {
        if (!(localFile instanceof Blob) || localFile.size <= 24) throw new Error('Invalid local GGUF file');
        if (!engine.WORKERFS) throw new Error('The runtime does not support local GGUF files');
        engine.FS.mkdirTree('/local-model');
        engine.FS.mount(engine.WORKERFS, {blobs: [{name: 'model.gguf', data: localFile}]}, '/local-model');
        modelPath = '/local-model/model.gguf';
      } else {
        postMessage({type:'phase',phase:'reading-verified-model'});
        const bytes = event.data.catalogModel === true ? await loadCatalogModel(event.data.model) : new Uint8Array(await verified('/models/'+modelName,modelSha));
        engine.FS.writeFile(modelPath,bytes,{canOwn:true});
      }
      const started=performance.now();
      let code;
      try {
        code=await engine.ccall('novera_load','number',['string','number'],[modelPath,event.data.benchmark === true ? 512 : 32768],{async:true});
      } finally {
        if (localFile !== undefined && !benchmarkFile) engine.FS.unmount('/local-model');
        else engine.FS.unlink(modelPath);
      }
      if(code!==0)throw new Error(result().error??'Native loading failed');
      postMessage({type:'ready',...result(),cpuTopology,reuseQ8Requested:self.noveraReuseQ8,matvecRowsRequested:self.noveraMatvecRows,matvecThreadsRequested:self.noveraMatvecThreads,batchedHostInputsRequested:self.noveraBatchHostInputs,loadMs:performance.now()-started,heapBytes:engine.HEAPU8.buffer.byteLength,receipt});
    }else if(event.data.type==='probe-chunk'){
      if (!engine) throw new Error('Load the model first');
      const pointer = Number(await engine.ccall('novera_probe_chunk', 'number', ['string','number'],
        [event.data.corpus, event.data.chunk], { async: true }));
      const { vocab, positions, tokens, done, error } = result();
      if (done) { postMessage({type:'chunk-end'}); return; }
      if (!pointer || !positions || !vocab) throw new Error(error ?? 'Corpus logits unavailable');
      const logits = new Float32Array(engine.HEAPU8.buffer, pointer, vocab * positions).slice();
      postMessage({type:'chunk-logits', logits, tokens, vocab, positions}, [logits.buffer]);
    }else if(event.data.type==='probe-logits'){
      if (!engine) throw new Error('Load the model first');
      const pointer = Number(await engine.ccall('novera_probe_logits', 'number', ['string'], [event.data.prompt], { async: true }));
      const { vocab, tokens, error } = result();
      if (!pointer || !Number.isSafeInteger(vocab) || vocab <= 0) throw new Error(error ?? 'Logits unavailable');
      const logits = new Float32Array(engine.HEAPU8.buffer, pointer, vocab).slice();
      postMessage({ type: 'logits', logits, tokens }, [logits.buffer]);
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
