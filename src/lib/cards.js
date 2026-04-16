import { supabase } from './supabase'

export const ROOT_CATEGORIES = [
  'Experiment',
  'Work Tool',
  'Favor',
  'Potential Client',
  'Paying Client',
]

export const CHILD_CATEGORIES = ['To Do', 'Need Help', 'Unsure', 'Finished']

// ------------------------------------------------------------
// Queries
// ------------------------------------------------------------

export async function getRootCards() {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .is('parent_card_id', null)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getCardById(cardId) {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('id', cardId)
    .single()
  if (error) throw error
  return data
}

export async function getChildCards(parentCardId) {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('parent_card_id', parentCardId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

// ------------------------------------------------------------
// Mutations
// ------------------------------------------------------------

// owner_user_id is set by the DB default (auth.uid()); RLS enforces it.
export async function createRootCard({ title, category, deliverable_due_date, notes, sort_order = 0 }) {
  const { data, error } = await supabase
    .from('cards')
    .insert({ title, category, deliverable_due_date, notes, sort_order, parent_card_id: null })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function createChildCard(parentCardId, { title, category, deliverable_due_date, notes, sort_order = 0 }) {
  const { data, error } = await supabase
    .from('cards')
    .insert({ title, category, deliverable_due_date, notes, sort_order, parent_card_id: parentCardId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateCard(cardId, updates) {
  const { data, error } = await supabase
    .from('cards')
    .update(updates)
    .eq('id', cardId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteCard(cardId) {
  const { error } = await supabase
    .from('cards')
    .delete()
    .eq('id', cardId)
  if (error) throw error
}
