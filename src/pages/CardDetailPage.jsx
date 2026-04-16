import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getCardById, getChildCards, createChildCard, deleteCard, CHILD_CATEGORIES } from '../lib/cards'

export default function CardDetailPage() {
  const { cardId } = useParams()
  const navigate = useNavigate()
  const [card, setCard] = useState(null)
  const [children, setChildren] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Create child form state
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState(CHILD_CATEGORIES[0])
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    Promise.all([getCardById(cardId), getChildCards(cardId)])
      .then(([cardData, childData]) => {
        setCard(cardData)
        setChildren(childData)
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

  async function handleDeleteCard() {
    if (!confirm(`Delete "${card.title}"? This will also delete all its tasks.`)) return
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

      {/* Card header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, letterSpacing: '-0.3px', marginRight: '16px' }}>
          {card.title}
        </h1>
        <span
          style={{
            fontSize: '11px',
            padding: '3px 10px',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            color: 'var(--color-text-muted)',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            marginTop: '4px',
          }}
        >
          {card.category}
        </span>
      </div>

      {/* Meta */}
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
              <span style={{ fontSize: '14px' }}>{child.title}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    border: '1px solid var(--color-border)',
                    borderRadius: '12px',
                    color: 'var(--color-text-muted)',
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
