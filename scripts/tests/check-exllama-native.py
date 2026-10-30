"""Test the actual native import functions without compiling the whole desktop."""
import json
import os
from pathlib import Path
import subprocess

root = Path(__file__).resolve().parents[2]
source = (root / "src-tauri/src/core/transformers.rs").read_text(encoding="utf-8")
functions = source[source.index("fn inspect_quantization("):source.index("#[tauri::command]")]
work = root / ".build/exllama/native-tests"
(work / "src").mkdir(parents=True, exist_ok=True)
(work / "tmp").mkdir(exist_ok=True)
(work / "Cargo.toml").write_text('''[package]
name = "novera-exllama-native-tests"
version = "0.0.0"
edition = "2021"
[dependencies]
serde_json = "1"
[dev-dependencies]
tempfile = "3"
''', encoding="utf-8")
cases_path = json.dumps(str(root / "transformers-server/quantization-cases.json"))
tests = r'''
#[test]
fn shared_policy() {
    let cases: Vec<serde_json::Value> = serde_json::from_str(include_str!(CASES_PATH)).unwrap();
    for case in cases {
        assert_eq!(inspect_quantization(&case["config"]).is_err(), case["expected"] == "unsupported", "{}", case["name"]);
    }
}
#[test]
fn exllama_import_checks_arbitrary_local_shard_names_and_empty_directories() {
    for method in ["exl3", "exl2"] {
        let temp = tempfile::tempdir().unwrap();
        let root = temp.path().canonicalize().unwrap();
        std::fs::write(root.join("config.json"), serde_json::json!({"quantization_config":{"quant_method":method,"bits":4.0}}).to_string()).unwrap();
        std::fs::write(root.join("tokenizer.json"), "{}").unwrap();
        assert!(inspect(&root).is_err());
        std::fs::write(root.join("output.safetensors"), b"fixture").unwrap();
        assert_eq!(inspect(&root).unwrap(), 7);
        std::fs::write(root.join("second.safetensors"), b"fixture").unwrap();
        assert_eq!(inspect(&root).unwrap(), 14);
        std::fs::write(root.join("model.safetensors.index.json"), r#"{"weight_map":{"w":"../outside.safetensors"}}"#).unwrap();
        assert!(inspect(&root).is_err());
    }
}
'''.replace("CASES_PATH", cases_path)
(work / "src/lib.rs").write_text("use std::path::Path;\n" + functions + tests, encoding="utf-8")
env = dict(os.environ, TMP=str(work / "tmp"), TEMP=str(work / "tmp"))
subprocess.run(["cargo", "test", "--offline", "--manifest-path", str(work / "Cargo.toml")], env=env, check=True)
