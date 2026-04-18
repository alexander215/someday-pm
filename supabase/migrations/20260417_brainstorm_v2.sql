-- Brainstorm V2: per-project boards, ideas with reaction states, notes, manual ordering.
-- Migrates data from brainstorm_cards / brainstorm_entries, then drops the old tables.

-- Brainstorm boards (named ideation sessions per project)
create table brainstorm_boards (
  id               uuid primary key default gen_random_uuid(),
  card_id          uuid not null references cards(id) on delete cascade,
  owner_user_id    uuid not null default auth.uid(),
  title            text not null,
  use_custom_order boolean not null default false,
  created_at       timestamptz not null default now()
);

alter table brainstorm_boards enable row level security;

create policy "Users manage their own brainstorm boards"
  on brainstorm_boards for all
  using (owner_user_id = auth.uid());

-- Brainstorm ideas (individual ideas within a board)
create table brainstorm_ideas (
  id            uuid primary key default gen_random_uuid(),
  board_id      uuid not null references brainstorm_boards(id) on delete cascade,
  owner_user_id uuid not null default auth.uid(),
  text          text not null,
  reaction      text not null default 'neutral' check (reaction in ('smile', 'neutral', 'sad')),
  note          text,
  sort_position integer,
  created_at    timestamptz not null default now()
);

alter table brainstorm_ideas enable row level security;

create policy "Users manage their own brainstorm ideas"
  on brainstorm_ideas for all
  using (owner_user_id = auth.uid());

-- Migrate existing data from old tables (no-op if tables don't exist)
do $$
begin
  if exists (select 1 from information_schema.tables where table_name = 'brainstorm_cards') then
    insert into brainstorm_boards (id, card_id, owner_user_id, title, created_at)
    select id, card_id, owner_user_id, title, created_at
    from brainstorm_cards;
  end if;

  if exists (select 1 from information_schema.tables where table_name = 'brainstorm_entries') then
    insert into brainstorm_ideas (id, board_id, owner_user_id, text, reaction, created_at)
    select id, brainstorm_card_id, owner_user_id, text, 'neutral', created_at
    from brainstorm_entries;
  end if;
end $$;

-- Drop old tables
drop table if exists brainstorm_entries cascade;
drop table if exists brainstorm_cards cascade;
