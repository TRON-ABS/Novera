//! Explicit, local Windows speech. Never invoked at startup or by telemetry.
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, VecDeque};
use std::sync::{Arc, LazyLock, Mutex};
use tokio::sync::Notify;

struct Operation {
    session: String,
    cancel: Arc<Notify>,
}
#[derive(Default)]
struct Registry {
    operations: HashMap<String, Operation>,
    cancelled: HashMap<String, VecDeque<String>>,
}
impl Registry {
    fn cancel(&mut self, label: &str, session: &str) {
        let sessions = self.cancelled.entry(label.into()).or_default();
        if !sessions.iter().any(|item| item == session) {
            if sessions.len() >= 32 {
                sessions.pop_front();
            }
            sessions.push_back(session.into());
        }
        if let Some(operation) = self.operations.get(label) {
            if operation.session == session {
                operation.cancel.notify_one();
            }
        }
    }
    fn was_cancelled(&self, label: &str, session: &str) -> bool {
        self.cancelled
            .get(label)
            .is_some_and(|sessions| sessions.iter().any(|item| item == session))
    }
}
static OPERATIONS: LazyLock<Mutex<Registry>> = LazyLock::new(|| Mutex::new(Registry::default()));

pub fn cancel_window(label: &str) {
    if let Ok(mut registry) = OPERATIONS.lock() {
        if let Some(session) = registry.operations.get(label).map(|op| op.session.clone()) {
            registry.cancel(label, &session);
        }
    }
}

pub fn window_is_foreground(window: &tauri::WebviewWindow) -> bool {
    #[cfg(target_os = "windows")]
    {
        windows::is_foreground(window)
    }
    #[cfg(not(target_os = "windows"))]
    {
        window.is_focused().unwrap_or(false)
    }
}

#[derive(Clone, Copy, Deserialize, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum VoiceOperation {
    Listen,
    Speak,
}

#[derive(Serialize, Deserialize)]
pub struct VoiceResponse {
    status: String,
    text: String,
}

fn valid_request(locale: &str, session: &str, text: &str) -> bool {
    !locale.is_empty()
        && locale.len() <= 64
        && locale
            .bytes()
            .all(|c| c.is_ascii_alphanumeric() || c == b'-')
        && !session.is_empty()
        && session.len() <= 96
        && session
            .bytes()
            .all(|c| c.is_ascii_alphanumeric() || c == b'-')
        && text.len() <= 65_536
}

#[tauri::command]
pub fn voice_is_foreground(window: tauri::WebviewWindow) -> bool {
    window_is_foreground(&window)
}

#[tauri::command]
pub async fn voice_cancel(window: tauri::WebviewWindow, session: String) {
    if let Ok(mut registry) = OPERATIONS.lock() {
        if valid_request("en", &session, "") {
            registry.cancel(window.label(), &session);
        }
    }
}

#[tauri::command]
pub async fn voice_run(
    window: tauri::WebviewWindow,
    operation: VoiceOperation,
    locale: String,
    session: String,
    text: String,
) -> Result<VoiceResponse, String> {
    if !valid_request(&locale, &session, &text) {
        return Err("unavailable".into());
    }
    if !window_is_foreground(&window) {
        return Err("cancelled".into());
    }
    #[cfg(target_os = "windows")]
    {
        windows::run(&window, operation, &locale, &session, &text).await
    }
    #[cfg(not(target_os = "windows"))]
    {
        let _ = operation;
        Err("unavailable".into())
    }
}

#[cfg(target_os = "windows")]
mod windows {
    use super::*;
    use base64::Engine;
    use std::{process::Stdio, time::Duration};
    use tauri::Emitter;
    use tokio::io::{AsyncReadExt, AsyncWriteExt};
    use windows_sys::Win32::{
        Foundation::{CloseHandle, HANDLE, HWND},
        System::JobObjects::{
            AssignProcessToJobObject, CreateJobObjectW, JobObjectExtendedLimitInformation,
            SetInformationJobObject, JOBOBJECT_EXTENDED_LIMIT_INFORMATION,
            JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE,
        },
        UI::WindowsAndMessaging::{GetAncestor, GetForegroundWindow, IsWindowVisible, GA_ROOT},
    };

    fn same_window_root(window: HWND, foreground: HWND) -> bool {
        if window.is_null() || foreground.is_null() {
            return false;
        }
        // SAFETY: GetAncestor only queries an OS handle and returns null for
        // invalid handles. It neither dereferences our memory nor takes ownership.
        window == foreground || unsafe { GetAncestor(foreground, GA_ROOT) } == window
    }

