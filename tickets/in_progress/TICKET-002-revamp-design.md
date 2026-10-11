# TICKET-002: The revamp design: direction, information architecture, sequence

**Status:** done
**Created:** 2026-10-10
**Started:** 2026-10-10
**Completed:** 2026-10-10
**Area:** ui

## Goal
A written design for the whole revamp, decided and recorded, that every implementation ticket
is written from: the visual direction (tokens, type, motion), the product's information
architecture (what exists, where it lives, what is cut), each screen, the landing page, the
data the new screens need, and the order of tickets.

## Context
- The owner's brief (2026-10-10): the app "looks so ugly", like a template; revamp it completely
  so it looks "like an actual company"; images and motion welcome on the landing page; the app
  "should ascend with it"; freedom to choose the direction, change navigation, add and remove
  features, remove friction; set up tickets as in `../lynq`; tackle each part one by one.
- What exists (read in full on 2026-10-10): a shadcn template on Montserrat with a coral primary
  and a radial glow; three route groups each with its own sidebar (generative, characters,
  transformations); a dashboard that is a list of five cards; per-tool pages (conversation,
  code, image, video, music, documents) beside the Studio agent that already does all of it;
  nothing persisted except characters and their messages; a "5 free generations" card with a
  gradient Upgrade button fixed in the sidebar. Screenshots of every route at 1440 and 390
  were taken before any change (`npm run shots`).
- Research, three parallel passes on 2026-10-10, kept in `docs/design/research-landing.md`,
  `docs/design/research-app.md` and summarised in `docs/design/revamp.md` §1: how the
  best-regarded AI creative tools build their landing pages and apps this year, which
  typefaces and palettes now read as AI-generated, the motion vocabulary that reads as
  premium, and the tooling (Tailwind 4, Motion 14, React's `<ViewTransition>`, the
  `frontend-design` and `web-design-guidelines` skills, now in `.claude/skills/`).
- Constraints: a solo build; every generation costs money on a shared guest account; light
  only, as the owner chose for lynq, with tokens that could take a dark set later; Radix
  primitives stay (the React 19 peers were bumped in TICKET-001); Tailwind 4 lands in the
  tokens ticket; Stripe and the plan stay as they are.
- Ruled out, with the reasons in D-001 and D-002: a dark "cinema" look (needs footage a solo
  build cannot keep supplying); the cream, serif and terracotta look (now a recognised AI
  tell); keeping per-tool pages beside the Studio; weighted credits (a billing change, not a
  design one); cutting Characters (a product call the owner has not made; it is demoted).

## Plan
- [x] Research passes (landing pages, app UI, tooling) and the skills installed.
- [x] `docs/design/revamp.md`: the token plan checked against the brief per the
      `frontend-design` skill, the IA, every screen, states, motion, data, sequence.
- [x] A mockup artifact of the direction (landing hero, the Studio with a run, the library)
      published and linked from the design and D-001.
- [x] D-001 (visual direction) and D-002 (information architecture and routes) recorded.
- [x] Implementation tickets opened, TICKET-003 onward, each citing its design sections.
- [x] Verify: `npm run verify` (no code changes); the mockup reviewed at 1440 and 390.

## Progress log
- 2026-10-10 — Filed and started once the three research passes were in and TICKET-001 had
  closed. Research saved under `docs/design/`.
- 2026-10-10 — The token plan was written and compared with the default the same brief
  produces (warm paper, serif, clay): the canvas became a cool studio white, the accent
  ultramarine, small labels sans and sentence case; the serif stays, roman, in few places.
  The one bold element is the job sheet (brief, numbered plan, deliverables), on the landing
  as a replayed production and in the Studio as the shape of every run. Design written as
  `docs/design/revamp.md` v1 (16 sections).
- 2026-10-10 — Four stills generated with the app's own fal account (flux/dev, about $0.10)
  for the mockup and later the landing page, kept as webp in `public/landing/`: lanterns over
  a wet night-market alley (3:4), a matte ceramic cup on raw linen in raking light (1:1), rain
  on a window at dusk (16:9), folded handmade paper (4:3). Prompts followed the research's
  rules: one subject, real materials, a named light, a palette, no "neon, futuristic, 8k".
- 2026-10-10 — Mockup built as one page with four views and published:
  https://claude.ai/artifact/4StG5BZSbsavXntnWvNGeg. Reviewed at 1440 and 390: a class name
  collision (`.run` on a status span picked up the sheet's white background) and three
  phone overflows (a fixed-width waveform, a band with a minimum height under an aspect
  ratio, the mockup's own note) found and fixed; no horizontal scroll at 390 after.
- 2026-10-10 — D-001 and D-002 recorded. Tickets 003 to 015 opened per §15.

## Handoff
Closed. See Outcome.
- **State:** done
- **Blocked on:** nothing
- **Next:** TICKET-003 (tokens, fonts, Tailwind 4, the kit)
- **Read first:** `docs/design/revamp.md`, the mockup

## Verification
```
npm run verify            # lint 0 errors, typecheck clean, 15 tickets, 3 unit tests (no code changed)
node mock/shoot-mock.mjs  # the mockup at 1440 (four views) and 390 (two views):
                          # scrollWidth 1440 / 390 everywhere after the fixes; screenshots reviewed
```
The design was read against `.claude/skills/frontend-design/SKILL.md`: no eyebrow, no
accented word, no mono labels, no middle dots, numbering only on the plan (a real sequence),
one accent, one orchestrated motion, sentence case.

## Outcome
Shipped: `docs/design/revamp.md` v1; `docs/design/research-landing.md` and `research-app.md`;
the `frontend-design` and `web-design-guidelines` skills under `.claude/skills/`; a Design
section in CLAUDE.md; the direction mockup; D-001 and D-002; four landing stills in
`public/landing/`; tickets 003 to 015. Left out: a dark theme (D-001), weighted credits and
cutting Characters (D-002, the owner's calls, listed as open questions in §16), a formal
review pass by agents on the design document (the sequence is thirteen small tickets, each of
which reads the relevant section and corrects it in place; TICKET-015 reviews the whole).
