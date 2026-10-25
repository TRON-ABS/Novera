//! In-process replacement for llama.cpp's router mode.
//!
//! Upstream's router is a process supervisor plus a reverse proxy: it spawns a
//! child `llama-server` per model (`server-models.cpp:1020-1046`). Linking
//! `server_context` directly means there are no children, so what survives is
//! only the bookkeeping -- a model registry with `models_max` and LRU eviction.
//! The two invariants are taken from upstream (`server-models.cpp:92-95` and
//! `:103-210`): never evict a model with requests in flight, and make a caller
//! that arrives while the registry is full wait rather than fail.

use std::collections::{HashMap, HashSet};
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;

use super::events::{EventBus, Transition};
use super::{Engine, EngineError};

/// Monotonic tick for LRU ordering. A counter rather than a clock so ordering
/// is exact under rapid use and cannot go backwards on a clock adjustment.
static TICK: AtomicU64 = AtomicU64::new(0);

fn next_tick() -> u64 {
    TICK.fetch_add(1, Ordering::Relaxed)
}

pub struct LoadedModel {
    pub engine: Arc<Engine>,
    /// Requests currently using this model. An evictor must not touch a model
    /// with a non-zero count, or it would cancel a live generation.
    inflight: usize,
    last_used: u64,
    identity: super::slots::Identity,
}

impl LoadedModel {
    pub fn engine(&self) -> Arc<Engine> {
        Arc::clone(&self.engine)
    }
}

#[derive(Debug, PartialEq, Eq)]
pub enum RegistryError {
    /// Every slot is taken and every resident model is busy, so nothing can be
    /// evicted to make room.
    Full {
        models_max: usize,
    },
    Engine(EngineError),
}

impl From<EngineError> for RegistryError {
    fn from(e: EngineError) -> Self {
        Self::Engine(e)
    }
}

/// How a model is started, so the registry can reload one it evicted.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum LoadSpec {
    /// llama-server's own flag set.
    Args(Vec<String>),
    /// A section of a `router.preset.ini`, the file Jan already generates.
    ///
    /// `body` is the section's settings (plus the shared `[*]` block) and is
    /// compared on reload. It is not passed to the C++ loader, which re-reads
    /// the file itself -- it exists so an unrelated model can stay loaded.
    Preset {
        ini_path: String,
        section: String,
        body: Vec<String>,
    },
}

fn identity_for_spec(model: &str, spec: &LoadSpec) -> super::slots::Identity {
    let body = match spec {
        LoadSpec::Preset { body, .. } => body,
        LoadSpec::Args(args) => args,
    };
    let path = spec_model_path(body).map(std::path::PathBuf::from);
    super::slots::Identity::new(model, body, path.as_deref())
}

/// What `GET /models` reports per entry. The names match llama.cpp's router
/// (`server-models.h:29-37`) because the plugin's polling arm
/// (`commands::evaluate_load_poll`) already parses exactly these values, and
/// changing them would silently turn every load into a 600s timeout.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ModelStatus {
    Loaded,
    Loading,
    Unloaded,
}

impl ModelStatus {
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Loaded => "loaded",
            Self::Loading => "loading",
            Self::Unloaded => "unloaded",
        }
    }
}

/// What a reload did, for the log line. A reload that reports only `kept` is
/// the case the whole mechanism exists for: nothing was disturbed.
#[derive(Debug, Default, PartialEq, Eq)]
pub struct ReloadOutcome {
    pub added: Vec<String>,
    pub changed: Vec<String>,
    pub removed: Vec<String>,
    pub kept: Vec<String>,
}

pub struct Registry {
    loaded: HashMap<String, LoadedModel>,
    specs: HashMap<String, LoadSpec>,
    /// Models whose spec changed (or which were removed) while a request was in
    /// flight. They cannot be dropped there without cancelling a live
    /// generation, so `release` drops them once the last request finishes.
    stale: HashSet<String>,
    /// Why a model's last load attempt failed. Kept so `GET /models` can report
    /// `failed: true`: without it a failed load looks merely "unloaded" and the
    /// caller's poll loop waits out its full timeout instead of erroring.
    failures: HashMap<String, String>,
    /// Models the registry has stopped hosting since the last drain, whatever
    /// dropped them. Their slots died with the engine, so the occupancy map --
    /// which lives a module over and cannot be reached from these `&mut self`
    /// methods -- has to forget them before it hands one of their slot ids to
    /// another thread. `take_dropped` is drained where occupancy is claimed.
    dropped: Vec<String>,
    /// 0 means unlimited, matching llama.cpp's `--models-max`.
    models_max: usize,
    /// Where every transition below is published for `/models/sse`.
    events: EventBus,
    pending: HashMap<String, u64>,
    closed: bool,
}

/// Reservation for native initialization outside the registry lock. The token
/// prevents a reload/remove/re-add from publishing an obsolete context.
#[derive(Clone)]
pub struct LoadTicket {
    model: String,
    token: u64,
    spec: LoadSpec,
    identity: super::slots::Identity,
    events: EventBus,
    fallback_used: Arc<std::sync::atomic::AtomicBool>,
}

