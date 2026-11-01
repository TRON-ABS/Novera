"""Managed ExLlama must fail before its source/JIT fallback; external mode stays explicit."""
import os
from types import SimpleNamespace
import unittest
from unittest.mock import patch
import server


class ManagedExtensions(unittest.TestCase):
    def probe(self, managed):
        torch = SimpleNamespace(version=SimpleNamespace(cuda='13.0'), cuda=SimpleNamespace(
            is_available=lambda: True, get_device_capability=lambda _: (12, 0)))
        calls = []
        def load(name):
            calls.append(name)
            if name in ('exllamav2_ext', 'exllamav3_ext'):
                raise ImportError('precompiled extension unavailable')
            return SimpleNamespace(kernel_probe=lambda *_: {'available': False, 'kernelValidated': False})
        with patch.dict(os.environ, {'NOVERA_MANAGED_COMPONENTS': managed}), patch.object(server.importlib, 'import_module', side_effect=load):
            result = server.quantization_capabilities(torch)
        return result, calls

    def test_managed_mode_never_imports_a_library_with_missing_precompiled_extension(self):
        result, calls = self.probe('1')
        self.assertFalse(result['exl2']['available'])
        self.assertFalse(result['exl3']['available'])
        self.assertIn('exllamav2_ext', calls)
        self.assertIn('exllamav3_ext', calls)
        self.assertNotIn('exllamav2', calls)
        self.assertNotIn('exllamav3', calls)

    def test_external_mode_keeps_its_existing_loader_contract(self):
        result, calls = self.probe('0')
        self.assertTrue(result['exl2']['available'])
        self.assertTrue(result['exl3']['available'])
        self.assertIn('exllamav2', calls)
        self.assertNotIn('exllamav2_ext', calls)


if __name__ == '__main__':
    unittest.main()
