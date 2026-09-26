# KKP-018 — Radar RTS Expansion

## Status

`READY FOR OWNER RETESTING`

## Starting state

- Authorised workspace: `C:\Users\Michael\.codex\worktrees\kkp-018-radar-rts\KrispyKP-Pages`
- Authorised branch: `kkp/018-radar-rts-expansion`
- Starting commit: `92e591e6ce749732bbac1ece33e7979e9147f8ca`
- Parent/base branch and commit: verified `origin/main` at `92e591e6ce749732bbac1ece33e7979e9147f8ca`
- Protected/reference checkouts: all pre-existing website, KKP-016 and KKP-017 checkouts
- Related task or issue IDs: KKP-016, KKP-017, validation tooling
- External/private-project scope: none; no Tournament Builder work authorised

## Owner requirements

### R1 — Coherent small-scale browser RTS

- **Owner requirement:** Replace the tactical minigame with a playable original C&C-inspired RTS loop covering base construction, resources, economy, power, production, orders, combat, AI, a superweapon and win/loss lifecycle.
- **State before:** `MISSING`
- **Action:** Replaced the arena shooter with Radar Command 1.0.0: a bounded 2400×1600 RTS world with base construction/placement, finite crystal fields, autonomous harvesters, credits, power, prerequisites, production queues, infantry, tanks, combat, AI, minimap, Ion Storm and victory/defeat/restart/exit states.
- **Validation:** 52 deterministic engine assertions, focused Chromium lifecycle/input checks and rendered layout review.
- **Result:** `PASS`
- **Evidence / notes:** Original geometric presentation and original names only; no proprietary game assets. Cancellation returns 75% of cost. Low power slows build/production to 35%, disables turrets and pauses Ion Storm charge.

### R2 — Maintainable static-site architecture

- **Owner requirement:** Separate simulation, definitions, rendering/input/lifecycle concerns; use data-driven units and structures without adding a large framework.
- **State before:** `INCOMPLETE`
- **Action:** Split definitions, simulation and canvas rendering/camera into ES modules while retaining the existing classic bootstrap entry on all pages. Definitions hold gameplay values; the engine owns deterministic state; the renderer performs DPR-aware canvas/minimap drawing; the bootstrap owns lifecycle, DOM HUD and input.
- **Validation:** All JavaScript parsed; the deterministic validator is integrated into the standard harness; browser testing proves no overlay/simulation UI before activation, bounded cleanup and repeated activation.
- **Result:** `PASS`
- **Evidence / notes:** No requestAnimationFrame or simulation exists before activation. Unit, structure, projectile and effect collections are capped; per-frame world rendering remains canvas-based and HUD DOM refresh is throttled.

### R3 — World/camera/HUD responsive separation

- **Owner requirement:** Keep stable logical world dimensions while providing deliberate desktop, compact landscape, mobile landscape and mobile portrait HUD/input profiles; live resize must preserve session state.
- **State before:** `MISSING`
- **Action:** Added bounded world camera, keyboard panning, pointer/touch camera mode, minimap navigation, DPR-aware rendering and deliberate desktop-large, desktop, tablet, mobile-landscape and mobile-portrait command layouts.
- **Validation:** Rendered game inspection completed at 2560×1440, 1920×1080, 1024×768, 844×390 and 390×844. Acceptance covered every site page at 320/390/768/1024/1440 with no document overflow. Live in-game portrait/landscape resize preserved mission time and entity count.
- **Result:** `PASS`
- **Evidence / notes:** Device pixel ratio changes backing-canvas sharpness only. The 2400×1600 logical world, entity proportions, credits, selection and simulation state are independent of viewport size.

### R4 — Website lifecycle and accessibility

- **Owner requirement:** Preserve six-page entry, dormancy, pause/resume, Escape, safe exits, scroll/focus restoration, reduced motion, repeated activation and bounded cleanup.
- **State before:** `INCOMPLETE`
- **Action:** Preserved entry on all six pages, keyboard/touch-accessible command controls, Pause/Resume, focus-loss pause, Escape, Restart, visible Exit, scroll/focus restoration, reduced-motion exit, responsive accessible state and full teardown.
- **Validation:** Focused Chromium checks passed for dormancy, pause/time freeze/resume, synthetic focus loss, restart, responsive resize, mobile modes, reduced motion, Escape, exit, cleanup, repeated activation and all-six-page availability.
- **Result:** `PASS`
- **Evidence / notes:** Physical touch ergonomics, real assistive technology and non-Chromium behavior remain owner/manual.

