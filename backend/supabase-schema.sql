create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  email text,
  google_sub text,
  password text not null,
  password_reset_code_hash text,
  password_reset_code_expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  recipe_name text not null,
  description text,
  image text,
  time text,
  category text default '',
  tags jsonb not null default '[]'::jsonb,
  instructions text default '',
  notes text default '',
  ingredients jsonb not null default '[]'::jsonb,
  is_pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists recipes_user_id_idx on public.recipes (user_id);
create index if not exists recipes_recipe_name_idx on public.recipes (recipe_name);
create unique index if not exists users_email_unique_idx on public.users (email) where email is not null;
create unique index if not exists users_google_sub_unique_idx on public.users (google_sub) where google_sub is not null;
