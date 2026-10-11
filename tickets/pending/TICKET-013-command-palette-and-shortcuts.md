# TICKET-013: - [ ] The palette, its sources (sessions and assets search routes from 005), actions.
- [ ] The shortcuts registry and the `?` sheet; focus management.
- [ ] Verify: `npm run verify`; keyboard-only pass through every shortcut; `npm run shots`.

**Status:** pending
**Created:** 2026-10-10
**Started:** —
**Completed:** —
**Area:** feature

## Goal
Command palette and keyboard shortcuts

## Context
⌘K opens a palette over sessions, assets and actions (new session, new image, open
library, settings, sign out); `?` shows the shortcuts; the sidebar and composer keys from
design §4 and §5.2 are all wired and documented in `/settings`.

## Plan
- Design §4 (keyboard), §9.
- Files: new `components/shell/command-palette.tsx` (on `cmdk` through the existing shadcn
  pattern or a small list of our own), `lib/shortcuts.ts`, the settings page's shortcuts
  section; the sidebar's Search item opens it.
- No animation on open (design §2.3).

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