## Implementation checklist

- [x] Git/workspace state verified before writes
- [x] Existing implementation and validators inspected
- [x] R1 implemented
- [x] R2 implemented
- [x] R3 implemented
- [x] R4 implemented
- [x] Accessibility and content resilience considered
- [x] No unrelated production behavior changed

## Validation checklist

- [x] `npm run status`
- [x] `npm run validate` — PASS, 44 checks before final harness extension
- [x] `npm run validate:acceptance` / `npm run validate:visual` — final evidence recorded below
- [x] Required visual inspection
- [x] JavaScript/configuration/diff checks
- [x] Temporary fixtures removed (ignored screenshots/results only)
- [x] Browser/service/device boundaries recorded accurately

## Manual / unknown

- **Owner/manual checks still required:** gameplay feel/balance, physical touch ergonomics, real assistive technology, true zoom and non-Chromium behavior.
- **Unavailable or unknown evidence:** no physical iPhone/Android interaction, real screen reader, true browser zoom or Firefox/Safari run was performed.
- **External services not exercised:** no external service is required for Radar gameplay.

## Files changed

- `data/radar-game.js` — activation lifecycle, accessible HUD/commands, desktop/touch input, responsive profiles and teardown.
- `data/radar-rts-definitions.js` — data-driven world, structures, units, resources and Ion Storm values.
- `data/radar-rts-engine.js` — deterministic economy, construction, production, power, harvesting, movement, combat, AI, outcomes and cleanup.
- `data/radar-rts-renderer.js` — DPR-aware battlefield/minimap renderer and bounded camera transforms.
- `styles/radar-game.css` — Radar Command presentation and responsive desktop/tablet/mobile layouts.
- `tools/validate-radar-rts.mjs` — 52 deterministic RTS assertions.
- `tools/validate-static.mjs`, `tools/validate-browser.mjs`, `tools/validation-common.mjs` — integrated engine/browser/scope coverage.
- `docs/VALIDATION.md` — documents the expanded automated evidence.
- `tasks/KKP-017-OWNER-REMEDIATION.md`, `tasks/TOOLING-VALIDATION-HARNESS.md` — reconciled previous owner-accepted/merged status.
- `tasks/KKP-018-RADAR-RTS-EXPANSION.md` — this implementation and handoff record.

## Commits

- Implementation and validated handoff: `816ce999d77c26ee73bb42d7e3681fb20f3e2533` (`Implement Radar RTS expansion`).
- Owner Remediation 1 implementation and validation: `8edcd018ea5786a6d998a6f7bf2be5fac204fad2` (`Refine Radar RTS controls and feedback`).
- Owner Remediation 2 implementation and validation: `24028b085aebf33fdf9955e1f51492eb56947c4e` (`Expand Radar Command 1.2 controls and RTS systems`).

## Remote verification

- Remote/branch: pushed only to `origin/kkp/018-radar-rts-expansion`
- Original implementation/record remote tip: `a99d7b10ca95c19843a7840d6612d815296f82fe` (historical).
- Owner Remediation 2 implementation push verified at `24028b085aebf33fdf9955e1f51492eb56947c4e` on 2026-09-26. The subsequent metadata-only commit and exact final remote tip are reported in the owner handoff.
- Main unchanged: verified remote `main` remains `92e591e6ce749732bbac1ece33e7979e9147f8ca`
- Protected checkouts unchanged: yes at task start
- Push/merge/deploy state: KKP-018 branch pushed; no merge, deploy, release or tag

## Owner acceptance

- Owner retest instructions: launch Radar RTS from any page; build Pulse Reactor → Crystal Refinery → production structures; confirm the included harvester gathers and credits rise; produce/select/order forces; build and power the Storm Uplink; target the Ion Storm; complete or lose the mission; test Pause, Restart, Escape and Exit at preferred desktop/mobile sizes.
- Owner result/date: pending.
- Acceptance evidence: none yet.
- Merge/deploy authority granted separately: `NO`

## Owner Remediation 1

### Continuation state

- Continued from the clean, already-pushed KKP-018 tip `ae690b41ca53391f2612ebfe340448e83b1c4961` on `kkp/018-radar-rts-expansion`.
- Verified the required base/main commit remains `92e591e6ce749732bbac1ece33e7979e9147f8ca`.
- Preserved the accepted KKP-018 simulation foundation and confined this pass to the owner-requested control, feedback, legibility, startup and tactical-AI refinements.

### Remediation delivered

