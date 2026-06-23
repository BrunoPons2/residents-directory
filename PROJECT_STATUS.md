# Residents Directory Project Status

Last updated: 2026-06-23 19:52 +10:00

This file is the short handover status for ChatGPT and Codex. `PROJECT_CONTEXT.md` remains the longer standing project context and rules file.

## Latest Confirmed Repository State

- Repository: `BrunoPons2/residents-directory`
- Default branch: `main`
- Existing long-form shared context file: `PROJECT_CONTEXT.md`
- Latest confirmed recent data commit before this status file was created: `73307592d897909bedd92e0a1968ef1774455f9c` with message `Update residents PWA data 2026-06-07 17:38`.
- `PROJECT_STATUS.md` was created on GitHub on 2026-06-07 so both ChatGPT and Codex have a short status file to read.
- Latest context correction pushed: `cb1c5ac` with message `Correct project context user panel wording`.

## Recent GitHub Data Notes

- `data/residents.csv` was updated in the latest confirmed data commit.
- The main visible change was adding many resident photo paths in the CSV, using:
  - `photos/thumb/<resident-slug>.jpg`
  - `photos/profile/<resident-slug>.jpg`
- Examples of newly linked photo rows include residents such as Peter Melhuish, Phillip Bird, Di Bird, Rob Wallace, Ruth Wallace, Heather Taylor, Lisa Pryor, Owen Cross, Robyn Annis-Brown, Robert Olsen, Margaret Olsen, Walter Tink, Peter Stone, Kay Stone, Jenny Verity, Rhonda Harris, Keith Harris, Rod Moore, Lee Moore, Melinda Hope, Chris Hope, and Shirley Truong.
- 47 Autumn Ave clarification from Bruno on 2026-06-07: Raewyn Graham has left/gone. Her removal from the CSV is intentional, not an error. Jaynette Coleman appearing at 47 Autumn Ave / ResidentID 95 is accepted as the current data state unless the master workbook later shows otherwise.

## Latest Codex Workbook Checkpoint

The latest workbook/photo workflow upgrades have been installed into:

- `D:\Bruno\Documents\App Projects\Residents Directory\Master Natura Residents Directory V2.0.xlsm`

V1 preservation:

- Original source retained unchanged: `D:\Bruno\Documents\App Projects\Residents Directory\Master Natura Residents Directory.xlsm`
- Immutable V1 snapshot: `D:\Bruno\Documents\App Projects\Residents Directory\Workbook_BACKUPS\Versioned Releases\Master Natura Residents Directory V1.0 - Final 2026-06-23_17-47-48.xlsm`
- Source/V1 SHA-256: `4F88CFDB4D8F3678A1BFE2FC8B508435057AD0A1FD8A244C5D3C3A2FB3964B5F`

Excel was closed and no workbook lock file was visible during the final Codex check on 2026-06-09.

Latest pre-install workbook backup recorded:

- `D:\Bruno\Documents\App Projects\Residents Directory\Workbook_BACKUPS\Master Natura Residents Directory - pre-portable-project-relocation 9-06-2026_8-41-15_PM.xlsm`

## What Changed In The Workbook

### Consolidated Photo Workflow V2.0

- Added `modPhotoWorkflowV2`, a resumable state-machine controller for the complete photo workflow.
- Replaced the normal 14-step panel sequence with four controls on both Admin and User panels:
  - `Process / Resume New Resident Photos`
  - `Open Current Batch Review`
  - `View Last Workflow Report`
  - `Reset Photo Workflow Session`
- Added Admin-only `Show / Hide Legacy Recovery Controls`; the original macros remain installed but hidden during normal operation.
- Added permanent VeryHidden/protected sheets:
  - `PHOTO_INTAKE_LOG`
  - `PHOTO_BATCH_LOG`
