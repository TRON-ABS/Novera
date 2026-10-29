//! Discover only complete, checksum-verified text recommendations. No downloads or moves.
use serde::{Deserialize, Serialize};
use super::downloads::storage::{default_models_root, model_folder_name};
use sha2::{Digest, Sha256};
use std::{fs::File, io::Read, path::PathBuf};

#[derive(Deserialize)]
struct Recommendation { name: String, size: u64, sha256: String }
#[derive(Serialize)]
pub struct InstalledRecommendation { id: String, path: String, size: u64, sha256: String }

fn discover(roots: &[PathBuf], recommendations: &[Recommendation]) -> Vec<InstalledRecommendation> {
    let mut found = Vec::new();
    for spec in recommendations {
        let Some(id) = spec.name.strip_suffix(".gguf") else { continue };
        // The checked-in manifest supplies filenames, never caller-controlled paths.
        if spec.name.contains(['/', '\\']) { continue }
        let paths = roots.iter().flat_map(|root| [root.join(&spec.name), root.join(id).join(&spec.name), root.join(id).join("model.gguf")]);
        for path in paths {
            let valid = (|| -> std::io::Result<bool> {
                let mut file = File::open(&path)?;
                if file.metadata()?.len() != spec.size { return Ok(false) }
                let mut hash = Sha256::new();
                let mut buffer = [0u8; 65536];
                loop { let n = file.read(&mut buffer)?; if n == 0 { break } hash.update(&buffer[..n]); }
                Ok(format!("{:x}", hash.finalize()) == spec.sha256)
            })().unwrap_or(false);
            if valid {
                found.push(InstalledRecommendation { id: id.into(), path: path.to_string_lossy().into_owned(), size: spec.size, sha256: spec.sha256.clone() });
                break;
            }
        }
    }
    found
}

#[tauri::command]
pub fn model_download_directory(model_id: String) -> Result<String, String> {
    let folder = model_folder_name(&model_id)?;
    let directory = default_models_root().ok_or("Documents directory unavailable")?.join(folder);
    std::fs::create_dir_all(&directory).map_err(|e| e.to_string())?;
    Ok(directory.to_string_lossy().into_owned())
}

#[tauri::command]
pub async fn recommended_model_files() -> Result<Vec<InstalledRecommendation>, String> {
    let mut roots = vec![super::app::commands::resolve_jan_data_folder().join("llamacpp/models")];
    if let Some(documents) = dirs::document_dir() { roots.insert(0, documents.join("Novera models")); }
    if let Some(downloads) = dirs::download_dir() { roots.push(downloads); }
    tokio::task::spawn_blocking(move || {
        let recommendations: Vec<Recommendation> = serde_json::from_str(include_str!("../../../web-app/src/constants/text-manifest.json")).map_err(|e| e.to_string())?;
        Ok(discover(&roots, &recommendations))
    }).await.map_err(|e| e.to_string())?
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn model_folder_names_cannot_escape_the_storage_root() {
        assert_eq!(model_folder_name("author/model-Q6_K").unwrap(), "author__model-Q6_K");
        for id in ["", "..", "../model", "/model", "a//b", "C:/model", "a\\b"] { assert!(model_folder_name(id).is_err(), "{id}"); }
    }
    #[test]
    fn discovers_only_complete_verified_recommendations_once() {
        let root = tempfile::tempdir().unwrap();
        let spec = Recommendation { name: "text.gguf".into(), size: 4, sha256: format!("{:x}", Sha256::digest(b"GGUF")) };
        std::fs::write(root.path().join("other.gguf"), b"GGUF").unwrap();
        assert!(discover(&[root.path().into()], std::slice::from_ref(&spec)).is_empty());
        std::fs::write(root.path().join("text.gguf"), b"GG").unwrap();
        assert!(discover(&[root.path().into()], std::slice::from_ref(&spec)).is_empty());
        std::fs::write(root.path().join("text.gguf"), b"BAD!").unwrap();
        assert!(discover(&[root.path().into()], std::slice::from_ref(&spec)).is_empty());
        std::fs::write(root.path().join("text.gguf"), b"GGUF").unwrap();
        let found = discover(&[root.path().into(), root.path().into()], &[spec]);
        assert_eq!(found.len(), 1);
        assert_eq!(found[0].id, "text");
        std::fs::remove_file(root.path().join("text.gguf")).unwrap();
        std::fs::create_dir(root.path().join("text")).unwrap();
        std::fs::write(root.path().join("text/text.gguf"), b"GGUF").unwrap();
        assert_eq!(discover(&[root.path().into()], &[Recommendation { name: "text.gguf".into(), size: 4, sha256: format!("{:x}", Sha256::digest(b"GGUF")) }]).len(), 1);
    }
}
