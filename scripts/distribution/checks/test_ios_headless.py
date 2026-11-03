import importlib.util
from pathlib import Path
import struct
import unittest

spec = importlib.util.spec_from_file_location('ios_headless', Path(__file__).resolve().parents[1] / 'ios-headless.py')
ios = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ios)


def binary(platform=7, cpu=0x100000c):
    return struct.pack('<8I', 0xfeedfacf, cpu, 0, 2, 1, 24, 0, 0) + struct.pack('<6I', 0x32, 24, platform, 0, 0, 0)


class IosHeadlessGuards(unittest.TestCase):
    def test_only_native_arm64_simulator_identity_is_accepted(self):
        ios.inspect_simulator_binary(binary())
        for payload in [binary(1), binary(2), binary(cpu=0x1000007), b'not executable', binary()[:-1]]:
            with self.subTest(payload=payload[:16]), self.assertRaises(ValueError):
                ios.inspect_simulator_binary(payload)

    def test_corrupt_load_command_cannot_be_certified(self):
        data = bytearray(binary())
        struct.pack_into('<I', data, 36, 0)
        with self.assertRaises(ValueError):
            ios.inspect_simulator_binary(data)

    def test_simulator_control_requires_an_exact_uuid(self):
        value = 'A2A8D653-2F3B-4D2B-924B-C0745D86AFAE'
        self.assertEqual(ios.owned_uuid(value), value)
        for value in ['all', 'booted', '--all', 'A2A8D6532F3B4D2B924BC0745D86AFAE', '../device']:
            with self.subTest(value=value), self.assertRaises(ValueError):
                ios.owned_uuid(value)


if __name__ == '__main__':
    unittest.main()
