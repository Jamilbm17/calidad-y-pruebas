import type { Page } from '../../types'
import type { TokenResponse } from '../../core/models/auth'

const PAGE_TITLES: Record<Page, { title: string; description: string }> = {
  dashboard:      { title: 'Panel',          description: 'Vista operativa para entender que ocurre hoy y que requiere atencion.' },
  envios:         { title: 'Envios',         description: 'Gestiona y consulta todos los envios registrados.' },
  clientes:       { title: 'Clientes',       description: 'Directorio de clientes y transportistas registrados.' },
  rutas:          { title: 'Rutas',          description: 'Rutas disponibles entre zonas de origen y destino.' },
  seguimiento:    { title: 'Seguimiento',    description: 'Historial de actualizaciones de estado de los envios.' },
  reportes:       { title: 'Reportes',       description: 'Estadisticas y metricas de la plataforma.' },
  notificaciones: { title: 'Notificaciones', description: 'Centro de alertas y mensajes del sistema.' },
  configuracion:  { title: 'Configuracion',  description: 'Ajustes de cuenta y preferencias del sistema.' },
}

function roleBadgeClass(rol: string): string {
  if (rol === 'admin') return 'bg-violet-100 text-violet-700'
  if (rol === 'transportista') return 'bg-blue-100 text-blue-700'
  return 'bg-gray-100 text-gray-600'
}

interface TopBarProps {
  readonly currentPage: Page
  readonly user: TokenResponse
  readonly onNavigate: (page: Page) => void
}

export default function TopBar({ currentPage, user, onNavigate }: TopBarProps) {
  const { title, description } = PAGE_TITLES[currentPage]

  const initials = user.nombre_completo
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
      <div className="flex items-start justify-between gap-4">
        {/* Breadcrumb + title */}
        <div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="hover:text-gray-600 transition-colors cursor-pointer"
            >
              Panel
            </button>
            {currentPage !== 'dashboard' && (
              <>
                <span>/</span>
                <span className="text-gray-600">{title}</span>
              </>
            )}
          </div>
          <h1 className="text-xl font-bold text-gray-900 leading-tight">{title}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('notificaciones')}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>

          <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800 leading-tight">{user.nombre_completo}</p>
              <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${roleBadgeClass(user.rol)}`}>
                {user.rol}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center">
              <span className="text-xs font-bold text-white">{initials}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
