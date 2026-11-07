#include "ggml.h"
#include "ggml-backend.h"
#include "ggml-cpu.h"
#include "ggml-webgpu.h"
#include <emscripten.h>
#include <cstdio>
#include <vector>
struct Case { int time, channels, kernel, stride, padding; bool offset; };
static std::vector<float> run(ggml_backend_t backend, const Case& c) {
 auto* ctx=ggml_init({1024*1024,nullptr,true});
 const int count=c.channels*c.kernel*c.time;
 auto* base=ggml_new_tensor_1d(ctx,GGML_TYPE_F32,count+(c.offset?3:0));
 auto* input=ggml_view_2d(ctx,base,c.channels*c.kernel,c.time,c.channels*c.kernel*sizeof(float),(c.offset?3:0)*sizeof(float));
 auto* output=ggml_col2im_1d(ctx,input,c.stride,c.channels,c.padding);
 if(!ggml_backend_supports_op(backend,output)){ggml_free(ctx);return {};}
 auto* graph=ggml_new_graph_custom(ctx,32,false);ggml_build_forward_expand(graph,output);
 auto buffer=ggml_backend_alloc_ctx_tensors(ctx,backend);
 if(!buffer){ggml_free(ctx);return {};}
 std::vector<float> values(ggml_nelements(base));
 // Exact powers of two make arithmetic-order differences detectable without
 // relaxed error tolerances; include negatives and values exceeding F16 range.
 for(size_t i=0;i<values.size();++i)values[i]=float(int(i*17%197)-98)*(i%131==0?1024.f:.125f);
 ggml_backend_tensor_set(base,values.data(),0,values.size()*sizeof(float));
 std::vector<float> result(ggml_nelements(output));
 if(ggml_backend_graph_compute(backend,graph)==GGML_STATUS_SUCCESS)ggml_backend_tensor_get(output,result.data(),0,result.size()*sizeof(float));else result.clear();
 ggml_backend_buffer_free(buffer);ggml_free(ctx);return result;
}
extern "C" EMSCRIPTEN_KEEPALIVE int novera_check_col2im(){
 auto gpu=ggml_backend_webgpu_init();auto cpu=ggml_backend_cpu_init();if(!gpu||!cpu)return 0;
 ggml_backend_cpu_set_n_threads(cpu,1);
 const Case cases[]={{1,1,1,1,0,false},{3,2,4,2,1,true},{7,3,5,3,2,false},{9,1,2,4,0,true},
  {236,1024,20,10,5,false},{37,512,12,6,3,true},{49,256,8,4,2,false},{91,128,8,4,2,true},
  {129,128,4,2,1,false},{11,7,7,1,3,true},{40000,3,4,2,1,true},{35000,64,4,2,1,false}};
 int passed=0;
 for(int i=0;i<12;++i){auto expected=run(cpu,cases[i]);auto actual=run(gpu,cases[i]);bool same=!expected.empty()&&expected==actual;
  fprintf(stderr,"[COL2IM_1D reference] case=%d samples=%zu exact=%s\n",i,expected.size(),same?"yes":"NO");if(same)++passed;}
 // Never advertise unsupported precision or strided layouts to the scheduler.
 auto* ctx=ggml_init({1024*1024,nullptr,true});auto* half=ggml_new_tensor_2d(ctx,GGML_TYPE_F16,8,7);
 auto* half_out=ggml_col2im_1d(ctx,half,2,2,1);bool half_rejected=!ggml_backend_supports_op(gpu,half_out);
 auto* base=ggml_new_tensor_2d(ctx,GGML_TYPE_F32,10,7);auto* strided=ggml_view_2d(ctx,base,8,7,base->nb[1],0);
 // The public constructor itself rejects strided sources. Replace only the
 // metadata pointer after constructing a valid node to test the backend guard.
 auto* contiguous=ggml_new_tensor_2d(ctx,GGML_TYPE_F32,8,7);
 auto* strided_out=ggml_col2im_1d(ctx,contiguous,2,2,1);strided_out->src[0]=strided;
 bool strided_rejected=!ggml_backend_supports_op(gpu,strided_out);
 ggml_free(ctx);ggml_backend_free(cpu);ggml_backend_free(gpu);
 fprintf(stderr,"[COL2IM_1D reference] passed=%d/12 halfRejected=%d stridedRejected=%d\n",passed,half_rejected,strided_rejected);
 return passed==12&&half_rejected&&strided_rejected?14:0;
}
