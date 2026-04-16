import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../features/auth/useAuth'
import { getRootCards, createRootCard, ROOT_CATEGORIES } from '../lib/cards'

export default function HomePage() {
  const { user, loading, signInWithGoogle, signOut } = useAuth()

  if (loading) {
    return (
      <div style={{ padding: '48px 32px', color: 'var(--color-text-muted)', fontSize: '14px' }}>
        Loading…
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{ padding: '80px 32px', maxWidth: '480px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '12px', letterSpacing: '-0.5px' }}>
          someday.
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '48px', fontSize: '16px', lineHeight: 1.6 }}>
          Your private side-project manager. Capture ideas, track progress, and ship when you're ready.
        </p>

        <button
          onClick={signInWithGoogle}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 20px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            color: 'var(--color-text)',
            fontSize: '15px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'border-color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
        >
          <GoogleIcon />
          Continue with Google
        </button>
      </div>
    )
  }

  return <Dashboard user={user} signOut={signOut} />
}

function Dashboard({ user, signOut }) {
  const [cards, setCards] = useState([])
  const [cardsLoading, setCardsLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState(ROOT_CATEGORIES[0])
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    getRootCards()
      .then(setCards)
      .catch(err => setError(err.message))
      .finally(() => setCardsLoading(false))
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    if (!newTitle.trim()) return
    setCreating(true)
    setError(null)
    try {
      const card = await createRootCard({ title: newTitle.trim(), category: newCategory })
      setCards(prev => [card, ...prev])
      setNewTitle('')
      setNewCategory(ROOT_CATEGORIES[0])
      setShowCreate(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div style={{ padding: '48px 32px', maxWidth: '640px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.3px' }}>someday.</h1>
        <button
          onClick={signOut}
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
          Sign out
        </button>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '32px' }}>
        {user.email}
      </p>

      {/* Error */}
      {error && (
        <p style={{ color: '#f87171', fontSize: '13px', marginBottom: '16px' }}>{error}</p>
      )}

      {/* Create button */}
      {!showCreate && (
        <button
          onClick={() => setShowCreate(true)}
          style={{
            marginBottom: '24px',
            padding: '8px 16px',
            background: 'var(--color-accent)',
            border: 'none',
            borderRadius: '6px',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          + New project
        </button>
      )}

      {/* Inline create form */}
      {showCreate && (
        <form
          onSubmit={handleCreate}
          style={{
            marginBottom: '24px',
            padding: '16px',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            background: 'var(--color-surface)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <input
            autoFocus
            type="text"
            placeholder="Project title"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            style={inputStyle}
          />
          <select
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            style={inputStyle}
          >
            {ROOT_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="submit"
              disabled={creating || !newTitle.trim()}
              style={{
                padding: '7px 16px',
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
              {creating ? 'Creating…' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => { setShowCreate(false); setNewTitle(''); setNewCategory(ROOT_CATEGORIES[0]) }}
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
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Cards list */}
      {cardsLoading ? (
        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Loading projects…</p>
      ) : cards.length === 0 ? (
        <div
          style={{
            padding: '32px 24px',
            border: '1px dashed var(--color-border)',
            borderRadius: '8px',
            color: 'var(--color-text-muted)',
            fontSize: '14px',
            textAlign: 'center',
          }}
        >
          No projects yet. Create your first one above.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {cards.map(card => (
            <Link
              key={card.id}
              to={`/card/${card.id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                textDecoration: 'none',
                color: 'var(--color-text)',
                background: 'var(--color-surface)',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
            >
              <span style={{ fontSize: '14px', fontWeight: 500 }}>{card.title}</span>
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
                {card.category}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
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

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.96L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}
