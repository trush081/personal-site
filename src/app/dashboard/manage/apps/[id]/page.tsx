import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import {
  AccessForm, AppForm, DeleteButton, RegenerateSecretButton,
} from '@/components/Dashboard/ManageForms';
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
            In the project at {current.url}, use this site&apos;s Supabase URL and publishable key, set{' '}
            <code>APP_SLUG={current.slug}</code>, and check access with{' '}
            <code>{`supabase.rpc('has_app_access', { app_slug: '${current.slug}' })`}</code>. Send signed-out
            visitors to <code>https://www.trentonrush.com/login?next=…</code>. The full setup, including a
            ready-made proxy, is in <code>docs/shared-sign-in.md</code>.
          </p>
          {!current.url?.match(/^https:\/\/([a-z0-9-]+\.)*trentonrush\.com(\/|$)/i) && (
            <p className="dashboard-error">
              Shared sign-in only works for projects on trentonrush.com or its subdomains. Use the External type
              for other domains.
            </p>
          )}
        </>
      )}

      {current.kind === 'oauth' && (
        <>
          <h3 className="dashboard-section-heading">Sign in with Trenton setup</h3>
          {current.oauth_client_id ? (
            <>
              <p className="dashboard-help">
                In the other app&apos;s Supabase project, go to Authentication &rarr; Providers and add a custom
                provider with <strong>Auto-discovery (OIDC)</strong> using these values:
              </p>
              <dl className="dashboard-setup">
                <dt>Issuer URL</dt>
                <dd><code>{`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1`}</code></dd>
                <dt>Client ID</dt>
                <dd><code>{current.oauth_client_id}</code></dd>
                <dt>Client secret</dt>
                <dd>Shown once when the app was added. Lost it? Create a new one below.</dd>
                <dt>Scopes</dt>
                <dd><code>openid email profile</code></dd>
                <dt>Identifier (suggestion)</dt>
                <dd><code>custom:trenton</code></dd>
              </dl>
              <p className="dashboard-help">
                Then sign in from that app with{' '}
                <code>{"supabase.auth.signInWithOAuth({ provider: 'custom:trenton' })"}</code>. People who
                don&apos;t have access to this app are turned away on the consent page.
              </p>
              <RegenerateSecretButton appId={current.id} />
            </>
          ) : (
            <p className="dashboard-error">
              This app isn&apos;t registered for sign-in yet. Check that the OAuth server is enabled in Supabase
              (Authentication &rarr; OAuth Server), then save the app again.
            </p>
          )}
        </>
      )}

      <h3 className="dashboard-section-heading">Danger zone</h3>
      <DeleteButton kind="app" id={current.id} name={current.name} redirectTo="/dashboard/manage/apps" />
    </>
  );
};

export default EditApp;
