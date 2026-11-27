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
npm test            # vitest: src/**/*.test.ts
npm run dev         # needs .env.local (copy sample.env)
npm run check       # lint + typecheck + test + build, in that order
```

Run `npm run check` (lint, typecheck, `npm test`, build) before every commit. CI (`.github/workflows/node.js.yml`)
runs those on Node 22 and 24, plus a Playwright smoke job.

## Tests

- Unit tests sit next to the code (`src/lib/*.test.ts`). Mock `@/lib/supabase/*` and `next/cache`;
  tests never hit a real database.
- `src/lib/actions/authorization.test.ts` calls every exported action in `manage.ts`, `users.ts`
  and `content.ts` as a too-low role and expects `{ ok: false, error: 'Not authorized.' }` before
  any Supabase client is created. New actions in those files are covered automatically; a new
  actions file needs adding to its `modules` map.
- E2E smoke tests (`e2e/`) run against a production build with Supabase pointed at a closed port:

  ```bash
  export NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_e2e
  npm run build
  PW_CHROMIUM_PATH=/opt/pw-browsers/chromium npm run test:e2e   # cloud sessions; omit locally
  ```

  Cloud sessions have a preinstalled Chromium that doesn't match the pinned Playwright, hence
  `PW_CHROMIUM_PATH`. Don't run `playwright install` there.

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
  unreachable. Editing `src/data/` does not change the live site; content edits go through the
  dashboard. Nothing copies dashboard edits back into `src/data/`, so the fallback can lag.
  If you change a content shape, update both and `src/lib/sections.ts`.
- Schema changes: add a new numbered file in `supabase/migrations/` (`0009_*.sql`, ...). Never edit
  an applied migration. Keep RLS enabled on new tables.
- `supabase/seed.sql` is generated: `node scripts/seed.mts`.
- Internal dashboard apps register in `src/apps/registry.tsx` by slug.
- The Supabase MCP server (`.mcp.json`) points at the **production** project with write access.
  The owner wants Claude to apply changes, within these rules:
  - **Schema changes only via `apply_migration`, and only from a migration file in this repo**
    (`supabase/migrations/00NN_*.sql`, same name). Write the file first, so the repo always
    matches the database. Never run DDL through `execute_sql`.
  - Apply a migration only after its PR's CI is green and the owner has said to apply it, or the
    owner explicitly asked for that change in the session. Before applying, run the new SQL's
    logic read-only against real data where possible.
  - After applying: check with `list_migrations` and run `get_advisors` (security), and report the
    result.
  - **Ask first** before anything destructive or hard to undo: `drop`, `truncate`, `delete`/`update`
    without a narrow `where`, removing RLS or policies, changing roles or grants, or touching
    `auth.*` tables. Data fixes (DML) go through `execute_sql` and must be stated before running.
  - Supabase records applied migrations by timestamp, not by the `0001_` file names.

## Deploy

Vercel's Git integration deploys `main` to production and builds previews for every other branch
and PR. There is no deploy workflow in GitHub Actions; don't add one (it would double-deploy).
`main` is protected: work on a branch and open a PR.

### Checking deploys (Vercel MCP connector)

- Scope: team `trush081s-projects` (`team_AefRyb16iKPs1jA1pRYZDGN4`), project `personal-site`
  (`prj_jIv2BbnxA9eMEv3LAcEIgVPmyyVh`). Pass `teamId` explicitly; `list_teams` returns nothing for
  this Hobby account. A 403 "not authorized for scope" means call `authorize_team_access` and give
  the owner the link.
- After pushing a branch: `list_deployments` with `branch`, wait for `READY`, then load pages with
  `web_fetch_vercel_url` (it gets past preview protection). If the state is `ERROR`, read the build
  logs before changing code.
- After a merge to `main`: confirm the production deploy is `READY` and check `get_runtime_errors`.
- Read-only by default: don't change env vars, domains, or promote/roll back without the owner
  asking.

## Style

- Path alias `@/*` → `src/*`. Arrow-function components, 2-space indent, single quotes, semicolons.
- Comments explain *why* (security assumptions, fallbacks), not what.
