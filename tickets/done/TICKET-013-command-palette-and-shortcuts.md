# TICKET-013: - [ ] The palette, its sources (sessions and assets search routes from 005), actions.
- [ ] The shortcuts registry and the `?` sheet; focus management.
- [ ] Verify: `npm run verify`; keyboard-only pass through every shortcut; `npm run shots`.

**Status:** done
**Created:** 2026-10-10
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** feature

## Goal
Command palette and keyboard shortcuts

## Context
⌘K opens a palette over sessions, assets and actions (new session, new image, open
library, settings, sign out); `?` shows the shortcuts; the sidebar and composer keys from
design §4 and §5.2 are all wired and documented in `/settings`.

## Plan
- [x] The palette on ⌘K (no open animation): actions (new session, each direct mode, the
      screens), your sessions, and what you made searched by prompt; arrows, Enter, Esc; a
      combobox with an active descendant for screen readers.
- [x] `lib/shortcuts.ts` as the one list; ⌘⇧O starts a session (⌘N belongs to the browser,
      so the sidebar's old hint could never work); `?` opens the list, but not while typing;
      Search in the sidebar; the list in Settings.
- [x] Verify: `npm run verify`; the keys below in the browser.

## Progress log
- 2026-10-10 — Opened from the revamp design (TICKET-002, `docs/design/revamp.md` §15).
- 2026-10-11 — Built. A hydration error seen once in the test run did not reproduce on any fresh load of any screen; it matched a stale chunk while the dev server recompiled.

## Handoff
Closed. See Outcome.
- **State:** done
- **Blocked on:** nothing
- **Next:** TICKET-017 (example session and landing additions), then 014
- **Read first:** `components/shell/command-palette.tsx`, `lib/shortcuts.ts`

## Verification
```
npm run verify     # biome 0 errors, tsc clean, tests pass
playwright, as the guest:
  ⌘K → the palette; "harb" → the harbour session and the harbour image; Enter → the session
  ⌘⇧O on /settings → /studio
  "?" typed in the composer → typed, no sheet; "?" outside a field → the shortcuts sheet
  fresh loads of /library /settings /studio /characters /edit and three sessions: no page errors
```

## Outcome
Shipped: the command palette, the shortcut list in three places, Search in the sidebar, and a
new-session shortcut that works. No new tickets.
