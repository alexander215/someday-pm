export default function SitePageLoading() {
  return (
    <div
      style={{
        minHeight: "40vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: "48px 32px",
        color: "var(--color-text-muted)",
        fontSize: "14px",
        fontFamily: "var(--font-body)",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: 18,
          color: "var(--brand-text)",
          letterSpacing: "-0.03em",
        }}
      >
        SomedayPM
      </span>
      <span style={{ opacity: 0.85 }}>Loading…</span>
    </div>
  );
}
