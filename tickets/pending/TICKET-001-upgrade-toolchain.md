# TICKET-001: Upgrade toolchain to Next 16, React 19, Biome, Vitest

**Status:** pending
**Created:** 2026-10-10
**Started:** —
**Completed:** —
**Area:** infra

## Goal
Bring the framework and tooling to current versions before the revamp starts, so every later
ticket is written against the final APIs, `npm run verify` means something, and the repo works
the way `../lynq` does.

## Context
- Installed vs latest (2026-10-10): next 14.0.4 → 16.4.0, react 18.2.0 → 19.3.0, typescript
  5.3.3 → 7.0.2 (try; fall back to 5.9 if Next's plugin or the build objects), eslint 8 (EOL)
  → removed, `@supabase/auth-helpers-nextjs` 0.8 (deprecated) → `@supabase/ssr` 0.12.7,
  `@supabase/supabase-js` 2.39 → 2.117, prisma 5.7 → 6.19 (7 moves the datasource URL into a
  `prisma.config.ts` and is not worth it here), zustand 4 → 5, react-hook-form and
  `@hookform/resolvers` 3 → 5, lucide-react 0.298 → 1.x, next-cloudinary 5 → 6, every Radix
  package to its React 19 peer.
- Deliberately NOT upgraded here: tailwindcss 3 → 4 (`app/globals.css` is rewritten in the
  tokens ticket, so migrate once there, with `tailwindcss-animate` → `tw-animate-css` at the same
  time); zod 3 → 4 (the AI SDK accepts both; v4 changes nothing we need); stripe 14 → 23 (the
  SDK is pinned to API version 2023-10-16 and a bump changes the subscription shape the webhook
  reads; its own ticket if the plan ever matters).
- Next 16 removed `next lint`, so the linter changes anyway: Biome 2 for lint and format in
  one config, as in `../lynq/biome.json`. Vitest 5 with jsdom for unit tests, as in
  `../lynq/vitest.config.ts`.
- Known Next 16 / React 19 touch points, by file:
  - `lib/getUser.ts`: rewrite on `@supabase/ssr` (`createServerClient` with the cookies
    adapter for server components and route handlers, `createBrowserClient` for the client);
    `cookies()` is async.
  - `app/api/auth/guest/route.ts`, `app/api/auth/callback/route.ts`,
    `app/(auth)/(routes)/login/page.tsx`, `signup/page.tsx`, `components/LogoutButton.tsx`:
    swap the helper clients.
  - `middleware.ts` → `proxy.ts` with the export renamed; it refreshes the Supabase session.
  - Async `params`: `app/(characters)/characters/[charactersId]/page.tsx`,
    `characters/chat/[chatId]/page.tsx`, `app/(transformations)/transformations/[type]/page.tsx`,
    `app/api/chat/[chatId]/route.ts`, `app/api/characters/[characterId]/route.ts`.
    Async `searchParams`: `app/(characters)/characters/page.tsx`. Async `headers()`:
    `app/api/webhook/route.ts`.
  - `next.config.js`: `images.domains` is removed in 16, move `res.cloudinary.com` to
    `remotePatterns`; set `agentRules: false` so `next dev` leaves `CLAUDE.md` alone.
  - `lib/types/index.d.ts` declares `SearchParamProps` with sync params; update.
- `useChat` and the AI SDK are already on v7 and need nothing.
- Baseline before starting: `npx tsc --noEmit` clean, `next lint` one warning, `next build`
  not run.
- `scripts/shots.mjs` + `npm run shots`: Playwright (devDependency, chromium) signs in as the
  guest and writes full-page screenshots of every route at 1440 and 390 to `.shots/`
  (ignored). CLAUDE.md rule 6 depends on it. A port other than 3000 (which another project
  holds on this machine).
- `.env` is present locally and ignored. Build must not need new env vars.
- CI: `.github/workflows/verify.yml` runs `npm run verify` on push and pull request.
- Ruled out: pnpm or bun (npm lockfile stays; nothing here needs more); oxlint (needs a
  separate formatter).

## Plan
- [ ] Upgrade next, react, react-dom, types, typescript, prisma, @supabase/ssr and
      supabase-js, Radix, lucide, zustand, react-hook-form, resolvers, next-cloudinary; remove
      auth-helpers, eslint, eslint-config-next, `.eslintrc.json`.
- [ ] Rewrite `lib/getUser.ts` and the five Supabase call sites on `@supabase/ssr`;
      `middleware.ts` → `proxy.ts`.
- [ ] Async `params`, `searchParams`, `headers()` in the files listed above;
      `next.config.js` images and `agentRules`.
- [ ] Biome: `biome.json` from lynq's, `npm run lint` and `format`; fix errors, warn on the
      shadcn-generated rules the revamp replaces.
- [ ] Vitest 5 + jsdom + testing-library; `vitest.config.ts`; one real test
      (`groupTextParts` moved out of the Studio page into `lib/ai/parts.ts`).
- [ ] Playwright + `scripts/shots.mjs`; `npm run shots`.
- [ ] `verify` = lint, typecheck, check:tickets, test:unit. `npm run verify` and
      `npm run build` green; `next start` answers `/`, `/login`, `/dashboard` (307), the guest
      sign-in and `/studio` as the guest.
- [ ] `.github/workflows/verify.yml`.

## Progress log
- 2026-10-10 — Filed with the ticket system itself (CLAUDE.md, `tickets/`, the two skills,
  `scripts/check-tickets.mjs`).

## Handoff
Kept current while the ticket is in progress. Overwrite, do not append.
- **State:** not started
- **Blocked on:** nothing
- **Next:** start
- **Read first:** `lib/getUser.ts`, `middleware.ts`, `package.json`

## Verification
Filled in on completion. The command that was run, in a code block, and its result.

## Outcome
Filled in on completion: what shipped, what was deliberately left out, follow-up tickets created.
