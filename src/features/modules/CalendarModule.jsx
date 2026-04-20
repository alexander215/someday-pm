import { useState, useEffect } from "react";
import {
  getCalendarEntries,
  createCalendarEntry,
  updateCalendarEntry,
  deleteCalendarEntry,
} from "../../lib/projectCalendarEntries";
import BrandEmptyState from "../../components/BrandEmptyState";

const STATUS_STYLES = {
  draft:      { bg: "rgba(183,165,134,0.18)", color: "var(--brand-text-muted)" },
  scheduled:  { bg: "rgba(100,150,200,0.2)",  color: "#5b8fbf" },
  published:  { bg: "rgba(100,180,120,0.2)",  color: "#3d8f5e" },
  cancelled:  { bg: "rgba(200,100,100,0.18)", color: "#b05050" },
};

function formatGroupDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function groupByDate(entries) {
  const map = {};
  for (const e of entries) {
    const key = e.scheduled_date ?? "__nodate__";
    if (!map[key]) map[key] = [];
    map[key].push(e);
  }
  return Object.entries(map).sort(([a], [b]) => {
    if (a === "__nodate__") return 1;
    if (b === "__nodate__") return -1;
    return a.localeCompare(b);
  });
}

function sortEntries(a, b) {
  const da = a.scheduled_date ?? "9999-99-99";
  const db = b.scheduled_date ?? "9999-99-99";
  if (da !== db) return da.localeCompare(db);
  return (a.sort_order ?? 0) - (b.sort_order ?? 0);
}

const BLANK_FORM = {
  title: "",
  body: "",
  platform: "",
  platform_other: "",
  content_type: "",
  content_type_other: "",
  status: "draft",
  scheduled_date: "",
  link: "",
  owner: "",
};

function entryToForm(entry, platforms = [], contentTypes = []) {
  const platformIsOther = !!entry.platform && !platforms.includes(entry.platform);
  const ctIsOther = !!entry.content_type && !contentTypes.includes(entry.content_type);
  return {
    title: entry.title ?? "",
    body: entry.body ?? "",
    platform: platformIsOther ? "Other" : (entry.platform ?? ""),
    platform_other: platformIsOther ? entry.platform : "",
    content_type: ctIsOther ? "Other" : (entry.content_type ?? ""),
    content_type_other: ctIsOther ? entry.content_type : "",
    status: entry.status ?? "draft",
    scheduled_date: entry.scheduled_date ?? "",
    link: entry.link ?? "",
    owner: entry.owner ?? "",
  };
}

function formToPayload(form) {
  return {
    title: form.title.trim(),
    body: form.body.trim() || null,
    platform: form.platform === "Other"
      ? (form.platform_other.trim() || null)
      : (form.platform || null),
    content_type: form.content_type === "Other"
      ? (form.content_type_other.trim() || null)
      : (form.content_type || null),
    status: form.status || "draft",
    scheduled_date: form.scheduled_date || null,
    link: form.link.trim() || null,
    owner: form.owner.trim() || null,
  };
}

