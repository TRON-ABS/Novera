#include "ggml.h"
#include "ggml-alloc.h"
#include "ggml-backend.h"
#include "ggml-cpu.h"
#include "ggml-webgpu.h"
#include <emscripten.h>
#include <algorithm>
#include <vector>
#include <cstdio>
#include <cstring>
#include <cmath>
struct Case {int w,h,d,ic,n,kw,kh,kd,s0,s1,s2,p0,p1,p2,d0,d1,d2;bool view;};
extern "C" EMSCRIPTEN_KEEPALIVE int novera_benchmark_attention(int d,int nq,int nk,int heads,int masked) {
 if((d!=64&&d!=128&&d!=512)||nq<1||nq>7040||nk<1||nk>7040||heads<1||heads>4)return 0;
 auto gpu=ggml_backend_webgpu_init();if(!gpu)return 0;
 auto * ctx=ggml_init({1024*1024,nullptr,true});
 auto * q=ggml_new_tensor_4d(ctx,GGML_TYPE_F32,d,nq,heads,1);
 auto * k=ggml_new_tensor_4d(ctx,GGML_TYPE_F16,d,nk,heads,1);
 auto * v=ggml_new_tensor_4d(ctx,GGML_TYPE_F16,d,nk,heads,1);
 auto * mask=masked?ggml_new_tensor_2d(ctx,GGML_TYPE_F16,nk,nq):nullptr;
 const float scale=1.f/std::sqrt(float(d));
 auto * output=ggml_flash_attn_ext(ctx,q,k,v,mask,scale,0,0);
 auto * graph=ggml_new_graph_custom(ctx,32,false);ggml_build_forward_expand(graph,output);
 auto buffer=ggml_backend_alloc_ctx_tensors(ctx,gpu);if(!buffer){ggml_free(ctx);ggml_backend_free(gpu);return 0;}
 std::vector<float> queries(size_t(d)*nq*heads);
 std::vector<ggml_fp16_t> keys(size_t(d)*nk*heads),values(keys.size()),masks(mask?size_t(nk)*nq:0);
 for(size_t i=0;i<queries.size();++i)queries[i]=float(int((i*17+i/11)%197)-98)*0.021f;
 for(size_t i=0;i<keys.size();++i){keys[i]=ggml_fp32_to_fp16(float(int((i*13+i/7)%181)-90)*0.021f);values[i]=ggml_fp32_to_fp16(float(int((i*29+i/13)%163)-81)*0.013f);}
 for(int r=0;mask&&r<nq;++r)for(int c=0;c<nk;++c)masks[size_t(r)*nk+c]=ggml_fp32_to_fp16(c>r?-INFINITY:0.f);
 ggml_backend_tensor_set(q,queries.data(),0,queries.size()*sizeof(float));
 ggml_backend_tensor_set(k,keys.data(),0,keys.size()*sizeof(ggml_fp16_t));ggml_backend_tensor_set(v,values.data(),0,values.size()*sizeof(ggml_fp16_t));
 if(mask)ggml_backend_tensor_set(mask,masks.data(),0,masks.size()*sizeof(ggml_fp16_t));
 bool ok=true;double total_ms=0;
 for(int repeat=-2;repeat<4;++repeat){const int64_t start=ggml_time_us();if(ggml_backend_graph_compute(gpu,graph)!=GGML_STATUS_SUCCESS){ok=false;break;}ggml_backend_synchronize(gpu);const double ms=(ggml_time_us()-start)/1000.;if(repeat>0)total_ms+=ms;fprintf(stderr,"[ATTENTION timing] d=%d nq=%d nk=%d heads=%d mask=%d repeat=%d ms=%.3f\n",d,nq,nk,heads,masked,repeat,ms);}
 std::vector<float> actual(size_t(d)*nq*heads),scores(nk);float maximum=0;
 if(ok){ggml_backend_tensor_get(output,actual.data(),0,actual.size()*sizeof(float));
  for(int sample=0;sample<32;++sample){const int row=sample==0?0:sample==1?nq-1:sample==2?nq/2:(sample*97+sample/3)%nq,head=sample%heads,col=sample==3?d-1:(sample*17+sample/2)%d;float max_score=-INFINITY;
   for(int j=0;j<nk;++j){float dot=0;for(int c=0;c<d;++c)dot+=(queries[(size_t(head)*nq+row)*d+c]*scale)*ggml_fp16_to_fp32(keys[(size_t(head)*nk+j)*d+c]);scores[j]=dot+(mask?ggml_fp16_to_fp32(masks[size_t(row)*nk+j]):0.f);max_score=std::fmax(max_score,scores[j]);}
   double sum=0,weighted=0;for(int j=0;j<nk;++j){const double p=std::exp(double(scores[j]-max_score));sum+=p;weighted+=p*ggml_fp16_to_fp32(values[(size_t(head)*nk+j)*d+col]);}
   const float expected=float(weighted/sum),value=actual[(size_t(row)*heads+head)*d+col],error=std::fabs(value-expected);maximum=std::fmax(maximum,error);if(!std::isfinite(expected)||!std::isfinite(value)||error>0.002f)ok=false;
  }
 }
 uint32_t hash=2166136261u;for(size_t i=0;i<actual.size()*sizeof(float);++i)hash=(hash^reinterpret_cast<unsigned char*>(actual.data())[i])*16777619u;
 fprintf(stderr,"[ATTENTION result] d=%d nq=%d nk=%d heads=%d mask=%d mean_ms=%.3f max_abs=%g hash=%08x passed=%s\n",d,nq,nk,heads,masked,total_ms/3.,maximum,hash,ok?"yes":"NO");
 ggml_backend_buffer_free(buffer);ggml_free(ctx);ggml_backend_free(gpu);return ok?1:0;
}
// Diagnostic only: sample the numerical contract and measure actual dispatches
// for the matrix shapes used by FLUX. Never linked into the production module.
static float half_round(float value) { return ggml_fp16_to_fp32(ggml_fp32_to_fp16(value)); }
// K-quants store half scales and packed 6-bit scale/min pairs. The existing
// WebGPU kernel rounds those products to half before the dot product. A CPU
// dequantize-to-float followed by one final half cast is a different oracle.
static float kquant_half_weight(const unsigned char * row,ggml_type type,int index,bool fused) {
 const int bytes=type==GGML_TYPE_Q4_K?144:176,within=index%256,sub=within/32,pos=within%32;
 const auto * block=row+(index/256)*bytes;
 ggml_fp16_t dh,mh;std::memcpy(&dh,block,2);std::memcpy(&mh,block+2,2);
 const auto * scales=block+4;int scale,minimum;
 if(sub<4){scale=scales[sub]&63;minimum=scales[sub+4]&63;}
 else{scale=(scales[sub+4]&15)|((scales[sub-4]>>6)<<4);minimum=(scales[sub+4]>>4)|((scales[sub]>>6)<<4);}
 const auto * qs=block+(type==GGML_TYPE_Q4_K?16:48);
 int q=(qs[(within/64)*32+pos]>>((sub&1)*4))&15;
 if(type==GGML_TYPE_Q5_K)q|=((block[16+pos]>>sub)&1)<<4;
 const float d=half_round(ggml_fp16_to_fp32(dh)*scale),m=half_round(ggml_fp16_to_fp32(mh)*minimum);
 return fused?half_round(float(q)*d-m):half_round(half_round(float(q)*d)-m);
}
// Q6_K staging multiplies half d by q, rounds, then multiplies signed scale.
static float q6_half_weight(const unsigned char * row,int index) {
 const int within=index%256,chunk=within/128;const auto * block=row+(index/256)*210;
 ggml_fp16_t dh;std::memcpy(&dh,block+208,2);
 const int low=(block[64*chunk+within%64]>>((within%128/64)*4))&15;
 const int high=(block[128+32*chunk+within%32]>>((within%128/32)*2))&3;
 const int q=(low|(high<<4))-32,scale=int(block[192+within/16])<128?int(block[192+within/16]):int(block[192+within/16])-256;
 return half_round(half_round(ggml_fp16_to_fp32(dh)*q)*scale);
}
extern "C" EMSCRIPTEN_KEEPALIVE int novera_benchmark_matmul(int type_code,int k,int m,int n) {
 const auto type=static_cast<ggml_type>(type_code);
 if((type!=GGML_TYPE_F16&&type!=GGML_TYPE_BF16&&type!=GGML_TYPE_Q4_K&&type!=GGML_TYPE_Q5_K&&type!=GGML_TYPE_Q6_K)||
    k<32||k>12288||k%(ggml_is_quantized(type)?256:32)||m<1||m>3072||n<1||n>7040)return 0;
 auto gpu=ggml_backend_webgpu_init();if(!gpu)return 0;
 auto * ctx=ggml_init({1024*1024,nullptr,true});
 auto * weights=ggml_new_tensor_2d(ctx,type,k,m);
 auto * input=ggml_new_tensor_2d(ctx,GGML_TYPE_F32,k,n);
 auto * output=ggml_mul_mat(ctx,weights,input);
 auto * graph=ggml_new_graph_custom(ctx,32,false);ggml_build_forward_expand(graph,output);
 auto buffer=ggml_backend_alloc_ctx_tensors(ctx,gpu);
 if(!buffer){ggml_free(ctx);ggml_backend_free(gpu);return 0;}
 std::vector<float> w(size_t(k)*m),x(size_t(k)*n);
 for(size_t i=0;i<w.size();++i)w[i]=float(int((i*17+i/11)%197)-98)*0.0137f;
 for(size_t i=0;i<x.size();++i)x[i]=float(int((i*13+i/7)%181)-90)*0.0113f;
 std::vector<unsigned char> packed(ggml_nbytes(weights));
 ggml_quantize_chunk(type,w.data(),packed.data(),0,m,k,nullptr);
 ggml_backend_tensor_set(weights,packed.data(),0,packed.size());
 ggml_backend_tensor_set(input,x.data(),0,x.size()*sizeof(float));
 bool ok=true;double total_ms=0;
 for(int repeat=-2;repeat<4;++repeat){
  const int64_t start=ggml_time_us();
  if(ggml_backend_graph_compute(gpu,graph)!=GGML_STATUS_SUCCESS){ok=false;break;}
  ggml_backend_synchronize(gpu);
  const double ms=(ggml_time_us()-start)/1000.;if(repeat>0)total_ms+=ms;
  fprintf(stderr,"[MATMUL timing] type=%d k=%d m=%d n=%d repeat=%d ms=%.3f\n",type_code,k,m,n,repeat,ms);
 }
 std::vector<float> actual(size_t(m)*n),row(k);float maximum=0;
 if(ok){
  ggml_backend_tensor_get(output,actual.data(),0,actual.size()*sizeof(float));
  const auto * traits=ggml_get_type_traits(type);
  for(int sample=0;sample<32;++sample){
   const int r=(sample*97+sample/3)%m,c=(sample*79+sample/2)%n;
   traits->to_float(packed.data()+size_t(r)*ggml_row_size(type,k),row.data(),k);
   float expected=0,separate=0;const auto * packed_row=packed.data()+size_t(r)*ggml_row_size(type,k);
   for(int j=0;j<k;++j){const float input=half_round(x[size_t(c)*k+j]);const bool kquant=type==GGML_TYPE_Q4_K||type==GGML_TYPE_Q5_K;expected+=(kquant?kquant_half_weight(packed_row,type,j,true):(type==GGML_TYPE_Q6_K?q6_half_weight(packed_row,j):half_round(row[j])))*input;separate+=(kquant?kquant_half_weight(packed_row,type,j,false):(type==GGML_TYPE_Q6_K?q6_half_weight(packed_row,j):half_round(row[j])))*input;}
   const float value=actual[size_t(c)*m+r],error=std::fmin(std::fabs(value-expected),std::fabs(value-separate));maximum=std::fmax(maximum,error);
   if(!std::isfinite(expected)||!std::isfinite(value)||error>0.002f+0.0001f*std::fabs(expected))ok=false;
  }
 }
 uint32_t hash=2166136261u;
 for(size_t i=0;i<actual.size()*sizeof(float);++i)hash=(hash^reinterpret_cast<unsigned char*>(actual.data())[i])*16777619u;
 fprintf(stderr,"[MATMUL result] type=%d k=%d m=%d n=%d mean_ms=%.3f max_abs=%g hash=%08x passed=%s\n",type_code,k,m,n,total_ms/3.,maximum,hash,ok?"yes":"NO");
 ggml_backend_buffer_free(buffer);ggml_free(ctx);ggml_backend_free(gpu);return ok?1:0;
}
struct GroupCase { int w, h, channels, batch, groups, offset; bool inplace; };
struct ConvCase { int w,h,ic,oc,n,kw,kh,stride,padding,dilation; bool view,large; };
static std::vector<float> convolution(ggml_backend_t backend,const ConvCase & c,ggml_type type,bool reference=false) {
 auto * ctx=ggml_init({1024*1024,nullptr,true});
 auto * base=ggml_new_tensor_4d(ctx,GGML_TYPE_F32,c.w+(c.view?2:0),c.h+(c.view?1:0),c.ic,c.n);
 auto * input=c.view?ggml_view_4d(ctx,base,c.w,c.h,c.ic,c.n,base->nb[1],base->nb[2],base->nb[3],sizeof(float)):base;
 // The CPU's F16-kernel path stages activations in F16. Compare against its
 // F32 path with identically rounded weights, preserving large F32 inputs.
 auto * weights=ggml_new_tensor_4d(ctx,reference?GGML_TYPE_F32:type,c.kw,c.kh,c.ic,c.oc);
 auto * output=ggml_conv_2d_direct(ctx,weights,input,c.stride,c.stride,c.padding,c.padding,c.dilation,c.dilation);
 auto * graph=ggml_new_graph_custom(ctx,32,false);ggml_build_forward_expand(graph,output);
 auto buffer=ggml_backend_alloc_ctx_tensors(ctx,backend);
 if(!buffer){ggml_free(ctx);return {};}
 std::vector<float> values(ggml_nelements(base)),kernel(ggml_nelements(weights));
 for(size_t i=0;i<values.size();++i)values[i]=float(int(i*17%197)-98)*(c.large?1024.f:0.0137f);
 for(size_t i=0;i<kernel.size();++i)kernel[i]=float(int(i*7%31)-15)*0.007f;
 if(reference&&type==GGML_TYPE_F16)for(float & value:kernel)value=ggml_fp16_to_fp32(ggml_fp32_to_fp16(value));
 ggml_backend_tensor_set(base,values.data(),0,values.size()*sizeof(float));
 if(!reference&&type==GGML_TYPE_F16){std::vector<ggml_fp16_t> half(kernel.size());for(size_t i=0;i<half.size();++i)half[i]=ggml_fp32_to_fp16(kernel[i]);ggml_backend_tensor_set(weights,half.data(),0,half.size()*sizeof(ggml_fp16_t));}
 else ggml_backend_tensor_set(weights,kernel.data(),0,kernel.size()*sizeof(float));
 std::vector<float> result(ggml_nelements(output));
 if(ggml_backend_graph_compute(backend,graph)==GGML_STATUS_SUCCESS)ggml_backend_tensor_get(output,result.data(),0,result.size()*sizeof(float));else result.clear();
 ggml_backend_buffer_free(buffer);ggml_free(ctx);return result;
}
extern "C" EMSCRIPTEN_KEEPALIVE int novera_check_conv2d() {
 auto gpu=ggml_backend_webgpu_init();auto cpu=ggml_backend_cpu_init();if(!gpu||!cpu)return 0;
 ggml_backend_cpu_set_n_threads(cpu,1);
 ConvCase cases[]={{3,5,1,1,1,1,1,1,0,1,false,true},{17,9,3,5,2,3,3,1,1,1,true,false},
                   {9,11,4,7,1,3,3,2,1,1,false,false},{11,9,3,17,1,2,3,1,2,2,true,false},
                   {16,8,32,32,1,3,3,1,1,1,false,false},{7,5,17,3,2,1,1,1,0,1,true,false}};
 int passed=0;
 for(int i=0;i<6;++i)for(auto type:{GGML_TYPE_F16,GGML_TYPE_F32}){
  auto expected=convolution(cpu,cases[i],type,true);auto actual=convolution(gpu,cases[i],type);
  float maximum=0.f;bool same=!expected.empty()&&expected.size()==actual.size();
  for(size_t j=0;same&&j<expected.size();++j){float error=std::fabs(expected[j]-actual[j]);maximum=std::fmax(maximum,error);same=std::isfinite(expected[j])&&std::isfinite(actual[j])&&error<=3e-5f+3e-5f*std::fabs(expected[j]);}
  fprintf(stderr,"[CONV_2D reference] case=%d type=%d values=%zu max_abs=%g passed=%s\n",i,type,expected.size(),maximum,same?"yes":"NO");
  if(same)++passed;
 }
 ggml_backend_free(cpu);ggml_backend_free(gpu);
 return passed==12?passed:0;
}
static std::vector<float> group_norm(ggml_backend_t backend, const GroupCase & c) {
 auto * ctx=ggml_init({1024*1024,nullptr,true});
 const int64_t count=int64_t(c.w)*c.h*c.channels*c.batch;
 auto * base=ggml_new_tensor_1d(ctx,GGML_TYPE_F32,count+c.offset);
 auto * input=ggml_view_4d(ctx,base,c.w,c.h,c.channels,c.batch,
     sizeof(float)*c.w,sizeof(float)*c.w*c.h,sizeof(float)*c.w*c.h*c.channels,sizeof(float)*c.offset);
 auto * output=c.inplace?ggml_group_norm_inplace(ctx,input,c.groups,1e-6f):ggml_group_norm(ctx,input,c.groups,1e-6f);
 auto * graph=ggml_new_graph_custom(ctx,32,false);ggml_build_forward_expand(graph,output);
 auto buffer=ggml_backend_alloc_ctx_tensors(ctx,backend);
 if(!buffer){ggml_free(ctx);return {};}
 std::vector<float> values(count+c.offset);
 for(size_t i=0;i<values.size();++i)values[i]=float(int(i*17%197)-98)*0.137f;
 ggml_backend_tensor_set(base,values.data(),0,values.size()*sizeof(float));
 std::vector<float> result(count);
 if(ggml_backend_graph_compute(backend,graph)==GGML_STATUS_SUCCESS)ggml_backend_tensor_get(output,result.data(),0,result.size()*sizeof(float));else result.clear();
 ggml_backend_buffer_free(buffer);ggml_free(ctx);return result;
}
extern "C" EMSCRIPTEN_KEEPALIVE int novera_check_group_norm() {
 auto gpu=ggml_backend_webgpu_init();auto cpu=ggml_backend_cpu_init();if(!gpu||!cpu)return 0;
 ggml_backend_cpu_set_n_threads(cpu,1);
 GroupCase cases[]={{3,5,8,1,4,0,false},{7,9,16,2,4,1,false},{32,32,128,1,32,0,false},
                    {64,64,128,1,32,1,true},{256,110,128,1,32,0,false},{3,1,4,2,4,1,true}};
 int passed=0;
 for(int i=0;i<6;++i){
  auto expected=group_norm(cpu,cases[i]);auto actual=group_norm(gpu,cases[i]);
  float maximum=0.f;bool same=!expected.empty()&&expected.size()==actual.size();
  for(size_t j=0;same&&j<expected.size();++j){float error=std::fabs(expected[j]-actual[j]);maximum=std::fmax(maximum,error);same=std::isfinite(actual[j])&&error<=3e-5f;}
  fprintf(stderr,"[GROUP_NORM reference] case=%d values=%zu max_abs=%g passed=%s\n",i,expected.size(),maximum,same?"yes":"NO");
  if(same)++passed;
 }
 ggml_backend_free(cpu);ggml_backend_free(gpu);
 return passed==6?passed:0;
}
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

