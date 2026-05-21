import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { authService } from "../core/services/auth"
import type { TokenResponse } from "../core/models/auth"

// ── Schemas ───────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  correo: z.string().email("Correo inválido"),
  contrasena: z.string().min(6, "Mínimo 6 caracteres"),
})

const registerSchema = z.object({
  nombre_completo: z.string().min(3, "Mínimo 3 caracteres"),
  correo: z.string().email("Correo inválido"),
  contrasena: z.string().min(6, "Mínimo 6 caracteres"),
  confirmar: z.string().min(6, "Mínimo 6 caracteres"),
}).refine((d) => d.contrasena === d.confirmar, {
  message: "Las contraseñas no coinciden",
  path: ["confirmar"],
})

type LoginValues = z.infer<typeof loginSchema>
type RegisterValues = z.infer<typeof registerSchema>

// ── LoginForm ─────────────────────────────────────────────────────────────────

function LoginForm({ onSuccess }: { onSuccess: (data: TokenResponse) => void }) {
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (values: LoginValues) => {
    setLoading(true)
    try {
      const data = await authService.login(values)
      onSuccess(data)
    } catch {
      toast.error("Credenciales incorrectas", { description: "Verifica tu correo y contraseña." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
        <input
          {...register("correo")}
          type="email"
          placeholder="admin@logistica.upn"
          autoComplete="email"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.correo && <p className="text-xs text-red-600 mt-1">{errors.correo.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
        <input
          {...register("contrasena")}
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.contrasena && <p className="text-xs text-red-600 mt-1">{errors.contrasena.message}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium py-2.5 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
      >
        {loading ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  )
}

// ── RegisterForm ──────────────────────────────────────────────────────────────

function RegisterForm({ onSuccess }: { onSuccess: (data: TokenResponse) => void }) {
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) })

  const onSubmit = async ({ confirmar: _confirmar, ...values }: RegisterValues) => {
    setLoading(true)
    try {
      const data = await authService.register(values)
      onSuccess(data)
      toast.success("Cuenta creada correctamente")
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        "Error al crear la cuenta"
      toast.error("Error", { description: detail })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
        <input
          {...register("nombre_completo")}
          placeholder="Juan Pérez"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.nombre_completo && (
          <p className="text-xs text-red-600 mt-1">{errors.nombre_completo.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
        <input
          {...register("correo")}
          type="email"
          placeholder="juan@correo.com"
          autoComplete="email"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.correo && <p className="text-xs text-red-600 mt-1">{errors.correo.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
        <input
          {...register("contrasena")}
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.contrasena && <p className="text-xs text-red-600 mt-1">{errors.contrasena.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
        <input
          {...register("confirmar")}
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.confirmar && <p className="text-xs text-red-600 mt-1">{errors.confirmar.message}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium py-2.5 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
      >
        {loading ? "Creando cuenta..." : "Crear cuenta"}
      </button>
    </form>
  )
}

// ── LoginPage ─────────────────────────────────────────────────────────────────

interface LoginPageProps {
  onLogin: (data: TokenResponse) => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [tab, setTab] = useState<"login" | "register">("login")

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* Brand */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 leading-tight">Logística &amp; Seguimiento</h1>
          <p className="text-xs text-gray-500">Plataforma UPN</p>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm w-full max-w-sm p-6">
        {/* Tabs */}
        <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
          <button
            type="button"
            onClick={() => setTab("login")}
            className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors cursor-pointer ${tab === "login" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => setTab("register")}
            className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors cursor-pointer ${tab === "register" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
          >
            Registrarse
          </button>
        </div>

        {tab === "login" ? (
          <LoginForm onSuccess={onLogin} />
        ) : (
          <RegisterForm onSuccess={onLogin} />
        )}

        {/* Admin hint */}
        {tab === "login" && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-xs text-blue-700 font-medium">Credenciales de administrador</p>
            <p className="text-xs text-blue-600 mt-0.5 font-mono">admin@logistica.upn / Admin1234</p>
          </div>
        )}
      </div>
    </div>
  )
}
