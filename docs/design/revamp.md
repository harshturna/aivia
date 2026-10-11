# The revamp: direction, product, every screen, sequence

Version 1, 2026-10-10. Owner: harsh. Status: the design the implementation tickets are written
from (TICKET-002). Decisions it rests on: D-001 (direction), D-002 (information architecture).
The direction mockup (landing hero, the Studio with a run, the empty state, the library):
https://claude.ai/artifact/4StG5BZSbsavXntnWvNGeg

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

Aivia's subject is a production: one line of brief becomes a plan, and the plan becomes
deliverables in several media at once. No other tool in the research does the mix; each makes
one kind of thing. So the most characteristic object in Aivia's world is not a prompt box and
not a gallery: it is **a job sheet filling itself in**, the brief at the top, the plan beneath
it as a real numbered sequence, and the deliverables landing one by one in their own media.

That is where the boldness is spent. The landing hero is a replayed production: a brief, a
plan appearing line by line, a poster, a six-second clip, a thirty-second track and three
taglines arriving in order, in the app's own components. The Studio renders every run the same
way: a run is a brief, a plan and its deliverables, not a stream of chat bubbles. Everything
around it is quiet.

### 2.2 The token plan, checked against the brief

The plan was written, then compared with what the same brief would produce by default (the
warm-paper, serif, clay look the research found everywhere). Three things changed as a result:
the canvas is a cool studio white rather than cream; the accent is ultramarine rather than any
warm hue; small labels and captions are set in the sans, never in a mono, and never tracked
uppercase. The serif stays, because a studio needs a voice, but it is roman, not italic, and
used in few places.

**Colour** (light only, D-001; measured contrast against the surface it sits on)

| Token | Hex | Use | Contrast |
|---|---|---|---|
| `--canvas` | `#F6F6F3` | the page, the sidebar | |
| `--surface` | `#FFFFFF` | the sheet, panels, the composer, cards | |
| `--soft` | `#ECECE8` | sunken fills, hover, placeholders | |
| `--soft-2` | `#E2E2DD` | pressed, selected rows, skeleton base | |
| `--ink` | `#1A1917` | text, the primary button, icons | 16.2 on canvas, 17.6 on surface |
| `--ink-2` | `#55544F` | secondary text | 7.0 / 7.6 |
| `--mute` | `#6B6963` | labels, captions, timestamps | 5.1 / 5.5 / 4.6 on soft |
| `--faint` | `#A9A7A0` | placeholder text, disabled, decorative only | 2.2 (never for reading) |
| `--rule` | `#E3E2DD` | hairlines | |
| `--rule-strong` | `#1A1917` | the rule under a sheet's header, a focused field | |
| `--accent` | `#2E3BDB` | the one accent: links, focus, selected, the live dot | 7.0 / 7.6 |
| `--accent-ink` | `#2430B8` | hover and pressed accent | 8.9 / 9.6 |
| `--accent-soft` | `#E9EBFB` | selected tint, marks | ink on it 14.8 |
| `--good` / `--good-soft` | `#1F6F4A` / `#E1F1E8` | done, saved | 5.7 |
| `--warn` / `--warn-soft` | `#8A5A00` / `#F7ECD2` | near the limit | 5.5 |
| `--poor` / `--poor-soft` | `#B42318` / `#FBE5E2` | failed, destructive | 6.1 |
| `--stage` | `#141311` | the lightbox, video surfaces, one band on the landing | |
| `--bone` / `--bone-mute` | `#F2F1EC` / `#A3A199` | text on stage | 16.4 / 7.2 |
| `--accent-stage` | `#8A93F2` | the accent on stage | 6.7 |
| `--scrim` | `rgb(26 25 23 / .24)` | behind dialogs | |

The primary button is ink on surface, white text. The accent is not the button colour; it
marks what is selected, focused, live or a link, which is why one hue is enough. Semantic
colours appear only as a status (a failed deliverable, the limit nearly reached) and never as
decoration.

