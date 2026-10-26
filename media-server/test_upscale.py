import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import numpy as np
import torch
from PIL import Image
import upscale as engine
import worker


class Upscaling(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.source = self.root / 'source.png'
        # Cross a tile boundary without requiring a large model in unit tests.
        Image.new('RGB', (130, 16), (120, 60, 20)).save(self.source)
        self.model = self.root / 'tiny.pth'
        self.factory = engine.network
        torch.set_num_threads(2)
        torch.save({'params_ema': self.factory(2, blocks=1).state_dict()}, self.model)
        self.config = dict(upscale_factor=2, upscale_model=str(self.model), device='cpu',
                           input_image=str(self.source), staged_output=str(self.root/'result.png'))

    def tearDown(self):
        self.temp.cleanup()

    def test_tiled_output_size_and_tensor_only_checkpoint_loading(self):
        reports = []
        with patch.object(engine, 'network', side_effect=lambda scale: self.factory(scale, blocks=1)), \
                patch('torch.load', wraps=torch.load) as load:
            engine.upscale(self.config, lambda **value: reports.append(value))
        self.assertTrue(load.call_args.kwargs['weights_only'])
        with Image.open(self.config['staged_output']) as image:
            self.assertEqual(image.size, (260, 32))
            self.assertTrue(np.isfinite(np.asarray(image)).all())
        self.assertEqual(len(reports), 2)
        self.assertEqual(reports[-1], dict(stage='upscaling', progress=100))

    def test_wrong_scale_checkpoint_is_rejected_without_output(self):
        with patch.object(engine, 'network', side_effect=lambda scale: self.factory(scale, blocks=1)):
            with self.assertRaises(RuntimeError):
                engine.upscale({**self.config, 'upscale_factor':4})
        self.assertFalse(Path(self.config['staged_output']).exists())

    def test_invalid_factors_are_rejected(self):
        for factor in (0, 1, 3, 8, True, '2'):
            with self.subTest(factor=factor), self.assertRaises(ValueError):
                engine.upscale({**self.config, 'upscale_factor':factor})

    def test_diffusion_defers_publication_until_upscaling_finishes(self):
        output = self.root/'final.png'
        config = dict(task='image', output=str(output), staged_output=str(self.root/'staged.png'),
                      upscale_factor=2, upscale_metadata=str(self.root/'generated.json'), seed=123)
        result = type('Result', (), {'images':[Image.new('RGB', (16,16))]})()
        worker.publish(config, result, 'test', 'cpu')
        self.assertTrue(Path(config['staged_output']).exists())
        self.assertFalse(output.exists())
        self.assertFalse(output.with_suffix('.png.json').exists())
        metadata = json.loads(Path(config['upscale_metadata']).read_text())
        self.assertEqual(metadata['seed'], 123)


if __name__ == '__main__':
    unittest.main()
