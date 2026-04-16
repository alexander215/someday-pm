-- ============================================================
-- Migration: create card_files metadata table
-- someday-pm · 2026-04-15
-- ============================================================

-- ------------------------------------------------------------
-- 1. Table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.card_files (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id         UUID        NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  owner_user_id   UUID        NOT NULL DEFAULT auth.uid()
                              REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_path    TEXT        NOT NULL UNIQUE,
  file_name       TEXT        NOT NULL,
  mime_type       TEXT        NOT NULL,
  file_size       BIGINT      NOT NULL CHECK (file_size > 0),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 2. Indexes
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS card_files_card_idx  ON public.card_files (card_id);
CREATE INDEX IF NOT EXISTS card_files_owner_idx ON public.card_files (owner_user_id);

-- ------------------------------------------------------------
-- 3. Row-Level Security
-- ------------------------------------------------------------
ALTER TABLE public.card_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "card_files_select_own"
  ON public.card_files FOR SELECT
  USING (owner_user_id = auth.uid());

CREATE POLICY "card_files_insert_own"
  ON public.card_files FOR INSERT
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "card_files_delete_own"
  ON public.card_files FOR DELETE
  USING (owner_user_id = auth.uid());
