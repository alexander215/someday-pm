import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate, useBlocker } from 'react-router-dom'
import { getCardById, updateCard, deleteCard, CHILD_CATEGORIES } from '../lib/cards'
import {
  listFilesForCard,
  uploadFilesForCard,
  deleteFileForCard,
  getDownloadUrl,
  ACCEPT_ATTR,
  formatBytes,
} from '../lib/files'
import { getTodosForCard, createTodo, toggleTodo, deleteTodo } from '../lib/todos'

export default function ChildCardDetailPage() {
  const { cardId, childCardId } = useParams()
  const navigate = useNavigate()

  const [child, setChild] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Editable fields
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(CHILD_CATEGORIES[0])
  const [notes, setNotes] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [isDirty, setIsDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Files
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [fileError, setFileError] = useState(null)
  const fileInputRef = useRef(null)

  // To-Do
  const [todos, setTodos] = useState([])
  const [todoInput, setTodoInput] = useState('')
  const [todoAdding, setTodoAdding] = useState(false)
  const [todoError, setTodoError] = useState(null)

  const blocker = useBlocker(isDirty)

  useEffect(() => {
    Promise.all([
      getCardById(childCardId),
      listFilesForCard(childCardId),
      getTodosForCard(childCardId),
    ])
      .then(([childData, filesData, todosData]) => {
        if (childData.parent_card_id !== cardId) {
          throw new Error('Task not found in this project.')
        }
        setChild(childData)
        setTitle(childData.title)
        setCategory(childData.category)
        setNotes(childData.notes || '')
        setDueDate(childData.deliverable_due_date || '')
        setFiles(filesData)
        setTodos(todosData)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [childCardId, cardId])

  useEffect(() => {
    if (!child) return
    setIsDirty(
      title !== child.title ||
      category !== child.category ||
      notes !== (child.notes || '') ||
      dueDate !== (child.deliverable_due_date || '')
    )
  }, [title, category, notes, dueDate, child])

  useEffect(() => {
    const handler = e => {
      if (isDirty) { e.preventDefault(); e.returnValue = '' }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  async function handleSave() {
    if (!title.trim()) return
    setSaving(true)
    setError(null)
    setSaveSuccess(false)
    try {
      const updated = await updateCard(childCardId, {
        title: title.trim(),
        category,
        notes: notes.trim() || null,
        deliverable_due_date: dueDate || null,
      })
      setChild(updated)
      setIsDirty(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${child.title}"? This will also delete its attachments.`)) return
    try {
      await deleteCard(childCardId)
      navigate(`/card/${cardId}`)
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleUpload(e) {
    const selected = e.target.files
    if (!selected || selected.length === 0) return
    setUploading(true)
    setFileError(null)
    try {
      const newFiles = await uploadFilesForCard(childCardId, selected)
      setFiles(prev => [...prev, ...newFiles])
    } catch (err) {
      setFileError(err.message)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleDeleteFile(fileId) {
    setFileError(null)
    try {
      await deleteFileForCard(fileId)
      setFiles(prev => prev.filter(f => f.id !== fileId))
    } catch (err) {
      setFileError(err.message)
    }
  }

  async function handleDownload(storagePath, fileName) {
    try {
      const url = await getDownloadUrl(storagePath)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.target = '_blank'
      a.rel = 'noreferrer'
      a.click()
    } catch (err) {
      setFileError(err.message)
    }
  }

  async function handleAddTodo(e) {
    e.preventDefault()
    if (!todoInput.trim()) return
    setTodoAdding(true)
    setTodoError(null)
    try {
      const todo = await createTodo(childCardId, todoInput.trim())
      setTodos(prev => [...prev, todo])
      setTodoInput('')
    } catch (err) {
      setTodoError(err.message)
    } finally {
      setTodoAdding(false)
    }
  }

  async function handleToggleTodo(todo) {
    try {
      const updated = await toggleTodo(todo.id, !todo.completed)
      setTodos(prev => prev.map(t => (t.id === updated.id ? updated : t)))
    } catch (err) {
      setTodoError(err.message)
    }
  }

  async function handleDeleteTodo(todoId) {
    try {
      await deleteTodo(todoId)
      setTodos(prev => prev.filter(t => t.id !== todoId))
    } catch (err) {
      setTodoError(err.message)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '48px 32px', color: 'var(--color-text-muted)', fontSize: '14px' }}>
        Loading…
      </div>
    )
  }

  if (error || !child) {
    return (
      <div style={{ padding: '48px 32px', maxWidth: '680px', margin: '0 auto' }}>
        <Link to={`/card/${cardId}`} style={backLinkStyle}>← Back to project</Link>
        <p style={{ color: '#f87171', fontSize: '14px' }}>
          {error || 'Task not found.'}
        </p>
      </div>
    )
  }

  // Unsaved-changes modal
  if (blocker.state === 'blocked') {
    return (
      <div
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(27,35,27,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100,
          backdropFilter: 'blur(2px)',
        }}
      >
        <div
          style={{
            background: 'var(--brand-surface-soft)',
            border: '1px solid rgba(183,165,134,0.35)',
            borderRadius: 12,
            padding: '28px 30px',
            maxWidth: 380,
            width: '90%',
            boxShadow: '0 20px 60px rgba(27,35,27,0.35)',
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--brand-dark)', marginBottom: 10, fontFamily: 'var(--font-display)' }}>
            Unsaved changes
          </h2>
          <p style={{ fontSize: 14, color: 'var(--brand-text-dark-muted)', marginBottom: 24, lineHeight: 1.5 }}>
            You have unsaved edits. Leave without saving?
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => blocker.proceed()}
              style={panelCancelBtn}
            >
              Leave without saving
            </button>
            <button
              onClick={() => blocker.reset()}
              style={panelGreenBtn}
            >
              Stay and save
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '28px 28px 56px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <Link to={`/card/${cardId}`} style={backLinkStyle}>← Back to project</Link>

        {/* ── Task detail panel ── */}
        <section style={sectionCard}>
          <div style={sectionCardHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ ...sectionCardTitle, fontSize: 16 }}>{child.title}</h1>
              <span style={{ fontSize: 10, padding: '2px 8px', border: '1px solid rgba(183,165,134,0.28)', borderRadius: 99, color: 'var(--brand-text-dark-muted)', whiteSpace: 'nowrap' }}>
                {child.category}
              </span>
            </div>
            {isDirty && !saving && (
              <span style={{ fontSize: 11, color: 'var(--brand-text-dark-muted)' }}>Unsaved</span>
            )}
            {saveSuccess && (
              <span style={{ fontSize: 11, color: 'var(--brand-text-dark-muted)' }}>Saved.</span>
            )}
          </div>

          <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Title */}
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Task title"
              style={{ ...panelInputStyle, fontSize: 15, fontWeight: 600 }}
            />

            {/* Category + due date */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                style={{ ...panelInputStyle, width: 'auto', flex: '0 0 auto' }}
              >
                {CHILD_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                style={{ ...panelInputStyle, width: 'auto', flex: '0 0 auto' }}
              />
            </div>

            {/* Notes */}
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Notes (optional)"
              rows={4}
              style={{ ...panelInputStyle, resize: 'vertical', lineHeight: 1.6, fontFamily: 'inherit' }}
            />

            {error && <p style={panelErrorText}>{error}</p>}

            {/* Save */}
            <div>
              <button
                onClick={handleSave}
                disabled={saving || !isDirty || !title.trim()}
                style={{
                  ...panelGreenBtn,
                  opacity: saving || !isDirty || !title.trim() ? 0.45 : 1,
                  cursor: saving || !isDirty || !title.trim() ? 'default' : 'pointer',
                }}
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>
        </section>

        {/* ── To-Do panel ── */}
        <section style={{ ...sectionCard, marginTop: 16 }}>
          <div style={sectionCardHeader}>
            <h2 style={sectionCardTitle}>
              To‑Do
              {todos.length > 0 && (
                <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 500, color: 'var(--brand-text-dark-muted)' }}>
                  {todos.filter(t => t.completed).length}/{todos.length}
                </span>
              )}
            </h2>
          </div>
          <div style={{ padding: '14px 16px' }}>
            {todoError && <p style={panelErrorText}>{todoError}</p>}
            <form onSubmit={handleAddTodo} style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <input
                type="text"
                placeholder="Add a to-do…"
                value={todoInput}
                onChange={e => setTodoInput(e.target.value)}
                style={{ ...panelInputStyle, flex: 1 }}
              />
              <button
                type="submit"
                disabled={todoAdding || !todoInput.trim()}
                style={{ ...panelGreenBtn, opacity: todoAdding || !todoInput.trim() ? 0.5 : 1, cursor: todoAdding || !todoInput.trim() ? 'not-allowed' : 'pointer' }}
              >
                Add
              </button>
            </form>
            {todos.length === 0 ? (
              <div style={panelEmptyState}>No to-dos yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {todos.map(todo => (
                  <div
                    key={todo.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 10px',
                      border: '1px solid rgba(183,165,134,0.2)',
                      borderRadius: 7,
                      background: todo.completed ? 'transparent' : 'rgba(243,231,207,0.35)',
                      opacity: todo.completed ? 0.6 : 1,
                    }}
                  >
                    <button
                      onClick={() => handleToggleTodo(todo)}
                      title={todo.completed ? 'Mark incomplete' : 'Mark complete'}
                      style={{
                        width: 16, height: 16, borderRadius: 4,
                        border: `1.5px solid ${todo.completed ? 'var(--brand-bg)' : 'rgba(143,120,90,0.4)'}`,
                        background: todo.completed ? 'var(--brand-bg)' : 'transparent',
                        cursor: 'pointer', flexShrink: 0, padding: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--brand-surface-soft)', fontSize: 10,
                      }}
                    >
                      {todo.completed ? '✓' : ''}
                    </button>
                    <span style={{ flex: 1, fontSize: 13, color: 'var(--brand-dark)', textDecoration: todo.completed ? 'line-through' : 'none', lineHeight: 1.4 }}>
                      {todo.text}
                    </span>
                    <button onClick={() => handleDeleteTodo(todo.id)} title="Delete" style={panelIconBtn}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Attachments panel ── */}
        <section style={{ ...sectionCard, marginTop: 16 }}>
          <div style={sectionCardHeader}>
            <h2 style={sectionCardTitle}>Attachments</h2>
            <label
              style={{
                padding: '5px 12px',
                background: uploading ? 'transparent' : 'var(--brand-surface)',
                border: '1px solid rgba(183,165,134,0.3)',
                borderRadius: 7,
                color: uploading ? 'var(--brand-text-dark-muted)' : 'var(--brand-dark)',
                fontSize: 12, fontWeight: 500,
                cursor: uploading ? 'not-allowed' : 'pointer',
              }}
            >
              {uploading ? 'Uploading…' : '+ Attach files'}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ACCEPT_ATTR}
                onChange={handleUpload}
                disabled={uploading}
                style={{ display: 'none' }}
              />
            </label>
          </div>
          <div style={{ padding: '14px 16px' }}>
            {fileError && <p style={panelErrorText}>{fileError}</p>}
            {files.length === 0 ? (
              <div style={panelEmptyState}>No attachments yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {files.map(file => (
                  <div key={file.id} style={taskItemRow}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                      <button
                        onClick={() => handleDownload(file.storage_path, file.file_name)}
                        style={{
                          background: 'none', border: 'none', padding: 0, textAlign: 'left',
                          cursor: 'pointer', color: 'var(--brand-bg)', fontSize: 13, fontWeight: 500,
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 420,
                        }}
                        title={file.file_name}
                      >
                        {file.file_name}
                      </button>
                      <span style={{ fontSize: 11, color: 'var(--brand-text-dark-muted)' }}>
                        {formatBytes(file.file_size)}
                      </span>
                    </div>
                    <button onClick={() => handleDeleteFile(file.id)} title="Remove" style={{ ...panelIconBtn, marginLeft: 10 }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Delete task ── */}
        <div style={{ marginTop: 32, paddingTop: 18, borderTop: '1px solid var(--color-border)' }}>
          <button
            onClick={handleDelete}
            style={{
              padding: '6px 14px', background: 'transparent',
              border: '1px solid var(--color-border)', borderRadius: '6px',
              color: 'var(--color-text-muted)', fontSize: '13px', cursor: 'pointer',
            }}
          >
            Delete task
          </button>
        </div>
      </div>
    </div>
  )
}

const backLinkStyle = {
  fontSize: '13px',
  color: 'var(--color-text-muted)',
  marginBottom: '20px',
  display: 'inline-block',
  textDecoration: 'none',
}

const sectionCard = {
  background: 'var(--brand-surface-soft)',
  border: '1px solid rgba(183,165,134,0.28)',
  borderRadius: 14,
  boxShadow: '0 4px 20px rgba(27,35,27,0.18)',
  overflow: 'hidden',
}

const sectionCardHeader = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '13px 16px',
  borderBottom: '1px solid rgba(183,165,134,0.2)',
}

const sectionCardTitle = {
  fontSize: 14,
  fontWeight: 700,
  color: 'var(--brand-dark)',
  fontFamily: 'var(--font-display)',
  margin: 0,
}

const panelInputStyle = {
  padding: '7px 10px',
  background: 'var(--brand-surface)',
  border: '1px solid rgba(183,165,134,0.28)',
  borderRadius: 7,
  color: 'var(--brand-dark)',
  fontSize: 13,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}

const panelGreenBtn = {
  padding: '6px 13px',
  background: 'var(--brand-bg)',
  border: 'none',
  borderRadius: 7,
  color: 'var(--brand-surface-soft)',
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
  flexShrink: 0,
  whiteSpace: 'nowrap',
}

const panelCancelBtn = {
  padding: '6px 13px',
  background: 'transparent',
  border: '1px solid rgba(183,165,134,0.3)',
  borderRadius: 7,
  color: 'var(--brand-text-dark-muted)',
  fontSize: 12,
  cursor: 'pointer',
}

const panelIconBtn = {
  background: 'none',
  border: 'none',
  color: 'rgba(100,80,60,0.4)',
  cursor: 'pointer',
  fontSize: 16,
  lineHeight: 1,
  padding: '0 2px',
  flexShrink: 0,
}

const taskItemRow = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '9px 12px',
  border: '1px solid rgba(183,165,134,0.22)',
  borderRadius: 8,
  background: 'var(--brand-surface)',
}

const panelEmptyState = {
  padding: '16px 12px',
  border: '1px dashed rgba(183,165,134,0.3)',
  borderRadius: 8,
  color: 'var(--brand-text-dark-muted)',
  fontSize: 13,
  textAlign: 'center',
}

const panelErrorText = {
  color: '#b45309',
  fontSize: 13,
  marginBottom: 10,
}
