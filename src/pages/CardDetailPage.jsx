import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  getCardById,
  getChildCards,
  createChildCard,
  updateCard,
  deleteCard,
  CHILD_CATEGORIES,
  ROOT_CATEGORIES,
} from "../lib/cards";
import {
  listFilesForCard,
  uploadFilesForCard,
  deleteFileForCard,
  getDownloadUrl,
  ACCEPT_ATTR,
  formatBytes,
} from "../lib/files";
import {
  getTodosForCard,
  createTodo,
  toggleTodo,
  deleteTodo,
} from "../lib/todos";
import {
  getBrainstormCardsForCard,
  createBrainstormCard,
  deleteBrainstormCard,
  createBrainstormEntry,
  updateBrainstormEntryScore,
  deleteBrainstormEntry,
} from "../lib/brainstorm";
import BrandEmptyState from "../components/BrandEmptyState";
import { workspaceBoard } from "../lib/brandTokens";

export default function CardDetailPage() {
  const { cardId } = useParams();
  const navigate = useNavigate();
  const [card, setCard] = useState(null);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Root card inline edit state
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  // Create child form state
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState(CHILD_CATEGORIES[0]);
  const [creating, setCreating] = useState(false);

  // Files state
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [fileError, setFileError] = useState(null);
  const fileInputRef = useRef(null);

  // To-Do state
  const [todos, setTodos] = useState([]);
  const [todoInput, setTodoInput] = useState("");
  const [todoAdding, setTodoAdding] = useState(false);
  const [todoError, setTodoError] = useState(null);

  // Brainstorm state
  const [brainstormCards, setBrainstormCards] = useState([]);
  const [brainstormNewTitle, setBrainstormNewTitle] = useState("");
  const [brainstormAddingCard, setBrainstormAddingCard] = useState(false);
  const [brainstormEntryInputs, setBrainstormEntryInputs] = useState({});
  const [brainstormError, setBrainstormError] = useState(null);

  // Background notes state
  const [bgNotes, setBgNotes] = useState("");
  const [bgSaveStatus, setBgSaveStatus] = useState(""); // "" | "saving" | "saved" | "error"
  const bgSaveTimer = useRef(null);

  useEffect(() => {
    Promise.all([
      getCardById(cardId),
      getChildCards(cardId),
      listFilesForCard(cardId),
      getTodosForCard(cardId),
      getBrainstormCardsForCard(cardId),
    ])
      .then(([cardData, childData, filesData, todosData, brainstormData]) => {
        setCard(cardData);
        setChildren(childData);
        setFiles(filesData);
        setTodos(todosData);
        setBrainstormCards(brainstormData);
        setBgNotes(cardData.background_notes || "");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [cardId]);

  async function handleCreateChild(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const child = await createChildCard(cardId, {
        title: newTitle.trim(),
        category: newCategory,
      });
      setChildren((prev) => [...prev, child]);
      setNewTitle("");
      setNewCategory(CHILD_CATEGORIES[0]);
      setShowCreate(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  function startEdit() {
    setEditTitle(card.title);
    setEditCategory(card.category);
    setEditNotes(card.notes || "");
    setEditDueDate(card.deliverable_due_date || "");
    setEditMode(true);
  }

  function cancelEdit() {
    setEditMode(false);
  }

  async function handleEditSave() {
    if (!editTitle.trim()) return;
    setEditSaving(true);
    setError(null);
    try {
      const updated = await updateCard(cardId, {
        title: editTitle.trim(),
        category: editCategory,
        notes: editNotes.trim() || null,
        deliverable_due_date: editDueDate || null,
      });
      setCard(updated);
      setEditMode(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDeleteCard() {
    if (
      !confirm(
        `Delete "${card.title}"? This will also delete all its tasks and attachments.`,
      )
    )
      return;
    try {
      await deleteCard(cardId);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteChild(childId) {
    try {
      await deleteCard(childId);
      setChildren((prev) => prev.filter((c) => c.id !== childId));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleUpload(e) {
    const selected = e.target.files;
    if (!selected || selected.length === 0) return;
    setUploading(true);
    setFileError(null);
    try {
      const newFiles = await uploadFilesForCard(cardId, selected);
      setFiles((prev) => [...prev, ...newFiles]);
    } catch (err) {
      setFileError(err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDeleteFile(fileId) {
    setFileError(null);
    try {
      await deleteFileForCard(fileId);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    } catch (err) {
      setFileError(err.message);
    }
  }

  async function handleDownload(storagePath, fileName) {
    try {
      const url = await getDownloadUrl(storagePath);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.target = "_blank";
      a.rel = "noreferrer";
      a.click();
    } catch (err) {
      setFileError(err.message);
    }
  }

  async function handleAddTodo(e) {
    e.preventDefault();
    if (!todoInput.trim()) return;
    setTodoAdding(true);
    setTodoError(null);
    try {
      const todo = await createTodo(cardId, todoInput.trim());
      setTodos((prev) => [...prev, todo]);
      setTodoInput("");
    } catch (err) {
      setTodoError(err.message);
    } finally {
      setTodoAdding(false);
    }
  }

  async function handleToggleTodo(todo) {
    try {
      const updated = await toggleTodo(todo.id, !todo.completed);
      setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (err) {
      setTodoError(err.message);
    }
  }

  async function handleDeleteTodo(todoId) {
    try {
      await deleteTodo(todoId);
      setTodos((prev) => prev.filter((t) => t.id !== todoId));
    } catch (err) {
      setTodoError(err.message);
    }
  }

  async function handleAddBrainstormCard(e) {
    e.preventDefault();
    if (!brainstormNewTitle.trim()) return;
    setBrainstormAddingCard(true);
    setBrainstormError(null);
    try {
      const bCard = await createBrainstormCard({ cardId, title: brainstormNewTitle.trim() });
      setBrainstormCards((prev) => [...prev, bCard]);
      setBrainstormNewTitle("");
    } catch (err) {
      setBrainstormError(err.message);
    } finally {
      setBrainstormAddingCard(false);
    }
  }

  async function handleDeleteBrainstormCard(id) {
    try {
      await deleteBrainstormCard(id);
      setBrainstormCards((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setBrainstormError(err.message);
    }
  }

  async function handleAddBrainstormEntry(e, brainstormCardId) {
    e.preventDefault();
    const text = brainstormEntryInputs[brainstormCardId] || "";
    if (!text.trim()) return;
    setBrainstormError(null);
    try {
      const entry = await createBrainstormEntry({ brainstormCardId, text: text.trim() });
      setBrainstormCards((prev) =>
        prev.map((c) =>
          c.id === brainstormCardId
            ? { ...c, brainstorm_entries: [entry, ...(c.brainstorm_entries || [])] }
            : c
        )
      );
      setBrainstormEntryInputs((prev) => ({ ...prev, [brainstormCardId]: "" }));
    } catch (err) {
      setBrainstormError(err.message);
    }
  }

  async function handleBrainstormEntryScore(entry, rawVal) {
    const score = rawVal === "" ? null : parseInt(rawVal, 10);
    try {
      const updated = await updateBrainstormEntryScore(entry.id, score);
      setBrainstormCards((prev) =>
        prev.map((c) =>
          c.id === entry.brainstorm_card_id
            ? {
                ...c,
                brainstorm_entries: (c.brainstorm_entries || []).map((en) =>
                  en.id === updated.id ? updated : en
                ),
              }
            : c
        )
      );
    } catch (err) {
      setBrainstormError(err.message);
    }
  }

  async function handleDeleteBrainstormEntry(brainstormCardId, entryId) {
    try {
      await deleteBrainstormEntry(entryId);
      setBrainstormCards((prev) =>
        prev.map((c) =>
          c.id === brainstormCardId
            ? { ...c, brainstorm_entries: (c.brainstorm_entries || []).filter((en) => en.id !== entryId) }
            : c
        )
      );
    } catch (err) {
      setBrainstormError(err.message);
    }
  }

  function handleBgNotesChange(val) {
    setBgNotes(val);
    setBgSaveStatus("saving");
    clearTimeout(bgSaveTimer.current);
    bgSaveTimer.current = setTimeout(async () => {
      try {
        await updateCard(cardId, { background_notes: val || null });
        setBgSaveStatus("saved");
      } catch {
        setBgSaveStatus("error");
      }
    }, 700);
  }

  if (loading) {
    return (
      <div style={{ padding: "48px 32px", color: "var(--color-text-muted)", fontSize: "14px" }}>
        Loading…
      </div>
    );
  }

  if (error && !card) {
    return (
      <div style={{ padding: "48px 32px", maxWidth: "640px", margin: "0 auto" }}>
        <Link to="/" style={backLinkStyle}>← Back</Link>
        <p style={{ color: "#f87171", fontSize: "14px" }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px 28px 56px" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>

        <Link to="/" style={backLinkStyle}>← Back</Link>

        {/* ── Project header — lives on the green shell ── */}
        {editMode ? (
          <div style={{ marginBottom: 28 }}>
            <input
              autoFocus
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Project title"
              style={{ ...inputStyle, fontSize: "20px", fontWeight: 600, marginBottom: "10px" }}
            />
            <div style={{ display: "flex", gap: "10px", marginBottom: "10px", flexWrap: "wrap" }}>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                style={{ ...inputStyle, width: "auto", flex: "0 0 auto" }}
              >
                {ROOT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <input
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                style={{ ...inputStyle, width: "auto", flex: "0 0 auto" }}
              />
            </div>
            <textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="Notes (optional)"
              rows={3}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6, fontFamily: "inherit", marginBottom: "10px" }}
            />
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={handleEditSave}
                disabled={editSaving || !editTitle.trim()}
                style={{
                  padding: "6px 14px", background: "var(--color-accent)", border: "none",
                  borderRadius: "6px", color: "#fff", fontSize: "13px", fontWeight: 500,
                  cursor: editSaving || !editTitle.trim() ? "not-allowed" : "pointer",
                  opacity: editSaving || !editTitle.trim() ? 0.6 : 1,
                }}
              >
                {editSaving ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                style={{
                  padding: "6px 14px", background: "transparent",
                  border: "1px solid var(--color-border)", borderRadius: "6px",
                  color: "var(--color-text-muted)", fontSize: "13px", cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "8px" }}>
              <h1 style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(20px, 3vw, 28px)",
                fontWeight: 800,
                letterSpacing: "-0.04em",
                lineHeight: 1.05,
                color: "var(--color-text)",
                marginRight: "16px",
                margin: 0,
              }}>
                {card.title}
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0, marginTop: "4px" }}>
                <span style={{
                  fontSize: "10px",
                  padding: "3px 10px",
                  background: "rgba(243,231,207,0.1)",
                  border: "1px solid rgba(243,231,207,0.18)",
                  borderRadius: "99px",
                  color: "rgba(243,231,207,0.65)",
                  fontWeight: 600,
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}>
                  {card.category}
                </span>
                <button
                  onClick={startEdit}
                  style={{ background: "none", border: "1px solid var(--color-border)", borderRadius: "6px", color: "var(--color-text-muted)", fontSize: "12px", padding: "3px 10px", cursor: "pointer", whiteSpace: "nowrap" }}
                >
                  Edit
                </button>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: 28 }}>
              {card.deliverable_due_date && (
                <p style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>
                  Due: {card.deliverable_due_date}
                </p>
              )}
              {card.notes && (
                <p style={{ fontSize: "14px", color: "var(--color-text-muted)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                  {card.notes}
                </p>
              )}
            </div>
          </>
        )}

        {error && (
          <p style={{ color: "#f87171", fontSize: "13px", marginBottom: "16px" }}>{error}</p>
        )}

        {/* ── 2-column section grid ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 20,
            alignItems: "start",
          }}
        >

          {/* ── Tasks + To-Do panel ── */}
          <section id="cards" style={sectionCard}>
            <div style={sectionCardHeader}>
              <h2 style={sectionCardTitle}>
                Tasks
                {children.length > 0 && (
                  <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 500, color: workspaceBoard.textMuted }}>
                    {children.length}
                  </span>
                )}
              </h2>
              {!showCreate && (
                <button onClick={() => setShowCreate(true)} style={panelGreenBtn}>
                  + Add task
                </button>
              )}
            </div>

            <div style={{ padding: "14px 16px" }}>
              {/* Inline create form */}
              {showCreate && (
                <form
                  onSubmit={handleCreateChild}
                  style={{ marginBottom: 14, display: "flex", flexDirection: "column", gap: 10 }}
                >
                  <input
                    autoFocus
                    type="text"
                    placeholder="Task title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    style={panelInputStyle}
                  />
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    style={panelInputStyle}
                  >
                    {CHILD_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      type="submit"
                      disabled={creating || !newTitle.trim()}
                      style={{ ...panelGreenBtn, opacity: creating || !newTitle.trim() ? 0.6 : 1, cursor: creating || !newTitle.trim() ? "not-allowed" : "pointer" }}
                    >
                      {creating ? "Adding…" : "Add"}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowCreate(false); setNewTitle(""); setNewCategory(CHILD_CATEGORIES[0]); }}
                      style={panelCancelBtn}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Task list */}
              {children.length === 0 && !showCreate ? (
                <BrandEmptyState
                  variant="panel"
                  title="No tasks yet"
                  description="Break this project into steps — each task gets its own notes, files, and to-dos."
                  primaryAction={{ label: "+ Add task", onClick: () => setShowCreate(true) }}
                />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {children.map((child) => (
                    <div key={child.id} style={taskItemRow}>
                      <Link
                        to={`/card/${cardId}/item/${child.id}`}
                        style={{ fontSize: 13, color: workspaceBoard.text, textDecoration: "none", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500 }}
                      >
                        {child.title}
                      </Link>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginLeft: 8 }}>
                        <span style={{ fontSize: 10, padding: "2px 8px", border: "1px solid rgba(183,165,134,0.28)", borderRadius: 99, color: workspaceBoard.textMuted, whiteSpace: "nowrap" }}>
                          {child.category}
                        </span>
                        <button onClick={() => handleDeleteChild(child.id)} title="Delete task" style={panelIconBtn}>×</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── To-Do subsection ── */}
              <div id="todo" style={{ borderTop: "1px solid rgba(183,165,134,0.2)", marginTop: 18, paddingTop: 16 }}>
                <h3 style={{ ...sectionCardTitle, marginBottom: 12, fontSize: 13 }}>
                  To‑Do
                  {todos.length > 0 && (
                    <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 500, color: workspaceBoard.textMuted }}>
                      {todos.filter((t) => t.completed).length}/{todos.length}
                    </span>
                  )}
                </h3>

                {todoError && <p style={panelErrorText}>{todoError}</p>}

                <form onSubmit={handleAddTodo} style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <input
                    type="text"
                    placeholder="Add a to-do…"
                    value={todoInput}
                    onChange={(e) => setTodoInput(e.target.value)}
                    style={{ ...panelInputStyle, flex: 1 }}
                  />
                  <button
                    type="submit"
                    disabled={todoAdding || !todoInput.trim()}
                    style={{ ...panelGreenBtn, opacity: todoAdding || !todoInput.trim() ? 0.5 : 1, cursor: todoAdding || !todoInput.trim() ? "not-allowed" : "pointer" }}
                  >
                    Add
                  </button>
                </form>

                {todos.length === 0 ? (
                  <BrandEmptyState
                    variant="panel"
                    title="No to-dos yet"
                    description="Use the field above to capture quick checklist items for this project."
                  />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {todos.map((todo) => (
                      <div
                        key={todo.id}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "8px 10px",
                          border: "1px solid rgba(183,165,134,0.2)",
                          borderRadius: 7,
                          background: todo.completed ? "transparent" : workspaceBoard.card,
                          opacity: todo.completed ? 0.6 : 1,
                        }}
                      >
                        <button
                          onClick={() => handleToggleTodo(todo)}
                          title={todo.completed ? "Mark incomplete" : "Mark complete"}
                          style={{
                            width: 16, height: 16, borderRadius: 4,
                            border: `1.5px solid ${todo.completed ? "var(--brand-bg)" : "rgba(143,120,90,0.4)"}`,
                            background: todo.completed ? "var(--brand-bg)" : "transparent",
                            cursor: "pointer", flexShrink: 0, padding: 0,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "var(--brand-surface-soft)", fontSize: 10,
                          }}
                        >
                          {todo.completed ? "✓" : ""}
                        </button>
                        <span style={{ flex: 1, fontSize: 13, color: workspaceBoard.text, textDecoration: todo.completed ? "line-through" : "none", lineHeight: 1.4 }}>
                          {todo.text}
                        </span>
                        <button onClick={() => handleDeleteTodo(todo.id)} title="Delete" style={panelIconBtn}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ── Brainstorm panel ── */}
          <section id="brainstorm" style={sectionCard}>
            <div style={sectionCardHeader}>
              <h2 style={sectionCardTitle}>
                Brainstorm
                {brainstormCards.length > 0 && (
                  <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 500, color: workspaceBoard.textMuted }}>
                    {brainstormCards.length} topic{brainstormCards.length !== 1 ? "s" : ""}
                  </span>
                )}
              </h2>
            </div>

            <div style={{ padding: "14px 16px" }}>
              {brainstormError && <p style={panelErrorText}>{brainstormError}</p>}

              {/* New topic form */}
              <form onSubmit={handleAddBrainstormCard} style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                <input
                  type="text"
                  placeholder="New brainstorm topic…"
                  value={brainstormNewTitle}
                  onChange={(e) => setBrainstormNewTitle(e.target.value)}
                  style={{ ...panelInputStyle, flex: 1 }}
                />
                <button
                  type="submit"
                  disabled={brainstormAddingCard || !brainstormNewTitle.trim()}
                  style={{ ...panelGreenBtn, opacity: brainstormAddingCard || !brainstormNewTitle.trim() ? 0.5 : 1, cursor: brainstormAddingCard || !brainstormNewTitle.trim() ? "not-allowed" : "pointer" }}
                >
                  Add Topic
                </button>
              </form>

              {/* Topic cards */}
              {brainstormCards.length === 0 ? (
                <BrandEmptyState
                  variant="panel"
                  title="No brainstorm topics yet"
                  description="Add a topic above, then capture ideas underneath and score what feels strongest."
                />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {brainstormCards.map((bCard) => (
                    <div
                      key={bCard.id}
                      style={{ border: "1px solid rgba(183,165,134,0.25)", borderRadius: 10, background: workspaceBoard.card, overflow: "hidden" }}
                    >
                      {/* Topic header */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", borderBottom: "1px solid rgba(183,165,134,0.2)" }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: workspaceBoard.text }}>{bCard.title}</span>
                        <button onClick={() => handleDeleteBrainstormCard(bCard.id)} title="Delete topic" style={panelIconBtn}>×</button>
                      </div>

                      {/* Entries area */}
                      <div style={{ padding: "9px 12px" }}>
                        <form
                          onSubmit={(e) => handleAddBrainstormEntry(e, bCard.id)}
                          style={{ display: "flex", gap: 8, marginBottom: 8 }}
                        >
                          <input
                            type="text"
                            placeholder="Add an idea…"
                            value={brainstormEntryInputs[bCard.id] || ""}
                            onChange={(e) =>
                              setBrainstormEntryInputs((prev) => ({ ...prev, [bCard.id]: e.target.value }))
                            }
                            style={{ ...panelInputStyle, fontSize: 12 }}
                          />
                          <button
                            type="submit"
                            disabled={!(brainstormEntryInputs[bCard.id] || "").trim()}
                            style={{ ...panelGreenBtn, fontSize: 12, padding: "5px 11px", opacity: !(brainstormEntryInputs[bCard.id] || "").trim() ? 0.5 : 1, cursor: !(brainstormEntryInputs[bCard.id] || "").trim() ? "not-allowed" : "pointer" }}
                          >
                            Add
                          </button>
                        </form>

                        {(!bCard.brainstorm_entries || bCard.brainstorm_entries.length === 0) ? (
                          <BrandEmptyState
                            variant="panel"
                            title="No ideas in this topic yet"
                            description="Use the field above to add a rough thought — you can score or delete it later."
                          />
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            {bCard.brainstorm_entries.map((entry) => (
                              <div
                                key={entry.id}
                                style={{
                                  display: "flex", alignItems: "center", gap: 8,
                                  padding: "6px 10px",
                                  border: "1px solid rgba(183,165,134,0.2)",
                                  borderRadius: 6,
                                  background: workspaceBoard.nestedLine,
                                }}
                              >
                                <span style={{ flex: 1, fontSize: 12, color: workspaceBoard.text, lineHeight: 1.4 }}>
                                  {entry.text}
                                </span>
                                <select
                                  value={entry.score ?? ""}
                                  onChange={(e) => handleBrainstormEntryScore(entry, e.target.value)}
                                  title="Score 1–10"
                                  style={{
                                    background: workspaceBoard.card,
                                    border: "1px solid rgba(183,165,134,0.3)",
                                    borderRadius: 4,
                                    color: entry.score ? workspaceBoard.text : workspaceBoard.textMuted,
                                    fontSize: 11, padding: "2px 4px", cursor: "pointer", flexShrink: 0,
                                  }}
                                >
                                  <option value="">—</option>
                                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                                    <option key={n} value={n}>{n}</option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => handleDeleteBrainstormEntry(bCard.id, entry.id)}
                                  title="Delete"
                                  style={{ ...panelIconBtn, fontSize: 14 }}
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

        </div>

        {/* ── Attachments panel ── */}
        <section id="files" style={{ ...sectionCard, marginTop: 20 }}>
          <div style={sectionCardHeader}>
            <h2 style={sectionCardTitle}>Attachments</h2>
            <label
              style={{
                padding: "5px 12px",
                background: uploading ? "transparent" : workspaceBoard.card,
                border: "1px solid rgba(183,165,134,0.3)",
                borderRadius: 7,
                color: uploading ? workspaceBoard.textMuted : workspaceBoard.text,
                fontSize: 12, fontWeight: 500,
                cursor: uploading ? "not-allowed" : "pointer",
              }}
            >
              {uploading ? "Uploading…" : "+ Attach files"}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ACCEPT_ATTR}
                onChange={handleUpload}
                disabled={uploading}
                style={{ display: "none" }}
              />
            </label>
          </div>
          <div style={{ padding: "14px 16px" }}>
            {fileError && <p style={panelErrorText}>{fileError}</p>}
            {files.length === 0 ? (
              <BrandEmptyState
                variant="panel"
                title="No attachments yet"
                description="Drop references, briefs, or exports so everything lives with the project."
                primaryAction={{
                  label: "+ Attach files",
                  onClick: () => fileInputRef.current?.click(),
                }}
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {files.map((file) => (
                  <div key={file.id} style={taskItemRow}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                      <button
                        onClick={() => handleDownload(file.storage_path, file.file_name)}
                        style={{
                          background: "none", border: "none", padding: 0, textAlign: "left",
                          cursor: "pointer", color: "var(--brand-bg)", fontSize: 13, fontWeight: 500,
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 320,
                        }}
                        title={file.file_name}
                      >
                        {file.file_name}
                      </button>
                      <span style={{ fontSize: 11, color: workspaceBoard.textMuted }}>
                        {formatBytes(file.file_size)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      title="Remove attachment"
                      style={{ ...panelIconBtn, marginLeft: 10 }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Background panel ── */}
        <section id="background" style={{ ...sectionCard, marginTop: 20 }}>
          <div style={sectionCardHeader}>
            <h2 style={sectionCardTitle}>Background</h2>
            <span
              style={{
                fontSize: 11,
                color: bgSaveStatus === "error" ? "#b45309" : workspaceBoard.textMuted,
                minWidth: 60,
                textAlign: "right",
              }}
            >
              {bgSaveStatus === "saving" ? "Saving…" : bgSaveStatus === "saved" ? "Saved" : bgSaveStatus === "error" ? "Couldn't save" : ""}
            </span>
          </div>
          <div style={{ padding: "14px 16px" }}>
            <p style={{ fontSize: 12, color: workspaceBoard.textMuted, margin: "0 0 10px" }}>
              Use this for context, links, constraints, and rough notes.
            </p>
            <textarea
              value={bgNotes}
              onChange={(e) => handleBgNotesChange(e.target.value)}
              placeholder="Add background notes…"
              rows={6}
              style={{
                ...panelInputStyle,
                resize: "vertical",
                lineHeight: 1.6,
                fontFamily: "inherit",
                minHeight: 100,
              }}
            />
          </div>
        </section>

        {/* ── Delete project ── */}
        <div style={{ marginTop: 36, paddingTop: 18, borderTop: "1px solid var(--color-border)" }}>
          <button
            onClick={handleDeleteCard}
            style={{
              padding: "6px 14px", background: "transparent",
              border: "1px solid var(--color-border)", borderRadius: "6px",
              color: "var(--color-text-muted)", fontSize: "13px", cursor: "pointer",
            }}
          >
            Delete Project
          </button>
        </div>

      </div>
    </div>
  );
}

const backLinkStyle = {
  fontSize: "13px",
  color: "var(--color-text-muted)",
  marginBottom: "24px",
  display: "inline-block",
  textDecoration: "none",
};

// Used for the project header edit form (on dark green background)
const inputStyle = {
  padding: "8px 12px",
  background: "var(--color-bg)",
  border: "1px solid var(--color-border)",
  borderRadius: "6px",
  color: "var(--color-text)",
  fontSize: "14px",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

// ── Workspace board panels (canvas shell + inset interactive — see workspaceBoard) ──

const sectionCard = {
  background: workspaceBoard.canvas,
  border: "1px solid rgba(183,165,134,0.28)",
  borderRadius: 14,
  boxShadow: "0 4px 20px rgba(27,35,27,0.18)",
  overflow: "hidden",
};

const sectionCardHeader = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "13px 16px",
  borderBottom: "1px solid rgba(183,165,134,0.2)",
};

const sectionCardTitle = {
  fontSize: 14,
  fontWeight: 700,
  color: workspaceBoard.text,
  fontFamily: "var(--font-display)",
  margin: 0,
};

// Inputs inside cream panels
const panelInputStyle = {
  padding: "7px 10px",
  background: workspaceBoard.card,
  border: "1px solid rgba(183,165,134,0.28)",
  borderRadius: 7,
  color: workspaceBoard.text,
  fontSize: 13,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

// Dark green primary action buttons inside cream panels
const panelGreenBtn = {
  padding: "6px 13px",
  background: "var(--brand-bg)",
  border: "none",
  borderRadius: 7,
  color: "var(--brand-surface-soft)",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  flexShrink: 0,
  whiteSpace: "nowrap",
};

const panelCancelBtn = {
  padding: "6px 13px",
  background: "transparent",
  border: "1px solid rgba(183,165,134,0.3)",
  borderRadius: 7,
  color: workspaceBoard.textMuted,
  fontSize: 12,
  cursor: "pointer",
};

// Small × delete buttons inside cream panels
const panelIconBtn = {
  background: "none",
  border: "none",
  color: "rgba(64, 52, 38, 0.55)",
  cursor: "pointer",
  fontSize: 16,
  lineHeight: 1,
  padding: "0 2px",
  flexShrink: 0,
};

// Row for task cards and file items inside panels
const taskItemRow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "9px 12px",
  border: "1px solid rgba(183,165,134,0.22)",
  borderRadius: 8,
  background: workspaceBoard.card,
};

const panelErrorText = {
  color: "#b45309",
  fontSize: 13,
  marginBottom: 10,
};
