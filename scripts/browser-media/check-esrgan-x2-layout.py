"""Compare the patched C++ x2 pixel layout with PyTorch's real operation.

Run after build.py applies the guarded ESRGAN patch. Requires a C++ compiler
and the existing Desktop upscaler Python profile (torch/numpy). No model data
is read and no network or GPU is needed.
"""
import argparse
import os
from pathlib import Path
import subprocess
import tempfile

import numpy as np
import torch

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--source', type=Path, required=True)
parser.add_argument('--cxx', default='c++')
args = parser.parse_args()
source = args.source.read_text()
start = source.index('        if (config.pixel_unshuffle == 2) {', source.index('ggml_cgraph* build_graph'))
end = source.index('        ggml_tensor* x = make_input(', start)
actual_cpp = source[start:end]
harness = r'''
#include <vector>
#include <cstdint>
#include <cstdio>
#include <cstdlib>
#ifdef _WIN32
#include <io.h>
#include <fcntl.h>
#endif
#define LOG_ERROR(...) ((void)0)
struct Tensor {
    std::vector<int64_t> s;
    std::vector<float> d;
    const auto& shape() const { return s; }
    int dim() const { return s.size(); }
    void resize(std::vector<int64_t> shape) {
        s = shape; int64_t count = 1;
        for (auto value : s) count *= value;
        d.resize(count);
    }
    float& operator[](int64_t i) { return d[i]; }
    const float& operator[](int64_t i) const { return d[i]; }
};
float* run(Tensor& x_tensor, Tensor& unshuffled) {
    struct { int pixel_unshuffle = 2; } config;
''' + actual_cpp + r'''
    return unshuffled.d.data();
}
int main(int argc, char** argv) {
    if (argc != 4) return 2;
#ifdef _WIN32
    _setmode(_fileno(stdout), _O_BINARY);
#endif
    Tensor input, output;
    input.resize({std::atoi(argv[1]), std::atoi(argv[2]), 3, std::atoi(argv[3])});
    for (size_t i = 0; i < input.d.size(); ++i) input.d[i] = static_cast<float>(i);
    if (!run(input, output)) return 3;
    return std::fwrite(output.d.data(), sizeof(float), output.d.size(), stdout) == output.d.size() ? 0 : 4;
}
'''
with tempfile.TemporaryDirectory(prefix='novera-esrgan-layout-') as directory:
    cpp = Path(directory) / 'check.cpp'
    exe = Path(directory) / 'check.exe'
    cpp.write_text(harness)
    environment = dict(os.environ)
    environment['PATH'] = str(Path(args.cxx).resolve().parent) + os.pathsep + environment.get('PATH', '')
    subprocess.run([args.cxx, '-std=c++17', '-O2', '-static', str(cpp), '-o', str(exe)], check=True, env=environment)
    for width, height, batch in [(2, 2, 1), (6, 4, 1), (4, 6, 2), (16, 8, 3), (64, 64, 1), (128, 96, 2)]:
        result = subprocess.check_output([str(exe), str(width), str(height), str(batch)])
        actual = np.frombuffer(result, dtype=np.float32)
        value = torch.arange(batch * 3 * height * width, dtype=torch.float32).reshape(batch, 3, height, width)
        expected = torch.nn.functional.pixel_unshuffle(value, 2).numpy().reshape(-1)
        np.testing.assert_array_equal(actual, expected)
        print(f'PASS: {width}x{height}, RGB, batch={batch}, {actual.size} exact values')
