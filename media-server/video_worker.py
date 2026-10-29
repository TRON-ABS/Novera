"""Bounded Wan clips, decoded and streamed to one browser-playable MP4.

The shipped sd-cli can fall back to AVI even for a .webm output name.
Use its AVI explicitly; never trust an extension as a container signature.
"""
import ctypes
import json
import os
import codecs
import re
from pathlib import Path
import subprocess
import sys
import time

from worker import emit, watch_parent


def own_process_tree():
    """A killed Windows worker also terminates its engine and ffmpeg children."""
    if os.name != 'nt':
        return None
    from ctypes import wintypes
    kernel = ctypes.WinDLL('kernel32', use_last_error=True)
    class Basic(ctypes.Structure):
        _fields_ = [('process_time', ctypes.c_int64), ('job_time', ctypes.c_int64),
                    ('flags', wintypes.DWORD), ('min_ws', ctypes.c_size_t),
                    ('max_ws', ctypes.c_size_t), ('active', wintypes.DWORD),
                    ('affinity', ctypes.c_size_t), ('priority', wintypes.DWORD),
                    ('scheduling', wintypes.DWORD)]
    class IO(ctypes.Structure):
        _fields_ = [(name, ctypes.c_uint64) for name in ('read_ops', 'write_ops', 'other_ops', 'read_bytes', 'write_bytes', 'other_bytes')]
    class Limits(ctypes.Structure):
        _fields_ = [('basic', Basic), ('io', IO), ('process_mem', ctypes.c_size_t),
                    ('job_mem', ctypes.c_size_t), ('peak_process', ctypes.c_size_t), ('peak_job', ctypes.c_size_t)]
    kernel.CreateJobObjectW.restype = wintypes.HANDLE
    kernel.CreateJobObjectW.argtypes = [ctypes.c_void_p, wintypes.LPCWSTR]
    kernel.SetInformationJobObject.argtypes = [wintypes.HANDLE, ctypes.c_int, ctypes.c_void_p, wintypes.DWORD]
    kernel.AssignProcessToJobObject.argtypes = [wintypes.HANDLE, wintypes.HANDLE]
    kernel.GetCurrentProcess.restype = wintypes.HANDLE
    handle = kernel.CreateJobObjectW(None, None)
    limits = Limits()
    limits.basic.flags = 0x2000  # JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE
    if not handle or not kernel.SetInformationJobObject(handle, 9, ctypes.byref(limits), ctypes.sizeof(limits)) or not kernel.AssignProcessToJobObject(handle, kernel.GetCurrentProcess()):
        raise OSError(ctypes.get_last_error(), 'Cannot supervise video processes')
    # Keep the raw handle open until process exit. Windows then kills descendants.
    return handle


