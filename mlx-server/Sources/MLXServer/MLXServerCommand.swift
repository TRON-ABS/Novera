import ArgumentParser
import Foundation
import Hummingbird
import MLX

@main
struct MLXServerCommand: AsyncParsableCommand {
    static let configuration = CommandConfiguration(
        commandName: "mlx-server",
        abstract: "MLX-Swift inference server with OpenAI-compatible API"
    )

    @Option(name: [.long, .short], help: "Path to the model directory, or a file inside it")
    var model: String

    @Option(name: .long, help: "Port to listen on")
    var port: Int = 8080

    @Option(name: .long, help: "Context window size")
    var ctxSize: Int = 4096

    @Option(name: .long, help: "API key for authentication (optional)")
    var apiKey: String = ""

    @Option(name: .long, help: "Model ID reported by the API (defaults to parent directory name)")
    var modelId: String = ""

    @Option(name: .long, help: "Allocator cache limit in MiB for a calibrated local model")
    var calibrationCacheMib: Int?

    func run() async throws {
        if let calibrationCacheMib, ![64, 128, 256].contains(calibrationCacheMib) {
            throw ValidationError("Unsupported allocator cache limit")
        }
        Memory.cacheLimit = (calibrationCacheMib ?? 20) * 1024 * 1024

        // Print startup info
        log("[mlx] MLX-Swift Server starting...")
        log("[mlx] Model path: \(model)")
        log("[mlx] Port: \(port)")
        log("[mlx] Context size: \(ctxSize)")
        log("[mlx] Memory cache limit: \(Memory.cacheLimit / (1024 * 1024))MB")

        // Resolve model ID: use --model-id if provided, otherwise derive from parent directory
        let modelURL = URL(fileURLWithPath: model)
        let resolvedModelId = modelId.isEmpty
            ? modelURL.deletingPathExtension().lastPathComponent
            : modelId

        // Load the model
        let modelRunner = ModelRunner()

        do {
            try await modelRunner.load(modelPath: model)
        } catch {
            log("[mlx] Failed to load model: \(error)")
            throw error
        }

        // Set up the HTTP server
        let server = MLXHTTPServer(
            modelRunner: modelRunner,
            modelId: resolvedModelId,
            apiKey: apiKey
        )

        let router = server.buildRouter()
        let app = Application(router: router, configuration: .init(address: .hostname("127.0.0.1", port: port)))

        // Print readiness signal (monitored by Tauri plugin)
        log("[mlx] http server listening on http://127.0.0.1:\(port)")
        log("[mlx] server is listening on 127.0.0.1:\(port)")

        try await app.run()
    }
}
