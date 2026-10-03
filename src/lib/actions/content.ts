'use server';

import { revalidatePath, updateTag } from 'next/cache';

import { getAuthState, hasRole } from '@/lib/auth';
import { CONTENT_TAG } from '@/lib/content';
import { getSection, sanitizeSection } from '@/lib/sections';
import createClient from '@/lib/supabase/server';
import type { ActionResult } from './auth';

export const saveSection = async (key: string, data: unknown): Promise<ActionResult> => {
  // Re-verify on every call: server actions are public endpoints, and the proxy
  // only checks that someone is signed in, not that they are an admin.
  const auth = await getAuthState();
  if (auth.status === 'signed-out' || !hasRole(auth, 'admin')) return { ok: false, error: 'Not authorized.' };

  const section = getSection(key);
  if (!section) return { ok: false, error: 'Unknown section.' };

  let clean: unknown;
  try {
    clean = sanitizeSection(section, data);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Invalid data.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('site_content').upsert({
    key,
    data: clean,
    updated_at: new Date().toISOString(),
    updated_by: auth.userId,
  });
  if (error) return { ok: false, error: 'Could not save. Please try again.' };

  // Expire the cached database reads and rebuild the public pages so the change shows up right away.
  updateTag(CONTENT_TAG);
  revalidatePath('/', 'layout');
  return { ok: true };
};
