# TICKET-022: The app on the Wonder direction

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** ui

## Goal
Carry D-004 into the signed-in app (shell, Studio, Library, Edit, Characters, Settings, auth,
get-started) so the product feels like the landing: moss-dark surfaces, parchment type, the
sun accent, the display face where it earns it, and the medium tints in runs and the library.

## Context
- D-004; the landing work is TICKET-021, which adds the forest tokens to `app/globals.css`
  behind a theme attribute. This ticket makes them the app's default and retunes surfaces,
  borders, focus rings and states by eye at 1440 and 390.
- D-002's information architecture stands; this is a visual ticket.
- The owner (2026-10-11): "have you redesigned it from the inside?", then "go for it".
- Survey (read): the app is almost entirely on tokens. Hard-coded colours left:
  `app/layout.tsx` (theme colour), `app/(app)/studio/studio-client.tsx` (live dot
  `bg-white`), `components/studio/composer.tsx` (send and stop buttons `bg-white text-black`),
  `components/shell/credits-meter.tsx` (`bg-white` fill), `components/shell/sidebar.tsx`
  (avatar `bg-white text-black`), `components/studio/outputs.tsx` (a gradient in the old
  near-black), `components/ai/Markdown.tsx` (`bg-white/10`, `text-zinc-200`, `#0d1117`),
  `components/edit/workspace.tsx` (`bg-white/80` slider line), `components/ui/button.tsx`
  (destructive `text-black`), `app/(dev)/kit/page.tsx` (the D-003 token table).
- The forest theme lives in `app/globals.css` under `[data-theme="forest"]`, applied by
  `app/(landing)/layout.tsx`, which also loads Cormorant; `--font-display` only resolves
  where Cormorant's variable is defined.
- Screens to give deliberate treatment: the Studio empty state ("What are we making?",
  `studio-client.tsx`), sign-in and sign-up (`components/auth/auth-form.tsx`, `AuthShell`: a
  logo header and a centred 400 px form on a blank page), get-started
  (`app/get-started/guest-start.tsx`: a spinner on a blank page). Everything else
  (shell, Library, lightbox, Edit, Characters, Settings) follows the tokens and is retuned
  from screenshots.
- `npm run shots` signs in as the guest and shoots every route at 1440 and 390.

## Plan
- [x] Tokens: the forest values become the defaults in `@theme`; the `[data-theme]` block
      goes; Cormorant moves to the root layout so `font-display` works everywhere; the theme
      colour and `::selection` follow; the landing layout keeps only its viewport.
- [x] Stragglers above onto tokens (live states use `--sun`, buttons `primary`, fills `fg`).
- [x] Studio empty state: the question in the display face, larger.
- [x] Sign-in, sign-up and get-started on the forest plate: the form on a moss panel over the
      dark trunks, the heading in the display face; get-started says "Opening the Studio…"
      in the display face over the same plate, so leaving the landing feels continuous.
- [x] The dev kit page's token table to the forest values.
- [x] Screens of every route at 1440 and 390 before and after; fix what reads wrong.
- [x] Design doc §2.2 (the forest is the default; D-003's table retired); `npm run verify`,
      `npm run test:e2e`; the web-design-guidelines pass on the touched files.

## Progress log
- 2026-10-11 — Opened when the owner chose the forest direction (TICKET-020).
- 2026-10-11 — Started on the owner's "go for it". Before screens of every route at 1440 and 390 (`npm run shots`).
- 2026-10-11 — The forest values became the `@theme` defaults (primary, ring and sidebar primary read `fg`; destructive text reads `bg`; selection is sun at 32%); the `[data-theme]` block is gone; Cormorant loads on the root `<html>`, where `--font-display` is defined, so the display face resolves on every page. The stragglers moved onto tokens (live dot `bg-sun`, composer send and stop `bg-primary`, credits fill and avatar `bg-fg`, output gradient `from-bg/70`, code blocks `bg-surface-3` with `fg` chrome, the edit slider line `bg-fg/80`). Contrast measured: fg 15.8:1, fg-2 9.9:1, mute 5.3:1 on surface-2 and 4.7:1 on surface-3, sun 10.1:1.
- 2026-10-11 — `components/forest-plate.tsx` shares the art-directed plate between the hero, sign-in, sign-up and get-started. Sign-in and sign-up: the plate darkened on the left, the form on a 440 px moss panel, the heading in Cormorant at 44 px. Get-started: "Opening the Studio…" in Cormorant italic over the plate. Studio empty state: the question in Cormorant at up to 54 px over a still trace of the forest (18%, fading by 70% height); the examples follow the landing's brief. Library kind filters carry the bark, water and light marks; played waveform bars in `AudioRow` are sun. Kit swatches updated. Design doc §2.2 and §10 updated.

## Verification
Screens after: every route at 1440 and 390 (`WIDTHS=1440,390 FULL=0 npm run shots`, and
`GUEST=0` for `/login` and `/signup`), plus a saved session, a character chat and
`/get-started` captured mid-redirect. Reviewed: one palette across the shell, the Studio, the
library, Edit, Characters and Settings; no leftover white or near-black chrome. The
web-design-guidelines pass on the touched files found nothing new (decorative plate and marks
are `aria-hidden`, the form keeps its labels, the spinner keeps its label).

```
npm run verify    # lint, typecheck, check:tickets, 31 unit tests: passed
npm run test:e2e  # 24 passed (axe, including colour contrast, on every screen)
```

## Outcome
Shipped on `revamp`: the whole app in the forest direction, with sign-in and the way into
the Studio on the landing's plate and the Studio's empty state carrying a trace of it. Left
out: tints on individual run outputs in the Studio (runs do not label their output kinds
today; worth doing with TICKET-017's real run on the landing).
