# fix(web): record the public release and follow shared version facts

Novera Web 1.0.1 is deployed at `/Novera/web/` from commit 9ec7c5efea4ae669af74082466588399e397970d. Record the successful deployment, 757 public file hash comparisons, actual short text generation and conversation persistence after reload. Preserve the experimental media, Wan, audit and Pages cache limitations; no full upgrade or Desktop performance parity is claimed.

Remove hardcoded 1.0.1 values from Web staging and showcase/README publishing so the next coordinated release follows the application version and shared release facts. README generation remains idempotent.

Validation: ten distribution/publication tests pass. The deployed code is unchanged by this documentation/staging follow-up; the public runtime remains the exact verified #53/#54 build. The real six-GiB image timeout is recorded as a failed test, with no claimed speed improvement.

## Web 1.0.1 music update

The local music worker previously copied the composite model and waited for each planner weight read before uploading it. The Web release now selects 64 MiB windows, planner read-ahead, direct GPU head copies, DiT file-ordered reads and exact sampling exponential reuse. The release version stays at 1.0.1. This PR builds the Pages candidate in CI and keeps deployment on a separate workflow dispatch after merge.

The existing image kernel profile and pinned text SDKs are part of the same Pages build. The four runtime packaging tests passed locally. Combined-model inference and public deployment are verified separately.

The same update makes MP3 320 kb/s the default for new local Web songs. The existing sharing and download flows use the stored MP3. WAV 32-bit remains selectable for exact-reference checks.
