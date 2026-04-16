import { useState } from "react";

export default function ProfileModal({ user, onClose, onSignOut }) {
  const [publicName, setPublicName] = useState(false);
  const [publicEmail, setPublicEmail] = useState(false);
  const [publicBio, setPublicBio] = useState(false);

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(27,35,27,0.55)",
        zIndex: 60,
        backdropFilter: "blur(2px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          width: 520,
          borderRadius: 14,
          overflow: "hidden",
          background: "var(--brand-surface-soft)",
          border: "1px solid rgba(183,165,134,0.35)",
          boxShadow: "0 20px 60px rgba(27,35,27,0.35)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 22px",
            borderBottom: "1px solid rgba(183,165,134,0.25)",
            display: "flex",
            gap: 14,
            alignItems: "center",
            background: "var(--brand-surface)",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 999,
              background: "var(--brand-bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              border: "2px solid rgba(183,165,134,0.3)",
            }}
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="avatar"
                style={{ width: 52, height: 52, borderRadius: 999 }}
              />
            ) : (
              <span
                style={{
                  color: "var(--brand-surface-soft)",
                  fontWeight: 700,
                  fontSize: 18,
                  fontFamily: "var(--font-display)",
                }}
              >
                {user?.displayName?.[0]?.toUpperCase() || "U"}
              </span>
            )}
          </div>
          <div>
            <div
              style={{
                fontWeight: 700,
                color: "var(--brand-dark)",
                fontSize: 16,
                fontFamily: "var(--font-display)",
              }}
            >
              {user?.displayName || "Unnamed"}
            </div>
            <div style={{ color: "var(--brand-text-dark-muted)", fontSize: 13, marginTop: 2 }}>
              {user?.email}
            </div>
          </div>
        </div>

        {/* Body */}
        <div
          style={{
            padding: "20px 22px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div
            style={{
              fontWeight: 600,
              color: "var(--brand-dark)",
              fontSize: 13,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              opacity: 0.7,
            }}
          >
            Profile privacy
          </div>

          {[
            {
              label: "Show name publicly",
              sub: "Toggle whether your display name is visible on public links.",
              checked: publicName,
              set: setPublicName,
            },
            {
              label: "Show email publicly",
              sub: "Off by default — keep contact private.",
              checked: publicEmail,
              set: setPublicEmail,
            },
            {
              label: "Show bio publicly",
              sub: "A short intro that can be shared with collaborators.",
              checked: publicBio,
              set: setPublicBio,
            },
          ].map(({ label, sub, checked, set }) => (
            <label
              key={label}
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 16,
                cursor: "pointer",
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: "var(--brand-dark)", fontSize: 14 }}>
                  {label}
                </div>
                <div style={{ color: "var(--brand-text-dark-muted)", fontSize: 12, marginTop: 2, lineHeight: 1.5 }}>
                  {sub}
                </div>
              </div>
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => set(e.target.checked)}
                style={{ marginTop: 3, flexShrink: 0, accentColor: "var(--brand-bg)" }}
              />
            </label>
          ))}

          {/* Actions */}
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 8,
              paddingTop: 12,
              borderTop: "1px solid rgba(183,165,134,0.25)",
            }}
          >
            {onSignOut && (
              <button
                onClick={onSignOut}
                style={{
                  padding: "7px 14px",
                  borderRadius: 7,
                  background: "transparent",
                  border: "1px solid rgba(183,165,134,0.4)",
                  color: "var(--brand-text-dark-muted)",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Sign out
              </button>
            )}
            <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
              <button
                onClick={onClose}
                style={{
                  padding: "7px 14px",
                  borderRadius: 7,
                  background: "transparent",
                  border: "1px solid rgba(183,165,134,0.4)",
                  color: "var(--brand-text-dark-muted)",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
              <button
                onClick={onClose}
                style={{
                  padding: "7px 16px",
                  borderRadius: 7,
                  background: "var(--brand-bg)",
                  color: "var(--brand-surface-soft)",
                  border: "none",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
