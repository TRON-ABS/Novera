//! Quality-gated calibration on one disposable, loopback-only engine at a time.
use super::worker;
use jan_utils::calibration::MIN_GAIN;
pub use jan_utils::calibration::{
    enabled, foreground_busy, try_background, Category, ForegroundWork, ACTIVE,
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::{
    collections::{HashMap, HashSet},
    io::{BufRead, BufReader, Write},
    path::{Path, PathBuf},
    sync::Mutex,
    time::{Duration, Instant, SystemTime, UNIX_EPOCH},
};
const PROFILES: [Profile<'static>; 8] = [
    Profile {
        threads: None,
        load_mode: None,
    },
    Profile {
        threads: Some(2),
        load_mode: None,
    },
    Profile {
        threads: None,
        load_mode: Some("none"),
    },
    Profile {
        threads: Some(2),
        load_mode: Some("none"),
    },
    Profile {
        threads: Some(4),
        load_mode: None,
    },
    Profile {
        threads: Some(4),
        load_mode: Some("none"),
    },
    Profile {
        threads: Some(8),
        load_mode: None,
    },
    Profile {
        threads: Some(8),
        load_mode: Some("none"),
    },
];

#[derive(Clone, Copy, PartialEq, Eq, Serialize)]
struct Profile<'a> {
    threads: Option<u32>,
    load_mode: Option<&'a str>,
}

impl<'a> Profile<'a> {
    fn from_lines(lines: &'a [String]) -> Self {
        Self {
            threads: lines
                .iter()
                .rev()
                .find_map(|line| line.strip_prefix("threads = "))
                .and_then(|value| value.parse().ok()),
            load_mode: lines
                .iter()
                .rev()
                .find_map(|line| line.strip_prefix("load-mode = ")),
        }
    }

    fn with_defaults(self, defaults: Self) -> Self {
        Self {
            threads: self.threads.or(defaults.threads),
            load_mode: self.load_mode.or(defaults.load_mode),
        }
    }
}

fn trial_profiles<'a>(shared: &'a [String], model: &'a [String]) -> Vec<Profile<'a>> {
    let baseline = Profile::from_lines(model);
    let inherited = Profile::from_lines(shared);
    let mut profiles = vec![baseline];
    for candidate in PROFILES {
        // Keep the candidate loads memory-mapped and cap their CPU threads.
        if cfg!(target_os = "android")
            && (candidate.load_mode.is_some() || !matches!(candidate.threads, Some(2 | 4)))
        {
            continue;
        }
        if !profiles
            .iter()
            .any(|profile| profile.with_defaults(inherited) == candidate.with_defaults(inherited))
        {
            profiles.push(candidate);
        }
    }
    profiles
}

#[derive(Clone, serde::Deserialize)]
pub struct Sample {
    pub load: f64,
    pub rate: f64,
    pub output: Value,
}

struct Scratch(PathBuf);
impl Drop for Scratch {
    fn drop(&mut self) {
        let _ = std::fs::remove_dir_all(&self.0);
    }
}

fn base_preset(ini: &str, id: &str) -> Option<(Vec<String>, Vec<String>)> {
    let (mut shared, mut model) = (Vec::new(), Vec::new());
    let mut section = "";
    for line in ini.lines().map(str::trim) {
        if let Some(name) = line
            .strip_prefix('[')
            .and_then(|line| line.strip_suffix(']'))
        {
            section = name;
        } else if let Some((key, value)) = line.split_once('=') {
            let key = key.trim();
            if key.starts_with('#') || key.starts_with(';') {
                continue;
            }
            let normalized = format!("{key} = {}", value.trim());
            match section {
                "*" => shared.push(normalized),
                section if section == id => model.push(normalized),
                _ => {}
            }
        }
    }
    model
        .iter()
        .any(|line| line.starts_with("model = "))
        .then_some((shared, model))
}

fn for_trial(shared: &[String], model: &[String], id: &str, profile: Profile<'_>) -> String {
    let mut body = vec!["[*]".to_string()];
    body.extend(
        shared
            .iter()
            .filter(|line| !line.starts_with("slot-save-path = "))
            .cloned(),
    );
    body.push(format!("[{id}]"));
    body.extend(
        model
            .iter()
            .filter(|line| {
                !["load-on-startup = ", "threads = ", "load-mode = "]
                    .iter()
                    .any(|key| line.starts_with(key))
            })
            .cloned(),
    );
    body.push("load-on-startup = false".to_string());
    if let Some(threads) = profile.threads {
        body.push(format!("threads = {threads}"));
    }
    if let Some(mode) = profile.load_mode {
        body.push(format!("load-mode = {mode}"));
    }
    body.join("\n") + "\n"
}

