# Tournament remediation and Builder synchronisation

## Status

`HISTORICAL CHECKPOINT — IDENTITY RULE SUPERSEDED`

This record preserves the previous remediation handoff (then READY FOR OWNER RETESTING). The Website implementation was subsequently merged. The owner decision of 5 October 2026 supersedes its archived-alias-first presentation requirement; use `docs/TOURNAMENT-CONTRACT.md` and `WEBSITE-TOURNAMENT-IDENTITY-PROVENANCE.md` for the current canonical-first/public-provenance follow-up. Statements below describe the historical checkpoint, not current implementation instructions or new merge authority.

## Starting state

- Website branch: `kkp/tournament-remediation`
- Initially attached website base: stale local `origin/main` at `fe18ac1b46fa1e10c517a0475964e9022df28ca9`
- Verified final website base: rewritten clean `origin/main` at `b2844a40317674957d9ae905c6a2b3935b7ab7c8`; the validated task commit was rebased onto this root before final push
- Builder branch: `kkp/tournament-builder-sync`
- Builder base: `7414c3440437da00c40badba7a56a578fe2b9007`
- Protected projects: website `main`, Radar repositories and unrelated worktrees
- Tournament configuration SHA-256 before implementation: `20380E1BA8881157C98CA64ADA26622EC4C25240662AFD5E89BC0A5F3C1440AF`

## Owner requirements and results

- **Active-event spoiler control:** Restored Hide Results for both `live` and `awaiting-results`, with keyboard state, persistence, storage fallback and accessibility isolation. `PASS`.
- **Last Updated layout:** Moved it from the six-cell fact grid into compact semantic metadata. `PASS`.
- **Historical identity:** Completed/cancelled events now present event aliases first while retaining canonical identities; result, bracket and stage rendering share the same resolver. `PASS`.
- **Hero actions:** Added an opaque action surface and made registration, or the external bracket when registration is unavailable, the primary action. `PASS`.
- **Builder synchronisation:** Added awaiting-results, lifecycle validation, explicit update fields, identity guidance, partial-history semantics, results/stage editing, preview guidance and extension-data preservation. `PASS`.
- **Data preservation:** Production tournament configuration was not edited; all production events passed Builder export/reimport comparison without semantic drift. `PASS`.

## Validation

- Website smoke, standard, acceptance, visual and validator self-test profiles.
- Focused browser coverage for spoiler visibility, keyboard toggle, persistence, inaccessible hidden surfaces, storage fallback, historical isolation, aliases, deep links, Back/Forward, hero action styling and compact metadata.
- Builder Release build and regression runner against the isolated website branch.
- Builder full production-event export/reimport semantic comparison, flexible-stage counts, awaiting-results validation, unknown-score/known-winner behavior and shared PDF generation path.
- JavaScript syntax, configuration validation, document overflow, Git whitespace and clean configuration hash verified by the standard harness and final checks.

## Manual / unknown

- Owner visual review on physical mobile devices and non-Chromium browsers.
- Real external Challonge/stream endpoints and assistive-technology sessions.
- Subjective approval of the final action hierarchy and historical-name wording.

## Authority state

- Website and Builder task branches only; no merge, deploy, release or tag.
- Website status is `READY FOR OWNER RETESTING`; owner acceptance has not been recorded.
