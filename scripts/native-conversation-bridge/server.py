"""Explicitly paired loopback bridge to the existing Novera Desktop worker.

No HTTP model selection, paths, executable arguments, uploads to third parties,
or unauthenticated endpoints. Starting this module requires a local config.
"""
import argparse
import base64
from collections import deque
import hashlib
import hmac
import http.client
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import os
from pathlib import Path
import queue
import re
import secrets
import socket
import subprocess
import tempfile
import threading
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[2]
MODEL = 'LFM3-Omni-2B-Q4_K_M'
Q8_MODEL = 'LFM3-Omni-2B-Q8_0'
Q8_SHA256 = '59118f661eaacb93d204723d76355b53347f0940b508c11412f6290fd49158d4'
VERSION = '1.0.1'
WEB_TOOLS = {'web_search', 'web_fetch'}

def origin(value):
    parsed = urlsplit(value)
    if parsed.scheme not in ('http', 'https') or not parsed.netloc or parsed.path or parsed.query or parsed.fragment or parsed.username or parsed.password:
        raise ValueError('An exact Web origin is required.')
    return value

def parameters(value, model=MODEL):
    if not isinstance(value, dict) or set(value) - {'id', 'mode', 'messages', 'maxTokens', 'input', 'audio', 'lang', 'voice', 'tools'}:
        raise ValueError('Unknown conversation parameters.')
    if not isinstance(value.get('id'), str) or not re.fullmatch(r'[a-f0-9-]{36}', value['id']):
        raise ValueError('Invalid operation identifier.')
    mode = value.get('mode')
    if mode == 'text':
        messages = value.get('messages')
        if not isinstance(messages, list) or not 1 <= len(messages) <= 256:
            raise ValueError('Invalid conversation.')
        for message in messages:
            if not isinstance(message, dict) or set(message) - {'role', 'content', 'tool_calls', 'tool_call_id'} or message.get('role') not in ('system', 'user', 'assistant', 'tool') or not isinstance(message.get('content'), str):
                raise ValueError('Only text conversation messages are supported.')
            if message['role'] == 'tool' and (not isinstance(message.get('tool_call_id'), str) or not 1 <= len(message['tool_call_id']) <= 128):
                raise ValueError('Invalid tool result identifier.')
            if 'tool_calls' in message:
                calls = message['tool_calls']
                if message['role'] != 'assistant' or not isinstance(calls, list) or not 1 <= len(calls) <= 8:
                    raise ValueError('Invalid tool calls.')
                for call in calls:
                    if not isinstance(call, dict) or set(call) != {'id', 'type', 'function'} or call['type'] != 'function' or not isinstance(call['id'], str) or not 1 <= len(call['id']) <= 128:
                        raise ValueError('Invalid tool call.')
                    function = call['function']
                    if not isinstance(function, dict) or set(function) != {'name', 'arguments'} or function['name'] not in WEB_TOOLS or not isinstance(function['arguments'], str) or len(function['arguments']) > 32000 or not isinstance(json.loads(function['arguments']), dict):
                        raise ValueError('Unsupported tool call.')
        if sum(len(m['content']) for m in messages) > 100000:
            raise ValueError('Conversation too long.')
        if type(value.get('maxTokens')) is not int or not 1 <= value['maxTokens'] <= 1024:
            raise ValueError('Invalid generation limit.')
        tools = value.get('tools', [])
        if not isinstance(tools, list) or len(tools) > 2:
            raise ValueError('Invalid Web tools.')
        for tool in tools:
            if not isinstance(tool, dict) or set(tool) != {'type', 'function'} or tool['type'] != 'function':
                raise ValueError('Invalid Web tool.')
            function = tool['function']
            if not isinstance(function, dict) or set(function) - {'name', 'description', 'parameters', 'strict'} or function.get('name') not in WEB_TOOLS or not isinstance(function.get('parameters'), dict) or len(json.dumps(function)) > 32000:
                raise ValueError('Only the existing Web search tools are allowed.')
        return '/v1/chat/completions', {'model': model, 'messages': messages, 'max_tokens': value['maxTokens'], 'temperature': 0, 'seed': 42, 'stream': True, 'stream_options': {'include_usage': True}, 'cache_prompt': True, **({'tools': tools} if tools else {})}
    lang = value.get('lang', 'fr')
    if not isinstance(lang, str) or not re.fullmatch(r'[a-z]{2}(?:-[a-z]{2})?', lang):
        raise ValueError('Invalid language.')
    if mode == 'speech':
        text = value.get('input')
        if not isinstance(text, str) or not text.strip() or len(text.encode('utf8')) > 1200 or value.get('voice', 'male') not in ('male', 'female'):
            raise ValueError('Invalid spoken segment.')
        return '/v1/novera/audio/speech', {'model': model, 'input': text, 'lang': lang, 'voice': value.get('voice', 'male')}
    if mode == 'transcription':
        audio = value.get('audio')
        if not isinstance(audio, str) or not 1 <= len(audio) <= 1400000:
            raise ValueError('Invalid PCM input.')
        pcm = base64.b64decode(audio, validate=True)
        if not pcm or len(pcm) % 2 or len(pcm) > 32_000 * 22:
            raise ValueError('Expected at most 22 seconds of PCM16 mono 16 kHz.')
        return '/v1/novera/audio/transcriptions', {'model': model, 'audio': audio, 'language': lang, 'sample_rate': 16000}
    raise ValueError('Unsupported operation.')

