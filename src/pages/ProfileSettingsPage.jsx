import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../features/auth/useAuth";
import { getRootCards } from "../lib/cards";
import {
  getMyProfile,
  upsertProfile,
  getMyCardPublicMeta,
  upsertCardPublicMeta,
} from "../lib/profiles";

const HANDLE_RE = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/;

function labelStyle() {
  return { fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6, display: "block" };
}
function inputStyle(extra = {}) {
  return {
    width: "100%",
    padding: "9px 12px",
    borderRadius: 8,
    border: "1px solid var(--color-border)",
    background: "rgba(243,231,207,0.06)",
    color: "var(--color-text)",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    ...extra,
  };
}
function fieldStyle() {
  return { display: "flex", flexDirection: "column", gap: 4 };
}

// ── Profile section ────────────────────────────────────────────────────────────

function ProfileSection({ user, onSaved }) {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ handle: "", display_name: "", bio: "", contact_info: "", is_public: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getMyProfile().then((p) => {
      if (p) {
        setProfile(p);
        setForm({ handle: p.handle, display_name: p.display_name, bio: p.bio, contact_info: p.contact_info, is_public: p.is_public });
      } else {
        // pre-fill display_name from auth
        const raw = user?.email?.split("@")[0] ?? "";
        const handle = raw.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/^-+|-+$/g, "").slice(0, 30) || "my-handle";
        setForm((f) => ({ ...f, display_name: user?.user_metadata?.full_name || "", handle }));
      }
    });
  }, [user]);

  async function handleSave() {
    setError(null);
    if (!HANDLE_RE.test(form.handle)) {
      setError("Handle must be 3–30 chars: lowercase letters, numbers, and hyphens only (no leading/trailing hyphens).");
      return;
    }
    setSaving(true);
    try {
      const saved = await upsertProfile({ user_id: user.id, ...form });
      setProfile(saved);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      onSaved?.(saved);
    } catch (e) {
      setError(e.message?.includes("profiles_handle_key") ? "That handle is already taken." : e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section style={{ background: "var(--color-surface)", borderRadius: 14, border: "1px solid var(--color-border)", padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--color-text)", fontFamily: "var(--font-display)" }}>Public profile</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-text-muted)" }}>
            Your profile page at <code style={{ background: "rgba(243,231,207,0.1)", padding: "1px 6px", borderRadius: 4, fontSize: 12 }}>/u/{form.handle || "your-handle"}</code>
          </p>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none" }}>
          <span style={{ fontSize: 13, color: form.is_public ? "var(--color-accent)" : "var(--color-text-muted)", fontWeight: 600 }}>
            {form.is_public ? "Profile is public" : "Profile is private"}
          </span>
          <Toggle checked={form.is_public} onChange={(v) => setForm((f) => ({ ...f, is_public: v }))} />
        </label>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={fieldStyle()}>
          <label style={labelStyle()}>Handle <span style={{ color: "var(--color-text-muted)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>— your URL: /u/handle</span></label>
          <input
            value={form.handle}
            onChange={(e) => setForm((f) => ({ ...f, handle: e.target.value.toLowerCase() }))}
            placeholder="e.g. alex-builds"
            style={inputStyle()}
          />
        </div>
        <div style={fieldStyle()}>
          <label style={labelStyle()}>Display name</label>
          <input value={form.display_name} onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))} placeholder="Your name" style={inputStyle()} />
        </div>
      </div>

      <div style={fieldStyle()}>
        <label style={labelStyle()}>Bio <span style={{ color: "var(--color-text-muted)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>{form.bio.length}/500</span></label>
        <textarea
          value={form.bio}
          onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value.slice(0, 500) }))}
          placeholder="A short intro about what you're building..."
          rows={3}
          style={inputStyle({ resize: "vertical", fontFamily: "inherit" })}
        />
      </div>

      <div style={fieldStyle()}>
        <label style={labelStyle()}>Contact info <span style={{ color: "var(--color-text-muted)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>{form.contact_info.length}/200</span></label>
        <input
          value={form.contact_info}
          onChange={(e) => setForm((f) => ({ ...f, contact_info: e.target.value.slice(0, 200) }))}
          placeholder="Email, Twitter, website — whatever you want to share"
          style={inputStyle()}
        />
      </div>

      {error && <p style={{ margin: 0, fontSize: 13, color: "#e05c5c" }}>{error}</p>}

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <SaveButton saving={saving} success={success} onClick={handleSave} />
        {profile?.is_public && (
          <a
            href={`/u/${profile.handle}`}
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: 13, color: "var(--color-accent)", textDecoration: "none", padding: "8px 14px", border: "1px solid rgba(242,231,156,0.3)", borderRadius: 8 }}
          >
            View public profile ↗
          </a>
        )}
      </div>
    </section>
  );
}

