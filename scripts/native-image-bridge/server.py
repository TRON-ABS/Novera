"""Authenticated, single-origin loopback access to a configured Novera image engine.

No model uploads, arbitrary paths, shell commands, or public listening address.
Run explicitly; importing this module never starts a listener or a process.
"""
import argparse
from collections import deque
import hashlib
import hmac
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import os
from pathlib import Path
import re
import secrets
import signal
import struct
import subprocess
import tempfile
import threading
import time
from urllib.parse import urlsplit
import uuid

VERSION = '1.0.1'
X2_SHA256 = '49fafd45f8fd7aa8d31ab2a22d14d91b536c34494a5cfe31eb5d89c2fa266abb'
FIELDS = {'id', 'prompt', 'width', 'height', 'steps', 'seed', 'upscale'}


def parameters(value):
    if not isinstance(value, dict) or set(value) - FIELDS:
        raise ValueError('Paramètres image inconnus.')
    if not isinstance(value.get('prompt'), str) or not 1 <= len(value['prompt'].strip()) <= 8000:
        raise ValueError('La demande doit contenir entre 1 et 8000 caractères.')
    for name in ('width', 'height'):
        number = value.get(name)
        if type(number) is not int or not 64 <= number <= 2048 or number % 16:
            raise ValueError('Dimensions invalides : multiples de 16, de 64 à 2048.')
    if type(value.get('steps')) is not int or not 1 <= value['steps'] <= 100:
        raise ValueError('Nombre d’étapes invalide.')
    if type(value.get('seed')) is not int or not 0 <= value['seed'] <= 0xffffffff:
        raise ValueError('Graine invalide.')
    if type(value.get('upscale', False)) is not bool:
        raise ValueError('Agrandissement invalide.')
    if 'id' in value and (not isinstance(value['id'], str) or not re.fullmatch(r'[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}', value['id'])):
        raise ValueError('Identifiant de création invalide.')
    return {**value, 'upscale': value.get('upscale', False)}


def png_dimensions(path):
    with Path(path).open('rb') as stream:
        header = stream.read(33)
    if len(header) != 33 or header[:8] != b'\x89PNG\r\n\x1a\n' or header[12:16] != b'IHDR':
        raise ValueError('Le moteur n’a pas produit un PNG valide.')
    return struct.unpack('>II', header[16:24])


class Configuration:
    def __init__(self, value):
        self.engine = Path(value['engine']).resolve(strict=True)
        self.library = Path(value.get('libraryDirectory', self.engine.parent)).resolve(strict=True)
        self.models = [Path(value[name]).resolve(strict=True) for name in ('diffusion', 'encoder', 'vae')]
        if not all(path.is_file() for path in [self.engine, *self.models]) or not self.library.is_dir():
            raise ValueError('Moteur ou modèles locaux manquants.')
        self.backend = value.get('backend', 'cuda0')
        if self.backend not in ('cuda0', 'vulkan0', 'cpu'):
            raise ValueError('Backend natif invalide.')
        self.budget = value.get('budgetGiB', 6)
        if type(self.budget) is not int or not 2 <= self.budget <= 12:
            raise ValueError('Budget natif invalide.')
        self.upscaler = Path(value['upscaler']).resolve(strict=True) if value.get('upscaler') else None
        if self.upscaler:
            with self.upscaler.open('rb') as stream:
                if hashlib.file_digest(stream, 'sha256').hexdigest() != X2_SHA256:
                    raise ValueError('Le modèle RealESRGAN ×2 ne correspond pas au fichier officiel.')
        # Validate the exact executable/library pair, including the x2 fix.
        receipt = json.loads((self.engine.parent / 'BUILD-VERIFICATION.json').read_text())
        for artifact in receipt['artifacts']:
            name = artifact['name']
            if Path(name).name != name or name not in ('sd-cli.exe', 'sd-cli', 'stable-diffusion.dll', 'libstable-diffusion.so', 'libstable-diffusion.dylib'):
                raise ValueError('Manifeste du moteur invalide.')
            path = self.engine.parent / name
            with path.open('rb') as stream:
                digest = hashlib.file_digest(stream, 'sha256').hexdigest()
            if digest != artifact['sha256'] or path.stat().st_size != artifact['bytes']:
                raise ValueError('Le moteur diffère de son manifeste de compilation.')
        if self.engine.name not in [entry['name'] for entry in receipt['artifacts']]:
            raise ValueError('Exécutable absent du manifeste.')
        self.engine_hash = next(entry['sha256'] for entry in receipt['artifacts'] if entry['name'] == self.engine.name)

    def command(self, request, output):
        command = [str(self.engine), '-M', 'img_gen', '--diffusion-model', str(self.models[0]),
                   '--llm', str(self.models[1]), '--vae', str(self.models[2]), '-p', request['prompt'],
                   '-W', str(request['width']), '-H', str(request['height']), '--steps', str(request['steps']),
                   '--seed', str(request['seed']), '--cfg-scale', '1', '--sampling-method', 'euler',
                   '--scheduler', 'flux2', '--flash-attn', 'on', '--backend', self.backend,
                   '--max-vram', str(self.budget), '--preview', 'none', '-o', str(output)]
        if request['upscale']:
            if not self.upscaler:
                raise ValueError('Le modèle RealESRGAN ×2 n’est pas configuré.')
            command += ['--upscale-model', str(self.upscaler), '--upscale-repeats', '1', '--upscale-tile-size', '128']
        return command


