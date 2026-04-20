import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllTemplates } from '../lib/templates/index'
import { createProject } from '../lib/projects'

const templates = getAllTemplates()

export default function NewProjectPage() {
  const navigate = useNavigate()
  const [selectedKey, setSelectedKey] = useState(null)
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleCreate(e) {
    e.preventDefault()
    if (!title.trim() || !selectedKey) return
    setLoading(true)
    setError(null)
    try {
      const project = await createProject({ template_key: selectedKey, title: title.trim() })
      navigate(`/project/${project.id}/planning`)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        maxWidth: 640,
        margin: '64px auto',
        padding: '0 24px',
      }}
    >
      <button
        onClick={() => navigate(-1)}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--brand-text-muted)',
          fontSize: 13,
          cursor: 'pointer',
          padding: '0 0 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        ← Back
      </button>

      <h1
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: 'var(--brand-text)',
          marginBottom: 6,
          letterSpacing: '-0.02em',
        }}
      >
        New project
      </h1>
      <p style={{ fontSize: 14, color: 'var(--brand-text-muted)', marginBottom: 32 }}>
        Choose a template to get started.
      </p>

      {/* Step 1 — template chooser */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
        {templates.map((t) => {
          const active = selectedKey === t.key
          return (
            <button
              key={t.key}
              onClick={() => setSelectedKey(t.key)}
              style={{
                textAlign: 'left',
                padding: '16px 20px',
                borderRadius: 10,
                border: active
                  ? '1.5px solid var(--brand-accent-yellow)'
                  : '1.5px solid rgba(243,231,207,0.14)',
                background: active
                  ? 'rgba(242,231,156,0.07)'
                  : 'rgba(243,231,207,0.04)',
                cursor: 'pointer',
                transition: 'border-color 0.12s, background 0.12s',
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: active ? 'var(--brand-accent-yellow)' : 'var(--brand-text)',
                  marginBottom: 4,
                }}
              >
                {t.name}
              </div>
              <div style={{ fontSize: 13, color: 'var(--brand-text-muted)' }}>
                {t.description}
              </div>
            </button>
          )
        })}
      </div>

      {/* Step 2 — project name (shown after template selected) */}
      {selectedKey && (
        <form onSubmit={handleCreate}>
          <label
            style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--brand-text-muted)',
              marginBottom: 8,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            What's this project called?
          </label>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My project"
            maxLength={120}
            style={{
              width: '100%',
              padding: '11px 14px',
              borderRadius: 8,
              border: '1.5px solid rgba(243,231,207,0.18)',
              background: 'rgba(243,231,207,0.06)',
              color: 'var(--brand-text)',
              fontSize: 15,
              outline: 'none',
              boxSizing: 'border-box',
              marginBottom: 16,
            }}
          />
          {error && (
            <div
              style={{
                fontSize: 13,
                color: '#e57373',
                marginBottom: 12,
                padding: '8px 12px',
                borderRadius: 6,
                background: 'rgba(229,115,115,0.1)',
              }}
            >
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={!title.trim() || loading}
            style={{
              padding: '10px 24px',
              borderRadius: 8,
              background: !title.trim() || loading
                ? 'rgba(242,231,156,0.3)'
                : 'var(--brand-accent-yellow)',
              color: 'var(--brand-dark)',
              border: 'none',
              fontSize: 14,
              fontWeight: 700,
              cursor: !title.trim() || loading ? 'default' : 'pointer',
            }}
          >
            {loading ? 'Creating…' : 'Create project'}
          </button>
        </form>
      )}
    </div>
  )
}
