import type { ReactNode } from 'react'
import type { Page } from '../../types'
import type { TokenResponse } from '../../core/models/auth'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

interface LayoutProps {
  children: ReactNode
  user: TokenResponse
  currentPage: Page
  onNavigate: (page: Page) => void
  onLogout: () => void
}

export default function Layout({ children, user, currentPage, onNavigate, onLogout }: LayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        user={user}
        onLogout={onLogout}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar currentPage={currentPage} user={user} onNavigate={onNavigate} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
