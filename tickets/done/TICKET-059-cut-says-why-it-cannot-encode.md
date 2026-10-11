# TICKET-059: The cutter says why it cannot encode

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** ui

## Goal
Opened over plain http on a network address, the Cut dialog says "This browser cannot encode
video. Try a recent Chrome, Edge or Safari." The browser is fine: WebCodecs exists only in a
secure context (https or localhost). The message should say that.

## Context
- The owner hit it viewing the dev server at http://192.168.2.20:3005 (chat, 2026-10-11).
  Checked: there `isSecureContext` is false and `VideoEncoder` is absent; at
  http://localhost:3005 both are true. The live site is https, so visitors are not affected.
- `components/studio/cut-render.ts` throws the message after `mediabunny`'s `canEncodeVideo`.

## Plan
- [x] Before the codec checks, an insecure page gets its own message.
- [x] Verify: Playwright at http://192.168.2.20:3005 shows the new message; `npm run verify`.

## Progress log
- 2026-10-11 — Ticket written and started.

## Handoff
- **State:** closed.
- **Blocked on:** nothing
- **Next:** nothing.
- **Read first:** nothing

## Verification
```
Playwright at http://192.168.2.20:3005, guest, the forest example, Cut it:
  "Cutting needs a secure page. Open Aivia over https, or on localhost, and try again."
npm run verify   # pass
```
The cut itself at localhost was verified in TICKET-053 (a finished cut, reopened).

## Outcome
Shipped: an insecure page gets a message that names the cause instead of blaming the browser.
Left out: nothing.
