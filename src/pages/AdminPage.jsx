import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import useIsAdmin from '../features/admin/useIsAdmin'

const TYPE_COLORS = {
  Bug:        { bg: 'rgba(180,83,9,0.12)',  text: '#b45309' },
  Suggestion: { bg: 'rgba(35,61,43,0.12)',  text: 'var(--brand-bg)' },
  Question:   { bg: 'rgba(59,130,246,0.12)', text: '#2563eb' },
}

export default function AdminPage() {
  const navigate = useNavigate()
  const { isAdmin, loading: adminLoading } = useIsAdmin()

  const [reports, setReports] = useState([])
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('inbox') // 'inbox' | 'complete'

  // Redirect non-admins away — belt-and-suspenders on top of RLS.
  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate('/', { replace: true })
    }
  }, [isAdmin, adminLoading, navigate])

  useEffect(() => {
    if (adminLoading || !isAdmin) return
    supabase
      .from('feedback_reports')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setReports(data ?? [])
      })
      .finally(() => setDataLoading(false))
  }, [isAdmin, adminLoading])

  async function handleToggleComplete(report) {
    const nowComplete = !report.is_complete
    const patch = nowComplete
      ? { is_complete: true, completed_at: new Date().toISOString() }
      : { is_complete: false, completed_at: null }

    const { error } = await supabase
      .from('feedback_reports')
      .update(patch)
      .eq('id', report.id)

    if (error) return // silently ignore — user will see no change

    setReports((prev) =>
      prev.map((r) => (r.id === report.id ? { ...r, ...patch } : r))
    )
  }

  if (adminLoading || (!isAdmin && adminLoading)) {
    return <PageShell><LoadingText>Checking access…</LoadingText></PageShell>
  }

  if (!isAdmin) return null // navigating away

  const inbox    = reports.filter((r) => !r.is_complete)
  const complete = reports
    .filter((r) => r.is_complete)
    .sort((a, b) => new Date(b.completed_at ?? b.created_at) - new Date(a.completed_at ?? a.created_at))

  const activeList = activeTab === 'inbox' ? inbox : complete

  return (
    <PageShell>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <span
          style={{
            display: 'inline-block',
            background: 'rgba(242,231,156,0.12)',
            border: '1px solid rgba(242,231,156,0.22)',
            color: 'var(--brand-accent-yellow)',
            fontSize: 10,
            fontWeight: 600,
            padding: '3px 10px',
            borderRadius: 99,
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
            marginBottom: 12,
          }}
        >
          Admin
        </span>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
            letterSpacing: '-.04em',
            lineHeight: 1,
            color: 'var(--brand-text)',
            margin: 0,
          }}
        >
          Feedback inbox
        </h2>
        <p style={{ margin: '8px 0 0', color: 'rgba(244,234,214,.6)', fontSize: 14 }}>
          All beta feedback, newest first.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        {['inbox', 'complete'].map((tab) => {
          const count = tab === 'inbox' ? inbox.length : complete.length
          const active = activeTab === tab
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '6px 14px',
                borderRadius: 7,
                border: active
                  ? '1px solid rgba(242,231,156,0.4)'
                  : '1px solid rgba(183,165,134,0.2)',
                background: active ? 'rgba(242,231,156,0.1)' : 'transparent',
                color: active ? 'var(--brand-text)' : 'rgba(244,234,214,.5)',
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 7,
              }}
            >
              {tab === 'inbox' ? 'Inbox' : 'Complete'}
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  background: active ? 'rgba(242,231,156,0.15)' : 'rgba(183,165,134,0.1)',
                  color: active ? 'var(--brand-text)' : 'rgba(244,234,214,.4)',
                  borderRadius: 99,
                  padding: '1px 7px',
                  minWidth: 20,
                  textAlign: 'center',
                }}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Body */}
      {error && (
        <p style={{ color: '#b45309', fontSize: 14 }}>Failed to load: {error}</p>
      )}

      {dataLoading && !error && (
        <LoadingText>Loading feedback…</LoadingText>
      )}

      {!dataLoading && !error && activeList.length === 0 && (
        <p style={{ color: 'rgba(244,234,214,.5)', fontSize: 14 }}>
          {activeTab === 'inbox' ? 'No open feedback.' : 'Nothing completed yet.'}
        </p>
      )}

      {!dataLoading && activeList.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {activeList.map((r) => (
            <FeedbackRow
              key={r.id}
              report={r}
              onToggleComplete={() => handleToggleComplete(r)}
            />
          ))}
        </div>
      )}
    </PageShell>
  )
}

