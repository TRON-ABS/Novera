//! Backend policy shared by interactive and automatic API startup.
pub(crate) fn validate_bind(host: &str, key: &str, tools: bool) -> Result<String, String> {
    let loopback = host == "localhost"
        || host
            .trim_matches(['[', ']'])
            .parse::<std::net::IpAddr>()
            .is_ok_and(|address| address.is_loopback());
    if (!loopback || tools) && key.trim().is_empty() {
        return Err("An API key is required for network access or server-side tools".into());
    }
    Ok(key.trim().to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn network_and_tool_access_require_authentication() {
        for host in ["0.0.0.0", "192.168.1.2", "::", "example.test"] {
            for key in ["", " ", "\t\n"] {
                assert!(validate_bind(host, key, false).is_err());
            }
            assert_eq!(validate_bind(host, " token ", false).unwrap(), "token");
        }
        assert!(validate_bind("127.0.0.1", "", true).is_err());
    }

    #[test]
    fn loopback_without_tools_preserves_local_clients() {
        for host in ["127.0.0.1", "127.0.0.2", "::1", "[::1]", "localhost"] {
            assert_eq!(validate_bind(host, "", false).unwrap(), "");
        }
    }
}
