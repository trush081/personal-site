@AGENTS.md

# personal-site

Source for trentonrush.com: Next.js 16 (App Router, TypeScript, SCSS) on Vercel, with Supabase for
content, auth, and the dashboard. See README.md for the full layout.

## Commands

```bash
npm ci
npm run lint        # eslint .
npm run typecheck   # tsc --noEmit
npm run build       # next build — works with no env vars (content falls back to src/data)
npm run dev         # needs .env.local (copy sample.env)
```

Run lint, typecheck, and build before every commit. CI (`.github/workflows/node.js.yml`) runs the
same three on Node 22 and 24. There is no test suite.

## Next.js 16 specifics

- Middleware is `src/proxy.ts` (exported `proxy`), not `middleware.ts`.
- Caching uses tags: `updateTag` / `revalidatePath` from `next/cache` after writes
  (see `src/lib/actions/content.ts`). Read `node_modules/next/dist/docs/` before using an API you
  are unsure of.

## Auth and security rules

- `src/proxy.ts` is only an optimistic redirect. Every dashboard page must call `requireRole()`, and
  every server action must call `getAuthState()` + `hasRole()` itself (`src/lib/auth.ts`). Server
  actions are public endpoints.
- Roles: `user` < `admin` (edits content) < `owner` (manages users, apps, groups).
- `SUPABASE_SECRET_KEY` bypasses RLS. Use it only via `src/lib/supabase/admin.ts` (marked
  `server-only`), never import that from a client component, never add a `NEXT_PUBLIC_` prefix.
- Never commit `.env*` files or real keys.

## Data

- Content lives in Supabase table `site_content`; `src/data/` is the fallback when Supabase is
  unreachable. If you change a content shape, update both and `src/lib/sections.ts`.
- Schema changes: add a new numbered file in `supabase/migrations/` (`0009_*.sql`, ...). Never edit
  an applied migration. Keep RLS enabled on new tables.
- `supabase/seed.sql` is generated: `node scripts/seed.mts`.
- Internal dashboard apps register in `src/apps/registry.tsx` by slug.

## Deploy

Vercel's Git integration deploys `main` to production and builds previews for every other branch
and PR. There is no deploy workflow in GitHub Actions; don't add one (it would double-deploy).
`main` is protected: work on a branch and open a PR.

## Style

- Path alias `@/*` → `src/*`. Arrow-function components, 2-space indent, single quotes, semicolons.
- Comments explain *why* (security assumptions, fallbacks), not what.
