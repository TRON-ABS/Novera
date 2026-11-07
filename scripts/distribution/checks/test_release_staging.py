import copy
import hashlib
import importlib.util
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('reviewed_staging', Path(__file__).resolve().parents[1]/'stage-reviewed-release.py')
staging = importlib.util.module_from_spec(spec)
spec.loader.exec_module(staging)


class ReleaseStaging(unittest.TestCase):
    def descriptor(self):
        return {'schema': 1, 'version': '1.0.1', 'publicationTag': 'v1.0.1-windows-arm64', 'kind': 'desktop', 'platform': 'windows-aarch64',
                'runId': 1, 'artifactId': 2, 'compilationCommit': 'a'*40, 'artifactSha256': 'b'*64,
                'assets': [{'name': name, 'bytes': 123, 'sha256': 'c'*64} for name in ['Novera_1.0.1_arm64-setup.exe', 'Novera_1.0.1_arm64-setup.exe.sig']]}

    def test_exact_desktop_scope_and_private_tag_are_required(self):
        descriptor = self.descriptor()
        staging.validate_descriptor(descriptor)
        staging.require_private_draft({'draft': True, 'tag_name': descriptor['publicationTag']}, descriptor)
        for release in [{'draft': False, 'tag_name': descriptor['publicationTag']}, {'draft': True, 'tag_name': 'v1.0.0'}]:
            with self.subTest(release=release), self.assertRaises(ValueError):
                staging.require_private_draft(release, descriptor)

    def test_missing_signatures_wrong_versions_paths_duplicates_and_unbounded_files_are_refused(self):
        cases = []
        for key, value in [('publicationTag', 'v1.0.0'), ('compilationCommit', 'main'), ('artifactSha256', 'unknown'), ('runId', True)]:
            descriptor = self.descriptor(); descriptor[key] = value; cases.append(descriptor)
        for name in ['../secret.key', 'Novera_1.0.0_arm64-setup.exe', 'Novera_1.0.1_x64-setup.exe']:
            descriptor = self.descriptor(); descriptor['assets'][0]['name'] = name; cases.append(descriptor)
        descriptor = self.descriptor(); descriptor['assets'].pop(); cases.append(descriptor)
        descriptor = self.descriptor(); descriptor['assets'].append(copy.deepcopy(descriptor['assets'][0])); cases.append(descriptor)
        descriptor = self.descriptor(); descriptor['assets'][0]['bytes'] = 2*1024**3; cases.append(descriptor)
        for descriptor in cases:
            with self.subTest(descriptor=descriptor), self.assertRaises(ValueError):
                staging.validate_descriptor(descriptor)

    def test_payload_size_and_digest_are_verified_before_network_upload(self):
        with tempfile.TemporaryDirectory() as temporary:
            file = Path(temporary)/'payload.exe'; file.write_bytes(b'reviewed payload')
            expected = {'name': file.name, 'bytes': file.stat().st_size, 'sha256': hashlib.sha256(file.read_bytes()).hexdigest()}
            staging.verify_file(file, expected)
            for changed in [{**expected, 'bytes': 1}, {**expected, 'sha256': '0'*64}]:
                with self.assertRaises(ValueError):
                    staging.verify_file(file, changed)


if __name__ == '__main__':
    unittest.main()
