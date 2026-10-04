-- Shared sign-in across subdomains was dropped in favor of "Sign in with Trenton".
alter table public.apps drop constraint if exists apps_kind_check;
alter table public.apps
  add constraint apps_kind_check check (kind in ('internal', 'external', 'oauth'));

-- Only shared sign-in apps called this; the dashboard and consent page use can_access_app().
drop function if exists public.has_app_access(text);
