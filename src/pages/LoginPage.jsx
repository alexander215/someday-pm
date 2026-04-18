import { Navigate, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../features/auth/useAuth";
import LoginForm from "../features/auth/LoginForm";
import PublicSiteLayout from "../components/layout/PublicSiteLayout";
import SitePageLoading from "../components/SitePageLoading";
import { C } from "../lib/brandTokens";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  if (loading) {
    return <SitePageLoading />;
  }

  if (user) {
    return <Navigate to={from} replace />;
  }

  return (
    <PublicSiteLayout showMemberLogin={false}>
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "48px 24px 80px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 440,
            background: C.inset,
            borderRadius: 20,
            padding: "44px 40px",
            border: "1px solid rgba(24,24,15,0.07)",
            boxShadow: "0 8px 32px rgba(24,24,15,0.06)",
          }}
        >
          {location.state?.from && (
            <p
              style={{
                margin: "0 0 20px",
                fontSize: 13,
                color: C.muted,
                lineHeight: 1.5,
                padding: "10px 14px",
                background: "rgba(28,45,32,0.06)",
                borderRadius: 10,
                border: "1px solid rgba(28,45,32,0.1)",
              }}
            >
              Sign in to continue to{" "}
              <strong style={{ color: C.ink }}>{location.state.from.pathname}</strong>
            </p>
          )}
          <LoginForm
            variant="page"
            onSuccess={() => navigate(from, { replace: true })}
          />
        </div>
      </div>
    </PublicSiteLayout>
  );
}
