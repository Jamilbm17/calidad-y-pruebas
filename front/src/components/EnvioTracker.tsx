import { useState } from "react"
import { useGetEnvio } from "../core/hooks/useQueryEnvio"
import type { EnvioResponse } from "../core/models/envio"

// ── Status display maps ───────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, string> = {
  registrado: "bg-gray-100 text-gray-700 border-gray-200",
  en_transito: "bg-blue-100 text-blue-700 border-blue-200",
  en_deposito: "bg-yellow-100 text-yellow-700 border-yellow-200",
  entregado: "bg-green-100 text-green-700 border-green-200",
  devuelto: "bg-red-100 text-red-700 border-red-200",
}

const STATUS_DOT: Record<string, string> = {
  registrado: "bg-gray-400",
  en_transito: "bg-blue-500",
  en_deposito: "bg-yellow-500",
  entregado: "bg-green-500",
  devuelto: "bg-red-500",
}

const STATUS_LABEL: Record<string, string> = {
  registrado: "Registrado",
  en_transito: "En Tránsito",
  en_deposito: "En Depósito",
  entregado: "Entregado",
  devuelto: "Devuelto",
}

function getBadgeClass(estado: string): string {
  return STATUS_BADGE[estado] ?? "bg-gray-100 text-gray-700 border-gray-200"
}

function getDotClass(estado: string): string {
  return STATUS_DOT[estado] ?? "bg-gray-400"
}

function getLabel(estado: string): string {
  return STATUS_LABEL[estado] ?? estado
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// ── EnvioCard ─────────────────────────────────────────────────────────────────

function EnvioCard({ envio }: { envio: EnvioResponse }) {
  const latestSeguimiento = envio.seguimientos[0]

  return (
    <div className="mt-5 space-y-5">
      {/* Summary card */}
      <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 space-y-2.5">
        <Row label="Código" value={<span className="font-mono font-semibold">{envio.codigo_tracking}</span>} />
        {latestSeguimiento && (
          <Row
            label="Estado actual"
            value={
              <span
                className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${getBadgeClass(latestSeguimiento.estado)}`}
              >
                {getLabel(latestSeguimiento.estado)}
              </span>
            }
          />
        )}
        {latestSeguimiento?.ubicacion_actual && (
          <Row
            label="Ubicación"
            value={
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {latestSeguimiento.ubicacion_actual}
              </span>
            }
          />
        )}
        <div className="border-t border-gray-200 pt-2 space-y-2">
          <Row label="Origen" value={envio.direccion_origen} />
          <Row label="Destino" value={envio.direccion_destino} />
          {envio.descripcion_paquete && <Row label="Descripción" value={envio.descripcion_paquete} />}
          {envio.peso_kg && <Row label="Peso" value={`${envio.peso_kg} kg`} />}
          {envio.dimensiones && <Row label="Dimensiones" value={envio.dimensiones} />}
        </div>
      </div>

      {/* Timeline */}
      {envio.seguimientos.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Historial de seguimiento
          </h3>
          <div className="space-y-0">
            {envio.seguimientos.map((seg, idx) => (
              <div key={seg.id_seguimiento} className="flex gap-3">
                {/* Timeline indicator */}
                <div className="flex flex-col items-center">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${idx === 0 ? getDotClass(seg.estado) : "bg-gray-200"}`} />
                  {idx < envio.seguimientos.length - 1 && (
                    <div className="w-px flex-1 bg-gray-200 mt-1" />
                  )}
                </div>

                {/* Content */}
                <div className="pb-4 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full border ${getBadgeClass(seg.estado)}`}
                    >
                      {getLabel(seg.estado)}
                    </span>
                    <span className="text-xs text-gray-400 tabular-nums">
                      {formatDate(seg.fecha_hora_actualizacion)}
                    </span>
                  </div>
                  {seg.ubicacion_actual && (
                    <p className="text-xs text-gray-600 mt-1">{seg.ubicacion_actual}</p>
                  )}
                  {seg.observaciones && (
                    <p className="text-xs text-gray-400 mt-0.5 italic">{seg.observaciones}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs font-medium text-gray-500 flex-shrink-0">{label}</span>
      <span className="text-xs text-gray-800 text-right">{value}</span>
    </div>
  )
}

// ── EnvioTracker ──────────────────────────────────────────────────────────────

export default function EnvioTracker() {
  const [inputValue, setInputValue] = useState("")
  const [searchCode, setSearchCode] = useState("")

  const { data, isLoading, isError } = useGetEnvio(searchCode)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = inputValue.trim()
    if (trimmed) setSearchCode(trimmed)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-base font-semibold text-gray-900">Rastrear Paquete</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Ingresa el código de tracking para ver el estado en tiempo real
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ej: TRK-2025-001"
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Buscando
            </span>
          ) : (
            "Buscar"
          )}
        </button>
      </form>

      {/* Error state */}
      {isError && searchCode && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-medium text-red-800">Envío no encontrado</p>
          <p className="text-xs text-red-600 mt-0.5">
            No existe un envío con el código{" "}
            <span className="font-mono font-medium">{searchCode}</span>
          </p>
        </div>
      )}

      {/* Success state */}
      {data && !isError && <EnvioCard envio={data} />}

      {/* Empty state */}
      {!searchCode && (
        <div className="mt-6 flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-500">Ingresa un código para rastrear tu envío</p>
        </div>
      )}
    </div>
  )
}