impl LoadTicket {
    pub fn start(&self) -> Result<Arc<Engine>, EngineError> {
        let bus = self.events.clone();
        let model = self.model.clone();
        let progress: crate::engine::sys::StateCallback = Arc::new(move |state, payload| {
            if state == "loading" {
                if let Ok(v) = serde_json::from_str::<serde_json::Value>(payload) {
                    if v.get("value").is_some() {
                        bus.emit(&model, Transition::LoadProgress(v));
                    }
                }
            }
        });
        match &self.spec {
            LoadSpec::Args(args) => Engine::start(args, Some(progress)),
            LoadSpec::Preset {
                ini_path,
                section,
                body,
            } => {
                let result =
                    Engine::start_from_preset(ini_path, section, Some(Arc::clone(&progress)));
                if result.is_ok() {
                    return result.map(Arc::new);
                }
                if let Some((batch, ubatch)) = measured_fallback(body) {
                    if let Ok(original) = std::fs::read_to_string(ini_path) {
                        let text = fallback_ini(&original, section, batch, ubatch);
                        let path = std::env::temp_dir().join(format!(
                            "jan-performance-{}-{}.ini",
                            std::process::id(),
                            next_tick()
                        ));
                        if let Ok(mut file) = std::fs::OpenOptions::new()
                            .write(true)
                            .create_new(true)
                            .open(&path)
                        {
                            use std::io::Write;
                            if file.write_all(text.as_bytes()).is_ok() {
                                drop(file);
                                log::warn!(
                                    "measured profile failed for {}; retrying manual batching",
                                    self.model
                                );
                                let retry = Engine::start_from_preset(
                                    &path.to_string_lossy(),
                                    section,
                                    Some(progress),
                                );
                                self.fallback_used.store(retry.is_ok(), Ordering::Relaxed);
                                let _ = std::fs::remove_file(&path);
                                return retry.map(Arc::new);
                            }
                            drop(file);
                            let _ = std::fs::remove_file(&path);
                        }
                    }
                }
                result
            }
        }
        .map(Arc::new)
    }
}

fn measured_fallback(body: &[String]) -> Option<(u32, u32)> {
    let value = body
        .iter()
        .find_map(|s| s.strip_prefix("# jan-measured-performance:"))?;
    let (batch, ubatch) = value.trim().split_once(',')?;
    let batch = batch.parse::<u32>().ok()?;
    let ubatch = ubatch.parse::<u32>().ok()?;
    (batch > 0 && ubatch > 0 && ubatch <= batch).then_some((batch, ubatch))
}

/// Materialize one section and its inherited defaults; never edit the user's
/// preset to recover from a calibration that no longer fits available memory.
fn fallback_ini(ini: &str, section: &str, batch: u32, ubatch: u32) -> String {
    let mut values = std::collections::BTreeMap::new();
    for wanted in ["*", section] {
        let mut active = false;
        for line in ini.lines().map(str::trim) {
            if let Some(name) = line.strip_prefix('[').and_then(|s| s.strip_suffix(']')) {
                active = name == wanted;
            } else if active && !line.starts_with('#') && !line.starts_with(';') {
                if let Some((key, value)) = line.split_once('=') {
                    values.insert(key.trim().to_string(), value.trim().to_string());
                }
            }
        }
    }
    values.insert("batch-size".into(), batch.to_string());
    values.insert("ubatch-size".into(), ubatch.to_string());
    format!(
        "[{section}]\n{}\n",
        values
            .into_iter()
            .map(|(k, v)| format!("{k} = {v}"))
            .collect::<Vec<_>>()
            .join("\n")
    )
}

impl Registry {
    pub fn new(models_max: usize) -> Self {
        Self {
            loaded: HashMap::new(),
            specs: HashMap::new(),
            stale: HashSet::new(),
            failures: HashMap::new(),
            dropped: Vec::new(),
            models_max,
            events: EventBus::new(),
            pending: HashMap::new(),
            closed: false,
        }
    }

    /// The lifecycle feed, for the HTTP layer to subscribe to.
    pub fn events(&self) -> EventBus {
        self.events.clone()
    }

    pub fn models_max(&self) -> usize {
        self.models_max
    }

    /// Records how a model is started without loading it, so `/v1/models` can
    /// list it and a later request can load it on demand.
    pub fn register(&mut self, model_id: impl Into<String>, spec: LoadSpec) {
        let id = model_id.into();
        if self.specs.get(&id).is_some_and(|old| *old != spec) {
            self.cancel_load(&id);
        }
        self.specs.insert(id, spec);
    }

    pub fn known_models(&self) -> Vec<String> {
        let mut v: Vec<String> = self.specs.keys().cloned().collect();
        v.sort();
        v
    }

    pub fn loaded_models(&self) -> Vec<String> {
        let mut v: Vec<String> = self.loaded.keys().cloned().collect();
        v.sort();
        v
    }

