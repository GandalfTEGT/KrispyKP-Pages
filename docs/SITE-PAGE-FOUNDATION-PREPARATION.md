# E1 preparation — shared shell and page foundation

Status: PREPARATION ONLY, 6 October 2026. This is a proposed executable-interface design for WEBSITE-SHARED-SHELL-PAGE-FOUNDATION, not an enabled page-authoring contract. Full implementation follows Master's D2 dependency release. Base D1 1341871fae08c81f423f7e3af96731afc2bb20f0 remains preserved.

## Verified source facts

The seven public routes are Home, Music, Videos, Tournaments, About, Contact and Privacy. Header structures match after excluding active-page class and whitespace. Six footer structures match; Privacy omits the social action row and marks its Privacy footer link current. Preserve that variant rather than adding UI. Privacy intentionally uses page-contact. Each page retains its own style list and script order/defer flags: in particular Tournaments loads shared runtime before its data/renderer, whereas Home/Music/Videos load page runtime first. About keeps B content and D1 layout identities and its generated layout stylesheet.

Existing styles/site.css, styles/command-deck.css, radar assets and data/site-ui.js already supply shared appearance/interaction. site-ui supplies skip-link, primary menu/aria-current, back-to-top, section signals and responsive footer disclosure. Reuse those assets/markup contracts and preserve their lifecycle; no Admin rendering fork or new public management runtime.

The current harness has fixed PAGE_ROUTES/ALL_PAGES and a second fixed PAGE_FILES map in validate-static. Candidate inventory and private-file checks recognise a fixed top-level directory set. A new root route would otherwise be omitted from immutable inventories or refused as a private path. E1 must update both discovery and containment through validated Website route authority, not accept arbitrary manifest paths.

## Proposed source and deterministic shell rendering

Add one Website-owned route/page registry in data, separate from B site-management and D1 site-layout declarations. Reserve and lock seven existing route identities, body classes, asset lists and body adapters. Add central declarative shell partials for header, background, footer (normal/privacy variant) and common head entries. No expressions, external includes, manifest-selected code or executable template syntax.

Existing public HTML remains the authoritative bespoke body, metadata and route-specific runtime source. Tooling parses bounded declared shell segments, proves their parity with the current shell definition, and splices only shared shell outputs when a shell/nav proposal changes. Default projection is byte-identical, retaining harmless original whitespace. Preserve main/body/runtime bytes for all seven pages, including B/D edits. New pages render from the same current central shell plus managed page composition. Future global shell changes regenerate all eight-or-more routes through the same renderer; global CSS/runtime is shared by reference. A fixture must prove propagation to existing and newly authored pages and detect stale/tampered outputs.

Metadata for new pages derives canonical/og:url from the fixed site origin and normalised route; title/description/social text are escaped bounded plain text. Existing distinct metadata/JSON-LD are preserved. Sitemap and both shell navigation groups derive from validated registry entries. Visibility controls links, not route privacy: hidden navigation does not make published content private. All navigation changes remain private candidate proposals and require normal later integration authority.

## Proposed route rules

New pages use a single root slug /<slug>/, deriving <slug>/index.html internally. No arbitrary filenames or nested paths. Use lower-case ASCII letter first, then letters/digits/single hyphens, bounded length; reject leading/trailing/repeated hyphens, dot/percent/colon/slash/backslash/query/hash/controls and Windows device names. Admin may suggest a normalised slug, but persisted requests must already be canonical.

Reject case-insensitive collision with all seven existing routes, every occupied root file/directory, runtime/tooling/source asset trees, infrastructure paths and another draft-created page. Reject symlink or case aliases. Reserve index, assets, media, data, styles, scripts, tools, docs, tasks, node_modules, bin, obj, .git, .validation, .well-known, CNAME, robots, sitemap, favicon and manifest families. Bind every new output path to a validated page operation plus absence precondition; never broaden candidate inventory from unverified manifest strings.

## Proposed E2 interface and minimum body library

