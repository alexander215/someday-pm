-- Replaces the flat brainstorm_items table with a 2-level structure.
-- Run this after (or instead of) 20260416_create_brainstorm_items.sql.
drop table if exists brainstorm_items cascade;

-- Brainstorm topic cards (named ideation sessions per project)
create table if not exists brainstorm_cards (
  id              uuid primary key default gen_random_uuid(),
  card_id         uuid not null references cards(id) on delete cascade,
  owner_user_id   uuid not null default auth.uid(),
  title           text not null,
  created_at      timestamptz not null default now()
);

alter table brainstorm_cards enable row level security;

create policy "Users manage their own brainstorm cards"
  on brainstorm_cards for all
  using (owner_user_id = auth.uid());

-- Brainstorm entries (ideas inside a topic card)
create table if not exists brainstorm_entries (
  id                 uuid primary key default gen_random_uuid(),
  brainstorm_card_id uuid not null references brainstorm_cards(id) on delete cascade,
  owner_user_id      uuid not null default auth.uid(),
  text               text not null,
  score              int null check (score between 1 and 10),
  created_at         timestamptz not null default now()
);

alter table brainstorm_entries enable row level security;

create policy "Users manage their own brainstorm entries"
  on brainstorm_entries for all
  using (owner_user_id = auth.uid());
