import useAuth from "../features/auth/useAuth";
import AppShell from "../components/AppShell";
import PublicSiteLayout from "../components/layout/PublicSiteLayout";
import AuthenticatedSiteLayout from "../components/layout/AuthenticatedSiteLayout";
import ContactPageContent from "../components/site/ContactPageContent";
import SitePageLoading from "../components/SitePageLoading";

export default function ContactPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <SitePageLoading />;
  }

  if (!user) {
    return (
      <PublicSiteLayout>
        <ContactPageContent variant="public" />
      </PublicSiteLayout>
    );
  }

  return (
    <AppShell>
      <AuthenticatedSiteLayout>
        <ContactPageContent variant="app" />
      </AuthenticatedSiteLayout>
    </AppShell>
  );
}
