"""Offline regression checks for cached, guarded source patch application."""
import difflib
import hashlib
import importlib.util
import os
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('browser_media_build', Path(__file__).with_name('build.py'))
builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)


def digest(value):
    return hashlib.sha256(value.encode()).hexdigest() if value is not None else None


class ReviewedPatchTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix='novera-patch-check-')
        self.root = Path(self.temporary.name)
        self.source = self.root / 'source'
        self.source.mkdir()
        self.patches = self.root / 'patches'
        self.patches.mkdir()
        self.target = self.source / 'test.cpp'
        self.target.write_bytes(b'one\n')

    def tearDown(self):
        self.temporary.cleanup()

    def patch(self, before, after, name):
        content = ''.join(difflib.unified_diff((before or '').splitlines(keepends=True), after.splitlines(keepends=True), fromfile='a/test.cpp' if before is not None else '/dev/null', tofile='b/test.cpp'))
        (self.patches / name).write_bytes(content.encode())
        return dict(source='fixture', file='test.cpp', patch=name, patchSha256=digest(content), beforeSha256=digest(before), afterSha256=digest(after))

    def run_patches(self, patches):
        builder.apply_reviewed_patches({'patches': patches}, {'fixture': self.source}, os.environ.copy(), self.patches)

    def test_cached_final_chain_can_be_rebuilt(self):
        patches = [self.patch('one\n', 'two\n', 'first.patch'), self.patch('two\n', 'three\n', 'second.patch')]
        self.run_patches(patches)
        self.run_patches(patches)
        self.assertEqual(self.target.read_bytes(), b'three\n')

    def test_cached_intermediate_state_resumes_remaining_patches(self):
        patches = [self.patch('one\n', 'two\n', 'first.patch'), self.patch('two\n', 'three\n', 'second.patch')]
        self.target.write_bytes(b'two\n')
        self.run_patches(patches)
        self.assertEqual(self.target.read_bytes(), b'three\n')

    def test_unknown_source_state_is_preserved(self):
        patch = self.patch('one\n', 'two\n', 'first.patch')
        self.target.write_bytes(b'local change\n')
        with self.assertRaisesRegex(RuntimeError, 'reviewed source'):
            self.run_patches([patch])
        self.assertEqual(self.target.read_bytes(), b'local change\n')

    def test_every_patch_digest_is_checked_before_mutation(self):
        patches = [self.patch('one\n', 'two\n', 'first.patch'), self.patch('two\n', 'three\n', 'second.patch')]
        (self.patches / 'second.patch').write_bytes(b'changed')
        with self.assertRaisesRegex(RuntimeError, 'digest mismatch'):
            self.run_patches(patches)
        self.assertEqual(self.target.read_bytes(), b'one\n')

    def test_noncontiguous_chain_is_rejected(self):
        patches = [self.patch('one\n', 'two\n', 'first.patch'), self.patch('other\n', 'three\n', 'second.patch')]
        with self.assertRaisesRegex(RuntimeError, 'contiguous reviewed chain'):
            self.run_patches(patches)
        self.assertEqual(self.target.read_bytes(), b'one\n')

    def test_path_traversal_is_rejected(self):
        patch = self.patch('one\n', 'two\n', 'first.patch')
        patch['file'] = '../test.cpp'
        with self.assertRaisesRegex(RuntimeError, 'inside their source roots'):
            self.run_patches([patch])

    def test_reviewed_new_file_can_be_rebuilt(self):
        self.target.unlink()
        patch = self.patch(None, 'new\n', 'new.patch')
        self.run_patches([patch])
        self.run_patches([patch])
        self.assertEqual(self.target.read_bytes(), b'new\n')


if __name__ == '__main__':
    unittest.main()
