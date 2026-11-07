# fix(web): keep first-time visitors in the chat workspace

On a fresh browser origin, the home route checked provider readiness before browser providers were initialized and redirected visitors into settings. Keep the experimental browser home visible while its local catalog initializes. The model remains an explicit download through the existing load button; native setup behavior is preserved.

Validation: production browser build and a fresh-origin browser check. This follows #53 and changes only the browser home guard; no runtime, native binary or model weights change.
