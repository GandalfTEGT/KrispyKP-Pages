# KKP-019 — Public site hardening and audit remediation

## Status

`READY FOR OWNER RETESTING`

## Starting state

- Authorised workspace: managed worktree `C:\Users\Michael\.codex\worktrees\kkp-019-site-hardening\KrispyKP-Pages`
- Authorised branch: `kkp/019-site-hardening`
- Starting commit: `92e591e6ce749732bbac1ece33e7979e9147f8ca`
- Parent/base branch and commit: verified `origin/main` at `92e591e6ce749732bbac1ece33e7979e9147f8ca`
- Protected/reference checkouts: `C:\Users\Michael\Documents\GitHub\KrispyKP-Pages`; KKP-018 managed worktree
- Related task or issue IDs: KKP-017; KKP-018 is parallel and out of scope; KKP-ISSUE-030 through KKP-ISSUE-035 are deferred in `docs/KKP-019-DEFERRED-HARDENING.md`
- External/private-project scope: no private Tournament Builder, DNS, Cloudflare, GitHub Pages settings, secrets, Formspree, Twitch or YouTube account changes

## Audit evidence

- Source: `krispykp-owner-website-audit-2026-09-26.pdf`, 11 pages, dated 26 September 2026.
- Source location reviewed: `C:\Users\Michael\Documents\ChatGPT\TD B3pis\output\pdf\krispykp-owner-website-audit-2026-09-26.pdf`.
- SHA-256: `78BE45D2452E2648B11AA420F6AF032491600F514AB4893815A0F8D6F8B88FDB`.
- Evidence rule: point-in-time public audit; every finding was rechecked against verified current source before implementation.
- Read-only live header verification on 26 September 2026 confirmed GitHub Pages delivery, ten-minute sampled asset caching, the listed missing 200-response security headers, and the pre-deployment `security.txt` 404.

## Finding classification

| Finding | Current-state classification | KKP-019 disposition |
|---|---|---|
| 14 September event still Live | STILL PRESENT | Changed only lifecycle state to `awaiting-results`; results/outcomes were not guessed. Added expiry/inconsistency validation. |
| Tournament/player mojibake | STILL PRESENT | Corrected deterministic encoding artefacts; restored the corrupted KRISPY in-game label from the canonical name in the same record; added detection. |
| Form privacy notice | STILL PRESENT | Added plain-language privacy page, adjacent Formspree disclosures and global links. |
| Browser security headers | EXTERNAL / HOSTING-LAYER | Deferred as KKP-ISSUE-031; no ineffective meta-header claim. |
| Large media library/short caching | EXTERNAL / HOSTING-LAYER | Inventory verified; migration deferred as KKP-ISSUE-030. |
| Offline Twitch surface dominates Home | STILL PRESENT | Replaced eager load with a branded neutral click-to-load gate and third-party disclosure. |
| Invalid Twitch URL | STILL PRESENT | Corrected generated catalogue and generation-time normalisation; added known-platform URL validation. |
| Contact typo and skipped visible numbering | STILL PRESENT | Corrected copy and made visible section numbering ignore hidden panels. |
| Incomplete web manifest | STILL PRESENT | Completed identity, dark colours, scope/start URL and validated icons without claiming offline support. |
| `/.well-known/security.txt` missing | STILL PRESENT | Added Contact, Expires, Canonical and language fields plus validation. |
| Thirteen images lacked intrinsic dimensions | STILL PRESENT | Added intrinsic dimensions to every static page image; footer logos are lazy-decoded. |
| Music artwork blank loading state | PARTIALLY RESOLVED | Existing aspect ratio retained; added explicit loading/error placeholder and accessible artwork state. |
| Hidden Music import input association | PARTIALLY RESOLVED | Existing activation/status behaviour preserved; visible control now declares `aria-controls`. |
| Strong page SEO metadata/sitemap/robots | ALREADY RESOLVED | Preserved and added deterministic metadata checks; privacy route added to sitemap. |
| Page-specific cards/static event metadata | DEFERRED | KKP-ISSUE-033. |
| Editorial redesign suggestions | OWNER DECISION REQUIRED | KKP-ISSUE-035; not implemented. |