**Type**

| Role | Face | Setting |
|---|---|---|
| Voice | Newsreader, variable, `opsz` 72, roman only | the landing headline `clamp(44px, 6vw, 76px)` weight 400, tracking −0.015em, line height 1.02; section leads 32 to 40 px weight 400; the Studio's empty-state line 30 px; a session's title in the header 20 px weight 500 |
| Everything else | Inter, variable, `opsz` axis on | body 15 px / 24 px; UI labels 13 px / 20 px, weight 500 for names and buttons; small 12 px for captions and timestamps; `font-variant-numeric: tabular-nums` on durations, counts and costs |
| Code | JetBrains Mono, variable | code blocks only, 13 px / 20 px |

Both loaded with `next/font/google` (self-hosted at build). Line length under 72 characters for
prose (`max-w-[68ch]`). Headings sentence case. No uppercase labels. The serif never carries
body text, buttons or UI labels.

**Shape and elevation**

- Radii encode hierarchy: 6 px controls (buttons, inputs, chips), 8 px media and small
  panels, 10 px the sheet and cards, 14 px the composer, 999 px only the mode and parameter
  pills, which are small.
- No drop shadow on anything that sits in the page. Two shadows exist: the composer and
  anything that floats (menus, the lightbox panel): `0 1px 2px rgb(26 25 23 / .06),
  0 12px 32px -16px rgb(26 25 23 / .25)`; and the lifted element in a landing panel.
- Hairlines (`--rule`) only where they separate rows of a sheet or sections of a page.
  Panels are distinguished by surface against canvas, not by borders.
- Spacing on a 4 px grid; section rhythm on the landing is 96 px, in the app 24 px.
- Focus: `outline: 2px solid var(--accent); outline-offset: 2px` everywhere, once.

**Icons:** Lucide 1.x at 16 px in the UI, `strokeWidth` 1.75 with `absoluteStrokeWidth`.
Never an icon tile with a tinted background.

**Wordmark:** "Aivia" set in Newsreader 500 at 20 px, ink. The favicon is a white "a" in
Newsreader on an ultramarine rounded square. No brain, no sparkle.

### 2.3 Motion

Easings: `--ease-out: cubic-bezier(.23, 1, .32, 1)` for anything entering or leaving;
`--ease-move: cubic-bezier(.77, 0, .175, 1)` for movement on screen; `--ease-sheet:
cubic-bezier(.32, .72, 0, 1)` for sheets and the sidebar. Never ease-in. Exits about 20%
faster than entrances. Never `transition: all`.

| What | How |
|---|---|
| hover, colour | 150 ms |
| press | `scale(.98)`, 100 ms |
| tooltip | 125 ms fade, 500 ms first delay then none |
| menu, popover | 150 ms, scale .96 → 1 from its origin, opacity |
| dialog | 200 ms; sheet 280 ms; sidebar collapse 200 ms |
| a plan line, a deliverable card arriving | opacity + 4 px lift, 200 ms, staggered 60 ms |
| media revealing | `filter: blur(12px)` → 0 and opacity, 400 ms, on load |
| a running job | a 2 s shimmer sweep across the placeholder, never a pulse |
| the composer moving from the middle to the bottom after the first run | a layout animation, 320 ms, `--ease-sheet` |
| page-load, landing only | the hero's replay: the headline settles (opacity and 6 px, 500 ms), then the sheet fills itself in over about eight seconds, once |

Nothing animates on route changes, on the command palette, on streamed tokens, on sidebar
active state or on a number. Loops over five seconds carry a pause control. Under
`prefers-reduced-motion: reduce` transforms and layout animations stop, opacity still runs,
the replay shows its finished state.

