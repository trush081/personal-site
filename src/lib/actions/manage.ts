'use server';

import { revalidatePath, updateTag } from 'next/cache';

import { getAuthState } from '@/lib/auth';
import { PUBLIC_APPS_TAG } from '@/lib/content';
import createAdminClient, { isAdminApiConfigured } from '@/lib/supabase/admin';
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

const KINDS = ['internal', 'external', 'oauth'];
const VISIBILITIES = ['public', 'members', 'restricted'];
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_REDIRECT_URIS = 10;

const text = (formData: FormData, name: string) => String(formData.get(name) ?? '').trim();
const ids = (formData: FormData, name: string) => formData.getAll(name).map(String).filter((id) => UUID.test(id));

// Friendlier messages for database constraint errors.
const describe = (message: string) => {
  if (message.includes('apps_slug_key')) return 'That slug is already used by another app.';
  if (message.includes('groups_name_key')) return 'A group with that name already exists.';
  return message;
};

// Callback URLs must be exact https URLs (http is allowed for localhost while testing).
const parseRedirectUris = (raw: string) => {
  const uris = [...new Set(raw.split(/\r?\n/).map((u) => u.trim()).filter(Boolean))];
  for (const uri of uris) {
    let url: URL;
    try {
      url = new URL(uri);
    } catch {
      throw new Error(`Not a valid URL: ${uri}`);
    }
    const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    if (url.protocol !== 'https:' && !(local && url.protocol === 'http:')) {
      throw new Error(`Callback URLs must use https:// (${uri})`);
    }
    if (url.hash) throw new Error(`Callback URLs can't contain a # fragment (${uri})`);
  }
  if (uris.length > MAX_REDIRECT_URIS) throw new Error(`Use at most ${MAX_REDIRECT_URIS} callback URLs.`);
  return uris;
};

// Registers, updates, or removes the Supabase OAuth client behind a "Sign in with Trenton"
// app. Uses the admin API (secret key), so it's only reached after the owner check.
const syncOAuthClient = async (
  app: { id: string; name: string; url: string | null; oauth_client_id: string | null },
  kind: string,
  redirectUris: string[],
): Promise<ActionResult> => {
  const supabase = await createClient();

  // Switched away from "Sign in with Trenton": remove the registration.
  if (kind !== 'oauth') {
    if (!app.oauth_client_id) return { ok: true };
    const { error } = await createAdminClient().auth.admin.oauth.deleteClient(app.oauth_client_id);
    if (error) return { ok: false, error: `App saved, but its login registration could not be removed: ${error.message}` };
    await supabase.from('apps').update({ oauth_client_id: null, oauth_redirect_uris: [] }).eq('id', app.id);
    return { ok: true };
  }

  const admin = createAdminClient().auth.admin.oauth;
  if (app.oauth_client_id) {
    const { error } = await admin.updateClient(app.oauth_client_id, {
      client_name: app.name,
      client_uri: app.url ?? undefined,
      redirect_uris: redirectUris,
    });
    if (error) return { ok: false, error: `App saved, but its login registration could not be updated: ${error.message}` };
    return { ok: true };
  }

  const { data, error } = await admin.createClient({
    client_name: app.name,
    client_uri: app.url ?? undefined,
    redirect_uris: redirectUris,
    // Confidential client (has a secret); the standard method for server-side apps.
    token_endpoint_auth_method: 'client_secret_basic',
  });
  if (error || !data) {
    return { ok: false, error: `App saved, but it could not be registered for sign-in: ${error?.message ?? 'unknown error'}. Is the OAuth server enabled in Supabase?` };
  }

  const { error: linkError } = await supabase.from('apps').update({ oauth_client_id: data.client_id }).eq('id', app.id);
  if (linkError) {
    // Don't leave an orphaned registration behind.
    await admin.deleteClient(data.client_id);
    return { ok: false, error: `Could not link the login registration: ${linkError.message}` };
  }
  return {
    ok: true,
    credentials: data.client_secret ? { clientId: data.client_id, clientSecret: data.client_secret } : undefined,
  };
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
    oauth_redirect_uris: [] as string[],
    updated_at: new Date().toISOString(),
  };

  if (!app.name || app.name.length > 100) return { ok: false, error: 'Name is required (up to 100 characters).' };
  if (!SLUG.test(app.slug) || app.slug.length > 60) {
    return { ok: false, error: 'Slug must be lowercase letters, numbers and dashes (for example my-app).' };
  }
  if (!KINDS.includes(app.kind)) return { ok: false, error: 'Choose a type.' };
  if (!VISIBILITIES.includes(app.visibility)) return { ok: false, error: 'Choose who can see it.' };
  if (app.kind !== 'internal' && !app.url) return { ok: false, error: 'This type of app needs a URL.' };
  if (app.url && !/^https:\/\//i.test(app.url)) return { ok: false, error: 'URL must start with https://' };
  if (app.icon_url && !/^https:\/\//i.test(app.icon_url)) return { ok: false, error: 'Icon URL must start with https://' };
  if (!Number.isInteger(app.sort_order)) return { ok: false, error: 'Order must be a whole number.' };
  if (app.kind === 'internal') app.url = null;

  if (app.kind === 'oauth') {
    try {
      app.oauth_redirect_uris = parseRedirectUris(text(formData, 'redirect_uris'));
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'Invalid callback URLs.' };
    }
    if (app.oauth_redirect_uris.length === 0) {
      return { ok: false, error: 'Add the callback URL of the app that will sign in with Trenton.' };
    }
  }

  const supabase = await createClient();
  const isUpdate = Boolean(id && UUID.test(id));
  const { data: existing } = isUpdate
    ? await supabase.from('apps').select('oauth_client_id').eq('id', id).maybeSingle()
    : { data: null };

  // Registering/removing a login registration needs the admin API.
  const touchesOAuth = app.kind === 'oauth' || Boolean(existing?.oauth_client_id);
  if (touchesOAuth && !isAdminApiConfigured()) {
    return { ok: false, error: '"Sign in with Trenton" apps need SUPABASE_SECRET_KEY on the server.' };
  }

  const { data: saved, error } = isUpdate
    ? await supabase.from('apps').update(app).eq('id', id).select('id, oauth_client_id').single()
    : await supabase.from('apps').insert(app).select('id, oauth_client_id').single();
  if (error || !saved) return { ok: false, error: describe(error?.message ?? 'Could not save.') };

  let credentials: ActionResult['credentials'];
  if (touchesOAuth) {
    const result = await syncOAuthClient({ ...saved, name: app.name, url: app.url }, app.kind, app.oauth_redirect_uris);
    if (!result.ok) {
      refresh();
      return result;
    }
    credentials = result.credentials;
  }

  refresh();
  return { ok: true, message: isUpdate ? 'App saved.' : `Added ${app.name}.`, credentials };
};

