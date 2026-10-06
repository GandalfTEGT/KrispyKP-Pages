Historical proposal retained from91adce5. Current implemented interface and measured Home sizing are in SITE-MEDIA-CONSUMER.md; this preparation did not observe active theme overrides accurately.

# Website media contract preparation

6 October 2026. **PREPARATION ONLY / NOT ENABLED.** Task WEBSITE-ADMIN-MEDIA-CONTRACT, isolated from immutable E1 `9ac257399dd940fab70a8f9823f9bb8d4a2851eb`. Master assigned architecture/interface preparation while Admin E2 implements page authoring. Full implementation follows the E2 technical checkpoint under standing builder authority. This document is a concrete interface proposal, not a source manifest or permission to execute new adapters.

## Observed source and preserved checkpoints

The approved ADMIN-002 roadmap 0.3 and Master future-media direction require suitable WebP/JPEG/PNG, non-square images, Media Library/usages, per-usage alt/focal/fit/crop/position and safe selected-versus-shared review. Website owns actual source/schema/rendering; Admin owns editor/library/history/recovery and native preview. Broader Music/Video source authoring follows separately.

| Current source | Observed representation | Proposed next-contract treatment |
| --- | --- | --- |
| Home hero `home.hero.image` | One HTML img, shared `/assets/logo.png`, intrinsic140px/compact120px CSS width | Explicit new media adapter on this one usage; branding/header/footer defaults untouched |
| B/C Home replacement | B manifest square64–2048 PNG <=1MiB, selected-use/intrinsic/no-crop/no-focal | Preserve accepted B/C schema, code and review branches; never claim they already support richer media |
| E1 managed-page image | Exactly id/kind/src/alt; existing PNG, intrinsic width/height, stable img mapping | Declare a new version/capability before richer formats and crop/fit appear; E1/E2 v1 checkpoints retained |
| Shared header/footer logo | HTML images on seven routes; shell partials also reference logo | Inventory/read-only; no shared branding redesign or shell logo replacement in initial writable scope |
| Music artwork | `tracks.js art`; music-player/home-page runtime backgrounds; square cover and derived aria labels | Library inventory with source/runtime edges; locked pending separate structured Music adapter |
| Tournament banners | `tournaments.config.js bannerImage`; Home background, tournament hero/switch/archive, metadata/View Banner | Inventory/read-only; Builder/tournament contract remains authoritative; no reconciliation or banner data mutation |
| Video thumbnails | Generated Video snapshot and videos-page runtime, including external YouTube URLs | External read-only references; no remote upload/download/refresh or generated-snapshot authoring here |
| Audio/PDF/favicon/other assets | Different runtime/source semantics | Inventory categories only; image decode/edit contract does not authorize modifying them |

`tools/management/media.mjs usages` is a substring-based warning inventory, explicitly not complete usage discovery. It cannot authorize shared replacement or deletion. Existing paths, missing references, generated fallbacks and dynamic-source edges must be distinguished. A thumbnail/art path does not supply writable alt or focal semantics by itself.

## First writable slots and version boundary

Initial full implementation targets (1) explicitly declared Home hero usage and (2) image components on managed pages. Other existing public regions remain locked. Provide one Website-owned deterministic adapter per actual source family, not a plugin framework or an Admin renderer.

Keep `data/site-management.json` B v1 semantics unchanged. A separately versioned media contract declares Home's richer adapter and source fingerprint. Home media and B replaceImage on the same target in one net batch are a conflict, refused before writes; text/link operations remain independent. Old B consumers must not silently gain new formats, dimensions or crop controls.

Managed-page image expansion requires a new page contract/consumer capability (proposed pages protocol2 + `pages.image-media.v2`), together with media protocol1. Old exact E1 contract readers correctly become update-required; updated Website readers must explicitly support legacy v1 and expanded v2 source shapes, without treating an unknown shape as editable. Existing page v1 defaults render identically. E2 must first deliver its immutable v1 checkpoint; the later Admin media consumer performs the explicit update. No E1 manifest/tool changes occur in this preparation.

Proposed fixed files: `data/site-media-contract.json` (constraints/adapters/capabilities), `data/site-media.json` (asset records and per-usage state), `styles/site-media.generated.css` (derived scoped styles), `tools/media/cli.mjs` and fixed internal adapters. Exact names/shape are frozen only with implemented validators and consumer fixtures. Manifests never select executables. Existing B/D/page net operations remain separately negotiated.

## Asset admission and bounded decoding

These are proposed implementation limits, not claims of a current decoder:

