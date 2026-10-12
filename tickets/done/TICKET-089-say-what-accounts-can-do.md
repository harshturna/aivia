# TICKET-089: Say where a guest's missing action exists for accounts

**Status:** done
**Created:** 2026-10-12
**Started:** 2026-10-12
**Completed:** 2026-10-12
**Area:** ui

## Goal
A guest (most visitors, hiring managers among them, since Aivia is a portfolio project) should
never conclude a feature is missing or broken when it is only reserved for accounts. Wherever a
guest gets less than an account, one quiet line says what an account can do there.

## Context
- Owner request, 2026-10-12: a guest who edits an image can only download it, and could infer
  that Aivia has no saving at all. Add a line saying guests can't save there, so it is clear the
  feature exists. Memory `happy-path-first`: the guest's usual workflows matter most.
- Why guests get less (D-005, `docs/design/revamp.md` §17.8): one shared guest account, so the
  server refuses guest uploads, edits, characters and checkout (`app/api/uploads/route.ts:18`,
  `app/api/edits/route.ts:30`, `app/api/characters/route.ts:18`, `app/api/stripe/route.ts:19`).
  A guest's projects and cuts live in the browser (`lib/guest-local.ts`). This ticket does not
  change that; it only says so in the UI.
- Where a guest gets less today, and what it says:
  1. **Image editor** (`components/editor/image-editor.tsx`): Save becomes Download (line ~553);
     the status says "Downloaded". Nothing says accounts keep edits as versions in the project.
  2. **Cut export** (`components/timeline/cut-view.tsx` ~1161): after export a guest gets
     Download only; "Save to the project" is hidden with no word about it.
  3. **Characters** (`app/(app)/characters/page.tsx`): "New character" is hidden for guests; a
     comment defers to the sidebar's "Guest session. Create an account to keep your work.", which
     does not mention characters. The guest note in
     `app/(app)/characters/[charactersId]/components/CharacterForm.tsx:107` is unreachable: the
     route redirects guests (`app/(app)/characters/[charactersId]/page.tsx:21`).
  4. **Upgrade** (`components/shell/credits-meter.tsx`): the meter's Upgrade opens the Pro dialog
     (`components/ProModal.tsx`) for a guest too; checkout answers 403 and the dialog says "Could
     not open checkout. Try again in a moment.", which reads as broken. The other upgrade paths
     (`components/studio/limit-message.tsx`) already offer a guest an account instead.
- Already fine: the character chat ("Guest chats are not kept…"), Settings (Account and Plan
  explain the guest session), the sidebar line.
- Copy rules (CLAUDE.md): sentence case, plain, no disclaimers' tone; one quiet line in the
  existing `text-mute` style, with a "Create an account" link to `/signup` where it helps.
- Landing (rule 9): no feature is added or removed, so no landing section changes.
- Ruled out here: letting guests actually keep image edits in the browser (steps stored like the
  cut, rendered from the source). Offered to the owner as a separate ticket; not requested yet.

## Plan
- [x] Image editor: under the tool panel, guest only: "As a guest, edits download. With an
      account, Save keeps each edit in the project as a version you can reopen." and a
      "Create an account" link. Visible at 1440 and 390.
- [x] Cut export, done state, guest only: beside Download, "With an account, the finished cut
      is also saved to the project." with the link.
- [x] Characters page, guest only: a line under the header, "Guests talk to the shared
      characters. With an account you can make your own." with the link. Delete the unreachable
      guest note in `CharacterForm.tsx` and its `isGuest` prop if nothing else uses it.
- [x] Credits meter: for a guest, Upgrade becomes "Create an account" linking to `/signup`
      (pass `isGuest` from `components/shell/sidebar.tsx`). ProModal: a 403 says "Pro needs an
      account. Create one, then upgrade." instead of the retry message.
- [x] Tests: a unit test for the credits meter (guest gets the sign-up link, account gets the
      dialog); an e2e assertion in `tests/e2e/screens.spec.ts` that the guest image editor shows
      the line.
- [x] Load `frontend-design`; run `web-design-guidelines` over the touched files.
- [x] Verify: `npm run verify`, `npx playwright test`, `npm run shots` reviewed at 1440 and 390
      (image editor as guest, cut export done, characters).

## Progress log
- 2026-10-12 — Ticket written from the owner's request; four places found by listing every
  guest refusal in `app/api` and every `isGuest` branch in the UI.
- 2026-10-12 — One shared `components/shell/account-note.tsx` (the line plus a "Create an
  account" link) so the four read alike. Built, tested, reviewed in screenshots; closed.

## Handoff
- **State:** done.
- **Blocked on:** nothing.
- **Next:** nothing.
- **Read first:** —

## Verification
```
npx vitest run components/shell/credits-meter.test.tsx   # 2 passed
npx playwright test     # 47 passed, 5 skipped (adds: the guest editor line, Characters line)
npm run verify          # lint, types, tickets, 30 files / 183 tests passed
node .audit/t089/shots.mjs   # in use as the guest at 1440 and 390, no page errors
```
Screenshots reviewed (`.audit/t089/`): the image editor's line under the tools (1440, 390), the
export dialog's line under Download after a real browser export (1440, 390), the Characters
line above the search (1440, 390). Web interface check by hand over the touched files: the link
says where it goes, text uses the existing `text-mute`/`text-fg` tokens, the line wraps at 390.

## Outcome
Shipped: a guest is told, where it gets less, what an account does there. Image editor: "As a
guest, edits download. With an account, Save keeps each edit in the project as a version you
can reopen." Cut export: "With an account, the finished cut is also saved to the project."
Characters: "Guests talk to the shared characters. With an account you can make your own." Each
links to sign-up. The credits meter offers a guest "Create an account" instead of Upgrade, and
the Pro dialog answers a 403 with "Pro needs an account. Create one, then upgrade." The
unreachable guest note and `isGuest` prop in `CharacterForm.tsx` are deleted.
Left out: letting guests keep image edits in the browser (offered to the owner; no ticket yet).
No landing change: no feature added or removed.
