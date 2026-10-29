//! Local-only exports and OS share sheets. No public hosting or automatic send.
use base64::Engine;
use serde::Deserialize;
use serde_json::{json, Value};
use std::{
    io::{Cursor, Read},
    path::{Path, PathBuf},
};
use tauri::{Manager, Runtime};
const MAX_BYTES: usize = 256 * 1024 * 1024;

#[derive(Deserialize)]
pub struct AssetRef {
    task: String,
    name: String,
}
#[derive(Deserialize)]
pub struct Payload {
    filename: String,
    mime: String,
    base64: Option<String>,
    asset: Option<AssetRef>,
}

fn asset_path(task: &str, name: &str) -> Result<PathBuf, String> {
    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    {
        super::creation::creation_resolve(task.into(), name.into()).map(PathBuf::from)
    }
    #[cfg(any(target_os = "android", target_os = "ios"))]
    {
        let _ = (task, name);
        Err("SHARE_UNSUPPORTED".into())
    }
}
fn payload_bytes(payload: &Payload) -> Result<Vec<u8>, String> {
    let value = payload.base64.as_deref().ok_or("SHARE_EMPTY")?;
    if value.len() > MAX_BYTES * 4 / 3 + 8 {
        return Err("SHARE_TOO_LARGE".into());
    }
    let bytes = base64::engine::general_purpose::STANDARD
        .decode(value)
        .map_err(|_| "SHARE_INVALID")?;
    if bytes.len() > MAX_BYTES {
        return Err("SHARE_TOO_LARGE".into());
    }
    Ok(bytes)
}
fn valid_filename(name: &str) -> Result<(), String> {
    if name.is_empty()
        || name.len() > 255
        || name
            .chars()
            .any(|c| c.is_control() || "<>:\"/\\|?*".contains(c))
        || name.starts_with('.')
        || name.ends_with(['.', ' '])
    {
        return Err("SHARE_INVALID".into());
    }
    let stem = name.split('.').next().unwrap_or("").to_ascii_uppercase();
    if ["CON", "PRN", "AUX", "NUL"].contains(&stem.as_str())
        || ((stem.starts_with("COM") || stem.starts_with("LPT"))
            && stem.len() == 4
            && matches!(stem.as_bytes()[3], b'1'..=b'9'))
    {
        return Err("SHARE_INVALID".into());
    }
    Ok(())
}
fn mime_for(path: &Path) -> &'static str {
    match path
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_ascii_lowercase()
        .as_str()
    {
        "png" => "image/png",
        "jpg" | "jpeg" => "image/jpeg",
        "webp" => "image/webp",
        "gif" => "image/gif",
        "mp4" => "video/mp4",
        "webm" => "video/webm",
        "wav" => "audio/wav",
        "mp3" => "audio/mpeg",
        _ => "application/octet-stream",
    }
}

#[tauri::command]
pub async fn sharing_read_asset(task: String, name: String) -> Result<Value, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let path=asset_path(&task,&name)?;
        if std::fs::metadata(&path).map_err(|_|"SHARE_MEDIA_MISSING")?.len()>MAX_BYTES as u64 {return Err("SHARE_TOO_LARGE".into());}
        let mut bytes=Vec::new();std::fs::File::open(&path).map_err(|_|"SHARE_MEDIA_MISSING")?.take((MAX_BYTES+1) as u64).read_to_end(&mut bytes).map_err(|_|"SHARE_MEDIA_MISSING")?;
        if bytes.len()>MAX_BYTES{return Err("SHARE_TOO_LARGE".into());}
        Ok(json!({"base64":base64::engine::general_purpose::STANDARD.encode(bytes),"mime":mime_for(&path)}))
    }).await.map_err(|e|e.to_string())?
}

#[tauri::command]
pub async fn sharing_metadata(task: String, name: String) -> Result<Value, String> {
    let path = asset_path(&task, &name)?;
    let meta = path.with_extension(format!(
        "{}.json",
        path.extension().and_then(|e| e.to_str()).unwrap_or("png")
    ));
    if std::fs::metadata(&meta).map(|m| m.len()).unwrap_or(0) > 1024 * 1024 {
        return Err("SHARE_TOO_LARGE".into());
    }
    let raw: Value =
        serde_json::from_slice(&std::fs::read(meta).map_err(|_| "SHARE_MEDIA_MISSING")?)
            .map_err(|_| "SHARE_INVALID")?;
    let keys = [
        "model",
        "backend",
        "seed",
        "width",
        "height",
        "steps",
        "device",
        "encoder_device",
        "upscale_factor",
        "upscale_model",
        "output_width",
        "output_height",
        "generation_seconds",
        "total_seconds",
    ];
    let mut result = serde_json::Map::new();
    for key in keys {
        if let Some(value) = raw.get(key) {
            result.insert(key.into(), value.clone());
        }
    }
    Ok(Value::Object(result))
}

