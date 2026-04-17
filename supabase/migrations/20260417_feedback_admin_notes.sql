-- ============================================================
-- Migration: admin_notes field on feedback_reports
-- someday-pm · 2026-04-17
-- ============================================================

-- ------------------------------------------------------------
-- 1. Add admin_notes column
--    Only admins can write this; non-admins already have no
--    UPDATE policy, so the existing feedback_update_admin
--    policy covers writes automatically.
-- ------------------------------------------------------------
ALTER TABLE public.feedback_reports
  ADD COLUMN IF NOT EXISTS admin_notes TEXT NULL;
