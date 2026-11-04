# docs(privacy): disclose external connections and restore full Apache license

Annuaire Agents deferred Novera's listing because readers could not find a focused explanation of data leaving the device during local-model use, and GitHub classified the abbreviated LICENSE as Other. Publish a French data disclosure linked from the English/French READMEs and user guide. Explain independent analytics/error-report consent, filtered fields, build-dependent updates, downloads, external tools, agent OpenTelemetry and server-side retention limitations. Replace the abbreviated LICENSE with the unmodified official Apache 2.0 text and preserve the complete previous attribution in NOTICE.

Reproduction: open the previous root LICENSE (an attribution and short license notice only), then look for a focused data disclosure from either source README. After this change, the full license and the disclosure are directly linked. This does not change runtime behavior or existing release binaries.

Validation: `python .tmp/email-followup-2026-11-04/validate.py` checks every relative Markdown link in the new page, README/guide links, exact equality of LICENSE with the downloaded official Apache text, and preservation of the old LICENSE in NOTICE. Scoped `git diff --check` checks formatting. No runtime tests or new builds are required for this documentation change. Results are recorded after execution; no CI or editorial acceptance is implied.

Based on public main 734c86d74. Main and open PRs were checked before implementation: the only open PR is #22 (iOS window/simulator work), with no file overlap or merge dependency. Existing unrelated working-copy changes are excluded. The local campaign register records this email follow-up separately; the wider submission campaign remains paused.

Local results: disclosure validation PASS (17 links), exact license text and attribution preservation PASS; scoped git diff --check PASS.
