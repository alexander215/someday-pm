import { Link } from "react-router-dom";
import { C } from "../lib/brandTokens";

/**
 * Branded empty state with optional routed or click actions.
 * @param {object} props
 * @param {'hero' | 'panel' | 'compact' | 'marketing'} [props.variant='hero']
 * @param {string} [props.kicker]
 * @param {string} props.title
 * @param {string} [props.description]
 * @param {{ label: string, to?: string, onClick?: () => void }} [props.primaryAction]
 * @param {{ label: string, to?: string, onClick?: () => void }} [props.secondaryAction]
 * @param {string} [props.icon] — single emoji or short character (optional)
 */
export default function BrandEmptyState({
  variant = "hero",
  kicker,
  title,
  description,
  primaryAction,
  secondaryAction,
  icon,
}) {
  const isPanel = variant === "panel";
  const isCompact = variant === "compact";
  const isMarketing = variant === "marketing";
  const wrap = {
    border: isPanel
      ? "1px dashed rgba(183,165,134,0.35)"
      : isCompact
        ? "1.5px dashed rgba(243,231,207,0.2)"
        : isMarketing
          ? `1px dashed rgba(28,45,32,0.15)`
          : "1.5px dashed rgba(243,231,207,0.2)",
    borderRadius: isPanel || isCompact ? 10 : isMarketing ? 16 : 16,
    padding: isCompact ? "14px 16px" : isPanel ? "18px 16px" : isMarketing ? "28px 24px" : "36px 32px",
    background: isPanel
      ? "rgba(243,231,207,0.04)"
      : isCompact
        ? "transparent"
        : isMarketing
          ? C.inset
          : "transparent",
    display: "flex",
    flexDirection: "column",
    alignItems: isPanel || isCompact ? "stretch" : "flex-start",
    gap: isCompact ? 8 : 12,
    textAlign: "left",
  };

  const titleStyle = {
    fontFamily: "var(--font-display)",
    fontSize: isCompact ? 14 : isPanel ? 15 : isMarketing ? 18 : "clamp(1.25rem, 2.5vw, 1.75rem)",
    fontWeight: 700,
    letterSpacing: "-0.03em",
    color: isPanel ? "var(--brand-dark)" : isMarketing ? C.ink : "var(--brand-text)",
    margin: 0,
    lineHeight: 1.2,
  };

  const descStyle = {
    fontSize: isCompact ? 12 : isPanel ? 13 : isMarketing ? 14 : 14,
    color: isPanel ? "var(--brand-text-dark-muted)" : isMarketing ? C.muted : "rgba(243,231,207,0.62)",
    margin: 0,
    lineHeight: 1.65,
    maxWidth: isPanel ? "none" : isCompact ? 520 : isMarketing ? 480 : 420,
  };

  const kickerStyle = {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.65px",
    textTransform: "uppercase",
    color: isMarketing ? C.forest : "var(--brand-accent-yellow)",
    margin: 0,
  };

  return (
    <div style={wrap}>
      {icon && (
        <div
          style={{
            fontSize: isCompact ? 22 : 28,
            lineHeight: 1,
            marginBottom: isCompact ? 0 : 4,
            opacity: 0.92,
          }}
          aria-hidden
        >
          {icon}
        </div>
      )}
      {kicker && <p style={kickerStyle}>{kicker}</p>}
      <h3 style={titleStyle}>{title}</h3>
      {description && <p style={descStyle}>{description}</p>}
      {(primaryAction || secondaryAction) && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            marginTop: isCompact ? 4 : 8,
            alignItems: "center",
          }}
        >
          {primaryAction && <ActionChip action={primaryAction} primary marketing={isMarketing} />}
          {secondaryAction && <ActionChip action={secondaryAction} marketing={isMarketing} />}
        </div>
      )}
    </div>
  );
}

function ActionChip({ action, primary, marketing }) {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 600,
    padding: "8px 14px",
    borderRadius: 8,
    textDecoration: "none",
    cursor: "pointer",
    border: "none",
    fontFamily: "inherit",
  };
  const primaryStyle = marketing
    ? {
        ...base,
        background: C.yellow,
        color: C.forest,
      }
    : {
        ...base,
        background: "var(--brand-bg)",
        color: "var(--brand-surface-soft)",
      };
  const ghostStyle = marketing
    ? {
        ...base,
        background: "transparent",
        color: C.forest,
        border: `1px solid rgba(28,45,32,0.22)`,
      }
    : {
        ...base,
        background: "transparent",
        color: "var(--brand-bg)",
        border: "1px solid rgba(28,45,32,0.25)",
      };
  const style = primary ? primaryStyle : ghostStyle;

  if (action.to) {
    return (
      <Link to={action.to} style={style}>
        {action.label}
      </Link>
    );
  }
  return (
    <button type="button" onClick={action.onClick} style={style}>
      {action.label}
    </button>
  );
}
