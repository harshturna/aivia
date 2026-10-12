# TICKET-077: Short names, frames, and one vocabulary

**Status:** done
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** 2026-10-11
**Area:** ui

## Goal
Pieces read as names, not prompts; the timeline shows pictures; the same thing has the same name everywhere; the code keeps to the tokens.

## Context
- Found by the six-reviewer pass over TICKET-061..068 on 2026-10-11 (code: timeline, security,
  projects; use: desktop, phone; design). Reports and scripts in `.audit/review-*/` and
  `/private/tmp/claude-501/-Users-harsh-Documents-Personal-aivia/review-*/` (throwaway tests).
- The owner said to fix them as judged right (2026-10-11).
- Findings (design, desktop):
  - Every piece is labelled by its raw prompt, cut mid-word (timeline, storyboard, editor
    header, tray); the landing shows tidy names the app never does.
  - Timeline items and the phone trim bar are text bars with no frames.
  - One thing, several names: "film"/"cut"; "Save"/"Keep in project"/"In the project";
    "1 generation"/"Uses 1 generation"; "Use a frame in a brief" vs §17.3 "Use a frame as an
    image"; Shots/Words/Sound vs Picture/Text/Score/Sound; "Open the project" vs "Open project";
    menu order differs between kinds; music lacks Play as a primary.
  - Type sizes off the §2.2 scale (12.5, 13.5, 11.5, 17, 18 px); `rounded-sm` off-token; raw
    rgba and hex fallbacks in canvas code (`compositor.ts:25,75,87`, `render.ts:127`,
    `image-editor.tsx:100,843`).
  - Home shows audio as a grey tile; examples read "Updated 6 hours ago"; the tray never marks
    the piece being edited or pieces already in the cut.

## Plan
- [x] `shortName(prompt)` (one place, tested) used for every piece label.
- [x] Frames on Picture items (a poster per clip, drawn once) and in the trim bar.
- [x] One verb per action across the app, §17.3 names; sizes and radii on the scale; canvas
      colours from tokens.
- [x] Home audio tiles; examples without "Updated"; tray marks in-cut and editing pieces.
- [x] Files (read): new `lib/short-name.ts` (+ test); `components/timeline/{cut-view,timeline,
      storyboard,inspector,compositor}.tsx|ts`; `components/editor/{image-editor,render}.tsx|ts`;
      `components/media/{actions,tray}.tsx`; `components/studio/{outputs,project-grid}.tsx`;
      `components/library/lightbox.tsx`; `app/(landing)/_landing/studio-demo.tsx`;
      `docs/design/revamp.md` §17.3 (the table follows what is built: "Use a frame in a brief";
      a track's Play is its own player). Type: the scale is 15/13/12 (§2.2): 12.5→12, 13.5→13,
      11.5→12 in the files these tickets made.
- [x] Verify: `npm run verify`; `npx playwright test` alone; the reviewer's repro run again
      and passing; screenshots where a screen changes.

## Progress log
- 2026-10-11 — Written from the review.
- 2026-10-11 — Started; files read.
- 2026-10-11 — Built. `shortName` (the subject after a colon, the first clause, framing words
  like "Macro photograph of" dropped, stopping at a preposition or an -ing verb, four words) names
  pieces in Cut's timeline and storyboard, the editor's header and the tray's track rows; the full
  prompt stays the accessible name and the thread's caption. Picture items show a frame at their
  in-point; the phone's trim bar shows five frames across the source with the cut-away parts
  dimmed. Words: "cut" not "film" (the export's progress, the landing), "Save to the project" and
  "Saved to the project" in Cut's export as in the editor, "1 generation" everywhere, "Open
  project" (folder icon) in the lightbox, the timeline's rows Words / Picture / Score / Sound and
  the storyboard's sections the same, one action order for every kind. Type on 15/13/12 in these
  files; chip radius for the last `rounded-sm`; canvas shadows and scrims from `--color-bg` via
  `lib/color.ts` (`withAlpha`), no hex fallbacks. Home: a track's tile is a waveform in the sun
  colour (§2.2: the waveform), examples say "Example". The tray marks "In the cut" in Cut and
  "Editing" in the editor. §17.3's table follows what is built.

## Verification
- Units: `lib/short-name.test.ts` (10: the review's prompts named "Tall waterfall", "Colossal
  ancient tree", "Slow ambient strings", "Snowy owl", "Green and violet aurora", "Dawn chorus",
  "Single dew drop", "Giant whale"), `lib/color.test.ts` (2).
- In the browser (`.audit/t077/look.mjs`): timeline labels "Older than every map. | Tall waterfall
  | Colossal ancient tree | Slow ambient strings"; rows "Words | Picture | Score | Sound"; two
  "In the cut" marks in the tray; four "Example" cards on Home; the editor's header "Editing
  “Colossal ancient tree”" and one "Editing" mark; the storyboard's sections "Picture | Words |
  Score". Screenshots: `.audit/t077/cut-1440.png`, `trim-390.png`, `home-1440.png`.
- `npm run verify`: lint, typecheck, ticket check (79), 174 unit tests passed.
- `npx playwright test` (alone): 42 passed, 2 skipped (the New take test now finds "Second take").

## Outcome
Shipped: short names for pieces wherever a label is drawn; frames on the timeline and the trim
bar; one vocabulary (cut, save, 1 generation, Open project, the four rows, one action order);
the type scale and tokens kept in these files; Home's audio tiles and examples; the tray's marks.

Left out: nothing of the plan.
