import contextlib
import io
import json
from pathlib import Path
import tempfile
import unittest
import subprocess
import sys
from unittest.mock import patch
from types import SimpleNamespace
import torch
from safetensors.torch import save_file
from safetensors import safe_open
from nvfp4_compat import decode, header, prepare, quantized_layers


class NVFP4Compatibility(unittest.TestCase):
    def fixture(self, folder):
        # Each row/block has a different scale; this catches an incorrect cuBLAS permutation.
        scale = torch.arange(1, 513).reshape(128, 4).float() / 512
        scale = scale.to(torch.float8_e4m3fn)
        blocked = scale.reshape(1, 128, 1, 4).permute(0, 2, 1, 3).reshape(-1, 4, 32, 4).transpose(1, 2).reshape(128, 4)
        packed = torch.tensor([0x01,0x23,0x45,0x67,0x89,0xab,0xcd,0xef], dtype=torch.uint8).repeat(128,4)
        path = Path(folder) / 'source.safetensors'
        save_file({'layer.weight':packed,'layer.weight_scale':blocked,'layer.weight_scale_2':torch.tensor(2.),'layer.input_scale':torch.tensor(1.),'layer.bias':torch.ones(128)},str(path),metadata={'_quantization_metadata':json.dumps({'layers':{'layer':{'format':'nvfp4'}}})})
        return path, packed, blocked, scale

    def test_decode_nibbles_and_tiled_scales(self):
        with tempfile.TemporaryDirectory() as folder:
            _, packed, blocked, scale = self.fixture(folder)
            result = decode(packed, blocked, torch.tensor(2.))
            values = torch.tensor([0,.5,1,1.5,2,3,4,6,0,-.5,-1,-1.5,-2,-3,-4,-6]).repeat(4).reshape(1,4,16)
            expected=(values * scale.float().unsqueeze(-1) * 2).reshape(128,64).to(torch.bfloat16)
            self.assertTrue(torch.equal(result,expected))

    def test_preserves_original_and_reuses_complete_cache(self):
        with tempfile.TemporaryDirectory() as folder, contextlib.redirect_stdout(io.StringIO()):
            path, *_ = self.fixture(folder); original=path.read_bytes()
            out=prepare(path,Path(folder)/'cache'); first=out.stat().st_mtime_ns
            again=prepare(path,Path(folder)/'cache')
            self.assertEqual(out,again);self.assertEqual(first,out.stat().st_mtime_ns);self.assertEqual(original,path.read_bytes())
            data,_=header(out)
            self.assertNotIn('_quantization_metadata',data['__metadata__'])
            self.assertNotIn('layer.weight_scale',data)
            with safe_open(str(out),framework='pt') as tensors:
                self.assertEqual(tensors.get_tensor('layer.weight').dtype,torch.bfloat16)
                self.assertEqual(list(tensors.get_tensor('layer.weight').shape),[128,64])
                self.assertTrue(torch.equal(tensors.get_tensor('layer.bias'),torch.ones(128)))

    def test_refuses_unknown_or_mixed_layout(self):
        for value in [{'layers':{'layer':{'format':'unknown'}}},{'layers':{'layer':{'format':'nvfp4'}}}]:
            with self.assertRaises(ValueError):quantized_layers({'__metadata__':{'_quantization_metadata':json.dumps(value)}})

    def test_incomplete_cache_is_not_overwritten(self):
        with tempfile.TemporaryDirectory() as folder, contextlib.redirect_stdout(io.StringIO()):
            path,*_=self.fixture(folder);out=prepare(path,Path(folder)/'cache');out.write_bytes(b'broken')
            with self.assertRaises(Exception):prepare(path,Path(folder)/'cache')
            self.assertEqual(out.read_bytes(),b'broken')

    def test_owned_staging_file_is_published_and_removed(self):
        with tempfile.TemporaryDirectory() as folder, contextlib.redirect_stdout(io.StringIO()):
            path,*_=self.fixture(folder);stage=Path(folder)/'owned.partial'
            out=prepare(path,Path(folder)/'cache',stage)
            self.assertTrue(out.is_file());self.assertFalse(stage.exists())

    def test_preparation_reports_both_component_roles(self):
        with tempfile.TemporaryDirectory() as folder:
            path,*_=self.fixture(folder)
            config=Path(folder)/'job.json'
            config.write_text(json.dumps({'compat_cache':str(Path(folder)/'cache'),'compat_models':[{'role':'image','path':str(path)},{'role':'encoder','path':str(path)}]}))
            result=subprocess.run([sys.executable,str(Path(__file__).with_name('nvfp4_compat.py')),str(config)],capture_output=True,text=True,timeout=30)
            self.assertEqual(result.returncode,0,result.stdout+result.stderr)
            last=json.loads(result.stdout.splitlines()[-1])
            self.assertEqual(last['stage'],'prepared');self.assertEqual(set(last['paths']),{'image','encoder'})
            self.assertTrue(all(Path(value).is_file() for value in last['paths'].values()))

    def test_low_disk_space_refuses_without_modifying_source(self):
        with tempfile.TemporaryDirectory() as folder, contextlib.redirect_stdout(io.StringIO()):
            path,*_=self.fixture(folder);original=path.read_bytes()
            with patch('nvfp4_compat.shutil.disk_usage',return_value=SimpleNamespace(free=0)):
                with self.assertRaisesRegex(ValueError,'disk space'):prepare(path,Path(folder)/'cache')
            self.assertEqual(path.read_bytes(),original)
            self.assertEqual(list((Path(folder)/'cache').iterdir()),[])

if __name__=='__main__':unittest.main()