    /// Models with at least one request in flight.
    ///
    /// The router could only report "loaded", which conflated a model that is
    /// generating with one merely resident -- so its shutdown gate refused to
    /// exit while any model was in memory. Requests in flight is the question
    /// the gate is actually asking.
    pub fn busy_models(&self) -> Vec<String> {
        let mut v: Vec<String> = self
            .loaded
            .iter()
            .filter(|(_, m)| m.inflight > 0)
            .map(|(id, _)| id.clone())
            .chain(self.pending.keys().cloned())
            .collect();
        v.sort();
        v
    }

    /// The identity a saved KV state is checked against: the model's preset
    /// section plus the gguf it names.
    ///
    /// Read from the registry rather than reconstructed, so the comparison is
    /// against what the model was actually loaded with. `None` means the model
    /// is not registered at all, which is not something to guess at.
    pub fn state_identity(&self, model_id: &str) -> Option<super::slots::Identity> {
        if let Some(loaded) = self.loaded.get(model_id) {
            return Some(loaded.identity.clone());
        }
        self.specs
            .get(model_id)
            .map(|spec| identity_for_spec(model_id, spec))
    }

    pub fn is_loaded(&self, model_id: &str) -> bool {
        self.loaded.contains_key(model_id)
    }

    pub fn status_of(&self, model_id: &str) -> ModelStatus {
        if self.loaded.contains_key(model_id) {
            ModelStatus::Loaded
        } else if self.pending.contains_key(model_id) {
            ModelStatus::Loading
        } else {
            ModelStatus::Unloaded
        }
    }

    /// The last load failure for a model, if the most recent attempt failed.
    pub fn failure_of(&self, model_id: &str) -> Option<&str> {
        self.failures.get(model_id).map(String::as_str)
    }

    /// True when the registry is at capacity and nothing is evictable, i.e. a
    /// caller must wait. Split out so the HTTP layer can queue instead of
    /// holding the registry lock across a load.
    pub fn is_saturated(&self) -> bool {
        if self.models_max == 0 || self.loaded.len() + self.pending.len() < self.models_max {
            return false;
        }
        self.lru_idle().is_none()
    }

    pub fn is_loading(&self, model: &str) -> bool {
        self.pending.contains_key(model)
    }

    /// Native loads are serialized by the caller's load gate, not this lock.
    /// Removed contexts are returned so their blocking destructor runs outside it.
    pub fn prepare_load(
        &mut self,
        model: &str,
    ) -> Result<(LoadTicket, Vec<Arc<Engine>>), RegistryError> {
        if self.closed || self.pending.contains_key(model) || self.loaded.contains_key(model) {
            return Err(EngineError::Start(
                "model is loading, loaded, or engine is stopping".into(),
            )
            .into());
        }
        let spec = self
            .specs
            .get(model)
            .cloned()
            .ok_or_else(|| EngineError::UnknownRoute(model.into()))?;
        let mut retired = Vec::new();
        let needed = if self.models_max == 0 {
            0
        } else {
            (self.loaded.len() + self.pending.len() + 1).saturating_sub(self.models_max)
        };
        let mut idle: Vec<_> = self
            .loaded
            .iter()
            .filter(|(_, m)| m.inflight == 0)
            .map(|(id, m)| (m.last_used, id.clone()))
            .collect();
        idle.sort();
        if idle.len() < needed {
            return Err(RegistryError::Full {
                models_max: self.models_max,
            });
        }
        for (_, victim) in idle.into_iter().take(needed) {
            retired.push(self.loaded.remove(&victim).unwrap().engine);
            self.dropped.push(victim.clone());
            self.events
                .emit(&victim, Transition::Unloaded { exit_code: 0 });
        }
        let token = next_tick();
        self.pending.insert(model.into(), token);
        self.failures.remove(model);
        self.events.emit(model, Transition::Loading);
        Ok((
            LoadTicket {
                model: model.into(),
                token,
                identity: identity_for_spec(model, &spec),
                spec,
                events: self.events.clone(),
                fallback_used: Arc::new(std::sync::atomic::AtomicBool::new(false)),
            },
            retired,
        ))
    }

    /// Borrow the result: a rejected native context must be freed after unlocking.
    pub fn finish_load(
        &mut self,
        ticket: &LoadTicket,
        result: &Result<Arc<Engine>, EngineError>,
    ) -> Result<(), RegistryError> {
        if self.closed
            || self.pending.get(&ticket.model) != Some(&ticket.token)
            || self.specs.get(&ticket.model) != Some(&ticket.spec)
        {
            return Err(EngineError::Start(
                "model load cancelled by unload, reload, or shutdown".into(),
            )
            .into());
        }
        self.pending.remove(&ticket.model);
        let outcome = match result {
            Ok(engine) if self.models_max == 0 || self.loaded.len() < self.models_max => {
                let mut identity = ticket.identity.clone();
                if ticket.fallback_used.load(Ordering::Relaxed) {
                    identity.spec.push_str(":manual-fallback");
                }
                self.loaded.insert(
                    ticket.model.clone(),
                    LoadedModel {
                        engine: Arc::clone(engine),
                        inflight: 0,
                        last_used: next_tick(),
                        identity,
                    },
                );
                self.events.emit(&ticket.model, Transition::Loaded);
                return Ok(());
            }
            Ok(_) => EngineError::Start("model limit reduced during loading".into()),
            Err(e) => e.clone(),
        };
        self.failures
            .insert(ticket.model.clone(), outcome.to_string());
        self.events
            .emit(&ticket.model, Transition::Unloaded { exit_code: 1 });
        Err(outcome.into())
    }

