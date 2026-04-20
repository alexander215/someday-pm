import { supabase } from './supabase'

// ------------------------------------------------------------
// Queries
// ------------------------------------------------------------

export async function getTasksForModule(projectId, moduleKey) {
  const { data, error } = await supabase
    .from('project_tasks')
    .select('*')
    .eq('project_id', projectId)
    .eq('module_key', moduleKey)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

// Returns all tasks for a project grouped by status (for board views).
export async function getTasksGroupedByStatus(projectId, moduleKey) {
  const { data, error } = await supabase
    .from('project_tasks')
    .select('*')
    .eq('project_id', projectId)
    .eq('module_key', moduleKey)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data
}

// ------------------------------------------------------------
// Mutations
// ------------------------------------------------------------

export async function createTask(projectId, { stageKey, moduleKey, title, body, status = 'open', label, sort_order = 0 }) {
  const { data, error } = await supabase
    .from('project_tasks')
    .insert({ project_id: projectId, stage_key: stageKey, module_key: moduleKey, title, body, status, label, sort_order })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateTask(taskId, updates) {
  const { data, error } = await supabase
    .from('project_tasks')
    .update(updates)
    .eq('id', taskId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function toggleTaskDone(taskId, done) {
  return updateTask(taskId, { status: done ? 'done' : 'open' })
}

export async function deleteTask(taskId) {
  const { error } = await supabase
    .from('project_tasks')
    .delete()
    .eq('id', taskId)
  if (error) throw error
}

export async function reorderTasks(projectId, moduleKey, orderedIds) {
  const updates = orderedIds.map((id, index) => ({
    id,
    sort_order: index,
    project_id: projectId,
    module_key: moduleKey,
  }))
  const { error } = await supabase
    .from('project_tasks')
    .upsert(updates, { onConflict: 'id' })
  if (error) throw error
}
