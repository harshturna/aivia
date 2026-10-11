# TICKET-055: Landing page fixes

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
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
- Files: `app/(landing)/page.tsx`, `app/(landing)/layout.tsx`, `app/(landing)/_landing/hero.tsx`,
  `sections.tsx`, `studio-demo.tsx`, `wall.tsx`, `nav.tsx`, `your-turn.tsx`,
  `components/studio/run-demo.tsx`, `app/get-started/page.tsx` and `guest-start.tsx` (pass
  `send` along), `app/(app)/studio/page.tsx` and `studio-client.tsx` (send once on arrival).
- Already done: a failed guest start shows an error with Try again (TICKET-054); the hand-off
  loading skeleton is neutral (TICKET-054); design §5.1 matches the guest's arrival
  (TICKET-052); the live examples no longer say ten seconds (seed re-run, above).
- Left with TICKET-017 (owner decision): the Studio frame on the real run component, which
  also settles the frame's end state hiding the plan.
- Not changed, design calls under D-004 for the owner: the hero's length and the lack of a
  plain line or button inside it; mid-scroll overlaps and the landscape-phone hero (the
  sequence's own choreography); the hero animating width and height; the 6 to 7 px chip text
  in the headline at 390; the three sets of names for the four media; the brief's three
  versions.
- Found by using the app, not by reading it: verify each fix the same way (Playwright, real
  content, 1440, 1440x600 and 390), not only by tests.

## Plan
- [x] Studio frame: one explicit column on phones (no overflow); "Running" and the Recent
      spinner end when the replay ends; a neutral user ("Maya", "2 of 5 generations"); the
      plan says 5 s; no Download icons on the landing's audio rows.
- [x] Pricing folded into the close: the close section is `#pricing`, says "Five free
      generations to start" and Pro's $20 a month above its button; the standalone block goes.
- [x] Reduced motion: the hero holds its opening frame, the brief with its windows inline.
- [x] The hand-off sends: the landing composer's send opens the Studio and sends the brief
      once (through the guard), and the address drops the prompt afterwards.
- [x] Footer: Studio goes through /get-started; Library and Edit leave the footer. Phone nav
      shows Sign in.
- [x] Wall: copy no longer contradicts Cut, and says captions show on hover; the first row loads eagerly.
- [x] One left edge: the hero's text, triptych and timeline on the 1200 px wrap.
- [x] The dead band after the hero shrinks to the page's section rhythm.
- [x] Small: sound control named "Play the soundtrack"; the window shadow uses the token;
      `themeColor` points at its token; per-section intrinsic sizes so the page height holds.
- [x] Verify: `npm run verify`, `npm run test:e2e`, Playwright at 390 (frame width), with
      reduced motion (h1 visible), the hand-off with `/api/agent` stubbed (one send, address
      cleaned), gaps between sections at 1440 and 390; screenshots; web-design-guidelines.

## Progress log
- 2026-10-11 — Written from the TICKET-050 audit.
- 2026-10-11 — Started; files read, plan written.
- 2026-10-11 — Built. Changes from the plan: reduced motion first kept the brief small above
  the triptych, but the windows are placed from a measurement the extra room invalidated;
  holding the opening frame (p = 0, windows open in the brief) is simpler and reads better.
  Wall tiles are not made focusable after all: lint rejects tab stops on figures, screen
  readers already read each prompt, and the lede now says to point at a tile. The dead band
  closes with the hero overlapping the next section by 8svh (the next section sits above the
  stage), not by moving the timeline.

## Handoff
- **State:** closed.
- **Blocked on:** nothing
- **Next:** TICKET-056 (checks that would have caught these, and the Railway correction).
- **Read first:** nothing

## Verification
```
npm run verify      # lint (no errors), typecheck, tickets, 82 unit tests: pass
npm run test:e2e    # 24 passed
node .audit/t055/m.mjs, band2.mjs, v.mjs, rm.mjs   # Playwright; /api/agent stubbed
  left edges: every heading at x=152 (1440) and 24 (390); no sideways scroll
  gap from the hero's last lane to "Now write yours": 147 px (1440), 180 px (390);
    was 379 and 408
  390 Studio frame: content right edge 365 inside the frame's 366; "Running" gone at the end
  #pricing: "Begin with one sentence. / Five free generations to start. Pro is $20 a month,
    for when one sentence turns into a habit. / Start making"
  phone nav shows Sign in; footer: Studio (via /get-started), Pricing, Sign in, Create account
  reduced motion: h1 opacity 1 at 390 and 1440, windows inline in the brief
  hand-off: one /api/agent call, address /studio?local=…, the brief in the thread; a reload
    sends nothing
```
Screenshots reviewed: `.audit/t055/reduced-1440.png`, `reduced-390.png`, `frame-390.png`,
`band-1440.png`, `band-390.png`. web-design-guidelines over the changed code: no findings.

## Outcome
Shipped: the Studio frame fits phones, ends its "Running" state, shows a neutral user and 5 s
clips, and its audio has no Download; pricing is folded into the close with the real offer and
Pro's price; reduced motion shows the brief with its media inline; the landing composer's send
really sends, once; the footer and phone nav lead somewhere useful; the wall's copy matches the
product; the hero shares the page's left edge; the dead band after the hero is down to the
section rhythm; the sound control is named; raw colours explained or tokenised; section sizes
hold the page height. Left out: the design calls listed in Context for the owner, and the
Studio frame's rebuild, which stays with TICKET-017.
