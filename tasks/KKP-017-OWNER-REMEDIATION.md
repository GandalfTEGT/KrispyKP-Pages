# KKP-017 — Owner remediation after KKP-016

## Status

`READY FOR OWNER RETESTING`

## Starting state

- Authorised workspace: `C:\Users\Michael\Documents\ChatGPT\KKP Website Local\Master\KrispyKP-Pages-KKP017-Remediation`
- Authorised branch: `kkp/017-owner-remediation`
- Starting commit: `8b05b2fb99346ad11f82e30fa93b0eea17718c7a`
- Parent/base branch and commit: `origin/main` at `8b05b2fb99346ad11f82e30fa93b0eea17718c7a`
- Protected/reference checkouts: `C:\Users\Michael\Documents\GitHub\KrispyKP-Pages`; prior KKP-016 worktree
- Related task or issue IDs: KKP-016; validation tooling harness
- External/private-project scope: Tournament Builder compatibility assessment only; no Builder modification or push authorised

## Owner requirements

### R1 — Home composition and Current Uplink

- **Owner requirement:** Preserve intrinsic sizing while reducing desktop hero/live negative space; lay out the two semantic Current Uplink groups deliberately; move its LED to the shared top-right position.
- **State before:** `INCOMPLETE`
- **Action:** Embedded Current Uplink beneath Live Stream, retained intrinsic heights, separated the two-item upcoming summary from the four-item route grid, and restored the shared top-right LED.
- **Validation:** Acceptance matrix at 320/390/768/1024/1440 plus desktop/mobile visual review.
- **Result:** `PASS`
- **Evidence / notes:** Test representative desktop, horizontal tablet/mobile-like widths, and narrow mobile.

### R2 — Videos responsive workspace

- **Owner requirement:** Stable viewport-driven card sizes for 1, 2, 6 and 8 results; desktop selection rail beside results; secondary controls with primary controls and retained on mobile; preserve all player/search/sort/deep-link behavior.
- **State before:** `INCOMPLETE`
- **Action:** Built a desktop primary/secondary selection rail beside a stable result area; mobile uses the native primary selector while retaining secondary controls. Cards use capped tracks rather than stretching to fill a row.
- **Validation:** Focused 1/2/6/8-card browser fixture confirmed identical card widths; selection, pagination, search/sort surfaces, deep links and invalid-state fallback passed.
- **Result:** `PASS`
- **Evidence / notes:** Owner screenshots S1-S3 show result-count-dependent stretching and misplaced/hidden secondary controls.

### R3 — Tournament readability, PDFs, archive and disclosures

- **Owner requirement:** Improve all five heroes; generate/link faithful historical PDFs where structured rules permit; make participant cards resilient; restore verified historical stages/results; show results before standings; add an independent mobile standings disclosure.
- **State before:** `INCOMPLETE`
- **Action:** Strengthened all five hero foregrounds, generated four config-derived historical rules PDFs, moved Group Standings after Results/Bracket, added its mobile disclosure, restored verified group-stage matches, corrected historical aliases, and corrected the Champions League withdrawal/replacement sequence without inventing the FERRET-AOD score.
- **Validation:** Five hero crops visually reviewed; 125 configured matches validated; all generated PDF pages rendered and inspected; 320–1440 responsive matrix passed.
- **Result:** `PASS`
- **Evidence / notes:** Challonge is the authoritative external source; ambiguity must remain explicit.

### R4 — Contact composition

- **Owner requirement:** Informational panels precede the two final form panels; forms sit side-by-side on desktop without forced equal heights and stack in logical order on mobile.
- **State before:** `INCOMPLETE`
- **Action:** Reordered context panels before the final two form panels; forms remain intrinsic-height peers on desktop and stack in source order on mobile.
- **Validation:** Desktop/mobile visual review and acceptance matrix passed.
- **Result:** `PASS`
- **Evidence / notes:** Preserve native form order and accessibility.

### R5 — Radar responsive game layout

- **Owner requirement:** Improve HUD readability, use `ARMOUR`, introduce independent semantic game versioning, restore a safe corner Exit control, and deliberately support desktop, mobile portrait and mobile landscape while preserving established lifecycle and controls.
- **State before:** `INCOMPLETE`
- **Action:** Increased HUD/help legibility, changed to `ARMOUR`, introduced independent game version `0.4.0`, returned Exit Radar to the normal trigger corner, and added deliberate desktop, portrait and short-landscape layouts.
- **Validation:** Activation, pause/resume, fixed exit, Escape, repeated activation, 390×844 → 844×390 live resize, minimum battlefield size and overflow checks passed; all three active/paused layouts visually reviewed.
- **Result:** `PASS`
- **Evidence / notes:** iPhone 12 Pro portrait and landscape plus live orientation/resize are required.

### R6 — Live-event spoiler mode

