# WEBSITE-OCEANIA-HISTORICAL-CORRECTION — Same review chain

## Status

READY FOR OWNER TESTING (Website validation complete), 5 October 2026. Owner accepted the preceding Website `a08c39b590296bc35b06500b3ffb9203a5b0cd04` and Admin `9f94c5d16391ee38bb1395e26471009bd0f94821` coordinated follow-up. This is a minimum historical correction on the existing branch, not merge/deploy authority. Exact committed Admin compatibility follows the Website implementation anchor.

## Starting state

Clean `codex/tournament-identity-provenance` at `a08c39b590296bc35b06500b3ffb9203a5b0cd04`, freshly verified remote branch same; main remains `f857b21d0a1003fb565b51f89b133a50c91f9732`. Existing isolated worktree `website-tournament-identity-provenance`. `npm run status` checked. Original archives/owner export and canonical/reference checkouts remain protected.

## Authoritative owner evidence

Source: https://challonge.com/vaxcgqjl and owner's explicit evidence classification. Browser-tool source retrieval was unavailable to Master; this correction uses the owner's classification and does not claim independent recovery of knockout data.

- VERIFIED: 6 participants, 15 round-robin matches/scores and round-robin standings.
- SUPPORTED: two-stage configuration and intended knockout/final stage.
- UNKNOWN: whether knockout was played, actual qualifiers, knockout matches/scores and overall champion/final placements.

Do not create knockout matches, inferred qualifiers, guessed scores, champion or final placements.

## Implemented minimal mapping / Website → Master/Admin handoff

Add optional event `resultsScope: "round-robin"`; omitted/`"overall"` retains existing final-placement semantics. For this event, the existing six `results` records represent VERIFIED round-robin ranks/statistics only, NOT overall placements. Retain them and the six existing `stageSummaries` entries unchanged; existing duplicate presentations are preserved, both explicitly labelled `Round Robin Standings`. Keep all 15 matches/scores/winners and six canonical participants/aliases intact. No new standings model, lifecycle value or empty-results exception is required.

Change `format` to `Round Robin; planned knockout`, `bracketTitle` to `Round Robin Matches`, stage title to exactly `Round Robin Standings`. Use the existing public `description` for a concise verified-stage/unknown-outcome explanation. Keep owner-authored rules verbatim: they document the intended stage, not proof it occurred. Keep `completed` as a historical archive state; the explicit scope prevents its standings from being presented as overall tournament placements.

Extend existing optional string `provenance` to the event record for detailed VERIFIED/SUPPORTED/UNKNOWN classification/source/authority. It remains exported audit metadata and is never rendered. Public description is distinct from internal classification. Website contract/validator remain the sole authority; Admin needs only preserve this optional field/value and event provenance through round trips/preview/export. No unrelated UI/schema changes or second contract.

## Owner requirements and evidence

| Requirement | Result / evidence |
| --- | --- |
| Six verified participants and 15 round-robin matches/scores; retain standings | PASS: preservation proof restores exactly the six changed metadata/text paths to reproduce the complete accepted baseline. All six players/aliases, 15 matches/scores/winners/notes/links, six result rows, six stage entries and authored rules are unchanged. All five events/56 players/125 matches survive. |
| Clearly scoped standings; no invented overall outcome or knockout bracket | PASS: optional `resultsScope: "round-robin"`; exact Round Robin Standings headings on results, desktop stage section and mobile disclosure, plus stage title. Round Robin Matches bracket heading and public description distinguish the played round robin from the planned stage. No new match, qualifier or outcome records. |
| Detailed classification internal, concise public explanation | PASS: event provenance retains source/authority and VERIFIED/SUPPORTED/UNKNOWN classification. Browser body/markup/JSON-LD sentinel checks prove event/record provenance omitted. Public explanation is visible on the page and updated PDF, with classification labels absent. |
| Preserve accepted behaviour and one contract | PASS: sole Website contract/validator updated; no lifecycle/empty-results exception. Existing identity, aliases, public notes, unknown scores, Hide Results and Last Updated tests retained. Optional invalid scope and empty completed scoped standings are rejected. Admin retains optional extensions without a second schema. |
| Existing review chain, protected owner data and original exports | PASS: same Website branch/worktree; immutable archive and original export hashes unchanged. Canonical/main and legacy checkout were inspected and remain unchanged. New correction still requires owner retest. |

## Files changed

- `data/tournaments.config.js`: six Oceania paths only (`resultsScope`, event `provenance`, `format`, `description`, `bracketTitle`, stage title).
- `data/tournaments-page.js`: scoped table/standings headings, reset when another event is selected.
- `docs/TOURNAMENT-CONTRACT.md`, `docs/VALIDATION.md`: sole contract scope/provenance semantics and validation coverage.
- `tools/validate-site-config.mjs`, `tools/self-test-validator.mjs`: optional scope enum plus strict existing completed-results requirement; two additional negative probes.
- `tools/validate-tournament-identity.mjs`: Oceania facts, labels, public explanation, event provenance sentinel omission and same-page heading reset.
- `tools/generate-tournament-rules.py`, `tools/validate-tournament-rules.py`, `assets/trules/td-oceania-2023-rules.pdf`: public stage/outcome explanation in the two-page rules PDF, authored rules retained. Other four PDF bytes unchanged.
- This task, preservation/validation reports and preceding task/handoff status: accepted revision retained as historical evidence; correction delivery distinguished.

