# KKP-018 — Radar RTS Expansion

## Status

`OWNER ACCEPTED — RADAR COMMAND 1.5.0`

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
- Owner result/date: Owner accepted Radar Command 1.5.0 on 2026-09-27.
- Acceptance evidence: accepted KKP-018 tip `61a26cb462b0766a9c86072ec7e8d493d3b3a6e7`; acceptance authorised reconciliation with current main while preserving this branch tip as the historical checkpoint.
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

## Owner Remediation 3 — Radar Command 1.3.0

### Authority, starting state and boundaries

- Owner brief: `3551dd5e-e21e-442b-adf4-da0eaf83e37c/Pasted text.txt`, 2026-09-27. Desktop first: 1920×1080 and 2560×1440; smaller layouts receive regression coverage rather than parity redesign.
- Continued the same clean authorised worktree/branch from `2e332489e9aa55c3bb50b9f342a6a51d6a47f1db`. Fresh remote read matched that branch tip and main `92e591e6ce749732bbac1ece33e7979e9147f8ca` before changes.
- Preserved the modular engine, fundamental base/economy/combat loop, difficulty selection, maps, world/camera separation, radial production sweeps and existing synthesised SFX. Owner approval of those behaviours is recorded as direction, not acceptance of this new pass.
- No KKP-019/020, Artwork Overhaul, Tournament Builder, deployment, merge, release/tag or reference-checkout changes.

### Bugs / corrections

- **Integer currency:** harvesting previously accumulated fractional cargo/credits; the snapshot floored credits, exposing values just below integer boundaries. Harvesting and unloading now transfer whole crystal/credit units while retaining only fractional *time-rate* accumulators. Full loads transfer exactly 500; partial unloading can legitimately show arbitrary integer balances, and costs/refunds are not all multiples of 50. Snapshot and authoritative credits agree. Cancellation remains floor(cost × 75%).
- **AI construction observability:** the AI previously began with complete production infrastructure and mostly built later defences or replacements. It now plans a valid paid build site, exposes timed construction in the snapshot, draws a labelled scaffolding/progress footprint and minimap marker, and places through normal collision/prerequisite/economy rules. Normal/Hard also expand the economy early. No free or instantaneous construction was added.
- **Paired site transition:** the actual header/content/footer fly towards the viewer through perspective transforms; the original website radar environment remains, then the menu appears. Exit tears down the match first and reverses the site motion. Reduced motion uses a brief opacity-only transition. Original DOM, form state and inert state remain intact. Entry/exit generation guards prevent overlapping transitions. No simulation/audio exists before Start.
- **Background sweep correction:** the production `.radar-sweep` rule was inadvertently also hiding the site's background sweep. Scoped production sweep styling to its icon so the existing background is visible again.
- **Scroll restoration:** browser testing caught inherited smooth scrolling leaving the page between positions at exit. Restoration now explicitly uses an instant return to the saved scroll position and focus without scrolling.
- **Return to Command:** pause and outcome menus plus the sidebar offer return to the start menu. Abandoning an unfinished match requires confirmation; cancellation preserves the match. Confirmed return destroys engine/audio/voice state, cancels match frames, resets transient input and retains map/difficulty/faction choices inside Radar. Exit remains the route to the website.
- **HUD redundancy:** removed the top production and Ion Storm strip. Construction remains in the sidebar; category queues retain individual progress, pause/resume, cancel and queued count. Special retains the Ion Storm sweep/status.

### Desktop RTS improvements

- Compact icon/name/cost/status production cards. Secondary descriptions are native tooltips and accessible labels; shortfalls use `N CR SHORT`.
- Credits are an unpadded integer beside an original crystal icon above the minimap. Power is a vertical consumption indicator with generated/used text, reserve/LOW POWER text and an accessible meter; low power has a striped warning treatment.
- Battlefield edge scrolling uses a 24px edge band, a capped/normalised diagonal velocity and 700 screen-pixels/s maximum before world zoom conversion. Pointer leave, sidebar capture, pause and middle drag stop it. Middle mouse drag pans and suppresses browser autoscroll. Arrow keys remain a fallback; WASD is freed.
- `radar-rts-input.js` centralises bindings: Home → base, S → stop, R → repair, X → sell, Space → pause/resume, Escape → exit, arrows → fallback pan. Text fields, selects, buttons and modifier combinations do not accidentally issue game commands.
- Terrain definitions separate type, passability, visual variant and stable asset key. Ground, rock, rough, concrete and resource surfaces are map data; collision uses only non-passable terrain. Static route node counts remain bounded (three circular obstacles per map); rough/concrete are currently passable at normal speed.
- Crystal Reach expands to 4800×3200 with distant bases, local starting fields, intermediate reserves and open approach routes. Split Basin expands to 4400×3800 with diagonal bases, ridge passages and central resource competition. Local harvesting access is retained; increased travel adds strategic distance without multiplying every coordinate. Existing wave timings remain difficulty-driven, so first contact occurs later on the larger maps. Balance remains owner/manual.

