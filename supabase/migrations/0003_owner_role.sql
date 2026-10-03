-- Owner role: everything an admin can do, plus managing users.

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('user', 'admin', 'owner'));

-- Owners count as admins for content editing.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles where id = (select auth.uid()) and role in ('admin', 'owner')
  );
$$;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles where id = (select auth.uid()) and role = 'owner'
  );
$$;

revoke execute on function public.is_owner() from public, anon;
grant execute on function public.is_owner() to authenticated;

-- Owners can see every profile (to list users).
create policy "owners read all profiles" on public.profiles
  for select to authenticated
  using ((select public.is_owner()));

-- Role changes go through this function instead of a direct UPDATE policy, so the
-- rules below can't be bypassed: only owners may call it, nobody can change their
-- own role or an owner's role, and nobody can be promoted to owner from the site.
create or replace function public.set_user_role(target uuid, new_role text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_owner() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  if new_role not in ('user', 'admin') then
    raise exception 'Role must be user or admin' using errcode = '22023';
  end if;
  if target = (select auth.uid()) then
    raise exception 'You cannot change your own role' using errcode = '42501';
  end if;
  if exists (select 1 from public.profiles where id = target and role = 'owner') then
    raise exception 'Owner roles can only be changed in the database' using errcode = '42501';
  end if;

  update public.profiles set role = new_role where id = target;
  if not found then
    raise exception 'User not found' using errcode = 'P0002';
  end if;
end;
$$;

revoke execute on function public.set_user_role(uuid, text) from public, anon;
grant execute on function public.set_user_role(uuid, text) to authenticated;

-- Make the site owner an owner.
update public.profiles set role = 'owner' where email = 'trush081@gmail.com';
