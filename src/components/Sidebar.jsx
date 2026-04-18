import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar({ isOpen = false, onClose }) {
  const { pathname } = useLocation();

  // Close drawer on route change (e.g. after tapping a nav link on mobile)
  useEffect(() => {
    onClose?.();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  function navItemStyle(path) {
    const active = path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(path + "/");
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
    <>
      {/* Backdrop — visible on mobile when drawer is open */}
      <div
        className={`sidebar-backdrop${isOpen ? " is-open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`sidebar-root${isOpen ? " is-open" : ""}`}
        style={{
          width: 250,
          flexShrink: 0,
          background: "linear-gradient(180deg, rgba(0,0,0,.06), rgba(255,255,255,.01))",
          borderRight: "1px solid var(--brand-border)",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          backgroundColor: "#1d2d21",
        }}
      >
        {/* ── Brand area ── */}
        <div
          style={{
            padding: "18px 16px 16px",
            borderBottom: "1px solid var(--brand-border)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
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

          {/* Close button — only visible on mobile via CSS */}
          <button
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close menu"
            style={{
              display: "none",
              alignItems: "center",
              justifyContent: "center",
              width: 30,
              height: 30,
              borderRadius: 8,
              background: "transparent",
              border: "1px solid var(--brand-border-light)",
              color: "var(--brand-text-muted)",
              cursor: "pointer",
              flexShrink: 0,
              padding: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
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

          <Link to="/profile/settings" style={navItemStyle("/profile/settings")}>
            <NavIcon d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
            Profile
          </Link>

          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "var(--brand-text-muted)",
              padding: "0 6px",
              marginTop: 16,
              marginBottom: 6,
              letterSpacing: "0.8px",
              textTransform: "uppercase",
              opacity: 0.7,
            }}
          >
            Site
          </div>

          <Link to="/about" style={navItemStyle("/about")}>
            <NavIcon d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            About
          </Link>
          <Link to="/blog" style={navItemStyle("/blog")}>
            <NavIcon d="M4 6h16M4 12h16M4 18h10" />
            Blog
          </Link>
          <Link to="/contact" style={navItemStyle("/contact")}>
            <NavIcon d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            Contact
          </Link>
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
            Closed beta
          </span>
        </div>
      </aside>
    </>
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