export default function CalendarModule({ project, moduleConfig }) {
  const [entries, setEntries] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const platforms = moduleConfig.platforms ?? [];
  const contentTypes = moduleConfig.contentTypes ?? [];
  const statusOptions = moduleConfig.statusOptions ?? ["draft", "scheduled", "published", "cancelled"];

  useEffect(() => {
    getCalendarEntries(project.id)
      .then((data) => { setEntries(data); setLoaded(true); })
      .catch((err) => { setLoadError(err.message); setLoaded(true); });
  }, [project.id]);

  async function handleCreate(form) {
    const payload = formToPayload(form);
    const entry = await createCalendarEntry(project.id, {
      ...payload,
      sort_order: entries.length,
    });
    setEntries((prev) => [...prev, entry].sort(sortEntries));
    setShowCreate(false);
  }

  async function handleUpdate(id, form) {
    const payload = formToPayload(form);
    const updated = await updateCalendarEntry(id, payload);
    setEntries((prev) => prev.map((e) => (e.id === id ? updated : e)).sort(sortEntries));
    setEditingId(null);
  }

  async function handleDelete(id) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    await deleteCalendarEntry(id).catch(() => {});
  }

  if (!loaded) {
    return <div style={{ fontSize: 13, color: "var(--brand-text-muted)", opacity: 0.5 }}>Loading…</div>;
  }

  if (loadError) {
    return <div style={{ fontSize: 13, color: "#b05050" }}>Failed to load: {loadError}</div>;
  }

  const groups = groupByDate(entries);

  return (
    <div>
      {entries.length === 0 && !showCreate && (
        <BrandEmptyState
          variant="panel"
          icon={moduleConfig.emptyState?.icon}
          title={moduleConfig.emptyState?.title ?? "No content scheduled"}
          description={moduleConfig.emptyState?.description}
          primaryAction={{ label: "Add content", onClick: () => setShowCreate(true) }}
        />
      )}

      {groups.map(([dateKey, group]) => (
        <div key={dateKey} style={{ marginBottom: 24 }}>
          <div style={groupHeaderStyle}>
            {dateKey === "__nodate__" ? "No date" : formatGroupDate(dateKey)}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {group.map((entry) =>
              editingId === entry.id ? (
                <EntryForm
                  key={entry.id}
                  initial={entryToForm(entry, platforms, contentTypes)}
                  platforms={platforms}
                  contentTypes={contentTypes}
                  statusOptions={statusOptions}
                  onSave={(form) => handleUpdate(entry.id, form)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <EntryRow
                  key={entry.id}
                  entry={entry}
                  onEdit={() => { setShowCreate(false); setEditingId(entry.id); }}
                  onDelete={() => handleDelete(entry.id)}
                />
              )
            )}
          </div>
        </div>
      ))}

      {showCreate && (
        <div style={{ marginTop: groups.length > 0 ? 16 : 0 }}>
          <EntryForm
            initial={BLANK_FORM}
            platforms={platforms}
            contentTypes={contentTypes}
            statusOptions={statusOptions}
            onSave={handleCreate}
            onCancel={() => setShowCreate(false)}
          />
        </div>
      )}

      {!showCreate && entries.length > 0 && (
        <button
          onClick={() => { setEditingId(null); setShowCreate(true); }}
          style={addMoreBtnStyle}
        >
          + Add content
        </button>
      )}
    </div>
  );
}

// ─── Entry Row ────────────────────────────────────────────────

