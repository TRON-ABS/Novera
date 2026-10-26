import json
from pathlib import Path
import tempfile
import unittest
from worker import validate


class Validation(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.model = Path(self.temp.name)
        self.index = self.model / 'model_index.json'
        self.index.write_text(json.dumps({'_class_name':'StableDiffusionPipeline','unet':['diffusers','UNet2DConditionModel']}))
        self.config = dict(task='image',model=str(self.model),prompt='a picture',width=64,height=64,steps=1,frames=5,fps=8)

    def tearDown(self): self.temp.cleanup()

    def test_local_image_pipeline(self): self.assertEqual(validate(self.config)[1], 'StableDiffusionPipeline')
    def test_rejects_text_model_as_image(self):
        self.index.write_text(json.dumps({'_class_name':'AutoModelForCausalLM'}))
        with self.assertRaises(ValueError): validate(self.config)
    def test_rejects_custom_components(self):
        self.index.write_text(json.dumps({'_class_name':'StableDiffusionPipeline','unet':['custom_module','Unsafe']}))
        with self.assertRaises(ValueError): validate(self.config)
    def test_requires_matching_modality(self):
        with self.assertRaises(ValueError): validate({**self.config,'task':'video'})
    def test_rejects_invalid_dimensions(self):
        for value in [0,65,4096,True]:
            with self.assertRaises(ValueError): validate({**self.config,'width':value})
    def test_rejects_invalid_limits(self):
        for field in ['steps','frames','fps']:
            with self.assertRaises(ValueError): validate({**self.config,field:0})
    def test_requires_prompt(self):
        with self.assertRaises(ValueError): validate({**self.config,'prompt':'  '})
    def test_recognizes_a_separate_image_to_video_pipeline(self):
        self.index.write_text(json.dumps({'_class_name':'CogVideoXImageToVideoPipeline'}))
        self.assertEqual(validate({**self.config,'task':'video'})[1], 'CogVideoXImageToVideoPipeline')


if __name__=='__main__': unittest.main()
