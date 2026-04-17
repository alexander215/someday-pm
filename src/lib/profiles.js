import { supabase } from './supabase'

// ------------------------------------------------------------
// Profile (logged-in user)
// ------------------------------------------------------------

export async function getMyProfile() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .maybeSingle()
  if (error) throw error
  return data
}

export async function upsertProfile({ user_id, handle, display_name, bio, contact_info, is_public }) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      { user_id, handle, display_name, bio, contact_info, is_public },
      { onConflict: 'user_id' }
    )
    .select()
    .single()
  if (error) throw error
  return data
}

// ------------------------------------------------------------
// Public profile (anonymous-safe — RLS gates is_public)
// ------------------------------------------------------------

export async function getProfileByHandle(handle) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, user_id, handle, display_name, bio, contact_info')
    .eq('handle', handle)
    .eq('is_public', true)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function getPublicCardMetaForUser(userId) {
  const { data, error } = await supabase
    .from('card_public_meta')
    .select('*')
    .eq('owner_user_id', userId)
    .eq('is_public', true)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

// ------------------------------------------------------------
// Card public meta (owner)
// ------------------------------------------------------------

export async function getMyCardPublicMeta() {
  const { data, error } = await supabase
    .from('card_public_meta')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function upsertCardPublicMeta(cardId, ownerUserId, fields) {
  const { data, error } = await supabase
    .from('card_public_meta')
    .upsert(
      { card_id: cardId, owner_user_id: ownerUserId, ...fields },
      { onConflict: 'card_id' }
    )
    .select()
    .single()
  if (error) throw error
  return data
}
