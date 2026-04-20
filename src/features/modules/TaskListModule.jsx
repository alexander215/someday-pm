import { useState, useEffect, useRef } from "react";
import {
  getTasksForModule,
  createTask,
  toggleTaskDone,
  updateTask,
  deleteTask,
} from "../../lib/projectTasks";
import BrandEmptyState from "../../components/BrandEmptyState";

export default function TaskListModule({ project, stageKey, moduleConfig }) {
  const [tasks, setTasks] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const labels = moduleConfig.labels ?? [];

  useEffect(() => {
    getTasksForModule(project.id, moduleConfig.moduleKey)
      .then((data) => { setTasks(data); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, [project.id, moduleConfig.moduleKey]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      const task = await createTask(project.id, {
        stageKey,
        moduleKey: moduleConfig.moduleKey,
        title: newTitle.trim(),
        sort_order: tasks.length,
      });
      setTasks((prev) => [...prev, task]);
      setNewTitle("");
      setExpandedId(task.id);
    } finally {
      setAdding(false);
    }
  }

  async function handleToggle(taskId, isDone) {
    const updated = await toggleTaskDone(taskId, !isDone);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
  }

  async function handleSaveBody(taskId, body, label) {
    const updated = await updateTask(taskId, {
      body: body.trim() || null,
      label: label || null,
    });
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
  }

  async function handleDelete(taskId) {
    await deleteTask(taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (expandedId === taskId) setExpandedId(null);
  }

  if (!loaded) {
    return <div style={{ fontSize: 13, color: "var(--brand-text-muted)", opacity: 0.5 }}>Loading…</div>;
  }

  const openTasks = tasks.filter((t) => t.status !== "done");
  const doneTasks = tasks.filter((t) => t.status === "done");
  const ordered = [...openTasks, ...doneTasks];

  return (
    <div
      style={{
        background: "var(--brand-board-canvas)",
        borderRadius: 12,
        border: "1px solid rgba(183,165,134,0.25)",
        overflow: "hidden",
      }}
    >
      {tasks.length === 0 && (
        <div style={{ padding: "14px 16px" }}>
          <BrandEmptyState
            variant="compact"
            icon={moduleConfig.emptyState?.icon}
            title={moduleConfig.emptyState?.title ?? "No tasks yet"}
            description={moduleConfig.emptyState?.description}
          />
        </div>
      )}

      {ordered.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {ordered.map((task, i) => {
            const isDone = task.status === "done";
            const isExpanded = expandedId === task.id;
            return (
              <li
                key={task.id}
                style={{
                  borderBottom:
                    i < ordered.length - 1 ? "1px solid rgba(183,165,134,0.14)" : "none",
                }}
              >
                {/* ── Row ── */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 16px",
                    cursor: "pointer",
                  }}
                  onClick={() => setExpandedId(isExpanded ? null : task.id)}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggle(task.id, isDone); }}
                    aria-label={isDone ? "Mark incomplete" : "Mark complete"}
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      border: isDone ? "none" : "1.5px solid rgba(64,57,47,0.35)",
                      background: isDone ? "var(--brand-accent-mustard)" : "transparent",
                      flexShrink: 0,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                    }}
                  >
                    {isDone && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        fontSize: 14,
                        color: isDone ? "var(--brand-text-on-inset-muted)" : "var(--brand-text-on-inset)",
                        textDecoration: isDone ? "line-through" : "none",
                        opacity: isDone ? 0.55 : 1,
                        display: "block",
                        lineHeight: 1.4,
                      }}
                    >
                      {task.title}
                    </span>
                    {!isExpanded && task.body && (
                      <span style={{ fontSize: 12, color: "var(--brand-text-muted)", opacity: 0.7, display: "block", marginTop: 1 }}>
                        {task.body.length > 80 ? task.body.slice(0, 80) + "…" : task.body}
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                    {task.label && !isExpanded && (
                      <span style={labelBadgeStyle}>{task.label}</span>
                    )}
                    <span style={{ fontSize: 13, color: "var(--brand-text-muted)", opacity: 0.35, lineHeight: 1 }}>
                      {isExpanded ? "▲" : "▾"}
                    </span>
                    <DeleteBtn onClick={(e) => { e.stopPropagation(); handleDelete(task.id); }} />
                  </div>
                </div>

                {/* ── Expanded detail ── */}
                {isExpanded && (
                  <TaskDetail
                    task={task}
                    labels={labels}
                    onSave={handleSaveBody}
                    onClose={() => setExpandedId(null)}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* ── Add form ── */}
      <form
        onSubmit={handleAdd}
        style={{
          display: "flex",
          gap: 8,
          padding: "10px 16px",
          borderTop: tasks.length > 0 ? "1px solid rgba(183,165,134,0.14)" : "none",
          alignItems: "center",
        }}
      >
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add a task…"
          disabled={adding}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: 14,
            fontFamily: "var(--font-body)",
            color: "var(--brand-text-on-inset)",
          }}
        />
        {newTitle.trim() && (
          <button
            type="submit"
            disabled={adding}
            style={{
              background: "none",
              border: "none",
              color: "var(--brand-accent-mustard)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              padding: "0 2px",
              flexShrink: 0,
            }}
          >
            Add
          </button>
        )}
      </form>
    </div>
  );
}

// ─── Inline task detail panel ─────────────────────────────────

function TaskDetail({ task, labels, onSave, onClose }) {
  const [body, setBody] = useState(task.body ?? "");
  const [label, setLabel] = useState(task.label ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const textareaRef = useRef(null);

  const isDirty = body !== (task.body ?? "") || label !== (task.label ?? "");

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await onSave(task.id, body, label);
    } catch (err) {
      setError(err?.message ?? "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        padding: "0 16px 14px 44px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <textarea
        ref={textareaRef}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Add notes…"
        rows={3}
        style={{
          width: "100%",
          background: "rgba(183,165,134,0.06)",
          border: "1px solid rgba(183,165,134,0.2)",
          borderRadius: 6,
          padding: "7px 10px",
          fontSize: 13,
          fontFamily: "var(--font-body)",
          color: "var(--brand-text-on-inset)",
          outline: "none",
          resize: "vertical",
          lineHeight: 1.5,
          boxSizing: "border-box",
        }}
      />

      {labels.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {labels.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLabel(label === l ? "" : l)}
              style={{
                padding: "3px 9px",
                borderRadius: 4,
                border: "1px solid rgba(183,165,134,0.3)",
                background: label === l ? "var(--brand-accent-mustard)" : "transparent",
                color: label === l ? "#fff" : "var(--brand-text-muted)",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.1s, color 0.1s",
              }}
            >
              {l}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div style={{ fontSize: 12, color: "#b05050" }}>{error}</div>
      )}

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {isDirty && (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "4px 12px",
              borderRadius: 6,
              background: "var(--brand-accent-mustard)",
              border: "none",
              color: "#fff",
              fontSize: 12,
              fontWeight: 600,
              cursor: saving ? "default" : "pointer",
              opacity: saving ? 0.5 : 1,
            }}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            fontSize: 12,
            color: "var(--brand-text-muted)",
            cursor: "pointer",
            padding: "4px 0",
          }}
        >
          {isDirty ? "Cancel" : "Close"}
        </button>
      </div>
    </div>
  );
}

// ─── Delete button ────────────────────────────────────────────

function DeleteBtn({ onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      aria-label="Delete task"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "var(--brand-text-on-inset-muted)",
        opacity: hover ? 0.6 : 0,
        fontSize: 18,
        lineHeight: 1,
        padding: "0 2px",
        transition: "opacity 0.1s",
        flexShrink: 0,
      }}
    >
      ×
    </button>
  );
}

const labelBadgeStyle = {
  fontSize: 11,
  fontWeight: 600,
  padding: "2px 7px",
  borderRadius: 4,
  background: "rgba(183,165,134,0.18)",
  color: "var(--brand-text-muted)",
  textTransform: "capitalize",
};
