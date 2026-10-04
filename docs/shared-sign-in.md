# Shared sign-in for your own projects

Projects on a `trentonrush.com` subdomain (for example `granite.trentonrush.com`) can use
this site's accounts and access rules. People sign in once at
`https://www.trentonrush.com/login`, and every subdomain project sees them as signed in.

## How it works

1. This site sets the login cookie on `.trentonrush.com` (`NEXT_PUBLIC_AUTH_COOKIE_DOMAIN`),
   so every subdomain receives it.
2. Your project uses the **same Supabase project** (URL and publishable key), so it can read
   that cookie and knows who the person is.
3. It asks the database whether they may open it:
   `supabase.rpc('has_app_access', { app_slug: '<slug>' })`. That uses the same rules as the
   dashboard (visibility, direct grants, group grants, admins/owners).
4. If they aren't signed in, it sends them to
   `https://www.trentonrush.com/login?next=<the page they wanted>`, and they come back after
   signing in. The login page only redirects to `https://` URLs on `trentonrush.com`.

## Setting up a project

1. In the dashboard, go to **Manage -> Apps** and add the project with type
   **Shared sign-in**, its URL, and a slug (e.g. `granite`). Grant access as needed.
2. In the project, install the Supabase packages:

   ```bash
   npm install @supabase/supabase-js @supabase/ssr
   ```

3. Set these environment variables (the same values as this site):

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://ijkpihtqxwdacbshsowz.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   NEXT_PUBLIC_AUTH_COOKIE_DOMAIN=.trentonrush.com
   APP_SLUG=granite
   ```

4. Add a proxy that checks every request (Next.js 16 uses `proxy.ts`; older versions call it
   `middleware.ts` and export `middleware`):

   ```ts
   // src/proxy.ts
   import { NextResponse, type NextRequest } from 'next/server';
   import { createServerClient } from '@supabase/ssr';

   const LOGIN_URL = 'https://www.trentonrush.com/login';

   export const proxy = async (request: NextRequest) => {
     let response = NextResponse.next({ request });

     const supabase = createServerClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
       {
         cookieOptions: {
           domain: process.env.NEXT_PUBLIC_AUTH_COOKIE_DOMAIN,
           secure: true,
           sameSite: 'lax',
           path: '/',
         },
         cookies: {
           getAll: () => request.cookies.getAll(),
           setAll: (toSet) => {
             toSet.forEach(({ name, value }) => request.cookies.set(name, value));
             response = NextResponse.next({ request });
             toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
           },
         },
       },
     );

     // getUser() verifies the session with Supabase (don't trust getSession() on the server).
     const { data: { user } } = await supabase.auth.getUser();
     if (!user) {
       const login = new URL(LOGIN_URL);
       login.searchParams.set('next', request.nextUrl.href);
       return NextResponse.redirect(login);
     }

     const { data: allowed } = await supabase.rpc('has_app_access', { app_slug: process.env.APP_SLUG });
     if (!allowed) {
       return new NextResponse('You do not have access to this app.', { status: 403 });
     }

     return response;
   };

   export const config = {
     // Run on every page except static assets.
     matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
   };
   ```

5. Anything that reads or writes this project's own data must be protected **in the
   database** too (row-level security on its tables), not only by the proxy. For example, a
   policy can call `public.has_app_access('granite')`.

## Things to keep in mind

- Only put code you control on `trentonrush.com` subdomains. Every subdomain receives the
  login cookie, so a third-party site on one could read it. Use the **External** app type
  for third-party tools instead.
- Remove DNS records for subdomains you stop using, so nobody else can claim them.
- Use the **publishable** key in projects. Never put the secret key in a project that
  doesn't need it, and never in a `NEXT_PUBLIC_` variable.
- Signing out on any project signs the person out everywhere.
