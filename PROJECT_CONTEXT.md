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
