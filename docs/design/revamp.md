# The revamp: direction, product, every screen, sequence

Version 3, 2026-10-11. Owner: harsh. Status: the design the implementation tickets are written
from (TICKET-002). Decisions it rests on: D-004 (direction: Wonder, the forest at first light;
it supersedes D-003, whose dark tokens stay the app's default until TICKET-022), D-002
(information architecture). Design is judged in the running app on
the `revamp` branch, from screenshots, not from mockups.

Aivia is rebuilt from the tokens up. This document is what each ticket cites. The research it
rests on is in `research-landing.md` and `research-app.md` in this directory; the two skills it
follows are in `.claude/skills/` (`frontend-design` for the plan, `web-design-guidelines` for the
floor).

## 1. What the research settled

- The best-regarded AI creative tools this year show the product working, not screenshots of
  it; let the generated media carry the colour on neutral chrome; use one accent sparingly;
  set headlines lighter and larger than they used to; animate one moment on load and the
  rest only in answer to the user; end the landing page with a dated changelog and a dense
  footer. Pricing lives on its own page.
- Several looks now read as generated: cream paper with a high-contrast serif and a
  terracotta accent; near-black with an acid accent; dark zinc with a violet CTA; a tracked
  uppercase eyebrow over every heading; middle-dot meta strings; a monospace face for small
  labels; Instrument Serif, Space Grotesk and Fraunces; an italic word in the headline; a
  fade-up on every section.
- The apps converged on one front door (a composer with modes, sessions carried across
  tools, recents in the sidebar with status), a library of everything made, settings and
  plan in the account menu, credits shown at the moment of spending.

## 2. The direction

### 2.1 The subject and the one bold thing

Aivia turns one line of text into several things at once: a picture, a clip, a score, the
words. Nobody else in the category shows that, so the one bold element is a sequence that
does (D-004): the brief writes itself over an old forest at first light, each noun opens a
round-headed window onto what it became, the windows gather into a triptych, and the arches
flatten into lanes on one timeline. Growth becoming the tool is the nature-and-technology
crossing the owner asked for. The world is nature with scale (forest, canyon water, valley,
a lone tree), made with the app's own models. Everything around the sequence is quiet.

### 2.2 Tokens

**The forest theme (D-004),** in `app/globals.css` under `[data-theme="forest"]`: the landing
now, the app in TICKET-022. The legacy aliases are declared again inside it so they resolve
to the forest values.

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0B1410` | moss-dark ground |
| `--surface` / `-2` / `-3` | `#121D17` / `#18261E` / `#203027` | panels, windows, pressed |
| `--border` / `-strong` | parchment at 9% / 18% | hairlines, edges |
| `--fg` | `#F1ECDC` | parchment: text, the primary button |
| `--fg-2` / `--mute` / `--faint` | `#B6BFAE` / `#8E9984` / `#4C5A4F` | secondary, captions, decorative |
| `--sun` | `#E2B962` | the one accent: the caret, the playhead, the waveform, live states |
| `--sun-soft` | `#FFE3A6` | light in the forest: shafts and motes only |
| `--tint-bark` / `-water` / `-light` / `-fern` | `#E9A77C` / `#8FD0C0` / `#E2B962` / `#C5D6A0` | tell picture, clip, score and words apart; marks and underlines only, never fills |

The table below is D-003's dark set, still the app's default until TICKET-022.

Dark only (D-003). Surfaces step up in lightness; borders are white at low alpha so they read
on any media behind them.

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0A0A0B` | the canvas |
| `--surface` | `#141416` | the sidebar, panels, cards, inputs at rest |
| `--surface-2` | `#1C1C1F` | hover, popovers, the composer at rest |
| `--surface-3` | `#242428` | pressed, selected rows |
| `--border` | `rgb(255 255 255 / .08)` | hairlines |
| `--border-strong` | `rgb(255 255 255 / .16)` | focused fields, the composer's edge |
| `--fg` | `#F4F4F5` | text, icons |
| `--fg-2` | `#A3A3A8` | secondary text |
| `--mute` | `#8E8E97` | labels, captions, timestamps (6.0:1 on bg, 4.9:1 on surface-2; raised from `#6E6E76`, which measured 3.9:1, in TICKET-014) |
| `--faint` | `#4A4A52` | placeholders, disabled, decorative only |
| `--white` | `#FFFFFF` | the primary button, selected and live states |
| `--good` / `--warn` / `--poor` | `#5CC489` / `#E0B15A` / `#F2756B` | status only |
| `--scrim` | `rgb(0 0 0 / .6)` | behind dialogs and the lightbox |
| `--glass` | `rgb(20 20 22 / .72)` + `backdrop-filter: blur(20px)` | the floating composer, the nav after scroll |

No chromatic accent: the generated media is the colour; what is selected, focused or live is
white. The primary button is white with black text (hover `#E6E6E6`); the secondary is
`--surface-2` with a border. Links are `--fg` underlined. Semantic colours appear only as a
status dot or word.

**Type (D-004).** Cormorant, one weight (500) in roman and italic, is the display face:
the hero brief `clamp(44px, 7.4vw, 124px)` at line height 0.96, section headings
`clamp(40px, 5.2vw, 76px)` at 0.98, the close at up to 104 px, and italics for made words
(taglines, track titles, captions on the wall). Host Grotesk stays for everything else.

**Type (D-003, the app until TICKET-022).** One family, Host Grotesk (variable 300 to 800, `next/font/google`), with JetBrains
Mono for code only. Hero headline `clamp(44px, 6.5vw, 92px)` weight 500, tracking −0.03em,
line height 0.98, at most two lines, no accented word. Section headings 36 to 56 px weight 500,
−0.02em. Body 15 px / 24 px at 400; UI 13 px / 20 px, names and buttons at 500; captions 12 px
`--mute`; numbers tabular. Prose under 68ch. Sentence case; no uppercase labels.

**Shape and elevation.** Radii: 8 px controls, 12 px media and cards, 16 px the composer and
panels, 20 px the large media window on the landing, 999 px for small pills. Media is
borderless. Panels are a surface step, not a border, except where they float (the composer,
menus, the lightbox panel) which also take `0 24px 64px -24px rgb(0 0 0 / .8)`. Spacing on a
4 px grid; landing sections 120 px apart; the app on 24 px.

**Icons.** Lucide at 16 px, stroke 1.75, `absoluteStrokeWidth`. Never on a tinted tile.

**Wordmark.** "aivia" in Host Grotesk 600, 20 px, −0.02em, `--fg`. The favicon is a white
rounded square with a black "a". No brain, no sparkle.

### 2.3 Motion

Easings: `--ease-out: cubic-bezier(.23, 1, .32, 1)` for entering and leaving;
`--ease-move: cubic-bezier(.77, 0, .175, 1)` for movement; `--ease-sheet:
cubic-bezier(.32, .72, 0, 1)` for sheets. Never ease-in; never `transition: all`.

| What | How |
|---|---|
| hover, colour | 150 ms |
| press | `scale(.98)`, 100 ms |
| menu, popover | 150 ms, scale .96 → 1 from its origin |
| dialog 200 ms, sheet 280 ms, sidebar 200 ms | |
| a new output card | opacity + 6 px, 240 ms |
| media revealing | `blur(14px)` → 0 with opacity, 500 ms, on load |
| a running job | a 2 s shimmer across the placeholder at the final aspect ratio |
| the hero on load | the clip fades in over 900 ms, the headline settles 500 ms after (opacity and 8 px), the composer 150 ms later; once |
| hero clips | crossfade every 9 s between three clips, 1.2 s, paused under reduced motion and when the tab is hidden |
| media tiles on the wall | hover plays the clip (`preload="none"`, poster), 1.02 scale over 600 ms |

**The landing hero (D-004)** is one scroll-pinned sequence over 380svh: the brief types once
(about 3 s, a pause at each noun while its window opens), then scroll drives the windows
from their slots in the sentence to the triptych and on to the timeline; the brief shrinks
into a caption. Ambient life: light shafts breathe (9 s), motes rise (14 to 30 s), fog drifts
(140 and 200 s), the tree rings turn with scroll. Frame budget rules: per-frame values are
written straight onto the element that uses them, never through React state or an inherited
custom property; what moves every frame is a transform or an opacity on its own layer; no
blend modes, filters or backdrop blur in motion; ambient animation pauses off screen and in
hidden tabs; the clock runs only while the soundtrack plays or the timeline is visible.
Reduced motion: no typing, no pinning, the triptych shown still.

Nothing animates on route changes, the palette, streamed tokens, sidebar state or numbers.
Under reduced motion: no transforms, no autoplay, opacity still runs. Library: Motion 14
through `LazyMotion` + `domMax` for layout work only; CSS for the rest.

## 3. The product: what exists and where it lives

Decided in D-002.

- **Studio** is the front door and the only place to make things. One composer with modes:
  **Auto** (the agent plans and calls tools; text, code and attached-document questions are
  answered here too), **Image**, **Video**, **Music**, **Sound** (the tool directly, no
  planning step, with that mode's parameters). Conversation, Code and Documents are no longer
  pages: they are Auto with the right prompt or an attachment.
- **Sessions** persist. `/studio` opens a new one; `/studio/[id]` reopens one; the sidebar
  lists recent sessions with a running indicator.
- **Library** (`/library`) is everything ever made, by day, filterable by kind, searchable by
  prompt, with a lightbox at `/library/a/[id]`.
- **Edit** (`/edit`) is the Cloudinary transformations on the shared shell: upload a photo or
  pick one from the library, then restore, remove background, recolor, remove an object, fill.
  Reachable from any image's menu too.
- **Characters** (`/characters`, `/characters/[id]`, `/characters/new`, `/characters/c/[id]`
  for the chat) stays, rebuilt on the shared shell with the Studio's message components. It is
  the one feature with saved history today. It sits low in the navigation; cutting it is a
  product call for the owner, not this design.
- **Settings** (`/settings`) holds the account, the plan and credits, reached only from the
  account menu.
- **Deleted, with permanent redirects** in `next.config.js`: `/dashboard` → `/studio`;
  `/generative` → `/studio`; `/conversation`, `/code`, `/documents` → `/studio`; `/image`,
  `/video`, `/music` → `/studio?mode=image|video|music`; `/transformations/:type` →
  `/edit?tool=:type`; `/generative/settings` and `/characters/settings` → `/settings`.
- **Auth:** `/login`, `/signup`, `/get-started` (the guest start) keep their routes, rebuilt.
- **Credits:** the counts stay as they are in `constants.ts` (a free allowance per user, a
  global cap); the UI shows them as a quiet meter and names the cost of a mode on its send
  button. Weighted credits are a billing change and are out of scope.

## 4. The shell

One layout for every signed-in route, `app/(app)/layout.tsx`, replacing the three route groups.

```
┌──────────┬────────────────────────────────────────────────────────┐
│ aivia    │  Night market teaser                         Running   │
│          │                                                        │
│ + New    │   a poster, a ten-second teaser and a soundtrack …     │
│ ⌕ Search │   Steps 4 · 2 done ▾                                   │
│          │   ┌──────────────┐ ┌──────────────────────────────┐    │
│ Studio   │   │              │ │                              │    │
│ Library  │   │   poster     │ │   clip (16:9, shimmer)       │    │
│ Edit     │   │   3:4        │ │                              │    │
│ Characters│  └──────────────┘ └──────────────────────────────┘    │
│          │   ▶ night market lo-fi  ▂▃▅▆▅▃▂▃▅▆▅▃▂  0:30            │
│ Recent   │   Three taglines: …                                    │
│  ◌ Night…│                                                        │
│    Poster│                                                        │
│          │   ╭──────────────────────────────────────────────╮     │
│ ▮▮▮▯ 34  │   │ composer (glass, floating)                    │     │
│ harsh ▾  │   ╰──────────────────────────────────────────────╯     │
└──────────┴────────────────────────────────────────────────────────┘
```

- **Sidebar:** 232 px, `--surface`, a `--border` on its right; collapses to a 52 px icon rail
  on ⌘B and on a control at its foot, state in a cookie. Items 32 px, 13 px weight 500, icons
  16 px; inactive `--fg-2`, hover `--surface-2`, active `--fg` on `--surface-3`, 8 px radius.
  No separators; groups 16 px apart. Order: the wordmark; New session (⌘N); Search (⌘K);
  Studio, Library, Edit, Characters; Recent with up to eight sessions (a spinning ring while a
  run is active, a white dot for an unseen result), then "All sessions"; the foot: the credits
  meter (a 4 px bar on `--surface-3` with a white fill, "34 of 100 generations", the Upgrade
  link only below 20% or at the limit, nothing for Pro) and the account button (initial,
  name, plan) opening a menu: Settings, Plan and credits, Keyboard shortcuts, Sign out. A guest
  sees "Guest · sign up to keep your work" in place of the plan.
- **The main area** is the canvas itself; there is no inset sheet. Its header is 52 px: the
  session title or screen name at 15 px 500 on the left, the screen's actions on the right, a
  `--border` beneath only when the content has scrolled under it.
- **Below 1024 px** the sidebar is a sheet from the left (280 px) behind a menu button in the
  header. Below 640 px the composer's toolbar wraps and output grids go to one column.
- **Keyboard:** ⌘K palette, ⌘N new session, ⌘B sidebar, `/` focuses the composer, Esc stops a
  run or closes the lightbox, `?` shows the shortcuts.

## 5. The Studio

### 5.1 The empty state

A new session shows, vertically centred: one line at 32 px weight 500, "What are we
making?"; under it the composer; under that four chips that fill the composer rather than
send it, each showing a different kind of job: "A poster, a ten-second teaser and a
soundtrack for a night market", "Album art for a synthwave record, and name it", "A logo for a
coffee roastery with three taglines", "The sound of rain on a tin roof, twenty seconds". A
guest's first session opens on a finished example run instead, so the first thing seen is the
product at its best; the composer sits under it.

### 5.2 The composer

Width of the column (max 760 px), `--glass` with the blur, 16 px radius, a 1 px `--border` that
turns `--border-strong` on focus, the floating shadow; it floats 16 px above the bottom edge
and the transcript scrolls beneath it. Top to bottom:

1. Attachment chips, 56 px, 8 px radius, a remove control on hover, a ring while uploading.
   Images and PDFs; `.txt`, `.md`, `.csv` as documents.
2. The textarea: 15 px / 24 px, one line to start, grows to 240 px then scrolls. Placeholder
   by mode: "Describe what you want made", "Describe the image", "Describe the scene and the
   motion", "Describe the music", "Describe the sound".
3. A 40 px toolbar. Left: attach (a paperclip, plus a `+` menu on small screens), the mode
   pill (`Auto ▾` listing the five modes with a one-line description each), then that mode's
   parameter pills: Image: aspect (1:1, 3:4, 4:3, 16:9, 9:16) and count (1 to 4); Video:
   length (6 to 20 s in the model's steps) and aspect; Music: length (15, 30, 60 s); Sound:
   length (auto, 2, 5, 10 s). Right: the cost of the send in 12 px tabular `--mute` ("1
   generation", "4 generations" for four images) and a 32 px round send button, white with a
   black arrow, that becomes a square stop while a run is active; dimmed until there is text.
4. Keys: Enter sends, Shift+Enter breaks a line, `/` focuses from anywhere, Esc stops, ↑ in an
   empty composer recalls the last brief, `/image` and the others typed at the start switch
   the mode. Paste or drop attaches; a drop anywhere on the sheet shows a dashed overlay.

### 5.3 A run

Each user turn and the assistant turn that answers it render as one run, 40 px below the
last, in the 760 px column:

```
a poster, a ten-second teaser and a soundtrack for a night market           12:04
Steps 4 · 2 done · 0:41 ▾
┌───────────────────┐ ┌────────────────────────────────────┐
│ poster 3:4        │ │ clip 16:9, shimmer, "lanterns…"     │
└───────────────────┘ └────────────────────────────────────┘
▶  night market lo-fi            ▂▃▅▆▅▃▂▃▅  0:30   ↓
Three taglines: …
```

- **The prompt** is one line at 14 px `--fg-2` with the attachments as 40 px thumbnails before
  it and the time at 12 px `--mute` on the right. No bubble, no avatar, no label.
- **Steps** is one compact line at 13 px: "Steps 4 · 2 done", the elapsed time while running,
  a chevron; open, it lists the plan the agent wrote (the reasoning summary parsed into
  numbered lines by `lib/ai/plan.ts`, tool calls matched to them by order) with each line's
  status: queued, running with elapsed time, done with duration, failed. Closed by default once
  the run finishes; open by default while it runs. If there is no plan, the line is omitted and
  tool calls show as their own status lines.
- **Outputs** are the point and get the width: a single image fills the column up to its
  natural height; two to four images sit in a two-column grid; video is a 16:9 card with a
  poster and a play control that plays in place; music and sound are a 56 px row with play,
  the title from the prompt, a waveform from the decoded audio, the duration, download; one
  global `<audio>` and a mini player docked above the composer when the playing row leaves the
  viewport. All media at 12 px radius, borderless, revealed from blur on load; while running,
  the placeholder is `--surface` at the final aspect ratio with the shimmer and the prompt the
  model wrote inside at 13 px `--mute`. Hover on an image shows a bottom bar: download, reuse
  prompt, use as reference, animate (switches to Video mode with the image as the start frame),
  edit (`/edit?asset=`), expand (the lightbox). Web search is a row of source chips. Code is the
  code block with a copy control. A failed output keeps its slot: one plain line, "No
  generation used", Retry and Edit prompt.
- **Notes** are the assistant's prose through the markdown renderer, 15 px / 24 px, `max-w-[68ch]`.

### 5.4 Direct modes

Image, Video, Music and Sound skip the planner: the brief and the parameters go to one route,
`POST /api/generate`, which calls the capability directly and streams a single deliverable
back. The run renders the same way with no Plan section. This is cheaper and deterministic,
and it is what the old per-tool pages did, now inside a session.

### 5.5 Limits and errors

At the free limit the composer is disabled and the run column ends with an inline message:
"You have used your 5 free generations. Upgrade for unlimited use." and one button. The shared
guest cap reads "The demo has reached today's limit. Come back tomorrow." Errors never toast:
they appear in the place the result would have been, say what happened, and offer the next
step. The upgrade dialog, when opened, says what Pro is in plain words, the price, and has
"Continue to checkout" and "Not now". No list of tools with icons.

## 6. Library

`/library`: the sheet's header carries the name and a segmented control All / Images / Video
/ Audio and a search field over prompts (Postgres full-text on `Asset.prompt`); a Favourites
toggle. The body groups assets by day ("Today", "Yesterday", then the date) as `--mute` 13 px
headings; images and video in CSS-columns masonry (`columns-2 md:columns-3 xl:columns-4`, 8 px
gap, 8 px radius, `break-inside-avoid`), audio as rows under their day. Hover shows the kind,
the duration and a favourite control; click opens the lightbox at `/library/a/[id]`, an
intercepting route with a parallel slot so the URL is shareable and Esc returns. The lightbox
is the canvas with the scrim: media centred, a panel on the right at 320 px with the prompt, the model, the
parameters, when it was made, "Open session", download, use as reference, edit, delete.
Cursor pagination, 48 per page, loaded as the end comes into view. Empty: "Nothing made yet.
Start in the Studio." and a link.

## 7. Edit

`/edit`: the sheet shows a 2-column workspace from 1024 px (one column below): the source on
the left (drop zone or "Choose from library", then the image), the result on the right at the
same size, a tab row over both: Restore, Remove background, Recolor, Remove object, Fill.
Recolor and Remove object show a small field for the object (and the colour); Fill shows the
aspect chooser. One primary button, "Apply", which names the tool ("Remove background").
While applying, the result side carries the shimmer; the result reveals from blur; a
before/after slider appears on the result once there is one. Download under the result. The
same `lib/actions.ts` limit check as today, surfaced inline rather than as a toast. A query
`?asset=` opens with a library asset as the source; `?tool=` selects a tab.

## 8. Characters

`/characters`: the sheet lists characters in a grid of cards (portrait 4:5 at 8 px radius,
the name at 13 px 500, the one-line description at 12 px `--mute`), a search field and the
category chips in the header row, a "New character" button. `/characters/c/[id]` is a chat on
the Studio's run components with a character header (portrait, name, edit and delete in a
menu for its owner); replies render as Notes, no Plan. `/characters/new` and
`/characters/[id]` is the form: portrait upload, name, description, category, instructions,
seed conversation, in one column at 560 px with the same fields and validation as today.
Guests see the shared characters and cannot create or delete; the controls say so inline.

## 9. Settings

`/settings`, one page at 640 px: Account (email, "Signed in as", sign out), Plan (Free or
Pro, the allowance used, "Manage subscription" through the Stripe portal or "Upgrade"), and
Keyboard shortcuts. Guests see the account section as "Guest session" with sign-up.

## 10. Auth

`/login` and `/signup`: the canvas, a centred 400 px column, the wordmark, a one-line 28 px
heading ("Welcome back", "Create your account"), the two fields, the primary button, a text
link to the other page, and a quiet secondary link "Try it as a guest". Errors inline under
the field. `/get-started` keeps its job (sign in as the guest and forward) with the shimmer
rather than dots.

## 11. The landing page

D-004: the forest theme, content at 1200 px with 32 px gutters, sections 160 px apart. Below
the fold each section skips layout and paint until it comes near (`content-visibility`).

1. **Nav**, 64 px, transparent over the hero and `--glass` after 40 px of scroll: the wordmark;
   Pricing; Sign in; "Start making" as the primary (parchment) button.
2. **Hero**: the sequence in §2.3. The brief: "A poster, a teaser, a soundtrack and the words
   for a forest older than memory." Picture is the lone tree, clip the canyon waterfall,
   score "First light in the old wood", words "Older than every map." and two more. The
   triptych has a play control for the score; the timeline has a playhead, timecode and the
   same control. The plate is art-directed (a portrait crop on tall screens) through
   `next/image`; the teaser clip loads when its window opens.
3. **Now write yours.** The real composer (Auto) and three example chips; the prompt goes to
   the Studio through `/get-started?prompt=`.
4. **Every one of these was a sentence first.** The wall: rows at 16:9, 3:4 and 1:1, the line
   that made each tile in Cormorant italic over a bottom gradient, on hover and always on
   touch. Clips play only while on screen.
5. **It plans the work, then does it.** The Studio frame running the forest brief as a replay
   (steps ticking, the poster, the clip, the score, three taglines).
6. **Need just one thing? Ask for just that.** The four direct modes: an image, a clip, the
   score and a sound, each with the line that made it.
7. **Start free.** Free (five generations in every mode) and Pro ($20 a month, unlimited).
8. **Begin with one sentence.** Over the valley clip, faded by a mask so it melts into the
   page, and the primary button.
9. **Footer**, 13 px: Product (Studio, Library, Edit, Pricing), Account (Sign in, Create
   account, Try as a guest), Aivia (by harsh, Source), the year.

Removed in TICKET-021 at the owner's call: the changelog ("what changed") and the library
panel ("everything you make, kept": table stakes, not a reason to come). Copy sells features
in plain sentences; no model or vendor names, no "coming soon", no disclaimers, no eyebrows,
no accented word. The Open Graph image is the forest with the headline.

## 12. Data

Two tables, additive, applied with `prisma db push` (the project has no migrations folder):

```
Session   id, userId, title, mode, messages Json (UIMessage[]), createdAt, updatedAt
Asset     id, userId, sessionId?, kind (image|video|music|sound), url, posterUrl?,
          prompt, model, params Json, width?, height?, durationSec?, favorite,
          createdAt   @@index([userId, createdAt]), full-text on prompt
```

- `/api/agent` and `/api/generate` write an `Asset` from each tool's result (inside the
  tool's `execute`, so it is saved even if the stream is abandoned) and the `Session` on
  finish; the first turn names the session with a cheap call (Haiku) from the brief.
- Asset URLs are fal's for now; a follow-up ticket mirrors them to Cloudinary if they prove
  to expire (routine choice, logged in TICKET-005).
- Guest sessions and assets belong to the guest user and are listed for every guest; a daily
  job deletes guest rows older than seven days (TICKET-005).
- `/api/sessions` (list, create), `/api/sessions/[id]` (get, rename, delete), `/api/assets`
  (list with cursor, kind, query), `/api/assets/[id]` (favourite, delete).

## 13. States

- **Loading:** a loader appears only after 200 ms and stays at least 300 ms; skeletons are
  the shape of what they stand for (a run column, a library grid of 8 px radius rectangles);
  labels end with an ellipsis ("Generating 4 images…"). Route-level `loading.tsx` renders the
  sheet with its header and a skeleton body, never a centred spinner.
- **Empty:** every empty state is a sentence and a link to the action, no illustration.
- **Errors:** in place, one plain line, the next step. The route error boundary renders inside
  the sheet with "Try again".
- **The guest:** the first session is a finished example; a chip in the sidebar foot; the
  create and delete controls in Characters say "Sign up to create your own" inline.

## 14. Accessibility and responsive

- Every control has a visible focus ring (the one outline rule), a name, and a keyboard
  path. The lightbox and menus trap focus and restore it. The audio rows are buttons with
  `aria-pressed`; the waveform is decorative. Images carry the prompt as alt text.
- Live regions: a run's status changes are announced politely ("Poster done").
- Contrast, measured: `--mute` 6.0:1 on `--bg` and 4.9:1 on `--surface-2`; `--faint` never carries text. The smoke suite runs axe on every screen (TICKET-014).
- Reduced motion as in §2.3. Hover-only actions are also reachable by focus.
- Widths designed at 1440, 1024, 768 and 390. No horizontal scroll at any of them.
- Each screen ticket records `npm run shots` at 1440 and 390 and a keyboard pass.

## 15. The sequence

| Ticket | What | Depends on |
|---|---|---|
| 003 | Tokens, fonts, Tailwind 4, the primitive kit, a `/kit` dev page | 002 |
| 012 | The landing page, first, so the direction is judged on the real site | 003 |
| 004 | The shell: one layout, sidebar, account menu, redirects, `/settings` | 003 |
| 005 | Sessions and assets persisted; the routes that read and write them | 004 |
| 006 | The Studio: composer, empty state, the run (plan, deliverables, notes) | 005 |
| 007 | Direct modes and `/api/generate`; the old per-tool pages and routes deleted | 006 |
| 008 | Library and the lightbox route | 005, 006 |
| 009 | Edit on the shell | 004, 008 |
| 010 | Characters on the shell | 004, 006 |
| 011 | Auth pages and the guest start | 003 |
| 013 | Command palette and keyboard shortcuts | 005 |
| 014 | Accessibility and responsive pass, Playwright smoke per screen | 006 to 013 |
| 015 | Whole-app review in the browser; the fix list | 014 |

## 16. Open questions for the owner

1. Characters: keep (as designed here, demoted) or cut. The design keeps it.
2. The hero's words. "One brief. A whole production." is the working line.
3. Whether Pro should keep its $20 price and single tier. The design assumes yes.