## Owner requirements

### R1 — Lifecycle and publishing integrity

- **Owner requirement:** Prevent stale Live state, inconsistent results, mojibake and malformed known-platform URLs from silently publishing.
- **State before:** `INCOMPLETE`
- **Action:** Added `awaiting-results`, lifecycle expiry/result checks, text-integrity validation, URL-shape checks and controlled self-test fixtures.
- **Validation:** Focused config/static checks, standard/acceptance, self-test and browser lifecycle coverage.
- **Result:** `PASS`.
- **Evidence / notes:** Missing historical end dates/outcomes were not invented.

### R2 — Privacy and third-party transparency

- **Owner requirement:** Explain Formspree processing near both forms and globally; improve the Home Twitch fallback without guessing live state.
- **State before:** `MISSING`
- **Action:** Added `/privacy/`, adjacent form disclosures, global links and a first-party click-to-load Twitch gate.
- **Validation:** Static disclosure checks and Home browser interaction.
- **Result:** `PASS`.
- **Evidence / notes:** No cookie banner or compliance claim was added.

### R3 — Security notice, manifest and delivery boundaries

- **Owner requirement:** Publish `security.txt`, resolve the incomplete manifest and document header limitations.
- **State before:** `INCOMPLETE`
- **Action:** Added and validated both repository artifacts; documented edge/header work separately.
- **Validation:** Static artifact checks and direct path load.
- **Result:** `PASS`.
- **Evidence / notes:** No external infrastructure was modified.

### R4 — Resilience and targeted polish

- **Owner requirement:** Fix objective copy/numbering defects, intrinsic image dimensions and Music loading presentation without redesign.
- **State before:** `INCOMPLETE`
- **Action:** Applied targeted copy, numbering, dimension, lazy-decode and artwork-state improvements.
- **Validation:** Responsive browser matrix and visual review.
- **Result:** `PASS`.
- **Evidence / notes:** Existing visual identity and artwork are preserved.

## Implementation checklist

- [x] Git/workspace state verified before writes
- [x] Existing implementation and validators inspected
- [x] Audit findings classified against current source
- [x] Objective repository fixes implemented
- [x] Accessibility and content resilience considered
- [x] No unrelated production behavior changed
- [x] Deferred/external work bounded and recorded

## Validation checklist

- [x] Baseline `npm run status`
- [x] `npm run validate` — STANDARD PASS, 68 checks after owner-retest remediation
- [x] `npm run validate:acceptance` — ACCEPTANCE PASS, 89 checks; seven-route matrix plus Home owner-retest geometry at seven exact viewports
- [x] `npm run validate:self-test` — 10 probes passed; every source byte restored
- [x] `npm run validate:visual` — ACCEPTANCE PASS, 88 checks; 390px/1440px screenshots inspected for all routes
- [x] Focused JavaScript/configuration/static/diff checks
- [x] Temporary fixtures removed and source bytes restored
- [x] Browser/service/device boundaries recorded accurately

## Owner-retest remediation — 26 September 2026

- **Accepted areas preserved:** Twitch click-to-load behaviour, mobile Twitch presentation and the Privacy page were not redesigned.
- **Battlefield logo diagnosis:** the intrinsic `width` and `height` attributes added by KKP-019 were correct, but `.hero-logo` overrode only the width. The browser therefore rendered a 140×300 or 120×300 image. The owning rule now keeps the designed responsive width and explicitly derives height from the image's intrinsic aspect ratio.
- **Twitch diagnosis:** at widths above 1200px, `command-deck.css` applied `aspect-ratio: 16 / 10` while the Home layout made the embed fill the available panel height. The height-driven aspect ratio produced an 872–884px embed inside a 614–641px panel. The owning desktop rule now follows the panel width, removes that conflicting ratio and retains the full available height.
- **Regression coverage:** browser geometry assertions compare rendered and intrinsic logo ratios, confirm logo/panel containment, and verify both the gate and activated iframe against their embed and panel boundaries. Coverage uses 320×844, 390×844, 768×900, 1024×900, 1440×900, 1920×1080 and 2560×1440; both Twitch states are checked at every size.
- **Visual evidence:** targeted gate/loaded captures were reviewed at mobile, transition, desktop, Full HD and 1440p widths. External Twitch was intentionally blocked by the local harness; containment, not third-party delivery, was assessed.
- **Retest result:** `npm run validate` passed 68 checks and `npm run validate:acceptance` passed 89 checks.

