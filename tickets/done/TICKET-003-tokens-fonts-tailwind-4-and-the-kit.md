# TICKET-003: - [x] Tailwind 4 migration; `@theme` with the D-003 tokens and the legacy names mapped; the
      easing and shadow tokens; the one focus rule; the reduced-motion block; `tabular` utility.
- [x] Fonts in `app/layout.tsx`; `font-sans` and `font-mono` mapped; body on the canvas.
- [x] Restyle button, input, textarea; add `kbd`, `pill`, `skeleton`, `spinner`. The other
      primitives (dialog, dropdown, select, sheet, tooltip) render on the mapped legacy names
      and are restyled by the shell ticket that uses them; the old `.button`, `.input-field`,
      `.sidebar*`, `.media-uploader*` utility classes went with the `globals.css` rewrite (the
      transformations screens that used them are rebuilt in TICKET-009 and look plain until then).
- [x] `components/Logo.tsx` wordmark and `app/icon.svg`.
- [x] `app/(dev)/kit/page.tsx`: swatches with hex and contrast, the type scale, every
      primitive in every state, the motion samples; `notFound()` outside development.
- [x] Verify: `npm run verify`; `npm run shots` with `/kit`, reviewed at 1440; the old
      screens render on the dark base.

**Status:** done
**Created:** 2026-10-10
**Started:** 2026-10-10
**Completed:** 2026-10-10
**Area:** ui

## Goal
Tokens, type and the primitive kit

## Context
The D-003 token set (dark, media-first) exists as CSS custom properties on Tailwind 4, Host
Grotesk and JetBrains Mono load through `next/font/google`, every UI primitive is restyled on
the tokens, and a development-only `/kit` page shows all of it, so every later screen composes
from one system and never writes a raw colour.

## Plan
- Design §2 (tokens, type, motion), D-003 (D-001 withdrawn by the owner).
- Files: `app/globals.css` (shadcn HSL variables plus ~40 utility classes from the old
  transformations UI, all replaced), `tailwind.config.js` (deleted; Tailwind 4 is CSS-first
  with `@theme`), `postcss.config.js` (`@tailwindcss/postcss`, autoprefixer dropped),
  `app/layout.tsx` (Montserrat → Host Grotesk as `--font-sans`, JetBrains Mono as
  `--font-mono`; metadata title without the em dash), `components/ui/*` (button, input,
  textarea, select, dialog, dropdown-menu, tooltip, sheet, separator, label, badge, progress,
  avatar, card, form) restyled; new: `kbd`, `pill`, `skeleton` (shimmer), `spinner` (the
  ring); `components/Logo.tsx` (the wordmark; the Brain icon goes), `app/icon.svg` (the "a"
  on ultramarine), `public/landing.png`, `features.png`, `empty.png` deleted (unused after
  the revamp; `empty.png` is still used by `Empty.tsx` and `Characters.tsx` until 006/010,
  so it goes in 010).
- Tailwind 4: `npx @tailwindcss/upgrade` on the tree, then the renamed utilities checked
  (`shadow-sm` → `shadow-xs`, `rounded` → `rounded-sm`, `outline-none` → `outline-hidden`,
  `bg-gradient-to-*` → `bg-linear-to-*`); `tailwindcss-animate` → `tw-animate-css`; Biome's
  `noUnknownAtRules` stays off for `globals.css`.
- Motion 14 installed (`motion`), used through `LazyMotion` + `domMax`; `MotionConfig
  reducedMotion="user"` in the root layout.
- The old screens keep rendering on the new tokens until their tickets replace them; this
  ticket changes how they look (fonts, colours) and that is accepted: nothing ships between
  tickets, the deploy is manual.
- The old shadcn token names (`background`, `foreground`, `card`, `muted`, `primary`, `border`,
  `sidebar-*`) are mapped onto the new tokens in `@theme` so the screens not yet rebuilt render
  dark and legible until their tickets replace them.
- `.claude/skills/frontend-design` is read before the kit is styled; `web-design-guidelines`
  run over `components/ui` before close.
- Ruled out: re-initialising shadcn with a preset (the components are hand-restyled on our
  tokens); Base UI (Radix stays); a light set (D-003).

## Progress log
- 2026-10-10 — Opened from the revamp design (TICKET-002, `docs/design/revamp.md` §15).
- 2026-10-10 — Rescoped to D-003 (dark, Host Grotesk) after the owner rejected D-001; started.
- 2026-10-10 — Tailwind 4.3.3 through `@tailwindcss/postcss`, `tw-animate-css` 1.4, Motion
  14.1 installed; `tailwind.config.js`, `tailwindcss-animate` and `autoprefixer` removed.
  `globals.css` rewritten as `@theme` (the palette reset with `--color-*: initial`, the D-003
  tokens, the legacy shadcn names mapped onto them, radii, easings, the float shadow, the
  shimmer keyframe), base rules (dark colour scheme, one focus ring, thin scrollbars), and
  three utilities (`tabular`, `shimmer`, `glass`). Host Grotesk and JetBrains Mono through
  `next/font/google`. Button, input, textarea restyled; pill, kbd, skeleton, spinner added;
  the wordmark is text; the favicon an "a" on white. `/kit` reviewed at 1440: the type scale
  and surfaces hold; the old Studio renders legibly on the dark base through the mapping.

## Handoff
Kept current while the ticket is in progress. Overwrite, do not append.
Closed. See Outcome.
- **State:** done
- **Blocked on:** nothing
- **Next:** TICKET-012 (the landing page), per D-003's order
- **Read first:** `app/globals.css`, `app/(dev)/kit/page.tsx`

## Verification
```
npm run verify     # biome 0 errors (57 warnings in files the revamp replaces), tsc clean,
                   # 15 tickets, 3 unit tests
npm run shots      # /kit at 1440 reviewed: swatches, type scale, buttons in every variant and
                   # size, fields, pills, keys, shimmer placeholders, spinner, surfaces;
                   # /, /studio, /login, /characters render on the dark base
```
Not run: `npm run build` (run at the close of TICKET-012, the next ticket, which changes the
landing it would prerender).

## Outcome
Shipped: Tailwind 4 with the D-003 token system in `app/globals.css`, Host Grotesk and
JetBrains Mono, the restyled button, input and textarea, new pill, kbd, skeleton and spinner,
the text wordmark and the new favicon, Motion installed, and the `/kit` review page. Left out
by decision: restyling dialog, dropdown, select, sheet and tooltip (the shell ticket does it
where they are used); deleting `public/empty.png` and the landing images (their last users go
in TICKET-010 and TICKET-012). No follow-up tickets.
