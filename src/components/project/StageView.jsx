import ModuleRenderer from "./ModuleRenderer";

export default function StageView({ project, stageConfig }) {
  return (
    <div
      style={{
        padding: "28px 28px 64px",
        maxWidth: 860,
        width: "100%",
      }}
    >
      <div style={{ marginBottom: 32 }}>
        <h2
          style={{
            fontSize: "1.1rem",
            fontWeight: 700,
            color: "var(--brand-text)",
            letterSpacing: "-0.02em",
            marginBottom: 5,
          }}
        >
          {stageConfig.label}
        </h2>
        <p
          style={{
            fontSize: 13,
            color: "var(--brand-text-muted)",
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {stageConfig.description}
        </p>
      </div>

      {stageConfig.modules.map((moduleConfig) => (
        <ModuleRenderer
          key={moduleConfig.moduleKey}
          project={project}
          stageKey={stageConfig.stageKey}
          moduleConfig={moduleConfig}
        />
      ))}
    </div>
  );
}
