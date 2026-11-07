#include "pipeline-lm.h"
#include "pipeline-synth.h"
#include "model-store.h"
#include "backend.h"
#include "gguf-weights.h"
#include <emscripten.h>
#include <cstdint>
#include <algorithm>
#include <vector>
#include <cmath>
#include <cstring>
static ModelStore* store=nullptr;
static AceLm* planner=nullptr;
static AceSynth* synth=nullptr;
static AceSynthJob* job=nullptr;
static AceAudio output={};
EM_JS(void, music_plan, (const char* value), {self.postMessage({phase:"planned-metadata",value:UTF8ToString(Number(value))});});
EM_JS(void, music_stage, (const char* value), {self.postMessage({phase:UTF8ToString(Number(value))});});
EM_JS(void, music_timing, (const char* phase, double milliseconds), {self.postMessage({type:"music-timing",phase:UTF8ToString(Number(phase)),milliseconds});});
extern "C" {
EMSCRIPTEN_KEEPALIVE void novera_music_release(){
 ace_audio_free(&output);output={};
 if(job)ace_synth_job_free(job);job=nullptr;
 if(synth)ace_synth_free(synth);synth=nullptr;
 if(planner)ace_lm_free(planner);planner=nullptr;
 if(store)store_free(store);store=nullptr;
 novera_gf_cache_reset();
}
EMSCRIPTEN_KEEPALIVE int novera_music_generate(const char* lm,const char* dit,const char* encoder,const char* vae,const char* prompt,const char* lyrics,const char* language,int seconds,uint32_t seed){
 if(!lm||!dit||!encoder||!vae||!prompt||!lyrics||!language||seconds<10||seconds>30)return 0;
 if(std::strlen(prompt)>512||std::strlen(lyrics)>512||std::strlen(language)>32)return 0;
 novera_music_release();
 novera_gf_cache_reset(dit);
 if(!backend_set_device("WebGPU"))return 0;
 store=store_create(EVICT_STRICT);
 AceRequest request;request_init(&request);request.caption=prompt;request.use_cot_caption=false;request.lyrics=lyrics;request.vocal_language=language;request.duration=seconds;request.seed=seed;request.lm_seed=seed;request.inference_steps=8;request.lm_batch_size=1;request.synth_batch_size=1;
 AceLmParams lp;ace_lm_default_params(&lp);lp.model_path=lm;lp.max_batch=1;lp.max_seq=2048;lp.use_fa=false;
 double phase_started=emscripten_get_now();
 music_stage("planner-loading");planner=ace_lm_load(store,&lp);if(!planner)return 0;
 music_timing("plannerLoadMs",emscripten_get_now()-phase_started);phase_started=emscripten_get_now();
 AceRequest planned;request_init(&planned);music_stage("planning");
 if(ace_lm_generate(planner,&request,1,&planned,nullptr,nullptr)!=0)return 0;
 music_timing("planningMs",emscripten_get_now()-phase_started);phase_started=emscripten_get_now();
 music_plan(request_to_json(&planned, false).c_str());
 ace_lm_free(planner);planner=nullptr;
 music_timing("plannerReleaseMs",emscripten_get_now()-phase_started);phase_started=emscripten_get_now();
 planned.lyrics=request.lyrics;planned.vocal_language=request.vocal_language;planned.duration=seconds;planned.seed=seed;planned.lm_seed=seed;planned.inference_steps=8;planned.lm_batch_size=1;planned.synth_batch_size=1;
 AceSynthParams sp;ace_synth_default_params(&sp);sp.dit_path=dit;sp.text_encoder_path=encoder;sp.vae_path=vae;sp.vae_chunk=256;sp.vae_overlap=32;
 music_stage("synth-loading");synth=ace_synth_load(store,&sp);if(!synth)return 0;
 music_timing("synthLoadMs",emscripten_get_now()-phase_started);phase_started=emscripten_get_now();
 music_stage("synthesizing");job=ace_synth_job_run_dit(synth,&planned,nullptr,0,nullptr,0,nullptr,0,nullptr,0,1);if(!job)return 0;
 music_timing("synthesisMs",emscripten_get_now()-phase_started);phase_started=emscripten_get_now();
 music_stage("decoding");if(ace_synth_job_run_vae(synth,job,&output)!=0)return 0;
 music_timing("audioDecodeMs",emscripten_get_now()-phase_started);phase_started=emscripten_get_now();
 if(!output.samples||output.n_samples<1||output.sample_rate!=48000)return 0;
 // Match Desktop's 99.999th-percentile normalization before export.
 const size_t size=static_cast<size_t>(output.n_samples)*2;
 std::vector<float> magnitudes(size);
 for(size_t i=0;i<size;++i){if(!std::isfinite(output.samples[i]))return 0;magnitudes[i]=std::abs(output.samples[i]);}
 const size_t index=static_cast<size_t>(static_cast<double>(size-1)*0.99999);
 std::nth_element(magnitudes.begin(),magnitudes.begin()+index,magnitudes.end());
 const float reference=magnitudes[index];
 if(reference>=1e-6f){const float gain=1.0f/reference;for(size_t i=0;i<size;++i)output.samples[i]=std::max(-1.0f,std::min(1.0f,output.samples[i]*gain));}
 music_timing("normalizationMs",emscripten_get_now()-phase_started);
 return 1;
}
EMSCRIPTEN_KEEPALIVE uintptr_t novera_music_samples(){return reinterpret_cast<uintptr_t>(output.samples);}
EMSCRIPTEN_KEEPALIVE int novera_music_length(){return output.n_samples;}
EMSCRIPTEN_KEEPALIVE int novera_music_rate(){return output.sample_rate;}
}