Library: Motion 14 (`motion/react`) through `LazyMotion` with `domMax`, used only for layout
work (the composer's move, thumbnail to lightbox, list insertions with `AnimatePresence
mode="popLayout"`). Everything else is CSS. Page transitions, if any, use React's
`<ViewTransition>` which Next 16.4 supports with no flag.

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
┌──────────────────────────────────────────────────────────────────────┐
│ canvas                                                                │
│ ┌──────────┐ ┌──────────────────────────────────────────────────────┐ │
│ │ Aivia    │ │ surface (the sheet), radius 10, inset 8 px top/right │ │
│ │          │ │  Night market teaser                        Running  │ │
│ │ New      │ │  ────────────────────────────────────────────────── │ │
│ │ Search ⌘K│ │                                                      │ │
│ │          │ │   Brief                                              │ │
│ │ Studio   │ │   ...                                                │ │
│ │ Library  │ │   Plan                                               │ │
│ │ Edit     │ │   1 ...  2 ...  3 ...                                │ │
│ │ Characters│ │  Deliverables                                       │ │
│ │          │ │   [poster]  [clip]  [track]                          │ │
│ │ Recent   │ │                                                      │ │
│ │  ◌ Night…│ │                                                      │ │
│ │    Poster│ │  ┌────────────────────────────────────────────────┐  │ │
│ │          │ │  │ composer                                       │  │ │
│ │ ▮▮▮▯ 34  │ │  └────────────────────────────────────────────────┘  │ │
│ │ harsh ▾  │ └──────────────────────────────────────────────────────┘ │
│ └──────────┘                                                          │
└──────────────────────────────────────────────────────────────────────┘
```

- **Sidebar:** 240 px on canvas, no border; collapses to a 48 px icon rail on ⌘B and on a
  button at its foot; the state is a cookie. Items are 32 px tall, 13 px weight 500, icon 16
  px, inactive at `--ink-2`, active `--ink` on `--soft` with a 6 px radius. No separators;
  groups are separated by 16 px. Order: the wordmark; New session (⌘N); Search (⌘K);
  Studio, Library, Edit, Characters; "Recent" with up to eight sessions (a 6 px ring that
  spins while a run is active, a filled dot when a result landed unseen), then "All
  sessions" to the library; the foot: the credits meter (a 4 px bar on `--soft-2`, ink fill,
  "34 of 100 generations", the Upgrade link only below 20% or at the limit, nothing for Pro)
  and the account button (avatar initial, name, plan) that opens a menu: Settings, Plan and
  credits, Keyboard shortcuts, Sign out. A guest sees "Guest · sign up to keep your work" in
  place of the plan.
