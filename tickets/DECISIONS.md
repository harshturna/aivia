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
- **Status:** Accepted
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
