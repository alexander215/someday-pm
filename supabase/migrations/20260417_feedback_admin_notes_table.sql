-- ============================================================
-- Migration: move admin_notes out of feedback_reports into a
--            dedicated admin-only table
-- someday-pm · 2026-04-17
-- ============================================================

-- ------------------------------------------------------------
-- 1. Create feedback_admin_notes
--    One row per feedback report, admin-only at the RLS layer.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.feedback_admin_notes (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_report_id UUID        NOT NULL
                                 REFERENCES public.feedback_reports (id)
                                 ON DELETE CASCADE,
  notes              TEXT        NOT NULL DEFAULT '',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (feedback_report_id)
);

-- Keep updated_at current on every write
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER feedback_admin_notes_updated_at
  BEFORE UPDATE ON public.feedback_admin_notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ------------------------------------------------------------
-- 2. RLS — admins only, no non-admin access at all
-- ------------------------------------------------------------
ALTER TABLE public.feedback_admin_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_notes_select"
  ON public.feedback_admin_notes FOR SELECT
  USING (public.is_admin());

CREATE POLICY "admin_notes_insert"
  ON public.feedback_admin_notes FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "admin_notes_update"
  ON public.feedback_admin_notes FOR UPDATE
  USING  (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "admin_notes_delete"
  ON public.feedback_admin_notes FOR DELETE
  USING (public.is_admin());

-- ------------------------------------------------------------
-- 3. Migrate any existing admin_notes data, then drop the column
-- ------------------------------------------------------------
INSERT INTO public.feedback_admin_notes (feedback_report_id, notes)
SELECT id, admin_notes
FROM   public.feedback_reports
WHERE  admin_notes IS NOT NULL AND admin_notes <> ''
ON CONFLICT (feedback_report_id) DO NOTHING;

ALTER TABLE public.feedback_reports
  DROP COLUMN IF EXISTS admin_notes;
