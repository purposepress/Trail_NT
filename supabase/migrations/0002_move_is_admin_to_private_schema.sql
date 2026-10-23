-- Keep the admin check out of the public API (Supabase security advisor).
create schema if not exists private;
grant usage on schema private to anon, authenticated;
alter function public.is_admin() set schema private;
alter function private.is_admin() set search_path = public;
