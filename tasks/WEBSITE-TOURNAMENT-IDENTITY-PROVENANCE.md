# WEBSITE-TOURNAMENT-IDENTITY-PROVENANCE — Owner retest follow-up

## Status

VALIDATED — AWAITING FINAL ADMIN COMBINED PREVIEW. Authorised 5 October 2026. Owner supplied the full coordinated follow-up request through Master. No merge/deploy authority. Website scope only; Admin and Master repositories are not edited here.

## Starting state

- Workspace: `C:/Users/Michael/Documents/ChatGPT/KKP Website Local/worktrees/website-tournament-identity-provenance`.
- Branch: `codex/tournament-identity-provenance`.
- Base: canonical and freshly queried remote main `f857b21d0a1003fb565b51f89b133a50c91f9732`; clean canonical checkout, no local-only commits. Separate worktree created from that exact commit.
- Protected: canonical main, legacy GitHub checkout (six existing untracked browser artifacts), historical worktrees, original Admin retest fixture and immutable archive.
- No new numbered KKP ID inferred from historical records.

## Owner requirements

- Canonical player names primary for every event and public identity surface; retain aliases as secondary metadata. This supersedes archive-alias-first.
- Preserve owner-authored export edits, all five events/125 matches, partial history, unknown scores, replacements/withdrawals, authored rules, links and Last Updated. Final integration depends on Master/Admin's reviewed content mapping.
- Preserve internal evidence without rendering it as public copy; retain genuine public notes.
- Preserve Hide Results, compact Last Updated, hero actions, lifecycle, navigation and responsive/accessibility behaviour.
- Validate acceptance/self-test, rendered active/archive identity/outcomes and provenance absence, PDFs and desktop/mobile; commit and push this branch only.

## OWNER-GENERATED CONFIG PRESERVED

Master preservation evidence: `C:/Users/Michael/Documents/ChatGPT/KKP Website Local/Archive/owner-retest-2026-10-05-06d65c1b/PRESERVATION.json`.

- Immutable owner basis: `owner/tournaments.config.js` in that archive, SHA256 `06D65C1BC84F538FF7CD87C4A400874184CA5C92603913C133B99E268D2407B6`.
- Canonical hash: `12D848C9DF22E48D089DD190FAF9EEDA1AA9FF3B42D4F56484FC39B2868D4A30`.
- Source: latest ec78096 Admin remediation retest export, 5 October 12:42:55. Original and archive are read-only for this task. Safe `SEMANTIC-DIFF.json` records owner changes and incidental old export defaults.

## Early authoritative contract proposal / Admin handoff

Minimal additive field: optional `provenance: string` on note-bearing participant, bracket match and result records (the audit currently requires matches only). Omission or an empty string means no recorded provenance. Preserve exact evidence wording and unknown fields through import/edit/export/reimport. It is exported in tournament data but never consumed by public page renderers, structured data or rules PDF generation. It is not confidential storage: the static config remains downloadable; this field separates presentation from audit evidence.

Existing `note` remains visitor-facing copy, as do authored description/questions/rules/stage strings. Do not implement broad keyword-based runtime hiding of notes. Explicit migration splits the verified clauses `screenshot evidence supplied by owner` and `owner-supplied historical recollection` from mixed match notes, preserving the remaining public clause. Restore canonical FERRET match provenance even where the owner export removed that suffix. Other research/confidence wording requires semantic review before migration.

`players[].name` remains the canonical reference/display name. Existing stable event/player/match IDs are not changed. `players[].inGameName` remains event alias, shown below the participant's canonical name using existing subdued metadata. Canonical references take priority over aliases. Exact, unique legacy alias references (verified in 2025 results/standings) resolve to canonical names for display while retaining the raw owner strings. Only the standings identity prefix changes in presentation; arbitrary authored prose is not rewritten. Ambiguous/unrecognised references remain unchanged. Owner-authored sf1 retains FERRET vs TBD, known AOD winner, replacement-playoff/qf2 links and both unknown scores: no upstream entrant is inferred.

Website owns `docs/TOURNAMENT-CONTRACT.md` and `tools/validate-site-config.mjs`. Validator enforces string provenance and rejects known internal evidence phrases in visitor-facing text outside this field, including nested records. Master relayed Admin compatibility: nullable optional string provenance on Participant/BracketMatch/ResultEntry, separate UX labels, exact owner-config semantic round trip and 12 existing regression groups passed. Final Admin combined fixture/preview gate follows this Website commit and is consolidated by Master.

## Verified cause

`getEventDisplayName`, `getEventDisplayText` and participant rendering in `data/tournaments-page.js` explicitly substituted archive aliases; the match header emitted `match.note` verbatim. Config contains mixed public/evidence notes. Rules generator already uses canonical participant names but alias metadata needs explicit labelling and output inspection.

