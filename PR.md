# fix(ci): retry transient WebKit screenshot disconnects with a bounded wait

Linux run 42345624586 builds and signs the 1.0.1 AppImage, reaches the real update-check button and observes the expected production-feed result. Its first WebDriver screenshot resets the connection; the exception diagnostic then successfully reads the same session and captures an image. The run correctly remains failed.

Use the existing bounded observation retry for the normal screenshot call. A successful test still requires a real screenshot, the expected DOM result and the existing feed checks; persistent connection failures remain errors. This changes CI observation only, without changing the AppImage bytes.

Validation: five Linux UI guard tests pass, including transient RemoteDisconnected recovery and timeout on persistent disconnection. The unchanged native Linux job is already relaunched; actual native CI completion is tracked separately. Update the release memo and status with the verified partial Android, ARM64 and CLI publications, while explicitly retaining the 1.0.0 global feed.

Depends on merged #35/#39; no overlap with application behavior or signing identity. No successful Linux native run or Desktop x64 publication is claimed by this PR.
