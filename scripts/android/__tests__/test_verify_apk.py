import importlib.util
from pathlib import Path
import struct
import unittest

spec = importlib.util.spec_from_file_location('verify_apk', Path(__file__).resolve().parents[1] / 'verify-apk.py')
verify_apk = importlib.util.module_from_spec(spec)
spec.loader.exec_module(verify_apk)


class ElfInspectionTests(unittest.TestCase):
    def elf(self, alignment=16384, machine=183):
        data = bytearray(120)
        data[:6] = b'\x7fELF\x02\x01'
        struct.pack_into('<H', data, 18, machine)
        struct.pack_into('<Q', data, 32, 64)
        struct.pack_into('<HH', data, 54, 56, 1)
        struct.pack_into('<I', data, 64, 1)
        struct.pack_into('<Q', data, 112, alignment)
        return data

    def test_arm64_load_alignment(self):
        self.assertEqual(verify_apk.inspect_elf(self.elf()), 16384)

    def test_rejects_other_architectures_and_small_pages(self):
        for data in [self.elf(machine=62), self.elf(alignment=4096), self.elf(alignment=24576), self.elf()[:80]]:
            with self.assertRaises(ValueError):
                verify_apk.inspect_elf(data)

    def test_rejects_incongruent_addresses_and_missing_loads(self):
        data = self.elf()
        struct.pack_into('<Q', data, 80, 1)
        with self.assertRaises(ValueError):
            verify_apk.inspect_elf(data)
        data = self.elf()
        struct.pack_into('<I', data, 64, 0)
        with self.assertRaises(ValueError):
            verify_apk.inspect_elf(data)


class NetworkPolicyTests(unittest.TestCase):
    tree = '''E: network-security-config
  E: base-config
    A: cleartextTrafficPermitted(0x1)=(type 0x12)0x0
  E: domain-config
    A: cleartextTrafficPermitted(0x1)=(type 0x12)0xffffffff
    E: domain
      A: includeSubdomains(0x2)=(type 0x12)0x0
      C: "localhost"
    E: domain
      A: includeSubdomains(0x2)=(type 0x12)0x0
      C: "127.0.0.1"
'''

    def test_loopback_policy(self):
        verify_apk.inspect_network_policy(self.tree)
        modern = self.tree.replace('(0x1)=(type 0x12)0xffffffff', '=true').replace('(0x1)=(type 0x12)0x0', '=false').replace('(0x2)=(type 0x12)0x0', '=false').replace('C: "localhost"', "T: 'localhost'").replace('C: "127.0.0.1"', "T: '127.0.0.1'")
        verify_apk.inspect_network_policy(modern)

    def test_compiled_resource_renaming_and_identity(self):
        resources = '    resource 0x7f120002 xml/network_security_config\n      () (file) res/8G.xml type=XML\n'
        self.assertEqual(verify_apk.resource_file(resources, '0x7f120002', 'xml/network_security_config'), 'res/8G.xml')
        with self.assertRaises(ValueError):
            verify_apk.resource_file(resources, '0x7f120003', 'xml/network_security_config')

    def test_rejects_global_http_extra_domains_and_subdomains(self):
        for tree in [self.tree.replace('0x0\n', '0xffffffff\n'), self.tree.replace('localhost', 'example.com'), self.tree + '  E: domain\n C: "example.com"', self.tree + ' A: includeSubdomains=(type 0x12)0xffffffff']:
            with self.assertRaises(ValueError):
                verify_apk.inspect_network_policy(tree)


class SigningOutputTests(unittest.TestCase):
    def test_older_and_build_tools_37_signer_formats(self):
        for signer in ['Signer #1', 'V3.0 Signer:']:
            output = 'Number of signers: 1\n' + signer + ' certificate SHA-256 digest: ' + 'ab' * 32 + '\n'
            self.assertEqual(verify_apk.signing_certificates(output), ['ab' * 32])

    def test_missing_multiple_and_ambiguous_signers_are_rejected(self):
        for output in ['Number of signers: 2\n', 'Number of signers: 1\n']:
            with self.assertRaises(ValueError):
                verify_apk.signing_certificates(output)


if __name__ == '__main__':
    unittest.main()
