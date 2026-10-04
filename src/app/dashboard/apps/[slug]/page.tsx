import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import internalApps from '@/apps/registry';
import { APP_COLUMNS, type App } from '@/lib/apps';
import { requireRole } from '@/lib/auth';
import createClient from '@/lib/supabase/server';

type Props = { params: Promise<{ slug: string }> };

// Row-level security only returns apps the user can open (owners see all, but owners
// can open everything anyway), so "not found" covers both missing and forbidden apps.
const getApp = async (slug: string) => {
  const supabase = await createClient();
  const { data } = await supabase.from('apps').select(APP_COLUMNS).eq('slug', slug).maybeSingle();
  return data as App | null;
};

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const app = await getApp((await params).slug);
  return { title: app?.name ?? 'App' };
};

const AppPage = async ({ params }: Props) => {
  await requireRole('user');
  const { slug } = await params;

  const app = await getApp(slug);
  if (!app) notFound();
  // External and sign-in apps live elsewhere.
  if (app.kind !== 'internal' && app.url) redirect(app.url);

  const Component = internalApps[app.slug];

  return (
    <>
      <header>
        <div className="title">
          <h2>{app.name}</h2>
          {app.description && <p>{app.description}</p>}
        </div>
      </header>
      {Component ? <Component /> : (
        <p className="dashboard-help">
          This app is registered but has no page yet. Add a component for <code>{app.slug}</code> in{' '}
          <code>src/apps/registry.tsx</code>.
        </p>
      )}
    </>
  );
};

export default AppPage;