// Resident graph timing and CPU samples for the direct F32 VAE convolution.
extern "C" EMSCRIPTEN_KEEPALIVE int novera_benchmark_conv(int w,int h,int ic,int oc,int kw) {
 if(w<1||w>2048||h<1||h>1024||ic<1||ic>512||oc<1||oc>512||(kw!=1&&kw!=3))return 0;
 if(int64_t(w)*h*std::max(ic,oc)>268435456)return 0;
 auto gpu=ggml_backend_webgpu_init();if(!gpu)return 0;
 auto* ctx=ggml_init({1024*1024,nullptr,true});
 auto* input=ggml_new_tensor_4d(ctx,GGML_TYPE_F32,w,h,ic,1);
 auto* weights=ggml_new_tensor_4d(ctx,GGML_TYPE_F16,kw,kw,ic,oc);
 auto* output=ggml_conv_2d_direct(ctx,weights,input,1,1,kw/2,kw/2,1,1);
 auto* graph=ggml_new_graph_custom(ctx,32,false);ggml_build_forward_expand(graph,output);
 auto buffer=ggml_backend_alloc_ctx_tensors(ctx,gpu);if(!buffer){ggml_free(ctx);ggml_backend_free(gpu);return 0;}
 std::vector<float> values(ggml_nelements(input));std::vector<ggml_fp16_t> kernel(ggml_nelements(weights));
 for(size_t i=0;i<values.size();++i)values[i]=float(int(i*17%197)-98)*0.0137f;
 for(size_t i=0;i<kernel.size();++i)kernel[i]=ggml_fp32_to_fp16(float(int(i*7%31)-15)*0.007f);
 ggml_backend_tensor_set(input,values.data(),0,values.size()*sizeof(float));
 ggml_backend_tensor_set(weights,kernel.data(),0,kernel.size()*sizeof(ggml_fp16_t));
 bool ok=true;std::vector<double> times;
 for(int repeat=0;repeat<6;++repeat){
  const int64_t start=ggml_time_us();if(ggml_backend_graph_compute(gpu,graph)!=GGML_STATUS_SUCCESS){ok=false;break;}
  ggml_backend_synchronize(gpu);const double ms=(ggml_time_us()-start)/1000.;if(repeat)times.push_back(ms);
  fprintf(stderr,"[CONV timing] w=%d h=%d ic=%d oc=%d kw=%d repeat=%d ms=%.3f\n",w,h,ic,oc,kw,repeat,ms);
 }
 std::vector<float> actual(ggml_nelements(output));float maximum=0;
 if(ok){ggml_backend_tensor_get(output,actual.data(),0,actual.size()*sizeof(float));
  for(int sample=0;sample<32;++sample){
   const int x=(sample*17+sample/3)%w,y=(sample*13+sample/2)%h,c=(sample*29)%oc;float expected=0;
   for(int channel=0;channel<ic;++channel)for(int ky=0;ky<kw;++ky)for(int kx=0;kx<kw;++kx){
    const int ix=x+kx-kw/2,iy=y+ky-kw/2;
    if(ix>=0&&iy>=0&&ix<w&&iy<h)expected+=values[(size_t(channel)*h+iy)*w+ix]*ggml_fp16_to_fp32(kernel[((size_t(c)*ic+channel)*kw+ky)*kw+kx]);
   }
   const float value=actual[(size_t(c)*h+y)*w+x],error=std::fabs(value-expected);maximum=std::fmax(maximum,error);
   if(!std::isfinite(value)||!std::isfinite(expected)||error>3e-5f+3e-5f*std::fabs(expected))ok=false;
  }
 }
 uint32_t hash=2166136261u;for(size_t i=0;i<actual.size()*sizeof(float);++i)hash=(hash^reinterpret_cast<unsigned char*>(actual.data())[i])*16777619u;
 std::sort(times.begin(),times.end());const double median=times.empty()?0:times[times.size()/2];
 fprintf(stderr,"[CONV result] w=%d h=%d ic=%d oc=%d kw=%d median_ms=%.3f max_abs=%g hash=%08x passed=%s\n",w,h,ic,oc,kw,median,maximum,hash,ok?"yes":"NO");
 ggml_backend_buffer_free(buffer);ggml_free(ctx);ggml_backend_free(gpu);return ok?1:0;
}

