import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
import zipfile

spec = importlib.util.spec_from_file_location('legacy_cli', Path(__file__).resolve().parents[1] / 'package-legacy-cli-update.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class LegacyCliPackage(unittest.TestCase):
    def test_original_updater_identity_and_binary_name_without_changing_executable_bytes(self):
        for platform in ['linux-x86_64', 'windows-x86_64', 'darwin-aarch64']:
            with self.subTest(platform=platform), tempfile.TemporaryDirectory() as folder:
                root = Path(folder)
                data = bytearray(128)
                if platform.startswith('linux'):
                    data[:6] = b'\x7fELF\x02\x01'; data[18] = 62
                elif platform.startswith('windows'):
                    data[:2] = b'MZ'; data[60:64] = (64).to_bytes(4, 'little'); data[64:70] = b'PE\0\0\x64\x86'; data[88:90] = b'\x0b\x02'
                else:
                    data[:8] = bytes.fromhex('cffaedfe0c000001')
                binary = root / 'compiled'; binary.write_bytes(data)
                source = module.canonical.package(binary, root / 'canonical', '1.0.1', platform, 'a' * 40)
                result = module.package(source, root / 'legacy', '1.0.1', platform, 'a' * 40)
                expected = 'jan.exe' if platform.startswith('windows') else 'jan'
                with zipfile.ZipFile(result['archive']) as archive:
                    self.assertEqual(set(archive.namelist()), {expected, 'CLI-UPDATE.json'})
                    self.assertEqual(archive.read(expected), data)
                    self.assertEqual(json.loads(archive.read('CLI-UPDATE.json')), dict(formatVersion=1, product='Novera CLI', version='1.0.1', platform=platform,
                        binary=expected, binarySha256=hashlib.sha256(data).hexdigest(), commit='a' * 40))
                with self.assertRaises(FileExistsError):
                    module.package(source, root / 'legacy', '1.0.1', platform, 'a' * 40)

    def test_cannot_relabel_an_old_or_different_canonical_binary(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            binary = root / 'compiled'
            data = bytearray(64); data[:6] = b'\x7fELF\x02\x01'; data[18] = 62; binary.write_bytes(data)
            source = module.canonical.package(binary, root / 'canonical', '1.0.0', 'linux-x86_64', 'a' * 40)
            with self.assertRaises(ValueError):
                module.package(source, root / 'legacy', '1.0.1', 'linux-x86_64', 'a' * 40)
            self.assertFalse((root / 'legacy').exists())


if __name__ == '__main__':
    unittest.main()
