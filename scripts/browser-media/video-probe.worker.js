const concat=(...parts)=>{const result=new Uint8Array(parts.reduce((sum,p)=>sum+p.length,0));let offset=0;for(const part of parts){result.set(part,offset);offset+=part.length;}return result;};
const id=hex=>Uint8Array.from(hex.match(/../g),v=>parseInt(v,16));
const uint=value=>{let n=BigInt(value),size=1;while(n>=(1n<<BigInt(size*8)))size++;const bytes=new Uint8Array(size);for(let i=size-1;i>=0;i--){bytes[i]=Number(n&255n);n>>=8n;}return bytes;};
const length=value=>{let n=BigInt(value),size=1;while(n>=(1n<<BigInt(7*size))-1n)size++;const bytes=new Uint8Array(size);for(let i=size-1;i>=0;i--){bytes[i]=Number(n&255n);n>>=8n;}bytes[0]|=1<<(8-size);return bytes;};
const tag=(hex,...parts)=>{const body=concat(...parts);return concat(id(hex),length(body.length),body);};const text=value=>new TextEncoder().encode(value);
function mux(chunks,width,height,fps){const duration=chunks.length/fps*1000;const float=new Uint8Array(8);new DataView(float.buffer).setFloat64(0,duration);const header=tag('1a45dfa3',tag('4286',uint(1)),tag('42f7',uint(1)),tag('42f2',uint(4)),tag('42f3',uint(8)),tag('4282',text('webm')),tag('4287',uint(4)),tag('4285',uint(2)));const info=tag('1549a966',tag('2ad7b1',uint(1000000)),tag('4489',float),tag('4d80',text('Novera')),tag('5741',text('Novera')));const tracks=tag('1654ae6b',tag('ae',tag('d7',uint(1)),tag('73c5',uint(1)),tag('83',uint(1)),tag('86',text('V_VP8')),tag('23e383',uint(Math.round(1e9/fps))),tag('e0',tag('b0',uint(width)),tag('ba',uint(height)))));const blocks=chunks.map(chunk=>{const time=Math.round(chunk.timestamp/1000);return tag('a3',Uint8Array.from([0x81,(time>>8)&255,time&255,chunk.type==='key'?0x80:0]),chunk.bytes);});return new Blob([header,tag('18538067',info,tracks,tag('1f43b675',tag('e7',uint(0)),...blocks))],{type:'video/webm'});}
self.onmessage = async ({data}) => {
    try {
        const started = performance.now();
        const {
            width, height, frames, fps, steps, seed, gpuBudgetGiB, flashAttention, prompt, runtimeUrl,
            batchedCfg = true, traceCpu = false, expandWeights = false, kernelFlags, calibration = false,
        } = data;
        const short = width === 832 && height === 480 && frames === 5 && fps === 8;
        const longer = width === 768 && height === 432 && frames === 33 && fps === 16;
        const desktop = width === 512 && height === 224 && frames === 81 && fps === 16;
        const preview = calibration === true && width === 512 && height === 224 && frames === 25 && fps === 8;
        if ((preview ? steps !== 2 : (!short && !longer && !desktop) || steps !== 20) ||
            !Number.isInteger(seed) || seed < 0 || seed > 0xffffffff || ![2, 4, 6].includes(gpuBudgetGiB) ||
            typeof flashAttention !== 'boolean' || typeof prompt !== 'string' || !prompt.trim() || prompt.length > 4096) {
            throw new Error('Paramètres du banc Wan invalides.');
        }
        if (expandWeights && gpuBudgetGiB < 6) throw new Error('L’expansion F16 requiert un budget GPU de 6 Gio.');
        if (kernelFlags !== undefined && ![0, 143602, 159986, 4354290, 12742898].includes(kernelFlags)) {
            throw new Error('Profil de noyaux Wan invalide.');
        }
        const names = ['Wan2.1-T2V-1.3B-Q4_K_M.gguf', 'umt5-xxl-encoder-Q4_K_M.gguf', 'wan_2.1_vae.safetensors'];
        const files = names.map(name => data.files.find(file => file.name === name));
        if (files.some(file => !file)) throw new Error('Les trois composants Wan exacts sont requis.');
        if (!self.navigator.gpu || typeof WebAssembly.Suspending !== 'function' || typeof WebAssembly.promising !== 'function') {
            throw new Error('La génération Wan requiert WebGPU et WebAssembly JSPI.');
        }
        const encoderConfig = {codec: 'vp8', width, height, framerate: fps, bitrate: 1000000};
        if (!self.crypto?.subtle || !self.OffscreenCanvas || !self.VideoFrame || !self.VideoEncoder ||
            !(await VideoEncoder.isConfigSupported(encoderConfig)).supported) {
            throw new Error('Ce banc nécessite un contexte sécurisé et l’encodage VP8 WebCodecs.');
        }

        if (kernelFlags !== undefined) self.noveraImageKernelFlags = kernelFlags;
        self.postMessage({phase: 'initializing', width, height, frames, fps, steps, kernelFlags});
        const create = (await import(runtimeUrl)).default;
        const runtime = await create({
            print: log => self.postMessage({log: String(log)}),
            printErr: diagnostic => self.postMessage({diagnostic: String(diagnostic)}),
        });
        runtime.FS.mkdir('/models');
        runtime.FS.mount(runtime.WORKERFS, {files}, '/models');
        if (!runtime._novera_configure_video_runtime(gpuBudgetGiB, Number(flashAttention))) {
            throw new Error('Politique GPU vidéo rejetée.');
        }
        if (!runtime._novera_configure_video_execution(Number(batchedCfg), Number(traceCpu)) ||
            !runtime._novera_configure_video_weights(Number(expandWeights))) {
            throw new Error('Politique de calcul Wan rejetée.');
        }

        const loading = performance.now();
        self.postMessage({phase: 'loading', gpuBudgetGiB, flashAttention, batchedCfg, traceCpu, expandWeights});
        if (!await runtime.ccall('novera_load', 'number', ['string', 'string', 'string', 'number'],
            [...names.map(name => '/models/' + name), 1], {async: true})) {
            throw new Error('Chargement Wan impossible.');
        }
        const cfg = 6, flowShift = 3;
        if (!runtime._novera_configure_video(cfg, flowShift)) throw new Error('Réglages vidéo rejetés.');
        const loadingMs = performance.now() - loading;
        self.postMessage({phase: 'generating', cfg, flowShift, seed, prompt, loadingMs});
        const generation = performance.now();
        if (!await runtime.ccall('novera_generate', 'number',
            ['number', 'string', 'number', 'number', 'number', 'number', 'number', 'number'],
            [1, prompt, width, height, steps, seed, frames, fps], {async: true})) {
            throw new Error('Wan n’a pas produit de vidéo.');
        }
        const generationMs = performance.now() - generation;
        const generatedFrames = runtime._novera_frame_count();
        if (generatedFrames !== frames) throw new Error('Nombre d’images inattendu : ' + generatedFrames);
        // Wan generates 4k+1 frames. Desktop keeps exactly five seconds.
        const count = preview ? fps * 3 : desktop ? fps * 5 : generatedFrames;

        const encoding = performance.now();
        self.postMessage({phase: 'encoding', generationMs, count});
        const chunks = [];
        let encoderError;
        const encoder = new VideoEncoder({
            output: chunk => {
                const bytes = new Uint8Array(chunk.byteLength);
                chunk.copyTo(bytes);
                chunks.push({bytes, timestamp: chunk.timestamp, type: chunk.type});
            },
            error: error => { encoderError = error; },
        });
        const canvas = new OffscreenCanvas(width, height);
        const context = canvas.getContext('2d');
        let firstImage;
        const frameDigests = [];
        try {
            encoder.configure(encoderConfig);
            for (let index = 0; index < count; index++) {
                const w = runtime._novera_width(index), h = runtime._novera_height(index);
                const channels = runtime._novera_channels(index);
                const address = Number(runtime._novera_frame_data(index));
                const byteLength = w * h * channels;
                if (w !== width || h !== height || ![3, 4].includes(channels) ||
                    !Number.isSafeInteger(address) || address <= 0 || address + byteLength > runtime.HEAPU8.length) {
                    throw new Error('Image Wan invalide : ' + index);
                }
                const source = runtime.HEAPU8.slice(address, address + byteLength);
                const rgba = new Uint8ClampedArray(w * h * 4);
                for (let i = 0, j = 0; j < rgba.length; i += channels, j += 4) {
                    rgba[j] = source[i];
                    rgba[j + 1] = source[i + 1];
                    rgba[j + 2] = source[i + 2];
                    rgba[j + 3] = channels === 4 ? source[i + 3] : 255;
                }
                // Fingerprint each generated frame before canvas rendering and lossy encoding.
                frameDigests.push(crypto.subtle.digest('SHA-256', rgba).then(digest =>
                    Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')));
                if (calibration) continue;
                context.putImageData(new ImageData(rgba, w, h), 0, 0);
                if (index === 0) firstImage = await canvas.convertToBlob({type: 'image/png'});
                const timestamp = Math.round(index * 1e6 / fps);
                const duration = Math.round((index + 1) * 1e6 / fps) - timestamp;
                const frame = new VideoFrame(canvas, {timestamp, duration});
                try {
                    encoder.encode(frame, {keyFrame: index === 0});
                } finally {
                    frame.close();
                }
            }
            await encoder.flush();
        } finally {
            if (encoder.state !== 'closed') encoder.close();
        }
        if (encoderError) throw encoderError;
        chunks.sort((a, b) => a.timestamp - b.timestamp);
        if (!calibration && chunks.length !== count) throw new Error('Encodage incomplet.');
        const video = calibration ? undefined : mux(chunks, width, height, fps);
        const frameRgbaSha256 = await Promise.all(frameDigests);
        const encodingMs = performance.now() - encoding;
        await runtime.ccall('novera_release', null, [], [], {async: true});
        self.postMessage({
            phase: 'complete', video, firstImage, frameRgbaSha256, count, generatedFrames, width, height, fps, seconds: count / fps,
            gpuBudgetGiB, flashAttention, batchedCfg, traceCpu, expandWeights, kernelFlags,
            loadingMs, generationMs, encodingMs, totalMs: performance.now() - started,
        });
    } catch (error) {
        self.postMessage({phase: 'error', message: error instanceof Error ? error.message : String(error), stack: error?.stack});
    }
};
