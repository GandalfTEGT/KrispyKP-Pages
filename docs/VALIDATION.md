# Validation workflow

The harness turns repeated repository discovery and objective regression work into deterministic commands. It tests the static site; it does not replace design judgment or owner acceptance.

## Commands

| Command | Purpose |
|---|---|
| `npm run status` | Cheap branch/HEAD/base/dirty/remote/task summary before work. Use `status:json` for machine-readable output. |
| `npm run validate:smoke` | Fast source/config/diff checks plus one-width six-page load, H1, console, asset and overflow checks. |
| `npm run validate` | Standard change-aware validation: smoke coverage plus affected pages at desktop and their stable functional tests. |
| `npm run validate:browser` | Standard browser portion only; useful after a static-only failure is understood. |
| `npm run validate:acceptance` | Full six-page 320/390/768/1024/1440 matrix and all stable functional smoke tests. |
| `npm run validate:visual` | Acceptance validation plus optional 390/1440 screenshots under `.validation/screenshots/`. |
| `npm run validate:self-test` | Temporarily injects controlled faults, proves detection, restores every source byte, then checks restoration. |

Every validation run writes compact JSON to `.validation/last-run.json`. Successful terminal output is intentionally short; failures identify the check, page and viewport.

The browser harness uses the development-only `playwright-core` package with an installed Edge/Chrome/Chromium executable. Override discovery with `PLAYWRIGHT_CHROMIUM_EXECUTABLE`. It serves the checkout on an ephemeral loopback port and blocks third-party network requests.

## Profiles and change-aware scope

- **SMOKE:** all JavaScript syntax, existing configuration validation, deterministic Radar RTS engine coverage, diff whitespace, HTML structure, IDs, local references, JSON-LD, sitemap/robots, then all six pages at 390px.
- **STANDARD:** SMOKE plus affected pages at 1024px and stable functional checks for affected systems. Shared presentation/navigation/Radar changes expand the scope to all pages.
- **ACCEPTANCE:** all six pages at 320, 390, 768, 1024 and 1440px, plus Home/navigation, Music, Videos, Tournaments and Radar functional checks.

Scope is calculated from committed, staged, unstaged and untracked changes relative to the merge-base with `origin/main` (or a supplied `--base`). Important mappings include:

- shared CSS, command-deck, site UI, navigation, header/footer or Radar → all six pages;
- Home files → Home;
- Music player/data/styles → Music, and shared track data also → Home;
- Videos renderer/data/styles → Videos, and shared video data also → Home;
- Tournament renderer/config/styles/schema → Tournaments, plus Home and Contact where they consume event data;
- About/Contact page systems → that page;
- tooling/documentation-only changes → static checks plus the profile's baseline page-load coverage.

Tournament schema, rules PDF or generator changes are flagged for tournament artifact review and private Builder compatibility. The public repository harness validates public configuration/references but does not silently modify or run the private Builder. Set and document separate Builder evidence when authorised.

## Visual and owner boundary

Automation can prove that pages load, first-party assets resolve, JavaScript does not throw, one H1 exists, document width does not overflow, stable deep links normalize safely, selections update and Music does not autoplay on deep link. Radar coverage additionally exercises pre-start simulation dormancy, a deterministic build/economy/production/orders/combat/power/superweapon/outcome loop, tactical AI retargeting, touch selection/pan/pinch separation, pause, focus loss, restart, responsive profiles, resize preservation, reduced motion, repeated activation and cleanup.

Automation must not claim to prove:

- that a redesign looks good;
- gameplay feel, difficulty or balance;
- physical touch ergonomics;
- screen-reader quality without real assistive technology;
- true browser zoom, non-Chromium behavior or hidden-tab behavior unless actually exercised;
- search ranking or social-crawler behavior not directly observed;
- live Twitch, YouTube, Challonge or Formspree delivery.

Mark these `MANUAL` or `UNKNOWN`. Shared shell/CSS/header/footer/navigation changes require a full six-page manual/visual inspection after automated acceptance. Page-only changes require targeted visual inspection of the affected page and shared surfaces actually touched. Data-only changes require config/static/browser smoke plus affected-content inspection where presentation can vary.

## Adding tests

Keep checks deterministic and user-visible behavior based. Add a static rule to `tools/validate-static.mjs`, a scope mapping to `tools/validation-common.mjs`, or a stable browser behavior to `tools/validate-browser.mjs`. Avoid pixel-perfect assertions, external accounts and production-only test hooks. Add new viewports only when they protect a real breakpoint.

## Later integration

This tooling branch was rebuilt on owner-merged main `4aec4ace489e49b780e530ab24318a6d1680ea83`. To integrate later: finish and commit the target website task; bring the tooling commit onto the desired branch through the normal reviewed Git workflow; resolve real conflicts deliberately; install development dependencies; run acceptance against the newest site; and update stale harness assumptions when website evolution is legitimate. Do not change production behavior merely to satisfy obsolete tests.
