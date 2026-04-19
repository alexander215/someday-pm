import { supabase } from './supabase'

// ------------------------------------------------------------
// Initiatives
// ------------------------------------------------------------

export async function getInitiatives(projectId) {
  const { data, error } = await supabase
    .from('project_initiatives')
    .select('*')
    .eq('project_id', projectId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function createInitiative(projectId, { title, body, sort_order = 0 }) {
  const { data, error } = await supabase
    .from('project_initiatives')
    .insert({ project_id: projectId, title, body, sort_order })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateInitiative(initiativeId, updates) {
  const { data, error } = await supabase
    .from('project_initiatives')
    .update(updates)
    .eq('id', initiativeId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteInitiative(initiativeId) {
  const { error } = await supabase
    .from('project_initiatives')
    .delete()
    .eq('id', initiativeId)
  if (error) throw error
}

export async function reorderInitiatives(projectId, orderedIds) {
  const updates = orderedIds.map((id, index) => ({ id, sort_order: index, project_id: projectId }))
  const { error } = await supabase
    .from('project_initiatives')
    .upsert(updates, { onConflict: 'id' })
  if (error) throw error
}

// ------------------------------------------------------------
// Subtasks
// ------------------------------------------------------------

export async function getSubtasks(initiativeId) {
  const { data, error } = await supabase
    .from('project_initiative_subtasks')
    .select('*')
    .eq('initiative_id', initiativeId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function createSubtask(initiativeId, text, sort_order = 0) {
  const { data, error } = await supabase
    .from('project_initiative_subtasks')
    .insert({ initiative_id: initiativeId, text, sort_order })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function toggleSubtask(subtaskId, completed) {
  const { data, error } = await supabase
    .from('project_initiative_subtasks')
    .update({ completed })
    .eq('id', subtaskId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteSubtask(subtaskId) {
  const { error } = await supabase
    .from('project_initiative_subtasks')
    .delete()
    .eq('id', subtaskId)
  if (error) throw error
}

export async function reorderSubtasks(initiativeId, orderedIds) {
  const updates = orderedIds.map((id, index) => ({ id, sort_order: index, initiative_id: initiativeId }))
  const { error } = await supabase
    .from('project_initiative_subtasks')
    .upsert(updates, { onConflict: 'id' })
  if (error) throw error
}
