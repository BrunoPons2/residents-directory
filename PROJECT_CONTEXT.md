# Residents Directory Project Context

This file is the shared source of truth for ChatGPT and Codex when working on the Residents Directory project. Read this before making project decisions or editing files.

## Project Locations

- App repo: `D:\Bruno\Documents\App Projects\Residents Directory\GitHub\residents-directory`
- GitHub repo: `BrunoPons2/residents-directory`
- Project container: `D:\Bruno\Documents\App Projects\Residents Directory`
- Active V2 workbook: `D:\Bruno\Documents\App Projects\Residents Directory\Master Natura Residents Directory V2.0.xlsm`
- Preserved V1 source workbook: `D:\Bruno\Documents\App Projects\Residents Directory\Master Natura Residents Directory.xlsm`
- Immutable V1 release snapshot: `D:\Bruno\Documents\App Projects\Residents Directory\Workbook_BACKUPS\Versioned Releases\Master Natura Residents Directory V1.0 - Final 2026-06-23_17-47-48.xlsm`
- CSV source folder: `D:\Bruno\Documents\App Projects\Residents Directory\CSV_Data`

## Main App Files

- `index.html`
- `app.js`
- `styles.css`
- `sw.js`
- `manifest.json`
- `data/residents.csv`
- `photos/thumb`
- `photos/profile`

## Standing Rules

- Do not change `data/residents.csv` unless explicitly asked.
- Do not remove existing functions unless they are clearly unused.
- Preserve working features:
  - search
  - sort
  - resident popup
  - Text, Call, and Email buttons
  - Add to Home Screen button
  - photo fallback
  - Escape key close
  - click-outside close
  - service worker no-store handling for `residents.csv` and photos
- Show the diff before any commit.
- Do not push to GitHub unless explicitly approved.

## Shared Workflow For ChatGPT And Codex

ChatGPT and Codex do not automatically share private chat memory. Use this file as the bridge.

Recommended workflow:

1. Start any ChatGPT or Codex session by saying: "Read `PROJECT_CONTEXT.md` first."
2. Keep project decisions, constraints, and workflow changes in this file.
3. Use Codex for local file edits, testing, Git checks, and repo work.
4. Use ChatGPT for planning, explanations, drafting text, reviewing ideas, and reasoning through choices.
5. After important changes, update the "Recent Decisions And Work" section below.

## Session Close Routine

When the user says "bye", "goodbye", "that's all", "done for now", or otherwise appears to be ending a project session:

1. Check whether any important project decision, workflow change, file edit, test result, unresolved issue, or next step happened during the session.
2. If yes, update this file before ending the conversation.
3. Keep the update short and practical.
4. If no project-relevant change happened, say that no context update was needed.
5. Remind the user of any important uncommitted changes, pending tests, or next action.

## Recent Decisions And Work

- The real app repo is `D:\Bruno\Documents\App Projects\Residents Directory\GitHub\residents-directory`.
- The broader project folder includes CSV backups, CSV data, photo folders, workbook backups, restore points, PDF copies, and workflow/reference documents.
- `data/residents.csv` exists in the repo.
- `photos/thumb` and `photos/profile` exist in the repo.
- The master workbook exists at `D:\Bruno\Documents\App Projects\Residents Directory\Master Natura Residents Directory.xlsm`.
- Macro 9, "Residents CSV Deployment into GitHub", was improved so it should fetch from GitHub before deployment, merge `origin/main` when needed, copy `CSV_Data/residents.csv` into the repo, commit intended deployment files, push afterward, and show actual Git output in errors.
- A compile issue was fixed by replacing a call to private helper `GetAppSettingValueForBackup` with a Module1-local helper `GetAppSettingValue_Module1("GitHubRepoFolder")`.
- Backup noted from prior macro work: `D:\Bruno\Documents\App Projects\Residents Directory\Workbook_BACKUPS\Master Natura Residents Directory - pre-github-deploy-fetch-merge 2026-05-31_23-37-28.xlsm`.

## Open Follow-Ups

- Use `Master Natura Residents Directory V2.0.xlsm` for the next photo workflow test.
- Before future app edits, inspect `git status` and the relevant files read-only.
- Keep this file updated when project rules or workflow assumptions change.

- Photo Workflow Step 1 was updated on 2026-06-04 to run as clean slate preflight: backup current staged photos if any exist, delete generated/review worksheets including Photo Review * sheets, then run PhotoWorkflowPreflight. Admin and User panels now label Step 1 as '1 Clean Slate / Photo Workflow Preflight'.
- The clean slate worksheet cleanup must not delete core sheets: ADMIN_CONTROL_PANEL, USER_CONTROL_PANEL, Residents, Archives, APP_SETTINGS, PWA_EXPORT, or GITHUB_SYNC_GUIDE; it must not touch resident data, CSV files, GitHub repo files, workbook backups, or delete/move/rename source photos.

