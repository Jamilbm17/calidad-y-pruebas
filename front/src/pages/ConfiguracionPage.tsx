import type { TokenResponse } from '../core/models/auth'

interface ConfiguracionPageProps {
  readonly user: TokenResponse
}

export default function ConfiguracionPage({ user }: ConfiguracionPageProps) {
  const initials = user.nombre_completo
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  return (
    <div className="max-w-2xl space-y-5">
      {/* Perfil */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Perfil de usuario</h2>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-full bg-violet-600 flex items-center justify-center">
            <span className="text-lg font-bold text-white">{initials}</span>
          </div>
          <div>
            <p className="text-base font-semibold text-gray-900">{user.nombre_completo}</p>
            <p className="text-sm text-gray-500">{user.correo}</p>
            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
              user.rol === 'admin'
                ? 'bg-violet-50 text-violet-700 border-violet-200'
                : 'bg-gray-50 text-gray-600 border-gray-200'
            }`}>
              {user.rol}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { label: 'Nombre completo', value: user.nombre_completo },
            { label: 'Correo electrónico', value: user.correo },
            { label: 'Rol del sistema', value: user.rol },
            { label: 'ID de usuario', value: `#${user.id_usuario}` },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-500">{item.label}</span>
              <span className="text-sm font-medium text-gray-800">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cambiar contraseña */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-800 mb-1">Cambiar contraseña</h2>
        <p className="text-xs text-gray-400 mb-4">Actualiza tu contraseña de acceso al sistema</p>
        <div className="space-y-3">
          {['Contraseña actual', 'Nueva contraseña', 'Confirmar nueva contraseña'].map((label) => (
            <div key={label}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
              <input
                type="password"
                placeholder="••••••••"
                disabled
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
              />
            </div>
          ))}
          <button
            type="button"
            disabled
            className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg opacity-40 cursor-not-allowed"
          >
            Actualizar contraseña
          </button>
          <p className="text-xs text-amber-600">Funcionalidad disponible próximamente.</p>
        </div>
      </div>

      {/* Preferencias */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Información del sistema</h2>
        <div className="space-y-2">
          {[
            { key: 'Plataforma', val: 'Logística y Seguimiento UPN' },
            { key: 'Versión', val: '1.0.0' },
            { key: 'Backend', val: 'FastAPI 0.115 + SQLAlchemy 2.0' },
            { key: 'Frontend', val: 'React 19 + TypeScript 5 + Vite 6' },
            { key: 'Autenticación', val: 'JWT HS256 — 8 horas' },
          ].map(({ key, val }) => (
            <div key={key} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <span className="text-xs text-gray-500">{key}</span>
              <span className="text-xs font-mono text-gray-700">{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
