-- Email the author when a reader sends a question.
-- A trigger calls the notify-question Edge Function, which sends the email through Resend.

alter table public.author_questions add column if not exists notified_at timestamptz;

create extension if not exists pg_net with schema extensions;

create or replace function private.notify_new_question()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  -- Asynchronous: the reader's insert never waits on, or fails because of, the email.
  perform net.http_post(
    url := 'https://vfroirrwsxkxebyosdxb.supabase.co/functions/v1/notify-question',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  return new;
exception when others then
  return new;
end;
$$;

drop trigger if exists author_questions_notify on public.author_questions;
create trigger author_questions_notify
  after insert on public.author_questions
  for each row execute function private.notify_new_question();
