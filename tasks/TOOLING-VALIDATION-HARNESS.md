# TOOLING-VALIDATION-HARNESS — Workflow and validation automation

## Status

`OWNER ACCEPTED / MERGED`

## Starting state

- Authorised workspace: `C:\Users\Michael\Documents\ChatGPT\KKP Website Local\Tooling Validation Harness`
- Authorised branch: `tooling/work-validation-harness`
- Starting commit: `4aec4ace489e49b780e530ab24318a6d1680ea83`
- Parent/base branch and commit: `origin/main` at `4aec4ace489e49b780e530ab24318a6d1680ea83`
- Protected/reference checkouts: the normal `KrispyKP-Pages` checkout, Site Alpha, and the private Tournament Builder
- Related task or issue IDs: KKP-015 and KKP-016 are historical inputs only
- External/private-project scope: public-site validation only; no private Builder writes or external service submissions

## Owner requirements

### R1 — Reusable status and validation workflow

- **Owner requirement:** Reduce repeated repository discovery and provide clear, reusable commands and durable work rules.
- **State before:** `MISSING`
- **Action:** Added a status report, stable work rules, task template, validation profiles, change-aware scope and workflow documentation.
- **Validation:** Exercised human and JSON status output plus smoke, standard, browser-only, acceptance and visual profiles.
- **Result:** `PASS`
- **Evidence / notes:** `AGENTS.md`, `docs/VALIDATION.md`, `tasks/TASK_TEMPLATE.md`, `package.json` and `tools/`.

### R2 — Objective static and browser regression detection

- **Owner requirement:** Automate repeatable checks without changing production behavior or adding production runtime weight.
- **State before:** `INCOMPLETE`
- **Action:** Added static checks, responsive six-page browser coverage, stable interaction checks, optional screenshots and concise JSON evidence using development-only `playwright-core` with an installed Chromium browser.
- **Validation:** Full acceptance passed 61 checks; visual mode produced twelve 390px/1440px captures.
- **Result:** `PASS`
- **Evidence / notes:** Third-party requests are blocked; live external embeds and delivery remain manual/unknown.

### R3 — Prove the validator can fail correctly and recover safely

- **Owner requirement:** Verify controlled-failure detection, change-aware behavior and removal of temporary self-test artifacts.
- **State before:** `MISSING`
- **Action:** Added a self-test that injects four temporary defects and three scope probes, then restores source bytes in a `finally` path.
- **Validation:** Detected JavaScript syntax, missing asset, invalid tournament configuration and horizontal overflow failures. Verified Music-only, shared command-deck and tournament-schema scope mappings. Every source restoration check passed.
- **Result:** `PASS`
- **Evidence / notes:** `.validation/self-test.json` is generated evidence and ignored by Git; no fixtures remain in production paths.

## Implementation checklist

- [x] Git/workspace state verified before writes
- [x] Existing implementation and validators inspected
- [x] R1 implemented
- [x] R2 implemented
- [x] R3 implemented
- [x] Accessibility and content-resilience considered
- [x] No unrelated production behavior changed

## Validation checklist

- [x] `npm run status`
- [x] `npm run status:json`
- [x] `npm run validate`
- [x] `npm run validate:smoke`
- [x] `npm run validate:browser`
- [x] `npm run validate:acceptance`
- [x] `npm run validate:visual`
- [x] `npm run validate:self-test`
- [x] Required visual inspection
- [x] JavaScript/configuration/diff checks
- [x] Temporary fixtures removed
- [x] Browser/service/device boundaries recorded accurately

## Manual / unknown

- **Owner/manual checks still required:** Review command naming, failure readability and whether the workflow fits normal KKP task handling.
- **Unavailable or unknown evidence:** real assistive technology, non-Chromium engines, physical devices, true zoom and subjective visual quality.
- **External services not exercised:** Twitch, YouTube, Challonge, Formspree, search/social crawlers and private Tournament Builder execution.

## Files changed

- `.gitignore` — exclude dependencies, cache and generated validation evidence.
- `AGENTS.md` — stable repository work, authority and validation rules.
- `docs/VALIDATION.md` — commands, profiles, scope, boundaries and integration workflow.
- `package.json`, `package-lock.json` — deterministic development-only command surface and dependency.
- `tasks/` — durable task template and this implementation record.
- `tools/` — common scope/status utilities and static, browser, orchestration and self-test programs.

## Commits

- `HEAD` — `Add reusable validation workflow` (local tooling commit; exact SHA reported by `npm run status`).

## Remote verification

- Remote/branch: `origin/main`
- Verified remote tip: `4aec4ace489e49b780e530ab24318a6d1680ea83`
- Main unchanged: yes; the tooling branch started from the verified post-KKP-016 merge.
- Protected checkouts unchanged: yes.
- Push/merge/deploy state: local tooling work only; not pushed, merged, deployed, released or tagged.

## Owner acceptance

- Owner retest instructions: install dependencies, run `npm run status`, `npm run validate:acceptance`, then optionally `npm run validate:visual` and inspect `.validation/screenshots/`.
- Owner result/date: Accepted and merged before KKP-018.
- Acceptance evidence: Validation tooling is present on verified `main` at `92e591e6ce749732bbac1ece33e7979e9147f8ca` and is the required harness for KKP-018.
- Merge/deploy authority granted separately: `NO`

## Follow-ups

- If integrated after further website changes, rerun acceptance and update legitimate stale harness assumptions rather than altering production behavior to appease a test.
