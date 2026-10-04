-- App registry, groups, and per-app access.
--
-- An app is something people open from the dashboard:
--   internal - a page inside this site (/dashboard/apps/<slug>)
--   shared   - a separate project on a trentonrush.com subdomain that uses this
--              Supabase project for sign-in and calls has_app_access(slug)
--   external - a link to a third-party tool or a project with its own sign-in
--
-- Visibility:
--   public     - anyone, signed in or not
--   members    - any signed-in user
--   restricted - admins/owners, plus users granted access directly or via a group

create table public.apps (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 60),
  name text not null check (length(name) between 1 and 100),
  description text not null default '' check (length(description) <= 1000),
  icon_url text,
  kind text not null check (kind in ('internal', 'shared', 'external')),
  url text check (url is null or url ~* '^https?://'),
  visibility text not null default 'restricted' check (visibility in ('public', 'members', 'restricted')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- shared and external apps live elsewhere, so they need a URL
  constraint apps_url_required check (kind = 'internal' or url is not null)
);

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (length(name) between 1 and 60),
  description text not null default '' check (length(description) <= 500),
  created_at timestamptz not null default now()
);

create table public.group_members (
  group_id uuid not null references public.groups (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  primary key (group_id, user_id)
);

-- One row per grant, to either a single user or a whole group.
create table public.app_access (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.apps (id) on delete cascade,
  user_id uuid references auth.users (id) on delete cascade,
  group_id uuid references public.groups (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint app_access_one_target check ((user_id is null) <> (group_id is null))
);

create unique index app_access_app_user_key on public.app_access (app_id, user_id) where user_id is not null;
create unique index app_access_app_group_key on public.app_access (app_id, group_id) where group_id is not null;
create index app_access_user_id_idx on public.app_access (user_id);
create index app_access_group_id_idx on public.app_access (group_id);
create index group_members_user_id_idx on public.group_members (user_id);

alter table public.apps enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.app_access enable row level security;

-- The single source of truth for "can the current user open this app?".
-- SECURITY DEFINER so it can read the access tables, which are owner-only.
create or replace function public.can_access_app(target_app uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.apps a
    where a.id = target_app
      and (
        a.visibility = 'public'
        or ((select auth.uid()) is not null and (
          a.visibility = 'members'
          or public.is_admin()
          or exists (
            select 1 from public.app_access x
            where x.app_id = a.id and x.user_id = (select auth.uid())
          )
          or exists (
            select 1
            from public.app_access x
            join public.group_members m on m.group_id = x.group_id
            where x.app_id = a.id and m.user_id = (select auth.uid())
          )
        ))
      )
  );
$$;

-- Slug-based wrapper for other projects: supabase.rpc('has_app_access', { app_slug: 'granite' })
create or replace function public.has_app_access(app_slug text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select public.can_access_app(a.id) from public.apps a where a.slug = app_slug),
    false
  );
$$;

-- Both are safe for anyone to call: they only answer for the caller, and return
-- true to signed-out visitors only for public apps.
revoke execute on function public.can_access_app(uuid) from public;
revoke execute on function public.has_app_access(text) from public;
grant execute on function public.can_access_app(uuid) to anon, authenticated;
grant execute on function public.has_app_access(text) to anon, authenticated;

-- Apps: everyone sees what they can open; owners see and manage everything.
create policy "read accessible apps" on public.apps
  for select to anon, authenticated
  using (public.can_access_app(id) or (select public.is_owner()));

create policy "owners insert apps" on public.apps
  for insert to authenticated with check ((select public.is_owner()));
create policy "owners update apps" on public.apps
  for update to authenticated using ((select public.is_owner())) with check ((select public.is_owner()));
create policy "owners delete apps" on public.apps
  for delete to authenticated using ((select public.is_owner()));

-- Groups, memberships, and grants are managed by owners only.
create policy "owners manage groups" on public.groups
  for all to authenticated using ((select public.is_owner())) with check ((select public.is_owner()));
create policy "owners manage group members" on public.group_members
  for all to authenticated using ((select public.is_owner())) with check ((select public.is_owner()));
create policy "owners manage app access" on public.app_access
  for all to authenticated using ((select public.is_owner())) with check ((select public.is_owner()));

-- Replace an app's grants (or a group's members) in one transaction.
-- SECURITY INVOKER: row-level security above still limits these to owners.
create or replace function public.set_app_access(target_app uuid, user_ids uuid[], group_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not public.is_owner() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  delete from public.app_access where app_id = target_app;
  insert into public.app_access (app_id, user_id)
    select target_app, u from unnest(coalesce(user_ids, '{}')) as u;
  insert into public.app_access (app_id, group_id)
    select target_app, g from unnest(coalesce(group_ids, '{}')) as g;
end;
$$;

create or replace function public.set_group_members(target_group uuid, user_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not public.is_owner() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  delete from public.group_members where group_id = target_group;
  insert into public.group_members (group_id, user_id)
    select target_group, u from unnest(coalesce(user_ids, '{}')) as u;
end;
$$;

revoke execute on function public.set_app_access(uuid, uuid[], uuid[]) from public, anon;
revoke execute on function public.set_group_members(uuid, uuid[]) from public, anon;
grant execute on function public.set_app_access(uuid, uuid[], uuid[]) to authenticated;
grant execute on function public.set_group_members(uuid, uuid[]) to authenticated;
