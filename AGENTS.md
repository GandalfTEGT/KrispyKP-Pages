# KrispyKP Work Rules

These are the stable rules for repository work. Start with `npm run status`, then read the current authorised task record. Historical records are evidence, not current authority.

## Authority and Git safety

- Inspect the real filesystem, branch, HEAD, worktree status, remotes and ancestry before acting; do not trust a historical path or SHA without verification.
- Work only in the checkout and branch authorised for the task. Never switch branches beneath another Work instance or alter another checkout's uncommitted files.
- Treat reference/manual checkouts as read-only. Do not rewrite history, force-push, reset away owner work, or amend someone else's commit.
- Never push directly to `main`. Do not merge, deploy, tag, release, change hosting/repository settings, submit forms, or make external account changes without explicit owner authority.
- Production changes belong on the authorised task branch. A normal lifecycle is: implement → validate → commit → push the authorised task branch → owner retest → owner acceptance. Automated success is not owner acceptance.
- Verify facts separately from assumptions. Never claim a test, device, browser, service, or owner check was performed when it was not.

## Implementation principles

- Preserve the static GitHub Pages architecture unless a task explicitly authorises architectural change. Development tooling must not add production runtime weight.
- Content should not require layout repair. Prefer intrinsic Grid/Flex, wrapping, `min-width: 0`, content-driven sizing and resilient fallbacks over brittle fixed dimensions.
- Preserve keyboard access, semantic structure, focus behavior, reduced-motion handling, readable contrast and existing assistive labels.
- Reuse existing validators and data contracts. Do not alter production behavior merely to make a test convenient; a tiny semantic hook is acceptable only when it improves the real architecture.
- The private Tournament Builder is a separate local project. Do not modify or push it unless the task explicitly authorises Builder work. Public schema changes must still record Builder compatibility as tested, manual or unknown.

## Validation and reporting

- Run `npm run status` before implementation and `npm run validate` after it. Use the profiles and impact rules in `docs/VALIDATION.md`.
- Full automated regression is cheap and should normally precede delivery. Shared shell/CSS/navigation/header/footer changes also require full public-route visual inspection. Page-specific changes require targeted visual inspection of the affected page and any shared surfaces actually changed.
- Keep subjective and unavailable checks as `MANUAL` or `UNKNOWN`: visual quality, gameplay feel, physical touch ergonomics, real assistive-technology quality, true zoom, non-Chromium behavior, real hidden-tab behavior, search ranking and unobserved social crawlers.
- Update the durable task record with requirements, evidence, changed files, commits, remote verification and owner-acceptance state. Use `tasks/TASK_TEMPLATE.md` for new work; do not leave requirements only in conversation history.
- Finish with a clean worktree containing only intended changes. Report exact commands and results, remaining manual boundaries, commit SHA, remote state, and confirmation that protected branches/checkouts were not modified.
