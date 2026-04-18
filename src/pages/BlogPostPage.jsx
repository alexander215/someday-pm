import { Link, useParams } from "react-router-dom";
import useAuth from "../features/auth/useAuth";
import AppShell from "../components/AppShell";
import PublicSiteLayout from "../components/layout/PublicSiteLayout";
import AuthenticatedSiteLayout from "../components/layout/AuthenticatedSiteLayout";
import BlogPostPageContent from "../components/site/BlogPostPageContent";
import SitePageLoading from "../components/SitePageLoading";
import { getPublishedPostBySlug } from "../lib/blog";
import { C } from "../lib/brandTokens";

export default function BlogPostPage() {
  const { slug } = useParams();
  const { user, loading } = useAuth();

  const post = slug ? getPublishedPostBySlug(slug) : null;

  if (loading) {
    return <SitePageLoading />;
  }

  if (!post) {
    return <NotFoundPost loggedIn={!!user} />;
  }

  if (!user) {
    return (
      <PublicSiteLayout>
        <BlogPostPageContent variant="public" post={post} />
      </PublicSiteLayout>
    );
  }

  return (
    <AppShell>
      <AuthenticatedSiteLayout narrow>
        <BlogPostPageContent variant="app" post={post} />
      </AuthenticatedSiteLayout>
    </AppShell>
  );
}

function NotFoundPost({ loggedIn }) {
  const inner = (
    <div style={{ padding: "56px 40px 80px", maxWidth: "560px", margin: "0 auto" }}>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: "28px",
          marginBottom: "12px",
          color: loggedIn ? "var(--brand-text)" : C.ink,
        }}
      >
        Post not found
      </h1>
      <p
        style={{
          fontSize: "15px",
          color: loggedIn ? "rgba(244,234,214,.72)" : C.muted,
          lineHeight: 1.75,
          marginBottom: "20px",
        }}
      >
        That article doesn&apos;t exist or isn&apos;t published yet.
      </p>
      <Link
        to="/blog"
        style={{
          fontWeight: 700,
          color: loggedIn ? "var(--brand-accent-yellow)" : C.forest,
          textDecoration: "underline",
        }}
      >
        Back to blog
      </Link>
    </div>
  );

  if (loggedIn) {
    return (
      <AppShell>
        <AuthenticatedSiteLayout>{inner}</AuthenticatedSiteLayout>
      </AppShell>
    );
  }

  return <PublicSiteLayout>{inner}</PublicSiteLayout>;
}
