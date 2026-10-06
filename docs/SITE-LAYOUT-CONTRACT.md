# D1 — bounded Website layout and selection contract

D1 extends approved B without changing the public site's default appearance, copy or DOM order. It declares actual About sections/cards; it does not turn bespoke pages into a generic renderer. Standing owner authority permits technical handoff to Admin D2 without an intermediate owner-testing gate. Main integration/deployment remain held.

## Real component library and locks

`data/site-layout.json` schema/protocol1, adapter `about-layout-v1`, contains eleven stable `data-kkp-layout-id` identities: About main, locked hero, four existing body sections, feature-card grid and its four articles. Existing eleven content IDs remain independent and unchanged. The current About geometry/text/links match approved B at320/390/699/700/701/979/980/981/1440. Default `data/site-layout-state.json` has existing semantic order and no overrides; generated stylesheet contains only a comment. Only About loads that stylesheet.

Supported parent/member relationships:

| Target | Allowed operation / member scope |
|---|---|
| about.page | setOrder of overview-section, features-section, platforms-section, purpose-section; resetProfile for the whole profile. Locked hero remains first. |
| about.features.grid | setOrder of streaming/videos/music/tournaments cards; setGrid and resetProfile. |
| about.feature.streaming / videos / music / tournaments | setSpan and resetProfile. |
| Four section IDs | Selection explains movement through parent about.page; `reorderWithinParent` is a UI affordance, not a CLI operation. |
| about.hero | Locked layout; heading/introduction remain editable only through B content identities. |

All other layout, Home layout, shared shell/navigation/metadata, inner card content/media, add/delete/duplicate/reparent, absolute coordinates and arbitrary CSS remain locked. Reordering changes actual source/DOM order, never CSS `order` or absolute placement. Source mapping validates unique IDs/tag/nearest managed parent and exact direct child order. A malformed source, extra identity, changed parent/profile or generated CSS drift is read-only/refused.

## Stored, inherited and effective values

Profiles are wide>=981 (max3 columns), medium701–980 (max2), compact<=700 (max1; Admin supported minimum viewport280). Source CSS uses those exact media queries; threshold-neighbour validation includes699/700/701 and979/980/981. The generated stylesheet is loaded after existing About/shared styles. An explicit grid uses `repeat(N,minmax(0,1fr))`, no hard width/height. Approved alignment variants: stretch/start/center. A card span is an integer1..effective columns; no row-height/row-span controls in this first library.

Wide → medium → compact inheritance applies automatically. A wide3-column grid/span3 becomes medium2 and compact1 unless an explicit override exists. This automatic cap is a safe intrinsic projection, not a silently rewritten stored value. Read returns `layoutState.overrides`, per-target `storedProfiles` (null means absent), and separate effective grid/cards with sourceProfile/inherited/clamped/requested values. Inspector preconditions must use **stored** values, never effective values.

Grid defaults are native existing auto-fit when no override/inherited grid exists. Spans cannot be stored without an explicit or inherited grid. `resetProfile` on a target removes only that stored value and re-exposes inheritance; on about.page it clears the whole chosen profile. Resetting the final explicit grid while spans still depend on it is refused: reset dependent spans in the same batch, or reset the whole profile. Global order is independent of profiles. A source profile change, arbitrary value or invalid span is blocking. DOM/keyboard/visual reading order and overflow are verified at280–1440, not assumed from JSON.

## Typed projection and CLI

Use the fixed reviewed entry point `node tools/layout/cli.mjs`; no manifest executable/plugin loader. `read` and `bridge` add layout metadata/private selection preparation; plan/materialise/validate/snapshot forward to the existing bounded management pipeline. Consumer JSON retains B's protocol/capabilities and adds:

```json
{"layout":{"protocolVersion":1,"capabilities":["layout.order.v1","layout.grid-span.v1","layout.profiles.v1","preview.selection.v1"]}}
```

Read returns COMPATIBLE/requiresValidation with exact `layoutContractSha256`, `layoutFingerprint`, `layoutState`, `effective` and labelled bindings/allowed operations. Unsupported required semantics return ADMIN_UPDATE_REQUIRED; malformed mappings/state/parity return UNVERIFIED. Neither state enables arbitrary writes. B content read continues separately. Existing immutable snapshot/source comparison remains required for source drift/rebase; fresh map parsing is not a replacement for snapshot integrity.

Request retains schemaVersion/baselineSha256/contractSha256/operations/expectedFiles/allowedOutputs. Add `layoutContractSha256` and optional `layoutOperations` (max40). Operation keys remain exactly id/kind/expectedOld/value. Supported kinds:

```json
{"id":"about.features.grid","kind":"setGrid","expectedOld":null,"value":{"profile":"wide","columns":3,"alignment":"stretch"}}
{"id":"about.feature.streaming","kind":"setSpan","expectedOld":null,"value":{"profile":"wide","span":2}}
{"id":"about.features.grid","kind":"setOrder","expectedOld":["about.feature.streaming","about.feature.videos","about.feature.music","about.feature.tournaments"],"value":["about.feature.tournaments","about.feature.music","about.feature.videos","about.feature.streaming"]}
{"id":"about.features.grid","kind":"resetProfile","expectedOld":{"columns":2,"alignment":"start"},"value":{"profile":"medium"}}
```

