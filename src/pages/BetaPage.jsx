import { Link } from 'react-router-dom'

const C = {
  canvas:  '#f7f5f0',
  forest:  '#1c2d20',
  inset:   '#ede5d2',
  ink:     '#18180f',
  muted:   '#6b6454',
  soft:    '#8a7e6e',
  yellow:  '#f2e79c',
}

export default function BetaPage() {
  return (
    <div style={{
      background: C.canvas,
      color: C.ink,
      fontFamily: 'var(--font-body)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* Nav — dark forest glass, matching landing page */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '18px 40px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: 'rgba(20,34,22,0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <Link to="/" style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: '18px',
          color: '#f3e7cf',
          textDecoration: 'none',
          letterSpacing: '-0.3px',
        }}>
          SomedayPM
        </Link>
        <Link to="/" style={{
          display: 'inline-block',
          padding: '7px 16px',
          background: 'transparent',
          color: 'rgba(243,231,207,0.75)',
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
          fontWeight: 500,
          borderRadius: '8px',
          border: '1px solid rgba(243,231,207,0.2)',
          textDecoration: 'none',
        }}>
          ← Home
        </Link>
      </nav>

      {/* Content */}
      <div style={{ flex: 1, maxWidth: '680px', margin: '0 auto', padding: '72px 40px' }}>
        <div style={{
          background: C.inset,
          borderRadius: '20px',
          padding: '52px 48px',
          border: '1px solid rgba(24,24,15,0.07)',
          boxShadow: '0 8px 32px rgba(24,24,15,0.06)',
        }}>
          {/* Yellow pill */}
          <div style={{
            display: 'inline-block',
            background: C.yellow,
            color: C.forest,
            fontSize: '11px',
            fontWeight: 700,
            padding: '4px 12px',
            borderRadius: '99px',
            marginBottom: '28px',
            letterSpacing: '0.9px',
            textTransform: 'uppercase',
          }}>
            Private beta
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'clamp(26px, 4vw, 38px)',
            lineHeight: 1.1,
            marginBottom: '20px',
            color: C.ink,
            letterSpacing: '-0.03em',
          }}>
            Request beta access<br />to SomedayPM
          </h1>

          <p style={{ fontSize: '16px', color: C.muted, lineHeight: 1.85, marginBottom: '16px' }}>
            SomedayPM is currently in private beta — a small, focused group while we shape the experience around real side-project workflows.
          </p>
          <p style={{ fontSize: '16px', color: C.muted, lineHeight: 1.85, marginBottom: '40px' }}>
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
              background: C.yellow,
              color: C.forest,
              fontFamily: 'var(--font-body)',
              fontSize: '15px',
              fontWeight: 700,
              borderRadius: '10px',
              textDecoration: 'none',
              letterSpacing: '0.1px',
            }}
          >
            <LinkedInIcon />
            Message me on LinkedIn
          </a>

          <p style={{
            marginTop: '40px',
            fontSize: '14px',
            color: C.muted,
            lineHeight: 1.75,
            borderLeft: `2px solid ${C.forest}`,
            paddingLeft: '16px',
          }}>
            No forms. No waitlist email blasts. Just a real conversation about what would make this useful for you.
          </p>
        </div>
      </div>

      {/* Footer — matching landing page */}
      <footer style={{
        padding: '28px 40px',
        borderTop: '1px solid rgba(24,24,15,0.07)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        background: C.canvas,
      }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          color: C.forest,
          fontSize: '15px',
        }}>
          SomedayPM
        </span>
        <span style={{ fontSize: '13px', color: C.soft }}>
          Built for the ideas you'll get to someday.
        </span>
      </footer>
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