async fn main_is_free(client: &reqwest::Client, port: u16, key: &str, id: Option<&str>) -> bool {
    let Ok(response) = client
        .get(format!("http://127.0.0.1:{port}/models"))
        .bearer_auth(key)
        .timeout(Duration::from_secs(2))
        .send()
        .await
    else {
        return false;
    };
    let Ok(value) = response.json::<Value>().await else {
        return false;
    };
    value["data"].as_array().is_some_and(|models| {
        id.is_none_or(|id| models.iter().any(|entry| entry["id"] == id))
            && models
                .iter()
                .all(|entry| entry["status"]["value"] == "unloaded")
    })
}

pub async fn router_is_free(state: &crate::LlamacppState, client: &reqwest::Client) -> bool {
    let worker = state
        .engine
        .lock()
        .await
        .as_ref()
        .map(|h| (h.port, h.api_key.clone()));
    match worker {
        None => true,
        Some((port, key)) => main_is_free(client, port, &key, None).await,
    }
}

async fn request(
    client: &reqwest::Client,
    handle: &worker::WorkerHandle,
    path: &str,
    body: Value,
) -> Result<Value, String> {
    client
        .post(format!("http://127.0.0.1:{}{path}", handle.port))
        .bearer_auth(&handle.api_key)
        .json(&body)
        .timeout(Duration::from_secs(100))
        .send()
        .await
        .map_err(|e| e.to_string())?
        .error_for_status()
        .map_err(|e| e.to_string())?
        .json()
        .await
        .map_err(|e| e.to_string())
}

async fn sample(
    client: &reqwest::Client,
    handle: &worker::WorkerHandle,
    id: &str,
    embedding: bool,
    prompt: &str,
) -> Result<Sample, String> {
    let now = Instant::now();
    request(client, handle, "/models/load", json!({"model": id})).await?;
    let load = now.elapsed().as_secs_f64();
    let now = Instant::now();
    let (rate, output) = if embedding {
        let response = request(
            client,
            handle,
            "/v1/embeddings",
            json!({"model": id, "input": [prompt, "été — 日本語"]}),
        )
        .await?;
        let data = response["data"]
            .as_array()
            .filter(|rows| {
                rows.len() == 2
                    && rows
                        .iter()
                        .all(|row| row["embedding"].as_array().is_some_and(|v| !v.is_empty()))
            })
            .ok_or("Calibration did not receive embedding vectors")?;
        (2.0 / now.elapsed().as_secs_f64(), json!(data))
    } else {
        let response = request(
            client,
            handle,
            "/completion",
            json!({
                "model": id, "prompt": prompt, "seed": 42, "cache_prompt": false,
                "ignore_eos": true, "return_tokens": true,
                "n_predict": if cfg!(target_os = "android") { 32 } else { 128 },
            }),
        )
        .await?;
        if response["tokens"].as_array().map(Vec::len) != Some(128) {
            return Err("Calibration did not receive 128 tokens".into());
        }
        let rate = response["timings"]["predicted_per_second"]
            .as_f64()
            .ok_or("Missing decoding timing")?;
        (rate, json!([response["tokens"], response["content"]]))
    };
    if !(load.is_finite() && load > 0.0 && rate.is_finite() && rate > 0.0) {
        return Err("Invalid calibration timing".into());
    }
    Ok(Sample { load, rate, output })
}

struct Gain {
    score: f64,
    load: Option<f64>,
    rate: Option<f64>,
}

