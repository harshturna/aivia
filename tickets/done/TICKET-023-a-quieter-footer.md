# TICKET-023: A quieter footer

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** ui

## Goal
Trim the landing footer to what a visitor uses: the wordmark and the product and account
links in one row, without the source link, the year or the extra columns.

## Context
- The owner (2026-10-11): "fix up the footer, don't think we need source or 2026 etc sections".
- `LandingFooter` in `app/(landing)/_landing/sections.tsx` (read): four columns, Product,
  Account, Aivia (By harsh, Source) and the wordmark with the year. `docs/design/revamp.md`
  §11 item 9 describes it.
- Ruled out: keeping "Try as a guest" (the nav and the close already say "Start making",
  which goes to the same place).

## Plan
- [x] One row: the wordmark left; Studio, Library, Edit, Pricing, Sign in, Create account
      right, wrapping on a phone; a `nav` labelled "Footer".
- [x] Update §11 item 9 in the design doc.
- [x] Screens at 1440 and 390; `npm run verify`.

## Progress log
- 2026-10-11 — Opened from the owner's note.
- 2026-10-11 — `LandingFooter` is one row: the wordmark (linking home) and six links in a `nav` labelled "Footer"; the Aivia column (by harsh, Source), the year and "Try as a guest" are gone. Design doc §11 item 9 updated.

## Verification
Screens of the bottom of `/` at 1440x900 and 390x844 reviewed: one row on desktop, the links
wrap under the wordmark on a phone.

```
npm run verify    # lint, typecheck, check:tickets, 31 unit tests: passed
```

## Outcome
Shipped on `revamp`: the quieter footer. Nothing left out; no follow-ups.
