import { cache } from 'react';
import { redirect } from 'next/navigation';

import createClient from '@/lib/supabase/server';

export type AuthState =
  | { status: 'signed-out' }
  | { status: 'user'; userId: string; email?: string }
  | { status: 'admin'; userId: string; email?: string };

// Verifies the session with Supabase (getUser validates the token) and looks up the role.
// Use this in every admin page and action; the proxy is only an optimistic redirect.
// Cached per request, so the layout and page can both call it without extra round-trips.
export const getAuthState = cache(async (): Promise<AuthState> => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { status: 'signed-out' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  return profile?.role === 'admin'
    ? { status: 'admin', userId: user.id, email: user.email }
    : { status: 'user', userId: user.id, email: user.email };
});

// For dashboard pages: sends signed-out visitors to the login page and users without
// the required role back to the dashboard home. Returns the signed-in user's state.
export const requireRole = async (role: 'user' | 'admin' = 'user') => {
  const auth = await getAuthState();
  if (auth.status === 'signed-out') redirect('/login');
  if (role === 'admin' && auth.status !== 'admin') redirect('/dashboard');
  return auth;
};
