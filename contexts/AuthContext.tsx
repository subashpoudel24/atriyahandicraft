"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (token: string, user: User) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log("AuthProvider: Initializing...")
    const storedToken = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")

    console.log("Stored token exists:", !!storedToken)
    console.log("Stored user exists:", !!storedUser)

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        console.log("Restored user:", parsedUser)
        setToken(storedToken)
        setUser(parsedUser)
        // Also set as cookie for server-side requests
        document.cookie = `token=${storedToken}; path=/; max-age=${7 * 24 * 60 * 60}` // 7 days
      } catch (error) {
        console.error("Error parsing stored user:", error)
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = (newToken: string, newUser: User) => {
    console.log("AuthContext: Logging in user:", newUser)
    setToken(newToken)
    setUser(newUser)
    localStorage.setItem("token", newToken)
    localStorage.setItem("user", JSON.stringify(newUser))
    // Also set as cookie for server-side requests
    document.cookie = `token=${newToken}; path=/; max-age=${7 * 24 * 60 * 60}` // 7 days
    console.log("AuthContext: Login complete")
  }

  const logout = () => {
    console.log("AuthContext: Logging out")
    setToken(null)
    setUser(null)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    // Clear cookie
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  }

  return <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
