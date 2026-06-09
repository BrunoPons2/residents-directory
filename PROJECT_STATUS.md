# Residents Directory Project Status

Last updated: 2026-06-09 20:43 +10:00

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

- `D:\Bruno\Documents\App Projects\Residents Directory\Master Natura Residents Directory.xlsm`

Excel was closed and no workbook lock file was visible during the final Codex check on 2026-06-09.

Latest pre-install workbook backup recorded:

- `D:\Bruno\Documents\App Projects\Residents Directory\Workbook_BACKUPS\Master Natura Residents Directory - pre-portable-project-relocation 9-06-2026_8-41-15_PM.xlsm`

## What Changed In The Workbook

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
- Admin and User panels now include a "Before Step 3" reminder plus an `Open Staging Folder` button between Step 2 and Step 3.
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

- `D:\Bruno\Documents\App Projects\Residents Directory\Workbook_BACKUPS\Master Natura Residents Directory - pre-portable-project-relocation 9-06-2026_2-07-51_PM.xlsm`

## Tests And Checks Done

### ChatGPT/GitHub Review

- Checked the GitHub repository `BrunoPons2/residents-directory`.
- Confirmed there were no recent pull requests visible from the connected GitHub account.
- Confirmed `PROJECT_CONTEXT.md` exists and contains the main standing rules and recent project notes.
- Checked the latest visible recent commit and inspected the `data/residents.csv` diff.
- Checked the current CSV area around 47 Autumn Ave after noticing a potentially important row change.
- Bruno confirmed Raewyn Graham has left/gone, so the 47 Autumn Ave change should not be treated as suspicious.

### Codex Workbook/Photo Workflow Checks

- Exported the current workbook VBA/state using `export_current_workbook_state.vbs`.
- Ran `smoke_test_portable_relocation.vbs`.
- Portable relocation smoke test passed.
- Ran a non-destructive Step 1 All Residents Photos mirror safety test: 26 root staged originals found, 0 copied/updated, 26 already present with the same size, 26 verified, 0 non-image files skipped.
- Verified the repaired login bypass opens to `ADMIN_CONTROL_PANEL` when `BypassWorkbookLoginToAdmin=Yes`.
- Verified the Photo Workflow progress helper updates matching Admin/User button captions.
- Verified the green tick character stored on button captions is Unicode character code 9989.
- Installed the Step 3 staging checkpoint controls into the workbook and confirmed the saved XLSM package contains:
  - `txtAdminStagePhotosReminder`
  - `btnAdminOpenStagingFolder` assigned to `OpenPhotoWorkflowStagingFolder`
  - `txtUserStagePhotosReminder`
  - `btnUserOpenStagingFolder` assigned to `UserOpenPhotoWorkflowStagingFolder`
- Confirmed the saved reminder text contains `Before Step 3` and the `New Residents Photos for GitHub` staging folder wording.
- Confirmed saved control positions moved Step 3 below Step 2 on both Admin and User panels.
- Confirmed the GitHub repo working tree had `PROJECT_CONTEXT.md` modified before this status update.
- Installed the startup fast-path repair and confirmed saved `APP_SETTINGS` values match the live workbook folder, including `LastKnownWorkbookFolder`, `WorkbookFolder`, `WorkingDirectory`, `ThisWorkbookFullName`, `PhotosStagingFolder`, `PhotosCurrentGitHubMirrorFolder`, `GitHubRepoFolder`, `PhotosThumbPath`, and `PhotosProfilePath`.
- Confirmed the saved workbook package still contains 72 tracked control-panel button assignments and 2 direct reset-button assignments after the startup repair.
- Installed the coded Admin control-panel trial layout and caption changes. Verified saved captions for Admin/User reset buttons and Admin/User Residents buttons. Verified the saved workbook package still contains 72 tracked control-panel button assignments and 2 direct reset-button assignments.
- Installed the User control-panel layout preservation pass. Verified key User panel captions/positions, including `Reset Tick Buttons`, `Open Residents Sheet & edit/update Records`, the Step 3 reminder, `Open Staging Folder`, Step 14, and `Administrator Login`. Excel may round some Form Control positions slightly when saving.

## Problems Or Items Needing Verification

- Keep closing the workbook before Codex installs or tests workbook changes.
- The latest Step 1 safety cleanup, progress-tick changes, Step 3 staging checkpoint, all-button tick tracker, and startup fast path should be tested by Bruno from Excel in the normal operator flow.
- Excel COM macro-level verification for the new Step 3 checkpoint hung twice; hidden verifier processes were stopped and no workbook lock file remained afterward. Package-level workbook verification passed.
- The duplicate `Shirley Truong` match requires a manual choice of the correct Resident ID whenever both active records are possible matches.
- The User-side relocation flow should still be tested on the other user's computer with the copied project folder.
- I did not verify that every referenced image file physically exists in both `photos/thumb` and `photos/profile`.
- Treat the master workbook `Master Natura Residents Directory.xlsm` as the source of truth for resident records and photo availability.

## Next Recommended Step

1. Open the workbook and confirm the login bypass/button captions behave correctly.
2. Confirm the workbook opens promptly now that normal startup skips the heavy portable path regeneration/button rebind when settings are current.
3. On the Admin panel, visually confirm the coded layout matches Bruno's latest trial layout closely enough.
4. On the User panel, visually confirm the preserved layout is acceptable and still easy for User to follow.
5. On Admin and User panels, confirm `Reset Tick Buttons` and `Open Residents Sheet & edit/update Records` captions are acceptable.
6. On the Admin and User panels, confirm the new "Before Step 3" reminder and `Open Staging Folder` button appear between Step 2 and Step 3.
7. Run Photo Workflow Step 1 from Excel and confirm the improved Step 1 prompts, All Residents Photos safety check, backup/clear report, and progress tick.
8. After Step 2, use `Open Staging Folder`, load/copy the new resident photos into the root staging folder, then run Step 3.
9. Continue the photo workflow only after Step 3 creates/checks the `Photo Staging Review`.
10. Use Step 4 to correct any non-Exact yellow rows:
   - Walter Wood -> Walter Tink
   - Meg Olsen -> Margaret Olsen
   - Mel Hope -> Melinda Hope
   - choose the correct Shirley Truong Resident ID
11. Re-run the name check.
12. Continue only when all intended rows are `Exact` or deliberately corrected to `Process`.
13. If the workbook is correct after the photo workflow, rebuild/export `data/residents.csv` from the workbook and redeploy normally when needed.
14. If any GitHub CSV value differs from the workbook, correct the workbook first, then export and redeploy the CSV again rather than manually editing the CSV.
15. After any Codex or ChatGPT session, update both this file and `PROJECT_CONTEXT.md` when the change is important enough to affect future work.
