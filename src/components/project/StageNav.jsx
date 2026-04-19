import { useNavigate } from "react-router-dom";

export default function StageNav({ projectId, stages, activeStageKey }) {
  const navigate = useNavigate();

  return (
    <nav
      style={{
        width: 192,
        flexShrink: 0,
        padding: "32px 0 32px 24px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--brand-text-muted)",
          opacity: 0.6,
          marginBottom: 20,
        }}
      >
        Stages
      </span>

      {stages.map((stage, i) => {
        const isActive = stage.stageKey === activeStageKey;
        const isLast = i === stages.length - 1;

        return (
          <div key={stage.stageKey} style={{ display: "flex", flexDirection: "column" }}>
            <button
              onClick={() => navigate(`/project/${projectId}/${stage.stageKey}`)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "2px 0",
                textAlign: "left",
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: isActive ? "var(--brand-accent-yellow)" : "transparent",
                  border: isActive
                    ? "2px solid var(--brand-accent-yellow)"
                    : "2px solid rgba(243,231,207,0.3)",
                  boxShadow: isActive ? "0 0 0 3px rgba(242,231,156,0.12)" : "none",
                  transition: "all 0.15s ease",
                }}
              />
              <span
                style={{
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 400,
                  color: isActive ? "var(--brand-text)" : "var(--brand-text-muted)",
                  letterSpacing: isActive ? "-0.01em" : 0,
                  transition: "color 0.15s, font-weight 0.1s",
                }}
              >
                {stage.label}
              </span>
            </button>

            {!isLast && (
              <div
                style={{
                  width: 2,
                  height: 22,
                  marginLeft: 4,
                  background: "rgba(243,231,207,0.14)",
                  flexShrink: 0,
                }}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