| Item | Proposed bound / behavior |
| --- | --- |
| Imported still-image formats | Signature-confirmed PNG, JPEG, WebP; extension/MIME consistency; no SVG/GIF/animation or arbitrary binary |
| Encoded payload | <=8MiB/asset, canonical base64; <=10 new assets and <=32MiB total encoded batch bytes |
| Decode | Actual bounded decode, both dimensions32–8192, <=16million pixels; no header-only approval or extension-based trust |
| Aspect | Non-square allowed; general page image between1:8 and8:1; Home brand usage between1:4 and4:1 |
| Output | Credential/metadata-free deterministic rendition, orientation applied before crop/dimensions; preserve alpha where meaningful; verified decode and intrinsic sizes after output |
| New path | Derived content-addressed `assets/managed/images/<sha256>.<verified-extension>` only; no owner-supplied filename/directory |
| Existing local references | Canonical assets/media relative path, exact hash, supported decoded image; no traversal/case alias/symlink/private files |
| Unsupported existing media | Keep source bytes; inventory/locked explanation rather than conversion or deletion |

Choose a locally verified, pinned decoder/encoder during implementation; its exact code/dependency bytes and capability are part of trusted tooling. Refuse unsupported input and decoder/resource failures before projection. Do not implement improvised unbounded JPEG/WebP parsing. Metadata removal requires actual evidence; merely removing filename/extension is insufficient. No outbound fetch or third-party execution is needed for admission. Original uploads remain private recoverable draft assets; exports include only validated public renditions actually referenced by planned output.

## Per-usage model and actual rendering

Proposed asset record: stable content identity, derived path/hash/encoded bytes, decoded MIME/width/height and sanitized-rendition provenance. Library names/categories are display metadata, never output path authority. The same asset can have different alt/framing in different usages.

Proposed usage value: asset identity, required bounded plain alt (<=160 characters), frame variant, fit, normalized focal/position and optional source crop. Usage identity is the existing declared Home binding or `page.<slug>.<component-id>`, with exact source/route/tag/parent mapping. Baseline value and effective defaults are separate. Never persist pointer coordinates or free CSS.

| Slot | Frame / fit | Position / crop |
| --- | --- | --- |
| Home hero branding | Existing intrinsic sizing or contained intrinsic frame; no cover distortion/forced hero redesign | Center/intrinsic; no destructive branding crop in initial slot. Richer PNG/JPEG/WebP/non-square is explicitly versioned |
| Managed-page image | Intrinsic, square, landscape16:9 or portrait3:4; contain or cover in a fixed aspect frame | Bounded focal/position for cover; optional normalized source crop only on declared fixed-frame variants |

Position/focal are per usage: normalized finite0..1 coordinates in the orientation-correct source crop; default center. Define one authoritative stored point and explicit center/focal mode, avoiding two contradictory position/focal values. Crop is a finite normalized x/y/width/height rectangle within source bounds, positive area and at least32 decoded pixels on each axis. An intrinsic usage has null crop; cover requires a fixed frame. Unsupported combinations are refused, not silently ignored. Named frame variants do not add arbitrary ratio/height/CSS controls.

Website computes deterministic safe image/frame CSS and intrinsic dimensions from validated state, preserving semantic img alt and aspect ratio. Source cropping is non-destructive: originals unchanged, derived presentation or rendition is versioned and reproducible. Public HTML uses actual Website assets/styles, with no editor overlays. Preserve stable img identity/tag/nearest declared parent even if an unbound wrapper is needed; bridge geometry must describe the rendered selection and account for its visible frame. Verify decoding, bounded layout, frame mapping and crop interpretation in the actual browser rather than merely comparing JSON.

Responsive frames stay intrinsic/min-width0/max-width100% at D1/E1 thresholds; no overflow or absolute layout. Inspect transparent, portrait, landscape, extreme legal ratios and large alt strings at threshold neighbors. Keyboard/alt accessibility and zoom/native selection remain distinct tests.

## Inventory, shared review and containment

Library read returns assets, usages, missing references, external references, candidate-only assets and orphan candidates, all bound to current immutable baseline and inventory digest. Usage edges identify authored source, runtime consumer, route(s), adapter/editability and per-usage semantics. Relative HTML/CSS/data URLs resolve against their real source context. Preserve query/fragment meaning while canonicalizing local identity; encoded/ambiguous aliases cannot hide affected usages.

