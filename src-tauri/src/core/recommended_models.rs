//! Discover only complete, checksum-verified text recommendations. No downloads or moves.
use serde::{Deserialize, Serialize};
use super::downloads::storage::{default_models_root, model_folder_name};
use sha2::{Digest, Sha256};
use std::{fs::File, io::Read, path::PathBuf};

#[derive(Deserialize)]
struct Recommendation { #[serde(default)] role: String, name: String, size: u64, sha256: String }
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct InstalledRecommendation {
    id: String, path: String, size: u64, sha256: String,
    #[serde(skip_serializing_if = "Option::is_none")] mmproj_path: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")] mmproj_size: Option<u64>,
    #[serde(skip_serializing_if = "Option::is_none")] mmproj_sha256: Option<String>,
}

fn verified(path: &std::path::Path, spec: &Recommendation) -> bool {
    (|| -> std::io::Result<bool> {
        let mut file = File::open(path)?;
        if file.metadata()?.len() != spec.size { return Ok(false) }
        let mut hash = Sha256::new();
        let mut buffer = [0u8; 65536];
        loop { let n = file.read(&mut buffer)?; if n == 0 { break } hash.update(&buffer[..n]); }
        Ok(hex::encode(hash.finalize()) == spec.sha256)
    })().unwrap_or(false)
}

fn discover(roots: &[PathBuf], recommendations: &[Recommendation]) -> Vec<InstalledRecommendation> {
    let mut found = Vec::new();
    for spec in recommendations {
        if spec.role == "text.mmproj" { continue }
        let Some(id) = spec.name.strip_suffix(".gguf") else { continue };
        // The checked-in manifest supplies filenames, never caller-controlled paths.
        if spec.name.contains(['/', '\\']) { continue }
        let paths = roots.iter().flat_map(|root| [root.join(&spec.name), root.join(id).join(&spec.name), root.join(id).join("model.gguf")]);
        for path in paths {
            let companion = if spec.role == "text.model" { recommendations.iter().find(|f| f.role == "text.mmproj") } else { None };
            let projector = companion.and_then(|f| path.parent().map(|parent| parent.join(&f.name)));
            let valid = verified(&path, spec) && match (companion, projector.as_ref()) {
                (Some(file), Some(file_path)) => !file.name.contains(['/', '\\']) && verified(file_path, file),
                (None, _) => true,
                _ => false,
            };
            if valid {
                found.push(InstalledRecommendation { id: id.into(), path: path.to_string_lossy().into_owned(), size: spec.size, sha256: spec.sha256.clone(),
                    mmproj_path: projector.map(|p| p.to_string_lossy().into_owned()), mmproj_size: companion.map(|f| f.size), mmproj_sha256: companion.map(|f| f.sha256.clone()) });
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
    if let Some(models) = default_models_root() { roots.insert(0, models); }
    #[cfg(not(feature = "portable"))]
    if let Some(downloads) = dirs::download_dir() { roots.push(downloads); }
    tokio::task::spawn_blocking(move || {
        let mut recommendations: Vec<Recommendation> = serde_json::from_str(include_str!("../../../web-app/src/constants/text-manifest.json")).map_err(|e| e.to_string())?;
        let alternatives: Vec<Recommendation> = serde_json::from_str(include_str!("../../../web-app/src/constants/text-alternatives.json")).map_err(|e| e.to_string())?;
        recommendations.extend(alternatives.into_iter().map(|mut f| { f.role = "alternative".into(); f }));
        Ok(discover(&roots, &recommendations))
    }).await.map_err(|e| e.to_string())?
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn default_model_requires_its_verified_projector_in_the_same_folder() {
        let root = tempfile::tempdir().unwrap();
        let model = Recommendation { role: "text.model".into(), name: "text.gguf".into(), size: 4, sha256: hex::encode(Sha256::digest(b"GGUF")) };
        let projector = Recommendation { role: "text.mmproj".into(), name: "mmproj.gguf".into(), size: 4, sha256: hex::encode(Sha256::digest(b"PROJ")) };
        std::fs::write(root.path().join("text.gguf"), b"GGUF").unwrap();
        let specs = [model, projector];
        assert!(discover(&[root.path().into()], &specs).is_empty());
        std::fs::write(root.path().join("mmproj.gguf"), b"BAD!").unwrap();
        assert!(discover(&[root.path().into()], &specs).is_empty());
        std::fs::write(root.path().join("mmproj.gguf"), b"PROJ").unwrap();
        let found = discover(&[root.path().into()], &specs);
        assert_eq!(found.len(), 1);
        assert_eq!(found[0].id, "text");
        assert_eq!(found[0].mmproj_size, Some(4));
        assert!(serde_json::to_value(&found[0]).unwrap()["mmprojPath"].as_str().unwrap().ends_with("mmproj.gguf"));
    }
    #[test]
    fn model_folder_names_cannot_escape_the_storage_root() {
        assert_eq!(model_folder_name("author/model-Q6_K").unwrap(), "author__model-Q6_K");
        for id in ["", "..", "../model", "/model", "a//b", "C:/model", "a\\b"] { assert!(model_folder_name(id).is_err(), "{id}"); }
    }
    #[test]
    fn discovers_only_complete_verified_recommendations_once() {
        let root = tempfile::tempdir().unwrap();
        let spec = Recommendation { role: String::new(), name: "text.gguf".into(), size: 4, sha256: hex::encode(Sha256::digest(b"GGUF")) };
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
        assert_eq!(discover(&[root.path().into()], &[Recommendation { role: String::new(), name: "text.gguf".into(), size: 4, sha256: hex::encode(Sha256::digest(b"GGUF")) }]).len(), 1);
    }
}
