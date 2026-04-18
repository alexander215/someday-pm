import { Link } from "react-router-dom";
import { C, pillStyle, sectionH2 } from "../../lib/brandTokens";

/**
 * @param {object} props
 * @param {'public' | 'app'} props.variant
 * @param {import('../../lib/blog').BlogPostMeta[]} props.posts
 */
export default function BlogIndexPageContent({ variant = "public", posts }) {
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
            marginBottom: "10px",
          }}
        >
          Journal
        </p>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "clamp(1.75rem, 4vw, 2.35rem)",
            letterSpacing: "-0.03em",
            marginBottom: "12px",
            color: "var(--brand-text)",
          }}
        >
          Blog
        </h1>
        <p style={{ fontSize: "15px", color: "rgba(244,234,214,.75)", lineHeight: 1.7, marginBottom: "28px" }}>
          Notes on the product, the beta, and building calm tools for creative work.
        </p>
        <PostList posts={posts} variant="app" />
      </div>
    );
  }

  return (
    <div>
      <section
        style={{
          background: `linear-gradient(160deg, ${C.forest} 0%, ${C.forestDeep} 100%)`,
          padding: "56px 40px 40px",
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={pillStyle(true)}>Journal</div>
          <h1 style={{ ...sectionH2, color: "#f3e7cf", marginBottom: "14px" }}>Blog</h1>
          <p
            style={{
              fontSize: "17px",
              color: "rgba(243,231,207,0.72)",
              lineHeight: 1.75,
              maxWidth: "560px",
            }}
          >
            Occasional writing about SomedayPM — product choices, beta learnings, and
            the philosophy behind the tool.
          </p>
        </div>
      </section>

      <section style={{ background: C.canvas, padding: "56px 40px 80px" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <PostList posts={posts} variant="public" />
        </div>
      </section>
    </div>
  );
}

/**
 * @param {object} props
 * @param {import('../../lib/blog').BlogPostMeta[]} props.posts
 * @param {'public' | 'app'} props.variant
 */
function PostList({ posts, variant }) {
  const isApp = variant === "app";

  if (!posts.length) {
    return (
      <p style={{ fontSize: "15px", color: isApp ? "rgba(244,234,214,.65)" : C.muted }}>
        No posts yet. Check back soon.
      </p>
    );
  }

  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "14px" }}>
      {posts.map((post) => (
        <li key={post.slug}>
          <Link
            to={`/blog/${post.slug}`}
            style={{
              display: "block",
              textDecoration: "none",
              borderRadius: "14px",
              padding: "18px 20px",
              background: isApp ? "rgba(0,0,0,.2)" : C.white,
              border: `1px solid ${isApp ? "rgba(243,231,207,0.12)" : "rgba(24,24,15,0.07)"}`,
              boxShadow: isApp ? "none" : "0 4px 20px rgba(24,24,15,0.05)",
              transition: "border-color 0.15s, box-shadow 0.15s",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: isApp ? "rgba(244,234,214,.45)" : C.soft,
                marginBottom: "6px",
              }}
            >
              {post.date ?? "Draft"}
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "19px",
                color: isApp ? "var(--brand-text)" : C.forest,
                letterSpacing: "-0.02em",
                marginBottom: "8px",
              }}
            >
              {post.title}
            </div>
            {post.excerpt && (
              <p
                style={{
                  fontSize: "14px",
                  lineHeight: 1.65,
                  color: isApp ? "rgba(244,234,214,.72)" : C.muted,
                  margin: 0,
                }}
              >
                {post.excerpt}
              </p>
            )}
            {post.tags?.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      padding: "4px 10px",
                      borderRadius: "99px",
                      background: isApp ? "rgba(242,231,156,0.12)" : "rgba(28,45,32,0.08)",
                      color: isApp ? "var(--brand-accent-yellow)" : C.forest,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
