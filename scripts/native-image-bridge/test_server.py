"""Loopback/protocol/process tests; the fixture is NOT an inference benchmark."""
import hashlib
import http.client
import json
from pathlib import Path
import sys
import tempfile
import threading
import time
import unittest
import uuid
import server


REQUEST = {'prompt': 'cube', 'width': 64, 'height': 64, 'steps': 4, 'seed': 42, 'upscale': False}


class FixtureConfig:
    def __init__(self, directory):
        self.library = directory
        self.upscaler = True
        self.engine_hash = 'a'*64
        self.delay = 0
        self.wrong_dimensions = False
        self.script = directory/'fixture.py'
        self.script.write_text('''import struct,zlib,sys,time
from pathlib import Path
time.sleep(float(sys.argv[4]))
w,h=int(sys.argv[2]),int(sys.argv[3])
def chunk(kind,data): return struct.pack('>I',len(data))+kind+data+struct.pack('>I',zlib.crc32(kind+data))
data=b'\\x89PNG\\r\\n\\x1a\\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',w,h,8,2,0,0,0))+chunk(b'IDAT',zlib.compress((b'\\x00'+b'\\x00'*(w*3))*h))+chunk(b'IEND',b'')
Path(sys.argv[1]).write_bytes(data)
print('sampling completed, taking 0.20s')
''')

    def command(self, request, output):
        factor = 2 if request['upscale'] and not self.wrong_dimensions else 1
        return [sys.executable, str(self.script), str(output), str(request['width']*factor), str(request['height']*factor), str(self.delay)]


