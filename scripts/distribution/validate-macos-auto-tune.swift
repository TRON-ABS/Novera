import ApplicationServices
import Foundation

let arguments = CommandLine.arguments
guard arguments.count == 3, let pid = Int32(arguments[1]) else {
    fatalError("Expected the app PID and the isolated settings path")
}
guard AXIsProcessTrusted() else {
    fatalError("The macOS validation runner has not granted Accessibility access")
}

let app = AXUIElementCreateApplication(pid)
let settings = URL(fileURLWithPath: arguments[2])
let calibrationKey = "desktop.local-model-calibration"

func attribute(_ element: AXUIElement, _ name: String) -> CFTypeRef? {
    var value: CFTypeRef?
    return AXUIElementCopyAttributeValue(element, name as CFString, &value) == .success ? value : nil
}

func autoTuneControl(with roles: Set<String>) -> AXUIElement? {
    var elements = (attribute(app, kAXWindowsAttribute) as? [AXUIElement]) ?? []
    var remaining = 4_000
    while let element = elements.popLast(), remaining > 0 {
        remaining -= 1
        let role = attribute(element, kAXRoleAttribute) as? String ?? ""
        let names = [kAXTitleAttribute, kAXDescriptionAttribute, kAXHelpAttribute]
        if roles.contains(role), names.contains(where: { attribute(element, $0) as? String == "Auto Tune" }) {
            return element
        }
        elements.append(contentsOf: (attribute(element, kAXChildrenAttribute) as? [AXUIElement]) ?? [])
    }
    return nil
}

func waitFor<T>(_ message: String, _ check: () -> T?) -> T {
    let deadline = Date().addingTimeInterval(25)
    repeat {
        if let result = check() { return result }
        Thread.sleep(forTimeInterval: 0.25)
    } while Date() < deadline
    fatalError(message)
}

func press(_ element: AXUIElement) {
    guard AXUIElementPerformAction(element, kAXPressAction as CFString) == .success else {
        fatalError("Unable to press the Auto Tune control")
    }
}

func calibration() -> String? {
    guard let data = try? Data(contentsOf: settings),
          let value = try? JSONDecoder().decode([String: String].self, from: data) else {
        return nil
    }
    return value[calibrationKey]
}

guard calibration() == "false" else { fatalError("The isolated profile must start with Auto Tune disabled") }
let composerRoles: Set<String> = ["AXButton", "AXDisclosureTriangle"]
let button = waitFor("The Auto Tune button did not render") { autoTuneControl(with: composerRoles) }
press(button)
let switchRoles: Set<String> = ["AXCheckBox", "AXSwitch", "AXToggleButton"]
press(waitFor("The Auto Tune dashboard did not open") { autoTuneControl(with: switchRoles) })
let _: Bool = waitFor("Auto Tune did not enable native calibration") { calibration() == "true" ? true : nil }
let _: AXUIElement = waitFor("The Auto Tune switch did not finish enabling") {
    guard let element = autoTuneControl(with: switchRoles),
          (attribute(element, kAXEnabledAttribute) as? NSNumber)?.boolValue == true,
          (attribute(element, kAXValueAttribute) as? NSNumber)?.boolValue == true else {
        return nil
    }
    return element
}
// Closing an active Auto Tune panel disables calibration through the native command.
press(waitFor("The Auto Tune composer button disappeared") { autoTuneControl(with: composerRoles) })
let _: Bool = waitFor("Auto Tune did not restore native calibration") { calibration() == "false" ? true : nil }
print("{\"buttonRendered\":true,\"dashboardOpened\":true,\"nativeToggleVerified\":true,\"initialStateRestored\":true}")
