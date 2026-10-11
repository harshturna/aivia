# TICKET-014: - [ ] Playwright config and the smoke specs with axe at 1440 and 390.
- [ ] Fix what they find; VoiceOver pass of the Studio and the lightbox.
- [ ] Verify: `npm run verify`; `npm run test:e2e` green; `npm run shots` at four widths.

**Status:** pending
**Created:** 2026-10-10
**Started:** —
**Completed:** —
**Area:** quality

## Goal
Accessibility and responsive pass with a Playwright smoke per screen

## Context
Every screen passes axe, has a keyboard path, honours reduced motion, and lays out at 1440,
1024, 768 and 390 with no horizontal scroll; a Playwright smoke suite loads each screen as the
guest and checks it.

## Plan
- Design §14; `@axe-core/playwright` as lynq uses it (`../lynq/tests/e2e/app/a11y.spec.ts`).
- Files: `playwright.config.ts`, `tests/e2e/*.spec.ts` (landing, auth, studio, library, edit,
  characters, settings), `scripts/shots.mjs` (adds 1024 and 768), the fixes wherever found.
- Needs a running dev server with `.env`; not part of `verify`; `npm run test:e2e`.

## Progress log
- 2026-10-10 — Opened from the revamp design (TICKET-002, `docs/design/revamp.md` §15).

## Handoff
Kept current while the ticket is in progress. Overwrite, do not append.
- **State:** not started
- **Blocked on:** nothing
- **Next:** start
- **Read first:** `docs/design/revamp.md`

## Verification
Filled in on completion. The command that was run, in a code block, and its result.

## Outcome
Filled in on completion: what shipped, what was deliberately left out, follow-up tickets created.