### Gameplay expansion

- **Factions:** Aurora Compact and Obsidian Union are independent selectable identities. The opponent uses the other faction. Both intentionally share the current roster/balance. Definitions include roster, costs/prerequisite/power override slots, abilities, superweapon, art/audio identities and AI preference slots for later specialisation; no final asymmetric balance is claimed.
- **Repair:** R/sidebar Repair, then click a damaged owned structure. Toggle that structure again to cancel. Restores 20 HP/s at 10 integer CR/s, charged in whole-credit increments (2 HP/CR, final partial HP costs one credit). Stops at full health or empty funds; a fresh repair order is needed after funds return. A plus marker and target text expose state; no power is consumed by repair itself.
- **Sell:** X/sidebar Sell, then click an owned structure and confirm. Refund is floor(cost × 50%); its queued units receive floor(cost × 75%) each. Removal immediately affects power, prerequisites, queues, collision/navigation and sold-uplink charge. A short sell effect remains. Enemy structures and the Command Hub cannot be sold; the latter preserves the existing HQ win/loss rule.
- **AI economy:** legitimate refinery builds include their normal harvester. Targets are two refineries (Easy/Normal), up to three on Hard after 160s, with economy expansion eligible at 150/40/25s respectively. Extra paid vehicle-bay harvesters bring the bounded target to up to three (Easy/Normal) or four (Hard), subject to funds, prerequisites and remaining resources. Recovery funds are reserved before combat purchases.
- **AI activity:** four-second strategic cadence assigns a forward scout, bounded resource/base patrols and staging positions; units wait at destinations instead of continuously wandering. Tactical acquisition still responds to nearby threats; major waves recruit staged forces. Activities are exposed for deterministic validation.
- **Audio:** preserved all existing oscillator tones; added modest construction, production, repair, sell, attack-order, loss/base-warning and storm-ready tones under the existing six-voice cap/rate limits.
- **Voice foundation:** original phrases use only an installed local English system voice; remote voices are rejected. Off by default, separate local preference, storage-denial fallback, one active utterance, category cooldown 12s, routine spacing 3.5s, priority interruption for urgent alerts. No voice service, samples, accounts or networking. Missing local voices produce a clear status and silent fallback. Pause/menu/restart/exit cancel owned speech. Actual voice quality/OS availability remains manual.

### Ownership / future architecture

- Entities carry controller ID, faction ID and team ID. The scenario declares `commander` (local) and `rival` (AI), separate from their compatibility economy/side slots. Project-wide input mapping sends explicit command objects for local unit orders/build/production/repair/sell; `dispatch` rejects unknown controllers, foreign entity IDs, invalid movement and friendly attack targets.
- This is a foundation, **not network multiplayer readiness**. Remaining work: generalise two-slot economy/opponent logic and side-colour rendering; route remaining low-level selection/placement/queue/superweapon helpers and AI decisions through a uniform serialisable command queue; fixed simulation ticks; complete PRNG/state serialisation and replay logs; cross-engine floating-point movement/pathing determinism; authoritative validation/transport. Browser RAF delta, pointer coordinates, audio/voice timing and decorative website randomness are not network-authoritative. None of that networking is implemented here.
- Stable terrain asset keys and faction art/audio IDs are extension points for the independent artwork task. No external artwork project was read or changed.

### Validation in this pass

