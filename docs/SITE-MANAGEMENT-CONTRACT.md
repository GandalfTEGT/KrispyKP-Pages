# Website management contract — B, revision 1.0.0

This Website-owned contract is a development interface for a private Admin consumer. The public site remains static; no management script is loaded by a public page. Eleven `data-kkp-manage-id` attributes identify existing source and rendered leaves. Current copy, images, links, layout, runtime and all tournament bytes are preserved. General editing in accepted Admin A remains locked until separately authorised C implements this interface and passes its own tests.

## Managed and locked scope

The authoritative map is `data/site-management.json`, schema/protocol 1, adapter `html-leaf-v1`. About has six plain-text leaves (heading, introduction, overview, focus, approach quote, purpose) and two overview links. Home has its introduction, hero Twitch link and hero logo **usage**. Read returns each ID, owner label, source file/route/tag/type, bounds, current semantic value and mapping fingerprint. Consumers discover supported text additions from the map rather than hard-coding eleven IDs.

Only `about/index.html` and `index.html` are writable source files. Image operations may additionally create the precisely derived `assets/managed/home-hero-<lowercase SHA256>.png`. Shared header/footer/navigation/metadata, undeclared body content, layouts/CSS, runtime-generated panels, Music/Video authoring, Contact forms, all other routes and the tournament contract are locked. A matching class or selector never grants permission. Source IDs must be unique, declared, in main, with matching tags and unambiguous leaf content. Text operations cannot inject markup.

## Capability and drift agreement

The consumer explicitly declares protocol 1 and all five capabilities: `content.text.v1`, `content.link.v1`, `media.png-selected-use.v1`, `source.html-leaf.v1`, `snapshot.validation.v1`. Read validates the source/render mapping and returns an exact contract-file SHA256, managed-binding fingerprint and renderer-mapping fingerprint.

| State | Meaning / consumer action |
|---|---|
| COMPATIBLE | All supported declarations and source mappings verified; bounded operations can be planned. Validation is still required. |
| COMPATIBLE_UNMANAGED | Compared snapshot changed only declared `styles/about.css` / `styles/home.css`. Existing draft remains read-only; create a fresh snapshot and validate the rendered candidate. No Admin release is inherently required. |
| ADMIN_UPDATE_REQUIRED | Unsupported schema/protocol/adapter/required capability or media semantics; remain read-only. |
| UNVERIFIED | Missing/malformed/ambiguous maps, unknown drift or invalid evidence; remain read-only. |

Fresh compatible source is not proof that all CSS/layout semantics are supported. Browser validation independently rejects changed image fit/focal/aspect semantics. Unknown fields are retained as bytes and never executed. A changed source compared with an old draft cannot silently refresh that draft. Recreate its verified baseline explicitly; preserve owner draft/journal separately. The immutable snapshot hash pins all included sources, not just a commit label.

## Fixed commands and private inputs

Use Node 22+ with Git available for whitespace comparison and the locked `playwright-core` dependency plus local Edge/Chrome for browser validation. Execute only the reviewed Website entry point `node tools/management/cli.mjs`; do not execute commands from manifest fields. Arguments are separate process arguments, not interpolated shell code. Inputs are bounded UTF-8 JSON files. Require process success **and** a readable typed receipt with the expected status and identities. Blocking diagnostics include code/message and affected field where available. Private receipt destinations must be outside source/candidate/baseline trees and must not traverse links. No receipt, local path, journal, editor overlay or draft data belongs in public assets.

The five commands are `snapshot`, `read`, `plan`, `materialise`, `validate`. Every command requires `--root` and `--receipt`. Snapshot additionally requires `--source-id`. Read requires `--consumer` and optionally `--previous` snapshot identity. The remaining commands require `--baseline-root`, `--identity`, `--request`, `--consumer`. Validate also requires `--changed-files` and accepts `--profile standard|acceptance` (default standard). There are no arbitrary executable declarations, adapter/plugin loaders or production runtime services.

Snapshot receipt is `{schemaVersion:1, sourceId, files:[{path,sha256,bytes}], sha256}`. Digests are uppercase SHA256; the outer digest hashes compact `JSON.stringify({schemaVersion,sourceId,files})`, with files sorted by path using ordinal comparison and each record ordered path/sha256/bytes. Paths are canonical relative forward-slash paths. Verify the receipt digest against a separately pinned expected digest and rehash immutable baseline before every operation/validation. `sourceId` is a human source identity, not a substitute for byte proof.

The inclusion inventory matches accepted Admin A's Website source list: root public files/package lock, assets/media/data/styles/scripts/tools, seven route trees, `.well-known/security.txt` and `docs/TOURNAMENT-CONTRACT.md`. Hidden/private/cache/credential files are excluded from the copy. A candidate must contain only that snapshot inventory (root development `node_modules` and Git metadata are tolerated and never source outputs); private files inside published trees are blocking. Keep tool dependencies private and use ordinary copies, not junctions. Source roots and published descendants refuse links and case-colliding paths.

## Typed request

```json
{
  "schemaVersion": 1,
  "baselineSha256": "<pinned identity digest>",
  "contractSha256": "<exact read receipt contract digest>",
  "expectedFiles": {"about/index.html": "<baseline file SHA256>"},
  "allowedOutputs": ["about/index.html"],
  "operations": [{
    "id": "about.hero.title", "kind": "setText",
    "expectedOld": "The KrispyKP Hub", "value": "Owner's revised heading"
  }]
}
```

