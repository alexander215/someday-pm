// TODO: We now use @dnd-kit for drag-and-drop on the brainstorm board.
// Other drag areas in the app (if any added later) should be migrated to the same
// @dnd-kit model for consistency: DragOverlay + useSortable + drag handle.

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getCardById } from "../lib/cards";
import {
  getBrainstormBoard,
  createBrainstormIdea,
  updateBrainstormIdeaReaction,
  updateBrainstormIdeaNote,
  deleteBrainstormIdea,
  reorderBrainstormIdeas,
  resetBrainstormOrder,
} from "../lib/brainstorm";
import BrandEmptyState from "../components/BrandEmptyState";
import { workspaceBoard } from "../lib/brandTokens";

const REACTION_EMOJIS = { smile: "😀", neutral: "😐", sad: "😞" };
const REACTION_ARIA   = { smile: "Mark as positive", neutral: "Mark as neutral", sad: "Mark as negative" };
const REACTION_LABELS = { smile: "Positive", neutral: "Neutral", sad: "Negative" };
const REACTION_ORDER  = { smile: 0, neutral: 1, sad: 2 };

function reactionColors(reaction) {
  const map = {
    smile:   { background: "#d5e8d4", color: "#1c4420", border: "#a8c7a7" },
    neutral: { background: "#f5e9bf", color: "#5c4200", border: "#d4b860" },
    sad:     { background: "#f2d9d9", color: "#7a2020", border: "#d4a4a4" },
  };
  return map[reaction] ?? map.neutral;
}

