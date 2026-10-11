# TICKET-016: Open Graph image, robots and sitemap

**Status:** pending
**Created:** 2026-10-10
**Started:** —
**Completed:** —
**Area:** ui

## Goal
A share of any Aivia link shows the hero frame as its image, and crawlers get a `robots.txt`
and a `sitemap.xml` that list the public pages only.

## Context
- Left out of TICKET-012 at close. Design §11 (metadata).
- Files: new `app/opengraph-image.tsx` (1200 × 630, the alley poster under the headline, from
  `next/og`), `app/robots.ts` (allow `/`, `/login`, `/signup`; disallow `/studio`, `/library`,
  `/edit`, `/characters`, `/settings`, `/api`), `app/sitemap.ts` (the public pages);
  `app/layout.tsx` and `app/(landing)/page.tsx` metadata gain `images` and `twitter`.
- `../lynq/app/robots.ts` and `sitemap.ts` are the model.

## Plan
- [ ] The three files and the metadata.
- [ ] Verify: `npm run verify`; `curl` the three routes on `next start`; a share preview
      checked with a validator.

## Progress log
- 2026-10-10 — Opened from TICKET-012's outcome.

## Handoff
Kept current while the ticket is in progress. Overwrite, do not append.
- **State:** not started
- **Blocked on:** nothing
- **Next:** start
- **Read first:** `app/layout.tsx`

## Verification
Filled in on completion. The command that was run, in a code block, and its result.

## Outcome
Filled in on completion: what shipped, what was deliberately left out, follow-up tickets created.
