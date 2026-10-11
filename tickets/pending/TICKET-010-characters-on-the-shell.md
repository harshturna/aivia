# TICKET-010: - [ ] Grid, search and categories in the header row, the form at 560 px, the chat as runs.
- [ ] Delete the old components and the route group; remove the images.
- [ ] Verify: `npm run verify`; a chat turn in the browser as the guest; `npm run shots`;
      keyboard pass.

**Status:** pending
**Created:** 2026-10-10
**Started:** —
**Completed:** —
**Area:** ui

## Goal
Characters on the shell

## Context
Characters (design §8) renders on the shared shell with the Studio's components: the grid
with search and categories, the chat as runs with a character header, and the form, with the
guest's limits said inline; its old sidebar, navbar and chat components are gone.

## Plan
- Design §8, D-002 (kept, demoted).
- Files: `app/(characters)/**` (moved to `app/(app)/characters/{page,new/page,[id]/page,
  c/[id]/page}.tsx`), `components/Characters/*` (`Characters`, `Categories`, `SearchInput`,
  `ChatForm`, `ChatMessage`, `ChatMessages`, `ImageUpload` replaced or restyled;
  `Sidebar`, `Navbar`, `MobileSidebar` deleted), `app/api/chat/[chatId]/route.ts` (unchanged),
  `app/api/characters/*` (unchanged), `public/empty.png` and `placeholder.svg` (deleted with
  the last reference).
- The chat uses the Studio's brief and notes components; replies carry no plan.
- Ruled out: persisting character chats as Sessions (they have their own `Message` table and
  it works).

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
