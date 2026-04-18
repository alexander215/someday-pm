import useAuth from "../features/auth/useAuth";
import AppShell from "../components/AppShell";
import PublicSiteLayout from "../components/layout/PublicSiteLayout";
import AuthenticatedSiteLayout from "../components/layout/AuthenticatedSiteLayout";
import AboutPageContent from "../components/site/AboutPageContent";
import SitePageLoading from "../components/SitePageLoading";

export default function AboutPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <SitePageLoading />;
  }

  if (!user) {
    return (
      <PublicSiteLayout>
        <AboutPageContent variant="public" />
      </PublicSiteLayout>
    );
  }

  return (
    <AppShell>
      <AuthenticatedSiteLayout>
        <AboutPageContent variant="app" />
      </AuthenticatedSiteLayout>
    </AppShell>
  );
}