- Photo Workflow Step 1 was refined on 2026-06-04: after backing up root staged images and STANDARDISED images into a timestamped folder under PhotosStagingBackupFolder, the macro verifies copied counts, then clears only verified image files from PhotosStagingFolder and its STANDARDISED subfolder. The folders themselves and non-image files are left in place and reported.

- Folder naming updated on 2026-06-09: use 'All Residents Photos on GitHub' everywhere; prior current/currant wording is obsolete.
- Photo Workflow Step 9 now archives confirmed staged photos and then copies current staged original image files into PhotosAllGitHubMirrorFolder, set to D:\Bruno\Documents\App Projects\Residents Directory\Photos\All Residents Photos on GitHub. Admin and User panels label Step 9 as '9 Archive Confirmed Staged Photos + Update All GitHub Photos'.
- Missing-photo email workflow now uses a permanent workbook sheet named 'Email Unsubscribe List' with columns Recorded At, full_name, address, email, source, and notes. This sheet is not part of generated worksheet cleanup. The draft-email macro skips residents matching the unsubscribe list by email or by name+address, and the email footer asks residents to reply with 'unsubscribe' to stop future Residents Directory emails from Bruno.
- The User handover guide, currently saved as `Residents Directory - User1 Handover Guide`, was refreshed on 2026-06-05 as DOCX and PDF to include User access limits, the clean-slate photo workflow, All Residents Photos on GitHub wording, and missing-photo email unsubscribe handling. The same operating guidance should be kept aligned for Admin and User.
- The workbook now keeps APP_SETTINGS as the single active settings sheet and has a portable project-location startup check for both Admin and User use. On open, if the recorded LastKnownWorkbookFolder/WorkbookFolder differs from ThisWorkbook.Path, the workbook prompts to use the current folder, choose another folder, or cancel startup. Confirmed relocation regenerates all active local project paths from the selected root, records LastKnownWorkbookFolder, LastRelocatedAt, LastRelocatedBy, LastRelocatedFrom, and LastRelocatedTo, creates expected local folders under the selected root, and rebinds Admin/User control-panel buttons to the current workbook macros. The Admin panel's old path-migration button is now "Set Project Location".
- Photo Workflow Step 1 was further upgraded on 2026-06-09: before any staged cleanup, it copies/updates root staged originals into `Photos\All Residents Photos on GitHub`, verifies every root staged original by filename and file size, then backs up and clears verified root staged and STANDARDISED images. STANDARDISED images are not copied into the All Residents Photos folder.
- Photo Workflow user feedback was improved on 2026-06-09: numbered workflow message-box title bars now start with `Step X -`, Step 1 resets progress ticks, and successful numbered steps add a green tick to the matching Admin/User workflow buttons. Progress is stored in APP_SETTINGS and refreshed on workbook open.
- Photo Workflow Step 3 staging was clarified on 2026-06-09: Admin and User panels include a "Before Step 3" reminder using `PhotosStagingFolder` from APP_SETTINGS. It tells the operator to load/copy new resident photos into the root `New Residents Photos for GitHub` staging folder and leave STANDARDISED empty for Step 10. Step 3 blocks if no staged images exist and opens the folder itself when manual review is needed.
- The separate optional root staging-folder buttons were removed from both control panels on 2026-06-23 because they only duplicated Step 3 behaviour and were not required by later workflow steps. The yellow reminder and Step 3 folder checks remain.
- Login bypass was repaired on 2026-06-09: `ToggleLoginBypassToAdmin` exists again, `WorkbookLoginPrompt` respects `BypassWorkbookLoginToAdmin`, and the Admin bypass button is rebound correctly.
- Control-panel session tracking was expanded on 2026-06-09: normal buttons on both Admin and User panels now run through `RunTrackedControlPanelButton`, then add a green tick to the clicked button after the assigned macro returns. `Reset Tick Buttons` buttons were added to both panels; reset clears all Admin/User control-panel ticks and the numbered Photo Workflow progress ticks, but does not undo any completed workbook/file work. Target macro assignments are stored in each tracked button's AlternativeText and are preserved by portable relocation/button repair.
- `Reset Tick Buttons` was refined on 2026-06-23: the macro now clears the Photo Workflow, Admin, and User ticks immediately, then shows one final completion message. The old pre-reset Yes/No confirmation was removed.
- Startup performance was repaired on 2026-06-09: normal workbook open now skips full portable path regeneration and control-panel button rebind when `APP_SETTINGS` already matches the workbook's current folder. Full regeneration still runs after relocation, missing/stale settings, or the `Set Project Location` workflow. The Step 3 reminder refresh now reads the staging path directly instead of calling full app initialisation during startup.
- Admin control-panel layout was coded on 2026-06-09 from Bruno's manually adjusted trial layout. The current User control-panel layout was also coded for preservation. Future installer/portable repair runs preserve both layouts. The reset button caption is now `Reset Tick Buttons`, and the Residents button caption on both Admin and User panels is now `Open Residents Sheet & edit/update Records`.

