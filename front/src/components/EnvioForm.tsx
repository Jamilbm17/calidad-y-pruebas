import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useCreateEnvio } from "../core/hooks/useMutationEnvio"

const schema = z.object({
  codigo_tracking: z
    .string()
    .min(3, "Mínimo 3 caracteres")
    .max(100, "Máximo 100 caracteres"),
  id_usuario_cliente: z.coerce
    .number({ invalid_type_error: "Debe ser un número" })
    .int()
    .positive("Debe ser un número positivo"),
  descripcion_paquete: z.string().optional(),
  peso_kg: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.coerce.number().positive("Debe ser mayor a 0").optional(),
  ),
  dimensiones: z.string().optional(),
  direccion_origen: z.string().min(5, "Mínimo 5 caracteres"),
  direccion_destino: z.string().min(5, "Mínimo 5 caracteres"),
  estado_inicial: z.string().default("registrado"),
  ubicacion_inicial: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export default function EnvioForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { estado_inicial: "registrado" },
  })

  const { mutate: createEnvio, isPending } = useCreateEnvio({
    onSuccess: () => reset(),
  })

  const onSubmit = (data: FormValues) => {
    createEnvio(data)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-base font-semibold text-gray-900">Registrar Nuevo Envío</h2>
        <p className="text-sm text-gray-500 mt-0.5">Completa el formulario para dar de alta un paquete</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Código de tracking */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Código de Tracking <span className="text-red-500">*</span>
          </label>
          <input
            {...register("codigo_tracking")}
            placeholder="Ej: TRK-2025-001"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
          />
          {errors.codigo_tracking && (
            <p className="text-xs text-red-600 mt-1">{errors.codigo_tracking.message}</p>
          )}
        </div>

        {/* ID Cliente */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ID Usuario Cliente <span className="text-red-500">*</span>
          </label>
          <input
            {...register("id_usuario_cliente")}
            type="number"
            min={1}
            placeholder="Ej: 1"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.id_usuario_cliente && (
            <p className="text-xs text-red-600 mt-1">{errors.id_usuario_cliente.message}</p>
          )}
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción del Paquete</label>
          <input
            {...register("descripcion_paquete")}
            placeholder="Ej: Laptop en caja"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Peso y Dimensiones */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
            <input
              {...register("peso_kg")}
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.peso_kg && <p className="text-xs text-red-600 mt-1">{errors.peso_kg.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dimensiones</label>
            <input
              {...register("dimensiones")}
              placeholder="30x20x15 cm"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Dirección origen */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dirección de Origen <span className="text-red-500">*</span>
          </label>
          <input
            {...register("direccion_origen")}
            placeholder="Ej: Av. Lima 123, Lima"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.direccion_origen && (
            <p className="text-xs text-red-600 mt-1">{errors.direccion_origen.message}</p>
          )}
        </div>

        {/* Dirección destino */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dirección de Destino <span className="text-red-500">*</span>
          </label>
          <input
            {...register("direccion_destino")}
            placeholder="Ej: Jr. Cusco 456, Cusco"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.direccion_destino && (
            <p className="text-xs text-red-600 mt-1">{errors.direccion_destino.message}</p>
          )}
        </div>

        {/* Estado inicial */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado Inicial</label>
          <select
            {...register("estado_inicial")}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="registrado">Registrado</option>
            <option value="en_transito">En Tránsito</option>
            <option value="en_deposito">En Depósito</option>
            <option value="entregado">Entregado</option>
            <option value="devuelto">Devuelto</option>
          </select>
        </div>

        {/* Ubicación inicial */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación Actual</label>
          <input
            {...register("ubicacion_inicial")}
            placeholder="Ej: Centro de distribución Lima Norte"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium py-2.5 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          {isPending ? "Registrando..." : "Registrar Envío"}
        </button>
      </form>
    </div>
  )
}
