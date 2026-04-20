-- ============================================================
-- Migration: create projects table
-- someday-pm · 2026-04-19
-- Replaces root cards as the top-level project entity.
-- template_key drives stage/module rendering via frontend config.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id     UUID        NOT NULL DEFAULT auth.uid()
                                REFERENCES auth.users(id) ON DELETE CASCADE,
  template_key      TEXT        NOT NULL DEFAULT 'general',
  title             TEXT        NOT NULL,
  description       TEXT,
  active_stage_key  TEXT,
  sort_order        INTEGER     NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 2. Indexes
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS projects_owner_idx      ON public.projects (owner_user_id);
CREATE INDEX IF NOT EXISTS projects_sort_order_idx ON public.projects (owner_user_id, sort_order);

-- ------------------------------------------------------------
-- 3. Auto-update updated_at
--    Reuses the set_updated_at() function from the cards migration.
-- ------------------------------------------------------------
CREATE TRIGGER projects_set_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ------------------------------------------------------------
-- 4. Row-Level Security
-- ------------------------------------------------------------
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "projects_select_own"
  ON public.projects FOR SELECT
  USING (owner_user_id = auth.uid());

CREATE POLICY "projects_insert_own"
  ON public.projects FOR INSERT
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "projects_update_own"
  ON public.projects FOR UPDATE
  USING (owner_user_id = auth.uid());

CREATE POLICY "projects_delete_own"
  ON public.projects FOR DELETE
  USING (owner_user_id = auth.uid());