class Worker:
    def __init__(self, config, directory):
        self.key = secrets.token_hex(32)
        binary = Path(config['worker']).resolve(strict=True)
        self.sha = hashlib.file_digest(binary.open('rb'), 'sha256').hexdigest()
        if self.sha != config['workerSha256']:
            raise ValueError('Worker checksum mismatch.')
        spec = json.loads((ROOT / 'web-app/src/services/browser-preview/catalog.json').read_text())[0]
        self.model = config.get('modelId', MODEL)
        if self.model not in (MODEL, Q8_MODEL):
            raise ValueError('Unsupported native model.')
        if self.model == Q8_MODEL:
            spec['assets'][0]['sha256'] = Q8_SHA256
        models = []
        for key, artifact in zip(('model', 'projector'), spec['assets']):
            path = Path(config[key]).resolve(strict=True)
            if hashlib.file_digest(path.open('rb'), 'sha256').hexdigest() != artifact['sha256']:
                raise ValueError('Model checksum mismatch: ' + key)
            if '\n' in str(path) or '\r' in str(path):
                raise ValueError('Invalid model path.')
            models.append(path)
        preset = directory / 'preset.ini'
        preset.write_text('[*]\nfit = off\nctx-size = 32768\nparallel = 1\ncache-ram = 0\n'
                          'batch-size = 512\nubatch-size = 512\nn-gpu-layers = 99\nflash-attn = on\n'
                          f'\n[{self.model}]\nmodel = {models[0].as_posix()}\nmmproj = {models[1].as_posix()}\nload-on-startup = false\n', encoding='utf8')
        self.proc = subprocess.Popen([str(binary), '--preset', str(preset), '--port', '0', '--models-max', '1'],
            cwd=binary.parent, env=dict(os.environ, JAN_LLAMA_API_KEY=self.key), stdin=subprocess.PIPE,
            stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True,
            creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0))
        lines = queue.Queue()
        def read():
            for line in self.proc.stdout:
                lines.put(line)
        threading.Thread(target=read, daemon=True).start()
        try:
            ready = json.loads(lines.get(timeout=60))
            self.port = ready['port']
            if type(self.port) is not int or not 1 <= self.port <= 65535:
                raise ValueError('Invalid worker handshake.')
            connection = self.connection()
            connection.request('POST', '/models/load', json.dumps({'model': self.model}), self.headers())
            response = connection.getresponse()
            data = response.read()
            connection.close()
            if response.status != 200:
                raise ValueError('Native model loading failed.')
        except Exception:
            self.close()
            raise

    def headers(self):
        return {'Authorization': 'Bearer ' + self.key, 'Content-Type': 'application/json'}

    def connection(self):
        return http.client.HTTPConnection('127.0.0.1', self.port, timeout=180)

    def close(self):
        if self.proc.poll() is None:
            self.proc.stdin.close()
            try:
                self.proc.wait(timeout=10)
            except subprocess.TimeoutExpired:
                self.proc.kill()
                self.proc.wait()

class Bridge:
    def __init__(self, worker):
        self.worker = worker
        self.lock = threading.Lock()
        self.active = None
        self.cancelled = deque(maxlen=128)

    def cancel(self, ident):
        with self.lock:
            self.cancelled.append(ident)
            if self.active and self.active[0] == ident:
                connection = self.active[1]
                if connection.sock:
                    try:
                        connection.sock.shutdown(socket.SHUT_RDWR)
                    except OSError:
                        pass

