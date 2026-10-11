# TICKET-003: - [ ] Tailwind 4 migration; `@theme` with the D-001 tokens; the easing and shadow tokens;
      the one focus rule; the reduced-motion block; `tabular` utility.
- [ ] Fonts in `app/layout.tsx`; `font-serif`, `font-sans`, `font-mono` mapped; body on
      canvas and ink.
- [ ] Restyle every `components/ui/*` primitive; add `kbd`, `pill`, `skeleton`, `spinner`;
      delete the `.button`, `.input-field`, `.sidebar*` and the rest of the old utility classes
      once nothing references them (grep).
- [ ] `components/Logo.tsx` wordmark and `app/icon.svg`.
- [ ] `app/(dev)/kit/page.tsx`: swatches with hex and contrast, the type scale, every
      primitive in every state, the motion samples; `notFound()` outside development.
- [ ] Verify: `npm run verify`; `npm run build`; `npm run shots` with `/kit` added, reviewed
      at 1440 and 390; the old screens still render.

**Status:** pending
**Created:** 2026-10-10
**Started:** —
**Completed:** —
**Area:** ui

## Goal
Tokens, type and the primitive kit

## Context
The D-001 token set exists as CSS custom properties on Tailwind 4, Newsreader, Inter and
JetBrains Mono load through `next/font/google`, every UI primitive is restyled on the tokens,
and a development-only `/kit` page shows all of it, so every later screen composes from one
system and never writes a raw colour.

## Plan
- Design §2.2 (tokens with measured contrast), §2.3 (motion tokens), D-001.
- Files: `app/globals.css` (shadcn HSL variables plus ~40 utility classes from the old
  transformations UI, all replaced), `tailwind.config.js` (deleted; Tailwind 4 is CSS-first
  with `@theme`), `postcss.config.js` (`@tailwindcss/postcss`, autoprefixer dropped),
  `app/layout.tsx` (Montserrat → the three faces as `--font-serif`, `--font-sans`,
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
- `.claude/skills/frontend-design` is read before the kit is styled; `web-design-guidelines`
  run over `components/ui` before close.
- Ruled out: re-initialising shadcn with a preset (the components are hand-restyled on our
  tokens, as lynq did); Base UI (Radix stays, D-002's context); a dark set (D-001).

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
