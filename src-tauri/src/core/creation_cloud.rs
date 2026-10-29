//! Save completed cloud media into OS-known folders, without forwarding API credentials.
use base64::Engine;
use serde::Deserialize;
use serde_json::{json, Value};
use std::{
    collections::HashMap,
    net::{IpAddr, SocketAddr},
    sync::{
        atomic::{AtomicBool, Ordering},
        Arc, LazyLock,
    },
    time::Duration,
};
use tokio::{
    io::AsyncWriteExt,
    sync::{Mutex, Notify},
};

struct Cancellation {
    stopped: AtomicBool,
    notify: Notify,
    started: std::time::Instant,
}
static SAVES: LazyLock<Mutex<HashMap<String, Arc<Cancellation>>>> =
    LazyLock::new(|| Mutex::new(HashMap::new()));

#[derive(Deserialize)]
pub struct CloudResult {
    id: String,
    task: String,
    provider: String,
    model: String,
    prompt: String,
    url: Option<String>,
    base64: Option<String>,
}

#[tauri::command]
pub async fn creation_cloud_prepare(id: String) -> Result<(), String> {
    uuid::Uuid::parse_str(&id).map_err(|_| "Invalid creation id")?;
    let mut saves = SAVES.lock().await;
    if saves.contains_key(&id) || saves.len() >= 16 {
        return Err("CREATION_BUSY".into());
    }
    saves.insert(
        id,
        Arc::new(Cancellation {
            stopped: AtomicBool::new(false),
            notify: Notify::new(),
            started: std::time::Instant::now(),
        }),
    );
    Ok(())
}
#[tauri::command]
pub async fn creation_cloud_release(id: String) {
    SAVES.lock().await.remove(&id);
}
pub async fn cancel(id: &str) {
    if let Some(flag) = SAVES.lock().await.get(id) {
        flag.stopped.store(true, Ordering::SeqCst);
        flag.notify.notify_one();
    }
}
fn public_ip(ip: IpAddr) -> bool {
    match ip {
        IpAddr::V4(v) => {
            let a = v.octets();
            !v.is_private()
                && !v.is_loopback()
                && !v.is_link_local()
                && !v.is_broadcast()
                && !v.is_documentation()
                && !v.is_multicast()
                && a[0] != 0
                && a[0] < 240
                && !(a[0] == 100 && (64..=127).contains(&a[1]))
                && !(a[0] == 198 && (18..=19).contains(&a[1]))
        }
        IpAddr::V6(v) => {
            let a = v.segments();
            v.to_ipv4_mapped()
                .map(|ip| public_ip(IpAddr::V4(ip)))
                .unwrap_or(a[0] & 0xe000 == 0x2000 && !(a[0] == 0x2001 && a[1] == 0x0db8))
        }
    }
}
async fn download(url: &str) -> Result<reqwest::Response, String> {
    let mut url = reqwest::Url::parse(url).map_err(|_| "Invalid media URL")?;
    for _ in 0..6 {
        if url.scheme() != "https"
            || !url.username().is_empty()
            || url.password().is_some()
            || url.port_or_known_default() != Some(443)
        {
            return Err("Invalid media origin".into());
        }
        let host = url.host_str().ok_or("Missing media host")?.to_owned();
        let addresses: Vec<SocketAddr> = tokio::net::lookup_host((host.as_str(), 443))
            .await
            .map_err(|_| "Media host unavailable")?
            .collect();
        if addresses.is_empty() || addresses.iter().any(|a| !public_ip(a.ip())) {
            return Err("Non-public media destination".into());
        }
        let client = reqwest::Client::builder()
            .redirect(reqwest::redirect::Policy::none())
            .timeout(Duration::from_secs(1200))
            .connect_timeout(Duration::from_secs(20))
            .no_proxy()
            .resolve_to_addrs(&host, &addresses)
            .build()
            .map_err(|_| "Download unavailable")?;
        let response = client
            .get(url.clone())
            .send()
            .await
            .map_err(|_| "Media download failed")?;
        if response.status().is_redirection() {
            let location = response
                .headers()
                .get(reqwest::header::LOCATION)
                .and_then(|s| s.to_str().ok())
                .ok_or("Missing media redirect")?;
            url = url.join(location).map_err(|_| "Invalid media redirect")?;
            continue;
        }
        if !response.status().is_success() {
            return Err(format!(
                "Media download HTTP {}",
                response.status().as_u16()
            ));
        }
        return Ok(response);
    }
    Err("Too many media redirects".into())
}
fn format(bytes: &[u8], task: &str) -> Result<(&'static str, &'static str), String> {
    if task == "music" {
        if bytes.starts_with(b"RIFF") && bytes.get(8..12)==Some(&b"WAVE"[..]) {return Ok(("wav","audio/wav"));}
        if bytes.starts_with(b"ID3") || (bytes.first()==Some(&0xff) && bytes.get(1).is_some_and(|b|b & 0xe6 == 0xe2)) {return Ok(("mp3","audio/mpeg"));}
    } else if task == "image" {
        if bytes.starts_with(b"\x89PNG\r\n\x1a\n") {
            return Ok(("png", "image/png"));
        }
        if bytes.starts_with(&[0xff, 0xd8, 0xff]) {
            return Ok(("jpg", "image/jpeg"));
        }
        if bytes.starts_with(b"RIFF") && bytes.get(8..12) == Some(&b"WEBP"[..]) {
            return Ok(("webp", "image/webp"));
        }
    } else if task == "video" && bytes.get(4..8) == Some(&b"ftyp"[..]) {
        return Ok(("mp4", "video/mp4"));
    }
    Err("Unexpected media format".into())
}

