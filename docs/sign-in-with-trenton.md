# Sign in with Trenton

Apps on **other Supabase projects** (or any app that supports OpenID Connect) can use this
site's accounts to sign people in, the same way "Sign in with Google" works. This site's
Supabase project acts as the identity provider (Supabase OAuth 2.1 server, currently in
beta), and its apps, groups, and access rules decide who may sign in.

## How a sign-in works

1. Someone clicks "Sign in with Trenton" in the other app.
2. Supabase sends them to `https://www.trentonrush.com/oauth/consent` (signing in first if
   needed).
3. The consent page looks up which app is asking and checks access (visibility, direct
   grants, group grants). No access: they're turned away.
4. With access, they approve once (Supabase remembers it) and are sent back to the app,
   which creates its own session.

Access is checked at sign-in. Revoking access stops the next sign-in, including for people
who approved before, but doesn't end a session the other app already created.

## One-time setup on this project (Supabase dashboard)

1. **Authentication -> OAuth Server**: enable it and set the authorization path to
   `/oauth/consent`.
2. **Authentication -> URL Configuration**: Site URL is `https://www.trentonrush.com`.
3. **JWT Keys**: switch to asymmetric signing keys (RS256/ES256). ID tokens (the `openid`
   scope) require them.

## Adding an app

1. In the dashboard, **Manage -> Apps -> Add an app** with type **Sign in with Trenton**.
   - **App URL**: where people open the app.
   - **Callback URLs**: for another Supabase project, its callback URL,
     `https://<other-project-ref>.supabase.co/auth/v1/callback`.
2. Copy the **client ID and secret** shown after saving. The secret is only shown once (you
   can create a new one from the app's page).
3. Grant access (restricted apps) to people or groups.

## In the other Supabase project

1. **Authentication -> Providers -> New Provider -> Auto-discovery (OIDC)**:
   - Identifier: `custom:trenton`
   - Client ID / secret: from step 2 above
   - Issuer URL: `https://ijkpihtqxwdacbshsowz.supabase.co/auth/v1`
   - Scopes: `openid email profile`
2. In that app, sign in with:

   ```ts
   await supabase.auth.signInWithOAuth({ provider: 'custom:trenton' });
   ```

The other project creates its own user the first time someone signs in this way (matched by
email), and keeps its own data and row-level security.