- Added SHA-256 intake tracking, verified immutable batch snapshots, verified transient staging backup/cleanup, resumable checkpoints, and final Git commit recording.
- The safe intake folder is `Photos\New Residents Photos collection - safe copy` and is never cleaned or changed by V2.
- `All Residents Photos on GitHub` is now the canonical originals collection. The legacy `PhotosCurrentGitHubMirrorFolder` setting points to the All folder.
- Name matches continue automatically when exact. Uncertain matches pause at `Photo Staging Review`.
- Thumb/profile replacements continue automatically when no conflict or when output is unchanged. Material replacements pause for `Keep New` or `Keep Old`; `Later` keeps the batch paused.
- Publication validates output files, refreshes Residents photo availability, rebuilds `PWA_EXPORT`, exports a line-count-verified UTF-8 CSV, stages only expected data/photo paths, commits, pushes, and records the commit SHA.
- Git preflight requires a clean working tree and records `origin/main`. Publication stops if origin moves or unexpected files appear.
- APP_SETTINGS startup visibility was corrected for protected workbook structure.
- Admin/User sheet protection now consistently uses password `natura`.
- Startup was optimized by supplying the correct password during Admin unprotect and avoiding the old User unhide/protect/rehide-all-sheets pass.

### Portable Project Location

- Kept one active settings sheet: `APP_SETTINGS`.
- Added a startup relocation flow so the workbook can detect when it has been copied to another project folder.
- Added records for:
  - `LastKnownWorkbookFolder`
  - `LastRelocatedAt`
  - `LastRelocatedBy`
  - relocation from/to details
- Local project paths are regenerated from the workbook's actual folder instead of staying fixed to Bruno's original `D:\Bruno\Documents\App Projects\Residents Directory` path.
- Added a relative-path checklist before accepting a relocated folder.
- Critical missing items block the choice and tell the user to choose the correct project folder/path and contact the administrator on `0422 906 105`, signed `Bruno Pons @ 35 Autumn Ave.`
- Missing working folders can be created after confirmation.
- Existing control-panel buttons are rebound after relocation.
- Startup performance was repaired on 2026-06-09. Normal workbook open now checks whether `APP_SETTINGS` already matches the workbook's current folder and skips the heavy portable path regeneration/button rebind when everything is current. Full path regeneration still runs after relocation, missing/stale settings, or the `Set Project Location` workflow.
- Admin control-panel layout was coded from Bruno's manually adjusted trial layout on 2026-06-09. The current User control-panel layout was also coded for preservation. The installer and portable button repair now preserve both layouts. The reset button caption is now `Reset Tick Buttons`; the Residents button caption on both Admin and User panels is now `Open Residents Sheet & edit/update Records`.
- `Reset Tick Buttons` was corrected on 2026-06-23. It now performs the Photo Workflow, Admin, and User tick resets first, then displays one final informational completion message. The old preliminary Yes/No confirmation was removed.

### Photo Workflow

- Step 1 now starts with a real clean slate:
  - Copy/update root staged original image files into `All Residents Photos on GitHub` before cleanup.
  - Verify each root staged original by filename and file size in the All Residents Photos folder.
  - Back up staged photo image files first.
  - Verify copied image count matches staged image count.
  - Clear only backed-up staged image files from `New Residents Photos for GitHub` and its `STANDARDISED` subfolder.
  - Report skipped/non-image files separately.
  - Clean generated/review worksheets.
  - Run Photo Workflow Preflight after cleanup.
- The folders themselves are not deleted.
- `STANDARDISED` images are backed up/cleared but are not copied into `All Residents Photos on GitHub`.
- Generated/review worksheet cleanup includes `STANDARDISED`.
- The folder naming was updated: use `All Residents Photos on GitHub`; prior current/currant wording is obsolete.
- Step 8 is now `Backup Staged Photos`.
- Step 9 now archives confirmed staged photos and copies confirmed originals into `All Residents Photos on GitHub`.
- Step 10 is now `Create Standardised Copies`.
- Numbered Photo Workflow prompt/message-box title bars now start with `Step X -`.
- Successful numbered Photo Workflow steps now add a green tick to the matching Admin and User control-panel buttons.
- Step 1 resets the workflow tick marks for a fresh run.
- Photo Workflow completion progress is stored in `APP_SETTINGS` and refreshed when the workbook opens.

