import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { authService } from '../services/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    // Subscribe to auth changes
    const unsubscribe = authService.onAuthStateChange((firebaseUser) => {
      if (firebaseUser) {
        setUser({ ...firebaseUser, id: firebaseUser.uid || firebaseUser.id })
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signUp = useCallback(async (email, password) => {
    setError(null)
    try {
      const { user: newUser } = await authService.signUp(email, password)
      if (newUser) {
        setUser({ ...newUser, id: newUser.uid || newUser.id })
      }
      return { immediateLogin: !!newUser }
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  const signIn = useCallback(async (email, password) => {
    setError(null)
    try {
      await authService.signIn(email, password)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  const signInGoogle = useCallback(async () => {
    setError(null)
    try {
      await authService.signInGoogle()
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  const signOut = useCallback(async () => {
    await authService.signOut()
    setUser(null)
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return (
    <AuthContext.Provider value={{ user, loading, error, signUp, signIn, signInGoogle, signOut, clearError }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