- Replaced touch camera/multi-select modes with direct gestures: one-finger drag pans, taps select or issue orders, successive friendly taps build/toggle a selection, and two-finger pinch zooms around the gesture centroid while panning with it.
- Added focal-point-preserving renderer zoom with bounded camera coordinates. Touch gestures suppress browser/page interaction and do not leak into unit selection.
- Reworked the HUD hierarchy around prominent Credits and Power, with readable construction, production and Ion Storm progress, remaining time/queue context and a striped, outlined `LOW POWER — systems slowed` state that does not depend on colour alone.
- Increased command-sidebar type, spacing and control sizing, including a dedicated large-desktop profile, while retaining deliberate tablet, portrait and compact-landscape layouts.
- Added an explicit Radar Command 1.1.0 start menu. Activation loads the UI only; no simulation, renderer or gameplay animation frame is created until `START GAME` is chosen. Controls help and safe exit are available from the menu.
- Improved production feedback through active-unit name, percentage, queued count and slowed-state text; construction similarly reports item, progress, time remaining and ready-for-placement state.
- Made hostile combat units periodically reassess nearby threats and valuable targets, invalidate destroyed targets, and resume the strategic Command Hub order when no tactical target remains. Target searches are throttled rather than repeated every frame.
- Added the Lancer Team anti-armour infantry and Jackal Scout anti-infantry vehicle with distinct costs, timings, health, speed, range, damage, weapon multipliers and original geometric rendering. AI production now uses the wider roster.
- Kept the larger graphics overhaul deferred as directed; this pass improves clarity and unit distinction without expanding into a new art pipeline or full RTS.

### Remediation validation

- `node tools/validate-radar-rts.mjs`: PASS — 63 deterministic checks, including the two new units, production/cost behavior, distinct tactical suitability, bounded AI search, nearby-threat engagement, dead-target invalidation and return to the strategic target.
- `npm run validate`: PASS — 44 standard checks across the change-aware six-page scope.
- `npm run validate:acceptance`: PASS — 62 checks, zero reported failures, all six pages at 320/390/768/1024/1440, stable functional coverage, first-party console monitoring and no document overflow.
- `npm run validate:self-test`: PASS — 7 detection/scope probes; all injected bytes restored.
- Focused Chromium Radar coverage confirms pre-start simulation/RAF dormancy, explicit start, construction progress feedback, one-finger touch pan, two-finger focal pinch, multi-unit touch selection, touch movement order, desktop controls, pause/focus/visibility lifecycle, live resize preservation, reduced motion, safe exit, cleanup and repeated activation.
- Final start-menu and active-game frames were visually inspected at 2560×1440, 1920×1080, 390×844 and 844×390. The menu fully covers the site after its intentional entry transition; HUD, battlefield, sidebar, minimap and controls remain legible without clipping or document overflow.
- Final JavaScript syntax, configuration validation and `git diff --check`: PASS.

### Remediation manual / unknown

- Owner/manual: final gameplay feel and balance, physical touch ergonomics and pinch behavior on real iOS/Android hardware, real assistive-technology use, true browser zoom and non-Chromium browsers.
- No external service is required or was exercised for Radar Command.
- Status remains `READY FOR OWNER RETESTING`; no owner acceptance is recorded by this implementation pass.

## Owner Remediation 2 — Radar Command 1.2.0

### Authority and continuation

- Owner brief: `91742d89-8db0-4a76-b37b-bd29912a2b7a/Pasted text.txt`, received 2026-09-26.
- Continued the existing clean worktree and branch from local/remote `a727c7d9fba5c40f02b85c70cc13593367a8b652`. Fresh remote main verification: `92e591e6ce749732bbac1ece33e7979e9147f8ca`; this remains the required ancestor.
- Existing modular engine/definitions/renderer/bootstrap architecture and website lifecycle retained. Scope is KKP-018 only; no KKP-019/020 work or unrelated site-system changes.
- This section supersedes the version, controls, map dimensions and follow-up details of the historical 1.0/1.1 sections above. Owner acceptance remains pending.

### Bugs fixed

