-- When someone approved an app before, Supabase skips consent and the consent page only
-- learns the callback URL, so oauth_app_access() looks the app up by URL. If two apps
-- shared a callback URL, `limit 1` picked one arbitrarily and the wrong app's access rules
-- could apply. Now a callback URL only identifies an app when exactly one app uses it;
-- otherwise no row is returned, which the consent page treats as "deny".
-- (saveApp also refuses to register a callback URL another app already uses.)

create or replace function public.oauth_app_access(p_client_id text default null, p_redirect_uri text default null)
returns table (app_name text, allowed boolean)
language sql
stable
security definer
set search_path = ''
as $$
  with matches as (
    select a.id, a.name
    from public.apps a
    where a.kind = 'oauth'
      and (
        (p_client_id is not null and a.oauth_client_id = p_client_id)
        or (p_client_id is null and p_redirect_uri is not null and p_redirect_uri = any (a.oauth_redirect_uris))
      )
  )
  select m.name, public.can_access_app(m.id)
  from matches m
  where (select count(*) from matches) = 1;
$$;

revoke execute on function public.oauth_app_access(text, text) from public, anon;
grant execute on function public.oauth_app_access(text, text) to authenticated;
