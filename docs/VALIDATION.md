# Validation workflow

The harness turns repeated repository discovery and objective regression work into deterministic commands. It tests the static site; it does not replace design judgment or owner acceptance.

## Commands

| Command | Purpose |
|---|---|
| `npm run status` | Cheap branch/HEAD/base/dirty/remote/task summary before work. Use `status:json` for machine-readable output. |
| `npm run validate:smoke` | Fast source/config/diff checks plus one-width public-route load, H1, console, asset and overflow checks. |
| `npm run validate` | Standard change-aware validation: smoke coverage plus affected pages at desktop and their stable functional tests. |
| `npm run validate:browser` | Standard browser portion only; useful after a static-only failure is understood. |
| `npm run validate:acceptance` | Full public-route 320/390/768/1024/1440 matrix and all stable functional smoke tests. |
| `npm run validate:visual` | Acceptance validation plus optional 390/1440 screenshots under `.validation/screenshots/`. |
| `npm run validate:self-test` | Temporarily injects controlled faults, proves detection, restores every source byte, then checks restoration. |

Every validation run writes compact JSON to `.validation/last-run.json`. Successful terminal output is intentionally short; failures identify the check, page and viewport.

The browser harness uses the development-only `playwright-core` package with an installed Edge/Chrome/Chromium executable. Override discovery with `PLAYWRIGHT_CHROMIUM_EXECUTABLE`. It serves the checkout on an ephemeral loopback port and blocks third-party network requests.

## Profiles and change-aware scope

- **SMOKE:** all JavaScript syntax, existing configuration validation, deterministic Radar RTS engine coverage, diff whitespace, HTML structure, IDs, local references, JSON-LD, sitemap/robots, then all public routes at 390px.
- **STANDARD:** SMOKE plus affected pages at 1024px and stable functional checks for affected systems. Shared presentation/navigation/Radar changes expand the scope to all pages.
- **ACCEPTANCE:** all public routes at 320, 390, 768, 1024 and 1440px, plus Home/navigation, Music, Videos, Tournaments and Radar functional checks.

Scope is calculated from committed, staged, unstaged and untracked changes relative to the merge-base with `origin/main` (or a supplied `--base`). Important mappings include:

- shared CSS, command-deck, site UI, navigation, header/footer or Radar → all public routes;
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

Radar 1.2 adds focused coverage in `tools/validate-radar-browser.mjs`: stable build-button identity and held-click charging at 1899/1900/1920/2560, pre-start map/difficulty selection, entry/reduced-motion behavior, radial progress, simultaneous infantry/vehicle HUD and queue pause/cancel, audio dormancy/mute persistence/storage denial/cleanup. The deterministic suite additionally tests player-order priority under fire, paid AI rebuilding, both maps and terrain routes, new unit roles, voice caps and six-minute bounded runs of every map/difficulty combination. Simulated audio-device checks and headless audio-context checks do not establish subjective sound quality on speakers or mobile devices.

Radar 1.3 retains those regressions, with queue assertions moved to the sidebar after removal of the redundant top HUD. `tools/validate-radar-desktop.mjs` adds actual website-panel entry/exit, inert/focus/scroll restoration, edge and middle-mouse pan, faction selection, real timed AI scaffolding and economy expansion (without injected resources/entities), sell confirmation/refund, return-to-menu cancellation/teardown, fresh start and desktop/smaller-layout overflow. The deterministic suite adds integer harvesting/unloading/refunds, repair/sell and immediate dependency changes, explicit controller ownership/rejected commands, terrain type/passability/variant metadata, expansion/activity on both maps, central input commands and local-only voice priority/cooldowns/cleanup. Primary visual targets are 1920×1080 and 2560×1440; mobile parity redesign is deferred. OS voice availability/quality, physical input feel and actual networking are not established by these tests.

Mark these `MANUAL` or `UNKNOWN`. Shared shell/CSS/header/footer/navigation changes require a full public-route manual/visual inspection after automated acceptance. Page-only changes require targeted visual inspection of the affected page and shared surfaces actually touched. Data-only changes require config/static/browser smoke plus affected-content inspection where presentation can vary.

## Adding tests

Radar 1.4 adds `tools/validate-radar-controls.mjs`: frame sampling for menu-exit sidebar visibility, root scroll locking/restoration, mouse-model settings, remapped keys and conflicts, Escape/right-click targeting priority, browser-safe control groups, faction/focus feedback, local preference persistence/denial, native-dialog rejection, and three independent Barracks/Vehicle Bay slots. Compact-factory layout uses the existing deterministic validation scenario selected only in a served test fixture (20,000 starting credits, no AI); paid construction/queues remain unchanged. Existing desktop runtime tests still observe real standard-scenario AI construction/expansion. Engine coverage adds tactical orders, data-driven survivor bounds/ownership, explicit terrain semantics and bounded voice queue arbitration. Escape now returns to Command before site exit; legacy assertions follow that authorised change.

Radar 1.5 extends those checks for the exact 1200×1000 desktop release gate, safe live resize below and back above the gate, the Escape/Command menu Resume–Quit–Leave paths, faction-symmetry disclosure, configurable edge activation width, optional thresholded right-drag pan without accidental orders, settings persistence and restore-defaults, and the queue mouse model. A production-card left click uses the explicitly selected factory and resumes it; the first right click pauses that queue and each later right click removes one queued unit until it is empty. Automatic distribution remains available until a player explicitly selects a producer. Deterministic coverage remains responsible for bounded six-minute map/difficulty simulations and collection caps; browser checks cover repeated lifecycle, no pre-start simulation, cleanup, focus/scroll restoration, no native dialogs and all public routes. Pointer Lock remains deliberately absent because releasing it for the persistent sidebar would make the control model disruptive; the settings copy states the ordinary browser window-boundary limitation.

Keep checks deterministic and user-visible behavior based. Add a static rule to `tools/validate-static.mjs`, a scope mapping to `tools/validation-common.mjs`, or a stable browser behavior to `tools/validate-browser.mjs`. Avoid pixel-perfect assertions, external accounts and production-only test hooks. Add new viewports only when they protect a real breakpoint.

## Later integration

This tooling branch was rebuilt on owner-merged main `4aec4ace489e49b780e530ab24318a6d1680ea83`. To integrate later: finish and commit the target website task; bring the tooling commit onto the desired branch through the normal reviewed Git workflow; resolve real conflicts deliberately; install development dependencies; run acceptance against the newest site; and update stale harness assumptions when website evolution is legitimate. Do not change production behavior merely to satisfy obsolete tests.
