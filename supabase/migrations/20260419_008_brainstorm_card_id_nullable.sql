-- Make card_id nullable so new project-based boards (project_id only) can be inserted.
-- Old boards retain their card_id value; new boards set project_id instead.
-- This completes the coexistence migration started in 006.
ALTER TABLE public.brainstorm_boards
  ALTER COLUMN card_id DROP NOT NULL;