    pub fn cancel_load(&mut self, model: &str) -> bool {
        if self.pending.remove(model).is_some() {
            self.events
                .emit(model, Transition::Unloaded { exit_code: 0 });
            return true;
        }
        false
    }

    /// Acquires the engine for a model, loading (and evicting) as needed, and
    /// marks it busy. The caller must pair this with `release`.
    pub fn acquire(&mut self, model_id: &str) -> Result<Arc<Engine>, RegistryError> {
        if self.closed || self.pending.contains_key(model_id) {
            return Err(EngineError::Start("model is loading or engine is stopping".into()).into());
        }
        // A model awaiting retirement keeps serving until its in-flight
        // requests drain. Loading the new spec alongside it would put two
        // engines under one id and split the inflight count, so a late request
        // on the old spec is the lesser evil -- and is what the router does,
        // which also cannot unload a busy model.
        if let Some(m) = self.loaded.get_mut(model_id) {
            m.inflight += 1;
            m.last_used = next_tick();
            return Ok(m.engine());
        }

        let spec = self
            .specs
            .get(model_id)
            .cloned()
            .ok_or(RegistryError::Engine(EngineError::UnknownRoute(
                model_id.to_string(),
            )))?;

        let identity = identity_for_spec(model_id, &spec);
        self.make_room()?;

        self.events.emit(model_id, Transition::Loading);
        // Real load progress, straight from server_context. Only the `loading`
        // state carries a fraction; `ready` and `sleeping` arrive here too and
        // are already covered by the lifecycle transitions around this call.
        let progress = {
            let bus = self.events.clone();
            let model = model_id.to_string();
            std::sync::Arc::new(move |state: &str, payload: &str| {
                if state != "loading" {
                    return;
                }
                match serde_json::from_str::<serde_json::Value>(payload) {
                    Ok(v) if v.get("value").is_some() => {
                        bus.emit(&model, Transition::LoadProgress(v));
                    }
                    _ => {}
                }
            }) as crate::engine::sys::StateCallback
        };
        let started = match &spec {
            LoadSpec::Args(args) => Engine::start(args, Some(progress)),
            LoadSpec::Preset {
                ini_path, section, ..
            } => Engine::start_from_preset(ini_path, section, Some(progress)),
        };
        let engine = match started {
            Ok(e) => {
                self.failures.remove(model_id);
                e
            }
            Err(e) => {
                // Recorded so the poll arm sees `failed: true` rather than
                // waiting out its timeout on a bare "unloaded".
                self.failures.insert(model_id.to_string(), e.to_string());
                // Nonzero: this is the transition the desktop treats as a
                // definitive load failure.
                self.events
                    .emit(model_id, Transition::Unloaded { exit_code: 1 });
                return Err(e.into());
            }
        };
        let engine = Arc::new(engine);
        self.loaded.insert(
            model_id.to_string(),
            LoadedModel {
                engine: Arc::clone(&engine),
                inflight: 1,
                last_used: next_tick(),
                identity,
            },
        );
        self.events.emit(model_id, Transition::Loaded);
        Ok(engine)
    }

    /// Marks a request finished. Only then does the model become evictable.
    ///
    /// A model a reload superseded is dropped here rather than at reload time,
    /// which is the only point where doing so cannot cancel a generation.
    pub fn release(&mut self, model_id: &str) {
        let Some(m) = self.loaded.get_mut(model_id) else {
            return;
        };
        m.inflight = m.inflight.saturating_sub(1);
        m.last_used = next_tick();
        if m.inflight == 0 && self.stale.remove(model_id) {
            self.loaded.remove(model_id);
            self.dropped.push(model_id.to_string());
            self.events
                .emit(model_id, Transition::Unloaded { exit_code: 0 });
        }
    }