- `node tools/validate-radar-rts.mjs`: PASS — 188 deterministic checks. Includes integer transfers at 1/60, .017, .1 and .25 second steps; exact full-load delivery/refunds; owned/foreign command checks; repair/cancel/no-funds/full-health; sell/refund/prerequisite/power/uplink effects; both-map Normal/Hard construction sites/economy/activity; terrain metadata; hotkeys/edges; local-only voice priority/cooldowns/mute/pause/cleanup. Existing combat order priority, independent queues, paid recovery, seeded replay and six-minute six-combination bounded simulations still pass.
- Focused desktop browser case: PASS after fixing scroll restoration. Real active-game AI construction and refinery/harvester expansion were observed without injecting funds or entities. Also covers edge/middle pan, faction selection, sidebar, real sell confirmation/refund, cancelled/confirmed menu return, fresh map start, restored scroll/focus/inert, reduced motion and six-size overflow. Capture evidence is local ignored `.validation/r3/`.
- `npm run validate`: PASS — 46 standard checks. `npm run validate:acceptance`: PASS — 64 checks, zero failures and zero warnings (2026-09-27). Includes all-six-page responsive/functional regression, JavaScript syntax, configuration checks, first-party console monitoring and document overflow checks. `git diff --check`: PASS. No self-test rerun is claimed for this pass.
- Visual review: desktop menu/game, live AI scaffolding/expansion, entry/exit frames at 1920×1080; game at 2560×1440 and 1440×900; basic 1024×768, 390×844 and 844×390 review. All six website pages and Radar menus captured; website content and radar sweep returned after exit with no document overflow. Small-layout options deliberately scroll; a complete mobile redesign is deferred.
- Browser captures found and corrected a compact-tab spacing issue. Final desktop menu/game/exit captures were refreshed at 2560×1440, 1920×1080, 1440×900 and 1024×768; final game frames and the reverse exit transition were visually inspected. AI expansion and scaffolding captures were also inspected.
- MANUAL/UNKNOWN: gameplay feel/balance, physical middle-mouse/touch ergonomics, actual OS voice/SFX quality, assistive technology, true browser zoom/fullscreen, non-Chromium and real hidden-tab behaviour. Third-party embeds were deliberately blocked by the test harness; no live-service success is claimed.

### Changed files / deferred work

- Runtime: `data/radar-game.js`, `data/radar-rts-definitions.js`, `data/radar-rts-engine.js`, `data/radar-rts-renderer.js`, `data/radar-rts-audio.js`, `data/radar-rts-icons.js`, new `data/radar-rts-input.js`, new `data/radar-rts-voice.js`, `styles/radar-game.css`.
- Tests/records: `tools/validate-browser.mjs`, `tools/validate-radar-browser.mjs`, `tools/validate-radar-rts.mjs`, new `tools/validate-radar-desktop.mjs`, `docs/VALIDATION.md`, this record.
- Deferred: mobile redesign, actual multiplayer/matchmaking/accounts, map editor, full artwork overhaul, final faction-specific rosters, advanced dynamic pathfinding/formations, professional voice library and new unrelated RTS systems. Existing mobile input is retained and regression-tested.
- Owner Remediation 3 implementation and automated acceptance are complete: `READY FOR OWNER RETESTING`. This does not record owner acceptance.
- Implementation commit: `4117c2fc26bb487ee2de912e66a40db195cca2ba` (15 files). Pushed only `HEAD:refs/heads/kkp/018-radar-rts-expansion`; fresh remote read matched that exact implementation tip. This subsequent record-only commit records the successful push; its own final remote SHA is supplied in the owner handoff.
- Remote main immediately before and after the implementation push remained `fe18ac1b46fa1e10c517a0475964e9022df28ca9`. No merge, deployment, release/tag, KKP-019/020 work or Artwork Overhaul changes were made.
- Concurrent remote change: the pre-push read found remote `main` at `fe18ac1b46fa1e10c517a0475964e9022df28ca9`, advanced from the starting observation. This task has not written to main; no merge/rebase is performed. Local `main` remains `318cf656b34910b866fbfba5cfa1bd9e266e1c13`, and required base `92e591e6ce749732bbac1ece33e7979e9147f8ca` remains an ancestor of this branch. Acceptance used that recorded base, not the concurrently advanced remote main.

## Owner Remediation 4 — Radar Command 1.4.0

### Authority and preservation

