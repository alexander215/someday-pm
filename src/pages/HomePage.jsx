import useAuth from '../features/auth/useAuth'

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

  return (
    <div style={{ padding: '48px 32px', maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
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

      <div
        style={{
          padding: '24px',
          border: '1px dashed var(--color-border)',
          borderRadius: '8px',
          color: 'var(--color-text-muted)',
          fontSize: '14px',
        }}
      >
        Dashboard placeholder — your project cards will live here.
      </div>
    </div>
  )
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
