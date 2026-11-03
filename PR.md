# fix(ios): create the mobile window and add nonvisual simulator checks

The iOS configuration did not create a main WebView, the same startup configuration defect previously fixed on Android. Create the mobile window explicitly without Desktop width constraints, and use the native iOS clipboard writer with a bounded UTF-8 payload and acknowledgement after the main-thread write. Shared Desktop palette, theme controls and responsive settings remain the source for both mobile platforms.

Add target=ios-tests to the distribution workflow. Build only the ARM64 simulator app, then install/launch/reinstall it on two owned iPhone simulator models, preserving synthetic container data. Validate simulator Mach-O identity so a device or Desktop binary cannot be mislabeled. No screenshots, pixel comparisons, WebDriver, visual checks or real-phone claims. Simulator UUIDs are exact and cleanup is limited to devices created by the job.

Local validation: 140 selected frontend/sharing tests passed; 12 platform cases skipped. Two source contract tests cover mobile window creation and shared palette/responsive navigation. Three Python tests validate simulator identity, corrupt load commands and exact UUID requirements. Bash/workflow parsing and actionlint passed. Native Swift/Rust compilation and simulator execution are pending CI.

Depends on PR #21; merge Mac workflow changes first, then this PR, avoiding an overlapping workflow overwrite. The maintainer explicitly requests official releases, both test batteries, matching Desktop/mobile appearance and showcase/Markdown updates, with visual checks deferred. Mac direct distribution may be official with Novera updater signatures and disclosed lack of Apple notarization. iPhone distribution still needs Apple signing/provisioning and a distribution channel; the maintainer confirms no Apple Developer account yet. No simulator is presented as installable on an iPhone.

See docs/IOS_HEADLESS_VALIDATION.md. Existing public releases and update feeds remain unchanged by this PR.

Mobile follow-up: retain the APK responsive settings navigation and stacked log buttons. Open application logs in an in-WebView mobile dialog instead of the unsupported Desktop auxiliary window, wrap long messages, and include General settings tests in the iOS battery. The two targeted settings suites pass locally: 31 tests, including Android/iOS log reads and menu selection. Real screen layout remains unverified.

Keyboard regression: retain mobile blur after sending and suppress automatic composer focus on thread/status changes. Parameterize the existing reasoning/streaming regression for Android and iOS, including explicit user focus afterward, and run ChatInput tests in the iOS battery. This checks focus behavior in the DOM; the native keyboard appearance still requires device verification.
