'use server';

import { revalidatePath, updateTag } from 'next/cache';

import { getAuthState } from '@/lib/auth';
import { PUBLIC_APPS_TAG } from '@/lib/content';
import createClient from '@/lib/supabase/server';
import type { ActionResult } from './auth';

// Every action re-verifies the caller is an owner (server actions are public endpoints).
// Row-level security enforces the same rule again in the database.
const requireOwner = async () => (await getAuthState()).status === 'owner';

// Refresh the dashboard and the public Projects page (which lists public apps).
const refresh = () => {
  updateTag(PUBLIC_APPS_TAG);
  revalidatePath('/dashboard', 'layout');
  revalidatePath('/projects');
};

const KINDS = ['internal', 'shared', 'external'];
const VISIBILITIES = ['public', 'members', 'restricted'];
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const text = (formData: FormData, name: string) => String(formData.get(name) ?? '').trim();
const ids = (formData: FormData, name: string) => formData.getAll(name).map(String).filter((id) => UUID.test(id));

// Friendlier messages for database constraint errors.
const describe = (message: string) => {
  if (message.includes('apps_slug_key')) return 'That slug is already used by another app.';
  if (message.includes('groups_name_key')) return 'A group with that name already exists.';
  return message;
};

export const saveApp = async (_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> => {
  if (!(await requireOwner())) return { ok: false, error: 'Not authorized.' };

  const id = text(formData, 'id');
  const app = {
    name: text(formData, 'name'),
    slug: text(formData, 'slug').toLowerCase(),
    description: text(formData, 'description'),
    icon_url: text(formData, 'icon_url') || null,
    kind: text(formData, 'kind'),
    url: text(formData, 'url') || null,
    visibility: text(formData, 'visibility'),
    sort_order: Number(text(formData, 'sort_order') || 0),
    updated_at: new Date().toISOString(),
  };

  if (!app.name || app.name.length > 100) return { ok: false, error: 'Name is required (up to 100 characters).' };
  if (!SLUG.test(app.slug) || app.slug.length > 60) {
    return { ok: false, error: 'Slug must be lowercase letters, numbers and dashes (for example my-app).' };
  }
  if (!KINDS.includes(app.kind)) return { ok: false, error: 'Choose a type.' };
  if (!VISIBILITIES.includes(app.visibility)) return { ok: false, error: 'Choose who can see it.' };
  if (app.kind !== 'internal' && !app.url) return { ok: false, error: 'Shared and external apps need a URL.' };
  if (app.url && !/^https:\/\//i.test(app.url)) return { ok: false, error: 'URL must start with https://' };
  if (app.icon_url && !/^https:\/\//i.test(app.icon_url)) return { ok: false, error: 'Icon URL must start with https://' };
  if (!Number.isInteger(app.sort_order)) return { ok: false, error: 'Order must be a whole number.' };
  if (app.kind === 'internal') app.url = null;

  const supabase = await createClient();
  const { error } = id && UUID.test(id)
    ? await supabase.from('apps').update(app).eq('id', id)
    : await supabase.from('apps').insert(app);
  if (error) return { ok: false, error: describe(error.message) };

  refresh();
  return { ok: true, message: id ? 'App saved.' : `Added ${app.name}.` };
};

export const deleteApp = async (id: string): Promise<ActionResult> => {
  if (!(await requireOwner())) return { ok: false, error: 'Not authorized.' };
  if (!UUID.test(id)) return { ok: false, error: 'Unknown app.' };

  const supabase = await createClient();
  const { error } = await supabase.from('apps').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };

  refresh();
  return { ok: true, message: 'App deleted.' };
};

export const saveAppAccess = async (_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> => {
  if (!(await requireOwner())) return { ok: false, error: 'Not authorized.' };
  const appId = text(formData, 'app_id');
  if (!UUID.test(appId)) return { ok: false, error: 'Unknown app.' };

  const supabase = await createClient();
  const { error } = await supabase.rpc('set_app_access', {
    target_app: appId,
    user_ids: ids(formData, 'user_ids'),
    group_ids: ids(formData, 'group_ids'),
  });
  if (error) return { ok: false, error: error.message };

  refresh();
  return { ok: true, message: 'Access saved.' };
};

export const saveGroup = async (_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> => {
  if (!(await requireOwner())) return { ok: false, error: 'Not authorized.' };

  const id = text(formData, 'id');
  const group = { name: text(formData, 'name'), description: text(formData, 'description') };
  if (!group.name || group.name.length > 60) return { ok: false, error: 'Name is required (up to 60 characters).' };
  if (group.description.length > 500) return { ok: false, error: 'Description is too long.' };

  const supabase = await createClient();
  const { error } = id && UUID.test(id)
    ? await supabase.from('groups').update(group).eq('id', id)
    : await supabase.from('groups').insert(group);
  if (error) return { ok: false, error: describe(error.message) };

  refresh();
  return { ok: true, message: id ? 'Group saved.' : `Added ${group.name}.` };
};

export const deleteGroup = async (id: string): Promise<ActionResult> => {
  if (!(await requireOwner())) return { ok: false, error: 'Not authorized.' };
  if (!UUID.test(id)) return { ok: false, error: 'Unknown group.' };

  const supabase = await createClient();
  const { error } = await supabase.from('groups').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };

  refresh();
  return { ok: true, message: 'Group deleted.' };
};

export const saveGroupMembers = async (_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> => {
  if (!(await requireOwner())) return { ok: false, error: 'Not authorized.' };
  const groupId = text(formData, 'group_id');
  if (!UUID.test(groupId)) return { ok: false, error: 'Unknown group.' };

  const supabase = await createClient();
  const { error } = await supabase.rpc('set_group_members', {
    target_group: groupId,
    user_ids: ids(formData, 'user_ids'),
  });
  if (error) return { ok: false, error: error.message };

  refresh();
  return { ok: true, message: 'Members saved.' };
};