### Step 3 / Step 4 Cropping And Review

- Step 3 button caption on both control panels is now:
  - `3 Confirm Cropping + Check Names`
- Admin and User panels include a "Before Step 3" reminder between Step 2 and Step 3.
- The separate optional root staging-folder buttons were removed on 2026-06-23 because they only opened Explorer and duplicated Step 3 behaviour.
- The reminder text is refreshed from `PhotosStagingFolder` in `APP_SETTINGS`, so relocated User workbooks show their own staging path.
- The reminder tells the operator to load/copy new resident photos into the root `New Residents Photos for GitHub` staging folder and to leave `STANDARDISED` empty for Step 10.
- Step 3 now asks whether all new resident photos have been copied into staging, properly cropped, face-centred, and saved.
- Step 3 blocks if no staged image files are present before the crop confirmation.
- Step 3 also blocks if the staged image count becomes zero after a manual review pause.
- If the operator answers Yes, Step 3 records the confirmation and runs the staged-photo name check.
- If the operator answers No, Step 3 opens the staged photo folder in a maximised Explorer window using Extra Large Icons, then waits for the operator to continue.
- Step 3 records crop confirmation details in `APP_SETTINGS`.
- Step 4 button caption on both control panels is now:
  - `4 Review Photo Staging Sheet`
- Step 4 opens/formats the `Photo Staging Review` sheet.
- Rows where `MatchType` is not `Exact` are moved to the top and highlighted yellow.
- Ambiguous resident matches now include Resident ID in the possible-match notes, so duplicate names are clearer.

## Current Photo Batch Notes

The current staged batch has 26 photos restored from:

- `D:\Bruno\Documents\App Projects\Residents Directory\Photos\New Residents Photos for GitHub - Copy`

Known manual review items from Bruno's observation:

- `Walter Wood.jpg` should be matched/renamed to `Walter Tink`.
- `Meg Olsen.jpg` should be matched/renamed to `Margaret Olsen`.
- `Mel Hope.jpg` should be matched/renamed to `Melinda Hope`.
- `Shirley Truong` is ambiguous because there are two active residents with the same name. The correct Resident ID must be selected.

## Files Edited Or Affected

### Installed Into Workbook

- `D:\Bruno\Documents\App Projects\Residents Directory\Master Natura Residents Directory.xlsm`

Key VBA areas installed or updated:

- `ThisWorkbook`
- `modProjectRelocation`
- `modAppSettings`
- `modCheckStagedPhotoNames`
- `modWorkbookLogin`
- `modCurrentGitHubPhotos`
- `modWorkbookCleanup`
- `modPhotoWorkflowProgress`
- `modPhotoWorkflowPreflight`
- `modPhotoWorkflowContinue`
- related existing workflow modules imported during the installer run

### Codex Working Files

