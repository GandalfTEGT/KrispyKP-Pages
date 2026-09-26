# KKP-019 Deferred Hosting and Publishing Hardening

These items were investigated during KKP-019 but deliberately not implemented because they require infrastructure, external-account or larger content-architecture authority.

## KKP-ISSUE-030 — Media object storage and CDN

- Current repository inventory on 26 September 2026: 123 files under `media/`, 288,760,997 bytes total; 61 MP3 files account for 282,795,429 bytes.
- A read-only public header check on 26 September 2026 confirmed the sampled MP3 returns `Server: GitHub.com`, byte ranges and `Cache-Control: max-age=600`.
- Preserve the current on-demand audio behaviour.
- Future target: object storage plus CDN, content-versioned URLs, year-long immutable caching for versioned assets, byte-range audio responses, and a release-time media size/inventory budget.
- Migration requires URL compatibility, rollback and ownership planning; no media was removed, recompressed or replaced in KKP-019.

## KKP-ISSUE-031 — Controllable edge security headers

- The repository is a static GitHub Pages site with a custom domain. No repository-native response-header configuration path is present.
- A read-only public header check on 26 September 2026 confirmed `Server: GitHub.com`; the 200 HTML response did not include CSP, HSTS, nosniff, framing, Referrer-Policy or Permissions-Policy. The then-live `/.well-known/security.txt` remained a 404 before this branch is deployed.
- Future target: an authorised edge/static host capable of setting headers. Inventory Twitch, YouTube and Formspree origins under CSP Report-Only before enforcement; then evaluate `nosniff`, CSP `frame-ancestors`, a deliberate referrer policy, a minimal permissions policy, and HSTS only after complete HTTPS coverage is verified.
- HTML meta tags are not a substitute for these response headers. No DNS, Cloudflare, Pages or hosting settings were changed.

## KKP-ISSUE-032 — Validated content schema and owner publishing flow

- KKP-019 adds deterministic validation around the existing JavaScript data model without migrating it.
- Future target: validated JSON/YAML or another owner-friendly source format with stable event lifecycle fields, preview builds and an explicit release checklist. Private Tournament Builder round-trip compatibility must be assessed under separate authority.

## KKP-ISSUE-033 — Static event metadata and social cards

- Existing page metadata remains strong and is now guarded by validation.
- Query-selected tournament metadata is still updated client-side, which cannot guarantee event-specific previews for crawlers that do not execute JavaScript.
- Future target: stable event HTML routes or build-time pages, page/event-specific 1200×630 images, accurate static structured data, and publishing-derived sitemap `lastmod` values.

## KKP-ISSUE-034 — Monitoring and expiry reminders

- Future target: scheduled read-only checks for lifecycle expiry, broken assets, form health and certificate/domain issues, notifying only on actionable change.
- This requires external scheduling and notification infrastructure and was not created in KKP-019.

## KKP-ISSUE-035 — Owner/editorial decisions

- Optional audit suggestions such as shortening About copy, moving forms earlier, compacting long video lists and reducing repeated decorative chrome remain owner decisions.
- They were not treated as defects and no redesign was performed.
