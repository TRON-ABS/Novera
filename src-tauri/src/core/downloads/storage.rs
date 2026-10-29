//! The downloader accepts app data, plus the declared model's own shared storage folder.
use crate::core::filesystem::helpers::resolve_path_within_jan_data_folder;
use std::path::{Path, PathBuf};

pub fn default_models_root() -> Option<PathBuf> {
    dirs::document_dir().map(|path| path.join("Novera models"))
}

pub fn model_folder_name(id: &str) -> Result<String, String> {
    if id.is_empty() || id.len() > 200 || id.split('/').any(|p| p.is_empty() || p == "." || p == "..")
        || !id.bytes().all(|b| b.is_ascii_alphanumeric() || b"/_-.".contains(&b)) { return Err("Invalid model id".into()) }
    Ok(id.replace('/', "__"))
}

pub fn resolve_download_path(
    data_root: &Path,
    models_root: Option<&Path>,
    path: &str,
    model_id: Option<&str>,
) -> Result<(PathBuf, PathBuf), String> {
    let original_error = match resolve_path_within_jan_data_folder(data_root, path) {
        Ok(resolved) => return Ok(resolved),
        Err(error) => error,
    };
    let (Some(models_root), Some(model_id)) = (models_root, model_id) else { return Err(original_error) };
    let folder = model_folder_name(model_id)?;
    let expected = models_root.join(folder);
    // Resolve both through the shared root so a symlink/junction cannot escape it.
    let (_, model_root) = resolve_path_within_jan_data_folder(models_root, &expected.to_string_lossy())?;
    let (root, resolved) = resolve_path_within_jan_data_folder(models_root, path)?;
    if resolved == model_root || !resolved.starts_with(&model_root) {
        return Err(format!("Download destination is outside model folder {}", model_root.display()));
    }
    Ok((root, resolved))
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn qwen_download_accepts_its_documents_folder_and_companions() {
        let temp = tempfile::tempdir().unwrap();
        let data = temp.path().join("AppData/Novera/data");
        let models = temp.path().join("Documents/Novera models");
        let folder = models.join("Qwen3.5-2B-Q6_K");
        std::fs::create_dir_all(&data).unwrap();
        std::fs::create_dir_all(&folder).unwrap();
        for name in ["model.gguf", "mmproj.gguf", "model.gguf.tmp", "model.gguf.url", "tokenizer/config.json"] {
            let path = folder.join(name);
            let (_, resolved) = resolve_download_path(&data, Some(&models), &path.to_string_lossy(), Some("Qwen3.5-2B-Q6_K")).unwrap();
            assert!(resolved.ends_with(name));
        }
    }
    #[test]
    fn external_download_cannot_write_other_models_or_user_files() {
        let temp = tempfile::tempdir().unwrap();
        let data = temp.path().join("data");
        let models = temp.path().join("Documents/Novera models");
        std::fs::create_dir_all(&data).unwrap();
        std::fs::create_dir_all(models.join("Qwen3.5-2B-Q6_K")).unwrap();
        for path in [models.join("other/model.gguf"), temp.path().join("Documents/private.txt"), models.join("Qwen3.5-2B-Q6_K/../../private.txt")] {
            assert!(resolve_download_path(&data, Some(&models), &path.to_string_lossy(), Some("Qwen3.5-2B-Q6_K")).is_err());
        }
        let path = models.join("Qwen3.5-2B-Q6_K/model.gguf");
        assert!(resolve_download_path(&data, Some(&models), &path.to_string_lossy(), None).is_err());
        assert!(resolve_download_path(&data, Some(&models), &path.to_string_lossy(), Some("../Qwen3.5-2B-Q6_K")).is_err());
    }
    #[test]
    fn existing_app_data_downloads_are_unchanged() {
        let temp = tempfile::tempdir().unwrap();
        let (_, resolved) = resolve_download_path(temp.path(), None, "llamacpp/models/model.gguf", None).unwrap();
        assert!(resolved.ends_with("llamacpp/models/model.gguf"));
    }
    #[cfg(windows)]
    #[test]
    fn rejects_a_model_junction_outside_the_shared_root() {
        let temp = tempfile::tempdir().unwrap();
        let data = temp.path().join("data");
        let models = temp.path().join("models");
        let outside = temp.path().join("outside");
        for path in [&data, &models, &outside] { std::fs::create_dir_all(path).unwrap(); }
        let link = models.join("test");
        let result = std::process::Command::new("cmd.exe").args(["/d", "/c", "mklink", "/J"]).arg(&link).arg(&outside).output().unwrap();
        assert!(result.status.success(), "{}", String::from_utf8_lossy(&result.stderr));
        assert!(resolve_download_path(&data, Some(&models), &link.join("model.gguf").to_string_lossy(), Some("test")).is_err());
        // Remove only the junction itself, never its target.
        std::fs::remove_dir(&link).unwrap();
        assert!(outside.is_dir());
    }
    #[cfg(unix)]
    #[test]
    fn rejects_a_model_symlink_outside_the_shared_root() {
        let temp = tempfile::tempdir().unwrap();
        let data = temp.path().join("data");
        let models = temp.path().join("models");
        let outside = temp.path().join("outside");
        for path in [&data, &models, &outside] { std::fs::create_dir_all(path).unwrap(); }
        std::os::unix::fs::symlink(&outside, models.join("test")).unwrap();
        assert!(resolve_download_path(&data, Some(&models), &models.join("test/model.gguf").to_string_lossy(), Some("test")).is_err());
    }
}