Keep B protocol/content binding hashes and D1 About layout schema/profile semantics intact. Introduce a separate pages capability handshake, fixed Website tools/pages CLI and typed net page operations inside the existing immutable snapshot/projection/validation model. Suggested consumer capabilities: pages.compose.v1, pages.routes.v1, pages.shell.v1 and snapshot.validation.v1. The exact schema/operation names are not final until E1 implementation and tests.

Support Blank and Standard Content templates. Both have one H1; Blank can suppress the decorative hero while retaining the accessible page-name heading. Standard has the existing Website page-hero/panel treatment and optional bounded summary. Name, slug, navigation label/visibility, title/description and optional hero are authored data. Existing pages remain bespoke/locked beyond B/D declarations; do not auto-convert them.

Initial components: heading, text, link/CTA, panel, grid and image reference. Text is plain escaped text, not HTML/Markdown execution. Headings below the page H1 use constrained H2/H3 hierarchy. Panel/grid allow only declared child kinds, bounded depth/node counts, unique stable IDs and global semantic order. Grid uses D1's responsive ranges and bounded intrinsic minmax columns/spans. Images reference validated existing Website assets with required alt and intrinsic dimensions; B's selected-use PNG upload restriction stays unchanged. Rich crop/focal/uploads/media players and catalogue blocks await later media/structured contracts. A divider can be included only if a real template needs it; no library expansion for completeness.

Plan computes exact changed files: registry/composition source, new HTML, generated managed CSS if needed, sitemap and existing shell HTML only for navigation/global-shell effects. No-op operations yield no outputs. Explicit source hashes, expected-old values and absent-route checks prevent stale edits. Regenerate a fresh private candidate from the immutable baseline for each net operation set; do not replay journals onto changed HTML. Validation pins baseline/request/consumer/B/layout/pages/shell/candidate hashes and exact output scope, rechecks after rendering, and never treats process exit alone as proof.

Inventory must include only validated new route paths while keeping all unknown/private source/path refusals, case folding and symlink checks. Snapshot capture must preserve full page authority before any authoring; Admin must update its allowlist and tool trust for E1 rather than bypassing A/C/D preview gates.

## Validation gates for implementation

1. Default renderer parity: all seven source outputs and bodies/metadata/runtime lists unchanged; B34, D28 and D bridge11 regression cases preserved.
2. Routes/meta: safe creation, case/collision/reserved/occupied/symlink refusals, exact canonical/social escaping, sitemap membership, nav visibility/active state and unique IDs/H1/headings.
3. Composition: invalid nesting/depth/span/unknown kinds/HTML/unsafe links/media refused; empty/reset net operations and mixed B/D/new-page projections deterministic; extra candidate mutations refused.
4. Global inheritance fixture: central header/footer/background change reaches seven existing routes plus Blank/Standard new pages; bodies and D1 layout preserved; stale generated output refuses parity.
5. Managed route discovery: new routes covered by static metadata/references/privacy and acceptance browser matrix, shared nav/accessibility/Radar; wrong registry cannot silently exclude an existing route.
6. Actual render checks at 280/320/390, 699/700/701, 979/980/981, 1024/1440; every current route plus new fixture. Keyboard reading/focus/menu/skip link, no overflow, reduced motion and lifecycle. Whole-site rendered review because shell/nav affects all pages.
7. Immutable no-Git edited candidate acceptance and committed source acceptance; updated tooling trust manifest and exact branch/remote/clean handoff. Native E2 interaction and physical assistive/device checks remain separate.

## D2 dependency and next checkpoint

D2 consumes pinned D1 now; E1 preparation does not replace its tools or broaden its About-only bridge. Concrete D2 contract mismatches will be fixed separately against evidence. After Master releases E1 implementation, preserve D2's delivered Admin base and introduce E1 capability/trust updates for E2; E1 does not depend on importing Admin code. D2's feedback on operation/reset/session/proof behavior may affect shared helpers, so finalising E1 executable adapters waits for that checkpoint.

No new page, navigation proposal, media upload or shell change is enabled by this preparation document. Main integration/deployment/cleanup remains outside authority; standing implementation authority covers the later scoped work after its dependency checkpoint.
