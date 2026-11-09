#pragma once
// This launcher dynamically queries only these stable runtime ABI values.
// No CUDA kernels or driver implementation are provided by this header.
// https://nvidia.github.io/cuda-python/cuda-bindings/13.3.0/module/runtime.html
#if __has_include(<cuda_runtime_api.h>)
#include <cuda_runtime_api.h>
#else
using cudaError_t = int;
constexpr cudaError_t cudaSuccess = 0;
enum cudaDeviceAttr { cudaDevAttrComputeCapabilityMajor = 75, cudaDevAttrComputeCapabilityMinor = 76 };
// The runtime/toolchain remains pinned to CUDA 13.4; runtime and driver gates
// below must still pass before selecting CUDA.
constexpr int CUDART_VERSION = 13040;
#endif