extern "C" EMSCRIPTEN_KEEPALIVE int novera_check_conv_tuning() {
 auto gpu=ggml_backend_webgpu_init();auto cpu=ggml_backend_cpu_init();if(!gpu||!cpu)return 0;
 ggml_backend_cpu_set_n_threads(cpu,1);
 const ConvCase cases[]={{17,9,32,35,2,3,3,1,1,1,true,false},{11,9,64,33,2,3,3,2,2,2,true,false},{7,5,32,33,1,3,3,1,1,1,false,true}};
 int passed=0;
 for(int i=0;i<3;++i)for(auto type:{GGML_TYPE_F16,GGML_TYPE_F32}){
  const auto expected=convolution(cpu,cases[i],type,true),actual=convolution(gpu,cases[i],type);
  float maximum=0;bool ok=!expected.empty()&&expected.size()==actual.size();
  for(size_t j=0;ok&&j<expected.size();++j){const float error=std::fabs(expected[j]-actual[j]);maximum=std::fmax(maximum,error);ok=std::isfinite(expected[j])&&std::isfinite(actual[j])&&error<=3e-5f+3e-5f*std::fabs(expected[j]);}
  fprintf(stderr,"[CONV tuning reference] case=%d type=%d values=%zu max_abs=%g passed=%s\n",i,type,expected.size(),maximum,ok?"yes":"NO");
  if(ok)++passed;
 }
 ggml_backend_free(cpu);ggml_backend_free(gpu);return passed==6?6:0;
}

