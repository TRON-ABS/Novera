# fix(release): use published asset tags in verification

The public verification descriptor accidentally retained GitHub draft `untagged-*` download URLs for Windows x64, Linux and macOS assets. The updater manifest already uses the correct canonical version tags. Replace only the descriptor URLs with their final published tags; preserve every reviewed byte count and hash.

The failed run 42363980517 correctly rejected these URLs before downloading unreviewed locations. Local URL validation now accepts all 20 descriptor records and the existing eight signed channels. Repeat anonymous verification against the corrected descriptor. Record the draft-URL trap in the release lessons. This changes verification metadata, not application binaries or the published updater feed.
