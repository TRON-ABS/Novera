"""Native hardware gating, component placement and real CUDA FP4 GEMM checks."""
import unittest
from unittest.mock import patch
import torch
from nvfp4_cuda import native_available, encoder_target, blocked, unblocked, generate, native_linear


class NativeFP4(unittest.TestCase):
    def test_cpu_cannot_be_reported_as_native_fp4(self):
        with patch('torch.cuda.is_available', return_value=False):
            self.assertFalse(native_available())
            self.assertEqual(encoder_target('auto'), 'cpu')
            with self.assertRaisesRegex(RuntimeError, 'NVFP4_NATIVE_UNAVAILABLE'):
                encoder_target('cuda')

    def test_pre_blackwell_is_not_native_fp4(self):
        with patch('torch.cuda.is_available', return_value=True), patch('torch.cuda.get_device_capability', return_value=(8,9)):
            self.assertFalse(native_available())

    def test_auto_encoder_uses_free_memory_without_overriding_cpu_choice(self):
        with patch('torch.cuda.is_available', return_value=True), patch('torch.cuda.mem_get_info', return_value=(12*1024**3,16*1024**3)):
            self.assertEqual(encoder_target('auto'), 'cuda')
            self.assertEqual(encoder_target('cpu'), 'cpu')
        with patch('torch.cuda.is_available', return_value=True), patch('torch.cuda.mem_get_info', return_value=(1024**3,8*1024**3)):
            self.assertEqual(encoder_target('auto'), 'cpu')
        with self.assertRaises(ValueError):
            encoder_target('invalid')

    def test_qkv_scale_slices_preserve_padded_layout(self):
        scales = (torch.arange(384*20).reshape(384,20) % 127).to(torch.uint8).view(torch.float8_e4m3fn)
        packed = blocked(scales)
        plain = unblocked(packed,384,20)
        self.assertTrue(torch.equal(scales.view(torch.uint8), plain.view(torch.uint8)))
        sliced = plain[128:256,:19]
        self.assertTrue(torch.equal(unblocked(blocked(sliced),128,19).view(torch.uint8),sliced.view(torch.uint8)))

    def test_native_refuses_image_inputs_cpu_and_invalid_limits(self):
        config = dict(task='image',prompt='test',width=64,height=64,steps=1,seed=42)
        for change in ({'device':'cpu'},{'input_image':'file.png'},{'task':'video'}):
            with self.assertRaisesRegex(RuntimeError,'NVFP4_NATIVE_UNAVAILABLE'):
                generate({**config,**change},lambda **kw:None)
        for change in ({'steps':True},{'width':65},{'seed':-1},{'prompt':' '}):
            with self.assertRaises(ValueError):
                generate({**config,**change},lambda **kw:None)

    @unittest.skipUnless(native_available(), 'Requires Blackwell CUDA and PyTorch FP4')
    def test_real_fp4_kernel_matches_bf16_reference(self):
        import comfy_kitchen as ck
        from nvfp4_compat import decode
        torch.manual_seed(42)
        x=torch.randn(128,64,device='cuda',dtype=torch.bfloat16)
        w=torch.randn(128,64,device='cuda',dtype=torch.bfloat16)
        ws=w.abs().amax().float()/(448*6)
        xs=x.abs().amax().float()/(448*6)
        qw,bs=ck.quantize_nvfp4(w,ws,pad_16x=True)
        qx,axs=ck.quantize_nvfp4(x,xs,pad_16x=True)
        layer=native_linear(qw,bs,ws,xs)
        with torch.profiler.profile(activities=[torch.profiler.ProfilerActivity.CPU,torch.profiler.ProfilerActivity.CUDA]) as prof:
            actual=layer(x)
            torch.cuda.synchronize()
        expected=decode(qx.cpu(),axs.cpu(),xs.cpu()).cuda() @ decode(qw.cpu(),bs.cpu(),ws.cpu()).cuda().t()
        relative=((actual.float()-expected.float()).square().mean()/expected.float().square().mean()).sqrt()
        self.assertLess(float(relative),0.02)
        self.assertEqual(layer.packed_weight.dtype,torch.uint8)
        self.assertFalse(any(name == 'weight' for name,_ in layer.named_parameters()))
        self.assertEqual(layer.calls,1)
        self.assertTrue(any('e2m1' in event.key.lower() for event in prof.key_averages()))


if __name__ == '__main__':
    unittest.main()
