//! An updater build may use only Novera's signed GitHub release feed.
pub const ENDPOINT: &str =
    "https://github.com/TRON-ABS/Novera/releases/latest/download/latest.json";

pub fn configured(value: Option<&serde_json::Value>) -> bool {
    let Some(value) = value else { return false };
    let endpoints = value.get("endpoints").and_then(|v| v.as_array());
    let key = value.get("pubkey").and_then(|v| v.as_str()).unwrap_or("");
    endpoints.is_some_and(|urls| urls.len() == 1 && urls[0].as_str() == Some(ENDPOINT))
        && !key.trim().is_empty()
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn unconfigured_or_foreign_feeds_stay_disabled() {
        assert!(!configured(None));
        assert!(!configured(Some(&json!({"endpoints": [ENDPOINT], "pubkey": ""}))));
        assert!(!configured(Some(&json!({"endpoints": ["https://delta.jan.ai/latest.json"], "pubkey": "test"}))));
        assert!(!configured(Some(&json!({"endpoints": [ENDPOINT, "https://other.invalid"], "pubkey": "test"}))));
    }

    #[test]
    fn only_the_novera_feed_can_register_the_plugin() {
        // The plugin itself parses the actual public key and verifies every artifact.
        assert!(configured(Some(&json!({"endpoints": [ENDPOINT], "pubkey": "test"}))));
    }
}
