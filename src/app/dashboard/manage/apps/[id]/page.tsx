import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AccessForm, AppForm, DeleteButton } from '@/components/Dashboard/ManageForms';
import { APP_COLUMNS, type App } from '@/lib/apps';
import { requireRole } from '@/lib/auth';
import createClient from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Edit app' };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const EditApp = async ({ params }: { params: Promise<{ id: string }> }) => {
  await requireRole('owner');
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const supabase = await createClient();
  const [{ data: app }, { data: grants }, { data: users }, { data: groups }] = await Promise.all([
    supabase.from('apps').select(APP_COLUMNS).eq('id', id).maybeSingle(),
    supabase.from('app_access').select('user_id, group_id').eq('app_id', id),
    supabase.from('profiles').select('id, email, role').order('email'),
    supabase.from('groups').select('id, name').order('name'),
  ]);
  if (!app) notFound();
  const current = app as App;

  return (
    <>
      <header>
        <div className="title">
          <h2>{current.name}</h2>
          <p><Link href="/dashboard/manage/apps">&larr; All apps</Link></p>
        </div>
      </header>

      <h3>Details</h3>
      <AppForm app={current} />

      <h3 className="dashboard-section-heading">Access</h3>
      {current.visibility === 'restricted' ? (
        <>
          <p className="dashboard-help">
            Admins and owners can always open this app. Choose who else can.
          </p>
          <AccessForm
            appId={current.id}
            users={(users ?? []).filter((u) => u.role === 'user').map((u) => ({ id: u.id, label: u.email ?? u.id }))}
            groups={(groups ?? []).map((g) => ({ id: g.id, label: g.name }))}
            selectedUsers={(grants ?? []).map((g) => g.user_id).filter(Boolean) as string[]}
            selectedGroups={(grants ?? []).map((g) => g.group_id).filter(Boolean) as string[]}
          />
        </>
      ) : (
        <p className="dashboard-help">
          This app is <strong>{current.visibility}</strong>, so{' '}
          {current.visibility === 'public' ? 'anyone' : 'everyone who signs in'} can open it.
          Set it to restricted to choose specific people and groups.
        </p>
      )}

      {current.kind === 'shared' && (
        <>
          <h3 className="dashboard-section-heading">Connecting the project</h3>
          <p className="dashboard-help">
            In the project at {current.url}, use this site&apos;s Supabase URL and publishable key, and check access with{' '}
            <code>{`supabase.rpc('has_app_access', { app_slug: '${current.slug}' })`}</code>.
          </p>
        </>
      )}

      <h3 className="dashboard-section-heading">Danger zone</h3>
      <DeleteButton kind="app" id={current.id} name={current.name} redirectTo="/dashboard/manage/apps" />
    </>
  );
};

export default EditApp;
