import importlib.util
import os
from pathlib import Path
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('linux_ui', Path(__file__).resolve().parents[1]/'validate-linux-update-ui.py')
validation = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validation)


class LinuxUiGuards(unittest.TestCase):
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
        attempts = iter([RuntimeError('not ready'), {'observed':'error toast'}])
        def observe():
            result = next(attempts)
            if isinstance(result, Exception):
                raise result
            return result
        with patch.object(validation.time, 'sleep'):
            self.assertEqual(validation.wait_for(observe), {'observed':'error toast'})


if __name__ == '__main__':
    unittest.main()