class Handler(BaseHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        if self.headers.get('Origin') == self.server.origin:
            self.send_header('Access-Control-Allow-Origin', self.server.origin)
            self.send_header('Vary', 'Origin')
        super().end_headers()

    def authorized(self):
        return self.headers.get('Host') == f'127.0.0.1:{self.server.server_port}' and self.headers.get('Origin') == self.server.origin and hmac.compare_digest(self.headers.get('Authorization', '').encode(), ('Bearer ' + self.server.token).encode())

    def json(self, code, value):
        data = json.dumps(value).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_OPTIONS(self):
        if self.headers.get('Origin') != self.server.origin:
            self.send_error(403)
            return
        self.send_response(204)
        self.send_header('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Authorization,Content-Type')
        self.end_headers()

    def do_GET(self):
        if not self.authorized():
            self.send_error(403)
        elif self.path == '/v1/health':
            self.json(200, {'version': VERSION, 'model': self.server.bridge.worker.model, 'contextTokens': 32768, 'workerSha256': self.server.bridge.worker.sha, 'capabilities': ['text', 'speech', 'transcription', 'web-tools']})
        else:
            self.send_error(404)

    def do_DELETE(self):
        if not self.authorized():
            self.send_error(403)
            return
        if not re.fullmatch(r'/v1/jobs/[a-f0-9-]{36}', self.path):
            self.send_error(404)
            return
        self.server.bridge.cancel(self.path.rsplit('/', 1)[-1])
        self.json(200, {'cancelled': True})

    def do_POST(self):
        if not self.authorized():
            self.send_error(403)
            return
        if self.path in ('/v1/load', '/v1/unload'):
            bridge = self.server.bridge
            with bridge.lock:
                if bridge.active:
                    self.json(409, {'error': 'Native engine busy.'})
                    return
                connection = bridge.worker.connection()
                bridge.active = ('model-lifecycle', connection)
            try:
                action = '/models/load' if self.path == '/v1/load' else '/models/unload'
                connection.request('POST', action, json.dumps({'model': bridge.worker.model}), bridge.worker.headers())
                response = connection.getresponse()
                response.read()
                self.json(response.status, {'success': response.status == 200})
            except (OSError, http.client.HTTPException):
                self.json(502, {'error': 'Native model operation interrupted.'})
            finally:
                connection.close()
                with bridge.lock:
                    bridge.active = None
            return
        if self.path != '/v1/conversation':
            self.send_error(404)
            return
        try:
            length = int(self.headers.get('Content-Length', '0'))
            if not 0 < length <= 1500000:
                raise ValueError('Request too large.')
            value = json.loads(self.rfile.read(length))
            path, body = parameters(value, self.server.bridge.worker.model)
        except (ValueError, TypeError, KeyError):
            self.json(400, {'error': 'Invalid native conversation request.'})
            return
        bridge = self.server.bridge
        connection = bridge.worker.connection()
        ident = value['id']
        with bridge.lock:
            if bridge.active or ident in bridge.cancelled:
                self.json(409, {'error': 'Native engine busy or operation cancelled.'})
                return
            bridge.active = (ident, connection)
        headers_sent = False
        try:
            connection.request('POST', path, json.dumps(body), bridge.worker.headers())
            # Close a request cancelled before the connection was established.
            with bridge.lock:
                if ident in bridge.cancelled:
                    raise ConnectionAbortedError()
            upstream = connection.getresponse()
            self.send_response(upstream.status)
            self.send_header('Content-Type', upstream.getheader('Content-Type', 'application/json'))
            self.send_header('Connection', 'close')
            self.end_headers()
            headers_sent = True
            self.close_connection = True
            while data := upstream.read1(65536):
                self.wfile.write(data)
                self.wfile.flush()
        except (OSError, http.client.HTTPException):
            if not headers_sent:
                self.json(502, {'error': 'Native operation interrupted.'})
        finally:
            connection.close()
            with bridge.lock:
                bridge.active = None

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--config', type=Path, required=True)
    parser.add_argument('--origin', type=origin, required=True)
    parser.add_argument('--connection', type=Path, required=True)
    args = parser.parse_args()
    with tempfile.TemporaryDirectory(prefix='novera-conversation-') as directory:
        worker = Worker(json.loads(args.config.read_text(encoding='utf-8-sig')), Path(directory))
        server = None
        try:
            server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
            server.origin = args.origin
            server.token = secrets.token_hex(32)
            server.bridge = Bridge(worker)
            args.connection.parent.mkdir(parents=True, exist_ok=True)
            args.connection.write_text(json.dumps({'version': 1, 'origin': args.origin, 'endpoint': f'http://127.0.0.1:{server.server_port}', 'token': server.token}), encoding='utf8')
            print('Novera 1.0.1 native text/voice ready; import the local connection file.', flush=True)
            server.serve_forever()
        finally:
            if server:
                if server.bridge.active:
                    server.bridge.cancel(server.bridge.active[0])
                server.server_close()
            worker.close()
            args.connection.unlink(missing_ok=True)

if __name__ == '__main__':
    main()
