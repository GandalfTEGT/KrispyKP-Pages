# Tournament website and Builder contract

## Authority and transport

`data/tournaments.config.js` is the public tournament source of truth. The website reads it directly. The private KKP Tournament Builder imports it through `tools/export-tournament-config.mjs`, preserves every production event, writes the same schema, generates rules PDFs through `tools/generate-tournament-rules.py`, and validates candidates through `tools/validate-site-config.mjs` before writing.

Unknown values remain blank. The Builder must never convert missing scores, dates, placements, participants or evidence into guessed values. A match winner may be known while either score remains blank. Withdrawals, replacements and unknown scores remain in the relevant public participant, match or result note. Evidence explaining how historical information was established belongs in `provenance`.

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

Owner decision, 5 October 2026: canonical name is primary for ALL events, including completed/cancelled archives. This explicitly supersedes the previous archive-alias-first display rule; historical task checkpoints are evidence of the superseded behaviour.

`players[].name` is the canonical identity/reference name and primary public display name. Bracket entrants/winners, placements/results and authored stage/standings entries reference that canonical name. Canonical renames must propagate to linked references without changing existing stable event/player/match IDs. `players[].inGameName` is the separate event-specific or historical alias; retain it through every round trip and display it as subdued, labelled secondary participant metadata (`In-game: …`). Rules PDFs also use canonical participant names first with secondary labelled aliases. Do not substitute aliases into outcomes or authored prose.

For preserved legacy outcome references that already contain an alias, resolve an exact, unique alias to its canonical player for display (case-insensitive and ignoring surrounding whitespace). An alias recorded in another event can resolve only when that same canonical player is present in the selected event: this covers legacy `DR.MURKINSTEIN` and `NOBLESUB` without fuzzy matching or new source edits. Canonical references take priority over alias matches. Stage/standings entries resolve only the identity prefix before the points/context separator, preserving the authored remainder. Unknown or ambiguous references remain unchanged; do not invent a player or infer an entrant from an upstream link. Source data and owner-authored prose remain intact.

Admin opening/import/export alone preserves source references exactly. Upon an intentional alias edit, commit only unambiguous references linked to the previous alias as that player's existing canonical name so changing the alias cannot orphan them. Upon a canonical rename, update its canonical and unambiguous alias-linked entrant/winner/result references and standings identity prefixes to the new canonical name. Apply the same canonical-priority/unique-identity rules before editing; leave ambiguous references, unrelated prose and historical alias metadata untouched. Do not silently normalize every imported historical string.

## Public notes and internal provenance

`note` on participants, bracket matches and results is visitor-facing copy. It is exported and may be rendered. Examples: withdrawal/replacement explanations, the match format, or a known winner with an unknown score. Other authored public strings (rules, descriptions, questions and stage entries) remain public.

Optional `provenance: string` on those same note-bearing records contains internal evidence/research context. Omission or an empty string means no provenance recorded. It is exported and preserved exactly by import/edit/export/reimport, including when public notes change. It is NEVER rendered by public tournament pages, structured data or rules PDFs. This is non-rendered audit metadata in downloadable public source, not confidential storage. Preserve unknown extension fields as well.

Split mixed notes by semantic intent: `Group stage · screenshot evidence supplied by owner` becomes `note: "Group stage"`, `provenance: "screenshot evidence supplied by owner"`. The FERRET replacement and AOD unknown-score public clauses remain public while `owner-supplied historical recollection` is preserved in provenance. Recover previously established evidence from the preserved canonical basis even when an owner export removed its public suffix. Never delete evidence to suppress it or blanket-hide genuine public notes.

The public validator checks provenance is a string and retains UTF-8/control-character checks. Known internal evidence phrases in public strings fail validation and require explicit separation; the runtime never guesses whether an arbitrary note is public. Admin labels the fields Public note and Evidence / provenance (not shown to visitors) and uses this contract as the sole schema authority.

## Stages, results and presentation

`manualBracketGroups` is an ordered, flexible set of groups, rounds and matches. Group keys and titles are authored data rather than a fixed winners/losers template. `stageSummaries` is an ordered set of titled string entries. `results` contains published placements. Scores use string-compatible values so blank/unknown and historical formats survive round trips.

For `live` and `awaiting-results`, Hide Results is a local presentation preference. It suppresses the results, stage summaries and bracket progression from visual and accessibility interaction while leaving participants, rules, schedule, description and source links available. Completed/cancelled archive events never inherit that hiding.

## Compatibility matrix

| Capability | Website | Builder | Regression evidence |
| --- | --- | --- | --- |
| Five lifecycle values | Validates/renders | Imports/edits/validates | Builder lifecycle test + site validator |
| `lastUpdated` / override expiry | Renders compact metadata / validates | Explicit editable fields | Production awaiting-results fixture |
| Canonical identity + event alias | Canonical-first for every event; secondary participant alias | Clearly labelled separate fields; rename propagation | All-event browser identity/outcome tests + semantic round trip |
| Public note + provenance | Public notes rendered; provenance never rendered | Separate fields; both exported/preserved | Validator negative probes + rendered phrase scan + round trip |
| Flexible stage groups | Renders any ordered group/round shape | Imports/edits/preserves | All-event semantic round trip |
| Unknown score + known winner | Renders blank score and winner | Preserves independently | Builder partial-history test |
| Results and stage summaries | Renders archive outcomes | Editable collections | All-event semantic round trip |
| Spoiler presentation | Live and awaiting-results | Actual-site preview | Browser persistence/fallback/history test |
| Rules PDF | Static linked output | Shared generator | Builder generation regression |

Any schema change must update the public validator, this contract, the Builder model/editor, and both regression suites in the same programme change.
