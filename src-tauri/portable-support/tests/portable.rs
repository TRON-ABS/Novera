use novera_portable::*;
use serde_json::json;
use sha2::{Digest, Sha256};
use std::{
    fs,
    io::{Cursor, Write},
    path::Path,
};

fn root(path: &Path) {
    fs::create_dir_all(path.join("Program")).unwrap();
    fs::write(
        path.join(MARKER),
        serde_json::to_vec(&json!({"format":FORMAT,"schema":1})).unwrap(),
    )
    .unwrap();
}

#[test]
fn moving_profile_rebases_model_and_attachment_metadata_without_changing_content() {
    let tmp = tempfile::tempdir().unwrap();
    let first = tmp.path().join("clé USB initiale");
    root(&first);
    let first = validate_root(&first).unwrap();
    initialize_profile(&first).unwrap();
    let data = first.join("Data/Novera/data");
    fs::create_dir_all(data.join("threads")).unwrap();
    fs::write(data.join("settings.json"), serde_json::to_vec(&json!({"language":"fr","nested":json!({"path":first.join("Data/Models/text/model.gguf")}).to_string(),"external":tmp.path().join("outside.gguf")})).unwrap()).unwrap();
    fs::write(data.join("threads/chat.jsonl"), format!("{}\n",json!({"content":"Une discussion à conserver","attachment":first.join("Data/Novera/data/attachments/image.png")}))).unwrap();
    fs::create_dir_all(data.join("llamacpp/models/text")).unwrap();
    fs::write(
        data.join("llamacpp/models/text/model.yml"),
        format!(
            "model_path: '{}'\nname: texte\n",
            first.join("Data/Models/text.gguf").display()
        ),
    )
    .unwrap();
    fs::write(
        first.join("Data/Models/text.gguf"),
        b"GGUF synthetic model witness",
    )
    .unwrap();
    let next = tmp.path().join("autre disque espace é");
    fs::rename(&first, &next).unwrap();
    let next = validate_root(&next).unwrap();
    initialize_profile(&next).unwrap();
    let settings: serde_json::Value =
        serde_json::from_slice(&fs::read(next.join("Data/Novera/data/settings.json")).unwrap())
            .unwrap();
    let nested: serde_json::Value =
        serde_json::from_str(settings["nested"].as_str().unwrap()).unwrap();
    assert_eq!(
        nested["path"],
        json!(next.join("Data/Models/text/model.gguf"))
    );
    assert_eq!(settings["language"], "fr");
    assert_eq!(settings["external"], json!(tmp.path().join("outside.gguf")));
    let thread: serde_json::Value = serde_json::from_str(
        &fs::read_to_string(next.join("Data/Novera/data/threads/chat.jsonl")).unwrap(),
    )
    .unwrap();
    assert_eq!(thread["content"], "Une discussion à conserver");
    assert_eq!(
        thread["attachment"],
        json!(next.join("Data/Novera/data/attachments/image.png"))
    );
    let yaml: serde_yaml::Value = serde_yaml::from_str(
        &fs::read_to_string(next.join("Data/Novera/data/llamacpp/models/text/model.yml")).unwrap(),
    )
    .unwrap();
    assert_eq!(
        yaml["model_path"].as_str().unwrap(),
        next.join("Data/Models/text.gguf").to_str().unwrap()
    );
    assert_eq!(
        fs::read(next.join("Data/Models/text.gguf")).unwrap(),
        b"GGUF synthetic model witness"
    );
    initialize_profile(&next).unwrap(); // Repeated initialization is idempotent.
}

fn archive(path: &str, content: &[u8], hash: &str) -> Vec<u8> {
    let mut zip = zip::ZipWriter::new(Cursor::new(Vec::new()));
    let opts = zip::write::SimpleFileOptions::default();
    zip.start_file("portable-update.json", opts).unwrap();
    zip.write_all(&serde_json::to_vec(&json!({"format":FORMAT,"schema":1,"version":"1.0.0","files":[{"path":path,"bytes":content.len(),"sha256":hash}]})).unwrap()).unwrap();
    zip.start_file(path, opts).unwrap();
    zip.write_all(content).unwrap();
    zip.finish().unwrap().into_inner()
}

