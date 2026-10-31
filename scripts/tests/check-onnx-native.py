"""Run ONNX supervisor source without the desktop DLL loader; does not test Tauri IPC."""
import argparse
import os
from pathlib import Path
import subprocess
import tempfile


root = Path(__file__).resolve().parents[2]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--python", default=str(root / ".build/onnx/runtime/Scripts/python.exe"))
args = parser.parse_args()
python = str(Path(args.python).resolve(strict=True))
work = root / ".build/onnx/native-tests"
(work / "src").mkdir(parents=True, exist_ok=True)
source = (root / "src-tauri/src/core/onnx.rs").read_text(encoding="utf-8")
source = source.replace("use tauri::{AppHandle, Runtime};", """use std::marker::PhantomData;
pub trait Runtime: Clone {}
impl Runtime for () {}
#[derive(Clone)]
pub struct AppHandle<R: Runtime>(PhantomData<R>);""")
source = source.replace("#[tauri::command]\n", "")
source = source.replace(
    "let data = super::app::commands::get_jan_data_folder_path(app);",
    'let _ = app;\n    let data = std::env::var("NOVERA_ONNX_TEST_REGISTRY").unwrap();',
)
source = source.replace(
    "let app = tauri::test::mock_app();\n        let handle = app.handle().clone();",
    "let handle = AppHandle::<()>(PhantomData);",
)
source = source.replace('"../../../onnx-server/', '"' + root.as_posix() + "/onnx-server/")
(work / "src/lib.rs").write_text(source, encoding="utf-8")
(work / "Cargo.toml").write_text('''[package]
name = "novera-onnx-native-tests"
version = "0.0.0"
edition = "2021"
[dependencies]
serde = { version = "1", features = ["derive"] }
serde_json = "1"
tokio = { version = "1", features = ["full"] }
reqwest = { version = "0.12", default-features = false, features = ["json", "rustls-tls"] }
uuid = { version = "1", features = ["v4"] }
tempfile = "3"
''', encoding="utf-8")
with tempfile.TemporaryDirectory(prefix="run-", dir=work) as temp:
    directory = Path(temp)
    model = directory / "model"
    model.mkdir()
    subprocess.run([python, "-c", "from pathlib import Path; from test_server import fixture; import sys; fixture(Path(sys.argv[1]))", str(model)],
                   cwd=root / "onnx-server", check=True)
    env = dict(os.environ, NOVERA_ONNX_TEST_PYTHON=python,
               NOVERA_ONNX_TEST_MODEL=str(model), NOVERA_ONNX_TEST_REGISTRY=str(directory / "registry"),
               CARGO_TARGET_DIR=str(root / "src-tauri/target"))
    subprocess.run(["cargo", "test", "--manifest-path", str(work / "Cargo.toml"), "--offline",
                    "--", "--include-ignored", "--test-threads=1"], cwd=root, env=env, check=True)
