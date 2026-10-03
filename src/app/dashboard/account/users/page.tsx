import type { Metadata } from 'next';

import AddUserForm from '@/components/Dashboard/AddUserForm';
import UsersTable, { type UserRow } from '@/components/Dashboard/UsersTable';
import { requireRole } from '@/lib/auth';
import { isAdminApiConfigured } from '@/lib/supabase/admin';
import createClient from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Users' };

const Users = async () => {
  const auth = await requireRole('owner');

  // Uses the owner's own session; RLS only returns all profiles to owners.
  const supabase = await createClient();
  const { data } = await supabase
    .from('profiles')
    .select('id, email, role, created_at')
    .order('created_at');
  const users: UserRow[] = data ?? [];
  const adminApi = isAdminApiConfigured();

  return (
    <>
      <header>
        <div className="title">
          <h2>Users</h2>
          <p>Manage who can sign in and what they can do</p>
        </div>
      </header>

      <p className="dashboard-help">
        <strong>user</strong>: can sign in and manage their own account.{' '}
        <strong>admin</strong>: can also edit site content.{' '}
        <strong>owner</strong>: can also manage users. Owners can only be changed in the database.
      </p>

      <UsersTable users={users} currentUserId={auth.userId} canDelete={adminApi} />

      <h3 className="dashboard-signout-heading">Add a user</h3>
      {adminApi ? <AddUserForm /> : (
        <p className="dashboard-help">
          Adding and deleting users needs the Supabase secret key on the server. Set{' '}
          <code>SUPABASE_SECRET_KEY</code> in <code>.env.local</code> and in Vercel (as a Sensitive variable).
          Role changes work without it.
        </p>
      )}
    </>
  );
};

export default Users;
