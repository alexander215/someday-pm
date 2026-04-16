export default function HomePage() {
  return (
    <div style={{ padding: '48px 32px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '8px' }}>
        someday.
      </h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px' }}>
        Your private side-project manager.
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
        Dashboard placeholder — cards will live here.
      </div>
    </div>
  )
}