#[tauri::command]
pub async fn sharing_convert_image(base64: String, format: String) -> Result<Value, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let encoded=Payload{filename:"image".into(),mime:"".into(),base64:Some(base64),asset:None};
        let bytes=payload_bytes(&encoded)?;
        let mut reader=image::ImageReader::new(Cursor::new(bytes)).with_guessed_format().map_err(|_|"SHARE_UNSUPPORTED")?;
        let mut limits=image::Limits::default();limits.max_image_width=Some(16384);limits.max_image_height=Some(16384);limits.max_alloc=Some(512*1024*1024);reader.limits(limits);
        use image::ImageDecoder;
        let mut decoder=reader.into_decoder().map_err(|_|"SHARE_UNSUPPORTED")?;
        let orientation=decoder.orientation().unwrap_or(image::metadata::Orientation::NoTransforms);
        let mut img=image::DynamicImage::from_decoder(decoder).map_err(|_|"SHARE_UNSUPPORTED")?;
        img.apply_orientation(orientation);
        if img.width() as u64 * img.height() as u64 > 100_000_000{return Err("SHARE_TOO_LARGE".into());}
        let (kind,mime)=match format.as_str(){
            "png"=>(image::ImageFormat::Png,"image/png"),"jpeg"=>(image::ImageFormat::Jpeg,"image/jpeg"),"webp"=>(image::ImageFormat::WebP,"image/webp"),"gif"=>(image::ImageFormat::Gif,"image/gif"),"bmp"=>(image::ImageFormat::Bmp,"image/bmp"),"tiff"=>(image::ImageFormat::Tiff,"image/tiff"),"ico"=>(image::ImageFormat::Ico,"image/x-icon"),"tga"=>(image::ImageFormat::Tga,"image/x-tga"),"ppm"=>(image::ImageFormat::Pnm,"image/x-portable-pixmap"),"avif"=>(image::ImageFormat::Avif,"image/avif"),"qoi"=>(image::ImageFormat::Qoi,"image/qoi"),_=>return Err("SHARE_UNSUPPORTED".into())};
        if format=="ico" {img=img.thumbnail(256,256);}
        if !["png","tiff"].contains(&format.as_str()) {img=image::DynamicImage::ImageRgba8(img.to_rgba8());}
        if format=="jpeg"||format=="ppm" {
            let rgba=img.to_rgba8();let mut rgb=image::RgbImage::new(rgba.width(),rgba.height());
            for (x,y,p) in rgba.enumerate_pixels(){let a=p[3] as u16;rgb.put_pixel(x,y,image::Rgb([((p[0] as u16*a+255*(255-a))/255) as u8,((p[1] as u16*a+255*(255-a))/255) as u8,((p[2] as u16*a+255*(255-a))/255) as u8]));}
            img=image::DynamicImage::ImageRgb8(rgb);
        }
        let mut output=Cursor::new(Vec::new());
        if format=="jpeg" {image::codecs::jpeg::JpegEncoder::new_with_quality(&mut output,95).encode_image(&img).map_err(|_|"SHARE_UNSUPPORTED")?;}
        else if format=="ppm" {
            use image::codecs::pnm::{PnmEncoder,PnmSubtype,SampleEncoding};
            PnmEncoder::new(&mut output).with_subtype(PnmSubtype::Pixmap(SampleEncoding::Binary))
                .encode(img.as_bytes(),img.width(),img.height(),image::ExtendedColorType::Rgb8).map_err(|_|"SHARE_UNSUPPORTED")?;
        }
        else {img.write_to(&mut output,kind).map_err(|_|"SHARE_UNSUPPORTED")?;}
        if output.get_ref().len()>MAX_BYTES{return Err("SHARE_TOO_LARGE".into());}
        Ok(json!({"base64":base64::engine::general_purpose::STANDARD.encode(output.into_inner()),"mime":mime}))
    }).await.map_err(|e|e.to_string())?
}