1. **Control lock while firing:** combat previously reacquired a nearby target before processing movement. Explicit movement now clears targeting/navigation and takes priority until arrival. Explicit attack changes replace the previous target. Regression checks exercise auto-engagement, retreat, a new attack and a second retreat with enemies still nearby.
2. **Build-menu flicker and missed clicks:** reproduced on the original 1.1 implementation at 1899×1080, 1900×1080, 1920×1080 and 2560×1440. The hovered button was detached during a 180 ms held click at all four sizes; construction did not start. Geometry itself did not move. The progress-dependent whole-menu `innerHTML` replacement was responsible. Buttons now persist across HUD updates; only a deliberate category change rebuilds that category. Delegated clicks issue one command. After correction, all four sizes retain the same node and hitbox, start the intended build, and deduct exactly one cost.
3. **Entry transition:** restored a 650 ms Radar uplink reveal with an initial style flush so cached imports also animate. Reduced motion disables it. It reveals the start menu while simulation, renderer, gameplay RAF and audio remain uncreated until Start Game. Existing focus/exit restoration remains intact.

### RTS additions

| Requirement | Delivered behavior |
|---|---|
| Difficulty | Easy / Normal / Hard on the start menu; data-driven initial enemy credits, decision/reassessment cadence, first wave, wave spacing/group size, construction/production speed and defence count. No health multiplier or free rebuilding. |
| Independent queues | Existing per-building simulation queues retained and exposed independently as Infantry and Vehicles HUD cells. Each producer has its own queue list, pause/resume and current-unit cancellation with 75% refund. Both categories progress simultaneously; construction remains separate. |
| Radar progress | Original SVG identity icon with a clockwise conic shadow clearing as progress advances, plus percentage/status text, accessible button names and labelled native progress elements. Construction, infantry, vehicles and Ion Storm share the mechanism. Ready structures retain an explicit placement state; production completion emits a battlefield ring and notification. Decorative pulsing is disabled under reduced motion. |
| Mobile zoom | New matches and restarts begin at the supported minimum world zoom of 0.65 in portrait and landscape; HUD scale is independent. Pinch/wheel remain bounded to 0.65–1.65. Resize preserves camera centre and ongoing match state. |
| AI base loop | AI prioritises missing power/refinery/barracks/factory, restores harvesting capability, reserves recovery funds, and adds limited defences (plus a second Hard barracks later). Uses normal cost, build-time, prerequisites, collision, resource-field and map-bound checks. Placement attempts are capped at 24 per two seconds. |
| Larger / multiple maps | Crystal Reach: 3400×2200, open routes and scattered resources. Split Basin: 3000×2600, diagonal bases and central ridges. Start positions, dimensions, resources, terrain and camera defaults are data-driven. World/camera/minimap calculations use the selected map. Cached, bounded visibility routes skirt circular terrain; ground orders inside terrain resolve to clear perimeter ground. |
| Unit roles | Kestrel Team: fragile long-range infantry support, weak against armour/structures. Bastion Crawler: expensive, slow siege armour with strong structure damage, vulnerable to Lancers. Existing Rangers, Lancers, Vanguard, Jackal and harvester remain. AI production and target suitability include the expanded roster. |
| Icons / animations | Original code-drawn category and unit/structure symbols with accessible text. Bounded placement, firing, impact, destruction, harvesting/delivery, order acknowledgement and ready effects. Reduced motion removes decorative pulsing/harvesting orbit and expanding effect motion. |
| SFX | New optional Web Audio module with original oscillator tones for start, selection/order, fire/impact/destruction, ready, low power, storm and outcomes. No downloaded/copyrighted game audio. User-controlled mute persists locally with a session fallback; six concurrent voices and per-category rate limits prevent combat sound floods. Pause suspends/clears voices; restart and exit close the old context. Menu entry creates no audio context and plays nothing. |

### Difficulty tuning

| Level | Enemy starting credits | First wave | Later wave interval | Max wave group | Production / construction |
|---|---:|---:|---:|---:|---|
| Easy | 3600 | 125 s | 65–72 s | 4 | 0.8× / 0.8× |
| Normal | 5200 | 65 s | 40–47 s | 7 | 1× / 1× |
| Hard | 6200 | 35 s | 26–33 s | 10 | 1.15× / 1.1× |

All modes consume the same finite map resources and pay the same item costs. Travel distance adds to first-contact time. These are initial tested tuning values, not a claim of owner-approved balance.

### Validation and visual evidence

