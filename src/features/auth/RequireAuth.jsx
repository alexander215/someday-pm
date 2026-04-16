import { Navigate } from 'react-router-dom'
import useAuth from './useAuth'

export default function RequireAuth({ children }) {
  const { session, loading } = useAuth()

  // Don't render anything while the initial session resolves.
  // This prevents a flash-redirect to "/" on a hard refresh of a protected route.
  if (loading) return null

  if (!session) return <Navigate to="/" replace />

  return children
}