function FeedbackRow({ report, onToggleComplete }) {
  const [attachUrl, setAttachUrl] = useState(null)
  const [attachLoading, setAttachLoading] = useState(false)
  const [toggling, setToggling] = useState(false)

  async function handleViewAttachment() {
    if (attachUrl) { window.open(attachUrl, '_blank'); return }
    setAttachLoading(true)
    const { data, error } = await supabase.storage
      .from('feedback-uploads')
      .createSignedUrl(report.attachment_path, 3600)
    setAttachLoading(false)
    if (error || !data?.signedUrl) return
    setAttachUrl(data.signedUrl)
    window.open(data.signedUrl, '_blank')
  }

  async function handleCheck() {
    setToggling(true)
    await onToggleComplete()
    setToggling(false)
  }

  const typeStyle = TYPE_COLORS[report.type] ?? TYPE_COLORS.Question
  const date = new Date(report.created_at).toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <div
      style={{
        background: 'var(--brand-surface-soft)',
        border: '1px solid rgba(183,165,134,0.25)',
        borderRadius: 12,
        padding: '18px 20px',
        display: 'flex',
        gap: 14,
        opacity: report.is_complete ? 0.65 : 1,
        transition: 'opacity 0.15s',
      }}
    >
      {/* Checkbox */}
      <div style={{ paddingTop: 2, flexShrink: 0 }}>
        <button
          onClick={handleCheck}
          disabled={toggling}
          title={report.is_complete ? 'Move back to Inbox' : 'Mark complete'}
          style={{
            width: 20,
            height: 20,
            borderRadius: 5,
            border: report.is_complete
              ? '1.5px solid rgba(183,165,134,0.5)'
              : '1.5px solid rgba(183,165,134,0.4)',
            background: report.is_complete
              ? 'rgba(183,165,134,0.15)'
              : 'transparent',
            cursor: toggling ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            flexShrink: 0,
            opacity: toggling ? 0.5 : 1,
            transition: 'opacity 0.1s',
          }}
        >
          {report.is_complete && (
            <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
              <path d="M1 4.5L4 7.5L10 1" stroke="rgba(183,165,134,0.8)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
        {/* Top row: type badge + date */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <span
            style={{
              display: 'inline-block',
              padding: '3px 10px',
              borderRadius: 99,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.4px',
              background: typeStyle.bg,
              color: typeStyle.text,
            }}
          >
            {report.type}
          </span>
          <span style={{ fontSize: 12, color: 'var(--brand-text-dark-muted)', whiteSpace: 'nowrap' }}>
            {date}
          </span>
        </div>

        {/* Message */}
        <p
          style={{
            margin: 0,
            fontSize: 14,
            color: 'var(--brand-dark)',
            lineHeight: 1.65,
            whiteSpace: 'pre-wrap',
          }}
        >
          {report.message}
        </p>

        {/* Metadata row */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 2 }}>
          {report.email && (
            <MetaItem label="From" value={report.email} />
          )}
          {report.page_url && (
            <MetaItem label="Page" value={
              <a
                href={report.page_url}
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--brand-bg)', textDecoration: 'none', fontWeight: 500 }}
              >
                {report.page_url.replace(/^https?:\/\/[^/]+/, '') || '/'}
              </a>
            } />
          )}
          {report.attachment_path && (
            <MetaItem label="Attachment" value={
              <button
                onClick={handleViewAttachment}
                disabled={attachLoading}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: 'var(--brand-bg)',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  opacity: attachLoading ? 0.6 : 1,
                }}
              >
                {attachLoading ? 'Loading…' : 'View file'}
              </button>
            } />
          )}
        </div>
      </div>
    </div>
  )
}

function MetaItem({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'baseline' }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--brand-text-dark-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.7 }}>
        {label}
      </span>
      <span style={{ fontSize: 12, color: 'var(--brand-text-dark-muted)' }}>
        {value}
      </span>
    </div>
  )
}

function PageShell({ children }) {
  return (
    <div style={{ padding: '28px 28px 48px', maxWidth: 760 }}>
      {children}
    </div>
  )
}

function LoadingText({ children }) {
  return (
    <p style={{ color: 'rgba(244,234,214,.6)', fontSize: 14, margin: 0 }}>
      {children}
    </p>
  )
}
