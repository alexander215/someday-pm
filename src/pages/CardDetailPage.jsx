import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getCardById, getChildCards, createChildCard, updateCard, deleteCard, CHILD_CATEGORIES, ROOT_CATEGORIES } from '../lib/cards'
import {
  listFilesForCard,
  uploadFilesForCard,
  deleteFileForCard,
  getDownloadUrl,
  ACCEPT_ATTR,
  formatBytes,
} from '../lib/files'

export default function CardDetailPage() {
  const { cardId } = useParams()
  const navigate = useNavigate()
  const [card, setCard] = useState(null)
  const [children, setChildren] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Root card inline edit state
  const [editMode, setEditMode] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [editDueDate, setEditDueDate] = useState('')
  const [editSaving, setEditSaving] = useState(false)

  // Create child form state
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState(CHILD_CATEGORIES[0])
  const [creating, setCreating] = useState(false)

  // Files state
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [fileError, setFileError] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    Promise.all([getCardById(cardId), getChildCards(cardId), listFilesForCard(cardId)])
      .then(([cardData, childData, filesData]) => {
        setCard(cardData)
        setChildren(childData)
        setFiles(filesData)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [cardId])

  async function handleCreateChild(e) {
    e.preventDefault()
    if (!newTitle.trim()) return
    setCreating(true)
    setError(null)
    try {
      const child = await createChildCard(cardId, { title: newTitle.trim(), category: newCategory })
      setChildren(prev => [...prev, child])
      setNewTitle('')
      setNewCategory(CHILD_CATEGORIES[0])
      setShowCreate(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  function startEdit() {
    setEditTitle(card.title)
    setEditCategory(card.category)
    setEditNotes(card.notes || '')
    setEditDueDate(card.deliverable_due_date || '')
    setEditMode(true)
  }

  function cancelEdit() {
    setEditMode(false)
  }

  async function handleEditSave() {
    if (!editTitle.trim()) return
    setEditSaving(true)
    setError(null)
    try {
      const updated = await updateCard(cardId, {
        title: editTitle.trim(),
        category: editCategory,
        notes: editNotes.trim() || null,
        deliverable_due_date: editDueDate || null,
      })
      setCard(updated)
      setEditMode(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setEditSaving(false)
    }
  }

  async function handleDeleteCard() {
    if (!confirm(`Delete "${card.title}"? This will also delete all its tasks and attachments.`)) return
    try {
      await deleteCard(cardId)
      navigate('/')
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDeleteChild(childId) {
    try {
      await deleteCard(childId)
      setChildren(prev => prev.filter(c => c.id !== childId))
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
      const newFiles = await uploadFilesForCard(cardId, selected)
      setFiles(prev => [...prev, ...newFiles])
    } catch (err) {
      setFileError(err.message)
    } finally {
      setUploading(false)
      // Reset so the same file can be re-uploaded after an error
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

  if (error && !card) {
    return (
      <div style={{ padding: '48px 32px', maxWidth: '640px', margin: '0 auto' }}>
        <Link to="/" style={backLinkStyle}>← Back</Link>
        <p style={{ color: '#f87171', fontSize: '14px' }}>{error}</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '48px 32px', maxWidth: '640px', margin: '0 auto' }}>
      <Link to="/" style={backLinkStyle}>← Back</Link>

      {/* Card header — view or edit mode */}
      {editMode ? (
        <div style={{ marginBottom: '24px' }}>
          <input
            autoFocus
            type="text"
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            placeholder="Project title"
            style={{
              ...inputStyle,
              fontSize: '20px',
              fontWeight: 600,
              marginBottom: '10px',
            }}
          />
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
            <select
              value={editCategory}
              onChange={e => setEditCategory(e.target.value)}
              style={{ ...inputStyle, width: 'auto', flex: '0 0 auto' }}
            >
              {ROOT_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input
              type="date"
              value={editDueDate}
              onChange={e => setEditDueDate(e.target.value)}
              style={{ ...inputStyle, width: 'auto', flex: '0 0 auto' }}
            />
          </div>
          <textarea
            value={editNotes}
            onChange={e => setEditNotes(e.target.value)}
            placeholder="Notes (optional)"
            rows={3}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6, fontFamily: 'inherit', marginBottom: '10px' }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleEditSave}
              disabled={editSaving || !editTitle.trim()}
              style={{
                padding: '6px 14px',
                background: 'var(--color-accent)',
                border: 'none',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 500,
                cursor: editSaving || !editTitle.trim() ? 'not-allowed' : 'pointer',
                opacity: editSaving || !editTitle.trim() ? 0.6 : 1,
              }}
            >
              {editSaving ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={cancelEdit}
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
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 600, letterSpacing: '-0.3px', marginRight: '16px' }}>
              {card.title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginTop: '4px' }}>
              <span
                style={{
                  fontSize: '11px',
                  padding: '3px 10px',
                  border: '1px solid var(--color-border)',
                  borderRadius: '12px',
                  color: 'var(--color-text-muted)',
                  whiteSpace: 'nowrap',
                }}
              >
                {card.category}
              </span>
              <button
                onClick={startEdit}
                style={{
                  background: 'none',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  color: 'var(--color-text-muted)',
                  fontSize: '12px',
                  padding: '3px 10px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Edit
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '24px' }}>
            {card.deliverable_due_date && (
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                Due: {card.deliverable_due_date}
              </p>
            )}
            {card.notes && (
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {card.notes}
              </p>
            )}
          </div>
        </>
      )}

      {error && (
        <p style={{ color: '#f87171', fontSize: '13px', marginBottom: '16px' }}>{error}</p>
      )}

      {/* Divider */}
      <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', marginBottom: '24px' }} />

      {/* Child cards section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 600 }}>Tasks</h2>
        {!showCreate && (
          <button
            onClick={() => setShowCreate(true)}
            style={{
              padding: '5px 12px',
              background: 'var(--color-accent)',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            + Add task
          </button>
        )}
      </div>

      {/* Inline create child form */}
      {showCreate && (
        <form
          onSubmit={handleCreateChild}
          style={{
            marginBottom: '16px',
            padding: '14px',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            background: 'var(--color-surface)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <input
            autoFocus
            type="text"
            placeholder="Task title"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            style={inputStyle}
          />
          <select
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            style={inputStyle}
          >
            {CHILD_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="submit"
              disabled={creating || !newTitle.trim()}
              style={{
                padding: '6px 14px',
                background: 'var(--color-accent)',
                border: 'none',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 500,
                cursor: creating ? 'not-allowed' : 'pointer',
                opacity: creating || !newTitle.trim() ? 0.6 : 1,
              }}
            >
              {creating ? 'Adding…' : 'Add'}
            </button>
            <button
              type="button"
              onClick={() => { setShowCreate(false); setNewTitle(''); setNewCategory(CHILD_CATEGORIES[0]) }}
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
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Child cards list */}
      {children.length === 0 && !showCreate ? (
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
          No tasks yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {children.map(child => (
            <div
              key={child.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                background: 'var(--color-surface)',
              }}
            >
              <Link
                to={`/card/${cardId}/item/${child.id}`}
                style={{
                  fontSize: '14px',
                  color: 'var(--color-text)',
                  textDecoration: 'none',
                  flex: 1,
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {child.title}
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, marginLeft: '10px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    border: '1px solid var(--color-border)',
                    borderRadius: '12px',
                    color: 'var(--color-text-muted)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {child.category}
                </span>
                <button
                  onClick={() => handleDeleteChild(child.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer',
                    fontSize: '16px',
                    lineHeight: 1,
                    padding: '0 2px',
                  }}
                  title="Delete task"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Attachments section */}
      <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '32px 0 24px' }} />

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

      {/* Delete project */}
      <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--color-border)' }}>
        <button
          onClick={handleDeleteCard}
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
          Delete project
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
