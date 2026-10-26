#include "policy.h"
#include <cassert>
#include <iostream>
using namespace novera_image;
int main(){
 const std::vector<VulkanDevice> vk{{L"vulkan0",L"Intel"},{L"vulkan1",L"NVIDIA GeForce"}};
 for(int cc:{50,52,53,60,61,62,70,72}) {auto choice=choose({{0,cc}},vk);assert(choice.family==L"vulkan"&&choice.token==L"vulkan1");}
 for(int cc:{75,80,86,89,90,100,103,120,121}) {auto choice=choose({{0,cc}},vk);assert(choice.family==L"cuda"&&choice.token==L"cuda0");}
 assert(choose({{0,61},{1,120}},vk).token==L"cuda1");
 assert(choose({{0,120}},vk,true).family==L"vulkan");
 assert(choose({},{}).family==L"cpu");
 assert(choose({{0,70}},{}).family==L"cpu");
 assert(choose({},{{L"vulkan2",L"AMD"}}).token==L"vulkan2");
 std::map<std::wstring,std::wstring> parts{{L"diffusion",L"auto"},{L"te",L"auto"},{L"vae",L"auto"}};
 backend_request(L"diffusion=cuda0,vae=cuda0,te=cpu",parts);assert(parts[L"te"]==L"cpu"&&parts[L"diffusion"]==L"cuda0");
 backend_request(L"cpu",parts);assert(parts[L"te"]==L"cpu"&&parts[L"vae"]==L"cpu");
 bool rejected=false;try {backend_request(L"unexpected=gpu",parts);}catch(...){rejected=true;}assert(rejected);
 assert(quote(L"a b")==L"\"a b\"");
 assert(quote(L"end\\")==L"\"end\\\\\"");
 assert(quote(L"a\"b")==L"\"a\\\"b\"");
 std::cout<<"Routing, independent CPU placement and argument quoting checks passed"<<std::endl;
}
