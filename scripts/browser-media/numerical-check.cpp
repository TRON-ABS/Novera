#include "ggml.h"
#include "ggml-alloc.h"
#include "ggml-backend.h"
#include "ggml-cpu.h"
#include "ggml-webgpu.h"
#include <emscripten.h>
#include <vector>
#include <cstdio>
#include <cstring>
#include <cmath>
struct Case {int w,h,d,ic,n,kw,kh,kd,s0,s1,s2,p0,p1,p2,d0,d1,d2;bool view;};
static std::vector<unsigned char> run(ggml_backend_t backend,const Case & c,ggml_type type){
 auto * ctx=ggml_init({1024*1024,nullptr,true});
 auto * base=ggml_new_tensor_4d(ctx,GGML_TYPE_F32,c.w+(c.view?2:0),c.h+(c.view?1:0),c.d+(c.view?1:0),c.ic*c.n);
 auto * input=c.view?ggml_view_4d(ctx,base,c.w,c.h,c.d,c.ic*c.n,base->nb[1],base->nb[2],base->nb[3],sizeof(float)):base;
 auto * kernel=ggml_new_tensor_4d(ctx,GGML_TYPE_F16,c.kw,c.kh,c.kd,c.ic);
 auto * output=ggml_im2col_3d(ctx,kernel,input,c.ic,c.s0,c.s1,c.s2,c.p0,c.p1,c.p2,c.d0,c.d1,c.d2,type);
 auto * graph=ggml_new_graph_custom(ctx,32,false);ggml_build_forward_expand(graph,output);
 auto buffer=ggml_backend_alloc_ctx_tensors(ctx,backend);
 if(!buffer){ggml_free(ctx);return {};}
 std::vector<float> values(ggml_nelements(base));
 for(size_t i=0;i<values.size();++i)values[i]=static_cast<float>((static_cast<int>(i*17%197)-98)*0.137);
 ggml_backend_tensor_set(base,values.data(),0,values.size()*sizeof(float));
 std::vector<unsigned char> result(ggml_nbytes(output));
 if(ggml_backend_graph_compute(backend,graph)==GGML_STATUS_SUCCESS)ggml_backend_tensor_get(output,result.data(),0,result.size());else result.clear();
 ggml_backend_buffer_free(buffer);ggml_free(ctx);return result;
}
extern "C" EMSCRIPTEN_KEEPALIVE int novera_check_im2col(){
 auto gpu=ggml_backend_webgpu_init();auto cpu=ggml_backend_cpu_init();if(!gpu||!cpu)return 0;
 ggml_backend_cpu_set_n_threads(cpu,1);
 Case cases[]={
 {3,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,false},
 {3,2,2,1,1,1,1,1,1,1,1,0,0,0,1,1,1,true},
 {5,4,3,2,2,3,2,2,1,2,1,1,1,1,1,2,1,false},
 {5,4,3,2,2,3,2,2,1,2,1,1,1,1,1,2,1,true},
 {3,3,3,3,1,2,2,2,2,1,2,1,0,1,2,1,1,true},
 {5,3,2,1,2,3,1,1,1,1,1,1,0,0,2,1,1,true}};
 int passed=0;bool ok=true;
 for(int i=0;i<6;++i)for(auto type:{GGML_TYPE_F16,GGML_TYPE_F32}){
  auto expected=run(cpu,cases[i],type);auto actual=run(gpu,cases[i],type);
  bool same=!expected.empty()&&expected==actual;
  fprintf(stderr,"[IM2COL_3D reference] case=%d type=%d bytes=%zu exact=%s\n",i,type,expected.size(),same?"yes":"NO");
  if(same)++passed;else ok=false;
 }
 ggml_backend_free(cpu);ggml_backend_free(gpu);
 fprintf(stderr,"[IM2COL_3D reference] passed=%d/12\n",passed);return ok?passed:0;
}

struct ActivationCase { int w, h; bool view, inplace; float slope; };
static std::vector<unsigned char> activation(ggml_backend_t backend, const ActivationCase& c) {
 auto* ctx = ggml_init({1024*1024, nullptr, true});
 auto* base = ggml_new_tensor_2d(ctx, GGML_TYPE_F32, c.w + (c.view ? 2 : 0), c.h);
 auto* input = c.view ? ggml_view_2d(ctx, base, c.w, c.h, base->nb[1], sizeof(float)) : base;
 auto* output = ggml_leaky_relu(ctx, input, c.slope, c.inplace);
 auto* graph = ggml_new_graph_custom(ctx, 32, false);
 ggml_build_forward_expand(graph, output);
 if (!ggml_backend_supports_op(backend, output)) { ggml_free(ctx); return {}; }
 auto buffer = ggml_backend_alloc_ctx_tensors(ctx, backend);
 if (!buffer) { ggml_free(ctx); return {}; }
 std::vector<float> values(ggml_nelements(base));
 for (size_t i=0; i<values.size(); ++i) values[i]=(static_cast<int>(i*17%197)-98)*0.125f;
 const float special[] = {0.f, -0.f, 1.e-30f, -1.e-30f, 100000.f, -100000.f, 1.e30f, -1.e30f};
 for (size_t i=0; i<values.size() && i<8; ++i) values[i]=special[i];
 ggml_backend_tensor_set(base, values.data(), 0, values.size()*sizeof(float));
 std::vector<unsigned char> result(c.w*c.h*sizeof(float));
 if (ggml_backend_graph_compute(backend,graph)==GGML_STATUS_SUCCESS) {
  // Read logical rows: an in-place offset view retains padded row strides.
  for (int row=0; row<c.h; ++row) ggml_backend_tensor_get(output,result.data()+row*c.w*sizeof(float),row*output->nb[1],c.w*sizeof(float));
 } else result.clear();
 ggml_backend_buffer_free(buffer); ggml_free(ctx); return result;
}
extern "C" EMSCRIPTEN_KEEPALIVE int novera_check_leaky_relu() {
 auto gpu=ggml_backend_webgpu_init(); auto cpu=ggml_backend_cpu_init(); if(!gpu||!cpu)return 0;
 ggml_backend_cpu_set_n_threads(cpu,1);
 const ActivationCase cases[] = {{1,1,false,false,.2f},{7,3,false,true,.2f},{17,5,true,false,.2f},{17,5,true,true,.01f},{1027,3,false,false,0.f},{35,7,true,false,-.3f}};
 int passed=0;
 for (int i=0;i<6;++i) {
  const auto expected=activation(cpu,cases[i]), actual=activation(gpu,cases[i]);
  bool same=!expected.empty()&&expected.size()==actual.size();
  for(size_t offset=0;same&&offset<actual.size();offset+=sizeof(float)) {
   float a,b; std::memcpy(&a,actual.data()+offset,sizeof(float)); std::memcpy(&b,expected.data()+offset,sizeof(float));
   same=std::isfinite(a)&&std::isfinite(b)&&a==b;
  }
  if(same)++passed;
  std::fprintf(stderr,"[Leaky-ReLU reference] case=%d exact-finite-values=%s\n",i,same?"yes":"NO");
 }
 ggml_backend_free(cpu);ggml_backend_free(gpu);return passed;
}
