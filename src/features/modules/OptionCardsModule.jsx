import { useState, useEffect } from "react";
import {
  getRecords,
  createRecord,
  updateRecord,
  deleteRecord,
} from "../../lib/projectRecords";
import BrandEmptyState from "../../components/BrandEmptyState";
import ItemCard from "../../components/project/ItemCard";

export default function OptionCardsModule({ project, stageKey, moduleConfig }) {
  const [records, setRecords] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    getRecords(project.id, moduleConfig.moduleKey)
      .then((data) => {
        setRecords(data);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [project.id, moduleConfig.moduleKey]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      const record = await createRecord(project.id, {
        stageKey,
        moduleKey: moduleConfig.moduleKey,
        recordType: "option_card",
        title: newTitle.trim(),
        body: newBody.trim() || null,
        fields: { selected: false },
        sort_order: records.length,
      });
      setRecords((prev) => [...prev, record]);
      setNewTitle("");
      setNewBody("");
      setShowForm(false);
    } finally {
      setAdding(false);
    }
  }

  async function handleSelect(recordId) {
    const current = records.find((r) => r.id === recordId);
    const nextSelected = !current?.fields?.selected;
    setRecords((prev) =>
      prev.map((r) => ({
        ...r,
        fields: { ...r.fields, selected: r.id === recordId ? nextSelected : false },
      }))
    );
    const toUpdate = records.filter((r) => r.id === recordId || r.fields?.selected);
    await Promise.all(
      toUpdate.map((r) =>
        updateRecord(r.id, {
          fields: { ...r.fields, selected: r.id === recordId ? nextSelected : false },
        })
      )
    ).catch(() => {});
  }

  async function handleDelete(recordId) {
    setRecords((prev) => prev.filter((r) => r.id !== recordId));
    await deleteRecord(recordId).catch(() => {});
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
          title={moduleConfig.emptyState?.title ?? "No options yet"}
          description={moduleConfig.emptyState?.description}
          primaryAction={{ label: "Add option", onClick: () => setShowForm(true) }}
        />
      )}

      {records.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
          {records.map((record) => {
            const selected = record.fields?.selected;
            return (
              <ItemCard key={record.id} selected={selected}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flexWrap: "wrap",
                        marginBottom: record.body ? 4 : 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "var(--brand-text-on-inset)",
                        }}
                      >
                        {record.title}
                      </span>
                      {selected && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                            color: "var(--brand-accent-mustard)",
                            background: "rgba(214,163,42,0.12)",
                            padding: "2px 7px",
                            borderRadius: 4,
                          }}
                        >
                          Selected
                        </span>
                      )}
                    </div>
                    {record.body && (
                      <p
                        style={{
                          fontSize: 13,
                          color: "var(--brand-text-on-inset-muted)",
                          lineHeight: 1.5,
                          margin: 0,
                        }}
                      >
                        {record.body}
                      </p>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <SelectBtn selected={selected} onClick={() => handleSelect(record.id)} />
                    <DeleteBtn onClick={() => handleDelete(record.id)} />
                  </div>
                </div>
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
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Option name"
            style={inlineInputStyle}
          />
          <textarea
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            style={{ ...inlineInputStyle, resize: "none", background: "rgba(183,165,134,0.1)", borderRadius: 6, padding: "8px 10px" }}
          />
          <FormActions
            onSubmit={handleAdd}
            onCancel={() => { setShowForm(false); setNewTitle(""); setNewBody(""); }}
            disabled={adding || !newTitle.trim()}
            submitLabel="Add"
          />
        </form>
      ) : records.length > 0 ? (
        <AddRowBtn onClick={() => setShowForm(true)} label="Add option" />
      ) : null}
    </div>
  );
}

function SelectBtn({ selected, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: 12,
        padding: "4px 10px",
        borderRadius: 6,
        cursor: "pointer",
        border: selected ? "none" : "1px solid rgba(64,57,47,0.22)",
        background: selected ? "rgba(214,163,42,0.15)" : "transparent",
        color: selected ? "var(--brand-accent-mustard)" : "var(--brand-text-on-inset-muted)",
        fontWeight: selected ? 600 : 400,
        whiteSpace: "nowrap",
      }}
    >
      {selected ? "✓ Selected" : "Select"}
    </button>
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

function FormActions({ onCancel, disabled, submitLabel }) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button
        type="submit"
        disabled={disabled}
        style={{
          padding: "6px 14px",
          borderRadius: 6,
          background: "var(--brand-accent-mustard)",
          border: "none",
          color: "#fff",
          fontSize: 13,
          fontWeight: 600,
          cursor: disabled ? "default" : "pointer",
          opacity: disabled ? 0.4 : 1,
        }}
      >
        {submitLabel}
      </button>
      <button
        type="button"
        onClick={onCancel}
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
  );
}

function AddRowBtn({ onClick, label }) {
  return (
    <button
      onClick={onClick}
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
      + {label}
    </button>
  );
}

const inlineInputStyle = {
  width: "100%",
  background: "transparent",
  border: "none",
  outline: "none",
  fontSize: 14,
  fontFamily: "var(--font-body)",
  color: "var(--brand-text-on-inset)",
};
