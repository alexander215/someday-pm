-- ============================================================
-- Migration: create card-files storage bucket + policies
-- someday-pm · 2026-04-15
--
-- Run this in the Supabase SQL Editor (not via supabase db push,
-- because storage.buckets lives outside the public schema and is
-- not tracked by the local migration tool by default).
-- ============================================================

-- ------------------------------------------------------------
-- 1. Private bucket
--    50 MB per-file limit; allowed MIME types enforced server-side.
-- ------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'card-files',
  'card-files',
  false,
  52428800,   -- 50 MB
  ARRAY[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- 2. Storage object policies
--    Path structure: {owner_user_id}/{card_id}/{filename}
--    split_part(name, '/', 1) extracts the first segment (owner_user_id).
-- ------------------------------------------------------------

-- Upload: only into your own UID folder
CREATE POLICY "storage_card_files_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'card-files'
    AND auth.role() = 'authenticated'
    AND split_part(name, '/', 1) = auth.uid()::text
  );

-- Read / signed-URL generation: only your own objects
CREATE POLICY "storage_card_files_select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'card-files'
    AND split_part(name, '/', 1) = auth.uid()::text
  );

-- Delete: only your own objects
CREATE POLICY "storage_card_files_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'card-files'
    AND split_part(name, '/', 1) = auth.uid()::text
  );
