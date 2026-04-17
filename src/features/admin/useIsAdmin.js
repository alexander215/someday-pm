import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import useAuth from '../auth/useAuth'

/**
 * Returns whether the currently logged-in user is an admin.
 * Calls the is_admin() Postgres function which checks admin_users via
 * SECURITY DEFINER — safe to call from the client with no service role key.
 */
export default function useIsAdmin() {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setIsAdmin(false)
      setLoading(false)
      return
    }
    supabase
      .rpc('is_admin')
      .then(({ data }) => setIsAdmin(!!data))
      .finally(() => setLoading(false))
  }, [user])

  return { isAdmin, loading }
}
