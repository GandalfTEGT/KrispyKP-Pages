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

## Remote verification

- Remote/branch: pending `origin/kkp/018-radar-rts-expansion`
- Verified remote tip: pending
- Main unchanged: pending final verification
- Protected checkouts unchanged: yes at task start
- Push/merge/deploy state: no push, merge, deploy, release or tag at task start

## Owner acceptance

- Owner retest instructions: launch Radar RTS from any page; build Pulse Reactor → Crystal Refinery → production structures; confirm the included harvester gathers and credits rise; produce/select/order forces; build and power the Storm Uplink; target the Ion Storm; complete or lose the mission; test Pause, Restart, Escape and Exit at preferred desktop/mobile sizes.
- Owner result/date: pending.
- Acceptance evidence: none yet.
- Merge/deploy authority granted separately: `NO`

## Follow-ups

- Deferred deliberately: fog of war, repair/sell, advanced pathfinding/formations, control groups, campaign missions, audio and additional superweapons. These are extensions beyond the validated minimum loop.

## Validation evidence

- `node tools/validate-radar-rts.mjs`: PASS — 52 deterministic checks covering world stability, prerequisites, placement rejection, construction, power, finite resource depletion, autonomous delivery/credits, production progress/completion, selection, movement, combat/death, Ion Storm charge/use/recharge, low-power consequences, victory, defeat, AI production/attack, caps and teardown.
- `npm run validate`: PASS — 44 checks on the implementation before the final reduced-motion and expanded deterministic assertions.
- `npm run validate:acceptance` (final): PASS — 62 checks, zero failures/warnings, all six pages at 320/390/768/1024/1440, functional Home/Music/Videos/Tournaments/Radar coverage, first-party console monitoring and no document overflow. The focused Radar case additionally activates the game at 320px and tests reduced motion.
- `npm run validate:self-test`: PASS — 7 detection/scope probes; all injected source bytes restored.
- Rendered Radar Command frames visually inspected at 2560×1440, 1920×1080, 390×844 and 844×390; battlefield, HUD, minimap, production states and exit controls remained legible without overlap or clipping. A 1024×768 live-resize state was also exercised by the focused browser test.
- Final JavaScript syntax and `git diff --check`: PASS after the last source changes.
