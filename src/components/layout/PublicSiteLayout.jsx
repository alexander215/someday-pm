import PublicSiteNav from "./PublicSiteNav";
import { C, publicFooterStyle } from "../../lib/brandTokens";

/**
 * @param {object} props
 * @param {import('react').ReactNode} props.children
 * @param {boolean} [props.showMemberLogin=true]
 */
export default function PublicSiteLayout({ children, showMemberLogin = true }) {
  return (
    <div
      style={{
        background: C.canvas,
        color: C.ink,
        fontFamily: "var(--font-body)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <PublicSiteNav showMemberLogin={showMemberLogin} />
      <div style={{ flex: 1 }}>{children}</div>
      <footer style={publicFooterStyle}>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            color: C.forest,
            fontSize: "15px",
          }}
        >
          SomedayPM
        </span>
        <span style={{ fontSize: "13px", color: C.soft }}>
          Built for the ideas you&apos;ll get to someday.
        </span>
      </footer>
    </div>
  );
}
