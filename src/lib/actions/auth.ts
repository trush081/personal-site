'use server';

import { redirect } from 'next/navigation';

import createClient from '@/lib/supabase/server';

export interface ActionResult {
  ok: boolean;
  error?: string;
  message?: string;
}

// Only allow redirects back into the dashboard, never to other sites.
const safeNext = (value: FormDataEntryValue | null) => {
  const next = typeof value === 'string' ? value : '';
  return next.startsWith('/dashboard') ? next : '/dashboard';
};

export const signIn = async (_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> => {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  if (!email || !password) return { ok: false, error: 'Enter your email and password.' };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  // Same message for every failure so the form doesn't reveal which emails exist.
  if (error) return { ok: false, error: 'Invalid email or password.' };

  redirect(safeNext(formData.get('next')));
};

export const signOut = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
};

const MIN_PASSWORD = 10;

export const changePassword = async (_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> => {
  const current = String(formData.get('current') ?? '');
  const password = String(formData.get('password') ?? '');
  const confirm = String(formData.get('confirm') ?? '');

  if (password.length < MIN_PASSWORD) {
    return { ok: false, error: `New password must be at least ${MIN_PASSWORD} characters.` };
  }
  if (password !== confirm) return { ok: false, error: 'New passwords do not match.' };
  if (password === current) return { ok: false, error: 'New password must be different.' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { ok: false, error: 'You are not signed in.' };

  // Re-check the current password so a left-open session can't be used to take over the account.
  const { error: verifyError } = await supabase.auth.signInWithPassword({ email: user.email, password: current });
  if (verifyError) return { ok: false, error: 'Current password is incorrect.' };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false, error: error.message };

  return { ok: true, message: 'Password updated.' };
};
