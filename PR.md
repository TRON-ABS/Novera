# chore(release): pin the reviewed Linux 1.0.1 package and scoped native validation

Linux build 42345624586 now completes successfully after retry. Its retained archive and final AppImage match their checksums, the updater signature verifies against the pinned Novera key, and all recorded migration fixtures pass. Pin the exact successful artifact and signed AppImage bytes for direct transfer into the existing private 1.0.1 draft.

Add explicit Linux-only and Mac-only installed-update targets so a ready platform can be tested without substituting older assets or failing unrelated platforms that are still compiling. These targets use the existing current-version descriptor guards and disposable native installation probe.

Validation: local signed publication prerequisites pass for the reviewed Linux artifact. Direct GitHub transfer run 42350864441 succeeds; the private draft asset IDs, sizes and hashes match the reviewed package. Pin those exact assets in the installed-update descriptor. Source contracts/actionlint run before merge; native installation validation is tracked separately. No Linux public download or global 1.0.1 Desktop feed is claimed yet.

Depends on merged #35–#41. This delivery-only change does not alter the application packages already compiling. The separate Web preparation remains outside this PR.
