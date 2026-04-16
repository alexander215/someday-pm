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

  // Block navigation when unsaved changes exist
  const blocker = useBlocker(isDirty)

  useEffect(() => {
    Promise.all([getCardById(childCardId), listFilesForCard(childCardId)])
      .then(([childData, filesData]) => {
        if (childData.parent_card_id !== cardId) {
          throw new Error('Task not found in this project.')
        }
        setChild(childData)
        setTitle(childData.title)
        setCategory(childData.category)
        setNotes(childData.notes || '')
        setDueDate(childData.deliverable_due_date || '')
        setFiles(filesData)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [childCardId, cardId])

  // Recompute dirty on every field change
  useEffect(() => {
    if (!child) return
    setIsDirty(
      title !== child.title ||
      category !== child.category ||
      notes !== (child.notes || '') ||
      dueDate !== (child.deliverable_due_date || '')
    )
  }, [title, category, notes, dueDate, child])

  // Warn on browser tab close when dirty
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

  if (loading) {
    return (
      <div style={{ padding: '48px 32px', color: 'var(--color-text-muted)', fontSize: '14px' }}>
        Loading…
      </div>
    )
  }

  if (error || !child) {
    return (
      <div style={{ padding: '48px 32px', maxWidth: '640px', margin: '0 auto' }}>
        <Link to={`/card/${cardId}`} style={backLinkStyle}>← Back to project</Link>
        <p style={{ color: '#f87171', fontSize: '14px' }}>
          {error || 'Task not found.'}
        </p>
      </div>
    )
  }

  // Unsaved-changes modal (shown when blocker fires)
  if (blocker.state === 'blocked') {
    return (
      <div
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100,
        }}
      >
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '10px',
            padding: '28px 32px',
            maxWidth: '400px',
            width: '90%',
          }}
        >
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '10px' }}>Unsaved changes</h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>
            You have unsaved edits. Leave without saving?
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => blocker.proceed()}
              style={{
                padding: '7px 16px',
                background: 'transparent',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                color: 'var(--color-text-muted)',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Leave without saving
            </button>
            <button
              onClick={() => blocker.reset()}
              style={{
                padding: '7px 16px',
                background: 'var(--color-accent)',
                border: 'none',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Stay and save
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '48px 32px', maxWidth: '640px', margin: '0 auto' }}>
      <Link to={`/card/${cardId}`} style={backLinkStyle}>← Back to project</Link>

      {/* Title input */}
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Task title"
          style={{
            ...inputStyle,
            fontSize: '22px',
            fontWeight: 600,
            letterSpacing: '-0.3px',
            padding: '6px 0',
            background: 'transparent',
            border: 'none',
            borderBottom: '2px solid var(--color-border)',
            borderRadius: 0,
            width: '100%',
          }}
        />
      </div>

      {/* Category + due date row */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          style={{ ...inputStyle, flex: '0 0 auto', width: 'auto' }}
        >
          {CHILD_CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          style={{ ...inputStyle, flex: '0 0 auto', width: 'auto' }}
        />
      </div>

      {/* Notes */}
      <div style={{ marginBottom: '20px' }}>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          rows={4}
          style={{
            ...inputStyle,
            resize: 'vertical',
            lineHeight: 1.6,
            fontFamily: 'inherit',
          }}
        />
      </div>

      {/* Save row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <button
          onClick={handleSave}
          disabled={saving || !isDirty || !title.trim()}
          style={{
            padding: '7px 18px',
            background: isDirty && title.trim() ? 'var(--color-accent)' : 'transparent',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            color: isDirty && title.trim() ? '#fff' : 'var(--color-text-muted)',
            fontSize: '13px',
            fontWeight: 500,
            cursor: saving || !isDirty || !title.trim() ? 'default' : 'pointer',
            opacity: saving ? 0.6 : 1,
            transition: 'background 0.15s, color 0.15s',
          }}
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        {saveSuccess && (
          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Saved.</span>
        )}
        {isDirty && !saving && (
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Unsaved changes</span>
        )}
      </div>

      {error && (
        <p style={{ color: '#f87171', fontSize: '13px', marginBottom: '16px' }}>{error}</p>
      )}

      {/* Divider */}
      <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '28px 0 24px' }} />

      {/* Attachments */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 600 }}>Attachments</h2>
        <label
          style={{
            padding: '5px 12px',
            background: uploading ? 'transparent' : 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            color: uploading ? 'var(--color-text-muted)' : 'var(--color-text)',
            fontSize: '12px',
            fontWeight: 500,
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

      {fileError && (
        <p style={{ color: '#f87171', fontSize: '13px', marginBottom: '12px' }}>{fileError}</p>
      )}

      {files.length === 0 ? (
        <div
          style={{
            padding: '24px',
            border: '1px dashed var(--color-border)',
            borderRadius: '8px',
            color: 'var(--color-text-muted)',
            fontSize: '14px',
            textAlign: 'center',
          }}
        >
          No attachments yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {files.map(file => (
            <div
              key={file.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                background: 'var(--color-surface)',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                <button
                  onClick={() => handleDownload(file.storage_path, file.file_name)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: 'var(--color-accent)',
                    fontSize: '13px',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '380px',
                  }}
                  title={file.file_name}
                >
                  {file.file_name}
                </button>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                  {formatBytes(file.file_size)}
                </span>
              </div>
              <button
                onClick={() => handleDeleteFile(file.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  fontSize: '16px',
                  lineHeight: 1,
                  padding: '0 2px',
                  flexShrink: 0,
                  marginLeft: '12px',
                }}
                title="Remove attachment"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Delete task */}
      <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--color-border)' }}>
        <button
          onClick={handleDelete}
          style={{
            padding: '6px 14px',
            background: 'transparent',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            color: 'var(--color-text-muted)',
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          Delete task
        </button>
      </div>
    </div>
  )
}

const backLinkStyle = {
  fontSize: '13px',
  color: 'var(--color-text-muted)',
  marginBottom: '24px',
  display: 'inline-block',
  textDecoration: 'none',
}

const inputStyle = {
  padding: '8px 12px',
  background: 'var(--color-bg)',
  border: '1px solid var(--color-border)',
  borderRadius: '6px',
  color: 'var(--color-text)',
  fontSize: '14px',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}
