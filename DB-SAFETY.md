# DB safety — project work items (post–card migration)

Short reference for **which data is canonical** and what to avoid in new code. No destructive DB guidance here; old tables are kept for rollback safety.

## Canonical source of truth (app)

| Feature | Stage / module | Read / write | Tables |
|--------|----------------|--------------|--------|
| **Starting** tasks | `starting` → `tasks` | `CardListModule` + `projectCards.js` | **`project_cards`** |
| **Maintaining** board | `maintaining` → `board` | `CardBoardModule` + `projectCards.js` | **`project_cards`** |
| **Evolving** initiatives | `evolving` → `initiatives` | `CardInitiativesModule` + `projectCards.js` | **`project_cards`**, **`project_card_items`** (checklists) |
| **Planning** to-dos | `planning` → `planning_tasks` | `TaskListModule` + `projectTasks.js` | **`project_tasks`** only |

Checklist rows for evolving initiatives live in **`project_card_items`** (`card_id` → `project_cards.id`).

## Active vs legacy (database)

- **Active:** `project_cards`, `project_card_items`, `project_tasks` (planning `planning_tasks` only).
- **Legacy (not used by shipped UI):** `project_initiatives`, `project_initiative_subtasks`. Data was copied into cards/items in migration `20260419_009_create_project_cards.sql`; tables remain on purpose. The old client module `src/lib/projectInitiatives.js` was removed from the repo (nothing imported it); use `projectCards.js` only.

## Stale migrated copies (do not treat as truth)

After migration **009**, rows that used to live in **`project_tasks`** (starting/maintaining-style keys) were **inserted into `project_cards` with the same UUIDs**. The app **only updates `project_cards`** for those modules now. Matching rows in **`project_tasks`** for those `module_key` values are **stale** — not shown and not updated by the current UI.

Do **not** build new features, analytics, or admin tools on **`project_tasks`** for starting/maintaining/evolving work, or on **`project_initiatives`** / **`project_initiative_subtasks`**.

## Future feature work

- Use **`src/lib/projectCards.js`** for any new “work card” behavior in starting, maintaining, or evolving (including new `module_key` slots if you add them).
- Use **`src/lib/projectTasks.js`** only for **planning** list tasks (`TaskListModule` / `planning_tasks`), unless you intentionally migrate planning to cards later (that would be a product + migration project).
