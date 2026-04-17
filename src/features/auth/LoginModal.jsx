import { useState } from 'react'
import useAuth from './useAuth'

export default function LoginModal({ onClose }) {
  const { sendOtp, verifyOtp } = useAuth()

  const [step, setStep] = useState('email') // 'email' | 'otp'
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSendOtp(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { error } = await sendOtp(email.trim())
      if (error) {
        // Supabase returns a generic error for unknown emails when shouldCreateUser=false
        if (error.message?.toLowerCase().includes('signups not allowed')) {
          setError('This email is not on the beta invite list.')
        } else {
          setError(error.message)
        }
        return
      }
      setStep('otp')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { error } = await verifyOtp(email.trim(), token.trim())
      if (error) {
        if (error.message?.toLowerCase().includes('token') || error.message?.toLowerCase().includes('expired')) {
          setError('Invalid or expired code. Please try again.')
        } else {
          setError(error.message)
        }
        return
      }
      // Session is set via onAuthStateChange in AuthProvider — just close the modal
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    // Backdrop
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(20, 35, 25, 0.72)',
        backdropFilter: 'blur(4px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      {/* Modal card */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--brand-surface-soft)',
          border: '1px solid rgba(35,38,31,0.12)',
          borderRadius: '20px',
          padding: '40px',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 24px 64px rgba(20,35,25,0.4)',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '20px',
              color: 'var(--brand-dark)',
              letterSpacing: '-0.2px',
              display: 'block',
              marginBottom: '6px',
            }}
          >
            SomedayPM
          </span>
          <p style={{ fontSize: '14px', color: 'var(--brand-text-dark-muted)', margin: 0, lineHeight: 1.6 }}>
            {step === 'email'
              ? 'Sign in with your invited email address.'
              : `Check your inbox — an 8-digit code was sent to ${email}`}
          </p>
        </div>

        {/* Email step */}
        {step === 'email' && (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              disabled={loading}
              style={inputStyle}
            />
            {error && <p style={errorStyle}>{error}</p>}
            <button
              type="submit"
              disabled={loading || !email.trim()}
              style={{ ...btnPrimary, opacity: loading || !email.trim() ? 0.6 : 1 }}
            >
              {loading ? 'Sending…' : 'Send code'}
            </button>
          </form>
        )}

        {/* OTP step */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="text"
              inputMode="numeric"
              placeholder="8-digit code"
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 8))}
              required
              autoFocus
              disabled={loading}
              style={{ ...inputStyle, letterSpacing: '0.15em', fontSize: '20px', textAlign: 'center' }}
            />
            {error && <p style={errorStyle}>{error}</p>}
            <button
              type="submit"
              disabled={loading || token.length < 8}
              style={{ ...btnPrimary, opacity: loading || token.length < 8 ? 0.6 : 1 }}
            >
              {loading ? 'Verifying…' : 'Verify code'}
            </button>
            <button
              type="button"
              onClick={() => { setStep('email'); setToken(''); setError(null) }}
              disabled={loading}
              style={btnBack}
            >
              ← Change email
            </button>
          </form>
        )}

        {/* Cancel */}
        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: '20px',
            background: 'none',
            border: 'none',
            color: 'var(--brand-text-dark-muted)',
            fontSize: '13px',
            cursor: 'pointer',
            padding: 0,
            display: 'block',
            width: '100%',
            textAlign: 'center',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

const inputStyle = {
  padding: '10px 14px',
  background: 'var(--brand-surface)',
  border: '1px solid var(--brand-border-light)',
  borderRadius: '8px',
  color: 'var(--brand-dark)',
  fontSize: '15px',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}

const btnPrimary = {
  padding: '11px 20px',
  background: 'var(--brand-bg)',
  border: 'none',
  borderRadius: '8px',
  color: 'var(--brand-surface-soft)',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  width: '100%',
  transition: 'opacity 0.15s',
}

const btnBack = {
  background: 'none',
  border: 'none',
  color: 'var(--brand-text-dark-muted)',
  fontSize: '13px',
  cursor: 'pointer',
  padding: '4px 0',
  textAlign: 'left',
}

const errorStyle = {
  color: '#b45309',
  fontSize: '13px',
  margin: 0,
  lineHeight: 1.5,
}
