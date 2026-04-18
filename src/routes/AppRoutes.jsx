import { createBrowserRouter } from "react-router-dom";
import HomePage from "../pages/HomePage";
import CardDetailPage from "../pages/CardDetailPage";
import ChildCardDetailPage from "../pages/ChildCardDetailPage";
import BetaPage from "../pages/BetaPage";
import AdminPage from "../pages/AdminPage";
import ProfileSettingsPage from "../pages/ProfileSettingsPage";
import PublicProfilePage from "../pages/PublicProfilePage";
import AboutPage from "../pages/AboutPage";
import ContactPage from "../pages/ContactPage";
import BlogIndexPage from "../pages/BlogIndexPage";
import BlogPostPage from "../pages/BlogPostPage";
import RequireAuth from "../features/auth/RequireAuth";
import AppShell from "../components/AppShell";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/beta",
    element: <BetaPage />,
  },
  {
    path: "/about",
    element: <AboutPage />,
  },
  {
    path: "/contact",
    element: <ContactPage />,
  },
  {
    path: "/blog",
    element: <BlogIndexPage />,
  },
  {
    path: "/blog/:slug",
    element: <BlogPostPage />,
  },
  {
    path: "/u/:handle",
    element: <PublicProfilePage />,
  },
  {
    path: "/profile/settings",
    element: (
      <RequireAuth>
        <AppShell>
          <ProfileSettingsPage />
        </AppShell>
      </RequireAuth>
    ),
  },
  {
    path: "/card/:cardId",
    element: (
      <RequireAuth>
        <AppShell>
          <CardDetailPage />
        </AppShell>
      </RequireAuth>
    ),
  },
  {
    path: "/admin",
    element: (
      <RequireAuth>
        <AppShell>
          <AdminPage />
        </AppShell>
      </RequireAuth>
    ),
  },
  {
    path: "/card/:cardId/item/:childCardId",
    element: (
      <RequireAuth>
        <AppShell>
          <ChildCardDetailPage />
        </AppShell>
      </RequireAuth>
    ),
  },
]);