- App service-worker update behavior changed on 2026-06-04: `sw.js` is now `residents-directory-shell-v4` and no longer calls `self.skipWaiting()` during install. New app versions should show the existing "New version ready" prompt and only reload after the user clicks Reload. The Reload button still sends the `SKIP_WAITING` message, so the app updates by choice instead of auto-reloading and appearing to load residents data twice. This was pushed to GitHub in commit `9439e7e`.

- 2026-06-20 pause point: no workbook or VBA changes were applied during the latest session.
- Prepared correction pack: `Residents_Directory_VBA_Patch_Pack_2026-06-20.zip`.
- Resume by applying Group 1 only to the TEST FIXES workbook: `modCurrentGitHubPhotos`, `modProjectRelocation`, `modWorkbookCleanup`, and `modPathMigration`.
- After Group 1, run `Debug -> Compile VBAProject`, close and reopen the workbook, then test Step 1 with one expendable staged photo.
- Verify that `All Residents Photos on GitHub` is used, `Current Residents Photos on GitHub` is not recreated, and `PhotosAllGitHubMirrorFolder` remains correct before moving to Group 2.

## V2.0 Workbook And Consolidated Photo Workflow

- On 2026-06-23 the current workbook was frozen as V1.0. The versioned V1 snapshot and the unversioned source have the same SHA-256 hash: `4F88CFDB4D8F3678A1BFE2FC8B508435057AD0A1FD8A244C5D3C3A2FB3964B5F`.
- New work continues in `Master Natura Residents Directory V2.0.xlsm`. The original unversioned workbook remains unchanged during V2 testing.
- V2 replaces the normal 14-button photo workflow with four controls on both Admin and User panels:
  - `Process / Resume New Resident Photos`
  - `Open Current Batch Review`
  - `View Last Workflow Report`
  - `Reset Photo Workflow Session`
- Admin also has `Show / Hide Legacy Recovery Controls`. The original macros remain installed for recovery but are hidden during normal operation.
- The permanent operator intake is `Photos\New Residents Photos collection - safe copy`. V2 never deletes or modifies files in this folder.
- V2 uses SHA-256 fingerprints and permanent VeryHidden sheets `PHOTO_INTAKE_LOG` and `PHOTO_BATCH_LOG` to prevent old safe-copy photos from being processed repeatedly and to support resumable batches.
- Existing `Sharyn Colquhoun.jpg` was baselined as `MIGRATED_EXISTING` because it is identical to the canonical original.
- `Photos\All Residents Photos on GitHub` is the only canonical original-photo collection. The legacy `PhotosCurrentGitHubMirrorFolder` setting is redirected to the All folder so old recovery macros do not recreate the obsolete Current folder.
- The consolidated controller performs portable preflight checks, Git cleanliness/synchronisation checks, verified transient backup/cleanup, immutable intake snapshots, name matching, confirmed-original archiving, standardised copies, IrfanView conversion, replacement review, output validation, PWA/CSV rebuild, expected-file Git commit, and push.
- It pauses only for uncertain resident matches, genuine photo replacement choices, Git changes, or errors. `Later` keeps a replacement batch paused.
- Git publication records the resulting commit SHA in the batch and intake logs. Git origin movement or unexpected repository files blocks publication.
- V2 startup was repaired for protected APP_SETTINGS and password-protected control sheets. Normal Admin startup measured about 6.6 seconds. User mode measured about 5.6 seconds.
- User mode was verified with workbook structure protected, Admin/settings/audit sheets VeryHidden, User panel protected, and only Residents columns B:E editable. Residents columns A and F remain locked.
- A real V2 photo batch has not yet been executed. The current repo has local `PROJECT_CONTEXT.md` and `PROJECT_STATUS.md` changes, so V2 Git preflight will intentionally block until those changes are committed/pushed or otherwise reconciled.
