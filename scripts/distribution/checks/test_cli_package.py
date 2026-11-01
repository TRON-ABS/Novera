import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
import zipfile

spec=importlib.util.spec_from_file_location('cli_package',Path(__file__).resolve().parents[1]/'package-cli-update.py')
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)

class CliArchive(unittest.TestCase):
    def test_archive_identity_covers_the_exact_binary_and_source(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder);binary=root/'compiled';binary.write_bytes(b'compiled fixture')
            archive=module.package(binary,root/'out','1.0.0','linux-x86_64','a'*40)
            with zipfile.ZipFile(archive) as payload:
                self.assertEqual(set(payload.namelist()),{'jan','CLI-UPDATE.json'})
                identity=json.loads(payload.read('CLI-UPDATE.json'))
                self.assertEqual(identity['binarySha256'],hashlib.sha256(payload.read('jan')).hexdigest())
                self.assertEqual(identity['commit'],'a'*40)
                self.assertEqual(identity['version'],'1.0.0')
            with self.assertRaises(FileExistsError):
                module.package(binary,root/'out','1.0.0','linux-x86_64','a'*40)

    def test_unreviewed_targets_or_escaping_versions_are_refused(self):
        for version,target,commit in [('../1.0.0','linux-x86_64','a'*40),('1.0.0','android','a'*40),('1.0.0','linux-x86_64','HEAD')]:
            with self.subTest(target=target),self.assertRaises(ValueError):
                module.package(Path('unused'),Path('unused'),version,target,commit)

if __name__=='__main__':unittest.main()