- `C:\Users\bpons\Documents\Codex\2026-06-04\photo-workflow\work\install_portable_project_relocation.vbs`
- `C:\Users\bpons\Documents\Codex\2026-06-04\photo-workflow\work\export_current_workbook_state.vbs`
- `C:\Users\bpons\Documents\Codex\2026-06-04\photo-workflow\work\smoke_test_portable_relocation.vbs`
- `C:\Users\bpons\Documents\Codex\2026-06-04\photo-workflow\work\verify_step3_staging_checkpoint.vbs`
- `C:\Users\bpons\Documents\Codex\2026-06-04\photo-workflow\work\verify_xlsm_package_20260609_1415\`
- `C:\Users\bpons\Documents\Codex\2026-06-04\photo-workflow\work\current-vba-export\`

### GitHub Repo Status

- `PROJECT_STATUS.md` contains both the GitHub handover notes and the Codex workbook/photo workflow checkpoint.
- `PROJECT_CONTEXT.md` has been updated and pushed. It now uses the original control-panel names `Admin` and `User`.
- This status update is local until Bruno explicitly approves a commit/push.

### Workbook Backup

Latest pre-install backup recorded:

- `D:\Bruno\Documents\App Projects\Residents Directory\Workbook_BACKUPS\Master Natura Residents Directory - pre-remove-optional-staging-buttons 23-06-2026_4-57-48_PM.xlsm`

## Tests And Checks Done

### ChatGPT/GitHub Review

- Checked the GitHub repository `BrunoPons2/residents-directory`.
- Confirmed there were no recent pull requests visible from the connected GitHub account.
- Confirmed `PROJECT_CONTEXT.md` exists and contains the main standing rules and recent project notes.
- Checked the latest visible recent commit and inspected the `data/residents.csv` diff.
- Checked the current CSV area around 47 Autumn Ave after noticing a potentially important row change.
- Bruno confirmed Raewyn Graham has left/gone, so the 47 Autumn Ave change should not be treated as suspicious.

### Codex Workbook/Photo Workflow Checks

- Created V1 and V2 from the 2026-06-23 source workbook and verified the V1 snapshot is byte-for-byte identical to the source.
- Imported and executed `InitialisePhotoWorkflowV2`; the VBA project compiled sufficiently to run the initializer successfully.
- Verified `modPhotoWorkflowV2` is installed with 2,846 code lines and `modProjectRelocation` contains the V2 portable path changes.
- Verified V2 workbook structure, `PHOTO_INTAKE_LOG`, `PHOTO_BATCH_LOG`, Admin panel, and User panel are protected in the saved workbook.
- Verified the intake and batch logs are VeryHidden.
- Verified both control panels point to the V2 process/review/report/reset macros and legacy numbered controls are hidden.
- Verified Sharyn Colquhoun is recorded as `MIGRATED_EXISTING` with SHA-256 `5503F9BD26192BB016DA5BB72278BE65F4FD4DFEC4682E499C8EBFA85B6BAEA5`.
- Verified V2 installation did not remove or change `Sharyn Colquhoun.jpg` in the safe collection.
- Normal macro-enabled Admin startup passed in about 6.6 seconds with `ADMIN_CONTROL_PANEL` active and V2 controls intact.
- User-mode verification passed in about 5.6 seconds:
  - workbook structure protected
  - Residents protected
  - Residents A3/F3 locked
  - Residents B3:E3 editable
  - Admin panel, APP_SETTINGS, intake log, and batch log VeryHidden
  - User panel visible and protected
- No actual photo batch, CSV replacement, Git commit, or Git push was run during implementation testing.

- Exported the current workbook VBA/state using `export_current_workbook_state.vbs`.
- Ran `smoke_test_portable_relocation.vbs`.
- Portable relocation smoke test passed.
- Ran a non-destructive Step 1 All Residents Photos mirror safety test: 26 root staged originals found, 0 copied/updated, 26 already present with the same size, 26 verified, 0 non-image files skipped.
- Verified the repaired login bypass opens to `ADMIN_CONTROL_PANEL` when `BypassWorkbookLoginToAdmin=Yes`.
- Verified the Photo Workflow progress helper updates matching Admin/User button captions.
- Verified the green tick character stored on button captions is Unicode character code 9989.
- Installed the Step 3 staging reminder controls into the workbook and confirmed both Admin and User reminder text boxes are present.
- Confirmed the saved reminder text contains `Before Step 3` and the `New Residents Photos for GitHub` staging folder wording.
- Confirmed saved control positions moved Step 3 below Step 2 on both Admin and User panels.
- Confirmed the GitHub repo working tree had `PROJECT_CONTEXT.md` modified before this status update.
- Installed the startup fast-path repair and confirmed saved `APP_SETTINGS` values match the live workbook folder, including `LastKnownWorkbookFolder`, `WorkbookFolder`, `WorkingDirectory`, `ThisWorkbookFullName`, `PhotosStagingFolder`, `PhotosCurrentGitHubMirrorFolder`, `GitHubRepoFolder`, `PhotosThumbPath`, and `PhotosProfilePath`.
- Confirmed the saved workbook package still contains 72 tracked control-panel button assignments and 2 direct reset-button assignments after the startup repair.
- Installed the coded Admin control-panel trial layout and caption changes. Verified saved captions for Admin/User reset buttons and Admin/User Residents buttons. Verified the saved workbook package still contains 72 tracked control-panel button assignments and 2 direct reset-button assignments.
- Installed the User control-panel layout preservation pass. Verified key User panel captions/positions, including `Reset Tick Buttons`, `Open Residents Sheet & edit/update Records`, the Step 3 reminder, Step 14, and `Administrator Login`. Excel may round some Form Control positions slightly when saving.
- Installed and verified the `Reset Tick Buttons` message-order correction. Live VBA inspection confirmed all reset calls occur before the success message and the old pre-reset prompt is absent. Backup: `D:\Bruno\Documents\App Projects\Residents Directory\Workbook_BACKUPS\Master Natura Residents Directory - pre-reset-tick-message-order 23-06-2026_4-40-07_PM.xlsm`.
- Removed the optional root staging-folder buttons from both control panels and removed their portable repair/layout references. Verified both reminders remain, both Step 3 buttons still target the correct crop/name-check routines, and the removed buttons cannot be recreated by portable repair. Backup: `D:\Bruno\Documents\App Projects\Residents Directory\Workbook_BACKUPS\Master Natura Residents Directory - pre-remove-optional-staging-buttons 23-06-2026_4-57-48_PM.xlsm`.

## Problems Or Items Needing Verification

- Keep closing the workbook before Codex installs or tests workbook changes.
- The real V2 end-to-end photo batch still needs operator testing from Excel.
- The repo currently has local modifications to `PROJECT_CONTEXT.md` and `PROJECT_STATUS.md`. V2 correctly treats this as a dirty working tree and will block photo publication until the documentation changes are committed/pushed or reconciled.
- The latest Step 1 safety cleanup, progress-tick changes, Step 3 staging checkpoint, all-button tick tracker, and startup fast path should be tested by Bruno from Excel in the normal operator flow.
- Excel COM macro-level verification for the new Step 3 checkpoint hung twice; hidden verifier processes were stopped and no workbook lock file remained afterward. Package-level workbook verification passed.
- The duplicate `Shirley Truong` match requires a manual choice of the correct Resident ID whenever both active records are possible matches.
- The User-side relocation flow should still be tested on the other user's computer with the copied project folder.
- I did not verify that every referenced image file physically exists in both `photos/thumb` and `photos/profile`.
- Treat the master workbook `Master Natura Residents Directory.xlsm` as the source of truth for resident records and photo availability.

## Next Recommended Step

1. Review and commit/push the pending `PROJECT_CONTEXT.md` and `PROJECT_STATUS.md` changes so the Git working tree is clean.
2. Open `Master Natura Residents Directory V2.0.xlsm`.
3. Visually confirm the four V2 photo controls on both control panels.
4. Put one genuinely new, cropped test photo in `Photos\New Residents Photos collection - safe copy`.
5. Click `Process / Resume New Resident Photos`.
6. Confirm exact matches continue automatically and an uncertain name pauses on the yellow review row.
7. If a replacement conflict is created, choose `Keep New` or `Keep Old`, then click Resume.
8. Confirm the final report shows the processed/skipped counts and Git commit SHA.
9. Verify the app shows the correct resident details and photo after GitHub deployment.
10. Keep the V1 snapshot unchanged until at least one complete V2 batch has passed.