def clip_plan(duration, fps, capacity):
    if isinstance(duration, bool) or not isinstance(duration, int) or not 1 <= duration <= 3600:
        raise ValueError('Video duration must be 1..3600 seconds')
    if isinstance(fps, bool) or not isinstance(fps, int) or not 1 <= fps <= 60:
        raise ValueError('Video FPS must be 1..60')
    if isinstance(capacity, bool) or not isinstance(capacity, int) or not 5 <= capacity <= 257 or capacity % 4 != 1:
        raise ValueError('Wan clip size must be 4n+1 frames, within 5..257')
    # Iterator: even one hour never allocates an hour of frames in RAM or VRAM.
    remaining = duration * fps
    while remaining:
        take = min(remaining, capacity - 1)
        generated = ((take + 3) // 4) * 4 + 1
        yield generated, take
        remaining -= take


def replace_arg(argv, name, value):
    result = list(argv)
    result[result.index(name) + 1] = str(value)
    return result


class CppProgress:
    """Read real sampling/decoding work, never model-transfer byte counters."""
    def __init__(self, steps):
        self.steps = steps
        self.started = False
        self.decoding = False
        self.fraction = -1

    def feed(self, line):
        line = re.sub(r'\x1b\[[0-?]*[ -/]*[@-~]', '', line)
        value = None
        if re.search(r'^\[I\]\s+generate_video\s+\d+x\d+x\d+', line):
            self.started = True
            value = 0
        elif re.match(r'^\[I\]\s+sampling completed\b', line):
            self.started = self.decoding = True
            value = .9
        elif re.match(r'^\[I\]\s+generate_video completed\b', line):
            self.started = True
            value = 1
        else:
            match = re.search(r'^\s*\|[^|]*\|\s*(\d+)\s*/\s*(\d+)\s*-\s*[\d.]+\s*(?:s/it|it/s)\b', line)
            if match:
                done, total = map(int, match.groups())
                if 0 < done <= total and (self.decoding or total == self.steps):
                    self.started = True
                    value = .9 + .1*done/total if self.decoding else .9*done/total
        if value is not None and value > self.fraction:
            self.fraction = value
            return value
        return None


def run_cpp_clip(argv, cwd, steps, on_progress):
    parser = CppProgress(steps)
    decoder = codecs.getincrementaldecoder('utf-8')(errors='replace')
    pending = ''
    with subprocess.Popen(argv, cwd=cwd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                          bufsize=0, creationflags=0x08000000 if os.name == 'nt' else 0) as process:
        try:
            while True:
                chunk = os.read(process.stdout.fileno(), 4096)
                if not chunk:
                    break
                text = decoder.decode(chunk)
                # Preserve diagnostics, but never accept engine JSON as worker progress.
                sys.stderr.write(text)
                sys.stderr.flush()
                pending += text
                lines = re.split(r'[\r\n]', pending)
                pending = lines.pop()
                for line in lines:
                    fraction = parser.feed(line)
                    if fraction is not None:
                        on_progress(fraction)
                # Bound unfinished/malformed log lines without buffering the full job.
                pending = pending[-16384:]
            pending += decoder.decode(b'', final=True)
            fraction = parser.feed(pending)
            if fraction is not None:
                on_progress(fraction)
            code = process.wait()
            if code:
                raise RuntimeError(f'Wan engine exited with code {code}; see error.log')
        except BaseException:
            if process.poll() is None:
                process.terminate()
                try:
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    process.kill()
                    process.wait()
            raise


def publish(config, metadata):
    output, staged = Path(config['output']), Path(config['staged_output'])
    sidecar = output.with_suffix(output.suffix + '.json')
    if output.exists():
        raise ValueError('Output already exists')
    with sidecar.open('x', encoding='utf-8') as handle:
        json.dump(metadata, handle, ensure_ascii=False, indent=2)
    try:
        if os.name == 'nt':
            os.rename(staged, output)
        else:
            os.link(staged, output)
            staged.unlink()
    except BaseException:
        sidecar.unlink(missing_ok=True)
        raise


def validate_export(path, size, duration, fps):
    import imageio_ffmpeg
    with Path(path).open('rb') as handle:
        if handle.read(12)[4:8] != b'ftyp':
            raise ValueError('Video encoder did not return an MP4 container')
    reader = imageio_ffmpeg.read_frames(str(path), pix_fmt='rgb24')
    try:
        info = next(reader)
        next(reader)  # A header without a decodable first frame is not a result.
        if tuple(info['size']) != tuple(size) or abs(info['fps'] - fps) > 0.01 or abs(info['duration'] - duration) > 1/fps + 0.05:
            raise ValueError('Encoded video dimensions, cadence or duration do not match the request')
    finally:
        reader.close()


def run(config):
    import imageio_ffmpeg
    if Path(config['output']).exists():
        raise ValueError('Output already exists')
    started = time.monotonic()
    duration = config.get('duration_seconds')
    if duration is None:
        duration = 5
    plan = clip_plan(duration, config['fps'], config['frames'])
    # Resolve the bundled imageio ffmpeg before doing expensive generation.
    imageio_ffmpeg.get_ffmpeg_exe()
    staged = Path(config['staged_output'])
    clip = Path(config['video_command'][config['video_command'].index('--output') + 1])
    size = config['width'], config['height']
    writer = None
    emitted, segments = 0, 0
    try:
        for index, (generated, take) in enumerate(plan):
            emit(stage='loading', progress=-1)
            argv = replace_arg(config['video_command'], '--video-frames', generated)
            argv = replace_arg(argv, '--seed', (config['seed'] + index) % (2**32))
            def progress(fraction):
                emit(stage='generating', progress=min(98, int(98*(emitted+take*fraction)/(duration*config['fps']))))
            run_cpp_clip(argv, config.get('video_cwd'), config.get('steps', 20), progress)
            progress(1)
            reader = imageio_ffmpeg.read_frames(str(clip), pix_fmt='rgb24')
            try:
                info = next(reader)
                if tuple(info['size']) != size:
                    raise ValueError('Video clip dimensions do not match the request')
                if writer is None:
                    writer = imageio_ffmpeg.write_frames(str(staged), size, fps=config['fps'], codec='libx264',
                                                        pix_fmt_in='rgb24', pix_fmt_out='yuv420p',
                                                        output_params=['-movflags', '+faststart'], ffmpeg_log_level='error')
                    writer.send(None)
                received = 0
                for frame in reader:
                    if received >= take:
                        break
                    writer.send(frame)
                    received += 1
                if received != take:
                    raise ValueError(f'Video clip has only {received}/{take} required frames')
            finally:
                reader.close()
                clip.unlink(missing_ok=True)
            emitted += take
            segments += 1
            emit(stage='generating', progress=min(98, int(98 * emitted / (duration * config['fps']))))
        emit(stage='finalizing', progress=98)
        writer.close()
        writer = None
        emit(stage='finalizing', progress=99)
        validate_export(staged, size, duration, config['fps'])
        elapsed = time.monotonic() - started
        metadata = {key: value for key, value in config.items() if key not in ('staged_output', 'video_command', 'video_cwd', 'parent_pid', 'input_image')}
        metadata.update(generation_seconds=elapsed, total_seconds=elapsed, duration_seconds=duration,
                        output_frames=emitted, segments=segments, container='mp4', codec='h264')
        publish(config, metadata)
        emit(stage='done', progress=100, generation_seconds=elapsed)
    finally:
        if writer is not None:
            writer.close()
        clip.unlink(missing_ok=True)
        staged.unlink(missing_ok=True)


def run_diffusers_video(pipeline, args, config, device):
    """Keep the loaded pipeline, but encode and release each bounded clip."""
    import imageio_ffmpeg
    import numpy as np
    import torch
    import diffusers
    if Path(config['output']).exists():
        raise ValueError('Output already exists')
    started = time.monotonic()
    imageio_ffmpeg.get_ffmpeg_exe()
    duration = config['duration_seconds']
    staged = Path(config['staged_output'])
    size = config['width'], config['height']
    writer = None
    emitted, segments = 0, 0
    try:
        for index, (generated, take) in enumerate(clip_plan(duration, config['fps'], config['frames'])):
            clip_args = {**args, 'num_frames': generated}
            if 'generator' in clip_args:
                clip_args['generator'] = torch.Generator(device=device).manual_seed((config['seed'] + index) % (2**32))
            emit(stage='generating', progress=min(98, int(98*emitted/(duration*config['fps']))))
            if 'callback_on_step_end' in clip_args:
                def progress(_pipeline, step, _timestep, callback_kwargs):
                    fraction = min(1, (step+1)/clip_args['num_inference_steps'])
                    emit(stage='generating', progress=min(98, int(98*(emitted+take*.9*fraction)/(duration*config['fps']))))
                    return callback_kwargs
                clip_args['callback_on_step_end'] = progress
            with torch.inference_mode():
                result = pipeline(**clip_args)
            if writer is None:
                writer = imageio_ffmpeg.write_frames(str(staged), size, fps=config['fps'], codec='libx264',
                                                    pix_fmt_in='rgb24', pix_fmt_out='yuv420p',
                                                    output_params=['-movflags', '+faststart'], ffmpeg_log_level='error')
                writer.send(None)
            if len(result.frames[0]) < take:
                raise ValueError('Video pipeline returned too few frames')
            for frame in result.frames[0][:take]:
                frame = np.asarray(frame)
                if frame.dtype.kind == 'f':
                    frame = (frame.clip(0, 1) * 255).round().astype('uint8')
                if frame.shape != (size[1], size[0], 3) or frame.dtype != np.uint8:
                    raise ValueError('Video pipeline returned an unsupported frame')
                writer.send(np.ascontiguousarray(frame).tobytes())
            del result
            emitted += take
            segments += 1
            emit(stage='generating', progress=min(98, int(98 * emitted / (duration * config['fps']))))
        emit(stage='finalizing', progress=98)
        writer.close()
        writer = None
        emit(stage='finalizing', progress=99)
        validate_export(staged, size, duration, config['fps'])
        elapsed = time.monotonic() - started
        metadata = {key: value for key, value in config.items() if key not in ('staged_output', 'parent_pid', 'input_image')}
        metadata.update(generation_seconds=elapsed, total_seconds=elapsed, duration_seconds=duration,
                        output_frames=emitted, segments=segments, container='mp4', codec='h264',
                        pipeline=type(pipeline).__name__, device=device, torch=torch.__version__, diffusers=diffusers.__version__)
        publish(config, metadata)
        emit(stage='done', progress=100, generation_seconds=elapsed)
    finally:
        if writer is not None:
            writer.close()
        staged.unlink(missing_ok=True)


if __name__ == '__main__':
    try:
        supervision = own_process_tree()
        config = json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
        if config.get('parent_pid'):
            watch_parent(config['parent_pid'])
        run(config)
    except Exception as error:
        emit(stage='error', error=str(error))
        sys.exit(1)
