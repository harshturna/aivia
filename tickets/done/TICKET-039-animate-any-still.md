# TICKET-039: Animate any still

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** feature

## Goal
Any image, generated in a run, kept in the library, or attached by the user, can be turned
into a short clip with one action: the still comes to life with gentle natural motion.

## Context
- The owner (2026-10-11), after the feature proposal: "let's not cut it yet, let's add
  stuff". Animate was the first of three recommended additions (TICKET-040 cut a run into one
  piece, TICKET-041 keep guest work on sign-up).
- Model: `fal-ai/wan/v2.2-5b/image-to-video`, "$0.15 per video" (fal model page, checked
  2026-10-11). Inputs (fal API page): `image_url`, `prompt`, `num_frames` 17–161 (121 at 24
  fps is 5 s), `resolution` 720p, `aspect_ratio` auto/16:9/9:16/1:1 (auto fails on some sizes,
  seen while making the landing clips), output `{ video: { url } }`. It made the landing's
  canyon, valley and aurora loops. Cheaper than the text-to-video model ($0.24, failing, see
  TICKET-019).
- One server path: `app/api/generate/route.ts` (read) handles Video mode; when the brief's last
  user message carries an image file part, it animates that image instead of generating from
  text. Same guard (`lib/ai/guard.ts`, cost 1 via `costOf` in `lib/ai/direct.ts`, read), same
  tool part (`generate_video`), same saving rules (guests store nothing, TICKET-038).
- Images the model must fetch: fal URLs (public), data URLs from attachments (fal accepts
  them), and site-relative URLs (the guest examples, `/landing/...`), which the server fetches
  from its own origin and uploads to fal storage (`lib/ai/fal.ts`, read).
- UI: image outputs (`components/studio/outputs.tsx`, `RevealedImage`, read) get an Animate
  control through a Studio-actions context provided by `app/(app)/studio/studio-client.tsx`
  (read; `send` posts `{ mode, params }` with files); the landing demo renders outputs without
  the context, so it shows no control. The lightbox (`components/library/lightbox.tsx`, read)
  links to `/studio?animate=<assetId>`; `app/(app)/studio/page.tsx` (read) loads that asset and
  the Studio sends it once. Video mode copy in `components/studio/modes.ts` (read).
- Landing (rule 9): the modes lede in `app/(landing)/_landing/sections.tsx` mentions it.

## Plan
- [x] `ANIMATE_MODEL`, price comment and `animateImage` in `lib/ai/capabilities.ts`;
      `publicImageUrl` in `lib/ai/fal.ts`.
- [x] Pure helpers in `lib/ai/direct.ts` with tests: the image in a brief, the wan aspect for a
      requested aspect, the motion prompt from the brief.
- [x] The generate route animates when Video mode carries an image; the asset keeps the still
      as its poster.
- [x] Animate on image outputs in the Studio (aspect from the image), in the lightbox, and by
      attaching a still in Video mode (aspect from the file); a guest's animate is unsaved.
- [x] Video mode copy, the landing's modes lede, design doc §5.4.
- [x] One real animate through the Studio, with its cost noted; screens; `npm run verify`,
      `npm run test:e2e`.

## Progress log
- 2026-10-11 — Opened; model, price and inputs checked on fal.
- 2026-10-11 — Built: `ANIMATE_MODEL`/`ANIMATE_SECONDS`/`animateImage` (121 frames at 24 fps, 720p, explicit aspect) in `lib/ai/capabilities.ts`; `publicImageUrl` in `lib/ai/fal.ts` (http and data URLs pass; site paths are fetched from the request's origin and uploaded to fal storage); `imageInBrief`, `animateAspect`, `aspectOfSize`, `ANIMATE_BRIEF`, `animatePrompt` in `lib/ai/direct.ts` with tests. The generate route animates when Video mode's brief carries an image (a still with no words is accepted), records the asset with the still as poster, and takes the still's prompt as `scene`. `components/studio/actions.tsx` gives outputs an `animate` action, provided by the Studio and absent on the landing; image outputs show "Animate" on hover. The Studio's `send` takes a still, an aspect and a scene, and reads an attached photo's shape in Video mode; `/studio?animate=<assetId>` loads the asset (`app/(app)/studio/page.tsx`) and the Studio sends it on arrival; the lightbox links there. Video outputs show in their own shape (`max-h-[70vh] w-auto`). Mode copy and the landing's modes lede mention it; design doc §5.4.
- 2026-10-11 — The first library test sent nothing: React's development double mount tore down the first mount's request and the ref stopped the second. The arrival send is now scheduled and cancelled on teardown. Two real animations made (about $0.30).

## Verification
As the guest in a browser, two real animations (about $0.15 each):
- Studio: on the whale example, hover the image, click Animate: a 5 s 9:16 clip in 35 s; the
  brief shows the still; the guest's session address did not change.
- Library: the owl's lightbox Animate went to `/studio?animate=<id>`, the address became
  `/studio`, the brief read "Animate this still", a 5 s portrait clip arrived in 34 s and
  showed at 347x630 for a 704x1280 video; no page errors.
- Guest storage counts were identical before and after both (TICKET-038 still holds).

```
npm run verify    # lint, typecheck, check:tickets, 37 unit tests (3 new): passed
npm run test:e2e  # 24 passed
```

## Outcome
Shipped on `revamp`: Animate on any image in a run, from the library, and by attaching a still
in Video mode, at $0.15 a clip through the same guard. Left out: an Animate tool for the Auto
agent (it can be added when the agent gains image inputs it can address). Next: TICKET-040.