- **Owner requirement:** Provide one accessible, locally persisted spoiler/result-visibility control for events whose authoritative status is ongoing/live. Hide all outcome-derived presentation consistently while retaining participants, event details, rules, schedule, maps and source links. Completed events must remain uncensored.
- **State before:** `MISSING`
- **Action:** Added one live-status-driven accessible button with `aria-pressed`, local persistence and in-memory fallback. A single content state hides Results, Group Standings and bracket progression while preserving participants and event details. Completed events ignore the live preference.
- **Validation:** Visible → hidden → restored state, reload persistence, completed-event isolation, direct links, Back/Forward and storage-denial fallback passed at desktop/mobile widths.
- **Result:** `PASS`
- **Evidence / notes:** Must survive refresh where storage is available, tolerate unavailable storage, reassess on event changes, and preserve direct links plus Back/Forward.

### R7 — Scoped historical archive correction

- **Owner requirement:** Implement supplied group-stage evidence for the current archive scope; correct the inaccurate RAMBO-AOD semi-final; preserve RAMBO withdrawal, FERRET 2–1 KRISPY replacement playoff, FERRET replacement, and AOD victory over FERRET with unknown exact score. Preserve canonical identities and evidence limits. Record five newly named King-of tournaments for future VOD research only.
- **State before:** `INACCURATE / INCOMPLETE`
- **Action:** Added supplied screenshot-evidenced group rounds for 2025 Invasion, 2024 Champions League and 2023 Home Nations; existing 15-match Oceania round robin was retained. Canonicalised WTF/FULLY/JAMIETD/TRIOTD while retaining historical aliases. Replaced the false RAMBO 1–4 AOD semi-final with FERRET vs AOD, blank scores, AOD winner and explicit owner-recollection note. Added the FERRET 2–1 KRISPY Bo3 replacement playoff and recorded RAMBO's withdrawal. Deferred events were recorded as KKP-ISSUE-029 without speculative data.
- **Validation:** Configuration validator passed 5 events / 125 matches; exact target records inspected; public rendering passed. No public schema expansion was needed, so existing Builder-compatible fields were retained.
- **Result:** `PASS`
- **Evidence / notes:** Group grids come from owner-supplied Challonge screenshots. FERRET 2–1 KRISPY and AOD's score-unknown win are classified as owner-supplied historical recollection, not independently verified evidence.

## Implementation checklist

- [x] Git/workspace state verified before writes
- [x] Existing workflow and validation instructions read
- [x] Existing implementation and validators inspected
- [x] R1 implemented
- [x] R2 implemented
- [x] R3 implemented
- [x] R4 implemented
- [x] R5 implemented
- [x] R6 implemented
- [x] R7 implemented within the owner-defined boundary
- [x] Accessibility and content resilience considered
- [x] No unrelated production behavior changed

## Validation checklist

- [x] `npm run status`
- [x] `npm run validate` — STANDARD PASS, 43 checks
- [x] `npm run validate:acceptance` — final ACCEPTANCE PASS, 61 checks across all six pages and 320/390/768/1024/1440 widths
- [x] `npm run validate:visual` — ACCEPTANCE PASS, 61 checks and six-page captures
- [x] Focused result-count, tournament-stage/PDF and Radar-orientation coverage
- [x] Required visual inspection
- [x] JavaScript/configuration/diff checks
- [x] `npm run validate:self-test` — 7 detection/scope probes passed and all source bytes restored
- [x] Temporary fixtures removed
- [x] Browser/service/device boundaries recorded accurately

## Manual / unknown

- **Owner/manual checks still required:** Physical-device touch ergonomics, final visual preference, gameplay feel, real assistive-technology quality, true zoom and non-Chromium behavior.
- **Unavailable or unknown evidence:** Exact FERRET vs AOD score; independent corroboration of owner-recollection playoff/withdrawal details; future King-of tournament facts; private Builder round-trip was not rerun because no schema field was added and Builder modification was outside scope.
- **External services not exercised:** No mutations or submissions are authorised.

## Files changed

- Home, Videos, Tournament, Contact and Radar HTML/CSS/JS surfaces; validation harness; tournament config and PDF generator.
- Four generated historical rules PDFs under `assets/trules/`.
- `tasks/KKP-017-OWNER-REMEDIATION.md` — durable task authority and evidence record.
- Master `findings/ISSUE_REGISTER.md` — deferred VOD research backlog KKP-ISSUE-029 (program record outside this Git worktree).

## Commits

- Pending final remediation commit.

## Remote verification

- Remote/branch: `origin/kkp/017-owner-remediation`
- Verified remote tip: Pending.
- Main unchanged: Pending final verification.
- Protected checkouts unchanged: Pending final verification.
- Push/merge/deploy state: Task branch push authorised; merge/deploy/release/tag prohibited.

## Owner acceptance

- Owner retest instructions: Pending final handoff.
- Owner result/date: Pending.
- Acceptance evidence: None yet.
- Merge/deploy authority granted separately: `NO`

## Follow-ups

- Record only genuinely deferred or ambiguous historical-source items after source review.
