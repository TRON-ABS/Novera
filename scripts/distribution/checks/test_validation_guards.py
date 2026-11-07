import importlib.util
import os
from pathlib import Path
import unittest
from unittest.mock import patch

spec=importlib.util.spec_from_file_location('installed_validation',Path(__file__).resolve().parents[1]/'validate-installed-update.py')
validation=importlib.util.module_from_spec(spec);spec.loader.exec_module(validation)

class ValidationGuards(unittest.TestCase):
    def test_local_and_self_hosted_installations_are_refused(self):
        for environment in [{},{'GITHUB_ACTIONS':'true','RUNNER_ENVIRONMENT':'self-hosted'}]:
            with self.subTest(environment=environment),patch.dict(os.environ,environment,clear=True):
                with self.assertRaises(RuntimeError):validation.require_ci()

    def test_escaping_asset_names_are_refused_before_network_access(self):
        for name in ['../setup.exe','C:setup.exe','a\\setup.exe','a/setup.exe','.','..','setup.exe\x00']:
            with self.subTest(name=name):
                with self.assertRaises(ValueError):validation.validate_asset({'name':name,'sha256':'a'*64,'id':1,'bytes':1})

    def test_incomplete_or_oversized_asset_identity_is_refused(self):
        record={'name':'Novera_1.0.0_x64-setup.exe','sha256':'a'*64,'id':1,'bytes':1}
        for field,value in [('sha256',''),('sha256','unknown'),('id',0),('bytes',0),('bytes',2*1024**3)]:
            with self.subTest(field=field,value=value):
                with self.assertRaises(ValueError):validation.validate_asset({**record,field:value})

    def test_reviewed_asset_metadata_is_accepted(self):
        validation.validate_asset({'name':'Novera_1.0.0_amd64.AppImage','sha256':'a'*64,'id':1,'bytes':123})

    def test_current_validation_never_silently_installs_an_old_or_other_platform_bundle(self):
        bundle={'name':'Novera_1.0.1_arm64-setup.exe','sha256':'a'*64,'id':1,'bytes':123}
        selected={'commit':'b'*40,'bundle':bundle,'signature':{**bundle,'id':2,'name':bundle['name']+'.sig'},'runtimeExecutableSha256':'c'*64}
        config={'applicationVersion':'1.0.1','platforms':{'windows-aarch64':selected}}
        self.assertEqual(validation.select_current_candidate(config,'windows-aarch64','1.0.1'),selected)
        for invalid in [{**config,'applicationVersion':'1.0.0'},
                        {**config,'platforms':{}},
                        {**config,'platforms':{'windows-aarch64':{**selected,'bundle':{**bundle,'name':'Novera_1.0.0_arm64-setup.exe'}}}},
                        {**config,'platforms':{'windows-aarch64':{**selected,'commit':'HEAD'}}}]:
            with self.subTest(config=invalid), self.assertRaises(ValueError):
                validation.select_current_candidate(invalid,'windows-aarch64','1.0.1')

if __name__=='__main__':unittest.main()