class Protocol(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='novera-bridge-test-')
        self.root = Path(self.temp.name)
        self.config = FixtureConfig(self.root)
        self.bridge = server.Bridge(self.config, self.root)
        self.token, self.origin = 'b'*64, 'http://127.0.0.1:5197'
        self.http = server.ThreadingHTTPServer(('127.0.0.1', 0), server.handler_type(self.bridge, self.token, self.origin))
        self.http.daemon_threads = True
        self.thread = threading.Thread(target=self.http.serve_forever, daemon=True)
        self.thread.start()

    def tearDown(self):
        for ident in list(self.bridge.jobs):
            self.bridge.cancel(ident)
        for job in self.bridge.jobs.values():
            job['thread'].join(timeout=3)
        self.http.shutdown(); self.http.server_close(); self.thread.join(timeout=3)
        self.temp.cleanup()

    def request(self, method, path, value=None, **headers):
        connection = http.client.HTTPConnection(*self.http.server_address, timeout=5)
        body = json.dumps(value) if value is not None else None
        fields = {'Origin': self.origin, 'Authorization': 'Bearer '+self.token, **({'Content-Type': 'application/json'} if body else {}), **headers}
        connection.request(method, path, body, fields)
        response = connection.getresponse()
        result = response.status, dict(response.getheaders()), response.read()
        connection.close()
        return result

    def finish(self, ident):
        self.bridge.jobs[ident]['thread'].join(timeout=5)
        self.assertFalse(self.bridge.jobs[ident]['thread'].is_alive())
        return self.bridge.public(ident)

    def test_origin_host_token_and_no_wildcard_cors(self):
        for override, expected in [({'Origin': 'https://untrusted.example'}, 403), ({'Origin': 'null'}, 403), ({'Host': 'attacker.example'}, 403), ({'Authorization': 'Bearer wrong'}, 401), ({'Authorization': 'Bearer é'}, 401)]:
            with self.subTest(override=override):
                status, headers, _ = self.request('GET', '/v1/health', **override)
                self.assertEqual(status, expected)
                self.assertNotEqual(headers.get('Access-Control-Allow-Origin'), '*')
        status, headers, data = self.request('GET', '/v1/health')
        self.assertEqual(status, 200)
        self.assertEqual(headers['Access-Control-Allow-Origin'], self.origin)
        self.assertEqual(json.loads(data)['version'], '1.0.1')
        self.assertNotIn(self.token.encode(), data)

    def test_private_network_preflight_is_restricted(self):
        status, headers, _ = self.request('OPTIONS', '/v1/jobs', **{'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'authorization, content-type', 'Access-Control-Request-Private-Network': 'true'})
        self.assertEqual(status, 204)
        self.assertEqual(headers['Access-Control-Allow-Private-Network'], 'true')
        self.assertEqual(self.request('OPTIONS', '/v1/jobs', **{'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'x-executable'})[0], 403)

    def test_paths_and_native_arguments_cannot_be_supplied(self):
        for change in [{'engine': 'anything.exe'}, {'output': '../private.png'}, {'width': True}, {'height': 65}, {'steps': 0}, {'seed': -1}, {'upscale': 'yes'}, {'id': '../private'}]:
            with self.subTest(change=change):
                self.assertEqual(self.request('POST', '/v1/jobs', {**REQUEST, **change})[0], 400)
                self.assertIsNone(self.bridge.active)
        self.assertEqual(self.request('GET', '/../../private')[0], 404)

    def test_complete_png_and_measured_phases(self):
        ident = str(uuid.uuid4())
        self.assertEqual(self.request('POST', '/v1/jobs', {**REQUEST, 'id': ident, 'upscale': True})[0], 202)
        result = self.finish(ident)
        self.assertEqual((result['status'], result['width'], result['height']), ('complete', 128, 128))
        self.assertEqual(result['timings']['diffusionMs'], 200)
        self.assertGreater(result['timings']['nativeTotalMs'], 0)
        status, headers, data = self.request('GET', '/v1/jobs/'+ident+'/image')
        self.assertEqual((status, headers['Content-Type']), (200, 'image/png'))
        self.assertTrue(data.startswith(b'\x89PNG'))

    def test_success_exit_cannot_silently_skip_x2(self):
        self.config.wrong_dimensions = True
        ident = self.bridge.start({**REQUEST, 'upscale': True})
        result = self.finish(ident)
        self.assertEqual(result['status'], 'error')
        self.assertIn('Dimensions', result['error'])
        self.assertFalse(self.bridge.jobs[ident]['output'].exists())

    def test_single_job_and_real_process_cancellation(self):
        self.config.delay = 30
        ident = self.bridge.start(REQUEST)
        self.assertEqual(self.request('POST', '/v1/jobs', REQUEST)[0], 409)
        self.assertEqual(self.request('DELETE', '/v1/jobs/'+ident)[0], 200)
        self.assertEqual(self.finish(ident)['status'], 'cancelled')
        self.assertIsNone(self.bridge.active)
        process = self.bridge.jobs[ident]['process']
        self.assertTrue(process is None or process.poll() is not None)

    def test_cancel_before_post_prevents_orphan_process(self):
        ident = str(uuid.uuid4())
        self.assertEqual(self.request('DELETE', '/v1/jobs/'+ident)[0], 200)
        self.assertEqual(self.request('POST', '/v1/jobs', {**REQUEST, 'id': ident})[0], 400)
        self.assertFalse(self.bridge.jobs)


class Configuration(unittest.TestCase):
    def test_manifest_detects_a_changed_executable(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            exe = root/'sd-cli.exe'; exe.write_bytes(b'fixture, never executed')
            (root/'BUILD-VERIFICATION.json').write_text(json.dumps({'artifacts': [{'name': exe.name, 'bytes': exe.stat().st_size, 'sha256': hashlib.sha256(exe.read_bytes()).hexdigest()}]}))
            models = {key: str(root/(key+'.gguf')) for key in ('diffusion', 'encoder', 'vae')}
            for file in models.values(): Path(file).write_bytes(b'fixture model')
            config = {'engine': str(exe), **models}
            instance = server.Configuration(config)
            arguments = instance.command(REQUEST, root/'result.png')
            self.assertEqual(arguments[arguments.index('-p')+1], 'cube')
            exe.write_bytes(b'tampered')
            with self.assertRaisesRegex(ValueError, 'manifeste'):
                server.Configuration(config)


if __name__ == '__main__': unittest.main()
