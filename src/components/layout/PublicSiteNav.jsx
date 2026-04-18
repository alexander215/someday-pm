import { Link } from "react-router-dom";
import { btnGhostDark, btnPrimary, navBarStyle } from "../../lib/brandTokens";

const linkRest = {
  fontSize: "14px",
  fontWeight: 500,
  color: "rgba(243,231,207,0.78)",
  textDecoration: "none",
  padding: "6px 4px",
  borderBottom: "1px solid transparent",
};

/**
 * Public site navigation — sticky forest glass bar.
 * @param {object} props
 * @param {boolean} [props.showMemberLogin=true] — link to passwordless /login (invite-only)
 */
export default function PublicSiteNav({ showMemberLogin = true }) {
  return (
    <nav style={navBarStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: "28px", flexWrap: "wrap" }}>
        <Link
          to="/"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "18px",
            color: "#f3e7cf",
            letterSpacing: "-0.3px",
            textDecoration: "none",
          }}
        >
          SomedayPM
        </Link>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            flexWrap: "wrap",
          }}
        >
          <Link to="/" style={linkRest}>
            Home
          </Link>
          <Link to="/about" style={linkRest}>
            About
          </Link>
          <Link to="/blog" style={linkRest}>
            Blog
          </Link>
          <Link to="/contact" style={linkRest}>
            Contact
          </Link>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
        {showMemberLogin && (
          <Link to="/login" style={{ ...btnGhostDark, fontSize: "14px", padding: "7px 16px" }}>
            Member log in
          </Link>
        )}
        <Link to="/beta" style={btnPrimary}>
          Request beta access
        </Link>
      </div>
    </nav>
  );
}
