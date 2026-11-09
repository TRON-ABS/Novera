//! Optional real production-policy benchmark. No inference is simulated here.
use novera_native_image_check::native;
use serde_json::{json, Value};
use std::{path::PathBuf, process::Stdio};
use tokio::process::Command;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let path = std::env::args()
        .nth(1)
        .ok_or("Pass a local benchmark configuration JSON")?;
    let value: Value = serde_json::from_slice(&std::fs::read(path)?)?;
    let root = PathBuf::from(value["directory"].as_str().ok_or("directory")?);
    std::fs::create_dir_all(&root)?;
    let optimized = value["optimized"].as_bool().unwrap_or(true);
    let exe = PathBuf::from(value["executable"].as_str().ok_or("executable")?);
    let start = std::time::Instant::now();
    let runtime = if optimized {
        Some(
            native::discover(&exe, "auto", Some("auto"))
                .await
                .ok_or("No verified native runtime")?,
        )
    } else {
        None
    };
    let combined = runtime.as_ref().is_some_and(|runtime| runtime.combined);
    let python = value["python"].as_str().unwrap_or("python");
    if !optimized {
        if !Command::new(python)
            .args(["-c", "import torch,numpy; from PIL import Image"])
            .stdout(Stdio::null())
            .status()
            .await?
            .success()
        {
            return Err("Python preflight failed".into());
        }
    }
    let base = root.join("base.png");
    let result = root.join("result.png");
    let log = std::fs::File::create(root.join("engine.log"))?;
    let mut command = Command::new(&exe);
    command.current_dir(exe.parent().ok_or("engine dir")?);
    for (flag, key) in [
        ("--diffusion-model", "model"),
        ("--llm", "encoder"),
        ("--vae", "vae"),
        ("--prompt", "prompt"),
    ] {
        command.arg(flag).arg(value[key].as_str().ok_or(key)?);
    }
    command
        .args([
            "--mode",
            "img_gen",
            "--width",
            "2048",
            "--height",
            "880",
            "--steps",
            "4",
            "--seed",
            "42",
            "--cfg-scale",
            "1",
            "--sampling-method",
            "euler",
            "--max-vram",
            "-0.5",
        ])
        .args(native::image_flags(optimized))
        .arg("--output")
        .arg(if combined { &result } else { &base })
        .stdout(log.try_clone()?)
        .stderr(log);
    if combined {
        command
            .arg("--upscale-model")
            .arg(value["upscaler"].as_str().ok_or("upscaler")?)
            .args(["--upscale-repeats", "1", "--upscale-tile-size", "128"]);
    }
    #[cfg(windows)]
    command.creation_flags(0x08000000);
    if !command.status().await?.success() {
        return Err("Image generation failed".into());
    }
    if combined {
        let bytes = std::fs::read(&result)?;
        if bytes.len() < 24 || bytes.get(..8) != Some(b"\x89PNG\r\n\x1a\n") {
            return Err("Invalid PNG".into());
        }
        let width = u32::from_be_bytes(bytes[16..20].try_into()?);
        let height = u32::from_be_bytes(bytes[20..24].try_into()?);
        if (width, height) != (4096, 1760) {
            return Err("Output dimensions mismatch".into());
        }
        let report = json!({"optimized":true,"combined":true,"totalSeconds":start.elapsed().as_secs_f64(),"width":width,"height":height});
        std::fs::write(
            root.join("result.json"),
            serde_json::to_vec_pretty(&report)?,
        )?;
        println!("{report}");
        return Ok(());
    }
    let generated = start.elapsed().as_secs_f64();
    let mut upscale = if let Some(runtime) = runtime {
        native::upscale_command(
            &runtime.executable,
            runtime.backend.as_deref(),
            std::path::Path::new(value["upscaler"].as_str().ok_or("upscaler")?),
            &base,
            &result,
        )?
    } else {
        let config = root.join("upscale.json");
        std::fs::write(&config,json!({"upscale_factor":2,"upscale_model":value["upscaler"],"device":"auto","input_image":base,"staged_output":result,"parent_pid":std::process::id()}).to_string())?;
        let mut c = Command::new(python);
        c.arg(value["upscale_script"].as_str().ok_or("upscale_script")?)
            .arg(config);
        c
    };
    let log = std::fs::File::create(root.join("upscale.log"))?;
    upscale.stdout(log.try_clone()?).stderr(log);
    #[cfg(windows)]
    upscale.creation_flags(0x08000000);
    if !upscale.status().await?.success() {
        return Err("Upscale failed".into());
    }
    let total = start.elapsed().as_secs_f64();
    let bytes = std::fs::read(&result)?;
    if bytes.get(..8) != Some(b"\x89PNG\r\n\x1a\n") {
        return Err("Invalid PNG".into());
    }
    let width = u32::from_be_bytes(bytes[16..20].try_into()?);
    let height = u32::from_be_bytes(bytes[20..24].try_into()?);
    if (width, height) != (4096, 1760) {
        return Err("Output dimensions mismatch".into());
    }
    let report = json!({"optimized":optimized,"generationAndPreparationSeconds":generated,"upscaleSeconds":total-generated,"totalSeconds":total,"width":width,"height":height});
    std::fs::write(
        root.join("result.json"),
        serde_json::to_vec_pretty(&report)?,
    )?;
    println!("{report}");
    Ok(())
}
