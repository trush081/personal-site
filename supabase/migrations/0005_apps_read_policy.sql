-- Signed-out visitors can't execute is_owner(), so give them their own read policy.
drop policy "read accessible apps" on public.apps;

create policy "anyone reads accessible apps" on public.apps
  for select to anon
  using (public.can_access_app(id));

create policy "users read accessible apps" on public.apps
  for select to authenticated
  using (public.can_access_app(id) or (select public.is_owner()));
