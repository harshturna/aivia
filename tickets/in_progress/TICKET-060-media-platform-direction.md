# TICKET-060: Media platform: research, decision and design

**Status:** in-progress
**Created:** 2026-10-11
**Started:** 2026-10-11
**Completed:** —
**Area:** feature

## Goal
Turn Aivia from a chat that generates things into a media platform: a project holds what was
asked for, what was made, and what was assembled or edited from it; editing (a light timeline,
basic image editing) sits inside it; every piece of media has the same actions everywhere. This
ticket produces the research, the decision (D-005) and the redesigned screens in
`docs/design/revamp.md`, and the build tickets. No product code.

## Context
- Owner, 2026-10-11 (chat): "we should do more media like platform, so making everything
  that's there more cohesive and then add editing and other functionalities"; not Photoshop or
  CapCut level. Calls made: the unit is called **Projects**; the guest gets the editor, kept in
  the browser and claimed on sign-up like guest sessions; **Characters stays for now**, to be
  removed later; the fixes 053 to 059 shipped first (pushed 78e2dd9, Railway success).
- Today (D-002, `docs/design/revamp.md` §3): Studio (a run thread per session), Library (grid +
  lightbox), Edit (Cloudinary one-click transforms), Cut (a fixed-template dialog at a run's
  end, `lib/cut.ts`, `components/studio/cut-render.ts`, rendered in the browser with
  mediabunny), Characters. Data: `Session` (messages JSON) and `Asset` (`prisma/schema.prisma`).
- D-005 will supersede the parts of D-002 that place making, keeping and editing on separate
  pages. D-003/D-004 (dark, media-first; the forest landing) stand.

## Plan
- [x] Research, two opus agents in parallel: (a) how media products (Runway, LTX Studio,
      Kapwing, CapCut web, Descript, Canva, Krea, Pika) structure projects, media, generation
      and timelines; (b) how to build a light browser timeline and image editor on this stack
      (libraries, data model, rendering with mediabunny, licences). Written to
      `docs/design/research-media-platform.md`.
- [x] D-005 via the decide skill.
- [x] `docs/design/revamp.md`: the product map, the project screen, the media tray, the
      timeline, the image editor, the library as a bin, item actions, data, states, the landing.
- [x] Build tickets in `pending/`, in order, each with its landing change.
- [ ] Verify: `npm run check:tickets`; the owner approves the design before any build ticket
      starts.

## Progress log
- 2026-10-11 — Ticket written and started; research agents launched.
- 2026-10-11 — Research in (products and engineering, `research-media-platform.md`). D-005
  written; the design is `revamp.md` §17; build tickets 061 to 068 in `pending/`. Calls made in
  D-005 for the owner to confirm: exports kept in Supabase Storage; Home stays at `/studio`,
  projects at `/p/[id]`; Cut on phones is a storyboard; v1 export 720p, 60 s.

## Handoff
- **State:** research, D-005, §17 and tickets 061 to 068 written. Waiting for the owner to
  approve the design.
- **Blocked on:** the owner's approval of §17.
- **Next:** on approval, close this ticket and start TICKET-061.
- **Read first:** `docs/design/revamp.md` §17, D-005.

## Verification

## Outcome
