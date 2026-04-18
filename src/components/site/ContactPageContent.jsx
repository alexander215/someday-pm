import { C, btnPrimary } from "../../lib/brandTokens";
import { LINKEDIN_PROFILE_URL } from "../../lib/siteConfig";

/**
 * @param {object} props
 * @param {'public' | 'app'} props.variant
 */
export default function ContactPageContent({ variant = "public" }) {
  const isApp = variant === "app";

  const panelStyle = isApp
    ? {
        background: C.inset,
        border: "1px solid rgba(24,24,15,0.1)",
        borderRadius: "20px",
        padding: "40px 36px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.32)",
      }
    : {
        background: C.inset,
        border: "1px solid rgba(24,24,15,0.07)",
        borderRadius: "20px",
        padding: "48px 44px",
        boxShadow: "0 8px 32px rgba(24,24,15,0.06)",
      };

  const headingColor = C.ink;
  const bodyColor = C.muted;
  const sectionBg = isApp ? "transparent" : C.white;

  return (
    <div style={isApp ? { color: C.ink } : {}}>
      {!isApp && (
        <section
          style={{
            background: `linear-gradient(160deg, ${C.forest} 0%, ${C.forestDeep} 100%)`,
            padding: "56px 40px 40px",
          }}
        >
          <div style={{ maxWidth: "640px", margin: "0 auto" }}>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "clamp(32px, 4.5vw, 44px)",
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                color: "#f3e7cf",
                marginBottom: "14px",
              }}
            >
              Contact
            </h1>
            <p
              style={{
                fontSize: "16px",
                color: "rgba(243,231,207,0.72)",
                lineHeight: 1.75,
                maxWidth: "520px",
              }}
            >
              The best way to reach me right now is LinkedIn — I&apos;m happy to hear from
              you about SomedayPM, side projects, or beta access.
            </p>
          </div>
        </section>
      )}

      {isApp && (
        <div style={{ marginBottom: "22px" }}>
          <p
            style={{
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.6px",
              textTransform: "uppercase",
              color: "rgba(244,234,214,.55)",
              marginBottom: "10px",
            }}
          >
            Contact
          </p>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "clamp(1.6rem, 3vw, 2rem)",
              letterSpacing: "-0.03em",
              color: "var(--brand-text)",
              marginBottom: "10px",
            }}
          >
            Get in touch
          </h1>
          <p style={{ fontSize: "15px", color: "rgba(244,234,214,.75)", lineHeight: 1.7 }}>
            I don&apos;t use a contact form yet — LinkedIn is the best place to reach me
            about SomedayPM, feedback, or side projects.
          </p>
        </div>
      )}

      <section
        style={{
          background: sectionBg,
          padding: isApp ? "0 0 8px" : "56px 40px 80px",
        }}
      >
        <div style={{ maxWidth: "640px", margin: "0 auto" }}>
          <div style={panelStyle}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "clamp(22px, 2.5vw, 28px)",
                letterSpacing: "-0.03em",
                color: headingColor,
                marginBottom: "16px",
              }}
            >
              {isApp ? "Message me on LinkedIn" : "Say hello on LinkedIn"}
            </h2>
            <p
              style={{
                fontSize: "16px",
                color: bodyColor,
                lineHeight: 1.85,
                marginBottom: "12px",
              }}
            >
              {isApp
                ? "For product questions, feedback, or beta interest, send a LinkedIn message. I read what comes through and I am open to real conversations about SomedayPM and how you work on side projects."
                : "I do not have a dedicated inbox for SomedayPM yet — so for now, LinkedIn is the simplest way to reach me. Whether you are curious about the beta, have feedback, or want to talk side projects, I am glad to hear from you."}
            </p>
            <p
              style={{
                fontSize: "15px",
                color: C.soft,
                lineHeight: 1.75,
                marginBottom: "28px",
              }}
            >
              Connection requests with a short note work great — a bit of context helps
              me respond.
            </p>
            <a
              href={LINKEDIN_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                ...btnPrimary,
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "15px",
                padding: "13px 26px",
              }}
            >
              <LinkedInIcon />
              Open LinkedIn profile
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
