alter table public.users add column if not exists email text;
alter table public.users add column if not exists google_sub text;
alter table public.users add column if not exists password_reset_code_hash text;
alter table public.users add column if not exists password_reset_code_expires_at timestamptz;

create unique index if not exists users_email_unique_idx on public.users (email) where email is not null;
create unique index if not exists users_google_sub_unique_idx on public.users (google_sub) where google_sub is not null;
