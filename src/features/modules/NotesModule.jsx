import { useState, useEffect, useRef, useCallback } from "react";
import { getNote, upsertNote } from "../../lib/projectRecords";

const AUTOSAVE_DELAY = 700;

export default function NotesModule({ project, moduleConfig }) {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState("idle");
  const [loaded, setLoaded] = useState(false);
  const saveTimer = useRef(null);
  const lastSaved = useRef("");

  useEffect(() => {
    getNote(project.id, moduleConfig.moduleKey)
      .then((note) => {
        const body = note?.body ?? "";
        setValue(body);
        lastSaved.current = body;
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [project.id, moduleConfig.moduleKey]);

  const save = useCallback(
    async (text) => {
      if (text === lastSaved.current) return;
      setStatus("saving");
      try {
        await upsertNote(project.id, moduleConfig.moduleKey, text);
        lastSaved.current = text;
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 1500);
      } catch {
        setStatus("idle");
      }
    },
    [project.id, moduleConfig.moduleKey]
  );

  function handleChange(e) {
    const text = e.target.value;
    setValue(text);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => save(text), AUTOSAVE_DELAY);
  }

  if (!loaded) {
    return <div style={{ fontSize: 13, color: "var(--brand-text-muted)", opacity: 0.5 }}>Loading…</div>;
  }

  return (
    <div
      style={{
        background: "var(--brand-board-canvas)",
        borderRadius: 12,
        border: "1px solid rgba(183,165,134,0.25)",
        overflow: "hidden",
      }}
    >
      <textarea
        value={value}
        onChange={handleChange}
        placeholder={moduleConfig.emptyState?.description ?? "Start writing…"}
        style={{
          width: "100%",
          minHeight: 140,
          padding: "16px 18px",
          background: "transparent",
          border: "none",
          outline: "none",
          resize: "vertical",
          fontFamily: "var(--font-body)",
          fontSize: 14,
          lineHeight: 1.65,
          color: "var(--brand-text-on-inset)",
          display: "block",
        }}
      />
      <div
        style={{
          padding: "4px 18px 10px",
          fontSize: 11,
          color: "var(--brand-text-on-inset-muted)",
          opacity: status === "idle" ? 0 : 0.65,
          transition: "opacity 0.2s",
          minHeight: 22,
        }}
      >
        {status === "saving" ? "Saving…" : status === "saved" ? "Saved" : ""}
      </div>
    </div>
  );
}