    pub(super) fn is_foreground(window: &tauri::WebviewWindow) -> bool {
        let Ok(handle) = window.hwnd() else {
            return false;
        };
        let handle = handle.0 as HWND;
        // Tao's cached is_focused can be false while its WebView2 child owns
        // keyboard focus. Check the actual foreground root, never just the PID:
        // another Novera window must not authorize this window's microphone.
        // SAFETY: the borrowed Tauri window owns this live HWND; these APIs are
        // thread-independent read-only queries and transfer no ownership.
        unsafe { IsWindowVisible(handle) != 0 && same_window_root(handle, GetForegroundWindow()) }
    }

    struct Job(HANDLE);
    // The owned Win32 job handle is thread-neutral and closed exactly once.
    unsafe impl Send for Job {}
    impl Drop for Job {
        fn drop(&mut self) {
            // SAFETY: this wrapper owns the live handle exclusively.
            unsafe {
                CloseHandle(self.0);
            }
        }
    }
    fn protect(child: &tokio::process::Child) -> Result<Job, String> {
        // SAFETY: null security/name parameters request an unnamed, non-inherited job.
        let handle = unsafe { CreateJobObjectW(std::ptr::null(), std::ptr::null()) };
        if handle.is_null() {
            return Err("unavailable".into());
        }
        let job = Job(handle);
        // SAFETY: zero initializes the documented Windows structure before setting flags.
        let mut limits: JOBOBJECT_EXTENDED_LIMIT_INFORMATION = unsafe { std::mem::zeroed() };
        limits.BasicLimitInformation.LimitFlags = JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE;
        let process = child.raw_handle().ok_or("unavailable")?;
        // SAFETY: live job/process handles and a correctly sized initialized structure.
        let configured = unsafe {
            SetInformationJobObject(
                handle,
                JobObjectExtendedLimitInformation,
                &limits as *const _ as *const _,
                std::mem::size_of_val(&limits) as u32,
            )
        };
        // SAFETY: both handles remain live for the duration of this call.
        if configured == 0 || unsafe { AssignProcessToJobObject(handle, process) } == 0 {
            return Err("unavailable".into());
        }
        Ok(job)
    }

    struct Registration {
        label: String,
        cancel: Arc<Notify>,
    }
    impl Drop for Registration {
        fn drop(&mut self) {
            if let Ok(mut registry) = OPERATIONS.lock() {
                if registry
                    .operations
                    .get(&self.label)
                    .is_some_and(|op| Arc::ptr_eq(&op.cancel, &self.cancel))
                {
                    registry.operations.remove(&self.label);
                }
            }
        }
    }

