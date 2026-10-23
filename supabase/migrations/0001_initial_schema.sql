-- The Trail: New Testament — initial Supabase schema
-- Content is written through the admin page; the iPhone/Android app reads only published days.
-- Readers' notes and progress stay on their own device and are never sent here.

-- ─────────────────────────────────────────────
-- Admins: who can sign in to the admin page and edit content
-- ─────────────────────────────────────────────
create table public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

alter table public.admins enable row level security;
create policy "admins can see admins" on public.admins
  for select using (public.is_admin());

-- ─────────────────────────────────────────────
-- Days: one row per stop on the trail (1–315)
-- ─────────────────────────────────────────────
create table public.days (
  day_number   integer primary key check (day_number between 1 and 315),
  title        text    not null default '',
  prayer       text    not null default '',           -- centering prayer
  reference    text    not null default '',           -- shown to readers, e.g. "Matthew 1:1-17"
  bible_search text    not null default '',           -- passed to Bible Gateway, usually the same as reference
  commentary   text    not null default '',           -- paragraphs separated by blank lines
  questions    text[]  not null default '{}',         -- small group questions, in order
  audio_path   text,                                  -- file in the commentary-audio bucket, e.g. "day-001.m4a"
  audio_seconds integer,                              -- length of the recording, for the player
  status       text    not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  updated_at   timestamptz not null default now()
);

create or replace function public.touch_day()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  if new.status = 'published' and (tg_op = 'INSERT' or old.status <> 'published') then
    new.published_at := now();
  end if;
  return new;
end;
$$;

create trigger days_touch
  before insert or update on public.days
  for each row execute function public.touch_day();

alter table public.days enable row level security;

-- Anyone using the app can read published days.
create policy "readers see published days" on public.days
  for select using (status = 'published' or public.is_admin());

-- Only admins can add, edit, or remove days.
create policy "admins insert days" on public.days for insert with check (public.is_admin());
create policy "admins update days" on public.days for update using (public.is_admin()) with check (public.is_admin());
create policy "admins delete days" on public.days for delete using (public.is_admin());

-- Pre-create all 315 days as empty drafts so the admin page can show the full trail.
insert into public.days (day_number)
select generate_series(1, 315);

-- ─────────────────────────────────────────────
-- Questions readers send to the author
-- ─────────────────────────────────────────────
create table public.author_questions (
  id           bigint generated always as identity primary key,
  day_number   integer references public.days (day_number),
  question     text not null check (char_length(question) between 1 and 4000),
  reader_name  text check (char_length(reader_name) <= 120),
  reader_email text check (char_length(reader_email) <= 254),  -- optional, only if they want a reply
  answered     boolean not null default false,
  created_at   timestamptz not null default now()
);

alter table public.author_questions enable row level security;

-- Readers can send a question but can't read anyone's questions.
create policy "readers send questions" on public.author_questions
  for insert with check (answered = false);
create policy "admins read questions" on public.author_questions
  for select using (public.is_admin());
create policy "admins update questions" on public.author_questions
  for update using (public.is_admin());

-- ─────────────────────────────────────────────
-- Audio recordings of the commentary
-- ─────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('commentary-audio', 'commentary-audio', true)
on conflict (id) do nothing;

create policy "admins upload audio" on storage.objects
  for insert with check (bucket_id = 'commentary-audio' and public.is_admin());
create policy "admins replace audio" on storage.objects
  for update using (bucket_id = 'commentary-audio' and public.is_admin());
create policy "admins delete audio" on storage.objects
  for delete using (bucket_id = 'commentary-audio' and public.is_admin());

-- After you create your own login in Supabase (Authentication → Users), make yourself an admin:
--   insert into public.admins (user_id)
--   select id from auth.users where email = 'you@example.com';