function EntryRow({ entry, onEdit, onDelete }) {
  const [hover, setHover] = useState(false);
  const statusStyle = STATUS_STYLES[entry.status] ?? STATUS_STYLES.draft;

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onEdit}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "var(--brand-board-canvas)",
        border: `1px solid ${hover ? "rgba(183,165,134,0.42)" : "rgba(183,165,134,0.22)"}`,
        borderRadius: 10,
        padding: "11px 14px",
        cursor: "pointer",
        transition: "border-color 0.1s",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--brand-text-on-inset)", marginBottom: entry.platform || entry.content_type || entry.owner ? 3 : 0 }}>
          {entry.title || <span style={{ opacity: 0.4 }}>Untitled</span>}
        </div>
        {(entry.platform || entry.content_type || entry.owner) && (
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            {entry.platform && (
              <span style={metaTagStyle}>{entry.platform}</span>
            )}
            {entry.content_type && (
              <span style={metaTagStyle}>{entry.content_type}</span>
            )}
            {entry.owner && (
              <span style={{ ...metaTagStyle, opacity: 0.6 }}>{entry.owner}</span>
            )}
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
        {entry.link && (
          <a
            href={entry.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title="Open link"
            style={{ fontSize: 13, color: "var(--brand-text-muted)", opacity: 0.7, lineHeight: 1 }}
          >
            ↗
          </a>
        )}
        <span style={{
          fontSize: 11,
          fontWeight: 600,
          padding: "2px 7px",
          borderRadius: 4,
          background: statusStyle.bg,
          color: statusStyle.color,
          textTransform: "capitalize",
          whiteSpace: "nowrap",
        }}>
          {entry.status ?? "draft"}
        </span>
        <DeleteBtn onClick={(e) => { e.stopPropagation(); onDelete(); }} />
      </div>
    </div>
  );
}

// ─── Entry Form ───────────────────────────────────────────────

function EntryForm({ initial, platforms, contentTypes, statusOptions, onSave, onCancel }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
    } catch (err) {
      setError(err?.message ?? "Save failed. Please try again.");
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "var(--brand-board-canvas)",
        border: "1px solid rgba(183,165,134,0.4)",
        borderRadius: 10,
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <input
        autoFocus
        value={form.title}
        onChange={(e) => set("title", e.target.value)}
        placeholder="Title…"
        disabled={saving}
        style={inputStyle}
      />

      <textarea
        value={form.body}
        onChange={(e) => set("body", e.target.value)}
        placeholder="Notes (optional)…"
        disabled={saving}
        rows={2}
        style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div>
          <label style={labelStyle}>Platform</label>
          <select
            value={form.platform}
            onChange={(e) => set("platform", e.target.value)}
            disabled={saving}
            style={inputStyle}
          >
            <option value="">— none —</option>
            {platforms.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          {form.platform === "Other" && (
            <input
              value={form.platform_other}
              onChange={(e) => set("platform_other", e.target.value)}
              placeholder="Specify platform…"
              disabled={saving}
              style={{ ...inputStyle, marginTop: 6 }}
            />
          )}
        </div>

        <div>
          <label style={labelStyle}>Content type</label>
          <select
            value={form.content_type}
            onChange={(e) => set("content_type", e.target.value)}
            disabled={saving}
            style={inputStyle}
          >
            <option value="">— none —</option>
            {contentTypes.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {form.content_type === "Other" && (
            <input
              value={form.content_type_other}
              onChange={(e) => set("content_type_other", e.target.value)}
              placeholder="Specify type…"
              disabled={saving}
              style={{ ...inputStyle, marginTop: 6 }}
            />
          )}
        </div>

        <div>
          <label style={labelStyle}>Status</label>
          <select
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
            disabled={saving}
            style={inputStyle}
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Scheduled date</label>
          <input
            type="date"
            value={form.scheduled_date}
            onChange={(e) => set("scheduled_date", e.target.value)}
            disabled={saving}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Owner</label>
          <input
            value={form.owner}
            onChange={(e) => set("owner", e.target.value)}
            placeholder="Who's posting this?"
            disabled={saving}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Link</label>
          <input
            value={form.link}
            onChange={(e) => set("link", e.target.value)}
            placeholder="https://…"
            disabled={saving}
            style={inputStyle}
          />
        </div>
      </div>

      {error && (
        <div style={{ fontSize: 12, color: "#b05050", padding: "6px 8px", background: "rgba(200,100,100,0.08)", borderRadius: 6 }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 2 }}>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          style={cancelBtnStyle}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || !form.title.trim()}
          style={{
            ...saveBtnStyle,
            opacity: (!saving && form.title.trim()) ? 1 : 0.4,
            cursor: (!saving && form.title.trim()) ? "pointer" : "default",
          }}
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}

// ─── Delete button ────────────────────────────────────────────

function DeleteBtn({ onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      aria-label="Delete entry"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "var(--brand-text-on-inset-muted)",
        opacity: hover ? 0.6 : 0.18,
        fontSize: 18,
        lineHeight: 1,
        padding: "0 2px",
        transition: "opacity 0.1s",
      }}
    >
      ×
    </button>
  );
}

// ─── Shared styles ────────────────────────────────────────────

const inputStyle = {
  width: "100%",
  background: "transparent",
  border: "1px solid rgba(183,165,134,0.28)",
  borderRadius: 6,
  padding: "7px 10px",
  fontSize: 13,
  fontFamily: "var(--font-body)",
  color: "var(--brand-text-on-inset)",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle = {
  display: "block",
  fontSize: 11,
  fontWeight: 600,
  color: "var(--brand-text-muted)",
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  marginBottom: 4,
};

const saveBtnStyle = {
  padding: "6px 14px",
  borderRadius: 6,
  background: "var(--brand-accent-mustard)",
  border: "none",
  color: "#fff",
  fontSize: 13,
  fontWeight: 600,
};

const cancelBtnStyle = {
  padding: "6px 12px",
  borderRadius: 6,
  background: "transparent",
  border: "1px solid rgba(64,57,47,0.22)",
  color: "var(--brand-text-on-inset-muted)",
  fontSize: 13,
  cursor: "pointer",
};

const groupHeaderStyle = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  color: "var(--brand-text-muted)",
  marginBottom: 8,
  paddingLeft: 2,
};

const metaTagStyle = {
  fontSize: 12,
  color: "var(--brand-text-on-inset-muted)",
};

const addMoreBtnStyle = {
  marginTop: 4,
  background: "none",
  border: "1px dashed rgba(183,165,134,0.4)",
  borderRadius: 8,
  padding: "8px 14px",
  width: "100%",
  fontSize: 13,
  color: "var(--brand-text-muted)",
  cursor: "pointer",
  textAlign: "center",
};
