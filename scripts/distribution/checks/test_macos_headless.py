import importlib.util
import io
import os
from pathlib import Path
import tarfile
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('macos_headless', Path(__file__).resolve().parents[1] / 'macos-headless.py')
headless = importlib.util.module_from_spec(spec)
spec.loader.exec_module(headless)


class MacHeadlessGuards(unittest.TestCase):
    def test_owned_disposable_mac_host_is_required(self):
        for platform, env in [('win32', {}), ('darwin', {}), ('darwin', {'GITHUB_ACTIONS': 'true', 'RUNNER_ENVIRONMENT': 'self-hosted'})]:
            with self.subTest(platform=platform, env=env), patch.object(headless.sys, 'platform', platform), patch.dict(os.environ, env, clear=True):
                with self.assertRaises(RuntimeError):
                    headless.require_host()

    def test_runner_and_provider_secrets_are_not_inherited(self):
        with tempfile.TemporaryDirectory(prefix='novera-macos-env-') as tmp:
            root = Path(tmp)
            env = {'PATH': '/bin', 'RUNNER_TEMP': tmp, 'GITHUB_TOKEN': 'secret', 'APPLE_PASSWORD': 'secret',
                   'TAURI_SIGNING_PRIVATE_KEY': 'secret', 'OPENAI_API_KEY': 'secret', 'POSTHOG_CLI_API_KEY': 'secret'}
            with patch.dict(os.environ, env, clear=True):
                result = headless.child_environment(root / 'profile', root / 'scratch')
            self.assertNotIn('secret', result.values())
            self.assertEqual(result['HOME'], str(root / 'profile'))
            self.assertEqual(result['CFFIXED_USER_HOME'], result['HOME'])
            self.assertEqual(result['PATH'], '/bin')

    def test_full_manifest_detects_resource_and_hidden_file_changes(self):
        with tempfile.TemporaryDirectory(prefix='novera-macos-manifest-') as tmp:
            root = Path(tmp)
            (root / '.hidden').write_bytes(b'one')
            (root / 'Contents').mkdir()
            (root / 'Contents/payload').write_bytes(b'payload')
            before = headless.manifest(root)
            (root / '.hidden').write_bytes(b'two')
            self.assertNotEqual(before, headless.manifest(root))
            self.assertEqual(len(before), 3)

    def test_archive_cannot_write_outside_the_application(self):
        for name in ['../escape', '/Novera.app/file', 'Other.app/file', 'Novera.app/../../escape']:
            with self.subTest(name=name), tempfile.TemporaryDirectory(prefix='novera-macos-archive-') as tmp:
                root = Path(tmp)
                file = root / 'bad.tar.gz'
                with tarfile.open(file, 'w:gz') as archive:
                    item = tarfile.TarInfo(name)
                    item.size = 1
                    archive.addfile(item, io.BytesIO(b'x'))
                with self.assertRaises(ValueError):
                    headless.extract_app(file, root / 'output')
                self.assertFalse((root / 'escape').exists())

    def test_valid_archive_keeps_the_expected_payload(self):
        with tempfile.TemporaryDirectory(prefix='novera-macos-valid-') as tmp:
            root = Path(tmp)
            file = root / 'valid.tar.gz'
            with tarfile.open(file, 'w:gz') as archive:
                item = tarfile.TarInfo('Novera.app/Contents/payload')
                item.size = 3
                archive.addfile(item, io.BytesIO(b'abc'))
            app = headless.extract_app(file, root / 'output')
            self.assertEqual((app / 'Contents/payload').read_bytes(), b'abc')


if __name__ == '__main__':
    unittest.main()
