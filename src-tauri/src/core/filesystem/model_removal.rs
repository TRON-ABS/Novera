use std::{fs, path::Path};

pub(super) fn delete_registered_gguf(models_root: &Path, config: &Path) -> Result<(), String> {
    let models_root = models_root.canonicalize().map_err(|e| e.to_string())?;
    let config = config.canonicalize().map_err(|e| e.to_string())?;
    if !config.starts_with(&models_root)
        || config.file_name().and_then(|name| name.to_str()) != Some("model.yml")
    {
        return Err("Expected a registered llama.cpp model.yml".into());
    }
    let data: serde_json::Value =
        serde_yaml::from_reader(fs::File::open(&config).map_err(|e| e.to_string())?)
            .map_err(|e| e.to_string())?;
    let model = Path::new(data["model_path"].as_str().ok_or("Missing model_path")?);
    if !model.is_absolute()
        || !model
            .extension()
            .and_then(|ext| ext.to_str())
            .is_some_and(|ext| ext.eq_ignore_ascii_case("gguf"))
    {
        return Err("Only a registered absolute GGUF file can be deleted".into());
    }
    // Missing files need no deletion; permit removal of stale catalog entries.
    let metadata = match fs::symlink_metadata(model) {
        Ok(metadata) => metadata,
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => return Ok(()),
        Err(error) => return Err(error.to_string()),
    };
    if !metadata.is_file() || metadata.file_type().is_symlink() {
        return Err("The registered GGUF must be a regular file".into());
    }
    // Never delete the containing folder or any auxiliary external models.
    fs::remove_file(model).map_err(|e| e.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn fixture() -> (
        tempfile::TempDir,
        std::path::PathBuf,
        std::path::PathBuf,
        std::path::PathBuf,
    ) {
        let dir = tempfile::tempdir().unwrap();
        let root = dir.path().join("llamacpp/models");
        let entry = root.join("test");
        fs::create_dir_all(&entry).unwrap();
        let model = dir.path().join("external/model.gguf");
        fs::create_dir_all(model.parent().unwrap()).unwrap();
        fs::write(&model, b"GGUF").unwrap();
        let config = entry.join("model.yml");
        fs::write(
            &config,
            serde_yaml::to_string(&serde_json::json!({"model_path":model})).unwrap(),
        )
        .unwrap();
        (dir, root, config, model)
    }

    #[test]
    fn deletes_only_the_registered_file() {
        let (_dir, root, config, model) = fixture();
        let companion = model.with_file_name("mmproj.gguf");
        fs::write(&companion, b"GGUF").unwrap();
        delete_registered_gguf(&root, &config).unwrap();
        assert!(!model.exists());
        assert!(companion.exists());
        assert!(config.exists());
        delete_registered_gguf(&root, &config).unwrap();
    }

    #[test]
    fn rejects_configs_outside_the_registered_model_tree() {
        let (dir, root, config, model) = fixture();
        let outside = dir.path().join("model.yml");
        fs::copy(config, &outside).unwrap();
        assert!(delete_registered_gguf(&root, &outside).is_err());
        assert!(model.exists());
    }

    #[test]
    fn rejects_directories_and_non_gguf_targets() {
        let (dir, root, config, model) = fixture();
        for target in [dir.path().join("folder.gguf"), dir.path().join("notes.txt")] {
            if target.extension().unwrap() == "gguf" {
                fs::create_dir(&target).unwrap();
            } else {
                fs::write(&target, b"keep").unwrap();
            }
            fs::write(
                &config,
                serde_yaml::to_string(&serde_json::json!({"model_path":target})).unwrap(),
            )
            .unwrap();
            assert!(delete_registered_gguf(&root, &config).is_err());
            assert!(target.exists());
            assert!(model.exists());
        }
    }
}
