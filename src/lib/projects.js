import { supabase } from './supabase'

// ------------------------------------------------------------
// Queries
// ------------------------------------------------------------

export async function getProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getProjectById(projectId) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()
  if (error) throw error
  return data
}

// ------------------------------------------------------------
// Mutations
// ------------------------------------------------------------

export async function createProject({ template_key, title, description, sort_order = 0 }) {
  const { data, error } = await supabase
    .from('projects')
    .insert({ template_key, title, description, sort_order })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateProject(projectId, updates) {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteProject(projectId) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)
  if (error) throw error
}

export async function updateActiveStage(projectId, stageKey) {
  const { error } = await supabase
    .from('projects')
    .update({ active_stage_key: stageKey })
    .eq('id', projectId)
  if (error) throw error
}

export async function reorderProjects(orderedIds) {
  const updates = orderedIds.map((id, index) => ({ id, sort_order: index }))
  const { error } = await supabase
    .from('projects')
    .upsert(updates, { onConflict: 'id' })
  if (error) throw error
}
