# fix(linux): enable zbus client proxies after the dependency upgrade

The clean Linux 1.0.1 build fails with six missing `zbus::Proxy` / `zbus::proxy` errors in sharing and desktop setup. zbus 6.2.1 gates these APIs behind its `proxy` feature. This application disables default features and enabled only Tokio, so the existing D-Bus client code is compiled out. Enable the client proxy feature explicitly while retaining the selected runtime and disabled defaults.

Reproduction: Linux job 128310601176 in run 42341684328 reaches application compilation and reports that the required symbols are configured out by `#[cfg(feature = "proxy")]`.

Validation: the feature is checked against the upstream [6.2.1 manifest](https://github.com/dbus2/zbus/blob/zbus-6.2.1/zbus/Cargo.toml). Source/version contracts and locked dependency resolution are checked locally; the signed Linux build is rerun for actual compilation and native checks. Windows/Mac native builds are independent and remain in progress. No Linux package success is claimed before CI completes.

Depends on the merged 1.0.1 source and build corrections (#26–#30). The change is limited to the existing Linux-only optional dependency. Update the release lessons to distinguish a gated API from a renamed API.
