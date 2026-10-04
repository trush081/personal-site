import type { Metadata } from 'next';
import Link from 'next/link';

import { AppForm } from '@/components/Dashboard/ManageForms';
import { APP_COLUMNS, type App } from '@/lib/apps';
import { requireRole } from '@/lib/auth';
import createClient from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Manage apps' };

const KIND_LABELS = { internal: 'Internal', shared: 'Shared sign-in', external: 'External', oauth: 'Sign in with Trenton' };

const ManageApps = async () => {
  await requireRole('owner');

  const supabase = await createClient();
  const [{ data: apps }, { data: grants }] = await Promise.all([
    supabase.from('apps').select(APP_COLUMNS).order('sort_order').order('name'),
    supabase.from('app_access').select('app_id'),
  ]);
  const grantCount = (id: string) => (grants ?? []).filter((g) => g.app_id === id).length;

  return (
    <>
      <header>
        <div className="title">
          <h2>Apps</h2>
          <p>Pages, sites, and projects people can open from their Overview</p>
        </div>
      </header>

      {(apps ?? []).length === 0 ? <p>No apps yet. Add your first one below.</p> : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>App</th><th>Type</th><th>Visibility</th><th>Grants</th></tr>
            </thead>
            <tbody>
              {(apps as App[]).map((app) => (
                <tr key={app.id}>
                  <td><Link href={`/dashboard/manage/apps/${app.id}`}>{app.name}</Link></td>
                  <td>{KIND_LABELS[app.kind]}</td>
                  <td>{app.visibility}</td>
                  <td>{app.visibility === 'restricted' ? grantCount(app.id) : '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h3>Add an app</h3>
      <AppForm />
    </>
  );
};

export default ManageApps;
