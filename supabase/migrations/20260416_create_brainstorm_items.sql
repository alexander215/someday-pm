-- Quick-capture idea items per project card
create table if not exists brainstorm_items (
  id              uuid primary key default gen_random_uuid(),
  card_id         uuid not null references cards(id) on delete cascade,
  owner_user_id   uuid not null default auth.uid(),
  text            text not null,
  score           int null check (score between 1 and 10),
  created_at      timestamptz not null default now()
);

alter table brainstorm_items enable row level security;

create policy "Users manage their own brainstorm items"
  on brainstorm_items for all
  using (owner_user_id = auth.uid());
