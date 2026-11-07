# chore(release): pin the reviewed Windows x64 1.0.1 candidate

The signed Windows x64 build has completed. Pin its exact GitHub artifact archive and reviewed installer/signature hashes so CI can transfer the retained bytes directly into the existing private 1.0.1 draft.

Validation: compilation run 42341613182 succeeded; its 3,706,837,835-byte archive matches GitHub SHA-256 af0ee01fc48b39d5a497230dbcca52d14eeb7466b0075704ba56f6947bd0ab91. Local publication prerequisite/signature checks passed; all nine migration fixtures passed with no failures or ignored tests. The installer is 826,733,127 bytes. This descriptor changes neither package bytes nor public updater feeds.

Follow-up to #42. Native installed replacement validation must use the asset IDs returned by staging; it is still pending. A synthetic earlier-version probe does not establish the maintainer's real installed 1.0.0 upgrade. No publication is authorized by this descriptor. The separate Web preparation remains in #43.

Private staging run 42357610123 passed. Installer asset 720164448 and signature 720165415 match the reviewed sizes and hashes. Pin their IDs and the retained runtime executable hash for isolated Windows installation/signature/tamper/synthetic replacement tests. These native results remain pending; no public feed changes.
