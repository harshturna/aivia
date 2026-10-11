# Decisions

Append-only. Record only choices that are expensive to reverse or whose reasoning would be
confusing to rediscover. Routine implementation choices live in the ticket that made them.
Accepted decisions are immutable except for their status and a pointer to a superseding decision.

## Entry format

```markdown
## D-NNN — Short title
- **Status:** Accepted | Rejected | Superseded by D-NNN
- **Date:** YYYY-MM-DD
- **Context:** what forced the choice
- **Decision:** what was chosen
- **Rejected alternatives:** what else was considered and why it lost
- **Consequences:** what becomes easier and harder
```


## D-001 — Visual direction for the revamp: studio white, a serif voice, ultramarine, the job sheet
- **Status:** Superseded by D-003
- **Date:** 2026-10-10
- **Context:** The owner asked for a complete revamp that reads as a real company, with freedom
  to choose the direction. Three research passes (`docs/design/research-landing.md`,
  `research-app.md`) read the live pages and apps of about thirty AI creative tools and the
  current `frontend-design` guidance. Several looks now read as generated: cream paper with a
  high-contrast serif and a clay accent; dark zinc with a violet CTA; near-black with an acid
  accent; eyebrows, middle-dot meta strings, monospace labels, Instrument Serif. The current
  app (Montserrat, coral, radial glow, icon tiles) sits in the generic zone. A solo build
  cannot keep supplying cinema-grade footage, which the dark-cinema look depends on.
- **Decision:** Light only. A cool studio white canvas (`#F6F6F3`) with a white sheet, charcoal
  ink (`#1A1917`), warm-neutral greys, hairlines only where they separate rows, and one accent,
  ultramarine (`#2E3BDB`), used for what is selected, focused, live or a link; the primary
  button is ink. Two families: Newsreader (roman, `opsz` 72) as the voice in few places and
  Inter (with its `opsz` axis) for everything else; JetBrains Mono for code blocks only.
  Radii encode hierarchy (6, 8, 10, 14 px). Generated media supplies the colour. The one bold
  element is the job sheet: a run is a brief, a numbered plan and its deliverables, on the
  landing page as a replayed production and in the Studio as the shape of every run. Motion is
  one orchestrated moment on the landing and otherwise answers the user. Tokens, type, motion
  and contrast are in `docs/design/revamp.md` §2; the mockup is linked from TICKET-002.
- **Rejected alternatives:** Cream, serif and terracotta, rejected as the recognised AI tell
  and Claude's own look. Dark cinema (black stage, bone text, full-bleed clips), rejected
  because it lives on footage a solo build cannot keep making and, done poorly, is the generic
  dark AI page. Swiss tool (white, international orange, Inter Display, UI replicas), rejected
  as reading "dev tool" more than "studio". Soft studio (cream, lavender, wide uppercase
  Archivo with springs), rejected as Pika's current look. Keeping the coral primary, rejected
  as generic. A dark theme or a toggle, out of scope: light only for now, with tokens that
  could take a dark set later.
- **Consequences:** Easier: the landing page and the app share one look and one component
  vocabulary; the run sheet is one component used in both; no video library is needed for the
  look to hold; everything loads from `next/font/google`. Harder: the serif must be used with
  discipline or it reads as a trend; the ultramarine must stay rare or the page turns blue;
  every screen is rebuilt, since nothing of the current chrome survives; a dark theme, if ever
  wanted, is a later decision and a second token set, not a flip.

## D-002 — One Studio with modes; sessions and a library; Edit and Characters on one shell; per-tool pages removed
- **Status:** Accepted
- **Date:** 2026-10-10
- **Context:** The app had three route groups with three sidebars, a dashboard of five cards,
  and six per-tool pages (conversation, code, documents, image, video, music) beside a Studio
  agent that already does all of it; nothing a user made was kept. The research found the
  best apps converged on one front door with modes, sessions carried across tools, recents in
  the sidebar, a library of everything made, and settings and plan in the account menu. The
  owner asked to remove friction and clunky UI and gave freedom to add and remove features.
- **Decision:** One signed-in shell (`app/(app)`): a 240 px sidebar that collapses to a rail, a
  white sheet for the screen. **Studio** is the only place to make things: a composer with
  modes Auto (the agent plans and calls tools; text, code and attached-document questions
  live here), Image, Video, Music and Sound (the tool directly, no planning step). **Sessions
  persist** (`Session`) and every output is an **Asset**; `/studio/[id]` reopens a session;
  `/library` shows everything by day with a lightbox route. **Edit** (`/edit`) is the Cloudinary
  transformations on the shell. **Characters** stays on the shell, demoted to the last
  navigation item. **Settings** (`/settings`) is reached from the account menu. Deleted with
  permanent redirects: `/dashboard`, `/generative`, `/conversation`, `/code`, `/documents`,
  `/image`, `/video`, `/music`, `/transformations/:type`, `/generative/settings`,
  `/characters/settings`. Credits stay as counts, shown as a quiet meter and as the cost on the
  send button. Routes, screens and data are in `docs/design/revamp.md` §3 to §12.
