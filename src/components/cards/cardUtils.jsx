import { useState } from 'react'

// ─── Due date display ─────────────────────────────────────────

export function parseDueDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.floor((d - today) / (1000 * 60 * 60 * 24))
  if (diff < 0) return { label: 'Overdue', color: '#b05050' }
  if (diff === 0) return { label: 'Today', color: '#b07520' }
  if (diff === 1) return { label: 'Tomorrow', color: '#b07520' }
  return {
    label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    color: 'var(--brand-text-muted)',
  }
}

export function DueDateBadge({ date }) {
  const info = parseDueDate(date)
  if (!info) return null
  return (
    <span style={{ fontSize: 11, color: info.color, fontWeight: 600, whiteSpace: 'nowrap' }}>
      {info.label}
    </span>
  )
}

// ─── Label badges ─────────────────────────────────────────────

export function LabelBadges({ labels }) {
  if (!labels?.length) return null
  return (
    <>
      {labels.map(l => (
        <span key={l} style={labelBadgeStyle}>{l}</span>
      ))}
    </>
  )
}

export const labelBadgeStyle = {
  fontSize: 11,
  fontWeight: 600,
  padding: '2px 7px',
  borderRadius: 4,
  background: 'rgba(183,165,134,0.18)',
  color: 'var(--brand-text-muted)',
  textTransform: 'capitalize',
  whiteSpace: 'nowrap',
}

// ─── Checklist progress indicator ────────────────────────────

export function ChecklistProgress({ items }) {
  if (!items?.length) return null
  const done = items.filter(i => i.completed).length
  return (
    <span style={{ fontSize: 11, color: 'var(--brand-text-muted)', opacity: 0.7, whiteSpace: 'nowrap' }}>
      ☐ {done}/{items.length}
    </span>
  )
}

// ─── Checkbox button ─────────────────────────────────────────

export function CheckboxBtn({ checked, onClick, size = 18 }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={checked ? 'Mark incomplete' : 'Mark complete'}
      style={{
        width: size,
        height: size,
        borderRadius: size <= 16 ? 3 : 4,
        border: checked ? 'none' : '1.5px solid rgba(64,57,47,0.35)',
        background: checked ? 'var(--brand-accent-mustard)' : 'transparent',
        flexShrink: 0,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
      }}
    >
      {checked && (
        <svg width={size * 0.56} height={size * 0.45} viewBox="0 0 10 8" fill="none">
          <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  )
}

// ─── Delete button ────────────────────────────────────────────
// visibility: "hover" (default) — hidden until hover, used by board / detail / other modules
// visibility: "persistent" — always visible baseline opacity; hover strengthens (Starting list rows)

export function DeleteBtn({ onClick, label = 'Delete', visibility = 'hover' }) {
  const [hover, setHover] = useState(false)
  const persistent = visibility === 'persistent'
  const opacity = persistent
    ? (hover ? 0.88 : 0.5)
    : (hover ? 0.6 : 0)
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--brand-text-on-inset-muted)',
        opacity,
        fontSize: 18,
        lineHeight: 1,
        padding: '0 2px',
        transition: 'opacity 0.1s',
        flexShrink: 0,
      }}
    >
      ×
    </button>
  )
}

// ─── Section label ────────────────────────────────────────────

export function FieldLabel({ children }) {
  return (
    <span style={{
      fontSize: 11,
      fontWeight: 700,
      color: 'var(--brand-text-muted)',
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      opacity: 0.7,
    }}>
      {children}
    </span>
  )
}

// ─── Shared input/textarea styles ─────────────────────────────

export const insetInputStyle = {
  background: 'rgba(183,165,134,0.06)',
  border: '1px solid rgba(183,165,134,0.2)',
  borderRadius: 6,
  padding: '6px 10px',
  fontSize: 13,
  fontFamily: 'var(--font-body)',
  color: 'var(--brand-text-on-inset)',
  outline: 'none',
  boxSizing: 'border-box',
}
