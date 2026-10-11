# TICKET-055: Landing page fixes

**Status:** pending
**Created:** 2026-10-11
**Started:** —
**Completed:** —
**Area:** ui

## Goal
The landing works on phones and with reduced motion, tells the truth about pricing, and stops repeating itself; owner decisions in TICKET-050 §F decide the pricing copy.

## Context
- Findings: TICKET-050, section E. Each names the file and the evidence; screenshots are in
  `.audit/` locally (gitignored), so the ticket text is the record.
- Owner, 2026-10-11: Pro's "Unlimited generations" stays as written although every account
  has the 100-a-day cap; this is mostly a portfolio project, so plan copy is not held to
  billing precision. Pricing's "Five generations in every mode" becomes "Five free
  generations to start" on the same footing.
- Done 2026-10-11 with the owner's yes: `scripts/guest-examples.mjs` re-run against the live
  database; the four examples no longer say "ten seconds" (checked through the live API).
  The landing's Studio frame still says "Generate a 10 s clip": fix it here.
- Found by using the app, not by reading it: verify each fix the same way (Playwright, real
  content, 1440, 1440x600 and 390), not only by tests.

## Plan
- [ ] Read the files named in TICKET-050 §E and write the concrete plan here before starting.
- [ ] Highs first, then mediums, then lows that are cheap.
- [ ] Verify: `npm run verify`, `npm run test:e2e`, a Playwright pass over each fixed state,
      screenshots at 1440 and 390, the web-design-guidelines pass.

## Progress log
- 2026-10-11 — Written from the TICKET-050 audit.

## Handoff
- **State:** not started.
- **Blocked on:** nothing
- **Next:** plan from TICKET-050 §E.
- **Read first:** TICKET-050 §E.

## Verification

## Outcome
