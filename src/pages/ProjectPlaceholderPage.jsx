// Temporary — replace with ProjectShell in Phase 4
import { useParams, useNavigate } from 'react-router-dom'

export default function ProjectPlaceholderPage() {
  const { projectId, stageKey } = useParams()
  const navigate = useNavigate()

  return (
    <div
      style={{
        maxWidth: 480,
        margin: '80px auto',
        padding: '0 24px',
        textAlign: 'center',
        fontFamily: 'inherit',
      }}
    >
      <div style={{ fontSize: 32, marginBottom: 16 }}>🚧</div>
      <h2
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: 'var(--brand-text)',
          marginBottom: 8,
        }}
      >
        Project view coming in Phase 4
      </h2>
      <p style={{ fontSize: 13, color: 'var(--brand-text-muted)', marginBottom: 4 }}>
        Project ID: <code style={{ fontSize: 12 }}>{projectId}</code>
      </p>
      <p style={{ fontSize: 13, color: 'var(--brand-text-muted)', marginBottom: 28 }}>
        Stage: <code style={{ fontSize: 12 }}>{stageKey}</code>
      </p>
      <button
        onClick={() => navigate('/')}
        style={{
          padding: '9px 20px',
          borderRadius: 8,
          background: 'transparent',
          border: '1px solid rgba(243,231,207,0.2)',
          color: 'var(--brand-text-muted)',
          fontSize: 13,
          cursor: 'pointer',
        }}
      >
        ← Back to dashboard
      </button>
    </div>
  )
}
