import { cache } from 'react';
import { redirect } from 'next/navigation';

import createClient from '@/lib/supabase/server';

export type Role = 'user' | 'admin' | 'owner';

export type AuthState =
  | { status: 'signed-out' }
  | { status: Role; userId: string; email?: string };

// Higher roles include everything lower roles can do.
const RANK: Record<Role, number> = { user: 1, admin: 2, owner: 3 };

export const hasRole = (auth: AuthState, role: Role) => (
  auth.status !== 'signed-out' && RANK[auth.status] >= RANK[role]
);

// Verifies the session with Supabase (getUser validates the token) and looks up the role.
// Use this in every dashboard page and action; the proxy is only an optimistic redirect.
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

  const role: Role = profile?.role === 'owner' || profile?.role === 'admin' ? profile.role : 'user';
  return { status: role, userId: user.id, email: user.email };
});

// For dashboard pages: sends signed-out visitors to the login page and users without
// the required role back to the dashboard home. Returns the signed-in user's state.
export const requireRole = async (role: Role = 'user') => {
  const auth = await getAuthState();
  if (auth.status === 'signed-out') redirect('/login');
  if (!hasRole(auth, role)) redirect('/dashboard');
  return auth;
};
