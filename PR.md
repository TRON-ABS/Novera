# docs(status): record working Windows sharing and local cleanup

The maintainer confirmed that Windows sharing now works on their PC after restoration. Update the English/French project pages, user guide and status records with this user report, without claiming coverage of every messaging app or other platform. Retain the earlier source-test evidence and incident history.

Record the completed local cleanup: two old build/test caches removed, 31.1 GB of actual free space recovered and 120.2 GB free on C: at the final measurement. The running application, models, Python environments, source and Release cache were preserved. Future debug tests will rebuild their cache. No cleanup script, local path inventory, temporary artifact or binary is included in this documentation change.

Validation: compare the six selected Markdown files against the published main branch, check whitespace and publication scope, and verify the published blob IDs. Existing runtime/source checks are historical evidence, not tests rerun for this documentation-only update. No new application binary or public release is produced. This update depends only on main and closes no issue.