## Validation / delivery

- PASS `npm run validate -- --json .validation/oceania-standard.json`: 63 standard checks.
- PASS `npm run validate:self-test`: 14 fault/scope probes; all source bytes restored.
- PASS bundled Python `tools/validate-tournament-rules.py`: five documents / 12 pages; canonical names, aliases, all authored rules/maps/contact and provenance omission. Only the regenerated Oceania PDF's two pages required new visual inspection; both reviewed.
- PASS targeted local rendered review at 390/1440: description, format, scoped ranked table and mobile/desktop standings remain readable; public internal classifications omitted.
- PASS `.validation/prove-oceania-preservation.mjs`: durable `WEBSITE-OCEANIA-HISTORICAL-CORRECTION-PRESERVATION.json`; candidate physical hash `2D2E4295AA5D830B137FDFA1FE1B102C44E459227292D94289E02A7E604E8089`. Master independently obtained the same six-path proof and hash.
- PASS `npm run validate:acceptance -- --screenshots --json .validation/oceania-acceptance.json`: 94 checks, all seven public routes at five widths plus existing functional suites. All five events at 390/1440, 250 match comparisons, exact scoped/default headings, same-page selection, identity and event/record provenance omission pass. Rendered Oceania details/tables/participants/bracket reviewed at both widths. Full durable evidence: `WEBSITE-OCEANIA-HISTORICAL-CORRECTION-VALIDATION.json`. The added same-page selection assertion initially read before the existing deferred render; it now waits for the rendered heading. No production timing change was needed.
- Admin interim evidence: 16 regression groups, 15 edit cases and 10 rendered previews PASS per Master; final exact committed Website fixture is still pending. Admin writes only its authorised project.

## Manual / unknown boundary

Owner retest is required for this new correction. Physical devices/touch, real assistive technology, non-Chromium browsers, true zoom and live external services are not established by the automated checks. No independent knockout-source recovery is claimed. No merge/deploy authority.

## Committed Website anchor / Git delivery

Validated implementation anchor: `f360613fd0723743c20e51b5e14cedbcc1d9c735` — Scope Oceania historical standings to verified round-robin stage. Committed and pushed to `https://github.com/GandalfTEGT/KrispyKP-Pages`, branch `codex/tournament-identity-provenance`. Fresh remote verification returned that exact task tip and unchanged main `f857b21d0a1003fb565b51f89b133a50c91f9732`. Worktree was clean immediately after push. Base remains `f857b21d0a1003fb565b51f89b133a50c91f9732`; accepted preceding revision `a08c39b590296bc35b06500b3ffb9203a5b0cd04` remains in ancestry.

Admin may anchor its exact compatibility/retest fixture to this implementation commit; a later evidence-only handoff commit will not change Website/config/PDF/contract content. Master owns consolidated compatibility/acceptance records. Final branch HEAD/remote equality is recorded locally in `.validation/WEBSITE-OCEANIA-HISTORICAL-CORRECTION-DELIVERY.json` after the metadata commit and returned in the closing summary.

Canonical Website checkout remains clean at main `f857b21d0a1003fb565b51f89b133a50c91f9732`. Protected legacy checkout remains at `318cf656b34910b866fbfba5cfa1bd9e266e1c13` with exactly its six pre-existing untracked browser artefact entries. Original owner/export/archive hashes remain those in the preservation proof. No merge, deployment, direct-main write or reference-checkout modification.

The first push attempt was rejected by automatic approval review for insufficient visible destination authorisation. The human-supplied bootstrap was re-read: it names this exact repository and explicitly directs committing/pushing authorised task branches. That evidence was presented for review; the authorised retry succeeded. No workaround or alternate transport was used.

## Owner retest

Use existing `Review-Tournament-Changes.cmd` and open `http://127.0.0.1:4185/tournaments/?event=td-oceania-championship-2023`.

1. Confirm both tables say **Round Robin Standings** and the concise explanation says knockout play/overall outcomes are unknown. Check six players and 15 round-robin matches/scores; no knockout bracket or overall champion/final placements appear.
2. Open the Oceania rules PDF: planned-stage authored rules remain, canonical participants/secondary aliases remain, and the public limitation appears before the rules.
3. Switch to another archive and back; normal Results/Group Standings headings reset. Check active Last Updated and keyboard Hide/Show Results/refresh persistence retain their accepted behaviour.
4. Use Admin's separate `Start-Oceania-Retest.cmd` to test save/reopen, preview, generation/reimport preservation of scope and event provenance. The previously accepted Admin retest fixture/state is retained separately.

Owner decisions needed: NONE for implementation. Acceptance of the preceding revisions does not accept these new changes.
