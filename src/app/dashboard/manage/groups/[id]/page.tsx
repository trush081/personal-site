import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { DeleteButton, GroupForm, MembersForm } from '@/components/Dashboard/ManageForms';
import { requireRole } from '@/lib/auth';
import createClient from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Edit group' };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const EditGroup = async ({ params }: { params: Promise<{ id: string }> }) => {
  await requireRole('owner');
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const supabase = await createClient();
  const [{ data: group }, { data: members }, { data: users }, { data: grants }] = await Promise.all([
    supabase.from('groups').select('id, name, description').eq('id', id).maybeSingle(),
    supabase.from('group_members').select('user_id').eq('group_id', id),
    supabase.from('profiles').select('id, email').order('email'),
    supabase.from('app_access').select('apps(id, name)').eq('group_id', id),
  ]);
  if (!group) notFound();

  const apps = (grants ?? []).flatMap((g) => (Array.isArray(g.apps) ? g.apps : [g.apps])).filter(Boolean) as {
    id: string; name: string;
  }[];

  return (
    <>
      <header>
        <div className="title">
          <h2>{group.name}</h2>
          <p><Link href="/dashboard/manage/groups">&larr; All groups</Link></p>
        </div>
      </header>

      <h3>Details</h3>
      <GroupForm group={group} />

      <h3 className="dashboard-section-heading">Members</h3>
      <MembersForm
        groupId={group.id}
        users={(users ?? []).map((u) => ({ id: u.id, label: u.email ?? u.id }))}
        selected={(members ?? []).map((m) => m.user_id)}
      />

      <h3 className="dashboard-section-heading">Apps this group can open</h3>
      {apps.length === 0 ? <p className="dashboard-help">None yet. Grant access from an app&apos;s page.</p> : (
        <ul>
          {apps.map((app) => (
            <li key={app.id}><Link href={`/dashboard/manage/apps/${app.id}`}>{app.name}</Link></li>
          ))}
        </ul>
      )}

      <h3 className="dashboard-section-heading">Danger zone</h3>
      <DeleteButton kind="group" id={group.id} name={group.name} redirectTo="/dashboard/manage/groups" />
    </>
  );
};

export default EditGroup;
