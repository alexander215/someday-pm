/**
 * Shared SomedayPM brand / design system tokens (palette, buttons, nav/footer).
 * Used on public marketing pages and on in-app site pages (About, Blog, Contact)
 * so surfaces stay consistent with the landing visual language.
 */
export const C = {
  canvas: "#f7f5f0",
  white: "#ffffff",
  forest: "#1c2d20",
  forestDeep: "#152119",
  inset: "#ede5d2",
  ink: "#18180f",
  muted: "#6b6454",
  soft: "#8a7e6e",
  yellow: "#f2e79c",
  mustard: "#c49b28",
};

/**
 * Logged-in workspace “board” hierarchy: pale canvas behind cream interactive surfaces.
 * Synced with `--brand-board-canvas` / `--brand-board-inset` in global.css for pure CSS (e.g. .project-card).
 */
export const workspaceBoard = {
  canvas: C.canvas,
  /** Cards, rows, inputs that should read as tappable on a canvas panel */
  card: C.inset,
  /** Nested line inside an inset card (e.g. brainstorm idea row) */
  nestedLine: C.white,
  /** Primary copy on canvas/inset — matches --brand-text-on-inset / --brand-dark (warm charcoal, not black) */
  text: "var(--brand-text-on-inset)",
  /** Secondary labels, hints, counts on canvas/inset — softer than primary, higher contrast than global muted-on-cream */
  textMuted: "var(--brand-text-on-inset-muted)",
};

export const btnPrimary = {
  display: "inline-block",
  padding: "10px 22px",
  background: C.yellow,
  color: C.forest,
  fontFamily: "var(--font-body)",
  fontSize: "14px",
  fontWeight: 700,
  borderRadius: "8px",
  textDecoration: "none",
  border: "none",
  cursor: "pointer",
  letterSpacing: "0.1px",
};

export const btnGhostDark = {
  display: "inline-block",
  padding: "8px 18px",
  background: "transparent",
  color: "rgba(243,231,207,0.75)",
  fontFamily: "var(--font-body)",
  fontSize: "14px",
  fontWeight: 500,
  borderRadius: "8px",
  border: "1px solid rgba(243,231,207,0.2)",
  cursor: "pointer",
  textDecoration: "none",
};

export const navBarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "18px 40px",
  position: "sticky",
  top: 0,
  zIndex: 10,
  background: "rgba(20,34,22,0.88)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
};

export const publicFooterStyle = {
  padding: "28px 40px",
  borderTop: "1px solid rgba(24,24,15,0.07)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: "12px",
  background: C.canvas,
};

export function pillStyle(dark = false) {
  return {
    display: "inline-flex",
    alignItems: "center",
    background: dark ? "rgba(243,231,207,0.12)" : C.yellow,
    color: dark ? "rgba(243,231,207,0.75)" : C.forest,
    fontSize: "10px",
    fontWeight: 700,
    padding: "4px 12px",
    borderRadius: "99px",
    marginBottom: "24px",
    letterSpacing: "0.9px",
    textTransform: "uppercase",
  };
}

export const sectionH2 = {
  fontFamily: "var(--font-display)",
  fontWeight: 800,
  fontSize: "clamp(30px, 4.5vw, 54px)",
  lineHeight: 1.05,
  letterSpacing: "-0.03em",
  marginBottom: "20px",
};
