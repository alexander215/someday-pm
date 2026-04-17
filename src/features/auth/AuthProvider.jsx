import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const AuthContext = createContext(null)

export function useAuthContext() {
  return useContext(AuthContext)
}

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined) // undefined = not yet resolved
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Hydrate initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Keep in sync with Supabase auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  function sendOtp(email) {
    return supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    })
  }

  function verifyOtp(email, token) {
    return supabase.auth.verifyOtp({ email, token, type: 'email' })
  }

  function signOut() {
    return supabase.auth.signOut()
  }

  const value = {
    session,
    user: session?.user ?? null,
    loading,
    sendOtp,
    verifyOtp,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