// ── Card public meta section ───────────────────────────────────────────────────

function CardMetaRow({ card, meta, userId, onSaved }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    is_public: false,
    public_title: "",
    public_description: "",
    link_1: "",
    link_2: "",
    link_3: "",
    looking_for_collaborators: false,
    collaborator_type: "",
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (meta) {
      setForm({
        is_public: meta.is_public,
        public_title: meta.public_title || card.title,
        public_description: meta.public_description,
        link_1: meta.link_1,
        link_2: meta.link_2,
        link_3: meta.link_3,
        looking_for_collaborators: meta.looking_for_collaborators,
        collaborator_type: meta.collaborator_type,
      });
    } else {
      setForm((f) => ({ ...f, public_title: card.title }));
    }
  }, [meta, card.title]);

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      const saved = await upsertCardPublicMeta(card.id, userId, form);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      onSaved?.(card.id, saved);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ border: "1px solid var(--color-border)", borderRadius: 12, overflow: "hidden" }}>
      {/* Card header row — always visible */}
      <div
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", cursor: "pointer", background: open ? "rgba(243,231,207,0.04)" : "transparent" }}
        onClick={() => setOpen((o) => !o)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 16, color: open ? "var(--color-accent)" : "var(--color-text-muted)" }}>{open ? "▾" : "▸"}</span>
          <div>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text)" }}>{card.title}</span>
            <span style={{ marginLeft: 10, fontSize: 11, color: "var(--color-text-muted)", background: "rgba(243,231,207,0.08)", padding: "2px 8px", borderRadius: 99 }}>{card.category}</span>
          </div>
        </div>
        <label
          style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
          onClick={(e) => e.stopPropagation()}
        >
          <span style={{ fontSize: 12, color: form.is_public ? "var(--color-accent)" : "var(--color-text-muted)" }}>
            {form.is_public ? "Public" : "Private"}
          </span>
          <Toggle checked={form.is_public} onChange={(v) => { setForm((f) => ({ ...f, is_public: v })); setOpen(true); }} />
        </label>
      </div>

      {/* Expanded form */}
      {open && (
        <div style={{ padding: "0 18px 18px", borderTop: "1px solid var(--color-border)", display: "flex", flexDirection: "column", gap: 16, paddingTop: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={fieldStyle()}>
              <label style={labelStyle()}>Public title</label>
              <input value={form.public_title} onChange={(e) => setForm((f) => ({ ...f, public_title: e.target.value.slice(0, 100) }))} placeholder={card.title} style={inputStyle()} />
            </div>
          </div>

          <div style={fieldStyle()}>
            <label style={labelStyle()}>Public description <span style={{ color: "var(--color-text-muted)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>{form.public_description.length}/500</span></label>
            <textarea
              value={form.public_description}
              onChange={(e) => setForm((f) => ({ ...f, public_description: e.target.value.slice(0, 500) }))}
              placeholder="What is this project about?"
              rows={3}
              style={inputStyle({ resize: "vertical", fontFamily: "inherit" })}
            />
          </div>

          <div style={fieldStyle()}>
            <label style={labelStyle()}>Links (up to 3)</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[["link_1", "Link 1 — GitHub, website…"], ["link_2", "Link 2"], ["link_3", "Link 3"]].map(([key, ph]) => (
                <input key={key} value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} placeholder={ph} style={inputStyle()} />
              ))}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none" }}>
              <Toggle checked={form.looking_for_collaborators} onChange={(v) => setForm((f) => ({ ...f, looking_for_collaborators: v }))} />
              <span style={{ fontSize: 13, color: "var(--color-text)" }}>Looking for collaborators</span>
            </label>
            {form.looking_for_collaborators && (
              <input
                value={form.collaborator_type}
                onChange={(e) => setForm((f) => ({ ...f, collaborator_type: e.target.value.slice(0, 200) }))}
                placeholder="e.g. designer, backend dev, marketing…"
                style={inputStyle({ flex: 1, minWidth: 200 })}
              />
            )}
          </div>

          {error && <p style={{ margin: 0, fontSize: 13, color: "#e05c5c" }}>{error}</p>}
          <div><SaveButton saving={saving} success={success} onClick={handleSave} /></div>
        </div>
      )}
    </div>
  );
}

