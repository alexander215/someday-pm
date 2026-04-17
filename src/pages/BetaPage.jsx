import { Link } from 'react-router-dom'

export default function BetaPage() {
  return (
    <div style={{ background: 'var(--brand-bg)', color: 'var(--brand-text)', fontFamily: 'var(--font-body)', minHeight: '100vh' }}>

      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 40px',
        borderBottom: '1px solid var(--brand-border-light)',
      }}>
        <Link to="/" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '20px', color: 'var(--brand-surface)', textDecoration: 'none', letterSpacing: '-0.2px' }}>
          SomedayPM
        </Link>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '72px 40px' }}>
        <div style={{ background: 'var(--brand-surface-soft)', borderRadius: '20px', padding: '48px', border: '1px solid rgba(35,38,31,0.08)', boxShadow: '0 20px 60px rgba(35,38,31,0.14)' }}>
          <div style={{ display: 'inline-block', background: 'var(--brand-accent-yellow)', color: 'var(--brand-dark)', fontSize: '11px', fontWeight: 600, padding: '4px 12px', borderRadius: '99px', marginBottom: '28px', letterSpacing: '0.7px', textTransform: 'uppercase' }}>
            Private beta
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(26px, 4vw, 38px)', lineHeight: 1.15, marginBottom: '20px', color: 'var(--brand-dark)' }}>
            Request beta access<br />to SomedayPM
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--brand-text-dark-muted)', lineHeight: 1.85, marginBottom: '16px' }}>
            SomedayPM is currently in private beta — a small, focused group while we shape the experience around real side-project workflows.
          </p>
          <p style={{ fontSize: '16px', color: 'var(--brand-text-dark-muted)', lineHeight: 1.85, marginBottom: '40px' }}>
            If you'd like early access, send me a message on LinkedIn. Tell me a bit about how you manage your side projects today — what's working, what's frustrating, and what you're building.
          </p>

          <a
            href="https://www.linkedin.com/in/alexhoskinson/"
            target="_blank"
            rel="noreferrer noopener"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '13px 26px',
              background: 'var(--brand-accent-yellow)',
              color: 'var(--brand-dark)',
              fontFamily: 'var(--font-body)',
              fontSize: '15px',
              fontWeight: 600,
              borderRadius: '10px',
              textDecoration: 'none',
              letterSpacing: '0.1px',
            }}
          >
            <LinkedInIcon />
            Message me on LinkedIn
          </a>

          <p style={{ marginTop: '40px', fontSize: '14px', color: 'var(--brand-text-dark-muted)', lineHeight: 1.75, borderLeft: '2px solid var(--brand-bg)', paddingLeft: '16px' }}>
            No forms. No waitlist email blasts. Just a real conversation about what would make this useful for you.
          </p>

          <div style={{ marginTop: '40px' }}>
            <Link to="/" style={{ fontSize: '14px', color: 'var(--brand-bg)', textDecoration: 'none', fontWeight: 500 }}>
              ← Back to SomedayPM
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  )
}
