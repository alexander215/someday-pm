-- Lightweight per-project to-do checklist items
create table if not exists todos (
  id              uuid primary key default gen_random_uuid(),
  card_id         uuid not null references cards(id) on delete cascade,
  text            text not null,
  completed       boolean not null default false,
  sort_order      bigint not null default 0,
  created_at      timestamptz not null default now(),
  owner_user_id   uuid not null default auth.uid()
);

alter table todos enable row level security;

create policy "Users manage their own todos"
  on todos for all
  using (owner_user_id = auth.uid());
