-- ============================================================
-- Migration: feedback completion fields + admin update policy
-- someday-pm · 2026-04-17
-- ============================================================

-- ------------------------------------------------------------
-- 1. Add completion fields to feedback_reports
-- ------------------------------------------------------------
ALTER TABLE public.feedback_reports
  ADD COLUMN IF NOT EXISTS is_complete   BOOLEAN     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS completed_at  TIMESTAMPTZ NULL;

-- Index for the Complete tab query (admin, is_complete = true, sorted by completed_at desc)
CREATE INDEX IF NOT EXISTS feedback_reports_complete_idx
  ON public.feedback_reports (is_complete, completed_at DESC)
  WHERE is_complete = true;


-- ------------------------------------------------------------
-- 2. RLS: admins can update completion fields
--    Non-admins get no UPDATE policy, so they cannot touch any row.
-- ------------------------------------------------------------
CREATE POLICY "feedback_update_admin"
  ON public.feedback_reports FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
