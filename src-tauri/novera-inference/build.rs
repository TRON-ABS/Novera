#[path = "../plugins/tauri-plugin-llamacpp/build.rs"]
mod native;

fn main() {
    let plugin = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .expect("inference crate has no source root")
        .join("plugins/tauri-plugin-llamacpp");
    // canonicalize() adds a Windows verbatim prefix (\\?\), which CMake's
    // Clang commands cannot consume after rewriting it to //?/. Cargo already
    // supplies an absolute manifest directory, so no canonicalization is needed.
    assert!(
        plugin.join("build.rs").is_file(),
        "shared engine source is missing"
    );
    std::env::set_var("NOVERA_LLAMA_PLUGIN_ROOT", &plugin);
    println!(
        "cargo:rerun-if-changed={}",
        plugin.join("build.rs").display()
    );
    println!("cargo:rerun-if-changed={}", plugin.join("shim").display());
    native::main();
}
