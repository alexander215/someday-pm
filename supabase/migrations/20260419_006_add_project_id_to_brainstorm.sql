-- ============================================================
-- Migration: add project_id to brainstorm_boards
-- someday-pm · 2026-04-19
-- Adds a project_id FK alongside the existing card_id column.
-- Coexistence approach: new boards set project_id; old boards retain card_id.
-- Old card_id column removed in Phase 10 cleanup migration.
-- ============================================================

ALTER TABLE public.brainstorm_boards
  ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;

-- module_key scopes boards to the specific template module (e.g. 'naming_brainstorm').
ALTER TABLE public.brainstorm_boards
  ADD COLUMN IF NOT EXISTS module_key TEXT;

CREATE INDEX IF NOT EXISTS brainstorm_boards_project_module_idx
  ON public.brainstorm_boards (project_id, module_key);
