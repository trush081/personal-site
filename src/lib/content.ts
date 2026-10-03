import { createClient } from '@supabase/supabase-js';

export const CONTENT_TAG = 'site-content';

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
