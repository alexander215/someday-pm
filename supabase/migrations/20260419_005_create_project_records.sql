-- ============================================================
-- Migration: create project_records table
-- someday-pm · 2026-04-19
-- Planning-stage simple structured cards: personas, option cards, notes.
-- The `fields` JSONB is intentionally bounded to display-only extras
-- that are never used as query filter criteria.
-- If a field ever needs to be queried, promote it to a real column.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.project_records (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id   UUID        NOT NULL DEFAULT auth.uid()
                              REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id      UUID        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  stage_key       TEXT        NOT NULL DEFAULT 'planning',
  module_key      TEXT        NOT NULL,
  record_type     TEXT        NOT NULL,
  title           TEXT        NOT NULL DEFAULT '',
  body            TEXT,
  fields          JSONB       NOT NULL DEFAULT '{}',
  sort_order      INTEGER     NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 2. Indexes
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS project_records_project_module_idx
  ON public.project_records (project_id, module_key, sort_order);

-- ------------------------------------------------------------
-- 3. Auto-update updated_at
-- ------------------------------------------------------------
CREATE TRIGGER project_records_set_updated_at
  BEFORE UPDATE ON public.project_records
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ------------------------------------------------------------
-- 4. Row-Level Security
-- ------------------------------------------------------------
ALTER TABLE public.project_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_records_select_own"
  ON public.project_records FOR SELECT
  USING (owner_user_id = auth.uid());

CREATE POLICY "project_records_insert_own"
  ON public.project_records FOR INSERT
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "project_records_update_own"
  ON public.project_records FOR UPDATE
  USING (owner_user_id = auth.uid());

CREATE POLICY "project_records_delete_own"
  ON public.project_records FOR DELETE
  USING (owner_user_id = auth.uid());
