import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useAuth from "../features/auth/useAuth";
import LoginModal from "../features/auth/LoginModal";
import AppShell from "../components/AppShell";
import { getRootCards, createRootCard, ROOT_CATEGORIES } from "../lib/cards";

export default function HomePage() {
  const { user, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  if (loading) {
    return (
      <div
        style={{
          padding: "48px 32px",
          color: "var(--color-text-muted)",
          fontSize: "14px",
        }}
      >
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <MarketingPage onSignIn={() => setShowLogin(true)} />
        {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      </>
    );
  }

  return (
    <AppShell>
      <Dashboard user={user} />
    </AppShell>
  );
}

// ─────────────────────────────────────────────
// Logged-out marketing homepage
// ─────────────────────────────────────────────

function MarketingPage({ onSignIn }) {
  function scrollToVibe(e) {
    e.preventDefault();
    document.getElementById("vibe")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div
      style={{
        background: "var(--brand-bg)",
        color: "var(--brand-text)",
        fontFamily: "var(--font-body)",
        minHeight: "100vh",
      }}
    >
      {/* ── Nav ── */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 40px",
          borderBottom: "1px solid var(--brand-border-light)",
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "rgba(35, 61, 43, 0.94)",
          backdropFilter: "blur(10px)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "20px",
            color: "var(--brand-surface)",
            letterSpacing: "-0.2px",
          }}
        >
          SomedayPM
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            onClick={onSignIn}
            style={{ ...btnGhost, fontSize: "14px", padding: "7px 16px" }}
          >
            Sign in
          </button>
          <Link to="/beta" style={btnPrimary}>
            Request beta access
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "80px 40px 72px",
          display: "flex",
          gap: "64px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: "1 1 400px", maxWidth: "560px" }}>
          <div
            style={{
              display: "inline-block",
              background: "var(--brand-accent-yellow)",
              color: "var(--brand-dark)",
              fontSize: "11px",
              fontWeight: 600,
              padding: "4px 12px",
              borderRadius: "99px",
              marginBottom: "28px",
              letterSpacing: "0.7px",
              textTransform: "uppercase",
            }}
          >
            Private beta
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "clamp(38px, 6vw, 64px)",
              lineHeight: 1.05,
              marginBottom: "22px",
              color: "var(--brand-surface-soft)",
              letterSpacing: "-0.5px",
            }}
          >
            Project Management
            <br />
            for Side Projects
          </h1>
          <p
            style={{
              fontSize: "18px",
              color: "var(--brand-text-muted)",
              fontWeight: 400,
              marginBottom: "16px",
              lineHeight: 1.6,
            }}
          >
            A calm, focused tool for keeping your ideas moving — without the
            pressure of work tools.
          </p>
          <p
            style={{
              fontSize: "15px",
              color: "var(--brand-text-muted)",
              lineHeight: 1.9,
              marginBottom: "40px",
              opacity: 0.75,
            }}
          >
            Side projects start with a spark. SomedayPM gives them just enough
            structure to stay alive, without turning them into a second job.
          </p>
          <div
            style={{
              display: "flex",
              gap: "14px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Link
              to="/beta"
              style={{ ...btnPrimary, fontSize: "15px", padding: "12px 26px" }}
            >
              Request beta access
            </Link>
            <a
              href="#vibe"
              onClick={scrollToVibe}
              style={{
                fontSize: "15px",
                color: "var(--brand-text-muted)",
                fontWeight: 500,
                textDecoration: "none",
                borderBottom: "1px solid var(--brand-border-light)",
                paddingBottom: "1px",
              }}
            >
              View the vibe ↓
            </a>
          </div>
        </div>

        {/* Hero mockup placeholder */}
        {/* TODO: Replace this placeholder with a real product screenshot once the app UI is polished */}
        <div
          style={{
            flex: "1 1 300px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <MockupProjectList />
        </div>
      </section>

      {/* ── Problem / Why ── */}
      <section
        style={{ background: "var(--brand-bg-deep)", padding: "80px 40px" }}
      >
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "clamp(26px, 4vw, 42px)",
              marginBottom: "52px",
              lineHeight: 1.15,
              color: "var(--brand-accent-yellow)",
            }}
          >
            Side projects shouldn't feel like
            <br />
            status meetings
          </h2>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "32px",
              marginBottom: "48px",
            }}
          >
            {[
              {
                label: "You start excited, then stall",
                text: "A blank page with no clear next step. The momentum fades before you even begin.",
              },
              {
                label: "Work tools work against you",
                text: "Deadlines, red flags, overdue banners — built for teams, not for Tuesday nights with a good idea.",
              },
              {
                label: "Notes scatter, progress disappears",
                text: "Sticky notes, random docs, half-finished threads. You have context everywhere and a view of nothing.",
              },
            ].map(({ label, text }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  gap: "24px",
                  alignItems: "flex-start",
                  borderLeft: "2px solid var(--brand-accent-yellow)",
                  paddingLeft: "20px",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "var(--brand-text-muted)",
                      marginBottom: "6px",
                    }}
                  >
                    {label}
                  </p>
                  <p
                    style={{
                      fontSize: "15px",
                      lineHeight: 1.75,
                      color: "rgba(243, 231, 207, 0.75)",
                    }}
                  >
                    {text}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p
            style={{
              fontSize: "17px",
              fontWeight: 500,
              color: "var(--brand-surface)",
              lineHeight: 1.7,
            }}
          >
            SomedayPM keeps everything together without turning your hobby into
            a second job.
          </p>
        </div>
      </section>

      {/* ── Promise / What's different ── */}
      <section
        style={{ background: "var(--brand-surface)", padding: "80px 40px" }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "clamp(24px, 4vw, 38px)",
              marginBottom: "16px",
              color: "var(--brand-dark)",
            }}
          >
            All the good parts of PM,
            <br />
            none of the stress
          </h2>
          <p
            style={{
              fontSize: "16px",
              color: "var(--brand-text-dark-muted)",
              marginBottom: "52px",
              maxWidth: "520px",
              lineHeight: 1.8,
            }}
          >
            Built from the ground up for people who have ideas worth tracking,
            but not a team demanding weekly updates.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "20px",
            }}
          >
            {[
              {
                accent: "var(--brand-bg)",
                label: "Gentle structure",
                body: "Capture what's on your mind, break it into steps, and check in when you're ready. No sprints, no standups.",
              },
              {
                accent: "var(--brand-accent-yellow)",
                label: "Positive language",
                body: 'No "overdue" banners. No red flags. Just a calm view of where things stand and what\'s next.',
              },
              {
                accent: "var(--brand-bg-deep)",
                label: "Built for side-energy",
                body: "Whether you have 20 minutes or a full Sunday, pick up right where you left off. SomedayPM waits for you.",
              },
            ].map(({ accent, label, body }) => (
              <div
                key={label}
                style={{
                  background: "var(--brand-surface-soft)",
                  border: "1px solid var(--brand-border-light)",
                  borderRadius: "12px",
                  padding: "28px 24px",
                }}
              >
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: accent,
                    marginBottom: "18px",
                  }}
                />
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    marginBottom: "10px",
                    color: "var(--brand-dark)",
                  }}
                >
                  {label}
                </h3>
                <p
                  style={{
                    fontSize: "14px",
                    color: "var(--brand-text-dark-muted)",
                    lineHeight: 1.75,
                  }}
                >
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ background: "var(--brand-bg)", padding: "80px 40px" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "clamp(24px, 4vw, 38px)",
              marginBottom: "56px",
              color: "var(--brand-surface-soft)",
            }}
          >
            Built for the way you actually work
          </h2>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "36px" }}
          >
            {[
              {
                n: "01",
                title: "Capture your projects",
                body: "Drop in an idea and give it a title. No setup, no templates, no forms to fill. Just a place to put things.",
              },
              {
                n: "02",
                title: "Break them into cards",
                body: "Add tasks, notes, due dates, and files — without overthinking it. Structure grows with you, not before you.",
              },
              {
                n: "03",
                title: "Return whenever you're ready",
                body: "No pressure. SomedayPM remembers exactly where you left off. Come back in an hour or a month — it'll be there.",
              },
            ].map(({ n, title, body }) => (
              <div
                key={n}
                style={{
                  display: "flex",
                  gap: "28px",
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "24px",
                    fontWeight: 700,
                    color: "var(--brand-accent-yellow)",
                    flexShrink: 0,
                    lineHeight: 1.1,
                    minWidth: "44px",
                    opacity: 0.95,
                  }}
                >
                  {n}
                </span>
                <div
                  style={{
                    borderTop: "1px solid var(--brand-border-light)",
                    paddingTop: "4px",
                    flex: 1,
                  }}
                >
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      marginBottom: "8px",
                      color: "var(--brand-surface-soft)",
                    }}
                  >
                    {title}
                  </h3>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "var(--brand-text-muted)",
                      lineHeight: 1.8,
                    }}
                  >
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it feels (Vibe) ── */}
      <section
        id="vibe"
        style={{ background: "var(--brand-surface)", padding: "80px 40px" }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "clamp(24px, 4vw, 38px)",
              marginBottom: "20px",
              color: "var(--brand-dark)",
            }}
          >
            Feels more like packaging
            <br />
            than a dashboard
          </h2>
          <p
            style={{
              fontSize: "16px",
              color: "var(--brand-text-dark-muted)",
              maxWidth: "520px",
              lineHeight: 1.8,
              marginBottom: "52px",
            }}
          >
            From the muted greens and warm cream tones to status names that skip
            the stress response — every design choice is meant to feel personal
            and calm, not corporate.
          </p>
          {/* TODO: Replace these stylized mockups with real product screenshots once the UI is polished */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
              alignItems: "start",
            }}
          >
            <MockupProjectList />
            <MockupCardDetail />
            <MockupChildCard />
          </div>
        </div>
      </section>

      {/* ── Closing CTA ── */}
      <section
        style={{
          background: "var(--brand-bg-deep)",
          padding: "88px 40px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "clamp(26px, 4vw, 44px)",
              marginBottom: "18px",
              color: "var(--brand-surface-soft)",
              lineHeight: 1.15,
            }}
          >
            Help shape SomedayPM
          </h2>
          <p
            style={{
              fontSize: "17px",
              color: "var(--brand-text-muted)",
              lineHeight: 1.8,
              marginBottom: "40px",
            }}
          >
            We're building this for people who take their side projects
            seriously — even when life doesn't make it easy. If that's you, we'd
            love to have you in the beta.
          </p>
          <Link
            to="/beta"
            style={{
              ...btnPrimary,
              fontSize: "15px",
              padding: "13px 30px",
              display: "inline-block",
            }}
          >
            Request beta access
          </Link>
          <p
            style={{
              marginTop: "24px",
              fontSize: "13px",
              color: "var(--brand-text-muted)",
              opacity: 0.6,
            }}
          >
            Small beta. Real feedback. No spam.
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          padding: "28px 40px",
          borderTop: "1px solid var(--brand-border-light)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          background: "var(--brand-bg)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            color: "var(--brand-surface)",
            fontSize: "15px",
          }}
        >
          SomedayPM
        </span>
        <span style={{ fontSize: "13px", color: "var(--brand-text-muted)" }}>
          Built for the ideas you'll get to someday.
        </span>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────
