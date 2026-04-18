import useAuth from "../features/auth/useAuth";
import AppShell from "../components/AppShell";
import PublicSiteLayout from "../components/layout/PublicSiteLayout";
import AuthenticatedSiteLayout from "../components/layout/AuthenticatedSiteLayout";
import BlogIndexPageContent from "../components/site/BlogIndexPageContent";
import SitePageLoading from "../components/SitePageLoading";
import { getPublishedPosts } from "../lib/blog";

export default function BlogIndexPage() {
  const { user, loading } = useAuth();
  const posts = getPublishedPosts();

  if (loading) {
    return <SitePageLoading />;
  }

  if (!user) {
    return (
      <PublicSiteLayout>
        <BlogIndexPageContent variant="public" posts={posts} />
      </PublicSiteLayout>
    );
  }

  return (
    <AppShell>
      <AuthenticatedSiteLayout>
        <BlogIndexPageContent variant="app" posts={posts} />
      </AuthenticatedSiteLayout>
    </AppShell>
  );
}
