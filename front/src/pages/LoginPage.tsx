import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { authService } from '../core/services/auth'
import type { TokenResponse } from '../core/models/auth'

const loginSchema = z.object({
  correo: z.string().email('Correo invalido'),
  contrasena: z.string().min(6, 'Minimo 6 caracteres'),
})

const registerSchema = z.object({
  nombre_completo: z.string().min(3, 'Minimo 3 caracteres'),
  correo: z.string().email('Correo invalido'),
  contrasena: z.string().min(6, 'Minimo 6 caracteres'),
  confirmar: z.string().min(6, 'Minimo 6 caracteres'),
}).refine((d) => d.contrasena === d.confirmar, {
  message: 'Las contrasenas no coinciden',
  path: ['confirmar'],
})

type LoginValues = z.infer<typeof loginSchema>
type RegisterValues = z.infer<typeof registerSchema>

const inputCls =
  'w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors bg-white'

function Field({ label, error, children }: { readonly label: string; readonly error?: string; readonly children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

function LoginForm({ onSuccess }: { readonly onSuccess: (data: TokenResponse) => void }) {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (values: LoginValues) => {
    setLoading(true)
    try {
      const data = await authService.login(values)
      onSuccess(data)
    } catch {
      toast.error('Credenciales incorrectas', { description: 'Verifica tu correo y contrasena.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Field label="Correo electronico" error={errors.correo?.message}>
        <input {...register('correo')} type="email" placeholder="admin@logistica.upn"
          autoComplete="email" className={inputCls} />
      </Field>
      <Field label="Contrasena" error={errors.contrasena?.message}>
        <input {...register('contrasena')} type="password" placeholder="••••••••"
          autoComplete="current-password" className={inputCls} />
      </Field>
      <button type="submit" disabled={loading}
        className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed">
        {loading ? 'Ingresando...' : 'Ingresar al panel'}
      </button>
      <div className="rounded-lg bg-violet-50 border border-violet-200 p-3">
        <p className="text-xs font-semibold text-violet-800 mb-1">Credenciales de administrador</p>
        <p className="text-xs text-violet-700 font-mono">admin@logistica.upn / Admin1234</p>
      </div>
    </form>
  )
}

function RegisterForm({ onSuccess }: { readonly onSuccess: (data: TokenResponse) => void }) {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async ({ confirmar: _confirmar, ...values }: RegisterValues) => {
    setLoading(true)
    try {
      const data = await authService.register(values)
      onSuccess(data)
      toast.success('Cuenta creada correctamente')
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Error al crear la cuenta'
      toast.error('Error', { description: detail })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
      <Field label="Nombre completo" error={errors.nombre_completo?.message}>
        <input {...register('nombre_completo')} placeholder="Juan Perez" className={inputCls} />
      </Field>
      <Field label="Correo electronico" error={errors.correo?.message}>
        <input {...register('correo')} type="email" placeholder="juan@correo.com"
          autoComplete="email" className={inputCls} />
      </Field>
      <Field label="Contrasena" error={errors.contrasena?.message}>
        <input {...register('contrasena')} type="password" placeholder="••••••••"
          autoComplete="new-password" className={inputCls} />
      </Field>
      <Field label="Confirmar contrasena" error={errors.confirmar?.message}>
        <input {...register('confirmar')} type="password" placeholder="••••••••"
          autoComplete="new-password" className={inputCls} />
      </Field>
      <button type="submit" disabled={loading}
        className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed">
        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>
    </form>
  )
}

interface LoginPageProps {
  readonly onLogin: (data: TokenResponse) => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [tab, setTab] = useState<'login' | 'register'>('login')

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-5/12 bg-white border-r border-gray-200 flex-col items-center justify-center p-12">
        <div className="max-w-xs w-full">
          <div className="w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center mb-6">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Logistica y Seguimiento</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            Sistema integral para registrar, gestionar y rastrear envios en tiempo real.
          </p>

          <div className="space-y-3">
            {[
              {
                text: 'Registro y seguimiento de envios',
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                ),
              },
              {
                text: 'Gestion de rutas entre zonas',
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                ),
              },
              {
                text: 'Administracion de clientes',
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
              },
              {
                text: 'Reportes y estadisticas',
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
              },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3 text-gray-600">
                <div className="w-7 h-7 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center flex-shrink-0">
                  {f.icon}
                </div>
                <span className="text-sm">{f.text}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-full">
            <span className="w-2 h-2 rounded-full bg-violet-500" />
            <span className="text-xs text-gray-500">Sistema operativo</span>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-sm font-bold text-gray-900">Logistica UPN</p>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-1">
            {tab === 'login' ? 'Bienvenido de vuelta' : 'Crear cuenta'}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {tab === 'login'
              ? 'Ingresa tus credenciales para acceder al panel.'
              : 'Completa el formulario para registrarte.'}
          </p>

          {/* Tabs */}
          <div className="flex rounded-lg bg-gray-100 p-1 mb-6 border border-gray-200">
            {(['login', 'register'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors cursor-pointer ${
                  tab === t
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t === 'login' ? 'Iniciar sesion' : 'Registrarse'}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            {tab === 'login' ? <LoginForm onSuccess={onLogin} /> : <RegisterForm onSuccess={onLogin} />}
          </div>

          <p className="text-xs text-gray-400 text-center mt-5">
            Proyecto UPN · Calidad y Pruebas de Software
          </p>
        </div>
      </div>
    </div>
  )
}
