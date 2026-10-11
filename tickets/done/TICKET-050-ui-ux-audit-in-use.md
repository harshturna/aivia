# TICKET-050: UI and UX audit of the app in use

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** quality

## Goal
Find every UI and UX problem a person would hit using the live product, before the owner does.
TICKET-049's two issues (a 200 px gap under a long thread, a redundant sign-up card) reached the
live site because earlier audits (TICKET-042 to 046) read code and screenshotted fresh screens;
nobody used the app with real content. This audit does: real threads, generated media, the
state after an action, scrolled, at desktop and phone widths. Findings only; fixes are
follow-up tickets.

## Context
- Running app: `next dev` on port 3005, guest sign-in `POST /api/auth/guest`. The guest has
  four pinned example sessions with real media (images, video, music, sound); local guest
  sessions can be seeded in `localStorage` (`aivia:guest-sessions`, see `lib/claim.ts`).
- No money is spent: generation routes (`/api/agent`, `/api/generate`, `/api/chat/*`, Edit
  transforms) are stubbed with Playwright `page.route` where a flow needs them.
- No signed-in (non-guest) account exists locally, and creating one on the real Supabase
  project is out of scope; signed-in-only screens are reviewed from code and the guest view.
- The design: `docs/design/revamp.md`; the rules in `CLAUDE.md` (Design section).
- Areas, one reviewer each, in parallel: Studio; Library, lightbox, Edit and Cut; shell,
  navigation, Characters, Settings, auth, palette and dialogs; landing page.

## Plan
- [x] Four opus reviewers, one area each, Playwright against the running app, findings with
      screenshots and a severity.
- [x] Verify each finding myself against a screenshot or the code; drop what does not hold.
- [x] Record the confirmed list here, grouped into fix tickets; report to the owner.

## Findings
Four reviewers (Studio; Library, Edit, Cut; shell, palette, Characters, Settings, auth; landing)
drove the app in Playwright as the guest at 1440x900, 1440x600, 1024, 390x844 and 360, with
seeded long threads and every paid route stubbed. Screenshots are local only, in `.audit/`
(gitignored). [v] = I confirmed it myself against a screenshot or the code; the rest are the
reviewer's, each with its evidence path in their report.

### Why the earlier audits missed these
TICKET-042 to 046 read code and `npm run shots` captures each screen once, fresh, at 1440 and
390. Nothing exercised long content, a short window, phone-width dialogs, or the state after an
action. Fix in TICKET-056.

### A. Studio runs (TICKET-051)
- [v] High: a text-only answer with a numbered list is read as the plan and folded into
  "3 steps, done", hiding the answer (`lib/ai/plan.ts` flush: no tools means the first list is
  the plan, even when the run has finished).
- [v] High: Retry on one failed piece calls `regenerate()` and re-runs the whole brief,
  discarding the pieces that worked and charging again (`studio-client.tsx` retry).
- [v] High: raw service errors in the failure card ("fal: Request failed with status 422…",
  request ids), and the system prompt makes the agent repeat them (`outputs.tsx` Failed).
- High: Download on audio navigates the tab to the file; on images it only opens a new tab
  (cross-origin `download` is ignored) (`audio-row.tsx`, `outputs.tsx`).
- High: when an image lands the box goes 560 → 24 → 958 px and the follow-scroll stops, so the
  running clip is off screen (skeleton 420 px wide vs result 560; no aspect on the img).
- Medium: the user's own Stop is shown as a red failure ("not everything worked").
- Medium: one error copy for every failure: a 500 before start says "stopped before it
  finished", a 401 offers a Retry that will fail, a 413 resends the same brief after the
  composer was cleared.
- Medium: a saved session opens scrolled to the bottom (follow-scroll runs on mount).
- Medium: server-rendered images stay `opacity-0 blur` until hydration (`reveal-image.tsx`).
- Medium: at the limit the textarea stays active; only Send is disabled, with no reason there.
- Medium: Esc stops a run only from inside the textarea (design §4: global).
- Medium: on touch, Animate is always visible on every image; one tap spends a paid clip.

### B. Studio layout and controls (TICKET-052)
- High: the mode menu opens off-screen in short windows (1440x600) and is not
  keyboard-operable (role=menu, no arrow keys, no current-mode mark) (`composer.tsx`).
