import { useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import useAuth from '../auth/useAuth'

const TYPES = ['Bug', 'Suggestion', 'Question']
const BUCKET = 'feedback-uploads'

export default function FeedbackModal({ onClose }) {
  const { user } = useAuth()

  const [type, setType] = useState('Bug')
  const [message, setMessage] = useState('')
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('idle') // 'idle' | 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState(null)
  const fileInputRef = useRef(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!message.trim()) return

    setStatus('loading')
    setErrorMsg(null)

    try {
      let attachmentPath = null

      // Upload file if provided
      if (file) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
        const path = `${user.id}/${Date.now()}-${safeName}`
        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { upsert: false })
        if (uploadError) throw uploadError
        attachmentPath = path
      }

      // Insert feedback record
      const { error: insertError } = await supabase
        .from('feedback_reports')
        .insert({
          type,
          message: message.trim(),
          email: user?.email ?? null,
          page_url: window.location.href,
          attachment_path: attachmentPath,
        })
      if (insertError) throw insertError

      setStatus('success')
    } catch (err) {
      setErrorMsg(err.message ?? 'Something went wrong.')
      setStatus('error')
    }
  }

  function handleReset() {
    setType('Bug')
    setMessage('')
    setFile(null)
    setStatus('idle')
    setErrorMsg(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(27,35,27,0.55)',
        zIndex: 60,
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          borderRadius: 14,
          overflow: 'hidden',
          background: 'var(--brand-surface-soft)',
          border: '1px solid rgba(183,165,134,0.35)',
          boxShadow: '0 20px 60px rgba(27,35,27,0.35)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 22px',
            borderBottom: '1px solid rgba(183,165,134,0.25)',
            background: 'var(--brand-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 16,
                color: 'var(--brand-dark)',
                letterSpacing: '-0.2px',
              }}
            >
              Send feedback
            </div>
            <div style={{ fontSize: 12, color: 'var(--brand-text-dark-muted)', marginTop: 2 }}>
              Report a bug, suggest a change, or ask a question.
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--brand-text-dark-muted)',
              fontSize: 18,
              lineHeight: 1,
              padding: '2px 6px',
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 22px' }}>
          {status === 'success' ? (
            <SuccessState onSendAnother={handleReset} onClose={onClose} />
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Type */}
              <div>
                <label style={labelStyle}>Type</label>
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  {TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      style={{
                        padding: '5px 14px',
                        borderRadius: 99,
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: type === t ? 'var(--brand-bg)' : 'rgba(183,165,134,0.4)',
                        background: type === t ? 'var(--brand-bg)' : 'transparent',
                        color: type === t ? 'var(--brand-surface-soft)' : 'var(--brand-text-dark-muted)',
                        transition: 'all 0.1s',
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label style={labelStyle}>
                  Message <span style={{ color: 'var(--brand-bg)', marginLeft: 2 }}>*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe what you noticed or what you'd like to see…"
                  required
                  disabled={status === 'loading'}
                  rows={5}
                  style={{
                    ...inputBase,
                    resize: 'vertical',
                    marginTop: 6,
                    fontFamily: 'inherit',
                    lineHeight: 1.6,
                  }}
                />
              </div>

              {/* File */}
              <div>
                <label style={labelStyle}>Screenshot or file <span style={{ opacity: 0.6, fontWeight: 400 }}>(optional)</span></label>
                <div style={{ marginTop: 6 }}>
                  {file ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '8px 12px',
                        background: 'var(--brand-surface)',
                        border: '1px solid rgba(183,165,134,0.3)',
                        borderRadius: 8,
                      }}
                    >
                      <span style={{ fontSize: 13, color: 'var(--brand-dark)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {file.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand-text-dark-muted)', fontSize: 14, padding: 0, flexShrink: 0 }}
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <label
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 7,
                        padding: '7px 14px',
                        borderRadius: 8,
                        border: '1px dashed rgba(183,165,134,0.5)',
                        color: 'var(--brand-text-dark-muted)',
                        fontSize: 13,
                        cursor: 'pointer',
                      }}
                    >
                      <AttachIcon />
                      Attach a file
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf,.txt"
                        style={{ display: 'none' }}
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                        disabled={status === 'loading'}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Error */}
              {status === 'error' && errorMsg && (
                <p style={{ margin: 0, fontSize: 13, color: '#b45309', lineHeight: 1.5 }}>
                  {errorMsg}
                </p>
              )}

              {/* Actions */}
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  justifyContent: 'flex-end',
                  paddingTop: 6,
                  borderTop: '1px solid rgba(183,165,134,0.2)',
                  marginTop: 2,
                }}
              >
                <button
                  type="button"
                  onClick={onClose}
                  disabled={status === 'loading'}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 7,
                    background: 'transparent',
                    border: '1px solid rgba(183,165,134,0.4)',
                    color: 'var(--brand-text-dark-muted)',
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={status === 'loading' || !message.trim()}
                  style={{
                    padding: '7px 18px',
                    borderRadius: 7,
                    background: 'var(--brand-bg)',
                    color: 'var(--brand-surface-soft)',
                    border: 'none',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: status === 'loading' || !message.trim() ? 'not-allowed' : 'pointer',
                    opacity: status === 'loading' || !message.trim() ? 0.6 : 1,
                  }}
                >
                  {status === 'loading' ? 'Sending…' : 'Send feedback'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

function SuccessState({ onSendAnother, onClose }) {
  return (
    <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'rgba(35,61,43,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
        }}
      >
        <CheckIcon />
      </div>
      <p style={{ fontWeight: 700, fontSize: 16, color: 'var(--brand-dark)', margin: '0 0 6px', fontFamily: 'var(--font-display)' }}>
        Feedback sent!
      </p>
      <p style={{ fontSize: 13, color: 'var(--brand-text-dark-muted)', margin: '0 0 24px', lineHeight: 1.6 }}>
        Thanks for taking the time. It genuinely helps shape the product.
      </p>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button
          onClick={onSendAnother}
          style={{
            padding: '7px 14px',
            borderRadius: 7,
            background: 'transparent',
            border: '1px solid rgba(183,165,134,0.4)',
            color: 'var(--brand-text-dark-muted)',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Send another
        </button>
        <button
          onClick={onClose}
          style={{
            padding: '7px 18px',
            borderRadius: 7,
            background: 'var(--brand-bg)',
            color: 'var(--brand-surface-soft)',
            border: 'none',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Done
        </button>
      </div>
    </div>
  )
}

// ── Icons ──

function AttachIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--brand-bg)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

// ── Shared styles ──

const labelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--brand-dark)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  opacity: 0.7,
  display: 'block',
}

const inputBase = {
  width: '100%',
  padding: '9px 12px',
  background: 'var(--brand-surface)',
  border: '1px solid rgba(183,165,134,0.35)',
  borderRadius: 8,
  color: 'var(--brand-dark)',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
}