- Owner brief: `628ed269-3c41-47b0-adfc-31003e9d49b3/Pasted text.txt`, 2026-09-27. Continued the clean existing worktree and `kkp/018-radar-rts-expansion` branch at local/fresh remote `b8f5b468dfe6b91769a84513b4a4646b4bc34026`. Fresh remote main at start: `fe18ac1b46fa1e10c517a0475964e9022df28ca9`; historical required base remains an ancestor. No branch reset/recreation or merge.
- Preserved owner-approved integer economy, repair, AI construction/economy/staging, camera controls, production sweeps, construction queue above minimap, original SFX, faction/terrain/ownership foundations. These approvals concern existing behaviour, not acceptance of this pass.
- Desktop first; no KKP-019, Artwork Overhaul, new site task, mobile redesign, networking, deployment or release work.

### Lifecycle and desktop control corrections

- Exit now hides the outgoing Radar presentation before changing its lifecycle state. Previously the `menu`-only visibility rules stopped applying at `exiting`, exposing the gameplay sidebar during the fade. No extra masking timeout was added.
- Locks the root document as well as the body, reserves the scrollbar gutter, contains panel overscroll and restores original inline styles, horizontal/vertical scroll and focus. A scroll guard preserves the saved website position while Radar owns input. Normal panel scrolling remains available.
- Right-click cancels Repair/Sell/Ion/ground targeting before issuing any order. Sell is a one-shot target action with a visible refund indication; no native confirmation. Return to Command immediately tears down the match without a native dialog.
- Escape priority: close Settings; cancel active targeting (a ready structure remains available in Build); otherwise end the current match and return to Command. From Command, Escape exits Radar to the website. No simulation, AI, audio, voice or control-group state persists between matches.
- Standard mouse model: left selects, Shift-left adds/removes selection, empty-ground left deselects; right gives move/attack orders. Optional classic-left model retains left-click contextual orders and right-click cancellation/deselection. Touch tap selection/orders remain. Clear Selection was removed.
- Edge scrolling extends across the narrow outer frame at the battlefield left/bottom boundaries; the sidebar/header are excluded and pointer leave/focus loss stops scrolling. Browser limitations remain: a website cannot confine the OS pointer outside its window. No intrusive/automatic Pointer Lock was introduced. Middle-drag remains configurable.
- The amber box was the canvas's explicit `:focus-visible` rule. Replaced it with a Radar-specific keyboard-focus badge in the footer; button/input focus indications remain.

### Command UI, settings and factions

- Power is one instrument: lightning icon, one used/capacity label, segmented vertical reserve/consumption bar, POWER ONLINE or textual/striped LOW POWER state, accessible meter description. Credits and the separate structure-construction queue are retained.
- Six larger icon/label order buttons (Base, Stop, Guard, Scatter, Attack move, Force fire) use at least 44px desktop hit areas. Target modes provide cursor/target feedback. Tooltips follow remapped keys.
- Independent producers use compact square slots, numbered per factory, with unit icon, clockwise sweep, queue count and ready/paused/low-power state. Selecting/focusing a slot exposes its identity; selecting opens one shared detail row with that factory's pause/cancel controls. No queues are combined.
- Command Settings provides mouse model, edge toggle/speed (150–1400 screen px/s), middle pan, SFX/voice toggles and separate volumes, plus configurable hotkeys. Preferences use local storage with session fallback; existing audio preference keys remain compatible. No account/cloud service.
- Defaults: Home base; S stop; G guard; D scatter; F force fire; A attack move; R repair; X sell; I Ion Storm target; U select combat units; B construction tab; Space pause. Unique letter/Space/Home/End bindings only; conflicting/reserved keys are rejected. Ctrl/Alt/Meta browser shortcuts are not captured.
- Groups: Shift+1–9 assigns, 1–9 recalls, double-tap recalls/centres. Ctrl+1–9 intentionally remains the browser's tab switch. Groups retain only living owned units and clear on restart/menu/exit.
- Aurora Compact / Obsidian Union remain mechanically symmetrical. Menu selection, explicit sidebar identity and different provisional friendly entity/minimap accents now expose the selected faction. Hostile red remains a team cue. No artwork overhaul.

### Gameplay, terrain and voice