- **Rejected alternatives:** Keeping per-tool pages beside the Studio, rejected as the same
  capability behind two doors and the main source of the eleven-item sidebar. Folding Edit into
  the Studio, rejected because bringing your own photo is a different way in (Krea and
  Midjourney give it its own slot). Cutting Characters, rejected here as a product call the
  owner has not made; it is the first candidate if the story needs tightening. Weighted
  credits, rejected as a billing change beyond a design revamp. Keeping everything ephemeral,
  rejected because a studio with no library of what it made cannot read as a product.
- **Consequences:** Easier: one shell, one navigation, one message vocabulary shared by the
  Studio and Characters; the landing page can show real history; a guest sees the product's
  best run first. Harder: two new tables and a cleanup job for guest rows; the agent route and
  a new direct route must write assets reliably; eleven redirects to keep; a hard dependency
  on fal's asset URLs until they are mirrored (a follow-up, logged in TICKET-005).

## D-003 — The direction is dark and media-first; D-001 is withdrawn
- **Status:** Superseded by D-004
- **Date:** 2026-10-10
- **Context:** The owner saw the D-001 mockup (studio white, a serif voice, the "job sheet")
  and rejected it outright: the layout and the direction. Read back, the mockup was a
  document: a table of small grey text as the hero, media the size of thumbnails, a newspaper
  serif, and a light analytics-style chrome carried over from the owner's other product. For a
  tool whose entire output is images, video and sound, the media has to be the page. The owner
  also asked for the work to happen in the real app on a branch, not in static mockups.
- **Decision:** Dark and media-first. A near-black canvas (`#0A0A0B`) with raised surfaces a
  shade lighter and borders as white at low alpha; type in one grotesk, Host Grotesk, set large
  and tight for headlines and at 13 to 15 px for the UI; the primary button is white on black;
  no chromatic accent (the generated media is the colour; selected and live states are white);
  semantic colours only as a status. Media is rendered large, borderless, at 12 px radius, with
  a blur-to-sharp reveal. The landing opens on a full-viewport generated clip with a two-line
  headline and the real composer as the hero, then a wall of real outputs, then the Studio
  shown running. The app is a dark shell (sidebar and canvas), and a run renders as the prompt
  in a line, the plan as a compact collapsible strip, and the outputs at full column width.
  All design work happens in the app on the `revamp` branch and is judged from screenshots
  of the running site. D-001 is withdrawn; D-002 (the information architecture) stands.
- **Rejected alternatives:** Keeping light and making it media-first (Pika's cream with a
  large video window): possible, but the owner's reaction was to the whole direction and a
  dark stage is where images and video read best. A serif in any role: rejected with D-001.
  A chromatic accent: rejected so nothing competes with the media; it can be added later as
  one token if a state needs it.
- **Consequences:** Easier: the generated media does the work, and the app's own models make
  it; the chrome is simple; the hero is the product. Harder: the hero clips must be genuinely
  good and kept small; a dark UI needs careful contrast and no "zinc plus violet" tells; every
  surface and border must be tuned by eye in the real app, which is why the work moves there.

## D-004 — Wonder: one brief unfolding in an old forest at first light
- **Status:** Accepted
- **Date:** 2026-10-11
- **Context:** The owner called D-003's build "too generic, literally every image/video
  generation platform is like that". Three direction studies followed on the real site
  (TICKET-020): Multitrack, Print shop (rejected outright) and Rebus, then Unfold (the brief
  becomes the set, then the timeline), then Wonder in two worlds. The owner liked Unfold's idea
  but not its graphic, asked for "wonder ... nature and tech in between, like it gives u awe",
  turned down the castle-and-clouds version ("it shouldn't be castle or clouds like that"), and
  chose the forest version: "I like this".
- **Decision:** The landing opens on one pinned sequence: the brief writes itself over an old
  forest at first light; each noun opens a round-headed window onto what it became (poster,
  teaser, soundtrack, words); on scroll the windows gather into a triptych in low fog before a
  set of tree rings, then flatten into lanes on one timeline with a playhead. The page is
  moss-dark (`#0B1410`) with parchment type (`#F1ECDC`) and one accent, sunlight gold
  (`#E2B962`); the four media carry quiet natural tints (bark, water, light, fern) used only to
  tell them apart. Display type is Cormorant (a Garamond cut), the UI stays Host Grotesk. The
  generated media is nature with scale (forest, canyon water, valley, a lone tree), made with
  the app's own models. Motion is one orchestrated sequence plus ambient life (light shafts,
  motes, drifting fog), compositor-only, paused when unseen, and absent under reduced motion.
  The app follows in its own ticket. D-002 (the information architecture) stands.
- **Rejected alternatives:** D-003 as built (generic for the category). Print shop (the owner:
  "def not the print one"). Multitrack and Rebus on their own (liked, but not a wow). Unfold
  in its neutral dark graphic (right idea, wrong world). The castle above the clouds (too
  fantasy; the owner wanted nature).
