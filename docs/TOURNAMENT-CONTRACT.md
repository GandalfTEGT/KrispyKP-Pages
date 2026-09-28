# Tournament website and Builder contract

## Authority and transport

`data/tournaments.config.js` is the public tournament source of truth. The website reads it directly. The private KKP Tournament Builder imports it through `tools/export-tournament-config.mjs`, preserves every production event, writes the same schema, generates rules PDFs through `tools/generate-tournament-rules.py`, and validates candidates through `tools/validate-site-config.mjs` before writing.

Unknown values remain blank. The Builder must never convert missing scores, dates, placements, participants or evidence into guessed values. A match winner may be known while either score remains blank. Withdrawals, replacements and historical uncertainty remain in the relevant participant, match or result note unless a future public schema change introduces a structured field.

## Lifecycle

| Status | Meaning | Required behavior |
| --- | --- | --- |
| `upcoming` | Event has not started | Results remain empty. |
| `live` | Event is actively in progress | `startDate` and `lastUpdated` are required; spoiler control applies. |
| `awaiting-results` | Event has started but final publication is incomplete | `startDate` and `lastUpdated` are required, registration is `closed` or `none`, partial results are allowed, and spoiler control applies. |
| `completed` | Historical results are published | Placements are required; archive results display normally. |
| `cancelled` | Event did not complete | Kept in the archive without invented outcomes. |

`statusOverrideExpires` may bound an exceptional live window. The public validator remains authoritative for stale-date and status contradictions.

## Identity semantics

`players[].name` is the canonical identity used to correlate the participant across events and by bracket/result references. `players[].inGameName` is the event-specific or historical alias. Current events show canonical identity first and the in-game name as context. Completed/cancelled archive pages show the historical alias first and retain `Canonical identity: …` as secondary context. Results, bracket entrants/winners and stage summaries use the same archived display identity without changing source data.

## Stages, results and presentation

`manualBracketGroups` is an ordered, flexible set of groups, rounds and matches. Group keys and titles are authored data rather than a fixed winners/losers template. `stageSummaries` is an ordered set of titled string entries. `results` contains published placements. Scores use string-compatible values so blank/unknown and historical formats survive round trips.

For `live` and `awaiting-results`, Hide Results is a local presentation preference. It suppresses the results, stage summaries and bracket progression from visual and accessibility interaction while leaving participants, rules, schedule, description and source links available. Completed/cancelled archive events never inherit that hiding.

## Compatibility matrix

| Capability | Website | Builder | Regression evidence |
| --- | --- | --- | --- |
| Five lifecycle values | Validates/renders | Imports/edits/validates | Builder lifecycle test + site validator |
| `lastUpdated` / override expiry | Renders compact metadata / validates | Explicit editable fields | Production awaiting-results fixture |
| Canonical identity + event alias | Archive-aware presentation | Clearly labelled fields | Browser historical identity test |
| Flexible stage groups | Renders any ordered group/round shape | Imports/edits/preserves | All-event semantic round trip |
| Unknown score + known winner | Renders blank score and winner | Preserves independently | Builder partial-history test |
| Results and stage summaries | Renders archive outcomes | Editable collections | All-event semantic round trip |
| Spoiler presentation | Live and awaiting-results | Actual-site preview | Browser persistence/fallback/history test |
| Rules PDF | Static linked output | Shared generator | Builder generation regression |

Any schema change must update the public validator, this contract, the Builder model/editor, and both regression suites in the same programme change.