- Guard defends a chosen location with bounded pursuit/return; Scatter spreads selected combat units; Attack Move engages threats then resumes its destination; Force Fire fires at a location or entity (including friendly targets) within the unit's normal weapon range/cooldown. All use the ownership-checked simulation command boundary. Explicit Move still overrides combat.
- Occupied structures have data-driven personnel: Barracks sell releases two Rangers; Refinery/Vehicle Bay sell releases one. Destruction independently rolls up to those counts at 50% for Barracks/Vehicle Bay and 40% for Refinery. Spawn respects the unit cap, bounds and occupied/blocked positions; crowded sites may release fewer. Both sides use the same seeded rules; each structure releases once. HQ, Reactor, Turret and Uplink have no configured survivors. Economy/refunds remain integer.
- Terrain definitions explicitly classify gameplay versus visual materials with meaning, movement multiplier, buildability and stable asset keys. Rock blocks movement/building; crystal is finite harvestable terrain excluding construction. Ground allows normal movement/building. Rough variation and HQ concrete/foundation markings are visual-only with no speed/cover/build bonus; their tint is subdued. Map foundation purpose is explicit. No map editor or new terrain mechanics.
- Voice arbitration queues up to four noncritical lines instead of cutting them off. Only critical priority (5+) can interrupt a lower-priority line. Duplicate category cooldown remains 12s; queued routine lines expire after 3s and strategic notifications after 6.5s. Completion drains the priority queue; mute/pause/menu/restart/exit clear it. Only installed local English voices are eligible. Existing SFX are preserved with volume control.

### Read-only artwork compatibility review (owner addendum)

- Inspected `C:\Users\Michael\Documents\ChatGPT\Artwork Overhaul\radar-command` at the owner-supplied `f6f4a973075625503d837d45b397dc45cfa9eeb3`, clean at inspection. Read Phase 3 art bible, asset/portrait/terrain manifests, review notes and review-page source. External repository: `https://github.com/GandalfTEGT/Radar-Command-Artwork`. No external file edits, copies, integration, push or asset readiness claims.
- Owner direction: overall visual direction approved; large vehicles/structures differentiate well; infantry/small vehicles and UI/faction marks need further refinement. Review candidates remain unauthorised for KKP-018 integration.
- Export canvases vary: infantry 48px, Scout 72px, main vehicle 96px, Harvester 112px, Bastion 128px; structures 96–208px. These are art export canvases, **not collision footprints or verified runtime draw sizes**. Portraits are separate SVG/subject derivatives, reviewed at 64/128px, with independent radial UI overlay. Terrain has substrate, material-overlay and raised-decoration categories, not one texture.
- Added separate per-kind/type/faction visual descriptors: independent world/portrait keys, source and dimension slots, world draw size/anchor/facing policy and existing vector fallback. Sources/dimensions remain null until an authorised integration agrees them; nothing loads artwork. Existing collision radius, selection and simulation geometry remain independent of visual dimensions. Current production buttons expose the faction-specific portrait key; renderer fallback accent resolves through the world descriptor.
- Genuine later integration gaps: current top-down vectors rotate with unit heading; Phase 3 proposes high-oblique 60°/45° lighting and one static facing, explicitly unsuitable for arbitrary raster rotation. Draw projection, ground anchors, directional sets/turret policy, depth sorting and hit/collision alignment require a future agreement. Team panels are baked; precise tint masks are absent, so the current whole-vector friendly accent cannot be applied as a global raster recolour. Terrain art is not a complete certified seamless adjacency atlas. FX are static keys, not finished animation timing.
- Proposed artwork factions FRD/SWU are not silently equated with Aurora/Obsidian. A later approved mapping/rename must reconcile those identities and role aliases (rifle/basic infantry, tank/main vehicle, warFactory/war factory, uplink/Ion array). Current entity-to-faction descriptors allow different assets for every faction/entity without assuming common sprite dimensions or shared portraits.
- Final read-only check: HEAD still `f6f4a973075625503d837d45b397dc45cfa9eeb3`; new untracked `.gitignore` and `phase3-refinement-review/` appeared during this work from outside this task. They were not edited, removed, copied or integrated. The earlier clean observation is historical, not a claim that the external workspace is clean at delivery.

### Validation results

