import { supabase } from './supabase'

// ------------------------------------------------------------
// Constants
// ------------------------------------------------------------

export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB

export const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
])

// Value for the <input accept="..."> attribute
export const ACCEPT_ATTR =
  '.pdf,.png,.jpg,.jpeg,.webp,.docx,.xlsx,.txt,.csv'

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function validateFile(file) {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error(`"${file.name}": file type not allowed (${file.type || 'unknown'})`)
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`"${file.name}": exceeds 50 MB limit`)
  }
  if (file.size === 0) {
    throw new Error(`"${file.name}": file is empty`)
  }
}

// ------------------------------------------------------------
// Queries
// ------------------------------------------------------------

export async function listFilesForCard(cardId) {
  const { data, error } = await supabase
    .from('card_files')
    .select('*')
    .eq('card_id', cardId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function getDownloadUrl(storagePath) {
  const { data, error } = await supabase.storage
    .from('card-files')
    .createSignedUrl(storagePath, 60 * 60) // 1 hour
  if (error) throw error
  return data.signedUrl
}

// ------------------------------------------------------------
// Mutations
// ------------------------------------------------------------

/**
 * Upload one or more File objects for a card.
 * Validates type + size before any upload attempt.
 * Returns an array of inserted card_files rows.
 */
export async function uploadFilesForCard(cardId, files) {
  const fileArray = Array.from(files)
  if (fileArray.length === 0) return []

  // Validate all files before touching the network
  for (const file of fileArray) {
    validateFile(file)
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const results = []
  for (const file of fileArray) {
    const ext = file.name.includes('.') ? file.name.split('.').pop() : ''
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const storageName = ext ? `${uniqueSuffix}.${ext}` : uniqueSuffix
    const path = `${user.id}/${cardId}/${storageName}`

    // Upload to Storage
    const { error: uploadError } = await supabase.storage
      .from('card-files')
      .upload(path, file, { contentType: file.type })
    if (uploadError) throw uploadError

    // Insert metadata row
    const { data, error: dbError } = await supabase
      .from('card_files')
      .insert({
        card_id: cardId,
        storage_path: path,
        file_name: file.name,
        mime_type: file.type,
        file_size: file.size,
      })
      .select()
      .single()

    if (dbError) {
      // Best-effort cleanup of the orphaned storage object
      await supabase.storage.from('card-files').remove([path])
      throw dbError
    }

    results.push(data)
  }
  return results
}

/**
 * Delete a file by its card_files row id.
 * Removes the storage object first, then the metadata row.
 */
export async function deleteFileForCard(fileId) {
  const { data: file, error: fetchError } = await supabase
    .from('card_files')
    .select('storage_path')
    .eq('id', fileId)
    .single()
  if (fetchError) throw fetchError

  const { error: storageError } = await supabase.storage
    .from('card-files')
    .remove([file.storage_path])
  if (storageError) throw storageError

  const { error: dbError } = await supabase
    .from('card_files')
    .delete()
    .eq('id', fileId)
  if (dbError) throw dbError
}
