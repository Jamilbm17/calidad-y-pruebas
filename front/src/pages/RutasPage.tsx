const MOCK_RUTAS = [
  { id: 1, origen: 'Lima - Miraflores', destino: 'Arequipa - Cercado', distancia: 1008, tiempo: '14 h', estado: 'activa' },
  { id: 2, origen: 'Lima - San Isidro', destino: 'Cusco - Centro', distancia: 1172, tiempo: '20 h', estado: 'activa' },
  { id: 3, origen: 'Lima - Callao', destino: 'Trujillo - Centro', distancia: 561, tiempo: '8 h', estado: 'activa' },
  { id: 4, origen: 'Arequipa - Cercado', destino: 'Puno - Centro', distancia: 291, tiempo: '5 h', estado: 'activa' },
  { id: 5, origen: 'Lima - Ate', destino: 'Huancayo - El Tambo', distancia: 302, tiempo: '6 h', estado: 'inactiva' },
  { id: 6, origen: 'Lima - San Borja', destino: 'Ica - Centro', distancia: 303, tiempo: '4 h', estado: 'activa' },
]

export default function RutasPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
          Módulo en desarrollo — datos de ejemplo
        </p>
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors cursor-pointer opacity-50 cursor-not-allowed"
          disabled
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva ruta
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Rutas registradas</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-5 py-3 text-left">#</th>
                <th className="px-5 py-3 text-left">Zona origen</th>
                <th className="px-5 py-3 text-left">Zona destino</th>
                <th className="px-5 py-3 text-right">Distancia</th>
                <th className="px-5 py-3 text-right">Tiempo estimado</th>
                <th className="px-5 py-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {MOCK_RUTAS.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-gray-400 text-xs">{r.id}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0" />
                      <span className="text-gray-800">{r.origen}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                      <span className="text-gray-800">{r.destino}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right text-gray-600">{r.distancia.toLocaleString()} km</td>
                  <td className="px-5 py-3 text-right text-gray-600">{r.tiempo}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                      r.estado === 'activa'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-gray-50 text-gray-500 border-gray-200'
                    }`}>
                      {r.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
