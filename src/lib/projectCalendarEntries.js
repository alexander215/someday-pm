import { supabase } from './supabase'

// ------------------------------------------------------------
// Queries
// ------------------------------------------------------------

export async function getCalendarEntries(projectId) {
  const { data, error } = await supabase
    .from('project_calendar_entries')
    .select('*')
    .eq('project_id', projectId)
    .order('scheduled_date', { ascending: true, nullsFirst: false })
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data
}

// ------------------------------------------------------------
// Mutations
// ------------------------------------------------------------

export async function createCalendarEntry(projectId, {
  title = '',
  body,
  platform = 'other',
  content_type = 'other',
  status = 'draft',
  scheduled_date,
  link = '',
  owner = '',
  sort_order = 0,
}) {
  const { data, error } = await supabase
    .from('project_calendar_entries')
    .insert({ project_id: projectId, title, body, platform, content_type, status, scheduled_date, link, owner, sort_order })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateCalendarEntry(entryId, updates) {
  const { data, error } = await supabase
    .from('project_calendar_entries')
    .update(updates)
    .eq('id', entryId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteCalendarEntry(entryId) {
  const { error } = await supabase
    .from('project_calendar_entries')
    .delete()
    .eq('id', entryId)
  if (error) throw error
}
