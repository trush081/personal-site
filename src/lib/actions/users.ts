'use server';

import { revalidatePath } from 'next/cache';

import { getAuthState } from '@/lib/auth';
import createAdminClient, { isAdminApiConfigured } from '@/lib/supabase/admin';
import createClient from '@/lib/supabase/server';
import type { ActionResult } from './auth';

const USERS_PATH = '/dashboard/manage/users';
const MIN_PASSWORD = 10;
const ASSIGNABLE = ['user', 'admin'] as const;
type AssignableRole = typeof ASSIGNABLE[number];

const isAssignable = (role: string): role is AssignableRole => (ASSIGNABLE as readonly string[]).includes(role);

// Every action re-verifies the caller: server actions are public endpoints.
const requireOwner = async () => {
  const auth = await getAuthState();
  return auth.status === 'owner' ? auth : null;
};

// Role changes run as the signed-in owner through set_user_role(), which enforces the
// rules in the database (no self-changes, no changing owners, no promoting to owner).
export const setUserRole = async (userId: string, role: string): Promise<ActionResult> => {
  if (!(await requireOwner())) return { ok: false, error: 'Not authorized.' };
  if (!isAssignable(role)) return { ok: false, error: 'Role must be user or admin.' };

  const supabase = await createClient();
  const { error } = await supabase.rpc('set_user_role', { target: userId, new_role: role });
  if (error) return { ok: false, error: error.message };

  revalidatePath(USERS_PATH);
  return { ok: true, message: 'Role updated.' };
};

export const createUser = async (_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> => {
  if (!(await requireOwner())) return { ok: false, error: 'Not authorized.' };
  if (!isAdminApiConfigured()) return { ok: false, error: 'Adding users needs SUPABASE_SECRET_KEY on the server.' };

  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const role = String(formData.get('role') ?? 'user');

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: 'Enter a valid email address.' };
  if (password.length < MIN_PASSWORD) {
    return { ok: false, error: `Temporary password must be at least ${MIN_PASSWORD} characters.` };
  }
  if (!isAssignable(role)) return { ok: false, error: 'Role must be user or admin.' };

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error || !data.user) return { ok: false, error: error?.message ?? 'Could not create the user.' };

  // The signup trigger creates the profile as 'user'; promote through the guarded function.
  if (role === 'admin') {
    const supabase = await createClient();
    const { error: roleError } = await supabase.rpc('set_user_role', { target: data.user.id, new_role: 'admin' });
    if (roleError) {
      revalidatePath(USERS_PATH);
      return { ok: false, error: `User created, but the role could not be set: ${roleError.message}` };
    }
  }

  revalidatePath(USERS_PATH);
  return { ok: true, message: `Added ${email}. Share the temporary password with them; they can change it under Account.` };
};

export const deleteUser = async (userId: string): Promise<ActionResult> => {
  const owner = await requireOwner();
  if (!owner) return { ok: false, error: 'Not authorized.' };
  if (!isAdminApiConfigured()) return { ok: false, error: 'Deleting users needs SUPABASE_SECRET_KEY on the server.' };
  if (userId === owner.userId) return { ok: false, error: 'You cannot delete your own account.' };

  // Look the target up with the owner's own session (RLS lets owners read all profiles).
  const supabase = await createClient();
  const { data: target } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle();
  if (!target) return { ok: false, error: 'User not found.' };
  if (target.role === 'owner') return { ok: false, error: 'Owners can only be removed in the database.' };

  const { error } = await createAdminClient().auth.admin.deleteUser(userId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(USERS_PATH);
  return { ok: true, message: 'User deleted.' };
};
