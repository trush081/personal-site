import type { Metadata } from 'next';
import Link from 'next/link';

import PasswordForm from '@/components/Dashboard/PasswordForm';
import { signOut } from '@/lib/actions/auth';
import { requireRole } from '@/lib/auth';

export const metadata: Metadata = { title: 'Account' };

const Account = async () => {
  const auth = await requireRole('user');

  return (
    <>
      <header>
        <div className="title">
          <h2>Account</h2>
          <p>{auth.email} &middot; {auth.status}</p>
        </div>
      </header>

      {auth.status === 'owner' && (
        <p><Link href="/dashboard/account/users">Manage users &rarr;</Link></p>
      )}

      <h3>Change password</h3>
      <PasswordForm />

      <h3 className="dashboard-signout-heading">Sign out</h3>
      <form action={signOut}><button type="submit">Sign out</button></form>
    </>
  );
};

export default Account;
