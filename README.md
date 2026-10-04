# Personal Website

Source for [trentonrush.com](https://www.trentonrush.com).

Built with [Next.js](https://nextjs.org/) (App Router, TypeScript) and SCSS, and hosted on [Vercel](https://vercel.com/).

## Project layout

```
src/
  app/          # routes (one folder per page), root layout, sitemap and robots
  components/   # React components
  data/         # site content - edit these to update the site
  lib/          # shared hooks
  static/css/   # SCSS styles
public/         # images, favicons, and other static files
```

Most updates only touch `src/data/`: `about.md` for the About page, `resume/` for the resume, `projects.ts`, `contact.ts`, and `stats/`.

## Development

Requires [node](https://nodejs.org/) >= 22; 24 is recommended (`nvm use` picks up `.nvmrc`).

```bash
npm install
npm run dev       # http://localhost:3000
npm run lint
npm run typecheck
npm run build
```

To enable Google Analytics, copy `sample.env` to `.env.local` and set `NEXT_PUBLIC_GA_ID`. In production, set it as an environment variable in the Vercel project.

## Shared sign-in

Your own projects on `trentonrush.com` subdomains can use this site's accounts and access rules. See [docs/shared-sign-in.md](./docs/shared-sign-in.md).

Apps on other Supabase projects can use these accounts as a login provider ("Sign in with Trenton"). See [docs/sign-in-with-trenton.md](./docs/sign-in-with-trenton.md).

## Deploying

Vercel deploys `main` automatically on every push, and builds a preview deployment for every other branch and pull request.

## Acknowledgements

* Originally based on [personal-site](https://github.com/mldangelo/personal-site) by [@mldangelo](https://github.com/mldangelo) ([MIT](./LICENSE)).
* Design based on [Future Imperfect](https://html5up.net/future-imperfect) by [@ajlkn](https://github.com/ajlkn) for [HTML5 UP](https://html5up.net) ([CCA 3.0](https://html5up.net/license)).
