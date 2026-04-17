-- ============================================================
-- Migration: public profiles + card public metadata
-- someday-pm · 2026-04-18
-- ============================================================

-- ------------------------------------------------------------
-- 1. profiles table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  handle        TEXT        NOT NULL UNIQUE,
  display_name  TEXT        NOT NULL DEFAULT '',
  bio           TEXT        NOT NULL DEFAULT '',
  contact_info  TEXT        NOT NULL DEFAULT '',
  is_public     BOOLEAN     NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT profiles_bio_length        CHECK (char_length(bio) <= 500),
  CONSTRAINT profiles_contact_length    CHECK (char_length(contact_info) <= 200),
  -- handle: lowercase alphanumeric + hyphens, 3–30 chars, no leading/trailing hyphen
  CONSTRAINT profiles_handle_format     CHECK (handle ~ '^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$')
);

CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON public.profiles (user_id);
CREATE INDEX IF NOT EXISTS profiles_handle_idx  ON public.profiles (handle);

-- reuses the set_updated_at() function from the cards migration
CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ------------------------------------------------------------
-- 2. profiles RLS
-- ------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Public visitors (auth.uid() = NULL) can read public profiles;
-- owners can always read their own even when private.
CREATE POLICY "profiles_select_public_or_own"
  ON public.profiles FOR SELECT
  USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "profiles_delete_own"
  ON public.profiles FOR DELETE
  USING (user_id = auth.uid());

-- ------------------------------------------------------------
-- 3. card_public_meta table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.card_public_meta (
  id                        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id                   UUID        NOT NULL UNIQUE REFERENCES public.cards(id) ON DELETE CASCADE,
  owner_user_id             UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public                 BOOLEAN     NOT NULL DEFAULT false,
  public_title              TEXT        NOT NULL DEFAULT '',
  public_description        TEXT        NOT NULL DEFAULT '',
  link_1                    TEXT        NOT NULL DEFAULT '',
  link_2                    TEXT        NOT NULL DEFAULT '',
  link_3                    TEXT        NOT NULL DEFAULT '',
  looking_for_collaborators BOOLEAN     NOT NULL DEFAULT false,
  collaborator_type         TEXT        NOT NULL DEFAULT '',
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT card_meta_title_length       CHECK (char_length(public_title) <= 100),
  CONSTRAINT card_meta_desc_length        CHECK (char_length(public_description) <= 500),
  CONSTRAINT card_meta_collab_type_length CHECK (char_length(collaborator_type) <= 200)
);

CREATE INDEX IF NOT EXISTS card_public_meta_card_id_idx ON public.card_public_meta (card_id);
CREATE INDEX IF NOT EXISTS card_public_meta_owner_idx   ON public.card_public_meta (owner_user_id);

CREATE TRIGGER card_public_meta_set_updated_at
  BEFORE UPDATE ON public.card_public_meta
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ------------------------------------------------------------
-- 4. card_public_meta RLS
-- ------------------------------------------------------------
ALTER TABLE public.card_public_meta ENABLE ROW LEVEL SECURITY;

-- Owner always sees their own rows; public visitors see a card only when
-- both the card meta AND the owner's profile are marked public.
CREATE POLICY "card_public_meta_select"
  ON public.card_public_meta FOR SELECT
  USING (
    owner_user_id = auth.uid()
    OR (
      is_public = true
      AND EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = card_public_meta.owner_user_id
          AND p.is_public = true
      )
    )
  );

CREATE POLICY "card_public_meta_insert_own"
  ON public.card_public_meta FOR INSERT
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "card_public_meta_update_own"
  ON public.card_public_meta FOR UPDATE
  USING (owner_user_id = auth.uid());

CREATE POLICY "card_public_meta_delete_own"
  ON public.card_public_meta FOR DELETE
  USING (owner_user_id = auth.uid());
