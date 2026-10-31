"""Real CPU graph inference and authenticated HTTP contract; no model download."""
import json
from pathlib import Path
import queue
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
from http.server import ThreadingHTTPServer

import numpy as np
import onnx
from onnx import TensorProto, helper, numpy_helper

from server import Inference, handler, tensor_inputs, validate_directory


def fixture(root):
    x = helper.make_tensor_value_info("x", TensorProto.FLOAT, [None, 2])
    y = helper.make_tensor_value_info("y", TensorProto.FLOAT, [None, 2])
    graph = helper.make_graph([helper.make_node("Add", ["x", "bias"], ["y"])], "small-task", [x], [y],
                              [numpy_helper.from_array(np.array([1, 2], dtype=np.float32), "bias")])
    model = helper.make_model(graph, opset_imports=[helper.make_opsetid("", 17)], ir_version=9)
    onnx.save(model, root / "model.onnx")
    return model


def genai_fixture(root):
    x=helper.make_tensor_value_info('input_ids',TensorProto.INT32,['batch','sequence'])
    y=helper.make_tensor_value_info('logits',TensorProto.FLOAT,['batch','sequence',5])
    base=numpy_helper.from_array(np.array([[[0,0,0,0,10]]],dtype=np.float32),'base')
    vocab=numpy_helper.from_array(np.array([5],dtype=np.int64),'vocab')
    nodes=[helper.make_node('Shape',['input_ids'],['shape']),helper.make_node('Concat',['shape','vocab'],['output_shape'],axis=0),helper.make_node('Expand',['base','output_shape'],['logits'])]
    model=helper.make_model(helper.make_graph(nodes,'synthetic-decoder',[x],[y],[base,vocab]),opset_imports=[helper.make_opsetid('',17)],ir_version=9)
    onnx.save(model,root / 'model.onnx')
    config={'model':{'bos_token_id':0,'eos_token_id':1,'pad_token_id':0,'context_length':128,'vocab_size':5,'type':'phi3','decoder':{'filename':'model.onnx','head_size':4,'hidden_size':4,'num_attention_heads':1,'num_key_value_heads':1,'num_hidden_layers':0,'inputs':{'input_ids':'input_ids'},'outputs':{'logits':'logits'}}},'search':{'max_length':128,'past_present_share_buffer':False}}
    (root / 'genai_config.json').write_text(json.dumps(config))
    vocab={'[UNK]':0,'[EOS]':1,'user':2,'Hello':3,'answer':4}
    tokenizer={'version':'1.0','truncation':None,'padding':None,'added_tokens':[],'normalizer':None,'pre_tokenizer':{'type':'Whitespace'},'post_processor':None,'decoder':{'type':'WordPiece','prefix':'##','cleanup':True},'model':{'type':'BPE','vocab':vocab,'merges':[],'unk_token':'[UNK]'}}
    (root / 'tokenizer.json').write_text(json.dumps(tokenizer))
    (root / 'tokenizer_config.json').write_text(json.dumps({'chat_template':"{% for message in messages %}{{ message['role'] }} {{ message['content'] }} {% endfor %}"}))


def request():
    return {"inputs": {"x": {"dtype": "float32", "shape": [1, 2], "data": [3, 4]}}}


class GraphTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name).resolve()
        fixture(self.root)
        self.engine = Inference(self.root, "tiny", 128, "cpu")

    def test_real_cpu_inference_and_schema(self):
        self.assertEqual(self.engine.predict(request())["outputs"]["y"],
                         {"dtype": "float32", "shape": [1, 2], "data": [4, 6]})
        self.assertEqual(self.engine.schema()["inputs"][0]["name"], "x")
        self.assertEqual(self.engine.runtime["device"], "CPUExecutionProvider")

    def test_real_genai_template_sampling_context_and_cancellation(self):
        genai_fixture(self.root)
        engine = Inference(self.root, "genai", 2048, "cpu")
        self.assertEqual(engine.context_size, 128)
        output = queue.Queue()
        body = {"messages": [{"role": "user", "content": "Hello"}], "max_tokens": 3, "temperature": 0}
        engine.generate(body, output)
        self.assertEqual(output.get(), ("ready", None))
        self.assertEqual([output.get()[1] for _ in range(3)], ["answer"] * 3)
        self.assertEqual(output.get()[1][0], 3)
        engine.cancel.set()
        engine.generate(body, output)
        self.assertEqual(output.get()[0], "ready")
        self.assertEqual(output.get()[1][0], 0)
        with self.assertRaises(ValueError):
            engine.generate({**body, "temperature": -1}, queue.Queue())
        with self.assertRaises(ValueError):
            engine.generate({**body, "messages": [{"role": "user", "content": []}]}, queue.Queue())

    def test_tensor_request_in_chat(self):
        output = queue.Queue()
        self.engine.generate({"model": "tiny", "messages": [{"role": "user", "content": json.dumps(request())}]}, output)
        self.assertEqual(output.get()[0], "ready")
        self.assertEqual(json.loads(output.get()[1])["outputs"]["y"]["data"], [4, 6])
        self.assertEqual(output.get(), ("done", (0, 0, "stop")))

    def test_input_validation(self):
        for spec in [
            {"dtype": "float32", "shape": [2], "data": [1, 2]},
            {"dtype": "int64", "shape": [1, 2], "data": [1, 2]},
            {"dtype": "float32", "shape": [1, 3], "data": [1, 2, 3]},
            {"dtype": "float32", "shape": [1, 2], "data": [1]},
            {"dtype": "float32", "shape": [1, 2], "data": [float("nan"), 2]},
            {"dtype": "float32", "shape": [1, 2], "data": [True, 2]},
        ]:
            with self.subTest(spec=spec), self.assertRaises(ValueError):
                self.engine.predict({"inputs": {"x": spec}})
        with self.assertRaises(ValueError):
            self.engine.predict({"inputs": {"unknown": {}}})

    def test_int64_round_trip_without_javascript_precision_loss(self):
        x = helper.make_tensor_value_info("x", TensorProto.INT64, [1])
        y = helper.make_tensor_value_info("y", TensorProto.INT64, [1])
        model = helper.make_model(helper.make_graph([helper.make_node("Identity", ["x"], ["y"])], "int", [x], [y]),
                                  opset_imports=[helper.make_opsetid("", 17)], ir_version=9)
        onnx.save(model, self.root / "model.onnx")
        engine = Inference(self.root, "int", 128, "cpu")
        value = "9223372036854775807"
        body = {"inputs": {"x": {"dtype": "int64", "shape": [1], "data": [value]}}}
        self.assertEqual(engine.predict(body)["outputs"]["y"]["data"], [value])
        body["inputs"]["x"]["data"] = ["9223372036854775808"]
        with self.assertRaises(ValueError):
            tensor_inputs(engine.session, body)

    def test_multiple_graphs_require_explicit_selection(self):
        (self.root / "second.onnx").write_bytes((self.root / "model.onnx").read_bytes())
        with self.assertRaisesRegex(ValueError, "Multiple graphs"):
            validate_directory(self.root)
        (self.root / "novera_onnx.json").write_text('{"model":"second.onnx"}')
        self.assertEqual(validate_directory(self.root)[2].name, "second.onnx")
        (self.root / "novera_onnx.json").write_text('{"model":"../outside.onnx"}')
        with self.assertRaises((ValueError, FileNotFoundError)):
            validate_directory(self.root)

    def test_external_weights_are_local_and_complete(self):
        model = fixture(self.root)
        onnx.save_model(model, self.root / "model.onnx", save_as_external_data=True,
                        all_tensors_to_one_file=True, location="weights.data", size_threshold=0)
        self.assertEqual(Inference(self.root, "external", 128, "cpu").predict(request())["outputs"]["y"]["data"], [4, 6])
        (self.root / "weights.data").write_bytes(b"x")
        with self.assertRaisesRegex(ValueError, "Truncated"):
            validate_directory(self.root)
        model = onnx.load(self.root / "model.onnx", load_external_data=False)
        for item in model.graph.initializer[0].external_data:
            if item.key == "location":
                item.value = "../outside.data"
        onnx.save_model(model, self.root / "model.onnx")
        with self.assertRaises((ValueError, FileNotFoundError)):
            validate_directory(self.root)

    def test_unavailable_cuda_fails_explicitly(self):
        import onnxruntime as ort
        if "CUDAExecutionProvider" in ort.get_available_providers():
            self.skipTest("CUDA build is installed")
        with self.assertRaisesRegex(ValueError, "Unavailable ONNX provider"):
            Inference(self.root, "cuda", 128, "cuda")

    def test_authenticated_http_streaming_busy_and_recovery(self):
        server = ThreadingHTTPServer(("127.0.0.1", 0), handler(self.engine, "secret"))
        server.daemon_threads = True
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        threading.Thread(target=self.engine.run, daemon=True).start()
        self.addCleanup(server.server_close)
        self.addCleanup(server.shutdown)
        base = f"http://127.0.0.1:{server.server_port}"
        def call(path, body=None, auth=True):
            headers = {"Authorization": "Bearer secret"} if auth else {}
            req = urllib.request.Request(base + path, data=json.dumps(body).encode() if body is not None else None, headers=headers)
            with urllib.request.build_opener(urllib.request.ProxyHandler({})).open(req, timeout=5) as response:
                return response.read().decode()
        with self.assertRaises(urllib.error.HTTPError) as error:
            call("/health", auth=False)
        self.assertEqual(error.exception.code, 401)
        self.assertEqual(json.loads(call("/health"))["model_id"], "tiny")
        self.assertEqual(json.loads(call("/v1/onnx/schema"))["mode"], "tensor")
        self.assertEqual(json.loads(call("/v1/onnx/run", request()))["outputs"]["y"]["data"], [4, 6])
        self.engine.lock.acquire()
        try:
            with self.assertRaises(urllib.error.HTTPError) as error:
                call("/v1/onnx/run", request())
            self.assertEqual(error.exception.code, 409)
        finally:
            self.engine.lock.release()
        body = {"model": "tiny", "messages": [{"role": "user", "content": json.dumps(request())}], "stream": True}
        stream = call("/v1/chat/completions", body)
        self.assertIn("data: [DONE]", stream)
        self.assertIn('"role": "assistant"', stream)
        with self.assertRaises(urllib.error.HTTPError):
            call("/v1/chat/completions", {**body, "messages": [{"role": "user", "content": "wrong"}]})
        self.assertIn("[DONE]", call("/v1/chat/completions", body))
        self.assertFalse(json.loads(call("/v1/cancel", {"request_id": "unrelated"}))["cancelled"])


if __name__ == "__main__":
    unittest.main()