fn measured_gain(reference: &[Sample], candidate: &[Sample]) -> Option<Gain> {
    if reference.len() != 2 || candidate.len() != 2 {
        return None;
    }
    let (mut load, mut rate) = (0.0, 0.0);
    let (mut faster_load, mut faster_rate) = (true, true);
    for (base, trial) in reference.iter().zip(candidate) {
        if [base.load, trial.load, base.rate, trial.rate]
            .iter()
            .any(|value| !value.is_finite() || *value <= 0.0)
        {
            return None;
        }
        if trial.output != base.output {
            return None;
        }
        let load_gain = 1.0 - trial.load / base.load;
        let rate_gain = trial.rate / base.rate - 1.0;
        load += load_gain / 2.0;
        rate += rate_gain / 2.0;
        faster_load &= load_gain > 0.0;
        faster_rate &= rate_gain > 0.0;
    }
    // Ratios can round an exact threshold down by one floating-point step.
    let minimum = MIN_GAIN - f64::EPSILON;
    let improves_load = load >= minimum && rate >= -0.02 && faster_load;
    let improves_rate = rate >= minimum && load >= -0.02 && faster_rate;
    (improves_load || improves_rate).then_some(Gain {
        score: load + rate,
        load: improves_load.then_some(load),
        rate: improves_rate.then_some(rate),
    })
}

pub fn gain(reference: &[Sample], candidate: &[Sample]) -> Option<f64> {
    measured_gain(reference, candidate).map(|gain| gain.score)
}

pub fn confirmed_gain(
    screening: &[Vec<Sample>; 2],
    confirmation: &[Vec<Sample>; 2],
) -> Option<ConfirmedGain> {
    measured_gain(&screening[0], &screening[1])?
        .confirmation(&measured_gain(&confirmation[0], &confirmation[1])?)
}

impl Gain {
    fn confirmation(&self, second: &Self) -> Option<ConfirmedGain> {
        [
            ("load", self.load.zip(second.load)),
            ("rate", self.rate.zip(second.rate)),
        ]
        .into_iter()
        .filter_map(|(metric, pair)| {
            pair.map(|(first, second)| ConfirmedGain {
                metric,
                ratio: first.min(second),
            })
        })
        .max_by(|a, b| a.ratio.total_cmp(&b.ratio))
    }
}

