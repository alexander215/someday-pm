import { useState } from "react";
import useAuth from "../features/auth/useAuth";
import LoginModal from "../features/auth/LoginModal";
import AppShell from "../components/AppShell";
import PublicSiteLayout from "../components/layout/PublicSiteLayout";
import AuthenticatedSiteLayout from "../components/layout/AuthenticatedSiteLayout";
import ContactPageContent from "../components/site/ContactPageContent";
import SitePageLoading from "../components/SitePageLoading";

export default function ContactPage() {
  const { user, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  if (loading) {
    return <SitePageLoading />;
  }

  if (!user) {
    return (
      <>
        <PublicSiteLayout onSignIn={() => setShowLogin(true)}>
          <ContactPageContent variant="public" />
        </PublicSiteLayout>
        {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      </>
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
