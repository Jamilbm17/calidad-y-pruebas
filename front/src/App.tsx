import { useState } from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"
import { queryClient } from "./core/lib/queryClient"
import type { TokenResponse } from "./core/models/auth"
import LoginPage from "./pages/LoginPage"
import HomePage from "./pages/HomePage"

function getStoredUser(): TokenResponse | null {
  try {
    const raw = localStorage.getItem("user")
    return raw ? (JSON.parse(raw) as TokenResponse) : null
  } catch {
    return null
  }
}

export default function App() {
  const [user, setUser] = useState<TokenResponse | null>(getStoredUser)

  const handleLogin = (data: TokenResponse) => {
    localStorage.setItem("access_token", data.access_token)
    localStorage.setItem("user", JSON.stringify(data))
    setUser(data)
  }

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("user")
    setUser(null)
  }

  return (
    <QueryClientProvider client={queryClient}>
      {user ? <HomePage user={user} onLogout={handleLogout} /> : <LoginPage onLogin={handleLogin} />}
      <Toaster expand richColors theme="light" closeButton />
    </QueryClientProvider>
  )
}