def terminate(process):
    if process and process.poll() is None:
        if os.name == 'nt':
            subprocess.run(['taskkill', '/PID', str(process.pid), '/T', '/F'],
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                           creationflags=subprocess.CREATE_NO_WINDOW, check=False)
        else:
            try:
                os.killpg(process.pid, signal.SIGTERM)
            except ProcessLookupError:
                pass


class Bridge:
    def __init__(self, config, directory):
        self.config, self.directory = config, Path(directory)
        self.jobs = {}
        self.lock = threading.Lock()
        self.active = None
        self.cancelled_ids = deque(maxlen=64)

    def start(self, value):
        request = parameters(value)
        if request['upscale'] and not self.config.upscaler:
            raise ValueError('RealESRGAN ×2 n’est pas configuré.')
        with self.lock:
            ident = request.get('id', str(uuid.uuid4()))
            if ident in self.cancelled_ids:
                raise ValueError('Création annulée avant son démarrage.')
            if ident in self.jobs:
                raise RuntimeError('Identifiant déjà utilisé.')
            if self.active:
                raise RuntimeError('Une création native est déjà en cours.')
            # Bound per-session results. Files are private temporary bridge data;
            # the Web client saves completed PNGs in its existing media store.
            if len(self.jobs) >= 16:
                oldest = next(iter(self.jobs))
                self.jobs.pop(oldest)['output'].unlink(missing_ok=True)
            job = dict(id=ident, status='running', stage='loading', progress=0, timings={},
                       cancel=threading.Event(), process=None, output=self.directory / (ident+'.png'),
                       request=request, errors=deque(maxlen=5), started=time.perf_counter())
            self.jobs[ident] = job
            self.active = ident
        job['thread'] = threading.Thread(target=self.run, args=(job,), daemon=True)
        job['thread'].start()
        return ident

    def run(self, job):
        try:
            if job['cancel'].is_set():
                return
            environment = {**os.environ, 'PATH': str(self.config.library)+os.pathsep+os.environ.get('PATH', '')}
            process = subprocess.Popen(self.config.command(job['request'], job['output']),
                                       cwd=self.config.library, env=environment, stdin=subprocess.DEVNULL,
                                       stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True,
                                       encoding='utf-8', errors='replace',
                                       **({'creationflags': subprocess.CREATE_NO_WINDOW} if os.name == 'nt' else {'start_new_session': True}))
            job['process'] = process
            if job['cancel'].is_set():
                terminate(process)
            for line in process.stdout:
                if '[E]' in line or '[ERROR]' in line:
                    job['errors'].append(line.strip()[-500:])
                for marker, key in [('get_learned_condition', 'textEncodingMs'), ('sampling', 'diffusionMs'), ('decode_first_stage', 'decodingMs')]:
                    match = re.search(re.escape(marker)+r' completed, taking ([\d.]+)s', line)
                    if match:
                        job['timings'][key] = float(match[1])*1000
                match = re.search(r'input_image_tensor upscaled, taking ([\d.]+)s', line)
                if match:
                    job['timings']['upscalingMs'] = float(match[1])*1000
                if 'generating image:' in line:
                    job.update(stage='generating', progress=15)
                elif 'decoding ' in line and 'latents' in line:
                    job.update(stage='decoding', progress=85)
                elif 'upscaling from ' in line:
                    job.update(stage='upscaling', progress=90)
            code = process.wait()
            if job['cancel'].is_set():
                job['status'] = 'cancelled'
                return
            if code != 0:
                raise ValueError('Le moteur natif a échoué. '+ ' '.join(job['errors']))
            factor = 2 if job['request']['upscale'] else 1
            expected = (job['request']['width']*factor, job['request']['height']*factor)
            if png_dimensions(job['output']) != expected:
                raise ValueError('Dimensions de sortie incorrectes : le moteur n’a pas réalisé le rendu demandé.')
            if job['errors']:
                raise ValueError('Le moteur a signalé une erreur : '+' '.join(job['errors']))
            job.update(status='complete', stage='complete', progress=100,
                       width=expected[0], height=expected[1])
        except Exception as error:
            job.update(status='cancelled' if job['cancel'].is_set() else 'error', error=str(error))
        finally:
            terminate(job['process'])
            job['timings']['nativeTotalMs'] = (time.perf_counter()-job['started'])*1000
            if job['cancel'].is_set():
                job['status'] = 'cancelled'
            if job['status'] != 'complete':
                job['output'].unlink(missing_ok=True)
            with self.lock:
                if self.active == job['id']:
                    self.active = None

    def cancel(self, ident):
        with self.lock:
            if ident not in self.jobs:
                self.cancelled_ids.append(ident)
                return
            job = self.jobs[ident]
        if job['status'] == 'running':
            job['cancel'].set()
            terminate(job['process'])

    def public(self, ident):
        job = self.jobs[ident]
        return {key: job[key] for key in ('id', 'status', 'stage', 'progress', 'timings', 'width', 'height', 'error') if key in job}