- `node tools/validate-radar-rts.mjs`: PASS — 266 checks, including 78 new assertions for tactical commands, survivor counts/caps/ownership, terrain semantics, settings/bindings/storage denial, control groups, voice arbitration and separate faction/entity/world/portrait slots.
- Browser coverage extends existing lifecycle/AI/economy/input tests. The new compact-factory case uses an isolated served test fixture selecting the engine's existing validation scenario (20,000 starting credits and no AI); all structures and queues still use normal paid build/production rules. This isolates layout coverage from a lengthy undefended match. No production test hook or source-file mutation is used. Separate existing runtime checks exercise real standard-scenario AI construction/expansion.
- Focused controls browser test: PASS, including menu exit frame sampling with no gameplay-sidebar flash, scroll lock/restoration, no native dialogs, targeting cancellation, configurable mouse model, remapped keys/conflicts, ownership-safe groups, fresh-match cleanup, settings refresh/storage denial, faction/focus feedback and three independent Barracks/Vehicle Bay queues with one paused independently.
- Visual review exposed a resize-frame gap: assigning canvas dimensions clears the buffers before the next animation frame. Resize now repaints both world and minimap synchronously within its callback, without advancing simulation. Focused browser rerun passed pixel-presence assertions at 2560×1440, 1920×1080 and 1440×900; refreshed three-factory screenshots were visually inspected.
- Desktop menu/settings/game, Power/Orders, independent queue slots, exit transition and keyboard focus reviewed at 2560×1440, 1920×1080 and 1440×900. Basic 1024×768, 390×844 and 844×390 captures were also inspected; smaller sidebars/settings deliberately scroll. A separate local browser fixture built a paid Reactor/Refinery, sold the Reactor, verified `LOW POWER` text and visually confirmed the striped deficit instrument plus retained battlefield during paused resize to 2560×1440. Local ignored screenshots: `.validation/r4/`.
- All six website pages were captured and visually inspected after Radar menu exit at 1440×900: content/sweep returned, focus restored and no document overflow. Third-party embeds were blocked intentionally; these captures do not establish live-service playback.
- `npm run validate`: PASS — 47 standard checks after the resize correction. `npm run validate:acceptance`: PASS — 65 checks (2026-09-27), including all six pages at 320/390/768/1024/1440, existing functional regressions, reduced motion, touch input, lifecycle cleanup, first-party console errors, overflow, JavaScript syntax, configuration and diff checks. Local standard evidence is preserved at `.validation/r4/standard-results.json`; acceptance evidence is `.validation/last-run.json`. The earlier standard run exposed a legacy Escape-to-website assertion, updated to the new owner-approved Command-menu flow. No self-test rerun is claimed in this pass.
- MANUAL/UNKNOWN: subjective balance, physical pointer/middle-mouse/touch feel, real browser window-boundary/hidden-tab behaviour, actual OS voice/SFX quality, assistive technology, non-Chromium, true browser zoom/fullscreen. Mobile receives basic regression only.
- Changed runtime files: `data/radar-game.js`, `data/radar-rts-definitions.js`, `data/radar-rts-engine.js`, `data/radar-rts-renderer.js`, `data/radar-rts-input.js`, `data/radar-rts-icons.js`, `data/radar-rts-audio.js`, `data/radar-rts-voice.js`, `styles/radar-game.css`. Tests: `tools/validate-browser.mjs`, `tools/validate-radar-browser.mjs`, `tools/validate-radar-desktop.mjs`, `tools/validate-radar-rts.mjs`, new `tools/validate-radar-controls.mjs`. Records: this file and `docs/VALIDATION.md`. No owner acceptance is recorded.
- Owner Remediation 4 implementation, automated acceptance and visual review are complete: **READY FOR OWNER RETESTING**. Final pre-commit remote read still had task branch `b8f5b468dfe6b91769a84513b4a4646b4bc34026` and main `fe18ac1b46fa1e10c517a0475964e9022df28ca9`; local main remains `318cf656b34910b866fbfba5cfa1bd9e266e1c13`, required base `92e591e6ce749732bbac1ece33e7979e9147f8ca` remains an ancestor.
- Implementation commit: `83360bba34eed4d1d7dce3a4ef52e5411b83dfe7` (16 files). Pushed only `HEAD:refs/heads/kkp/018-radar-rts-expansion`; a fresh remote read matched that exact SHA and main remained `fe18ac1b46fa1e10c517a0475964e9022df28ca9`. Worktree was clean after that push. This subsequent record-only commit documents completed delivery evidence; its exact final remote SHA is supplied in the owner handoff. No main modification, merge, deployment, release/tag, KKP-019 work or artwork integration occurred.

## Final Owner Polish / Public Release Candidate — Radar Command 1.5.0

### Authority, starting state and scope

