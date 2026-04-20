import { supabase } from './supabase'

// ------------------------------------------------------------
// Cards
// ------------------------------------------------------------

export async function getCards(projectId, moduleKey) {
  const { data, error } = await supabase
    .from('project_cards')
    .select('*')
    .eq('project_id', projectId)
    .eq('module_key', moduleKey)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

// Used by CardInitiativesModule — fetches cards with embedded checklist items.
export async function getCardsWithItems(projectId, moduleKey) {
  const { data, error } = await supabase
    .from('project_cards')
    .select('*, project_card_items(id, text, completed, sort_order, created_at)')
    .eq('project_id', projectId)
    .eq('module_key', moduleKey)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) throw error
  return data.map(card => ({
    ...card,
    project_card_items: [...(card.project_card_items ?? [])].sort(
      (a, b) => a.sort_order - b.sort_order || a.created_at?.localeCompare(b.created_at ?? '') || 0
    ),
  }))
}

export async function createCard(projectId, {
  stageKey,
  moduleKey,
  title = '',
  body,
  status = 'open',
  labels = [],
  due_date,
  sort_order = 0,
}) {
  const { data, error } = await supabase
    .from('project_cards')
    .insert({
      project_id: projectId,
      stage_key: stageKey,
      module_key: moduleKey,
      title,
      body,
      status,
      labels,
      due_date,
      sort_order,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateCard(cardId, updates) {
  const { data, error } = await supabase
    .from('project_cards')
    .update(updates)
    .eq('id', cardId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteCard(cardId) {
  const { error } = await supabase
    .from('project_cards')
    .delete()
    .eq('id', cardId)
  if (error) throw error
}

export async function reorderCards(projectId, moduleKey, orderedIds) {
  const updates = orderedIds.map((id, index) => ({
    id,
    sort_order: index,
    project_id: projectId,
    module_key: moduleKey,
  }))
  const { error } = await supabase
    .from('project_cards')
    .upsert(updates, { onConflict: 'id' })
  if (error) throw error
}

// ------------------------------------------------------------
// Card items (checklist)
// ------------------------------------------------------------

export async function getCardItems(cardId) {
  const { data, error } = await supabase
    .from('project_card_items')
    .select('*')
    .eq('card_id', cardId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function createCardItem(cardId, { text, sort_order = 0 }) {
  const { data, error } = await supabase
    .from('project_card_items')
    .insert({ card_id: cardId, text, sort_order })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function toggleCardItem(itemId, completed) {
  const { data, error } = await supabase
    .from('project_card_items')
    .update({ completed })
    .eq('id', itemId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateCardItem(itemId, updates) {
  const { data, error } = await supabase
    .from('project_card_items')
    .update(updates)
    .eq('id', itemId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteCardItem(itemId) {
  const { error } = await supabase
    .from('project_card_items')
    .delete()
    .eq('id', itemId)
  if (error) throw error
}