    /// Applies a regenerated preset without restarting the process.
    ///
    /// A model whose spec is byte-identical stays resident; one whose settings
    /// moved is dropped so the next request reloads it. This is the reason the
    /// engine does not have to be restarted when a model is imported or a
    /// per-model setting is written -- a restart would evict the chat model the
    /// user is talking to.
    pub fn reload(&mut self, specs: HashMap<String, LoadSpec>, models_max: usize) -> ReloadOutcome {
        self.models_max = models_max;
        let mut outcome = ReloadOutcome::default();

        for id in self.specs.keys().cloned().collect::<Vec<_>>() {
            if !specs.contains_key(&id) {
                self.specs.remove(&id);
                self.failures.remove(&id);
                self.retire(&id);
                outcome.removed.push(id);
            }
        }

        for (id, spec) in specs {
            match self.specs.get(&id) {
                Some(existing) if *existing == spec => {
                    if self.loaded.contains_key(&id) {
                        outcome.kept.push(id);
                    }
                }
                existing => {
                    let known = existing.is_some();
                    self.specs.insert(id.clone(), spec);
                    self.failures.remove(&id);
                    self.retire(&id);
                    if known {
                        outcome.changed.push(id);
                    } else {
                        outcome.added.push(id);
                    }
                }
            }
        }

        outcome.added.sort();
        outcome.changed.sort();
        outcome.removed.sort();
        outcome.kept.sort();
        outcome
    }

    /// Drops a resident model, or defers the drop to `release` when it is busy.
    fn retire(&mut self, model_id: &str) {
        self.cancel_load(model_id);
        match self.loaded.get(model_id) {
            Some(m) if m.inflight == 0 => {
                self.loaded.remove(model_id);
                self.dropped.push(model_id.to_string());
                self.events
                    .emit(model_id, Transition::Unloaded { exit_code: 0 });
            }
            Some(_) => {
                self.stale.insert(model_id.to_string());
            }
            None => {}
        }
    }

    /// Unloads a model. Refuses while requests are in flight rather than
    /// cancelling them, which is what upstream does.
    pub fn unload(&mut self, model_id: &str) -> bool {
        match self.loaded.get(model_id) {
            Some(m) if m.inflight == 0 => {
                self.loaded.remove(model_id);
                self.stale.remove(model_id);
                self.dropped.push(model_id.to_string());
                self.events
                    .emit(model_id, Transition::Unloaded { exit_code: 0 });
                true
            }
            _ => false,
        }
    }

    /// Ids dropped since the last call, for the caller that owns the slot
    /// occupancy map. Draining is the caller's job precisely because the fix
    /// belongs on the other side of an async lock this struct cannot take.
    pub fn take_dropped(&mut self) -> Vec<String> {
        std::mem::take(&mut self.dropped)
    }

    /// Drops every resident model, ignoring in-flight requests.
    ///
    /// Unconditional where `unload` refuses a busy model: this runs only once
    /// the listener has stopped, and the point is to reach each `Engine`'s Drop
    /// -- and so `novera_llama_engine_stop` -- before the process exits. Returns
    /// the ids it released, for the log.
    pub fn shutdown(&mut self) -> Vec<String> {
        self.closed = true;
        self.pending.clear();
        let mut ids: Vec<String> = self.loaded.keys().cloned().collect();
        ids.sort();
        self.loaded.clear();
        self.stale.clear();
        self.dropped.extend(ids.iter().cloned());
        ids
    }

    /// Evicts LRU-idle models until one more fits under `models_max`.
    ///
    /// Deliberately does *not* persist the victim's KV cache: `save_model_slots`
    /// is called only from `unload_model`, which is the path Jan actually takes
    /// when switching models (`models_max` is 1, so the extension unloads before
    /// it loads). The victim's slot occupancy is still released here via
    /// `dropped`, so the residual is a lost cache and a re-prefill, not a
    /// cross-thread overwrite.
    ///
    /// It becomes reachable as soon as a user raises `models_max` above 1, or
    /// when an embedding model loads alongside a chat model on a tight budget.
    /// Saving here needs the same await-and-persist that `unload_model` does,
    /// which the registry cannot do while holding its own lock -- so it belongs
    /// with the caller, as a follow-up. `retire` has the same omission.
    fn make_room(&mut self) -> Result<(), RegistryError> {
        if self.models_max == 0 {
            return Ok(());
        }
        while self.loaded.len() >= self.models_max {
            let Some(victim) = self.lru_idle() else {
                return Err(RegistryError::Full {
                    models_max: self.models_max,
                });
            };
            self.loaded.remove(&victim);
            self.dropped.push(victim.clone());
            self.events
                .emit(&victim, Transition::Unloaded { exit_code: 0 });
        }
        Ok(())
    }

    /// The least-recently-used model with nothing in flight.
    fn lru_idle(&self) -> Option<String> {
        pick_lru_idle(
            self.loaded
                .iter()
                .map(|(id, m)| (id.as_str(), m.inflight, m.last_used)),
        )
    }
}

/// The eviction policy, over plain data so it can be tested without starting an
/// engine. Busy models are never candidates; among idle ones the oldest tick
/// wins.
fn pick_lru_idle<'a>(entries: impl Iterator<Item = (&'a str, usize, u64)>) -> Option<String> {
    entries
        .filter(|(_, inflight, _)| *inflight == 0)
        .min_by_key(|(_, _, last_used)| *last_used)
        .map(|(id, _, _)| id.to_string())
}

