import { useParams } from 'react-router-dom'

export default function CardDetailPage() {
  const { cardId } = useParams()

  return (
    <div style={{ padding: '48px 32px' }}>
      <a
        href="/"
        style={{
          fontSize: '13px',
          color: 'var(--color-text-muted)',
          marginBottom: '24px',
          display: 'inline-block',
        }}
      >
        ← Back
      </a>

      <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px' }}>
        Card Detail
      </h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px', fontSize: '13px' }}>
        ID: {cardId}
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
        Card detail placeholder — full card view will live here.
      </div>
    </div>
  )
}
