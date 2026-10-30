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
    let mut targets = vec![model.to_path_buf()];
    // Split downloads remain separate files. Derive only the numbered siblings
    // of the registered first shard, never arbitrary paths from YAML.
    if let Some(name) = model.file_name().and_then(|name| name.to_str()) {
        if let Some(marker) = name.to_ascii_lowercase().rfind("-00001-of-") {
            let stem = &name[..marker];
            let tail = &name[marker + 10..];
            let separator = &name[marker + 7..marker + 9];
            let (count, extension) = tail.split_once('.').ok_or("Invalid GGUF split name")?;
            if count.len() != 5 || !count.bytes().all(|c| c.is_ascii_digit()) {
                return Err("Invalid GGUF split count".into());
            }
            let count: usize = count.parse().map_err(|_| "Invalid GGUF split count")?;
            if count < 2 {
                return Err("Invalid GGUF split count".into());
            }
            targets.extend((2..=count).map(|index| {
                model.with_file_name(format!(
                    "{stem}-{index:05}-{separator}-{count:05}.{extension}"
                ))
            }));
        }
    }
    // Validate the complete set before deleting any member. Missing files are
    // tolerated so stale or interrupted downloads can still be removed.
    for target in &targets {
        match fs::symlink_metadata(target) {
            Ok(metadata) if metadata.is_file() && !metadata.file_type().is_symlink() => {}
            Ok(_) => return Err("The registered GGUF must be a regular file".into()),
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => {}
            Err(error) => return Err(error.to_string()),
        }
    }
    for target in targets {
        match fs::remove_file(target) {
            Ok(()) => {}
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => {}
            Err(error) => return Err(error.to_string()),
        }
    }
    Ok(())
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
    fn deletes_the_whole_split_series_but_keeps_other_variants() {
        let (_dir, root, config, model) = fixture();
        let first = model.with_file_name("model-Q4-00001-of-00003.gguf");
        let second = model.with_file_name("model-Q4-00002-of-00003.gguf");
        let unrelated = model.with_file_name("model-Q8-00002-of-00003.gguf");
        for target in [&first, &second, &unrelated] {
            fs::write(target, b"GGUF").unwrap();
        }
        fs::write(
            &config,
            serde_yaml::to_string(&serde_json::json!({"model_path": first})).unwrap(),
        )
        .unwrap();
        delete_registered_gguf(&root, &config).unwrap();
        assert!(!first.exists());
        assert!(!second.exists());
        assert!(unrelated.exists());
        assert!(model.exists());
        delete_registered_gguf(&root, &config).unwrap();
    }

    #[test]
    fn rejects_an_invalid_later_shard_before_deleting_the_first() {
        let (_dir, root, config, model) = fixture();
        let first = model.with_file_name("model-00001-of-00002.gguf");
        let second = model.with_file_name("model-00002-of-00002.gguf");
        fs::write(&first, b"GGUF").unwrap();
        fs::create_dir(&second).unwrap();
        fs::write(
            &config,
            serde_yaml::to_string(&serde_json::json!({"model_path": first})).unwrap(),
        )
        .unwrap();
        assert!(delete_registered_gguf(&root, &config).is_err());
        assert!(first.exists());
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
