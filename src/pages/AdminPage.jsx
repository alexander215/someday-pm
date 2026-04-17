import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import useIsAdmin from '../features/admin/useIsAdmin'

const TYPE_COLORS = {
  Bug:        { bg: 'rgba(180,83,9,0.12)',  text: '#b45309' },
  Suggestion: { bg: 'rgba(35,61,43,0.12)',  text: 'var(--brand-bg)' },
  Question:   { bg: 'rgba(59,130,246,0.12)', text: '#2563eb' },
}

const IMAGE_EXTS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg'])

function isImagePath(path) {
  if (!path) return false
  const ext = path.split('.').pop()?.toLowerCase() ?? ''
  return IMAGE_EXTS.has(ext)
}

export default function AdminPage() {
  const navigate = useNavigate()
  const { isAdmin, loading: adminLoading } = useIsAdmin()

  const [reports, setReports] = useState([])
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('inbox') // 'inbox' | 'complete'

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

  // Returns true on success, false on error
  async function handleToggleComplete(report) {
    const nowComplete = !report.is_complete
    const patch = nowComplete
      ? { is_complete: true, completed_at: new Date().toISOString() }
      : { is_complete: false, completed_at: null }

    const { error } = await supabase
      .from('feedback_reports')
      .update(patch)
      .eq('id', report.id)

    if (error) return false

    setReports((prev) =>
      prev.map((r) => (r.id === report.id ? { ...r, ...patch } : r))
    )
    return true
  }

  if (adminLoading || (!isAdmin && adminLoading)) {
    return <PageShell><LoadingText>Checking access…</LoadingText></PageShell>
  }

  if (!isAdmin) return null

  const inbox = reports.filter((r) => !r.is_complete)
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {activeList.map((r) => (
            <FeedbackCard
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

function FeedbackCard({ report, onToggleComplete }) {
  // Checkbox save status
  const [checkStatus, setCheckStatus] = useState('idle') // 'idle'|'saving'|'saved'|'error'
  const checkTimerRef = useRef(null)

  // Image preview
  const [imageUrl, setImageUrl] = useState(null)
  const [imageLoading, setImageLoading] = useState(false)

  // Admin notes
  const [notes, setNotes] = useState(report.admin_notes ?? '')
  const [notesStatus, setNotesStatus] = useState('idle') // 'idle'|'saving'|'saved'|'error'
  const saveTimerRef = useRef(null)

  const hasAttachment = Boolean(report.attachment_path)
  const attachIsImage = isImagePath(report.attachment_path)

  // Eagerly fetch signed URL for image attachments so the preview is ready without a click
  useEffect(() => {
    if (!hasAttachment || !attachIsImage) return
    setImageLoading(true)
    supabase.storage
      .from('feedback-uploads')
      .createSignedUrl(report.attachment_path, 3600)
      .then(({ data, error }) => {
        if (!error && data?.signedUrl) setImageUrl(data.signedUrl)
      })
      .finally(() => setImageLoading(false))
  }, [report.attachment_path, hasAttachment, attachIsImage])

  async function handleViewFile() {
    const { data, error } = await supabase.storage
      .from('feedback-uploads')
      .createSignedUrl(report.attachment_path, 3600)
    if (!error && data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  async function handleCheck() {
    setCheckStatus('saving')
    clearTimeout(checkTimerRef.current)
    const ok = await onToggleComplete()
    if (ok) {
      setCheckStatus('saved')
      checkTimerRef.current = setTimeout(() => setCheckStatus('idle'), 2000)
    } else {
      setCheckStatus('error')
    }
  }

  function handleNotesChange(val) {
    setNotes(val)
    clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(async () => {
      setNotesStatus('saving')
      const { error } = await supabase
        .from('feedback_reports')
        .update({ admin_notes: val })
        .eq('id', report.id)
      if (error) {
        setNotesStatus('error')
      } else {
        setNotesStatus('saved')
        setTimeout(() => setNotesStatus('idle'), 2000)
      }
    }, 800)
  }

  const typeStyle = TYPE_COLORS[report.type] ?? TYPE_COLORS.Question
  const date = new Date(report.created_at).toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  const checkSaving = checkStatus === 'saving'

  return (
    <div
      style={{
        background: 'var(--brand-surface-soft)',
        border: '1px solid rgba(183,165,134,0.25)',
        borderRadius: 14,
        overflow: 'hidden',
        opacity: report.is_complete ? 0.7 : 1,
        transition: 'opacity 0.15s',
      }}
    >
      {/* Main card body */}
      <div style={{ padding: '18px 20px', display: 'flex', gap: 14 }}>

        {/* Left column: checkbox + inline status */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, paddingTop: 2, flexShrink: 0 }}>
          <button
            onClick={handleCheck}
            disabled={checkSaving}
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
              cursor: checkSaving ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              flexShrink: 0,
              opacity: checkSaving ? 0.5 : 1,
              transition: 'opacity 0.1s',
            }}
          >
            {report.is_complete && (
              <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                <path d="M1 4.5L4 7.5L10 1" stroke="rgba(183,165,134,0.8)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>

          {/* Tiny status indicator below checkbox */}
          {checkStatus !== 'idle' && (
            <span
              style={{
                fontSize: 9,
                fontWeight: 600,
                color: checkStatus === 'error' ? '#b45309' : 'rgba(183,165,134,0.65)',
                lineHeight: 1,
              }}
            >
              {checkStatus === 'saving' ? '…' : checkStatus === 'saved' ? '✓' : '!'}
            </span>
          )}
        </div>

        {/* Right column: content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>

          {/* Header: type badge + date */}
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

          {/* Metadata: email, page, non-image file */}
          {(report.email || report.page_url || (hasAttachment && !attachIsImage)) && (
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
              {hasAttachment && !attachIsImage && (
                <MetaItem label="File" value={
                  <button
                    onClick={handleViewFile}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: 'var(--brand-bg)',
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    View file
                  </button>
                } />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Image preview strip — only when attachment is an image */}
      {hasAttachment && attachIsImage && (
        <div
          style={{
            borderTop: '1px solid rgba(183,165,134,0.15)',
            padding: '12px 20px 16px',
            background: 'rgba(0,0,0,0.06)',
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: 'rgba(244,234,214,.4)',
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              display: 'block',
              marginBottom: 8,
            }}
          >
            Screenshot
          </span>
          {imageLoading && (
            <p style={{ fontSize: 12, color: 'rgba(244,234,214,.4)', margin: 0 }}>Loading…</p>
          )}
          {imageUrl && !imageLoading && (
            <a href={imageUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-block' }}>
              <img
                src={imageUrl}
                alt="Feedback screenshot"
                style={{
                  maxWidth: '100%',
                  maxHeight: 360,
                  objectFit: 'contain',
                  borderRadius: 8,
                  border: '1px solid rgba(183,165,134,0.2)',
                  display: 'block',
                  cursor: 'zoom-in',
                }}
              />
            </a>
          )}
          {!imageUrl && !imageLoading && (
            <p style={{ fontSize: 12, color: 'rgba(244,234,214,.4)', margin: 0 }}>Image unavailable.</p>
          )}
        </div>
      )}

      {/* Admin notes */}
      <div
        style={{
          borderTop: '1px solid rgba(183,165,134,0.15)',
          padding: '12px 20px 16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            marginBottom: 6,
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: 'rgba(244,234,214,.4)',
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
            }}
          >
            Notes
          </span>
          {notesStatus !== 'idle' && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 500,
                color: notesStatus === 'error'
                  ? '#b45309'
                  : notesStatus === 'saving'
                    ? 'rgba(244,234,214,.3)'
                    : 'rgba(183,165,134,0.55)',
              }}
            >
              {notesStatus === 'saving' ? 'Saving…' : notesStatus === 'saved' ? 'Saved' : "Couldn't save"}
            </span>
          )}
        </div>
        <textarea
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="Internal notes…"
          rows={2}
          style={{
            width: '100%',
            background: 'rgba(0,0,0,0.12)',
            border: '1px solid rgba(183,165,134,0.18)',
            borderRadius: 7,
            padding: '8px 10px',
            fontSize: 13,
            color: 'var(--brand-text)',
            lineHeight: 1.5,
            resize: 'vertical',
            outline: 'none',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
          }}
        />
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