- **Consequences:** Easier: the hero shows what only Aivia does (one line, several media, one
  timeline) in a world nobody else in the category uses; the serif and the forest give the
  brand a voice. Harder: the hero depends on large plates and a clip, so weight and frame time
  need a budget and a perf pass; a second display face to load; every surface in the app must
  be retuned to the moss palette and the medium tints kept from turning into a rainbow; the
  page's media must be regenerated in the same world when it changes.


## D-005 — A media platform: projects with Make and Cut, one set of item actions, a timeline and an image editor inside the project
- **Status:** Accepted
- **Date:** 2026-10-11
- **Context:** The app is still shaped like the chat it grew from: a brief goes in, media
  comes out in a thread, and everything after that is somewhere else (the Library grid, the
  `/edit` page, the Cut dialog that makes one fixed film). The owner asked for a media
  platform: "making everything that's there more cohesive and then add editing", not
  Photoshop or CapCut level. The research (`docs/design/research-media-platform.md`) found the
  products that work (LTX Studio, Descript, Runway, Kapwing, Krea, Canva) converge on a
  project that holds the making, the media and the assembled cut; results that land in a
  media bin and are placed on a timeline on purpose; a light timeline of a few fixed tracks
  with trim, split, reorder, one transition and export; image editing as a panel inside the
  product, not a page; and desktop-only editing, with phones getting something simpler. The
  owner decided: the unit is called **Projects**; the guest gets the editor, kept in the
  browser and claimed on sign-up; **Characters stays for now** and goes later.
- **Decision:** A **project** is today's `Session` renamed and widened: its briefs (the run
  thread), its media (every output, upload and edited version, as `Asset` rows) and its cuts
  (timelines). It has two views in its header, **Make** (the thread and composer, as now) and
  **Cut** (a player and a four-track timeline: text, picture for clips and stills, score,
  sound), with a **media tray** on the right in both, grouped by brief. Every item has **one
  set of actions** per kind, the same in the thread, the tray, the Library and the lightbox
  (image: Open, Edit, Animate, then Add to cut, Use in a brief, Reuse prompt, Download,
  Favourite, Delete; clip, audio and cut likewise). The **timeline** is one versioned JSON
  document per edit (`TimelineDoc`, integer milliseconds, media by reference) in a new `Edit`
  table; preview and export share one canvas compositor generalised from `cut-render.ts`,
  decoding with mediabunny and exporting in the browser; "Cut it together" becomes the
  starting cut you then edit. The **image editor** opens from Edit on any image, over the
  project's stage: crop (react-easy-crop), adjust (colour matrices, previewed with CSS and
  exported on canvas), text, and the existing Cloudinary AI tools, stored as a list of steps on
  the untouched source; saving makes a new version (`Asset.parentAssetId`). One generative verb
  on the timeline in v1: **New take**, which swaps a clip through the existing guard. Exports
  are kept in **Supabase Storage** by direct signed upload, replacing the 4 MB `/api/cuts`
  body. Phones get **Make, Media and Cut tabs**, with Cut as a vertical storyboard, not a
  timeline. Navigation: **Home** (`/studio`: the composer, then project cards), **Library**
  (the global bin, filterable by project), Characters; projects live at `/p/[id]` and
  `/p/[id]/cut`; `/studio/[id]` and `/edit` redirect. Screens and data are in
  `docs/design/revamp.md` §17. This replaces D-002's split of making, keeping and editing into
  the Studio, Library and Edit pages; D-002's composer modes, its redirects, Settings and
  credits stand, so D-002 stays Accepted.
- **Rejected alternatives:** Remotion for preview and export, rejected for its licence (the
  tier that covers an embedded player is a paid minimum), its size and per-render telemetry,
  and because it would duplicate the media stack Aivia already has. An off-the-shelf timeline
  component (@xzdarcy/react-timeline-editor, Twick, OpenVideo), rejected because none has
  source in-points and design-token styling, and Twick's licence bars hosted products. Konva,
  Fabric, Filerobot, Pintura and tldraw for the image editor, rejected as heavier than v1
  needs, or paid, or beta. An infinite canvas or node graph (Firefly Boards, Krea Nodes, Runway
  Workflows), rejected as a product of its own that reviews call overwhelming, when Aivia's
  agent already plans the steps. A full multi-layer editor and a timeline on phones, rejected
  by the evidence and the owner's scope. Server-side rendering, rejected for now: the browser
  path is free and covers about 95% of visitors. Keeping exports on fal storage, rejected
  because fal URLs can expire; Supabase is already a dependency. Several threads per project,
  rejected as a team-scale feature a solo user does not need.
- **Consequences:** Easier: one place per piece of work, so the app reads as one product; the
  most distinctive feature (Cut) becomes an editor instead of a dead end; what you preview is
  what you export; an image becomes a usable asset (a poster with its words) without leaving.
  Harder: a new `Edit` table and `Asset.parentAssetId`, a storage bucket and its policies, a
  claim path for guest edits, an in-house timeline UI (about a thousand lines) and compositor
  to maintain, desktop and phone versions of Cut, browser memory and decoder limits on long
  cuts (v1 caps at 60 s), mixed frame rates, fal URLs that may expire under saved timelines, and
  a landing page to rewrite around the project. Characters remains a second product inside the
  first until it is removed.
