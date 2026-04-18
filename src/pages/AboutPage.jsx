import { useState } from "react";
import useAuth from "../features/auth/useAuth";
import LoginModal from "../features/auth/LoginModal";
import AppShell from "../components/AppShell";
import PublicSiteLayout from "../components/layout/PublicSiteLayout";
import AuthenticatedSiteLayout from "../components/layout/AuthenticatedSiteLayout";
import AboutPageContent from "../components/site/AboutPageContent";
import SitePageLoading from "../components/SitePageLoading";

export default function AboutPage() {
  const { user, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  if (loading) {
    return <SitePageLoading />;
  }

  if (!user) {
    return (
      <>
        <PublicSiteLayout onSignIn={() => setShowLogin(true)}>
          <AboutPageContent variant="public" />
        </PublicSiteLayout>
        {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      </>
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
