# TICKET-043: Audit fixes, Studio and guest correctness

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** quality

## Goal
Fix the Studio, cut and guest-flow findings of the 2026-10-11 audit (see TICKET-042 for the
audit itself), each verified in the code first.

## Context
Verified findings and the files they live in (all read):
1. `app/(app)/studio/studio-client.tsx`: the guest save effect runs on any messages, so
   opening a pinned example saves it under "On this device" (crowding out real work, then
   claimed on sign-up), and a reload of an example the guest added to restores the untouched
   example over it. The library animate arrival replaces the guest's `?local=` address with
   `/studio`. Retry and "Try again" call `regenerate()` with no body, so a failed Image or
   Animate run is retried by the Auto agent. `setFiles([])` clears attachments an Animate
   never sent. A first send that is refused (403/429) leaves an address that 404s on reload.
2. `components/studio/outputs.tsx` and `run.tsx`: a tool part left at `input-available`
   (Stop, a closed tab) shows its skeleton forever, and is saved that way.
3. `components/studio/cut-render.ts` and `cut.tsx`: stills beyond six are planned but never
   loaded (blank segments); audio encoding is required even with no track (no cut on browsers
   without `AudioEncoder`); the canvas size comes from whichever still loads first; a clip's
   length includes its audio track; closing the dialog mid-render keeps rendering, leaks an
   object URL and allows a second render in parallel.
4. `lib/ai/plan.ts`: a numbered list after the tools (the forest example's taglines) is taken
   as the plan, so the example shows "3 steps" and loses its taglines.
5. `components/studio/composer.tsx`: a still with no words cannot be sent in Video mode, though
   the route accepts it.
6. Guest flow (`lib/guest-local.ts`, `components/shell/recents.tsx`, `components/auth/auth-form.tsx`,
   `components/shell/shell.tsx`): a sign-up confirmed by email never claims (the claim only
   runs in the form); the claim happens without asking; Recents in another tab do not update.
7. Server: `app/api/webhook/route.ts` creates a second subscription row for a returning
   subscriber (unique `userId`, Stripe retries forever); `recordAsset` failing after fal
   succeeded loses the output (`app/api/generate/route.ts`, `lib/ai/tools.ts`); prompts are
   passed through untrimmed (`app/api/agent/route.ts`, `app/api/chat/[chatId]/route.ts`); the
   agent's system prompt omits sound effects; `lib/ai/parts.ts` and `getGuestUser` are dead.
8. `app/(app)/studio/studio-client.tsx`: the composer's layout animation ignores reduced motion.
- Deferred with reasons in the outcome: per-frame decode speed of cuts (works, 14–19 s for 9 s),
  positional step matching in `readPlan` beyond the tagline case, claimed images without
  dimensions, a portrait skeleton for animations.

## Plan
- [x] Guest flow: save only after a send; a guest sending on a pinned example forks it to a new
      local id and address; keep `?local=` on animate arrival; Recents listen across tabs;
      claim on the first signed-in app load as well as in the form, with a choice in the form.
- [x] Retry carries the run's own mode and parameters; Animate leaves attachments alone; a
      refused first send drops its address.
- [x] A tool part in a run that is no longer active shows "Stopped before it finished" with Retry.
- [x] Cut: plan only the stills it loads; audio checks only with a track; size from the first
      still; clip length from the picture track; cancel on close (no leak, no parallel render).
- [x] Plan parsing: a plan only from text that comes before a tool call; tests.
- [x] Composer: Video mode with an attached image sends without words.
- [x] Server: webhook upsert; outputs kept when the library write fails; prompts trimmed to the
      last 24 messages and 120k characters; the agent prompt names sound; dead code removed.
- [x] `MotionConfig reducedMotion="user"` around the Studio.
- [x] Check in a browser as the guest (example not saved, fork on send, retry route, stopped
      state); `npm run verify`, `npm run test:e2e`.

## Progress log
- 2026-10-11 — Opened from the audit; findings verified.
- 2026-10-11 — What a brief was sent with now rides on the message as `metadata` (kept in
  the guest's browser copy too), so Retry and the waiting label read it; the per-tab refs
  are gone. A guest's copy has its own `localKey`; the browser-only note shows only then.
- 2026-10-11 — A run that ended leaves an unfinished call marked failed in the plan as well
  as on its card. A brief over the limit gets a 413 and the Studio says to shorten it.
- 2026-10-11 — Claim: the form asks (checked by default) when this browser has guest work;
  an email-confirmed sign-up keeps the choice in `aivia:claim-pending` and the shell claims
  on the first signed-in load.

## Handoff
- **State:** done.
- **Blocked on:** nothing
- **Next:** TICKET-044 (landing fixes).
- **Read first:** —

## Verification
```
npm run verify      # lint, typecheck, tickets, 63 unit tests: passed
npm run test:e2e    # 24 passed (1.4m)
```
Checked in Chrome on localhost as the guest: opening the forest example saved nothing
locally, showed no "3 steps" strip and kept the taglines in the answer. With the request
stubbed to fail, an Image send on the example moved to `/studio?local=<new id>`, the copy was
saved with `metadata.mode: "image"`, and "Try again" went to `/api/generate` with mode image
and the same aspect. A copy reloaded with an unfinished image call shows "Stopped before it
finished." with Retry. The example no longer shows the "lives only in this browser" note.

## Outcome
Shipped: every Plan item. Guests: examples are never saved, sending on one forks it,
`?local=` survives an animate arrival, a refused first send drops its address, Recents
update across tabs, and claiming asks first and also happens after email confirmation.
Retry repeats the brief's own mode and parameters. Stopped calls show as stopped. Cuts plan
only the six stills they draw, need an audio encoder only with sound, take their shape from
the first still and a clip's length from its picture, and stop when the dialog closes. A
list after the tools is no longer read as the plan. Video mode sends a still alone. The
webhook upserts by user, outputs survive a failed library write (`keepAsset`), agent and chat
send at most 24 messages and 120,000 characters (`lib/ai/history.ts`), the agent's prompt
names sound effects, and `lib/ai/parts.ts` and `getGuestUser` are deleted.

Left out (judged not worth it now): per-frame decode speed of cuts, step matching beyond
the tagline case, dimensions on claimed images, a portrait skeleton for animations. A
successful claim and a successful cut save are still unexercised here (no non-guest account
on this machine). No follow-up tickets; TICKET-044 and TICKET-045 cover the rest of the audit.
