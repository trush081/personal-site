import createClient from '@/lib/supabase/server';

export type AuthState =
  | { status: 'signed-out' }
  | { status: 'user'; userId: string; email?: string }
  | { status: 'admin'; userId: string; email?: string };

// Verifies the session with Supabase (getUser validates the token) and looks up the role.
// Use this in every admin page and action; the proxy is only an optimistic redirect.
export const getAuthState = async (): Promise<AuthState> => {
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
};