// ── Shared micro-components ────────────────────────────────────────────────────

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: 40,
        height: 22,
        borderRadius: 99,
        border: "none",
        background: checked ? "var(--brand-accent-mustard)" : "rgba(243,231,207,0.15)",
        cursor: "pointer",
        position: "relative",
        flexShrink: 0,
        transition: "background 0.15s",
        padding: 0,
      }}
    >
      <span style={{
        position: "absolute",
        top: 3,
        left: checked ? 21 : 3,
        width: 16,
        height: 16,
        borderRadius: "50%",
        background: "#fff",
        transition: "left 0.15s",
      }} />
    </button>
  );
}

function SaveButton({ saving, success, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      style={{
        padding: "8px 20px",
        borderRadius: 8,
        background: success ? "rgba(100,200,120,0.25)" : "var(--brand-bg)",
        color: success ? "#7fce97" : "var(--brand-surface-soft)",
        border: success ? "1px solid rgba(100,200,120,0.4)" : "none",
        fontSize: 13,
        fontWeight: 600,
        cursor: saving ? "not-allowed" : "pointer",
        opacity: saving ? 0.7 : 1,
        transition: "background 0.15s",
        minWidth: 90,
      }}
    >
      {saving ? "Saving…" : success ? "Saved ✓" : "Save"}
    </button>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [metaMap, setMetaMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [cardList, metaList] = await Promise.all([getRootCards(), getMyCardPublicMeta()]);
      setCards(cardList);
      const map = {};
      for (const m of metaList) map[m.card_id] = m;
      setMetaMap(map);
      setLoading(false);
    }
    load();
  }, []);

  function handleMetaSaved(cardId, saved) {
    setMetaMap((m) => ({ ...m, [cardId]: saved }));
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px 80px" }}>
      <button
        onClick={() => navigate("/")}
        style={{ background: "none", border: "none", color: "var(--color-text-muted)", fontSize: 13, cursor: "pointer", padding: 0, marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }}
      >
        ← Back to projects
      </button>

      <h1 style={{ margin: "0 0 6px", fontSize: 26, fontWeight: 700, color: "var(--color-text)", fontFamily: "var(--font-display)" }}>
        Profile settings
      </h1>
      <p style={{ margin: "0 0 32px", fontSize: 14, color: "var(--color-text-muted)" }}>
        Control your public profile and which projects appear on it.
      </p>

      <ProfileSection user={user} />

      <h2 style={{ margin: "40px 0 16px", fontSize: 16, fontWeight: 700, color: "var(--color-text)", fontFamily: "var(--font-display)" }}>
        Projects
      </h2>
      <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--color-text-muted)" }}>
        Toggle individual projects to show them on your public profile.
      </p>

      {loading ? (
        <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>Loading…</p>
      ) : cards.length === 0 ? (
        <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>No projects yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {cards.map((card) => (
            <CardMetaRow
              key={card.id}
              card={card}
              meta={metaMap[card.id] ?? null}
              userId={user.id}
              onSaved={handleMetaSaved}
            />
          ))}
        </div>
      )}
    </div>
  );
}
