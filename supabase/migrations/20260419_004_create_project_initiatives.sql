-- ============================================================
-- Migration: create project_initiatives + project_initiative_subtasks
-- someday-pm · 2026-04-19
-- Evolving stage: initiative cards with nested subtask checklists.
-- ============================================================

-- ------------------------------------------------------------
-- 1. project_initiatives
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.project_initiatives (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id   UUID        NOT NULL DEFAULT auth.uid()
                              REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id      UUID        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title           TEXT        NOT NULL DEFAULT '',
  body            TEXT,
  sort_order      INTEGER     NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS project_initiatives_project_sort_idx
  ON public.project_initiatives (project_id, sort_order);

CREATE TRIGGER project_initiatives_set_updated_at
  BEFORE UPDATE ON public.project_initiatives
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.project_initiatives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_initiatives_select_own"
  ON public.project_initiatives FOR SELECT
  USING (owner_user_id = auth.uid());

CREATE POLICY "project_initiatives_insert_own"
  ON public.project_initiatives FOR INSERT
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "project_initiatives_update_own"
  ON public.project_initiatives FOR UPDATE
  USING (owner_user_id = auth.uid());

CREATE POLICY "project_initiatives_delete_own"
  ON public.project_initiatives FOR DELETE
  USING (owner_user_id = auth.uid());

-- ------------------------------------------------------------
-- 2. project_initiative_subtasks
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.project_initiative_subtasks (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id   UUID        NOT NULL DEFAULT auth.uid()
                              REFERENCES auth.users(id) ON DELETE CASCADE,
  initiative_id   UUID        NOT NULL REFERENCES public.project_initiatives(id) ON DELETE CASCADE,
  text            TEXT        NOT NULL,
  completed       BOOLEAN     NOT NULL DEFAULT false,
  sort_order      INTEGER     NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS project_initiative_subtasks_initiative_sort_idx
  ON public.project_initiative_subtasks (initiative_id, sort_order);

ALTER TABLE public.project_initiative_subtasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_initiative_subtasks_select_own"
  ON public.project_initiative_subtasks FOR SELECT
  USING (owner_user_id = auth.uid());

CREATE POLICY "project_initiative_subtasks_insert_own"
  ON public.project_initiative_subtasks FOR INSERT
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "project_initiative_subtasks_update_own"
  ON public.project_initiative_subtasks FOR UPDATE
  USING (owner_user_id = auth.uid());

CREATE POLICY "project_initiative_subtasks_delete_own"
  ON public.project_initiative_subtasks FOR DELETE
  USING (owner_user_id = auth.uid());