Start with exact HTML/src/srcset, CSS url and declared structured-source readers; carry read-only runtime fan-out (Music Home/player/list, tournament Home/hero/archive/metadata). Unknown dynamic references are explicit unresolved coverage, never a promise of completeness. Enumerate all routes conservatively where scope cannot narrow. Distinguish shell template sources from rendered duplicates and preserve read-only edges.

Selected-use replacement is the default: import/reuse a new asset, rebind one declared usage and keep original asset bytes and other references unchanged. Shared review is always available; shared rebinding executes only when every affected usage is explicitly enumerated, editable, supported and pinned, coverage is proven complete for that asset, and owner review selects the exact affected set. Any locked/unknown/external/generated usage blocks that batch with readable impact. Initially this is feasible only for exclusively managed, contract-owned assets with complete source coverage; legacy shared logo/music/banner cases stay read-only.

Shared rebinding does not overwrite a shared file in place: derive the new content-addressed asset and atomically project the selected complete usage set. Pin asset byte hash, inventory digest and every expected-old/source hash. Scope omissions/stale usage lists refuse projection. Deletion/garbage collection is **deferred** even for zero known references: full undo/redo/checkpoint/export/recovery coverage is not established by an empty live list.

## Proposed typed interface and consumer responsibilities

Media consumer advertises protocol1 and explicit `media.library.v1`, `media.still-image.v1`, `media.usage.v1`, `snapshot.validation.v1`; shared apply requires a separately declared complete-usage capability. Missing/unknown/breaking semantics are read-only/update-required. Read-only inventory is not projection authority.

Proposed operations: importAsset (bounded data, derived output), setUsage (complete baseline expected-old and final value), and rebindShared (complete pinned affected set and per-usage expected-old/final values). Import alone cannot publish an unused asset; net planning includes only referenced validated renditions. No delete/move/rawPath/globalReplace operation. Coalesce history to baseline-to-final net state; duplicate/conflicting Home B/media or page-image/page-composition operations refuse rather than one silently overwriting the other. Final page composition must resolve references to newly imported virtual assets within the same immutable plan; never write into baseline just to make image validation pass.

Read/plan/materialise/validate use the existing private root/baseline/identity/request/consumer/receipt pattern. Fixed Website tooling computes virtual asset bytes, sidecar state, scoped CSS and affected HTML/registry sources deterministically. Pin exact source/precondition/media/page/shell/request/consumer digests; exact derived allowedOutputs; actual decoded dimensions and usage impact. Staging is private; source snapshot/renderer never loads a decoder path supplied by a manifest. Candidate PASS replays all planned bytes and rehashes both roots, including media binary changes. A previous preview/export proof is invalid after media/history/refresh/rebase changes.

Admin consumer needs library/filter/usage/missing-reference UI, selected-versus-shared before/after review, format/dimension/size feedback, per-slot reasons for unavailable controls, native constrained crop/focal input, grouped undo/cancel/replay/recovery and staged-original retention. Pointer drag updates normalized semantic values; private previews use Website rendering only. No credentials/download/automatic external refresh or publication.

## Full implementation checkpoint and acceptance plan

Wait for Master to confirm E2's immutable technical delivery. Recheck E1/media/E2 tips and consumer needs; do not pull/reconcile Website main or mutate E2. Implement on this separate task branch, preserve preparation history, then provide an executable consumer packet, exact code/dependency trust and private actual-source fixture. Any required page-image version update receives contract/validator/mapping and explicit compatibility-refusal/migration evidence together.

Validation must cover format spoof/truncation/animation/private metadata/orientation/decoded limits, path/symlink/case/private containment, missing references, no-op/stale/conflicting operations, selected-use isolation, complete shared rebinding and locked/unknown coverage refusal, undo/replay imported-asset retention, mixed B/D/page/media projection and export privacy. Use known small non-square PNG/JPEG/WebP fixtures and actual browser decode, not live imports. Preserve seven default routes plus private new pages; intrinsic/crop/focal/contain/cover at threshold neighbors and compact open-menu overflow; source/renderer parity, semantic map, keyboard and private bridge lifecycle.

Run Website standard and acceptance, meaningful validator self-tests where changed, rendered affected/full-route inspection where shared effects occur. Retain B34/D28/E39 regression meaning and Builder/tournament source preservation. Native WebView2/WPF DPI/focus/drag/keyboard/crop usability and physical/assistive quality belong to Admin finished-product validation. No validation success means owner acceptance or publication.

This preparation deliberately adds no media manifest, runtime adapter, production CSS, generated assets or current capability. Structured Music/Video authoring and tournament reconciliation remain separate tasks. Main integration/deployment/cleanup remain held.
