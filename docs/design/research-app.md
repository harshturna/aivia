# Research: the in-app UI of AI creative tools, October 2026

Collected 2026-10-10 for the revamp design (TICKET-002). Sources: vendor posts and docs (Krea's
March 2026 redesign, Runway's changelog, Linear's March 2026 refresh, the shadcn changelog and
sidebar source, Vercel's Geist CSS and web interface guidelines, Motion's docs, the ElevenLabs
UI announcement), plus third-party teardowns where an app sits behind a login. Kept here as the
evidence behind D-001 and D-002.

## 1. Shell and navigation

- **Krea (March 2026):** every tool in one left sidebar, sessions carried over between tools,
  running jobs with live indicators, session search across all past work, pinnable tools.
  Assets is one grid of everything behind a top-nav icon. Page-transition delays removed.
- **Runway:** the front door is now Agent (May 2026), a chat that generates, edits on a
  timeline and builds workflows. Tool Mode, a direct per-model path, is kept beside it. The
  credit balance sits top-right of a session.
- **ChatGPT:** images moved out of chat into a tab (December 2025), then into a general Library
  (April 2026). Sidebar about 260 px, collapsing to a 52 px icon rail.
- **Midjourney:** Explore / Create / Edit / Personalize / Organize; Create is an imagine bar
  pinned above a chronological feed; plan and fast hours live in the account menu.
- **Gemini:** no per-media pages; a Tools menu in the composer, the chosen tool becoming a chip.
- **Claude.ai:** collapsible sidebar with New chat, Chats, Projects, Artifacts; account and plan
  in the footer; artifacts open in a right split panel.
- **Status in the sidebar:** v0 groups chats by project with live status; Cursor 3 lists agents
  with status; Notion shows a dot when a reply has landed.
- **Linear (March 2026):** the sidebar "a few notches dimmer" so content leads, smaller icons,
  muted inactive text, separators removed, warmer greys.
