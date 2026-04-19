-- ============================================================
-- Migration: create project_calendar_entries table
-- someday-pm · 2026-04-19
-- Marketing stage content calendar. All fields are real columns
-- because they are filtered and sorted in queries (platform, date, status).
-- ============================================================

-- ------------------------------------------------------------
-- 1. Table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.project_calendar_entries (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id   UUID        NOT NULL DEFAULT auth.uid()
                              REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id      UUID        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title           TEXT        NOT NULL DEFAULT '',
  body            TEXT,
  platform        TEXT        NOT NULL DEFAULT 'other',
  content_type    TEXT        NOT NULL DEFAULT 'other',
  status          TEXT        NOT NULL DEFAULT 'draft',
  scheduled_date  DATE,
  link            TEXT        NOT NULL DEFAULT '',
  owner           TEXT        NOT NULL DEFAULT '',
  sort_order      INTEGER     NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 2. Indexes
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS project_calendar_project_date_idx
  ON public.project_calendar_entries (project_id, scheduled_date);

CREATE INDEX IF NOT EXISTS project_calendar_project_status_idx
  ON public.project_calendar_entries (project_id, status);

CREATE INDEX IF NOT EXISTS project_calendar_project_sort_idx
  ON public.project_calendar_entries (project_id, sort_order);

-- ------------------------------------------------------------
-- 3. Auto-update updated_at
-- ------------------------------------------------------------
CREATE TRIGGER project_calendar_entries_set_updated_at
  BEFORE UPDATE ON public.project_calendar_entries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ------------------------------------------------------------
-- 4. Row-Level Security
-- ------------------------------------------------------------
ALTER TABLE public.project_calendar_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_calendar_entries_select_own"
  ON public.project_calendar_entries FOR SELECT
  USING (owner_user_id = auth.uid());

CREATE POLICY "project_calendar_entries_insert_own"
  ON public.project_calendar_entries FOR INSERT
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "project_calendar_entries_update_own"
  ON public.project_calendar_entries FOR UPDATE
  USING (owner_user_id = auth.uid());

CREATE POLICY "project_calendar_entries_delete_own"
  ON public.project_calendar_entries FOR DELETE
  USING (owner_user_id = auth.uid());
