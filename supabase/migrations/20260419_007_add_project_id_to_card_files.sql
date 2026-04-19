-- ============================================================
-- Migration: add project_id to card_files
-- someday-pm · 2026-04-19
-- Adds a project_id FK alongside the existing card_id column.
-- Coexistence approach: new files set project_id; old files retain card_id.
-- Table rename and card_id removal happen in Phase 10 cleanup migration.
-- ============================================================

ALTER TABLE public.card_files
  ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS card_files_project_id_idx
  ON public.card_files (project_id);
