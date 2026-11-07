# fix(release): validate Windows x64 and refresh the portable test lock

The signed Windows x64 1.0.1 candidate is now retained in the private draft. Pin its exact archive and installer/signature assets for transfer and isolated native validation. The portable build independently reached its standalone vector-db test, then failed because that plugin's Cargo.lock still described pre-migration dependencies while CI requires --locked. Refresh that standalone lock against its existing manifest and preserve compiled dependency caches even when a later validation step fails.

Validation:
- Windows build 42341613182 succeeded; archive SHA-256 af0ee01fc48b39d5a497230dbcca52d14eeb7466b0075704ba56f6947bd0ab91 verified locally. Publication prerequisite/signature checks and all nine migration fixtures passed.
- Private staging 42357610123 passed. Installer asset 720164448 and signature 720165415 match reviewed hashes and sizes.
- Native validation 42357929006 passed: real initial installation, valid updater signature, tampered payload rejection, same-version suppression and synthetic 0.9.9→1.0.1 replacement; 106 runtime files and a synthetic profile sentinel remained intact. The app process survived 15 seconds before/after. This is not production UI interaction or an upgrade between two public releases.
- Portable failure 42349570759 / job 128334674884 reproduces the stale-lock error after its application compiled. Cargo metadata --locked --format-version 1 passes with the refreshed lock in an isolated local manifest copy. Actual standalone plugin tests and final portable packaging/signing still require CI.

Follow-up to #42; Web work remains separate in #43. No package bytes or public updater feeds are changed here. Existing 1.0.0 installations and data are untouched. The portable dependency lock does not alter the source of the retained Windows installer; its compilation commit stays pinned explicitly. Desktop publication still awaits the complete platform feed and final public checks.

Mac build 42341689234 has now succeeded on both architectures. Both retained archives were downloaded and checked against GitHub archive digests and their internal checksums; each candidate passed the publication prerequisite/updater-signature and nine migration checks. Add the exact two staging descriptors for the existing private macOS draft 437481941. Private transfers and installed native updater validations remain pending; no public feed is changed. Merge the independently published prompt guide from #45 while retaining this PR description.

Both macOS private staging workflows (42361579716 and 42361581501) passed. Pin their uploaded bundle and signature IDs for native installed updater validation. Dispatch the complete Desktop matrix to check all five reviewed platform candidates together; Windows and Linux earlier proofs remain retained separately. Public Desktop feeds still remain on 1.0.0 until final publication checks.
