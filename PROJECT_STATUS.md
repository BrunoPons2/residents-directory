# Residents Directory Project Status

Last updated: 2026-06-07 17:48 +10:00

This file is the short handover status for ChatGPT and Codex. `PROJECT_CONTEXT.md` remains the longer standing project context and rules file.

## Latest Confirmed Repository State

- Repository: `BrunoPons2/residents-directory`
- Default branch: `main`
- Existing long-form shared context file: `PROJECT_CONTEXT.md`
- Latest confirmed recent data commit before this status file was created: `73307592d897909bedd92e0a1968ef1774455f9c` with message `Update residents PWA data 2026-06-07 17:38`.
- `PROJECT_STATUS.md` was created on GitHub on 2026-06-07 so both ChatGPT and Codex have a short status file to read.

## Recent GitHub Data Notes

- `data/residents.csv` was updated in the latest confirmed data commit.
- The main visible change was adding many resident photo paths in the CSV, using:
  - `photos/thumb/<resident-slug>.jpg`
  - `photos/profile/<resident-slug>.jpg`
- Examples of newly linked photo rows include residents such as Peter Melhuish, Phillip Bird, Di Bird, Rob Wallace, Ruth Wallace, Heather Taylor, Lisa Pryor, Owen Cross, Robyn Annis-Brown, Robert Olsen, Margaret Olsen, Walter Tink, Peter Stone, Kay Stone, Jenny Verity, Rhonda Harris, Keith Harris, Rod Moore, Lee Moore, Melinda Hope, Chris Hope, and Shirley Truong.
- 47 Autumn Ave clarification from Bruno on 2026-06-07: Raewyn Graham has left/gone. Her removal from the CSV is intentional, not an error. Jaynette Coleman appearing at 47 Autumn Ave / ResidentID 95 is accepted as the current data state unless the master workbook later shows otherwise.

## Latest Codex Workbook Checkpoint

The workbook/photo workflow upgrade has been installed into:

- `D:\Bruno\Documents\App Projects\Residents Directory\Master Natura Residents Directory.xlsm`

Excel was open at the time of this checkpoint, so no further workbook automation should be run until Bruno closes it.

The staged photo folder contained 26 image files at the time of this checkpoint:

- `D:\Bruno\Documents\App Projects\Residents Directory\Photos\New Residents Photos for GitHub`

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

### Photo Workflow

- Step 1 now starts with a real clean slate:
  - Back up staged photo image files first.
  - Verify copied image count matches staged image count.
  - Clear only backed-up staged image files from `New Residents Photos for GitHub`.
  - Report skipped/non-image files separately.
  - Clean generated/review worksheets.
  - Run Photo Workflow Preflight after cleanup.
- Generated/review worksheet cleanup includes `STANDARDISED`.
- The folder name typo was resolved: use `Current Residents Photos on GitHub`, not `Currant`.
- Step 8 is now `Backup Staged Photos`.
- Step 9 now archives confirmed staged photos and copies confirmed originals into `Current Residents Photos on GitHub`.
- Step 10 is now `Create Standardised Copies`.

### Step 3 / Step 4 Cropping And Review

- Step 3 button caption on both control panels is now:
  - `3 Confirm Cropping + Check Names`
- Step 3 now asks whether staged photos are already properly cropped, face-centred, and saved.
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
- related existing workflow modules imported during the installer run

### Codex Working Files

- `C:\Users\bpons\Documents\Codex\2026-06-04\photo-workflow\work\install_portable_project_relocation.vbs`
- `C:\Users\bpons\Documents\Codex\2026-06-04\photo-workflow\work\export_current_workbook_state.vbs`
- `C:\Users\bpons\Documents\Codex\2026-06-04\photo-workflow\work\smoke_test_portable_relocation.vbs`
- `C:\Users\bpons\Documents\Codex\2026-06-04\photo-workflow\work\current-vba-export\`

### GitHub Repo Status

- `PROJECT_STATUS.md` is being updated with both the GitHub handover notes and the Codex workbook/photo workflow checkpoint.
- `PROJECT_CONTEXT.md` was already modified locally from earlier project-context work and is not part of this status checkpoint unless separately committed later.

### Workbook Backup

Latest pre-install backup recorded:

- `D:\Bruno\Documents\App Projects\Residents Directory\Workbook_BACKUPS\Master Natura Residents Directory - pre-portable-project-relocation 7-06-2026_3-01-16_PM.xlsm`

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
- Confirmed the staged photo folder contains 26 image files.
- Confirmed the GitHub repo working tree had `PROJECT_CONTEXT.md` modified before this status update.

## Problems Or Items Needing Verification

- Excel was open with `Master Natura Residents Directory.xlsm` at the time of this checkpoint; close it before Codex installs or tests any further workbook changes.
- The full real-photo workflow has not yet been run end-to-end on the 26-photo batch.
- Step 4 review corrections still need to be made by the operator on `Photo Staging Review`.
- The duplicate `Shirley Truong` match requires a manual choice of the correct Resident ID.
- The User1 relocation flow should still be tested on User1's computer with the copied project folder.
- No GitHub upload/publish step has been run for the current 26-photo batch yet.
- I did not verify that every referenced image file physically exists in both `photos/thumb` and `photos/profile`.
- Treat the master workbook `Master Natura Residents Directory.xlsm` as the source of truth for resident records and photo availability.

## Next Recommended Step

1. Close the workbook before any further Codex workbook automation.
2. Test the photo workflow with the current 26-photo batch.
3. Run Step 3 and confirm whether all staged photos are cropped.
4. Let Step 3 create/check the `Photo Staging Review`.
5. Use Step 4 to correct the non-Exact yellow rows:
   - Walter Wood -> Walter Tink
   - Meg Olsen -> Margaret Olsen
   - Mel Hope -> Melinda Hope
   - choose the correct Shirley Truong Resident ID
6. Re-run the name check.
7. Continue only when all intended rows are `Exact` or deliberately corrected to `Process`.
8. If the workbook is correct after the photo workflow, rebuild/export `data/residents.csv` from the workbook and redeploy normally when needed.
9. If any GitHub CSV value differs from the workbook, correct the workbook first, then export and redeploy the CSV again rather than manually editing the CSV.
10. After any Codex or ChatGPT session, update both this file and `PROJECT_CONTEXT.md` when the change is important enough to affect future work.
