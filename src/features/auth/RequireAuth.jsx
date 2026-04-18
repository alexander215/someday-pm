import { Navigate, useLocation } from 'react-router-dom'
import useAuth from './useAuth'
import SitePageLoading from '../../components/SitePageLoading'

export default function RequireAuth({ children }) {
  const { session, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <SitePageLoading />
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
