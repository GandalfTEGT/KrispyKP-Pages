# D1 → ADMIN-005 executable packet

Use exact delivered D1 branch/commit from the task handoff; preserve approved B/C review trees. D1 adds an About-only layout capability. D2 can prepare other controls but must lock every undeclared region. Layout declarations, profile bounds and typed output adapters belong to Website; Admin owns native editor gestures/history/inspector/session handling.

## Commands (arguments are data)

From trusted D1 tooling; every receipt goes outside source/baseline/candidate trees:

```powershell
node tools/layout/cli.mjs read --root "<baseline>" --consumer "<private>/consumer.json" --receipt "<private>/layout-read.json"
node tools/management/cli.mjs read --root "<baseline>" --consumer "<private>/consumer.json" --receipt "<private>/content-read.json"
node tools/layout/cli.mjs plan --root "<fresh-candidate>" --baseline-root "<baseline>" --identity "<private>/identity.json" --request "<private>/request.json" --consumer "<private>/consumer.json" --receipt "<private>/plan.json"
node tools/layout/cli.mjs materialise --root "<fresh-candidate>" --baseline-root "<baseline>" --identity "<private>/identity.json" --request "<private>/request.json" --consumer "<private>/consumer.json" --receipt "<private>/materialise.json"
node tools/layout/cli.mjs validate --root "<candidate>" --baseline-root "<baseline>" --identity "<private>/identity.json" --request "<private>/request.json" --consumer "<private>/consumer.json" --changed-files "<private>/changed-files.json" --profile acceptance --receipt "<private>/validation.json"
node tools/layout/cli.mjs bridge --root "<validated-candidate>" --consumer "<private>/consumer.json" --settings "<private>/bridge-settings.json" --receipt "<private>/bridge.json"
```

For a plan initially omit allowedOutputs; copy its exact sorted outputs into the materialisation request and changed-files JSON. Recompute request identity after adding allowedOutputs. Validate requires exact scope and compares every materialised byte. The private script receipt is NOT a file to copy into candidate assets; inject its script only after native origin/session/receipt checks. Use the current validation's candidateSha256 in bridge settings, e.g. `{origin:"http://127.0.0.1:54321",sessionId:"fresh_session_identifier",documentId:"fresh_document_identifier",candidateSha256:"<current uppercase digest>"}`. The port must be the real preview port.

Host command example: `window.__kkpLayoutBridgeV1.command({sessionId,documentId,candidateSha256,kind:"mode",mode:"edit"})`; selection example uses kind:"select", id:"about.feature.streaming". Never interpolate unescaped user strings into this script; pass serialized data through the native API. Stale session/document/candidate commands return false. Messages must pass host-side revision/identity/origin/member checks before inspector updates; geometry messages are not content/layout operations.

## Required integration cases

- Fresh D1 baseline: B content remains usable; layout read supports eleven labelled render identities, stored null overrides/native default geometry. C's trust list must update for D1; do not bypass it.
- Mixed projection: one About heading edit plus section order, card order, wide3 grid/span2 and medium2 alignment override. Changed outputs: About HTML/layout-state JSON/generated CSS only; all other sources/tournament/media unchanged. Private review-fixture command provides exact inputs and effective-state receipt.
- Wide override inherited: wide3/span3 → medium2/span2 → compact1/span1 with stored medium/compact null. Inspector shows requested/inherited/clamped separately.
- Reset a medium grid override: precondition its stored object, remove it, inherit capped wide value. Reset a card span: stored integer → null/inherited. Whole-profile reset on about.page clears that profile's grid and spans; no-op reset/empty journal returns no source outputs. Resetting a grid alone with orphan dependent spans is blocking.
- Reorder uses actual DOM/keyboard reading order; no CSS order or per-profile different order. Hero stays first, no reparenting/add/delete/free coordinates. Snap/reorder/resize controls emit only approved typed operations; preview changes are temporary until projection/validation, never raw CSS.
- Any new edit, undo/redo/rebase/runtime/source/receipt tamper invalidates old proof. Reject a PASS receipt for other request/consumer/baseline/B/layout contract/candidate/scope; do not rely on process exit alone. Retain exact request/consumer objects and their parsed-property order for digests.
- Selection edit mode captures actual Website click; nearest declared component and explicit locks. Scroll/resize/zoom/DPI updates ephemeral geometry. Arrow selection/Escape, reattach, navigation/back/forward/refresh and teardown use fresh document identities. No overlay/script receipt in exports or source; interaction mode restores Website input.
- Native D2 tests remain required: constrained dragging/drop cancellation, snapped spans/reorder, undo/replay/recovery/rebase conflicts, inspector/profile/reset, focus/keyboard accessibility, actual WebView2/native zoom/DPI/scroll/close/navigation. Website browser tests do not replace them.

## Expected refusals and dependency boundaries

Blocking codes include LAYOUT_MAPPING, LAYOUT_NESTING, LAYOUT_ORDER, LAYOUT_LOCKED, LAYOUT_PROFILE, LAYOUT_GRID, LAYOUT_SPAN, LAYOUT_OVERRIDE, LAYOUT_PARITY, LAYOUT_REQUEST, STALE_VALUE, STALE_CONTRACT, PRECONDITION, CHANGED_SCOPE, PRESERVATION, PREVIEW_ORIGIN and PREVIEW_IDENTITY. Existing B containment/dirty/stale/public-private-file refusal remains.

No Website main push/deployment, Admin writes, new pages/navigation/media expansion or tournament reconciliation in D1. Website remote0fb9fc2, localf857b21, accepted859c7c1 and owner storage remain preserved. E1/E2 and later media/structured work follow separate technical contracts under standing implementation authority. D1 is a validated implementation dependency, not owner acceptance or publication.