extern "C" EMSCRIPTEN_KEEPALIVE int novera_check_conv_narrow() {
 auto gpu=ggml_backend_webgpu_init();auto cpu=ggml_backend_cpu_init();if(!gpu||!cpu)return 0;
 ggml_backend_cpu_set_n_threads(cpu,1);
 const ConvCase cases[]={{17,9,32,3,2,3,3,1,1,1,true,false},{11,9,64,1,2,3,3,2,2,2,true,false},{7,5,32,4,1,3,3,1,1,1,false,true},{13,7,33,2,1,3,3,1,1,1,true,false}};
 int passed=0;
 for(int i=0;i<4;++i)for(auto type:{GGML_TYPE_F16,GGML_TYPE_F32}){
  const auto expected=convolution(cpu,cases[i],type,true),actual=convolution(gpu,cases[i],type);
  float maximum=0;bool ok=!expected.empty()&&expected.size()==actual.size();
  for(size_t j=0;ok&&j<expected.size();++j){const float error=std::fabs(expected[j]-actual[j]);maximum=std::fmax(maximum,error);ok=std::isfinite(expected[j])&&std::isfinite(actual[j])&&error<=3e-5f+3e-5f*std::fabs(expected[j]);}
  fprintf(stderr,"[CONV narrow reference] case=%d type=%d values=%zu max_abs=%g passed=%s\n",i,type,expected.size(),maximum,ok?"yes":"NO");
  if(ok)++passed;
 }
 ggml_backend_free(cpu);ggml_backend_free(gpu);return passed==8?8:0;
}
