import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// Supabase client bound to the current request's cookies (the signed-in user).
const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          try {
            toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Called from a Server Component, where cookies are read-only.
            // The proxy refreshes sessions, so this is safe to ignore.
          }
        },
      },
    },
  );
};

export default createClient;
