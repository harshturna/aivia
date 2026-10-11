# TICKET-049: Close the gap above the composer; drop the guest sign-up note

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** ui

## Goal
After a run, the Studio leaves about 200 px of empty space between the last message and the
composer, and a guest also sees a "This lives only in this browser" card. The owner asked for
the gap closed and the card removed (chat, 2026-10-11, screenshot of the live site).

## Context
- `app/(app)/studio/studio-client.tsx`: the thread is `flex-1 px-6 pb-48 pt-8` and ends in
  `<div ref={bottomRef} className="scroll-mb-48" />`; the composer follows in a
  `sticky bottom-0 … pt-10` wrapper. A sticky element keeps its place in normal flow, so the
  composer already takes its own space at the end of the page; `pb-48` (192 px) is extra empty
  space under the last message, not room for an overlay. `scroll-mb-48` keeps the streaming
  follow (`scrollIntoView({ block: "end" })`) aiming above the composer while it sticks.
- `components/characters/chat.tsx` has the same pattern (`pb-44`, `scroll-mb-44`), so the same
  gap; fixed here too.
- The note: the `localKey && !busy && runs.length > 0` card in the Studio thread (TICKET-041,
  kept to local sessions in TICKET-043). A guest still sees their sessions under "On this
  device" in Recents, the settings page explains it, and sign-up offers to bring them.
  `docs/design/revamp.md` §12 mentions the note; updated here.
- No test references the note (grep).

## Plan
- [x] Studio thread `pb-48` → `pb-6`; character chat `pb-44` → `pb-6`. Keep the scroll margins, and move each scroll marker out of its `space-y` list (it picked up 40 px of list spacing).
- [x] Delete the guest note and the now unused `Link` import.
- [x] Drop the note from `docs/design/revamp.md`.
- [x] Verify: `npm run verify`, `npm run test:e2e`, a Playwright measurement of the gap with a
      seeded local session, screenshots at 1440 and 390.

## Progress log
- 2026-10-11 — Ticket written and started.
- 2026-10-11 — With the padding gone the gap measured 104 px: the empty scroll marker sat in
  the `space-y-10` list and added 40 px. Moved it (and the character chat's) after the list;
  72 px now, which is the composer's own fade (`pt-10`) plus the thread's `pb-6`.

## Handoff
- **State:** closed.
- **Blocked on:** nothing
- **Next:** nothing
- **Read first:** nothing

## Verification
```
node scratchpad/gap.mjs   # Playwright, guest, a seeded 7-run local session, scrolled to the end
  before: 1440 gap 394 px, 390 gap 438 px, note shown
  after:  1440 gap 72 px,  390 gap 72 px,  note gone, no page errors
npm run verify            # lint, typecheck, tickets, 69 unit tests: pass
npm run test:e2e          # 23 passed, 1 failed: the library lightbox focus check (desktop);
                          # rerun alone, it passes on desktop and phone. The change does not
                          # touch the library.
```
Screenshots at 1440 and 390 of the scrolled thread reviewed: the last message sits just above
the composer's fade at both widths. The web-design-guidelines pass was not run: the change only
removes padding and a card.

## Outcome
Shipped: the gap under the last message in the Studio and character chats is down from about
200 px of padding to the composer's own fade, and the guest's "lives only in this browser" card
is gone (Recents, settings and sign-up still tell a guest where their work lives). Left out:
nothing. No follow-ups.
