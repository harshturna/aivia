# TICKET-010: - [ ] Grid, search and categories in the header row, the form at 560 px, the chat as runs.
- [ ] Delete the old components and the route group; remove the images.
- [ ] Verify: `npm run verify`; a chat turn in the browser as the guest; `npm run shots`;
      keyboard pass.

**Status:** done
**Created:** 2026-10-10
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** ui

## Goal
Characters on the shell

## Context
Characters (design §8) renders on the shared shell with the Studio's components: the grid
with search and categories, the chat as runs with a character header, and the form, with the
guest's limits said inline; its old sidebar, navbar and chat components are gone.
- Landing: add the Characters strip (design §11.7) once the screen exists.

## Plan
- [x] `/characters`: search and category chips in the URL, a grid of 4:5 portraits with the
      name and the line under each, an empty state; "New character" for accounts, "Sign up to
      make your own" for guests.
- [x] The chat at `/characters/c/[id]` (the old `/characters/chat/:id` redirects): the
      portrait and name in the header, an owner's menu with edit and a confirmed delete, the
      conversation as plain lines, the composer without the mode pill, retry and the limit
      inline. History is now kept: the route saves each exchange as two `Message` rows and
      the page loads them (before, the page read them and the client ignored them, and the
      route saved nothing).
- [x] The form at 560 px: the same fields and rules, plain-language labels and messages,
      the portrait uploader as a 4:5 frame, the guest note inline, "Save changes" or "Create
      the character".
- [x] Deleted: six old character components, the bot and user avatars, `empty.png`,
      `placeholder.svg`; the folder is lowercase in git.
- [x] Verify: `npm run verify`; a chat turn and a reload as the guest; the form; screenshots
      at 1440 and 390.
- The landing's Characters strip moves to TICKET-017.

## Progress log
- 2026-10-10 — Opened from the revamp design (TICKET-002, `docs/design/revamp.md` §15).
- 2026-10-11 — Built. The new components first landed in the old `components/Characters`
  folder (macOS is case-insensitive); the old files were removed and the index path fixed.
  From the first real reply: a stage direction ("smiling confidently") and a mangled
  greeting; the system prompt asks for speech only and the greeting is just the name.

## Handoff
Closed. See Outcome.
- **State:** done
- **Blocked on:** nothing
- **Next:** TICKET-011 (auth pages)
- **Read first:** `components/characters/*`, `app/(app)/characters/*`

## Verification
```
npm run verify     # biome 0 errors, tsc clean, tests pass
playwright, as the guest:
  /characters at 1440 and 390 (scrollWidth 390)
  /characters/chat/<id> → /characters/c/<id>; one turn sent; reload → the turn is there
  /characters/new → the form with the guest note, fields disabled
  no page errors
```

## Outcome
Shipped: Characters on the shared shell per design §8 with history kept, the old components
and images removed. Left out: the landing's Characters strip (TICKET-017). No new tickets.
