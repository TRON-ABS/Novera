// Local Windows launcher for separate CUDA 13.4 and Vulkan sd.cpp runtimes.
// Model files are passed through unchanged. No shell or global environment edits.
#define WIN32_LEAN_AND_MEAN
#define NOMINMAX
#include <windows.h>
#include <cuda_runtime_api.h>
#include <tlhelp32.h>
#include <thread>
#include <cwctype>
#include <filesystem>
#include <iostream>
#include <sstream>
#include <algorithm>
#include "policy.h"
namespace fs=std::filesystem;
using namespace novera_image;
struct Handle {
    HANDLE value=nullptr;
    Handle()=default;explicit Handle(HANDLE h):value(h){}
    ~Handle(){if(value&&value!=INVALID_HANDLE_VALUE)CloseHandle(value);}
    Handle(const Handle&)=delete;Handle& operator=(const Handle&)=delete;
};
struct Result {DWORD exit=1;std::string output;};
std::wstring wide(const std::string& text) {
    if(text.empty())return {};
    int n=MultiByteToWideChar(CP_UTF8,0,text.data(),static_cast<int>(text.size()),nullptr,0);
    std::wstring out(n,L'\0');MultiByteToWideChar(CP_UTF8,0,text.data(),static_cast<int>(text.size()),out.data(),n);return out;
}
Result run(const fs::path& executable,const std::vector<std::wstring>& args,bool capture,DWORD timeout=INFINITE) {
    if(!fs::is_regular_file(executable))throw std::runtime_error("Required image engine executable is missing");
    std::wstring command=quote(executable.wstring());for(const auto& arg:args)command+=L" "+quote(arg);
    Handle job(CreateJobObjectW(nullptr,nullptr));if(!job.value)throw std::runtime_error("Cannot create engine process job");
    JOBOBJECT_EXTENDED_LIMIT_INFORMATION limit{};limit.BasicLimitInformation.LimitFlags=JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE;
    if(!SetInformationJobObject(job.value,JobObjectExtendedLimitInformation,&limit,sizeof(limit)))throw std::runtime_error("Cannot secure engine process lifetime");
    SECURITY_ATTRIBUTES sa{sizeof(sa),nullptr,TRUE};Handle read,write;
    if(capture) {if(!CreatePipe(&read.value,&write.value,&sa,0))throw std::runtime_error("Cannot create probe pipe");SetHandleInformation(read.value,HANDLE_FLAG_INHERIT,0);}
    STARTUPINFOW startup{};startup.cb=sizeof(startup);startup.dwFlags=STARTF_USESTDHANDLES;
    startup.hStdInput=GetStdHandle(STD_INPUT_HANDLE);
    startup.hStdOutput=capture?write.value:GetStdHandle(STD_OUTPUT_HANDLE);
    startup.hStdError=capture?write.value:GetStdHandle(STD_ERROR_HANDLE);
    for(HANDLE h:{startup.hStdInput,startup.hStdOutput,startup.hStdError})if(h&&h!=INVALID_HANDLE_VALUE)SetHandleInformation(h,HANDLE_FLAG_INHERIT,HANDLE_FLAG_INHERIT);
    PROCESS_INFORMATION pi{};
    if(!CreateProcessW(executable.c_str(),command.data(),nullptr,nullptr,TRUE,CREATE_SUSPENDED|CREATE_NO_WINDOW,nullptr,executable.parent_path().c_str(),&startup,&pi))throw std::runtime_error("Cannot start image engine (check runtime DLLs)");
    Handle process(pi.hProcess),thread(pi.hThread);
    if(!AssignProcessToJobObject(job.value,process.value)){TerminateProcess(process.value,1);throw std::runtime_error("Cannot attach engine to cancellation job");}
    if(ResumeThread(thread.value)==static_cast<DWORD>(-1))throw std::runtime_error("Cannot resume image engine");
    if(write.value){CloseHandle(write.value);write.value=nullptr;}
    const ULONGLONG start=GetTickCount64();Result result;
    for(;;) {
        if(capture) {
            DWORD available=0;
            while(PeekNamedPipe(read.value,nullptr,0,nullptr,&available,nullptr)&&available) {
                char buffer[4096];DWORD received=0;
                if(!ReadFile(read.value,buffer,std::min<DWORD>(available,sizeof(buffer)),&received,nullptr))break;
                result.output.append(buffer,received);
                if(result.output.size()>1024*1024)throw std::runtime_error("Engine probe output limit exceeded");
            }
        }
        DWORD state=WaitForSingleObject(process.value,capture?25:100);
        if(state==WAIT_OBJECT_0) {
            if(capture) {DWORD available=0;if(PeekNamedPipe(read.value,nullptr,0,nullptr,&available,nullptr)&&available)continue;}
            GetExitCodeProcess(process.value,&result.exit);return result;
        }
        if(state==WAIT_FAILED)throw std::runtime_error("Cannot wait for image engine");
        if(timeout!=INFINITE&&GetTickCount64()-start>timeout)throw std::runtime_error("Engine probe timed out");
    }
}
std::vector<CudaDevice> cuda_devices(const fs::path& root) {
    auto library=root/L"cuda"/L"cudart64_13.dll";
    HMODULE dll=LoadLibraryExW(library.c_str(),nullptr,LOAD_LIBRARY_SEARCH_DLL_LOAD_DIR|LOAD_LIBRARY_SEARCH_DEFAULT_DIRS);
    if(!dll)return {};
    using Count=cudaError_t(__stdcall*)(int*);
    using Attribute=cudaError_t(__stdcall*)(int*,cudaDeviceAttr,int);
    auto driver_version=reinterpret_cast<Count>(GetProcAddress(dll,"cudaDriverGetVersion"));
    auto runtime_version=reinterpret_cast<Count>(GetProcAddress(dll,"cudaRuntimeGetVersion"));
    auto count=reinterpret_cast<Count>(GetProcAddress(dll,"cudaGetDeviceCount"));
    auto attribute=reinterpret_cast<Attribute>(GetProcAddress(dll,"cudaDeviceGetAttribute"));
    std::vector<CudaDevice> devices;int n=0,driver=0,runtime=0;
    if(driver_version&&runtime_version&&driver_version(&driver)==cudaSuccess&&runtime_version(&runtime)==cudaSuccess&&driver>=CUDART_VERSION&&runtime==CUDART_VERSION&&count&&attribute&&count(&n)==cudaSuccess)for(int i=0;i<n&&i<64;++i) {
        int major=0,minor=0;
        if(attribute(&major,cudaDevAttrComputeCapabilityMajor,i)==cudaSuccess&&attribute(&minor,cudaDevAttrComputeCapabilityMinor,i)==cudaSuccess)devices.push_back({i,major*10+minor});
    }
    FreeLibrary(dll);return devices;
}
std::vector<VulkanDevice> vulkan_devices(const fs::path& root) {
    auto exe=root/L"vulkan"/L"sd-cli.exe";if(!fs::is_regular_file(exe))return {};
    auto result=run(exe,{L"--list-devices"},true,30000);if(result.exit)return {};
    std::vector<VulkanDevice> devices;std::istringstream lines(result.output);std::string line;
    while(std::getline(lines,line)) {
        if(line.rfind("Vulkan",0)!=0)continue;
        size_t split=line.find_first_of("\t ");if(split==std::string::npos)continue;
        std::string token=line.substr(0,split);if(token.size()<7||!std::all_of(token.begin()+6,token.end(),[](char c){return c>='0'&&c<='9';}))continue;
        auto name=line.substr(split+1);if(!name.empty()&&name.back()=='\r')name.pop_back();
        auto key=wide(token);std::transform(key.begin(),key.end(),key.begin(),::towlower);
        devices.push_back({key,wide(name)});
    }
    return devices;
}
void watch_parent() {
    Handle snapshot(CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS,0));
    if(snapshot.value==INVALID_HANDLE_VALUE)return;
    PROCESSENTRY32W entry{};entry.dwSize=sizeof(entry);DWORD parent=0;
    if(Process32FirstW(snapshot.value,&entry))do {if(entry.th32ProcessID==GetCurrentProcessId()){parent=entry.th32ParentProcessID;break;}}while(Process32NextW(snapshot.value,&entry));
    if(!parent)return;
    HANDLE process=OpenProcess(SYNCHRONIZE,FALSE,parent);if(!process)return;
    std::thread([process](){WaitForSingleObject(process,INFINITE);CloseHandle(process);ExitProcess(1);}).detach();
}
int wmain(int argc,wchar_t** argv) {
    try {
        SetErrorMode(SEM_FAILCRITICALERRORS|SEM_NOGPFAULTERRORBOX|SEM_NOOPENFILEERRORBOX);
        watch_parent();
        wchar_t module[32768];DWORD len=GetModuleFileNameW(nullptr,module,32768);if(!len||len==32768)throw std::runtime_error("Cannot locate image engine bundle");
        fs::path root=fs::path(std::wstring(module,len)).parent_path();
        std::vector<std::wstring> args;std::map<std::wstring,std::wstring> modules{{L"diffusion",L"auto"},{L"te",L"auto"},{L"vae",L"auto"}};
        bool probe=false,list=false;
        for(int i=1;i<argc;++i) {
            std::wstring arg=argv[i];
            if(arg==L"--novera-probe")probe=true;
            else if(arg==L"--list-devices")list=true;
            else if(arg==L"--backend") {if(++i>=argc)throw std::runtime_error("Missing backend value");backend_request(argv[i],modules);}
            else args.push_back(arg);
        }
        bool force_vulkan=false,need_gpu=false;
        for(const auto& item:modules) {
            auto value=item.second;
            if(value==L"cpu")continue;
            need_gpu=true;
            if(value==L"vulkan"||value.rfind(L"vulkan",0)==0)force_vulkan=true;
            else if(value!=L"auto"&&value!=L"cuda"&&value.rfind(L"cuda",0)!=0)throw std::runtime_error("Unsupported backend choice");
        }
        auto cuda=(need_gpu||probe||list)?cuda_devices(root):std::vector<CudaDevice>{};
        bool cuda_ready=std::any_of(cuda.begin(),cuda.end(),[](const CudaDevice& d){return d.capability>=75;})&&fs::is_regular_file(root/L"cuda"/L"sd-cli.exe");
        if(cuda_ready) {
            try {
                auto available=run(root/L"cuda"/L"sd-cli.exe",{L"--list-devices"},true,30000);
                cuda_ready=available.exit==0&&(available.output.rfind("CUDA",0)==0||available.output.find("\nCUDA")!=std::string::npos);
            }catch(...){cuda_ready=false;}
        }
        auto vulkan=((need_gpu&&(force_vulkan||!cuda_ready))||probe||list)?vulkan_devices(root):std::vector<VulkanDevice>{};
        auto usable_cuda=cuda_ready?cuda:std::vector<CudaDevice>{};
        Choice selected=need_gpu?choose(usable_cuda,vulkan,force_vulkan):Choice{L"cpu",L"cpu"};
        if(probe) {
            std::wcout<<L"{\"family\":\""<<selected.family<<L"\",\"device\":\""<<selected.token<<L"\",\"cuda_toolkit\":\"13.4.3\",\"minimum_cuda_sm\":75,\"cuda_devices\":[";
            for(size_t i=0;i<cuda.size();++i){if(i)std::wcout<<L",";std::wcout<<L"{\"index\":"<<cuda[i].ordinal<<L",\"sm\":"<<cuda[i].capability<<L"}";}
            std::wcout<<L"],\"cuda_engine_ready\":"<<(cuda_ready?L"true":L"false")<<L",\"vulkan_devices\":"<<vulkan.size()<<L"}"<<std::endl;return 0;
        }
        if(list) {
            if(cuda_ready)std::cout<<run(root/L"cuda"/L"sd-cli.exe",{L"--list-devices"},true,30000).output;
            if(fs::is_regular_file(root/L"vulkan"/L"sd-cli.exe"))std::cout<<run(root/L"vulkan"/L"sd-cli.exe",{L"--list-devices"},true,30000).output;
            return 0;
        }
        std::wstring assignment;
        for(const auto& item:modules){if(!assignment.empty())assignment+=L",";assignment+=item.first+L"="+(item.second==L"cpu"?L"cpu":selected.token);}
        args.push_back(L"--backend");args.push_back(assignment);
        auto runtime=root/(selected.family==L"cuda"?L"cuda":L"vulkan")/L"sd-cli.exe";
        if(selected.family==L"cpu"&&fs::is_regular_file(root/L"cpu"/L"sd-cli.exe"))runtime=root/L"cpu"/L"sd-cli.exe";
        if(!fs::is_regular_file(runtime))throw std::runtime_error("Required image engine runtime is not installed");
        std::wcerr<<L"[Novera image] CUDA Toolkit 13.4.3; selected "<<selected.family<<L"; "<<assignment<<std::endl;
        if(selected.family==L"cpu"&&need_gpu)std::wcerr<<L"[Novera image] No compatible CUDA/Vulkan device reported; using CPU."<<std::endl;
        return static_cast<int>(run(runtime,args,false).exit);
    }catch(const std::exception& error){std::cerr<<"[Novera image] "<<error.what()<<std::endl;return 1;}
}
