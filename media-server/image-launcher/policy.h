// Novera image engine policy. CUDA 13.x excludes SM below 7.5.
#pragma once
#include <string>
#include <vector>
#include <map>
#include <stdexcept>
namespace novera_image {
struct CudaDevice { int ordinal; int capability; };
struct VulkanDevice { std::wstring token; std::wstring name; };
struct Choice { std::wstring family; std::wstring token; };
inline Choice choose(const std::vector<CudaDevice>& cuda, const std::vector<VulkanDevice>& vulkan, bool force_vulkan=false) {
    if (!force_vulkan) for (const auto& gpu:cuda) if(gpu.capability>=75) return {L"cuda",L"cuda"+std::to_wstring(gpu.ordinal)};
    for (const auto& gpu:vulkan) if(gpu.name.find(L"NVIDIA")!=std::wstring::npos) return {L"vulkan",gpu.token};
    if(!vulkan.empty()) return {L"vulkan",vulkan.front().token};
    return {L"cpu",L"cpu"};
}
inline std::wstring quote(const std::wstring& arg) {
    std::wstring out=L"\"";size_t slashes=0;
    for(wchar_t c:arg) {
        if(c==L'\\') {++slashes;continue;}
        if(c==L'\"') {out.append(slashes*2+1,L'\\');out+=c;}
        else {out.append(slashes,L'\\');out+=c;}
        slashes=0;
    }
    out.append(slashes*2,L'\\');return out+L"\"";
}
inline void backend_request(const std::wstring& text,std::map<std::wstring,std::wstring>& modules) {
    if(text.empty())throw std::runtime_error("Missing --backend value");
    size_t pos=0;
    do {
        size_t end=text.find(L',',pos);auto part=text.substr(pos,end==std::wstring::npos?end:end-pos);
        auto eq=part.find(L'=');
        if(eq==std::wstring::npos)for(auto& module:modules)module.second=part;
        else {
            auto key=part.substr(0,eq);if(key==L"clip")key=L"te";
            if(!modules.count(key))throw std::runtime_error("Unsupported component backend assignment");
            modules[key]=part.substr(eq+1);
        }
        if(end==std::wstring::npos)break;pos=end+1;
    }while(pos<text.size());
}
}
