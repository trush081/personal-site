import { createBrowserClient } from '@supabase/ssr';

import { authCookieOptions } from './cookies';

const createClient = () => createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  { cookieOptions: authCookieOptions },
);

export default createClient;