/// The gguf a spec names, so its size and mtime can join the state guard. The
/// key is `model` in a preset section and `-m`/`--model` in an arg list; a spec
/// with neither (a remote or auto-resolved model) simply has no file to stamp.
fn spec_model_path(body: &[String]) -> Option<String> {
    let mut it = body.iter();
    while let Some(line) = it.next() {
        if line == "-m" || line == "--model" {
            return it.next().cloned();
        }
        if let Some((k, v)) = line.split_once('=') {
            if k.trim() == "model" {
                return Some(v.trim().to_string());
            }
        }
    }
    None
}

#[cfg(test)]
mod tests {
    use super::*;

    #[cfg(not(feature = "engine"))]
    #[test]
    fn manual_fallback_has_a_distinct_persistent_cache_identity() {
        let mut r = reg(1, &["a"]);
        let calibrated = r.state_identity("a").unwrap();
        let (ticket, _) = r.prepare_load("a").unwrap();
        ticket.fallback_used.store(true, Ordering::Relaxed);
        r.finish_load(&ticket, &Ok(Arc::new(Engine::stub())))
            .unwrap();
        assert_ne!(calibrated.spec, r.state_identity("a").unwrap().spec);
    }

    #[test]
    fn replacing_a_registered_spec_cancels_its_reservation() {
        let mut r = reg(1, &["a"]);
        let (ticket, _) = r.prepare_load("a").unwrap();
        r.register("a", spec("different"));
        assert!(!r.is_loading("a"));
        assert!(r
            .finish_load(&ticket, &Err(EngineError::Unavailable))
            .is_err());
        assert!(r.failure_of("a").is_none());
    }

    #[cfg(not(feature = "engine"))]
    #[test]
    fn failed_capacity_reservation_does_not_partially_evict() {
        let mut r = Registry::new(1);
        resident(&mut r, &["a", "b"]);
        r.loaded.get_mut("a").unwrap().inflight = 1;
        r.register("c", spec("c"));
        assert!(matches!(
            r.prepare_load("c"),
            Err(RegistryError::Full { .. })
        ));
        assert_eq!(r.loaded_models(), vec!["a", "b"]);
    }

    #[test]
    fn fallback_preserves_inheritance_and_is_limited_to_measured_profiles() {
        assert!(measured_fallback(&["# regular comment".into()]).is_none());
        assert!(measured_fallback(&["# jan-measured-performance: 0,512".into()]).is_none());
        assert_eq!(
            measured_fallback(&["# jan-measured-performance: 1024,256".into()]),
            Some((1024, 256))
        );
        let ini = "[*]\nctx-size = 8192\nbatch-size = 4096\n[a]\nmodel = /a.gguf\nctx-size = 2048\nubatch-size = 2048\n[b]\nmodel = /b.gguf\n";
        let fallback = fallback_ini(ini, "a", 1024, 256);
        assert!(fallback.contains("ctx-size = 2048\n"));
        assert!(fallback.contains("batch-size = 1024\n"));
        assert!(fallback.contains("ubatch-size = 256\n"));
        assert!(!fallback.contains("/b.gguf"));
    }

    #[cfg(not(feature = "engine"))]
    #[test]
    fn reservations_preserve_capacity_and_keep_resident_models_available() {
        let mut r = Registry::new(2);
        resident(&mut r, &["a"]);
        r.register("b", spec("b"));
        let (ticket, retired) = r.prepare_load("b").unwrap();
        assert!(retired.is_empty());
        assert_eq!(r.status_of("b"), ModelStatus::Loading);
        assert!(r.busy_models().contains(&"b".to_string()));
        assert!(r.prepare_load("b").is_err());
        assert!(r.acquire("a").is_ok());
        r.release("a");
        r.finish_load(&ticket, &Ok(Arc::new(Engine::stub())))
            .unwrap();
        assert_eq!(r.loaded_models(), vec!["a", "b"]);
        assert!(r.busy_models().is_empty());
    }

    #[cfg(not(feature = "engine"))]
    #[test]
    fn reload_unload_and_shutdown_reject_late_native_results() {
        for action in ["reload", "remove-readd", "unload", "shutdown", "shrink"] {
            let mut r = reg(2, &["a"]);
            let (ticket, _) = r.prepare_load("a").unwrap();
            match action {
                "reload" => {
                    r.reload(specs(&[("a", "changed")]), 2);
                }
                "remove-readd" => {
                    r.reload(HashMap::new(), 2);
                    r.register("a", spec("a"));
                }
                "unload" => {
                    assert!(r.cancel_load("a"));
                }
                "shutdown" => {
                    r.shutdown();
                }
                "shrink" => {
                    resident(&mut r, &["b"]);
                    r.reload(specs(&[("a", "a"), ("b", "b")]), 1);
                }
                _ => unreachable!(),
            }
            assert!(
                r.finish_load(&ticket, &Ok(Arc::new(Engine::stub())))
                    .is_err(),
                "{action}"
            );
            assert!(!r.is_loaded("a"), "{action}");
            assert!(!r.is_loading("a"), "{action}");
        }
    }

