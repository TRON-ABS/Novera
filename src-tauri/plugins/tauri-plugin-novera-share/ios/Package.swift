// swift-tools-version:5.3
import PackageDescription
let package = Package(
    name: "tauri-plugin-novera-share",
    platforms: [.iOS(.v13)],
    products: [.library(name: "tauri-plugin-novera-share", type: .static, targets: ["tauri-plugin-novera-share"])],
    dependencies: [.package(name: "Tauri", path: "../.tauri/tauri-api")],
    targets: [.target(name: "tauri-plugin-novera-share", dependencies: [.byName(name: "Tauri")], path: "Sources")]
)
