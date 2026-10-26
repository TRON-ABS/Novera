import Foundation
import Tauri
import UIKit
import WebKit

struct ShareArgs: Decodable {
    let path: String
    let root: String
    let title: String
    let text: String
}

class SharingPlugin: Plugin {
    private func file(_ args: ShareArgs) throws -> URL {
        let url = URL(fileURLWithPath: args.path).resolvingSymlinksInPath()
        let cache = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask)[0]
            .resolvingSymlinksInPath().path + "/"
        let root = URL(fileURLWithPath: args.root).resolvingSymlinksInPath()
        guard root.lastPathComponent == "shares", root.path.hasPrefix(cache),
              url.path.hasPrefix(root.path + "/"), FileManager.default.fileExists(atPath: url.path) else {
            throw NSError(domain: "NoveraShare", code: 1)
        }
        return url
    }

    @objc public func copyFile(_ invoke: Invoke) throws {
        let url = try file(invoke.parseArgs(ShareArgs.self))
        DispatchQueue.main.async {
            guard let provider = NSItemProvider(contentsOf: url) else { invoke.reject("SHARE_UNSUPPORTED"); return }
            UIPasteboard.general.setItemProviders([provider], localOnly: false, expirationDate: nil)
            invoke.resolve()
        }
    }
    @objc public func share(_ invoke: Invoke) throws {
        let args = try invoke.parseArgs(ShareArgs.self)
        let url = try file(args)
        DispatchQueue.main.async {
            guard let owner = self.manager.viewController else { invoke.reject("SHARE_UNSUPPORTED"); return }
            var items: [Any] = [url]
            if !args.text.isEmpty { items.append(args.text) }
            let sheet = UIActivityViewController(activityItems: items, applicationActivities: nil)
            sheet.title = args.title
            if let popover = sheet.popoverPresentationController {
                popover.sourceView = owner.view
                popover.sourceRect = CGRect(x: owner.view.bounds.midX, y: owner.view.bounds.midY, width: 1, height: 1)
                popover.permittedArrowDirections = []
            }
            owner.present(sheet, animated: true) { invoke.resolve() }
        }
    }
}

@_cdecl("init_plugin_novera_share")
func initPlugin() -> Plugin { SharingPlugin() }
