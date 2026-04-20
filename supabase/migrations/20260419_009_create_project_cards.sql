-- ============================================================
-- Migration: create project_cards + project_card_items
-- someday-pm · 2026-04-19
-- Replaces project_tasks (Starting) and project_initiatives
-- (Evolving) with a single reusable work-card foundation.
-- Starting  → CardListModule   (status: open / done)
-- Maintaining → CardBoardModule (status maps to column)
-- Evolving  → CardInitiativesModule (planning cards + checklist)
-- ============================================================

-- ------------------------------------------------------------
-- 1. project_cards
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.project_cards (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id   UUID        NOT NULL DEFAULT auth.uid()
                              REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id      UUID        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  stage_key       TEXT        NOT NULL,
  module_key      TEXT        NOT NULL,
  title           TEXT        NOT NULL DEFAULT '',
  body            TEXT,
  status          TEXT        NOT NULL DEFAULT 'open',
  labels          TEXT[]      NOT NULL DEFAULT '{}',
  due_date        DATE,
  sort_order      INTEGER     NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS project_cards_project_module_idx
  ON public.project_cards (project_id, module_key, sort_order);

CREATE INDEX IF NOT EXISTS project_cards_status_idx
  ON public.project_cards (project_id, status);

CREATE TRIGGER project_cards_set_updated_at
  BEFORE UPDATE ON public.project_cards
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.project_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_cards_select_own"
  ON public.project_cards FOR SELECT
  USING (owner_user_id = auth.uid());

CREATE POLICY "project_cards_insert_own"
  ON public.project_cards FOR INSERT
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "project_cards_update_own"
  ON public.project_cards FOR UPDATE
  USING (owner_user_id = auth.uid());

CREATE POLICY "project_cards_delete_own"
  ON public.project_cards FOR DELETE
  USING (owner_user_id = auth.uid());

-- ------------------------------------------------------------
-- 2. project_card_items (checklist items)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.project_card_items (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id   UUID        NOT NULL DEFAULT auth.uid()
                              REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id         UUID        NOT NULL REFERENCES public.project_cards(id) ON DELETE CASCADE,
  text            TEXT        NOT NULL DEFAULT '',
  completed       BOOLEAN     NOT NULL DEFAULT false,
  sort_order      INTEGER     NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS project_card_items_card_sort_idx
  ON public.project_card_items (card_id, sort_order);

ALTER TABLE public.project_card_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_card_items_select_own"
  ON public.project_card_items FOR SELECT
  USING (owner_user_id = auth.uid());

CREATE POLICY "project_card_items_insert_own"
  ON public.project_card_items FOR INSERT
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "project_card_items_update_own"
  ON public.project_card_items FOR UPDATE
  USING (owner_user_id = auth.uid());

CREATE POLICY "project_card_items_delete_own"
  ON public.project_card_items FOR DELETE
  USING (owner_user_id = auth.uid());

-- ------------------------------------------------------------
-- 3. Migrate existing data from project_tasks
--    label TEXT → labels TEXT[] (one-element array or empty)
-- ------------------------------------------------------------
INSERT INTO public.project_cards (
  id, owner_user_id, project_id, stage_key, module_key,
  title, body, status, labels, sort_order, created_at, updated_at
)
SELECT
  id, owner_user_id, project_id, stage_key, module_key,
  title, body, status,
  CASE WHEN label IS NOT NULL AND label <> '' THEN ARRAY[label] ELSE '{}' END,
  sort_order, created_at, updated_at
FROM public.project_tasks
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- 4. Migrate existing data from project_initiatives
--    stage_key and module_key were not stored on initiatives;
--    all belong to the evolving / initiatives slot.
-- ------------------------------------------------------------
INSERT INTO public.project_cards (
  id, owner_user_id, project_id, stage_key, module_key,
  title, body, status, labels, sort_order, created_at, updated_at
)
SELECT
  id, owner_user_id, project_id,
  'evolving', 'initiatives',
  title, body, 'open', '{}',
  sort_order, created_at, updated_at
FROM public.project_initiatives
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- 5. Migrate project_initiative_subtasks → project_card_items
--    initiative_id = card_id (same UUIDs after step 4)
-- ------------------------------------------------------------
INSERT INTO public.project_card_items (
  id, owner_user_id, card_id, text, completed, sort_order, created_at
)
SELECT id, owner_user_id, initiative_id, text, completed, sort_order, created_at
FROM public.project_initiative_subtasks
ON CONFLICT (id) DO NOTHING;

-- Old tables (project_tasks, project_initiatives, project_initiative_subtasks)
-- are intentionally left in place for rollback safety.
-- Drop them manually once the new system is verified in production.
