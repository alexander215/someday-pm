import { supabase } from './supabase'

// ------------------------------------------------------------
// Queries
// ------------------------------------------------------------

export async function getRecords(projectId, moduleKey) {
  const { data, error } = await supabase
    .from('project_records')
    .select('*')
    .eq('project_id', projectId)
    .eq('module_key', moduleKey)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

// Notes are single-row records; fetches the first row or null.
export async function getNote(projectId, moduleKey) {
  const { data, error } = await supabase
    .from('project_records')
    .select('*')
    .eq('project_id', projectId)
    .eq('module_key', moduleKey)
    .eq('record_type', 'note')
    .maybeSingle()
  if (error) throw error
  return data
}

// ------------------------------------------------------------
// Mutations
// ------------------------------------------------------------

export async function createRecord(projectId, { stageKey = 'planning', moduleKey, recordType, title = '', body, fields = {}, sort_order = 0 }) {
  const { data, error } = await supabase
    .from('project_records')
    .insert({
      project_id: projectId,
      stage_key: stageKey,
      module_key: moduleKey,
      record_type: recordType,
      title,
      body,
      fields,
      sort_order,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateRecord(recordId, updates) {
  const { data, error } = await supabase
    .from('project_records')
    .update(updates)
    .eq('id', recordId)
    .select()
    .single()
  if (error) throw error
  return data
}

// Upserts the single note row for a module. Creates if absent, updates if present.
export async function upsertNote(projectId, moduleKey, body) {
  const existing = await getNote(projectId, moduleKey)
  if (existing) {
    return updateRecord(existing.id, { body })
  }
  return createRecord(projectId, {
    moduleKey,
    recordType: 'note',
    body,
  })
}

export async function deleteRecord(recordId) {
  const { error } = await supabase
    .from('project_records')
    .delete()
    .eq('id', recordId)
  if (error) throw error
}

export async function reorderRecords(projectId, moduleKey, orderedIds) {
  const updates = orderedIds.map((id, index) => ({
    id,
    sort_order: index,
    project_id: projectId,
    module_key: moduleKey,
  }))
  const { error } = await supabase
    .from('project_records')
    .upsert(updates, { onConflict: 'id' })
  if (error) throw error
}
