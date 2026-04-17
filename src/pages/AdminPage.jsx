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

  if (adminLoading || (!isAdmin && adminLoading)) {
    return <PageShell><LoadingText>Checking access…</LoadingText></PageShell>
  }

  if (!isAdmin) return null // navigating away

  return (
    <PageShell>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
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

      {/* Body */}
      {error && (
        <p style={{ color: '#b45309', fontSize: 14 }}>Failed to load: {error}</p>
      )}

      {dataLoading && !error && (
        <LoadingText>Loading feedback…</LoadingText>
      )}

      {!dataLoading && !error && reports.length === 0 && (
        <p style={{ color: 'rgba(244,234,214,.5)', fontSize: 14 }}>
          No feedback yet.
        </p>
      )}

      {!dataLoading && reports.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {reports.map((r) => (
            <FeedbackRow key={r.id} report={r} />
          ))}
        </div>
      )}
    </PageShell>
  )
}

function FeedbackRow({ report }) {
  const [attachUrl, setAttachUrl] = useState(null)
  const [attachLoading, setAttachLoading] = useState(false)

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
        flexDirection: 'column',
        gap: 10,
      }}
    >
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
