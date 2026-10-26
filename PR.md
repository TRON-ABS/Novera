# fix(sharing): prevent Windows flyout hangs and copy files outside the UI thread

The first Windows WinRT adapter opened the share sheet and displayed the image, but targets and Close were unusable. Windows recorded an application hang for Novera at 17:43 on October 26; its residual share host was closed separately without restarting Explorer. A small separate diagnostic also had share-sheet interaction problems. The exact OS/interop cause has not been isolated, and the sheet is not claimed repaired.

Temporarily disable native Windows system sharing in both the frontend and command boundary, preventing old callers from entering the hanging route. Remove the WinRT file lookup/event-handler/clipboard path. Keep file-based sharing through Copy file and Save, highlighting Copy file on Windows. Copy fully materialized Unicode CF_HDROP data on a blocking worker using a valid owner HWND; transfer movable-memory ownership only after SetClipboardData succeeds, close the clipboard through a guard, and bound retries for clipboard contention. Other platform adapters are unchanged. Hosted links remain deferred.

Reproduction: Prepare a PNG → system share → targets/close stop responding. After this mitigation the Windows system action is disabled before IPC and the native command fails fast; Copy file, Save and Close remain available. Native file-copy data contains an actual path rather than delayed WinRT rendering.

Validation: twenty targeted Vitest tests across three files with TAURI_ENV_PLATFORM=windows; an isolated exact-source Rust regression test uses DragQueryFileW to decode Unicode and UNC file-drop blocks; cargo check --lib on Windows; TypeScript. No new Novera binary or completed messaging handoff is claimed. A full application run with the new clipboard adapter remains to be exercised; target-app paste support varies. No Windows security/privacy setting was changed, no message was sent, and no issue closure or additional unmerged prerequisite is claimed. References: Microsoft standard clipboard formats and SetClipboardData ownership rules.

- https://learn.microsoft.com/en-us/windows/win32/dataxchg/standard-clipboard-formats
- https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-setclipboarddata
