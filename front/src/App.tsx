import { useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { queryClient } from './core/lib/queryClient'
import type { TokenResponse } from './core/models/auth'
import type { Page } from './types'
import LoginPage from './pages/LoginPage'
import Layout from './components/layout/Layout'
import DashboardPage from './pages/DashboardPage'
import EnviosPage from './pages/EnviosPage'
import ClientesPage from './pages/ClientesPage'
import SeguimientoPage from './pages/SeguimientoPage'
import RutasPage from './pages/RutasPage'
import NotificacionesPage from './pages/NotificacionesPage'
import ReportesPage from './pages/ReportesPage'
import ConfiguracionPage from './pages/ConfiguracionPage'

function getStoredUser(): TokenResponse | null {
  try {
    const raw = localStorage.getItem('user')
    return raw ? (JSON.parse(raw) as TokenResponse) : null
  } catch {
    return null
  }
}

function PageContent({ page, user, onNavigate }: { page: Page; user: TokenResponse; onNavigate: (p: Page) => void }) {
  switch (page) {
    case 'dashboard':     return <DashboardPage user={user} onNavigate={onNavigate} />
    case 'envios':        return <EnviosPage user={user} />
    case 'clientes':      return <ClientesPage user={user} />
    case 'seguimiento':   return <SeguimientoPage user={user} />
    case 'rutas':         return <RutasPage />
    case 'notificaciones':return <NotificacionesPage />
    case 'reportes':      return <ReportesPage user={user} />
    case 'configuracion': return <ConfiguracionPage user={user} />
    default:              return <DashboardPage user={user} onNavigate={onNavigate} />
  }
}

export default function App() {
  const [user, setUser] = useState<TokenResponse | null>(getStoredUser)
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')

  const handleLogin = (data: TokenResponse) => {
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('user', JSON.stringify(data))
    setUser(data)
    setCurrentPage('dashboard')
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    setUser(null)
    queryClient.clear()
  }

  return (
    <QueryClientProvider client={queryClient}>
      {user ? (
        <Layout
          user={user}
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          onLogout={handleLogout}
        >
          <PageContent page={currentPage} user={user} onNavigate={setCurrentPage} />
        </Layout>
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
      <Toaster expand richColors theme='light' closeButton />
    </QueryClientProvider>
  )
}
