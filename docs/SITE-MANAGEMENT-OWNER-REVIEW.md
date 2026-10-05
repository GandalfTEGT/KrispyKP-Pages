# Stage B owner review

B delivers the Website contract and private projection/validation interface; it does not yet expose editable fields in Admin A. Owner action: review the eleven managed slots and the bounded text/link/selected-use-image policies, then accept B or request scoped corrections. C needs separate authority after this review.

Inspect `data/site-management.json` and [contract / A-B-C packet](SITE-MANAGEMENT-CONTRACT.md). Existing public copy/design/images/navigation and tournament data are unchanged. View Home/About at desktop/mobile and around 700/980/1200px; automated binding checks include those thresholds. Private fixture copy deliberately changes the heading/introduction/link and selected hero image so the result is reviewable without changing source.

## Reproduce privately

From the B task checkout, create an empty directory outside the checkout, for example a new folder under your local private review archive:

```powershell
node tools/management/review-fixture.mjs "<private-review-directory>" acceptance
node tools/management/test.mjs
```

The review directory contains baseline/candidate trees with no `.git`, plus `identity.json`, `consumer.json`, `read.json`, `request.json`, `changed-files.json`, `materialise.json`, `validation.json` and `fixture.json`. Inspect PASS plus hashes/checks and NOT_RUN repository gates. Inputs and receipts stay private. The source/renderer map is documented, not inferred from selected DOM classes.

To repeat the exact validation independently, use separate arguments:

```powershell
node tools/management/cli.mjs validate --root "<review>/candidate" --baseline-root "<review>/baseline" --identity "<review>/identity.json" --request "<review>/request.json" --consumer "<review>/consumer.json" --changed-files "<review>/changed-files.json" --profile acceptance --receipt "<review>/repeat-validation.json"
```

For a new edit, create a fresh candidate copy of baseline. Use the read receipt's exact current values and hashes. `plan` shows deterministic outputs; put that exact list in allowedOutputs, then `materialise`. Validate the result before it can be used for later integration. Expected diagnostics include STALE_BASELINE / STALE_SOURCE / STALE_VALUE / OUTPUT_ALLOWLIST / MAPPING / ADMIN_UPDATE_REQUIRED / PRIVATE_ASSET / PRESERVATION / CHANGED_SCOPE.

Capture source or candidate renders outside the served tree:

```powershell
node tools/management/capture.mjs "<source-or-candidate-root>" "<private-screenshot-directory>"
```

This captures Home/About at390/980/1440 with third-party requests blocked. An existing private review server can serve the candidate read-only; do not deploy the fixture. Browser automation/blocked embedded frames do not prove live Twitch/YouTube service delivery.

## Review decisions and future gates

- Accept the About six text/two link leaves and Home introduction/link/image usage, or specify corrections.
- Accept the narrow PNG-only/intrinsic/selected-use policy; crop, shared replacement and Media Library remain future scope.
- Confirm the CLI/net-projection packet is ready for separately authorised Admin C integration. A remains read-only today.

Website main publication remains on hold. The B baseline is bdfff2d, the separately accepted tournament branch remains859c7c1 and remote main has an additional independent tournament update0fb9fc2. Those histories require later reconciliation and explicit integration/publication authority. B cannot overwrite either owner's reported results or accepted provenance/Oceania work.
