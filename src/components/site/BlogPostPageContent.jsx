import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { C } from "../../lib/brandTokens";

/**
 * @param {object} props
 * @param {'public' | 'app'} props.variant
 * @param {import('../../lib/blog').BlogPostMeta} props.post
 */
export default function BlogPostPageContent({ variant = "public", post }) {
  const isApp = variant === "app";

  const mdWrap = isApp
    ? {
        color: "rgba(244,234,214,.88)",
        fontSize: "16px",
        lineHeight: 1.8,
      }
    : {
        color: C.ink,
        fontSize: "17px",
        lineHeight: 1.85,
      };

  return (
    <div>
      {!isApp && (
        <section
          style={{
            background: `linear-gradient(160deg, ${C.forest} 0%, ${C.forestDeep} 100%)`,
            padding: "40px 40px 32px",
          }}
        >
          <div style={{ maxWidth: "720px", margin: "0 auto" }}>
            <Link
              to="/blog"
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "rgba(243,231,207,0.65)",
                textDecoration: "none",
                display: "inline-block",
                marginBottom: "16px",
              }}
            >
              ← All posts
            </Link>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "rgba(243,231,207,0.55)",
                marginBottom: "10px",
              }}
            >
              {post.date ?? ""}
            </div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "clamp(28px, 4vw, 40px)",
                lineHeight: 1.08,
                letterSpacing: "-0.03em",
                color: "#f3e7cf",
                marginBottom: "12px",
              }}
            >
              {post.title}
            </h1>
            {post.excerpt && (
              <p
                style={{
                  fontSize: "16px",
                  color: "rgba(243,231,207,0.72)",
                  lineHeight: 1.7,
                  maxWidth: "560px",
                }}
              >
                {post.excerpt}
              </p>
            )}
          </div>
        </section>
      )}

      {isApp && (
        <div style={{ marginBottom: "24px" }}>
          <Link
            to="/blog"
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "rgba(244,234,214,.55)",
              textDecoration: "none",
              display: "inline-block",
              marginBottom: "14px",
            }}
          >
            ← All posts
          </Link>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "rgba(244,234,214,.45)",
              marginBottom: "8px",
            }}
          >
            {post.date ?? ""}
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "clamp(1.6rem, 3.5vw, 2.1rem)",
              letterSpacing: "-0.03em",
              color: "var(--brand-text)",
              marginBottom: "10px",
            }}
          >
            {post.title}
          </h1>
          {post.excerpt && (
            <p style={{ fontSize: "15px", color: "rgba(244,234,214,.72)", lineHeight: 1.7 }}>
              {post.excerpt}
            </p>
          )}
        </div>
      )}

      <section
        style={
          isApp
            ? { padding: 0 }
            : { background: C.canvas, padding: "48px 40px 80px" }
        }
      >
        <article style={{ maxWidth: "720px", margin: "0 auto" }}>
          <div style={mdWrap}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents(isApp)}
            >
              {post.body}
            </ReactMarkdown>
          </div>
        </article>
      </section>
    </div>
  );
}

/**
 * @param {boolean} isApp
 */
function markdownComponents(isApp) {
  const linkColor = isApp ? "var(--brand-accent-yellow)" : C.forest;
  const codeBg = isApp ? "rgba(0,0,0,.35)" : "rgba(24,24,15,0.06)";

  return {
    h2: ({ children }) => (
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: "1.35rem",
          marginTop: "1.6em",
          marginBottom: "0.5em",
          letterSpacing: "-0.02em",
          color: isApp ? "var(--brand-text)" : C.forest,
        }}
      >
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "1.15rem",
          marginTop: "1.4em",
          marginBottom: "0.45em",
          color: isApp ? "var(--brand-text)" : C.forest,
        }}
      >
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p style={{ margin: "0 0 1em" }}>{children}</p>
    ),
    a: ({ href, children }) =>
      href?.startsWith("/") ? (
        <Link
          to={href}
          style={{ color: linkColor, fontWeight: 600, textDecoration: "underline" }}
        >
          {children}
        </Link>
      ) : (
        <a
          href={href}
          target={href?.startsWith("http") ? "_blank" : undefined}
          rel={href?.startsWith("http") ? "noreferrer noopener" : undefined}
          style={{ color: linkColor, fontWeight: 600, textDecoration: "underline" }}
        >
          {children}
        </a>
      ),
    ul: ({ children }) => (
      <ul style={{ paddingLeft: "1.2em", margin: "0 0 1em" }}>{children}</ul>
    ),
    ol: ({ children }) => (
      <ol style={{ paddingLeft: "1.2em", margin: "0 0 1em" }}>{children}</ol>
    ),
    li: ({ children }) => <li style={{ marginBottom: "0.35em" }}>{children}</li>,
    strong: ({ children }) => (
      <strong style={{ fontWeight: 700, color: isApp ? "#f3e7cf" : C.ink }}>{children}</strong>
    ),
    code: ({ children }) => (
      <code
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.9em",
          background: codeBg,
          padding: "2px 6px",
          borderRadius: "6px",
        }}
      >
        {children}
      </code>
    ),
  };
}
