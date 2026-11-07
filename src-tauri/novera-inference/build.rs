#[path = "../plugins/tauri-plugin-llamacpp/build.rs"]
mod native;

fn main() {
    let plugin = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("../plugins/tauri-plugin-llamacpp")
        .canonicalize()
        .expect("shared engine source is missing");
    std::env::set_var("NOVERA_LLAMA_PLUGIN_ROOT", &plugin);
    println!(
        "cargo:rerun-if-changed={}",
        plugin.join("build.rs").display()
    );
    println!("cargo:rerun-if-changed={}", plugin.join("shim").display());
    native::main();
}
