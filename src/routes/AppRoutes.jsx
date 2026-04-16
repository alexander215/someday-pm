import { createBrowserRouter } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import CardDetailPage from '../pages/CardDetailPage'
import ChildCardDetailPage from '../pages/ChildCardDetailPage'
import BetaPage from '../pages/BetaPage'
import RequireAuth from '../features/auth/RequireAuth'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/beta',
    element: <BetaPage />,
  },
  {
    path: '/card/:cardId',
    element: (
      <RequireAuth>
        <CardDetailPage />
      </RequireAuth>
    ),
  },
  {
    path: '/card/:cardId/item/:childCardId',
    element: (
      <RequireAuth>
        <ChildCardDetailPage />
      </RequireAuth>
    ),
  },
])
