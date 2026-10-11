# TICKET-051: Studio runs: answers, retry, errors, downloads, scroll

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** ui

## Goal
Fix how a run behaves and reports itself: text answers not hidden as a plan, retry that does not redo working pieces, plain error copy, downloads that download, no layout jump or lost scroll, Stop shown as a stop.

## Context
- Findings: TICKET-050, section A. Each names the file and the evidence; screenshots are in
  `.audit/` locally (gitignored), so the ticket text is the record.
- Files: `lib/ai/plan.ts` (+ test), `components/studio/run.tsx`, `components/studio/outputs.tsx`,
  `components/studio/audio-row.tsx`, `components/studio/reveal-image.tsx`,
  `components/library/lightbox.tsx` (its Download), `app/(app)/studio/studio-client.tsx`,
  `app/api/agent/route.ts` (system prompt), new `lib/download.ts`, new `lib/ai/failure.ts` (+ test).
- fal media answers `access-control-allow-origin: *` (checked 2026-10-11), so a download can
  fetch the file into a blob and save it in the browser; no proxy route.
- Error bodies the client sees (`err.message` is the response text): guard 401
  "Unauthorized", 429 "…limit reached…", 403 "Free trial has expired"; agent 413 "The brief is
  too long…"; generate 500 "Internal error"; a network failure is a TypeError ("Failed to
  fetch").
- Retrying one piece: a direct-mode send (`send(prompt, mode, [], …)`) of that tool's prompt
  and parameters, as a new run; the run's other pieces stay. A run whose only piece failed is
  regenerated in place, as now. Direct image retries cost `amount`, as direct mode does.
- Ruled out: re-running a single tool inside the same assistant message (the AI SDK has no
  partial regenerate; a hand-built call would bypass the agent route's guard).
- Found by using the app, not by reading it: verify each fix the same way (Playwright, real
  content, 1440, 1440x600 and 390), not only by tests.

## Plan
- [x] plan.ts: a numbered list is the plan only when a media tool follows it, or while the run
      is active and the text opens with the list; a finished run with no media tool has no plan.
      Unfinished calls at the end are "stopped", not failed (`stopped` on the shape, step status
      `stopped`). Tests for both.
- [x] failure.ts: map a tool's error text to one plain line (blocked by the safety filter,
      service busy, the run's piece cap, otherwise "Something went wrong making it"). Tests.
- [x] outputs.tsx: the failure card shows the plain line, no raw text; a stopped piece is a
      neutral "Stopped" card; its button retries that piece ("Try again"; no cost shown, see log).
      Downloads go through `lib/download.ts`. A single image keeps one box from skeleton to
      result: same width (min of 560 px, 70vh times the ratio) and aspect. On touch the image
      actions appear on a tap, not always.
- [x] run.tsx: the steps header reads "stopped" in neutral when the only trouble was a stop.
- [x] studio-client: `retryPiece`; follow-scroll only while running and only if the reader is
      at the bottom, re-follow when the thread grows (media loading); a saved session opens at
      the start of its last run; error copy and action per cause (too long puts the brief
      back; signed out offers Reload; network and failed start say so); Esc stops a run from
      anywhere unless a dialog is open; at the limit the textarea is disabled with the reason
      as its placeholder.
- [x] Agent system prompt: say which piece failed in one plain sentence; never quote the error.
- [x] reveal-image: server-rendered images are visible before hydration; only images that mount
      unloaded reveal from blur.
- [x] audio-row and lightbox Download use `lib/download.ts`.
- [x] Verify: `npm run verify`, `npm run test:e2e`, a Playwright pass with stubbed streams over:
      a text answer with a list, a partial failure and its piece retry, a stop, each error
      cause, an image landing mid-run (no jump, scroll follows), opening a saved session,
      downloads of image and audio (a file is saved, the tab stays), touch actions at 390.

## Progress log
- 2026-10-11 — Written from the TICKET-050 audit.
- 2026-10-11 — Started; files read, plan written.
- 2026-10-11 — Built. Changes from the plan: the retry button shows no cost (the composer
  already shows the cost of a send; a cost on a one-word action was clutter). A first brief
  sent back as too long also restores the header title and the address, and its reason shows
  under the composer on the empty screen (the thread is empty then). Examples record no
  aspect, so an image without one takes its own shape once measured (also when it loaded
  before hydration), instead of a square crop.

## Handoff
- **State:** closed.
- **Blocked on:** nothing
- **Next:** TICKET-052.
- **Read first:** nothing

## Verification
```
npm run verify      # lint (no errors), typecheck, tickets, 76 unit tests: pass
npm run test:e2e    # 24 passed
node .audit/t051/v.mjs, v2.mjs, v3.mjs   # Playwright, guest, every paid route stubbed
  1 text answer with a list: list visible, no "steps" header
  2 partial failure: "The safety filter blocked this one…", no raw text; Try again sent
    /api/generate mode=music 30 s with the piece's prompt; the poster stayed
  3 Esc with focus on the page stopped the run; "2 steps, stopped"; no red icon
  4 401 "You were signed out" + Reload; 500 "The run did not start" + Try again;
    network "The connection dropped" + Try again; 413 brief back in the composer,
    header "New session", address /studio
  5 limit: textarea disabled, placeholder "You have used your free generations."
  6 image landing: box 473x630 before and after; the running clip in view (top 690 of 900)
  7 image and audio Download saved "a tree.jpg" / "Slow ambient strings.mp3"; tab stayed
  saved 5-run session opened scrolled to its last run; touch at 390: actions hidden until
  a tap; server HTML of an example: 0 hidden images; examples keep their shape (420x630,
  477x630, 560x560)
```
Screenshots at 1440 (`.audit/t051/2-partial.png`, `6-landed.png`, `example-1440.png`) and
390 (`touch-390.png`) reviewed. web-design-guidelines over the touched files: no findings in
the changed code (the image's tap area is a div by design; its buttons are reachable by
focus).

## Outcome
Shipped: text answers are no longer hidden as a plan; Try again on a failed or stopped piece
makes only that piece as a new run; failures read as one plain line and the agent no longer
quotes errors; a stop is shown as a stop; each run error says what happened with the right
action; Download saves the file; an image keeps one box from placeholder to result, capped at
70% of the screen; the thread follows a run only when the reader is at its foot and keeps
following as media loads; a saved session opens at its last run; Esc stops from anywhere;
the composer is disabled at the limit with the reason; server-rendered images show before
hydration; on touch, image actions wait for a tap. Left out: nothing from §A. Next: TICKET-052.
