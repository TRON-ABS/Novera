import importlib.util
import json
from pathlib import Path
import struct
import tempfile
import unittest
import zipfile

spec = importlib.util.spec_from_file_location('portable_package', Path(__file__).resolve().parents[1]/'package-portable.py')
package = importlib.util.module_from_spec(spec)
spec.loader.exec_module(package)


class PortablePackage(unittest.TestCase):
    def fixture(self, root):
        runtime = root/'runtime'
        pe = bytearray(128)
        pe[:2] = b'MZ'
        pe[0x3c:0x40] = struct.pack('<I', 64)
        pe[64:70] = b'PE\0\0'+struct.pack('<H', 0x8664)
        for name in ['Novera-Desktop.exe', 'bun.exe', 'uv.exe', 'resources/bin/novera-llama-worker.exe', 'resources/LICENSE']:
            file = runtime/name
            file.parent.mkdir(parents=True, exist_ok=True)
            file.write_bytes(pe if name.endswith('.exe') else b'License fixture')
        helper = root/'helper.exe'
        helper.write_bytes(pe)
        version = json.loads((Path(__file__).resolve().parents[3]/'src-tauri/tauri.conf.json').read_text())['version']
        record = root/'build.json'
        record.write_text(json.dumps({'portableFeature': True, 'version': version, 'executableSha256': package.digest(runtime/'Novera-Desktop.exe')}))
        return runtime, helper, record, version

    def test_current_version_and_empty_data_are_packaged_with_exact_runtime_bytes(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            runtime, helper, record, version = self.fixture(root)
            output = root/'output'
            package.package(runtime, helper, record, output)
            with zipfile.ZipFile(output/f'Novera_{version}_x64-portable.zip') as archive:
                self.assertEqual([n for n in archive.namelist() if n.startswith('Data/')], ['Data/'])
                self.assertEqual(archive.read('Program/Novera-Desktop.exe'), (runtime/'Novera-Desktop.exe').read_bytes())
                self.assertIn(f'Novera {version}', archive.read('LISEZ-MOI.txt').decode())
            provenance = json.loads((output/'PORTABLE-PROVENANCE.json').read_text())
            self.assertEqual(provenance['version'], version)
            self.assertFalse(provenance['dataBundled'])

    def test_stale_version_and_private_signing_files_are_rejected(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            runtime, helper, record, version = self.fixture(root)
            info = json.loads(record.read_text())
            record.write_text(json.dumps({**info, 'version': '0.0.0'}))
            with self.assertRaises(ValueError):
                package.package(runtime, helper, record, root/'stale')
            record.write_text(json.dumps(info))
            (runtime/'private.p12').write_bytes(b'private fixture')
            with self.assertRaises(ValueError):
                package.package(runtime, helper, record, root/'private')
            self.assertFalse((root/'stale').exists())
            self.assertFalse((root/'private').exists())


if __name__ == '__main__':
    unittest.main()
