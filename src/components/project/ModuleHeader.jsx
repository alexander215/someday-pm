export default function ModuleHeader({ label, description }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <h3
        style={{
          fontSize: "0.9rem",
          fontWeight: 700,
          color: "var(--brand-text)",
          letterSpacing: "-0.01em",
          marginBottom: 3,
        }}
      >
        {label}
      </h3>
      {description && (
        <p
          style={{
            fontSize: 12,
            color: "var(--brand-text-muted)",
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}