Rendered review additionally identified stored `WTF.RAG`/`TRIORA` 2025 results/standings, `DR.MURKINSTEIN` 2025 standings and `NOBLESUB` Oceania entrants. Exact evidence: active 2026 player canonical `DR.MURK` has alias `Dr.Murkinstein`; 2025 contains that same canonical `DR.MURK`. Champions League player canonical `NOBLE` has alias `NOBLESUB`; Oceania contains that same canonical `NOBLE`. Rendering searches aliases across all events but only accepts a unique canonical identity present in the selected event, with selected-event canonical exact matches first. No prefix/substring/fuzzy guess. Known alias variants require no source mutation or extra schema mapping. Current contract documents this and Admin's explicit-commit alias/rename reference handling.

## Validation / delivery

Owner basis integrated following Master's explicit reviewed content mapping. `WEBSITE-TOURNAMENT-IDENTITY-PROVENANCE-MIGRATION.json` records 62 note/provenance migrations, including one canonical FERRET recollection recovery. Its reverse-migration assertion and Master's independent comparison prove JSON equality to owner basis in every other field: 5 events, 56 players, 125 matches. All owner renames, aliases, linked references, expanded rule wording/spelling, bracket title/links, date and safe exporter-default fields retained. Owner/canonical archived hashes reverified; original fixture and archive untouched.

PDFs regenerated using owner-authored rules and canonical participants. Existing Vera font cannot render the stylised alias; repository-bundled DejaVu Sans (official redistribution license alongside) is used only for PDF alias lines. All 5 PDFs/12 pages pass extracted canonical name/alias/rule/map/contact/provenance checks and have been rendered/visually reviewed. No banner/artwork changes; embedded owner-authored historical artwork remains intact.

Validation PASS:

- `npm run status`: isolated branch/base/dirty scope checked before implementation.
- `node tools/validate-site-config.mjs`: 5 events/125 matches and existing music/video/local assets passed.
- `npm run validate`: 63 checks; includes canonical-priority/ambiguous/unknown identity fixtures.
- `npm run validate:visual`: acceptance plus screenshots, 94 checks passed. Final `npm run validate:acceptance -- --json .validation/acceptance.json`: 94 checks, every public route at 320/390/768/1024/1440 and all existing functional suites.
- `npm run validate:self-test`: 12 detection/scope probes; all source bytes restored, including new public-evidence and invalid-provenance-type faults.
- `node tools/validate-browser.mjs --pages tournaments --profile standard --screenshots`: targeted baseline and both functional checks passed. Every event at 390/1440, 250 match comparisons, all cards/results/standings, public notes, unknown scores, runtime/overflow, rendered text/markup/JSON-LD evidence scan, plus unique provenance sentinels on all note-bearing record types.
- `python tools/validate-tournament-rules.py` (bundled Python): all five PDFs/12 pages, canonical names, all aliases including stylised Unicode, full authored paragraph/bullet/map/contact retention and provenance absence passed. Every page rendered with Poppler and visually inspected.
- Rendered screenshots reviewed for every event at mobile/desktop, including long secondary aliases, 2025 WTF/TRIO outcomes and DR.MURK standings, Oceania NOBLE entrants, Champions League withdrawal/unknown-score notes. Hero/actions/archive and compact Last Updated retained. Screenshot evidence remains locally under `.validation/screenshots/tournaments` and `.validation/pdf-review`.
- Development review server serves loopback only; tournament page returns 200, repository metadata is not served. Launcher and URL are in the handoff.
- `git diff --check` passed. Owner original and immutable archive retain SHA256 `06D65C1B…407B6`; candidate physical SHA256 `048CB8D065714F6361C951B13F497E859FE0F2CB5FF477B2C7E301EA09C0A55C`. Git may normalize line endings; semantic retention is the authoritative comparison.

Durable full automatic evidence: `WEBSITE-TOURNAMENT-IDENTITY-PROVENANCE-VALIDATION.json`; migration evidence and owner preview/testing: companion MIGRATION.json / HANDOFF.md.

Manual / unverified: owner acceptance, physical devices/touch, real assistive technology, non-Chromium/true zoom and live external service delivery. Final Admin actual-site preview is a coordinated delivery gate after this Website anchor is pushed. Master reported existing Admin 12-group and owner/provenance round-trip compatibility passing; no claim here of the final combined gate.

Owner semantic diff retained: 258 field differences, 25 player-name edits, 144 entrant/winner field edits (including explicitly authored TBD), 9 result-name edits, 16 stage-entry differences, four explicit Champions League aliases, expanded rules in four archives, bracket title/eight upstream links, active Last Updated 5 October and safe empty exporter defaults. Rule wording/spelling preserved. No owner decisions needed.

Commits/remote: this coherent implementation is committed on `codex/tournament-identity-provenance` from `f857b21d0a1003fb565b51f89b133a50c91f9732`; exact final HEAD/remote and clean-state evidence are recorded in the final handoff after commit/push. No merge/deploy. Protected canonical main, legacy checkout/artifacts, historical worktrees, Admin/Master, retest source and immutable archive were not modified.

Owner acceptance is CHANGES REQUESTED for the preceding Admin review; this new Website follow-up is not accepted, merged or deployed.