#[tauri::command]
pub async fn sharing_save<R: Runtime>(
    app: tauri::AppHandle<R>,
    destination: String,
    payload: Payload,
) -> Result<(), String> {
    valid_filename(&payload.filename)?;
    if destination.is_empty() {
        return Err("SHARE_INVALID".into());
    }
    let source = payload
        .asset
        .as_ref()
        .map(|a| asset_path(&a.task, &a.name))
        .transpose()?;
    let bytes = if source.is_none() {
        Some(payload_bytes(&payload)?)
    } else {
        None
    };
    #[cfg(target_os = "android")]
    if destination.starts_with("content://") {
        use std::io::Write;
        use tauri_plugin_fs::FsExt;
        let path = tauri_plugin_fs::FilePath::Url(
            url::Url::parse(&destination).map_err(|e| e.to_string())?,
        );
        let mut options = tauri_plugin_fs::OpenOptions::new();
        options.write(true).truncate(true);
        let mut target = app.fs().open(path, options).map_err(|e| e.to_string())?;
        if let Some(source) = source {
            std::io::copy(
                &mut std::fs::File::open(source).map_err(|e| e.to_string())?,
                &mut target,
            )
            .map_err(|e| e.to_string())?;
        } else {
            target
                .write_all(&bytes.unwrap())
                .map_err(|e| e.to_string())?;
        }
        return Ok(());
    }
    let _ = app;
    tauri::async_runtime::spawn_blocking(move || {
        if let Some(source) = source {
            if PathBuf::from(&destination).canonicalize().ok().as_ref() == Some(&source) {
                return Ok(());
            }
            std::fs::copy(source, destination)
                .map(|_| ())
                .map_err(|e| e.to_string())
        } else {
            std::fs::write(destination, bytes.unwrap()).map_err(|e| e.to_string())
        }
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
pub async fn sharing_native<R: Runtime>(
    app: tauri::AppHandle<R>,
    window: tauri::WebviewWindow<R>,
    title: String,
    text: String,
    payload: Payload,
) -> Result<(), String> {
    let (mime, stage_app) = (payload.mime.clone(), app.clone());
    let file = tauri::async_runtime::spawn_blocking(move || stage_payload(&stage_app, &payload))
        .await
        .map_err(|e| e.to_string())??;
    #[cfg(windows)]
    let item = prepare_windows_share(file.clone()).await?;
    let _ = (&window, &mime);
    #[cfg(target_os = "linux")]
    return linux_share(&file, &title, &text).await;
    #[cfg(any(target_os = "android", target_os = "ios"))]
    return tauri_plugin_novera_share::share(
        &app,
        &file.to_string_lossy(),
        &mime,
        &title,
        &text,
        false,
    );
    #[cfg(not(any(target_os = "android", target_os = "ios", target_os = "linux")))]
    {
        let _ = &mime;
        let (send, receive) = tokio::sync::oneshot::channel();
        let owner = window.clone();
        window
            .run_on_main_thread(move || {
                #[cfg(windows)]
                let result = native_sheet(&owner, item, &title, &text, false);
                #[cfg(not(windows))]
                let result = native_sheet(&owner, &file, &title, &text, false);
                let _ = send.send(result);
            })
            .map_err(|e| e.to_string())?;
        receive.await.map_err(|e| e.to_string())?
    }
}

fn stage_payload<R: Runtime>(
    app: &tauri::AppHandle<R>,
    payload: &Payload,
) -> Result<PathBuf, String> {
    valid_filename(&payload.filename)?;
    if payload.asset.is_some() == payload.base64.is_some() {
        return Err("SHARE_INVALID".into());
    }
    let cache = app
        .path()
        .app_cache_dir()
        .map_err(|e| e.to_string())?
        .join("shares");
    std::fs::create_dir_all(&cache).map_err(|e| e.to_string())?;
    let cache = cache.canonicalize().map_err(|e| e.to_string())?;
    // Retain files while OS targets consume them, then expire only marked,
    // UUID-named directories canonically contained in our own share cache.
    if let Ok(entries) = std::fs::read_dir(&cache) {
        for entry in entries.flatten().take(256) {
            let path = entry.path();
            let name = entry.file_name().to_string_lossy().into_owned();
            let old = entry
                .metadata()
                .and_then(|m| m.modified())
                .ok()
                .and_then(|t| t.elapsed().ok())
                .is_some_and(|d| d.as_secs() > 7 * 86400);
            if old
                && uuid::Uuid::parse_str(&name).is_ok()
                && std::fs::symlink_metadata(&path)
                    .is_ok_and(|m| m.is_dir() && !m.file_type().is_symlink())
                && path.join(".novera-share").is_file()
                && path.canonicalize().is_ok_and(|p| p.starts_with(&cache))
            {
                let _ = std::fs::remove_dir_all(path);
            }
        }
    }
    let root = cache.join(uuid::Uuid::new_v4().to_string());
    std::fs::create_dir(&root).map_err(|e| e.to_string())?;
    std::fs::write(root.join(".novera-share"), b"Novera share cache v1")
        .map_err(|e| e.to_string())?;
    let file = root.join(&payload.filename);
    if let Some(asset) = &payload.asset {
        std::fs::copy(asset_path(&asset.task, &asset.name)?, &file).map_err(|e| e.to_string())?;
    } else {
        std::fs::write(&file, payload_bytes(payload)?).map_err(|e| e.to_string())?;
    }
    Ok(file)
}

#[tauri::command]
pub async fn sharing_copy_file<R: Runtime>(
    app: tauri::AppHandle<R>,
    window: tauri::WebviewWindow<R>,
    payload: Payload,
) -> Result<(), String> {
    let (mime, stage_app) = (payload.mime.clone(), app.clone());
    let file = tauri::async_runtime::spawn_blocking(move || stage_payload(&stage_app, &payload))
        .await
        .map_err(|e| e.to_string())??;
    #[cfg(windows)]
    {
        let _ = mime;
        let owner = window.hwnd().map_err(|e| e.to_string())?.0 as isize;
        return tauri::async_runtime::spawn_blocking(move || copy_windows_file(&file, owner))
            .await
            .map_err(|e| e.to_string())?;
    }
    #[cfg(any(target_os = "android", target_os = "ios"))]
    return tauri_plugin_novera_share::share(
        &app,
        &file.to_string_lossy(),
        &mime,
        "Novera",
        "",
        true,
    );
    #[cfg(not(any(windows, target_os = "android", target_os = "ios")))]
    {
        let _ = mime;
        let owner = window.clone();
        let (send, receive) = tokio::sync::oneshot::channel();
        window
            .run_on_main_thread(move || {
                let result = native_sheet(&owner, &file, "Novera", "", true);
                let _ = send.send(result);
            })
            .map_err(|e| e.to_string())?;
        receive.await.map_err(|e| e.to_string())?
    }
}

#[cfg(target_os = "linux")]
async fn linux_share(file: &Path, title: &str, text: &str) -> Result<(), String> {
    use futures_util::StreamExt;
    use std::collections::HashMap;
    use std::os::fd::AsFd;
    use zbus::zvariant::{Fd, OwnedObjectPath, OwnedValue, Value};
    let connection = zbus::Connection::session()
        .await
        .map_err(|e| format!("SHARE_UNSUPPORTED: {e}"))?;
    let portal = zbus::Proxy::new(
        &connection,
        "org.freedesktop.portal.Desktop",
        "/org/freedesktop/portal/desktop",
        "org.freedesktop.portal.Email",
    )
    .await
    .map_err(|e| e.to_string())?;
    let mut options: HashMap<&str, Value<'_>> = HashMap::new();
    options.insert("subject", Value::from(title));
    options.insert("body", Value::from(text));
    let attachment = std::fs::File::open(file).map_err(|e| e.to_string())?;
    options.insert(
        "attachment_fds",
        Value::from(vec![Fd::from(attachment.as_fd())]),
    );
    let token = format!("novera{}", uuid::Uuid::new_v4().simple());
    options.insert("handle_token", Value::from(token.as_str()));
    let sender = connection
        .unique_name()
        .ok_or("SHARE_UNSUPPORTED")?
        .as_str()
        .trim_start_matches(':')
        .replace('.', "_");
    let request_path = format!("/org/freedesktop/portal/desktop/request/{sender}/{token}");
    let request = zbus::Proxy::new(
        &connection,
        "org.freedesktop.portal.Desktop",
        request_path.as_str(),
        "org.freedesktop.portal.Request",
    )
    .await
    .map_err(|e| e.to_string())?;
    let mut responses = request
        .receive_signal("Response")
        .await
        .map_err(|e| e.to_string())?;
    // Compose only: the user's mail application owns recipients and sending.
    let _: OwnedObjectPath = portal
        .call("ComposeEmail", &("", options))
        .await
        .map_err(|e| format!("SHARE_UNSUPPORTED: {e}"))?;
    let response =
        tokio::time::timeout(std::time::Duration::from_secs(120), responses.next()).await;
    match response {
        Ok(Some(message)) => {
            let (code, _): (u32, HashMap<String, OwnedValue>) =
                message.body().deserialize().map_err(|e| e.to_string())?;
            match code {
                0 => Ok(()),
                1 => Err("SHARE_CANCELLED".into()),
                _ => Err("SHARE_UNSUPPORTED".into()),
            }
        }
        _ => {
            let _: Result<(), _> = request.call("Close", &()).await;
            Err("SHARE_UNSUPPORTED".into())
        }
    }
}

#[cfg(windows)]
fn windows_storage_path(file: &Path) -> Result<String, String> {
    let path = file.to_str().ok_or("SHARE_INVALID")?.replace('/', "\\");
    Ok(if let Some(unc) = path.strip_prefix("\\\\?\\UNC\\") {
        format!("\\\\{unc}")
    } else {
        path.strip_prefix("\\\\?\\").unwrap_or(&path).to_owned()
    })
}

#[cfg(windows)]
fn with_windows_mta<T>(run: impl FnOnce() -> windows::core::Result<T>) -> windows::core::Result<T> {
    use windows::Win32::System::WinRT::{RoInitialize, RoUninitialize, RO_INIT_MULTITHREADED};
    // Balance even S_FALSE; never uninitialize an apartment whose init failed.
    unsafe { RoInitialize(RO_INIT_MULTITHREADED)?; }
    struct Apartment;
    impl Drop for Apartment {
        fn drop(&mut self) { unsafe { RoUninitialize(); } }
    }
    let _apartment = Apartment;
    run()
}

#[cfg(windows)]
fn prepare_windows_storage_item(file: &Path) -> Result<windows::core::AgileReference<windows::Storage::IStorageItem>, String> {
    use windows::{core::{AgileReference, HSTRING, Interface}, Storage::{IStorageItem, StorageFile}};
    let path = windows_storage_path(file)?;
    with_windows_mta(|| {
        // join is safe on this MTA worker. It must never run on the UI thread:
        // WinRT completion can need the UI message pump that join would block.
        let item: IStorageItem = StorageFile::GetFileFromPathAsync(&HSTRING::from(path))?.join()?.cast()?;
        AgileReference::new(&item)
    }).map_err(|e| format!("SHARE_UNSUPPORTED: preparing Windows file: {e}"))
}

#[cfg(windows)]
async fn prepare_windows_share(file: PathBuf) -> Result<windows::core::AgileReference<windows::Storage::IStorageItem>, String> {
    tokio::time::timeout(
        std::time::Duration::from_secs(15),
        tauri::async_runtime::spawn_blocking(move || prepare_windows_storage_item(&file)),
    ).await.map_err(|_| "SHARE_UNSUPPORTED: Windows file preparation timed out".to_string())?
        .map_err(|e| e.to_string())?
}

#[cfg(windows)]
fn native_sheet<R: Runtime>(
    window: &tauri::WebviewWindow<R>,
    item: windows::core::AgileReference<windows::Storage::IStorageItem>,
    title: &str,
    text: &str,
    _copy: bool,
) -> Result<(), String> {
    use windows::{
        core::{factory, HSTRING},
        ApplicationModel::DataTransfer::{DataRequestedEventArgs, DataTransferManager},
        Foundation::TypedEventHandler,
        Storage::IStorageItem,
        Win32::{Foundation::HWND, UI::Shell::IDataTransferManagerInterop},
    };
    use windows_collections::IIterable;
    thread_local! {static ACTIVE:std::cell::RefCell<Option<(DataTransferManager,i64)>>=const{std::cell::RefCell::new(None)};}
    let run = || -> windows::core::Result<()> {
        use windows::Win32::System::WinRT::{RoInitialize, RO_INIT_SINGLETHREADED};
        thread_local! {static RO:std::cell::OnceCell<windows::core::Result<()>>=const{std::cell::OnceCell::new()};}
        RO.with(|r| {
            r.get_or_init(|| unsafe { RoInitialize(RO_INIT_SINGLETHREADED) })
                .clone()
        })?;
        let interop: IDataTransferManagerInterop =
            factory::<DataTransferManager, IDataTransferManagerInterop>()?;
        let hwnd = HWND(
            window
                .hwnd()
                .map_err(|_| windows::core::Error::from_thread())?
                .0,
        );
        let manager: DataTransferManager = unsafe { interop.GetForWindow(hwnd)? };
        ACTIVE.with(|s| {
            if let Some((m, t)) = s.borrow_mut().take() {
                let _ = m.RemoveDataRequested(t);
            }
        });
        let title = HSTRING::from(title);
        let text = HSTRING::from(text);
        let token = manager.DataRequested(&TypedEventHandler::<
            DataTransferManager,
            DataRequestedEventArgs,
        >::new(move |_, args| {
            let args = args
                .as_ref()
                .ok_or_else(windows::core::Error::from_thread)?;
            let data = args.Request()?.Data()?;
            data.Properties()?.SetTitle(&title)?;
            if !text.is_empty() {
                data.SetText(&text)?;
            }
            let items: IIterable<IStorageItem> = vec![Some(item.resolve()?)].into();
            data.SetStorageItemsReadOnly(&items)?;
            Ok(())
        }))?;
        ACTIVE.with(|s| *s.borrow_mut() = Some((manager, token)));
        unsafe { interop.ShowShareUIForWindow(hwnd) }
    };
    run().map_err(|e| format!("SHARE_UNSUPPORTED: {e}"))
}

#[cfg(windows)]
fn windows_file_drop(file: &Path) -> Result<Vec<u8>, String> {
    use windows::Win32::{
        Foundation::POINT,
        UI::Shell::DROPFILES,
    };
    let path = file.to_str().ok_or("SHARE_INVALID")?;
    let plain = if let Some(unc) = path.strip_prefix("\\\\?\\UNC\\") {
        format!("\\\\{unc}")
    } else {
        path.strip_prefix("\\\\?\\").unwrap_or(path).to_owned()
    };
    let names: Vec<u16> = plain.encode_utf16().chain([0, 0]).collect();
    let header = DROPFILES {
        pFiles: std::mem::size_of::<DROPFILES>() as u32,
        pt: POINT::default(),
        fNC: false.into(),
        fWide: true.into(),
    };
    let mut bytes = Vec::with_capacity(std::mem::size_of::<DROPFILES>() + names.len() * 2);
    // DROPFILES has only initialized 32-bit fields, with no interior padding.
    bytes.extend_from_slice(unsafe {
        std::slice::from_raw_parts(
            &header as *const DROPFILES as *const u8,
            std::mem::size_of::<DROPFILES>(),
        )
    });
    for value in names {
        bytes.extend_from_slice(&value.to_le_bytes());
    }
    Ok(bytes)
}

#[cfg(windows)]
fn copy_windows_file(file: &Path, owner: isize) -> Result<(), String> {
    use windows::Win32::{
        Foundation::{GlobalFree, HANDLE, HGLOBAL, HWND},
        System::{
            DataExchange::{CloseClipboard, EmptyClipboard, OpenClipboard, SetClipboardData},
            Memory::{GlobalAlloc, GlobalLock, GlobalUnlock, GMEM_MOVEABLE},
        },
    };
    struct Memory(Option<HGLOBAL>);
    impl Drop for Memory {
        fn drop(&mut self) {
            if let Some(handle) = self.0 {
                unsafe {
                    let _ = GlobalFree(Some(handle));
                }
            }
        }
    }
    struct Clipboard;
    impl Drop for Clipboard {
        fn drop(&mut self) {
            unsafe {
                let _ = CloseClipboard();
            }
        }
    }
    let run = || -> windows::core::Result<()> {
        let bytes = windows_file_drop(file).map_err(|_| windows::core::Error::from_thread())?;
        unsafe {
            let handle = GlobalAlloc(GMEM_MOVEABLE, bytes.len())?;
            let mut memory = Memory(Some(handle));
            let target = GlobalLock(handle);
            if target.is_null() {
                return Err(windows::core::Error::from_thread());
            }
            std::ptr::copy_nonoverlapping(bytes.as_ptr(), target.cast::<u8>(), bytes.len());
            let _ = GlobalUnlock(handle);
            let mut opened = OpenClipboard(Some(HWND(owner as *mut _)));
            for _ in 0..8 {
                if opened.is_ok() {
                    break;
                }
                std::thread::sleep(std::time::Duration::from_millis(25));
                opened = OpenClipboard(Some(HWND(owner as *mut _)));
            }
            opened?;
            let _clipboard = Clipboard;
            EmptyClipboard()?;
            // CF_HDROP = 15. Windows owns the complete block after this call;
            // no deferred WinRT callback or UI-thread file access is required.
            SetClipboardData(15, Some(HANDLE(handle.0)))?;
            memory.0 = None;
        }
        Ok(())
    };
    run().map_err(|e| format!("SHARE_UNSUPPORTED: {e}"))
}

#[cfg(target_os = "macos")]
fn native_sheet<R: Runtime>(
    window: &tauri::WebviewWindow<R>,
    file: &Path,
    _title: &str,
    _text: &str,
    copy: bool,
) -> Result<(), String> {
    use std::{
        ffi::{c_void, CString},
        mem::transmute,
    };
    #[repr(C)]
    struct Rect {
        x: f64,
        y: f64,
        w: f64,
        h: f64,
    }
    #[link(name = "objc")]
    unsafe extern "C" {
        fn objc_getClass(s: *const i8) -> *mut c_void;
        fn sel_registerName(s: *const i8) -> *mut c_void;
        fn objc_msgSend();
    }
    unsafe fn call0(obj: *mut c_void, name: &str) -> *mut c_void {
        unsafe {
            let sel = sel_registerName(CString::new(name).unwrap().as_ptr());
            let f: unsafe extern "C" fn(*mut c_void, *mut c_void) -> *mut c_void =
                transmute(objc_msgSend as *const ());
            f(obj, sel)
        }
    }
    unsafe fn call1(obj: *mut c_void, name: &str, arg: *mut c_void) -> *mut c_void {
        unsafe {
            let sel = sel_registerName(CString::new(name).unwrap().as_ptr());
            let f: unsafe extern "C" fn(*mut c_void, *mut c_void, *mut c_void) -> *mut c_void =
                transmute(objc_msgSend as *const ());
            f(obj, sel, arg)
        }
    }
    thread_local! {static PICKER:std::cell::Cell<*mut c_void>=const{std::cell::Cell::new(std::ptr::null_mut())};}
    let view = window.ns_view().map_err(|e| e.to_string())?;
    let path = CString::new(file.to_string_lossy().as_bytes()).map_err(|_| "SHARE_INVALID")?;
    unsafe {
        let string = call1(
            objc_getClass(c"NSString".as_ptr()),
            "stringWithUTF8String:",
            path.as_ptr() as *mut c_void,
        );
        let url = call1(objc_getClass(c"NSURL".as_ptr()), "fileURLWithPath:", string);
        let items = call1(objc_getClass(c"NSArray".as_ptr()), "arrayWithObject:", url);
        if copy {
            let board = call0(objc_getClass(c"NSPasteboard".as_ptr()), "generalPasteboard");
            call0(board, "clearContents");
            let write: unsafe extern "C" fn(*mut c_void, *mut c_void, *mut c_void) -> i8 =
                transmute(objc_msgSend as *const ());
            if write(board, sel_registerName(c"writeObjects:".as_ptr()), items) == 0 {
                return Err("SHARE_UNSUPPORTED".into());
            }
            return Ok(());
        }
        let picker = call1(
            call0(objc_getClass(c"NSSharingServicePicker".as_ptr()), "alloc"),
            "initWithItems:",
            items,
        );
        if picker.is_null() {
            return Err("SHARE_UNSUPPORTED".into());
        }
        PICKER.with(|p| {
            let old = p.replace(picker);
            if !old.is_null() {
                call0(old, "release");
            }
        });
        let selector = sel_registerName(c"showRelativeToRect:ofView:preferredEdge:".as_ptr());
        let show: unsafe extern "C" fn(*mut c_void, *mut c_void, Rect, *mut c_void, u64) =
            transmute(objc_msgSend as *const ());
        show(
            picker,
            selector,
            Rect {
                x: 20.,
                y: 20.,
                w: 1.,
                h: 1.,
            },
            view,
            1,
        );
    }
    Ok(())
}
#[cfg(target_os = "linux")]
fn native_sheet<R: Runtime>(
    _: &tauri::WebviewWindow<R>,
    file: &Path,
    _: &str,
    _: &str,
    copy: bool,
) -> Result<(), String> {
    use gtk::prelude::*;
    if !copy {
        return Err("SHARE_UNSUPPORTED".into());
    }
    let uri = url::Url::from_file_path(file)
        .map_err(|_| "SHARE_INVALID")?
        .to_string();
    let clipboard = gtk::Clipboard::get(&gtk::gdk::SELECTION_CLIPBOARD);
    clipboard.set_uris(&[uri.as_str()]);
    clipboard.store();
    Ok(())
}
#[cfg(not(any(windows, target_os = "macos", target_os = "linux")))]
fn native_sheet<R: Runtime>(
    _: &tauri::WebviewWindow<R>,
    _: &Path,
    _: &str,
    _: &str,
    _: bool,
) -> Result<(), String> {
    Err("SHARE_UNSUPPORTED".into())
}

#[cfg(test)]
mod tests {
    use super::*;
    #[cfg(windows)]
    #[test]
    fn storage_paths_preserve_unc_and_unicode() {
        for (input, expected) in [
            (r"\\?\C:\Images\École 世界.png", r"C:\Images\École 世界.png"),
            (r"\\?\UNC\server\Images\Novera.mp3", r"\\server\Images\Novera.mp3"),
            ("C:/Media/song.mp3", r"C:\Media\song.mp3"),
        ] {
            assert_eq!(windows_storage_path(Path::new(input)).unwrap(), expected);
        }
    }
    #[cfg(windows)]
    #[tokio::test]
    async fn windows_share_files_are_prepared_off_thread_and_marshaled_after_worker_exit() {
        let root = std::env::temp_dir().join(format!("novera-share-item-{}", uuid::Uuid::new_v4()));
        std::fs::create_dir(&root).unwrap();
        for extension in ["txt", "png", "mp3", "mp4"] {
            let name = format!("École 世界.{extension}");
            let file = root.join(&name);
            std::fs::write(&file, b"share fixture").unwrap();
            let item = prepare_windows_share(file.canonicalize().unwrap()).await.unwrap();
            // The preparing worker's COM scope has ended. Resolve on a fresh
            // apartment, as the UI DataRequested callback will do later.
            let actual = std::thread::spawn(move || {
                with_windows_mta(|| item.resolve()?.Name()).unwrap().to_string()
            }).join().unwrap();
            assert_eq!(actual, name);
            std::fs::remove_file(file).unwrap();
        }
        std::fs::remove_dir(root).unwrap();
    }
    #[cfg(windows)]
    #[tokio::test]
    async fn missing_windows_share_file_returns_an_error_before_ui_dispatch() {
        let missing = std::env::temp_dir().join(format!("novera-missing-{}.mp3", uuid::Uuid::new_v4()));
        let result = prepare_windows_share(missing).await;
        assert!(result.is_err());
        assert!(result.err().unwrap().starts_with("SHARE_UNSUPPORTED: preparing Windows file:"));
    }
    #[cfg(windows)]
    #[test]
    fn windows_file_drop_is_readable_by_the_shell() {
        use windows::Win32::{Foundation::GlobalFree, System::Memory::{GlobalAlloc,GlobalLock,GlobalUnlock,GMEM_MOVEABLE},UI::Shell::{DragQueryFileW,HDROP}};
        for (input,expected) in [
            (r"\\?\C:\Images\École 世界.png",r"C:\Images\École 世界.png"),
            (r"\\?\UNC\server\Images\Novera.png",r"\\server\Images\Novera.png"),
        ] {
            let bytes=windows_file_drop(Path::new(input)).unwrap();
            unsafe {
                let memory=GlobalAlloc(GMEM_MOVEABLE,bytes.len()).unwrap();
                let target=GlobalLock(memory);assert!(!target.is_null());
                std::ptr::copy_nonoverlapping(bytes.as_ptr(),target.cast::<u8>(),bytes.len());
                let _=GlobalUnlock(memory);
                let drop=HDROP(memory.0);
                assert_eq!(DragQueryFileW(drop,u32::MAX,None),1);
                let mut name=vec![0u16;DragQueryFileW(drop,0,None) as usize+1];
                DragQueryFileW(drop,0,Some(&mut name));name.pop();
                assert_eq!(String::from_utf16(&name).unwrap(),expected);
                // Win32 GlobalFree returns NULL on success; do not treat its
                // projected handle result as a conventional success handle.
                let _ = GlobalFree(Some(memory));
            }
        }
    }
    #[test]
    fn filenames_and_payloads_are_bounded_and_portable() {
        for name in [
            "../a",
            "a/b",
            "CON.txt",
            "NUL.png",
            "a.exe:stream",
            ".hidden",
            "a\0b",
        ] {
            assert!(valid_filename(name).is_err(), "{name}");
        }
        assert!(valid_filename("École 世界.png").is_ok());
        let invalid = Payload {
            filename: "a".into(),
            mime: "".into(),
            base64: Some("%%%".into()),
            asset: None,
        };
        assert!(payload_bytes(&invalid).is_err());
    }
    #[tokio::test]
    async fn eleven_image_encoders_produce_real_files_and_keep_dimensions() {
        let image = image::RgbaImage::from_fn(320, 180, |x, y| {
            image::Rgba([(x % 256) as u8, (y % 256) as u8, 128, 255])
        });
        let mut source = Cursor::new(Vec::new());
        image::DynamicImage::ImageRgba8(image)
            .write_to(&mut source, image::ImageFormat::Png)
            .unwrap();
        let input = base64::engine::general_purpose::STANDARD.encode(source.into_inner());
        for (format, kind) in [
            ("png", image::ImageFormat::Png),
            ("jpeg", image::ImageFormat::Jpeg),
            ("webp", image::ImageFormat::WebP),
            ("gif", image::ImageFormat::Gif),
            ("bmp", image::ImageFormat::Bmp),
            ("tiff", image::ImageFormat::Tiff),
            ("ico", image::ImageFormat::Ico),
            ("tga", image::ImageFormat::Tga),
            ("ppm", image::ImageFormat::Pnm),
            ("qoi", image::ImageFormat::Qoi),
            ("avif", image::ImageFormat::Avif),
        ] {
            let value = sharing_convert_image(input.clone(), format.into())
                .await
                .unwrap();
            let bytes = base64::engine::general_purpose::STANDARD
                .decode(value["base64"].as_str().unwrap())
                .unwrap();
            if format == "ppm" {
                assert!(bytes.starts_with(b"P6"));
            }
            if format == "avif" {
                assert!(bytes.windows(4).any(|w| w == b"avif"));
            } else {
                let decoded = image::load_from_memory_with_format(&bytes, kind).unwrap();
                assert_eq!(
                    (decoded.width(), decoded.height()),
                    if format == "ico" {
                        (256, 144)
                    } else {
                        (320, 180)
                    },
                    "{format}"
                );
            }
            if let Ok(root) = std::env::var("NOVERA_SHARE_NATIVE_FIXTURES") {
                let root = PathBuf::from(root);
                std::fs::create_dir_all(&root).unwrap();
                std::fs::write(root.join(format!("fixture.{format}")), bytes).unwrap();
            }
        }
    }
    #[tokio::test]
    async fn jpeg_flattens_transparency_to_white() {
        let image = image::RgbaImage::from_pixel(8, 8, image::Rgba([0, 0, 0, 0]));
        let mut source = Cursor::new(Vec::new());
        image::DynamicImage::ImageRgba8(image)
            .write_to(&mut source, image::ImageFormat::Png)
            .unwrap();
        let result = sharing_convert_image(
            base64::engine::general_purpose::STANDARD.encode(source.into_inner()),
            "jpeg".into(),
        )
        .await
        .unwrap();
        let bytes = base64::engine::general_purpose::STANDARD
            .decode(result["base64"].as_str().unwrap())
            .unwrap();
        assert!(image::load_from_memory(&bytes)
            .unwrap()
            .to_rgb8()
            .pixels()
            .all(|p| p.0.iter().all(|v| *v > 245)));
    }
}
