import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { findMockAccount } from './mockAccounts'

const AuthContext = createContext(null)
const STORAGE_KEY = 'paylink.session'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [user])

  const login = async (username, password) => {
    // Simulate network latency for a realistic loading state.
    await new Promise((resolve) => setTimeout(resolve, 600))

    const account = findMockAccount(username, password)
    if (!account) {
      throw new Error('Invalid username or password.')
    }

    const sessionUser = { username: account.username, role: account.role, ...account.profile }
    setUser(sessionUser)
    return sessionUser
  }

  const registerMock = async (formValues) => {
    // In this demo phase, registration doesn't persist a real account —
    // it simply confirms the form succeeded and routes back to login.
    await new Promise((resolve) => setTimeout(resolve, 700))
    return { ...formValues }
  }

  const logout = () => setUser(null)

  const value = useMemo(() => ({ user, login, logout, registerMock }), [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
