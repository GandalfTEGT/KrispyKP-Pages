# Website → Master/Admin: tournament owner-retest follow-up

Owner action after consolidated gate: TEST. Website implementation is VALIDATED; final Admin combined preview follows the Website anchor commit. No merge/deploy authority.

## Single contract and exact legacy mapping

Use `docs/TOURNAMENT-CONTRACT.md` in this worktree. Optional `provenance: string` on note-bearing participants/matches/results is exported non-rendered audit metadata, not confidential storage. `note` remains public copy. 62 explicit note splits preserve evidence, including the FERRET canonical-baseline recollection recovery. Owner basis is otherwise semantically unchanged (5 events/56 players/125 matches), independently verified by Master.

Display resolution: exact selected-event canonical name first; then exact aliases (case-insensitive, trimmed) with exactly one canonical owner present in the selected event. Alias evidence may come from another event only if that same canonical player is present in this event. No substring/prefix/fuzzy matching or upstream entrant inference.

Verified legacy variants requiring this cross-event exact alias lookup:

- 2025 Group A standings entry `DR.MURKINSTEIN — 1 pt (0-4-0)` → display `DR.MURK — 1 pt (0-4-0)`. Selected 2025 canonical participant is `DR.MURK`, whose event alias is `DR.MURKINSTEIN APC ENGIED ME ON STREAM`. Exact additional evidence: active 2026 has the same canonical `DR.MURK` with alias `Dr.Murkinstein`; therefore the stored short reference is an exact existing alias of that same canonical identity, not a inferred prefix of the long alias.
- Oceania bracket references `NOBLESUB` → `NOBLE`. Oceania canonical participant is `NOBLE`, alias `noble sub`; Champions League contains canonical `NOBLE`, exact alias `NOBLESUB`. No removal of spaces or fuzzy matching required.
- 2025 `WTF.RAG` → `WTF` and `TRIORA` → `TRIO` are exact selected-event aliases.

Standings resolve only the identity prefix before the authored points/context separator. Public notes/rules/descriptions are not rewritten. Owner export retains all raw references, including these legacy strings. Unknown or ambiguous identities remain authored text. The sf1 FERRET/TBD entrants, AOD winner, blank scores and linked upstream IDs remain exactly owner-authored.

Admin passive import/open/export must preserve source. Intentional canonical/alias commits may normalize unambiguous linked references to the canonical name, using the same identity evidence and canonical priority before editing; arbitrary prose/ambiguous references remain untouched. The authoritative contract records this dependency.

## Owner preview

Double-click `Review-Tournament-Changes.cmd` at this isolated worktree root. Leave its window open, then open `http://127.0.0.1:4185/tournaments/`. The server binds only loopback and serves this task checkout's public site files. Stop with Ctrl+C; this does not publish or modify any config. If 4185 is occupied, `node tools/serve-review.mjs 4186` uses another local port.

Retest active 2026 and all four archives: canonical participant names with smaller In-game aliases; bracket/winner/placement/group-standing names canonical; public replacement/unknown-score notes retained and evidence text absent. Check 2025 champion WTF/runner-up TRIO and DR.MURK Group A entry; Oceania bracket NOBLE. Check Champions League sf1 keeps TBD/blank scores with known AOD winner and replacement-playoff/qf2 links. Active Last Updated is 5 October 2026 in compact metadata. Hide Results must work by keyboard and survive refresh; archive outcomes remain visible. Open each Rules PDF to review owner-authored rules/canonical participant names/secondary aliases, including the stylised KRISPY alias.

## Final evidence

PASS: standard 63 checks; final acceptance 94 checks (7 public routes × 5 widths plus all existing functional suites); self-test 12 probes/all bytes restored; all 5 PDF documents/12 rendered pages; every event at 390/1440 with 250 match comparisons and rendered text/markup/JSON-LD provenance/sentinel omission. Canonical-priority, ambiguous-alias and unknown-identity fixtures also passed. Hide Results/keyboard/persistence/storage fallback/archive isolation, compact Last Updated, hero actions, navigation and responsive behaviour retained. Rendered screenshots reviewed across all five events; all PDF pages reviewed for glyphs/typography/pagination.

Full durable evidence: `WEBSITE-TOURNAMENT-IDENTITY-PROVENANCE-VALIDATION.json`. Requirements/data retention: `WEBSITE-TOURNAMENT-IDENTITY-PROVENANCE.md` and `WEBSITE-TOURNAMENT-IDENTITY-PROVENANCE-MIGRATION.json`. Candidate physical config hash `048CB8D065714F6361C951B13F497E859FE0F2CB5FF477B2C7E301EA09C0A55C`; source/immutable owner hash remains `06D65C1BC84F538FF7CD87C4A400874184CA5C92603913C133B99E268D2407B6`.

Manual / unverified: owner acceptance, physical devices/touch, real assistive technology, non-Chromium/true zoom and live external services. Admin's original-owner/provenance round trips and 12 existing groups passed per Master; final Admin combined actual-site preview remains required after the Website anchor. No owner content ambiguity/decision remains.

Branch `codex/tournament-identity-provenance`; base `f857b21d0a1003fb565b51f89b133a50c91f9732`. Exact final commit/remote/clean evidence follows commit/push. Website main, Admin, Master, original retest fixture, immutable archive and historical worktrees are preserved. No merge/deploy.