    async fn read_response(
        output: impl tokio::io::AsyncRead + Unpin,
        mut partial: impl FnMut(&str),
    ) -> Result<VoiceResponse, &'static str> {
        use tokio::io::AsyncBufReadExt;
        let mut output = tokio::io::BufReader::new(output.take(262_145));
        let mut total = 0;
        let mut final_reply = None;
        loop {
            let mut line = String::new();
            let read = (&mut output)
                .take(65_537)
                .read_line(&mut line)
                .await
                .map_err(|_| "unavailable")?;
            if read == 0 {
                break;
            }
            total += read;
            if read > 65_536 || total > 262_144 {
                return Err("unavailable");
            }
            let reply: VoiceResponse = serde_json::from_str(&line).map_err(|_| "unavailable")?;
            if reply.status == "partial" {
                partial(&reply.text);
            } else {
                final_reply = Some(reply);
            }
        }
        final_reply.ok_or("unavailable")
    }

    pub async fn run(
        window: &tauri::WebviewWindow,
        operation: VoiceOperation,
        locale: &str,
        session: &str,
        text: &str,
    ) -> Result<VoiceResponse, String> {
        let label = window.label();
        let cancel = Arc::new(Notify::new());
        {
            let mut registry = OPERATIONS.lock().map_err(|_| "unavailable")?;
            if registry.was_cancelled(label, session) {
                return Err("cancelled".into());
            }
            if let Some(previous) = registry.operations.insert(
                label.to_owned(),
                Operation {
                    session: session.into(),
                    cancel: cancel.clone(),
                },
            ) {
                previous.cancel.notify_one();
            }
        }
        let _registration = Registration {
            label: label.into(),
            cancel: cancel.clone(),
        };
        let system = std::env::var_os("SystemRoot").ok_or("unavailable")?;
        let executable =
            std::path::PathBuf::from(system).join("System32/WindowsPowerShell/v1.0/powershell.exe");
        let encoded: Vec<u8> = include_str!("windows.ps1")
            .encode_utf16()
            .flat_map(u16::to_le_bytes)
            .collect();
        let mut child = tokio::process::Command::new(executable)
            .args([
                "-NoProfile",
                "-NonInteractive",
                "-EncodedCommand",
                &base64::engine::general_purpose::STANDARD.encode(encoded),
            ])
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::null())
            .creation_flags(0x08000000)
            .kill_on_drop(true)
            .spawn()
            .map_err(|_| "unavailable")?;
        let _job = match protect(&child) {
            Ok(job) => job,
            Err(error) => {
                let _ = child.kill().await;
                return Err(error);
            }
        };
        let request = serde_json::json!({"operation":operation,"locale":locale,"text":text});
        let mut input = child.stdin.take().ok_or("unavailable")?;
        // Recheck after registration: a focus-loss event racing the initial
        // command check must not open a microphone in a background window.
        if !window_is_foreground(window) {
            let _ = child.kill().await;
            return Err("cancelled".into());
        }
        input
            .write_all(format!("{request}\n").as_bytes())
            .await
            .map_err(|_| "unavailable")?;
        drop(input);
        let output = child.stdout.take().ok_or("unavailable")?;
        let transcript_window = window.clone();
        let transcript_session = session.to_owned();
        let reader = tokio::spawn(async move {
            read_response(output, |text| {
                if matches!(operation, VoiceOperation::Listen) {
                    let _ = transcript_window.emit(
                        "novera-voice-transcript",
                        serde_json::json!({
                            "session": transcript_session, "text": text,
                        }),
                    );
                }
            })
            .await
        });
        let timeout = if matches!(operation, VoiceOperation::Listen) {
            45
        } else {
            600
        };
        let foreground_lost = async {
            let mut check = tokio::time::interval(Duration::from_millis(75));
            loop {
                check.tick().await;
                if !window_is_foreground(window) {
                    break;
                }
            }
        };
        let status = tokio::select! {
            result = child.wait() => result.map_err(|_| "unavailable"),
            _ = cancel.notified() => { let _ = child.kill().await; Err("cancelled") },
            _ = foreground_lost => { let _ = child.kill().await; Err("cancelled") },
            _ = tokio::time::sleep(Duration::from_secs(timeout)) => { let _ = child.kill().await; Err("unavailable") },
        };
        if status.is_err() {
            let _ = child.kill().await;
        }
        let reply = reader.await;
        // A killed helper cannot emit a final JSON result. Preserve the actual
        // cancellation before interpreting EOF as a broken speech protocol.
        if !status?.success() {
            return Err("unavailable".into());
        }
        let reply = reply
            .map_err(|_| "unavailable")?
            .map_err(|_| "unavailable")?;
        if reply.status == "unavailable" {
            return Err("unavailable".into());
        }
        Ok(reply)
    }

    #[cfg(test)]
    mod tests {
        use super::*;
        #[test]
        fn foreground_root_allows_only_its_own_webview_children() {
            use windows_sys::Win32::UI::WindowsAndMessaging::{
                CreateWindowExW, DestroyWindow, WS_CHILD, WS_OVERLAPPED,
            };
            let class: Vec<u16> = "STATIC\0".encode_utf16().collect();
            // SAFETY: built-in STATIC class, valid null-terminated class name,
            // no application pointers. All windows stay hidden and are owned by
            // this test thread and destroyed before it returns.
            unsafe {
                let first = CreateWindowExW(
                    0,
                    class.as_ptr(),
                    std::ptr::null(),
                    WS_OVERLAPPED,
                    0,
                    0,
                    1,
                    1,
                    std::ptr::null_mut(),
                    std::ptr::null_mut(),
                    std::ptr::null_mut(),
                    std::ptr::null(),
                );
                let other = CreateWindowExW(
                    0,
                    class.as_ptr(),
                    std::ptr::null(),
                    WS_OVERLAPPED,
                    0,
                    0,
                    1,
                    1,
                    std::ptr::null_mut(),
                    std::ptr::null_mut(),
                    std::ptr::null_mut(),
                    std::ptr::null(),
                );
                let child = CreateWindowExW(
                    0,
                    class.as_ptr(),
                    std::ptr::null(),
                    WS_CHILD,
                    0,
                    0,
                    1,
                    1,
                    first,
                    std::ptr::null_mut(),
                    std::ptr::null_mut(),
                    std::ptr::null(),
                );
                assert!(!first.is_null() && !other.is_null() && !child.is_null());
                let valid = same_window_root(first, child)
                    && same_window_root(first, first)
                    && !same_window_root(first, other)
                    && !same_window_root(first, std::ptr::null_mut());
                DestroyWindow(child);
                DestroyWindow(other);
                DestroyWindow(first);
                assert!(
                    valid,
                    "foreground ownership must stay scoped to its root window"
                );
            }
        }
        #[tokio::test]
        #[ignore = "explicit local microphone diagnostic only; never run automatically"]
        async fn live_microphone_through_owned_job_and_production_reader() {
            let executable = std::path::PathBuf::from(std::env::var_os("SystemRoot").unwrap())
                .join("System32/WindowsPowerShell/v1.0/powershell.exe");
            let script: Vec<u8> = include_str!("windows.ps1")
                .encode_utf16()
                .flat_map(u16::to_le_bytes)
                .collect();
            let mut child = tokio::process::Command::new(executable)
                .args([
                    "-NoProfile",
                    "-NonInteractive",
                    "-EncodedCommand",
                    &base64::engine::general_purpose::STANDARD.encode(script),
                ])
                .creation_flags(0x08000000)
                .kill_on_drop(true)
                .stdin(Stdio::piped())
                .stdout(Stdio::piped())
                .stderr(Stdio::null())
                .spawn()
                .unwrap();
            let _job = protect(&child).expect("owned job protection failed");
            let mut input = child.stdin.take().unwrap();
            input
                .write_all(b"{\"operation\":\"listen\",\"locale\":\"fr\",\"text\":\"\"}\n")
                .await
                .unwrap();
            drop(input);
            let mut partials = 0;
            let output = child.stdout.take().unwrap();
            let result = tokio::time::timeout(Duration::from_secs(45), async {
                tokio::join!(read_response(output, |_| partials += 1), child.wait())
            })
            .await;
            if result.is_err() {
                let _ = child.kill().await;
                panic!("speech diagnostic timed out");
            }
            let (reply, exit) = result.unwrap();
            assert!(
                exit.unwrap().success(),
                "speech helper exited unsuccessfully"
            );
            let reply = reply.expect("production protocol reader failed");
            // Never print the captured words, including on assertion failure.
            println!(
                "voice diagnostic: status={}, partials={}, final_text_present={}",
                reply.status,
                partials,
                !reply.text.is_empty()
            );
            assert!(
                matches!(reply.status.as_str(), "recognized" | "timeout"),
                "speech helper unavailable"
            );
        }
        #[tokio::test]
        async fn closing_job_terminates_only_the_owned_idle_helper_without_microphone_access() {
            let executable = std::path::PathBuf::from(std::env::var_os("SystemRoot").unwrap())
                .join("System32/WindowsPowerShell/v1.0/powershell.exe");
            let mut child = tokio::process::Command::new(executable)
                .args([
                    "-NoProfile",
                    "-NonInteractive",
                    "-Command",
                    "[Console]::WriteLine('ready'); [System.Threading.Thread]::Sleep(30000)",
                ])
                .creation_flags(0x08000000)
                .kill_on_drop(true)
                .stdout(Stdio::piped())
                .stderr(Stdio::null())
                .spawn()
                .unwrap();
            let job = protect(&child).unwrap();
            use tokio::io::AsyncBufReadExt;
            let mut reader = tokio::io::BufReader::new(child.stdout.take().unwrap());
            let mut ready = String::new();
            tokio::time::timeout(Duration::from_secs(15), reader.read_line(&mut ready))
                .await
                .unwrap()
                .unwrap();
            assert_eq!(ready.trim(), "ready");
            drop(job);
            tokio::time::timeout(Duration::from_secs(5), child.wait())
                .await
                .unwrap()
                .unwrap();
            // Closing a kill-on-close job may report exit code zero. Reaping
            // the confirmed sleeping helper within five seconds proves cleanup.
            assert!(child.id().is_none());
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn validates_data_without_allowing_code_in_locale_or_session() {
        assert!(valid_request(
            "fr-FR",
            "voice-123",
            "Text ' $(untrusted) \" is data"
        ));
        assert!(!valid_request("fr;exit", "voice-123", ""));
        assert!(!valid_request("fr", "../other-window", ""));
        assert!(!valid_request("", "voice-123", ""));
        assert!(!valid_request("fr", "voice-123", &"x".repeat(65_537)));
    }
    #[test]
    fn cancellation_before_process_registration_is_remembered_and_scoped() {
        let mut registry = Registry::default();
        registry.cancel("main", "voice-1");
        assert!(registry.was_cancelled("main", "voice-1"));
        assert!(!registry.was_cancelled("other-window", "voice-1"));
        assert!(!registry.was_cancelled("main", "voice-2"));
    }
}
