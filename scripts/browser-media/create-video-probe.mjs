import { mkdir, writeFile, copyFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { prepareBrowserRuntime } from '../distribution/browser-runtime-assets.mjs'

const dist = path.resolve(process.argv[2] || 'web-app/dist')
const runtime = prepareBrowserRuntime(process.argv[3])
const publicPage = process.argv[4] === '--public'
const receipt = JSON.parse(runtime.assets.find(asset => asset.name === 'BUILD-VERIFICATION.json').source)
const compareKernels = receipt.kernelTuningCompiled === true && receipt.kernelDefaultFlags === 143602
const patches = new Set(receipt.sources?.patches?.map(({patch}) => patch))
const hasPackedIm2col = patches.has('patches/webgpu-im2col-3d-packed-dispatch.patch')
const packedIm2colOption = hasPackedIm2col
  ? '<option value="4354290">Wan · FMA et IM2COL 3D groupé (4354290)</option>'
  : ''
const hasNarrowMatmul = hasPackedIm2col && patches.has('patches/webgpu-wan-narrow-f16-matmul.patch')
if (publicPage && (!compareKernels || !hasNarrowMatmul)) throw new Error('Public Wan requires the verified 12742898 kernel profile')
const narrowMatmulOption = hasNarrowMatmul
  ? `<option value="12742898"${publicPage ? ' selected' : ''}>Wan · Décodage F16 optimisé (12742898)</option>`
  : ''
const target = path.join(dist, 'video-performance')
await mkdir(target, { recursive: true })
await mkdir(path.join(dist, runtime.directory), { recursive: true })
for (const asset of runtime.assets) await writeFile(path.join(dist, runtime.directory, asset.name), asset.source)
await copyFile(fileURLToPath(new URL('./video-probe.worker.js', import.meta.url)), path.join(target, 'worker.js'))
await writeFile(path.join(target, 'index.html'), `<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Novera · vidéo Wan locale</title>
<body style="background:#0b1220;color:#eee;font:16px system-ui;padding:24px"><h1>Vidéo Wan locale</h1>
${publicPage ? '<p><a href="../" style="color:#9ac8ff">Retour à Novera Web</a></p>' : ''}
<p>Génération expérimentale dans votre navigateur. Les fichiers et la description restent sur votre appareil. 20 étapes, CFG 6, shift 3. Le calcul peut prendre plusieurs minutes.</p>
<p><label>Trois composants Wan <input type="file" id="models" multiple accept=".gguf,.safetensors"></label></p>
${publicPage ? '<p>Choisissez les trois fichiers de votre installation Desktop Wan2.1 1.3B : <code>Wan2.1-T2V-1.3B-Q4_K_M.gguf</code>, <code>umt5-xxl-encoder-Q4_K_M.gguf</code> et <code>wan_2.1_vae.safetensors</code>.</p>' : ''}
<p><label>Format <select id="format"><option value="short">832 × 480 · 5 images · 8 FPS</option><option value="desktop">768 × 432 · 33 images · 16 FPS</option><option value="desktop-default"${publicPage ? ' selected' : ''}>Préréglage Desktop · 512 × 224 · 5 s · 16 FPS</option></select></label></p>
<p><label>Graine <input id="seed" type="number" min="0" max="4294967295" step="1" value="42"></label></p>
<p><label>Budget GPU <select id="budget"><option>2</option><option${publicPage ? ' selected' : ''}>4</option><option>6</option></select> Gio</label> · Garder une réserve pour le navigateur.</p>
${compareKernels ? '<p><label>Profil WebGPU <select id="kernels"><option value="0">Référence (0)</option><option value="143602">Expérimental (143602)</option><option value="159986">Wan · Flash Attention FMA (159986)</option>' + packedIm2colOption + narrowMatmulOption + '</select></label></p>' : ''}
<p><label><input type="checkbox" id="attention"${publicPage ? ' checked' : ''}> Flash Attention vidéo</label></p>
<p><label><input type="checkbox" id="batch"${publicPage ? '' : ' checked'}> CFG groupé</label> · <label><input type="checkbox" id="trace"> Repérer les opérations CPU</label> · <label><input type="checkbox" id="expand"> Matrices DiT en F16 en mémoire (6 Gio minimum)</label></p>
<p><label>Description <textarea id="prompt" rows="3" cols="90" maxlength="4096" style="max-width:100%">A red ball rolls slowly across a wooden table, fixed camera, realistic lighting.</textarea></label></p>
<button id="generate">Créer le clip Wan</button> <button id="stop" disabled>Arrêter et libérer</button>
<p id="status" role="status">Prêt</p><pre id="result" style="max-height:280px;overflow:auto;white-space:pre-wrap"></pre>
<section id="output" hidden>
  <h2>Dernier clip terminé</h2>
  <video id="video" controls playsinline preload="metadata" style="max-width:min(740px,100%)"></video>
  <img id="first" alt="Première image Wan" style="max-width:min(350px,100%)">
  <p><a id="download">Télécharger le clip</a> · <a id="receipt">Télécharger les mesures</a></p>
</section>
<script type="module">
const el = id => document.getElementById(id);
const runtimeDirectory = ${JSON.stringify(runtime.directory)};
const phaseLabels = {
  initializing: 'Initialisation du moteur',
  loading: 'Chargement des modèles',
  generating: 'Préparation de la génération',
  encoding: 'Encodage du clip WebM',
};
let worker;
let urls = [];

function stop(message) {
  worker?.terminate();
  worker = undefined;
  el('generate').disabled = false;
  el('stop').disabled = true;
  el('status').textContent = message;
}

function showResult(data, records) {
  const report = new Blob([JSON.stringify({runtimeDirectory, records}, null, 2)], {type:'application/json'});
  const oldUrls = urls;
  urls = [data.video, data.firstImage, report].map(blob => URL.createObjectURL(blob));
  el('video').src = urls[0];
  el('first').src = urls[1];
  const profile = data.kernelFlags === undefined ? '' : '-kernels' + data.kernelFlags;
  const name = 'Novera-Wan-' + data.width + 'x' + data.height + '-' + data.count + 'f-' + data.gpuBudgetGiB +
    'GiB-fa' + Number(data.flashAttention) + '-batch' + Number(data.batchedCfg) + '-f16' + Number(data.expandWeights) + profile;
  el('download').href = urls[0];
  el('download').download = name + '.webm';
  el('receipt').href = urls[2];
  el('receipt').download = name + '.json';
  el('output').hidden = false;
  oldUrls.forEach(url => URL.revokeObjectURL(url));
}

el('generate').onclick = () => {
  if (worker) return;
  const format = el('format').value;
  const preset = {
    short: {width: 832, height: 480, frames: 5, fps: 8},
    desktop: {width: 768, height: 432, frames: 33, fps: 16},
    'desktop-default': {width: 512, height: 224, frames: 81, fps: 16},
  }[format];
  const kernels = el('kernels');
  const request = {
    ...preset, steps: 20, seed: el('seed').valueAsNumber,
    gpuBudgetGiB: Number(el('budget').value), flashAttention: el('attention').checked,
    batchedCfg: el('batch').checked, traceCpu: el('trace').checked,
    expandWeights: el('expand').checked, prompt: el('prompt').value.trim(),
    kernelFlags: kernels ? Number(kernels.value) : undefined,
  };
  const records = [];
  let decoding = false;
  let decodeTiles;
  el('result').textContent = '';
  try {
    const current = new Worker('./worker.js', {type:'module'});
    worker = current;
    el('generate').disabled = true;
    el('stop').disabled = false;
    el('status').textContent = 'Vérification des paramètres';
    current.onerror = event => {
      if (worker === current) stop('Échec · ' + event.message);
    };
    current.onmessage = ({data}) => {
      if (worker !== current) return;
      if (data.type === 'engine-progress') {
        if (decoding) {
          if (decodeTiles === undefined && data.step === 0 && data.total > 0) decodeTiles = data.total;
          if (data.total === decodeTiles && data.step > 0) {
            el('status').textContent = 'Décodage · bloc ' + data.step + '/' + decodeTiles;
            records.push({phase:'decoding', tile:data.step, tiles:decodeTiles, seconds:data.seconds});
          }
        } else if (data.total === request.steps) {
          el('status').textContent = 'Diffusion · étape ' + data.step + '/' + data.total;
        }
        return;
      }
      if (data.type === 'engine-log') {
        if (/generating latent video completed/i.test(data.message)) {
          decoding = true;
          el('status').textContent = 'Décodage des images';
        }
        if (!/taking|completed|decoding|tiles|tiling|tile|flash|memory|vram|fallback|budget/i.test(data.message)) return;
      }
      const {video, firstImage, ...info} = data;
      records.push(info);
      const log = el('result');
      log.textContent = (log.textContent + JSON.stringify(info, null, 2) + '\\n').slice(-24000);
      log.scrollTop = log.scrollHeight;
      if (data.phase === 'complete') {
        showResult(data, records);
        stop('Terminé en ' + (data.totalMs / 1000).toFixed(3) + ' s');
      } else if (data.phase === 'error') {
        stop('Échec · ' + data.message);
      } else if (phaseLabels[data.phase]) {
        el('status').textContent = phaseLabels[data.phase];
      }
    };
    current.postMessage({
      ...request,
      runtimeUrl: new URL('../' + runtimeDirectory + '/novera-diffusion.mjs', location.href).href,
      files: Array.from(el('models').files),
    });
  } catch (error) {
    stop('Échec · ' + error.message);
  }
};
el('stop').onclick = () => stop('Calcul arrêté, moteur libéré');
</script></html>`, 'utf8')
console.log('Created Wan page with verified runtime: /video-performance/')