- Final owner-polish brief: `82078c44-b383-42af-ab89-095a78610004/Pasted text.txt`, plus the owner queue/Command-menu clarification received 2026-09-27. Continued the existing `kkp/018-radar-rts-expansion` worktree from clean local/fresh remote `c58a90e5cc479275199563166813b2212357dc45`; no reset, branch recreation or implementation restart.
- Fresh pre-delivery remote read still showed the task branch at that starting SHA and `main` at `fe18ac1b46fa1e10c517a0475964e9022df28ca9`. Local `main` remains `318cf656b34910b866fbfba5cfa1bd9e266e1c13`; required base `92e591e6ce749732bbac1ece33e7979e9147f8ca` remains an ancestor.
- Preserved the accepted gameplay, economy, AI, repair/sell, factions, terrain, audio/voice, hotkeys, control groups, queue, lifecycle and artwork-compatibility foundations. No units, structures, maps, factions, asymmetry, campaign, networking, map editor, new superweapon, major AI system, mobile redesign or artwork integration was added.

### Public release behavior

- Visible version is `Radar Command 1.5.0 · Public release candidate`, independent of KKP numbering. The start menu now identifies the game as a tactical browser RTS, retains the focused faction/map/difficulty choices and concise Quick Controls, and states that current factions share the same units and balance.
- Radar activation is available only at viewport width >=1200 **and** height >=1000. Unsupported pages show a disabled first-party control explaining that Radar needs a larger desktop viewport; modules, overlay, simulation, audio and animation loop remain uncreated. Exact 1199×1000 and 1200×999 boundaries are unavailable; 1200×1000 and larger are available. An active match resized below the gate pauses without losing entities, presents a viewport panel with Leave Radar, and resumes the preserved match when support returns.
- Escape cancels an active targeting mode first, then opens the paused Command Menu. The same menu is available from the persistent Command Menu control and offers keyboard-accessible Resume Game, Quit Match and Leave Radar. Resume continues the same simulation; Quit performs complete match teardown and returns to the Radar start menu; Leave performs teardown and restores the website/scroll/focus through the approved transition. No native dialog is used.
- Settings group mouse controls, edge scrolling, audio and hotkeys. Edge activation width is configurable from 20–72px (44px default), speed remains configurable from 150–1400 screen px/s, and the sidebar is excluded. Optional right-drag pan is off by default, persists locally and starts only after a 9px movement threshold; a stationary right-click remains contextual and releasing a drag issues no accidental order. Middle pan remains configurable. Restore Defaults resets controls, hotkeys and audio preferences with a visible status; storage denial safely falls back to session behavior.
- Pointer Lock was investigated and deliberately omitted. With a persistent interactive sidebar it would require disruptive release/reacquisition and would not improve normal edge scrolling enough to justify the browser/interaction cost. Settings accurately explain that ordinary browser input cannot track the pointer after it leaves the window.
- Queue controls now use the production cards directly. A left-clicked unit is automatically distributed until the player explicitly selects a producer; after selection it is added to that exact queue and resumes a paused queue. The first right-click on a running queue pauses it; each later right-click removes one queued unit with the existing 75% refund until empty, then clears paused state. The permanent Pause Queue and Cancel Unit buttons were removed. Accessible names/tooltips and the shared detail line expose the sequence; independent queues and normal paid production remain intact.
- Bounded polish removed prototype/task wording from the public version, clarified control copy/tooltips, retained meaningful button/input focus, prevented unavailable activation, and kept the existing bounded entity/projectile/effect/audio/DOM systems. No debug logging or dead production controls remain. Reduced-motion entry/exit and non-animation status text are preserved.

### Validation and visual evidence

