export default function HowToUseModal({ onClose }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(27,35,27,0.55)",
        zIndex: 60,
        backdropFilter: "blur(2px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          width: 540,
          maxHeight: "80vh",
          overflowY: "auto",
          borderRadius: 14,
          background: "var(--brand-surface-soft)",
          border: "1px solid rgba(183,165,134,0.35)",
          boxShadow: "0 20px 60px rgba(27,35,27,0.35)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 22px",
            borderBottom: "1px solid rgba(183,165,134,0.25)",
            background: "var(--brand-surface)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                fontWeight: 700,
                color: "var(--brand-dark)",
                fontSize: 17,
                fontFamily: "var(--font-display)",
              }}
            >
              How to Use SomedayPM
            </div>
            <div style={{ color: "var(--brand-text-dark-muted)", fontSize: 13, marginTop: 3 }}>
              A quick guide to getting the most out of your workspace
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--brand-text-dark-muted)",
              fontSize: 20,
              cursor: "pointer",
              lineHeight: 1,
              padding: "0 2px",
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "22px 22px 24px" }}>
          {[
            {
              label: "Projects",
              body:
                "A Project is the top-level thing you're working on or thinking about — a goal, initiative, or idea. Give it a title, a category (Career, Side Project, Personal, etc.), and optional notes and a due date.",
            },
            {
              label: "Task Cards",
              body:
                "Inside a project, Task Cards break the work into named steps or workstreams. Each task card has its own detail page with notes, a to-do checklist, and file attachments. Use them to track discrete pieces of work.",
            },
            {
              label: "To-Do",
              body:
                "Each project and task card has a To-Do list for small checklist items — things that need to happen but don't warrant a full card. Check them off as you go.",
            },
            {
              label: "Brainstorm",
              body:
                "Brainstorm is for capturing ideas before you're ready to commit. Create named topic cards (e.g. \"Name Ideas\", \"Possible Approaches\") and add ideas inside each one. Score ideas 1–10 to rank them later.",
            },
            {
              label: "Background",
              body:
                "A free-form area for reference notes, links, and context that doesn't fit anywhere else — coming soon.",
            },
            {
              label: "Recommended flow",
              body:
                "Start by creating a Project. Add Task Cards to break it into workstreams. Use To-Do for quick checklist items. Open Brainstorm when you're exploring options and not ready to decide. Add files and background notes as context builds up.",
            },
          ].map(({ label, body }) => (
            <div
              key={label}
              style={{
                marginBottom: 18,
                paddingBottom: 18,
                borderBottom: "1px solid rgba(183,165,134,0.18)",
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  color: "var(--brand-dark)",
                  fontSize: 14,
                  marginBottom: 5,
                  fontFamily: "var(--font-display)",
                }}
              >
                {label}
              </div>
              <div
                style={{
                  color: "var(--brand-text-dark-muted)",
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                {body}
              </div>
            </div>
          ))}

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
            <button
              onClick={onClose}
              style={{
                padding: "7px 20px",
                borderRadius: 7,
                background: "var(--brand-bg)",
                color: "var(--brand-surface-soft)",
                border: "none",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
