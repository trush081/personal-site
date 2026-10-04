-- "Sign in with Trenton": apps that use this project as their login provider
-- (Supabase OAuth 2.1 server). Each one is registered as an OAuth client.

alter table public.apps drop constraint if exists apps_kind_check;
alter table public.apps
  add constraint apps_kind_check check (kind in ('internal', 'shared', 'external', 'oauth'));

alter table public.apps
  add column oauth_client_id text unique,
  -- Copy of the client's registered callback URLs, so the consent page can identify
  -- the app even when Supabase skips straight to a redirect (previously approved).
  add column oauth_redirect_uris text[] not null default '{}';

-- For the consent page: which app is asking, and may the signed-in user open it?
-- Looks the app up by OAuth client ID, or by callback URL when that's all we have.
-- Returns no rows for unknown clients, which the consent page treats as "deny".
create or replace function public.oauth_app_access(p_client_id text default null, p_redirect_uri text default null)
returns table (app_name text, allowed boolean)
language sql
stable
security definer
set search_path = ''
as $$
  select a.name, public.can_access_app(a.id)
  from public.apps a
  where a.kind = 'oauth'
    and (
      (p_client_id is not null and a.oauth_client_id = p_client_id)
      or (p_client_id is null and p_redirect_uri is not null and p_redirect_uri = any (a.oauth_redirect_uris))
    )
  limit 1;
$$;

revoke execute on function public.oauth_app_access(text, text) from public, anon;
grant execute on function public.oauth_app_access(text, text) to authenticated;
