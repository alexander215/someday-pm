-- ============================================================
-- Migration: feedback system — table, admin gate, RLS
-- someday-pm · 2026-04-17
-- ============================================================


-- ------------------------------------------------------------
-- 1. admin_users allowlist
--    Keyed by auth user id. Rows are inserted manually by you.
--    No email stored here — look up by user id via the dashboard.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id    UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- A user can only see their own row — enough to self-check admin status.
CREATE POLICY "admin_users_select_self"
  ON public.admin_users FOR SELECT
  USING (user_id = auth.uid());

-- No client-side insert/update/delete — admin rows are managed via the
-- Supabase dashboard or service-role migrations only.


-- ------------------------------------------------------------
-- 2. is_admin() helper
--    SECURITY DEFINER so it bypasses RLS on admin_users
--    when called from other policies. SET search_path pins
--    the schema to prevent search-path injection.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
  );
$$;


-- ------------------------------------------------------------
-- 3. feedback_reports table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.feedback_reports (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id   UUID        NOT NULL DEFAULT auth.uid()
                              REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT        NULL,
  type            TEXT        NOT NULL,
  message         TEXT        NOT NULL,
  page_url        TEXT        NULL,
  attachment_path TEXT        NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT feedback_type_valid CHECK (type IN ('Bug', 'Suggestion', 'Question'))
);

CREATE INDEX IF NOT EXISTS feedback_reports_owner_idx
  ON public.feedback_reports (owner_user_id);

CREATE INDEX IF NOT EXISTS feedback_reports_created_idx
  ON public.feedback_reports (created_at DESC);


-- ------------------------------------------------------------
-- 4. RLS for feedback_reports
-- ------------------------------------------------------------
ALTER TABLE public.feedback_reports ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can submit their own feedback.
CREATE POLICY "feedback_insert_own"
  ON public.feedback_reports FOR INSERT
  WITH CHECK (owner_user_id = auth.uid());

-- Users can read back their own submissions (e.g. "my reports" view later).
CREATE POLICY "feedback_select_own"
  ON public.feedback_reports FOR SELECT
  USING (owner_user_id = auth.uid());

-- Admins can read all submissions. Combined with the policy above via OR.
CREATE POLICY "feedback_select_admin"
  ON public.feedback_reports FOR SELECT
  USING (public.is_admin());