#[derive(Clone, Copy)]
pub struct ConfirmedGain {
    pub metric: &'static str,
    pub ratio: f64,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GainBadge {
    task: String,
    model: String,
    metric: String,
    percent: f64,
    recorded_at: u64,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    profile: Option<Value>,
}

#[derive(Clone, Serialize)]
pub struct ModelActivity {
    task: String,
    model: String,
    provider: String,
    #[serde(skip)]
    report_path: Option<PathBuf>,
    #[serde(skip_serializing_if = "Option::is_none")]
    report: Option<Value>,
}

static MODEL_ACTIVITY: Mutex<Option<ModelActivity>> = Mutex::new(None);

pub struct ActivityGuard;

impl Drop for ActivityGuard {
    fn drop(&mut self) {
        if let Ok(mut active) = MODEL_ACTIVITY.lock() {
            *active = None;
        }
    }
}

// Call only while holding the shared calibration gate.
pub fn track_activity(task: &str, model: &str, provider: &str) -> ActivityGuard {
    if let Ok(mut active) = MODEL_ACTIVITY.lock() {
        *active = Some(ModelActivity {
            task: task.into(),
            model: model.into(),
            provider: provider.into(),
            report_path: None,
            report: None,
        });
    }
    ActivityGuard
}

pub fn track_report(path: &Path) {
    if let Ok(mut current) = MODEL_ACTIVITY.lock() {
        if let Some(active) = current.as_mut() {
            active.report_path = Some(path.to_owned());
        }
    }
}

pub fn current_activity() -> Option<ModelActivity> {
    let mut active = MODEL_ACTIVITY.lock().ok()?.clone()?;
    active.report = active.report_path.as_ref().and_then(|path| {
        let metadata = std::fs::metadata(path).ok()?;
        if metadata.len() > 1_048_576 {
            return None;
        }
        serde_json::from_slice(&std::fs::read(path).ok()?).ok()
    });
    Some(active)
}

const GAIN_TASKS: [&str; 4] = ["text", "image", "music", "video"];

pub fn record_gain(root: &Path, task: &str, model: &str, gain: ConfirmedGain) {
    record_gain_with_profile(root, task, model, gain, None);
}

pub fn record_gain_with_profile(
    root: &Path,
    task: &str,
    model: &str,
    gain: ConfirmedGain,
    profile: Option<Value>,
) {
    if !GAIN_TASKS.contains(&task)
        || !gain.ratio.is_finite()
        || gain.ratio < MIN_GAIN - f64::EPSILON
    {
        return;
    }
    let directory = root.join("auto-tune-gains");
    let staged = directory.join(format!("{task}.pending"));
    let entry = GainBadge {
        task: task.into(),
        model: model.into(),
        metric: gain.metric.into(),
        percent: gain.ratio * 100.0,
        profile,
        recorded_at: SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64,
    };
    if let Err(error) = (|| {
        std::fs::create_dir_all(&directory)?;
        let history_path = directory.join("history.jsonl");
        let legacy = if !history_path.exists() {
            latest_gains(root)
        } else {
            Vec::new()
        };
        let mut history = std::fs::OpenOptions::new()
            .create(true)
            .append(true)
            .open(history_path)?;
        for item in legacy.iter().chain(std::iter::once(&entry)) {
            let mut line = serde_json::to_vec(item)?;
            line.push(b'\n');
            history.write_all(&line)?;
        }
        std::fs::write(&staged, serde_json::to_vec(&entry)?)?;
        std::fs::rename(&staged, directory.join(format!("{task}.json")))
    })() {
        log::warn!("Could not save confirmed Auto Tune gain: {error}");
    }
}

pub fn latest_gains(root: &Path) -> Vec<GainBadge> {
    let directory = root.join("auto-tune-gains");
    let mut gains: Vec<GainBadge> = GAIN_TASKS
        .into_iter()
        .filter_map(|task| {
            let bytes = std::fs::read(directory.join(format!("{task}.json"))).ok()?;
            let entry: GainBadge = serde_json::from_slice(&bytes).ok()?;
            (entry.task == task
                && entry.percent.is_finite()
                && entry.percent / 100.0 >= MIN_GAIN - f64::EPSILON)
                .then_some(entry)
        })
        .collect();
    gains.sort_by_key(|entry| std::cmp::Reverse(entry.recorded_at));
    gains
}

pub fn gain_history(root: &Path) -> Vec<GainBadge> {
    let mut entries = latest_gains(root);
    if let Ok(file) = std::fs::File::open(root.join("auto-tune-gains/history.jsonl")) {
        entries.extend(
            BufReader::new(file)
                .lines()
                .map_while(Result::ok)
                .filter_map(|line| serde_json::from_str::<GainBadge>(&line).ok()),
        );
    }
    let mut seen = HashSet::new();
    entries.retain(|entry| {
        GAIN_TASKS.contains(&entry.task.as_str())
            && entry.percent.is_finite()
            && entry.percent / 100.0 >= MIN_GAIN - f64::EPSILON
            && seen.insert((
                entry.recorded_at,
                entry.task.clone(),
                entry.model.clone(),
                entry.metric.clone(),
                entry.percent.to_bits(),
            ))
    });
    entries.sort_by_key(|entry| std::cmp::Reverse(entry.recorded_at));
    entries
}

#[allow(clippy::too_many_arguments)]
pub(super) async fn run(
    exe: &Path,
    root: &Path,
    preset_path: PathBuf,
    id: &str,
    envs: HashMap<String, String>,
    port: u16,
    key: &str,
    test_key: &str,
) -> Result<Option<Value>, String> {
    let _guard = try_background(Category::Text).ok_or("CALIBRATION_BUSY")?;
    let client = worker::loopback_client();
    if !enabled() || foreground_busy() || !main_is_free(&client, port, key, Some(id)).await {
        return Err("CALIBRATION_BUSY".into());
    }
    let ini = tokio::fs::read_to_string(preset_path)
        .await
        .map_err(|e| e.to_string())?;
    let report_dir = root.join("calibration-reports");
    let report_path = report_dir.join(format!("text-{test_key}.json"));
    let mut report = json!({"task":"text","model":id,"status":"running","minimumGainPct":MIN_GAIN*100.0,"trials":[]});
    let save_report = |report: &Value| {
        if let Err(error) = std::fs::create_dir_all(&report_dir)
            .and_then(|_| std::fs::write(&report_path, serde_json::to_vec_pretty(report)?))
        {
            log::warn!("Could not save text calibration report: {error}");
        }
    };
    save_report(&report);
    let Some((shared, model)) = base_preset(&ini, id) else {
        return Ok(None);
    };
    let _activity = track_activity("text", id, "llamacpp");
    track_report(&report_path);
    let candidates = trial_profiles(&shared, &model);
    report["reference"] = json!(candidates[0]);
    let embedding = model.iter().any(|line| line == "embeddings = true");
    report["embedding"] = json!(embedding);
    tokio::fs::create_dir_all(root)
        .await
        .map_err(|e| e.to_string())?;
    let directory = root.join(format!("llama-calibration-{test_key}"));
    tokio::fs::create_dir(&directory)
        .await
        .map_err(|e| e.to_string())?;
    let scratch = Scratch(directory);
    let path = scratch.0.join("model.ini");
    let profiles: Vec<usize> = (0..candidates.len()).collect();
    let mut screening: Vec<Option<Gain>> = (0..candidates.len()).map(|_| None).collect();
    let mut winner = None;
    for (phase, confirming) in [("screening", false), ("confirmation", true)] {
        let mut results: Vec<Vec<Sample>> = (0..candidates.len()).map(|_| Vec::new()).collect();
        let mut valid = vec![true; candidates.len()];
        for (round, prompt) in [
            "Explain how a library can catalogue 500 books. Write a detailed plan.",
            "Décris avec des exemples comment organiser un jardin potager sur un balcon.",
        ]
        .into_iter()
        .enumerate()
        {
            let mut order = profiles.clone();
            if (round == 1) != confirming {
                order.reverse();
            }
            for index in order {
                if !valid[index] {
                    continue;
                }
                tokio::fs::write(&path, for_trial(&shared, &model, id, candidates[index]))
                    .await
                    .map_err(|e| e.to_string())?;
                let probe = async {
                    let handle = worker::spawn(exe, &path, 0, test_key, 1, 0, envs.clone(), None)
                        .await
                        .map_err(|e| e.to_string())?;
                    let result = sample(&client, &handle, id, embedding, prompt).await;
                    handle.stop().await;
                    result
                };
                let foreground = async {
                    loop {
                        if !enabled()
                            || foreground_busy()
                            || !main_is_free(&client, port, key, Some(id)).await
                        {
                            break;
                        }
                        tokio::time::sleep(Duration::from_millis(500)).await;
                    }
                };
                let result = tokio::select! {
                    biased;
                    _ = foreground => {
                        report["status"] = json!("interrupted");
                        save_report(&report);
                        return Err("CALIBRATION_BUSY".into());
                    },
                    result = tokio::time::timeout(Duration::from_secs(130), probe) =>
                        result.unwrap_or_else(|_| Err("Calibration trial timed out".into())),
                };
                let entry = match &result {
                    Ok(row) => {
                        json!({"phase":phase,"round":round+1,"profile":candidates[index],"loadSeconds":row.load,"rate":row.rate})
                    }
                    Err(error) => {
                        json!({"phase":phase,"round":round+1,"profile":candidates[index],"error":error})
                    }
                };
                report["trials"]
                    .as_array_mut()
                    .expect("text report trials")
                    .push(entry);
                save_report(&report);
                match result {
                    Ok(row) => results[index].push(row),
                    Err(_) if index != 0 => valid[index] = false,
                    Err(error) => {
                        report["status"] = json!("interrupted");
                        report["error"] = json!(error);
                        save_report(&report);
                        return Err(error);
                    }
                }
            }
        }
        let mut comparisons = Vec::new();
        for &index in &profiles[1..] {
            let measured = measured_gain(&results[0], &results[index]);
            let qualified = if confirming {
                let repeated = measured.as_ref().and_then(|second| {
                    screening[index]
                        .as_ref()?
                        .confirmation(second)
                        .map(|confirmed| (second.score, confirmed))
                });
                if let Some((score, confirmed)) = repeated {
                    if winner.is_none_or(|(_, best, _): (usize, f64, ConfirmedGain)| score > best) {
                        winner = Some((index, score, confirmed));
                    }
                }
                repeated.is_some()
            } else {
                let qualified = measured.is_some();
                screening[index] = measured;
                qualified
            };
            comparisons.push(json!({
                "profile": candidates[index],
                "identical": results[index].len() == 2 && results[0]
                    .iter().zip(&results[index]).all(|(a, b)| a.output == b.output),
                "qualified": qualified,
            }));
        }
        if confirming {
            report["confirmation"] = json!(comparisons);
        } else {
            report["comparisons"] = json!(comparisons);
            save_report(&report);
        }
    }
    if winner.is_some() && (!enabled() || foreground_busy()) {
        report["status"] = json!("interrupted");
        save_report(&report);
        return Err("CALIBRATION_BUSY".into());
    }
    report["status"] = json!("completed");
    report["selected"] = json!(winner.map(|(index, _, _)| candidates[index]));
    save_report(&report);
    if let Some((index, _, confirmed)) = winner {
        record_gain_with_profile(root, "text", id, confirmed, Some(json!(candidates[index])));
    }
    winner
        .map(|(index, _, _)| serde_json::to_value(candidates[index]).map_err(|e| e.to_string()))
        .transpose()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn gain_requires_identical_output_and_repeated_improvement() {
        let sample = |load, rate, token| Sample {
            load,
            rate,
            output: json!(token),
        };
        let reference = [sample(10., 100., 1), sample(10., 100., 2)];
        assert!(gain(&reference, &[sample(9., 101., 1), sample(9., 101., 2)]).is_some());
        assert!(gain(&reference, &[sample(9.66, 100., 1), sample(9.66, 100., 2)]).is_some());
        assert!(gain(&reference, &[sample(9.68, 100., 1), sample(9.68, 100., 2)]).is_none());
        assert!(gain(&reference, &[sample(10., 103.3, 1), sample(10., 103.3, 2)]).is_some());
        assert!(gain(&reference, &[sample(10., 103.2, 1), sample(10., 103.2, 2)]).is_none());
        assert!(gain(&reference, &[sample(9., 101., 0), sample(9., 101., 2)]).is_none());
        assert!(gain(&reference, &[sample(8., 101., 1), sample(10.1, 101., 2)]).is_none());
        assert!(gain(&reference, &[sample(9., 95., 1), sample(9., 95., 2)]).is_none());
    }

    #[test]
    fn confirmation_must_repeat_the_same_gain_with_identical_output() {
        let pair = |load, rate, token| {
            vec![
                Sample {
                    load,
                    rate,
                    output: json!(token),
                },
                Sample {
                    load,
                    rate,
                    output: json!(token),
                },
            ]
        };
        let screening = [pair(10., 100., 1), pair(9.66, 100., 1)];
        assert!(confirmed_gain(&screening, &[pair(10., 100., 1), pair(9.66, 100., 1)]).is_some());
        assert!(!confirmed_gain(&screening, &[pair(10., 100., 1), pair(9.68, 100., 1)]).is_some());
        assert!(!confirmed_gain(&screening, &[pair(10., 100., 1), pair(10., 105., 1)]).is_some());
        assert!(!confirmed_gain(&screening, &[pair(10., 100., 1), pair(9.66, 100., 2)]).is_some());
    }

    #[test]
    fn existing_tuning_is_the_reference_and_can_be_replaced_in_trials() {
        let (shared, model) = base_preset(
            "[*]\nfit = off\n[x]\nmodel = x.gguf\nthreads = 2\nload-mode = none\nctx-size = 8192\n",
            "x",
        )
        .unwrap();
        let candidates = trial_profiles(&shared, &model);
        assert_eq!(candidates.len(), 8);
        assert!(candidates[0] == PROFILES[3]);
        assert!(candidates[1] == PROFILES[0]);
        let original = for_trial(&shared, &model, "x", candidates[0]);
        assert!(original.contains("threads = 2\nload-mode = none\n"));
        let default = for_trial(&shared, &model, "x", candidates[1]);
        assert!(!default.contains("threads =") && !default.contains("load-mode ="));
        assert!(default.contains("ctx-size = 8192"));

        let (shared, model) = base_preset("[*]\nthreads = 2\n[x]\nmodel = x.gguf\n", "x").unwrap();
        assert_eq!(trial_profiles(&shared, &model).len(), 6);
    }

    #[test]
    fn trial_has_only_the_target_model_and_its_tuning() {
        let (shared, model) = base_preset(
            "[*]\nfit = off\nslot-save-path = private\n[x]\nmodel = x.gguf\n[y]\nmodel = y.gguf",
            "x",
        )
        .unwrap();
        assert_eq!(for_trial(&shared, &model, "x", PROFILES[3]),
            "[*]\nfit = off\n[x]\nmodel = x.gguf\nload-on-startup = false\nthreads = 2\nload-mode = none\n");
    }
}