`setGrid` expectedOld is the stored `{columns,alignment}` or null; `setSpan` expectedOld is stored integer or null; `setOrder` uses the actual stored member array; whole-profile reset on about.page expects the complete stored profile object. No duplicate target/profile net operations. B content operations and layout operations can share one request: text/link/image edits are projected first, then semantic layout/order. The existing content binding identities and unknown/unmanaged source bytes are retained.

For any nonempty layout batch, expectedFiles must include exactly About HTML, layout-state JSON and generated CSS (plus any other B managed file touched). Declaration JSON is immutable, not an output. Outputs are exactly the actual changed subset of those files plus any B outputs. Plan computes it; materialise requires it. Empty/reset/no-op batches preserve original bytes. A pure empty net state is `operations:[]`, `layoutOperations:[]`, `expectedFiles:{}`, `allowedOutputs:[]` with the pinned baseline and B contract identity; don't replay every historical operation against an already changed candidate.

Snapshot/materialisation retains root containment, symlink refusal, exact immutable baseline and old-value/file checks, private receipts, deterministic output/preservation verification, ordinary-error rollback and interrupted-candidate discard/regeneration. Admin owns journal/undo/recovery/rebase. Unknown source drift cannot silently update a frozen draft. No layout operation alters tournament data, shared logo/media, header/footer or navigation.

PASS candidate receipts bind baselineSha256, candidateSha256, B contractSha256 and layoutContractSha256, exact changedFiles, plus requestSha256 and consumerSha256 (uppercase SHA256 of compact Node JSON.stringify on the parsed request/consumer, preserving property order). Retain the exact typed input objects/JSON property order; do not compare pretty-print file bytes to these digests. Any edit/history/net-operation/contract/source change invalidates the current preview/handoff proof. Process success alone is insufficient; require PASS and matching identities. Repository/main/publication gates remain NOT_RUN for snapshots.

## Host-only actual Website selection bridge

`tools/layout/bridge.mjs` is reviewed development tooling that creates a **private** script receipt (`exportable:false`); it is not loaded by public HTML. Admin injects that fixed script into its actual WebView2 candidate, not a duplicate renderer. Never write the injected DOM/overlay/script receipt into source/public assets or handoff exports. The public About page has no editor overlay, bridge global, persisted selection/geometry or editor stylesheet.

Bridge settings require exact `http://127.0.0.1:<port>` / localhost / IPv6-loopback origin, fresh bounded sessionId/documentId and uppercase64-hex candidateSha256. `bridge` CLI rehashes the candidate and refuses a different digest. Inject only on /about/ (or /about/index.html) in a validated current candidate; other routes have no layout capability. Host must verify actual navigation origin/source, fresh document generation, protocol/session/document/candidate, strictly increasing revision and declared IDs before accepting messages. Host must never trust a Website-provided request to execute code, mutate files or enable permissions. There are no `window.postMessage` command listeners; the host calls the fixed scoped `window.__kkpLayoutBridgeV1.command` API with current identities.

Modes: inspect initially (no interception), edit (capture click for nearest declared layout identity, prevent navigation; private pointer-events-none outline), interact (Website behaviour restored, selection cleared). Commands: mode/select/detach only. Edit ArrowUp/ArrowDown changes selection in actual DOM order; Escape clears it. Locked hero/undeclared regions provide explicit reasons. B content selection remains a separate capability; a section selected for moving does not grant inner-content/layout permissions.

Outbound protocol1 kinds: bridgeReady, modeChanged, selectionGeometry, selectionLocked, selectionCleared, selectionInvalidated, bridgeDetached. Every message contains protocolVersion/sessionId/documentId/candidateSha256 and a strictly increasing revision. Geometry is ephemeral CSS-pixel bounding rect with viewport/scroll/devicePixelRatio/visualViewport data. Admin translates to native client coordinates using observed viewport/zoom/DPI, never persists geometry as layout. Scroll, resize/visual viewport, observed layout changes refresh geometry. Binding disappearance invalidates selection. Reattach tears down old listeners/observers/overlay; pagehide/navigation/refresh detach and require a fresh document identity. Detached/stale commands return false. Call detach when closing/replacing preview. Native WebView2/DPI/screen-reader/OS keyboard quality remain D2/manual checks; browser scale simulation is evidence only for this protocol.

## Trust and reproducible evidence

Admin D2 must pin the final exact D1 commit/tool bytes, not reuse B's hard-coded trust for modified helpers. [Tool byte forms](SITE-LAYOUT-TOOL-TRUST.json) lists development `.mjs` paths and LF/CRLF SHA256 forms; verify the actual commit/blob and checkout forms before executing. Use a fixed command/argument list, read-only trusted tooling and private output. Do not accept arbitrary code declarations from contract fields. Candidate tools remain immutable baseline bytes; private bridge receipts/overlays are excluded from export. This list is evidence for the reviewed revision, not a signed security authority on its own.

Reproduce a mixed-content/layout no-Git fixture and effective/reset inputs with `node tools/layout/review-fixture.mjs "<empty-private-dir>" acceptance`. It produces frozen baseline/candidate, consumer/read/request/identity/scope/materialise/validation/effective-state receipts. Existing site gates plus layout source/render reading-order/profile/overflow checks run without .git. See [D2 executable packet](SITE-LAYOUT-CONSUMER.md). Run `node tools/layout/test.mjs` for refusals/reset/round trips, existing `node tools/management/test.mjs` for B preservation, and `node tools/layout/test-browser.mjs "<approved-B-root>" "<private-receipt>"` for default parity and actual-selection lifecycle. No intermediate owner testing is requested; Master routes the validated pinned D1 interface to D2.
