// Optional local diagnostic UI: exercise the real packaged worker without
// loading FLUX first. Never included by the normal browser build.
import { readdir, writeFile, mkdir, copyFile } from 'node:fs/promises'
import path from 'node:path'
const dist = path.resolve(process.argv[2] ?? 'web-app/dist')
const assets = await readdir(path.join(dist, 'assets'))
const workers = assets.filter(name => /^local-media\.worker-[\w-]+\.js$/.test(name))
const runtimes = []
for (const name of await readdir(path.join(dist, 'novera-runtime'))) {
  if (/^[a-f0-9]{64}$/.test(name) && (await readdir(path.join(dist, 'novera-runtime', name))).includes('novera-diffusion.mjs')) runtimes.push(name)
}
if (workers.length !== 1 || runtimes.length !== 1) throw new Error('Build one verified image runtime before creating this diagnostic page.')
const workerUrl = `./assets/${workers[0]}`
const runtimeUrl = `./novera-runtime/${runtimes[0]}/novera-diffusion.mjs`
await writeFile(path.join(dist, 'upscale-probe.html'), `<!doctype html><html lang="fr"><meta charset="utf-8"><title>Novera · diagnostic Real-ESRGAN</title>
<style>body{background:#0a111e;color:#e5e7eb;font:16px system-ui;max-width:1100px;margin:30px auto;padding:20px}label{display:block;margin:20px 0}button,input{font:inherit}button{background:#162644;color:white;border:1px solid #36c5ef;border-radius:8px;padding:10px;margin:8px}img{max-width:100%;display:block}pre{white-space:pre-wrap;overflow-wrap:anywhere}</style>
<h1>Novera · diagnostic local Real-ESRGAN ×2</h1><p>Essai du véritable worker packagé. Les fichiers restent sur cet appareil. Ce diagnostic séparé ne mesure pas la génération FLUX.</p>
<label>Image source PNG<input id="source" type="file" accept="image/png"></label><label>Modèle RealESRGAN_x2plus.pth<input id="model" type="file" accept=".pth"></label>
<label>Taille des tuiles<select id="tile"><option value="128">128 pixels</option><option value="256">256 pixels</option><option value="512">512 pixels</option></select></label>
<button id="run">Tester ×2</button><button id="stop" disabled>Arrêter</button><p id="status" role="status">Choisissez une image et le modèle officiel.</p><pre id="details"></pre><img id="result" alt="Résultat Real-ESRGAN ×2" hidden><a id="download" hidden>Télécharger le résultat</a>
<script type="module">
const byId=id=>document.getElementById(id);let job,started,url;
const finish=()=>{job?.terminate();job=undefined;byId('run').disabled=false;byId('stop').disabled=true};
byId('stop').onclick=()=>{finish();byId('status').textContent='Essai annulé.'};
byId('run').onclick=async()=>{try{
  const inputImage=byId('source').files[0],upscaleFile=byId('model').files[0];
  const tile=Number(byId('tile').value);
  if(!inputImage||!upscaleFile)throw Error('Sélectionnez les deux fichiers.');
  const bitmap=await createImageBitmap(inputImage);
  const width=bitmap.width,height=bitmap.height;bitmap.close();
  byId('result').hidden=true;byId('download').hidden=true;byId('details').textContent='';
  byId('status').textContent='Calcul ×2 en cours · '+width+' × '+height+' · tuiles '+tile;
  byId('run').disabled=true;byId('stop').disabled=false;started=performance.now();
  job=new Worker(new URL(${JSON.stringify(workerUrl)},location.href),{type:'module'});
  job.onerror=()=>{byId('status').textContent='Worker interrompu';finish()};
  job.onmessage=({data})=>{
    if(data.type==='engine-log'||data.type==='engine-stderr')byId('details').textContent=(byId('details').textContent+'\\n'+(data.message??'')).slice(-18000);
    else if(data.type==='error'){byId('status').textContent='Échec : '+data.message;byId('details').textContent+='\\n'+(data.diagnostic??'');finish()}
    else if(data.type==='complete'){
      const seconds=(performance.now()-started)/1000;
      if(url)URL.revokeObjectURL(url);url=URL.createObjectURL(data.image);
      byId('result').src=url;byId('result').hidden=false;
      byId('download').href=url;byId('download').download='Novera-RealESRGAN-x2-tile'+tile+'.png';byId('download').hidden=false;
      byId('status').textContent='Terminé · '+seconds.toFixed(3)+' s · sortie attendue '+width*2+' × '+height*2+' · tuiles '+data.timings.upscaleTilePixels;finish()
    }
  };
  job.postMessage({runtimeUrl:new URL(${JSON.stringify(runtimeUrl)},location.href).href,files:[upscaleFile],upscaleFile,upscaleOnly:true,inputImage,width,height,steps:4,gpuBudgetGiB:6,upscaleTilePixels:tile,seed:42,prompt:''})
}catch(error){byId('status').textContent=String(error);finish()}};
</script></html>`, 'utf8')
console.log('Created local diagnostic: /upscale-probe.html')
if (process.argv[3]) {
  const build = path.resolve(process.argv[3])
  const output = path.join(dist, 'numerical-probe')
  await mkdir(output, { recursive: true })
  for (const suffix of ['mjs', 'wasm']) await copyFile(path.join(build, `novera-im2col-check.${suffix}`), path.join(output, `novera-im2col-check.${suffix}`))
  await writeFile(path.join(output, 'runner.js'), `import createRuntime from './novera-im2col-check.mjs';
self.onmessage=async({data})=>{try{const name={im2col:'novera_check_im2col',activation:'novera_check_leaky_relu'}[data.check];if(!name)throw Error('Unknown check');const runtime=await createRuntime({print:()=>{},printErr:message=>self.postMessage({log:String(message)}),onAbort:reason=>self.postMessage({error:String(reason)})});const result=await runtime.ccall(name,'number',[],[],{async:true});self.postMessage({complete:true,result})}catch(error){self.postMessage({error:String(error)})}};`, 'utf8')
  await writeFile(path.join(dist, 'numerical-probe.html'), `<!doctype html><html lang="fr"><meta charset="utf-8"><title>Novera · contrôles numériques GPU</title><h1>Novera · contrôles numériques CPU / GPU</h1><button id="run">Contrôler les calculs GPU</button><p id="status" role="status">Prêt</p><pre id="log"></pre><script type="module">
const check=name=>new Promise((resolve,reject)=>{const worker=new Worker('./numerical-probe/runner.js',{type:'module'});worker.onmessage=({data})=>{if(data.log)document.getElementById('log').textContent+=data.log+'\\n';if(data.complete||data.error){worker.terminate();data.error?reject(Error(data.error)):resolve(data.result)}};worker.onerror=()=>{worker.terminate();reject(Error('Worker interrompu'))};worker.postMessage({check:name})});
document.getElementById('run').onclick=async()=>{document.getElementById('run').disabled=true;document.getElementById('status').textContent='Calcul en cours';try{const im2col=await check('im2col');const activation=await check('activation');document.getElementById('status').textContent='IM2COL : '+im2col+'/12 ; Leaky-ReLU : '+activation+'/6'}catch(error){document.getElementById('status').textContent='Échec : '+error}finally{document.getElementById('run').disabled=false}};</script></html>`, 'utf8')
  console.log('Created local diagnostic: /numerical-probe.html')
}
