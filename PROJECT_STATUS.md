# Residents Directory Project Status

Last updated: 2026-06-07

This file is the short handover status for ChatGPT and Codex. `PROJECT_CONTEXT.md` remains the longer standing project context and rules file.

## Latest confirmed repository state

- Repository: `BrunoPons2/residents-directory`
- Default branch: `main`
- `PROJECT_STATUS.md` did not previously exist on `main`; it was created now so both ChatGPT and Codex have a short status file to read.
- Existing long-form shared context file: `PROJECT_CONTEXT.md`
- Latest confirmed recent commit before this status file was created: `73307592d897909bedd92e0a1968ef1774455f9c` with message `Update residents PWA data 2026-06-07 17:38`.

## What changed recently

- `data/residents.csv` was updated in the latest confirmed data commit.
- The main visible change was adding many resident photo paths in the CSV, using:
  - `photos/thumb/<resident-slug>.jpg`
  - `photos/profile/<resident-slug>.jpg`
- Examples of newly linked photo rows include residents such as Peter Melhuish, Phillip Bird, Di Bird, Rob Wallace, Ruth Wallace, Heather Taylor, Lisa Pryor, Owen Cross, Robyn Annis-Brown, Robert Olsen, Margaret Olsen, Walter Tink, Peter Stone, Kay Stone, Jenny Verity, Rhonda Harris, Keith Harris, Rod Moore, Lee Moore, Melinda Hope, Chris Hope, and Shirley Truong.

## Files confirmed as changed recently

- `data/residents.csv` was changed by the recent data update commit.
- `PROJECT_CONTEXT.md` was previously updated on 2026-06-04 with photo workflow notes, Step 1 clean-slate/preflight notes, Step 9 archive/current GitHub photo mirror notes, missing-photo email unsubscribe workflow notes, and the revised service-worker update behaviour.
- `PROJECT_STATUS.md` was created now as this shorter handover/status file.

## Tests/checks done in this ChatGPT review

- Checked the GitHub repository `BrunoPons2/residents-directory`.
- Confirmed there were no recent pull requests visible from the connected GitHub account.
- Confirmed `PROJECT_STATUS.md` was not present before this update.
- Confirmed `PROJECT_CONTEXT.md` exists and contains the main standing rules and recent project notes.
- Checked the latest visible recent commit and inspected the `data/residents.csv` diff.
- Checked the current CSV area around 47 Autumn Ave after noticing a potentially important row change.

## Problems or items needing verification

- I could not directly see what standalone Codex did locally unless it pushed to GitHub or created a PR/branch visible through the connected repository.
- No Codex PR was found in this repository during this review.
- The latest visible data commit appears to have changed the 47 Autumn Ave entries: Raewyn Graham is no longer present in the checked CSV area, and Jaynette Coleman appears at ResidentID 95. Verify this against the master Excel workbook before assuming it is correct.
- I did not run the live PWA in a browser from here, and I did not verify that every referenced image file physically exists in both `photos/thumb` and `photos/profile`.
- Treat the master workbook `Master Natura Residents Directory.xlsm` as the source of truth for resident records and photo availability.

## Next recommended step

1. Open the current master workbook locally.
2. Check the Residents sheet around 47 Autumn Ave and confirm whether Raewyn Graham should be removed and Jaynette Coleman should be ResidentID 95.
3. If the workbook is correct, rebuild/export `data/residents.csv` from the workbook and redeploy normally.
4. If the GitHub CSV is wrong, correct the workbook first, then export and redeploy the CSV again rather than manually editing the CSV.
5. After any Codex or ChatGPT session, update both this file and `PROJECT_CONTEXT.md` when the change is important enough to affect future work.
