import { mkdir, writeFile, copyFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { prepareBrowserRuntime } from '../distribution/browser-runtime-assets.mjs'

const dist = path.resolve(process.argv[2] || 'web-app/dist')
const runtime = prepareBrowserRuntime(process.argv[3])
const target = path.join(dist, 'video-performance')
await mkdir(target, { recursive: true })
await mkdir(path.join(dist, runtime.directory), { recursive: true })
for (const asset of runtime.assets) await writeFile(path.join(dist, runtime.directory, asset.name), asset.source)
await copyFile(fileURLToPath(new URL('./video-probe.worker.js', import.meta.url)), path.join(target, 'worker.js'))
await writeFile(path.join(target, 'index.html'), `<!doctype html><html lang="fr"><meta charset="utf-8"><title>Novera · mesures Wan</title>
<body style="background:#0b1220;color:#eee;font:16px system-ui;padding:24px"><h1>Wan original · mesures WebGPU</h1>
<p>Banc local expérimental, hors conversation. 20 étapes, CFG 6, shift 3, graine 42. Aucun appel payant.</p>
<p><label>Trois composants Wan <input type="file" id="models" multiple accept=".gguf,.safetensors"></label></p>
<p><label>Format <select id="format"><option value="short">832 × 480 · 5 images · 8 FPS</option><option value="desktop">768 × 432 · 33 images · 16 FPS</option></select></label></p>
<p><label>Budget GPU <select id="budget"><option>2</option><option>4</option><option>6</option></select> Gio</label> · Garder une réserve pour le navigateur.</p>
<p><label><input type="checkbox" id="attention"> Flash Attention vidéo</label></p>
<p><label><input type="checkbox" id="batch" checked> CFG groupé</label> · <label><input type="checkbox" id="trace"> Repérer les opérations CPU</label> · <label><input type="checkbox" id="expand"> Matrices DiT en F16 en mémoire (6 Gio minimum)</label></p>
<p><label>Description <textarea id="prompt" rows="3" cols="90">A red ball rolls slowly across a wooden table, fixed camera, realistic lighting.</textarea></label></p>
<button id="generate">Créer le clip Wan</button> <button id="stop">Arrêter et libérer</button>
<p id="status" role="status">Prêt</p><pre id="result" style="max-height:280px;overflow:auto;white-space:pre-wrap"></pre>
<video id="video" controls style="max-width:740px"></video><img id="first" alt="Première image Wan" style="max-width:350px"><p><a id="download" hidden>Télécharger le clip</a> · <a id="receipt" hidden>Télécharger les mesures</a></p>
<script type="module">
let worker,urls=[],records=[];const el=id=>document.getElementById(id);const append=data=>{records.push(data);el('result').textContent=(el('result').textContent+JSON.stringify(data,null,2)+'\\n').slice(-24000);el('result').scrollTop=el('result').scrollHeight;};
const stop=()=>{worker?.terminate();worker=undefined;el('generate').disabled=false;};
el('generate').onclick=()=>{stop();urls.forEach(URL.revokeObjectURL);urls=[];records=[];el('download').hidden=true;el('receipt').hidden=true;el('result').textContent='';el('generate').disabled=true;el('status').textContent='Calcul en cours';worker=new Worker('./worker.js',{type:'module'});
worker.onerror=e=>{el('status').textContent='Échec : '+e.message;stop()};worker.onmessage=({data})=>{if(data.type==='engine-progress'){el('status').textContent='Étape '+data.step+'/'+data.total;return;}if(data.type==='engine-log'&&!/taking|completed|tiles|tiling|tile|flash|memory|vram|fallback|budget/i.test(data.message))return;const {video,firstImage,...info}=data;append(info);if(video){urls=[URL.createObjectURL(video),URL.createObjectURL(firstImage),URL.createObjectURL(new Blob([JSON.stringify({runtimeDirectory:${JSON.stringify(runtime.directory)},records},null,2)],{type:'application/json'}))];el('video').src=urls[0];el('first').src=urls[1];const name='Novera-Wan-'+data.width+'x'+data.height+'-'+data.count+'f-'+data.gpuBudgetGiB+'GiB-fa'+Number(data.flashAttention)+'-batch'+Number(data.batchedCfg)+'-f16'+Number(data.expandWeights);el('download').href=urls[0];el('download').download=name+'.webm';el('download').hidden=false;el('receipt').href=urls[2];el('receipt').download=name+'.json';el('receipt').hidden=false;el('status').textContent='Terminé en '+(data.totalMs/1000).toFixed(3)+' s';stop();}else if(data.phase==='error'){el('status').textContent='Échec : '+data.message;stop();}};
const desktop=el('format').value==='desktop';worker.postMessage({runtimeUrl:new URL('../${runtime.directory}/novera-diffusion.mjs',location.href).href,files:Array.from(el('models').files),width:desktop?768:832,height:desktop?432:480,frames:desktop?33:5,fps:desktop?16:8,steps:20,seed:42,gpuBudgetGiB:Number(el('budget').value),flashAttention:el('attention').checked,batchedCfg:el('batch').checked,traceCpu:el('trace').checked,expandWeights:el('expand').checked,prompt:el('prompt').value});};
el('stop').onclick=()=>{stop();el('status').textContent='Arrêté, moteur libéré';};</script></html>`, 'utf8')
console.log('Created verified local diagnostic: /video-performance/')
