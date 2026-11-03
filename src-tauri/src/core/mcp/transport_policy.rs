/// Mobile distributions do not bundle desktop command runtimes (uvx/npx).
/// Remote MCP connections remain available without spawning local executables.
pub fn transport_available(mobile: bool, transport: Option<&str>) -> bool {
    !mobile || matches!(transport, Some("http" | "sse"))
}

#[cfg(test)]
mod tests {
    use super::transport_available;

    #[test]
    fn mobile_accepts_remote_mcp_but_not_desktop_processes() {
        for transport in [None, Some("stdio"), Some("unknown")] {
            assert!(!transport_available(true, transport));
        }
        for transport in [Some("http"), Some("sse")] {
            assert!(transport_available(true, transport));
        }
    }

    #[test]
    fn desktop_transport_behavior_is_preserved() {
        for transport in [None, Some("stdio"), Some("http"), Some("sse")] {
            assert!(transport_available(false, transport));
        }
    }
}
