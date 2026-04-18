import { Link } from "react-router-dom";
import { C, btnPrimary, pillStyle, sectionH2 } from "../../lib/brandTokens";

/**
 * @param {object} props
 * @param {'public' | 'app'} props.variant
 */
export default function AboutPageContent({ variant = "public" }) {
  const isApp = variant === "app";

  if (isApp) {
    return (
      <div style={{ color: "var(--brand-text)" }}>
        <p
          style={{
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "0.6px",
            textTransform: "uppercase",
            color: "rgba(244,234,214,.55)",
            marginBottom: "12px",
          }}
        >
          About SomedayPM
        </p>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            marginBottom: "20px",
            color: "var(--brand-text)",
          }}
        >
          Calm structure for ideas that matter on your timeline.
        </h1>
        <AppBody />
        <div
          style={{
            marginTop: "36px",
            padding: "22px 24px",
            borderRadius: "16px",
            background: "rgba(0,0,0,.2)",
            border: "1px solid var(--brand-border)",
          }}
        >
          <p style={{ fontSize: "14px", color: "rgba(244,234,214,.75)", marginBottom: "12px" }}>
            Want early access or have questions?
          </p>
          <Link
            to="/beta"
            style={{
              ...btnPrimary,
              fontSize: "14px",
              padding: "10px 20px",
            }}
          >
            Request beta access
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <section
        style={{
          background: `linear-gradient(160deg, ${C.forest} 0%, ${C.forestDeep} 100%)`,
          padding: "72px 40px 64px",
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={pillStyle(true)}>About</div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "clamp(36px, 5vw, 52px)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              color: "#f3e7cf",
              marginBottom: "20px",
            }}
          >
            Someday isn&apos;t a deadline.
            <br />
            <span style={{ color: C.yellow }}>It&apos;s permission.</span>
          </h1>
          <p
            style={{
              fontSize: "17px",
              color: "rgba(243,231,207,0.72)",
              lineHeight: 1.75,
              maxWidth: "560px",
            }}
          >
            SomedayPM is a quiet workspace for side projects — the kind that compete
            with real life for attention, not with your day job for status reports.
          </p>
        </div>
      </section>

      <section style={{ background: C.white, padding: "72px 40px" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <h2 style={{ ...sectionH2, fontSize: "clamp(24px, 3vw, 36px)", marginBottom: "24px" }}>
            <span style={{ color: C.ink }}>Philosophy</span>
          </h2>
          <PublicPhilosophyBlocks />
        </div>
      </section>

      <section style={{ background: C.canvas, padding: "72px 40px" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <h2 style={{ ...sectionH2, fontSize: "clamp(24px, 3vw, 36px)", marginBottom: "20px" }}>
            <span style={{ color: C.ink }}>The brand</span>
          </h2>
          <p style={{ fontSize: "16px", color: C.muted, lineHeight: 1.85, marginBottom: "16px" }}>
            Deep forest greens, warm cream surfaces, and yellow accents that feel like
            sunlight — not alarms. We borrow from editorial design: generous type,
            soft glass panels, and language that skips guilt.
          </p>
          <p style={{ fontSize: "16px", color: C.muted, lineHeight: 1.85 }}>
            If work tools are built for throughput, SomedayPM is built for return visits:
            picking up where you left off without a lecture on what you didn&apos;t ship.
          </p>
        </div>
      </section>

      <section style={{ background: C.white, padding: "72px 40px" }}>
        <div
          style={{
            maxWidth: "720px",
            margin: "0 auto",
            background: C.inset,
            borderRadius: "20px",
            padding: "40px 36px",
            border: "1px solid rgba(24,24,15,0.07)",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "clamp(22px, 2.5vw, 30px)",
              color: C.ink,
              marginBottom: "12px",
              letterSpacing: "-0.03em",
            }}
          >
            Help shape this
          </h2>
          <p style={{ fontSize: "15px", color: C.muted, lineHeight: 1.8, marginBottom: "20px" }}>
            We&apos;re in private beta with a small group. If SomedayPM sounds like your
            kind of slow, steady tool, we&apos;d love to hear from you.
          </p>
          <Link to="/beta" style={{ ...btnPrimary, fontSize: "15px", padding: "12px 24px" }}>
            Request beta access
          </Link>
        </div>
      </section>
    </div>
  );
}

function PublicPhilosophyBlocks() {
  const items = [
    {
      title: "Side projects are not mini startups",
      body: "They don't need velocity charts. They need a place to breathe — a little structure so nothing gets lost, without turning your hobby into performance.",
    },
    {
      title: "Progress without panic",
      body: "SomedayPM is opinionated about tone: no red-alert language, no shame for quiet weeks. The interface meets you where your energy actually is.",
    },
    {
      title: "Yours, not the team's",
      body: "No standups, no assignees, no borrowed enterprise metaphors. Just your projects, your cards, and a workspace that still feels personal when you come back after a month away.",
    },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {items.map(({ title, body }) => (
        <div
          key={title}
          style={{
            paddingLeft: "18px",
            borderLeft: `3px solid ${C.mustard}`,
          }}
        >
          <h3
            style={{
              fontSize: "17px",
              fontWeight: 700,
              color: C.ink,
              marginBottom: "8px",
            }}
          >
            {title}
          </h3>
          <p style={{ fontSize: "15px", color: C.muted, lineHeight: 1.8 }}>{body}</p>
        </div>
      ))}
    </div>
  );
}

function AppBody() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "18px",
        fontSize: "15px",
        lineHeight: 1.8,
        color: "rgba(244,234,214,.78)",
      }}
    >
      <p>
        SomedayPM exists for side projects: the ones that matter emotionally, not just
        on a roadmap. The name is deliberate — &quot;someday&quot; isn&apos;t procrastination
        here; it&apos;s the realistic horizon most passion work lives on.
      </p>
      <p>
        The product gives you gentle structure (projects, cards, notes) without the
        surveillance culture of workplace tools. Language and visuals stay calm:
        forest greens, cream surfaces, yellow highlights that read as warmth, not
        warning.
      </p>
      <p>
        We believe your hobby deserves a system that respects your pace — one that
        remembers context, not guilt.
      </p>
    </div>
  );
}