    #[test]
    fn failed_reservation_can_be_retried_and_reports_failure() {
        let mut r = reg(1, &["a"]);
        let (ticket, _) = r.prepare_load("a").unwrap();
        assert!(r
            .finish_load(&ticket, &Err(EngineError::Start("test failure".into())))
            .is_err());
        assert!(r.failure_of("a").unwrap().contains("test failure"));
        assert!(!r.is_loading("a"));
        assert!(r.prepare_load("a").is_ok());
        assert!(r.failure_of("a").is_none());
    }

    fn spec(n: &str) -> LoadSpec {
        LoadSpec::Args(vec!["llama-server".into(), "-m".into(), n.into()])
    }

    /// Without the `engine` feature every load fails, which still exercises
    /// the bookkeeping: registration, capacity and eviction order are decided
    /// before an engine is ever started.
    fn reg(max: usize, models: &[&str]) -> Registry {
        let mut r = Registry::new(max);
        for m in models {
            r.register(*m, spec(m));
        }
        r
    }

    /// Puts a model in `loaded` without a load, which the default feature
    /// config cannot do: `acquire` always fails there.
    #[cfg(not(feature = "engine"))]
    fn resident(r: &mut Registry, models: &[&str]) {
        for m in models {
            r.register(*m, spec(m));
            r.loaded.insert(
                (*m).to_string(),
                LoadedModel {
                    engine: Arc::new(Engine::stub()),
                    inflight: 0,
                    last_used: next_tick(),
                    identity: identity_for_spec(m, &spec(m)),
                },
            );
        }
    }

    /// Every path that stops hosting a model has to say so: the slot occupancy
    /// map lives behind an async lock this struct cannot take, and a model
    /// missing from this list keeps its stale claim on a slot id that another
    /// thread will later be handed.
    #[cfg(not(feature = "engine"))]
    #[test]
    fn each_drop_path_records_the_model_it_dropped() {
        let mut r = Registry::new(2);
        resident(&mut r, &["a"]);
        assert!(r.unload("a"));
        assert_eq!(r.take_dropped(), vec!["a".to_string()]);
        assert!(r.take_dropped().is_empty(), "draining is not repeatable");

        resident(&mut r, &["b"]);
        r.retire("b");
        assert_eq!(r.take_dropped(), vec!["b".to_string()]);

        // Eviction under models_max: the victim is dropped by make_room rather
        // than by a caller, which is the path with no async context at all.
        let mut r = Registry::new(1);
        resident(&mut r, &["c"]);
        assert!(r.make_room().is_ok());
        assert_eq!(r.take_dropped(), vec!["c".to_string()]);

        let mut r = Registry::new(2);
        resident(&mut r, &["d", "e"]);
        let mut ids = r.shutdown();
        ids.sort();
        assert_eq!(ids, vec!["d".to_string(), "e".to_string()]);
        let mut dropped = r.take_dropped();
        dropped.sort();
        assert_eq!(dropped, vec!["d".to_string(), "e".to_string()]);
    }

    /// A busy model is not dropped, so it must not be recorded as dropped
    /// either -- releasing its occupancy would discard a live slot's claim.
    #[cfg(not(feature = "engine"))]
    #[test]
    fn a_busy_model_is_neither_dropped_nor_recorded() {
        let mut r = Registry::new(2);
        resident(&mut r, &["a"]);
        r.loaded.get_mut("a").unwrap().inflight = 1;
        assert!(!r.unload("a"), "unload must refuse a busy model");
        r.retire("a");
        assert!(r.take_dropped().is_empty());
    }

    #[test]
    fn registration_does_not_load() {
        let r = reg(2, &["a", "b"]);
        assert_eq!(r.known_models(), vec!["a", "b"]);
        assert!(r.loaded_models().is_empty());
        assert!(!r.is_loaded("a"));
    }

    #[test]
    fn an_unregistered_model_is_rejected_before_any_load() {
        let mut r = reg(2, &["a"]);
        let err = r.acquire("nope").unwrap_err();
        assert!(matches!(err, RegistryError::Engine(_)));
    }

    #[test]
    fn models_max_zero_means_unlimited() {
        let r = reg(0, &["a"]);
        assert_eq!(r.models_max(), 0);
        assert!(!r.is_saturated(), "unlimited must never saturate");
    }

    #[test]
    fn release_is_saturating_and_never_underflows() {
        let mut r = reg(1, &["a"]);
        // release on a model that was never loaded must be a no-op, not a panic
        r.release("a");
        r.release("a");
        assert!(!r.is_loaded("a"));
    }

    fn specs(pairs: &[(&str, &str)]) -> HashMap<String, LoadSpec> {
        pairs
            .iter()
            .map(|(id, path)| ((*id).to_string(), spec(path)))
            .collect()
    }

    #[test]
    fn reload_registers_new_models_and_drops_removed_ones() {
        let mut r = reg(2, &["a", "b"]);
        let outcome = r.reload(specs(&[("b", "b"), ("c", "c")]), 2);
        assert_eq!(outcome.added, vec!["c"]);
        assert_eq!(outcome.removed, vec!["a"]);
        assert!(outcome.changed.is_empty());
        assert_eq!(r.known_models(), vec!["b", "c"]);
    }