- `node tools/validate-radar-rts.mjs`: PASS — **272 deterministic checks**. Additions cover right-drag/edge preferences and bounds, local persistence/defaults, left-add resume, explicit producer targeting, repeated right-click cancellation and paused-state reset. Existing bounded six-minute simulations for every map/difficulty, entity/effect/projectile/audio caps, economy, AI, orders, terrain, factions, survivors, voice arbitration and teardown remain green.
- `npm run validate`: PASS — **47 standard checks** after final source/test changes.
- `npm run validate:acceptance`: PASS — **65 checks**, zero reported failures. Covers all six website pages at 320/390/768/1024/1440, JavaScript syntax, configuration validation, diff whitespace, first-party console monitoring, document overflow and the full functional suite.
- Focused browser coverage passed exact 1199×1000 / 1200×999 / 1200×1000 gating; no pre-start simulation; configurable/persisted right-drag and 60px edge zone; stationary right-click versus drag; Command Menu/Resume/Quit/Leave; targeting priority; live resize preservation; blur pause; settings restore-defaults and storage denial; revised queue sequence; repeated entry/exit; fresh match; scroll/focus/inert/audio/voice/hotkey/pointer cleanup; no duplicate overlay; reduced motion; and all-six-page Radar availability.
- Final visual review passed at 2560×1440, 1920×1080, 1440×1000 and minimum 1200×1000 for the start menu, Settings, active game and paused Command Menu. Unsupported-state presentation was reviewed at 1199×1000 and 1200×999. No clipping or document overflow was observed; the minimum-size menu and sidebar remain readable, with deliberate Settings scrolling below the fold.
- Performance sanity is supported by the existing deterministic six-minute matrix and browser lifecycle/queue cases: bounded unit/structure/projectile/effect/audio collections, one gameplay RAF, queue-row reuse, teardown and repeated activation all passed. No new optimisation blocker was found.
- Final `git diff --check`, JavaScript syntax and configuration checks: PASS. Line-ending conversion notices are informational and no whitespace error was reported.

### Manual / unknown and delivery boundary

- MANUAL/UNKNOWN: subjective gameplay feel/balance; physical right/middle-mouse ergonomics and edge feel; real browser-window pointer-boundary behavior; actual OS voice/SFX quality; real assistive technology; true browser zoom/fullscreen; real hidden-tab behavior; and Safari/Firefox. Automation does not claim WCAG conformance.
- Mobile gameplay remains deliberately unavailable below the release gate; mobile website regression passed. No mobile RTS parity claim is made.
- Radar-Command-Artwork was not modified, copied or integrated. No main write, merge, deployment, release/tag, KKP-019 work or unrelated website-system change is authorised or performed.
- Implementation commit: `b68a517fbaccfb7eff37646c9195ce098123a03b` (12 files). Pushed with the explicit refspec `HEAD:refs/heads/kkp/018-radar-rts-expansion`; the immediate fresh remote read matched that exact SHA and confirmed remote `main` remained `fe18ac1b46fa1e10c517a0475964e9022df28ca9`. This subsequent record-only commit preserves delivery evidence; its final remote SHA is supplied in the owner handoff.
- Status after successful automation and visual review: **RADAR COMMAND 1.5.0 — READY FOR FINAL OWNER RETESTING**. This is not owner acceptance. After acceptance, feature work stops and the next authorised activity is reconciliation with current main plus combined validation before merge.

## Follow-ups

- Deferred deliberately: full visual-art overhaul, richer sound/voice library, fog of war, advanced pathfinding/formations, campaign missions and additional superweapons. Remediation 2 added original SFX and static-terrain routing; Remediation 3 added repair/sell and the bounded local voice foundation; Remediation 4 adds control groups and configurable tactical orders. Those capabilities are no longer wholly deferred.

## Validation evidence

- `node tools/validate-radar-rts.mjs`: PASS — 52 deterministic checks covering world stability, prerequisites, placement rejection, construction, power, finite resource depletion, autonomous delivery/credits, production progress/completion, selection, movement, combat/death, Ion Storm charge/use/recharge, low-power consequences, victory, defeat, AI production/attack, caps and teardown.
- `npm run validate`: PASS — 44 checks on the implementation before the final reduced-motion and expanded deterministic assertions.
- `npm run validate:acceptance` (final): PASS — 62 checks, zero failures/warnings, all six pages at 320/390/768/1024/1440, functional Home/Music/Videos/Tournaments/Radar coverage, first-party console monitoring and no document overflow. The focused Radar case additionally activates the game at 320px and tests reduced motion.
- `npm run validate:self-test`: PASS — 7 detection/scope probes; all injected source bytes restored.
- Rendered Radar Command frames visually inspected at 2560×1440, 1920×1080, 390×844 and 844×390; battlefield, HUD, minimap, production states and exit controls remained legible without overlap or clipping. A 1024×768 live-resize state was also exercised by the focused browser test.
- Final JavaScript syntax and `git diff --check`: PASS after the last source changes.
