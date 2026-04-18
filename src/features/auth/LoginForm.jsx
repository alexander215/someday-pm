import { useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "./useAuth";

/**
 * Passwordless email OTP — invite-only (shouldCreateUser: false in AuthProvider).
 * @param {object} props
 * @param {'modal' | 'page'} [props.variant='modal']
 * @param {() => void} props.onSuccess — after verifyOtp succeeds
 * @param {() => void} [props.onCancel] — modal dismiss (variant modal)
 */
export default function LoginForm({ variant = "modal", onSuccess, onCancel }) {
  const { sendOtp, verifyOtp } = useAuth();

  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSendOtp(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: err } = await sendOtp(email.trim());
      if (err) {
        const msg = err.message?.toLowerCase() ?? "";
        if (msg.includes("signups not allowed") || msg.includes("signup")) {
          setError(
            "This email isn’t on the invite list yet. Request access and we’ll follow up when there’s a spot."
          );
        } else {
          setError(err.message);
        }
        return;
      }
      setStep("otp");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: err } = await verifyOtp(email.trim(), token.trim());
      if (err) {
        const msg = err.message?.toLowerCase() ?? "";
        if (msg.includes("token") || msg.includes("expired")) {
          setError("Invalid or expired code. Request a new code from the previous step.");
        } else {
          setError(err.message);
        }
        return;
      }
      onSuccess();
    } finally {
      setLoading(false);
    }
  }

  const isPage = variant === "page";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: isPage ? 24 : 0 }}>
      <div style={{ marginBottom: isPage ? 0 : 28 }}>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: isPage ? 24 : 20,
            color: "var(--brand-dark)",
            letterSpacing: "-0.2px",
            display: "block",
            marginBottom: "8px",
          }}
        >
          SomedayPM
        </span>
        <p
          style={{
            fontSize: 14,
            color: "var(--brand-text-dark-muted)",
            margin: 0,
            lineHeight: 1.65,
          }}
        >
          {isPage ? (
            <>
              <strong style={{ color: "var(--brand-dark)" }}>Invite-only beta.</strong>{" "}
              Sign in with the email that was approved — we&apos;ll send a one-time code. No password, no
              public signup.
            </>
          ) : step === "email" ? (
            <>
              Use the email on your invite. We&apos;ll send a one-time code — no password.
            </>
          ) : (
            <>Check your inbox — an 8-digit code was sent to {email}</>
          )}
        </p>
        {isPage && (
          <p style={{ fontSize: 13, color: "var(--brand-text-dark-muted)", margin: "12px 0 0", lineHeight: 1.6 }}>
            Not on the list?{" "}
            <Link to="/beta" style={{ color: "var(--brand-bg)", fontWeight: 600 }}>
              Request beta access
            </Link>
            .
          </p>
        )}
      </div>

      {step === "email" && (
        <form onSubmit={handleSendOtp} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--brand-text-dark-muted)" }}>
            Email
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            disabled={loading}
            autoComplete="email"
            style={inputStyle}
          />
          {error && <p style={errorStyle}>{error}</p>}
          <button
            type="submit"
            disabled={loading || !email.trim()}
            style={{ ...btnPrimary, opacity: loading || !email.trim() ? 0.6 : 1 }}
          >
            {loading ? "Sending…" : "Email me a code"}
          </button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={handleVerifyOtp} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--brand-text-dark-muted)" }}>
            One-time code
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="8-digit code"
            value={token}
            onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 8))}
            required
            autoFocus
            disabled={loading}
            autoComplete="one-time-code"
            style={{
              ...inputStyle,
              letterSpacing: "0.15em",
              fontSize: 20,
              textAlign: "center",
            }}
          />
          {error && <p style={errorStyle}>{error}</p>}
          <button
            type="submit"
            disabled={loading || token.length < 8}
            style={{ ...btnPrimary, opacity: loading || token.length < 8 ? 0.6 : 1 }}
          >
            {loading ? "Verifying…" : "Verify and sign in"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setToken("");
              setError(null);
            }}
            disabled={loading}
            style={btnBack}
          >
            ← Use a different email
          </button>
        </form>
      )}

      {!isPage && onCancel && (
        <button
          type="button"
          onClick={onCancel}
          style={{
            marginTop: 20,
            background: "none",
            border: "none",
            color: "var(--brand-text-dark-muted)",
            fontSize: 13,
            cursor: "pointer",
            padding: 0,
            display: "block",
            width: "100%",
            textAlign: "center",
          }}
        >
          Cancel
        </button>
      )}

      {isPage && (
        <p style={{ fontSize: 13, color: "var(--brand-text-dark-muted)", margin: 0, textAlign: "center" }}>
          <Link to="/" style={{ color: "var(--brand-bg)", fontWeight: 600 }}>
            ← Back to home
          </Link>
        </p>
      )}
    </div>
  );
}

const inputStyle = {
  padding: "10px 14px",
  background: "var(--brand-surface)",
  border: "1px solid var(--brand-border-light)",
  borderRadius: "8px",
  color: "var(--brand-dark)",
  fontSize: "15px",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

const btnPrimary = {
  padding: "11px 20px",
  background: "var(--brand-bg)",
  border: "none",
  borderRadius: "8px",
  color: "var(--brand-surface-soft)",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
  width: "100%",
  transition: "opacity 0.15s",
};

const btnBack = {
  background: "none",
  border: "none",
  color: "var(--brand-text-dark-muted)",
  fontSize: "13px",
  cursor: "pointer",
  padding: "4px 0",
  textAlign: "left",
};

const errorStyle = {
  color: "#b45309",
  fontSize: "13px",
  margin: 0,
  lineHeight: 1.5,
};
