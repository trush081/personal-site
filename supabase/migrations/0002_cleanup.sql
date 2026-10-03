-- rls_auto_enable() is run by the `ensure_rls` event trigger to turn on RLS for new
-- public tables. It should never be called over the API; triggers don't need EXECUTE.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

-- Covering index for the updated_by foreign key (flagged by the performance advisor).
create index if not exists site_content_updated_by_idx on public.site_content (updated_by);