- **The sheet:** `--surface` with a 10 px radius, 8 px from the canvas edge on the top, right
  and bottom; it scrolls, the sidebar does not. Its header is 52 px: the session title (or the
  screen's name) at 15 px weight 500 on the left, the screen's actions on the right (on a
  session: status, rename, delete). A `--rule` under it.
- **Below 1024 px:** the sidebar becomes a sheet from the left (280 px) behind a menu button
  in the header; the inset goes to 0 and the sheet fills the viewport. Below 640 px the
  composer's toolbar wraps and the deliverable grid is one column.
- **Keyboard:** ⌘K palette, ⌘N new session, ⌘B sidebar, `/` focuses the composer, Esc stops a
  run or closes the lightbox, `?` shows the shortcuts.

## 5. The Studio

### 5.1 The empty state

A new session shows, vertically centred in the sheet: one line in the serif, 30 px, "What
are we making?"; under it the composer; under that four chips that fill the composer rather
than send it, each showing a different kind of job: "A poster, a ten-second teaser and a
soundtrack for a night market", "Album art for a synthwave record, and name it", "A logo for a
coffee roastery with three taglines", "The sound of rain on a tin roof, twenty seconds". A
guest's first session opens on a finished example run instead, so the first thing seen is the
product at its best; the composer sits under it.

### 5.2 The composer

Width of the run column (max 768 px), `--surface`, 14 px radius, a 1 px `--rule` border that
turns `--rule-strong` on focus, the floating shadow. Top to bottom:

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
   generation", "4 generations" for four images) and a 32 px round send button, ink with a
   white arrow, that becomes a square stop while a run is active; disabled until there is
   text.
4. Keys: Enter sends, Shift+Enter breaks a line, `/` focuses from anywhere, Esc stops, ↑ in an
   empty composer recalls the last brief, `/image` and the others typed at the start switch
   the mode. Paste or drop attaches; a drop anywhere on the sheet shows a dashed overlay.

### 5.3 A run

Each user turn and the assistant turn that answers it render as one run, a sheet of its own
inside the column, separated from the next by 32 px and a hairline:

```
Brief                                              12:04
A poster, a ten-second teaser and a soundtrack for a night market

Plan
1  Search for night-market photography references           done
2  Generate the poster, 3:4                                  done · 4 s
3  Generate a 10 s clip of lanterns in rain                  running 0:41
4  Compose 30 s of lo-fi with field recording                queued

Deliverables
┌────────────┐ ┌─────────────────────────┐
│ poster     │ │ clip (placeholder 16:9) │
│ 3:4        │ │ shimmer · "lanterns…"   │
└────────────┘ └─────────────────────────┘
▶  Night market lo-fi            ▂▃▅▆▅▃▂▃▅  0:30   ↓

Notes
Three taglines: …  (the assistant's prose, markdown)
```

- **Brief:** the user's text at 15 px, the attachments as chips above it, the time at 12 px
  `--mute` on the right. No bubble, no avatar.
- **Plan:** the assistant's reasoning summary (sent as `reasoning` parts) is rendered as the
  numbered sequence it is, one line per step at 13 px, with the step's status on the right:
  queued, running with elapsed time, done with duration, failed. Numbering is used because a
  plan is a sequence. If the model sends no steps, the section is omitted; tool calls still
  appear as lines ("Generating the poster"). Text that is not a step shows under Notes.
- **Deliverables:** every tool result as a card at its final aspect ratio, so nothing jumps:
  images in a grid of up to two columns, 8 px gap, 8 px radius, with the prompt the model
  wrote as a 12 px caption under the card; while running, the placeholder is `--soft` with
  the shimmer and the prompt inside at 13 px `--mute`; on load the image reveals from blur.
  Hover shows a bottom bar: download, reuse prompt, use as reference, animate (switches to
  Video mode with the image as a start frame), edit (opens `/edit?asset=`), expand. Video is
  a 16:9 card with a poster and a play control; it plays in place, the lightbox for full
  size. Music and sound are a 56 px row: play, the title taken from the prompt, a waveform
  drawn from the decoded audio, the duration in tabular figures, download; one global
  `<audio>` element, and when the playing row leaves the viewport a mini player docks to the
  foot of the sheet. Web search is a row of source chips (favicon, host) that expand to the
  list. Code is the existing code block with a copy control. A failed deliverable keeps its
  card: one plain line of what failed, "No generation used", Retry and Edit brief.
- **Notes:** the assistant's prose through the markdown renderer, 15 px / 24 px, `max-w-[68ch]`.
- A run that is still working shows a thin progress hairline under the sheet header and the
  send button is a stop.

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
is `--stage`: media centred, a panel on the right at 320 px with the prompt, the model, the
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

`/login` and `/signup`: the canvas, a centred 400 px column, the wordmark, a one-line serif
heading ("Welcome back", "Create your account"), the two fields, the primary button, a text
link to the other page, and a quiet secondary link "Try it as a guest". Errors inline under
the field. `/get-started` keeps its job (sign in as the guest and forward) with the shimmer
rather than dots.

## 11. The landing page

Light, the app's tokens, max width 1180 px, 32 px gutters, section rhythm 96 px.

1. **Nav**, 60 px: the wordmark; Pricing and Changelog as text links; "Open Aivia" as the
   primary button (ink). Sticky with a canvas blur.
2. **Hero**: a two-column grid from 960 px, 1.1fr / 0.9fr. Left: the headline in Newsreader,
   "One brief. A whole production." (the final words are chosen in the ticket; two lines, no
   accent), a 17 px `--ink-2` paragraph of two sentences saying what happens, the primary
   button "Start making" to `/get-started` and a text link "See a run". Right: the replayed
   production, a sheet component identical to the app's run, filling in over about eight
   seconds once: the brief types in, the plan lines appear with their status ticking, the
   poster reveals from blur, the clip's poster appears then plays muted, the track's waveform
   draws, the taglines arrive. Real assets generated with the app's own models, stored under
   `public/landing/` as webp and a short mp4 with a poster. A replay control under it.
3. **Modes**: "Make any of it directly" with four plates in a row (2 × 2 below 960): an image
   (3:4), a video frame (16:9, hover to play), a waveform row, a sound row, each captioned in
   13 px with the brief that made it and the length of time it took. Real outputs.
4. **A run, step by step**: three columns on one rule: Brief, Plan, Deliverables, each with a
   short paragraph. Numbered because it is a sequence.
5. **Library and Edit**: two panels side by side in the staged-panel manner (real UI inside a
   `--soft` panel, oversized and bleeding off its edge, one element lifted): the library
   grid, and the edit workspace with the before/after slider.
6. **The stage band**: full-bleed `--stage`, one generated clip looping (muted, with a pause
   control) at 16:9 inside a 1180 px frame, one line of bone text over it.
7. **Characters**: a small section, one row of three portraits and a line.
8. **Pricing**: two columns on one rule: Free (the allowance, every mode) and Pro ($20 a
   month, unlimited). "Start free" and "Go Pro". Honest; no feature table.
9. **Changelog**: "What changed" with the last five dated entries, each one line, taken from
   a `changelog.ts` the tickets keep current. A real company has one.
10. **Close**: one serif line, "Make something today.", the primary button.
11. **Footer**, 13 px, three columns: Product (Studio, Library, Edit, Pricing, Changelog),
    Account (Sign in, Create account, Guest), Aivia (by harsh, GitHub, the privacy line),
    and the year.

Copy sells features in plain sentences; no model or vendor names, no "coming soon", no
disclaimers. Open Graph image rendered from the hero's sheet.

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
- Contrast as measured in §2.2; `--faint` is never used for text that must be read.
- Reduced motion as in §2.3. Hover-only actions are also reachable by focus.
- Widths designed at 1440, 1024, 768 and 390. No horizontal scroll at any of them.
- Each screen ticket records `npm run shots` at 1440 and 390 and a keyboard pass.

## 15. The sequence

| Ticket | What | Depends on |
|---|---|---|
| 003 | Tokens, fonts, Tailwind 4, the primitive kit, a `/kit` dev page | 002 |
| 004 | The shell: one layout, sidebar, sheet, account menu, redirects, `/settings` | 003 |
| 005 | Sessions and assets persisted; the routes that read and write them | 004 |
| 006 | The Studio: composer, empty state, the run (plan, deliverables, notes) | 005 |
| 007 | Direct modes and `/api/generate`; the old per-tool pages and routes deleted | 006 |
| 008 | Library and the lightbox route | 005, 006 |
| 009 | Edit on the shell | 004, 008 |
| 010 | Characters on the shell | 004, 006 |
| 011 | Auth pages and the guest start | 003 |
| 012 | The landing page: assets, hero replay, sections, changelog, footer, metadata | 006, 008 |
| 013 | Command palette and keyboard shortcuts | 005 |
| 014 | Accessibility and responsive pass, Playwright smoke per screen | 006 to 013 |
| 015 | Whole-app review in the browser; the fix list | 014 |

## 16. Open questions for the owner

1. Characters: keep (as designed here, demoted) or cut. The design keeps it.
2. The hero's words. "One brief. A whole production." is the working line.
3. Whether Pro should keep its $20 price and single tier. The design assumes yes.
