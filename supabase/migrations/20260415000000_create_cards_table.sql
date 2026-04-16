-- ============================================================
-- Migration: create cards table
-- someday-pm · 2026-04-15
-- ============================================================

-- ------------------------------------------------------------
-- 1. Table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cards (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id        UUID        NOT NULL DEFAULT auth.uid()
                                   REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_card_id       UUID        REFERENCES public.cards(id) ON DELETE CASCADE,
  title                TEXT        NOT NULL,
  category             TEXT        NOT NULL,
  deliverable_due_date DATE,
  notes                TEXT,
  sort_order           INTEGER     NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Root cards must use root categories; child cards must use child categories.
  CONSTRAINT cards_category_valid CHECK (
    CASE
      WHEN parent_card_id IS NULL THEN
        category IN ('Experiment', 'Work Tool', 'Favor', 'Potential Client', 'Paying Client')
      ELSE
        category IN ('To Do', 'Need Help', 'Unsure', 'Finished')
    END
  )
);

-- ------------------------------------------------------------
-- 2. Indexes
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS cards_owner_idx        ON public.cards (owner_user_id);
CREATE INDEX IF NOT EXISTS cards_parent_idx       ON public.cards (parent_card_id);
CREATE INDEX IF NOT EXISTS cards_sort_order_idx   ON public.cards (owner_user_id, sort_order);

-- ------------------------------------------------------------
-- 3. Depth enforcement (max 2 levels: root → child only)
--    A child card's parent must itself be a root card.
--    This prevents grandchildren without a recursive depth column.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_card_depth()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.parent_card_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1
      FROM public.cards
      WHERE id = NEW.parent_card_id
        AND parent_card_id IS NOT NULL
    ) THEN
      RAISE EXCEPTION
        'Max depth exceeded: parent card % is itself a child card. Only root cards may have children.',
        NEW.parent_card_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_card_depth
  BEFORE INSERT OR UPDATE OF parent_card_id ON public.cards
  FOR EACH ROW EXECUTE FUNCTION public.check_card_depth();

-- ------------------------------------------------------------
-- 4. Auto-update updated_at
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER cards_set_updated_at
  BEFORE UPDATE ON public.cards
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ------------------------------------------------------------
-- 5. Row-Level Security
-- ------------------------------------------------------------
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cards_select_own"
  ON public.cards FOR SELECT
  USING (owner_user_id = auth.uid());

CREATE POLICY "cards_insert_own"
  ON public.cards FOR INSERT
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "cards_update_own"
  ON public.cards FOR UPDATE
  USING (owner_user_id = auth.uid());

CREATE POLICY "cards_delete_own"
  ON public.cards FOR DELETE
  USING (owner_user_id = auth.uid());
