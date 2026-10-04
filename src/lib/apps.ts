import createClient from '@/lib/supabase/server';

export type AppKind = 'internal' | 'shared' | 'external' | 'oauth';
export type AppVisibility = 'public' | 'members' | 'restricted';

export interface App {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon_url: string | null;
  kind: AppKind;
  url: string | null;
  visibility: AppVisibility;
  sort_order: number;
  oauth_client_id: string | null;
  oauth_redirect_uris: string[];
}

export const APP_COLUMNS = 'id, slug, name, description, icon_url, kind, url, visibility, sort_order, oauth_client_id, oauth_redirect_uris';

// Internal apps live inside the dashboard; the others link out.
export const appHref = (app: Pick<App, 'kind' | 'slug' | 'url'>) => (
  app.kind === 'internal' ? `/dashboard/apps/${app.slug}` : app.url ?? '#'
);

export const opensInNewTab = (app: Pick<App, 'kind'>) => app.kind === 'external' || app.kind === 'oauth';

// Apps the signed-in user can open. Row-level security does the filtering (admins and
// owners can open every app, so they get the full list).
export const getMyApps = async (): Promise<App[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from('apps')
    .select(APP_COLUMNS)
    .order('sort_order')
    .order('name');
  return (data ?? []) as App[];
};
