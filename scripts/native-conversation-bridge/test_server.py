import base64
import importlib.util
from pathlib import Path
import unittest
from unittest.mock import Mock
import http.client
import json
import threading

spec = importlib.util.spec_from_file_location('conversation_bridge', Path(__file__).with_name('server.py'))
bridge = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bridge)
ID = 'a1234567-1234-4567-8123-123456789abc'

class Parameters(unittest.TestCase):
    def test_fixed_native_text_policy(self):
        route, value = bridge.parameters({'id': ID, 'mode': 'text', 'messages': [{'role': 'user', 'content': '17+25'}], 'maxTokens': 128})
        self.assertEqual(route, '/v1/chat/completions')
        self.assertEqual(value['model'], bridge.MODEL)
        self.assertEqual(value['temperature'], 0)
        self.assertTrue(value['stream'])

    def test_rejects_paths_tools_and_unbounded_inputs(self):
        good = {'id': ID, 'mode': 'text', 'messages': [{'role': 'user', 'content': 'Hello'}], 'maxTokens': 128}
        for value in [{**good, 'worker': 'x'}, {**good, 'maxTokens': True}, {**good, 'maxTokens': 1025}, {**good, 'messages': [{'role': 'tool', 'content': 'x'}]}, {**good, 'messages': [{'role': 'user', 'content': 'x' * 100001}]}]:
            with self.subTest(value=str(value)[:80]), self.assertRaises(ValueError):
                bridge.parameters(value)

    def test_pcm_and_speech_limits(self):
        route, value = bridge.parameters({'id': ID, 'mode': 'transcription', 'audio': base64.b64encode(b'\0\0' * 16000).decode(), 'lang': 'fr'})
        self.assertEqual(route, '/v1/novera/audio/transcriptions')
        self.assertEqual(value['sample_rate'], 16000)
        for pcm in [b'', b'\0', b'\0\0' * (16000 * 22 + 1)]:
            with self.assertRaises(ValueError):
                bridge.parameters({'id': ID, 'mode': 'transcription', 'audio': base64.b64encode(pcm).decode()})
        with self.assertRaises(ValueError):
            bridge.parameters({'id': ID, 'mode': 'speech', 'input': 'x' * 1201})

    def test_only_existing_web_tools_and_their_history_are_allowed(self):
        value = {'id': ID, 'mode': 'text', 'maxTokens': 128, 'messages': [
            {'role': 'assistant', 'content': '', 'tool_calls': [{'id': 'call_1', 'type': 'function', 'function': {'name': 'web_search', 'arguments': '{"query":"test"}'}}]},
            {'role': 'tool', 'content': 'Results', 'tool_call_id': 'call_1'},
        ], 'tools': [{'type': 'function', 'function': {'name': 'web_search', 'parameters': {'type': 'object'}}}]}
        _, output = bridge.parameters(value)
        self.assertEqual(output['tools'][0]['function']['name'], 'web_search')
        value['tools'][0]['function']['name'] = 'run_shell'
        with self.assertRaises(ValueError):
            bridge.parameters(value)

    def test_origin_has_no_path_or_credentials(self):
        self.assertEqual(bridge.origin('https://example.test'), 'https://example.test')
        for value in ['https://example.test/', 'http://user:pass@example.test', 'file:///tmp', 'https://example.test?q=x']:
            with self.assertRaises(ValueError):
                bridge.origin(value)

    def test_cancel_before_start_and_matching_socket_only(self):
        worker = Mock()
        state = bridge.Bridge(worker)
        state.cancel(ID)
        self.assertIn(ID, state.cancelled)
        connection = Mock()
        state.active = (ID, connection)
        state.cancel('b1234567-1234-4567-8123-123456789abc')
        connection.sock.shutdown.assert_not_called()
        state.cancel(ID)
        connection.sock.shutdown.assert_called_once()

class Protocol(unittest.TestCase):
    def setUp(self):
        self.worker = Mock(sha='a' * 64, model=bridge.MODEL)
        self.server = bridge.ThreadingHTTPServer(('127.0.0.1', 0), bridge.Handler)
        self.server.origin = 'https://private.test'
        self.server.token = 'b' * 64
        self.server.bridge = bridge.Bridge(self.worker)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join()

    def request(self, method, path, data=None, **changes):
        headers = {'Origin': self.server.origin, 'Authorization': 'Bearer ' + self.server.token}
        headers.update(changes)
        connection = http.client.HTTPConnection('127.0.0.1', self.server.server_port, timeout=3)
        connection.request(method, path, None if data is None else json.dumps(data), headers)
        response = connection.getresponse()
        result = response.status, dict(response.getheaders()), response.read()
        connection.close()
        return result

    def test_health_requires_exact_origin_token_and_host(self):
        self.assertEqual(self.request('GET', '/v1/health')[0], 200)
        for changes in [{'Origin': 'https://other.test'}, {'Authorization': ''}, {'Host': 'other.test'}]:
            self.assertEqual(self.request('GET', '/v1/health', **changes)[0], 403)
        self.worker.connection.assert_not_called()

    def test_preflight_and_invalid_requests_do_not_start_inference(self):
        status, headers, _ = self.request('OPTIONS', '/v1/conversation')
        self.assertEqual(status, 204)
        self.assertEqual(headers['Access-Control-Allow-Origin'], self.server.origin)
        self.assertEqual(self.request('OPTIONS', '/v1/conversation', Origin='https://other.test')[0], 403)
        self.assertEqual(self.request('POST', '/v1/conversation', {'worker': '/arbitrary'})[0], 400)
        self.assertEqual(self.request('POST', '/models/load', {})[0], 404)
        self.worker.connection.assert_not_called()

    def test_cancelled_post_does_not_send_to_worker(self):
        self.assertEqual(self.request('DELETE', '/v1/jobs/' + ID)[0], 200)
        self.assertEqual(self.request('POST', '/v1/conversation', {'id': ID, 'mode': 'text', 'messages': [{'role': 'user', 'content': 'x'}], 'maxTokens': 12})[0], 409)
        self.worker.connection.return_value.request.assert_not_called()

if __name__ == '__main__':
    unittest.main()