## Manual / unknown

- **Owner/manual checks still required:** subjective visual preference; physical touch; real screen reader; true 200%/400% zoom; forced colors; non-Chromium engines.
- **Unavailable or unknown evidence:** legally tailored privacy wording; private Tournament Builder round-trip after adding the public lifecycle state; authoritative final result/end time for the 14 September event.
- **External services not exercised:** no form submissions; no live Twitch/YouTube/Challonge/Formspree mutation or delivery claim; no hosting/DNS/account change.
- **Parallel Radar boundary:** the fixed Radar utility can overlap page content at some captured scroll positions. It was not changed here because Radar presentation belongs to KKP-018; reassess after that branch is reconciled.

## Files changed

- Public routes: Home, Music, Videos, Tournaments, About and Contact HTML; new `privacy/index.html`; sitemap and manifest.
- Publishing data/runtime: tournament configuration/rendering, video catalogue/update normalisation, Home Twitch gate, Music artwork state and shared section numbering.
- Presentation: shared, Home, Contact and Tournament styles.
- Validation: configuration, static, browser, scope and self-test tooling plus current workflow documentation.
- Security/privacy: `.well-known/security.txt`, privacy disclosures and global footer links.
- Durable records: this task, deferred hardening recommendations, KKP-017 merge reconciliation and validation-tooling merge reconciliation.

## Commits

- `3fda9961229e5a82b3d460fe51a095854ca6da66` — Complete KKP-019 site hardening.
- Delivery-record update: this records-only follow-up commit; use the final branch tip reported in the owner handoff.
- Owner-retest layout remediation: this commit; use the final branch tip reported in the owner handoff.

## Remote verification

- Remote/branch: `origin/kkp/019-site-hardening`
- Verified implementation tip after first push: `3fda9961229e5a82b3d460fe51a095854ca6da66`
- Main unchanged: `origin/main` remained `92e591e6ce749732bbac1ece33e7979e9147f8ca`
- Protected checkouts: the reference checkout remained at `318cf656b34910b866fbfba5cfa1bd9e266e1c13` with its six pre-existing untracked audit artifacts; KKP-018 was not written by this task and was observed progressing independently at `a727c7d9fba5c40f02b85c70cc13593367a8b652` with its own uncommitted `data/radar-rts-definitions.js` edit
- Push/merge/deploy state: no merge, deploy, release or tag authorised

## Owner acceptance

- Owner retest instructions: Review Home before/after loading Twitch; inspect Contact form disclosures and `/privacy/`; verify the current tournament reads Awaiting Results; open `/.well-known/security.txt`; confirm the install prompt/manifest branding if supported by the test browser; and spot-check Music artwork loading on a throttled connection.
- Owner result/date: pending.
- Acceptance evidence: pending owner review.
- Merge/deploy authority granted separately: `NO`

## Follow-ups

- See `docs/KKP-019-DEFERRED-HARDENING.md` for KKP-ISSUE-030 through KKP-ISSUE-035.
- Reconcile likely KKP-018 overlaps in `docs/VALIDATION.md`, `tasks/KKP-017-OWNER-REMEDIATION.md`, `tasks/TOOLING-VALIDATION-HARNESS.md`, `tools/validate-browser.mjs`, `tools/validate-static.mjs` and `tools/validation-common.mjs`; preserve the KKP-018 Radar-specific assertions alongside KKP-019's seven-route/privacy and hardening coverage.
