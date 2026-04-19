-- ============================================================
-- Migration: create project_tasks table
-- someday-pm · 2026-04-19
-- Covers tasks in all stages (Starting, Maintaining board, Planning optional tasks).
-- Structurally identical across stages; the UI renders them differently per stage.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.project_tasks (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id   UUID        NOT NULL DEFAULT auth.uid()
                              REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id      UUID        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  stage_key       TEXT        NOT NULL,
  module_key      TEXT        NOT NULL,
  title           TEXT        NOT NULL DEFAULT '',
  body            TEXT,
  status          TEXT        NOT NULL DEFAULT 'open',
  label           TEXT,
  sort_order      INTEGER     NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 2. Indexes
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS project_tasks_project_module_idx
  ON public.project_tasks (project_id, module_key, sort_order);

CREATE INDEX IF NOT EXISTS project_tasks_status_idx
  ON public.project_tasks (project_id, status);

-- ------------------------------------------------------------
-- 3. Auto-update updated_at
-- ------------------------------------------------------------
CREATE TRIGGER project_tasks_set_updated_at
  BEFORE UPDATE ON public.project_tasks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ------------------------------------------------------------
-- 4. Row-Level Security
-- ------------------------------------------------------------
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_tasks_select_own"
  ON public.project_tasks FOR SELECT
  USING (owner_user_id = auth.uid());

CREATE POLICY "project_tasks_insert_own"
  ON public.project_tasks FOR INSERT
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "project_tasks_update_own"
  ON public.project_tasks FOR UPDATE
  USING (owner_user_id = auth.uid());

CREATE POLICY "project_tasks_delete_own"
  ON public.project_tasks FOR DELETE
  USING (owner_user_id = auth.uid());