- Medium: the composer's fade catches clicks on content behind it (needs pointer-events-none).
- Medium: example chips repeat two pinned examples and ignore the mode (rain sound in Image).
- Medium: adding to an example forks it under the example's title, so it shows twice in the
  sidebar; guests cannot rename or delete their own local sessions.
- Medium: titles cut mid-word at 57 characters (`lib/session-text.ts`).
- Medium: phone audio rows show no progress (waveform hidden below sm, nothing replaces it).
- Medium: the brief and the answer are both 15 px; design says the brief is 14 px. Notes use
  28 px leading from Markdown's `p`, not the run's 24.
- Medium: the empty state re-centres as the composer grows.
- Medium: step status icons sit ~700 px from their text at 1440.
- Medium: video has only native controls and no download; tall images have no height cap.
- Low: see-through header with an always-on border; chips wrap to two-line pills on phone;
  param menu labels differ from their pills ("1–4" vs "4 images"); Video hint wraps one word;
  "Cut it together" on a run with one clip; no time on the brief (§5.3); empty heading size
  differs from §5.1; image buttons share one accessible name; attachment thumbnails break in dev.

### C. Library, Edit, Cut (TICKET-053)
- [v] High: library search remounts the page on each pause (the page key includes `q`), so
  later keystrokes and focus are lost (`library/page.tsx` key, `library-client.tsx`).
- [v] High: applying the same Edit twice spends again and sticks on "Working…" forever (same
  URL, no new onLoad) (`components/edit/workspace.tsx`).
- [v] High: the audio lightbox at 390 is clipped (modal) and scrolls sideways (page): the
  mobile grid has no explicit column (`components/library/lightbox.tsx`).
- High: Edit shows a blank column while working (the skeleton sits in a 0-height box).
- High: audio titles squeeze to "A." at 1024 (fixed 140 px waveform in the 2-column grid).
- Medium: Edit's Apply and fields sit below a full-width portrait source; switching tools
  throws away a paid result; the before/after slider has no visible handle or focus; the limit
  message has no link, ignores who the user is, and treats every failure as the limit; the
  upload box looks droppable but has no drop handler; the phone empty state has a 550 px empty
  result box.
- Medium: /library/a/[id] overflows the viewport, has no screen header, Esc does nothing; the
  lightbox has no previous/next; opening it waits for the server with no feedback; the audio
  lightbox is a small row in a big empty canvas with two Download buttons.
- Medium: masonry orders tiles down columns and ends ragged; audio rows stop short of the grid
  edge with the open icon in the gutter.
- Medium: the Cut dialog repeats the guest note; closing it discards a finished cut.
- Low: Cut dialog jumps between states and has no Cancel; tagline cut at 390; the lightbox
  changes the tab title; generic 404 for a missing asset; durations in three formats ("0:75"
  past a minute); four control heights in Edit; duplicate accessible names; failed edits are
  not refunded; the library loads behind the Studio skeleton.

### D. Shell, palette, dialogs, Characters, Settings, auth (TICKET-054)
- [v] High: in windows shorter than ~660 px the sidebar recents run over the guest note and the
  account button, desktop and phone sheet (`sidebar.tsx`, `recents.tsx`: no scroll region).
- [v] High: the palette grows to a long "Made" prompt: Esc keycap pushed out at 1440, the panel
  off the right edge at 390 (`dialog.tsx` grid, palette root lacks min-w-0).
- High: character chat limits: a free user's 403 shows "The reply did not arrive. Try again"
  forever; the 429 tells signed-in users to create an account, with no link.
- High: the sign-up nudge repeated: sidebar note on every screen, plus a Characters header
  link, a Settings button, a card on /characters/new (three on one screen), the Cut dialog
  line; guest identity stated three times in the account button and menu.
- Medium: chat text shows through the character composer; that composer has an empty second
  row; the Characters header breaks at 360; dialogs touch both phone edges (no gutter); the
  palette has no close on touch and does not search a guest's local sessions; the phone sheet
  keeps the 232 px desktop width; Studio and the open session are both highlighted.
