import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../features/auth/useAuth'
import { getRootCards, createRootCard, ROOT_CATEGORIES } from '../lib/cards'

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
    return <MarketingPage signInWithGoogle={signInWithGoogle} />
  }

  return <Dashboard user={user} signOut={signOut} />
}

// ─────────────────────────────────────────────
// Logged-out marketing homepage
// ─────────────────────────────────────────────

function MarketingPage({ signInWithGoogle }) {
  function scrollToVibe(e) {
    e.preventDefault()
    document.getElementById('vibe')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div style={{ background: 'var(--brand-bg)', color: 'var(--brand-text)', fontFamily: 'var(--font-body)', minHeight: '100vh' }}>

      {/* ── Nav ── */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 40px',
        borderBottom: '1px solid var(--brand-border-light)',
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(111, 123, 87, 0.94)',
        backdropFilter: 'blur(10px)',
      }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '20px', color: 'var(--brand-surface)', letterSpacing: '-0.2px' }}>
          Someday PM
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={signInWithGoogle}
            style={{ ...btnGhost, fontSize: '14px', padding: '7px 16px' }}
          >
            Sign in
          </button>
          <Link to="/beta" style={btnPrimary}>Request beta access</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '80px 40px 72px', display: 'flex', gap: '64px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 400px', maxWidth: '560px' }}>
          <div style={{ display: 'inline-block', background: 'var(--brand-accent-yellow)', color: 'var(--brand-dark)', fontSize: '11px', fontWeight: 600, padding: '4px 12px', borderRadius: '99px', marginBottom: '28px', letterSpacing: '0.7px', textTransform: 'uppercase' }}>
            Private beta
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(38px, 6vw, 64px)', lineHeight: 1.05, marginBottom: '22px', color: 'var(--brand-surface-soft)', letterSpacing: '-0.5px' }}>
            Project Management<br />for Side Projects
          </h1>
          <p style={{ fontSize: '18px', color: 'var(--brand-text-muted)', fontWeight: 400, marginBottom: '16px', lineHeight: 1.6 }}>
            A calm, focused tool for keeping your ideas moving — without the pressure of work tools.
          </p>
          <p style={{ fontSize: '15px', color: 'var(--brand-text-muted)', lineHeight: 1.9, marginBottom: '40px', opacity: 0.75 }}>
            Side projects start with a spark. Someday PM gives them just enough structure to stay alive, without turning them into a second job.
          </p>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link to="/beta" style={{ ...btnPrimary, fontSize: '15px', padding: '12px 26px' }}>
              Request beta access
            </Link>
            <a href="#vibe" onClick={scrollToVibe} style={{ fontSize: '15px', color: 'var(--brand-text-muted)', fontWeight: 500, textDecoration: 'none', borderBottom: '1px solid var(--brand-border-light)', paddingBottom: '1px' }}>
              View the vibe ↓
            </a>
          </div>
        </div>

        {/* Hero mockup placeholder */}
        {/* TODO: Replace this placeholder with a real product screenshot once the app UI is polished */}
        <div style={{ flex: '1 1 300px', display: 'flex', justifyContent: 'center' }}>
          <MockupProjectList />
        </div>
      </section>

      {/* ── Problem / Why ── */}
      <section style={{ background: 'var(--brand-bg-deep)', padding: '80px 40px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(26px, 4vw, 42px)', marginBottom: '52px', lineHeight: 1.15, color: 'var(--brand-accent-yellow)' }}>
            Side projects shouldn't feel like<br />status meetings
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginBottom: '48px' }}>
            {[
              { label: 'You start excited, then stall', text: 'A blank page with no clear next step. The momentum fades before you even begin.' },
              { label: 'Work tools work against you', text: 'Deadlines, red flags, overdue banners — built for teams, not for Tuesday nights with a good idea.' },
              { label: 'Notes scatter, progress disappears', text: 'Sticky notes, random docs, half-finished threads. You have context everywhere and a view of nothing.' },
            ].map(({ label, text }) => (
              <div key={label} style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', borderLeft: '2px solid var(--brand-accent-yellow)', paddingLeft: '20px' }}>
                <div>
                  <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--brand-text-muted)', marginBottom: '6px' }}>{label}</p>
                  <p style={{ fontSize: '15px', lineHeight: 1.75, color: 'rgba(216, 221, 204, 0.65)' }}>{text}</p>
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '17px', fontWeight: 500, color: 'var(--brand-surface)', lineHeight: 1.7 }}>
            Someday PM keeps everything together without turning your hobby into a second job.
          </p>
        </div>
      </section>

      {/* ── Promise / What's different ── */}
      <section style={{ background: 'var(--brand-surface)', padding: '80px 40px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(24px, 4vw, 38px)', marginBottom: '16px', color: 'var(--brand-dark)' }}>
            All the good parts of PM,<br />none of the stress
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--brand-text-dark-muted)', marginBottom: '52px', maxWidth: '520px', lineHeight: 1.8 }}>
            Built from the ground up for people who have ideas worth tracking, but not a team demanding weekly updates.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {[
              {
                accent: 'var(--brand-bg)',
                label: 'Gentle structure',
                body: 'Capture what\'s on your mind, break it into steps, and check in when you\'re ready. No sprints, no standups.',
              },
              {
                accent: 'var(--brand-accent-yellow)',
                label: 'Positive language',
                body: 'No "overdue" banners. No red flags. Just a calm view of where things stand and what\'s next.',
              },
              {
                accent: 'var(--brand-bg-deep)',
                label: 'Built for side-energy',
                body: 'Whether you have 20 minutes or a full Sunday, pick up right where you left off. Someday PM waits for you.',
              },
            ].map(({ accent, label, body }) => (
              <div key={label} style={{ background: 'var(--brand-surface-soft)', border: '1px solid rgba(35,38,31,0.1)', borderRadius: '12px', padding: '28px 24px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: accent, marginBottom: '18px' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '10px', color: 'var(--brand-dark)' }}>{label}</h3>
                <p style={{ fontSize: '14px', color: 'var(--brand-text-dark-muted)', lineHeight: 1.75 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ background: 'var(--brand-bg)', padding: '80px 40px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(24px, 4vw, 38px)', marginBottom: '56px', color: 'var(--brand-surface-soft)' }}>
            Built for the way you actually work
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
            {[
              {
                n: '01',
                title: 'Capture your projects',
                body: 'Drop in an idea and give it a title. No setup, no templates, no forms to fill. Just a place to put things.',
              },
              {
                n: '02',
                title: 'Break them into cards',
                body: 'Add tasks, notes, due dates, and files — without overthinking it. Structure grows with you, not before you.',
              },
              {
                n: '03',
                title: 'Return whenever you\'re ready',
                body: 'No pressure. Someday PM remembers exactly where you left off. Come back in an hour or a month — it\'ll be there.',
              },
            ].map(({ n, title, body }) => (
              <div key={n} style={{ display: 'flex', gap: '28px', alignItems: 'flex-start' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: 'var(--brand-accent-yellow)', flexShrink: 0, lineHeight: 1.1, minWidth: '44px', opacity: 0.9 }}>{n}</span>
                <div style={{ borderTop: '1px solid var(--brand-border-light)', paddingTop: '4px', flex: 1 }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: 'var(--brand-surface-soft)' }}>{title}</h3>
                  <p style={{ fontSize: '14px', color: 'var(--brand-text-muted)', lineHeight: 1.8 }}>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it feels (Vibe) ── */}
      <section id="vibe" style={{ background: 'var(--brand-surface)', padding: '80px 40px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(24px, 4vw, 38px)', marginBottom: '20px', color: 'var(--brand-dark)' }}>
            Feels more like packaging<br />than a dashboard
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--brand-text-dark-muted)', maxWidth: '520px', lineHeight: 1.8, marginBottom: '52px' }}>
            From the muted greens and warm cream tones to status names that skip the stress response —
            every design choice is meant to feel personal and calm, not corporate.
          </p>
          {/* TODO: Replace these stylized mockups with real product screenshots once the UI is polished */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'start' }}>
            <MockupProjectList />
            <MockupCardDetail />
            <MockupChildCard />
          </div>
        </div>
      </section>

      {/* ── Closing CTA ── */}
      <section style={{ background: 'var(--brand-bg-deep)', padding: '88px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(26px, 4vw, 44px)', marginBottom: '18px', color: 'var(--brand-surface-soft)', lineHeight: 1.15 }}>
            Help shape Someday PM
          </h2>
          <p style={{ fontSize: '17px', color: 'var(--brand-text-muted)', lineHeight: 1.8, marginBottom: '40px' }}>
            We're building this for people who take their side projects seriously — even when life doesn't make it easy.
            If that's you, we'd love to have you in the beta.
          </p>
          <Link to="/beta" style={{ ...btnPrimary, fontSize: '15px', padding: '13px 30px', display: 'inline-block' }}>
            Request beta access
          </Link>
          <p style={{ marginTop: '24px', fontSize: '13px', color: 'var(--brand-text-muted)', opacity: 0.6 }}>
            Small beta. Real feedback. No spam.
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ padding: '28px 40px', borderTop: '1px solid var(--brand-border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', background: 'var(--brand-bg)' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--brand-surface)', fontSize: '15px' }}>Someday PM</span>
        <span style={{ fontSize: '13px', color: 'var(--brand-text-muted)' }}>Built for the ideas you'll get to someday.</span>
      </footer>
    </div>
  )
}

// ─────────────────────────────────────────────
// Stylized mockup placeholders
// TODO: Replace these with real product screenshots once the app UI is polished
// ─────────────────────────────────────────────

function MockupProjectList() {
  const projects = ['Brand Redesign', 'Podcast Side Hustle', 'Travel Blog', 'iOS App']
  const categories = ['Design', 'Content', 'Writing', 'Dev']
  return (
    <div style={{ background: 'var(--brand-surface-soft)', border: '1px solid rgba(35,38,31,0.1)', borderRadius: '16px', padding: '22px', boxShadow: '0 12px 40px rgba(35,38,31,0.15)', width: '100%', maxWidth: '320px' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: 'var(--brand-dark)', marginBottom: '16px', letterSpacing: '-0.2px' }}>My Projects</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {projects.map((p, i) => (
          <div key={p} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--brand-surface)', borderRadius: '8px', border: '1px solid rgba(35,38,31,0.08)' }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--brand-dark)' }}>{p}</span>
            <span style={{ fontSize: '10px', padding: '2px 8px', background: i === 0 ? 'var(--brand-accent-yellow)' : 'transparent', border: '1px solid rgba(35,38,31,0.12)', borderRadius: '99px', color: 'var(--brand-text-dark-muted)', whiteSpace: 'nowrap' }}>{categories[i]}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '10px', padding: '8px 12px', borderRadius: '8px', border: '1.5px dashed rgba(35,38,31,0.2)', color: 'var(--brand-text-dark-muted)', fontSize: '12px', textAlign: 'center' }}>
        + New project
      </div>
    </div>
  )
}

