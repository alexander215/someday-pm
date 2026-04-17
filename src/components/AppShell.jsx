import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import ProfileModal from "./ProfileModal";
import HowToUseModal from "./HowToUseModal";
import FeedbackModal from "../features/feedback/FeedbackModal";
import useAuth from "../features/auth/useAuth";
import useIsAdmin from "../features/admin/useIsAdmin";

// CSS variable overrides scoped to the logged-in shell.
// All child pages use --color-* vars; overriding them here
// re-themes the entire workspace without touching page components.
// Dark-green workspace shell — cream reserved for cards/panels only.
const shellVars = {
  "--color-bg": "var(--brand-bg)",                  // dark green — workspace canvas
  "--color-surface": "#253c2f",                     // softer dark green — panel/section bg
  "--color-surface-2": "#2a4335",                   // hover / section accent
  "--color-border": "rgba(243,231,207,0.12)",       // cream-tinted border for dark surfaces
  "--color-text": "var(--brand-text)",              // cream — primary text on dark
  "--color-text-muted": "var(--brand-text-muted)", // muted cream
  "--color-accent": "var(--brand-accent-yellow)",   // yellow — highlights & CTAs
};

export default function AppShell({ children }) {
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [showHowToUse, setShowHowToUse] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  return (
    <div
      style={{
        ...shellVars,
        display: "flex",
        height: "100dvh",
        overflow: "hidden",
        background: `
          radial-gradient(circle at top right, rgba(242,231,156,.05), transparent 20%),
          radial-gradient(circle at 30% 20%, rgba(255,255,255,.03), transparent 25%),
          linear-gradient(180deg, #1d2d21 0%, #18251b 100%)
        `,
      }}
    >
      {/* ── Sidebar ── */}
      <Sidebar onOpenProfile={() => setShowProfile(true)} />

      {/* ── Right column: topbar + main ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            height: 52,
            flexShrink: 0,
            background: "var(--brand-bg)",
            borderBottom: "1px solid var(--brand-border)",
          }}
        >
          {/* Left side — page title */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                letterSpacing: "-.03em",
                color: "var(--brand-text)",
              }}
            >
              Projects
            </span>
          </div>

          {/* Right side — search, actions, avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                title="Admin"
                style={{
                  padding: "6px 12px",
                  borderRadius: 7,
                  background: "rgba(242,231,156,0.12)",
                  border: "1px solid rgba(242,231,156,0.28)",
                  color: "var(--brand-accent-yellow)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Admin
              </button>
            )}
            <button
              onClick={() => setShowHowToUse(true)}
              title="How to use SomedayPM"
              style={{
                padding: "6px 12px",
                borderRadius: 7,
                background: "transparent",
                border: "1px solid var(--brand-border-light)",
                color: "var(--brand-text-muted)",
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              ? How to use
            </button>
            <button
              onClick={() => setShowFeedback(true)}
              title="Send feedback"
              style={{
                padding: "6px 12px",
                borderRadius: 7,
                background: "#F37433",
                border: "1px solid #F37433",
                color: "#fff",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Send feedback
            </button>
            <input
              placeholder="Search projects"
              style={{
                padding: "7px 12px",
                borderRadius: 7,
                border: "1px solid var(--brand-border-light)",
                background: "rgba(243,231,207,0.07)",
                color: "var(--brand-text)",
                fontSize: 13,
                width: 200,
                outline: "none",
              }}
            />

            <button
              style={{
                padding: "7px 14px",
                borderRadius: 7,
                background: "var(--brand-accent-yellow)",
                color: "var(--brand-dark)",
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              + New Project
            </button>

            <button
              onClick={() => setShowProfile(true)}
              title="Profile"
              style={{
                width: 34,
                height: 34,
                borderRadius: 999,
                border: "1px solid var(--brand-border-light)",
                background: "rgba(243,231,207,0.1)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "avatar"}
                  style={{ width: 26, height: 26, borderRadius: 999 }}
                />
              ) : (
                <span style={{ color: "var(--brand-text-muted)", fontSize: 12, fontWeight: 600 }}>
                  {user?.displayName ? user.displayName[0].toUpperCase() : "U"}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Main content — only this region scrolls */}
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            background: `
              radial-gradient(circle at top right, rgba(255,255,255,.03), transparent 24%),
              linear-gradient(180deg, #223429 0%, #1d2d21 100%)
            `,
          }}
        >
          {children}
        </main>
      </div>

      {showProfile && (
        <ProfileModal
          user={user}
          onClose={() => setShowProfile(false)}
          onSignOut={signOut}
        />
      )}

      {showHowToUse && (
        <HowToUseModal onClose={() => setShowHowToUse(false)} />
      )}

      {showFeedback && (
        <FeedbackModal onClose={() => setShowFeedback(false)} />
      )}
    </div>
  );
}
