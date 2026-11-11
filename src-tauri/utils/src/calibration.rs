use std::{
    collections::VecDeque,
    sync::{
        atomic::{AtomicBool, AtomicUsize, Ordering},
        Mutex as SyncMutex,
    },
    time::{Duration, Instant},
};
use tokio::sync::Mutex;

pub const MIN_GAIN: f64 = 0.033;

pub fn available() -> bool {
    cfg!(any(
        target_os = "windows",
        target_os = "linux",
        target_os = "macos"
    ))
}
static ENABLED: AtomicBool = AtomicBool::new(false);
static FOREGROUND: AtomicUsize = AtomicUsize::new(0);
pub static ACTIVE: Mutex<()> = Mutex::const_new(());
static WAITING: SyncMutex<VecDeque<(Category, Instant)>> = SyncMutex::new(VecDeque::new());

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Category {
    Text,
    Music,
    Image,
    Video,
}

fn enqueue(queue: &mut VecDeque<(Category, Instant)>, category: Category, now: Instant) {
    // Abandoned or removed imports stop refreshing their place.
    queue.retain(|(_, last_seen)| now.duration_since(*last_seen) < Duration::from_secs(40));
    if let Some((_, last_seen)) = queue.iter_mut().find(|(waiting, _)| *waiting == category) {
        *last_seen = now;
    } else {
        queue.push_back((category, now));
    }
}

pub fn try_background(category: Category) -> Option<tokio::sync::MutexGuard<'static, ()>> {
    if !enabled() || foreground_busy() {
        return None;
    }
    let mut queue = WAITING.lock().ok()?;
    enqueue(&mut queue, category, Instant::now());
    if queue.front()?.0 != category {
        return None;
    }
    let guard = ACTIVE.try_lock().ok()?;
    queue.pop_front();
    Some(guard)
}

pub fn enabled() -> bool {
    available() && ENABLED.load(Ordering::Acquire)
}

pub fn set_enabled(value: bool) {
    ENABLED.store(value, Ordering::Release);
    if !value {
        if let Ok(mut queue) = WAITING.lock() {
            queue.clear();
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn runtime_switch_enables_supported_desktop_platforms() {
        set_enabled(true);
        assert_eq!(
            enabled(),
            cfg!(any(
                target_os = "windows",
                target_os = "linux",
                target_os = "macos"
            ))
        );
        set_enabled(false);
        assert!(!enabled());
    }

    #[test]
    fn repeated_text_imports_keep_waiting_media_in_order() {
        let now = Instant::now();
        let mut queue = VecDeque::new();
        for category in [
            Category::Text,
            Category::Music,
            Category::Text,
            Category::Video,
            Category::Image,
        ] {
            enqueue(&mut queue, category, now);
        }
        queue.pop_front();
        enqueue(&mut queue, Category::Text, now + Duration::from_secs(15));
        assert_eq!(
            queue.iter().map(|item| item.0).collect::<Vec<_>>(),
            [
                Category::Music,
                Category::Video,
                Category::Image,
                Category::Text
            ]
        );
        enqueue(&mut queue, Category::Music, now + Duration::from_secs(42));
        assert_eq!(queue.front().unwrap().0, Category::Text);
    }
}

pub fn foreground_busy() -> bool {
    FOREGROUND.load(Ordering::Acquire) != 0
}

pub struct ForegroundWork;

impl ForegroundWork {
    pub fn start() -> Self {
        FOREGROUND.fetch_add(1, Ordering::AcqRel);
        Self
    }
}

impl Drop for ForegroundWork {
    fn drop(&mut self) {
        FOREGROUND.fetch_sub(1, Ordering::AcqRel);
    }
}
