# Novera privacy and project overview

Novera is a free, independent open-source project maintained by Jean-Marc Sachet (TRON-ABS, France). It builds on Jan by Menlo Research and its contributors and retains the [Apache 2.0 license](../LICENSE) and upstream attribution. Novera publishes its own [releases and updates](https://github.com/TRON-ABS/Novera/releases), offers an Android build, and combines text, image, music and video workflows in one dashboard. Available features depend on the platform, model and hardware. Optional third-party APIs may charge separately.

## Data and privacy

- **Local use.** With a local model, inference runs on your device. Conversations and working files are stored in the local profile, and local inference does not send them to a cloud model provider. Cloud providers and external tools receive the data needed for the requests you choose to make. Catalog queries and model or component downloads contact their respective hosts. Network services can see connection metadata such as your IP address.
- **Optional telemetry.** Usage statistics and error reports are off by default and require separate consent in Settings → Privacy. If enabled, usage statistics send a startup event, app version, operating system and a fresh random event ID. Error reports send filtered technical diagnostics such as build and platform information, controlled error codes and application stack locations. These collectors exclude prompts, conversations, attachments and API keys. The destination configured for the build is shown in Settings → Privacy. Advanced agent OpenTelemetry export is separate and can include prompt text or tool details if explicitly configured to do so.
- **Updates.** Supported builds may check for updates automatically or on request, independently of telemetry settings. Checks contact the official GitHub release channel for an update manifest and send standard connection metadata and information required by the update protocol. Installing an update downloads the relevant package. The updater does not send conversation content.

See the [detailed data and privacy documentation in French](DONNEES_ET_CONFIDENTIALITE.md).

## Security reporting

Report vulnerabilities privately to [contact.novera.tronabs@gmail.com](mailto:contact.novera.tronabs@gmail.com). Include the affected version and platform and a minimal reproduction, with credentials and private data removed. See the [security reporting policy](../SECURITY.md).
