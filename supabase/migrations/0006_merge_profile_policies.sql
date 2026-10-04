-- One SELECT policy instead of two (flagged by the performance advisor).
drop policy "read own profile" on public.profiles;
drop policy "owners read all profiles" on public.profiles;

create policy "read own profile, owners read all" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select public.is_owner()));