// Stylized mockup placeholders
// TODO: Replace these with real product screenshots once the app UI is polished
// ─────────────────────────────────────────────

function MockupProjectList() {
  const projects = [
    "Brand Redesign",
    "Podcast Side Hustle",
    "Travel Blog",
    "iOS App",
  ];
  const categories = ["Design", "Content", "Writing", "Dev"];
  return (
    <div
      style={{
        background: "var(--brand-surface-soft)",
        border: "1px solid var(--brand-border-light)",
        borderRadius: "16px",
        padding: "22px",
        boxShadow: "0 12px 40px rgba(32,39,51,0.15)",
        width: "100%",
        maxWidth: "320px",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "15px",
          color: "var(--brand-dark)",
          marginBottom: "16px",
          letterSpacing: "-0.2px",
        }}
      >
        My Projects
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {projects.map((p, i) => (
          <div
            key={p}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 12px",
              background: "var(--brand-surface)",
              borderRadius: "8px",
              border: "1px solid var(--brand-border-light)",
            }}
          >
            <span
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--brand-dark)",
              }}
            >
              {p}
            </span>
            <span
              style={{
                fontSize: "10px",
                padding: "2px 8px",
                background:
                  i === 0 ? "var(--brand-accent-yellow)" : "transparent",
                border: "1px solid var(--brand-border-light)",
                borderRadius: "99px",
                color: "var(--brand-text-dark-muted)",
                whiteSpace: "nowrap",
              }}
            >
              {categories[i]}
            </span>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: "10px",
          padding: "8px 12px",
          borderRadius: "8px",
          border: "1.5px dashed var(--brand-border-light)",
          color: "var(--brand-text-dark-muted)",
          fontSize: "12px",
          textAlign: "center",
        }}
      >
        + New project
      </div>
    </div>
  );
}

