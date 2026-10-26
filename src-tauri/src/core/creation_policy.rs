//! Process concurrency policy shared by all local image/video backends.
pub fn valid_memory_policy(policy: Option<&str>) -> bool {
    matches!(policy, None | Some("auto" | "manual"))
}
pub fn may_start_media(policy: Option<&str>, another_job_running: bool) -> bool {
    valid_memory_policy(policy) && (policy == Some("manual") || !another_job_running)
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn default_and_auto_do_not_overlap_workers() {
        for policy in [None, Some("auto")] {
            assert!(may_start_media(policy, false));
            assert!(!may_start_media(policy, true));
        }
    }
    #[test]
    fn manual_can_start_image_and_video_beside_text() {
        assert!(may_start_media(Some("manual"), false));
        assert!(may_start_media(Some("manual"), true));
        assert!(valid_memory_policy(Some("manual")));
    }
    #[test]
    fn unknown_policies_do_not_bypass_the_guard() {
        for policy in [Some("parallel"), Some("MANUAL"), Some("")] {
            assert!(!valid_memory_policy(policy));
            assert!(!may_start_media(policy, false));
            assert!(!may_start_media(policy, true));
        }
    }
}