#[cfg(test)]
mod music_format_tests {
    use super::*;
    #[test]
    fn saves_only_audio_headers_as_music() {
        assert_eq!(format(b"RIFFxxxxWAVE","music").unwrap(),("wav","audio/wav"));
        assert_eq!(format(b"ID3xxxxxxxxx","music").unwrap(),("mp3","audio/mpeg"));
        assert!(format(b"RIFFxxxxWEBP","music").is_err());
        assert!(format(b"xxxxftypmp42","music").is_err());
        assert!(format(b"ID3xxxxxxxxx","video").is_err());
    }
}
pub(super) fn publish_stage(
    stage: &std::path::Path,
    output: &std::path::Path,
) -> Result<(), String> {
    #[cfg(windows)]
    {
        use std::os::windows::ffi::OsStrExt;
        let from: Vec<u16> = stage.as_os_str().encode_wide().chain(Some(0)).collect();
        let to: Vec<u16> = output.as_os_str().encode_wide().chain(Some(0)).collect();
        // No REPLACE_EXISTING flag: unlike std::fs::rename, this cannot overwrite a creation.
        let ok = unsafe {
            windows_sys::Win32::Storage::FileSystem::MoveFileExW(from.as_ptr(), to.as_ptr(), 0)
        };
        if ok == 0 {
            return Err(std::io::Error::last_os_error().to_string());
        }
    }
    #[cfg(not(windows))]
    {
        std::fs::hard_link(stage, output).map_err(|e| e.to_string())?;
        let _ = std::fs::remove_file(stage);
    }
    Ok(())
}
#[tauri::command]
pub async fn creation_cloud_save(request: CloudResult) -> Result<Value, String> {
    let flag = SAVES
        .lock()
        .await
        .get(&request.id)
        .cloned()
        .ok_or("Unknown cloud creation")?;
    let check = || {
        if flag.stopped.load(Ordering::SeqCst) {
            Err("Creation cancelled".to_owned())
        } else {
            Ok(())
        }
    };
    check()?;
    if request.prompt.len() > 32_000
        || request.provider.len() > 80
        || request.model.len() > 300
        || request.url.is_some() == request.base64.is_some()
    {
        return Err("Invalid cloud result".into());
    }
    let root = super::creation::output_directory(&request.task)?;
    std::fs::create_dir_all(&root).map_err(|e| e.to_string())?;
    let stage = root.join(format!(".Novera-{}.cloud-partial", request.id));
    let limit = if request.task == "image" {
        32 * 1024 * 1024u64
    } else {
        512 * 1024 * 1024u64
    };
    let result: Result<Value,String> = async {
        let mut file=tokio::fs::OpenOptions::new().write(true).create_new(true).open(&stage).await.map_err(|e|e.to_string())?;
        let mut header=Vec::new(); let mut size=0u64;
        if let Some(data)=request.base64 {
            if data.len() as u64 > limit * 4 / 3 + 4 { return Err("Cloud media too large".into()); }
            let bytes=base64::engine::general_purpose::STANDARD.decode(data).map_err(|_|"Invalid media encoding")?;
            size=bytes.len() as u64; header.extend_from_slice(&bytes[..bytes.len().min(32)]);
            check()?; file.write_all(&bytes).await.map_err(|e|e.to_string())?;
        } else {
            let mut response=tokio::select! {
                result=download(request.url.as_deref().ok_or("Missing media URL")?) => result?,
                _=flag.notify.notified() => return Err("Creation cancelled".into()),
            };
            if response.content_length().is_some_and(|s|s>limit) { return Err("Cloud media too large".into()); }
            loop {
                let chunk=tokio::select! {
                    result=response.chunk() => result.map_err(|_|"Media transfer interrupted")?,
                    _=flag.notify.notified() => return Err("Creation cancelled".into()),
                };
                let Some(chunk)=chunk else { break };
                check()?; size+=chunk.len() as u64; if size>limit { return Err("Cloud media too large".into()); }
                if header.len()<32 { header.extend_from_slice(&chunk[..chunk.len().min(32-header.len())]); }
                file.write_all(&chunk).await.map_err(|e|e.to_string())?;
            }
        }
        if size==0 || size>limit { return Err("Empty or oversized cloud media".into()); }
        let (extension,mime)=format(&header,&request.task)?;
        file.sync_all().await.map_err(|e|e.to_string())?; drop(file); check()?;
        let name=format!("Novera-{}.{}",request.id,extension); let output=root.join(&name);
        let sidecar=root.join(format!("{name}.json"));
        let metadata=json!({"provider":request.provider,"model":request.model,"prompt":request.prompt,"task":request.task,"bytes":size,"total_seconds":flag.started.elapsed().as_secs_f64()});
        let mut meta=tokio::fs::OpenOptions::new().write(true).create_new(true).open(&sidecar).await.map_err(|e|e.to_string())?;
        if let Err(error)=meta.write_all(serde_json::to_string_pretty(&metadata).map_err(|e|e.to_string())?.as_bytes()).await { let _=tokio::fs::remove_file(&sidecar).await; return Err(error.to_string()); }
        drop(meta);
        let publish=(|| -> Result<(),String> { check()?;
            publish_stage(&stage,&output)?;
            Ok(())
        })();
        if let Err(error)=publish { let _=tokio::fs::remove_file(&sidecar).await; return Err(error); }
        Ok(json!({"name":name,"mediaType":mime}))
    }.await;
    let _ = tokio::fs::remove_file(stage).await;
    result
}
