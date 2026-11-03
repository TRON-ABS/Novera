//! Candidate builds must not fall back to an inherited unsigned update route.
use app_lib::core::cli::updater;
use std::{process::Command, time::Duration};

#[tokio::test]
#[cfg(not(feature = "signed-updates"))]
async fn unconfigured_candidates_reject_checks_and_forced_updates() {
    let error = updater::check_for_update(Duration::ZERO).await.unwrap_err();
    assert!(error.contains("no signed Novera channel"), "{error}");
    assert!(updater::available_update().await.is_none());
    for force in [false, true] {
        let error = updater::self_update(force).await.unwrap_err();
        assert!(error.contains("no signed Novera channel"), "{error}");
    }
}

#[test]
fn compiled_update_policy_matches_the_selected_feature() {
    assert_eq!(
        updater::signed_channel_configured(),
        cfg!(feature = "signed-updates")
    );
}

#[test]
fn help_reports_novera_identity_configuration_and_actual_update_state() {
    let output = Command::new(env!("CARGO_BIN_EXE_novera"))
        .arg("--help")
        .output()
        .expect("candidate CLI help");
    assert!(output.status.success());
    let help = String::from_utf8(output.stdout).expect("UTF-8 help");
    let help = help.split_whitespace().collect::<Vec<_>>().join(" ");
    for expected in [
        "Novera CLI",
        "~/.novera/config.toml",
        "signed Novera channel",
        "TRON-ABS",
        "The art of Human with AI",
    ] {
        assert!(help.contains(expected), "missing {expected}");
    }
    assert!(!help.contains("anonymous usage ping"));
    assert!(help.contains("novera"));
    for legacy in ["Usage: jan", "jan cli", "jan update", "~/.jan/", "JAN_API_KEY", "JAN_BASE_URL"] {
        assert!(!help.contains(legacy), "legacy product identity in help: {legacy}");
    }
}
