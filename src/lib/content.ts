import { createClient } from '@supabase/supabase-js';

export const CONTENT_TAG = 'site-content';
export const PUBLIC_APPS_TAG = 'public-apps';

// Reads a content section from Supabase. Public (anon) read access is allowed by RLS.
// Falls back to the data checked in under src/data if Supabase is unconfigured, empty,
// or unreachable, so the site can never go blank.
export const getContent = async <T>(key: string, fallback: T): Promise<T> => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !anonKey) return fallback;

  try {
    const supabase = createClient(url, anonKey, {
      auth: { persistSession: false },
      // Tag the request so saving in the admin area can expire it immediately.
      global: { fetch: (input, init) => fetch(input, { ...init, next: { tags: [CONTENT_TAG] } }) },
    });
    const { data, error } = await supabase
      .from('site_content')
      .select('data')
      .eq('key', key)
      .maybeSingle();

    if (error || !data) return fallback;
    return data.data as T;
  } catch {
    return fallback;
  }
};

export interface PublicApp {
  slug: string;
  name: string;
  description: string;
  icon_url: string | null;
  kind: 'internal' | 'external' | 'oauth';
  url: string | null;
}

// Apps marked "public" in Manage -> Apps, shown on the public Projects page.
// Read with the publishable key, so row-level security only returns public apps.
export const getPublicApps = async (): Promise<PublicApp[]> => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !anonKey) return [];

  try {
    const supabase = createClient(url, anonKey, {
      auth: { persistSession: false },
      global: { fetch: (input, init) => fetch(input, { ...init, next: { tags: [PUBLIC_APPS_TAG] } }) },
    });
    const { data, error } = await supabase
      .from('apps')
      .select('slug, name, description, icon_url, kind, url')
      .eq('visibility', 'public')
      .order('sort_order')
      .order('name');
    return error ? [] : (data as PublicApp[]);
  } catch {
    return [];
  }
};
