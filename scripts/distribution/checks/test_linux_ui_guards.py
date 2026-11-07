import importlib.util
from http.client import RemoteDisconnected
import os
from pathlib import Path
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('linux_ui', Path(__file__).resolve().parents[1]/'validate-linux-update-ui.py')
validation = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validation)


class LinuxUiGuards(unittest.TestCase):
    def test_public_feed_cannot_be_reported_as_unavailable_or_an_update_offer(self):
        feed = {'version':'1.0.0','platforms':{'linux-x86_64':{'url':'https://github.com/TRON-ABS/Novera/releases/download/v1.0.0/Novera_1.0.0_amd64.AppImage','signature':'test'}}}
        self.assertEqual(validation.expected_message(404, None, '1.0.0'), 'Failed to check for updates')
        self.assertEqual(validation.expected_message(200, feed, '1.0.0'), "You're running the latest version")
        for status, body, version in [(500, None, '1.0.0'), (200, {}, '1.0.0'), (200, feed, '0.9.9')]:
            with self.subTest(status=status, version=version), self.assertRaises(RuntimeError):
                validation.expected_message(status, body, version)

    def test_local_and_self_hosted_runs_stop_before_profile_or_network_access(self):
        for environment in [{}, {'GITHUB_ACTIONS':'true','RUNNER_ENVIRONMENT':'self-hosted'}]:
            with self.subTest(environment=environment), patch.dict(os.environ, environment, clear=True), patch.object(validation.sys, 'platform', 'linux'), patch.object(validation.tempfile, 'mkdtemp') as create_profile, patch.object(validation.urllib.request, 'urlopen') as network:
                with self.assertRaisesRegex(RuntimeError, 'isolated Linux'):
                    validation.main()
                create_profile.assert_not_called()
                network.assert_not_called()

    def test_a_missing_ui_condition_cannot_be_reported_as_success(self):
        with patch.object(validation.time, 'monotonic', side_effect=[0, 0, 2]), patch.object(validation.time, 'sleep'):
            with self.assertRaisesRegex(RuntimeError, 'timed out'):
                validation.wait_for(lambda: False, timeout=1)

    def test_transient_driver_errors_are_retried_until_a_real_result(self):
        attempts = iter([RuntimeError('not ready'), RemoteDisconnected('screenshot reset'), {'observed':'error toast'}])
        def observe():
            result = next(attempts)
            if isinstance(result, Exception):
                raise result
            return result
        with patch.object(validation.time, 'sleep'):
            self.assertEqual(validation.wait_for(observe), {'observed':'error toast'})

    def test_persistent_screenshot_connection_failure_cannot_pass(self):
        def disconnected():
            raise RemoteDisconnected('screenshot reset')
        with patch.object(validation.time, 'monotonic', side_effect=[0, 0, 2]), patch.object(validation.time, 'sleep'):
            with self.assertRaisesRegex(RuntimeError, 'timed out.*screenshot reset'):
                validation.wait_for(disconnected, timeout=1)


if __name__ == '__main__':
    unittest.main()