function sortByDefault(ideas) {
  return [...ideas].sort((a, b) => {
    const rd = REACTION_ORDER[a.reaction] - REACTION_ORDER[b.reaction];
    return rd !== 0 ? rd : new Date(a.created_at) - new Date(b.created_at);
  });
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export default function BrainstormBoardPage() {
  const { cardId, boardId } = useParams();

  const [card, setCard] = useState(null);
  const [board, setBoard] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newText, setNewText] = useState("");
  const [adding, setAdding] = useState(false);

  const [expandedNotes, setExpandedNotes] = useState(new Set());
  const [draftNotes, setDraftNotes] = useState({});
  const [savingNotes, setSavingNotes] = useState(new Set());

  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    Promise.all([getCardById(cardId), getBrainstormBoard(boardId)])
      .then(([cardData, boardData]) => {
        if (boardData.card_id !== cardId) throw new Error("Board not found in this project.");
        setCard(cardData);
        setBoard({ id: boardData.id, title: boardData.title, use_custom_order: boardData.use_custom_order });
        setIdeas(boardData.ideas);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [cardId, boardId]);

  async function handleAddIdea(e) {
    e.preventDefault();
    if (!newText.trim()) return;
    setAdding(true);
    setError(null);
    try {
      const idea = await createBrainstormIdea({ boardId, text: newText.trim() });
      setIdeas((prev) => {
        const next = [...prev, idea];
        return board?.use_custom_order ? next : sortByDefault(next);
      });
      setNewText("");
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  }

  async function handleReaction(ideaId, reaction) {
    try {
      const updated = await updateBrainstormIdeaReaction(ideaId, reaction);
      setIdeas((prev) => {
        const next = prev.map((i) => (i.id === updated.id ? updated : i));
        return board?.use_custom_order ? next : sortByDefault(next);
      });
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(ideaId) {
    try {
      await deleteBrainstormIdea(ideaId);
      setIdeas((prev) => prev.filter((i) => i.id !== ideaId));
    } catch (err) {
      setError(err.message);
    }
  }

  function toggleNote(ideaId, currentNote) {
    setExpandedNotes((prev) => {
      const next = new Set(prev);
      if (next.has(ideaId)) {
        next.delete(ideaId);
      } else {
        next.add(ideaId);
        setDraftNotes((d) => ({ ...d, [ideaId]: currentNote ?? "" }));
      }
      return next;
    });
  }

  async function handleNoteSave(ideaId) {
    const draft = draftNotes[ideaId] ?? "";
    const idea = ideas.find((i) => i.id === ideaId);
    if (!idea || draft === (idea.note ?? "")) return;
    setSavingNotes((prev) => new Set(prev).add(ideaId));
    try {
      const updated = await updateBrainstormIdeaNote(ideaId, draft);
      setIdeas((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingNotes((prev) => { const n = new Set(prev); n.delete(ideaId); return n; });
    }
  }

  async function handleReset() {
    try {
      await resetBrainstormOrder(boardId);
      setBoard((prev) => ({ ...prev, use_custom_order: false }));
      setIdeas((prev) => sortByDefault(prev));
    } catch (err) {
      setError(err.message);
    }
  }

  function handleDragStart({ active }) {
    setActiveId(active.id);
  }

  async function handleDragEnd({ active, over }) {
    setActiveId(null);
    if (!over || active.id === over.id) return;

    setIdeas((prev) => {
      const oldIndex = prev.findIndex((i) => i.id === active.id);
      const newIndex = prev.findIndex((i) => i.id === over.id);
      const reordered = arrayMove(prev, oldIndex, newIndex);
      reorderBrainstormIdeas(boardId, reordered.map((i) => i.id)).catch((err) =>
        setError(err.message)
      );
      return reordered;
    });
    setBoard((prev) => ({ ...prev, use_custom_order: true }));
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  const isCustom = board?.use_custom_order ?? false;
  const top3 = ideas.slice(0, 3);
  const activeIdea = ideas.find((i) => i.id === activeId);

  const groups = !isCustom
    ? ["smile", "neutral", "sad"]
        .map((r) => ({ reaction: r, items: ideas.filter((i) => i.reaction === r) }))
        .filter((g) => g.items.length > 0)
    : null;

  const sharedCardProps = (idea) => ({
    idea,
    noteOpen: expandedNotes.has(idea.id),
    draftNote: draftNotes[idea.id] ?? idea.note ?? "",
    savingNote: savingNotes.has(idea.id),
    onReaction: (r) => handleReaction(idea.id, r),
    onDelete: () => handleDelete(idea.id),
    onToggleNote: () => toggleNote(idea.id, idea.note),
    onNoteChange: (val) => setDraftNotes((d) => ({ ...d, [idea.id]: val })),
    onNoteSave: () => handleNoteSave(idea.id),
  });

  if (loading) {
    return <div style={{ padding: "48px 32px", color: "var(--color-text-muted)", fontSize: 14 }}>Loading…</div>;
  }

  if (error && !board) {
    return (
      <div style={{ padding: "48px 32px" }}>
        <Link to={`/card/${cardId}`} style={backLinkStyle}>← Back</Link>
        <p style={{ color: "#f87171", fontSize: 13 }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px 28px 56px" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>

        <Link to={`/card/${cardId}`} style={backLinkStyle}>
          ← {card?.title ?? "Project"}
        </Link>

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, gap: 12, flexWrap: "wrap" }}>
          <h1 style={pageTitleStyle}>{board?.title}</h1>
          {isCustom && (
            <button onClick={handleReset} style={resetBtnStyle} title="Restore default grouping by reaction">
              Reset order
            </button>
          )}
        </div>

        {error && <p style={{ color: "#b45309", fontSize: 13, marginBottom: 16 }}>{error}</p>}

        <form onSubmit={handleAddIdea} style={{ display: "flex", gap: 8, marginBottom: 28 }}>
          <input
            type="text"
            placeholder="Add an idea…"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
          />
          <button
            type="submit"
            disabled={adding || !newText.trim()}
            style={{
              ...greenBtnStyle,
              opacity: adding || !newText.trim() ? 0.5 : 1,
              cursor: adding || !newText.trim() ? "not-allowed" : "pointer",
            }}
          >
            Add
          </button>
        </form>

        {top3.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={sectionLabelStyle}>Top 3 favorites</span>
              <div style={{ flex: 1, height: 1, background: "rgba(183,165,134,0.2)" }} />
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {top3.map((idea) => (
                <div key={idea.id} style={top3CardStyle}>
                  <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0 }} aria-hidden="true">
                    {REACTION_EMOJIS[idea.reaction]}
                  </span>
                  <span style={{ fontSize: 12, color: workspaceBoard.text, lineHeight: 1.5, flex: 1 }}>
                    {idea.text.length > 90 ? idea.text.slice(0, 90) + "…" : idea.text}
                  </span>
                  {idea.note && (
                    <span
                      style={{ fontSize: 11, color: workspaceBoard.textMuted, flexShrink: 0, alignSelf: "flex-start" }}
                      title="Has a note"
                    >
                      ✎
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {ideas.length === 0 ? (
          <BrandEmptyState
            variant="panel"
            title="No ideas yet"
            description="Add your first idea above. Capture rough thoughts — you can react and reorder them as they develop."
          />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <SortableContext items={ideas.map((i) => i.id)} strategy={rectSortingStrategy}>
              {isCustom ? (
                <div style={ideasGrid}>
                  {ideas.map((idea) => (
                    <SortableIdeaCard key={idea.id} isBeingDragged={activeId === idea.id} {...sharedCardProps(idea)} />
                  ))}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  {groups.map(({ reaction, items }) => {
                    const rc = reactionColors(reaction);
                    return (
                      <div key={reaction}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                          <span style={{
                            fontSize: 10, fontWeight: 700, letterSpacing: "0.7px", textTransform: "uppercase",
                            padding: "3px 10px", borderRadius: 99,
                            background: rc.background, color: rc.color, border: `1px solid ${rc.border}`,
                          }}>
                            {REACTION_EMOJIS[reaction]} {REACTION_LABELS[reaction]}
                          </span>
                          <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                            {items.length} idea{items.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div style={ideasGrid}>
                          {items.map((idea) => (
                            <SortableIdeaCard key={idea.id} isBeingDragged={activeId === idea.id} {...sharedCardProps(idea)} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </SortableContext>

            <DragOverlay dropAnimation={{ duration: 180, easing: "ease" }}>
              {activeIdea ? (
                <IdeaCard
                  idea={activeIdea}
                  noteOpen={expandedNotes.has(activeIdea.id)}
                  draftNote={draftNotes[activeIdea.id] ?? activeIdea.note ?? ""}
                  savingNote={false}
                  onReaction={() => {}}
                  onDelete={() => {}}
                  onToggleNote={() => {}}
                  onNoteChange={() => {}}
                  onNoteSave={() => {}}
                  isOverlay
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}

      </div>
    </div>
  );
}

function SortableIdeaCard({ idea, isBeingDragged, ...props }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: idea.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? "transform 200ms ease",
    opacity: isDragging ? 0 : 1,
    position: "relative",
    zIndex: isDragging ? 0 : "auto",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <IdeaCard idea={idea} {...props} />
    </div>
  );
}

function IdeaCard({
  idea, noteOpen, draftNote, savingNote, isOverlay,
  onReaction, onDelete, onToggleNote, onNoteChange, onNoteSave,
}) {
  return (
    <div
      style={{
        ...ideaCardBase,
        cursor: "grab",
        boxShadow: isOverlay
          ? "0 8px 28px rgba(27,35,27,0.22), 0 2px 8px rgba(27,35,27,0.12)"
          : ideaCardBase.boxShadow,
        transform: isOverlay ? "scale(1.03)" : undefined,
        border: isOverlay
          ? "1.5px solid rgba(183,165,134,0.6)"
          : ideaCardBase.border,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <div style={{ display: "flex", gap: 2, flex: 1 }}>
          {["smile", "neutral", "sad"].map((r) => {
            const active = idea.reaction === r;
            const rc = reactionColors(r);
            return (
              <button
                key={r}
                onClick={() => onReaction(r)}
                aria-label={REACTION_ARIA[r]}
                aria-pressed={active}
                style={{
                  padding: "3px 5px",
                  borderRadius: 6,
                  fontSize: 19,
                  lineHeight: 1,
                  cursor: "pointer",
                  border: active ? `1.5px solid ${rc.border}` : "1.5px solid transparent",
                  background: active ? rc.background : "transparent",
                  opacity: active ? 1 : 0.28,
                  transition: "opacity 0.12s, background 0.12s",
                  outline: "none",
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.opacity = "0.65"; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.opacity = "0.28"; }}
              >
                {REACTION_EMOJIS[r]}
              </button>
            );
          })}
        </div>
        <button
          onClick={onDelete}
          title="Delete idea"
          style={{
            background: "none", border: "none",
            color: "rgba(64,52,38,0.4)", cursor: "pointer",
            fontSize: 17, lineHeight: 1, padding: "0 2px", flexShrink: 0,
          }}
        >
          ×
        </button>
      </div>

      <p style={{ fontSize: 13, color: workspaceBoard.text, lineHeight: 1.55, margin: "0 0 10px" }}>
        {idea.text}
      </p>

      <p style={{ fontSize: 11, color: workspaceBoard.textMuted, margin: "0 0 8px" }}>
        You · {fmtDate(idea.created_at)}
      </p>

      <div style={{ borderTop: "1px solid rgba(183,165,134,0.16)", paddingTop: 8 }}>
        {noteOpen ? (
          <div>
            <textarea
              autoFocus
              value={draftNote}
              onChange={(e) => onNoteChange(e.target.value)}
              onBlur={onNoteSave}
              onPointerDown={(e) => e.stopPropagation()}
              placeholder="Add a note…"
              rows={3}
              style={{
                width: "100%", padding: "6px 8px",
                background: workspaceBoard.card,
                border: "1px solid rgba(183,165,134,0.28)",
                borderRadius: 6,
                color: workspaceBoard.text,
                fontSize: 12, lineHeight: 1.5,
                outline: "none", resize: "vertical",
                fontFamily: "inherit", boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 5 }}>
              <span style={{ fontSize: 10, color: workspaceBoard.textMuted, minHeight: 14 }}>
                {savingNote ? "Saving…" : ""}
              </span>
              <button
                onClick={onToggleNote}
                style={{
                  background: "none", border: "none", padding: "1px 4px",
                  cursor: "pointer", fontSize: 11,
                  color: "var(--brand-bg)", fontWeight: 600,
                }}
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={onToggleNote}
            style={{
              background: "none", border: "none", padding: 0,
              cursor: "pointer", fontSize: 12,
              color: idea.note ? workspaceBoard.text : workspaceBoard.textMuted,
              textAlign: "left", lineHeight: 1.5,
              width: "100%", fontStyle: idea.note ? "normal" : "italic",
              fontFamily: "inherit",
            }}
          >
            {idea.note
              ? (idea.note.length > 60 ? idea.note.slice(0, 60) + "…" : idea.note)
              : "Add note"}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Styles ──

const backLinkStyle = {
  fontSize: 13, color: "var(--color-text-muted)", marginBottom: 20,
  display: "inline-block", textDecoration: "none",
};

const pageTitleStyle = {
  fontFamily: "var(--font-display)",
  fontSize: "clamp(20px, 3vw, 28px)",
  fontWeight: 800,
  letterSpacing: "-0.04em",
  lineHeight: 1.05,
  color: "var(--color-text)",
  margin: 0,
};

const sectionLabelStyle = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.7px",
  textTransform: "uppercase",
  color: "var(--color-text-muted)",
  whiteSpace: "nowrap",
};

const top3CardStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: 8,
  background: workspaceBoard.card,
  border: "1px solid rgba(183,165,134,0.25)",
  borderRadius: 9,
  padding: "9px 12px",
  flex: "1 1 180px",
  minWidth: 160,
  maxWidth: 340,
};

const inputStyle = {
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

const greenBtnStyle = {
  padding: "6px 16px",
  background: "var(--brand-bg)",
  border: "none",
  borderRadius: 7,
  color: "var(--brand-surface-soft)",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  flexShrink: 0,
  whiteSpace: "nowrap",
};

const resetBtnStyle = {
  padding: "5px 12px",
  background: "transparent",
  border: "1px solid rgba(183,165,134,0.35)",
  borderRadius: 7,
  color: "var(--color-text-muted)",
  fontSize: 12,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const ideasGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  gap: 12,
};

const ideaCardBase = {
  background: workspaceBoard.canvas,
  border: "1px solid rgba(183,165,134,0.28)",
  borderRadius: 12,
  padding: "12px 14px",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 2px 8px rgba(27,35,27,0.08)",
};

const dragHandleStyle = {
  background: "none",
  border: "none",
  padding: "0 3px",
  cursor: "grab",
  color: "rgba(64,52,38,0.35)",
  fontSize: 16,
  lineHeight: 1,
  flexShrink: 0,
  touchAction: "none",
  userSelect: "none",
};
