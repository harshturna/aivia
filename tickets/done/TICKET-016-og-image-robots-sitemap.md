# TICKET-016: Open Graph image, robots and sitemap

**Status:** done
**Created:** 2026-10-10
**Started:** 2026-10-11
**Completed:** 2026-10-11
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
- [x] The three files and the Twitter card in the root metadata; the image from a JPEG of the
      alley clip's frame (the renderer cannot draw WebP), with the headline in the default
      sans (loading Host Grotesk into the renderer is not worth the bytes).
- [x] Verify: `npm run verify`; `curl` the three routes; the image looked at. A validator
      needs a public URL, so that waits for a deploy.

## Progress log
- 2026-10-10 — Opened from TICKET-012's outcome.

## Handoff
Closed. See Outcome.
- **State:** done
- **Blocked on:** nothing
- **Next:** TICKET-014
- **Read first:** `app/opengraph-image.tsx`

## Verification
```
npm run verify
curl /robots.txt        200 text/plain
curl /sitemap.xml       200 application/xml
curl /opengraph-image   200 image/png, 1.07 MB (reviewed: the alley frame, "aivia", the headline)
/ carries <meta property="og:image" content=".../opengraph-image?…">
```

## Outcome
Shipped: robots, sitemap, the share image and the Twitter card. Left out: the validator check (needs a deploy). No new tickets.
