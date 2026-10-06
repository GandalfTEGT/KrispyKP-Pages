# WEBSITE-ADMIN-LAYOUT-CONTRACT — D1

## Status and authority

IMPLEMENTED / VALIDATED / INTERNAL HANDOFF READY, 6 October 2026. The owner's standing remaining-Admin-builder implementation authority is recorded in Master's ADMIN-PANEL-REMAINING-EXECUTION handoff. Intermediate owner testing is deferred to the finished product. This delivery is a technical dependency for Admin D2, not owner acceptance or main publication.

## Starting state and scope

Isolated worktrees/WEBSITE-admin-layout-contract, branch codex/admin-layout-contract, direct base approved B 7863940a218ef23adffb7d5e212018302e1f3a81. npm run status was clean at start. Approved B stays preserved. Website remote main was 0fb9fc2211869f60c15e7244cb357669c4c198d4; canonical local main f857b21 and accepted tournament 859c7c1 remain independent.

About-only eleven managed identities: locked hero, main, four body sections, feature grid and four cards. Global section/card order changes actual DOM reading order. B's content fields/copy and native default layout remain intact. Typed setOrder/setGrid/setSpan/resetProfile operations allow only bounded grid columns, card spans and alignment. Wide >=981, medium 701–980, compact <=700 inherit wider overrides with safe column/span caps; stored, effective, inherited and clamped values are distinct. All undeclared layout and shared shell remain locked.

Existing content projection and immutable snapshots now support mixed content/layout requests, exact output scopes and stamped validation receipts. The host-private selection bridge verifies origin/session/document/candidate identity, reports ephemeral geometry and supports edit/interaction modes, keyboard selection, navigation and teardown. Its script/overlay never enters public exports.

## Delivered interfaces

- docs/SITE-LAYOUT-CONTRACT.md: schema, typed requests, projection, responsive/reset and private preview lifecycle.
- docs/SITE-LAYOUT-CONSUMER.md: executable D2 commands, mixed/empty/reset/stale-proof cases and native integration boundaries.
- docs/SITE-LAYOUT-TOOL-TRUST.json: LF/CRLF byte digests for 34 tooling modules; verify against the final delivered Git revision.
- tasks/WEBSITE-ADMIN-LAYOUT-VALIDATION.json: durable sanitized validation and preservation receipts.
- tools/layout: bounded source/contract/projection/bridge adapters, CLI, browser validation and meaningful tests.

## Validation and rendered evidence

PASS: node tools/layout/test.mjs (28); node tools/management/test.mjs (34 B preservation); node tools/layout/test-browser.mjs (11 parity/selection lifecycle); npm run validate:self-test (10); full source acceptance (95); final standard (59); mixed no-Git candidate acceptance (97).

Default About geometry/text/links match B at 320/390/699/700/701/979/980/981/1440. Layout validation covers 280/320/390/699/700/701/979/980/981/1024/1440, semantic/keyboard order, grid spans/alignment and overflow. Default and mixed candidate screenshots were reviewed at desktop, medium and mobile widths. Private rendered evidence remains in Archive/website-layout-D1-renders-2026-10-06 and Archive/website-layout-D1-default-renders-2026-10-06. Bridge CLI confirms PREPARED with current candidate identity.

The first mixed acceptance run exposed a test assertion error: CSS Grid's grid-column: span N is reported in gridColumnStart, while the assertion read gridColumnEnd. Correcting the assertion required no production change. The historical failing receipt is retained alongside validation-final.json PASS in Archive/website-layout-D1-review-2026-10-06. Responsive parity tests foregrounded each page and awaited rendering before measuring navigation state.

Dependency cache access failed in the restricted shell; verified locked B node_modules were copied into this isolated task without package changes.

## Preservation and limits

Removing only the new layout attributes/stylesheet hook gives exact approved B About source. Home, B content contract, tournament page and tournament configuration remain unchanged. Tournament source SHA256 EE6BC8521DAEB862533E26D7988B301666FF5626B4D87F9FA72209EB39CB70DB. Owner archive SHA256 06D65C1BC84F538FF7CD87C4A400874184CA5C92603913C133B99E268D2407B6 remains verified. No Admin implementation, new pages/navigation/media, main integration, deployment, owner storage mutation or cleanup.

Native WebView2, physical DPI/zoom/touch, assistive technology and Admin drag/history/recovery interaction are MANUAL / D2 boundaries. Browser scale simulation does not claim those checks. Owner acceptance is NOT CLAIMED.

## Git delivery

Commit and push only codex/admin-layout-contract. Verify direct B parent, exact remote branch tip, clean task state and all tooling digests against delivered Git bytes. Exact final SHA and remote verification are recorded in the final handoff and private Archive/website-layout-D1-review-2026-10-06/DELIVERY.md, avoiding a self-referential commit stamp. Preserve all other branches/worktrees; Master pins this dependency and routes D2/E1 under existing authority.
