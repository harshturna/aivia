# Aivia

An AI creative studio. One prompt in the Studio and an agent plans the work and calls the
tools: images, video, music and sound effects (fal.ai), web search, and Claude for text and
code. Beside it: chat, code, document Q&A, characters to talk to, and image transformations
(Cloudinary). Next.js app, Supabase auth, Prisma on Postgres, Stripe for the Pro plan, a shared
guest account for the public demo. Live at https://aivia.byharsh.com.

## Start here

1. `ls tickets/in_progress` — an open ticket's Handoff section is the current state of the project.
2. Read `tickets/DECISIONS.md` for choices already made. Do not reopen them without a new decision.
3. Inspect the filesystem before trusting anything written in a ticket or in chat.

## Task tickets

All work is tracked as markdown tickets in `tickets/`. One file per task. This is the source of
truth for what is being worked on and why, so it must always match reality.

### Layout

- `tickets/_template.md` — copy this to start a ticket. Do not edit the template itself.
- `tickets/pending/` — written but not started. Status `pending` or `blocked`.
- `tickets/in_progress/` — being worked on. Status `in-progress` or `blocked`.
- `tickets/done/` — finished. Status `done`.
- `tickets/DECISIONS.md` — append-only record of expensive-to-reverse choices, `D-NNN`.

A ticket moves between directories as its status changes. Numbering is sequential across all three
directories; take the highest existing `TICKET-NNN` and add one. Never reuse a number.

### Rules

1. **Every task gets a ticket before any code changes.** Use the `ticket` skill (`new`, `start`,
   `handoff`, `close`). Small tasks still get a ticket; keep it short.
2. **Plan before any code changes.** A ticket is started only once its Plan is complete: every
   file it will touch has been read and is listed in Context, the steps are concrete, the
   verification command is named, and anything ruled out is written down. If the scope is unclear,
   resolve it in the ticket first, not in the editor.
3. **Starting a ticket: bring it fully up to date.** Move it to `in_progress/`, set the started
   date, and add to Context anything now known that was not written down. Someone with no chat
   history must be able to pick the ticket up from the file alone.
4. **The Handoff section of an in-progress ticket is the project handoff.** There is no separate
   handoff file. Overwrite it, do not append to it, whenever a turn that touched code ends with the
   ticket still open. It answers: what is built, what is blocked, what is next, what to read first.
5. **While working, keep the Progress log current.** Add a dated entry whenever the plan changes,
   a decision is made, a blocker appears, or a chunk of work lands. Tick plan items as they finish.
6. **Closing a ticket: verification is evidence, not a claim.** Verification names the command that
   was actually run and its result. Outcome says what shipped, what was left out, and which
   follow-up tickets were created. Then set `done`, move to `done/`, and run `npm run verify`.
   A ticket that changes what a screen looks like also records a screenshot review at 1440 and
   390 (`npm run shots` writes them to `.shots/`). A ticket is not closed until the file has
   moved and the named checks pass.
7. **Commit when a ticket closes, before the next one starts.** One ticket, one commit (or a
   few, each naming `TICKET-NNN` in the subject). Never begin a ticket with uncommitted changes
   from another. The commit includes the moved ticket file.
8. **Follow-up work found mid-ticket becomes a new ticket in `pending/`,** not an expansion of the
   current one. Link the two in each other's Context.
9. **A feature ticket plans its landing page change.** The Plan of any ticket that adds, removes
   or renames what a user can do lists the landing sections it touches, and the ticket does not
   close until they are updated; the landing page features what is real, nothing "coming soon".
10. **Expensive-to-reverse choices go in `tickets/DECISIONS.md`** via the `decide` skill, and the
    ticket cites the `D-NNN`. Routine choices stay in the progress log.
11. **Ticket state must match reality at the end of every turn that touched code.**

`npm run check:tickets` enforces the structure: filenames, status per directory, dates, required
sections, Handoff on in-progress tickets, Verification and Outcome on done tickets, decision ids.

## Engineering rules

- Run `npm run verify` (lint, typecheck, ticket check, unit tests) before committing, not after.
  It needs no services. The app itself needs `.env` (Supabase, Postgres, Anthropic, fal, Stripe,
  Cloudinary, the guest account); `.env` is ignored and never committed.
- Filesystem and test evidence over claims in prose. If a ticket says something is implemented,
  the path it cites must exist.
- Design tokens live in `app/globals.css` and nowhere else. No raw hex, no Tailwind palette
  colours (`slate-*`, `pink-*`, `gray-*`) in components; `docs/design/` is the reference for
  what the tokens mean and how screens compose.
- Copy on the landing page sells features. No disclaimers, no infrastructure words (model
  names, vendor names, "serverless"), no "coming soon".
- Unreachable code is deleted, not carried. Git is the archive.
- Keep changes focused. Preserve unrelated work in a dirty tree.
- Unit tests live next to the code as `*.test.ts(x)`. Add tests with the code they cover.

## Design

- `docs/design/revamp.md` is the design: tokens, type, the shell, every screen, states, motion,
  and the ticket sequence. `docs/design/research-*.md` is the evidence behind it. Read the
  relevant section before a UI ticket; change the doc in the ticket that changes the design.
- Load the `frontend-design` skill before designing or reshaping any UI, and run the
  `web-design-guidelines` skill over the files a UI ticket touched before closing it.
- Copy is sentence case everywhere (headings, buttons, labels). Buttons say what happens
  ("Save changes", not "Submit"). No tracked uppercase eyebrows, no middle-dot meta strings,
  no "→" appended to links, no accenting one word of a headline.
- One accent colour. Semantic colours (good, warn, poor) never stand in for it. Generated
  media supplies the colour; the chrome stays neutral.

## Costs

Every generation spends real money on a shared guest account. `constants.ts` holds the caps
(`MAX_FREE_COUNTS` per user, `HARD_LIMIT_COUNTS` global); `lib/ai/capabilities.ts` documents the
price of each model. A ticket that adds a generation path goes through `lib/ai/guard.ts`, and a
ticket that changes a model records its price per call in that file.

## Deploys

Vercel, from the GitHub remote. A push to `main` is a deploy unless the project has been set to
manual; check before assuming either. A ticket's Verification says "pushed" or "deployed" as
appropriate, never one for the other.

## Subagents

- **Only ever spawn `opus` agents. Never `fable`.** Pass `model: "opus"` explicitly on every
  Agent call; never rely on the default.
- **A subagent may never spawn its own subagents.** Every brief must say so explicitly, in these
  words: "Do not spawn subagents or use the Agent tool; do this work yourself."
- Independent work (review passes, parallel research) runs as parallel agents launched in one
  turn; sequential only when one depends on another's output. Moderate work stays inline.

## Project references

- The sibling project `../lynq` is the model for this repo's process (tickets, decisions,
  verify) and for the standard of finish. Its design is not this project's design.
- The revamp roadmap and visual direction: `docs/design/` and `D-001` onward in
  `tickets/DECISIONS.md`.
