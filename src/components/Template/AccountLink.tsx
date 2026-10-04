'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';

import createClient from '@/lib/supabase/client';

// Shows "Sign in" or "Overview" depending on whether the visitor has a session.
// Checked in the browser so the public pages can stay static.
const AccountLink = ({ onClick, render }: {
  onClick?: () => void;
  render?: (label: string) => ReactNode;
}) => {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session));
    });
    return () => subscription.unsubscribe();
  }, []);

  const label = signedIn ? 'Overview' : 'Sign in';

  return (
    <Link href={signedIn ? '/dashboard' : '/login'} onClick={onClick}>
      {render ? render(label) : label}
    </Link>
  );
};

export default AccountLink;
