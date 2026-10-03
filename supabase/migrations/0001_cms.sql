-- CMS schema for trentonrush.com
-- Applied to project ijkpihtqxwdacbshsowz (also runnable from the dashboard SQL editor).

-- Profiles: one row per signed-up user, carrying their role.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- Functions in `public` are callable over the API by default; lock them down.
-- The trigger function should never be called directly. is_admin() is used by
-- RLS policies, which run as the signed-in user, so only `authenticated` needs it.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Users can read their own profile. Roles are only changed from the dashboard/SQL.
create policy "read own profile" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));

-- Site content: one row per section (about, positions, skills, ...), stored as JSON.
create table if not exists public.site_content (
  key text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id)
);

alter table public.site_content enable row level security;

create policy "anyone can read content" on public.site_content
  for select to anon, authenticated
  using (true);

create policy "admins can insert content" on public.site_content
  for insert to authenticated
  with check (public.is_admin());

create policy "admins can update content" on public.site_content
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admins can delete content" on public.site_content
  for delete to authenticated
  using (public.is_admin());

-- Public bucket for images used by projects.
insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do nothing;

create policy "admins can upload images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'site-images' and public.is_admin());

create policy "admins can update images" on storage.objects
  for update to authenticated
  using (bucket_id = 'site-images' and public.is_admin());

create policy "admins can delete images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'site-images' and public.is_admin());

-- After signing up on the site, promote yourself (replace the email):
--   update public.profiles set role = 'admin' where email = 'trush081@gmail.com';
