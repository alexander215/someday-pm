import { createBrowserRouter } from "react-router-dom";
import HomePage from "../pages/HomePage";
import CardDetailPage from "../pages/CardDetailPage";
import ChildCardDetailPage from "../pages/ChildCardDetailPage";
import BetaPage from "../pages/BetaPage";
import AdminPage from "../pages/AdminPage";
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