- **Command palette:** ⌘K everywhere (Linear, Vercel, Raycast, Figma's Actions).

The pattern: a 240 to 260 px sidebar that collapses to a 48 to 52 px rail on ⌘B; recent
sessions with status dots; Library as its own item; account and plan in a footer menu; credits
top-right or in the account menu, never a promo card.

shadcn `Sidebar` facts (from source): `16rem` desktop, `18rem` mobile sheet, `3rem` rail; ⌘B
toggles; state in a `sidebar_state` cookie for seven days; 200 ms linear width transition;
menu buttons h-8 / h-7 / h-12; variants `sidebar`, `floating`, `inset`; collapsible
`offcanvas`, `icon`, `none`.

## 2. The composer

- **Krea:** prompt box at the bottom, the model picker in its bottom-left corner defaulting to
  Auto, with speed, quality and compute cost per model; the chosen model's settings appear
  beneath the box (an aspect-ratio button labelled "1:1", style and image references).
- **Midjourney:** "What will you imagine?" bar at the top; an image icon opens drop zones for
  image, style and omni references; a sliders icon opens aspect-ratio presets and the
  stylize / weirdness / variety sliders. Settings persist between sessions.
- **ChatGPT:** a pill composer; "+" on the left holds files, image, deep research, agent; the
  chosen tool becomes a pill in the box; the send arrow appears once there is text;
  attachment previews before sending.
- **Claude:** "+" for files and connectors, a tools toggle, the model picker beside send.
- **Vercel AI Elements `PromptInput`** has the right anatomy: attachment previews on top, a
  textarea that grows between a min and a max, a footer with tools left (buttons with tooltip
  and key hint, a model select) and Submit right with submitted / streaming / error states;
  Enter sends, Shift+Enter breaks; files dropped anywhere on the page attach.
- **shadcn (October 2025):** InputGroup, ButtonGroup, Kbd, Spinner, Empty, Item, Field.

A spec that follows from this: a composer the width of the thread column (max 768 px) with a
20 px radius and a 1 px border that strengthens on focus and never glows; attachment chips at
56 px; a 15 px / 24 px textarea growing from one line to 240 px; a 40 px toolbar with "+",
a mode pill and that mode's parameter pills on the left, the cost in muted tabular figures and
a round send button on the right that becomes stop while streaming; Enter sends, `/` focuses,
Esc stops, ↑ edits the last prompt, paste and drop attach. The empty state centres the composer
under a one-line greeting with four chips that fill it rather than send; after the first send
it moves to the bottom.

## 3. Generation output

- **Krea:** one prompt produces one row; row hover gives retry, reuse parameters, download all,
  delete; image hover gives fullscreen, edit, upscale, video (as a start frame), download.
- **Midjourney:** previews sharpen from blur with a percentage; the lightbox shows the image
  left and a panel right with the prompt, vary, upscale, remix, and "Use → image / style /
  prompt"; Esc and arrows work.
- **ChatGPT:** a shimmering "Creating image" placeholder, then a progressive resolve; an
  expanded viewer with focused and canvas views; live elapsed time on long tasks.
- **shadcn chat components (June 2026):** `MessageScroller`, `Message`, `Bubble`, `Attachment`,
  `Marker` (tool activity, streaming status), `shimmer` and `scroll-fade` utilities.
- **Audio:** Suno's library is a dock of rows grouped by date with one pinned mini-player;
  ElevenLabs UI (MIT, shadcn-registry) ships Audio Player, Waveform, Bar Visualizer, Orb.

A layout that follows: user turns as a right-aligned bubble at most 80% wide; assistant turns
as prose with no bubble; each tool call a marker row ("Generating image · 1:1" with shimmer and
elapsed time, collapsing to "4 images · 11 s"); a placeholder at the exact final aspect ratio
with the prompt echoed inside, no fake progress; a blur-to-sharp reveal on load (400 ms, the
one place for delight); images in a 2-up grid with hover actions (download, reuse prompt, use
as reference, animate, edit, expand) and a lightbox; video as a 16:9 card with a poster; audio
as a 56 px row with play, waveform, duration and download, one global audio element and a
docked mini-player; web search as a row of favicon chips.

## 4. Library and history

Krea's single Assets grid; Midjourney's Organize with search and filters; ChatGPT's Library;
Suno's date-grouped library; Runway's Projects. Cheap for Aivia: two tables (`Session` holding
the AI SDK messages, `Asset` with kind, prompt, model, params, url, poster, dimensions,
duration, favourite); write an asset from each tool's execute and the session on finish; copy
outputs to Cloudinary (already a dependency; URL transforms give thumbnails and posters); a
`/library` with All / Images / Video / Audio, search over prompts, day groups, CSS-columns
masonry, cursor pagination, and a lightbox as an intercepting route so every asset has a URL.

## 5. States: premium against cheap

Cheap: a "3/5 free generations" card with a gradient Upgrade button fixed in the sidebar;
coloured icon tiles per tool; every page headed by a big coloured icon and a description; bot
and user avatars on every message; typing dots; an upgrade modal listing every tool; crown
badges; "Aivia is thinking…"; generic "Something went wrong" toasts; a dashboard of cards.

Premium: neutral chrome so the media supplies the colour; cost shown at the moment of decision
(on the send button; a confirm card only for video in agent mode); a quiet 4 px meter with
"34 credits · resets Nov 1" in the sidebar footer, the Upgrade link only below 20%; the limit
reached as an inline message in the transcript with the composer disabled and one CTA; errors
in the slot where the result would have been, one plain line, "no credits used", Retry and Edit
prompt; loaders after 150 to 300 ms and kept at least 300 ms; skeletons that match the final
layout; guests landing in a finished example session with a quiet "Guest · sign up to keep
your work" chip.

## 6. Information architecture (the recommendation)

Fold everything that is "prompt → output" into one Studio composer with modes. Library and Edit
first-class. Characters demoted to a lower slot. Settings, plan and credits in the account menu.

- Modes: **Auto** (the agent plans and calls tools) and **Image / Video / Music / Sound**
  (the tool directly, no planning step, cheaper and deterministic, with that mode's parameter
  pills). Switched with the pill or by typing `/image`. Direct output lands in the same session
  as a row.
- Sidebar: New session (⌘N), Search (⌘K), Library, Edit, Characters, Recents with status, a
  credits meter, the account menu (Settings, Plan, Theme, Shortcuts, Sign out). Items 32 px,
  labels 13 to 14 px, icons 16 px, inactive at ~70%.
- Routes: `/studio` the home and a new session, `/studio/[id]` a saved one. Delete, with
  redirects: `/dashboard`, `/generative`, `/conversation`, `/code`, `/documents`, `/image`,
  `/video`, `/music`. Rename `/transformations/[type]` to `/edit` (upload or pick from the
  library, then tabs). Add `/library`. Keep `/characters` on the shared shell. Merge
  `/generative/settings` into `/settings`. A ⌘K palette over sessions, assets and actions.
  Weighted credits replace the free-generation count.
- Stack: Tailwind 4 with `tw-animate-css`; stay on Radix (shadcn made Base UI the default in
  July 2026 but Radix is supported); bump lucide.

## 7. Motion vocabulary

- Easings: `cubic-bezier(.23,1,.32,1)` for anything entering or leaving;
  `cubic-bezier(.77,0,.175,1)` for movement on screen; `cubic-bezier(.32,.72,0,1)` for
  sheets; never ease-in; exits ~20% faster than entrances.
- Hover and colour 150 ms (never `transition: all`); press `scale(.97)` 100 ms; tooltip 125 ms
  with a 500 ms first delay; popover 150 ms scale .96 → 1 from its origin; dialog 200 ms; sheet
  280 ms; sidebar 200 ms; a new message or row opacity + 4 px over 200 ms; media blur → sharp
  400 ms; running jobs a 2 s shimmer, not a pulse; elapsed timers tabular, no tweening.
- No animation on route changes, the ⌘K palette (100 ms at most), streamed tokens, sidebar
  active state, credit numbers. Loops over 5 s need a pause control.
- Motion (`motion/react`): only for layout work (composer centre → bottom, thumbnail →
  lightbox, list insertions) with `layoutId`, `AnimatePresence mode="popLayout"`, springs as
  `{ type: "spring", visualDuration: 0.3, bounce: 0 }`, `<MotionConfig reducedMotion="user">`,
  `LazyMotion` with `domMax`. Motion is 14.x (October 2026) with the same API.