// Issues a new client secret for a "Sign in with Trenton" app (the old one stops working).
export const regenerateOAuthSecret = async (appId: string): Promise<ActionResult> => {
  if (!(await requireOwner())) return { ok: false, error: 'Not authorized.' };
  if (!UUID.test(appId)) return { ok: false, error: 'Unknown app.' };
  if (!isAdminApiConfigured()) return { ok: false, error: 'This needs SUPABASE_SECRET_KEY on the server.' };

  const supabase = await createClient();
  const { data: app } = await supabase.from('apps').select('oauth_client_id').eq('id', appId).maybeSingle();
  if (!app?.oauth_client_id) return { ok: false, error: 'This app is not registered for sign-in.' };

  const { data, error } = await createAdminClient().auth.admin.oauth.regenerateClientSecret(app.oauth_client_id);
  if (error || !data?.client_secret) return { ok: false, error: error?.message ?? 'Could not create a new secret.' };

  return {
    ok: true,
    message: 'New secret created. Update it in the other app; the old secret no longer works.',
    credentials: { clientId: data.client_id, clientSecret: data.client_secret },
  };
};

export const deleteApp = async (id: string): Promise<ActionResult> => {
  if (!(await requireOwner())) return { ok: false, error: 'Not authorized.' };
  if (!UUID.test(id)) return { ok: false, error: 'Unknown app.' };

  const supabase = await createClient();
  const { data: app } = await supabase.from('apps').select('oauth_client_id').eq('id', id).maybeSingle();

  // Remove the login registration first, so a deleted app can't keep signing people in.
  if (app?.oauth_client_id) {
    if (!isAdminApiConfigured()) return { ok: false, error: 'Deleting this app needs SUPABASE_SECRET_KEY on the server.' };
    const { error } = await createAdminClient().auth.admin.oauth.deleteClient(app.oauth_client_id);
    if (error) return { ok: false, error: `Could not remove its login registration: ${error.message}` };
  }

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
