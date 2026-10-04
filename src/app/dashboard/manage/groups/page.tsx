import type { Metadata } from 'next';
import Link from 'next/link';

import { GroupForm } from '@/components/Dashboard/ManageForms';
import { requireRole } from '@/lib/auth';
import createClient from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Manage groups' };

const ManageGroups = async () => {
  await requireRole('owner');

  const supabase = await createClient();
  const [{ data: groups }, { data: members }] = await Promise.all([
    supabase.from('groups').select('id, name, description').order('name'),
    supabase.from('group_members').select('group_id'),
  ]);
  const memberCount = (id: string) => (members ?? []).filter((m) => m.group_id === id).length;

  return (
    <>
      <header>
        <div className="title">
          <h2>Groups</h2>
          <p>Put people in groups, then give a whole group access to an app</p>
        </div>
      </header>

      {(groups ?? []).length === 0 ? <p>No groups yet.</p> : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Group</th><th>Description</th><th>Members</th></tr>
            </thead>
            <tbody>
              {(groups ?? []).map((g) => (
                <tr key={g.id}>
                  <td><Link href={`/dashboard/manage/groups/${g.id}`}>{g.name}</Link></td>
                  <td>{g.description}</td>
                  <td>{memberCount(g.id)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h3>Add a group</h3>
      <GroupForm />
    </>
  );
};

export default ManageGroups;