function MockupCardDetail() {
  return (
    <div style={{ background: 'var(--brand-surface-soft)', border: '1px solid rgba(35,38,31,0.1)', borderRadius: '16px', padding: '22px', boxShadow: '0 12px 40px rgba(35,38,31,0.12)', width: '100%', maxWidth: '320px' }}>
      <div style={{ fontSize: '11px', color: 'var(--brand-bg)', marginBottom: '12px', fontWeight: 500 }}>← My Projects</div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', color: 'var(--brand-dark)', marginBottom: '6px', borderBottom: '1px solid rgba(35,38,31,0.1)', paddingBottom: '10px' }}>Brand Redesign</div>
      <div style={{ display: 'flex', gap: '8px', marginTop: '10px', marginBottom: '16px' }}>
        <span style={{ fontSize: '11px', padding: '3px 10px', background: 'var(--brand-accent-yellow)', borderRadius: '99px', color: 'var(--brand-dark)', fontWeight: 600 }}>Design</span>
        <span style={{ fontSize: '11px', padding: '3px 10px', background: 'rgba(111,123,87,0.14)', borderRadius: '99px', color: 'var(--brand-bg)', fontWeight: 600 }}>In progress</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {['Mood board', 'Color palette', 'Logo concepts', 'Type system'].map((t, i) => (
          <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', border: '1px solid rgba(35,38,31,0.08)', borderRadius: '7px', background: 'var(--brand-surface)' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', border: '1.5px solid', borderColor: i < 2 ? 'var(--brand-bg)' : 'rgba(35,38,31,0.2)', background: i < 2 ? 'var(--brand-bg)' : 'transparent', flexShrink: 0 }} />
            <span style={{ fontSize: '12px', color: i < 2 ? 'var(--brand-text-dark-muted)' : 'var(--brand-dark)', textDecoration: i < 2 ? 'line-through' : 'none' }}>{t}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MockupChildCard() {
  return (
    <div style={{ background: 'var(--brand-surface-soft)', border: '1px solid rgba(35,38,31,0.1)', borderRadius: '16px', padding: '22px', boxShadow: '0 12px 40px rgba(35,38,31,0.12)', width: '100%', maxWidth: '320px' }}>
      <div style={{ fontSize: '11px', color: 'var(--brand-bg)', marginBottom: '12px', fontWeight: 500 }}>← Brand Redesign</div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: 'var(--brand-dark)', borderBottom: '1px solid rgba(35,38,31,0.1)', paddingBottom: '10px', marginBottom: '14px' }}>Color palette</div>
      <div style={{ fontSize: '12px', color: 'var(--brand-text-dark-muted)', lineHeight: 1.75, marginBottom: '14px', background: 'var(--brand-surface)', padding: '10px 12px', borderRadius: '8px' }}>
        Muted green and warm cream for the base. Yellow accent for moments that matter. Calm but not boring.
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {['#6F7B57', '#F4F1E6', '#D9D97A', '#566347'].map(c => (
          <div key={c} style={{ width: '26px', height: '26px', borderRadius: '50%', background: c, border: '1.5px solid rgba(35,38,31,0.12)' }} title={c} />
        ))}
      </div>
      <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
        <div style={{ flex: 1, padding: '7px 10px', background: 'var(--brand-accent-yellow)', borderRadius: '7px', fontSize: '12px', fontWeight: 600, color: 'var(--brand-dark)', textAlign: 'center' }}>Save</div>
        <div style={{ padding: '7px 10px', background: 'transparent', border: '1px solid rgba(35,38,31,0.12)', borderRadius: '7px', fontSize: '12px', color: 'var(--brand-text-dark-muted)', textAlign: 'center' }}>Delete</div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Shared button styles
// ─────────────────────────────────────────────

const btnPrimary = {
  display: 'inline-block',
  padding: '10px 22px',
  background: 'var(--brand-accent-yellow)',
  color: 'var(--brand-dark)',
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  fontWeight: 600,
  borderRadius: '8px',
  textDecoration: 'none',
  border: 'none',
  cursor: 'pointer',
  letterSpacing: '0.1px',
}

const btnGhost = {
  display: 'inline-block',
  padding: '8px 18px',
  background: 'transparent',
  color: 'var(--brand-text-muted)',
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  fontWeight: 500,
  borderRadius: '8px',
  border: '1px solid var(--brand-border-light)',
  cursor: 'pointer',
  textDecoration: 'none',
}

function Dashboard({ user, signOut }) {
  const [cards, setCards] = useState([])
  const [cardsLoading, setCardsLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState(ROOT_CATEGORIES[0])
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    getRootCards()
      .then(setCards)
      .catch(err => setError(err.message))
      .finally(() => setCardsLoading(false))
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    if (!newTitle.trim()) return
    setCreating(true)
    setError(null)
    try {
      const card = await createRootCard({ title: newTitle.trim(), category: newCategory })
      setCards(prev => [card, ...prev])
      setNewTitle('')
      setNewCategory(ROOT_CATEGORIES[0])
      setShowCreate(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div style={{ padding: '48px 32px', maxWidth: '640px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
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

      {/* Error */}
      {error && (
        <p style={{ color: '#f87171', fontSize: '13px', marginBottom: '16px' }}>{error}</p>
      )}

      {/* Create button */}
      {!showCreate && (
        <button
          onClick={() => setShowCreate(true)}
          style={{
            marginBottom: '24px',
            padding: '8px 16px',
            background: 'var(--color-accent)',
            border: 'none',
            borderRadius: '6px',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          + New project
        </button>
      )}

      {/* Inline create form */}
      {showCreate && (
        <form
          onSubmit={handleCreate}
          style={{
            marginBottom: '24px',
            padding: '16px',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            background: 'var(--color-surface)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <input
            autoFocus
            type="text"
            placeholder="Project title"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            style={inputStyle}
          />
          <select
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            style={inputStyle}
          >
            {ROOT_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="submit"
              disabled={creating || !newTitle.trim()}
              style={{
                padding: '7px 16px',
                background: 'var(--color-accent)',
                border: 'none',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 500,
                cursor: creating ? 'not-allowed' : 'pointer',
                opacity: creating || !newTitle.trim() ? 0.6 : 1,
              }}
            >
              {creating ? 'Creating…' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => { setShowCreate(false); setNewTitle(''); setNewCategory(ROOT_CATEGORIES[0]) }}
              style={{
                padding: '7px 16px',
                background: 'transparent',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                color: 'var(--color-text-muted)',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Cards list */}
      {cardsLoading ? (
        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Loading projects…</p>
      ) : cards.length === 0 ? (
        <div
          style={{
            padding: '32px 24px',
            border: '1px dashed var(--color-border)',
            borderRadius: '8px',
            color: 'var(--color-text-muted)',
            fontSize: '14px',
            textAlign: 'center',
          }}
        >
          No projects yet. Create your first one above.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {cards.map(card => (
            <Link
              key={card.id}
              to={`/card/${card.id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                textDecoration: 'none',
                color: 'var(--color-text)',
                background: 'var(--color-surface)',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
            >
              <span style={{ fontSize: '14px', fontWeight: 500 }}>{card.title}</span>
              <span
                style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  border: '1px solid var(--color-border)',
                  borderRadius: '12px',
                  color: 'var(--color-text-muted)',
                  whiteSpace: 'nowrap',
                }}
              >
                {card.category}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

const inputStyle = {
  padding: '8px 12px',
  background: 'var(--color-bg)',
  border: '1px solid var(--color-border)',
  borderRadius: '6px',
  color: 'var(--color-text)',
  fontSize: '14px',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
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