function MockupCardDetail() {
  return (
    <div
      style={{
        background: "var(--brand-surface-soft)",
        border: "1px solid var(--brand-border-light)",
        borderRadius: "16px",
        padding: "22px",
        boxShadow: "0 12px 40px rgba(32,39,51,0.12)",
        width: "100%",
        maxWidth: "320px",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          color: "var(--brand-bg)",
          marginBottom: "12px",
          fontWeight: 500,
        }}
      >
        ← My Projects
      </div>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "16px",
          color: "var(--brand-dark)",
          marginBottom: "6px",
          borderBottom: "1px solid var(--brand-border-light)",
          paddingBottom: "10px",
        }}
      >
        Brand Redesign
      </div>
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginTop: "10px",
          marginBottom: "16px",
        }}
      >
        <span
          style={{
            fontSize: "11px",
            padding: "3px 10px",
            background: "var(--brand-accent-yellow)",
            borderRadius: "99px",
            color: "var(--brand-dark)",
            fontWeight: 600,
          }}
        >
          Design
        </span>
        <span
          style={{
            fontSize: "11px",
            padding: "3px 10px",
            background: "rgba(35,61,43,0.14)",
            borderRadius: "99px",
            color: "var(--brand-bg)",
            fontWeight: 600,
          }}
        >
          In progress
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {["Mood board", "Color palette", "Logo concepts", "Type system"].map(
          (t, i) => (
            <div
              key={t}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 10px",
                border: "1px solid var(--brand-border-light)",
                borderRadius: "7px",
                background: "var(--brand-surface)",
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "3px",
                  border: "1.5px solid",
                  borderColor:
                    i < 2 ? "var(--brand-bg)" : "var(--brand-border-light)",
                  background: i < 2 ? "var(--brand-bg)" : "transparent",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: "12px",
                  color:
                    i < 2
                      ? "var(--brand-text-dark-muted)"
                      : "var(--brand-dark)",
                  textDecoration: i < 2 ? "line-through" : "none",
                }}
              >
                {t}
              </span>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

function MockupChildCard() {
  return (
    <div
      style={{
        background: "var(--brand-surface-soft)",
        border: "1px solid var(--brand-border-light)",
        borderRadius: "16px",
        padding: "22px",
        boxShadow: "0 12px 40px rgba(32,39,51,0.12)",
        width: "100%",
        maxWidth: "320px",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          color: "var(--brand-bg)",
          marginBottom: "12px",
          fontWeight: 500,
        }}
      >
        ← Brand Redesign
      </div>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "15px",
          color: "var(--brand-dark)",
          borderBottom: "1px solid rgba(35,38,31,0.1)",
          paddingBottom: "10px",
          marginBottom: "14px",
        }}
      >
        Color palette
      </div>
      <div
        style={{
          fontSize: "12px",
          color: "var(--brand-text-dark-muted)",
          lineHeight: 1.75,
          marginBottom: "14px",
          background: "var(--brand-surface)",
          padding: "10px 12px",
          borderRadius: "8px",
        }}
      >
        Muted green and warm cream for the base. Yellow accent for moments that
        matter. Calm but not boring.
      </div>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {["#233D2B", "#E7DCC9", "#F2E79C", "#D6A32A"].map((c) => (
          <div
            key={c}
            style={{
              width: "26px",
              height: "26px",
              borderRadius: "50%",
              background: c,
              border: "1.5px solid var(--brand-border-light)",
            }}
            title={c}
          />
        ))}
      </div>
      <div style={{ marginTop: "16px", display: "flex", gap: "8px" }}>
        <div
          style={{
            flex: 1,
            padding: "7px 10px",
            background: "var(--brand-accent-yellow)",
            borderRadius: "7px",
            fontSize: "12px",
            fontWeight: 600,
            color: "var(--brand-dark)",
            textAlign: "center",
          }}
        >
          Save
        </div>
        <div
          style={{
            padding: "7px 10px",
            background: "transparent",
            border: "1px solid var(--brand-border-light)",
            borderRadius: "7px",
            fontSize: "12px",
            color: "var(--brand-text-dark-muted)",
            textAlign: "center",
          }}
        >
          Delete
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Shared button styles
// ─────────────────────────────────────────────

const btnPrimary = {
  display: "inline-block",
  padding: "10px 22px",
  background: "var(--brand-accent-yellow)",
  color: "var(--brand-dark)",
  fontFamily: "var(--font-body)",
  fontSize: "14px",
  fontWeight: 600,
  borderRadius: "8px",
  textDecoration: "none",
  border: "none",
  cursor: "pointer",
  letterSpacing: "0.1px",
};

const btnGhost = {
  display: "inline-block",
  padding: "8px 18px",
  background: "transparent",
  color: "var(--brand-text-muted)",
  fontFamily: "var(--font-body)",
  fontSize: "14px",
  fontWeight: 500,
  borderRadius: "8px",
  border: "1px solid var(--brand-border-light)",
  cursor: "pointer",
  textDecoration: "none",
};

function FirstRunGuide({ onCreateProject }) {
  const steps = [
    {
      n: "1",
      title: "Create your first project",
      body: "Give it a name and a type. That's all it takes to get started.",
      done: false,
    },
    {
      n: "2",
      title: "Add to-dos and tasks",
      body: "Break the project into steps. Check things off as you go.",
      done: false,
    },
    {
      n: "3",
      title: "Attach notes and files",
      body: "Keep everything in one place — context, links, and references.",
      done: false,
    },
  ];

  return (
    <div
      style={{
        border: "1.5px dashed rgba(243,231,207,0.18)",
        borderRadius: "16px",
        padding: "36px 32px",
        display: "flex",
        flexDirection: "column",
        gap: "28px",
      }}
    >
      <div>
        <p
          style={{
            fontSize: "13px",
            fontWeight: 600,
            letterSpacing: "0.6px",
            textTransform: "uppercase",
            color: "var(--brand-accent-yellow)",
            marginBottom: "10px",
          }}
        >
          Getting started
        </p>
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.4rem, 3vw, 2rem)",
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
            color: "var(--brand-text)",
            margin: 0,
          }}
        >
          Your first project
          <br />
          is one click away.
        </h3>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {steps.map(({ n, title, body }) => (
          <div
            key={n}
            style={{
              display: "flex",
              gap: "16px",
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                width: "26px",
                height: "26px",
                borderRadius: "50%",
                border: "1.5px solid rgba(242,231,156,0.4)",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: 700,
                color: "var(--brand-accent-yellow)",
                marginTop: "1px",
              }}
            >
              {n}
            </div>
            <div>
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--brand-text)",
                  margin: "0 0 3px",
                }}
              >
                {title}
              </p>
              <p
                style={{
                  fontSize: "13px",
                  color: "rgba(243,231,207,0.6)",
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                {body}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div>
        <button
          onClick={onCreateProject}
          style={{
            padding: "10px 22px",
            background: "var(--brand-accent-yellow)",
            border: "none",
            borderRadius: "10px",
            color: "var(--brand-dark)",
            fontSize: "14px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          + Create your first project
        </button>
      </div>
    </div>
  );
}

function Dashboard({ user }) {
  const [cards, setCards] = useState([]);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState(ROOT_CATEGORIES[0]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getRootCards()
      .then(setCards)
      .catch((err) => setError(err.message))
      .finally(() => setCardsLoading(false));
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const card = await createRootCard({
        title: newTitle.trim(),
        category: newCategory,
      });
      setCards((prev) => [card, ...prev]);
      setNewTitle("");
      setNewCategory(ROOT_CATEGORIES[0]);
      setShowCreate(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div
      style={{
        padding: "26px 26px 34px",
        display: "flex",
        flexDirection: "column",
        gap: "22px",
      }}
    >
      {/* Page intro */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 20,
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 4vw, 3.2rem)",
              letterSpacing: "-.05em",
              lineHeight: 0.92,
              color: "var(--brand-text)",
              margin: 0,
            }}
          >
            All your projects<br />in one place.
          </h2>
          <p
            style={{
              margin: "10px 0 0",
              color: "rgba(244,234,214,.74)",
              fontSize: ".95rem",
              lineHeight: 1.55,
            }}
          >
            {user.email}
          </p>
        </div>

        {!showCreate && (
          <button
            onClick={() => setShowCreate(true)}
            style={{
              padding: "12px 16px",
              background: "var(--brand-accent-yellow)",
              border: "none",
              borderRadius: "12px",
              color: "var(--brand-dark)",
              fontSize: ".92rem",
              fontWeight: 700,
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            + New project
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <p style={{ color: "#b45309", fontSize: "13px" }}>{error}</p>
      )}

      {/* Inline create form */}
      {showCreate && (
        <form
          onSubmit={handleCreate}
          style={{
            padding: "20px",
            border: "1px solid var(--brand-border-light)",
            borderRadius: "12px",
            background: "var(--brand-surface-soft)",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.32)",
            maxWidth: "420px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--brand-text-dark-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            New project
          </div>
          <input
            autoFocus
            type="text"
            placeholder="Project title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            style={inputStyle}
          />
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            style={inputStyle}
          >
            {ROOT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="submit"
              disabled={creating || !newTitle.trim()}
              style={{
                padding: "7px 18px",
                background: "var(--brand-bg)",
                border: "none",
                borderRadius: "7px",
                color: "var(--brand-surface-soft)",
                fontSize: "13px",
                fontWeight: 600,
                cursor: creating ? "not-allowed" : "pointer",
                opacity: creating || !newTitle.trim() ? 0.6 : 1,
              }}
            >
              {creating ? "Creating…" : "Create"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreate(false);
                setNewTitle("");
                setNewCategory(ROOT_CATEGORIES[0]);
              }}
              style={{
                padding: "7px 14px",
                background: "transparent",
                border: "1px solid var(--brand-border-light)",
                borderRadius: "7px",
                color: "var(--brand-text-dark-muted)",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Cards grid */}
      {cardsLoading ? (
        <p style={{ color: "rgba(244,234,214,.7)", fontSize: "14px" }}>
          Loading projects…
        </p>
      ) : cards.length === 0 ? (
        <FirstRunGuide onCreateProject={() => setShowCreate(true)} />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(280px, 1fr))",
            gap: "18px",
          }}
        >
          {cards.map((card) => (
            <ProjectCard key={card.id} card={card} />
          ))}
        </div>
      )}

      {/* Lower panels */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.15fr .85fr",
          gap: "18px",
        }}
      >
        <section className="lower-panel">
          <h4
            style={{
              margin: "0 0 14px",
              fontSize: ".84rem",
              letterSpacing: ".1em",
              textTransform: "uppercase",
              color: "rgba(244,234,214,.62)",
            }}
          >
            Current focus
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {cards.slice(0, 2).map((card) => (
              <div key={card.id} className="mini-row">
                <span>{card.title}</span>
                <span style={{ color: "rgba(244,234,214,.5)", fontSize: ".82rem" }}>
                  Open →
                </span>
              </div>
            ))}
            {!cardsLoading && cards.length === 0 && (
              <div className="mini-row">
                <span style={{ opacity: 0.5 }}>No projects yet</span>
              </div>
            )}
          </div>
        </section>

        <section className="lower-panel">
          <h4
            style={{
              margin: "0 0 14px",
              fontSize: ".84rem",
              letterSpacing: ".1em",
              textTransform: "uppercase",
              color: "rgba(244,234,214,.62)",
            }}
          >
            Quick capture
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="mini-row">
              <span style={{ color: "rgba(244,234,214,.5)" }}>New idea...</span>
              <span>+</span>
            </div>
            <div className="mini-row">
              <span style={{ color: "rgba(244,234,214,.5)" }}>New task...</span>
              <span>+</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function ProjectCard({ card }) {
  return (
    <Link
      to={`/card/${card.id}`}
      className="project-card"
      style={{ display: "flex", flexDirection: "column" }}
    >
      {/* Card top */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          marginBottom: 18,
        }}
      >
        <div className="card-category">
          <span className="status-dot" />
          {card.category}
        </div>
      </div>

      {/* Title */}
      <div style={{ flex: 1 }}>
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "2rem",
            lineHeight: 0.92,
            letterSpacing: "-.05em",
            margin: 0,
            color: "#202733",
            maxWidth: "11ch",
          }}
        >
          {card.title}
        </h3>
      </div>

      {/* Card bottom */}
      <div
        style={{
          marginTop: 22,
          paddingTop: 14,
          borderTop: "1px solid rgba(32,39,51,.08)",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "flex-end",
        }}
      >
        <span style={{ color: "#202733", fontWeight: 800, fontSize: ".9rem" }}>
          Open →
        </span>
      </div>
    </Link>
  );
}

const inputStyle = {
  padding: "8px 12px",
  background: "var(--brand-surface)",
  border: "1px solid var(--brand-border-light)",
  borderRadius: "6px",
  color: "var(--brand-dark)",
  fontSize: "14px",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

