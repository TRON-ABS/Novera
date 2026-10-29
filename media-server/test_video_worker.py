import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import time
import ctypes
import unittest
from unittest.mock import patch

import imageio_ffmpeg
from video_worker import CppProgress, clip_plan, run, run_diffusers_video


class VideoDuration(unittest.TestCase):
    def test_engine_progress_distinguishes_model_bytes_sampling_and_decoding(self):
        parser = CppProgress(20)
        self.assertIsNone(parser.feed('|########| 20/20 - 650.00MB/s'))
        self.assertIsNone(parser.feed('{"stage":"done","progress":100}'))
        self.assertIsNone(parser.feed('[I] prompt: generate_video 512x224x81'))
        self.assertIsNone(parser.feed('[I] prompt: |==>| 20/20 - 0.01s/it'))
        self.assertEqual(parser.feed('[I] generate_video 512x224x81 --- video.cpp:1679'), 0)
        self.assertAlmostEqual(parser.feed('|====>| 5/20 - 5.67s/it - ETA 01:47\x1b[K'), .225)
        self.assertAlmostEqual(parser.feed('|====>| 10/20 - 2.00it/s'), .45)
        self.assertIsNone(parser.feed('|====>| 8/20 - 2.00it/s'))
        self.assertAlmostEqual(parser.feed('[I] sampling completed, taking 90.75s'), .9)
        self.assertAlmostEqual(parser.feed('|====>| 3/6 - 2.67s/it'), .95)
        self.assertEqual(parser.feed('[I] generate_video completed in 122.98s'), 1)
    def test_exact_duration_and_bounded_memory_plan(self):
        for fps in (1, 16, 24, 60):
            for seconds in (1, 3, 5, 60, 3600):
                clips = list(clip_plan(seconds, fps, 81))
                self.assertEqual(sum(take for _, take in clips), seconds * fps)
                self.assertTrue(all(5 <= frames <= 81 and frames % 4 == 1 and take < frames for frames, take in clips))

    def test_invalid_duration_frame_and_fps_values(self):
        for duration, fps, capacity in [(0,16,81),(3601,16,81),(True,16,81),(5,0,81),(5,61,81),(5,16,1),(5,16,80),(5,16,261)]:
            with self.assertRaises(ValueError): list(clip_plan(duration, fps, capacity))

    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)

    def tearDown(self):
        self.temp.cleanup()

    def fixture(self):
        fixture = self.root / 'source.avi'
        subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), '-v', 'error', '-f', 'lavfi', '-i',
                        'color=c=red:s=64x64:r=4', '-frames:v', '5', '-c:v', 'mjpeg', str(fixture)], check=True)
        script = self.root / 'fake_engine.py'
        script.write_text('import shutil,sys\nshutil.copyfile(sys.argv[1],sys.argv[sys.argv.index("--output")+1])\n')
        return dict(duration_seconds=2, fps=4, frames=5, width=64, height=64, seed=42,
                    video_command=[sys.executable, str(script), str(fixture), '--output', str(self.root/'clip.avi'), '--video-frames','5','--seed','42'],
                    output=str(self.root/'final.mp4'), staged_output=str(self.root/'final.partial.mp4'))

    def test_avi_clips_export_to_one_exact_duration_h264_mp4(self):
        config = self.fixture()
        run(config)
        output = Path(config['output'])
        frames, duration = imageio_ffmpeg.count_frames_and_secs(str(output))
        self.assertEqual(frames, 8)
        self.assertAlmostEqual(duration, 2, places=2)
        self.assertIn(b'ftyp', output.read_bytes()[:16])
        metadata = json.loads(output.with_suffix('.mp4.json').read_text())
        self.assertEqual(metadata['segments'], 2)
        self.assertEqual(metadata['output_frames'], 8)
        self.assertFalse(Path(config['staged_output']).exists())
        self.assertFalse((self.root/'clip.avi').exists())

    def test_progress_reaches_generation_before_engine_exit_and_finalizes_before_done(self):
        config = self.fixture()
        config['steps'] = 2
        engine = Path(config['video_command'][1])
        engine.write_text('import shutil,sys\n'
                          'print("|########| 2/2 - 10.00MB/s", flush=True)\n'
                          'print("[I] generate_video 64x64x5", flush=True)\n'
                          'print("|==>| 1/2 - 0.01s/it\\r|====| 2/2 - 100.00it/s", flush=True)\n'
                          'print("[I] sampling completed", flush=True)\n'
                          'print("|====| 1/1 - 0.01s/it", flush=True)\n'
                          'shutil.copyfile(sys.argv[1],sys.argv[sys.argv.index("--output")+1])\n')
        events = []
        with patch('video_worker.emit', side_effect=lambda **event: events.append(event)):
            run(config)
        self.assertEqual(events[0], {'stage':'loading','progress':-1})
        self.assertTrue(any(e['stage']=='generating' and 0<e['progress']<49 for e in events))
        self.assertTrue(all(e['progress']<100 for e in events if e['stage']!='done'))
        values=[e['progress'] for e in events if e['progress']>=0]
        self.assertEqual(values, sorted(values))
        self.assertEqual([e['stage'] for e in events[-3:]], ['finalizing','finalizing','done'])

    def test_failure_does_not_publish_a_partial_video(self):
        config = self.fixture()
        config['video_command'] = [sys.executable, '-c', 'import sys;sys.exit(7)', '--output', str(self.root/'clip.avi'), '--video-frames','5','--seed','42']
        with self.assertRaisesRegex(RuntimeError, 'code 7'): run(config)
        self.assertFalse(Path(config['output']).exists())
        self.assertFalse(Path(config['output']+'.json').exists())
        self.assertFalse(Path(config['staged_output']).exists())

    def test_existing_user_video_is_preserved(self):
        config = self.fixture()
        Path(config['output']).write_bytes(b'preserve this creation')
        with self.assertRaisesRegex(ValueError, 'already exists'): run(config)
        self.assertEqual(Path(config['output']).read_bytes(), b'preserve this creation')

    def test_diffusers_clips_use_the_same_exact_duration_export(self):
        import numpy as np
        from types import SimpleNamespace
        class Pipeline:
            def __call__(self, **args):
                if 'callback_on_step_end' in args:
                    for step in range(args['num_inference_steps']):
                        args['callback_on_step_end'](self, step, 0, {})
                return SimpleNamespace(frames=[np.zeros((args['num_frames'],64,64,3), dtype=np.float32)])
        config = dict(duration_seconds=2, fps=4, frames=5, width=64, height=64, seed=42,
                      output=str(self.root/'diffusers.mp4'), staged_output=str(self.root/'diffusers.partial.mp4'))
        events = []
        with patch('video_worker.emit', side_effect=lambda **event: events.append(event)):
            run_diffusers_video(Pipeline(), {'num_inference_steps':3,'callback_on_step_end':lambda *args: self.fail('Raw clip progress must be replaced')}, config, 'cpu')
        self.assertTrue(any(e['stage']=='generating' and 0<e['progress']<49 for e in events))
        self.assertEqual(events[-1]['stage'], 'done')
        frames, duration = imageio_ffmpeg.count_frames_and_secs(config['output'])
        self.assertEqual(frames, 8)
        self.assertAlmostEqual(duration, 2, places=2)

    @unittest.skipUnless(os.name == 'nt', 'Windows process-tree supervision')
    def test_stopping_the_worker_stops_its_owned_engine(self):
        config = self.fixture()
        child_pid = self.root/'child.pid'
        script = self.root/'sleeping_engine.py'
        script.write_text('import os,time\nfrom pathlib import Path\nPath('+repr(str(child_pid))+').write_text(str(os.getpid()))\ntime.sleep(60)\n')
        config['video_command'][1] = str(script)
        request = self.root/'request.json'
        request.write_text(json.dumps(config))
        worker = subprocess.Popen([sys.executable, str(Path(__file__).with_name('video_worker.py')), str(request)],
                                  stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, creationflags=0x08000000)
        handle = None
        kernel = ctypes.WinDLL('kernel32', use_last_error=True)
        kernel.OpenProcess.restype = ctypes.c_void_p
        kernel.OpenProcess.argtypes = [ctypes.c_uint32, ctypes.c_int, ctypes.c_uint32]
        kernel.WaitForSingleObject.argtypes = [ctypes.c_void_p, ctypes.c_uint32]
        kernel.TerminateProcess.argtypes = [ctypes.c_void_p, ctypes.c_uint32]
        kernel.CloseHandle.argtypes = [ctypes.c_void_p]
        try:
            deadline = time.monotonic()+15
            while not child_pid.exists() and time.monotonic() < deadline and worker.poll() is None:
                time.sleep(0.05)
            self.assertTrue(child_pid.exists(), 'Video worker must launch the owned engine')
            handle = kernel.OpenProcess(0x00100001, False, int(child_pid.read_text()))
            self.assertTrue(handle)
            worker.kill()
            worker.wait(timeout=5)
            self.assertEqual(kernel.WaitForSingleObject(handle, 5000), 0, 'Owned engine must stop with its worker')
        finally:
            if worker.poll() is None:
                worker.kill()
                worker.wait(timeout=5)
            if handle:
                if kernel.WaitForSingleObject(handle, 0) != 0:
                    kernel.TerminateProcess(handle, 1)
                kernel.CloseHandle(handle)


if __name__ == '__main__': unittest.main()
