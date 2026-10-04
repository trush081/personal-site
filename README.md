# Personal Website

Source for [trentonrush.com](https://www.trentonrush.com).

Built with [Next.js](https://nextjs.org/) (App Router, TypeScript) and SCSS, and hosted on [Vercel](https://vercel.com/).

## Project layout

```
src/
  app/          # routes: public pages, /login, /dashboard (signed-in area), /oauth/consent
  apps/         # internal apps shown inside the dashboard (see registry.tsx)
  components/   # React components
  data/         # fallback content, used only if the database is unreachable
  lib/          # auth, content, apps, and server actions
  static/css/   # SCSS styles
public/         # images, favicons, and other static files
supabase/       # database migrations and seed data
docs/           # setup guides
```

## Content and accounts

Site content (About, resume, skills, projects, contact links, stats) lives in Supabase and is edited
at **/dashboard** by admins and owners. The files in `src/data/` are only a fallback if the database
can't be reached.

- **Roles:** `user` (own account), `admin` (also edits site content), `owner` (also manages users,
  apps, and groups).
- **Apps:** pages, sites, and projects people can open from their Overview, managed under
  **Manage -> Apps**. Visibility is public, members, or restricted to chosen people and groups.
- **Database:** schema changes are in `supabase/migrations/`, applied in order. `supabase/seed.sql`
  holds the initial content (regenerate with `node scripts/seed.mts`).

## Development

Requires [node](https://nodejs.org/) >= 22; 24 is recommended (`nvm use` picks up `.nvmrc`).

```bash
npm install
cp sample.env .env.local   # then fill in the values
npm run dev                # http://localhost:3000
npm run lint
npm run typecheck
npm run build
```

Environment variables (see `sample.env`):

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: safe to expose.
- `SUPABASE_SECRET_KEY`: **server only, never commit it or prefix it with `NEXT_PUBLIC_`.** Needed to
  add/delete users and to manage "Sign in with Trenton" apps. Mark it Sensitive in Vercel.
- `NEXT_PUBLIC_GA_ID`: optional Google Analytics 4 ID.

## Sign in with Trenton

Apps on other Supabase projects can use these accounts as a login provider ("Sign in with Trenton"). See [docs/sign-in-with-trenton.md](./docs/sign-in-with-trenton.md).

## Deploying

Vercel deploys `main` automatically on every push, and builds a preview deployment for every other branch and pull request.

## Acknowledgements

* Originally based on [personal-site](https://github.com/mldangelo/personal-site) by [@mldangelo](https://github.com/mldangelo) ([MIT](./LICENSE)).
* Design based on [Future Imperfect](https://html5up.net/future-imperfect) by [@ajlkn](https://github.com/ajlkn) for [HTML5 UP](https://html5up.net) ([CCA 3.0](https://html5up.net/license)).
