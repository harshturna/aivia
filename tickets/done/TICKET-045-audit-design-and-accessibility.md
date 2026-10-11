# TICKET-045: Audit fixes, design and accessibility

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** design

## Goal
Fix the design-system, copy and accessibility findings of the 2026-10-11 audit (TICKET-042)
that axe does not catch. Its items 3 and 4 (guest examples saved, taglines read as a plan)
shipped in TICKET-043.

## Context
Files read: `components/studio/outputs.tsx`, `components/library/library-client.tsx`,
`components/ui/{dialog,sheet,input,textarea,select,dropdown-menu,kbd,pill,button,spinner}.tsx`,
`components/shell/{command-palette,shell,sidebar,recents}.tsx`, `components/studio/{composer,run,
run-demo,cut,audio-row}.tsx`, `components/characters/{filters,chat}.tsx`,
`components/ai/Markdown.tsx`, `components/edit/workspace.tsx`, `app/not-found.tsx`,
`app/error.tsx`, `app/icon.svg`, `scripts/seed.ts`, `app/globals.css`.
1. Image overlay (Animate, Open, Download) and the copy-code and favourite buttons are
   hover-only: unreachable on touch.
2. Library tile focus ring is clipped by the figure's `overflow-hidden`.
3. Controlled dialogs without a Trigger (Cut, palette, shortcuts, phone menu) drop focus to
   `body` on close.
4. Text fields and the composer: focus only lifts the border 8% to 16%, the same as hover,
   under 3:1.
5. "3 steps · done" (`run.tsx`, `run-demo.tsx`): a middle-dot meta string.
6. `github-dark.css` paints `.hljs` #0d1117 inside the warm code block.
7. Character replies are not announced.
8. Cut dialog: full width at 390, centred header over left lanes, lanes on the same surface as
   the panel, a display-face title the dialog system does not use.
9. Select trigger: `rounded-md` beats `rounded-control` (twMerge does not know the tokens);
   the placeholder reads like a value.
10. Off-scale radii: `rounded-sm` in menus, `rounded-md/lg/rounded` in Markdown, ad-hoc 5 and
    6 px.
11. D-003 leftovers: `app/icon.svg` white with near-black, `bg-black` on the cut preview,
    "white on black" comments.
12. 404 links to `/dashboard` ("Back to the dashboard"); 404 and error fake-bold Cormorant
    (`font-semibold`, loaded at 500); an em dash in the error page.
13. Title Case in seed categories.
14. Smaller: audio rows' identical "Open details" names; Markdown leaks `node` onto DOM;
    Edit's tablist has no tab behaviour; no skip link in the app shell; the account button
    name includes the avatar letter; local recents lack an active state; the cut progress
    announces every percent; sign-up wording varies; the play button changes its name and
    sets `aria-pressed`.
- Left out on purpose: rewriting character descriptions already in the database (rows on the
  shared database; the seed is fixed, the data change is the owner's call); the library
  duration badge contrast (theoretical, 4.29:1 only over a white frame).

## Plan
- [x] Touch: overlays and hover-only buttons visible under `(hover: none)`.
- [x] Library tile ring inset; dialogs and sheets return focus to their opener (central, in
      the primitives).
- [x] Fields: a focus border at `fg/50`, distinct from hover; the composer the same via
      `has-[textarea:focus-visible]`.
- [x] "3 steps, done"; `.hljs` transparent on tokens; character chat live region.
- [x] Cut dialog: inset on phones, left header, `surface-3` lanes, title in the dialog style.
- [x] Select radius and placeholder; a `--radius-chip` token for the small badges; menus and
      Markdown on the scale.
- [x] Favicon in parchment on charcoal; `bg-bg` preview; comments.
- [x] 404 and error pages; seed sentence case.
- [x] The smaller items in Context 14.
- [x] `npm run verify`, `npm run test:e2e`, `npm run shots`; web interface guidelines over the
      touched files.

## Progress log
- 2026-10-11 — Opened from the audit; findings re-read in the code.
- 2026-10-11 — Focus return: Radix's `onOpenAutoFocus` fires after the palette's search field
  has already taken focus, and the `DialogContent` wrapper stays mounted while closed, so
  neither could read the opener. `OpenerCapture` renders inside the content (mounted only
  while open) and reads it before anything inside takes focus; `onCloseAutoFocus` returns it.
- 2026-10-11 — Edit's tool picker became a `fieldset` of `aria-pressed` toggles (Biome asks
  for the semantic element over `role="group"`). The design doc records the 5 px chip radius
  and the charcoal favicon. The unused `--color-white` and `--color-black` tokens are gone.

## Handoff
- **State:** done.
- **Blocked on:** nothing
- **Next:** the next features (refine an output in place with versions, share links, voiceover).
- **Read first:** —

## Verification
```
npm run verify      # lint, typecheck, tickets, 63 unit tests: passed
npm run test:e2e    # 24 passed (1.3m)
npm run shots       # exit 0; studio@390, library@1440 and the rest reviewed
```
Playwright as the guest: Escape from the Cut dialog, the palette (opened with ⌘K, focus inside
on its search field) and the phone menu returns focus to "Cut it together", "Cut it together"
and "Open the menu". The first Tab on /library is "Skip to content"; Enter focuses `main` and
the next Tab is the library search. On an iPhone 13 profile the image overlay is at opacity 1.
The composer's focused border computes to `fg` at 50%. No `[node]` attributes in the DOM;
the steps button reads "3 steps, done". The Cut dialog at 390 is inset, left-aligned, with
lanes on `surface-3`; a focused library tile shows its inset ring. Web interface guidelines
applied over the touched files.

## Outcome
Shipped: touch-visible overlays and hover-only buttons; inset tile ring; focus returned by
every dialog and sheet (`components/ui/return-focus.tsx`); field and composer focus at
`fg/50`; "3 steps, done"; transparent `.hljs`; character replies announced; the Cut dialog
on the dialog system, with progress announced in quarters; select radius and placeholder; a
`--radius-chip` token for badges, keys and inline code, menus and Markdown on the scale; the
charcoal and parchment favicon, `bg-bg` preview and corrected comments; the 404 back to the
Studio, error copy without the em dash, no faked bold; the seed category in sentence case;
named audio detail links, no `node` leak, Edit tools as toggles, a skip link in the app shell,
the account button named without its avatar letter, shortcuts announced through
`aria-keyshortcuts` and hidden on the phone sheet, an active state for local recents, one
"Create an account" wording, and a play button that only changes its name.

Left out: the character descriptions already in the database (owner's call, as rows on the
shared database); the library duration badge (4.29:1 only over a white frame). No follow-up
tickets.
