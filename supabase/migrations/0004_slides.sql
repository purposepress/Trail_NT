-- Optional slides for each day (up to 5), stored as images in a public bucket.
-- days.slides holds the storage paths in display order.

alter table public.days
  add column slides text[] not null default '{}'
  constraint days_slides_max check (cardinality(slides) <= 5);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('slides', 'slides', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']);

create policy "admins upload slides" on storage.objects
  for insert with check (bucket_id = 'slides' and private.is_admin());
create policy "admins replace slides" on storage.objects
  for update using (bucket_id = 'slides' and private.is_admin());
create policy "admins delete slides" on storage.objects
  for delete using (bucket_id = 'slides' and private.is_admin());