Operation keys are exactly id/kind/expectedOld/value. The batch is bounded at forty unique IDs. Source hash keys must be exactly the touched managed source files. `setText` requires nonempty trimmed plain text within the binding's maxLength and no control characters. `setLink` value and expectedOld are `{text,href}`; links preserve `_blank` and `noopener noreferrer`. Destinations are existing local absolute routes or credential-free HTTPS URLs. Unknown operations, duplicate IDs, stale values/hashes or unsupported mappings are blocking. Object key order does not affect expected-old equality.

Plan returns the exact sorted output set. Materialise requires that exact `allowedOutputs` list, including derived media paths. For a no-op the list is empty and original entity/whitespace bytes remain unchanged. Unrelated bytes, unknown fields and runtime markup are retained. Candidate and baseline are separate, non-nested roots. Materialise starts from a byte-identical baseline candidate; it stages and flushes bounded outputs, renames each file, rolls back ordinary failures and returns MATERIALISED/requiresValidation. It is not a multi-file crash transaction: after an interrupted run discard/regenerate the private projection from the baseline. Never treat a partial projection as valid.

This is a deterministic **net-operation projection**, not in-place journal replay. C owns grouped history, undo/redo, cancellation and checkpoint recovery, and regenerates a fresh baseline copy from its current net operations. For repeated edits to a field use one operation containing baseline expectedOld and final value. Do not apply each historical journal entry to an already changed candidate.

## Image semantics

`replaceImage` expectedOld is `{src,alt,fit:"intrinsic",focal:"none",mode:"selected-use"}` from read. Value keys are exactly alt/fit/focal/mode/pngBase64. Alt is required and bounded at 160 characters. Accept only PNG <=1 MiB, square 64–2048px, non-interlaced 8-bit RGB/RGBA, valid chunk CRC/decoded pixel size/filters. The supported chunks are IHDR/IDAT/IEND and sRGB/gAMA/cHRM/pHYs; animation, text/EXIF metadata, palettes, unknown chunks and other MIME types are refused.

The hero retains its 300x300 source dimensions and intrinsic rendered aspect. Fit is `intrinsic`, focal is `none`: this slot has no crop/focal control. Browser proof requires existing computed object-fit fill and position 50% 50%, decoded dimensions and matching rendered aspect. There is no shared-file replacement/deletion. A selected-use edit creates a new content-addressed PNG and changes only the selected src/alt. Existing logo/header/footer/social references remain byte-identical. Receipts list old/new paths and known literal usage references; that evidence is not a general runtime media-library index. A same-path change outside the typed output set is refused with usage impact.

## Snapshot validation and integration boundaries

Validate receives the immutable identity/root, candidate root, original typed request and an explicit JSON array of changed paths. It rehashes both trees, compares exact changed scope, replays deterministic planning and compares every output byte. It rejects arbitrary extra changes/deletions, same-path replacement, forged receipts, incorrect scope and private published files. Candidate and baseline are rechecked after validation. It writes only the private receipt; no reference checkout or snapshot source is modified.

The trusted Website harness retains JavaScript/config/tournament/Radar/HTML/reference/metadata/text/URL/privacy/manifest/security/JSON/SEO checks and standard or full-acceptance browser gates. Baseline-relative `git diff --no-index --check` replaces only Git working-tree whitespace checking; it does not require `.git`. Explicit settings preserve equivalent CRLF handling while rejecting trailing whitespace/blank-at-EOF/space-before-tab faults. Ordinary differences have exit 1 with no diagnostics and are not failures. Rendering also proves unique IDs, semantic source/DOM agreement and intrinsic media at 320/390/699/700/701/979/980/981/1200/1201/1440 widths.

PASS requires all applicable checks and byte-preservation proof, not process completion. Repository ancestry, branch/remotes, integration and publication are explicitly NOT_RUN in snapshot receipts. Website retains the final Git-backed integration gates. Chromium automation does not establish physical devices, screen readers, subjective approval, non-Chromium/real zoom or external service delivery.

## A/B/C agreement and review fixtures

Accepted A records `WebsiteSnapshot` Version/DraftId/CreatedAt/Source/Files. C should preserve A's full private source diagnostics separately, compare A's ordered path/hash/size inventory with B's freshly generated identity, then pin B's digest in the private draft checkpoint. A must not pass its different top-level JSON directly as B's identity or fabricate a COMPATIBLE claim. B currently ships the CLI/projection interface; the exact C wrapper and editing UX remain future Admin work. Stage A's preview allowlist must eventually accept **validated** projected outputs and reject other changes; do not bypass its current hash gate merely to preview an edit.

Run `node tools/management/review-fixture.mjs "<empty-private-directory>" acceptance` to produce reproducible Git-less baseline/candidate trees, consumer/read/request/identity/changed-files inputs and materialisation/validation receipts. It edits four slots privately, including a generated metadata-free square PNG, and preserves all public source bytes in the actual checkout. Run `node tools/management/test.mjs` for meaningful positive/negative contract boundaries. See [owner review](SITE-MANAGEMENT-OWNER-REVIEW.md) for exact command patterns and acceptance gates. No B code implements C, main integration or deployment.
