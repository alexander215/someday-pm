import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProfileByHandle, getPublicCardMetaForUser } from "../lib/profiles";
import BrandEmptyState from "../components/BrandEmptyState";

const C = {
  canvas:     '#f7f5f0',
  white:      '#ffffff',
  forest:     '#1c2d20',
  forestDeep: '#152119',
  inset:      '#ede5d2',
  ink:        '#18180f',
  muted:      '#6b6454',
  soft:       '#8a7e6e',
  yellow:     '#f2e79c',
  mustard:    '#c49b28',
}

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
      background: C.inset,
      border: "1px solid rgba(24,24,15,0.07)",
      borderRadius: 16,
      padding: "22px 24px",
      display: "flex",
      flexDirection: "column",
      gap: 12,
      boxShadow: "0 4px 20px rgba(24,24,15,0.06), 0 1px 0 rgba(255,255,255,0.7) inset",
      transition: "box-shadow 0.15s, transform 0.15s",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <h3 style={{
          margin: 0,
          fontSize: 16,
          fontWeight: 700,
          color: C.ink,
          fontFamily: "var(--font-display)",
          lineHeight: 1.25,
          letterSpacing: "-0.02em",
        }}>
          {title}
        </h3>
        {meta.looking_for_collaborators && (
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            color: C.forest,
            background: "rgba(28,45,32,0.10)",
            border: "1px solid rgba(28,45,32,0.15)",
            padding: "3px 10px",
            borderRadius: 99,
            whiteSpace: "nowrap",
            flexShrink: 0,
            letterSpacing: "0.3px",
          }}>
            Open to collabs
          </span>
        )}
      </div>

      {meta.public_description && (
        <p style={{ margin: 0, fontSize: 13, color: C.muted, lineHeight: 1.65 }}>
          {meta.public_description}
        </p>
      )}

      {meta.looking_for_collaborators && meta.collaborator_type && (
        <p style={{ margin: 0, fontSize: 12, color: C.muted, fontStyle: "italic" }}>
          Looking for: {meta.collaborator_type}
        </p>
      )}

      {links.length > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 2 }}>
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
                  color: C.forest,
                  background: "rgba(28,45,32,0.08)",
                  border: "1px solid rgba(28,45,32,0.14)",
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
    <div style={{ minHeight: "100dvh", background: C.canvas, color: C.ink, fontFamily: "var(--font-body)" }}>

      {/* Nav — dark forest glass, matching landing page */}
      <nav style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 40px",
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: "rgba(20,34,22,0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <Link to="/" style={{
          textDecoration: "none",
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: 18,
          color: "#f3e7cf",
          letterSpacing: "-0.3px",
        }}>
          SomedayPM
        </Link>
      </nav>

      {/* Loading */}
      {loading && (
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "64px 40px" }}>
          <p style={{ color: C.muted, fontSize: 15 }}>Loading…</p>
        </div>
      )}

      {/* Not found */}
      {!loading && notFound && (
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "64px 40px 80px" }}>
          <BrandEmptyState
            variant="marketing"
            icon="🌱"
            kicker="Public profile"
            title="This profile isn’t available"
            description="It may be private, removed, or the link might be mistyped. SomedayPM profiles are optional and invite-only."
            primaryAction={{ label: "Back to home", to: "/" }}
            secondaryAction={{ label: "Request beta access", to: "/beta" }}
          />
        </div>
      )}

      {/* Profile — dark green hero strip + white body */}
      {!loading && profile && (
        <>
          {/* Profile header — deep forest, brand anchor */}
          <div style={{
            background: `linear-gradient(160deg, ${C.forest} 0%, ${C.forestDeep} 100%)`,
            padding: "52px 40px 56px",
          }}>
            <div style={{
              maxWidth: 900,
              margin: "0 auto",
              display: "flex",
              gap: 28,
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}>
              {/* Avatar */}
              <div style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "rgba(242,231,156,0.12)",
                border: "1.5px solid rgba(242,231,156,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                <span style={{
                  fontSize: 26,
                  fontWeight: 800,
                  color: C.yellow,
                  fontFamily: "var(--font-display)",
                  letterSpacing: "-0.02em",
                }}>
                  {initials}
                </span>
              </div>

              <div style={{ flex: 1, minWidth: 200 }}>
                <h1 style={{
                  margin: "0 0 4px",
                  fontSize: "clamp(22px, 3vw, 30px)",
                  fontWeight: 800,
                  color: "#f3e7cf",
                  fontFamily: "var(--font-display)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.05,
                }}>
                  {profile.display_name || `@${profile.handle}`}
                </h1>
                <p style={{ margin: "0 0 12px", fontSize: 14, color: "rgba(243,231,207,0.5)" }}>
                  @{profile.handle}
                </p>
                {profile.bio && (
                  <p style={{
                    margin: "0 0 12px",
                    fontSize: 14,
                    color: "rgba(243,231,207,0.7)",
                    lineHeight: 1.65,
                    maxWidth: 540,
                  }}>
                    {profile.bio}
                  </p>
                )}
                {profile.contact_info && (
                  <p style={{ margin: 0, fontSize: 13, color: "rgba(243,231,207,0.48)" }}>
                    {profile.contact_info}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Projects — white/canvas body */}
          <main style={{ maxWidth: 900, margin: "0 auto", padding: "48px 40px 80px" }}>
            <h2 style={{
              margin: "0 0 22px",
              fontSize: 12,
              fontWeight: 700,
              color: C.muted,
              textTransform: "uppercase",
              letterSpacing: "0.9px",
            }}>
              Projects · {projects.length}
            </h2>

            {projects.length === 0 ? (
              <BrandEmptyState
                variant="marketing"
                icon="◇"
                kicker="Portfolio"
                title="No public projects yet"
                description="When this builder marks projects as public, they’ll show up here with links and a short description."
                primaryAction={{ label: "Learn about SomedayPM", to: "/about" }}
                secondaryAction={{ label: "Home", to: "/" }}
              />
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: 16,
              }}>
                {projects.map((meta) => (
                  <PublicProjectCard key={meta.id} meta={meta} />
                ))}
              </div>
            )}
          </main>
        </>
      )}

      {/* Footer — matching landing page */}
      <footer style={{
        borderTop: "1px solid rgba(24,24,15,0.07)",
        padding: "28px 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
        background: C.canvas,
      }}>
        <span style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          color: C.forest,
          fontSize: "15px",
        }}>
          SomedayPM
        </span>
        <Link to="/" style={{ fontSize: "12px", color: C.soft, textDecoration: "none" }}>
          Built for the ideas you'll get to someday.
        </Link>
      </footer>
    </div>
  );
}
