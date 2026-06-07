# Residents Directory Project Context

This file is the shared source of truth for ChatGPT and Codex when working on the Residents Directory project. Read this before making project decisions or editing files.

## Project Locations

- App repo: `D:\Bruno\Documents\App Projects\Residents Directory\GitHub\residents-directory`
- GitHub repo: `BrunoPons2/residents-directory`
- Project container: `D:\Bruno\Documents\App Projects\Residents Directory`
- Master workbook: `D:\Bruno\Documents\App Projects\Residents Directory\Master Natura Residents Directory.xlsm`
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

- Test Macro 9 from Excel after the helper fix.
- Before future app edits, inspect `git status` and the relevant files read-only.
- Keep this file updated when project rules or workflow assumptions change.

- Photo Workflow Step 1 was updated on 2026-06-04 to run as clean slate preflight: backup current staged photos if any exist, delete generated/review worksheets including Photo Review * sheets, then run PhotoWorkflowPreflight. Admin and User panels now label Step 1 as '1 Clean Slate / Photo Workflow Preflight'.
- The clean slate worksheet cleanup must not delete core sheets: ADMIN_CONTROL_PANEL, USER_CONTROL_PANEL, Residents, Archives, APP_SETTINGS, PWA_EXPORT, or GITHUB_SYNC_GUIDE; it must not touch resident data, CSV files, GitHub repo files, workbook backups, or delete/move/rename source photos.

- Photo Workflow Step 1 was refined on 2026-06-04: after backing up root staged images and STANDARDISED images into a timestamped folder under PhotosStagingBackupFolder, the macro verifies copied counts, then clears only verified image files from PhotosStagingFolder and its STANDARDISED subfolder. The folders themselves and non-image files are left in place and reported.

- Folder spelling corrected: use 'Current Residents Photos on GitHub' everywhere, not 'Currant'. Remaining text references across the project were replaced on 2026-06-04.
- Photo Workflow Step 9 now archives confirmed staged photos and then copies current staged original image files into PhotosCurrentGitHubMirrorFolder, set to D:\Bruno\Documents\App Projects\Residents Directory\Photos\Current Residents Photos on GitHub. Admin and User panels label Step 9 as '9 Archive Confirmed Staged Photos + Update Current GitHub Photos'.
- Missing-photo email workflow now uses a permanent workbook sheet named 'Email Unsubscribe List' with columns Recorded At, full_name, address, email, source, and notes. This sheet is not part of generated worksheet cleanup. The draft-email macro skips residents matching the unsubscribe list by email or by name+address, and the email footer asks residents to reply with 'unsubscribe' to stop future Residents Directory emails from Bruno.
- The User handover guide, currently saved as `Residents Directory - User1 Handover Guide`, was refreshed on 2026-06-05 as DOCX and PDF to include User access limits, the clean-slate photo workflow, Current Residents Photos on GitHub wording, and missing-photo email unsubscribe handling. The same operating guidance should be kept aligned for Admin and User.
- The workbook now keeps APP_SETTINGS as the single active settings sheet and has a portable project-location startup check for both Admin and User use. On open, if the recorded LastKnownWorkbookFolder/WorkbookFolder differs from ThisWorkbook.Path, the workbook prompts to use the current folder, choose another folder, or cancel startup. Confirmed relocation regenerates all active local project paths from the selected root, records LastKnownWorkbookFolder, LastRelocatedAt, LastRelocatedBy, LastRelocatedFrom, and LastRelocatedTo, creates expected local folders under the selected root, and rebinds Admin/User control-panel buttons to the current workbook macros. The Admin panel's old path-migration button is now "Set Project Location".

- App service-worker update behavior changed on 2026-06-04: `sw.js` is now `residents-directory-shell-v4` and no longer calls `self.skipWaiting()` during install. New app versions should show the existing "New version ready" prompt and only reload after the user clicks Reload. The Reload button still sends the `SKIP_WAITING` message, so the app updates by choice instead of auto-reloading and appearing to load residents data twice. This was pushed to GitHub in commit `9439e7e`.
