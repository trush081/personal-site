import type { SupabaseClient } from '@supabase/supabase-js';

// Authorization IDs come from the URL; only accept the expected shape.
export const isAuthorizationId = (value: unknown): value is string => (
  typeof value === 'string' && /^[A-Za-z0-9_-]{8,200}$/.test(value)
);

// The callback URL without its query string (code/state), for matching registrations.
export const baseUrl = (url: string) => {
  try {
    const u = new URL(url);
    return `${u.origin}${u.pathname}`;
  } catch {
    return '';
  }
};

export interface OAuthAccess {
  appName: string | null; // null: not a registered "Sign in with Trenton" app
  allowed: boolean;
}

// Which registered app is asking, and may the signed-in user open it? Looked up by
// client ID first, then by callback URL. Unknown apps are never allowed.
export const checkOAuthAccess = async (
  supabase: SupabaseClient,
  { clientId, redirectUri }: { clientId?: string; redirectUri?: string },
): Promise<OAuthAccess> => {
  const lookups = [
    clientId ? { p_client_id: clientId, p_redirect_uri: null } : null,
    redirectUri ? { p_client_id: null, p_redirect_uri: baseUrl(redirectUri) } : null,
  ].filter(Boolean);

  for (const params of lookups) {
    const { data } = await supabase.rpc('oauth_app_access', params);
    const row = Array.isArray(data) ? data[0] : null;
    if (row) return { appName: row.app_name, allowed: row.allowed === true };
  }
  return { appName: null, allowed: false };
};

const SCOPE_LABELS: Record<string, string> = {
  openid: 'Confirm who you are',
  email: 'Your email address',
  profile: 'Your name and profile picture',
  phone: 'Your phone number',
};

export const describeScopes = (scope: string) => scope
  .split(' ')
  .filter(Boolean)
  .map((s) => SCOPE_LABELS[s] ?? s);
