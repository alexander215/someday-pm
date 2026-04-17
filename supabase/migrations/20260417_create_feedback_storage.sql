-- ============================================================
-- Migration: feedback-uploads storage bucket + policies
-- someday-pm · 2026-04-17
--
-- Storage lives outside the public schema. Run this in the
-- Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- It is safe to re-run — bucket insert uses ON CONFLICT DO NOTHING.
-- ============================================================


-- ------------------------------------------------------------
-- 1. Private bucket
--    10 MB per-file limit; images, PDF, and plain text only.
-- ------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'feedback-uploads',
  'feedback-uploads',
  false,
  10485760,   -- 10 MB
  ARRAY[
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/gif',
    'application/pdf',
    'text/plain'
  ]
)
ON CONFLICT (id) DO NOTHING;


-- ------------------------------------------------------------
-- 2. Storage policies
--    Path structure: {owner_user_id}/{timestamp}-{filename}
--    split_part(name, '/', 1) extracts the first path segment.
-- ------------------------------------------------------------

-- Users can upload to their own subfolder only.
CREATE POLICY "storage_feedback_insert_own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'feedback-uploads'
    AND auth.role() = 'authenticated'
    AND split_part(name, '/', 1) = auth.uid()::text
  );

-- Users can read their own files (for signed-URL generation).
CREATE POLICY "storage_feedback_select_own"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'feedback-uploads'
    AND split_part(name, '/', 1) = auth.uid()::text
  );

-- Admins can read any file in this bucket (to view attachments in the inbox).
CREATE POLICY "storage_feedback_select_admin"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'feedback-uploads'
    AND public.is_admin()
  );

-- Users can delete their own files.
CREATE POLICY "storage_feedback_delete_own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'feedback-uploads'
    AND split_part(name, '/', 1) = auth.uid()::text
  );
