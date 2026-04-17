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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const navigate = useNavigate()
  const { isAdmin, loading: adminLoading } = useIsAdmin()

  const [reports, setReports]       = useState([])
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError]           = useState(null)
  const [activeTab, setActiveTab]   = useState('inbox') // 'inbox' | 'complete'
  const [selectedId, setSelectedId] = useState(null)   // id of open modal row

  useEffect(() => {
    if (!adminLoading && !isAdmin) navigate('/', { replace: true })
  }, [isAdmin, adminLoading, navigate])

  useEffect(() => {
    if (adminLoading || !isAdmin) return
    supabase
      .from('feedback_reports')
      .select('*, feedback_admin_notes(notes)')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setReports(data ?? [])
      })
      .finally(() => setDataLoading(false))
  }, [isAdmin, adminLoading])

  // Returns true on success so callers can reflect status
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

  // Keep notes in the reports array so re-opening a modal shows the saved text
  function handleNotesSaved(reportId, newNotes) {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? { ...r, feedback_admin_notes: [{ notes: newNotes }] }
          : r
      )
    )
  }

  if (adminLoading || (!isAdmin && adminLoading)) {
    return <PageShell><LoadingText>Checking access…</LoadingText></PageShell>
  }
  if (!isAdmin) return null

  const inbox = reports.filter((r) => !r.is_complete)
  const complete = reports
    .filter((r) => r.is_complete)
    .sort((a, b) => new Date(b.completed_at ?? b.created_at) - new Date(a.completed_at ?? a.created_at))

  const activeList     = activeTab === 'inbox' ? inbox : complete
  const selectedReport = selectedId ? (reports.find((r) => r.id === selectedId) ?? null) : null

  return (
    <PageShell>
      {/* ── Header ── */}
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

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        {['inbox', 'complete'].map((tab) => {
          const count  = tab === 'inbox' ? inbox.length : complete.length
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

      {/* ── Body ── */}
      {error && <p style={{ color: '#b45309', fontSize: 14 }}>Failed to load: {error}</p>}
      {dataLoading && !error && <LoadingText>Loading feedback…</LoadingText>}
      {!dataLoading && !error && activeList.length === 0 && (
        <p style={{ color: 'rgba(244,234,214,.5)', fontSize: 14 }}>
          {activeTab === 'inbox' ? 'No open feedback.' : 'Nothing completed yet.'}
        </p>
      )}

      {!dataLoading && activeList.length > 0 && (
        <div
          style={{
            border: '1px solid rgba(183,165,134,0.2)',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          {activeList.map((r, i) => (
            <FeedbackRow
              key={r.id}
              report={r}
              isLast={i === activeList.length - 1}
              onOpen={() => setSelectedId(r.id)}
              onToggleComplete={() => handleToggleComplete(r)}
            />
          ))}
        </div>
      )}

      {/* ── Modal ── */}
      {selectedReport && (
        <FeedbackModal
          report={selectedReport}
          onClose={() => setSelectedId(null)}
          onToggleComplete={() => handleToggleComplete(selectedReport)}
          onNotesSaved={(notes) => handleNotesSaved(selectedReport.id, notes)}
        />
      )}
    </PageShell>
  )
}

// ─── List row ─────────────────────────────────────────────────────────────────

function FeedbackRow({ report, isLast, onOpen, onToggleComplete }) {
  const [checkStatus, setCheckStatus] = useState('idle') // 'idle'|'saving'|'saved'|'error'
  const checkTimerRef = useRef(null)
  const [thumbUrl, setThumbUrl]       = useState(null)
  const attachIsImage = isImagePath(report.attachment_path)

  // Fetch thumbnail signed URL on mount for image attachments
  useEffect(() => {
    if (!report.attachment_path || !attachIsImage) return
    supabase.storage
      .from('feedback-uploads')
      .createSignedUrl(report.attachment_path, 3600)
      .then(({ data, error }) => {
        if (!error && data?.signedUrl) setThumbUrl(data.signedUrl)
      })
  }, [report.attachment_path, attachIsImage])

  async function handleCheck(e) {
    e.stopPropagation() // don't also open the modal
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

  const typeStyle  = TYPE_COLORS[report.type] ?? TYPE_COLORS.Question
  const shortDate  = new Date(report.created_at).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric',
  })
  const preview    = report.message.length > 90
    ? report.message.slice(0, 90).trimEnd() + '…'
    : report.message
  const checkSaving = checkStatus === 'saving'

  return (
    <div
      onClick={onOpen}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 16px',
        background: 'var(--brand-surface-soft)',
        borderBottom: isLast ? 'none' : '1px solid rgba(183,165,134,0.15)',
        cursor: 'pointer',
        opacity: report.is_complete ? 0.65 : 1,
        transition: 'opacity 0.15s, background 0.1s',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(183,165,134,0.07)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--brand-surface-soft)' }}
    >
      {/* Checkbox + tiny status */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0 }}>
        <button
          onClick={handleCheck}
          disabled={checkSaving}
          title={report.is_complete ? 'Move back to Inbox' : 'Mark complete'}
          style={{
            width: 18,
            height: 18,
            borderRadius: 4,
            border: report.is_complete
              ? '1.5px solid rgba(183,165,134,0.5)'
              : '1.5px solid rgba(183,165,134,0.4)',
            background: report.is_complete ? 'rgba(183,165,134,0.15)' : 'transparent',
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
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="rgba(183,165,134,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
        {checkStatus !== 'idle' && (
          <span style={{
            fontSize: 8,
            fontWeight: 700,
            color: checkStatus === 'error' ? '#b45309' : 'rgba(183,165,134,0.65)',
            lineHeight: 1,
          }}>
            {checkStatus === 'saving' ? '…' : checkStatus === 'saved' ? '✓' : '!'}
          </span>
        )}
      </div>

      {/* Type badge */}
      <span
        style={{
          flexShrink: 0,
          display: 'inline-block',
          padding: '2px 8px',
          borderRadius: 99,
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.3px',
          background: typeStyle.bg,
          color: typeStyle.text,
          whiteSpace: 'nowrap',
        }}
      >
        {report.type}
      </span>

      {/* Message preview */}
      <span
        style={{
          flex: 1,
          fontSize: 13,
          color: 'var(--brand-text)',
          opacity: 0.75,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          minWidth: 0,
        }}
      >
        {preview}
      </span>

      {/* Image thumbnail */}
      {thumbUrl && (
        <img
          src={thumbUrl}
          alt=""
          style={{
            width: 40,
            height: 28,
            objectFit: 'cover',
            borderRadius: 5,
            border: '1px solid rgba(183,165,134,0.2)',
            flexShrink: 0,
          }}
        />
      )}

      {/* Date */}
      <span style={{ fontSize: 11, color: 'rgba(244,234,214,.4)', whiteSpace: 'nowrap', flexShrink: 0 }}>
        {shortDate}
      </span>

      {/* Chevron */}
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, opacity: 0.28 }}>
        <path d="M4.5 2.5L8 6L4.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

// ─── Detail modal ─────────────────────────────────────────────────────────────

function FeedbackModal({ report, onClose, onToggleComplete, onNotesSaved }) {
  const [checkStatus, setCheckStatus] = useState('idle') // 'idle'|'saving'|'saved'|'error'
  const checkTimerRef = useRef(null)
  const [imageUrl, setImageUrl]         = useState(null)
  const [imageLoading, setImageLoading] = useState(false)
  const [notes, setNotes]               = useState(report.feedback_admin_notes?.[0]?.notes ?? '')
  const [notesStatus, setNotesStatus]   = useState('idle') // 'idle'|'saving'|'saved'|'error'
  const saveTimerRef = useRef(null)

  const hasAttachment = Boolean(report.attachment_path)
  const attachIsImage = isImagePath(report.attachment_path)

  // Close on Escape
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  // Prevent background scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // Fetch signed URL for inline screenshot
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
        .from('feedback_admin_notes')
        .upsert(
          { feedback_report_id: report.id, notes: val },
          { onConflict: 'feedback_report_id' }
        )
      if (error) {
        setNotesStatus('error')
      } else {
        setNotesStatus('saved')
        onNotesSaved(val) // keep parent reports array in sync
        setTimeout(() => setNotesStatus('idle'), 2000)
      }
    }, 800)
  }

  const typeStyle   = TYPE_COLORS[report.type] ?? TYPE_COLORS.Question
  const date        = new Date(report.created_at).toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
  const checkSaving = checkStatus === 'saving'

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15,12,9,0.72)',
          backdropFilter: 'blur(3px)',
          zIndex: 100,
        }}
      />

      {/* Panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(640px, calc(100vw - 32px))',
          maxHeight: 'calc(100vh - 64px)',
          overflowY: 'auto',
          background: 'var(--brand-surface-soft)',
          border: '1px solid rgba(183,165,134,0.3)',
          borderRadius: 16,
          zIndex: 101,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Modal header: checkbox + type badge | date + close */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '13px 18px',
            borderBottom: '1px solid rgba(183,165,134,0.15)',
            flexShrink: 0,
          }}
        >
          {/* Left: checkbox, save status, type */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
                background: report.is_complete ? 'rgba(183,165,134,0.15)' : 'transparent',
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
            {checkStatus !== 'idle' && (
              <span style={{
                fontSize: 10,
                fontWeight: 600,
                color: checkStatus === 'error' ? '#b45309' : 'rgba(183,165,134,0.65)',
              }}>
                {checkStatus === 'saving' ? 'Saving…' : checkStatus === 'saved' ? 'Saved' : 'Error'}
              </span>
            )}
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
          </div>

          {/* Right: date + close button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12, color: 'rgba(244,234,214,.4)', whiteSpace: 'nowrap' }}>
              {date}
            </span>
            <button
              onClick={onClose}
              title="Close (Esc)"
              style={{
                background: 'none',
                border: '1px solid rgba(183,165,134,0.2)',
                borderRadius: 6,
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'rgba(244,234,214,.5)',
                padding: 0,
                flexShrink: 0,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Full message */}
        <div style={{ padding: '16px 20px' }}>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              color: 'var(--brand-dark)',
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
            }}
          >
            {report.message}
          </p>
        </div>

        {/* Metadata */}
        {(report.email || report.page_url || (hasAttachment && !attachIsImage)) && (
          <div style={{ padding: '0 20px 16px', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {report.email && <MetaItem label="From" value={report.email} />}
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
                    background: 'none', border: 'none', padding: 0,
                    color: 'var(--brand-bg)', fontSize: 12, fontWeight: 500,
                    cursor: 'pointer', textDecoration: 'underline',
                  }}
                >
                  View file
                </button>
              } />
            )}
          </div>
        )}

        {/* Inline screenshot */}
        {hasAttachment && attachIsImage && (
          <div
            style={{
              borderTop: '1px solid rgba(183,165,134,0.15)',
              padding: '12px 20px 16px',
              background: 'rgba(0,0,0,0.05)',
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
            padding: '12px 20px 18px',
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
          {/* Scoped placeholder color — inline styles can't target ::placeholder */}
          <style>{`.fan-textarea::placeholder { color: rgba(62,48,34,0.4); }`}</style>
          <textarea
            className="fan-textarea"
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Internal notes…"
            rows={3}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(183,165,134,0.18)',
              borderRadius: 7,
              padding: '8px 10px',
              fontSize: 13,
              color: 'var(--brand-dark)',
              caretColor: 'var(--brand-dark)',
              lineHeight: 1.5,
              resize: 'vertical',
              outline: 'none',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>
    </>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function MetaItem({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'baseline' }}>
      <span style={{
        fontSize: 11,
        fontWeight: 600,
        color: 'var(--brand-text-dark-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        opacity: 0.7,
      }}>
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
