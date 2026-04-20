import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getBrainstormBoardsForProject,
  createBrainstormBoard,
  deleteBrainstormBoard,
} from "../../lib/brainstorm";
import BrandEmptyState from "../../components/BrandEmptyState";

export default function BrainstormModule({ project, stageKey, moduleConfig }) {
  const [boards, setBoards] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    getBrainstormBoardsForProject(project.id, moduleConfig.moduleKey)
      .then((data) => {
        setBoards(data);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [project.id, moduleConfig.moduleKey]);

  async function handleCreate(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const board = await createBrainstormBoard({
        projectId: project.id,
        moduleKey: moduleConfig.moduleKey,
        title: newTitle.trim(),
      });
      setBoards((prev) => [...prev, board]);
      setNewTitle("");
      setShowInput(false);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(boardId) {
    setBoards((prev) => prev.filter((b) => b.id !== boardId));
    await deleteBrainstormBoard(boardId).catch(() => {});
  }

  if (!loaded) {
    return <div style={{ fontSize: 13, color: "var(--brand-text-muted)", opacity: 0.5 }}>Loading…</div>;
  }

  const boardLink = (boardId) =>
    `/project/${project.id}/${stageKey}/brainstorm/${boardId}`;

  return (
    <div>
      {boards.length === 0 && !showInput && (
        <BrandEmptyState
          variant="panel"
          icon={moduleConfig.emptyState?.icon}
          title={moduleConfig.emptyState?.title ?? "No brainstorm boards yet"}
          description={moduleConfig.emptyState?.description}
          primaryAction={{ label: "New board", onClick: () => setShowInput(true) }}
        />
      )}

      {boards.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
          {boards.map((board) => (
            <div
              key={board.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                background: "var(--brand-board-inset)",
                borderRadius: 10,
                padding: "12px 16px",
                border: "1px solid rgba(183,165,134,0.3)",
              }}
            >
              <Link
                to={boardLink(board.id)}
                style={{
                  flex: 1,
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--brand-text-on-inset)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ opacity: 0.55, fontSize: 15 }}>💡</span>
                {board.title}
              </Link>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <Link
                  to={boardLink(board.id)}
                  style={{
                    fontSize: 12,
                    padding: "4px 10px",
                    borderRadius: 6,
                    border: "1px solid rgba(64,57,47,0.2)",
                    background: "transparent",
                    color: "var(--brand-text-on-inset-muted)",
                    display: "inline-block",
                    whiteSpace: "nowrap",
                  }}
                >
                  Open →
                </Link>
                <DeleteBtn onClick={() => handleDelete(board.id)} />
              </div>
            </div>
          ))}
        </div>
      )}

      {showInput ? (
        <form
          onSubmit={handleCreate}
          style={{
            display: "flex",
            gap: 8,
            background: "var(--brand-board-canvas)",
            border: "1px solid rgba(183,165,134,0.3)",
            borderRadius: 10,
            padding: "10px 14px",
            alignItems: "center",
          }}
        >
          <input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Board name…"
            disabled={creating}
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
          <button
            type="submit"
            disabled={creating || !newTitle.trim()}
            style={{
              padding: "5px 12px",
              borderRadius: 6,
              background: "var(--brand-accent-mustard)",
              border: "none",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: newTitle.trim() ? "pointer" : "default",
              opacity: newTitle.trim() ? 1 : 0.4,
              whiteSpace: "nowrap",
            }}
          >
            Create
          </button>
          <button
            type="button"
            onClick={() => { setShowInput(false); setNewTitle(""); }}
            style={{
              padding: "5px 10px",
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
        </form>
      ) : boards.length > 0 ? (
        <button
          onClick={() => setShowInput(true)}
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
          + New board
        </button>
      ) : null}
    </div>
  );
}

function DeleteBtn({ onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      aria-label="Delete board"
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
