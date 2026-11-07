cmake_minimum_required(VERSION 3.24)
project(novera_browser_diffusion LANGUAGES C CXX)
if(NOT EMSCRIPTEN)
  message(FATAL_ERROR "This experimental target requires Emscripten; it is not a native Desktop build.")
endif()
if(NOT NOVERA_SD_SOURCE OR NOT SD_GGML_SOURCE_DIR)
  message(FATAL_ERROR "Pass the source directories recorded in sources.json.")
endif()
set(SD_BUILD_EXAMPLES OFF CACHE BOOL "" FORCE)
set(SD_BUILD_SHARED_LIBS OFF CACHE BOOL "" FORCE)
set(SD_WEBP OFF CACHE BOOL "" FORCE)
set(SD_WEBM OFF CACHE BOOL "" FORCE)
set(GGML_WEBGPU ON CACHE BOOL "" FORCE)
set(GGML_WEBGPU_JSPI ON CACHE BOOL "" FORCE)
set(GGML_NATIVE OFF CACHE BOOL "" FORCE)
set(GGML_OPENMP OFF CACHE BOOL "" FORCE)
set(GGML_BACKEND_DL OFF CACHE BOOL "" FORCE)
add_compile_options(-sMEMORY64=1 -fwasm-exceptions)
add_subdirectory("${NOVERA_SD_SOURCE}" sdcpp)
add_executable(novera-diffusion binding.cpp)
option(NOVERA_WEBGPU_VAE_PROBE "Try direct WebGPU VAE convolution; not a validated release configuration" OFF)
option(NOVERA_CPU_VAE_FALLBACK "Decode the VAE on CPU for compatibility investigation" OFF)
if(NOVERA_CPU_VAE_FALLBACK)
  target_compile_definitions(novera-diffusion PRIVATE NOVERA_CPU_VAE_FALLBACK=1)
endif()
if(NOVERA_WEBGPU_VAE_PROBE)
  target_compile_definitions(novera-diffusion PRIVATE NOVERA_WEBGPU_VAE_PROBE=1)
endif()
target_include_directories(novera-diffusion PRIVATE "${NOVERA_SD_SOURCE}/include")
target_link_libraries(novera-diffusion PRIVATE stable-diffusion)
target_link_options(novera-diffusion PRIVATE
  -O1 --emit-symbol-map
  -sMEMORY64=1 -sALLOW_MEMORY_GROWTH=1 -sINITIAL_MEMORY=67108864 -sMAXIMUM_MEMORY=17179869184
  -sMODULARIZE=1 -sEXPORT_ES6=1 -sENVIRONMENT=worker -sFORCE_FILESYSTEM=1
  -sJSPI=1 -fwasm-exceptions -lworkerfs.js --no-entry
  "-sJSPI_EXPORTS=['novera_load','novera_generate','novera_release']"
  "-sEXPORTED_FUNCTIONS=['_novera_load','_novera_configure_video','_novera_generate','_novera_width','_novera_height','_novera_channels','_novera_frame_count','_novera_frame_data','_novera_release']"
  "-sEXPORTED_RUNTIME_METHODS=['ccall','FS','WORKERFS','HEAPU8']")
set_target_properties(novera-diffusion PROPERTIES SUFFIX ".mjs")

option(NOVERA_NUMERICAL_CHECKS "Build the CPU-reference numerical validation module" OFF)
if(NOVERA_NUMERICAL_CHECKS)
  add_executable(novera-im2col-check numerical-check.cpp)
  target_link_libraries(novera-im2col-check PRIVATE ggml ggml-webgpu)
  target_link_options(novera-im2col-check PRIVATE -O1 -sMEMORY64=1 -sALLOW_MEMORY_GROWTH=1 -sINITIAL_MEMORY=67108864 -sMAXIMUM_MEMORY=2147483648 -sMODULARIZE=1 -sEXPORT_ES6=1 -sENVIRONMENT=worker -sJSPI=1 -fwasm-exceptions --no-entry
    "-sJSPI_EXPORTS=['novera_check_im2col']" "-sEXPORTED_FUNCTIONS=['_novera_check_im2col']" "-sEXPORTED_RUNTIME_METHODS=['ccall']")
  set_target_properties(novera-im2col-check PROPERTIES SUFFIX ".mjs")
endif()
