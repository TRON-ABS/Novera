# test(cli): verify the original public updater migration to 1.0.1

Compatibility packages have passed signed-byte checks and real native 1.0.1 execution on Windows, Linux and macOS (run 42414860602). Add a separate, opt-in post-publication check for the actual original Windows/Linux 1.0.0 updater.

Download and authenticate both public versions, launch the exact original executable in a disposable native profile, verify the production offer, perform its real signed replacement, compare the installed executable byte-for-byte, preserve a profile sentinel and check the canonical channel after migration. No installed user application is touched; tokens and signing secrets are removed from the child environment. The check refuses to run outside a disposable GitHub-hosted runner.

Validation: Python syntax compilation and diff checks pass. Actual native migration is intentionally pending publication of the authenticated format-1 archives and will be run through the new workflow input. Related: #48; the current canonical CLI release remains unchanged.