- Medium: chip focus ring clipped; a guest's chat is discarded on leave with no word; the only
  error boundary is at the root (loses the shell; claims "it has been logged"); loading
  skeletons are Studio-shaped everywhere and the auth loader is a bare spinner; a signed-in
  guest on /login is offered "Try it as a guest"; a failed guest sign-in is silent; auth errors
  are raw Supabase text and don't clear on typing; 404 sends logged-out visitors to /login;
  the guest Plan card is a dead end; the account menu lacks "Keyboard shortcuts" (§4).
- Low: seeded categories in title case; empty Characters search has no clear action; palette
  hint and kind labels inconsistent; two scrim styles; "you@example.com…" placeholder; cramped
  skip link; character name above every reply; chip row hard-clipped at 1024; ⌘ shown on
  Windows.

### E. Landing (TICKET-055)
- [v] High: the Studio frame overflows at phone width (508 px run column in a 342 px frame):
  outputs, text and the send button cut off (`studio-demo.tsx` grid has no base column).
- [v] High: Pricing says "Five generations in every mode"; it is one pool of five, and
  visitors land on the shared guest account anyway (`sections.tsx`, `lib/usage.ts`).
- [v] High: with reduced motion the hero has no headline (progress pinned at 0.47, where the
  sentence's opacity is 0) (`hero.tsx`).
- [v] Medium: the frame's plan says "Generate a 10 s clip"; clips are 5 s. The example sessions
  in the database also say "ten seconds" (`lib/guest-examples.json` already says five; the seed
  was not re-run). The database is the live one.
- Medium: the same poster, clip, track and brief repeat in hero, wall, frame and modes; a
  380 px dead band after the hero; Pricing is a 133 px block with no price before a second
  closer; three left edges (100, 112, 152 px at 1440); the landing composer's send only
  prefills the Studio; a failed guest sign-in drops a visitor on "Welcome back"; footer
  Studio/Library/Edit send logged-out visitors to sign-in; the frame says "Running" forever and
  shows "34 of 100 generations / harsh / Free plan"; the hero has no plain line or CTA for 3.8
  screens; the landscape-phone hero overlaps; the sound control is a 32 px unlabeled icon
  skipped by Tab from the top; mid-scroll the windows pile over the fading sentence.
- Low: skeleton caption shown twice; wall captions hover-only (lede promises them); wall tiles
  load blank; "nothing stitched together afterwards" contradicts Cut; three names for the four
  media; three versions of the brief; 6–7 px chip text at 390; no Pricing or Sign in in the
  phone nav; landing mode menu offers attach; frame end hides the plan; hero animates
  width/height (CLS 0.07); page height shrinks while scrolling; hand-off skeleton promises a
  run; §5.1 guest arrival differs from the build; Download icons on landing audio; two raw
  colours (`themeColor`, a shadow rgb).

### F. Owner decisions surfaced
- Pro says "Unlimited generations in every mode" but `HARD_LIMIT_COUNTS = 100` a day applies to
  every account (`ProModal.tsx`, `lib/usage.ts`).
- What the landing should promise a visitor, given they share the guest account.
- Re-running the guest examples seed writes to the live database.

## Progress log
- 2026-10-11 — Ticket written and started; TICKET-049 (committed, not deployed) waits on this.
- 2026-10-11 — Four reports in (~135 findings). Confirmed the highs marked [v]; none failed
  verification. Grouped into five fix areas plus a process change; owner decisions listed.
- 2026-10-11 — Owner: start with the Studio. Fix tickets 051 to 055 and process ticket 056
  written; the §F decisions are still open and belong to 055 and the Pro copy.

## Handoff
- **State:** closed.
- **Blocked on:** nothing
- **Next:** TICKET-051.
- **Read first:** nothing

## Verification
```
4 opus reviewers, Playwright against next dev on :3005, guest, paid routes stubbed
  (no request reached /api/agent, /api/generate, /api/chat, Cloudinary or fal)
reports: Studio 36, landing 33, shell 31, Library/Edit/Cut 35 findings
my checks: the [v] items, against .audit/ screenshots or the code; none failed
npm run check:tickets   # passed
```

## Outcome
Shipped: the findings above, grouped into TICKET-051 (Studio runs), 052 (Studio layout), 053
(Library, Edit, Cut), 054 (shell, dialogs, auth), 055 (landing) and 056 (checks that would
have caught these). Open owner decisions are in §F. No code changed.
