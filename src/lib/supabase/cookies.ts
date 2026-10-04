// Shared sign-in across subdomains.
//
// When NEXT_PUBLIC_AUTH_COOKIE_DOMAIN is set (e.g. ".trentonrush.com"), the login cookie
// is scoped to that domain, so signing in here also signs people in to projects on its
// subdomains that use this Supabase project. Leave it unset for localhost.
//
// Every subdomain can read this cookie, so only host code you control on them.
const cookieDomain = process.env.NEXT_PUBLIC_AUTH_COOKIE_DOMAIN || undefined;

export const authCookieOptions = cookieDomain
  ? { domain: cookieDomain, secure: true, sameSite: 'lax' as const, path: '/' }
  : undefined;

// e.g. "trentonrush.com"
const baseDomain = cookieDomain?.replace(/^\./, '').toLowerCase();

// Where the login page may send people afterwards: dashboard paths on this site, or
// https URLs on our own domain/subdomains. Anything else falls back to the dashboard,
// so the login page can't be used to redirect people to other sites.
export const safeRedirect = (value: unknown): string => {
  const next = typeof value === 'string' ? value.trim() : '';
  if (next.startsWith('/dashboard') && !next.startsWith('//')) return next;

  if (baseDomain) {
    try {
      const url = new URL(next);
      const host = url.hostname.toLowerCase();
      if (url.protocol === 'https:' && (host === baseDomain || host.endsWith(`.${baseDomain}`))) {
        return url.toString();
      }
    } catch {
      // not a URL
    }
  }
  return '/dashboard';
};
