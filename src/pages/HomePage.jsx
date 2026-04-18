import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useAuth from "../features/auth/useAuth";
import LoginModal from "../features/auth/LoginModal";
import AppShell from "../components/AppShell";
import PublicSiteNav from "../components/layout/PublicSiteNav";
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

  // Design tokens
  const C = {
    canvas:     "#f7f5f0",
    white:      "#ffffff",
    forest:     "#1c2d20",
    forestDeep: "#152119",
    inset:      "#ede5d2",
    ink:        "#18180f",
    muted:      "#6b6454",
    soft:       "#8a7e6e",
    yellow:     "#f2e79c",
    mustard:    "#c49b28",
  };

  const pill = (dark = false) => ({
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
  });

  const sectionH2 = {
    fontFamily: "var(--font-display)",
    fontWeight: 800,
    fontSize: "clamp(30px, 4.5vw, 54px)",
    lineHeight: 1.05,
    letterSpacing: "-0.03em",
    marginBottom: "20px",
  };

  return (
    <div
      style={{
        background: C.canvas,
        color: C.ink,
        fontFamily: "var(--font-body)",
        minHeight: "100vh",
      }}
    >
      <PublicSiteNav onSignIn={onSignIn} />

      {/* ── Hero — deep forest green, brand-defining ── */}
      <section
        style={{
          background: `linear-gradient(160deg, ${C.forest} 0%, ${C.forestDeep} 100%)`,
        }}
      >
        <div
          style={{
            maxWidth: "1120px",
            margin: "0 auto",
            padding: "96px 40px 88px",
            display: "flex",
            gap: "72px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: "1 1 420px", maxWidth: "560px" }}>
            <div style={pill(true)}>Private beta</div>

            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "clamp(48px, 7vw, 86px)",
                lineHeight: 1.0,
                marginBottom: "26px",
                letterSpacing: "-0.04em",
              }}
            >
              <span style={{ color: "#f3e7cf" }}>Project Management</span>
              <br />
              <span style={{ color: C.yellow }}>for Side Projects</span>
            </h1>

            <p
              style={{
                fontSize: "18px",
                color: "rgba(243,231,207,0.7)",
                fontWeight: 400,
                marginBottom: "14px",
                lineHeight: 1.65,
                maxWidth: "440px",
              }}
            >
              A calm, focused tool for keeping your ideas moving — without the
              pressure of work tools.
            </p>
            <p
              style={{
                fontSize: "15px",
                color: "rgba(243,231,207,0.5)",
                lineHeight: 1.9,
                marginBottom: "44px",
                maxWidth: "420px",
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
                  color: "rgba(243,231,207,0.55)",
                  fontWeight: 500,
                  textDecoration: "none",
                  borderBottom: "1px solid rgba(243,231,207,0.22)",
                  paddingBottom: "1px",
                }}
              >
                View the vibe ↓
              </a>
            </div>
          </div>

          {/* Hero mockup — glass panel floating on dark green */}
          {/* TODO: Replace this placeholder with a real product screenshot once the app UI is polished */}
          <div
            style={{
              flex: "1 1 300px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.07)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                borderRadius: "22px",
                border: "1.5px solid rgba(255,255,255,0.24)",
                boxShadow:
                  "0 28px 72px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.14) inset",
                padding: "8px",
              }}
            >
              <MockupProjectList />
            </div>
          </div>
        </div>
      </section>

      {/* ── Problem / Why — white bg, yellow pill, two-column items ── */}
      <section style={{ background: C.white, padding: "88px 40px" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <div style={pill()}>The problem</div>

          <h2 style={{ ...sectionH2, marginBottom: "52px" }}>
            <span style={{ color: C.ink }}>Side projects shouldn't feel like</span>
            <br />
            <span style={{ color: C.forest }}>status meetings</span>
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "32px 56px",
              marginBottom: "56px",
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
                  paddingLeft: "20px",
                  borderLeft: `2px solid ${C.mustard}`,
                }}
              >
                <p
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: C.ink,
                    marginBottom: "8px",
                  }}
                >
                  {label}
                </p>
                <p
                  style={{
                    fontSize: "15px",
                    lineHeight: 1.75,
                    color: C.muted,
                  }}
                >
                  {text}
                </p>
              </div>
            ))}
          </div>

          <p
            style={{
              fontSize: "17px",
              fontWeight: 500,
              color: C.ink,
              lineHeight: 1.7,
              maxWidth: "540px",
              paddingTop: "28px",
              borderTop: "1px solid rgba(24,24,15,0.08)",
            }}
          >
            SomedayPM keeps everything together without turning your hobby into
            a second job.
          </p>
        </div>
      </section>

      {/* ── Promise / What's different — canvas bg, tonal cards ── */}
      <section style={{ background: C.canvas, padding: "88px 40px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <h2 style={{ ...sectionH2 }}>
            <span style={{ color: C.ink }}>All the good parts of PM,</span>
            <br />
            <span style={{ color: C.forest }}>none of the stress</span>
          </h2>
          <p
            style={{
              fontSize: "16px",
              color: C.muted,
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
              gap: "16px",
            }}
          >
            {[
              {
                accent: C.forest,
                label: "Gentle structure",
                body: "Capture what's on your mind, break it into steps, and check in when you're ready. No sprints, no standups.",
              },
              {
                accent: C.mustard,
                label: "Positive language",
                body: 'No "overdue" banners. No red flags. Just a calm view of where things stand and what\'s next.',
              },
              {
                accent: C.forestDeep,
                label: "Built for side-energy",
                body: "Whether you have 20 minutes or a full Sunday, pick up right where you left off. SomedayPM waits for you.",
              },
            ].map(({ accent, label, body }) => (
              <div
                key={label}
                style={{
                  background: "#f0ece3",
                  borderRadius: "16px",
                  padding: "28px 24px",
                  boxShadow: "0 2px 12px rgba(24,24,15,0.04)",
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
                    color: C.ink,
                  }}
                >
                  {label}
                </h3>
                <p
                  style={{
                    fontSize: "14px",
                    color: C.muted,
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

      {/* ── How it works — deep forest, strong contrast moment ── */}
      <section style={{ background: C.forest, padding: "88px 40px" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          <h2
            style={{
              ...sectionH2,
              marginBottom: "56px",
            }}
          >
            <span style={{ color: "#f3e7cf" }}>Built for the way</span>
            <br />
            <span style={{ color: C.yellow }}>you actually work</span>
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
                    color: C.yellow,
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
                    borderTop: "1px solid rgba(255,255,255,0.12)",
                    paddingTop: "4px",
                    flex: 1,
                  }}
                >
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      marginBottom: "8px",
                      color: "#f3e7cf",
                    }}
                  >
                    {title}
                  </h3>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "rgba(243,231,207,0.6)",
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

      {/* ── How it feels (Vibe) — white bg, yellow pill ── */}
      <section
        id="vibe"
        style={{ background: C.white, padding: "88px 40px" }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={pill()}>The look and feel</div>

          <h2 style={{ ...sectionH2 }}>
            <span style={{ color: C.ink }}>Feels more like packaging</span>
            <br />
            <span style={{ color: C.forest }}>than a dashboard</span>
          </h2>
          <p
            style={{
              fontSize: "16px",
              color: C.muted,
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

      {/* ── Closing CTA — white bg, full-width cream panel, editorial two-column ── */}
      <section style={{ background: C.white, padding: "88px 40px" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <div
            style={{
              background: C.inset,
              borderRadius: "20px",
              padding: "56px 52px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "48px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: "1 1 360px", maxWidth: "500px" }}>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: "clamp(26px, 3.5vw, 42px)",
                  marginBottom: "16px",
                  color: C.ink,
                  lineHeight: 1.05,
                  letterSpacing: "-0.03em",
                }}
              >
                Help shape SomedayPM
              </h2>
              <p
                style={{
                  fontSize: "16px",
                  color: C.muted,
                  lineHeight: 1.8,
                  margin: 0,
                }}
              >
                We're building this for people who take their side projects
                seriously — even when life doesn't make it easy. If that's you, we'd
                love to have you in the beta.
              </p>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "10px",
                flexShrink: 0,
              }}
            >
              <Link
                to="/beta"
                style={{ ...btnPrimary, fontSize: "15px", padding: "13px 30px" }}
              >
                Request beta access
              </Link>
              <p style={{ fontSize: "12px", color: C.soft, margin: 0 }}>
                Small beta. Real feedback. No spam.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          padding: "28px 40px",
          borderTop: "1px solid rgba(24,24,15,0.07)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          background: C.canvas,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            color: "#1c2d20",
            fontSize: "15px",
          }}
        >
          SomedayPM
        </span>
        <span style={{ fontSize: "13px", color: "#8a7e6e" }}>
          Built for the ideas you'll get to someday.
        </span>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────
// Stylized mockup placeholders — updated for light canvas
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
        background: "#f0ece3",
        borderRadius: "16px",
        padding: "22px",
        boxShadow:
          "0 8px 32px rgba(24,24,15,0.09), 0 1px 0 rgba(255,255,255,0.8) inset",
        width: "100%",
        maxWidth: "320px",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "15px",
          color: "#18180f",
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
              background: "#e8deca",
              borderRadius: "8px",
              border: "1px solid rgba(24,24,15,0.06)",
            }}
          >
            <span
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "#18180f",
              }}
            >
              {p}
            </span>
            <span
              style={{
                fontSize: "10px",
                padding: "2px 8px",
                background:
                  i === 0 ? "#f2e79c" : "rgba(24,24,15,0.06)",
                border: "1px solid rgba(24,24,15,0.06)",
                borderRadius: "99px",
                color: i === 0 ? "#1c2d20" : "#6b6454",
                fontWeight: i === 0 ? 700 : 500,
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
          border: "1.5px dashed rgba(24,24,15,0.14)",
          color: "#8a7e6e",
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
        background: "#f0ece3",
        borderRadius: "16px",
        padding: "22px",
        boxShadow:
          "0 8px 32px rgba(24,24,15,0.08), 0 1px 0 rgba(255,255,255,0.8) inset",
        width: "100%",
        maxWidth: "320px",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          color: "#8a7e6e",
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
          color: "#18180f",
          marginBottom: "6px",
          borderBottom: "1px solid rgba(24,24,15,0.08)",
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
            background: "#f2e79c",
            borderRadius: "99px",
            color: "#1c2d20",
            fontWeight: 700,
          }}
        >
          Design
        </span>
        <span
          style={{
            fontSize: "11px",
            padding: "3px 10px",
            background: "rgba(28,45,32,0.10)",
            borderRadius: "99px",
            color: "#1c2d20",
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
                border: "1px solid rgba(24,24,15,0.07)",
                borderRadius: "7px",
                background: "#e8deca",
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "3px",
                  border: "1.5px solid",
                  borderColor:
                    i < 2 ? "#1c2d20" : "rgba(24,24,15,0.25)",
                  background: i < 2 ? "#1c2d20" : "transparent",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: "12px",
                  color:
                    i < 2 ? "#8a7e6e" : "#18180f",
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
        background: "#f0ece3",
        borderRadius: "16px",
        padding: "22px",
        boxShadow:
          "0 8px 32px rgba(24,24,15,0.08), 0 1px 0 rgba(255,255,255,0.8) inset",
        width: "100%",
        maxWidth: "320px",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          color: "#8a7e6e",
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
          color: "#18180f",
          borderBottom: "1px solid rgba(24,24,15,0.08)",
          paddingBottom: "10px",
          marginBottom: "14px",
        }}
      >
        Color palette
      </div>
      <div
        style={{
          fontSize: "12px",
          color: "#6b6454",
          lineHeight: 1.75,
          marginBottom: "14px",
          background: "#e8deca",
          padding: "10px 12px",
          borderRadius: "8px",
        }}
      >
        Muted green and warm cream for the base. Yellow accent for moments that
        matter. Calm but not boring.
      </div>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {["#1c2d20", "#ede5d2", "#f2e79c", "#c49b28"].map((c) => (
          <div
            key={c}
            style={{
              width: "26px",
              height: "26px",
              borderRadius: "50%",
              background: c,
              border: "1.5px solid rgba(24,24,15,0.1)",
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
            background: "#f2e79c",
            borderRadius: "7px",
            fontSize: "12px",
            fontWeight: 700,
            color: "#1c2d20",
            textAlign: "center",
          }}
        >
          Save
        </div>
        <div
          style={{
            padding: "7px 10px",
            background: "transparent",
            border: "1px solid rgba(24,24,15,0.14)",
            borderRadius: "7px",
            fontSize: "12px",
            color: "#6b6454",
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
// Shared button styles — tuned for light canvas
// ─────────────────────────────────────────────

const btnPrimary = {
  display: "inline-block",
  padding: "10px 22px",
  background: "#f2e79c",
  color: "#1c2d20",
  fontFamily: "var(--font-body)",
  fontSize: "14px",
  fontWeight: 700,
  borderRadius: "8px",
  textDecoration: "none",
  border: "none",
  cursor: "pointer",
  letterSpacing: "0.1px",
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