#[test]
fn replacement_touches_program_only_and_recovery_restores_an_interrupted_swap() {
    let tmp = tempfile::tempdir().unwrap();
    root(tmp.path());
    initialize_profile(tmp.path()).unwrap();
    fs::write(
        tmp.path().join("Program/Novera-Desktop.exe"),
        b"old executable",
    )
    .unwrap();
    fs::write(
        tmp.path().join("Data/Novera/data/discussion.json"),
        b"preserve byte for byte",
    )
    .unwrap();
    let stage = tmp.path().join(".novera-update-123-456");
    fs::create_dir(&stage).unwrap();
    let payload = b"new native executable witness";
    let hash = format!("{:x}", Sha256::digest(payload));
    extract_payload(
        Cursor::new(archive("Program/Novera-Desktop.exe", payload, &hash)),
        &stage,
    )
    .unwrap();
    replace_program(tmp.path(), &stage).unwrap();
    assert_eq!(
        fs::read(tmp.path().join("Program/Novera-Desktop.exe")).unwrap(),
        payload
    );
    assert_eq!(
        fs::read(tmp.path().join("Data/Novera/data/discussion.json")).unwrap(),
        b"preserve byte for byte"
    );
    fs::rename(tmp.path().join("Program"), stage.join("previous")).unwrap();
    fs::write(
        tmp.path().join("Data/pending-portable-update.json"),
        br#"{"stage":".novera-update-123-456"}"#,
    )
    .unwrap();
    recover_program(tmp.path()).unwrap();
    assert_eq!(
        fs::read(tmp.path().join("Program/Novera-Desktop.exe")).unwrap(),
        payload
    );
    assert!(!tmp
        .path()
        .join("Data/pending-portable-update.json")
        .exists());
}

#[test]
fn corrupt_and_escaping_payloads_never_replace_the_program_or_data() {
    let tmp = tempfile::tempdir().unwrap();
    root(tmp.path());
    for path in [
        "Program/../../Data/chat.json",
        "Data/chat.json",
        "Program/C:/file",
        "Program/CON.txt",
        "Program/a\\b",
        "Program/a:stream",
        "Program/../secret",
        "Program/file. ",
    ] {
        assert!(!safe_program_path(path), "{path}");
        assert!(extract_payload(
            Cursor::new(archive(path, b"data", &"0".repeat(64))),
            tmp.path()
        )
        .is_err());
    }
    assert!(extract_payload(
        Cursor::new(archive(
            "Program/Novera-Desktop.exe",
            b"data",
            &"0".repeat(64)
        )),
        tmp.path()
    )
    .is_err());
    assert!(!tmp.path().join("Data/chat.json").exists());
}

#[cfg(windows)]
#[test]
fn active_profile_lock_prevents_a_second_instance_and_updater() {
    let tmp = tempfile::tempdir().unwrap();
    root(tmp.path());
    let lock = profile_lock(tmp.path()).unwrap();
    assert!(profile_lock(tmp.path()).is_err());
    drop(lock);
    assert!(profile_lock(tmp.path()).is_ok());
}

#[test]
fn footer_bounds_and_root_marker_are_required() {
    let tmp = tempfile::tempdir().unwrap();
    fs::create_dir(tmp.path().join("Program")).unwrap();
    assert!(validate_root(tmp.path()).is_err());
    root(tmp.path());
    assert!(root_for_executable(&tmp.path().join("Novera-Desktop.exe")).is_err());
    assert!(root_for_executable(&tmp.path().join("Program/Novera-Desktop.exe")).is_ok());
    let content = archive(
        "Program/Novera-Desktop.exe",
        b"payload",
        &format!("{:x}", Sha256::digest(b"payload")),
    );
    let exe = tmp.path().join("update.exe");
    let mut file = fs::File::create(&exe).unwrap();
    file.write_all(b"MZ synthetic prefix").unwrap();
    file.write_all(&content).unwrap();
    file.write_all(&(content.len() as u64).to_le_bytes())
        .unwrap();
    file.write_all(FOOTER).unwrap();
    drop(file);
    let stage = tmp.path().join("stage");
    fs::create_dir(&stage).unwrap();
    extract_payload(PayloadReader::open(&exe).unwrap(), &stage).unwrap();
    assert_eq!(
        fs::read(stage.join("Program/Novera-Desktop.exe")).unwrap(),
        b"payload"
    );
}
