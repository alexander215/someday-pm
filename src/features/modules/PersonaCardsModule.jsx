import { useState, useEffect } from "react";
import { getRecords, createRecord, deleteRecord } from "../../lib/projectRecords";
import BrandEmptyState from "../../components/BrandEmptyState";
import ItemCard from "../../components/project/ItemCard";

export default function PersonaCardsModule({ project, stageKey, moduleConfig }) {
  const [records, setRecords] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", role: "", painPoints: "", goals: "" });
  const [adding, setAdding] = useState(false);
  const [expanded, setExpanded] = useState(new Set());

  useEffect(() => {
    getRecords(project.id, moduleConfig.moduleKey)
      .then((data) => {
        setRecords(data);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [project.id, moduleConfig.moduleKey]);

  function toggleExpand(id) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setAdding(true);
    try {
      const record = await createRecord(project.id, {
        stageKey,
        moduleKey: moduleConfig.moduleKey,
        recordType: "persona",
        title: form.name.trim(),
        fields: {
          role: form.role.trim(),
          pain_points: form.painPoints.trim(),
          goals: form.goals.trim(),
        },
        sort_order: records.length,
      });
      setRecords((prev) => [...prev, record]);
      setExpanded((prev) => new Set([...prev, record.id]));
      setForm({ name: "", role: "", painPoints: "", goals: "" });
      setShowForm(false);
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(recordId) {
    setRecords((prev) => prev.filter((r) => r.id !== recordId));
    await deleteRecord(recordId).catch(() => {});
  }

  function setField(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  if (!loaded) {
    return <div style={{ fontSize: 13, color: "var(--brand-text-muted)", opacity: 0.5 }}>Loading…</div>;
  }

  return (
    <div>
      {records.length === 0 && !showForm && (
        <BrandEmptyState
          variant="panel"
          icon={moduleConfig.emptyState?.icon}
          title={moduleConfig.emptyState?.title ?? "No personas yet"}
          description={moduleConfig.emptyState?.description}
          primaryAction={{ label: "Add persona", onClick: () => setShowForm(true) }}
        />
      )}

      {records.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
          {records.map((record) => {
            const isOpen = expanded.has(record.id);
            const f = record.fields ?? {};
            const hasDetails = f.pain_points || f.goals;
            return (
              <ItemCard key={record.id}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--brand-text-on-inset)",
                        marginBottom: f.role ? 2 : 0,
                      }}
                    >
                      {record.title}
                    </div>
                    {f.role && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--brand-text-on-inset-muted)",
                        }}
                      >
                        {f.role}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    {hasDetails && (
                      <button
                        onClick={() => toggleExpand(record.id)}
                        style={{
                          fontSize: 12,
                          padding: "3px 10px",
                          borderRadius: 6,
                          cursor: "pointer",
                          border: "1px solid rgba(64,57,47,0.2)",
                          background: "transparent",
                          color: "var(--brand-text-on-inset-muted)",
                        }}
                      >
                        {isOpen ? "Collapse" : "Details"}
                      </button>
                    )}
                    <DeleteBtn onClick={() => handleDelete(record.id)} />
                  </div>
                </div>

                {isOpen && hasDetails && (
                  <div
                    style={{
                      marginTop: 12,
                      paddingTop: 12,
                      borderTop: "1px solid rgba(183,165,134,0.22)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    <PersonaField label="Pain points" value={f.pain_points} />
                    <PersonaField label="Goals" value={f.goals} />
                  </div>
                )}
              </ItemCard>
            );
          })}
        </div>
      )}

      {showForm ? (
        <form
          onSubmit={handleAdd}
          style={{
            background: "var(--brand-board-canvas)",
            borderRadius: 10,
            border: "1px solid rgba(183,165,134,0.3)",
            padding: "16px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <FormRow label="Name">
            <input
              autoFocus
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="e.g. Solo founder"
              style={fieldStyle}
            />
          </FormRow>
          <FormRow label="Role">
            <input
              value={form.role}
              onChange={(e) => setField("role", e.target.value)}
              placeholder="e.g. Primary user"
              style={fieldStyle}
            />
          </FormRow>
          <FormRow label="Pain points">
            <textarea
              value={form.painPoints}
              onChange={(e) => setField("painPoints", e.target.value)}
              placeholder="What frustrates them?"
              rows={2}
              style={{ ...fieldStyle, resize: "none" }}
            />
          </FormRow>
          <FormRow label="Goals">
            <textarea
              value={form.goals}
              onChange={(e) => setField("goals", e.target.value)}
              placeholder="What are they trying to accomplish?"
              rows={2}
              style={{ ...fieldStyle, resize: "none" }}
            />
          </FormRow>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="submit"
              disabled={adding || !form.name.trim()}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                background: "var(--brand-accent-mustard)",
                border: "none",
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                cursor: adding || !form.name.trim() ? "default" : "pointer",
                opacity: form.name.trim() ? 1 : 0.4,
              }}
            >
              Add persona
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setForm({ name: "", role: "", painPoints: "", goals: "" });
              }}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                background: "transparent",
                border: "1px solid rgba(64,57,47,0.2)",
                color: "var(--brand-text-on-inset-muted)",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : records.length > 0 ? (
        <button
          onClick={() => setShowForm(true)}
          style={{
            background: "none",
            border: "1px dashed rgba(183,165,134,0.4)",
            borderRadius: 8,
            padding: "8px 14px",
            width: "100%",
            fontSize: 13,
            color: "var(--brand-text-muted)",
            cursor: "pointer",
            textAlign: "center",
          }}
        >
          + Add persona
        </button>
      ) : null}
    </div>
  );
}

function PersonaField({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          color: "var(--brand-text-on-inset-muted)",
          marginBottom: 3,
        }}
      >
        {label}
      </div>
      <p
        style={{
          fontSize: 13,
          color: "var(--brand-text-on-inset)",
          lineHeight: 1.55,
          margin: 0,
        }}
      >
        {value}
      </p>
    </div>
  );
}

function FormRow({ label, children }) {
  return (
    <div>
      <label
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          color: "var(--brand-text-on-inset-muted)",
          display: "block",
          marginBottom: 4,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function DeleteBtn({ onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      aria-label="Delete"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "var(--brand-text-on-inset-muted)",
        opacity: hover ? 0.6 : 0.25,
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

const fieldStyle = {
  width: "100%",
  background: "rgba(183,165,134,0.12)",
  border: "1px solid rgba(183,165,134,0.25)",
  borderRadius: 6,
  outline: "none",
  padding: "7px 10px",
  fontSize: 13,
  fontFamily: "var(--font-body)",
  color: "var(--brand-text-on-inset)",
  lineHeight: 1.5,
};
