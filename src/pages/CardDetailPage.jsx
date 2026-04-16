import { useParams, Link } from 'react-router-dom'
import useAuth from '../features/auth/useAuth'

export default function CardDetailPage() {
  const { cardId } = useParams()
  const { user } = useAuth()

  return (
    <div style={{ padding: '48px 32px', maxWidth: '640px', margin: '0 auto' }}>
      <Link
        to="/"
        style={{
          fontSize: '13px',
          color: 'var(--color-text-muted)',
          marginBottom: '24px',
          display: 'inline-block',
        }}
      >
        ← Back
      </Link>

      <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px' }}>
        Card Detail
      </h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginBottom: '4px' }}>
        ID: {cardId}
      </p>
      {user && (
        <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginBottom: '32px' }}>
          Signed in as: {user.email}
        </p>
      )}

      <div
        style={{
          padding: '24px',
          border: '1px dashed var(--color-border)',
          borderRadius: '8px',
          color: 'var(--color-text-muted)',
          fontSize: '14px',
        }}
      >
        Card detail placeholder — full card view will live here.
      </div>
    </div>
  )
}