def handler_type(bridge, token, origin):
    class Handler(BaseHTTPRequestHandler):
        protocol_version = 'HTTP/1.1'

        def log_message(self, *_args):
            pass  # Never log authorization headers, connection tokens or prompts.

        def respond(self, status, value=None, image=None):
            body = image if image is not None else json.dumps(value or {}, ensure_ascii=False).encode()
            self.send_response(status)
            if self.headers.get('Origin') == origin:
                self.send_header('Access-Control-Allow-Origin', origin)
                self.send_header('Vary', 'Origin')
            self.send_header('Cache-Control', 'no-store')
            self.send_header('Content-Type', 'image/png' if image is not None else 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.send_header('X-Content-Type-Options', 'nosniff')
            self.end_headers()
            try:
                self.wfile.write(body)
            except (BrokenPipeError, ConnectionResetError):
                pass

        def authorized(self, preflight=False):
            if self.headers.get('Host') != '127.0.0.1:'+str(self.server.server_address[1]) or self.headers.get('Origin') != origin:
                self.respond(403, {'error': 'Origine locale non autorisée.'})
                self.close_connection = True
                return False
            if not preflight and not hmac.compare_digest(self.headers.get('Authorization', '').encode('utf-8'), ('Bearer '+token).encode('ascii')):
                self.respond(401, {'error': 'Connexion locale expirée ou invalide.'})
                self.close_connection = True
                return False
            return True

        def do_OPTIONS(self):
            if not self.authorized(preflight=True):
                return
            headers = {s.strip().lower() for s in self.headers.get('Access-Control-Request-Headers', '').split(',') if s.strip()}
            if headers - {'authorization', 'content-type'} or self.headers.get('Access-Control-Request-Method') not in ('GET', 'POST', 'DELETE'):
                self.respond(403)
                return
            self.send_response(204)
            self.send_header('Access-Control-Allow-Origin', origin)
            self.send_header('Vary', 'Origin')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, DELETE')
            self.send_header('Access-Control-Allow-Headers', 'Authorization, Content-Type')
            self.send_header('Access-Control-Allow-Private-Network', 'true')
            self.send_header('Content-Length', '0')
            self.end_headers()

        def do_GET(self):
            if not self.authorized():
                return
            if self.path == '/v1/health':
                self.respond(200, {'version': VERSION, 'model': 'flux-2-klein-4b-Q4_K_M', 'upscaleX2': bool(bridge.config.upscaler), 'engineSha256': bridge.config.engine_hash})
                return
            match = re.fullmatch(r'/v1/jobs/([0-9a-f-]{36})(/image)?', self.path)
            if not match or match[1] not in bridge.jobs:
                self.respond(404)
                return
            job = bridge.jobs[match[1]]
            if match[2]:
                if job['status'] != 'complete':
                    self.respond(409)
                else:
                    self.respond(200, image=job['output'].read_bytes())
            else:
                self.respond(200, bridge.public(match[1]))

        def do_POST(self):
            if not self.authorized():
                return
            try:
                if self.path != '/v1/jobs':
                    self.respond(404)
                    return
                if self.headers.get('Content-Type') != 'application/json' or self.headers.get('Transfer-Encoding'):
                    raise ValueError('Requête JSON attendue.')
                length = int(self.headers.get('Content-Length', '0'))
                if not 0 < length <= 65536:
                    raise ValueError('Taille de requête invalide.')
                ident = bridge.start(json.loads(self.rfile.read(length)))
                self.respond(202, {'id': ident})
            except (ValueError, KeyError) as error:
                self.respond(400, {'error': str(error)})
                self.close_connection = True
            except RuntimeError as error:
                self.respond(409, {'error': str(error)})

        def do_DELETE(self):
            if not self.authorized():
                return
            match = re.fullmatch(r'/v1/jobs/([0-9a-f-]{36})', self.path)
            if not match:
                self.respond(404)
                return
            bridge.cancel(match[1])
            self.respond(200, bridge.public(match[1]) if match[1] in bridge.jobs else {'id': match[1], 'status': 'cancelled'})

    return Handler


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--config', required=True, type=Path)
    parser.add_argument('--origin', required=True, help='Exact trusted Novera Web origin, e.g. https://your-novera-site.example')
    parser.add_argument('--connection-file', required=True, type=Path)
    args = parser.parse_args()
    origin = urlsplit(args.origin)
    if origin.scheme not in ('https', 'http') or not origin.hostname or origin.username or origin.password or origin.path or origin.query or origin.fragment or (origin.scheme == 'http' and origin.hostname not in ('127.0.0.1', 'localhost')):
        parser.error('Use an exact HTTPS origin, or HTTP localhost for development.')
    config = Configuration(json.loads(args.config.read_text(encoding='utf-8-sig')))
    token = secrets.token_hex(32)
    with tempfile.TemporaryDirectory(prefix='novera-image-bridge-') as directory:
        bridge = Bridge(config, directory)
        server = ThreadingHTTPServer(('127.0.0.1', 0), handler_type(bridge, token, args.origin))
        server.daemon_threads = True
        args.connection_file.parent.mkdir(parents=True, exist_ok=True)
        descriptor = os.open(args.connection_file, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
        with os.fdopen(descriptor, 'w', encoding='utf-8') as stream:
            json.dump({'version': 1, 'origin': args.origin, 'endpoint': 'http://127.0.0.1:'+str(server.server_address[1]), 'token': token}, stream)
        print('Novera Web '+VERSION+' : passerelle native locale prête.', flush=True)
        print('Importez le fichier de connexion dans les réglages Image : '+str(args.connection_file.resolve()), flush=True)
        try:
            server.serve_forever(poll_interval=0.25)
        except KeyboardInterrupt:
            pass
        finally:
            for ident in list(bridge.jobs):
                bridge.cancel(ident)
            for job in bridge.jobs.values():
                job['thread'].join(timeout=5)
            server.server_close()
            args.connection_file.unlink(missing_ok=True)


if __name__ == '__main__':
    main()
