import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProfileByHandle, getPublicCardMetaForUser } from "../lib/profiles";

function ExternalLinkIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6, flexShrink: 0 }}>
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function PublicProjectCard({ meta }) {
  const title = meta.public_title || "Untitled project";
  const links = [meta.link_1, meta.link_2, meta.link_3].filter(Boolean);

  return (
    <div style={{
      background: "var(--brand-surface)",
      border: "1px solid rgba(183,165,134,0.25)",
      borderRadius: 14,
      padding: "20px 22px",
      display: "flex",
      flexDirection: "column",
      gap: 12,
      transition: "box-shadow 0.15s",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--brand-dark)", fontFamily: "var(--font-display)", lineHeight: 1.3 }}>
          {title}
        </h3>
        {meta.looking_for_collaborators && (
          <span style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#5b8a5b",
            background: "rgba(91,138,91,0.12)",
            border: "1px solid rgba(91,138,91,0.25)",
            padding: "3px 10px",
            borderRadius: 99,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}>
            Open to collabs
          </span>
        )}
      </div>

      {meta.public_description && (
        <p style={{ margin: 0, fontSize: 13, color: "var(--brand-text-dark-muted)", lineHeight: 1.6 }}>
          {meta.public_description}
        </p>
      )}

      {meta.looking_for_collaborators && meta.collaborator_type && (
        <p style={{ margin: 0, fontSize: 12, color: "#5b8a5b", fontStyle: "italic" }}>
          Looking for: {meta.collaborator_type}
        </p>
      )}

      {links.length > 0 && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 2 }}>
          {links.map((url, i) => {
            let label = url;
            try { label = new URL(url).hostname.replace(/^www\./, ""); } catch { /* raw text */ }
            return (
              <a
                key={i}
                href={url.startsWith("http") ? url : `https://${url}`}
                target="_blank"
                rel="noreferrer noopener"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 12,
                  color: "var(--brand-bg)",
                  background: "rgba(35,61,43,0.08)",
                  border: "1px solid rgba(35,61,43,0.15)",
                  padding: "4px 10px",
                  borderRadius: 99,
                  textDecoration: "none",
                  fontWeight: 500,
                }}
              >
                {label}
                <ExternalLinkIcon />
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function PublicProfilePage() {
  const { handle } = useParams();
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setNotFound(false);
      const p = await getProfileByHandle(handle).catch(() => null);
      if (!p) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const meta = await getPublicCardMetaForUser(p.user_id).catch(() => []);
      setProfile(p);
      setProjects(meta);
      setLoading(false);
    }
    load();
  }, [handle]);

  const initials = profile?.display_name
    ? profile.display_name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : handle?.[0]?.toUpperCase() ?? "?";

  return (
    <div style={{ minHeight: "100dvh", background: "linear-gradient(180deg, #1d2d21 0%, #18251b 100%)", color: "var(--brand-text)" }}>
      {/* Top nav */}
      <div style={{ borderBottom: "1px solid var(--brand-border)", padding: "0 24px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 900, margin: "0 auto" }}>
        <Link to="/" style={{ textDecoration: "none", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--brand-surface-soft)", letterSpacing: "-0.04em" }}>
          SomedayPM
        </Link>
      </div>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 80px" }}>
        {loading && (
          <p style={{ color: "var(--brand-text-muted)", fontSize: 15 }}>Loading…</p>
        )}

        {!loading && notFound && (
          <div style={{ textAlign: "center", paddingTop: 80 }}>
            <p style={{ fontSize: 48, marginBottom: 16 }}>🌱</p>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--brand-text)", margin: "0 0 8px", fontFamily: "var(--font-display)" }}>
              Profile not found
            </h1>
            <p style={{ fontSize: 14, color: "var(--brand-text-muted)" }}>
              This profile is private or doesn't exist.
            </p>
          </div>
        )}

        {!loading && profile && (
          <>
            {/* Profile header */}
            <div style={{ display: "flex", gap: 28, alignItems: "flex-start", marginBottom: 48, flexWrap: "wrap" }}>
              {/* Avatar */}
              <div style={{
                width: 88,
                height: 88,
                borderRadius: "50%",
                background: "rgba(242,231,156,0.12)",
                border: "2px solid rgba(242,231,156,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: "var(--brand-accent-yellow)", fontFamily: "var(--font-display)" }}>
                  {initials}
                </span>
              </div>

              <div style={{ flex: 1, minWidth: 200 }}>
                <h1 style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 700, color: "var(--brand-surface-soft)", fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}>
                  {profile.display_name || `@${profile.handle}`}
                </h1>
                <p style={{ margin: "0 0 12px", fontSize: 14, color: "var(--brand-text-muted)" }}>
                  @{profile.handle}
                </p>
                {profile.bio && (
                  <p style={{ margin: "0 0 12px", fontSize: 14, color: "var(--brand-text)", lineHeight: 1.65, maxWidth: 540 }}>
                    {profile.bio}
                  </p>
                )}
                {profile.contact_info && (
                  <p style={{ margin: 0, fontSize: 13, color: "var(--brand-text-muted)" }}>
                    {profile.contact_info}
                  </p>
                )}
              </div>
            </div>

            {/* Projects */}
            <div>
              <h2 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 700, color: "var(--brand-text-muted)", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                Projects · {projects.length}
              </h2>

              {projects.length === 0 ? (
                <p style={{ fontSize: 14, color: "var(--brand-text-muted)", marginTop: 8 }}>
                  No public projects yet.
                </p>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                  {projects.map((meta) => (
                    <PublicProjectCard key={meta.id} meta={meta} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <footer style={{ borderTop: "1px solid var(--brand-border)", padding: "20px 24px", textAlign: "center" }}>
        <Link to="/" style={{ fontSize: 12, color: "var(--brand-text-muted)", textDecoration: "none" }}>
          Built on SomedayPM
        </Link>
      </footer>
    </div>
  );
}
