import 'server-only';

import { createClient } from '@supabase/supabase-js';

// Supabase admin client using the secret key. It bypasses row-level security, so:
// - it is server-only (the import above fails the build if a client component imports it)
// - only call it after verifying the caller is an owner
// - SUPABASE_SECRET_KEY must never be given a NEXT_PUBLIC_ prefix
export const isAdminApiConfigured = () => Boolean(process.env.SUPABASE_SECRET_KEY);

const createAdminClient = () => {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) throw new Error('SUPABASE_SECRET_KEY is not set');

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
};

export default createAdminClient;