    /// The point of reloading rather than restarting: a model whose settings
    /// did not move is left alone.
    #[test]
    fn reload_reports_an_unchanged_spec_as_neither_added_nor_changed() {
        let mut r = reg(2, &["a"]);
        let outcome = r.reload(specs(&[("a", "a")]), 2);
        assert!(outcome.added.is_empty());
        assert!(outcome.changed.is_empty());
        assert!(outcome.removed.is_empty());
    }

    #[test]
    fn reload_reports_a_moved_spec_as_changed() {
        let mut r = reg(2, &["a"]);
        let outcome = r.reload(specs(&[("a", "a-different-gguf")]), 2);
        assert_eq!(outcome.changed, vec!["a"]);
        assert!(outcome.added.is_empty());
    }

    /// The router fixed models_max at spawn, so Jan had to cold-restart the
    /// whole process just to add the embedding slot.
    #[test]
    fn reload_resizes_models_max() {
        let mut r = reg(1, &["a"]);
        r.reload(specs(&[("a", "a")]), 2);
        assert_eq!(r.models_max(), 2);
    }

    #[test]
    fn reload_clears_a_recorded_failure_so_a_fixed_model_is_retried() {
        let mut r = reg(1, &["a"]);
        // A failed load is what populates `failures`; without the engine
        // feature every acquire fails, which is exactly the state needed here.
        let _ = r.acquire("a");
        assert!(r.failure_of("a").is_some());
        r.reload(specs(&[("a", "a-fixed")]), 1);
        assert!(
            r.failure_of("a").is_none(),
            "a changed spec must not inherit the old failure"
        );
    }

    #[test]
    fn unload_refuses_a_model_that_is_not_loaded() {
        let mut r = reg(1, &["a"]);
        assert!(!r.unload("a"));
    }

    #[test]
    fn lru_picks_the_least_recently_used_idle_model() {
        let entries = [("old", 0usize, 1u64), ("new", 0, 2)];
        assert_eq!(
            pick_lru_idle(entries.iter().copied()).as_deref(),
            Some("old")
        );
    }

    #[test]
    fn a_busy_model_is_never_evicted_even_if_it_is_oldest() {
        // Upstream's rule (server-models.cpp:92-95): evicting a model with a
        // request in flight would cancel a live generation.
        let entries = [("old-but-busy", 3usize, 1u64), ("idle", 0, 9)];
        assert_eq!(
            pick_lru_idle(entries.iter().copied()).as_deref(),
            Some("idle")
        );
    }

    #[test]
    fn nothing_is_evictable_when_every_model_is_busy() {
        let entries = [("a", 1usize, 1u64), ("b", 2, 2)];
        assert_eq!(pick_lru_idle(entries.iter().copied()), None);
    }

    #[test]
    fn a_specs_model_path_is_found_in_either_spelling() {
        assert_eq!(
            spec_model_path(&["ctx-size = 4096".into(), "model = /m/a.gguf".into()]),
            Some("/m/a.gguf".to_string())
        );
        assert_eq!(
            spec_model_path(&["-m".into(), "/m/b.gguf".into()]),
            Some("/m/b.gguf".to_string())
        );
        assert_eq!(spec_model_path(&["ctx-size = 4096".into()]), None);
    }

    // `mmproj` and `model-draft` also end in a path; matching them would stamp
    // the state guard against the wrong file.
    #[test]
    fn a_key_merely_ending_in_model_is_not_the_model_path() {
        assert_eq!(spec_model_path(&["mmproj = /m/mm.gguf".into()]), None);
        assert_eq!(spec_model_path(&["model-draft = /m/d.gguf".into()]), None);
    }

    #[test]
    fn state_identity_follows_the_registered_spec() {
        let mut r = reg(1, &[]);
        r.register("m", spec("/m/a.gguf"));
        let id = r.state_identity("m").expect("registered");
        assert_eq!(id.model, "m");
        r.register("m", spec("/m/b.gguf"));
        assert_ne!(
            r.state_identity("m").unwrap().spec,
            id.spec,
            "a spec change must invalidate saved state"
        );
        assert!(r.state_identity("absent").is_none());
    }

    #[cfg(not(feature = "engine"))]
    #[test]
    fn busy_reloaded_model_keeps_its_loaded_cache_identity() {
        let mut r = reg(1, &[]);
        resident(&mut r, &["a"]);
        let identity = r.state_identity("a").unwrap();
        r.acquire("a").unwrap();
        r.reload(HashMap::from([("a".into(), spec("changed.gguf"))]), 1);
        assert_eq!(r.state_identity("a").unwrap(), identity);
        r.release("a");
        assert_ne!(r.state_identity("a").unwrap(), identity);
    }

    #[test]
    fn ticks_are_monotonic_so_lru_order_cannot_invert() {
        let a = next_tick();
        let b = next_tick();
        assert!(b > a, "tick went backwards: {a} then {b}");
    }
}
