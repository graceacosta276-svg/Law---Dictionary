-- Run this once in your Supabase project's SQL editor (Dashboard > SQL Editor > New query).
-- It creates the four tables the app needs and locks each row to its owner.

create extension if not exists "pgcrypto";

create table if not exists terms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  term text not null,
  category text not null,
  difficulty text not null check (difficulty in ('beginner', 'intermediate', 'advanced')),
  simple text not null default '',
  legal text not null default '',
  beginner text not null default '',
  why text not null default '',
  example text not null default '',
  memory_tip text not null default '',
  latin text,
  related_laws text[] not null default '{}',
  cases text[] not null default '{}',
  related text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  term_id uuid not null references terms(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, term_id)
);

create table if not exists term_notes (
  user_id uuid not null references auth.users(id) on delete cascade,
  term_id uuid not null references terms(id) on delete cascade,
  content text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, term_id)
);

create table if not exists recents (
  user_id uuid not null references auth.users(id) on delete cascade,
  term_id uuid not null references terms(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  primary key (user_id, term_id)
);

alter table terms enable row level security;
alter table favorites enable row level security;
alter table term_notes enable row level security;
alter table recents enable row level security;

create policy "Users manage their own terms" on terms
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their own favorites" on favorites
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their own notes" on term_notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their own recents" on recents
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Enable realtime updates so changes made on one device show up
-- live on other devices signed into the same account.
alter publication supabase_realtime add table terms;
alter publication supabase_realtime add table favorites;
alter publication supabase_realtime add table term_notes;
