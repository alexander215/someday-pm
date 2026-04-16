import { Link, useLocation } from "react-router-dom";

export default function Sidebar({ onOpenProfile }) {
  const { pathname } = useLocation();

  function navItemStyle(path) {
    const active = path === "/" ? pathname === "/" : pathname.startsWith(path);
    return {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "12px 14px",
      borderRadius: 14,
      color: "var(--brand-text)",
      background: active ? "rgba(0,0,0,.18)" : "transparent",
      border: active
        ? "1px solid rgba(244,234,214,.06)"
        : "1px solid transparent",
      boxShadow: active ? "inset 3px 0 0 var(--brand-accent-yellow)" : "none",
      textDecoration: "none",
      fontSize: 14,
      fontWeight: 600,
      transition: "background 0.1s",
      width: "100%",
      textAlign: "left",
      cursor: "pointer",
    };
  }

  return (
    <aside
      style={{
        width: 250,
        flexShrink: 0,
        background: "linear-gradient(180deg, rgba(0,0,0,.06), rgba(255,255,255,.01))",
        borderRight: "1px solid var(--brand-border)",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
      }}
    >
      {/* ── Brand area ── */}
      <div
        style={{
          padding: "18px 16px 16px",
          borderBottom: "1px solid var(--brand-border)",
        }}
      >
        <Link to="/" style={{ textDecoration: "none" }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              color: "var(--brand-surface-soft)",
              fontSize: 32,
              lineHeight: 0.9,
              letterSpacing: "-0.05em",
            }}
          >
            Someday<br />PM
          </div>
          <div
            style={{
              fontSize: 13,
              color: "rgba(244,234,214,.72)",
              marginTop: 8,
            }}
          >
            Personal workspace
          </div>
        </Link>
      </div>

      {/* ── Navigation ── */}
      <nav
        style={{
          flex: 1,
          padding: "14px 10px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "var(--brand-text-muted)",
            padding: "0 6px",
            marginBottom: 6,
            letterSpacing: "0.8px",
            textTransform: "uppercase",
            opacity: 0.7,
          }}
        >
          Main
        </div>

        <Link to="/" style={navItemStyle("/")}>
          <NavIcon d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          Projects
        </Link>

        <button
          onClick={onOpenProfile}
          style={navItemStyle("/profile")}
        >
          <NavIcon d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
          Profile
        </button>
      </nav>

      {/* ── Workspace badge ── */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid var(--brand-border)",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 10px",
            background: "rgba(242,231,156,0.10)",
            border: "1px solid rgba(242,231,156,0.18)",
            borderRadius: 99,
            color: "var(--brand-accent-yellow)",
            fontSize: 11,
            fontWeight: 500,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--brand-accent-yellow)",
              opacity: 0.8,
            }}
          />
          Personal
        </span>
      </div>
    </aside>
  );
}

// Minimal inline SVG icon (24×24 viewBox, stroke-based)
function NavIcon({ d }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, opacity: 0.75 }}
    >
      <path d={d} />
    </svg>
  );
}
