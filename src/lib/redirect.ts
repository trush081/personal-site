// Where the login page may send people afterwards: dashboard paths and the OAuth consent
// page on this site. Anything else falls back to the dashboard, so the login page can't
// be used to redirect people to other sites.
export const safeRedirect = (value: unknown): string => {
  const next = typeof value === 'string' ? value.trim() : '';
  if ((next.startsWith('/dashboard') || next.startsWith('/oauth/consent?')) && !next.startsWith('//')) return next;
  return '/dashboard';
};
