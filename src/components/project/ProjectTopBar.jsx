import { Link } from "react-router-dom";

export default function ProjectTopBar({ project }) {
  return (
    <div
      style={{
        padding: "24px 28px 0",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        flexShrink: 0,
      }}
    >
      <Link
        to="/"
        style={{
          fontSize: 12,
          color: "var(--brand-text-muted)",
          opacity: 0.65,
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          width: "fit-content",
        }}
      >
        ← All projects
      </Link>
      <h1
        style={{
          fontSize: "1.35rem",
          fontWeight: 700,
          color: "var(--brand-text)",
          letterSpacing: "-0.03em",
          lineHeight: 1.2,
        }}
      >
        {project.title}
      </h1>
    </div>
  );
}
