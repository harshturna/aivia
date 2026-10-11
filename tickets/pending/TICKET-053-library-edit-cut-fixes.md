# TICKET-053: Library, Edit and Cut fixes

**Status:** pending
**Created:** 2026-10-11
**Started:** —
**Completed:** —
**Area:** ui

## Goal
Library search keeps typing, the lightbox fits phones and pages, Edit never double-spends or sits blank, and Cut keeps its result.

## Context
- Findings: TICKET-050, section C. Each names the file and the evidence; screenshots are in
  `.audit/` locally (gitignored), so the ticket text is the record.
- Found by using the app, not by reading it: verify each fix the same way (Playwright, real
  content, 1440, 1440x600 and 390), not only by tests.

## Plan
- [ ] Read the files named in TICKET-050 §C and write the concrete plan here before starting.
- [ ] Highs first, then mediums, then lows that are cheap.
- [ ] Verify: `npm run verify`, `npm run test:e2e`, a Playwright pass over each fixed state,
      screenshots at 1440 and 390, the web-design-guidelines pass.

## Progress log
- 2026-10-11 — Written from the TICKET-050 audit.

## Handoff
- **State:** not started.
- **Blocked on:** nothing
- **Next:** plan from TICKET-050 §C.
- **Read first:** TICKET-050 §C.

## Verification

## Outcome
