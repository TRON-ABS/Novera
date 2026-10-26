"""Offline tiled RRDB inference for official Real-ESRGAN x2plus/x4plus weights.

Uses the configured media Python environment (PyTorch, Pillow, NumPy).
Checkpoint tensors are loaded with weights_only=True, never arbitrary code.
Network topology: https://github.com/xinntao/Real-ESRGAN
"""
import json
from pathlib import Path
import sys


def network(scale, blocks=23):
    import torch
    from torch import nn
    from torch.nn import functional as F

    class Dense(nn.Module):
        def __init__(self):
            super().__init__()
            for i in range(1, 6):
                setattr(self, f'conv{i}', nn.Conv2d(64 + (i-1)*32, 64 if i == 5 else 32, 3, 1, 1))

        def forward(self, x):
            features = [x]
            for i in range(1, 6):
                value = getattr(self, f'conv{i}')(torch.cat(features, dim=1))
                if i < 5:
                    features.append(F.leaky_relu(value, 0.2))
            return x + value * 0.2

    class RRDB(nn.Module):
        def __init__(self):
            super().__init__()
            self.rdb1, self.rdb2, self.rdb3 = Dense(), Dense(), Dense()

        def forward(self, x):
            return x + self.rdb3(self.rdb2(self.rdb1(x))) * 0.2

    class RRDBNet(nn.Module):
        def __init__(self):
            super().__init__()
            self.conv_first = nn.Conv2d(12 if scale == 2 else 3, 64, 3, 1, 1)
            self.body = nn.Sequential(*(RRDB() for _ in range(blocks)))
            for name in ('conv_body', 'conv_up1', 'conv_up2', 'conv_hr'):
                setattr(self, name, nn.Conv2d(64, 64, 3, 1, 1))
            self.conv_last = nn.Conv2d(64, 3, 3, 1, 1)

        def forward(self, x):
            if scale == 2:
                x = F.pixel_unshuffle(x, 2)
            initial = self.conv_first(x)
            x = initial + self.conv_body(self.body(initial))
            for name in ('conv_up1', 'conv_up2'):
                x = F.leaky_relu(getattr(self, name)(F.interpolate(x, scale_factor=2, mode='nearest')), 0.2)
            return self.conv_last(F.leaky_relu(self.conv_hr(x), 0.2))

    return RRDBNet()


def upscale(config, emit=lambda **data: None):
    import numpy as np
    import torch
    from PIL import Image
    factor = config.get('upscale_factor')
    if type(factor) is not int or factor not in (2, 4):
        raise ValueError('CREATION_UPSCALE_INVALID')
    model_path = Path(config['upscale_model']).resolve(strict=True)
    if model_path.suffix.lower() != '.pth':
        raise ValueError('CREATION_UPSCALE_INVALID')
    requested = config.get('device', 'auto')
    if requested not in ('cpu', 'cuda', 'auto'):
        raise ValueError('CREATION_UPSCALE_INVALID')
    if requested == 'cuda' and not torch.cuda.is_available():
        raise ValueError('CUDA unavailable for upscaling')
    device = 'cuda' if requested != 'cpu' and torch.cuda.is_available() else 'cpu'
    torch.set_num_threads(min(4, torch.get_num_threads()))
    checkpoint = torch.load(model_path, map_location='cpu', weights_only=True)
    weights = checkpoint.get('params_ema', checkpoint.get('params', checkpoint))
    model = network(factor)
    model.load_state_dict(weights, strict=True)
    del checkpoint, weights
    model = model.eval().to(device)
    source = Image.open(config['input_image']).convert('RGB')
    width, height = source.size
    if not (1 <= width <= 2048 and 1 <= height <= 2048) or width % 2 or height % 2:
        raise ValueError('CREATION_UPSCALE_INVALID_DIMENSIONS')
    # Keep only one small padded tile on the accelerator and uint8 output on CPU.
    pixels = np.asarray(source)
    output = np.empty((height*factor, width*factor, 3), dtype=np.uint8)
    tile, padding = 128, 16
    count = ((width+tile-1)//tile)*((height+tile-1)//tile)
    done = 0
    with torch.inference_mode():
        for y in range(0, height, tile):
            for x in range(0, width, tile):
                right, bottom = min(x+tile, width), min(y+tile, height)
                left_pad, top_pad = max(0, x-padding), max(0, y-padding)
                right_pad, bottom_pad = min(width, right+padding), min(height, bottom+padding)
                array = np.array(pixels[top_pad:bottom_pad, left_pad:right_pad], copy=True)
                value = torch.from_numpy(array).permute(2, 0, 1).unsqueeze(0).float().div_(255).to(device)
                result = model(value).clamp_(0, 1).squeeze(0).permute(1, 2, 0)
                result = result.mul_(255).round_().byte().cpu().numpy()
                crop_x, crop_y = (x-left_pad)*factor, (y-top_pad)*factor
                output[y*factor:bottom*factor, x*factor:right*factor] = result[
                    crop_y:crop_y+(bottom-y)*factor, crop_x:crop_x+(right-x)*factor]
                done += 1
                emit(stage='upscaling', progress=round(100*done/count))
    Image.fromarray(output).save(config['staged_output'], format='PNG')


if __name__ == '__main__':
    from worker import watch_parent, emit
    config = json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
    watch_parent(int(config['parent_pid']))
    try:
        upscale(config, emit)
    except Exception as error:
        emit(stage='error', error=f'CREATION_UPSCALE: {error}')
        raise