- `node tools/validate-radar-rts.mjs`: PASS — 127 deterministic checks, including command priority, simultaneous queues, isolated pause/cancel/refund, low-power slowdown, tactical roles, map bounds/starts/resources/terrain routes, paid rebuilding at each difficulty, insufficient-funds rejection, seeded replay, sound dormancy/mute/voice cap/cleanup, and six-minute bounded simulation of all six map/difficulty combinations.
- `npm run validate`: PASS — 45 standard checks after the functional fixes.
- `npm run validate:acceptance`: PASS — 63 checks; zero failures and zero warnings; all six pages at 320/390/768/1024/1440 with functional regression, first-party console/asset checks and no document overflow. Final status: `READY FOR OWNER RETESTING`.
- Focused `validateRadarRemediation` browser case: PASS — all four wide-screen held-click checks, entry/reduced-motion behavior, map/difficulty/restart preservation, construction radial progress, a paid base/economy progression to simultaneous infantry/vehicle HUD and independent queue controls, audio/menu dormancy, local mute persistence, storage-denial fallback and exit cleanup. No first-party errors reported in this case.
- Menu, construction and active queue views inspected at 2560×1440, 1920×1080, 1440×900, 1024×768, 390×844 and 844×390. Local ignored captures: `.validation/r2/menu-*.png`, `game-*.png`, `queues-*.png`. Bounded sidebar scrolling is deliberate where all items do not fit. All six capture sizes reported no document overflow.
- Existing browser lifecycle coverage continues to check restart/exit/re-entry, pause/time freeze/resume, synthetic focus loss, resize preservation, touch pan/pinch isolation, mobile initial zoom and all-six-page entry availability.
- JavaScript/configuration checks and `git diff --check` are part of the standard/acceptance harness.

### Changed files and manual boundaries

- Runtime: `data/radar-game.js`, `data/radar-rts-definitions.js`, `data/radar-rts-engine.js`, `data/radar-rts-renderer.js`, new `data/radar-rts-audio.js`, new `data/radar-rts-icons.js`, `styles/radar-game.css`.
- Validation/records: `tools/validate-radar-rts.mjs`, `tools/validate-browser.mjs`, new `tools/validate-radar-browser.mjs`, `docs/VALIDATION.md`, this task record.
- MANUAL/UNKNOWN: physical touch/pinch ergonomics, actual speaker/headphone sound quality and mix, gameplay feel/balance, screen-reader quality, true browser zoom, real hidden-tab behavior and Safari/Firefox behavior. Synthetic blur and headless Web Audio tests are not claims of those physical/browser checks.
- Deferred: full graphical overhaul, extensive licensed/recorded sound library, sophisticated dynamic pathfinding/formations and extra RTS systems outside this brief. Original geometric art and small original symbols/effects remain the intended boundary.
- No main merge, deployment, release/tag, reference-checkout edits, or owner acceptance is authorised by this pass.

### Delivery verification

- Implementation commit: `24028b085aebf33fdf9955e1f51492eb56947c4e`; pushed with an explicit refspec to only `refs/heads/kkp/018-radar-rts-expansion`.
- Fresh remote read after that push matched the implementation commit and confirmed `main` still at `92e591e6ce749732bbac1ece33e7979e9147f8ca`.
- Required base remains an ancestor. Implementation worktree was clean after the push. This follow-up edits only commit/remote metadata; final metadata tip and clean-state verification are provided in the handoff.
- Delivery status: `READY FOR OWNER RETESTING`; owner acceptance remains pending.

## Follow-ups

- Deferred deliberately: full visual-art overhaul, richer sound library, fog of war, repair/sell, advanced pathfinding/formations, control groups, campaign missions and additional superweapons. Owner Remediation 2 adds a small original synthesised SFX set and bounded static-terrain routing; those capabilities are no longer wholly deferred.

## Validation evidence

- `node tools/validate-radar-rts.mjs`: PASS — 52 deterministic checks covering world stability, prerequisites, placement rejection, construction, power, finite resource depletion, autonomous delivery/credits, production progress/completion, selection, movement, combat/death, Ion Storm charge/use/recharge, low-power consequences, victory, defeat, AI production/attack, caps and teardown.
- `npm run validate`: PASS — 44 checks on the implementation before the final reduced-motion and expanded deterministic assertions.
- `npm run validate:acceptance` (final): PASS — 62 checks, zero failures/warnings, all six pages at 320/390/768/1024/1440, functional Home/Music/Videos/Tournaments/Radar coverage, first-party console monitoring and no document overflow. The focused Radar case additionally activates the game at 320px and tests reduced motion.
- `npm run validate:self-test`: PASS — 7 detection/scope probes; all injected source bytes restored.
- Rendered Radar Command frames visually inspected at 2560×1440, 1920×1080, 390×844 and 844×390; battlefield, HUD, minimap, production states and exit controls remained legible without overlap or clipping. A 1024×768 live-resize state was also exercised by the focused browser test.
- Final JavaScript syntax and `git diff --check`: PASS after the last source changes.
