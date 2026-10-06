# Structured content consumer requirements — proposed

Preparation only, 6 October 2026. This is a dependency checklist for a later executable Website/Admin checkpoint, not an enabled protocol. Read `SITE-STRUCTURED-CONTENT-PREPARATION.md` for the observed source map and proposed model.

## Handshake and compatibility

Website should expose a structured protocol version and separately declared capabilities for Music catalogue, playlists, lyrics, Video authored projection and structured artwork usages. Discovery must identify the exact source baseline, schema versions, supported operations, immutable IDs, read-only regions and verified tool closure. Proposed names `structured.music.v1`, `structured.lyrics.v1`, `structured.video.v1` are placeholders until frozen by executable delivery. Older consumers must refuse an unsupported request/version with a useful explanation. Absence of declaration means read-only; never infer capability from a filename or a renderer's optional field.

Preserve the existing B content, D layout, page v1/v2 and media v1 declarations independently. Legacy snapshots must still render without a new authored JSON file; missing visibility means the current public baseline. Do not retroactively change B's temporary artwork/logo rules. Admin must independently verify new committed source/tool/dependency hashes and accepted checkout line endings, including added parser dependencies if any. Existing 67-file media trust and 1,141-file decoder closure are a baseline, not automatic trust for added tools or structured artwork scanning. Pins are refreshed through explicit verified rebase, not filename-based acceptance.

## Candidate, history and export boundary

1. Inventory immutable source identities, unknown fields, generated inputs, asset usages and every affected route from the exact snapshot. Report unavailable editing operations clearly.
2. Store edits as typed operations with stable target ID, explicit field, expected old value, baseline source digest and declared capability. Distinguish absent, null and empty. Reject duplicate/conflicting operations, stale baseline, missing target and identity or locked-field changes.
3. Compute one net plan with B/D/page/media/structured edits together. Resolve virtual media imports and all surviving usages before applying outputs; one writer per output, compatible operation composition, bounded paths and bytes. Review all shared artwork usages rather than changing only one runtime projection.
4. Apply only inside a private candidate; output inventory/digests must match the reviewed plan. Preserve authored input, imported snapshot and unknown fields for history/recovery. Cancel/undo/redo/replay must restore exact semantics and baseline identities. Refuse unsafe or mismatched source instead of repairing silently.
5. Filter Admin-private drafts before producing the public request/plan. Public output contains no private titles, lyrics, notes, IDs/references or new private-only media. Owner review may include private data only in its separate private artifact. Public hidden entries and private drafts remain distinct. Existing public media cannot be claimed redacted.
6. Rebase explicitly against updated Website sources and tool closure. Report old-value/source conflicts and generator changes; no auto-overwrite. Recovery must survive reordered arrays, Unicode lyrics, orphan preservation and interrupted projection.

Readonly outputs include `data/videos.generated.js`, external YouTube metadata/thumbnails and any eventual compiled runtime data. Only Website's declared projection may write them in a candidate. No Admin edits to generator scripts/workflows, runtime Home constants, shared shell/layout/tournament source or active Website checkout.

## Required executable evidence

| Area | Minimum proof before enabling edits |
|---|---|
| No-op / legacy | Exact public parity with the 60-track, four-playlist, nine-lyrics, eight-category/nine-tab baseline; all stable IDs, media refs and generated metadata preserved; older consumers refuse new requests without mutation. |
| Literal source | Comments/unknown fields/line endings and untouched bytes retained; duplicate/dynamic JS and injection refused without execution; existing orphan survives; new dangling lyrics/playlists refused. |
| Music | Metadata, availability, visibility and exact reorder; ALL/CUSTOM semantics; curated membership; missing/multiline/Unicode lyrics; Home fanout; hidden deep-link refusal; no autoplay; browser-local selection preserved. |
| Video | Durable overrides survive offline projection and a synthetic refreshed import; original metadata preserved; latest/tab/category ordering and date differences; eligible feature selection; hidden/private items absent from every fanout; missing IDs and invalid YouTube IDs refused. |
| Media | Explicit track-artwork usage and shared edge completeness; existing MP3 references retained; sanitized image bytes/usage validation; private-only imports omitted; crop remains framing rather than redaction. |
| Mixed plan | B/D/page/media/structured maximum candidate; output and old-value conflicts; staged asset resolution; private owner/review/public export; digest mismatch/tamper/path/resource refusal; undo/cancel/replay/recovery and rebase against updated pins. |
| Refresh | Offline rebuild uses zero network/credentials; actual external refresh remains unsupported unless declared. Later adapter tests use bounded fixtures for provenance, host/redirect/private-address refusal, timeout/cancel, byte/page caps and unavailable/deleted entries without destructive removal. |
| Browser | Music/Videos/Home at width thresholds and small/desktop widths; long text and empty/single/max lists; playlist links, lyrics toggle, search/sort/pagination, keyboard/focus and asset checks. Existing full acceptance/tournament regressions pass. |

Receipts must bind baseline, request, tool/consumer pins, authored source, import provenance and final candidate/output hashes; retain expected failures as evidence. Native Admin pointer/keyboard/DPI/zoom/assistive and subjective playback/visual checks remain MANUAL / UNVERIFIED unless directly observed. No preparation fixture establishes those checks, an external service refresh, owner acceptance, publishing or deployment.
